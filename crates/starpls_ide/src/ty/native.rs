//! Bazel's fixed metadata is a declaration input, separate from user source.

use std::borrow::Cow;
use std::collections::BTreeMap;
use std::collections::BTreeSet;
use std::fmt::Write;

use ruff_db::files::FilePath;
use ruff_db::system::SystemVirtualPathBuf;
use ruff_python_ast::name::Name;
use starpls_bazel::build::attribute::Discriminator;
use starpls_bazel::build::BuildLanguage;
use starpls_bazel::build_language::attribute_type_string_from_discriminator;
use starpls_bazel::build_language::rule_value;
use starpls_bazel::builtin::Callable;
use starpls_bazel::builtin::Param;
use starpls_bazel::builtin::Type;
use starpls_bazel::builtin::Value;
use starpls_bazel::env;
use starpls_bazel::APIContext;
use starpls_bazel::Builtins;
use starpls_bazel::BUILTINS_VALUES_DENY_LIST;
use starpls_common::Dialect;
use ty_ide::Docstring;
use ty_ide::MarkupKind;
use ty_python_core::definition::Definition;
use ty_python_core::scope::NodeWithScopeKind;
use ty_python_core::ProgramFile;
use ty_python_semantic::provided::BuiltinUsage;
use ty_python_semantic::provided::ProvidedBindingValue;
use ty_python_semantic::provided::ProvidedClass;
use ty_python_semantic::provided::ProvidedField;
use ty_python_semantic::provided::ProvidedInstanceFields;
use ty_python_semantic::types::Type as SemanticType;
use ty_python_semantic::types::TypeDefinition;
use ty_python_semantic::ProgramEnvironment;
use ty_python_semantic::ResolvedDefinition;

const STANDARD_PATH: &str = "starpls-native:standard.pyi";
const BAZEL_PATH: &str = "starpls-native:bazel.pyi";
const STORED_GLOB: &str = "_starpls_native_stored_glob";
const EXISTING_RULE_VIEW: &str = "_ExistingRuleView";
const STATIC_JSON_DECODE: &str = "_starpls_static_json_decode";
const LEGACY_PROVIDER_GLOBALS: &[&str] = &[
    "CcSharedLibraryHintInfo",
    "CcSharedLibraryInfo",
    "JavaInfo",
    "JavaPluginInfo",
    "ProtoInfo",
];
pub(super) const MODULE_EXTENSION_TYPE: &str = "ModuleExtension";
pub(super) const MODULE_EXTENSION_PROXY_TYPE: &str = "module_extension_proxy";

/// Bazel type constructor names and the corresponding type names in API metadata.
/// https://github.com/bazelbuild/bazel/commit/89086de828f7aa63564054819947edb9a7697e1f
pub(super) const BAZEL_ANNOTATION_ALIASES: &[(&str, &str)] =
    &[("Ctx", "ctx"), ("Root", "root"), ("Runfiles", "runfiles")];

/// Annotation names and whether they include executable rule attributes.
pub(super) const COMMON_RULE_ATTRS: &[(&str, bool)] = &[
    ("CommonRuleAttrs", false),
    ("CommonExecutableRuleAttrs", true),
];

pub(super) const TYPING_ANNOTATIONS: &[&str] = &[
    "Final",
    "Callable",
    "Collection",
    "Hashable",
    "Protocol",
    "TypedDict",
    "TypeGuard",
    "TypeIs",
    "Unpack",
    "Literal",
    "Never",
    "NotRequired",
    "Required",
    "ReadOnly",
    "type_check_only",
    "overload",
];

pub(super) struct DeclarationSource {
    pub(super) path: SystemVirtualPathBuf,
    pub(super) contents: String,
}

#[derive(Clone, Copy)]
enum CallableKind<'a> {
    Function,
    EmptyDepset,
    Method(&'a str),
    ArgsCollection {
        with_name: bool,
        options: &'a [Param],
    },
    ResolveCommand,
    Rule(&'a starpls_bazel::build::RuleDefinition),
    Provider(Option<&'a str>),
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum AnnotationUse {
    Value,
    AttributeInput,
}

pub(super) fn path(dialect: Dialect) -> SystemVirtualPathBuf {
    match dialect {
        Dialect::Standard => STANDARD_PATH,
        Dialect::Bazel => BAZEL_PATH,
    }
    .to_owned()
    .into()
}

pub(super) fn json_policy_binding<'db>(
    db: &'db crate::Database,
    file: ProgramFile<'db>,
    name: &str,
    usage: BuiltinUsage,
) -> Option<ProvidedBindingValue<'db>> {
    if name != STATIC_JSON_DECODE || !matches!(usage, BuiltinUsage::Runtime) {
        return None;
    }
    let FilePath::SystemVirtual(path) = file.file(db).path(db) else {
        return None;
    };
    if path.as_str() != BAZEL_PATH {
        return None;
    }
    Some(ProvidedBindingValue::Value(SemanticType::bool_literal(
        *db.check_settings?.static_json_decode(db),
    )))
}

pub(super) fn is_builtin_function(db: &dyn ty_python_core::Db, definition: Definition<'_>) -> bool {
    let path = definition.program_file(db).file(db).path(db);
    let is_builtin_source = match path {
        FilePath::SystemVirtual(path) => matches!(path.as_str(), STANDARD_PATH | BAZEL_PATH),
        FilePath::Vendored(path) => path.as_str() == "stdlib/builtins.pyi",
        _ => false,
    };
    is_builtin_source && matches!(definition.scope(db).node(db), NodeWithScopeKind::Module)
}

pub(super) fn export_name(context: APIContext, name: &str) -> String {
    format!("_starpls_{context:?}_{name}")
}

/// Bazel stores BUILD globals as immutable fields of the native namespace.
#[salsa::tracked(returns(copy))]
pub(super) fn namespace<'db>(
    db: &'db dyn ty_python_semantic::Db,
    declarations: ProgramFile<'db>,
) -> Option<SemanticType<'db>> {
    let export = |name| {
        ProvidedBindingValue::Export {
            file: declarations,
            name: Name::new(name),
            value: None,
        }
        .resolve_type(db)
    };
    let glob @ SemanticType::FunctionLiteral(_) = export(STORED_GLOB)? else {
        return None;
    };
    let base = export("_starpls_annotation_native")?;
    let environment = ProgramEnvironment::from_file(declarations);
    let TypeDefinition::Function(glob_definition) = glob.definition(db, &environment)? else {
        return None;
    };
    let TypeDefinition::StaticClass(definition) = base.definition(db, &environment)? else {
        return None;
    };
    ProvidedClass {
        name: Name::new("native"),
        bases: Box::from([base]),
        class_members: Box::default(),
        instance_fields: ProvidedInstanceFields {
            fields: Box::from([ProvidedField {
                name: Name::new("glob"),
                ty: glob,
                is_required: true,
                source: Some(ResolvedDefinition::Definition(glob_definition).focus_range(db)),
            }]),
            ..Default::default()
        }
        .into(),
    }
    .into_type_at_definition(db, definition)?
    .to_instance_approximation(db, &environment)
}

pub(super) fn generate(
    dialect: Dialect,
    builtins: &Builtins,
    rules: &BuildLanguage,
) -> anyhow::Result<DeclarationSource> {
    generate_with_extensions(dialect, builtins, rules, &BTreeSet::new())
}

pub(super) fn generate_with_extensions(
    dialect: Dialect,
    builtins: &Builtins,
    rules: &BuildLanguage,
    extensions: &BTreeSet<String>,
) -> anyhow::Result<DeclarationSource> {
    let contents = declarations(dialect, builtins, rules, extensions)?;
    ruff_python_parser::parse_module(&contents).map_err(|error| {
        let offset = usize::from(error.location.start());
        let start = contents[..offset].rfind('\n').map_or(0, |index| index + 1);
        let end = contents[offset..]
            .find('\n')
            .map_or(contents.len(), |index| offset + index);
        let line = &contents[start..end];
        anyhow::Error::new(error)
            .context(format!("Invalid generated {dialect:?} declaration: {line}"))
    })?;
    Ok(DeclarationSource {
        path: path(dialect),
        contents,
    })
}

pub(super) fn globals(
    dialect: Dialect,
    context: APIContext,
    builtins: &Builtins,
    rules: &BuildLanguage,
) -> BTreeMap<String, Value> {
    let mut globals = BTreeMap::new();
    let mut add_globals = |values: Vec<Value>| {
        for mut value in values {
            if value.name.is_empty() || BUILTINS_VALUES_DENY_LIST.contains(&value.name.as_str()) {
                continue;
            }
            refine_builtin_signature(dialect, &mut value, builtins);
            globals.insert(value.name.clone(), value);
        }
    };
    match dialect {
        Dialect::Standard => add_globals(builtins.global.clone()),
        Dialect::Bazel => {
            let extra = match context {
                APIContext::Bzl => env::make_bzl_builtins(),
                APIContext::Build => env::make_bzl_builtins(),
                APIContext::Prelude => env::make_bzl_builtins(),
                APIContext::Module => env::make_module_bazel_builtins(),
                APIContext::Repo => env::make_repo_builtins(),
                APIContext::Workspace => env::make_workspace_builtins(),
                APIContext::Cquery => env::make_cquery_builtins(),
                APIContext::Vendor => env::make_vendor_builtins(),
            };
            add_globals(extra.global);
            if matches!(
                context,
                APIContext::Bzl | APIContext::Build | APIContext::Prelude
            ) {
                add_globals(env::make_build_builtins().global);
                add_globals(builtins.global.clone());
                add_globals(rules.rule.iter().map(rule_value).collect());
            }
        }
    }
    globals
}

fn refine_builtin_signature(dialect: Dialect, value: &mut Value, builtins: &Builtins) {
    let Some(callable) = &mut value.callable else {
        return;
    };
    match value.name.as_str() {
        // Bazel stores these constructor arguments unchanged in the instance fields.
        // Its API exporter omits their input types, but includes the field types.
        "AnalysisTestResultInfo"
            if dialect == Dialect::Bazel && callable.return_type == value.name =>
        {
            if let Some(instance) = builtins.r#type.iter().find(|ty| ty.name == value.name) {
                for parameter in callable
                    .param
                    .iter_mut()
                    .filter(|param| param.r#type.is_empty())
                {
                    if let Some(field) = instance
                        .field
                        .iter()
                        .find(|field| field.name == parameter.name && field.callable.is_none())
                    {
                        parameter.r#type.clone_from(&field.r#type);
                    }
                }
            }
        }
        // The inventory omits Label's input and result types.
        "Label" => {
            callable.return_type = "Label".to_owned();
            if let [input] = callable.param.as_mut_slice() {
                input.r#type = "string; or Label".to_owned();
            }
        }
        // Rule values are callable objects with a nominal inheritance contract.
        "rule" => callable.return_type = "rule".to_owned(),
        "use_extension" if dialect == Dialect::Bazel && callable.return_type == "Unknown" => {
            callable.return_type = MODULE_EXTENSION_PROXY_TYPE.to_owned();
        }
        "use_repo" | "override_repo" | "inject_repo" if dialect == Dialect::Bazel => {
            if let Some(parameter) = callable.param.iter_mut().find(|parameter| {
                parameter.name == "extension_proxy" && parameter.r#type == "Unknown"
            }) {
                parameter.r#type = MODULE_EXTENSION_PROXY_TYPE.to_owned();
            }
        }
        // Bazel documents a mutable list, which the inventory calls a sequence.
        "glob" | "subpackages" if dialect == Dialect::Bazel => {
            callable.return_type = "list of strings".to_owned();
        }
        "visibility" => {
            if let [input] = callable.param.as_mut_slice() {
                input.r#type = "string; or list of strings".to_owned();
            }
        }
        _ => {}
    }
}

fn existing_rule_view_result(value: &Value) -> Option<&'static str> {
    let any_rule_result = env::ExistingRuleScope::Any.return_type(&value.name)?;
    let callable = value.callable.as_ref()?;
    let result = env::normalize_doc(&callable.return_type, true);
    let scope = if result == any_rule_result {
        Some(env::ExistingRuleScope::Any)
    } else if env::ExistingRuleScope::Build.return_type(&value.name) == Some(result.as_str()) {
        Some(env::ExistingRuleScope::Build)
    } else {
        None
    };
    if scope.is_none() && !result.eq_ignore_ascii_case("unknown") {
        return None;
    }
    match (value.name.as_str(), scope) {
        ("existing_rule", Some(env::ExistingRuleScope::Any)) => {
            Some("_starpls_types._ExistingRule | None")
        }
        ("existing_rules", Some(env::ExistingRuleScope::Any)) => {
            Some("_starpls_types._ExistingRuleView[_starpls_types._ExistingRule]")
        }
        ("existing_rule", Some(env::ExistingRuleScope::Build)) => Some(
            "_starpls_types._ExistingRule[_starpls_builtins.tuple[_starpls_builtins.str, ...]] | None",
        ),
        ("existing_rules", Some(env::ExistingRuleScope::Build)) => Some(
            "_starpls_types._ExistingRuleView[_starpls_types._ExistingRule[_starpls_builtins.tuple[_starpls_builtins.str, ...]]]",
        ),
        ("existing_rule", None) => {
            Some("_starpls_types._ExistingRuleView[_starpls_builtins.object] | None")
        }
        ("existing_rules", None) => Some(
            "_starpls_types._ExistingRuleView[_starpls_types._ExistingRuleView[_starpls_builtins.object]]",
        ),
        _ => None,
    }
}

fn json_value_type(element: &str) -> String {
    format!(
        "None | _starpls_builtins.bool | _starpls_builtins.int | _starpls_builtins.float | _starpls_builtins.str | _starpls_builtins.list[{element}] | _starpls_builtins.dict[_starpls_builtins.str, {element}]"
    )
}

fn write_json_decode(
    output: &mut String,
    indent: &str,
    decoded: &str,
    documentation: &str,
) -> std::fmt::Result {
    // A supplied default can have any type; an omitted one contributes no
    // type variable to contextual inference.
    for (default, fallback) in [("", ""), (", default: _JsonDefault", " | _JsonDefault")] {
        writeln!(output, "{indent}@_starpls_typing.overload")?;
        writeln!(
            output,
            "{indent}def decode(_starpls_self, x: _starpls_builtins.str, /{default}) -> {decoded}{fallback}:"
        )?;
        writeln!(output, "{indent}    {}", quoted(documentation))?;
        writeln!(output, "{indent}    ...")?;
    }
    Ok(())
}

fn declarations(
    dialect: Dialect,
    builtins: &Builtins,
    rules: &BuildLanguage,
    extensions: &BTreeSet<String>,
) -> anyhow::Result<String> {
    let decoded_json = format!(
        "_starpls_ty_extensions.Intersection[_starpls_typing.Any, {}]",
        json_value_type("\"_JsonValue\"")
    );
    // ApiExporter::collectRuleInfo omits return_type; collectMethodInfo supplies it.
    // This encoding identifies rule documentation only within the native inventory.
    let documented_rules: BTreeSet<_> = builtins
        .r#type
        .iter()
        .filter(|class| class.name == "native")
        .flat_map(|class| &class.field)
        .filter(|field| {
            field
                .callable
                .as_ref()
                .is_some_and(|callable| callable.return_type.is_empty())
        })
        .map(|field| field.name.as_str())
        .collect();
    // BaseRuleClasses::EmptyRule uses this attribute even when its default is null.
    // Its common attributes describe a removed-rule placeholder, not its replacement.
    let placeholder_rules: BTreeSet<_> = rules
        .rule
        .iter()
        .filter(|rule| {
            rule.attribute
                .iter()
                .any(|attribute| attribute.name == "$bzl_load_label")
        })
        .map(|rule| rule.name.as_str())
        .collect();
    let rule_values: Vec<_> = rules.rule.iter().map(rule_value).collect();
    let rule_names: BTreeSet<_> = rule_values
        .iter()
        .filter(|_| dialect == Dialect::Bazel)
        .filter(|rule| !placeholder_rules.contains(rule.name.as_str()))
        .map(|rule| rule.name.as_str())
        .collect();
    let unresolved_rules: BTreeSet<_> = documented_rules
        .difference(&rule_names)
        .chain(&placeholder_rules)
        .copied()
        .collect();
    let contexts: Vec<_> = [
        APIContext::Bzl,
        APIContext::Build,
        APIContext::Module,
        APIContext::Repo,
        APIContext::Workspace,
        APIContext::Prelude,
        APIContext::Cquery,
        APIContext::Vendor,
    ]
    .into_iter()
    .map(|context| (context, globals(dialect, context, builtins, rules)))
    .collect();
    let mut classes: BTreeMap<String, Type> = builtins
        .r#type
        .iter()
        .filter(|class| {
            // These types use Ty's canonical core declarations and generics.
            // Attribute, struct, and Target are native nominal declarations.
            !matches!(
                class.name.as_str(),
                "bool"
                    | "bytes"
                    | "builtin_function_or_method"
                    | "dict"
                    | "float"
                    | "function"
                    | "int"
                    | "list"
                    | "range"
                    | "set"
                    | "string"
                    | "tuple"
                    | "None"
                    | "NoneType"
            )
        })
        .map(|class| (class.name.clone(), class.clone()))
        .collect();
    if contexts.iter().any(|(_, globals)| {
        globals
            .get("struct")
            .is_some_and(|value| value.callable.is_some())
    }) {
        classes.entry("struct".to_owned()).or_insert_with(|| Type {
            name: "struct".to_owned(),
            ..Default::default()
        });
    }
    if classes.get("attr").is_some_and(|class| {
        class
            .field
            .iter()
            .filter_map(|field| field.callable.as_ref())
            .flat_map(|callable| &callable.param)
            .any(|parameter| {
                env::normalize_doc(&parameter.r#type, true)
                    .split("; or ")
                    .any(|member| member == "NativeComputedDefault")
            })
    }) {
        // This fieldless native marker is named by parameter metadata, but its
        // undocumented declaration is omitted from the exported inventory.
        classes
            .entry("NativeComputedDefault".to_owned())
            .or_insert_with(|| Type {
                name: "NativeComputedDefault".to_owned(),
                ..Default::default()
            });
    }
    if classes.get("attr").is_some_and(|class| {
        class.field.iter().any(|field| {
            matches!(field.name.as_str(), "dormant_label" | "dormant_label_list")
                || (matches!(field.name.as_str(), "label" | "label_list")
                    && field.callable.as_ref().is_some_and(|callable| {
                        callable
                            .param
                            .iter()
                            .any(|parameter| parameter.name == "materializer")
                    }))
        })
    }) {
        // DormantDependency has no StarlarkBuiltin annotation, so the exporter
        // omits this immutable native record even when materializers accept it.
        classes
            .entry("DormantDependency".to_owned())
            .or_insert_with(|| Type {
                name: "DormantDependency".to_owned(),
                field: vec![Value {
                    name: "label".to_owned(),
                    r#type: "Label".to_owned(),
                    ..Default::default()
                }],
                ..Default::default()
            });
    }
    for (name, fields) in env::make_missing_module_members() {
        if let Some(class) = classes.get_mut(&name) {
            for field in fields {
                if let Some(existing) = class
                    .field
                    .iter_mut()
                    .find(|existing| existing.name == field.name)
                {
                    // Some exported provider keys omit their callable contract.
                    if existing.callable.is_none() {
                        existing.callable = field.callable;
                    }
                } else {
                    class.field.push(field);
                }
            }
        }
    }
    if let Some(native) = classes.get_mut("native") {
        for field in &mut native.field {
            refine_builtin_signature(dialect, field, builtins);
        }
        for field in &rule_values {
            if !native
                .field
                .iter()
                .any(|existing| existing.name == field.name)
            {
                native.field.push(field.clone());
            }
        }
    }
    // The BUILD global and the native field are the same callable in Bazel.
    // Preserve either inventory declaration if a host describes them differently.
    let stored_glob = dialect == Dialect::Bazel
        && classes
            .get("native")
            .and_then(|native| native.field.iter().find(|field| field.name == "glob"))
            .and_then(|field| field.callable.as_ref())
            .zip(
                contexts
                    .iter()
                    .find(|(context, _)| *context == APIContext::Build)
                    .and_then(|(_, globals)| globals.get("glob"))
                    .and_then(|global| global.callable.as_ref()),
            )
            .is_some_and(|(field, global)| field == global);

    if !rule_names.is_empty() {
        classes.entry("rule".to_owned()).or_insert_with(|| Type {
            name: "rule".to_owned(),
            ..Default::default()
        });
    }
    let propagation_context_available = dialect == Dialect::Bazel
        && classes.contains_key("Label")
        && classes.contains_key("struct");
    let java_common_available = dialect == Dialect::Bazel
        && classes.contains_key("java_common")
        && classes.contains_key("struct");
    let xcode_config_available = dialect == Dialect::Bazel
        && classes.contains_key("apple_common")
        && classes.contains_key("apple_platform")
        && classes.contains_key("DottedVersion")
        && classes.contains_key("Provider");
    if xcode_config_available {
        classes
            .entry("XcodeVersionConfig".to_owned())
            .or_insert_with(|| Type {
                name: "XcodeVersionConfig".to_owned(),
                doc: "Xcode versions and execution requirements.".to_owned(),
                ..Default::default()
            });
    }
    let module_extension_available = dialect == Dialect::Bazel
        && contexts.iter().any(|(_, globals)| {
            globals
                .get("module_extension")
                .is_some_and(|value| value.callable.is_some())
        });
    if module_extension_available {
        // Bazel's module_extension returns this fieldless native value, but
        // its Java API declares Object and the exporter omits the value type.
        classes
            .entry(MODULE_EXTENSION_TYPE.to_owned())
            .or_insert_with(|| Type {
                name: MODULE_EXTENSION_TYPE.to_owned(),
                ..Default::default()
            });
    }
    if dialect == Dialect::Bazel
        && contexts.iter().any(|(context, globals)| {
            *context == APIContext::Module
                && globals.get("use_extension").is_some_and(|value| {
                    value
                        .callable
                        .as_ref()
                        .is_some_and(|callable| callable.return_type == MODULE_EXTENSION_PROXY_TYPE)
                })
        })
    {
        classes
            .entry(MODULE_EXTENSION_PROXY_TYPE.to_owned())
            .or_insert_with(|| Type {
                name: MODULE_EXTENSION_PROXY_TYPE.to_owned(),
                ..Default::default()
            });
    }
    if dialect == Dialect::Bazel {
        classes
            .entry("repo_metadata".to_owned())
            .or_insert_with(|| Type {
                name: "repo_metadata".to_owned(),
                ..Default::default()
            });
        classes.entry("select".to_owned()).or_insert_with(|| Type {
            name: "select".to_owned(),
            doc: "Deferred configuration-dependent alternatives.".to_owned(),
            ..Default::default()
        });
        if builtins
            .global
            .iter()
            .any(|value| value.name == "exec_group")
        {
            // ExecGroupApi has no Starlark fields, so the exporter omits its type.
            classes
                .entry("exec_group".to_owned())
                .or_insert_with(|| Type {
                    name: "exec_group".to_owned(),
                    doc: "Execution constraints and toolchains for a rule's actions.".to_owned(),
                    ..Default::default()
                });
        }
    }
    if propagation_context_available {
        classes
            .entry("propagation_ctx".to_owned())
            .or_insert_with(|| Type {
                name: "propagation_ctx".to_owned(),
                doc: "Context passed to aspect propagation callbacks.".to_owned(),
                ..Default::default()
            });
    }
    let mut declared_classes: BTreeSet<_> = classes.keys().cloned().collect();
    let string_platform_types = classes.get("_ApplePlatformTypes").filter(|namespace| {
        !namespace.field.is_empty() && namespace.field.iter().all(|field| field.r#type == "string")
    });
    for extension in extensions {
        anyhow::ensure!(
            declared_classes.contains(extension),
            "cannot extend Bazel builtin type `{extension}`"
        );
    }
    let mut body = String::new();
    if dialect == Dialect::Bazel
        && builtins
            .global
            .iter()
            .chain(
                classes
                    .get("native")
                    .into_iter()
                    .flat_map(|class| &class.field),
            )
            .any(|value| existing_rule_view_result(value).is_some())
    {
        declared_classes.insert(EXISTING_RULE_VIEW.to_owned());
        // StarlarkNativeModule.DictLikeView defines the read operations shared
        // by existing_rule and existing_rules. Bazel can also return a dictionary,
        // so lookup keys must be hashable. Sequence results differ from Python
        // Mapping's set-like views. ExistingRuleView always supplies string
        // pseudo-attributes "name" and "kind"; other attribute values are
        // heterogeneous. Build rules have nonconfigurable string-list tags,
        // which StarlarkNativeModule converts to tuples; older queries can
        // also return repository rules without tags. ExistingRulesView
        // instead maps target names to rules.
        write!(
            body,
            r#"    class {EXISTING_RULE_VIEW}[_Value](_starpls_typing.Protocol):
        def __iter__(self) -> _starpls_typing.Iterator[_starpls_builtins.str]: ...
        def __len__(self) -> _starpls_builtins.int: ...
        def __contains__(self, key: _starpls_typing.Hashable) -> _starpls_builtins.bool: ...
        def __getitem__(self, key: _starpls_builtins.str) -> _Value: ...
        @_starpls_typing.overload
        def get(self, key: _starpls_typing.Hashable, /) -> _Value | None: ...
        @_starpls_typing.overload
        def get[_Default](self, key: _starpls_typing.Hashable, /, default: _Default) -> _Value | _Default: ...
        def keys(self) -> _starpls_typing.Sequence[_starpls_builtins.str]: ...
        def values(self) -> _starpls_typing.Sequence[_Value]: ...
        def items(self) -> _starpls_typing.Sequence[_starpls_builtins.tuple[_starpls_builtins.str, _Value]]: ...
    class _ExistingRule[_Tags = _starpls_builtins.object]({EXISTING_RULE_VIEW}[_starpls_builtins.object], _starpls_typing.Protocol):
        @_starpls_typing.overload
        def __getitem__(self, key: _starpls_typing.Literal["name", "kind"]) -> _starpls_builtins.str: ...
        @_starpls_typing.overload
        def __getitem__(self, key: _starpls_typing.Literal["tags"]) -> _Tags: ...
        @_starpls_typing.overload
        def __getitem__(self, key: _starpls_builtins.str) -> _starpls_builtins.object: ...
        @_starpls_typing.overload
        def get(self, key: _starpls_typing.Literal["name", "kind"], /, default: _starpls_builtins.object = ...) -> _starpls_builtins.str: ...
        @_starpls_typing.overload
        def get(self, key: _starpls_typing.Literal["tags"], /, default: _starpls_builtins.object = ...) -> _Tags: ...
        @_starpls_typing.overload
        def get(self, key: _starpls_typing.Hashable, /, default: _starpls_builtins.object = ...) -> _starpls_builtins.object: ...
"#
        )?;
    }
    if propagation_context_available {
        // These nested native types are not exported by Bazel's API inventory.
        // Their fields come from StarlarkAspectPropagationContextApi (Bazel 9).
        // Attribute names and values depend on the visited rule; unlike analyzed
        // rule attributes, dependency values here are Labels, never Targets.
        body.push_str(
            r#"    @_starpls_typing.final
    class _PropagationRuleAttribute:
        value: _starpls_typing.Final[_starpls_builtins.object]
        is_tool: _starpls_typing.Final[_starpls_builtins.bool]
    @_starpls_typing.final
    class _PropagationRuleKind:
        file_label: _starpls_typing.Final[_starpls_types.Label | None]
        rule_name: _starpls_typing.Final[_starpls_builtins.str]
    @_starpls_typing.final
    class _PropagationRule:
        label: _starpls_typing.Final[_starpls_types.Label]
        qualified_kind: _starpls_typing.Final[_starpls_types._PropagationRuleKind]
        attr: _starpls_typing.Final[_starpls_types.struct[_starpls_types._PropagationRuleAttribute]]
"#,
        );
    }
    let mut legacy_python_declarations = false;
    let legacy_provider_declarations =
        dialect == Dialect::Bazel && classes.contains_key("Provider");
    let legacy_py_cc_link_params = dialect == Dialect::Bazel
        && ["Provider", "CcInfo", "LinkingContext"]
            .iter()
            .all(|name| classes.contains_key(*name));
    if dialect == Dialect::Bazel {
        // AutoloadSymbols.modifyBuildBzlEnv retains only non-rule autoload
        // globals. Each member can be absent under Bazel's autoload policy.
        // https://github.com/bazelbuild/bazel/blob/9.2.0/src/main/java/com/google/devtools/build/lib/packages/AutoloadSymbols.java
        let bzl_globals = contexts
            .iter()
            .find(|(context, _)| *context == APIContext::Bzl)
            .map(|(_, globals)| globals);
        let has_legacy_python_types = ["File", "Provider", "depset"]
            .iter()
            .all(|name| classes.contains_key(*name));
        let mut python_key = |name| {
            if let Some(value) = bzl_globals
                .and_then(|globals| globals.get(name))
                .filter(|value| native_provider_instance(value).is_some())
            {
                if value.callable.is_some() {
                    format!("_starpls_provider{}", export_name(APIContext::Bzl, name))
                } else {
                    value_annotation(value, &declared_classes)
                }
            } else if has_legacy_python_types {
                legacy_python_declarations = true;
                format!("_Legacy{name}Key")
            } else {
                "_starpls_typing.Callable[..., _starpls_typing.Any]".to_owned()
            }
        };
        let py_info = python_key("PyInfo");
        let py_runtime_info = python_key("PyRuntimeInfo");
        let py_cc_link_params_provider = if legacy_py_cc_link_params {
            "_LegacyPyCcLinkParamsProviderKey"
        } else {
            "_starpls_typing.Any"
        };
        // Bazel's original `cc_proto_aspect` was created with `aspect()`.
        // https://github.com/bazelbuild/bazel/blob/7.6.1/src/main/starlark/builtins_bzl/common/cc/cc_proto_library.bzl#L245
        let aspect_result = bzl_globals
            .and_then(|globals| globals.get("aspect"))
            .and_then(|value| value.callable.as_ref())
            .map_or("", |callable| callable.return_type.as_str());
        let cc_proto_aspect = annotation(
            aspect_result,
            false,
            &declared_classes,
            AnnotationUse::Value,
            None,
        );
        write!(
            body,
            r#"    @_starpls_typing.final
    class _LegacyGlobals:
        if _starpls_native_rule_available:
"#,
        )?;
        for name in LEGACY_PROVIDER_GLOBALS {
            let annotation = if legacy_provider_declarations {
                format!("_LegacyProvider[_Legacy{name}]")
            } else {
                "_starpls_typing.Any".to_owned()
            };
            writeln!(body, "            {name}: {annotation} = ...")?;
        }
        write!(
            body,
            r#"            AndroidIdeInfo: _starpls_typing.Any = ...
            CcInfo: _starpls_typing.Any = ...
            CcToolchainConfigInfo: _starpls_typing.Any = ...
            DebugPackageInfo: _starpls_typing.Any = ...
            ProguardSpecProvider: _starpls_typing.Any = ...
            PyCcLinkParamsProvider: {py_cc_link_params_provider} = ...
            PyInfo: {py_info} = ...
            PyRuntimeInfo: {py_runtime_info} = ...
            apple_common: _starpls_typing.Any = ...
            cc_common: _starpls_typing.Any = ...
            cc_proto_aspect: {cc_proto_aspect} = ...
            java_common: _starpls_typing.Any = ...
            proto_common_do_not_use: _starpls_typing.Any = ...
        @_starpls_typing.type_check_only
        def __getattr__(self, name: _starpls_builtins.str) -> _starpls_typing.Never: ...
"#,
        )?;
    }
    body.push_str("    class ProviderKey: ...\n");
    body.push_str("    class ProviderInstance: ...\n");
    // The inventory includes auxiliary values such as FilesToRunProvider that
    // are not Bazel Info instances. Derive instance membership from the same
    // exported keys used below, rather than from names of documented types.
    let provider_instances: BTreeSet<_> = contexts
        .iter()
        .flat_map(|(_, values)| values.values())
        .chain(classes.values().flat_map(|class| &class.field))
        .filter_map(native_provider_instance)
        .collect();
    let mut provider_declarations = String::new();
    for class in classes.values() {
        if class.name == "apple_platform_type" {
            if let Some(namespace) = string_platform_types {
                let values = namespace
                    .field
                    .iter()
                    .map(|field| quoted(&field.name))
                    .collect::<Vec<_>>()
                    .join(", ");
                writeln!(
                    body,
                    "    type {} = _starpls_typing.Literal[{values}]",
                    class.name
                )?;
                continue;
            }
        }
        // These native instance types have no Starlark subclasses. Finality
        // preserves their comparison semantics and excludes unrelated provider
        // types from group lookup results.
        if matches!(
            class.name.as_str(),
            "File"
                | "Label"
                | "DormantDependency"
                | MODULE_EXTENSION_TYPE
                | "DefaultInfo"
                | "PackageSpecificationInfo"
                | "FilesToRunProvider"
                | "Target"
                | "struct"
                | "depset"
                | "runfiles"
                | "select"
        ) {
            writeln!(body, "    @_starpls_typing.final")?;
        }
        let parameter = match class.name.as_str() {
            "struct" => Some("_StructField, _StructShape"),
            "Provider" => Some("_ProviderValue"),
            "depset" => Some("_DepsetElement"),
            "select" => Some("_SelectValue, _SelectKind"),
            "Target" => Some("_DefaultInfoFilesToRun"),
            "FilesToRunProvider" => Some("_Executable"),
            "DefaultInfo" => Some("_DefaultInfoFiles, _DefaultInfoFilesToRun"),
            "ctx" => Some("_BuildSettingValue, _ContextAttrs"),
            "Attribute" => Some("_AttributeValue"),
            "transition" => Some("_TransitionKind"),
            _ => None,
        };
        // Bundled metadata retains the historical ObjcProvider Info class
        // after its constructor moved to Starlark, so it has no exported key.
        let base = if class.name == "Provider" {
            "ProviderKey"
        } else if matches!(class.name.as_str(), "struct" | "ObjcProvider")
            || provider_instances.contains(class.name.as_str())
            || (xcode_config_available && class.name == "XcodeVersionConfig")
        {
            "ProviderInstance"
        } else {
            ""
        };
        let base = if extensions.contains(&class.name) {
            let separator = if base.is_empty() { "" } else { ", " };
            Cow::Owned(format!(
                "{base}{separator}{}{}",
                super::host::BINDING_PREFIX,
                class.name
            ))
        } else {
            Cow::Borrowed(base)
        };
        if let Some(parameter) = parameter {
            writeln!(
                body,
                "    class {}({}{}_starpls_typing.Generic[{parameter}]):",
                class.name,
                base,
                if base.is_empty() { "" } else { ", " },
            )?;
        } else if !base.is_empty() {
            writeln!(body, "    class {}({base}):", class.name)?;
        } else {
            writeln!(body, "    class {}:", class.name)?;
        }
        writeln!(
            body,
            "        {}",
            quoted(&env::normalize_doc(&class.doc, false))
        )?;
        if class.name == "struct" {
            // The inventory describes an open record. Known source factory
            // fields are supplied separately; arbitrary native fields retain
            // their declared element contract through ordinary member lookup.
            writeln!(body, "        @_starpls_typing.type_check_only")?;
            writeln!(
                body,
                "        def __getattr__(self, name: _starpls_builtins.str) -> _StructField: ..."
            )?;
            writeln!(body, "        @_starpls_typing.type_check_only")?;
            writeln!(body, "        def __hash__(self: _starpls_types.struct[_starpls_typing.Hashable]) -> _starpls_builtins.int: ...")?;
        }
        let mut names = BTreeSet::new();
        if matches!(
            class.name.as_str(),
            "Label" | "File" | "DottedVersion" | "depset"
        ) {
            names.insert("__hash__");
            writeln!(body, "        @_starpls_typing.type_check_only")?;
            writeln!(
                body,
                "        def __hash__(self) -> _starpls_builtins.int: ..."
            )?;
        }
        if matches!(class.name.as_str(), "Label" | "DottedVersion") {
            // Comparable<Self> supplies Starlark ordering, including nested sorting.
            for method in ["__lt__", "__le__", "__gt__", "__ge__"] {
                names.insert(method);
                writeln!(body, "        def {method}(self, other: _starpls_types.{}, /) -> _starpls_builtins.bool: ...", class.name)?;
            }
        }
        if xcode_config_available && class.name == "XcodeVersionConfig" {
            // common/xcode/providers.bzl exports functions as provider fields.
            // The API inventory includes the key, but omits this instance type.
            names.extend([
                "xcode_version",
                "minimum_os_for_platform_type",
                "sdk_version_for_platform",
                "availability",
                "execution_info",
            ]);
            writeln!(body, "        xcode_version: _starpls_typing.Final[_starpls_typing.Callable[[], _starpls_types.DottedVersion | _starpls_builtins.str | None]]")?;
            let platform_type = if declared_classes.contains("apple_platform_type") {
                "_starpls_types.apple_platform_type"
            } else {
                "_starpls_builtins.str"
            };
            writeln!(body, "        minimum_os_for_platform_type: _starpls_typing.Final[_starpls_typing.Callable[[{platform_type}], _starpls_types.DottedVersion]]")?;
            writeln!(body, "        sdk_version_for_platform: _starpls_typing.Final[_starpls_typing.Callable[[_starpls_types.apple_platform], _starpls_types.DottedVersion]]")?;
            writeln!(body, "        availability: _starpls_typing.Final[_starpls_typing.Callable[[], _starpls_builtins.str]]")?;
            writeln!(body, "        execution_info: _starpls_typing.Final[_starpls_typing.Callable[[], _starpls_builtins.dict[_starpls_builtins.str, _starpls_builtins.str]]]")?;
        }
        if xcode_config_available && class.name == "apple_common" {
            names.insert("XcodeVersionConfig");
            writeln!(body, "        XcodeVersionConfig: _starpls_typing.Final[_starpls_types.Provider[_starpls_types.XcodeVersionConfig]]")?;
        }
        if propagation_context_available && class.name == "propagation_ctx" {
            names.extend(["attr", "rule"]);
            writeln!(body, "        attr: _starpls_typing.Final[_starpls_types.struct[_starpls_builtins.object]]")?;
            writeln!(
                body,
                "        rule: _starpls_typing.Final[_starpls_types._PropagationRule]"
            )?;
        }
        if class.name == "native" && dialect == Dialect::Bazel {
            names.insert("legacy_globals");
            // The namespace can be absent under Bazel's autoload policy.
            writeln!(body, "        if _starpls_native_rule_available:")?;
            writeln!(
                body,
                "            legacy_globals: _starpls_types._LegacyGlobals = ..."
            )?;
        }
        if class.name == "java_common" && java_common_available {
            names.insert("internal_DO_NOT_USE");
            // Autoloads can replace the original native Java namespace.
            writeln!(body, "        if _starpls_native_rule_available:")?;
            writeln!(body, "            internal_DO_NOT_USE: _starpls_typing.Callable[[], _starpls_types._JavaCommonInternal] = ...")?;
        }
        if class.name == "depset" {
            names.insert("__bool__");
            // Depset.truth() tests emptiness without exposing Starlark len().
            writeln!(body, "        @_starpls_typing.type_check_only")?;
            writeln!(
                body,
                "        def __bool__(self) -> _starpls_builtins.bool: ..."
            )?;
        }
        if class.name == "ToolchainInfo" {
            names.insert("__getattr__");
            writeln!(body, "        @_starpls_typing.type_check_only")?;
            writeln!(body, "        def __getattr__(self, name: _starpls_builtins.str) -> _starpls_typing.Any: ...")?;
        }
        if class.name == "OutputGroupInfo" {
            names.extend(["__getattr__", "__getitem__", "__contains__"]);
            writeln!(body, "        @_starpls_typing.type_check_only")?;
            writeln!(body, "        def __getattr__(self, name: _starpls_builtins.str) -> _starpls_types.depset[_starpls_types.File]: ...")?;
            writeln!(body, "        def __getitem__(self, name: _starpls_builtins.str) -> _starpls_types.depset[_starpls_types.File]: ...")?;
            writeln!(body, "        def __contains__(self, name: _starpls_builtins.object) -> _starpls_builtins.bool: ...")?;
        }
        if class.name == "ToolchainContext" {
            names.extend(["__getitem__", "__contains__"]);
            // Aspect toolchain contexts can return aspect providers, so the
            // shared native type cannot promise a ToolchainInfo result.
            writeln!(body, "        def __getitem__(self, key: _starpls_builtins.str | _starpls_types.Label | _starpls_types.ToolchainTypeInfo) -> _starpls_typing.Any: ...")?;
            writeln!(body, "        def __contains__(self, key: _starpls_builtins.str | _starpls_types.Label | _starpls_types.ToolchainTypeInfo) -> _starpls_builtins.bool: ...")?;
        }
        if class.name == "select" {
            names.extend(["__add__", "__radd__", "__or__", "__ror__"]);
            write_select_operators(&mut body, declared_classes.contains("Label"))?;
        }
        if class.name == "Target" {
            names.extend(["label", "files", "__getitem__", "__contains__"]);
            writeln!(body, "        label: _starpls_types.Label")?;
            // The default Bazel API exposes DefaultInfo.files directly;
            // incompatible_disable_target_default_provider_fields disables it.
            writeln!(
                body,
                "        files: _starpls_types.depset[_starpls_types.File]"
            )?;
            // Target access normalizes DefaultInfo.files even when the raw
            // provider constructor omitted it. Package and environment groups
            // can lack FilesToRunProvider; attribute facts refine its presence.
            writeln!(body, "        @_starpls_typing.overload")?;
            writeln!(
                body,
                "        def __getitem__(self, key: _starpls_types.Provider[_starpls_types.DefaultInfo]) -> _starpls_types.DefaultInfo[_starpls_types.depset[_starpls_types.File], _DefaultInfoFilesToRun]: ..."
            )?;
            // Package groups provide PackageSpecificationInfo. Both package
            // and environment groups lack FilesToRunProvider, and their other
            // provider lookups fail.
            writeln!(body, "        @_starpls_typing.overload")?;
            writeln!(
                body,
                "        def __getitem__(self, key: _starpls_types.Provider[_starpls_types.PackageSpecificationInfo]) -> _starpls_types.PackageSpecificationInfo: ..."
            )?;
            // A widened key can still identify a provider present on a group.
            writeln!(body, "        @_starpls_typing.overload")?;
            writeln!(
                body,
                "        def __getitem__(self: _starpls_types.Target[None], key: _starpls_types.Provider[_ProviderValue]) -> _starpls_ty_extensions.Intersection[_ProviderValue, _starpls_types.DefaultInfo[_starpls_types.depset[_starpls_types.File], None] | _starpls_types.PackageSpecificationInfo]: ..."
            )?;
            writeln!(body, "        @_starpls_typing.overload")?;
            writeln!(
                body,
                "        def __getitem__(self, key: _starpls_types.Provider[_ProviderValue]) -> _ProviderValue: ..."
            )?;
            writeln!(body, "        @_starpls_typing.overload")?;
            writeln!(body, "        def __getitem__(self: _starpls_types.Target[None], key: _starpls_types.ProviderKey) -> _starpls_types.DefaultInfo[_starpls_types.depset[_starpls_types.File], None] | _starpls_types.PackageSpecificationInfo: ...")?;
            writeln!(body, "        @_starpls_typing.overload")?;
            writeln!(body, "        def __getitem__(self, key: _starpls_types.ProviderKey) -> _starpls_types.ProviderInstance: ...")?;
            writeln!(
                body,
                "        def __contains__(self, key: _starpls_types.ProviderKey) -> _starpls_builtins.bool: ..."
            )?;
        }
        if matches!(class.name.as_str(), "rule" | "macro") {
            names.insert("__call__");
            writeln!(
                body,
                "        def __call__(self, /, *, name: _starpls_builtins.str, **kwargs: _starpls_typing.Any) -> None: ..."
            )?;
        }
        // WorkspaceFactory exports WORKSPACE functions through native, omits
        // `workspace`, and gives the `bind` function precedence over its rule.
        let native_inventory = class.name == "native";
        let workspace = if native_inventory && dialect == Dialect::Bazel {
            contexts
                .iter()
                .find(|(context, _)| *context == APIContext::Workspace)
        } else {
            None
        };
        let fields = workspace
            .into_iter()
            .flat_map(|(_, globals)| globals.values())
            .filter(|field| field.name != "workspace")
            .map(|field| (field, false))
            .chain(class.field.iter().map(|field| (field, native_inventory)));
        for (field, native_rule_candidate) in fields {
            if !names.insert(field.name.as_str()) {
                continue;
            }
            if native_rule_candidate && rule_names.contains(field.name.as_str()) {
                writeln!(body, "        {}: {}", field.name, rule_type(&field.name))?;
                writeln!(
                    body,
                    "        {}",
                    quoted(&env::normalize_doc(&field.doc, false))
                )?;
                continue;
            }
            if native_rule_candidate && unresolved_rules.contains(field.name.as_str()) {
                // Autoloads can provide these names independently of the live rule
                // registry, including replacements implemented as ordinary functions.
                writeln!(body, "        if _starpls_native_rule_available:")?;
                writeln!(
                    body,
                    "            {}: _starpls_typing.Any = ...",
                    field.name
                )?;
                continue;
            }
            if class.name == "ctx" && field.name == "build_setting_value" {
                writeln!(body, "        @_starpls_builtins.property")?;
                writeln!(
                    body,
                    "        def build_setting_value(self) -> _BuildSettingValue:"
                )?;
                writeln!(
                    body,
                    "            {}",
                    quoted(&env::normalize_doc(&field.doc, false))
                )?;
                writeln!(body, "            ...")?;
                continue;
            }
            match &field.callable {
                Some(callable) => {
                    if native_provider_instance(field).is_some() {
                        let provider = format!("_starpls_provider_{}_{}", class.name, field.name);
                        writeln!(
                            provider_declarations,
                            "class {provider}(_starpls_types.Provider[_starpls_types.{}]):",
                            field.name
                        )?;
                        write_function(
                            &mut provider_declarations,
                            "    ",
                            field,
                            callable,
                            CallableKind::Provider(Some(&class.name)),
                            AnnotationUse::Value,
                            &declared_classes,
                        )?;
                        writeln!(
                            body,
                            "        {}: _starpls_typing.Final[{provider}]",
                            field.name
                        )?;
                        continue;
                    }
                    if matches!(class.name.as_str(), "repository_ctx" | "module_ctx")
                        && field.name == "getenv"
                    {
                        // The inventory omits allowReturnNones. A supplied string
                        // default still guarantees a string result.
                        let documentation = callable_documentation(field, callable)?;
                        for (default, result) in [
                            ("None = None", "_starpls_builtins.str | None"),
                            ("_starpls_builtins.str", "_starpls_builtins.str"),
                        ] {
                            writeln!(body, "        @_starpls_typing.overload")?;
                            writeln!(body, "        def getenv(_starpls_self, name: _starpls_builtins.str, default: {default}) -> {result}:")?;
                            writeln!(body, "            {}", quoted(&documentation))?;
                            writeln!(body, "            ...")?;
                        }
                    } else if class.name == "Args" && field.name == "add" {
                        // Args.addArgument stringifies scalar objects, but rejects
                        // Java Sequence values and depsets before conversion.
                        // Directory File rejection is a value-level constraint.
                        let documentation = callable_documentation(field, callable)?;
                        let scalar = "_starpls_ty_extensions.Not[_starpls_typing.Sequence[_starpls_builtins.object] | _starpls_types.depset[_starpls_builtins.object]]";
                        for arguments in [
                            format!("arg_name_or_value: {scalar}"),
                            format!("arg_name_or_value: _starpls_builtins.str, value: {scalar}"),
                        ] {
                            writeln!(body, "        @_starpls_typing.overload")?;
                            writeln!(body, "        def add(_starpls_self, {arguments}, /, *, format: _starpls_builtins.str | None = None) -> _starpls_types.Args:")?;
                            writeln!(body, "            {}", quoted(&documentation))?;
                            writeln!(body, "            ...")?;
                        }
                    } else if let Some(options) =
                        args_collection_options(class, field, &declared_classes)
                    {
                        for with_name in [false, true] {
                            writeln!(body, "        @_starpls_typing.overload")?;
                            write_function(
                                &mut body,
                                "        ",
                                field,
                                callable,
                                CallableKind::ArgsCollection { with_name, options },
                                AnnotationUse::Value,
                                &declared_classes,
                            )?;
                        }
                    } else if class.name == "json" && field.name == "decode" {
                        let documentation = callable_documentation(field, callable)?;
                        let indent = if dialect == Dialect::Bazel {
                            // Keep result domains inline so hovers display them.
                            // Decoded containers are mutable: static elements must
                            // allow later insertion of values outside JSON's grammar.
                            writeln!(body, "        if {STATIC_JSON_DECODE}:")?;
                            write_json_decode(
                                &mut body,
                                "            ",
                                &json_value_type("_starpls_builtins.object"),
                                &documentation,
                            )?;
                            writeln!(body, "        else:")?;
                            "            "
                        } else {
                            "        "
                        };
                        write_json_decode(&mut body, indent, &decoded_json, &documentation)?;
                    } else {
                        let mut callable = Cow::Borrowed(callable);
                        if dialect == Dialect::Bazel
                            && class.name == "path"
                            && field.name == "readdir"
                            && matches!(
                                env::normalize_doc(&callable.return_type, true).as_str(),
                                "list" | "List"
                            )
                        {
                            // Bazel returns a path for each directory entry.
                            callable.to_mut().return_type = "list of paths".to_owned();
                        }
                        write_function(
                            &mut body,
                            "        ",
                            field,
                            &callable,
                            if dialect == Dialect::Bazel
                                && class.name == "ctx"
                                && field.name == "resolve_command"
                            {
                                CallableKind::ResolveCommand
                            } else {
                                CallableKind::Method(&class.name)
                            },
                            AnnotationUse::Value,
                            &declared_classes,
                        )?;
                    }
                }
                None => {
                    let field_type = if dialect == Dialect::Bazel
                        && class.name == "ctx"
                        && matches!(field.name.as_str(), "features" | "disabled_features")
                        && matches!(
                            env::normalize_doc(&field.r#type, true).as_str(),
                            "list" | "List"
                        ) {
                        // StarlarkRuleContextApi returns lists of feature names, but
                        // Bazel's inventory erases their element type.
                        Some("_starpls_builtins.list[_starpls_builtins.str]")
                    } else if dialect == Dialect::Bazel
                        && class.name == "CompilationContext"
                        && classes.contains_key("File")
                        && matches!(
                            field.name.as_str(),
                            "direct_headers"
                                | "direct_public_headers"
                                | "direct_private_headers"
                                | "direct_textual_headers"
                        )
                        && matches!(
                            env::normalize_doc(&field.r#type, true).as_str(),
                            "list" | "List"
                        )
                    {
                        // CcCompilationContextApi declares these as StarlarkList<FileT>.
                        Some("_starpls_builtins.list[_starpls_types.File]")
                    } else if matches!(class.name.as_str(), "ctx" | "rule_attributes")
                        && classes.contains_key("struct")
                    {
                        match field.name.as_str() {
                            // Missing host schemas remain gradual; registered rules supply
                            // their attribute types through the context specialization.
                            "attr" => Some(if class.name == "ctx" {
                                "_starpls_typing.Final[_ContextAttrs]"
                            } else {
                                "_starpls_types.struct[_starpls_unknown]"
                            }),
                            "file" => classes.contains_key("File").then_some("_starpls_types.struct[_starpls_types.File | None]"),
                            "outputs" => (class.name == "ctx" && classes.contains_key("File")).then_some("_starpls_types.struct[_starpls_types.File | _starpls_builtins.list[_starpls_types.File] | None]"),
                            "executable" => classes.contains_key("File").then_some("_starpls_types.struct[_starpls_types.File | None]"),
                            "files" => classes.contains_key("File").then_some("_starpls_types.struct[_starpls_builtins.list[_starpls_types.File]]"),
                            "var" => (class.name == "ctx").then_some("_starpls_builtins.dict[_starpls_builtins.str, _starpls_builtins.str]"),
                            _ => None,
                        }
                    } else if class.name == "DefaultInfo" {
                        match field.name.as_str() {
                            "files" => Some("_DefaultInfoFiles"),
                            "files_to_run" => Some("_DefaultInfoFilesToRun"),
                            _ => None,
                        }
                    } else if class.name == "RunEnvironmentInfo" {
                        match field.name.as_str() {
                            "environment" => Some("_starpls_builtins.dict[_starpls_builtins.str, _starpls_builtins.str]"),
                            "inherited_environment" => Some("_starpls_builtins.list[_starpls_builtins.str]"),
                            _ => None,
                        }
                    } else if matches!(
                        (dialect, class.name.as_str(), field.name.as_str()),
                        (_, "TemplateVariableInfo", "variables")
                            | (_, "configuration", "default_shell_env")
                            | (Dialect::Bazel, "repository_os", "environ")
                    ) && matches!(
                        env::normalize_doc(&field.r#type, true).as_str(),
                        "dict" | "Dict" | "Dictionary"
                    ) {
                        Some("_starpls_builtins.dict[_starpls_builtins.str, _starpls_builtins.str]")
                    } else if class.name == "runfiles" {
                        // RunfilesApi's Java declarations omit these depset
                        // arguments from exported metadata.
                        match field.name.as_str() {
                            "files" => Some("_starpls_types.depset[_starpls_types.File]"),
                            "symlinks" | "root_symlinks" => {
                                Some("_starpls_types.depset[_starpls_types.SymlinkEntry]")
                            }
                            "empty_filenames" => {
                                Some("_starpls_types.depset[_starpls_builtins.str]")
                            }
                            _ => None,
                        }
                    } else if class.name == "FilesToRunProvider" {
                        // Bazel's inventory omits allowReturnNones on these fields.
                        match field.name.as_str() {
                            "executable" => Some("_Executable"),
                            "runfiles_manifest" => Some("_starpls_types.File | None"),
                            "repo_mapping_manifest" => Some("_starpls_types.File | None"),
                            _ => None,
                        }
                    } else if class.name == "apple_common"
                        && field.name == "platform"
                        && classes.contains_key("apple_platform")
                    {
                        Some("_starpls_typing.Final[_starpls_types._ApplePlatforms]")
                    } else {
                        None
                    };
                    let field_type = field_type.map(str::to_owned).unwrap_or_else(|| {
                        if class.name == "_ApplePlatformTypes" && string_platform_types.is_some() {
                            format!("_starpls_typing.Literal[{}]", quoted(&field.name))
                        } else {
                            value_annotation(field, &declared_classes)
                        }
                    });
                    let field_type = if class.name == "_ApplePlatformTypes"
                        || (class.name == "apple_common" && field.name == "platform_type")
                        || (class.name == "DormantDependency" && field.name == "label")
                    {
                        format!("_starpls_typing.Final[{field_type}]")
                    } else {
                        field_type
                    };
                    writeln!(body, "        {}: {field_type}", field.name)?;
                    if !field.doc.is_empty() {
                        writeln!(
                            body,
                            "        {}",
                            quoted(&env::normalize_doc(&field.doc, false))
                        )?;
                    }
                }
            }
        }
    }
    if classes.contains_key("apple_common") && classes.contains_key("apple_platform") {
        // ApplePlatform.getStarlarkStruct exports each enum value under its
        // Starlark name; the inventory records only the enclosing struct.
        // https://github.com/bazelbuild/bazel/blob/9.2.0/src/main/java/com/google/devtools/build/lib/rules/apple/ApplePlatform.java
        body.push_str("    @_starpls_typing.final\n    class _ApplePlatforms:\n");
        for name in [
            "ios_device",
            "ios_simulator",
            "macos",
            "tvos_device",
            "tvos_simulator",
            "visionos_device",
            "visionos_simulator",
            "watchos_device",
            "watchos_simulator",
            "catalyst",
        ] {
            writeln!(
                body,
                "        {name}: _starpls_typing.Final[_starpls_types.apple_platform] = ..."
            )?;
        }
    }
    if classes.contains_key("rule") {
        // The shape is internal metadata for generated callback contexts. Keep
        // the public rule type and its nominal runtime identity unchanged.
        body.push_str(
            "    class _AnalyzedRule(rule, _starpls_typing.Generic[_AnalyzedAttributes]): ...\n",
        );
    }
    if java_common_available {
        // common/java/java_common.bzl exports this fixed struct. JavaCommonApi
        // defines the call modes; JavaStarlarkCommon validates collection elements.
        body.push_str(
            r#"    class _JavaCommonInternalMethods(_starpls_typing.Protocol):
        def create_compilation_action(
            self,
            ctx: _starpls_types.ctx[_starpls_builtins.object, _starpls_builtins.object],
            java_toolchain: _starpls_types.ProviderInstance,
            output: _starpls_types.File,
            manifest_proto: _starpls_types.File,
            plugin_info: _starpls_types.ProviderInstance,
            compilation_classpath: _starpls_types.depset[_starpls_types.File],
            direct_jars: _starpls_types.depset[_starpls_types.File],
            bootclasspath: _starpls_builtins.object,
            javabuilder_jvm_flags: _starpls_types.depset[_starpls_builtins.str],
            compile_time_java_deps: _starpls_types.depset[_starpls_types.File],
            javac_opts: _starpls_types.depset[_starpls_builtins.str],
            strict_deps_mode: _starpls_builtins.str,
            target_label: _starpls_types.Label,
            /,
            deps_proto: _starpls_types.File | None = ...,
            gen_class: _starpls_types.File | None = ...,
            gen_source: _starpls_types.File | None = ...,
            native_header_jar: _starpls_types.File | None = ...,
            sources: _starpls_types.depset[_starpls_types.File] | None = ...,
            source_jars: _starpls_typing.Sequence[_starpls_types.File] = ...,
            resources: _starpls_typing.Sequence[_starpls_types.File] = ...,
            resource_jars: _starpls_types.depset[_starpls_types.File] | None = ...,
            classpath_resources: _starpls_typing.Sequence[_starpls_types.File] = ...,
            sourcepath: _starpls_typing.Sequence[_starpls_types.File] = ...,
            injecting_rule_kind: _starpls_builtins.str | None = ...,
            enable_jspecify: _starpls_builtins.bool = ...,
            enable_direct_classpath: _starpls_builtins.bool = ...,
            additional_inputs: _starpls_typing.Sequence[_starpls_types.File] = ...,
            additional_outputs: _starpls_typing.Sequence[_starpls_types.File] = ...,
            *,
            extra_args: _starpls_typing.Sequence[_starpls_types.Args] = ...,
        ) -> None: ...
        def create_header_compilation_action(
            self,
            ctx: _starpls_types.ctx[_starpls_builtins.object, _starpls_builtins.object],
            java_toolchain: _starpls_types.ProviderInstance,
            compile_jar: _starpls_types.File,
            compile_deps_proto: _starpls_types.File,
            plugin_info: _starpls_types.ProviderInstance,
            source_files: _starpls_types.depset[_starpls_types.File],
            source_jars: _starpls_typing.Sequence[_starpls_types.File],
            compilation_classpath: _starpls_types.depset[_starpls_types.File],
            direct_jars: _starpls_types.depset[_starpls_types.File],
            bootclasspath: _starpls_builtins.object,
            compile_time_java_deps: _starpls_types.depset[_starpls_types.File],
            javac_opts: _starpls_types.depset[_starpls_builtins.str],
            strict_deps_mode: _starpls_builtins.str,
            target_label: _starpls_types.Label,
            injecting_rule_kind: _starpls_builtins.str | None,
            enable_direct_classpath: _starpls_builtins.bool,
            additional_inputs: _starpls_typing.Sequence[_starpls_types.File],
            /,
            header_compilation_jar: _starpls_types.File,
            header_compilation_direct_deps: _starpls_types.depset[_starpls_types.File],
        ) -> None: ...
        def check_java_toolchain_is_declared_on_rule(self, actions: _starpls_types.actions, /) -> None: ...
        def check_provider_instances(self, providers: _starpls_typing.Sequence[_starpls_builtins.object], what: _starpls_builtins.str, provider_type: _starpls_types.ProviderKey, /) -> None: ...
        def collect_native_deps_dirs(self, libraries: _starpls_types.depset[_starpls_types.LibraryToLink], /) -> _starpls_builtins.list[_starpls_builtins.str]: ...
        def expand_java_opts(self, ctx: _starpls_types.ctx[_starpls_builtins.object, _starpls_builtins.object], attr: _starpls_builtins.str, /, *, tokenize: _starpls_builtins.bool, exec_paths: _starpls_builtins.bool = ...) -> _starpls_builtins.list[_starpls_builtins.str]: ...
        def get_runtime_classpath_for_archive(self, jars: _starpls_types.depset[_starpls_types.File], excluded_jars: _starpls_types.depset[_starpls_types.File], /) -> _starpls_types.depset[_starpls_types.File]: ...
        def google_legacy_api_enabled(self) -> _starpls_builtins.bool: ...
        def incompatible_disable_non_executable_java_binary(self) -> _starpls_builtins.bool: ...
        def incompatible_java_info_merge_runtime_module_flags(self) -> _starpls_builtins.bool: ...
        def target_kind(self, target: _starpls_builtins.object, /) -> _starpls_builtins.str: ...
    type _JavaCommonInternal = _starpls_ty_extensions.Intersection[struct[_starpls_builtins.object], _JavaCommonInternalMethods]
"#,
        );
    }
    let mut rule_declarations = String::new();
    for (rule, value) in rules
        .rule
        .iter()
        .zip(&rule_values)
        .filter(|_| dialect == Dialect::Bazel)
        .filter(|(rule, _)| !placeholder_rules.contains(rule.name.as_str()))
    {
        let Some(callable) = &value.callable else {
            continue;
        };
        writeln!(
            rule_declarations,
            "class {}(_starpls_types.rule):",
            value.name
        )?;
        let documentation = callable_documentation(value, callable)?;
        writeln!(rule_declarations, "    {}", quoted(&documentation))?;
        write_function(
            &mut rule_declarations,
            "    ",
            value,
            callable,
            CallableKind::Rule(rule),
            AnnotationUse::AttributeInput,
            &declared_classes,
        )?;
        writeln!(
            rule_declarations,
            "{} = {}",
            rule_type(&value.name),
            value.name
        )?;
    }
    let mut exports = String::new();
    let mut emitted: BTreeMap<String, Vec<(Value, AnnotationUse, String)>> = BTreeMap::new();
    for (context, globals) in contexts {
        for value in globals.values() {
            let export = export_name(context, &value.name);
            if matches!(
                context,
                APIContext::Bzl | APIContext::Build | APIContext::Prelude
            ) && unresolved_rules.contains(value.name.as_str())
            {
                writeln!(exports, "if _starpls_native_rule_available:")?;
                writeln!(exports, "    {export}: _starpls_typing.Any = ...")?;
                continue;
            }
            let Some(callable) = &value.callable else {
                writeln!(
                    exports,
                    "{export}: {}",
                    value_annotation(value, &declared_classes)
                )?;
                continue;
            };
            let input = if matches!(
                context,
                APIContext::Bzl | APIContext::Build | APIContext::Prelude
            ) && rule_names.contains(value.name.as_str())
            {
                AnnotationUse::AttributeInput
            } else {
                AnnotationUse::Value
            };
            if matches!(input, AnnotationUse::AttributeInput) {
                writeln!(exports, "{export}: {}", rule_type(&value.name))?;
                continue;
            }
            let previous = emitted.entry(value.name.clone()).or_default();
            if let Some((_, _, alias)) = previous
                .iter()
                .find(|(definition, usage, _)| definition == value && *usage == input)
            {
                writeln!(exports, "{export} = {alias}")?;
                continue;
            }
            let provider = native_provider_instance(value).is_some();
            if provider {
                writeln!(
                    exports,
                    "class _starpls_provider{export}(_starpls_types.Provider[_starpls_types.{}]):",
                    value.name
                )?;
            }
            if value.name == "depset" {
                // An empty input proves an empty depset. A type parameter default
                // cannot distinguish an empty input from an unknown one.
                writeln!(exports, "@_starpls_typing.overload")?;
                write_function(
                    &mut exports,
                    "",
                    value,
                    callable,
                    CallableKind::EmptyDepset,
                    input,
                    &declared_classes,
                )?;
                writeln!(exports, "@_starpls_typing.overload")?;
            }
            write_function(
                &mut exports,
                if provider { "    " } else { "" },
                value,
                callable,
                if provider {
                    CallableKind::Provider(None)
                } else {
                    CallableKind::Function
                },
                input,
                &declared_classes,
            )?;
            // Capture this definition before another context reuses its public name.
            if provider {
                writeln!(exports, "{export}: _starpls_provider{export}")?;
            } else {
                writeln!(exports, "{export} = {}", value.name)?;
            }
            previous.push((value.clone(), input, export));
        }
    }
    if classes.contains_key("struct") {
        body.push_str("    class _PendingDownload(_starpls_typing.Generic[_DownloadResult]):\n        def wait(self) -> _DownloadResult: ...\n\n");
    }
    if body.is_empty() {
        body.push_str("    pass\n");
    }
    let mut output = String::from(
        "import builtins as _starpls_builtins\nimport _starpls_allocations\nimport typing as _starpls_typing\nimport ty_extensions as _starpls_ty_extensions\nfrom ty_extensions._internal import Unknown as _starpls_unknown\n\n_JsonDefault = _starpls_typing.TypeVar(\"_JsonDefault\")\n_ResourceKey = _starpls_typing.TypeVar(\"_ResourceKey\", bound=_starpls_builtins.str)\n_ResourceNumber = _starpls_typing.TypeVar(\"_ResourceNumber\", bound=_starpls_builtins.float)\n_StringKey = _starpls_typing.TypeVar(\"_StringKey\", bound=_starpls_builtins.str)\n_StringValue = _starpls_typing.TypeVar(\"_StringValue\", bound=_starpls_builtins.str)\n_DownloadAuth = _starpls_typing.TypeVar(\"_DownloadAuth\", bound=_starpls_ty_extensions.Top[_starpls_typing.Mapping[_starpls_typing.Any, _starpls_typing.Any]])\n_ExecutionRequirementKey = _starpls_typing.TypeVar(\"_ExecutionRequirementKey\", bound=_starpls_builtins.str)\n\n_StructField = _starpls_typing.TypeVar(\"_StructField\", covariant=True)\nclass _StructUnknownShape(_starpls_typing.TypedDict): ...\n_StructShape = _starpls_typing.TypeVar(\"_StructShape\", covariant=True, default=_StructUnknownShape)\n_ProviderValue = _starpls_typing.TypeVar(\"_ProviderValue\", covariant=True)\n_AttributeValue = _starpls_typing.TypeVar(\"_AttributeValue\", covariant=True, default=_starpls_unknown)\n_AnalyzedAttributes = _starpls_typing.TypeVar(\"_AnalyzedAttributes\", covariant=True, default=_starpls_unknown)\n_ProviderFieldName = _starpls_typing.TypeVar(\"_ProviderFieldName\", bound=_starpls_builtins.str)\n_ProviderFieldDoc = _starpls_typing.TypeVar(\"_ProviderFieldDoc\", bound=_starpls_builtins.str)\n_ProviderInitParameters = _starpls_typing.ParamSpec(\"_ProviderInitParameters\")\n_ProviderInitResult = _starpls_typing.TypeVar(\"_ProviderInitResult\")\n_AttributeDefaultParameters = _starpls_typing.ParamSpec(\"_AttributeDefaultParameters\")\n_AttributeMaterializerParameters = _starpls_typing.ParamSpec(\"_AttributeMaterializerParameters\")\n_ImplementationParameters = _starpls_typing.ParamSpec(\"_ImplementationParameters\")\n_ImplementationResult = _starpls_typing.TypeVar(\"_ImplementationResult\")\n_RuleInitializerParameters = _starpls_typing.ParamSpec(\"_RuleInitializerParameters\")\n_RuleInitializerResult = _starpls_typing.TypeVar(\"_RuleInitializerResult\")\n_DepsetElement = _starpls_typing.TypeVar(\"_DepsetElement\", covariant=True)\n_DepsetInput = _starpls_typing.TypeVar(\"_DepsetInput\")\n_TransitionKind = _starpls_typing.TypeVar(\"_TransitionKind\", covariant=True, default=_starpls_builtins.object)\n_SelectValue = _starpls_typing.TypeVar(\"_SelectValue\", covariant=True)\n_SelectKind = _starpls_typing.TypeVar(\"_SelectKind\", covariant=True, default=_starpls_builtins.object)\n_SelectPeerValue = _starpls_typing.TypeVar(\"_SelectPeerValue\")\n_SelectCondition = _starpls_typing.TypeVar(\"_SelectCondition\", bound=\"_starpls_builtins.str | _starpls_types.Label\")\n_RuleAttributeName = _starpls_typing.TypeVar(\"_RuleAttributeName\", bound=\"_starpls_builtins.str\", default=\"_starpls_builtins.str\")\n_RuleAttribute = _starpls_typing.TypeVar(\"_RuleAttribute\", bound=\"_starpls_types.Attribute[_starpls_builtins.object]\", default=\"_starpls_types.Attribute[_starpls_builtins.object]\")\n_SelectLeft = _starpls_typing.TypeVar(\"_SelectLeft\")\n_SelectRight = _starpls_typing.TypeVar(\"_SelectRight\")\n_SelectKeyLeft = _starpls_typing.TypeVar(\"_SelectKeyLeft\")\n_SelectKeyRight = _starpls_typing.TypeVar(\"_SelectKeyRight\")\n_DefaultInfoFiles = _starpls_typing.TypeVar(\"_DefaultInfoFiles\", bound=\"_starpls_types.depset[_starpls_types.File] | None\", default=\"_starpls_types.depset[_starpls_types.File] | None\", covariant=True)\n_Executable = _starpls_typing.TypeVar(\"_Executable\", bound=\"_starpls_types.File | None\", default=\"_starpls_types.File | None\", covariant=True)\n_DefaultInfoFilesToRun = _starpls_typing.TypeVar(\"_DefaultInfoFilesToRun\", bound=\"_starpls_types.FilesToRunProvider | None\", default=\"_starpls_types.FilesToRunProvider | None\", covariant=True)\n_BuildSettingValue = _starpls_typing.TypeVar(\"_BuildSettingValue\", default=\"_starpls_builtins.bool | _starpls_builtins.int | _starpls_builtins.str | _starpls_builtins.list[_starpls_builtins.str] | _starpls_builtins.set[_starpls_builtins.str]\", covariant=True)\n",
    );
    if classes.contains_key("repository_ctx") || classes.contains_key("module_ctx") {
        output.push_str("_ExecuteEnvironmentValue = _starpls_typing.TypeVar(\"_ExecuteEnvironmentValue\", bound=\"_starpls_builtins.str | None\")\n");
    }
    if dialect == Dialect::Bazel
        && classes.get("ctx").is_some_and(|context| {
            context
                .field
                .iter()
                .any(|field| field.name == "resolve_command" && field.callable.is_some())
        })
    {
        output.push_str("_ResolveCommandExecutionValue = _starpls_typing.TypeVar(\"_ResolveCommandExecutionValue\", bound=_starpls_builtins.str)\n");
        if classes.contains_key("File") {
            output.push_str("_ResolveCommandFiles = _starpls_typing.TypeVar(\"_ResolveCommandFiles\", bound=\"_starpls_typing.Iterable[_starpls_types.File]\")\n");
        }
    }
    writeln!(output, "_JsonValue = {decoded_json}")?;
    output.push_str(
        "_DownloadResult = _starpls_typing.TypeVar(\"_DownloadResult\", covariant=True)\n",
    );
    output.push_str(
        "_RepositoryAttributeValue = _starpls_typing.TypeVar(\"_RepositoryAttributeValue\")\n",
    );
    let context_attrs = if classes.contains_key("struct") {
        "_starpls_types.struct[_starpls_unknown]"
    } else {
        "_starpls_unknown"
    };
    writeln!(output, "_ContextAttrs = _starpls_typing.TypeVar(\"_ContextAttrs\", default=\"{context_attrs}\", covariant=True)\n")?;
    output.push_str(
        "_starpls_native_rule_available: _starpls_builtins.bool\n\nclass _starpls_types:\n",
    );
    output.push_str(&body);
    output.push('\n');
    if dialect == Dialect::Bazel
        && classes
            .get("bazel_module_tags")
            .is_some_and(|class| class.field.is_empty())
        && [
            ("module_ctx", "modules", "list"),
            ("bazel_module", "tags", "bazel_module_tags"),
        ]
        .into_iter()
        .all(|(class, field, expected)| {
            classes.get(class).is_some_and(|class| {
                class.field.iter().any(|value| {
                    value.name == field
                        && value.callable.is_none()
                        && env::normalize_doc(&value.r#type, true) == expected
                })
            })
        })
    {
        // Bazel freezes module_ctx.modules before invoking the extension. Keep
        // its ordinary list compatibility while refining immutable reads.
        // A slice is a new list and retains the ordinary mutable element type.
        writeln!(
            output,
            r#"class {modules_type}[_Module: _starpls_types.bazel_module](_starpls_builtins.list[_starpls_types.bazel_module]):
    @_starpls_typing.type_check_only
    def __iter__(self) -> _starpls_typing.Iterator[_Module]: ...
    @_starpls_typing.overload
    @_starpls_typing.type_check_only
    def __getitem__(self, index: _starpls_builtins.int, /) -> _Module: ...
    @_starpls_typing.overload
    @_starpls_typing.type_check_only
    def __getitem__(self, index: _starpls_builtins.slice, /) -> _starpls_builtins.list[_starpls_types.bazel_module]: ...
_starpls_annotation_{modules_type} = {modules_type}
"#,
            modules_type = super::module_extension::MODULES_TYPE
        )?;
    }
    if dialect == Dialect::Bazel
        && classes.contains_key("repository_ctx")
        && classes.contains_key("struct")
    {
        // A schema replaces the native gradual attribute view. A separate
        // subclass preserves the non-generic context used by bare annotations.
        writeln!(
            output,
            r#"class repository_ctx(_starpls_types.repository_ctx, _starpls_typing.Generic[_ContextAttrs]):
    attr: _starpls_typing.Final[_starpls_ty_extensions.Intersection[_ContextAttrs, _starpls_types.struct[_starpls_builtins.object]]]
_starpls_annotation_{} = repository_ctx
"#,
            super::context::REPOSITORY_CONTEXT_SCHEMA
        )?;
    }
    if dialect == Dialect::Bazel
        && classes.contains_key("struct")
        && [
            ("ctx", "rule", "rule_attributes"),
            ("rule_attributes", "attr", "struct"),
        ]
        .into_iter()
        .all(|(class, field, expected)| {
            classes.get(class).is_some_and(|class| {
                class.field.iter().any(|value| {
                    value.name == field
                        && value.callable.is_none()
                        && env::normalize_doc(&value.r#type, true) == expected
                })
            })
        })
    {
        // A separate specialization preserves the staticness of two-argument
        // ctx contracts while retaining the native subject rule's other views.
        writeln!(
            output,
            r#"_AspectSubjectAttrs = _starpls_typing.TypeVar("_AspectSubjectAttrs", default=_starpls_builtins.object, covariant=True)
class _AspectRuleAttributes(_starpls_types.rule_attributes, _starpls_typing.Generic[_AspectSubjectAttrs]):
    attr: _starpls_typing.Final[_AspectSubjectAttrs]
class ctx(_starpls_types.ctx[_BuildSettingValue, _ContextAttrs], _starpls_typing.Generic[_BuildSettingValue, _ContextAttrs, _AspectSubjectAttrs]):
    rule: _starpls_typing.Final[_AspectRuleAttributes[_AspectSubjectAttrs]]
_starpls_annotation_{} = ctx
"#,
            super::context::ASPECT_CONTEXT_SCHEMA
        )?;
    }
    output.push_str("class _DictSchema[_Value](_starpls_typing.TypedDict, extra_items=_starpls_typing.ReadOnly[_Value]): ...\n\n");
    if classes.contains_key("struct") {
        output.push_str("_starpls_annotation__PendingDownload = _starpls_types._PendingDownload\n");
    }
    output.push_str("class _starpls_annotation_KeywordArgs: ...\n");
    output.push_str("_starpls_annotation_ExactDict = _starpls_allocations.dict\n\n");
    output.push_str("class _starpls_annotation_record(_starpls_types.ProviderInstance):\n    @_starpls_typing.type_check_only\n    def __getattr__(self, name: _starpls_builtins.str) -> _starpls_builtins.object: ...\n\n");
    output.push_str("_starpls_annotation_ProviderKey = _starpls_types.ProviderKey\n");
    output.push_str("_starpls_annotation_ProviderInstance = _starpls_types.ProviderInstance\n");
    output.push_str("_starpls_annotation_Intersection = _starpls_ty_extensions.Intersection\n");
    output.push_str("_starpls_annotation_Top = _starpls_ty_extensions.Top\n");
    if java_common_available {
        output.push_str(
            "_starpls_annotation_JavaCommonInternal = _starpls_types._JavaCommonInternal\n",
        );
    }
    if dialect == Dialect::Bazel {
        for (name, _) in COMMON_RULE_ATTRS {
            writeln!(output, "class _starpls_annotation_{name}: ...")?;
        }
    }
    for name in classes.keys() {
        writeln!(output, "_starpls_annotation_{name} = _starpls_types.{name}")?;
    }
    if dialect == Dialect::Bazel {
        for (annotation, runtime) in BAZEL_ANNOTATION_ALIASES {
            if classes.contains_key(*runtime) && !classes.contains_key(*annotation) {
                // ctx has internal type parameters, but Bazel's Ctx accepts none.
                // An empty specialization fixes those parameters to their defaults.
                let specialization = if *annotation == "Ctx" { "[()]" } else { "" };
                writeln!(
                    output,
                    "_starpls_annotation_{annotation} = _starpls_types.{runtime}{specialization}"
                )?;
            }
        }
    }
    if classes.contains_key("rule") {
        output.push_str("_starpls_annotation__AnalyzedRule = _starpls_types._AnalyzedRule\n");
    }
    for name in TYPING_ANNOTATIONS {
        writeln!(
            output,
            "_starpls_annotation_{name} = _starpls_typing.{name}"
        )?;
    }
    if legacy_python_declarations {
        output.push_str(include_str!("legacy_python.pyi"));
    }
    if legacy_provider_declarations {
        // Bazel 7.4's builtins_bzl/common/exports.bzl exports these original
        // provider keys. AutoloadSymbols may retain them in legacy_globals.
        // The inventory omits their constructor and field schemas; keep those
        // boundaries gradual while preserving each original provider identity.
        output.push_str(
            r#"class _LegacyProvider(_starpls_types.Provider[_ProviderValue]):
    def __call__(self, *args: _starpls_unknown, **kwargs: _starpls_unknown) -> _ProviderValue: ...
class _LegacyProviderInstance(_starpls_types.ProviderInstance):
    @_starpls_typing.type_check_only
    def __getattr__(self, name: _starpls_builtins.str) -> _starpls_unknown: ...
"#,
        );
        for name in LEGACY_PROVIDER_GLOBALS {
            writeln!(
                output,
                "@_starpls_typing.final\nclass _Legacy{name}(_LegacyProviderInstance): ..."
            )?;
        }
    }
    if legacy_py_cc_link_params {
        output.push_str(include_str!("legacy_py_cc_link_params.pyi"));
    }
    output.push_str(&provider_declarations);
    output.push_str(&rule_declarations);
    output.push_str(&exports);
    if stored_glob {
        writeln!(
            output,
            "{STORED_GLOB} = {}",
            export_name(APIContext::Build, "glob")
        )?;
    }
    output.push('\n');
    output.push_str(include_str!("starlark.pyi"));
    write_type_overloads(&mut output, &declared_classes)?;
    Ok(output)
}

fn write_type_overloads(
    output: &mut String,
    declared_classes: &BTreeSet<String>,
) -> anyhow::Result<()> {
    for (annotation, tag) in [
        ("_builtins.bool", "bool"),
        ("_builtins.int", "int"),
        ("_builtins.str", "string"),
        ("_starpls_annotation_function", "function"),
        (
            "_starpls_ty_extensions.Top[_builtins.list[_typing.Any]]",
            "list",
        ),
        (
            "_starpls_ty_extensions.Top[_builtins.dict[_typing.Any, _typing.Any]]",
            "dict",
        ),
        ("_builtins.tuple[_T, ...]", "tuple"),
        (
            "_starpls_ty_extensions.Top[_builtins.set[_typing.Any]]",
            "set",
        ),
        ("_builtins.range", "range"),
        ("None", "NoneType"),
    ]
    .into_iter()
    .chain(
        declared_classes
            .contains("File")
            .then_some(("_starpls_types.File", "File")),
    )
    .chain(
        declared_classes
            .contains("Label")
            .then_some(("_starpls_types.Label", "Label")),
    )
    .chain(declared_classes.contains("select").then_some((
        "_starpls_types.select[_builtins.object, _builtins.object]",
        "select",
    )))
    .chain(
        declared_classes
            .contains("depset")
            .then_some(("_starpls_types.depset[_builtins.object]", "depset")),
    )
    .chain(
        declared_classes
            .contains("runfiles")
            .then_some(("_starpls_types.runfiles", "runfiles")),
    )
    .chain(
        declared_classes
            .contains("FilesToRunProvider")
            .then_some(("_starpls_types.FilesToRunProvider", "FilesToRunProvider")),
    ) {
        writeln!(output, "@_typing.overload")?;
        writeln!(
            output,
            "def type(x: {annotation}, /) -> _typing.Literal[\"{tag}\"]: ..."
        )?;
    }
    // Ty's float annotation includes integers, so it uses the general result.
    writeln!(output, "@_typing.overload")?;
    writeln!(
        output,
        "def type(x: _builtins.object, /) -> _builtins.str: ..."
    )?;
    Ok(())
}

fn select_plain_operands<'a>(
    kind: &str,
    operand: &'a str,
) -> impl Iterator<Item = (&'a str, &'a str)> {
    let (exact, plain, fragment) = match kind {
        // Bazel requires the same Java implementation class. The general dict
        // type also covers implementations such as ctx.var's tracked dictionary.
        // Unknown preserves content inference without proving that requirement.
        "dict" => (
            Some("_starpls_allocations.dict[_SelectKeyRight, _SelectRight]"),
            "_starpls_ty_extensions.Intersection[_starpls_builtins.dict[_SelectKeyRight, _SelectRight], _starpls_unknown]",
            "_starpls_builtins.dict[_SelectKeyRight, _SelectRight]",
        ),
        "list" => (None, operand, "_starpls_builtins.list[_SelectRight]"),
        _ => (None, operand, operand),
    };
    exact
        .map(|exact| (exact, exact))
        .into_iter()
        .chain(std::iter::once((plain, fragment)))
}

// Bazel accepts concatenation only when first-branch runtime classes agree
// (with one shared category for Java lists). Payload types describe the later
// attribute conversion independently of that runtime-kind requirement.
fn write_select_operators(output: &mut String, has_label: bool) -> anyhow::Result<()> {
    let domains = [
        (
            "bool",
            "_starpls_builtins.bool",
            "_starpls_builtins.bool",
            "_starpls_builtins.bool",
            "add",
        ),
        (
            "str",
            "_starpls_builtins.str",
            "_starpls_builtins.str",
            "_starpls_builtins.str",
            "add",
        ),
        (
            "int",
            "_starpls_builtins.int",
            "_starpls_builtins.int",
            "_starpls_builtins.int",
            "add",
        ),
        (
            "label",
            "_starpls_types.Label",
            "_starpls_types.Label",
            "_starpls_types.Label",
            "add",
        ),
        (
            "list",
            "_starpls_typing.Sequence[_SelectLeft]",
            "_starpls_typing.Sequence[_SelectRight]",
            "_starpls_builtins.list[_SelectLeft | _SelectRight]",
            "add",
        ),
        (
            "dict",
            "_starpls_typing.Mapping[_SelectKeyLeft, _SelectLeft]",
            "_starpls_typing.Mapping[_SelectKeyRight, _SelectRight]",
            "_starpls_builtins.dict[_SelectKeyLeft | _SelectKeyRight, _SelectLeft | _SelectRight]",
            "or",
        ),
    ]
    .into_iter()
    .filter(|(kind, _receiver, _operand, _result, _operation)| *kind != "label" || has_label);
    for operation in ["add", "or"] {
        for reflected in ["", "r"] {
            if operation == "add" {
                writeln!(output, "        @_starpls_typing.overload")?;
                writeln!(output, "        @_starpls_typing.type_check_only")?;
                writeln!(output, "        def __{reflected}add__(self: _starpls_types.select[None, _starpls_typing.Literal[\"none\"]], other: _starpls_types.select[None, _starpls_typing.Literal[\"none\"]], /) -> _starpls_types.select[None, _starpls_typing.Literal[\"none\"]]: ...")?;
            }
            for (kind, receiver, operand, result, native_operation) in domains.clone() {
                let required_kind = format!("_starpls_typing.Literal[\"{kind}\"]");
                if operation == native_operation {
                    let precise_selector = |payload| {
                        let selector =
                            format!("_starpls_types.select[{payload} | None, {required_kind}]");
                        if kind == "list" {
                            // Every native Starlark sequence is a Java List, so a
                            // nonnullable sequence payload also proves compatibility.
                            format!("_starpls_types.select[{payload}] | {selector}")
                        } else {
                            selector
                        }
                    };
                    let selected_receiver = precise_selector(receiver);
                    let result_kind = if kind == "list" {
                        // Preserve a generic receiver kind while recording list compatibility.
                        "_starpls_ty_extensions.Intersection[_SelectKind, _starpls_typing.Literal[\"list\"]]"
                    } else {
                        "_SelectKind"
                    };
                    // Project the receiver's None contribution independently of merged elements.
                    for (plain_operand, _fragment) in select_plain_operands(kind, operand) {
                        writeln!(output, "        @_starpls_typing.overload")?;
                        writeln!(output, "        @_starpls_typing.type_check_only")?;
                        writeln!(output, "        def __{reflected}{operation}__(self: {selected_receiver}, other: {plain_operand}, /) -> _starpls_types.select[{result} | _starpls_ty_extensions.Intersection[_SelectValue, None], {result_kind}]: ...")?;
                    }
                    // The peer supplies both the element shape and its whole nullable payload.
                    let peer_kind = if kind == "list" {
                        "_starpls_builtins.object"
                    } else {
                        &required_kind
                    };
                    let selected = format!("_starpls_ty_extensions.Intersection[{}, _starpls_types.select[_SelectPeerValue, {peer_kind}]]", precise_selector(operand));
                    writeln!(output, "        @_starpls_typing.overload")?;
                    writeln!(output, "        @_starpls_typing.type_check_only")?;
                    writeln!(output, "        def __{reflected}{operation}__(self: {selected_receiver}, other: {selected}, /) -> _starpls_types.select[{result} | _starpls_ty_extensions.Intersection[_SelectValue | _SelectPeerValue, None], {result_kind}]: ...")?;
                }
                if operation == "add" {
                    // A None first branch retains its kind even with dictionary payloads.
                    let selected = format!("_starpls_ty_extensions.Intersection[_starpls_types.select[{operand} | None, _starpls_typing.Literal[\"none\"]], _starpls_types.select[_SelectPeerValue, _starpls_typing.Literal[\"none\"]]]");
                    writeln!(output, "        @_starpls_typing.overload")?;
                    writeln!(output, "        @_starpls_typing.type_check_only")?;
                    writeln!(output, "        def __{reflected}add__(self: _starpls_types.select[{receiver} | None, _starpls_typing.Literal[\"none\"]], other: {selected}, /) -> _starpls_types.select[{result} | _starpls_ty_extensions.Intersection[_SelectValue | _SelectPeerValue, None], _SelectKind]: ...")?;
                }
            }
            // Concatenation stores the pieces without converting their payloads.
            // Later branches may have different types from the first branch;
            // attribute conversion (or a macro) checks those values separately.
            // Keep the receiver's kind, including gradual kinds, so otherwise
            // identical overload results retain their known payloads.
            for (kind, _receiver, operand, _result, native_operation) in domains
                .clone()
                .chain(std::iter::once(("none", "None", "None", "None", "add")))
            {
                if operation != native_operation {
                    continue;
                }
                let required_kind = format!("_starpls_typing.Literal[\"{kind}\"]");
                for (plain_operand, fragment) in select_plain_operands(kind, operand) {
                    writeln!(output, "        @_starpls_typing.overload")?;
                    writeln!(output, "        @_starpls_typing.type_check_only")?;
                    writeln!(output, "        def __{reflected}{operation}__(self: _starpls_types.select[_SelectValue, {required_kind}], other: {plain_operand}, /) -> _starpls_types.select[_SelectValue | {fragment}, _SelectKind]: ...")?;
                }
                let selected = format!("_starpls_types.select[_SelectPeerValue, {required_kind}]");
                writeln!(output, "        @_starpls_typing.overload")?;
                writeln!(output, "        @_starpls_typing.type_check_only")?;
                writeln!(output, "        def __{reflected}{operation}__(self: _starpls_types.select[_SelectValue, {required_kind}], other: {selected}, /) -> _starpls_types.select[_SelectValue | _SelectPeerValue, _SelectKind]: ...")?;
            }
        }
    }
    Ok(())
}

fn rule_type(name: &str) -> String {
    format!("_starpls_rule_{name}")
}

fn value_annotation(value: &Value, classes: &BTreeSet<String>) -> String {
    let instance = native_provider_instance(value);
    let value_type = instance.unwrap_or(&value.r#type);
    let annotation = annotation(value_type, false, classes, AnnotationUse::Value, None);
    if instance.is_some() {
        format!("_starpls_types.Provider[{annotation}]")
    } else {
        annotation
    }
}

fn native_provider_instance(value: &Value) -> Option<&str> {
    starpls_bazel::KNOWN_PROVIDER_TYPES
        .contains(&value.name.as_str())
        .then_some(if value.callable.is_some() || value.r#type == "Provider" {
            &value.name
        } else {
            &value.r#type
        })
}

fn analyzed_target_annotation(classes: &BTreeSet<String>) -> Option<&'static str> {
    // Match the unrestricted analyzed target in context::unrestricted_target_type.
    ["Target", "FilesToRunProvider", "File"]
        .into_iter()
        .all(|class| classes.contains(class))
        .then_some("_starpls_types.Target[_starpls_types.FilesToRunProvider] | _starpls_types.Target[None]")
}

fn target_attribute_annotation(name: &str, target: &str) -> Option<String> {
    let targets = format!("_starpls_typing.Sequence[{target}]");
    let value = match name {
        "label" => format!("{target} | {targets} | None"),
        "label_list" => targets,
        "label_list_dict" => {
            format!("_starpls_typing.Mapping[_starpls_builtins.str, {targets}]")
        }
        _ => return None,
    };
    Some(format!("_starpls_types.Attribute[{value}]"))
}

fn args_collection_options<'a>(
    class: &Type,
    method: &'a Value,
    classes: &BTreeSet<String>,
) -> Option<&'a [Param]> {
    if class.name != "Args"
        || !matches!(method.name.as_str(), "add_all" | "add_joined")
        || !classes.contains("depset")
    {
        return None;
    }
    // Bazel dispatches on whether the optional second positional argument is present.
    // https://github.com/bazelbuild/bazel/blob/9.3.0rc2/src/main/java/com/google/devtools/build/lib/analysis/starlark/Args.java#L327-L347
    let [first, second, options @ ..] = method.callable.as_ref()?.param.as_slice() else {
        return None;
    };
    let (next, remaining) = options.split_first()?;
    let options = if next.is_star_arg && next.name.trim_start_matches('*').is_empty() {
        remaining
    } else {
        options
    };
    (first.name == "arg_name_or_values"
        && matches!(
            env::normalize_doc(&first.r#type, true).as_str(),
            "" | "unknown" | "Unknown"
        )
        && second.name == "values"
        && env::normalize_doc(&second.r#type, true) == "sequence; or depset"
        && !options.is_empty()
        && options
            .iter()
            .all(|parameter| !parameter.is_star_arg && !parameter.is_star_star_arg))
    .then_some(options)
}

fn write_function(
    output: &mut String,
    indent: &str,
    value: &Value,
    callable: &Callable,
    kind: CallableKind<'_>,
    input: AnnotationUse,
    classes: &BTreeSet<String>,
) -> anyhow::Result<()> {
    const STRING_DICTIONARY_INPUT: &str =
        "_starpls_builtins.dict[_StringKey, _StringValue] | _DictSchema[_starpls_builtins.str]";

    let provider = matches!(kind, CallableKind::Provider(_));
    let empty_depset = matches!(kind, CallableKind::EmptyDepset);
    let (kind, args_collection) = match kind {
        CallableKind::EmptyDepset => (CallableKind::Function, None),
        CallableKind::Provider(namespace) => (
            namespace.map_or(CallableKind::Function, CallableKind::Method),
            None,
        ),
        CallableKind::ArgsCollection { with_name, options } => {
            (CallableKind::Method("Args"), Some((with_name, options)))
        }
        kind => (kind, None),
    };
    let name = if provider || matches!(kind, CallableKind::Rule(_)) {
        "__call__"
    } else {
        &value.name
    };
    let target_attribute = match (kind, value.name.as_str()) {
        (CallableKind::Method("attr"), name @ ("label" | "label_list" | "label_list_dict"))
            if classes.contains("Attribute") =>
        {
            analyzed_target_annotation(classes)
                .and_then(|target| target_attribute_annotation(name, target))
        }
        (CallableKind::Function, "subrule")
            if classes.contains("Attribute") && classes.contains("Target") =>
        {
            let target = analyzed_target_annotation(classes).unwrap_or("_starpls_types.Target");
            target_attribute_annotation("label", target).map(|attribute| {
                format!("_starpls_typing.Mapping[_RuleAttributeName, {attribute}]")
            })
        }
        _ => None,
    };
    write!(output, "{indent}def {name}(")?;
    let mut separator = "";
    if provider || !matches!(kind, CallableKind::Function) {
        output.push_str("_starpls_self");
        separator = ", ";
    }
    let mut optional = false;
    let mut keyword_only = matches!(kind, CallableKind::Rule(_)) && !callable.param.is_empty();
    let legacy_prefix = matches!(kind, CallableKind::Method("repository_ctx" | "module_ctx"))
        && matches!(value.name.as_str(), "download_and_extract" | "extract");
    if keyword_only {
        output.push_str(", *");
    }
    let parameters = if let Some((with_name, options)) = args_collection {
        // Java's Sequence includes Starlark lists, tuples and ranges, but not strings.
        let values = "_starpls_ty_extensions.Intersection[_starpls_typing.Sequence[_starpls_builtins.object], _starpls_ty_extensions.Not[_starpls_builtins.str]] | _starpls_types.depset[_starpls_builtins.object]";
        let prefix = if with_name {
            "arg_name_or_values: _starpls_builtins.str, values"
        } else {
            "arg_name_or_values"
        };
        write!(output, ", {prefix}: {values}, /, *")?;
        keyword_only = true;
        options
    } else {
        callable.param.as_slice()
    };
    for parameter in parameters {
        output.push_str(separator);
        separator = ", ";
        let Param {
            name,
            r#type,
            doc: _,
            default_value,
            is_mandatory,
            is_star_arg,
            is_star_star_arg,
        } = parameter;
        let name = name.trim_start_matches('*');
        // This inventory omits parameter kinds. A required parameter after an
        // optional one proves a keyword-only boundary, but optional tails do
        // not. Preserve explicit variadics and avoid inventing other boundaries.
        let transitive = matches!(kind, CallableKind::Function)
            && value.name == "depset"
            && name == "transitive";
        if ((*is_mandatory && optional) || transitive || (legacy_prefix && name == "stripPrefix"))
            && !keyword_only
            && !is_star_arg
            && !is_star_star_arg
        {
            output.push_str("*, ");
            keyword_only = true;
        }
        if *is_star_arg {
            keyword_only = true;
        }
        if *is_star_arg && name.is_empty() {
            output.push('*');
            continue;
        }
        if *is_star_star_arg {
            output.push_str("**");
        } else if *is_star_arg {
            output.push('*');
        }
        let parameter_type = match (kind, value.name.as_str(), name) {
            // The host's unbound default is internal; supplied values must be Boolean.
            (CallableKind::Function | CallableKind::Method("native"), "glob", "allow_empty") => Some("_starpls_builtins.bool"),
            // LABEL_LIST accepts label strings and Label values; the inventory
            // omits the element type for this optional sequence.
            (CallableKind::Function | CallableKind::Method("native"), "exports_files", "visibility") => classes.contains("Label").then_some("_starpls_typing.Sequence[_starpls_builtins.str | _starpls_types.Label] | None"),
            // Bazel reads string-keyed dictionaries. Mapping also admits dictionary
            // schemas without promising mutation through their required fields.
            (CallableKind::Method("repository_ctx" | "module_ctx"), "download" | "download_and_extract", "auth") => Some("_starpls_typing.Mapping[_StringKey, _DownloadAuth]"),
            // repoMetadata casts a concrete dictionary to string keys and arbitrary values.
            (CallableKind::Method("repository_ctx"), "repo_metadata", "attrs_for_reproducibility") => (env::normalize_doc(r#type, true) == "Dictionary: string -> object").then_some("_starpls_builtins.dict[_StringKey, _RepositoryAttributeValue] | _DictSchema[_starpls_builtins.object]"),
            // Fill the inventory's missing element type. Remotable repository
            // rules further exclude paths.
            (CallableKind::Method("repository_ctx" | "module_ctx"), "execute", "arguments") => (classes.contains("Label") && classes.contains("path") && env::normalize_doc(r#type, true).eq_ignore_ascii_case("sequence")).then_some("_starpls_typing.Sequence[_starpls_builtins.str | _starpls_types.Label | _starpls_types.path]"),
            (CallableKind::Method("repository_ctx" | "module_ctx"), "execute", "environment") => {
                match env::normalize_doc(r#type, true).as_str() {
                    "Dictionary: string -> string" => Some(STRING_DICTIONARY_INPUT),
                    "Dictionary: string -> string or None" => Some("_starpls_builtins.dict[_StringKey, _ExecuteEnvironmentValue] | _DictSchema[_starpls_builtins.str | None]"),
                    _ => None,
                }
            }
            // StarlarkPath.getChild casts every variadic component to String.
            (CallableKind::Method("path"), "get_child", "relative_paths") => Some("_starpls_builtins.str"),
            (CallableKind::Method("apple_common"), "apple_host_system_env", "xcode_config") => classes.contains("XcodeVersionConfig").then_some("_starpls_types.XcodeVersionConfig | None"),
            (CallableKind::Method("apple_common"), "target_apple_env", "xcode_config") => classes.contains("XcodeVersionConfig").then_some("_starpls_types.XcodeVersionConfig"),
            (CallableKind::Method("apple_common"), "target_apple_env", "platform") => classes.contains("apple_platform").then_some("_starpls_types.apple_platform"),
            (CallableKind::Function, "struct", "kwargs") => Some("_StructField"),
            // provider() reads a concrete dictionary with string keys and documentation.
            (CallableKind::Function, "provider", "fields") => Some("_starpls_builtins.list[_ProviderFieldName] | _starpls_builtins.tuple[_starpls_builtins.str, ...] | _starpls_builtins.dict[_ProviderFieldName, _ProviderFieldDoc] | _DictSchema[_starpls_builtins.str] | None"),
            // Creation accepts any callable. The constructed provider checks the
            // initializer's returned dictionary against its field contract.
            (CallableKind::Function, "provider", "init") => Some("_starpls_typing.Callable[_ProviderInitParameters, _ProviderInitResult] | None"),
            // Registration stores a callable; each host API owns the checks
            // performed when it later invokes the implementation.
            (CallableKind::Function, "rule" | "repository_rule" | "aspect" | "transition" | "exec_transition", "implementation") => Some("_starpls_typing.Callable[_ImplementationParameters, _ImplementationResult]"),
            // Bazel invokes an extension with one module context and consumes
            // optional metadata from its result.
            (CallableKind::Function, "module_extension", "implementation") => (classes.contains("module_ctx") && classes.contains("extension_metadata") && env::normalize_doc(r#type, true) == "callable").then_some("_starpls_typing.Callable[[_starpls_types.module_ctx], _starpls_types.extension_metadata | None]"),
            // Bazel copies a concrete dictionary, including typed dictionary schemas.
            (CallableKind::Function, "module_extension", "tag_classes") => (classes.contains("tag_class") && env::normalize_doc(r#type, true) == "dict").then_some("_starpls_builtins.dict[_StringKey, _starpls_types.tag_class] | _DictSchema[_starpls_types.tag_class]"),
            (CallableKind::Function, "macro", "implementation") => Some("_starpls_ty_extensions.Intersection[_starpls_annotation_function, _starpls_typing.Callable[_ImplementationParameters, None]]"),
            (CallableKind::Function, "subrule", "implementation") => Some("_starpls_annotation_function"),
            (CallableKind::Function, "transition" | "exec_transition", "inputs" | "outputs") => Some("_starpls_typing.Sequence[_starpls_builtins.str]"),
            (CallableKind::Function, "rule" | "aspect", "provides") => {
                provider_requirement_annotation(r#type, false)
            }
            (CallableKind::Function, "aspect", "required_providers" | "required_aspect_providers")
            | (CallableKind::Method("attr"), _, "providers") => {
                provider_requirement_annotation(r#type, true)
            }
            // Encoding accepts any object; unsupported values raise rather than return.
            (CallableKind::Method("json"), "encode", "x") => Some("_starpls_builtins.object"),
            // Rule construction reads each dictionary while preserving its key and value types.
            (CallableKind::Function, "rule" | "aspect", "attrs") => classes.contains("Attribute").then_some("_starpls_typing.Mapping[_RuleAttributeName, _RuleAttribute]"),
            // A None value removes an inherited macro attribute.
            (CallableKind::Function, "macro", "attrs") => classes.contains("Attribute").then_some("_starpls_typing.Mapping[_RuleAttributeName, _RuleAttribute | None]"),
            // Subrules accept label and label-list descriptors. Their ordinary
            // ctx.attr values fit this covariant view; subrule callbacks receive
            // different injected values for executable and single-file labels.
            (CallableKind::Function, "subrule", "attrs") => target_attribute.as_deref(),
            // The host validates export and extension permissions after the rule type.
            (CallableKind::Function, "rule", "parent") => classes.contains("rule").then_some("_starpls_types.rule | None"),
            // Registration retains a separate callable signature. Attribute-dependent
            // invocation and returned updates are validated later by Bazel.
            (CallableKind::Function, "rule", "initializer") => Some("_starpls_typing.Callable[_RuleInitializerParameters, _RuleInitializerResult] | None"),
            (CallableKind::Function, "repository_rule", "attrs") => classes.contains("Attribute").then_some("_starpls_typing.Mapping[_RuleAttributeName, _RuleAttribute] | None"),
            (CallableKind::Function, "select", "x") => Some("_starpls_typing.Mapping[_SelectCondition, _SelectValue]"),
            (CallableKind::Function, "depset", "direct") => {
                Some(if empty_depset {
                    "_starpls_typing.Sequence[_starpls_typing.Never] | None"
                } else {
                    "_starpls_typing.Sequence[_DepsetInput] | None"
                })
            }
            (CallableKind::Function, "depset", "transitive") => {
                Some(if empty_depset {
                    "_starpls_typing.Sequence[_starpls_types.depset[_starpls_typing.Never]] | None"
                } else {
                    "_starpls_typing.Sequence[_starpls_types.depset[_DepsetInput]] | None"
                })
            }
            (CallableKind::Function, "DefaultInfo", "files") => Some("_DefaultInfoFiles"),
            (CallableKind::Function, "DefaultInfo", "executable") => classes.contains("File").then_some("_starpls_types.File | None"),
            (CallableKind::Function, "DefaultInfo", "runfiles" | "data_runfiles" | "default_runfiles") => classes.contains("runfiles").then_some("_starpls_types.runfiles | None"),
            (CallableKind::Function, "RunEnvironmentInfo", "environment") => Some("_starpls_typing.Mapping[_StringKey, _StringValue]"),
            (CallableKind::Function, "RunEnvironmentInfo", "inherited_environment") => Some("_starpls_typing.Sequence[_starpls_builtins.str]"),
            (CallableKind::Method("coverage_common"), "instrumented_files_info", "ctx") => {
                // Coverage consumes the native context, independently of its
                // build-setting value and generated attribute schema.
                (classes.contains("ctx") && env::normalize_doc(r#type, true) == "ctx")
                    .then_some("_starpls_types.ctx[_starpls_builtins.object, _starpls_builtins.object]")
            }
            (CallableKind::Method("coverage_common"), "instrumented_files_info", "source_attributes" | "dependency_attributes") => Some("_starpls_typing.Sequence[_starpls_builtins.str]"),
            // These registrations share Bazel's toolchain requirement parser.
            (CallableKind::Function, "rule" | "aspect" | "exec_group" | "subrule", "toolchains") => (classes.contains("Label") && classes.contains("toolchain_type") && env::normalize_doc(r#type, true).eq_ignore_ascii_case("sequence")).then_some("_starpls_typing.Sequence[_starpls_builtins.str | _starpls_types.Label | _starpls_types.toolchain_type]"),
            (CallableKind::Function, "rule" | "aspect", "exec_groups") => classes.contains("exec_group").then_some("_starpls_typing.Mapping[_StringKey, _starpls_types.exec_group] | None"),
            (CallableKind::Function, "rule", "cfg") => {
                let declared = env::normalize_doc(r#type, true);
                (classes.contains("transition")
                    && matches!(declared.as_str(), "" | "Unknown" | "unknown" | "Any"))
                .then_some("_starpls_types.transition | None")
            }
            (CallableKind::Method("attr"), _, "cfg") => (classes.contains("transition") && classes.contains("ExecTransitionFactory")).then_some("_starpls_builtins.str | _starpls_types.transition | _starpls_types.ExecTransitionFactory | None"),
            (CallableKind::Method("attr"), "label", "allow_single_file") => {
                let declared = env::normalize_doc(r#type, true);
                matches!(declared.as_str(), "" | "Unknown" | "unknown" | "Any")
                    .then_some("_starpls_builtins.bool | _starpls_typing.Sequence[_starpls_builtins.str] | None")
            }
            (CallableKind::Method("attr"), _, "for_dependency_resolution") => {
                let declared = env::normalize_doc(r#type, true);
                // Native validation tests identity with True and accepts every
                // other value as an explicitly disabled flag.
                matches!(declared.as_str(), "" | "Unknown" | "unknown" | "Any")
                    .then_some("_starpls_builtins.object")
            }
            (CallableKind::Function, "OutputGroupInfo", "kwargs") => Some("_starpls_typing.Sequence[_starpls_types.File] | _starpls_types.depset[_starpls_types.File]"),
            (CallableKind::Function, "macro", "inherit_attrs") => Some("_starpls_types.rule | _starpls_types.macro | _starpls_typing.Literal[\"common\"] | None"),
            // AspectPropagationEdgesSupplier accepts strings for fixed lists,
            // but toolchain callbacks return resolved Labels rather than strings.
            (CallableKind::Function, "aspect", "attr_aspects") => classes.contains("propagation_ctx").then_some("_starpls_typing.Sequence[_starpls_builtins.str] | _starpls_typing.Callable[[_starpls_types.propagation_ctx], _starpls_builtins.list[_starpls_builtins.str]]"),
            (CallableKind::Function, "aspect", "toolchains_aspects") => classes.contains("propagation_ctx").then_some("_starpls_typing.Sequence[_starpls_builtins.str] | _starpls_typing.Callable[[_starpls_types.propagation_ctx], _starpls_builtins.list[_starpls_types.Label]]"),
            (CallableKind::Function, "aspect", "propagation_predicate") => classes.contains("propagation_ctx").then_some("_starpls_typing.Callable[[_starpls_types.propagation_ctx], _starpls_builtins.bool] | None"),
            (CallableKind::Method("actions"), "run" | "run_shell" | "do_nothing", "inputs") => (classes.contains("File") && classes.contains("depset")).then_some("_starpls_typing.Sequence[_starpls_types.File] | _starpls_types.depset[_starpls_types.File]"),
            (CallableKind::Method("actions"), "run" | "run_shell", "arguments") => {
                (classes.contains("Args") && env::normalize_doc(r#type, true) == "sequence")
                    .then_some("_starpls_typing.Sequence[_starpls_builtins.str | _starpls_types.Args]")
            }
            // Template expansion casts the dictionary keys and values to strings.
            (CallableKind::Method("actions"), "expand_template", "substitutions")
            | (CallableKind::Method("repository_ctx"), "template", "substitutions") => {
                (env::normalize_doc(r#type, true) == "dict")
                    .then_some(STRING_DICTIONARY_INPUT)
            }
            // resolve_command reads these dictionaries independently. Their
            // distinct type variables preserve narrower concrete inputs.
            (CallableKind::ResolveCommand, _, "make_variables") => {
                (env::normalize_doc(r#type, true) == "dict; or None").then_some("_starpls_builtins.dict[_StringKey, _StringValue] | _DictSchema[_starpls_builtins.str] | None")
            }
            (CallableKind::ResolveCommand, _, "execution_requirements") => {
                (env::normalize_doc(r#type, true) == "dict").then_some("_starpls_builtins.dict[_ExecutionRequirementKey, _ResolveCommandExecutionValue] | _DictSchema[_starpls_builtins.str]")
            }
            (CallableKind::ResolveCommand, _, "label_dict") => {
                (classes.contains("Label") && classes.contains("File") && env::normalize_doc(r#type, true) == "dict").then_some("_starpls_builtins.dict[_starpls_types.Label, _ResolveCommandFiles]")
            }
            // Spawn actions copy each dictionary independently into string maps.
            (CallableKind::Method("actions"), "run" | "run_shell", "env") => {
                (env::normalize_doc(r#type, true) == "dict; or None")
                    .then_some("_starpls_typing.Mapping[_StringKey, _starpls_builtins.str] | None")
            }
            (CallableKind::Method("actions"), "run" | "run_shell" | "write", "execution_requirements") => {
                (env::normalize_doc(r#type, true) == "dict; or None")
                    .then_some("_starpls_typing.Mapping[_ExecutionRequirementKey, _starpls_builtins.str] | None")
            }
            // Kept for compatibility; Bazel ignores the manifest elements.
            (CallableKind::Method("actions"), "run" | "run_shell", "input_manifests") => {
                (env::normalize_doc(r#type, true) == "sequence; or None")
                    .then_some("_starpls_typing.Sequence[_starpls_builtins.object] | None")
            }
            // Both action constructors inspect each tool, including depset members.
            (CallableKind::Method("actions"), "run" | "run_shell", "tools") => Some("_starpls_typing.Sequence[_starpls_types.File | _starpls_types.FilesToRunProvider | _starpls_types.depset[_starpls_types.File]] | _starpls_types.depset[_starpls_types.File | _starpls_types.FilesToRunProvider | _starpls_types.depset[_starpls_types.File]]"),
            (CallableKind::Method("actions"), "run" | "run_shell" | "map_directory", "resource_set") => {
                if starpls_bazel::env::normalize_doc(r#type, true)
                    .split("; or ")
                    .any(|member| member == "dict")
                {
                    Some("_starpls_typing.Callable[[_starpls_builtins.str, _starpls_builtins.int], _starpls_builtins.dict[_ResourceKey, _ResourceNumber]] | _starpls_builtins.dict[_ResourceKey, _ResourceNumber] | None")
                } else {
                    Some("_starpls_typing.Callable[[_starpls_builtins.str, _starpls_builtins.int], _starpls_builtins.dict[_ResourceKey, _ResourceNumber]] | None")
                }
            }
            _ => None,
        };
        let parameter_type = parameter_type.map(str::to_owned).unwrap_or_else(|| {
            let package_label = matches!(kind, CallableKind::Function)
                && matches!(value.name.as_str(), "package" | "repo")
                && matches!(
                    name,
                    "default_visibility"
                        | "default_applicable_licenses"
                        | "default_package_metadata"
                        | "default_compatible_with"
                        | "default_restricted_to"
                );
            let attribute_default = matches!(kind, CallableKind::Method("attr"))
                && name == "default";
            let dictionary_type = if attribute_default && env::normalize_doc(r#type, true) == "dict" {
                match value.name.as_str() {
                    "label_list_dict" => Some(Discriminator::LabelListDict),
                    "string_list_dict" => Some(Discriminator::StringListDict),
                    _ => None,
                }
                .map(attribute_type_string_from_discriminator)
            } else {
                None
            };
            let converted_default = attribute_default
                && matches!(
                    value.name.as_str(),
                    "label"
                        | "label_list"
                        | "label_list_dict"
                        | "label_keyed_string_dict"
                        | "string_keyed_label_dict"
                        | "string_list_dict"
                );
            let input = if package_label || converted_default {
                AnnotationUse::AttributeInput
            } else {
                input
            };
            // Construction stores these functions, whose parameter names depend on
            // the surrounding rule. The native invocation owners validate results
            // without the string-to-Label conversion used for direct defaults.
            let callback = match (kind, value.name.as_str(), name) {
                (CallableKind::Method("attr"), "label", "default") => Some(if classes.contains("Label") {
                    "_starpls_typing.Callable[_AttributeDefaultParameters, _starpls_types.Label | None]"
                } else {
                    "_starpls_typing.Callable[_AttributeDefaultParameters, _starpls_unknown]"
                }),
                (CallableKind::Method("attr"), "label_list", "default") => Some(if classes.contains("Label") {
                    "_starpls_typing.Callable[_AttributeDefaultParameters, _starpls_typing.Sequence[_starpls_types.Label] | None]"
                } else {
                    "_starpls_typing.Callable[_AttributeDefaultParameters, _starpls_unknown]"
                }),
                (CallableKind::Method("attr"), "label", "materializer") => Some(if classes.contains("DormantDependency") {
                    "_starpls_typing.Callable[_AttributeMaterializerParameters, _starpls_types.DormantDependency | None]"
                } else {
                    "_starpls_typing.Callable[_AttributeMaterializerParameters, _starpls_unknown]"
                }),
                (CallableKind::Method("attr"), "label_list", "materializer") => Some(if classes.contains("DormantDependency") {
                    "_starpls_typing.Callable[_AttributeMaterializerParameters, _starpls_typing.Sequence[_starpls_types.DormantDependency]]"
                } else {
                    "_starpls_typing.Callable[_AttributeMaterializerParameters, _starpls_unknown]"
                }),
                _ => None,
            };
            annotation(
                dictionary_type.as_deref().unwrap_or(r#type),
                *is_star_arg || *is_star_star_arg,
                classes,
                input,
                callback,
            )
        });
        let parameter_type = if let CallableKind::Rule(rule) = kind {
            let configurable = rule
                .attribute
                .iter()
                .find(|attribute| {
                    attribute.name == name
                        || starpls_bazel::attr::input_alias(&attribute.name) == Some(name)
                })
                .and_then(|attribute| {
                    if matches!(
                        attribute.r#type(),
                        Discriminator::Output | Discriminator::OutputList
                    ) {
                        Some(false)
                    } else {
                        attribute.configurable
                    }
                });
            let parameter_type = if configurable != Some(false) {
                format!("{parameter_type} | _starpls_types.select[{parameter_type} | None]")
            } else {
                parameter_type
            };
            if *is_mandatory {
                parameter_type
            } else {
                format!("{parameter_type} | None")
            }
        } else {
            parameter_type
        };
        write!(output, "{name}: {parameter_type}")?;
        if !is_star_arg && !is_star_star_arg && !is_mandatory {
            optional = true;
            let default = if default_value.is_empty() || default_value == "unbound" {
                "..."
            } else {
                default_value
            };
            write!(output, " = {default}")?;
        }
    }
    // Bazel still accepts this undocumented spelling, which its inventory omits.
    if legacy_prefix
        && !callable
            .param
            .iter()
            .any(|parameter| parameter.name == "stripPrefix")
    {
        if !keyword_only {
            output.push_str(", *");
        }
        output.push_str(", stripPrefix: _starpls_builtins.str = ''");
    }
    let return_type = match (kind, value.name.as_str()) {
        (CallableKind::ResolveCommand, _) => {
            // Bazel 7 returned immutable runfiles suppliers in the third
            // component; later releases return an empty immutable list.
            (classes.contains("File") && env::normalize_doc(&callable.return_type, true).eq_ignore_ascii_case("tuple"))
                .then_some("_starpls_builtins.tuple[_starpls_builtins.list[_starpls_types.File], _starpls_builtins.list[_starpls_builtins.str], _starpls_typing.Sequence[_starpls_builtins.object]]")
        }
        (CallableKind::Function | CallableKind::Method("native"), "existing_rule" | "existing_rules") => {
            if classes.contains(EXISTING_RULE_VIEW) {
                existing_rule_view_result(value)
            } else {
                None
            }
        }
        (CallableKind::Method("repository_ctx" | "module_ctx"), "download") => {
            classes.contains("struct").then_some("_starpls_types.struct[_starpls_builtins.bool | _starpls_builtins.str | _starpls_builtins.int] | _starpls_types._PendingDownload[_starpls_types.struct[_starpls_builtins.bool | _starpls_builtins.str | _starpls_builtins.int]]")
        }
        (CallableKind::Method("repository_ctx" | "module_ctx"), "download_and_extract") => {
            classes.contains("struct").then_some("_starpls_types.struct[_starpls_builtins.bool | _starpls_builtins.str | _starpls_builtins.int]")
        }
        (CallableKind::Method("repository_ctx" | "module_ctx"), "which") => {
            (classes.contains("path")
                && env::normalize_doc(&callable.return_type, true) == "path")
                .then_some("_starpls_types.path | None")
        }
        (CallableKind::Function, "transition") => {
            let declared = env::normalize_doc(&callable.return_type, true);
            (classes.contains("transition")
                && matches!(
                    declared.as_str(),
                    "" | "unknown" | "Unknown" | "Any" | "transition"
                ))
            .then_some("_starpls_types.transition[_starpls_typing.Literal['split']]")
        }
        (CallableKind::Method("config"), "none" | "target") => {
            let declared = env::normalize_doc(&callable.return_type, true);
            (classes.contains("transition")
                && matches!(
                    declared.as_str(),
                    "" | "unknown" | "Unknown" | "Any" | "transition"
                ))
            .then_some("_starpls_types.transition[_starpls_typing.Literal['ordinary']]")
        }
        (CallableKind::Method("attr"), name) => {
            let declared = env::normalize_doc(&callable.return_type, true);
            if !classes.contains("Attribute") || declared != "Attribute" {
                None
            } else {
                match name {
                    "bool" => Some("_starpls_types.Attribute[_starpls_builtins.bool]"),
                    "int" => Some("_starpls_types.Attribute[_starpls_builtins.int]"),
                    "int_list" => Some("_starpls_types.Attribute[_starpls_builtins.list[_starpls_builtins.int]]"),
                    "string" => Some("_starpls_types.Attribute[_starpls_builtins.str]"),
                    "string_list" => Some("_starpls_types.Attribute[_starpls_builtins.list[_starpls_builtins.str]]"),
                    "string_list_dict" => Some("_starpls_types.Attribute[_starpls_builtins.dict[_starpls_builtins.str, _starpls_builtins.list[_starpls_builtins.str]]]"),
                    // These covariant views include provider-refined targets
                    // and split-transition lists. Checked descriptors retain
                    // their exact flags, requiredness, and mutable list types.
                    "label" | "label_list" | "label_list_dict" => target_attribute.as_deref(),
                    _ => None,
                }
            }
        }
        (CallableKind::Method("apple_common"), "apple_host_system_env" | "target_apple_env") => {
            Some("_starpls_builtins.dict[_starpls_builtins.str, _starpls_builtins.str]")
        }
        (CallableKind::Function, "struct") => Some("_starpls_types.struct[_StructField]"),
        (CallableKind::Function, "select") => Some("_starpls_types.select[_SelectValue]"),
        (CallableKind::Function, "depset") => Some(if empty_depset {
            "_starpls_types.depset[_starpls_typing.Never]"
        } else {
            "_starpls_types.depset[_DepsetInput]"
        }),
        (CallableKind::Function, "DefaultInfo") => {
            Some("_starpls_types.DefaultInfo[_DefaultInfoFiles, None]")
        }
        (CallableKind::Method("depset"), "to_list") => {
            Some("_starpls_builtins.list[_DepsetElement]")
        }
        _ => None,
    };
    let return_type = return_type.map(str::to_owned).unwrap_or_else(|| {
        annotation(
            &callable.return_type,
            false,
            classes,
            AnnotationUse::Value,
            None,
        )
    });
    writeln!(output, ") -> {return_type}:")?;
    let documentation = callable_documentation(value, callable)?;
    writeln!(output, "{indent}    {}", quoted(&documentation))?;
    writeln!(output, "{indent}    ...")?;
    Ok(())
}

fn provider_requirement_annotation(metadata: &str, nested: bool) -> Option<&'static str> {
    // Version discovery refines bare sequence metadata. Before discovery, keep
    // the legacy string domain rather than rejecting valid older workspaces.
    let (keys_only, nested) = match env::normalize_doc(metadata, true).as_str() {
        "sequence of ProviderKeys" => (true, false),
        "sequence of ProviderKeys; or sequence of sequences of ProviderKeys" => (true, true),
        "sequence of ProviderKeys or strings" => (false, false),
        "sequence of ProviderKeys or strings; or sequence of sequences of ProviderKeys or strings" => (false, true),
        "sequence" | "Sequence" | "list" | "List" => (false, nested),
        // More precise supplied signatures use the ordinary annotation parser.
        _ => return None,
    };
    Some(match (keys_only, nested) {
        (true, false) => "_starpls_typing.Sequence[_starpls_types.ProviderKey]",
        (true, true) => "_starpls_typing.Sequence[_starpls_types.ProviderKey] | _starpls_typing.Sequence[_starpls_typing.Sequence[_starpls_types.ProviderKey]]",
        (false, false) => "_starpls_typing.Sequence[_starpls_types.ProviderKey | _starpls_builtins.str]",
        (false, true) => "_starpls_typing.Sequence[_starpls_types.ProviderKey | _starpls_builtins.str] | _starpls_typing.Sequence[_starpls_typing.Sequence[_starpls_types.ProviderKey | _starpls_builtins.str]]",
    })
}

fn callable_documentation(value: &Value, callable: &Callable) -> anyhow::Result<String> {
    let mut documentation = env::normalize_doc(&value.doc, false);
    let mut documented_parameters = callable
        .param
        .iter()
        .filter(|parameter| !parameter.doc.is_empty())
        .peekable();
    if documented_parameters.peek().is_some() {
        documentation.push_str("\n\nArgs:");
    }
    for parameter in documented_parameters {
        let description =
            Docstring::new(env::normalize_doc(&parameter.doc, false)).render(MarkupKind::PlainText);
        let mut lines = description.lines();
        write!(
            documentation,
            "\n    {}: {}",
            parameter.name.trim_start_matches('*'),
            lines.next().unwrap_or_default()
        )?;
        for line in lines {
            write!(documentation, "\n        {line}")?;
        }
    }
    Ok(documentation)
}

/// Decode the inventory's prose vocabulary, not arbitrary annotation source.
/// Undeclared umbrella/prose types carry no nominal identity or usable contract.
fn annotation(
    text: &str,
    variadic: bool,
    classes: &BTreeSet<String>,
    usage: AnnotationUse,
    callback: Option<&str>,
) -> String {
    let text = env::normalize_doc(text, true);
    text.split("; or ")
        .filter(|part| part.trim() != "unbound")
        .map(|part| {
            if let Some(mapping) = part.trim().strip_prefix("Dictionary: ") {
                if let Some((key, value)) = mapping.split_once(" -> ") {
                    let label_key = matches!(key.trim(), "Label" | "label")
                        && classes.contains("Label");
                    let key = annotation(key, false, classes, usage, callback);
                    let value = annotation(value, false, classes, usage, callback);
                    let mapping = match usage {
                        AnnotationUse::Value => "_starpls_builtins.dict",
                        AnnotationUse::AttributeInput => "_starpls_typing.Mapping",
                    };
                    // Mapping keys are invariant; Bazel converts either key kind.
                    if matches!(usage, AnnotationUse::AttributeInput) && label_key {
                        return format!(
                            "{mapping}[_starpls_types.Label, {value}] | {mapping}[_starpls_builtins.str, {value}] | {mapping}[{key}, {value}]"
                        );
                    }
                    return format!("{mapping}[{key}, {value}]");
                }
            }
            let (name, element) = part
                .trim()
                .split_once(" of ")
                .map_or((part.trim(), None), |(name, element)| {
                    (name, Some(element.strip_suffix('s').unwrap_or(element)))
                });
            let container = match name {
                "list" => Some("_starpls_builtins.list"),
                "List" => Some("_starpls_builtins.list"),
                "sequence" => Some("_starpls_typing.Sequence"),
                "Sequence" => Some("_starpls_typing.Sequence"),
                "iterable" => Some("_starpls_typing.Iterable"),
                "Iterable" => Some("_starpls_typing.Iterable"),
                "Tuple" => Some("_starpls_builtins.tuple"),
                "tuple" => Some("_starpls_builtins.tuple"),
                "dict" => Some("_starpls_builtins.dict"),
                "Dict" => Some("_starpls_builtins.dict"),
                "Dictionary" => Some("_starpls_builtins.dict"),
                "depset" => classes.contains("depset").then_some("_starpls_types.depset"),
                _ => None,
            };
            if let Some(container) = container {
                let list_input = container == "_starpls_builtins.list"
                    && matches!(usage, AnnotationUse::AttributeInput);
                let container = match (container, usage) {
                    ("_starpls_builtins.list", AnnotationUse::AttributeInput) => {
                        "_starpls_typing.Iterable"
                    }
                    ("_starpls_builtins.dict", AnnotationUse::AttributeInput) => {
                        "_starpls_typing.Mapping"
                    }
                    _ => container,
                };
                let element = annotation(element.unwrap_or("Unknown"), false, classes, usage, callback);
                if variadic {
                    return element;
                }
                return if matches!(
                    container,
                    "_starpls_builtins.dict" | "_starpls_typing.Mapping"
                ) {
                    format!("{container}[_starpls_typing.Any, {element}]")
                } else if container == "_starpls_builtins.tuple" {
                    format!("{container}[{element}, ...]")
                } else if list_input && classes.contains("depset") {
                    format!("{container}[{element}] | _starpls_types.depset[{element}]")
                } else {
                    format!("{container}[{element}]")
                };
            }
            let boolean = match usage {
                AnnotationUse::Value => "_starpls_builtins.bool",
                // Rule attributes convert 0 and 1; ordinary native parameters do not.
                AnnotationUse::AttributeInput => {
                    "_starpls_builtins.bool | _starpls_typing.Literal[0, 1]"
                }
            };
            let scalar = match name {
                "" => "_starpls_typing.Any",
                "Unknown" => "_starpls_typing.Any",
                "unknown" => "_starpls_typing.Any",
                "Any" => "_starpls_typing.Any",
                "object" => "_starpls_builtins.object",
                "None" => "None",
                "NoneType" => "None",
                "int" => "_starpls_builtins.int",
                "Integer" => "_starpls_builtins.int",
                "float" => "_starpls_builtins.float",
                "bool" => boolean,
                "boolean" => boolean,
                "Boolean" => boolean,
                "string" => "_starpls_builtins.str",
                "String" => "_starpls_builtins.str",
                "str" => "_starpls_builtins.str",
                "bytes" => "_starpls_builtins.bytes",
                "tuple" => "_starpls_builtins.tuple[_starpls_typing.Any, ...]",
                "range" => "_starpls_builtins.range",
                "function" => callback.unwrap_or("_starpls_typing.Callable[..., _starpls_typing.Any]"),
                "callable" => callback.unwrap_or("_starpls_typing.Callable[..., _starpls_typing.Any]"),
                _ => {
                    let name = match name {
                        "label" => "Label",
                        "structure" => "struct",
                        _ => name,
                    };
                    if !classes.contains(name) {
                        return "_starpls_typing.Any".to_owned();
                    }
                    if name == "Label" && matches!(usage, AnnotationUse::AttributeInput) {
                        return "_starpls_types.Label | _starpls_builtins.str".to_owned();
                    }
                    if name == "Target" {
                        return analyzed_target_annotation(classes)
                            .unwrap_or("_starpls_types.Target")
                            .to_owned();
                    }
                    return format!("_starpls_types.{name}");
                }
            };
            scalar.to_owned()
        })
        .collect::<Vec<_>>()
        .join(" | ")
}

fn quoted(value: &str) -> String {
    let mut output = String::from("\"");
    for character in value.chars() {
        match character {
            '\\' => output.push_str("\\\\"),
            '"' => output.push_str("\\\""),
            '\n' => output.push_str("\\n"),
            '\r' => output.push_str("\\r"),
            '\t' => output.push_str("\\t"),
            _ => {
                if character.is_control() {
                    write!(output, "\\u{:04x}", u32::from(character)).unwrap();
                } else {
                    output.push(character);
                }
            }
        }
    }
    output.push('"');
    output
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use ruff_db::diagnostic::Severity;
    use ruff_db::diagnostic::UnifiedFile;
    use ruff_python_ast::Stmt;
    use ruff_text_size::Ranged;
    use starpls_bazel::build::attribute::Discriminator;
    use starpls_bazel::build::AttributeDefinition;
    use starpls_bazel::build::RuleDefinition;
    use starpls_common::Db as _;
    use starpls_common::FileInfo;
    use starpls_hir::Db;
    use ty_python_semantic::types::DynamicType;
    use ty_python_semantic::types::Type as TyType;
    use ty_python_semantic::types::UnionType;
    use ty_python_semantic::HasType;
    use ty_python_semantic::SemanticModel;

    use super::*;
    use crate::Analysis;
    use crate::FilePosition;

    #[test]
    fn bazel_type_constructor_names_resolve_to_metadata_types() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let source = "def collect(context: Ctx, output: File) -> Runfiles:\n    root: Root = output.root\n    print(root)\n    return context.runfiles()\n";
        let file = analysis
            .open_document(
                Path::new("/names.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        let annotations = analysis
            .db
            .builtin_completion_names(file, ty_python_semantic::provided::BuiltinUsage::Annotation);
        for (name, _) in BAZEL_ANNOTATION_ALIASES {
            assert!(annotations.contains_key(*name), "{name}");
        }
        analysis.update_file(
            file,
            format!("{source}def invalid(context: Ctx[int], output: File) -> Root:\n    return output\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"),
            "{diagnostics:?}"
        );
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "not-subscriptable"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn getattr_fallbacks_preserve_static_inputs() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"
def required(value: struct[{"items": list[str]}]) -> list[str]:
    return getattr(value, "items", [])
def optional_list(value: struct[{"items": NotRequired[list[str]]}], fallback: list[str]) -> list[str]:
    return getattr(value, "items", fallback)
def optional_dict(value: struct[{"items": NotRequired[dict[str, str]]}], fallback: dict[str, str]) -> dict[str, str]:
    return getattr(value, "items", fallback)
def optional_iterable(value: struct[{"items": NotRequired[Iterable[str]]}]) -> Iterable[str]:
    return getattr(value, "items", [])
def optional_mapping(value: struct[{"items": NotRequired[Mapping[str, str]]}]) -> Mapping[str, str]:
    return getattr(value, "items", {})
def scalar(value: struct[{"item": NotRequired[int]}]) -> int:
    return getattr(value, "item", 42)
def nullable(value: struct[{"item": NotRequired[str]}]) -> str | None:
    return getattr(value, "item", None)
def boolean(value: struct[{"item": NotRequired[bool]}]) -> bool:
    return getattr(value, "item", False)
def unrelated_fallback(value: struct[{"item": str}]) -> str:
    return getattr(value, "item", [42])
def absent() -> list[int]:
    return getattr(struct(), "missing", [42])
def direct(value: struct[{"item": str}]) -> str:
    return getattr(value, "item")
"#;
        let file = analysis
            .open_document(
                Path::new("/getattr.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for (source, expected) in [
            ("getattr(struct(item=1), 42)", "invalid-argument-type"),
            ("getattr(struct(item=1))", "no-matching-overload"),
            ("getattr(struct(item=1), 'item', 1, 2)", "no-matching-overload"),
            ("getattr(struct(item=1), name='item')", "no-matching-overload"),
            ("def wrong(value: struct[{'item': list[str]}]) -> list[int]:\n    return getattr(value, 'item', [])", "invalid-return-type"),
        ] {
            analysis.update_file(file, source.into());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.iter().any(|diagnostic| diagnostic.id().as_str() == expected), "{source}: {diagnostics:?}");
        }

        analysis.update_file(
            file,
            "def unknown(value: object, name: str) -> object:\n    return getattr(value, name, [])"
                .into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "non-static-type"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn attribute_constructor_values_have_static_contracts() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"print(attr.bool)
print(attr.int)
print(attr.int_list)
print(attr.label)
print(attr.label_list)
print(attr.string)
print(attr.string_list)
def constructor(name: Literal["bool", "int", "int_list", "label", "label_list", "string", "string_list"]) -> object:
    return getattr(attr, name)
def computed(value: str) -> Label:
    return Label(value)
def computed_list(value: str) -> list[Label]:
    return [Label(value)]
def materialize(context: object) -> None:
    return None
def materialize_list(context: struct[{"dependency": DormantDependency}]) -> tuple[DormantDependency, ...]:
    return (context.dependency,)
def dormant_label(value: DormantDependency) -> Label:
    return value.label
def materialize_empty(context: object) -> list[DormantDependency]:
    return []
attr.label(default=computed)
attr.label_list(default=computed_list)
attr.label(default=lambda: None)
attr.label_list(default=lambda: None)
attr.label_list(default=lambda: (Label("//:dep"),))
attr.label(materializer=materialize)
attr.label_list(materializer=materialize_list)
attr.label_list(materializer=materialize_empty)
attr.label(allow_single_file=[".txt"], for_dependency_resolution="disabled")
attr.label(allow_single_file=None, for_dependency_resolution=None)
def text() -> Attribute[str]:
    return attr.string(values=["one", "two"])
def dependency() -> Attribute[Target[FilesToRunProvider[File]]]:
    return attr.label(mandatory=True, executable=True, cfg="exec")
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:#?}");
        let gradual =
            "def callback(value: Any) -> Any:\n    return value\nattr.label(default=callback)\n";
        analysis.update_file(file, gradual.into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let argument_start = gradual.rfind("callback").unwrap();
        assert!(
            diagnostics.iter().any(|diagnostic| {
                diagnostic.id().as_str() == "non-static-type"
                    && diagnostic
                        .range()
                        .is_some_and(|range| usize::from(range.start()) == argument_start)
            }),
            "{diagnostics:#?}"
        );
        analysis.set_rules(crate::DiagnosticRules::default());
        for (statement, expected) in [
            ("attr.label(allow_single_file=42)", "invalid-argument-type"),
            (
                "attr.label(allow_single_file=[42])",
                "invalid-argument-type",
            ),
            ("attr.label(materializer=42)", "invalid-argument-type"),
            ("attr.label(materializer=None)", "invalid-argument-type"),
            ("attr.label(default=42)", "invalid-argument-type"),
            ("attr.label(default=lambda: 42)", "invalid-argument-type"),
            (
                "attr.label(default=lambda: '//:dep')",
                "invalid-argument-type",
            ),
            (
                "attr.label_list(default=lambda: [42])",
                "invalid-argument-type",
            ),
            (
                "attr.label_list(default=lambda: ['//:dep'])",
                "invalid-argument-type",
            ),
            (
                "attr.label(materializer=lambda context: Label('//:dep'))",
                "invalid-argument-type",
            ),
            (
                "attr.label_list(materializer=lambda context: None)",
                "invalid-argument-type",
            ),
            (
                "attr.label_list(materializer=lambda context: [Label('//:dep')])",
                "invalid-argument-type",
            ),
            (
                "def wrong(value: DormantDependency) -> str: return value.label",
                "invalid-return-type",
            ),
            ("DormantDependency()", "unresolved-reference"),
            ("attr.string(default=42)", "invalid-argument-type"),
            ("attr.string_list(default=[42])", "invalid-argument-type"),
            (
                "def wrong() -> Attribute[str]: return attr.bool()",
                "invalid-return-type",
            ),
            (
                "def wrong() -> Attribute[Target]: return attr.label()",
                "invalid-return-type",
            ),
        ] {
            analysis.update_file(file, format!("{source}{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{statement}: {diagnostics:#?}");
            };
            assert_eq!(diagnostic.id().as_str(), expected, "{statement}");
            assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
        }
    }

    #[test]
    fn attribute_constructor_contracts_preserve_metadata() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        for (name, declared, accepted, rejected) in [
            ("allow_single_file", "string", "'file'", "True"),
            ("for_dependency_resolution", "bool", "False", "'disabled'"),
            ("materializer", "None", "None", "lambda: None"),
            ("default", "None", "None", "lambda: None"),
        ] {
            let mut builtins = builtins.clone();
            let parameter = builtins
                .r#type
                .iter_mut()
                .find(|class| class.name == "attr")
                .unwrap()
                .field
                .iter_mut()
                .find(|field| field.name == "label")
                .unwrap()
                .callable
                .as_mut()
                .unwrap()
                .param
                .iter_mut()
                .find(|parameter| parameter.name == name)
                .unwrap();
            parameter.r#type = declared.into();
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let source = |value| format!("attr.label({name}={value})\n");
            let file = analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    source(accepted),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{name}: {diagnostics:#?}");
            analysis.update_file(file, source(rejected));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{name}: {diagnostics:#?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type", "{name}");
        }
    }

    #[test]
    fn attribute_constructor_contracts_preserve_declared_types() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        builtins.r#type.push(Type {
            name: "NativeComputedDefault".into(),
            field: vec![Value {
                name: "description".into(),
                r#type: "string".into(),
                ..Default::default()
            }],
            ..Default::default()
        });
        builtins.r#type.push(Type {
            name: "DormantDependency".into(),
            field: vec![Value {
                name: "label".into(),
                r#type: "int".into(),
                ..Default::default()
            }],
            ..Default::default()
        });
        builtins
            .r#type
            .iter_mut()
            .find(|class| class.name == "attr")
            .unwrap()
            .field
            .iter_mut()
            .find(|field| field.name == "string")
            .unwrap()
            .callable
            .as_mut()
            .unwrap()
            .return_type = "int".into();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("unsound-return-statement".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = "def marker(value: NativeComputedDefault) -> str:\n    return value.description\ndef dormant(value: DormantDependency) -> int:\n    return value.label\ndef constructor() -> Callable[[], int]:\n    return attr.string\n";
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:#?}");
        analysis.update_file(
            file,
            source.replace("Callable[[], int]", "Callable[[], str]"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:#?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-return-type");
    }

    #[test]
    fn attribute_constructor_values_preserve_partial_inventory() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        for missing in [None, Some("Attribute"), Some("Target")] {
            let mut builtins = builtins.clone();
            builtins
                .r#type
                .retain(|class| Some(class.name.as_str()) != missing);
            let callable = builtins
                .r#type
                .iter_mut()
                .find(|class| class.name == "attr")
                .unwrap()
                .field
                .iter_mut()
                .find(|field| field.name == "label")
                .unwrap()
                .callable
                .as_mut()
                .unwrap();
            callable.param.clear();
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            analysis.set_rules(
                crate::DiagnosticRules::from_settings(
                    &[("non-static-type".into(), "error".into())].into(),
                )
                .unwrap(),
            );
            let file = analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    "print(attr.label)\n".into(),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            if missing.is_none() {
                assert!(diagnostics.is_empty(), "{diagnostics:#?}");
            } else {
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{missing:?}: {diagnostics:#?}");
                };
                assert_eq!(diagnostic.id().as_str(), "non-static-type", "{missing:?}");
            }
        }
    }

    #[test]
    fn dormant_dependency_contracts_follow_available_inventory() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        for (capable, label) in [(true, true), (true, false), (false, true)] {
            let mut builtins = builtins.clone();
            if !label {
                builtins.r#type.retain(|class| class.name != "Label");
            }
            let declarations =
                super::generate(Dialect::Bazel, &builtins, &Default::default()).unwrap();
            assert_eq!(
                declarations.contents.lines().any(|line| {
                    line.contains("def __add__(self: _starpls_types.select[_starpls_types.Label")
                }),
                label,
            );
            if !capable {
                let attr = builtins
                    .r#type
                    .iter_mut()
                    .find(|class| class.name == "attr")
                    .unwrap();
                attr.field.retain(|field| {
                    !matches!(field.name.as_str(), "dormant_label" | "dormant_label_list")
                });
                for field in &mut attr.field {
                    if let Some(callable) = &mut field.callable {
                        callable
                            .param
                            .retain(|parameter| parameter.name != "materializer");
                    }
                }
            }
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            analysis.set_rules(
                crate::DiagnosticRules::from_settings(
                    &[("unsound-return-statement".into(), "error".into())].into(),
                )
                .unwrap(),
            );
            let source = if label {
                "def label(value: DormantDependency) -> Label:\n    return value.label\n"
            } else {
                "def label(value: DormantDependency) -> str:\n    return value.label\n"
            };
            let file = analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    source.into(),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            if capable && label {
                assert!(diagnostics.is_empty(), "{diagnostics:#?}");
            } else if capable {
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{diagnostics:#?}")
                };
                assert_eq!(diagnostic.id().as_str(), "unsound-return-statement");
            } else {
                assert!(
                    diagnostics
                        .iter()
                        .any(|diagnostic| diagnostic.id().as_str() == "unresolved-reference"),
                    "{diagnostics:#?}"
                );
            }
        }
    }

    #[test]
    fn context_attribute_views_preserve_native_domains() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("unsound-return-statement".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        for receiver in ["context", "attributes", "context.rule"] {
            for (view, expected, invalid) in [
                ("files", "list[File]", "list[str]"),
                ("file", "File | None", "File"),
                ("executable", "File | None", "File"),
            ] {
                let source = format!(
                    "def inspect(context: ctx, attributes: rule_attributes) -> {expected}:\n    return {receiver}.{view}.value\n"
                );
                let file = analysis
                    .open_document(Path::new("/main.bzl"), Dialect::Bazel, None, source, 1)
                    .unwrap();
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert!(diagnostics.is_empty(), "{receiver}.{view}: {diagnostics:?}");
                analysis.update_file(
                    file,
                    format!("def inspect(context: ctx, attributes: rule_attributes) -> {invalid}:\n    return {receiver}.{view}.value\n"),
                );
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{receiver}.{view}: {diagnostics:?}");
                };
                assert_eq!(diagnostic.id().as_str(), "invalid-return-type");
            }
        }
        let source = r#"def optional_file(context: ctx) -> str | None:
    value = context.rule.file.value
    if value != None:
        return value.path
    return None
def output(context: ctx) -> File | list[File] | None:
    return context.outputs.value
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                2,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            file,
            format!("{source}def required_output(context: ctx) -> File:\n    return context.outputs.value\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-return-type");
    }

    #[test]
    fn context_variables_have_string_keys_and_values() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = "\
def variables(context: ctx[object, object]) -> dict[str, str]:
    return context.var
def shell_environment(context: ctx[object, object]) -> dict[str, str]:
    return context.configuration.default_shell_env
def repository_environment(context: repository_ctx) -> dict[str, str]:
    return context.os.environ
def module_environment(context: module_ctx) -> dict[str, str]:
    return context.os.environ
";
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for invalid in ["dict[int, str]", "dict[str, int]"] {
            analysis.update_file(file, source.replace("dict[str, str]", invalid));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 4, "{diagnostics:?}");
            assert!(diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"));
        }
    }

    #[test]
    fn native_list_fields_preserve_element_types() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[
                    ("non-static-type".into(), "error".into()),
                    ("unsound-return-statement".into(), "error".into()),
                ]
                .into(),
            )
            .unwrap(),
        );
        for (class_name, receiver, field_name, element) in [
            ("ctx", "ctx[object, object]", "features", "str"),
            ("ctx", "ctx[object, object]", "disabled_features", "str"),
            (
                "CompilationContext",
                "CompilationContext",
                "direct_headers",
                "File",
            ),
            (
                "CompilationContext",
                "CompilationContext",
                "direct_public_headers",
                "File",
            ),
            (
                "CompilationContext",
                "CompilationContext",
                "direct_private_headers",
                "File",
            ),
            (
                "CompilationContext",
                "CompilationContext",
                "direct_textual_headers",
                "File",
            ),
        ] {
            let source = format!(
                r#"def elements(context: {receiver}, item: {element}) -> list[{element}]:
    context.{field_name}.append(item)
    context.{field_name}.append(42)
    return context.{field_name}

def first(context: {receiver}) -> {element}:
    return context.{field_name}[0]

def wrong(context: {receiver}) -> list[int]:
    return context.{field_name}
"#
            );
            let file = analysis
                .open_document(Path::new("/fields.bzl"), Dialect::Bazel, None, source, 1)
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [argument, returned] = diagnostics.as_slice() else {
                panic!("{class_name}.{field_name}: {diagnostics:?}");
            };
            assert_eq!(argument.id().as_str(), "invalid-argument-type");
            assert_eq!(returned.id().as_str(), "invalid-return-type");

            let field = builtins
                .r#type
                .iter_mut()
                .find(|class| class.name == class_name)
                .unwrap()
                .field
                .iter_mut()
                .find(|field| field.name == field_name)
                .unwrap();
            field.r#type = "List of ints".to_owned();
            analysis
                .set_builtin_defs(builtins.clone(), Default::default())
                .unwrap();
            analysis.update_file(
                file,
                format!(
                    r#"def supplied(context: {receiver}) -> list[int]:
    return context.{field_name}
"#
                ),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics.is_empty(),
                "{class_name}.{field_name}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn which_result_can_be_missing() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let source = r#"
def repository_lookup(context: repository_ctx) -> path:
    result = context.which("tool")
    if result == None:
        return 42
    return result

def module_lookup(context: module_ctx) -> path:
    return context.which("tool")
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(diagnostics
            .iter()
            .all(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"));
    }

    #[test]
    fn context_attributes_without_schemas_remain_gradual() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                String::new(),
                1,
            )
            .unwrap();
        for receiver in ["context", "attributes", "context.rule"] {
            let source = format!(
                "def inspect(context: ctx, attributes: rule_attributes) -> list[str]:\n    return {receiver}.attr.tags + ['manual']\n"
            );
            analysis.set_rules(crate::DiagnosticRules::default());
            analysis.update_file(file, source);
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{receiver}: {diagnostics:?}");
            analysis.set_rules(
                crate::DiagnosticRules::from_settings(
                    &[("unsound-return-statement".into(), "error".into())].into(),
                )
                .unwrap(),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| { diagnostic.id().as_str() == "unsound-return-statement" }),
                "{receiver}: {diagnostics:?}"
            );
        }
        analysis.update_file(
            file,
            "def inspect(attributes: struct[object]) -> str:\n    return attributes.value\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-return-type");
    }

    #[test]
    fn aspect_subject_attributes_preserve_context_domains() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        let source = r#"def read(context: ctx[bool, struct[{"own": str}], struct[{"weight": int}]]) -> tuple[bool, str, int, Label]:
    return context.build_setting_value, context.attr.own, context.rule.attr.weight, context.label

def wrong(context: ctx[object, object, struct[{"weight": int}]]) -> str:
    return context.rule.attr.weight

def missing(context: ctx[object, object, struct[{"weight": int}]]) -> int:
    return context.rule.attr.missing

def widen(context: ctx[object, object, struct[{"weight": int}]]) -> ctx[object, object, struct[{"weight": object}]]:
    return context

def narrow(context: ctx[object, object, struct[{"weight": object}]]) -> ctx[object, object, struct[{"weight": int}]]:
    return context
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .map(|diagnostic| (
                    diagnostic.id().as_str(),
                    &source[diagnostic.range().unwrap()]
                ))
                .collect::<Vec<_>>(),
            [
                ("invalid-return-type", "context.rule.attr.weight"),
                ("unresolved-attribute", "context.rule.attr.missing"),
                ("invalid-return-type", "context"),
            ],
        );
        builtins
            .r#type
            .iter_mut()
            .find(|class| class.name == "ctx")
            .unwrap()
            .field
            .iter_mut()
            .find(|field| field.name == "rule")
            .unwrap()
            .r#type = "string".into();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.update_file(
            file,
            "def supplied(context: ctx[object, object]) -> str:\n    return context.rule\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            file,
            "def unavailable(context: ctx[object, object, MissingSubject]) -> None:\n    pass\n"
                .into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect::<Vec<_>>(),
            ["unresolved-reference", "invalid-type-arguments"],
        );
    }

    #[test]
    fn context_attribute_views_preserve_partial_inventory() {
        for has_struct in [false, true] {
            let mut builtins = Builtins {
                r#type: vec![Type {
                    name: "rule_attributes".into(),
                    field: ["attr", "file", "files", "executable"]
                        .into_iter()
                        .map(|name| Value {
                            name: name.into(),
                            r#type: "string".into(),
                            ..Default::default()
                        })
                        .collect(),
                    ..Default::default()
                }],
                ..Default::default()
            };
            if has_struct {
                builtins.r#type.push(Type {
                    name: "struct".into(),
                    ..Default::default()
                });
            }
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            analysis.set_rules(
                crate::DiagnosticRules::from_settings(
                    &[("unsound-return-statement".into(), "error".into())].into(),
                )
                .unwrap(),
            );
            let source = "def inspect(attributes: rule_attributes) -> tuple[str, str, str]:\n    return attributes.file, attributes.files, attributes.executable\n".to_owned();
            let file = analysis
                .open_document(Path::new("/main.bzl"), Dialect::Bazel, None, source, 1)
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{has_struct}: {diagnostics:?}");
            let attr = if has_struct { "attr.unknown" } else { "attr" };
            analysis.update_file(file, format!("def inspect(attributes: rule_attributes) -> str:\n    return attributes.{attr}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            if has_struct {
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{diagnostics:?}");
                };
                assert_eq!(diagnostic.id().as_str(), "unsound-return-statement");
            } else {
                assert!(diagnostics.is_empty(), "{diagnostics:?}");
            }
        }
    }

    #[test]
    fn rule_attributes_accept_literal_keys() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        let DeclarationSource { path, mut contents } =
            generate(Dialect::Bazel, &builtins, &BuildLanguage::default()).unwrap();
        contents.push_str(
            r#"
def check_literal_keys(attrs: dict[_starpls_typing.Literal["dep"], _starpls_types.Attribute]):
    _starpls_Bzl_rule(implementation=lambda ctx: [], attrs=attrs)
"#,
        );
        analysis
            .db
            .source_system_mut()
            .set_virtual_source(&path, contents);
        let file = analysis.db.files.try_virtual_file(&path).unwrap();
        file.sync(&mut analysis.db);
        let db = &analysis.db;
        let file = ty_python_semantic::Db::program_file(db, file.file());
        let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
        let function = parsed
            .suite()
            .iter()
            .filter_map(Stmt::as_function_def_stmt)
            .find(|function| function.name.as_str() == "check_literal_keys")
            .unwrap();
        let errors: Vec<_> = ty_python_semantic::types::check_types(db, file)
            .into_iter()
            .filter(|diagnostic| {
                diagnostic.severity() == Severity::Error
                    && diagnostic.primary_span().is_some_and(|span| {
                        span.file() == &UnifiedFile::Ty(file.file(db))
                            && span
                                .range()
                                .is_some_and(|range| function.range().contains_range(range))
                    })
            })
            .collect();
        assert!(errors.is_empty(), "{errors:?}");
    }

    #[test]
    fn rule_attributes_preserve_static_descriptor_types() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def implementation(context: ctx[object, object]) -> list[object]:
    return []
def register(attributes: Mapping[str, Attribute[bool]] | Mapping[str, Attribute[str]]) -> rule:
    return rule(implementation=implementation, attrs=attributes)
empty = rule(implementation=implementation, attrs={})
empty(name="empty")
"#;
        let file = analysis
            .open_document(
                Path::new("/attrs.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (attribute, expected) in [
            ("int", "invalid-argument-type"),
            ("Attribute", "non-static-type"),
        ] {
            let invalid = source
                .replace("Attribute[bool]", attribute)
                .replace("Attribute[str]", attribute);
            let argument = invalid.rfind("attributes").unwrap();
            analysis.update_file(file, invalid);
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| {
                    diagnostic.id().as_str() == expected
                        && (attribute != "Attribute"
                            || diagnostic
                                .range()
                                .is_some_and(|range| usize::from(range.start()) == argument))
                }),
                "{attribute}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn optional_rule_attributes_preserve_guaranteed_calls() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("unsound-return-statement".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"
def fixed():
    return rule(implementation = lambda ctx: [DefaultInfo()], initializer = None, dependency_resolution_rule = False, subrules = [], attrs = {"exports": attr.label(mandatory = True)})
lifted = subrule(implementation = lambda ctx, _dep: None, attrs = {"_dep": attr.label(default = "//:dep", mandatory = True)})
def subrule_input():
    return rule(implementation = lambda ctx: [DefaultInfo()], subrules = [lifted], attrs = {"exports": attr.label(mandatory = True)})
def uncertain_private():
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = {"_secret": attr.label(mandatory = True, default = json.decode('"//:secret"')), "exports": attr.label(mandatory = True)})
def late_private():
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = {"_secret": attr.label(mandatory = True, default = configuration_field(fragment = "cpp", name = "compiler")), "exports": attr.label(mandatory = True)})
def optional(flag):
    attrs = {"extra": attr.string()} if flag else {}
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = attrs | {"exports": attr.label(mandatory = True)})
def overclaimed(flag):
    attrs = {"extra": attr.string()} if flag else {}
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = attrs | {"exports": attr.label(mandatory = True)})
def required(flag):
    attrs = {"extra": attr.string(mandatory = True)} if flag else {}
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = attrs | {"exports": attr.label(mandatory = True)})
def flagged(flag):
    attrs = {"extra": attr.label(flags = ["MANDATORY"])} if flag else {}
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = attrs | {"exports": attr.label(mandatory = True)})
def empty_flags(flag):
    attrs = {"extra": attr.label(flags = [])} if flag else {}
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = attrs | {"exports": attr.label(mandatory = True)})
def unknown_flags(flags):
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = {"extra": attr.label(flags = flags), "exports": attr.label(mandatory = True)})
def generated(flag):
    return rule(implementation = lambda ctx: [DefaultInfo()], build_setting = config.bool() if flag else None, attrs = {"exports": attr.label(mandatory = True)})
def dependency_resolution(flag):
    attrs = {"extra": attr.string()} if flag else {}
    return rule(implementation = lambda ctx: [DefaultInfo()], dependency_resolution_rule = True, attrs = attrs | {"exports": attr.label(mandatory = True)})
def initialized():
    return rule(implementation = lambda ctx: [DefaultInfo()], initializer = lambda name, exports, extra: {}, attrs = {"extra": attr.string(), "exports": attr.label(mandatory = True)})
_initialized_parent = rule(implementation = lambda ctx: [DefaultInfo()], initializer = lambda name, exports, extra: {}, extendable = True, attrs = {"extra": attr.string(), "exports": attr.label(mandatory = True)})
def inherited():
    return rule(implementation = lambda ctx: [DefaultInfo()], parent = _initialized_parent)
def computed(keys):
    attrs = {key: attr.string() if key else attr.int() for key in keys}
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = attrs | {"exports": attr.label(mandatory = True)})
def mixed(keys):
    attrs = {key: attr.string(mandatory = True) if key else attr.int() for key in keys}
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = attrs | {"exports": attr.label(mandatory = True)})
def unknown(attrs):
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = attrs | {"exports": attr.label(mandatory = True)})
def unknown_required(flag):
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = {"extra": attr.string(mandatory = flag), "exports": attr.label(mandatory = True)})
def wrong():
    return rule(implementation = lambda ctx: [DefaultInfo()], attrs = {"exports": attr.int(mandatory = True)})
def calls(flag):
    attrs = {"extra": attr.string()} if flag else {}
    target = rule(implementation = lambda ctx: [DefaultInfo()], attrs = attrs | {"exports": attr.label(mandatory = True)})
    target(name = "ok", exports = "//:x")
    target(name = "bad", exports = 42)
    target(name = "bad")
def required_with_unknown_flags(flags):
    target = rule(implementation = lambda ctx: [DefaultInfo()], attrs = {"extra": attr.label(mandatory = True, flags = flags)})
    target(name = "bad")
"#;
        let file = analysis
            .open_document(
                Path::new("/optional.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let interface = analysis
            .open_document(
                Path::new("/optional.bzli"),
                Dialect::Bazel,
                None,
                r#"class Contract(Protocol):
    def __call__(self, *, name: str, exports: str | Label) -> None: ...
type Fixed = Intersection[rule, Contract]
class ExtraContract(Protocol):
    def __call__(self, *, name: str, exports: str | Label, extra: str) -> None: ...
type Extra = Intersection[rule, ExtraContract]
class ToolchainsContract(Protocol):
    def __call__(self, *, name: str, exports: str | Label, toolchains: Sequence[str | Label]) -> None: ...
type WithToolchains = Intersection[rule, ToolchainsContract]
def fixed() -> Fixed: ...
def subrule_input() -> Fixed: ...
def uncertain_private() -> Fixed: ...
def late_private() -> Fixed: ...
def optional(flag: bool) -> Fixed: ...
def overclaimed(flag: bool) -> Extra: ...
def required(flag: bool) -> Fixed: ...
def flagged(flag: bool) -> Fixed: ...
def empty_flags(flag: bool) -> Fixed: ...
def unknown_flags(flags: Sequence[str]) -> Fixed: ...
def generated(flag: bool) -> Fixed: ...
def dependency_resolution(flag: bool) -> WithToolchains: ...
def initialized() -> Fixed: ...
def inherited() -> Fixed: ...
def computed(keys: Sequence[str]) -> Fixed: ...
def mixed(keys: Sequence[str]) -> Fixed: ...
def unknown(attrs: dict[str, Attribute[object]]) -> Fixed: ...
def unknown_required(flag: bool) -> Fixed: ...
def wrong() -> Fixed: ...
def calls(flag: bool) -> None: ...
def required_with_unknown_flags(flags: Sequence[str]) -> None: ...
"#
                .into(),
                1,
            )
            .unwrap();
        analysis.set_type_interfaces([(file, interface)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let findings: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| {
                let before = &source[..diagnostic.range().unwrap().start().to_usize()];
                let function = before
                    .rsplit_once("\ndef ")
                    .unwrap()
                    .1
                    .split_once('(')
                    .unwrap()
                    .0;
                (function, diagnostic.id().as_str())
            })
            .collect();
        assert_eq!(
            findings,
            [
                ("subrule_input", "unsound-return-statement"),
                ("uncertain_private", "unsound-return-statement"),
                ("late_private", "unsound-return-statement"),
                ("overclaimed", "unsound-return-statement"),
                ("required", "unsound-return-statement"),
                ("flagged", "unsound-return-statement"),
                ("unknown_flags", "unsound-return-statement"),
                ("generated", "unsound-return-statement"),
                ("dependency_resolution", "unsound-return-statement"),
                ("initialized", "unsound-return-statement"),
                ("inherited", "unsound-return-statement"),
                ("mixed", "unsound-return-statement"),
                ("unknown", "unsound-return-statement"),
                ("unknown_required", "unsound-return-statement"),
                ("wrong", "invalid-return-type"),
                ("calls", "invalid-argument-type"),
                ("calls", "missing-argument"),
                ("required_with_unknown_flags", "missing-argument"),
            ]
        );
    }

    #[test]
    fn loaded_fresh_attribute_dictionaries_preserve_descriptor_facts() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let source = fixture.add_file(
            &mut analysis.db,
            "attributes.bzl",
            r#"
def _required():
    return {"_dep": attr.label(default = "//:dep")}
helpers = struct(required = _required)
"#,
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "attributes.bzli",
            "def _required() -> dict[{\"_dep\": Attribute[Target]}]: ...\n",
        );
        let caller = fixture.add_file(
            &mut analysis.db,
            "caller.bzl",
            r#"
load("attributes.bzl", "helpers")
def _impl(ctx):
    return [DefaultInfo()]
generated = rule(
    implementation = _impl,
    attrs = helpers.required() | {"value": attr.string(mandatory = True)},
)
generated(name = "ok", value = "ok")
generated(name = "typo", value = "ok", invented = True)
generated(name = "bad", value = 42)
"#,
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect::<Vec<_>>(),
            ["unknown-argument", "invalid-argument-type"],
            "{diagnostics:?}"
        );
        analysis.update_file(
            source,
            "def _required():\n    return {\"_dep\": attr.string(default = \"wrong type\")}\nhelpers = struct(required = _required)\n".to_owned(),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect::<Vec<_>>(),
            ["invalid-argument-type"],
            "{diagnostics:?}"
        );
        analysis.update_file(
            source,
            r#"
def _required():
    attrs = {"_dep": attr.label(default = "//:dep")}
    return attrs
helpers = struct(required = _required)
"#
            .to_owned(),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect::<Vec<_>>(),
            ["invalid-argument-type"],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn loaded_fresh_attribute_merges_have_independent_mutations() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let source = fixture.add_file(
            &mut analysis.db,
            "attributes.bzl",
            r#"
def _attributes():
    return {"value": attr.string(mandatory = True)}
def _nested():
    return {"nested": {"value": "initial"}}
helpers = struct(attributes = _attributes, nested = _nested)
"#,
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "attributes.bzli",
            r#"
def _attributes() -> dict[{"value": Attribute[str]}]: ...
def _nested() -> dict[{"nested": object}]: ...
"#,
        );
        let caller = fixture.add_file(
            &mut analysis.db,
            "caller.bzl",
            r#"
load("attributes.bzl", "helpers")
def implementation(ctx):
    return []
first = helpers.attributes() | {}
first["value"] = attr.string()
optional = rule(implementation, attrs = first)
required = rule(implementation, attrs = helpers.attributes() | {})
optional(name = "valid")
required(name = "missing")
required(name = "valid", value = "present")
def consume_int(value):
    # type: (int) -> None
    pass
first_nested = struct(**(helpers.nested() | {}))
first_nested.nested.clear()
second_nested = struct(**(helpers.nested() | {}))
consume_int(second_nested.nested["value"])
"#,
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect::<Vec<_>>(),
            ["missing-argument", "invalid-argument-type"],
            "{diagnostics:?}"
        );
        assert!(
            diagnostics[1].concise_message().to_string().contains("str"),
            "{:?}",
            diagnostics[1]
        );
    }

    #[test]
    fn bundled_metadata_uses_recursive_native_declarations() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = r#"label = Label("//pkg:target")
relative = label.relative(":other")
name = json.encode(None)
computed = getattr(struct(field='value'), name)
called = computed.upper()
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let snapshot = analysis.snapshot();
        let db = &snapshot.db;
        let file = db.starlark_program_file(file);
        let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
        let model = SemanticModel::new(db, file);
        let types: Vec<_> = parsed
            .suite()
            .iter()
            .map(|statement| {
                let Stmt::Assign(assignment) = statement else {
                    panic!("expected assignment")
                };
                assignment.value.inferred_type(&model).unwrap()
            })
            .collect();
        let [label, relative, name, computed, called] = types.as_slice() else {
            panic!("expected five assignments")
        };
        assert_eq!(label, relative);
        let environment = model.program_environment();
        assert_eq!(
            *name,
            ty_python_semantic::types::KnownClass::Str.to_instance(db, &environment)
        );
        assert_eq!(computed.string_literal_value(db), Some("value"));
        assert_eq!(called, name);
        assert_eq!(
            label.display(db, &model.program_environment()).to_string(),
            "Label"
        );
        let diagnostics = ty_python_semantic::check_file_unwrap(db, file);
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn json_decode_displays_its_result_domain() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let source = "decoded = json.decode('{}')\ndecoded\n";
        let file = analysis
            .open_document(
                Path::new("/decode.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let hover = analysis
            .snapshot()
            .hover(FilePosition {
                file_id: file,
                pos: u32::try_from(source.rfind("decoded").unwrap())
                    .unwrap()
                    .into(),
            })
            .unwrap()
            .unwrap();
        assert!(
            hover.contents.value.contains("Any & int"),
            "{}",
            hover.contents.value
        );
    }

    #[test]
    fn json_decode_respects_result_policy() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let source = r#"def nested_keys(contents: str) -> list[str]:
    decoded = json.decode(contents)
    if type(decoded) != "dict":
        return []
    assets = decoded["assets"]
    if type(assets) != "dict":
        return []
    entry = assets["entry"]
    if type(entry) != "dict":
        return []
    return sorted(entry.keys())
"#;
        let file = analysis
            .open_document(
                Path::new("/nested_json.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (source, expected) in [
            (
                source.replace("-> list[str]", "-> list[int]"),
                "invalid-return-type",
            ),
            (
                r#"def require_text(value: str) -> None:
    pass
def fallback(contents: str, default: dict[int, str]) -> None:
    decoded = json.decode(contents, default)
    if type(decoded) == "dict":
        for key in decoded.keys():
            require_text(key)
"#
                .into(),
                "invalid-argument-type",
            ),
        ] {
            analysis.update_file(file, source.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{source}: {diagnostics:?}");
            };
            assert_eq!(
                diagnostic.id().as_str(),
                expected,
                "{source}: {diagnostic:?}"
            );
        }
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[
                    ("non-static-type".into(), "error".into()),
                    ("unsound-return-statement".into(), "error".into()),
                ]
                .into(),
            )
            .unwrap(),
        );
        analysis.update_file(file, "json.decode('{}')\n".into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "non-static-type");
        analysis.set_static_json_decode(true);
        analysis.update_file(
            file,
            r#"def decoded_object(contents: str) -> dict[str, object]:
    decoder = json.decode
    decoded = decoder(contents)
    if type(decoded) != "dict":
        fail("expected object")
    decoded["new"] = struct(value = "new")
    return decoded
def decoded_list(contents: str) -> None:
    decoded = json.decode(contents)
    if type(decoded) == "list":
        decoded.append(struct(value = "new"))
"#
            .into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_static_json_decode(false);
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "non-static-type"),
            "{diagnostics:?}"
        );
        analysis.set_static_json_decode(true);
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (source, expected) in [
            (
                "def unsafe(contents: str) -> str:\n    return json.decode(contents).upper()\n",
                "unresolved-attribute",
            ),
            (
                "def fallback(contents: str, default: dict[int, object]) -> dict[str, object]:\n    decoded = json.decode(contents, default)\n    if type(decoded) != 'dict':\n        fail('expected object')\n    return decoded\n",
                "invalid-return-type",
            ),
        ] {
            analysis.update_file(file, source.into());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| diagnostic.id().as_str() == expected),
                "{source}: {diagnostics:?}"
            );
        }
        let source = "def gradual(contents: str, fallback: Any) -> object:\n    decoded = json.decode(contents, fallback)\n    return decoded\n";
        analysis.update_file(file, source.into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            diagnostics.iter().any(|diagnostic| {
                diagnostic.id().as_str() == "non-static-type"
                    && diagnostic
                        .range()
                        .is_some_and(|range| &source[range] == "json.decode(contents, fallback)")
            }),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn json_decode_preserves_catalog_consumers() {
        let source = r#"
def catalog(contents):
    tools = json.decode(contents)
    for name, metadata in tools.items():
        name.removeprefix("tool_")
        metadata["version"].split(".")
        for platform, binary in sorted(metadata["platforms"].items()):
            platform.startswith("linux_")
            binary["files"][0].upper()
    for image in tools["images"]:
        image.get("digest", "")

json.decode("{}", None)
json.decode("{}", default=struct(value="fallback"))
"#;
        for (source, errors) in [
            (source, false),
            ("json.decode(x='{}')", true),
            ("json.decode(1)", true),
            ("json.decode()", true),
        ] {
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(
                    starpls_bazel::decode_builtins(include_bytes!(
                        "../../../starpls/src/builtin/builtin.pb"
                    ))
                    .unwrap(),
                    Default::default(),
                )
                .unwrap();
            let file = analysis
                .open_document(
                    Path::new("/catalog.bzl"),
                    Dialect::Bazel,
                    None,
                    source.to_owned(),
                    1,
                )
                .unwrap();
            let snapshot = analysis.snapshot();
            let db = &snapshot.db;
            let file = db.starlark_program_file(file);
            let diagnostics = ty_python_semantic::check_file_unwrap(db, file);
            assert_eq!(!diagnostics.is_empty(), errors, "{source}: {diagnostics:?}");
        }
    }

    #[test]
    fn apple_platform_namespace_has_typed_members() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let original_builtins = builtins.clone();
        env::apply_versioned_signatures(&mut builtins, "release 9.2.0");
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[
                    ("non-static-type".into(), "error".into()),
                    ("unsound-return-statement".into(), "error".into()),
                ]
                .into_iter()
                .collect(),
            )
            .unwrap(),
        );
        let source = r#"
def platform() -> apple_platform:
    return apple_common.platform.ios_device

platforms: list[apple_platform] = [
    apple_common.platform.ios_device,
    apple_common.platform.ios_simulator,
    apple_common.platform.macos,
    apple_common.platform.tvos_device,
    apple_common.platform.tvos_simulator,
    apple_common.platform.visionos_device,
    apple_common.platform.visionos_simulator,
    apple_common.platform.watchos_device,
    apple_common.platform.watchos_simulator,
    apple_common.platform.catalyst,
]
name: str = apple_common.platform.ios_device.name_in_plist
ios: Literal["ios"] = apple_common.platform_type.ios
platform_types: list[str] = [
    apple_common.platform_type.ios,
    apple_common.platform_type.macos,
    apple_common.platform_type.tvos,
    apple_common.platform_type.visionos,
    apple_common.platform_type.watchos,
    apple_common.platform_type.catalyst,
]

def minimum(config: XcodeVersionConfig, platform: apple_platform) -> DottedVersion:
    value: apple_platform_type = platform.platform_type
    config.minimum_os_for_platform_type("ios")
    return config.minimum_os_for_platform_type(value)
"#;
        let file = analysis
            .open_document(
                Path::new("/platforms.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            file,
            r#"wrong: str = apple_common.platform.ios_device
apple_common.platform.ios_simualtor
wrong_platform: apple_platform = apple_common.platform_type.ios
apple_common.platform_type.ios = "watchos"
apple_common.platform_type.unknown
def invalid(config: XcodeVersionConfig, value: str) -> None:
    config.minimum_os_for_platform_type(value)
    config.minimum_os_for_platform_type("linux")
"#
            .into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(
            ids,
            [
                "invalid-assignment",
                "unresolved-attribute",
                "invalid-assignment",
                "invalid-assignment",
                "unresolved-attribute",
                "invalid-argument-type",
                "invalid-argument-type"
            ]
        );
        let mut old_builtins = original_builtins;
        env::apply_versioned_signatures(&mut old_builtins, "release 7.6.0");
        analysis
            .set_builtin_defs(old_builtins, Default::default())
            .unwrap();
        analysis.update_file(
            file,
            r#"def minimum(config: XcodeVersionConfig, platform: apple_platform) -> DottedVersion:
    config.minimum_os_for_platform_type("ios")
    return config.minimum_os_for_platform_type(platform.platform_type)
name: str = str(apple_common.platform_type.ios)
wrong: str = apple_common.platform_type.ios
"#
            .into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["invalid-assignment", "invalid-argument-type"]);
    }

    #[test]
    fn xcode_provider_preserves_execution_and_environment_types() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("unsound-return-statement".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"
def selected(target: Target) -> XcodeVersionConfig:
    return target[apple_common.XcodeVersionConfig]

def execution(config: XcodeVersionConfig) -> dict[str, str]:
    return config.execution_info()

def host(config: XcodeVersionConfig | None) -> dict[str, str]:
    return apple_common.apple_host_system_env(config)

def target(config: XcodeVersionConfig, platform: apple_platform) -> dict[str, str]:
    return apple_common.target_apple_env(config, platform)

def version(config: XcodeVersionConfig) -> DottedVersion | str | None:
    return config.xcode_version()

def sdk(config: XcodeVersionConfig, platform: apple_platform) -> DottedVersion:
    return config.sdk_version_for_platform(platform)
"#;
        let file = analysis
            .open_document(
                Path::new("/xcode.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            file,
            "def invalid(config: XcodeVersionConfig) -> int:\n    config.execution_info = lambda: {}\n    apple_common.target_apple_env(config, 'ios')\n    return config.execution_info()\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(
            ids,
            [
                "invalid-assignment",
                "invalid-argument-type",
                "invalid-return-type"
            ]
        );
    }

    #[test]
    fn configuration_fragments_use_exported_member_types() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = r#"
def flags(ctx: ctx):
    ctx.fragments.cpp.copts + ctx.fragments.cpp.conlyopts + ctx.fragments.cpp.cxxopts + ctx.fragments.cpp.linkopts
    ctx.fragments.cpp.no_such_option
    ctx.fragments.no_such_fragment
    ctx.fragments.cpp.apple_generate_dsym + 1

example = rule(implementation = flags, fragments = ["cpp"])

def platform_labels(ctx: ctx) -> tuple[Label, Label]:
    return ctx.fragments.platform.platform, ctx.fragments.platform.host_platform

def platform_impl(ctx: ctx):
    platform_labels(ctx)
    ctx.fragments.platform.no_such_member
    return []

universal = rule(implementation = platform_impl)

def invalid_platform(ctx: ctx) -> str:
    return ctx.fragments.platform.platform
"#;
        let file = analysis
            .open_document(
                Path::new("/fragments.bzl"),
                Dialect::Bazel,
                Some(FileInfo::Bazel {
                    api_context: APIContext::Bzl,
                    is_external: false,
                }),
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 5, "{diagnostics:?}");
        for (diagnostic, (expected_id, expected_source)) in diagnostics.iter().zip([
            ("unresolved-attribute", "ctx.fragments.cpp.no_such_option"),
            ("unresolved-attribute", "ctx.fragments.no_such_fragment"),
            (
                "unsupported-operator",
                "ctx.fragments.cpp.apple_generate_dsym + 1",
            ),
            (
                "unresolved-attribute",
                "ctx.fragments.platform.no_such_member",
            ),
            ("invalid-return-type", "ctx.fragments.platform.platform"),
        ]) {
            assert_eq!(diagnostic.id().as_str(), expected_id);
            let range = diagnostic.range().unwrap();
            assert_eq!(&source[range], expected_source);
        }
    }

    #[test]
    fn legacy_globals_preserve_macro_fallback() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = r#"
features = struct(macro = getattr(getattr(native, "legacy_globals", None), "macro", macro))
def implementation(name, visibility, enabled = None):
    pass
example = features.macro(implementation = implementation, attrs = {"enabled": attr.bool()})
source_alias = implementation
masked = features.macro(implementation = source_alias, attrs = {"enabled": None})
def invalid_implementation(name, visibility) -> int:
    return 42
invalid_callback = features.macro(implementation = invalid_implementation)
invalid_builtin = features.macro(implementation = print)
invalid_macro = features.macro(implementation = example)
def rule_implementation(ctx):
    return []
rule_symbol = rule(implementation = rule_implementation)
invalid_rule = features.macro(implementation = rule_symbol)
invalid_attrs = features.macro(implementation = implementation, attrs = {"enabled": 42})
def invalid_access():
    native.legacy_globals.macro
    attr.bool(default = "wrong")
def use_example():
    example(name = "valid", enabled = True)
    example(name = "invalid", enabled = "wrong")
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                Some(FileInfo::Bazel {
                    api_context: APIContext::Bzl,
                    is_external: false,
                }),
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 7, "{diagnostics:?}");
        for (diagnostic, expected) in diagnostics.iter().zip([
            "implementation = invalid_implementation",
            "implementation = print",
            "implementation = example",
            "implementation = rule_symbol",
            "attrs = {\"enabled\": 42}",
            "default = \"wrong\"",
            "enabled = \"wrong\"",
        ]) {
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            let range = diagnostic.range().unwrap();
            assert_eq!(&source[range], expected);
        }
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        analysis.update_file(
            file,
            "def implementation(name: str, visibility: list[str]) -> None:\n    pass\nfeatures = struct(macro = macro)\nmasked = macro(implementation = implementation, attrs = {\"enabled\": None})\n".to_owned(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn registrations_check_native_inputs() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = r#"
def implementation(ctx, _dep, _deps):
    return 42
valid = subrule(
    implementation = implementation,
    attrs = {"_dep": attr.label(default = "//:dep"), "_deps": attr.label_list(default = ["//:dep"])},
    toolchains = [config_common.toolchain_type("//:toolchain")],
)
invalid_callback = subrule(implementation = print)
invalid_attrs = subrule(implementation = implementation, attrs = {"_enabled": attr.bool(default = True)})
invalid_toolchain = subrule(implementation = implementation, toolchains = [42])
def rule_implementation(ctx):
    return []
def aspect_implementation(target, ctx):
    return []
valid_rule = rule(implementation = rule_implementation, toolchains = ["//:one", Label("//:two"), config_common.toolchain_type("//:three")])
valid_aspect = aspect(implementation = aspect_implementation, toolchains = (Label("//:one"),))
empty_rule = rule(implementation = rule_implementation, toolchains = [])
invalid_rule = rule(implementation = rule_implementation, toolchains = [42])
invalid_aspect = aspect(implementation = aspect_implementation, toolchains = [42])
invalid_sequence = aspect(implementation = aspect_implementation, toolchains = "//:one")
"#;
        let file = analysis
            .open_document(
                Path::new("/subrule.bzl"),
                Dialect::Bazel,
                Some(FileInfo::Bazel {
                    api_context: APIContext::Bzl,
                    is_external: false,
                }),
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 6, "{diagnostics:?}");
        for (diagnostic, expected) in diagnostics.iter().zip([
            "implementation = print",
            "attrs = {\"_enabled\": attr.bool(default = True)}",
            "toolchains = [42]",
            "toolchains = [42]",
            "toolchains = [42]",
            "toolchains = \"//:one\"",
        ]) {
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            assert_eq!(&source[diagnostic.range().unwrap()], expected);
        }
    }

    #[test]
    fn legacy_globals_preserve_optional_types() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        let source = r#"py = native.legacy_globals.PyInfo
runtime = native.legacy_globals.PyRuntimeInfo
proto_aspect = native.legacy_globals.cc_proto_aspect
direct_aspect = aspect(implementation = lambda target, ctx: [])
nested_py = getattr(getattr(native, "legacy_globals", None), "PyInfo", None)
nested_runtime = getattr(getattr(native, "legacy_globals", None), "PyRuntimeInfo", None)
nested_proto_aspect = getattr(getattr(native, "legacy_globals", None), "cc_proto_aspect", None)
direct_default = getattr(native.legacy_globals, "PyInfo", None)
cc = native.legacy_globals.CcInfo
java = native.legacy_globals.JavaInfo
plugin = native.legacy_globals.JavaPluginInfo
proto = native.legacy_globals.ProtoInfo
shared = native.legacy_globals.CcSharedLibraryInfo
hint = native.legacy_globals.CcSharedLibraryHintInfo
nested_java = getattr(getattr(native, "legacy_globals", None), "JavaInfo", None)
java_default = getattr(getattr(native, "legacy_globals", None), "JavaInfo", 42)
other_default = getattr(native.legacy_globals, "CcInfo", None)
computed_name = json.encode(None)
computed = getattr(native.legacy_globals, computed_name, None)
no_default = getattr(native.legacy_globals, "PyInfo")
missing = getattr(native.legacy_globals, "missing", False)
native_rule = getattr(native.legacy_globals, "sh_binary", False)
nested_missing = getattr(getattr(native, "legacy_globals", None), "missing", False)
def use_keys(target: Target, files: depset[File]) -> str:
    py(transitive_sources = files).transitive_sources
    runtime(python_version = "PY3", interpreter_path = "/usr/bin/python3").python_version
    target[py].transitive_sources
    return target[runtime].python_version
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                Some(FileInfo::Bazel {
                    api_context: APIContext::Bzl,
                    is_external: false,
                }),
                source.to_owned(),
                1,
            )
            .unwrap();
        let snapshot = analysis.snapshot();
        let db = &snapshot.db;
        let program = db.starlark_program_file(file);
        let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
        let model = SemanticModel::new(db, program);
        let environment = model.program_environment();
        let types: Vec<_> = parsed
            .suite()
            .iter()
            .filter_map(Stmt::as_assign_stmt)
            .map(|assignment| assignment.value.inferred_type(&model).unwrap())
            .collect();
        let [py, runtime, proto_aspect, direct_aspect, nested_py, nested_runtime, nested_proto_aspect, direct_default, cc, java, plugin, proto, shared, hint, nested_java, java_default, other_default, _name, computed, no_default, missing, native_rule, nested_missing] =
            types.as_slice()
        else {
            panic!("expected the legacy member observations: {types:?}");
        };
        assert_ne!(py, runtime);
        assert_eq!(proto_aspect, direct_aspect);
        assert!(proto_aspect.is_fully_static(db, &environment));
        let original_keys = [java, plugin, proto, shared, hint];
        for (index, key) in original_keys.iter().enumerate() {
            assert!(key.is_fully_static(db, &environment));
            assert!(original_keys[..index].iter().all(|other| *other != *key));
        }
        for (member, actual) in [
            (py, nested_py),
            (runtime, nested_runtime),
            (proto_aspect, nested_proto_aspect),
            (py, direct_default),
            (java, nested_java),
        ] {
            assert_eq!(
                *actual,
                UnionType::from_two_elements(
                    db,
                    &environment,
                    *member,
                    TyType::none(db, &environment)
                )
            );
        }
        let gradual = TyType::Dynamic(DynamicType::Any);
        for actual in [cc, no_default] {
            assert_eq!(*actual, gradual);
        }
        let optional_gradual =
            UnionType::from_two_elements(db, &environment, gradual, TyType::none(db, &environment));
        for actual in [other_default, computed] {
            assert_eq!(*actual, optional_gradual);
        }
        assert_eq!(
            *java_default,
            UnionType::from_two_elements(db, &environment, *java, TyType::int_literal(42))
        );
        for actual in [missing, native_rule, nested_missing] {
            assert_eq!(*actual, TyType::bool_literal(false));
        }
        let diagnostics = snapshot.diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        drop(snapshot);

        analysis.update_file(
            file,
            format!("{source}\npy(transitive_sources = 42)\nruntime(python_version = False)\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(
            diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"),
            "{diagnostics:?}"
        );

        // Optional getter results cannot establish a required property.
        let DeclarationSource { path, mut contents } =
            generate(Dialect::Bazel, &builtins, &BuildLanguage::default()).unwrap();
        contents.push_str(
            r#"
class _RequiredPy(_starpls_typing.Protocol):
    @_starpls_builtins.property
    def PyInfo(self) -> _starpls_types.ProviderKey: ...
class _RequiredRuntime(_starpls_typing.Protocol):
    @_starpls_builtins.property
    def PyRuntimeInfo(self) -> _starpls_types.ProviderKey: ...
def inspect_legacy(bridge: _starpls_types._LegacyGlobals, py: _RequiredPy, runtime: _RequiredRuntime):
    bridge
    py
    runtime
"#,
        );
        analysis
            .db
            .source_system_mut()
            .set_virtual_source(&path, contents);
        let file = analysis.db.files.try_virtual_file(&path).unwrap();
        file.sync(&mut analysis.db);
        let db = &analysis.db;
        let program = ty_python_semantic::Db::program_file(db, file.file());
        let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
        let model = SemanticModel::new(db, program);
        let function = parsed
            .suite()
            .iter()
            .filter_map(Stmt::as_function_def_stmt)
            .find(|function| function.name.as_str() == "inspect_legacy")
            .unwrap();
        let types: Vec<_> = function
            .body
            .iter()
            .filter_map(Stmt::as_expr_stmt)
            .map(|statement| statement.value.inferred_type(&model).unwrap())
            .collect();
        let [bridge, py, runtime] = types.as_slice() else {
            panic!("expected bridge and required property types: {types:?}");
        };
        for required in [py, runtime] {
            assert!(!bridge.is_assignable_to(db, &model.program_environment(), *required));
        }
    }

    #[test]
    fn legacy_provider_keys_keep_identity_without_inventing_schemas() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def inspect(target: Target, condition: bool) -> None:
    key = native.legacy_globals.JavaInfo
    other = native.legacy_globals.JavaPluginInfo
    present = key in target
    instance = target[key]
    other_instance = target[other]
    constructed = key(unverified = 42)
    field = instance.unverified
    wrong: str = instance
    key()
    selected = key if condition else other
    selected(unverified = 42)
    renamed = selected
    renamed()
def inspect_intersection(composite: Intersection[ProviderKey, Callable[..., ProviderInstance]]) -> None:
    composite()
"#;
        let file = analysis
            .open_document(
                Path::new("/legacy.bzl"),
                Dialect::Bazel,
                Some(FileInfo::Bazel {
                    api_context: APIContext::Bzl,
                    is_external: false,
                }),
                source.to_owned(),
                1,
            )
            .unwrap();
        let snapshot = analysis.snapshot();
        let db = &snapshot.db;
        let program = db.starlark_program_file(file);
        let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
        let model = SemanticModel::new(db, program);
        let function = parsed.suite()[0].as_function_def_stmt().unwrap();
        let types: Vec<_> = function
            .body
            .iter()
            .filter_map(Stmt::as_assign_stmt)
            .map(|assignment| assignment.value.inferred_type(&model).unwrap())
            .collect();
        let [key, other, _present, instance, other_instance, constructed, field, _selected, _renamed] =
            types.as_slice()
        else {
            panic!("unexpected observations: {types:?}");
        };
        let environment = model.program_environment();
        assert!(!key.is_assignable_to(db, &environment, *other));
        assert!(!instance.is_assignable_to(db, &environment, *other_instance));
        assert_eq!(instance, constructed);
        assert!(!field.is_fully_static(db, &environment));
        let diagnostics = snapshot.diagnostics(file).unwrap();
        for call in [
            "key(unverified",
            "key()",
            "selected(unverified",
            "renamed()",
            "composite()",
        ] {
            let offset = source.find(call).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| {
                    diagnostic.id().as_str() == "non-static-type"
                        && diagnostic
                            .range()
                            .is_some_and(|range| range.start().to_usize() == offset)
                }),
                "{call}: {diagnostics:?}"
            );
        }
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-assignment"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn legacy_python_linking_provider_preserves_its_constructor_and_identity() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = r#"def use_key(target: Target, info: CcInfo) -> list[CcInfo]:
    key = native.legacy_globals.PyCcLinkParamsProvider
    positional: CcInfo = key(info).cc_info
    structural: CcInfo = key(cc_info = struct(linking_context = None)).cc_info
    return [positional, structural, target[key].cc_info]
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for (call, expected) in [
            ("key(42)", "invalid-argument-type"),
            (
                "key(cc_info = struct(linking_context = 42))",
                "invalid-argument-type",
            ),
            ("key()", "missing-argument"),
        ] {
            analysis.update_file(
                file,
                format!("{source}\nkey = native.legacy_globals.PyCcLinkParamsProvider\n{call}\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{call}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), expected, "{call}");
        }
    }

    #[test]
    fn legacy_python_provider_prefers_host_inventory() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        builtins.r#type.push(Type {
            name: "PyInfo".into(),
            field: vec![Value {
                name: "token".into(),
                r#type: "string".into(),
                ..Default::default()
            }],
            ..Default::default()
        });
        builtins.global.push(Value {
            name: "PyInfo".into(),
            callable: Some(Callable {
                param: vec![Param {
                    name: "token".into(),
                    r#type: "string".into(),
                    is_mandatory: true,
                    ..Default::default()
                }],
                return_type: "PyInfo".into(),
            }),
            ..Default::default()
        });
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                "def inspect() -> str:\n    return native.legacy_globals.PyInfo(token = 'present').token\n".into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        let py_info = builtins.global.last_mut().unwrap();
        py_info.callable = None;
        py_info.r#type = "Provider".into();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.update_file(
            file,
            "def inspect(target: Target) -> str:\n    return target[native.legacy_globals.PyInfo].token\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        let partial = Builtins {
            r#type: vec![Type {
                name: "native".into(),
                ..Default::default()
            }],
            global: vec![Value {
                name: "native".into(),
                r#type: "native".into(),
                ..Default::default()
            }],
        };
        analysis
            .set_builtin_defs(partial, Default::default())
            .unwrap();
        analysis.update_file(file, "native.legacy_globals.PyInfo()\n".into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn native_rules_use_available_contracts() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let live = RuleDefinition {
            name: "sh_binary".to_owned(),
            attribute: vec![
                AttributeDefinition {
                    name: "name".to_owned(),
                    r#type: Discriminator::String as i32,
                    ..Default::default()
                },
                AttributeDefinition {
                    name: "srcs".to_owned(),
                    r#type: Discriminator::LabelList as i32,
                    ..Default::default()
                },
                AttributeDefinition {
                    name: "use_bash_launcher".to_owned(),
                    r#type: Discriminator::Boolean as i32,
                    ..Default::default()
                },
            ],
            ..Default::default()
        };
        let placeholder = RuleDefinition {
            name: "sh_binary".to_owned(),
            attribute: vec![AttributeDefinition {
                name: "$bzl_load_label".to_owned(),
                r#type: Discriminator::String as i32,
                ..Default::default()
            }],
            ..Default::default()
        };
        let unrelated = RuleDefinition {
            name: "filegroup".to_owned(),
            ..Default::default()
        };
        for (rules, precise) in [
            (vec![], false),
            (vec![unrelated], false),
            (vec![placeholder], false),
            (vec![live], true),
        ] {
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins.clone(), BuildLanguage { rule: rules })
                .unwrap();
            let native_source = r#"def macro_impl(**kwargs):
    pass
selected = native.sh_binary
selected(name="shell", srcs=["//:input"], use_bash_launcher=True)
macro(implementation=macro_impl, inherit_attrs=selected)
native.package_name()
"#;
            let build_source = r#"selected = sh_binary
selected(name="global", srcs=["//:input"], use_bash_launcher=True)
"#;
            let getter_source = r#"def fallback_rule(**kwargs):
    pass
selected = getattr(native, "sh_binary", fallback_rule)
selected(name="shell", srcs=["//:input"], use_bash_launcher=True)
"#;
            for (path, source, callee, context) in [
                (
                    "/main.bzl",
                    native_source,
                    "native.sh_binary",
                    APIContext::Bzl,
                ),
                ("/BUILD.bazel", build_source, "sh_binary", APIContext::Build),
                ("/getter.bzl", getter_source, "selected", APIContext::Bzl),
            ] {
                let info = Some(FileInfo::Bazel {
                    api_context: context,
                    is_external: false,
                });
                let file = analysis
                    .open_document(Path::new(path), Dialect::Bazel, info, source.to_owned(), 1)
                    .unwrap();
                assert_eq!(file.api_context(), Some(context));
                let snapshot = analysis.snapshot();
                let db = &snapshot.db;
                let python_file = db.starlark_program_file(file);
                let parsed =
                    ruff_db::parsed::parsed_module(db, python_file.python_file(db)).load(db);
                let model = SemanticModel::new(db, python_file);
                let env = model.program_environment();
                let types: Vec<_> = parsed
                    .suite()
                    .iter()
                    .filter_map(|statement| {
                        let Stmt::Assign(assignment) = statement else {
                            return None;
                        };
                        let ruff_python_ast::StmtAssign {
                            range: _,
                            node_index: _,
                            targets: _,
                            value,
                        } = assignment;
                        value.inferred_type(&model)
                    })
                    .collect();
                let [selected] = types.as_slice() else {
                    panic!("expected the selected rule value: {types:?}")
                };
                if path == "/getter.bzl" && !precise {
                    let fallback = parsed
                        .suite()
                        .iter()
                        .find_map(Stmt::as_function_def_stmt)
                        .unwrap()
                        .inferred_type(&model)
                        .unwrap();
                    assert_eq!(
                        *selected,
                        UnionType::from_two_elements(
                            db,
                            &env,
                            TyType::Dynamic(DynamicType::Any),
                            fallback,
                        )
                    );
                } else if path != "/getter.bzl" {
                    assert_eq!(
                        selected.display(db, &env).to_string(),
                        if precise { "sh_binary" } else { "Any" },
                        "{path}"
                    );
                }
                let diagnostics = snapshot.diagnostics(file).unwrap();
                assert!(
                    diagnostics.is_empty(),
                    "{path}, precise={precise}: {diagnostics:?}"
                );
                drop(snapshot);
                let mut invalid_calls = Vec::new();
                if path == "/main.bzl" {
                    invalid_calls.push((
                        "native.package_name(1)\n".to_owned(),
                        "too-many-positional-arguments",
                    ));
                }
                if precise {
                    invalid_calls.push((format!("{callee}(srcs=[1])\n"), "invalid-argument-type"));
                }
                for (invalid, expected) in invalid_calls {
                    analysis
                        .open_document(
                            Path::new(path),
                            Dialect::Bazel,
                            info,
                            format!("{source}{invalid}"),
                            2,
                        )
                        .unwrap();
                    let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                    let [diagnostic] = diagnostics.as_slice() else {
                        panic!("{invalid}: {diagnostics:?}");
                    };
                    assert_eq!(diagnostic.id().as_str(), expected);
                    assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
                }
            }
        }
    }

    #[test]
    fn package_queries_return_mutable_lists_of_strings() {
        for (path, query) in [
            ("/main.bzl", "native.glob(['*.rs'])"),
            ("/BUILD.bazel", "glob(['*.rs'])"),
            ("/main.bzl", "native.subpackages(include=['**'])"),
            ("/BUILD.bazel", "subpackages(include=['**'])"),
        ] {
            let builtins = starpls_bazel::decode_builtins(include_bytes!(
                "../../../starpls/src/builtin/builtin.pb"
            ))
            .unwrap();
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let source = format!(
                "files = {query}\ncombined = files + [\"extra.rs\"]\nfiles.append(\"other.rs\")\nfiles.append(1)\n"
            );
            let invalid = u32::try_from(source.rfind('1').unwrap()).unwrap();
            let file = analysis
                .open_document(Path::new(path), Dialect::Bazel, None, source, 1)
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{query}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
            assert_eq!(
                diagnostics[0].range().unwrap(),
                ruff_text_size::TextRange::new(invalid.into(), (invalid + 1).into()),
            );
        }
    }

    #[test]
    fn existing_rule_queries_return_readonly_views() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        let source = r#"def inspect() -> tuple[str, str, int, object] | None:
    rule = native.existing_rule("target")
    if rule == None:
        return None
    return (rule.keys()[0], rule.items()[0][0], len(rule), rule.get(42, default="missing"))

def inspect_all() -> str:
    rule = native.existing_rules().get("target")
    return rule.keys()[0] if rule != None else "missing"
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for (invalid, expected) in [
            ("native.existing_rule(42)", "invalid-argument-type"),
            ("native.existing_rules().clear()", "unresolved-attribute"),
            ("native.existing_rules().get([])", "invalid-argument-type"),
            ("[] in native.existing_rules()", "unsupported-operator"),
            ("native.existing_rules()[42]", "invalid-argument-type"),
            (
                "native.existing_rules()[\"target\"].keys().append(\"extra\")",
                "unresolved-attribute",
            ),
        ] {
            analysis.update_file(file, format!("{source}\n{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), expected, "{invalid}");
        }

        let build = analysis
            .open_document(
                Path::new("/BUILD.bazel"),
                Dialect::Bazel,
                None,
                "existing_rules()[\"target\"].keys().append(\"extra\")\n".to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(build).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "unresolved-attribute");

        let native = builtins
            .r#type
            .iter_mut()
            .find(|ty| ty.name == "native")
            .unwrap();
        let existing = native
            .field
            .iter_mut()
            .find(|field| field.name == "existing_rules")
            .unwrap();
        existing.callable.as_mut().unwrap().return_type = "string".to_owned();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.update_file(
            file,
            "def inspect() -> str:\n    return native.existing_rules()\n".to_owned(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn existing_rule_identity_requires_immutable_views() {
        let source = r#"def name() -> str | None:
    rule = native.existing_rule("target")
    return rule.get("name", default=42) if rule != None else None

def kind() -> str:
    return native.existing_rules()["name"]["kind"]

def tags() -> tuple[str, ...] | None:
    rule = native.existing_rule("target")
    return rule.get("tags", default=42) if rule != None else None

def all_tags() -> tuple[str, ...]:
    return native.existing_rules()["target"]["tags"]

def mutable_tags() -> list[str]:
    return native.existing_rules()["target"]["tags"]

def other() -> str:
    return native.existing_rules()["target"]["srcs"]
"#;
        let cases: [(&str, &[&str]); 3] = [
            (
                "release 7.4.1",
                &["name", "kind", "tags", "all_tags", "mutable_tags", "other"],
            ),
            (
                "release 8.0.0",
                &["tags", "all_tags", "mutable_tags", "other"],
            ),
            ("release 9.0.0", &["mutable_tags", "other"]),
        ];
        for (release, expected) in cases {
            let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
                "../../../starpls/src/builtin/builtin.pb"
            ))
            .unwrap();
            env::apply_versioned_signatures(&mut builtins, release);
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let file = analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    source.to_owned(),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let failed_functions: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| {
                    assert_eq!(diagnostic.id().as_str(), "invalid-return-type");
                    source[..usize::from(diagnostic.range().unwrap().start())]
                        .lines()
                        .rev()
                        .find_map(|line| {
                            line.strip_prefix("def ")?
                                .split_once('(')
                                .map(|(name, _)| name)
                        })
                        .unwrap()
                })
                .collect();
            assert_eq!(failed_functions, expected, "{release}: {diagnostics:?}");
        }
    }

    #[test]
    fn path_get_child_checks_each_component() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = "\
def inspect(value: path) -> path:
    value.get_child()
    value.get_child('a', 'b/c')
    value.get_child('a', 1)
    return value.get_child('child')
";
        let invalid = u32::try_from(source.find("1)").unwrap()).unwrap();
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
        assert_eq!(
            diagnostic.range().unwrap(),
            ruff_text_size::TextRange::new(invalid.into(), (invalid + 1).into()),
        );
    }

    #[test]
    fn path_readdir_returns_paths() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = "\
def entries(directory: path) -> list[path]:
    return directory.readdir()

def names(directory: path) -> list[str]:
    return directory.readdir()
";
        let invalid = u32::try_from(source.rfind("directory.readdir()").unwrap()).unwrap();
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-return-type");
        assert_eq!(u32::from(diagnostic.range().unwrap().start()), invalid);
    }

    #[test]
    fn getenv_preserves_absence_and_supplied_defaults() {
        for context in ["repository_ctx", "module_ctx"] {
            let builtins = starpls_bazel::decode_builtins(include_bytes!(
                "../../../starpls/src/builtin/builtin.pb"
            ))
            .unwrap();
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let source = format!(
                r#"def read(ctx: {context}, fallback: str | None):
    value = ctx.getenv("MISSING")
    if value == None:
        value = "default"
    value.upper()
    ctx.getenv("MISSING", "default").upper()
    ctx.getenv(name="MISSING", default="default").upper()
    optional = ctx.getenv("MISSING", fallback)
    if optional != None:
        optional.upper()
"#
            );
            let file = analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    source.clone(),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{context}: {diagnostics:?}");

            for call in [
                "ctx.getenv('MISSING')",
                "ctx.getenv('MISSING', None)",
                "ctx.getenv('MISSING', fallback)",
            ] {
                analysis.update_file(file, format!("{source}    {call}.upper()\n"));
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert_eq!(diagnostics.len(), 1, "{context}, {call}: {diagnostics:?}");
                assert_eq!(diagnostics[0].id().as_str(), "unresolved-attribute");
            }
        }
    }

    #[test]
    fn execute_checks_command_argument_types() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        for host in ["repository_ctx", "module_ctx"] {
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins.clone(), Default::default())
                .unwrap();
            analysis.set_rules(
                crate::DiagnosticRules::from_settings(
                    &[("non-static-type".into(), "error".into())].into(),
                )
                .unwrap(),
            );
            let source = format!(
                "def run(ctx: {host}, label: Label, location: path) -> None:\n    ctx.execute(['tool', label, location])\n    ctx.execute(('tool', label, location))\n"
            );
            let file = analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    source.clone(),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{host}: {diagnostics:?}");

            analysis.set_rules(crate::DiagnosticRules::default());
            analysis.update_file(
                file,
                format!("{source}    ctx.execute([1])\n    ctx.execute('tool')\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 2, "{host}: {diagnostics:?}");
            assert!(
                diagnostics
                    .iter()
                    .all(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"),
                "{host}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn execute_environment_follows_bazel_release() {
        let source = r#"def run(repository: repository_ctx, module: module_ctx, narrow: dict[Literal["KEY"], str], schema: dict[{"KEY": str}], wrong_key: dict[int, str], wrong_value: dict[str, int], mapping: Mapping[str, str], removed: dict[str, None], mixed: dict[str, str | None]) -> None:
    repository.execute(["tool"], environment=narrow)
    module.execute(["tool"], environment=schema)
    repository.execute(["tool"], environment=wrong_key)
    module.execute(["tool"], environment=wrong_value)
    repository.execute(["tool"], environment=mapping)
    repository.execute(["tool"], environment=removed)
    module.execute(["tool"], environment=mixed)
"#;
        for (release, expected) in [
            (
                "release 7.4.1",
                &["wrong_key", "wrong_value", "mapping", "removed", "mixed"][..],
            ),
            (
                "release 8.0.0",
                &["wrong_key", "wrong_value", "mapping"][..],
            ),
        ] {
            let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
                "../../../starpls/src/builtin/builtin.pb"
            ))
            .unwrap();
            env::apply_versioned_signatures(&mut builtins, release);
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            analysis.set_rules(
                crate::DiagnosticRules::from_settings(
                    &[("non-static-type".into(), "error".into())].into(),
                )
                .unwrap(),
            );
            let file = analysis
                .open_document(
                    Path::new("/environment.bzl"),
                    Dialect::Bazel,
                    None,
                    source.into(),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let actual = diagnostics
                .iter()
                .map(|diagnostic| {
                    assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
                    source[diagnostic.range().unwrap()]
                        .strip_prefix("environment=")
                        .unwrap()
                })
                .collect::<Vec<_>>();
            assert_eq!(actual, expected, "{release}: {diagnostics:?}");
        }
    }

    #[test]
    fn resolve_command_checks_inputs_and_result() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def check(context: ctx[object, object], file: File, label: Label, make: dict[Literal["A"], Literal["one"]], requirements: dict[Literal["B"], Literal["two"]], schema: dict[{"KEY": str}], mapping: Mapping[str, str], label_mapping: Mapping[Label, tuple[File]]) -> None:
    files, argv, manifests = context.resolve_command(make_variables=make, execution_requirements=requirements, label_dict={label: (file,)})
    files.append(file)
    argv.append("argument")
    context.resolve_command(make_variables=None, label_dict={label: {file: 1}})
    context.resolve_command(make_variables=schema, execution_requirements=schema)
    print(len(manifests))
"#;
        let file = analysis
            .open_document(
                Path::new("/command.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        analysis.set_rules(crate::DiagnosticRules::default());
        let invalid = r#"    context.resolve_command(make_variables={1: "value"})
    context.resolve_command(make_variables={"key": 1})
    context.resolve_command(execution_requirements={1: "value"})
    context.resolve_command(execution_requirements={"key": 1})
    context.resolve_command(execution_requirements=None)
    context.resolve_command(label_dict={"label": [file]})
    context.resolve_command(label_dict={label: [1]})
    context.resolve_command(make_variables=mapping)
    context.resolve_command(label_dict=label_mapping)
    files.append("not a file")
    argv.append(file)
    manifests.append(file)
"#;
        analysis.update_file(file, format!("{source}{invalid}"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let actual = diagnostics
            .iter()
            .map(|diagnostic| {
                let range = diagnostic.range().unwrap();
                let offset = usize::from(range.start()) - source.len();
                (
                    diagnostic.id().as_str(),
                    &invalid[offset..offset + usize::from(range.len())],
                )
            })
            .collect::<Vec<_>>();
        assert_eq!(
            actual,
            [
                ("invalid-argument-type", "make_variables={1: \"value\"}"),
                ("invalid-argument-type", "make_variables={\"key\": 1}"),
                (
                    "invalid-argument-type",
                    "execution_requirements={1: \"value\"}"
                ),
                (
                    "invalid-argument-type",
                    "execution_requirements={\"key\": 1}"
                ),
                ("invalid-argument-type", "execution_requirements=None"),
                ("invalid-argument-type", "label_dict={\"label\": [file]}"),
                ("invalid-argument-type", "label_dict={label: [1]}"),
                ("invalid-argument-type", "make_variables=mapping"),
                ("invalid-argument-type", "label_dict=label_mapping"),
                ("invalid-argument-type", "\"not a file\""),
                ("invalid-argument-type", "file"),
                ("unresolved-attribute", "manifests.append"),
            ],
            "{diagnostics:?}"
        );

        let method = builtins
            .r#type
            .iter_mut()
            .find(|class| class.name == "ctx")
            .unwrap()
            .field
            .iter_mut()
            .find(|field| field.name == "resolve_command")
            .unwrap()
            .callable
            .as_mut()
            .unwrap();
        for parameter in &mut method.param {
            if matches!(
                parameter.name.as_str(),
                "make_variables" | "execution_requirements" | "label_dict"
            ) {
                parameter.r#type = "int".into();
            }
        }
        method.return_type = "string".into();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.update_file(
            file,
            "def check(context: ctx[object, object]) -> str:\n    return context.resolve_command(make_variables=42, execution_requirements=42, label_dict=42)\n".to_owned(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn native_label_inputs_follow_the_host_conversion() {
        for (path, context, source, bad_calls) in [
            (
                "/BUILD.bazel",
                APIContext::Build,
                r#"labels = ['//visibility:public']
package(default_visibility=labels, default_package_metadata=[Label('//:license')])
example(name='first', visibility=labels)
example(name='second', visibility=[Label('//visibility:public')])
example(name='sets', visibility=depset([Label('//visibility:public')]), transitive_configs=depset([Label('//:setting')]))
"#,
                vec![
                    "package(default_visibility=[42])",
                    "package(features=[Label('//:feature')])",
                    "example(name='bad', visibility=[42])",
                    "example(name='bad', visibility=depset([42]))",
                    "example(name='bad', transitive_configs=depset([42]))",
                ],
            ),
            (
                "/main.bzl",
                APIContext::Bzl,
                "native.example(name='first', visibility=[Label('//visibility:public')])\n",
                vec!["native.example(name='bad', visibility=[42])"],
            ),
            (
                "/REPO.bazel",
                APIContext::Repo,
                r#"repo(default_visibility=['//visibility:public'],
     default_applicable_licenses=('//:license',))
"#,
                vec!["repo(default_visibility=[42])"],
            ),
            (
                "/MODULE.bazel",
                APIContext::Module,
                "use_extension('//:defs.bzl', 'extension')\nuse_repo_rule('//:defs.bzl', 'repository')\n",
                vec!["use_extension(42, 'extension')", "use_repo_rule(42, 'repository')"],
            ),
        ] {
            let builtins = starpls_bazel::decode_builtins(include_bytes!("../../../starpls/src/builtin/builtin.pb")).unwrap();
            let rules = BuildLanguage {
                rule: vec![RuleDefinition {
                    name: "example".to_owned(),
                    attribute: vec![
                        AttributeDefinition { name: "name".to_owned(), r#type: Discriminator::String as i32, mandatory: Some(true), configurable: Some(false), ..Default::default() },
                        AttributeDefinition { name: "visibility".to_owned(), r#type: Discriminator::StringList as i32, configurable: Some(false), ..Default::default() },
                        AttributeDefinition { name: "transitive_configs".to_owned(), r#type: Discriminator::StringList as i32, configurable: Some(false), ..Default::default() },
                    ],
                    ..Default::default()
                }],
            };
            let (mut analysis, _) = Analysis::new_for_test();
            analysis.set_builtin_defs(builtins, rules).unwrap();
            let info = Some(starpls_common::FileInfo::Bazel { api_context: context, is_external: false });
            let file = analysis.open_document(Path::new(path), Dialect::Bazel, info, source.to_owned(), 1).unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{path}: {diagnostics:?}");
            for bad in bad_calls {
                analysis.open_document(Path::new(path), Dialect::Bazel, info, format!("{source}{bad}\n"), 2).unwrap();
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let [diagnostic] = diagnostics.as_slice() else { panic!("{bad}: {diagnostics:?}"); };
                assert_eq!(diagnostic.id().as_str(), "invalid-argument-type", "{bad}: {diagnostic:?}");
                assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len(), "{bad}: {diagnostic:?}");
            }
        }
    }

    #[test]
    fn archive_override_forwards_repository_attributes() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(Default::default(), Default::default())
            .unwrap();
        let source = r#"archive_override(module_name='single', url='https://example.com/source.tar.gz', sha256='abc')
archive_override(module_name='multiple', urls=['https://example.com/source.tar.gz'], files={'BUILD.bazel': '//:BUILD.example'})
archive_override(module_name='patched', url='https://example.com/source.tar.gz', patches=['//:fix.patch'])
"#;
        let file = analysis
            .open_document(
                Path::new("/MODULE.bazel"),
                Dialect::Bazel,
                Some(starpls_common::FileInfo::Bazel {
                    api_context: APIContext::Module,
                    is_external: false,
                }),
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (arguments, expected) in [
            ("module_name=42", "invalid-argument-type"),
            (
                "url='https://example.com/source.tar.gz'",
                "missing-argument",
            ),
            ("'example'", "too-many-positional-arguments"),
            (
                "module_name='example', patches=[42]",
                "invalid-argument-type",
            ),
        ] {
            analysis.update_file(file, format!("{source}archive_override({arguments})\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == expected),
                "{arguments}: {diagnostics:?}"
            );
            assert!(diagnostics.iter().all(|diagnostic| usize::from(
                diagnostic.range().unwrap().start()
            ) >= source.len()));
        }
    }

    #[test]
    fn labels_support_ordered_comparisons() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def order(first: Label, second: Label) -> None:
    labels: list[Label] = sorted([first, second])
    nested: list[tuple[int, list[Label]]] = sorted([(0, [first]), (0, [second])])
    minimum: Label = min(first, second)
    comparisons: list[bool] = [first < second, first <= second, first > second, first >= second]
    print(labels, nested, minimum, comparisons)
"#;
        let file = analysis
            .open_document(
                Path::new("/labels.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (expression, expected) in [
            ("first < '//:text'", "unsupported-operator"),
            ("sorted([first, None])", "invalid-argument-type"),
            ("first < 1", "unsupported-operator"),
        ] {
            analysis.update_file(file, format!("{source}    {expression}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics.iter().any(|d| d.id().as_str() == expected),
                "{expression}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn analysis_test_result_constructor_matches_its_fields() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = |success: &str, message: &str| {
            format!("def check() -> tuple[bool, str]:\n    result = AnalysisTestResultInfo(success={success}, message={message})\n    return (result.success, result.message)\n")
        };
        let file = analysis
            .open_document(
                Path::new("/analysis_test.bzl"),
                Dialect::Bazel,
                None,
                source("True", "'passed'"),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (success, message) in [("'yes'", "'passed'"), ("True", "42")] {
            analysis.update_file(file, source(success, message));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
        }
    }

    #[test]
    fn feature_flag_provider_preserves_constructor_and_identity() {
        let source = r#"def check(target: Target) -> tuple[FeatureFlagInfo, FeatureFlagInfo, FeatureFlagInfo]:
    return (config_common.FeatureFlagInfo("enabled"), config_common.FeatureFlagInfo(value="enabled"), target[config_common.FeatureFlagInfo])
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (invalid, expected) in [
            ("config_common.FeatureFlagInfo()", "missing-argument"),
            (
                "config_common.FeatureFlagInfo(value=42)",
                "invalid-argument-type",
            ),
            (
                "wrong: CcInfo = target[config_common.FeatureFlagInfo]; wrong",
                "invalid-assignment",
            ),
        ] {
            analysis.update_file(
                file,
                format!("{source}\ndef invalid(target: Target):\n    {invalid}\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), expected, "{invalid}");
        }
    }

    #[test]
    fn execution_declarations_preserve_native_contracts() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())]
                    .into_iter()
                    .collect(),
            )
            .unwrap(),
        );
        let source = r#"group = exec_group(toolchains=['//:toolchain'], exec_compatible_with=['//:constraint'])
groups: dict[Literal['tools'], exec_group] = {'tools': group}
def implementation(context: object) -> None:
    pass
def inspect(context: ctx[object, object], file: File, change: transition) -> None:
    files = context.runfiles(files=[file])
    default = DefaultInfo(executable=file, runfiles=files)
    other = DefaultInfo(data_runfiles=files, default_runfiles=files)
    values: dict[Literal['MODE'], Literal['test']] = {'MODE': 'test'}
    environment = RunEnvironmentInfo(environment=values, inherited_environment=['HOME'])
    shaped: dict[{"MODE": str}] = {"MODE": "test"}
    RunEnvironmentInfo(environment=shaped)
    value: str = environment.environment['MODE']
    inherited: str = environment.inherited_environment[0]
    exec_attr = attr.label(cfg='exec')
    changed_attr = attr.label_list(cfg=change)
    native_attr = attr.label(cfg=config.exec())
    rule(implementation=implementation, cfg=None)
    rule(implementation=implementation, cfg=config.none())
    rule(implementation=implementation, cfg=change)
    print(default, other, value, inherited, exec_attr, changed_attr, native_attr)
"#;
        let file = analysis
            .open_document(
                Path::new("/execution.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_rules(crate::DiagnosticRules::default());
        analysis.update_file(
            file,
            format!("{source}    rule(implementation=lambda ctx: [], exec_groups=groups)\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for call in [
            "DefaultInfo(executable='tool')",
            "DefaultInfo(runfiles=[file])",
            "RunEnvironmentInfo(environment={'MODE': 42})",
            "RunEnvironmentInfo(environment={42: 'test'})",
            "RunEnvironmentInfo(inherited_environment=[42])",
            "exec_group(toolchains=[42])",
            "attr.label(cfg=42)",
            "rule(implementation=implementation, cfg='exec')",
            "rule(implementation=lambda ctx: [], exec_groups={'tools': 42})",
        ] {
            analysis.update_file(file, format!("{source}    {call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{call}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
        }
    }

    #[test]
    fn rule_transitions_preserve_supplied_metadata() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        for (declared, has_transition, accepted, rejected) in [
            ("None", true, "None", Some("config.none()")),
            ("unknown", false, "42", None),
        ] {
            let mut builtins = builtins.clone();
            if !has_transition {
                builtins.r#type.retain(|class| class.name != "transition");
            }
            let parameter = builtins
                .global
                .iter_mut()
                .find(|value| value.name == "rule")
                .unwrap()
                .callable
                .as_mut()
                .unwrap()
                .param
                .iter_mut()
                .find(|parameter| parameter.name == "cfg")
                .unwrap();
            parameter.r#type = declared.to_owned();
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let source = |value| format!("rule(implementation=lambda ctx: [], cfg={value})\n");
            let file = analysis
                .open_document(
                    Path::new("/transition.bzl"),
                    Dialect::Bazel,
                    None,
                    source(accepted),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{declared}: {diagnostics:?}");
            if let Some(rejected) = rejected {
                analysis.update_file(file, source(rejected));
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
                assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
            }
        }
    }

    #[test]
    fn transition_returns_preserve_supplied_metadata() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        for (name, expression) in [
            (
                "transition",
                "transition(implementation=lambda settings, attrs: {}, inputs=[], outputs=[])",
            ),
            ("none", "config.none()"),
            ("target", "config.target()"),
        ] {
            let mut builtins = builtins.clone();
            let value = if name == "transition" {
                builtins.global.iter_mut().find(|value| value.name == name)
            } else {
                builtins
                    .r#type
                    .iter_mut()
                    .find(|class| class.name == "config")
                    .unwrap()
                    .field
                    .iter_mut()
                    .find(|value| value.name == name)
            }
            .unwrap();
            value.callable.as_mut().unwrap().return_type = "None".into();
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let file = analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    format!("def value() -> None: return {expression}\n"),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{name}: {diagnostics:?}");
        }
        let mut builtins = builtins;
        builtins.r#type.retain(|class| class.name != "transition");
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("unsound-return-statement".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = analysis
            .open_document(
                Path::new("/partial.bzl"),
                Dialect::Bazel,
                None,
                "def value() -> int: return config.none()\n".into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "unsound-return-statement");
    }

    #[test]
    fn visibility_requires_package_strings() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())]
                    .into_iter()
                    .collect(),
            )
            .unwrap(),
        );
        let file = analysis
            .open_document(
                Path::new("/visibility.bzl"),
                Dialect::Bazel,
                None,
                "visibility(['//lib/...', '//test/...'])\n".into(),
                1,
            )
            .unwrap();
        for value in [
            "'public'",
            "'//lib/...'",
            "[]",
            "['//lib/...', '//test/...']",
        ] {
            analysis.update_file(file, format!("visibility({value})\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{value}: {diagnostics:?}");
        }
        analysis.set_rules(crate::DiagnosticRules::default());
        for value in ["42", "[42]", "('//lib/...',)", "None"] {
            analysis.update_file(file, format!("visibility({value})\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{value}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
        }
    }

    #[test]
    fn depsets_preserve_empty_and_documented_elements() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())]
                    .into_iter()
                    .collect(),
            )
            .unwrap(),
        );
        let source = r#"empty = depset()
also_empty = depset(transitive=[empty])
empty_list = depset([])
empty_tuple = depset(())
empty_transitive = depset(transitive=[])
empty_none = depset(None, transitive=None)
strings: depset[str] = empty
def inspect(context: ctx[object, object], file: File) -> None:
    for value in [empty, also_empty, empty_list, empty_tuple, empty_transitive, empty_none]:
        context.runfiles(transitive_files=value)
    context.runfiles(transitive_files=depset([file]))
    context.runfiles(transitive_files=depset(transitive=[depset([file])]))
"#;
        let file = analysis
            .open_document(
                Path::new("/depsets.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_rules(crate::DiagnosticRules::default());
        analysis.update_file(
            file,
            format!("{source}    context.runfiles(transitive_files=depset(['bad']))\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())]
                    .into_iter()
                    .collect(),
            )
            .unwrap(),
        );
        for gradual in [
            "def unknown(values: list) -> None:\n    result = depset(values)\n",
            "def unknown(values: depset) -> None:\n    result = values.to_list()\n",
        ] {
            analysis.update_file(file, gradual.into());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == "non-static-type"),
                "{gradual}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn action_arguments_distinguish_scalars_and_vectors() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = r#"def inspect(args: Args, file: File, label: Label):
    args.add(file)
    args.add("--file", file, format="%s")
    args.add(label)
    args.add("text")
    args.add(42)
    args.add(None)
    args.add({"key": "value"})
    _sequence: Sequence[int] = range(3)
    print(_sequence)
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for invalid in [
            "[file]",
            "(file,)",
            "_sequence",
            "range(3)",
            "depset([file])",
            "file, file",
            "'--file', [file]",
            "'value', format=42",
        ] {
            analysis.update_file(file, format!("{source}    args.add({invalid})\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| matches!(
                    diagnostic.id().as_str(),
                    "invalid-argument-type" | "no-matching-overload"
                )),
                "{invalid}: {diagnostics:?}"
            );
            assert!(
                diagnostics.iter().all(|diagnostic| usize::from(
                    diagnostic.range().unwrap().start()
                ) >= source.len()),
                "{invalid}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn action_tools_accept_providers_and_file_depsets() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        for (method, arguments) in [("run", "executable=file"), ("run_shell", "command='true'")] {
            let source = format!(
                r#"def inspect(actions: actions, file: File, provider: FilesToRunProvider):
    files = depset([file])
    tools = [file, provider, files]
    actions.{method}(outputs=[], {arguments}, tools=tools)
    actions.{method}(outputs=[], {arguments}, tools=(file, provider, files))
    actions.{method}(outputs=[], {arguments}, tools=files)
    actions.{method}(outputs=[], {arguments}, tools=depset([provider]))
    actions.{method}(outputs=[], {arguments}, tools=depset([files]))
"#
            );
            let file = analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    source.clone(),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{method}: {diagnostics:?}");
            for invalid in [
                "[1]",
                "[depset(['bad'])]",
                "depset(['bad'])",
                "file",
                "None",
            ] {
                analysis
                    .open_document(
                        Path::new("/main.bzl"),
                        Dialect::Bazel,
                        None,
                        format!("{source}    actions.{method}(outputs=[], {arguments}, tools={invalid})\n"),
                        2,
                    )
                    .unwrap();
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{method}, {invalid}: {diagnostics:?}");
                };
                assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
                assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
            }
        }
    }

    #[test]
    fn files_to_run_members_preserve_absence_and_narrowing() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        for name in ["executable", "runfiles_manifest", "repo_mapping_manifest"] {
            let source = format!(
                r#"def inspect(provider: FilesToRunProvider):
    value = provider.{name}
    if value != None:
        return value.path
    return None
"#
            );
            let file = analysis
                .open_document(Path::new("/main.bzl"), Dialect::Bazel, None, source, 1)
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{name}: {diagnostics:?}");
            let source = format!(
                "def inspect(provider: FilesToRunProvider):\n    return provider.{name}.path\n"
            );
            analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    source.clone(),
                    2,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{name}: {diagnostics:?}");
            };
            assert_eq!(
                diagnostic.id().as_str(),
                "unresolved-attribute",
                "{name}: {diagnostic:?}"
            );
            assert!(
                diagnostic.concise_message().to_string().contains("None"),
                "{name}: {diagnostic:?}"
            );
        }
    }

    #[test]
    fn provider_requirements_preserve_keys_and_versioned_names() {
        for (release, legacy_names) in [
            ("development version", true),
            ("release 8.6.0", true),
            ("release 9.0.0", false),
        ] {
            let (mut analysis, loader) = Analysis::new_for_test();
            let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
            let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
                "../../../starpls/src/builtin/builtin.pb"
            ))
            .unwrap();
            starpls_bazel::env::apply_versioned_signatures(&mut builtins, release);
            let attribute_methods: Vec<_> = builtins
                .r#type
                .iter()
                .filter(|class| class.name == "attr")
                .flat_map(|class| &class.field)
                .filter(|method| {
                    method.callable.as_ref().is_some_and(|callable| {
                        callable
                            .param
                            .iter()
                            .any(|parameter| parameter.name == "providers")
                    })
                })
                .map(|method| method.name.clone())
                .collect();
            assert!(attribute_methods.iter().any(|name| name == "label"));
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let source = fixture.add_file(
                &mut analysis.db,
                "keys.bzl",
                r#"
Info = provider(fields=["value"])
def _init(value):
    return {"value": value}
Initialized, raw = provider(fields=["value"], init=_init)
"#,
            );
            let interface = fixture.add_file(
                &mut analysis.db,
                "keys.bzli",
                r#"
def Info[T](value: T) -> record[{"value": T}]: ...
def _init(value: str) -> dict[str, str]: ...
def Initialized(value: str) -> record[{"value": str}]: ...
"#,
            );
            let mut valid = String::from(
                r#"
load("keys.bzl", "Info", "Initialized", "raw")
keys: list[ProviderKey] = [Info, Initialized, DefaultInfo]
nested: list[list[ProviderKey]] = [keys, [Info]]
def implementation(context: ctx[object, object]) -> None: pass
def aspect_implementation(target: Target, context: ctx[object, object]) -> None: pass
"#,
            );
            for method in &attribute_methods {
                valid.push_str(&format!("attr.{method}(providers=keys)\nattr.{method}(providers=nested)\nattr.{method}(providers=((Info,), (DefaultInfo,)))\n"));
            }
            let caller = fixture.add_file(&mut analysis.db, "requirements.bzl", &valid);
            loader.add_files_from_fixture(&fixture);
            analysis.set_type_interfaces([(source, interface)]).unwrap();
            analysis.set_rules(
                crate::DiagnosticRules::from_settings(
                    &[("non-static-type".into(), "error".into())]
                        .into_iter()
                        .collect(),
                )
                .unwrap(),
            );
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            assert!(diagnostics.is_empty(), "{release}: {diagnostics:?}");
            // Registration callback completeness is tested by its own contract owner.
            analysis.set_rules(crate::DiagnosticRules::default());
            valid.push_str("rule(implementation, provides=keys)\naspect(aspect_implementation, provides=keys, required_providers=nested, required_aspect_providers=keys)\n");
            analysis.update_file(caller, valid.clone());
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            assert!(diagnostics.is_empty(), "{release}: {diagnostics:?}");
            for invalid in [
                "attr.label(providers=[implementation])",
                "attr.label(providers=[raw])",
                "attr.label(providers=[Info(value=1)])",
                "attr.label(providers=[Info, [DefaultInfo]])",
                "attr.label(providers=[[42]])",
                "attr.label(providers=None)",
                "attr.label(providers='legacy')",
                "rule(implementation, provides='legacy')",
                "rule(implementation, provides=nested)",
                "aspect(aspect_implementation, provides=nested)",
                "aspect(aspect_implementation, required_providers=[Info, [DefaultInfo]])",
                "aspect(aspect_implementation, required_aspect_providers=[[raw]])",
            ] {
                analysis.update_file(caller, format!("{valid}{invalid}\n"));
                let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{release}, {invalid}: {diagnostics:?}");
                };
                assert_eq!(
                    diagnostic.id().as_str(),
                    "invalid-argument-type",
                    "{invalid}"
                );
                assert!(diagnostic.range().unwrap().start().to_usize() >= valid.len());
            }
            let named = format!("{valid}legacy: list[ProviderKey | str] = [Info, 'legacy']\n");
            for call in [
                "attr.label(providers=legacy)",
                "attr.label(providers=[legacy])",
                "rule(implementation, provides=legacy)",
                "aspect(aspect_implementation, provides=legacy)",
                "aspect(aspect_implementation, required_providers=[legacy])",
                "aspect(aspect_implementation, required_aspect_providers=legacy)",
            ] {
                analysis.update_file(caller, format!("{named}{call}\n"));
                let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
                if legacy_names {
                    assert!(diagnostics.is_empty(), "{release}, {call}: {diagnostics:?}");
                } else {
                    let [diagnostic] = diagnostics.as_slice() else {
                        panic!("{release}, {call}: {diagnostics:?}");
                    };
                    assert_eq!(diagnostic.id().as_str(), "invalid-argument-type", "{call}");
                    assert!(diagnostic.range().unwrap().start().to_usize() >= named.len());
                }
            }
        }
    }

    #[test]
    fn provider_requirements_preserve_supplied_signatures() {
        for (metadata, valid, invalid) in [
            ("sequence of strings", "['legacy']", "[DefaultInfo]"),
            (
                "sequence of ProviderKeys",
                "[DefaultInfo]",
                "[[DefaultInfo]]",
            ),
        ] {
            let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
                "../../../starpls/src/builtin/builtin.pb"
            ))
            .unwrap();
            let parameter = builtins
                .r#type
                .iter_mut()
                .find(|class| class.name == "attr")
                .unwrap()
                .field
                .iter_mut()
                .find(|method| method.name == "label")
                .unwrap()
                .callable
                .as_mut()
                .unwrap()
                .param
                .iter_mut()
                .find(|parameter| parameter.name == "providers")
                .unwrap();
            parameter.r#type = metadata.to_owned();
            starpls_bazel::env::apply_versioned_signatures(&mut builtins, "release 9.0.0");
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let file = analysis
                .open_document(
                    Path::new("/requirements.bzl"),
                    Dialect::Bazel,
                    None,
                    format!("attr.label(providers={valid})\n"),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{metadata}: {diagnostics:?}");
            analysis.update_file(file, format!("attr.label(providers={invalid})\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{metadata}: {diagnostics:?}")
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
        }
    }

    #[test]
    fn provider_lookup_distinguishes_group_targets() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                String::new(),
                1,
            )
            .unwrap();
        for (receiver, key, expression, expected) in [
            (
                "Target[None]",
                "Provider[object]",
                "target[key]",
                "DefaultInfo[depset[File], None] | PackageSpecificationInfo",
            ),
            (
                "Target[None]",
                "ProviderKey",
                "target[key]",
                "DefaultInfo[depset[File], None] | PackageSpecificationInfo",
            ),
            ("Target[None]", "Unknown", "target[Info]", "Never"),
            (
                "Target[FilesToRunProvider]",
                "Unknown",
                "target[Info]",
                "Info",
            ),
            (
                "Target[FilesToRunProvider] | Target[None]",
                "Unknown",
                "target[Info]",
                "Info",
            ),
            ("Target", "Unknown", "target[Info]", "Info"),
            (
                "Target[None]",
                "Unknown",
                "target[DefaultInfo].files_to_run",
                "None",
            ),
            (
                "Target[None]",
                "Unknown",
                "target[PackageSpecificationInfo]",
                "PackageSpecificationInfo",
            ),
            (
                "Target[None]",
                "Provider[Info] | Provider[PackageSpecificationInfo]",
                "target[key]",
                "PackageSpecificationInfo",
            ),
            (
                "Target[None]",
                "Provider[DefaultInfo]",
                "target[key].files_to_run",
                "None",
            ),
            (
                "Target[None]",
                "Provider[DefaultInfo] | Provider[Info]",
                "target[key].files_to_run",
                "None",
            ),
            ("Target[None]", "Unknown", "target[key]", "Unknown"),
            ("Target[None]", "Any", "target[key]", "Unknown"),
            (
                "Target[None]",
                "Provider[Any]",
                "target[key]",
                "(Unknown & DefaultInfo[depset[File], None]) | (Unknown & PackageSpecificationInfo)",
            ),
        ] {
            let source = format!(
                "Info = provider(fields=['message'])\ndef inspect(target: {receiver}, key: {key}):\n    return {expression}\n"
            );
            analysis.update_file(file, source);
            let snapshot = analysis.snapshot();
            let db = &snapshot.db;
            let file = db.starlark_program_file(file);
            let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
            let model = SemanticModel::new(db, file);
            let [_provider, inspect] = parsed.suite().as_slice() else {
                panic!("expected provider and inspection declarations");
            };
            let Stmt::FunctionDef(function) = inspect else {
                panic!("expected function");
            };
            let [statement] = function.body.as_slice() else {
                panic!("expected one return statement");
            };
            let Stmt::Return(statement) = statement else {
                panic!("expected return");
            };
            let ty = statement
                .value
                .as_ref()
                .unwrap()
                .inferred_type(&model)
                .unwrap();
            assert_eq!(
                ty.display(db, &model.program_environment()).to_string(),
                expected,
                "{receiver}, {key}: {expression}"
            );
            let diagnostics = ty_python_semantic::check_file_unwrap(db, file);
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
    }

    #[test]
    fn output_groups_expose_file_depsets() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = r#"def inspect(target: Target, file: File):
    OutputGroupInfo(listed=[file], tupled=(file,), nested=depset([file]))
    groups = target[OutputGroupInfo]
    named: list[File] = groups.custom.to_list()
    indexed: list[File] = groups['custom'].to_list()
    present: bool = 'custom' in groups
    absent: bool = 42 in groups
    if hasattr(groups, 'custom'):
        groups.custom.to_list()[0].path
    (named, indexed, present, absent)
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (statement, expected) in [
            ("target[OutputGroupInfo][42]", "invalid-argument-type"),
            (
                "bad: list[str] = target[OutputGroupInfo].custom.to_list(); bad",
                "invalid-assignment",
            ),
            (
                "bad: list[str] = target[OutputGroupInfo]['custom'].to_list(); bad",
                "invalid-assignment",
            ),
            ("OutputGroupInfo(custom=[42])", "invalid-argument-type"),
            (
                "OutputGroupInfo(custom=depset(['bad']))",
                "invalid-argument-type",
            ),
        ] {
            analysis.update_file(file, format!("{source}    {statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{statement}: {diagnostics:?}");
            };
            assert_eq!(
                diagnostic.id().as_str(),
                expected,
                "{statement}: {diagnostic:?}"
            );
            assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
        }
    }

    #[test]
    fn rule_parent_requires_a_starlark_rule() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"
def implementation(ctx: ctx[object, object]) -> list[ProviderInstance]:
    return []
base = rule(implementation, attrs={"value": attr.string(mandatory=True)}, extendable=True)
without_parent = rule(implementation)
none_parent = rule(implementation, parent=None)
child = rule(implementation, parent=base)
child(name="child", value="inherited")
unpacked = rule(implementation, **{"parent": base})
unpacked(name="unpacked", value="inherited")
"#;
        let file = analysis
            .open_document(
                Path::new("/parent.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for statement in [
            "rule(implementation, parent=implementation)",
            "rule(implementation, parent=42)",
            "rule(implementation, **{'parent': implementation})",
            "child(name='wrong', value=42)",
        ] {
            analysis.update_file(file, format!("{source}{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{statement}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            assert!(diagnostic.range().unwrap().start().to_usize() >= source.len());
        }
    }

    #[test]
    fn transition_registration_preserves_callback_signatures() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        // exec_transition is restricted to Bazel builtins and is not always exported.
        builtins
            .global
            .retain(|value| value.name != "exec_transition");
        let mut exec_transition = builtins
            .global
            .iter()
            .find(|value| value.name == "transition")
            .unwrap()
            .clone();
        exec_transition.name = "exec_transition".into();
        exec_transition.callable.as_mut().unwrap().return_type = "transition".into();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = analysis
            .open_document(
                Path::new("/transition.bzl"),
                Dialect::Bazel,
                None,
                "unavailable = exec_transition\n".into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "unresolved-reference"),
            "{diagnostics:?}"
        );
        builtins.global.push(exec_transition);
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        for constructor in ["transition", "exec_transition"] {
            let source = format!(
                r#"
def identity(settings: dict[str, object], attrs: struct[object]) -> dict[str, object]:
    return settings
def split(settings: dict[str, str], attrs: struct[object]) -> list[dict[str, str]]:
    return [settings]
def registered_only() -> int:
    return 42
keys: list[str] = []
identity_transition = {constructor}(implementation=identity, inputs=[], outputs=keys)
split_transition = {constructor}(implementation=split, inputs=("//command_line_option:cpu",), outputs=keys)
unpacked_transition = {constructor}(**{{"implementation": identity}}, inputs=keys, outputs=keys)
# Registration does not invoke the callback or validate its returned settings.
unchecked_invocation = {constructor}(implementation=registered_only, inputs=keys, outputs=keys)
"#
            );
            analysis.update_file(file, source.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{constructor}: {diagnostics:?}");
            for argument in [
                "implementation=42",
                "implementation=None",
                "implementation='identity'",
                "**{'implementation': False}",
            ] {
                analysis.update_file(
                    file,
                    format!("{source}{constructor}({argument}, inputs=keys, outputs=keys)\n"),
                );
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{constructor} {argument}: {diagnostics:?}");
                };
                assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
                assert!(diagnostic.range().unwrap().start().to_usize() >= source.len());
            }
            for arguments in ["inputs=[42], outputs=keys", "inputs=keys, outputs=None"] {
                analysis.update_file(
                    file,
                    format!("{source}{constructor}(implementation=identity, {arguments})\n"),
                );
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{constructor} {arguments}: {diagnostics:?}");
                };
                assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            }
            let gradual = "def gradual(settings: Unknown, attrs: struct[object]) -> None: pass\n";
            analysis.update_file(
                file,
                format!("{source}{gradual}{constructor}(implementation=gradual, inputs=keys, outputs=keys)\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            assert_eq!(
                ids,
                ["non-static-type", "non-static-type", "non-static-type"],
                "{constructor}: {diagnostics:?}"
            );
            assert!(diagnostics.iter().any(|diagnostic| {
                diagnostic.range().unwrap().start().to_usize() >= source.len() + gradual.len()
            }));
        }
    }

    #[test]
    fn rule_initializer_preserves_its_own_signature() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"
def implementation(ctx: ctx[object, object]) -> list[ProviderInstance]:
    return []
def initialize(name: str, value: str = "default") -> dict[str, str]:
    return {"value": value}
def passthrough(**kwargs: object) -> dict[str, object]:
    return kwargs
def unchanged(name: str) -> None:
    pass
without_initializer = rule(implementation)
none_initializer = rule(implementation, initializer=None)
named_initializer = rule(implementation, initializer=initialize, attrs={"value": attr.string()})
kwargs_initializer = rule(implementation, initializer=passthrough)
no_updates = rule(implementation, initializer=unchanged)
unpacked = rule(implementation, **{"initializer": initialize}, attrs={"value": attr.string()})
"#;
        let file = analysis
            .open_document(
                Path::new("/initializer.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for statement in [
            "rule(implementation, initializer=42)",
            "rule(implementation, initializer='initialize')",
            "rule(implementation, **{'initializer': False})",
        ] {
            analysis.update_file(file, format!("{source}{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{statement}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            assert!(diagnostic.range().unwrap().start().to_usize() >= source.len());
        }
        let gradual = "def gradual(name: Unknown) -> None: pass\n";
        analysis.update_file(
            file,
            format!("{source}{gradual}rule(implementation, initializer=gradual)\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(
            ids,
            ["non-static-type", "non-static-type", "non-static-type"],
            "{diagnostics:?}"
        );
        assert!(
            diagnostics.iter().any(|diagnostic| {
                diagnostic.range().unwrap().start().to_usize() >= source.len() + gradual.len()
            }),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn glob_checks_optional_allow_empty_flag() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        for (path, context, callee) in [
            ("/BUILD.bazel", APIContext::Build, "glob"),
            ("/glob.bzl", APIContext::Bzl, "native.glob"),
        ] {
            let source = format!(
                "{callee}(['*.txt'])\n{callee}(['*.txt'], allow_empty=True)\n{callee}(['*.txt'], allow_empty=False)\n{callee}(['*.txt'], **{{'allow_empty': True}})\n"
            );
            let file = analysis
                .open_document(
                    Path::new(path),
                    Dialect::Bazel,
                    Some(FileInfo::Bazel {
                        api_context: context,
                        is_external: false,
                    }),
                    source.clone(),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{path}: {diagnostics:?}");
            for invalid in ["None", "1", "'yes'"] {
                analysis.update_file(
                    file,
                    format!("{source}{callee}(['*.txt'], allow_empty={invalid})\n"),
                );
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{path} {invalid}: {diagnostics:?}");
                };
                assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
                assert!(diagnostic.range().unwrap().start().to_usize() >= source.len());
            }
        }
    }

    #[test]
    fn exported_files_check_visibility_labels() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        for (path, context, callee) in [
            ("/BUILD.bazel", APIContext::Build, "exports_files"),
            ("/exports.bzl", APIContext::Bzl, "native.exports_files"),
        ] {
            let source = format!(
                "{callee}(['input'], visibility=['//visibility:public', Label('//:group')])\n{callee}(['input'], visibility=None)\n"
            );
            let file = analysis
                .open_document(
                    Path::new(path),
                    Dialect::Bazel,
                    Some(FileInfo::Bazel {
                        api_context: context,
                        is_external: false,
                    }),
                    source.clone(),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{path}: {diagnostics:?}");
            analysis.update_file(
                file,
                format!("{source}{callee}(['input'], visibility=[42])\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{path}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
        }
    }

    #[test]
    fn dotted_versions_use_native_ordering() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        for operator in ["<", "<=", ">", ">="] {
            let source = format!(
                "def supported(current: DottedVersion) -> bool:\n    return current {operator} apple_common.dotted_version('15.0')\n"
            );
            let file = analysis
                .open_document(
                    Path::new("/version.bzl"),
                    Dialect::Bazel,
                    None,
                    source.clone(),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{operator}: {diagnostics:?}");
            analysis.update_file(
                file,
                source.replace("apple_common.dotted_version('15.0')", "'15.0'"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{operator}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "unsupported-operator");
        }
    }

    #[test]
    fn native_bazel_version_is_a_string() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = "def version() -> str:\n    return native.bazel_version\n";
        let file = analysis
            .open_document(
                Path::new("/version.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(file, source.replace("-> str", "-> int"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-return-type");
    }

    #[test]
    fn hashable_annotations_preserve_bounded_inputs() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let source = r#"def keep(value):
    return value
def text() -> str:
    return keep('text')
def label() -> Label:
    return keep(Label('//:target'))
def boolean() -> bool:
    return keep(True)
def integer() -> int:
    return keep(1)
def floating() -> float:
    return keep(1.5)
def pair() -> tuple[str, int]:
    return keep(('text', 1))
def file(value: File) -> File:
    return keep(value)
def version(value: DottedVersion) -> DottedVersion:
    return keep(value)
def files(value: depset[File]) -> depset[File]:
    return keep(value)
def empty() -> None:
    return keep(None)
def record() -> struct[int]:
    return keep(struct(value = 1))
"#;
        let file = analysis
            .open_document(
                Path::new("/hashable.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let interface = analysis
            .open_document(
                Path::new("/hashable.bzli"),
                Dialect::Bazel,
                None,
                "def keep[T: Hashable](value: T) -> T: ...\n".into(),
                1,
            )
            .unwrap();
        analysis.set_type_interfaces([(file, interface)]).unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        for checked in [file, interface] {
            let diagnostics = analysis.snapshot().diagnostics(checked).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        for invalid in ["[1]", "{'key': 1}", "struct(value = [1])"] {
            analysis.update_file(file, format!("{source}keep({invalid})\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic, result] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            assert_eq!(result.id().as_str(), "non-static-type");
            assert!(diagnostic.range().unwrap().start().to_usize() >= source.len());
        }
        analysis.update_file(
            file,
            source.replace("def text() -> str", "def text() -> int"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-return-type");
        analysis.set_rules(crate::DiagnosticRules::default());
        analysis.update_file(
            file,
            format!("{source}'text'.__hash__\nLabel('//:target').__hash__\nNone.__hash__\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["unresolved-attribute"; 3], "{diagnostics:?}");
    }

    #[test]
    fn download_auth_checks_dictionary_keys_and_values() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        for host in ["repository_ctx", "module_ctx"] {
            for method in ["download", "download_and_extract"] {
                let source = format!(
                    r#"def inspect(ctx: {host}) -> None:
    auth: dict[str, dict[str, str]] = {{"https://example.com": {{"type": "basic", "login": "user", "password": "secret"}}}}
    ctx.{method}(url="https://example.com", auth=auth)
    ctx.{method}(url="https://example.com", auth={{}})
    opaque: dict[str, dict[int, int] | dict[str, str]] = {{"https://example.com": {{1: 2}}}}
    ctx.{method}(url="https://example.com", auth=opaque)
def typed(ctx, auth):
    ctx.{method}(url="https://example.com", auth=auth)
"#
                );
                let file = analysis
                    .open_document(
                        Path::new("/auth.bzl"),
                        Dialect::Bazel,
                        None,
                        source.clone(),
                        1,
                    )
                    .unwrap();
                let interface = analysis
                    .open_document(
                        Path::new("/auth.bzli"),
                        Dialect::Bazel,
                        None,
                        format!("def typed(ctx: {host}, auth: dict[{{\"https://example.com\": dict[{{\"type\": str, \"pattern\": str}}]}}]) -> None: ...\n"),
                        1,
                    )
                    .unwrap();
                analysis.set_type_interfaces([(file, interface)]).unwrap();
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert!(diagnostics.is_empty(), "{host}.{method}: {diagnostics:?}");
                for invalid in [
                    "{None: {}}",
                    "{'https://example.com': None}",
                    "{'https://example.com': 'secret'}",
                    "[]",
                ] {
                    analysis.update_file(
                        file,
                        format!(
                            "{source}    ctx.{method}(url='https://example.com', auth={invalid})\n"
                        ),
                    );
                    let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                    let [diagnostic] = diagnostics.as_slice() else {
                        panic!("{host}.{method}, {invalid}: {diagnostics:?}");
                    };
                    assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
                    assert!(diagnostic.range().unwrap().start().to_usize() >= source.len());
                }
            }
        }
    }

    #[test]
    fn extraction_accepts_the_legacy_prefix_keyword() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        // An inventory that includes the alias already remains authoritative.
        let extract = builtins
            .r#type
            .iter_mut()
            .find(|class| class.name == "repository_ctx")
            .unwrap()
            .field
            .iter_mut()
            .find(|field| field.name == "extract")
            .unwrap()
            .callable
            .as_mut()
            .unwrap();
        extract.param.push(Param {
            name: "stripPrefix".to_owned(),
            r#type: "string".to_owned(),
            default_value: "''".to_owned(),
            ..Default::default()
        });
        let declarations = generate(Dialect::Bazel, &builtins, &BuildLanguage::default()).unwrap();
        let parsed = ruff_python_parser::parse_module(&declarations.contents).unwrap();
        let types = parsed
            .syntax()
            .body
            .iter()
            .filter_map(Stmt::as_class_def_stmt)
            .find(|class| class.name.as_str() == "_starpls_types")
            .unwrap();
        let mut keyword_aliases = BTreeSet::new();
        for class in types.body.iter().filter_map(Stmt::as_class_def_stmt) {
            for method in class.body.iter().filter_map(Stmt::as_function_def_stmt) {
                if method
                    .parameters
                    .kwonlyargs
                    .iter()
                    .any(|parameter| parameter.parameter.name.as_str() == "stripPrefix")
                {
                    keyword_aliases.insert(format!("{}.{}", class.name, method.name));
                }
            }
        }
        assert_eq!(
            keyword_aliases,
            BTreeSet::from([
                "repository_ctx.extract".to_owned(),
                "repository_ctx.download_and_extract".to_owned(),
                "module_ctx.extract".to_owned(),
                "module_ctx.download_and_extract".to_owned(),
            ])
        );
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        for host in ["repository_ctx", "module_ctx"] {
            for (method, arguments) in [
                (
                    "download_and_extract",
                    "url='https://example.com/source.tar.gz'",
                ),
                ("extract", "archive='source.tar.gz'"),
            ] {
                let source = format!("def inspect(ctx: {host}):\n    ctx.{method}({arguments}, stripPrefix='pkg')\n    ctx.{method}({arguments}, strip_prefix='pkg')\n    ctx.{method}({arguments}, strip_prefix='', stripPrefix='pkg')\n");
                let file = analysis
                    .open_document(
                        Path::new("/main.bzl"),
                        Dialect::Bazel,
                        None,
                        source.clone(),
                        1,
                    )
                    .unwrap();
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert!(diagnostics.is_empty(), "{host}.{method}: {diagnostics:?}");
                for invalid in ["42", "None"] {
                    analysis.update_file(
                        file,
                        format!("{source}    ctx.{method}({arguments}, stripPrefix={invalid})\n"),
                    );
                    let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                    let [diagnostic] = diagnostics.as_slice() else {
                        panic!("{host}.{method}, {invalid}: {diagnostics:?}");
                    };
                    assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
                    assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
                }
            }
        }
    }

    #[test]
    fn template_variables_preserve_string_dictionary() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("unsound-return-statement".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def selected(target: Target) -> dict[str, str]:
    return target[platform_common.TemplateVariableInfo].variables
def constructed() -> dict[str, str]:
    return platform_common.TemplateVariableInfo({'CC': 'clang'}).variables
"#;
        let file = analysis
            .open_document(
                Path::new("/template_variables.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(file, source.replace("dict[str, str]", "dict[str, int]"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(diagnostics
            .iter()
            .all(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"));
    }

    #[test]
    fn boolean_conversion_accepts_static_objects() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def nonempty(values: Sequence[str]) -> bool:
    return bool(values)
def nonempty_list(values: list[str]) -> bool:
    return bool(values)
def truth(value: object) -> bool:
    return bool(value)
empty: bool = bool()
none: bool = bool(None)
"#;
        let file = analysis
            .open_document(
                Path::new("/boolean.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (invalid, expected) in [
            ("bool(True, False)", "too-many-positional-arguments"),
            ("wrong: str = bool(42)", "invalid-assignment"),
        ] {
            analysis.update_file(file, format!("{source}{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(
                diagnostic.id().as_str(),
                expected,
                "{invalid}: {diagnostic:?}"
            );
            assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
        }
    }

    #[test]
    fn java_internal_namespace_preserves_native_contracts() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def obtain() -> JavaCommonInternal | None:
    if hasattr(java_common, 'internal_DO_NOT_USE'):
        return java_common.internal_DO_NOT_USE()
    return None
def inspect(internal: JavaCommonInternal, context: ctx[object, object], info: ProviderInstance, key: ProviderKey, file: File, files: depset[File], strings: depset[str], libraries: depset[LibraryToLink], command: Args) -> None:
    _carrier: struct[object] = internal
    _tag: str = type(internal)
    _legacy: bool = internal.google_legacy_api_enabled()
    _disable: bool = internal.incompatible_disable_non_executable_java_binary()
    _merge: bool = internal.incompatible_java_info_merge_runtime_module_flags()
    _callback: Callable[[], bool] = internal.google_legacy_api_enabled
    _getattr_callback: Callable[[], bool] = getattr(internal, 'google_legacy_api_enabled')
    _from_callback: bool = _callback()
    _kind: str = internal.target_kind(42)
    _dirs: list[str] = internal.collect_native_deps_dirs(libraries)
    _options: list[str] = internal.expand_java_opts(context, 'javacopts', tokenize=True)
    _paths: list[str] = internal.expand_java_opts(context, 'javacopts', tokenize=False, exec_paths=True)
    _classpath: depset[File] = internal.get_runtime_classpath_for_archive(files, files)
    internal.check_provider_instances([info], 'providers', key)
    internal.check_java_toolchain_is_declared_on_rule(context.actions)
    internal.create_compilation_action(context, info, file, file, info, files, files, None, strings, files, strings, 'ERROR', Label('//:target'))
    internal.create_compilation_action(context, info, file, file, info, files, files, 42, strings, files, strings, 'ERROR', Label('//:target'), file, source_jars=(file,), resources=[file], sources=files, resource_jars=files, injecting_rule_kind='java_library', extra_args=[command])
    internal.create_header_compilation_action(context, info, file, file, info, files, [file], files, files, None, files, strings, 'ERROR', Label('//:target'), None, True, [file], file, files)
    internal.create_header_compilation_action(context, info, file, file, info, files, [file], files, files, 42, files, strings, 'ERROR', Label('//:target'), 'java_library', True, [file], header_compilation_jar=file, header_compilation_direct_deps=files)
    (_carrier, _tag, _legacy, _disable, _merge, _getattr_callback, _from_callback, _kind, _dirs, _options, _paths, _classpath)
"#;
        let file = analysis
            .open_document(
                Path::new("/java.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        assert!(analysis
            .db
            .builtin_completion_names(file, ty_python_semantic::provided::BuiltinUsage::Annotation)
            .contains_key("JavaCommonInternal"));
        assert!(!analysis
            .db
            .builtin_completion_names(file, ty_python_semantic::provided::BuiltinUsage::Runtime)
            .contains_key("JavaCommonInternal"));
        for (invalid, expected) in [
            ("_wrong: str = internal.missing; _wrong", "invalid-assignment"),
            ("internal.target_kind(target=42)", "positional-only-parameter-as-kwarg"),
            ("internal.google_legacy_api_enabled(42)", "too-many-positional-arguments"),
            ("internal.expand_java_opts(context, 'javacopts')", "missing-argument"),
            ("internal.expand_java_opts(context, 'javacopts', tokenize=42)", "invalid-argument-type"),
            ("internal.get_runtime_classpath_for_archive(strings, files)", "invalid-argument-type"),
            ("internal.collect_native_deps_dirs(files)", "invalid-argument-type"),
            ("internal.check_provider_instances([info], 'providers', info)", "invalid-argument-type"),
            ("internal.check_java_toolchain_is_declared_on_rule(context)", "invalid-argument-type"),
            ("_wrong: str = internal.google_legacy_api_enabled(); _wrong", "invalid-assignment"),
            ("_wrong: list[int] = internal.expand_java_opts(context, 'javacopts', tokenize=True); _wrong", "invalid-assignment"),
            ("internal.create_compilation_action(context, info, file, file, info, strings, files, None, strings, files, strings, 'ERROR', Label('//:target'))", "invalid-argument-type"),
            ("internal.create_compilation_action(context, info, file, file, info, files, files, None, strings, files, strings, 'ERROR', Label('//:target'), extra_args=['wrong'])", "invalid-argument-type"),
            ("internal.create_compilation_action(context, info, file, file, info, files, files, None, strings, files, strings, 'ERROR', Label('//:target'), source_jars=[42])", "invalid-argument-type"),
            ("internal.create_header_compilation_action(context, info, file, file, info, files, [file], files, files, None, files, strings, 'ERROR', Label('//:target'), None, True, [file], file, strings)", "invalid-argument-type"),
        ] {
            analysis.update_file(file, format!("{source}    {invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), expected, "{invalid}: {diagnostic:?}");
            assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
        }
        analysis.update_file(file, format!("{source}    internal.missing()\n"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect::<Vec<_>>(),
            ["call-non-callable", "non-static-type"],
            "{diagnostics:?}"
        );
        assert!(diagnostics
            .iter()
            .all(|diagnostic| usize::from(diagnostic.range().unwrap().start()) >= source.len()));
        analysis.update_file(file, format!("{source}JavaCommonInternal\n"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "unresolved-reference");
    }

    #[test]
    fn native_toolchain_and_repository_protocols() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = r#"def inspect(toolchains: ToolchainContext, key: ToolchainTypeInfo, target: Target, ctx: repository_ctx):
    toolchains["//:toolchain"]
    toolchains[Label("//:toolchain")]
    toolchains[key]
    available: bool = "//:toolchain" in toolchains
    info: ToolchainInfo = platform_common.ToolchainInfo(tool=1, files=[])
    info.tool
    selected: ToolchainInfo = target[platform_common.ToolchainInfo]
    setting: ConstraintSettingInfo = target[platform_common.ConstraintSettingInfo]
    variables: TemplateVariableInfo = platform_common.TemplateVariableInfo({"CC": "clang"})
    platform_common.TemplateVariableInfo(vars={"LD": "lld"})
    selected_variables: TemplateVariableInfo = target[platform_common.TemplateVariableInfo]
    execution: ExecutionInfo = testing.ExecutionInfo()
    testing.ExecutionInfo({"requires-darwin": ""}, "test")
    testing.ExecutionInfo(requirements={"local": "1"}, exec_group="test")
    selected_execution: ExecutionInfo = target[testing.ExecutionInfo]
    execution.exec_group.upper()
    selected_execution.exec_group.upper()
    visibility: list[Label] = native.package_default_visibility()
    files = target.files.to_list()
    files[0].basename
    metadata = ctx.repo_metadata(reproducible=True)
    ctx.repo_metadata(attrs_for_reproducibility={"checksum": "abc", "count": 1})
    attrs = {"checksum": "abc"}
    ctx.repo_metadata(attrs_for_reproducibility=attrs)
    (available, selected, setting, metadata, variables, selected_variables, visibility)
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for invalid in [
            "toolchains[42]",
            "42 in toolchains",
            "platform_common.ToolchainInfo(42)",
            "platform_common.TemplateVariableInfo()",
            "platform_common.TemplateVariableInfo({1: 'value'})",
            "platform_common.TemplateVariableInfo({'CC': 1})",
            "testing.ExecutionInfo({1: 'value'})",
            "testing.ExecutionInfo({'local': 1})",
            "testing.ExecutionInfo(exec_group=42)",
            "testing.ExecutionInfo(unknown=True)",
            "_wrong: CcInfo = testing.ExecutionInfo(); _wrong",
            "_wrong: CcInfo = target[testing.ExecutionInfo]; _wrong",
            "native.package_default_visibility(1)",
            "_wrong: list[str] = native.package_default_visibility(); _wrong",
            "_wrong: CcInfo = platform_common.ToolchainInfo(); _wrong",
            "_wrong: CcInfo = target[platform_common.ConstraintSettingInfo]; _wrong",
            "InstrumentedFilesInfo()",
            "files[0].missing",
            "_wrong: list[int] = files; _wrong",
            "ctx.repo_metadata(reproducible='yes')",
            "ctx.repo_metadata(attrs_for_reproducibility={1: 'value'})",
            "ctx.repo_metadata(attrs_for_reproducibility=[('checksum', 'abc')])",
            "ctx.repo_metadata(True)",
            "metadata.missing",
        ] {
            analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    format!("{source}    {invalid}\n"),
                    2,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert!(
                usize::from(diagnostic.range().unwrap().start()) >= source.len(),
                "{invalid}: {diagnostic:?}"
            );
        }
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def metadata(context: repository_ctx, attrs: dict[str, str], schema: dict[{"checksum": str}]) -> None:
    context.repo_metadata(attrs_for_reproducibility=attrs)
    context.repo_metadata(attrs_for_reproducibility=schema)

platform_common.ToolchainInfo(runtime=struct(path="tool"))
"#;
        analysis.update_file(file, source.into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn coverage_accepts_generated_contexts_without_erasing_attributes() {
        use salsa::Setter;

        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis
            .db
            .environment()
            .set_options(&mut analysis.db)
            .to(crate::InferenceOptions {
                infer_ctx_attributes: true,
                ..Default::default()
            });
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def implementation(ctx) -> list[InstrumentedFilesInfo]:
    sources: Sequence[Target] = ctx.attr.srcs
    coverage = coverage_common.instrumented_files_info(ctx, source_attributes=["srcs"])
    print(sources)
    return [coverage]
first = rule(implementation=implementation, attrs={"srcs": attr.label_list()})
second = rule(implementation=implementation, attrs={"srcs": attr.label_list(), "extra": attr.bool()})
"#;
        let file = analysis
            .open_document(
                Path::new("/coverage.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (before, after, expected) in [
            (
                "instrumented_files_info(ctx,",
                "instrumented_files_info(ctx.attr,",
                "invalid-argument-type",
            ),
            ("ctx.attr.srcs", "ctx.attr.missing", "unresolved-attribute"),
            (
                "sources: Sequence[Target]",
                "sources: Sequence[str]",
                "invalid-assignment",
            ),
        ] {
            analysis.update_file(file, source.replace(before, after));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == expected),
                "{after}: {diagnostics:?}"
            );
        }
        analysis.update_file(
            file,
            "def unknown_attributes(context: ctx) -> object:\n    return context.attr.missing\n"
                .into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "non-static-type"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn coverage_context_preserves_supplied_metadata() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        for (declared, has_context, accepted, rejected) in [
            ("str", true, "'precise'", Some("42")),
            ("ctx", false, "42", None),
        ] {
            let mut builtins = builtins.clone();
            if !has_context {
                builtins.r#type.retain(|class| class.name != "ctx");
            }
            let parameter = builtins
                .r#type
                .iter_mut()
                .find(|class| class.name == "coverage_common")
                .unwrap()
                .field
                .iter_mut()
                .find(|field| field.name == "instrumented_files_info")
                .unwrap()
                .callable
                .as_mut()
                .unwrap()
                .param
                .iter_mut()
                .find(|parameter| parameter.name == "ctx")
                .unwrap();
            parameter.r#type = declared.into();
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let source = |context| format!("coverage_common.instrumented_files_info({context})\n");
            let file = analysis
                .open_document(
                    Path::new("/coverage.bzl"),
                    Dialect::Bazel,
                    None,
                    source(accepted),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{declared}: {diagnostics:?}");
            if let Some(rejected) = rejected {
                analysis.update_file(file, source(rejected));
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{diagnostics:?}");
                };
                assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            }
        }
    }

    #[test]
    fn native_input_collections_check_their_elements() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())]
                    .into_iter()
                    .collect(),
            )
            .unwrap(),
        );
        let source = r#"def check(ctx: ctx[object, object], file: File) -> None:
    files = [file]
    transitive = depset(files)
    attributes = ["srcs"]
    ctx.actions.run(outputs=[], executable="tool", inputs=files)
    ctx.actions.run(outputs=[], executable="tool", inputs=transitive)
    ctx.actions.run_shell(outputs=[], command="tool", inputs=(file,))
    ctx.actions.run_shell(outputs=[], command="tool", inputs=transitive)
    ctx.actions.do_nothing(mnemonic="Inputs", inputs=files)
    ctx.actions.do_nothing(mnemonic="Inputs", inputs=transitive)
    coverage_common.instrumented_files_info(ctx, source_attributes=attributes, dependency_attributes=("deps",))
"#;
        let path = Path::new("/inputs.bzl");
        let file = analysis
            .open_document(path, Dialect::Bazel, None, source.to_owned(), 1)
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for invalid in [
            "ctx.actions.run(outputs=[], executable='tool', inputs=['file'])",
            "ctx.actions.run_shell(outputs=[], command='tool', inputs=depset(['file']))",
            "ctx.actions.do_nothing(mnemonic='Inputs', inputs=[1])",
            "coverage_common.instrumented_files_info(ctx, source_attributes=[file])",
            "coverage_common.instrumented_files_info(ctx, dependency_attributes=[1])",
        ] {
            analysis
                .open_document(
                    path,
                    Dialect::Bazel,
                    None,
                    format!("{source}    {invalid}\n"),
                    2,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
        }
    }

    #[test]
    fn template_substitutions_have_string_keys_and_values() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def check(context: ctx[object, object], repository: repository_ctx, template: File, output: File, substitutions: dict[str, str]) -> None:
    narrow: dict[Literal["{KEY}"], Literal["value"]] = {"{KEY}": "value"}
    schema: dict[{"{KEY}": str}] = {"{KEY}": "value"}
    context.actions.expand_template(template=template, output=output, substitutions=substitutions)
    context.actions.expand_template(template=template, output=output, substitutions=narrow)
    context.actions.expand_template(template=template, output=output, substitutions=schema)
    repository.template("out", "template", substitutions)
    repository.template("out", "template", narrow)
    repository.template("out", "template", schema)
"#;
        let file = analysis
            .open_document(
                Path::new("/template.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for invalid in ["{42: 'value'}", "{'key': 42}", "('key', 'value')"] {
            analysis.update_file(
                file,
                format!("{source}    context.actions.expand_template(template=template, output=output, substitutions={invalid})\n    repository.template('out', 'template', {invalid})\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 2, "{invalid}: {diagnostics:?}");
            for diagnostic in diagnostics {
                assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
                assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
            }
        }
    }

    #[test]
    fn bazel_action_api_args_collection_checks_call_shapes() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let args = builtins
            .r#type
            .iter_mut()
            .find(|class| class.name == "Args")
            .unwrap();
        let add_joined = args
            .field
            .iter_mut()
            .find(|field| field.name == "add_joined")
            .unwrap();
        add_joined.callable.as_mut().unwrap().param.insert(
            2,
            Param {
                is_star_arg: true,
                ..Default::default()
            },
        );
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def check(args: Args, file: File) -> None:
    chained: Args = args.add_all(depset([file]))
    args.add_all("--headers", [file])
    args.add_all(range(3))
    chained.add_joined((file,), join_with=",")
    args.add_joined("--headers", depset([file]), join_with=",")
"#;
        let file = analysis
            .open_document(
                Path::new("/actions.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_rules(Default::default());
        for invalid in [
            "args.add_all(42)",
            "args.add_all('--headers')",
            "args.add_joined([file], [file], join_with=',')",
            "args.add_all('--headers', values=[file])",
            "args.add_joined([file])",
            "args.add_all([file], format_each=42)",
        ] {
            analysis.update_file(file, format!("{source}    {invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
        }
    }

    #[test]
    fn bazel_action_api_write_follows_release() {
        let source = r#"def check(context: ctx[object, object], output: File) -> None:
    context.actions.write(output, "content", mnemonic="CppModuleMap")
    context.actions.write(output, context.actions.args(), execution_requirements={"no-cache": "1"})
"#;
        for (release, expected) in [
            ("release 8.4.0", 2),
            ("release 9.0.0", 1),
            ("release 9.1.0", 0),
        ] {
            let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
                "../../../starpls/src/builtin/builtin.pb"
            ))
            .unwrap();
            env::apply_versioned_signatures(&mut builtins, release);
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let file = analysis
                .open_document(
                    Path::new("/actions.bzl"),
                    Dialect::Bazel,
                    None,
                    source.into(),
                    1,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), expected, "{release}: {diagnostics:?}");
            assert!(diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() == "unknown-argument"));
            if expected == 0 {
                analysis.update_file(file, format!("{source}    context.actions.write(output, 'content', False, 'CppModuleMap')\n    context.actions.write(output, context.actions.args(), execution_requirements={{'no-cache': 1}})\n"));
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let ids = diagnostics
                    .iter()
                    .map(|diagnostic| diagnostic.id().as_str())
                    .collect::<Vec<_>>();
                assert_eq!(
                    ids,
                    ["too-many-positional-arguments", "invalid-argument-type"]
                );
            }
        }
    }

    #[test]
    fn action_execution_inputs_have_static_domains() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"def check(context: ctx[object, object], output: File) -> None:
    arguments = context.actions.args()
    env: dict[Literal["MODE"], Literal["test"]] = {"MODE": "test"}
    requirements: dict[Literal["no-remote"], Literal["1"]] = {"no-remote": "1"}
    context.actions.run(outputs=[output], executable="tool", arguments=["text", arguments], env=env, execution_requirements=requirements, input_manifests=[42, output])
    context.actions.run_shell(outputs=[output], command="tool", arguments=(arguments, "text"), env=env, execution_requirements=requirements, input_manifests=None)
    methods = struct(run=context.actions.run, run_shell=context.actions.run_shell)
    print(methods)
"#;
        let file = analysis
            .open_document(
                Path::new("/actions.bzl"),
                Dialect::Bazel,
                None,
                source.into(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for invalid in [
            "arguments=[42]",
            "env={'MODE': 42}",
            "env={42: 'test'}",
            "execution_requirements={'no-remote': False}",
            "input_manifests=42",
            "shadowed_action=output",
            "shadowed_action=None",
        ] {
            for (method, required) in [
                ("run", "executable='tool'"),
                ("run_shell", "command='tool'"),
            ] {
                analysis.update_file(
                    file,
                    format!("{source}    context.actions.{method}(outputs=[output], {required}, {invalid})\n"),
                );
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{method}, {invalid}: {diagnostics:?}");
                };
                assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
                assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
            }
        }
    }

    #[test]
    fn action_execution_inputs_preserve_supplied_metadata() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        for method in ["run", "run_shell"] {
            for name in [
                "arguments",
                "env",
                "execution_requirements",
                "input_manifests",
            ] {
                let mut supplied = builtins.clone();
                supplied
                    .r#type
                    .iter_mut()
                    .find(|class| class.name == "actions")
                    .unwrap()
                    .field
                    .iter_mut()
                    .find(|field| field.name == method)
                    .unwrap()
                    .callable
                    .as_mut()
                    .unwrap()
                    .param
                    .iter_mut()
                    .find(|parameter| parameter.name == name)
                    .unwrap()
                    .r#type = "int".into();
                let (mut analysis, _) = Analysis::new_for_test();
                analysis
                    .set_builtin_defs(supplied, Default::default())
                    .unwrap();
                let required = if method == "run" {
                    "executable='tool'"
                } else {
                    "command='tool'"
                };
                let source = format!("def check(context: ctx[object, object]) -> None:\n    context.actions.{method}(outputs=[], {required}, {name}=42)\n");
                let file = analysis
                    .open_document(
                        Path::new("/metadata.bzl"),
                        Dialect::Bazel,
                        None,
                        source.clone(),
                        1,
                    )
                    .unwrap();
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert!(diagnostics.is_empty(), "{method}, {name}: {diagnostics:?}");
                analysis.update_file(file, source.replace("=42", "='wrong'"));
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{method}, {name}: {diagnostics:?}");
                };
                assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            }
        }
    }

    #[test]
    fn action_resource_set_contracts_follow_bazel_release() {
        let source = r#"def resources(os: str, inputs: int) -> dict[str, int]:
    return {"cpu": inputs}
def fractional_resources(os: str, inputs: int) -> dict[str, float]:
    return {"cpu": 0.5, "memory": inputs}
def wrong_result(os: str, inputs: int) -> dict[str, str]:
    return {"cpu": "many"}
def wrong_parameters(os: int, inputs: str) -> dict[str, int]:
    return {"cpu": 1}
def check(ctx: ctx):
    ctx.actions.run(outputs=[], executable="tool", resource_set=resources)
    ctx.actions.run_shell(outputs=[], command="tool", resource_set=fractional_resources)
    ctx.actions.run(outputs=[], executable="tool", resource_set=None)
"#;
        for (release, dictionary) in [("release 9.2.0", false), ("release 9.3.0", true)] {
            let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
                "../../../starpls/src/builtin/builtin.pb"
            ))
            .unwrap();
            env::apply_versioned_signatures(&mut builtins, release);
            let (mut analysis, _) = Analysis::new_for_test();
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let path = Path::new("/resources.bzl");
            let file = analysis
                .open_document(path, Dialect::Bazel, None, source.to_owned(), 1)
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{release}: {diagnostics:?}");
            for (extra, valid) in [
                ("    numbers: dict[str, int] = {'cpu': 1}\n    ctx.actions.run(outputs=[], executable='tool', resource_set=numbers)", dictionary),
                ("    numbers: dict[str, float] = {'cpu': 0.5}\n    ctx.actions.run_shell(outputs=[], command='tool', resource_set=numbers)", dictionary),
                ("    numbers: dict[Literal['cpu'], int] = {'cpu': 1}\n    ctx.actions.run(outputs=[], executable='tool', resource_set=numbers)", dictionary),
                ("    ctx.actions.run(outputs=[], executable='tool', resource_set={1: 1})", false),
                ("    ctx.actions.run(outputs=[], executable='tool', resource_set={'cpu': 'many'})", false),
                ("    ctx.actions.run_shell(outputs=[], command='tool', resource_set=wrong_result)", false),
                ("    ctx.actions.run(outputs=[], executable='tool', resource_set=wrong_parameters)", false),
            ] {
                analysis.open_document(path, Dialect::Bazel, None, format!("{source}{extra}\n"), 2).unwrap();
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                if valid {
                    assert!(diagnostics.is_empty(), "{release}: {extra}: {diagnostics:?}");
                } else {
                    let [diagnostic] = diagnostics.as_slice() else { panic!("{release}: {extra}: {diagnostics:?}"); };
                    assert_eq!(diagnostic.id().as_str(), "invalid-argument-type", "{release}: {extra}: {diagnostic:?}");
                    assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
                }
            }
        }
    }

    #[test]
    fn aspect_propagation_context_and_callback_contracts() {
        let empty = generate(
            Dialect::Bazel,
            &Builtins::default(),
            &BuildLanguage::default(),
        )
        .unwrap();
        assert!(!empty.contents.contains("_starpls_types.propagation_ctx"));
        assert!(!empty.contents.contains("class _PropagationRule"));
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = r#"def implementation(target, ctx):
    return []
def propagation(ctx: propagation_ctx) -> list[str]:
    label: Label = ctx.rule.label
    rule_name: str = ctx.rule.qualified_kind.rule_name
    definition: Label | None = ctx.rule.qualified_kind.file_label
    parameter: object = ctx.attr.mode
    attribute = getattr(ctx.rule.attr, "deps", None)
    if attribute != None:
        is_tool: bool = attribute.is_tool
        value: object = attribute.value
        (is_tool, value)
    (label, rule_name, definition, parameter)
    return ["deps"]
def toolchains(ctx: propagation_ctx) -> list[Label]:
    return [ctx.rule.label]
def no_context():
    return ["deps"]
def extra_context(ctx, other):
    return ["deps"]
def wrong_element(ctx) -> list[int]:
    return [1]
def wrong_container(ctx) -> tuple[str]:
    return ("deps",)
callback = propagation
aspect(implementation=implementation, attr_aspects=["deps"])
aspect(implementation=implementation, attr_aspects=("deps",))
aspect(implementation=implementation, attr_aspects=callback)
aspect(implementation=implementation, toolchains_aspects=["//tools:type"])
aspect(implementation=implementation, toolchains_aspects=toolchains)
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for invalid in [
            "aspect(implementation=implementation, attr_aspects=no_context)",
            "aspect(implementation=implementation, attr_aspects=extra_context)",
            "aspect(implementation=implementation, attr_aspects=wrong_element)",
            "aspect(implementation=implementation, attr_aspects=wrong_container)",
            "aspect(implementation=implementation, attr_aspects=[1])",
            "aspect(implementation=implementation, toolchains_aspects=propagation)",
            "def bad(ctx: propagation_ctx):\n    wrong: str = ctx.rule.label\n    wrong",
            "def bad(ctx: propagation_ctx):\n    ctx.rule.qualified_kind.file_label.name",
            "def bad(ctx: propagation_ctx):\n    ctx.rule.attr.deps.value.files",
            "def bad(ctx: propagation_ctx):\n    ctx.rule.missing",
            "def bad(ctx: propagation_ctx):\n    ctx.rule.label = Label('//pkg:target')",
        ] {
            analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    format!("{source}{invalid}\n"),
                    2,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
        }
    }

    #[test]
    fn provider_keys_with_missing_instance_metadata_are_gradual() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        builtins
            .r#type
            .retain(|class| class.name != "ConstraintSettingInfo");
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = "def inspect(target: Target):\n    target[platform_common.ConstraintSettingInfo].unknown_member\n";
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn complete_inventory_signatures_take_precedence() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let platform = builtins
            .r#type
            .iter_mut()
            .find(|class| class.name == "platform_common")
            .unwrap();
        let constructor = platform
            .field
            .iter_mut()
            .find(|field| field.name == "ToolchainInfo")
            .unwrap();
        constructor.callable = Some(Callable {
            param: vec![Param {
                name: "value".to_owned(),
                r#type: "string".to_owned(),
                is_mandatory: true,
                ..Default::default()
            }],
            return_type: "ToolchainInfo".to_owned(),
        });
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let source = "platform_common.ToolchainInfo(value='valid')\nplatform_common.ToolchainInfo(value=42)\n";
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
        let range = diagnostic.range().unwrap();
        assert_eq!(
            &source[usize::from(range.start())..usize::from(range.end())],
            "value=42"
        );
    }

    #[test]
    fn string_list_dictionary_attribute_factory_has_static_contract() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"factory = attr.string_list_dict
value: Attribute[dict[str, list[str]]] = factory(default={"srcs": ("a", "b")})
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for invalid in [r#"{1: ["a"]}"#, r#"{"srcs": [1]}"#, "lambda: 1"] {
            analysis.update_file(file, format!("{source}factory(default={invalid})\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
        }
    }

    #[test]
    fn label_list_dictionary_attribute_follows_bazel_release() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let mut older = builtins.clone();
        env::apply_versioned_signatures(&mut older, "release 8.5.0");
        assert!(older
            .r#type
            .iter()
            .find(|class| class.name == "attr")
            .unwrap()
            .field
            .iter()
            .all(|field| field.name != "label_list_dict"));
        env::apply_versioned_signatures(&mut builtins, "release 9.0.0");
        let mut supplied = builtins.clone();
        env::apply_versioned_signatures(&mut builtins, "release 9.0.0");
        assert_eq!(builtins, supplied);

        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = r#"factory = attr.label_list_dict
value = factory(default={"srcs": ("//:a", Label("//:b"))}, skip_validations=True)
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (arguments, expected) in [
            ("default={1: ['//:a']}", "invalid-argument-type"),
            ("default={'srcs': [1]}", "invalid-argument-type"),
            ("default=lambda: 1", "invalid-argument-type"),
            ("materializer=lambda: 1", "unknown-argument"),
        ] {
            analysis.update_file(file, format!("{source}factory({arguments})\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{arguments}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), expected);
        }
        let default = supplied
            .r#type
            .iter_mut()
            .find(|class| class.name == "attr")
            .unwrap()
            .field
            .iter_mut()
            .find(|field| field.name == "label_list_dict")
            .unwrap()
            .callable
            .as_mut()
            .unwrap()
            .param
            .iter_mut()
            .find(|parameter| parameter.name == "default")
            .unwrap();
        default.r#type = "Dictionary: string -> list of Labels".to_owned();
        analysis
            .set_builtin_defs(supplied, Default::default())
            .unwrap();
        analysis.update_file(file, source.to_owned());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn rule_inputs_accept_bazel_attribute_conversions() {
        let function = |name: &str, input: &str| Value {
            name: name.to_owned(),
            callable: Some(Callable {
                param: vec![Param {
                    name: "srcs".to_owned(),
                    r#type: input.to_owned(),
                    is_mandatory: true,
                    ..Default::default()
                }],
                return_type: "None".to_owned(),
            }),
            ..Default::default()
        };
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        builtins
            .global
            .push(function("strict_labels", "List of Labels"));
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                builtins,
                BuildLanguage {
                    rule: [
                        ("label_rule", Discriminator::LabelList),
                        ("mapping_rule", Discriminator::StringListDict),
                        ("keyed_rule", Discriminator::LabelKeyedStringDict),
                        ("string_dict_rule", Discriminator::StringDict),
                    ]
                    .into_iter()
                    .map(|(name, kind)| RuleDefinition {
                        name: name.to_owned(),
                        attribute: vec![AttributeDefinition {
                            name: "srcs".to_owned(),
                            r#type: kind as i32,
                            mandatory: Some(true),
                            ..Default::default()
                        }],
                        ..Default::default()
                    })
                    .collect(),
                },
            )
            .unwrap();
        let source = r#"
def implementation(ctx):
    return []
source_rule = rule(implementation=implementation, attrs={"srcs": attr.label_list(), "mapping": attr.string_list_dict(), "keyed": attr.label_keyed_string_dict()})
paths = native.glob(["*.rs"])
labels = [Label("//:input.rs")]
mapping = {"key": ["value"]}
native.mapping_rule(srcs=mapping)
string_keys = {"//:input": "value"}
native.string_dict_rule(srcs=string_keys)
native.string_dict_rule(srcs=select({"//conditions:default": string_keys}))
label_keys = {Label("//:input"): "value"}
mixed_keys = {"//:input": "one", Label("//:other"): "two"}
native.keyed_rule(srcs=string_keys)
native.keyed_rule(srcs=label_keys)
native.keyed_rule(srcs=mixed_keys)
source_rule(name="string_keys", keyed=string_keys)
source_rule(name="label_keys", keyed=label_keys)
source_rule(name="mixed_keys", keyed=mixed_keys)
source_rule(name="mapping", mapping=mapping)
label_rule(srcs=paths)
native.label_rule(srcs=paths)
source_rule(name="source", srcs=paths)
native.label_rule(srcs=labels)
source_rule(name="labels", srcs=labels)
native.label_rule(srcs=("input.rs", Label("//:other.rs")))
source_rule(name="tuple", srcs=("input.rs", Label("//:other.rs")))
strict_labels(labels)
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for call in [
            "native.label_rule(srcs=42)",
            "native.label_rule(srcs=\"input.rs\")",
            "native.label_rule(srcs=[42])",
            "source_rule(name=\"bad\", srcs=42)",
            "source_rule(name=\"bad\", srcs=\"input.rs\")",
            "source_rule(name=\"bad\", srcs=[42])",
            "strict_labels(paths)",
            "native.keyed_rule(srcs={42: \"bad\"})",
            "source_rule(name=\"bad\", keyed={42: \"bad\"})",
            "native.string_dict_rule(srcs={42: \"value\"})",
            "native.string_dict_rule(srcs={\"key\": 42})",
        ] {
            analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    None,
                    format!("{source}\n{call}\n"),
                    2,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{call}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
            assert!(usize::from(diagnostics[0].range().unwrap().start()) > source.len());
        }
    }

    #[test]
    fn native_rules_are_nominal_keyword_callables() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let rules = BuildLanguage {
            rule: vec![RuleDefinition {
                name: "sources".to_owned(),
                documentation: Some("A rule with source files.".to_owned()),
                attribute: std::iter::once(AttributeDefinition {
                    name: "srcs".to_owned(),
                    r#type: Discriminator::LabelList as i32,
                    documentation: Some("Source file labels.".to_owned()),
                    mandatory: Some(true),
                    ..Default::default()
                })
                .chain(
                    [
                        "generator_name",
                        "generator_function",
                        "generator_location",
                        "generator_custom",
                        "_private",
                    ]
                    .into_iter()
                    .map(|name| AttributeDefinition {
                        name: name.to_owned(),
                        r#type: Discriminator::String as i32,
                        ..Default::default()
                    }),
                )
                .collect(),
                ..Default::default()
            }],
        };
        let (mut analysis, _) = Analysis::new_for_test();
        analysis.set_builtin_defs(builtins, rules).unwrap();
        let source = r#"
def implementation(**kwargs):
    pass
sources(srcs=["//:input"])
native.sources(srcs=["//:input"])
alias = native.sources
alias(srcs=["//:input"])
macro(implementation=implementation, inherit_attrs=native.sources)
macro(implementation=implementation, inherit_attrs=sources)
child = macro(implementation=implementation, inherit_attrs=alias)
child(srcs=["//:input"], name="ok", generator_custom="custom")
custom_rule = rule(implementation=lambda ctx: [], attrs={"count": attr.int(mandatory=True)})
def excluded_kinds():
    if type(native.sources) != "rule":
        native.sources(srcs=42)
    if type(child) != "macro":
        child(name="unreachable", srcs=42)
    if type(custom_rule) != "rule":
        custom_rule(name="unreachable", count="wrong")
    if type(implementation) == "rule":
        implementation(42)
    if type(native.glob) == "macro":
        native.glob(42)
"#;
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        let hover = analysis
            .snapshot()
            .hover(FilePosition {
                file_id: file,
                pos: u32::try_from(source.find("native.sources").unwrap() + 8)
                    .unwrap()
                    .into(),
            })
            .unwrap()
            .unwrap();
        assert!(
            hover.contents.value.contains("srcs:"),
            "{}",
            hover.contents.value
        );
        assert!(
            hover.contents.value.contains("A rule with source files."),
            "{}",
            hover.contents.value
        );
        for callee in ["native.sources", "alias", "child"] {
            let help = analysis
                .snapshot()
                .signature_help(FilePosition {
                    file_id: file,
                    pos: u32::try_from(
                        source.find(&format!("{callee}(srcs=")).unwrap() + callee.len() + 1,
                    )
                    .unwrap()
                    .into(),
                })
                .unwrap()
                .unwrap();
            let [signature] = help.signatures.as_slice() else {
                panic!("{help:?}");
            };
            assert!(
                signature.label.starts_with(&format!("def {callee}(")),
                "{signature:?}"
            );
            let parameter = signature
                .parameters
                .as_ref()
                .unwrap()
                .iter()
                .find(|parameter| parameter.label.starts_with("srcs:"))
                .unwrap();
            if callee == "child" {
                assert!(!signature.label.contains("generator_name"), "{signature:?}");
                assert!(
                    !signature.label.contains("generator_function"),
                    "{signature:?}"
                );
                assert!(
                    !signature.label.contains("generator_location"),
                    "{signature:?}"
                );
                assert!(!signature.label.contains("_private"), "{signature:?}");
                assert!(
                    signature.label.contains(
                        "generator_custom: str | select[str | None, object] | None = None"
                    ),
                    "{signature:?}"
                );
            }
            assert_eq!(
                parameter.documentation.as_deref(),
                Some("Source file labels.")
            );
        }
        for (call, expected) in [
            ("child(name='missing')", "missing-argument"),
            ("child(name='wrong', srcs=42)", "invalid-argument-type"),
            (
                "child(name='removed', srcs=[], generator_name=None)",
                "unknown-argument",
            ),
            ("native.sources()", "missing-argument"),
            ("sources(srcs=42)", "invalid-argument-type"),
            (
                "def guarded():\n    if type(native.sources) == 'rule':\n        native.sources(srcs=42)",
                "invalid-argument-type",
            ),
            (
                "def guarded():\n    if type(child) == 'macro':\n        child(name='wrong', srcs=42)",
                "invalid-argument-type",
            ),
            (
                "def guarded():\n    if type(custom_rule) == 'rule':\n        custom_rule(name='wrong', count='wrong')",
                "invalid-argument-type",
            ),
            (
                "native.sources([\"//:input\"])",
                "too-many-positional-arguments",
            ),
            (
                "macro(implementation=implementation, inherit_attrs=native.glob)",
                "invalid-argument-type",
            ),
        ] {
            analysis.update_file(file, format!("{source}\n{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == expected
                        && diagnostic
                            .range()
                            .is_some_and(|range| range.start().to_usize() >= source.len())),
                "{call}: {diagnostics:?}"
            );
        }
        for annotation in ["rule", "macro"] {
            for (call, expected) in [
                ("value(name='accepted')", None),
                ("value(name='accepted', custom=1)", None),
                ("value()", Some("missing-argument")),
                ("value(name=1)", Some("invalid-argument-type")),
            ] {
                analysis.update_file(
                    file,
                    format!("def invoke(value: {annotation}):\n    {call}\n"),
                );
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let ids: Vec<_> = diagnostics
                    .iter()
                    .map(|diagnostic| diagnostic.id().as_str())
                    .collect();
                assert_eq!(
                    ids,
                    expected.into_iter().collect::<Vec<_>>(),
                    "{annotation}: {call}: {diagnostics:?}"
                );
            }
        }
    }

    #[test]
    fn public_names_preserve_context_specific_declarations() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        builtins.global.push(Value {
            name: "register_toolchains".to_owned(),
            callable: Some(Callable {
                param: vec![Param {
                    name: "number".to_owned(),
                    r#type: "int".to_owned(),
                    is_mandatory: true,
                    ..Default::default()
                }],
                return_type: "None".to_owned(),
            }),
            ..Default::default()
        });
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        for context in [
            APIContext::Bzl,
            APIContext::Module,
            APIContext::Workspace,
            APIContext::Prelude,
        ] {
            let file = analysis
                .open_document(
                    Path::new("/main.bzl"),
                    Dialect::Bazel,
                    Some(starpls_common::FileInfo::Bazel {
                        api_context: context,
                        is_external: false,
                    }),
                    "register_toolchains(1)".to_owned(),
                    1,
                )
                .unwrap();
            let snapshot = analysis.snapshot();
            let diagnostics = snapshot.diagnostics(file).unwrap();
            assert_eq!(
                diagnostics.is_empty(),
                matches!(context, APIContext::Bzl | APIContext::Prelude),
                "{context:?}: {diagnostics:?}"
            );
            let help = snapshot
                .signature_help(FilePosition {
                    file_id: file,
                    pos: 20.into(),
                })
                .unwrap()
                .unwrap();
            let signature = &help.signatures[0].label;
            match context {
                APIContext::Bzl | APIContext::Prelude => {
                    assert_eq!(signature, "def register_toolchains(number: int) -> None")
                }
                APIContext::Module => assert!(
                    signature.contains("str") && signature.contains("dev_dependency"),
                    "{signature}"
                ),
                APIContext::Workspace => assert!(
                    signature.contains("str") && !signature.contains("dev_dependency"),
                    "{signature}"
                ),
                _ => unreachable!(),
            }
        }
    }

    #[test]
    fn workspace_native_functions_use_workspace_contracts() {
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = analysis
            .open_document(
                Path::new("/repositories.bzl"),
                Dialect::Bazel,
                None,
                r#"native.bind(name = "cc_toolchain", actual = "@local_config_cc//:toolchain")
native.register_toolchains("@local_config_cc_toolchains//:all")
native.register_execution_platforms("//platforms:all")
"#
                .to_owned(),
                1,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        analysis.update_file(
            file,
            r#"native.bind(name = 1)
native.bind("invalid", name = "alias")
native.register_toolchains(Label("//toolchains:all"))
native.register_execution_platforms(1)
"#
            .to_owned(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect::<Vec<_>>(),
            [
                "invalid-argument-type",
                "too-many-positional-arguments",
                "invalid-argument-type",
                "invalid-argument-type",
            ],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn native_context_edits_preserve_other_context_and_file_identity() {
        let (mut analysis, _) = Analysis::new_for_test();
        let file = analysis
            .open_document(
                Path::new("/shared.bzl"),
                Dialect::Bazel,
                None,
                "native_value(1)".to_owned(),
                1,
            )
            .unwrap();
        {
            let snapshot = analysis.snapshot();
            let db = &snapshot.db;
            let diagnostics =
                ty_python_semantic::check_file_unwrap(db, db.starlark_program_file(file));
            assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "unresolved-reference");
        }
        let documentation = "A documented native parameter.\n    A continuation.\n\n    ```python\n    if True:\n        value = 1\n    ```";
        let metadata = |ty: &str| Builtins {
            global: vec![Value {
                name: "native_value".to_owned(),
                callable: Some(Callable {
                    param: vec![Param {
                        name: "value".to_owned(),
                        r#type: ty.to_owned(),
                        doc: documentation.to_owned(),
                        is_mandatory: true,
                        ..Default::default()
                    }],
                    return_type: ty.to_owned(),
                }),
                ..Default::default()
            }],
            ..Default::default()
        };
        analysis
            .set_builtin_defs(metadata("string"), Default::default())
            .unwrap();
        let mut identity = None;
        for standard_ty in ["int", "float"] {
            analysis
                .db
                .set_builtin_defs(Dialect::Standard, metadata(standard_ty), Default::default())
                .unwrap();
            let native_file = analysis
                .db
                .files
                .try_virtual_file(&path(Dialect::Standard))
                .unwrap()
                .file();
            if let Some(previous) = identity {
                assert_eq!(native_file, previous);
            }
            identity = Some(native_file);
            for (dialect, expected) in [(Dialect::Standard, standard_ty), (Dialect::Bazel, "str")] {
                let mut file_id = file;
                file_id.dialect = dialect;
                let help = analysis
                    .snapshot()
                    .signature_help(FilePosition {
                        file_id,
                        pos: starpls_syntax::TextSize::new(14),
                    })
                    .unwrap()
                    .unwrap();
                let [signature] = help.signatures.as_slice() else {
                    panic!("{help:?}")
                };
                assert_eq!(
                    signature.label,
                    format!("def native_value(value: {expected}) -> {expected}")
                );
                assert_eq!(
                    signature.parameters.as_ref().unwrap()[0]
                        .documentation
                        .as_deref(),
                    Some("A documented native parameter.  \nA continuation.  \n  \n```python\nif True:\n    value = 1\n```")
                );
                let snapshot = analysis.snapshot();
                let db = &snapshot.db;
                let diagnostics =
                    ty_python_semantic::check_file_unwrap(db, db.starlark_program_file(file_id));
                assert_eq!(
                    diagnostics.len(),
                    usize::from(dialect == Dialect::Bazel),
                    "{diagnostics:?}"
                );
            }
        }
        let mut malformed = metadata("int");
        malformed.global[0].name = "not a name".to_owned();
        assert!(analysis
            .set_builtin_defs(malformed, Default::default())
            .is_err());
        let help = analysis
            .snapshot()
            .signature_help(FilePosition {
                file_id: file,
                pos: starpls_syntax::TextSize::new(14),
            })
            .unwrap()
            .unwrap();
        assert_eq!(
            help.signatures[0].label,
            "def native_value(value: str) -> str"
        );
    }

    #[test]
    fn boolean_conversion_is_limited_to_rule_inputs() {
        let function = |name: &str, returns: &str| Value {
            name: name.to_owned(),
            callable: Some(Callable {
                param: vec![Param {
                    name: "flag".to_owned(),
                    r#type: "Boolean".to_owned(),
                    is_mandatory: true,
                    ..Default::default()
                }],
                return_type: returns.to_owned(),
            }),
            ..Default::default()
        };
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        builtins.global.push(function("strict_bool", "Boolean"));
        builtins.r#type.push(Type {
            name: "BooleanRecord".to_owned(),
            field: vec![Value {
                name: "value".to_owned(),
                r#type: "Boolean".to_owned(),
                ..Default::default()
            }],
            ..Default::default()
        });
        builtins.global.push(Value {
            name: "boolean_record".to_owned(),
            r#type: "BooleanRecord".to_owned(),
            ..Default::default()
        });
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                builtins,
                BuildLanguage {
                    rule: vec![RuleDefinition {
                        name: "boolean_rule".to_owned(),
                        attribute: vec![AttributeDefinition {
                            name: "flag".to_owned(),
                            r#type: Discriminator::Boolean as i32,
                            mandatory: Some(true),
                            ..Default::default()
                        }],
                        ..Default::default()
                    }],
                },
            )
            .unwrap();
        let source = "\
boolean_rule(flag=0)
boolean_rule(flag=1)
boolean_rule(flag=True)
boolean_rule(flag=False)
native.boolean_rule(flag=0)
native.boolean_rule(flag=1)
native.boolean_rule(flag=True)
native.boolean_rule(flag=False)
returned = strict_bool(True)
field = boolean_record.value
strict_bool(False)
";
        let file = analysis
            .open_document(
                Path::new("/booleans.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        {
            let snapshot = analysis.snapshot();
            let db = &snapshot.db;
            let file = db.starlark_program_file(file);
            let diagnostics = ty_python_semantic::check_file_unwrap(db, file);
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
            let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
            let model = SemanticModel::new(db, file);
            for statement in parsed.suite() {
                let Stmt::Assign(assignment) = statement else {
                    continue;
                };
                let ty = assignment.value.inferred_type(&model).unwrap();
                assert_eq!(
                    ty.display(db, &model.program_environment()).to_string(),
                    "bool"
                );
            }
        }
        for (statement, expected) in [
            ("boolean_rule(flag=2)", "invalid-argument-type"),
            ("native.boolean_rule(flag=2)", "invalid-argument-type"),
            ("strict_bool(0)", "invalid-argument-type"),
            ("strict_bool(1)", "invalid-argument-type"),
            (
                "def generic(flag):\n    # type: (int) -> None\n    boolean_rule(flag=flag)",
                "invalid-argument-type",
            ),
            (
                "def generic(flag):\n    # type: (int) -> None\n    native.boolean_rule(flag=flag)",
                "invalid-argument-type",
            ),
            ("annotated = 1 # type: bool", "invalid-assignment"),
        ] {
            analysis.update_file(file, format!("{source}\n{statement}\n"));
            let snapshot = analysis.snapshot();
            let db = &snapshot.db;
            let diagnostics =
                ty_python_semantic::check_file_unwrap(db, db.starlark_program_file(file));
            assert_eq!(diagnostics.len(), 1, "{statement}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), expected, "{statement}");
        }
    }

    #[test]
    fn native_collections_accept_source_values_across_programs() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis
            .set_builtin_defs(
                Builtins {
                    global: vec![Value {
                        name: "consume".to_owned(),
                        callable: Some(Callable {
                            param: vec![Param {
                                name: "values".to_owned(),
                                r#type: "List of ints".to_owned(),
                                is_mandatory: true,
                                ..Default::default()
                            }],
                            return_type: "None".to_owned(),
                        }),
                        ..Default::default()
                    }],
                    ..Default::default()
                },
                Default::default(),
            )
            .unwrap();
        let source = "consume([1])\nvalues = [1]\nconsume(values)\n";
        let file = analysis
            .open_document(
                Path::new("/main.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let snapshot = analysis.snapshot();
        let db = &snapshot.db;
        let diagnostics = ty_python_semantic::check_file_unwrap(db, db.starlark_program_file(file));
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn native_and_source_contracts_cross_build_context() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        fixture.add_file(
            &mut analysis.db,
            "defs.bzl",
            r#"
def consume(value, values, target):
    # type: (int, list[int], Label) -> None
    pass
"#,
        );
        let file = fixture.add_file_with_options(
            &mut analysis.db,
            "BUILD",
            r#"
load("defs.bzl", "consume")
consume(1, [1], Label("//pkg:target"))
values = [1]
consume(1, values, Label("//pkg:target"))
"#,
            Dialect::Bazel,
            Some(starpls_common::FileInfo::Bazel {
                api_context: APIContext::Build,
                is_external: false,
            }),
        );
        loader.add_files_from_fixture(&fixture);
        let snapshot = analysis.snapshot();
        let db = &snapshot.db;
        let diagnostics = ty_python_semantic::check_file_unwrap(db, db.starlark_program_file(file));
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn starlark_intrinsics_use_declared_language_contracts() {
        let (mut analysis, _) = Analysis::new_for_test();
        let file = analysis
            .open_document(
                Path::new("/intrinsics.bzl"),
                Dialect::Bazel,
                None,
                r#"
kind = type(1)
def opaque(value: object) -> object:
    return value
opaque_kind = type(opaque(1))
entries = enumerate(list=[1], start=1)
backwards = reversed({1: 2})
ordered = sorted([1], None, reverse=True)
pairs = zip([1], ["text"])
many = zip([1], ["text"], [True], [2])
iterables: list[list[str]] = [["text"]]
unpacked = zip(*iterables)
printed = print(1)
def stop():
    fail("stop")
"#
                .to_owned(),
                1,
            )
            .unwrap();
        let snapshot = analysis.snapshot();
        let db = &snapshot.db;
        let file = db.starlark_program_file(file);
        let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
        let model = SemanticModel::new(db, file);
        let types: Vec<_> = parsed
            .suite()
            .iter()
            .filter_map(|statement| {
                let Stmt::Assign(assignment) = statement else {
                    return None;
                };
                Some(
                    assignment
                        .value
                        .inferred_type(&model)
                        .unwrap()
                        .display(db, &model.program_environment())
                        .to_string(),
                )
            })
            .collect();
        assert_eq!(
            types,
            [
                "Literal[\"int\"]",
                "str",
                "list[tuple[int, int]]",
                "list[int]",
                "list[int]",
                "list[tuple[int, str]]",
                "list[tuple[int | str | bool, ...]]",
                "list[tuple[str, ...]]",
                "None"
            ]
        );
        let diagnostics = ty_python_semantic::check_file_unwrap(db, file);
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn starlark_type_result_is_static_for_gradual_inputs() {
        let (mut analysis, _) = Analysis::new_for_test();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = "def inspect(value):\n    return type(value)\ndef shadowed(type, value):\n    return type(value)\ndef wrong(value):\n    # type: (...) -> int\n    return type(value)\n";
        let file = analysis
            .open_document(
                Path::new("/type_result.bzl"),
                Dialect::Bazel,
                None,
                source.to_owned(),
                1,
            )
            .unwrap();
        let snapshot = analysis.snapshot();
        let program = snapshot.db.starlark_program_file(file);
        let parsed =
            ruff_db::parsed::parsed_module(&snapshot.db, program.python_file(&snapshot.db))
                .load(&snapshot.db);
        let model = SemanticModel::new(&snapshot.db, program);
        let types: Vec<_> = parsed
            .suite()
            .iter()
            .map(|statement| {
                let Stmt::FunctionDef(function) = statement else {
                    panic!("expected function")
                };
                let Stmt::Return(returned) = function.body.last().unwrap() else {
                    panic!("expected return")
                };
                returned
                    .value
                    .as_ref()
                    .unwrap()
                    .inferred_type(&model)
                    .unwrap()
                    .display(&snapshot.db, &model.program_environment())
                    .to_string()
            })
            .collect();
        assert_eq!(types, ["str", "Unknown", "str"]);
        let diagnostics = snapshot.diagnostics(file).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"),
            "{diagnostics:?}"
        );
        let argument_start = source.find("type(value)").unwrap() + "type(".len();
        assert!(
            diagnostics.iter().any(|diagnostic| {
                diagnostic
                    .concise_message()
                    .to_string()
                    .contains("argument: `Unknown`")
                    && diagnostic.range().is_some_and(|range| {
                        range.start().to_usize() == argument_start
                            && range.end().to_usize() == argument_start + "value".len()
                    })
            }),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn starlark_intrinsic_parameter_kinds() {
        for (source, parameter, index, signatures) in [
            ("enumerate(list=[1$0])", "list:", 0, 1),
            ("sorted([1], None$0)", "key:", 1, 2),
            ("reversed({1: 2$0})", "sequence:", 0, 1),
        ] {
            let (analysis, fixture) = Analysis::from_single_file_fixture(source);
            let (file_id, pos) = fixture.cursor_pos.unwrap();
            let help = analysis
                .snapshot()
                .signature_help(FilePosition { file_id, pos })
                .unwrap()
                .unwrap();
            assert_eq!(help.signatures.len(), signatures, "{source}: {help:?}");
            for signature in &help.signatures {
                assert_eq!(
                    signature.active_parameter,
                    Some(index),
                    "{source}: {help:?}"
                );
                assert!(
                    signature.parameters.as_ref().unwrap()[index]
                        .label
                        .starts_with(parameter),
                    "{source}: {help:?}"
                );
            }
        }
    }
}
