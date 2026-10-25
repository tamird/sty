//! Native factories supply declarations to Ty after its ordinary call checking.

use std::collections::btree_map::Entry;

use ruff_db::files::FilePath;
use ruff_db::files::FileRange;
use ruff_python_ast::find_node::covering_node;
use ruff_python_ast::name::Name;
use ruff_python_ast::AnyNodeRef;
use ruff_python_ast::Arguments;
use ruff_python_ast::Expr;
use ruff_python_ast::HasNodeIndex;
use ruff_python_ast::Stmt;
use ruff_text_size::Ranged;
use starpls_bazel::attr::AttributeKind;
use starpls_hir::Db as _;
use ty_python_core::definition::Definition;
use ty_python_core::definition::DefinitionKind;
use ty_python_core::scope::NodeWithScopeKind;
use ty_python_core::ProgramFile;
use ty_python_semantic::provided::ProvidedBindingValue;
use ty_python_semantic::provided::ProvidedClass;
use ty_python_semantic::provided::ProvidedData;
use ty_python_semantic::provided::ProvidedField;
use ty_python_semantic::provided::ProvidedInstanceDisplay;
use ty_python_semantic::provided::ProvidedInstanceFields;
use ty_python_semantic::types::CallableTypeKind;
use ty_python_semantic::types::CheckedArgument;
use ty_python_semantic::types::CheckedCall;
use ty_python_semantic::types::DictionaryExtraItems;
use ty_python_semantic::types::DictionaryFirstEntry;
use ty_python_semantic::types::DictionaryItem;
use ty_python_semantic::types::DictionaryItemKind;
use ty_python_semantic::types::DictionaryItems;
use ty_python_semantic::types::DynamicType;
use ty_python_semantic::types::IntersectionType;
use ty_python_semantic::types::KnownClass;
use ty_python_semantic::types::Parameter;
use ty_python_semantic::types::ParameterDefault;
use ty_python_semantic::types::ParameterKind;
use ty_python_semantic::types::Parameters;
use ty_python_semantic::types::Signature;
use ty_python_semantic::types::Type;
use ty_python_semantic::types::TypeDefinition;
use ty_python_semantic::types::TypedDictFieldBuilder;
use ty_python_semantic::types::TypedDictOpenness;
use ty_python_semantic::types::TypedDictSchema;
use ty_python_semantic::types::TypedDictType;
use ty_python_semantic::types::UnionType;
use ty_python_semantic::ProgramEnvironment;

use super::forwarded_rule::BoundRule;
use crate::Database;

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub(super) struct Attribute {
    pub(super) kind: AttributeKind,
    pub(super) single_file: Option<bool>,
    pub(super) executable: Option<bool>,
    pub(super) configuration: AttributeConfiguration,
    configurability: Configurability,
    mandatory: Option<bool>,
    default: Option<FileRange>,
    default_value: DefaultValue,
    /// Whether Bazel exposes an implicit build-rule input as `$name`.
    accepts_implicit_input: Option<bool>,
    /// The allowed explicit inputs; the omission default is tracked separately.
    values: Option<ScalarValues>,
    documentation: Option<Box<str>>,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash, get_size2::GetSize)]
enum ScalarValues {
    String(Box<[Box<str>]>),
    Int(Box<[i32]>),
}

impl ScalarValues {
    fn allows_selected_none(&self) -> bool {
        // Bazel converts a selected None to the attribute type's implicit default.
        match self {
            Self::String(values) => values.iter().any(|value| value.is_empty()),
            Self::Int(values) => values.contains(&0),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Hash, get_size2::GetSize)]
enum DefaultValue {
    None,
    NonNone,
    String(Box<str>),
    Int(i32),
    Bool(bool),
    Unknown,
}

impl DefaultValue {
    fn literal_type<'db>(&self, db: &'db Database) -> Option<Type<'db>> {
        match self {
            Self::String(value) => Some(Type::string_literal(db, value.as_ref())),
            Self::Int(value) => Some(Type::int_literal(i64::from(*value))),
            Self::Bool(value) => Some(Type::bool_literal(*value)),
            Self::None | Self::NonNone | Self::Unknown => None,
        }
    }
}

#[derive(Debug, PartialEq, Eq, Hash, get_size2::GetSize)]
pub(super) struct RuleData {
    documentation: Documentation,
    pub(super) attributes: Box<[RuleAttributeData]>,
    /// Additional context attributes, when all possible names are known but
    /// these attributes are only present on some paths.
    pub(super) conditional_context_attributes: Option<Box<[RuleAttributeData]>>,
    pub(super) outputs: Option<RuleOutputs>,
    pub(super) fragments: Fragments,
    pub(super) complete: bool,
    /// Whether the generated call signature has no unresolved shape requirements.
    call_shape_complete: bool,
    /// Whether this rule or an ancestor may run an initializer.
    may_have_initializer: bool,
    pub(super) executable: Option<bool>,
    pub(super) build_setting: Option<BuildSetting>,
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Hash, get_size2::GetSize, salsa::SalsaValue)]
pub(super) struct Fragments {
    pub(super) names: Vec<Name>,
    pub(super) open: bool,
}

impl Fragments {
    pub(super) fn from_expression<'ast, 'name>(
        expression: Option<&'ast Expr>,
        name: impl Fn(&'ast Expr) -> Option<&'name str>,
    ) -> Self {
        let Some(elements) = expression.and_then(literal_sequence_elements) else {
            return Self {
                names: Vec::new(),
                open: true,
            };
        };
        let mut fragments = Self::default();
        for element in elements {
            let Some(name) = name(element) else {
                fragments.open = true;
                continue;
            };
            if starpls_bazel::KNOWN_CONFIGURATION_FRAGMENT_TYPES.contains(&name) {
                fragments.names.push(Name::new(name));
            }
        }
        fragments.normalize();
        fragments
    }

    fn normalize(&mut self) {
        self.names.sort_unstable();
        self.names.dedup();
    }
}

#[derive(Debug, PartialEq, Eq, Hash, get_size2::GetSize)]
pub(super) struct RuleOutputs {
    pub(super) fields: Box<[(Name, FileRange)]>,
    pub(super) complete: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash, get_size2::GetSize)]
pub(super) struct RuleAttributeData {
    pub(super) name: Name,
    pub(super) descriptor: Option<Attribute>,
    pub(super) source: Option<FileRange>,
}

impl RuleAttributeData {
    pub(super) fn conditional_items<'db>(
        db: &'db Database,
        environment: &ProgramEnvironment<'db>,
        file: ProgramFile<'db>,
        items: &[DictionaryItem<'db>],
    ) -> Option<Box<[Self]>> {
        items
            .iter()
            .filter(|item| !item.is_required())
            .map(|item| {
                if item.kind != DictionaryItemKind::Optional {
                    return None;
                }
                let descriptor = item
                    .ty
                    .provided_data(db, environment)?
                    .downcast_ref::<Attribute>()?;
                Some(Self {
                    name: item.name.clone(),
                    descriptor: Some(descriptor.clone()),
                    source: Some(FileRange::new(file.file(db), item.source)),
                })
            })
            .collect()
    }
}

impl RuleData {
    pub(super) fn parameter_type<'db>(
        &self,
        db: &'db Database,
        environment: &ProgramEnvironment<'db>,
        declarations: ProgramFile<'db>,
        name: &str,
    ) -> Option<Type<'db>> {
        let attribute = self.attributes.iter().find(|entry| entry.name == name)?;
        let attribute = attribute.descriptor.as_ref()?;
        let none = Type::none(db, environment);
        let is_private = name.starts_with('_');
        if is_private && attribute.default_value == DefaultValue::None {
            return Some(none);
        }
        let value = attribute
            .finite_value_type(db, environment, is_private)
            .or_else(|| {
                attribute_value_type(
                    db,
                    environment,
                    declarations,
                    &attribute.kind,
                    AttributeUse::MacroContext,
                )
            })?;
        let selected = || {
            // A selected None branch survives conversion into a macro body.
            let alternatives = if is_private {
                value
            } else {
                UnionType::from_elements(db, environment, [value, none])
            };
            let kind = selector_value_kind(db, environment, declarations, alternatives)
                .map_or_else(
                    || KnownClass::Object.to_instance(db, environment),
                    |kind| Type::string_literal(db, kind),
                );
            specialized_native_instance(
                db,
                environment,
                declarations,
                "select",
                vec![alternatives, kind],
            )
        };
        let value = match attribute.configurable() {
            Some(configurable) => {
                if configurable {
                    selected()?
                } else {
                    value
                }
            }
            None => {
                let selected = selected()?;
                UnionType::from_elements(db, environment, [value, selected])
            }
        };
        Some(if !attribute.has_non_none_value() {
            UnionType::from_elements(db, environment, [value, none])
        } else {
            value
        })
    }
}

struct RuleAttribute<'db> {
    name: Name,
    parameter: Option<Parameter<'db>>,
    descriptor: Option<Attribute>,
    analyzed_type: Option<Type<'db>>,
    source: Option<FileRange>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub(super) enum AttributeConfiguration {
    Ordinary,
    Split,
    Unknown,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub(super) enum Configurability {
    Default,
    Explicit(bool),
    Unknown,
}

struct AttributeInput {
    configurable: bool,
    rewritable: bool,
    none_is_omission: bool,
}

impl AttributeInput {
    fn rule(kind: &RuleKind, rewritable: bool) -> Self {
        Self {
            configurable: !matches!(kind, RuleKind::Repository),
            rewritable,
            none_is_omission: true,
        }
    }

    fn tag(none_is_omission: bool) -> Self {
        Self {
            configurable: false,
            rewritable: false,
            none_is_omission,
        }
    }
}

impl Attribute {
    /// The evaluated value in repository contexts and module extension tags.
    pub(super) fn repository_value_type<'db>(
        &self,
        db: &'db Database,
        environment: &ProgramEnvironment<'db>,
        declarations: ProgramFile<'db>,
    ) -> Option<Type<'db>> {
        if self.kind == AttributeKind::Label && self.has_non_none_value() {
            native_class(db, declarations, "Label")?.to_instance_approximation(db, environment)
        } else {
            attribute_value_type(
                db,
                environment,
                declarations,
                &self.kind,
                AttributeUse::RepositoryContext,
            )
        }
    }

    fn implicit_input_name(&self, name: &str, kind: &RuleKind) -> Option<Name> {
        let suffix = name.strip_prefix('_')?;
        if suffix.is_empty() {
            return None;
        }
        match kind {
            RuleKind::Build if self.accepts_implicit_input != Some(false) => {
                Some(Name::new(format!("${suffix}")))
            }
            RuleKind::Build => None,
            RuleKind::Repository => Some(Name::new(name)),
            RuleKind::Macro => None,
        }
    }

    pub(super) fn finite_value_type<'db>(
        &self,
        db: &'db Database,
        environment: &ProgramEnvironment<'db>,
        fixed_default: bool,
    ) -> Option<Type<'db>> {
        let default = self.default_value.literal_type(db);
        if fixed_default && default.is_some() {
            return default;
        }
        let values = self.allowed_value_type(db, environment)?;
        Some(if self.mandatory == Some(true) {
            values
        } else {
            // Bazel validates explicit inputs before filling omitted attributes.
            UnionType::from_elements(db, environment, [values, default?])
        })
    }

    fn allowed_value_type<'db>(
        &self,
        db: &'db Database,
        environment: &ProgramEnvironment<'db>,
    ) -> Option<Type<'db>> {
        let values = self.values.as_ref()?;
        Some(match values {
            ScalarValues::String(values) => UnionType::from_elements(
                db,
                environment,
                values
                    .iter()
                    .map(|value| Type::string_literal(db, value.as_ref())),
            ),
            ScalarValues::Int(values) => UnionType::from_elements(
                db,
                environment,
                values
                    .iter()
                    .map(|value| Type::int_literal(i64::from(*value))),
            ),
        })
    }

    fn input_parameter<'db>(
        &self,
        db: &'db Database,
        environment: &ProgramEnvironment<'db>,
        declarations: ProgramFile<'db>,
        mut parameter: Parameter<'db>,
        options: AttributeInput,
    ) -> Option<Parameter<'db>> {
        let AttributeInput {
            configurable,
            rewritable,
            none_is_omission,
        } = options;
        let input = attribute_value_type(
            db,
            environment,
            declarations,
            &self.kind,
            AttributeUse::Input,
        )?;
        let allowed_values = if rewritable {
            None
        } else {
            self.allowed_value_type(db, environment)
        };
        let ty = allowed_values.unwrap_or(input);
        let ty = if configurable && self.configurable() != Some(false) {
            let allows_selected_none = rewritable
                || self
                    .values
                    .as_ref()
                    .is_none_or(ScalarValues::allows_selected_none);
            configurable_input(db, environment, declarations, ty, allows_selected_none)?
        } else {
            ty
        };
        parameter = parameter.with_annotated_type(ty);
        if self.mandatory != Some(true) {
            parameter = match self.default {
                Some(source) => {
                    let default_type = if allowed_values.is_some() {
                        self.default_value.literal_type(db).unwrap_or(input)
                    } else {
                        ty
                    };
                    parameter.with_default(ParameterDefault::Source {
                        ty: default_type,
                        source,
                    })
                }
                None => parameter.with_default_type(Type::unknown()),
            };
            if none_is_omission {
                parameter = optional_attribute(db, environment, parameter);
            }
        }
        Some(parameter)
    }

    pub(super) fn tag_parameter<'db>(
        &self,
        db: &'db Database,
        environment: &ProgramEnvironment<'db>,
        declarations: ProgramFile<'db>,
        parameter: Parameter<'db>,
        none_is_omission: bool,
    ) -> Option<(Parameter<'db>, bool)> {
        self.input_parameter(
            db,
            environment,
            declarations,
            parameter,
            AttributeInput::tag(none_is_omission),
        )
        .map(|parameter| (parameter, self.mandatory.is_some()))
    }

    pub(super) fn has_non_none_value(&self) -> bool {
        self.mandatory == Some(true)
            || !matches!(
                self.default_value,
                DefaultValue::None | DefaultValue::Unknown
            )
    }

    fn configurable(&self) -> Option<bool> {
        if matches!(self.kind, AttributeKind::Output | AttributeKind::OutputList) {
            return Some(false);
        }
        match self.configurability {
            Configurability::Default => Some(true),
            Configurability::Explicit(value) => Some(value),
            Configurability::Unknown => None,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, get_size2::GetSize)]
pub(super) enum BuildSetting {
    Bool,
    Int,
    String { allow_multiple: Option<bool> },
    StringList,
}

impl BuildSetting {
    pub(super) const ATTRIBUTE_NAMES: [&str; 2] = ["build_setting_default", "help"];

    fn attribute_kind(self) -> AttributeKind {
        match self {
            Self::Bool => AttributeKind::Bool,
            Self::Int => AttributeKind::Int,
            Self::String { allow_multiple: _ } => AttributeKind::String,
            Self::StringList => AttributeKind::StringList,
        }
    }

    pub(super) fn attributes(self) -> [starpls_bazel::attr::Attribute; 2] {
        let [default, help] = Self::ATTRIBUTE_NAMES;
        [
            (
                default,
                self.attribute_kind(),
                "Default value of this build setting.",
                true,
            ),
            (
                help,
                AttributeKind::String,
                "Help text for this build setting.",
                false,
            ),
        ]
        .map(
            |(name, kind, doc, mandatory)| starpls_bazel::attr::Attribute {
                name: name.to_owned(),
                r#type: kind,
                doc: doc.to_owned(),
                default_value: String::new(),
                is_mandatory: mandatory,
                configurable: false,
            },
        )
    }

    pub(super) fn value_type<'db>(
        self,
        db: &'db Database,
        environment: &ProgramEnvironment<'db>,
    ) -> Type<'db> {
        let string = KnownClass::Str.to_instance(db, environment);
        let strings = || KnownClass::List.to_specialized_instance(db, environment, &[string]);
        match self {
            Self::Bool => KnownClass::Bool.to_instance(db, environment),
            Self::Int => KnownClass::Int.to_instance(db, environment),
            Self::String { allow_multiple } => match allow_multiple {
                Some(true) => strings(),
                Some(false) => string,
                None => UnionType::from_elements(db, environment, [string, strings()]),
            },
            Self::StringList => strings(),
        }
    }
}

impl get_size2::GetSize for Attribute {
    fn get_heap_size(&self) -> usize {
        let Self {
            kind: _,
            single_file: _,
            executable: _,
            configuration: _,
            configurability: _,
            mandatory: _,
            default: _,
            default_value,
            accepts_implicit_input: _,
            values,
            documentation,
        } = self;
        documentation.as_ref().map_or(0, |doc| doc.len())
            + get_size2::GetSize::get_heap_size(values)
            + get_size2::GetSize::get_heap_size(default_value)
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Hash, get_size2::GetSize)]
pub(crate) struct Documentation {
    pub(crate) text: Option<Box<str>>,
    pub(crate) parameters: Vec<(Name, Box<str>)>,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash, get_size2::GetSize)]
pub(super) struct ProviderData {
    pub(super) name: Name,
    pub(super) documentation: Documentation,
    /// None denotes an unrestricted field namespace.
    pub(super) fields: Option<Box<[Name]>>,
    pub(super) initializer: ProviderInitializer,
    pub(super) origin: FileRange,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash, get_size2::GetSize)]
pub(super) enum ProviderInitializer {
    None,
    Expression(FileRange),
    Unknown,
}

impl Documentation {
    pub(crate) fn from_data(data: &ProvidedData) -> Option<&Self> {
        data.downcast_ref::<Self>()
            .or_else(|| {
                data.downcast_ref::<RuleData>()
                    .map(|rule| &rule.documentation)
            })
            .or_else(|| {
                data.downcast_ref::<ProviderData>()
                    .map(|provider| &provider.documentation)
            })
            .or_else(|| {
                let key = data.downcast_ref::<super::providers::ProviderKeyData>()?;
                Self::from_data(key.constructor_data.as_ref()?)
            })
    }
}

fn doc_string(db: &Database, call: &CheckedCall<'_, '_>) -> Option<Box<str>> {
    let CheckedArgument::Value { ty, expression: _ } = call.argument("doc") else {
        return None;
    };
    ty.string_literal_value(db).map(Into::into)
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(super) enum KeywordRecord {
    Struct,
    ToolchainInfo,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub(super) enum BuiltinFunction {
    Attribute(AttributeKind),
    BuildSetting(BuildSetting),
    Rule { repository: bool },
    Aspect,
    Subrule,
    Macro,
    TagClass,
    ModuleExtension,
    UseExtension,
    UseRepositoryRule,
    KeywordRecord(KeywordRecord),
    KeywordRecordGetattr(KeywordRecord),
    Getattr,
    Type,
    Provider,
    Select,
    Download { always_blocking: bool },
    ArgsMapEach,
}

// Keep parse and lexical-owner dependencies behind a small, backdated declaration identity.
#[salsa::tracked(returns(clone))]
pub(super) fn declaration<'db>(
    db: &'db dyn ty_python_core::Db,
    definition: Definition<'db>,
) -> Option<BuiltinFunction> {
    let file = definition.program_file(db);
    if matches!(file.file(db).path(db), FilePath::Vendored(path) if path.as_str() == "stdlib/builtins.pyi")
        && matches!(definition.scope(db).node(db), NodeWithScopeKind::Module)
        && definition.name(db).as_deref() == Some("getattr")
    {
        return Some(BuiltinFunction::Getattr);
    }
    let FilePath::SystemVirtual(path) = file.file(db).path(db) else {
        return None;
    };
    if !path.as_str().starts_with("starpls-native:") {
        return None;
    }
    let DefinitionKind::Function(function) = definition.kind(db) else {
        return None;
    };
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let function = function.node(&parsed);
    let scope = definition.scope(db);
    let owner = scope.node(db);
    if let NodeWithScopeKind::Class(class) = owner {
        let parent = scope.scope(db).parent()?.to_scope_id(db, file);
        if matches!(parent.node(db), NodeWithScopeKind::Module) {
            return match (class.node(&parsed).name.as_str(), function.name.as_str()) {
                ("_starpls_annotation_record", "__getattr__") => {
                    Some(BuiltinFunction::KeywordRecordGetattr(KeywordRecord::Struct))
                }
                ("_starpls_provider_platform_common_ToolchainInfo", "__call__") => {
                    Some(BuiltinFunction::KeywordRecord(KeywordRecord::ToolchainInfo))
                }
                _ => None,
            };
        }
        let NodeWithScopeKind::Class(namespace) = parent.node(db) else {
            return None;
        };
        if namespace.node(&parsed).name.as_str() != "_starpls_types" {
            return None;
        }
        return match class.node(&parsed).name.as_str() {
            "repository_ctx" | "module_ctx" => match function.name.as_str() {
                "download" => Some(BuiltinFunction::Download {
                    always_blocking: false,
                }),
                "download_and_extract" => Some(BuiltinFunction::Download {
                    always_blocking: true,
                }),
                _ => None,
            },
            // The legacy namespace is also a struct with optional fields.
            "struct" | "_LegacyGlobals" => (function.name.as_str() == "__getattr__")
                .then_some(BuiltinFunction::KeywordRecordGetattr(KeywordRecord::Struct)),
            "ToolchainInfo" => (function.name.as_str() == "__getattr__").then_some(
                BuiltinFunction::KeywordRecordGetattr(KeywordRecord::ToolchainInfo),
            ),
            "attr" => Some(BuiltinFunction::Attribute(attribute_kind(
                function.name.as_str(),
            )?)),
            "Args" => matches!(function.name.as_str(), "add_all" | "add_joined")
                .then_some(BuiltinFunction::ArgsMapEach),
            "config" => Some(BuiltinFunction::BuildSetting(
                match function.name.as_str() {
                    "bool" => BuildSetting::Bool,
                    "int" => BuildSetting::Int,
                    "string" => BuildSetting::String {
                        allow_multiple: Some(false),
                    },
                    "string_list" => BuildSetting::StringList,
                    _ => return None,
                },
            )),
            _ => None,
        };
    }
    if !matches!(owner, NodeWithScopeKind::Module) {
        return None;
    }
    Some(match function.name.as_str() {
        "rule" => BuiltinFunction::Rule { repository: false },
        "repository_rule" => BuiltinFunction::Rule { repository: true },
        "aspect" => BuiltinFunction::Aspect,
        "subrule" => BuiltinFunction::Subrule,
        "macro" => BuiltinFunction::Macro,
        "tag_class" => BuiltinFunction::TagClass,
        "module_extension" => BuiltinFunction::ModuleExtension,
        "use_extension" => BuiltinFunction::UseExtension,
        "use_repo_rule" => BuiltinFunction::UseRepositoryRule,
        "type" => BuiltinFunction::Type,
        "struct" => BuiltinFunction::KeywordRecord(KeywordRecord::Struct),
        "provider" => BuiltinFunction::Provider,
        "select" => BuiltinFunction::Select,
        _ => return None,
    })
}

fn preserves_argument_order(arguments: &Arguments) -> bool {
    let (Some(first_keyword), Some(Expr::Starred(starred))) =
        (arguments.keywords.first(), arguments.args.last())
    else {
        return true;
    };
    if starred.start() < first_keyword.start() {
        return true;
    }
    // Bazel evaluates a trailing *args after keywords; Python evaluates it first.
    // Moving an empty literal across the keywords cannot change their values.
    match starred.value.as_ref() {
        Expr::List(list) => list.elts.is_empty(),
        Expr::Tuple(tuple) => tuple.elts.is_empty(),
        _ => false,
    }
}

pub(super) fn result<'db>(db: &'db Database, call: &CheckedCall<'_, 'db>) -> Option<Type<'db>> {
    if !preserves_argument_order(&call.call().arguments) {
        return None;
    }
    let source = call.declaration()?;
    let Some(builtin) = declaration(db, source) else {
        let forwarded = BoundRule::bind(db, call, source)?;
        return rule_with_inputs(db, call, RuleKind::Build, Some(&forwarded));
    };
    match builtin {
        BuiltinFunction::Attribute(kind) => attribute(db, call, kind),
        BuiltinFunction::BuildSetting(mut kind) => {
            if let BuildSetting::String { allow_multiple } = &mut kind {
                *allow_multiple = match call.argument("allow_multiple") {
                    CheckedArgument::Omitted => Some(false),
                    CheckedArgument::Value { ty, expression: _ } => ty.as_bool_literal(),
                    CheckedArgument::Indeterminate => None,
                };
            }
            descriptor(db, call, "BuildSetting", ProvidedData::new(kind))
        }
        BuiltinFunction::Rule { repository } => rule(
            db,
            call,
            if repository {
                RuleKind::Repository
            } else {
                RuleKind::Build
            },
        ),
        BuiltinFunction::Macro => rule(db, call, RuleKind::Macro),
        BuiltinFunction::Aspect | BuiltinFunction::Subrule | BuiltinFunction::ArgsMapEach => None,
        BuiltinFunction::TagClass => super::module_extension::tag_class(db, call),
        BuiltinFunction::ModuleExtension => super::module_extension::extension(db, call),
        BuiltinFunction::UseExtension => super::module_extension::proxy(db, call),
        BuiltinFunction::UseRepositoryRule => super::repository_rule::proxy(db, call),
        BuiltinFunction::KeywordRecord(record) => keyword_record(db, call, record),
        BuiltinFunction::Select => selector(db, call),
        BuiltinFunction::KeywordRecordGetattr(_) => None,
        BuiltinFunction::Getattr => super::shapes::getattr_call_result(db, call),
        BuiltinFunction::Type => {
            let CheckedArgument::Value { ty, expression: _ } = call.argument_at(0) else {
                return None;
            };
            (!call.has_binding_errors() && matches!(ty, Type::Dynamic(_))).then(|| {
                KnownClass::Str.to_instance(db, &ProgramEnvironment::from_file(call.file()))
            })
        }
        BuiltinFunction::Provider => provider(db, call),
        BuiltinFunction::Download { always_blocking } => download(db, call, always_blocking),
    }
}

fn download<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
    always_blocking: bool,
) -> Option<Type<'db>> {
    if call.has_binding_errors() {
        return None;
    }
    let environment = ProgramEnvironment::from_file(call.file());
    let declarations = call.declaration()?.program_file(db);
    let string = KnownClass::Str.to_instance(db, &environment);
    let integer = KnownClass::Int.to_instance(db, &environment);
    let checksum = |name| match call.argument(name) {
        CheckedArgument::Omitted => Some(""),
        CheckedArgument::Value { ty, expression: _ } => ty.string_literal_value(db),
        CheckedArgument::Indeterminate => None,
    };
    // A successful download retains the supplied checksum algorithm, or computes
    // SHA-256 when neither checksum is supplied. Invalid checksums still throw.
    let sha256 = if checksum("sha256").is_some_and(|checksum| !checksum.is_empty()) {
        Some(true)
    } else {
        checksum("integrity")
            .map(|integrity| integrity.is_empty() || integrity.starts_with("sha256-"))
    };
    let result = |success: bool| {
        let mut schema = TypedDictSchema::default();
        let mut values = Vec::new();
        let mut field = |name: &str, ty, required| {
            values.push(ty);
            schema.insert(
                Name::new(name),
                TypedDictFieldBuilder::new(ty)
                    .required(required)
                    .read_only(true)
                    .build(),
            );
        };
        field("success", Type::bool_literal(success), true);
        if success {
            field("integrity", string, true);
            if sha256 != Some(false) {
                field("sha256", string, sha256 == Some(true));
            }
            // Bazel added this field in 9.3. The inventory has no result-field
            // version capability, so older hosts must retain possible absence.
            field("size_bytes", integer, false);
        }
        let shape = Type::TypedDict(TypedDictType::from_schema_items_with_openness(
            db,
            schema,
            TypedDictOpenness::Closed,
        ));
        specialized_native_instance(
            db,
            &environment,
            declarations,
            "struct",
            vec![UnionType::from_elements(db, &environment, values), shape],
        )
    };
    let success = result(true)?;
    let completed = if boolean_argument(call, "allow_fail") == Some(false) {
        success
    } else {
        UnionType::from_two_elements(db, &environment, success, result(false)?)
    };
    let block = if always_blocking {
        Some(true)
    } else {
        match call.argument("block") {
            CheckedArgument::Omitted => Some(true),
            CheckedArgument::Value { ty, expression: _ } => ty.as_bool_literal(),
            CheckedArgument::Indeterminate => None,
        }
    };
    if block == Some(true) {
        return Some(completed);
    }
    let pending = specialized_native_instance(
        db,
        &environment,
        declarations,
        "_PendingDownload",
        vec![completed],
    )?;
    Some(if block == Some(false) {
        pending
    } else {
        UnionType::from_two_elements(db, &environment, completed, pending)
    })
}

fn selector<'db>(db: &'db Database, call: &CheckedCall<'_, 'db>) -> Option<Type<'db>> {
    if call.has_binding_errors() {
        return None;
    }
    let CheckedArgument::Value { ty, expression: _ } = call.argument("x") else {
        return None;
    };
    let environment = ProgramEnvironment::from_file(call.file());
    let dictionary = call.dictionary_argument(db, "x");
    let value = match dictionary
        .as_ref()
        .map(|dictionary| &dictionary.first_entry)
    {
        Some(DictionaryFirstEntry::Entry { key: _, value }) => *value,
        Some(DictionaryFirstEntry::Empty) => return None,
        Some(DictionaryFirstEntry::Unknown) | None => match ty {
            Type::Dynamic(_) => ty,
            _ => {
                let (class, specialization) = ty.class_specialization(db, &environment)?;
                if ![KnownClass::Dict, KnownClass::Mapping]
                    .into_iter()
                    .any(|known| Type::from(class) == known.to_class_literal(db, &environment))
                    && !is_exact_dictionary_class(db, &environment, Type::from(class))
                {
                    return None;
                }
                let [_key, value] = specialization.types(db) else {
                    return None;
                };
                // A successful select has a first branch. Its type bounds the possible
                // native categories even when the dictionary order is unknown.
                *value
            }
        },
    };
    let (_, specialization) = call.return_type().class_specialization(db, &environment)?;
    let [payload, _kind] = specialization.types(db) else {
        return None;
    };
    let payload = dictionary
        .as_ref()
        .and_then(|dictionary| selector_literal_payload(db, &environment, dictionary))
        .unwrap_or(*payload);
    let declaration = call.declaration()?;
    let value = value.expand_top_level_aliases(db, &environment);
    let values = match value {
        Type::Union(union) => union.elements(db),
        _ => std::slice::from_ref(&value),
    };
    let alternatives = values
        .iter()
        .map(|value| {
            // A gradual first branch keeps a gradual kind. Keep known alternatives
            // separate so a gradual arm cannot permit an invalid known operation.
            let kind = match value {
                Type::Dynamic(dynamic) => match dynamic {
                    DynamicType::Unknown => *value,
                    DynamicType::Any => *value,
                    _ => return None,
                },
                _ => {
                    let kind = selector_value_kind(
                        db,
                        &environment,
                        declaration.program_file(db),
                        *value,
                    )?;
                    Type::string_literal(db, kind)
                }
            };
            specialized_native_instance(
                db,
                &environment,
                declaration.program_file(db),
                "select",
                vec![payload, kind],
            )
        })
        .collect::<Option<Vec<_>>>()?;
    Some(UnionType::from_elements(db, &environment, alternatives))
}

fn selector_literal_payload<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    dictionary: &DictionaryItems<'db>,
) -> Option<Type<'db>> {
    if !dictionary.is_complete() {
        return None;
    }
    // Captured strings and integers retain their value until selection. A residual
    // entry can contribute a value even though it does not establish key presence.
    let values = dictionary
        .items
        .iter()
        .filter(|item| item.ty.expand_top_level_aliases(db, environment) != Type::Never)
        .map(|item| {
            (item.ty.string_literal_value(db).is_some() || item.ty.as_int_literal().is_some())
                .then_some(item.ty)
        })
        .collect::<Option<Vec<_>>>()?;
    (!values.is_empty()).then(|| UnionType::from_elements(db, environment, values))
}

pub(super) fn is_sequence_class<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    class: Type<'db>,
) -> bool {
    [KnownClass::List, KnownClass::Tuple]
        .into_iter()
        .any(|known| class == known.to_class_literal(db, environment))
}

fn selector_value_kind<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    declarations: ProgramFile<'db>,
    value: Type<'db>,
) -> Option<&'static str> {
    if let Type::Union(union) = value {
        let (first, rest) = union.elements(db).split_first()?;
        let kind = selector_value_kind(db, environment, declarations, *first)?;
        return rest
            .iter()
            .all(|value| selector_value_kind(db, environment, declarations, *value) == Some(kind))
            .then_some(kind);
    }
    for (class, kind) in [
        (KnownClass::Str, "str"),
        (KnownClass::Bool, "bool"),
        (KnownClass::Int, "int"),
        (KnownClass::NoneType, "none"),
        (KnownClass::Range, "list"),
    ] {
        if value.is_subtype_of(db, environment, class.to_instance(db, environment)) {
            return Some(kind);
        }
    }
    if let Some((class, _specialization)) = value.class_specialization(db, environment) {
        if is_exact_dictionary_class(db, environment, Type::from(class)) {
            return Some("dict");
        }
        if is_sequence_class(db, environment, Type::from(class)) {
            return Some("list");
        }
    }
    if native_type_argument(db, environment, declarations, value, "depset").is_some() {
        return Some("depset");
    }
    // Bazel's Label is final and has one native implementation class.
    let label = native_class(db, declarations, "Label")?;
    let label = label.to_instance_approximation(db, environment)?;
    (value == label).then_some("label")
}

fn is_exact_dictionary_class<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    class: Type<'db>,
) -> bool {
    KnownClass::Dict
        .provided_allocation_class(db, environment)
        .map(Type::from)
        == Some(class)
}

pub(super) fn descriptor<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
    name: &str,
    data: ProvidedData,
) -> Option<Type<'db>> {
    let environment = ProgramEnvironment::from_file(call.file());
    let analyzed_base = data.downcast_ref::<Attribute>().and_then(|attribute| {
        let declaration = call.declaration()?;
        let declarations = declaration.program_file(db);
        let value =
            super::context::analyzed_attribute_type(db, &environment, declarations, attribute)
                .unwrap_or_else(Type::unknown);
        specialized_native_class(db, declarations, name, vec![value])
    });
    let bases =
        analyzed_base.map_or_else(|| declared_base(db, call, name), |base| Box::from([base]));
    call.class_type(
        db,
        ProvidedClass {
            name: Name::new(name),
            bases,
            class_members: Box::default(),
            instance_fields: ProvidedInstanceFields {
                fields: Box::default(),
                has_dynamic_fields: false,
                implications: Box::default(),
                data: Some(data),
            }
            .into(),
        },
    )
    .to_instance_approximation(db, &environment)
}

fn attribute_kind(name: &str) -> Option<AttributeKind> {
    Some(match name {
        "bool" => AttributeKind::Bool,
        "int" => AttributeKind::Int,
        "int_list" => AttributeKind::IntList,
        "label" => AttributeKind::Label,
        "label_keyed_string_dict" => AttributeKind::LabelKeyedStringDict,
        "label_list" => AttributeKind::LabelList,
        "label_list_dict" => AttributeKind::StringKeyedLabelListDict,
        "output" => AttributeKind::Output,
        "output_list" => AttributeKind::OutputList,
        "string" => AttributeKind::String,
        "string_dict" => AttributeKind::StringDict,
        "string_list" => AttributeKind::StringList,
        "string_list_dict" => AttributeKind::StringListDict,
        "string_keyed_label_dict" => AttributeKind::StringKeyedLabelDict,
        _ => return None,
    })
}

fn attribute<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
    kind: AttributeKind,
) -> Option<Type<'db>> {
    let environment = ProgramEnvironment::from_file(call.file());
    let declarations = call.declaration()?.program_file(db);
    let is_native_instance = |value: Type<'db>, name: &str| {
        native_class(db, declarations, name)
            .and_then(|class| class.to_instance_approximation(db, &environment))
            .is_some_and(|instance| value.is_subtype_of(db, &environment, instance))
    };
    let mandatory = any_enabled([
        boolean_argument(call, "mandatory"),
        mandatory_attribute_flag(db, call),
    ]);
    let values = match kind {
        AttributeKind::String => {
            scalar_values(call, |ty| ty.string_literal_value(db).map(Box::from))
                .map(ScalarValues::String)
        }
        AttributeKind::Int => scalar_values(call, |ty| {
            let value = ty.as_int_literal()?;
            i32::try_from(value).ok()
        })
        .map(ScalarValues::Int),
        _ => None,
    };
    // Output descriptors expose no default parameter in Bazel's API.
    let default = match kind {
        AttributeKind::Output => CheckedArgument::Omitted,
        AttributeKind::OutputList => CheckedArgument::Omitted,
        _ => call.argument("default"),
    };
    let (default, default_value, accepts_implicit_input) = match default {
        CheckedArgument::Omitted => (
            None,
            match kind {
                AttributeKind::Label | AttributeKind::Output => DefaultValue::None,
                AttributeKind::String => DefaultValue::String(Box::from("")),
                AttributeKind::Int => DefaultValue::Int(0),
                AttributeKind::Bool => DefaultValue::Bool(false),
                _ => DefaultValue::NonNone,
            },
            Some(true),
        ),
        CheckedArgument::Value { ty, expression } => {
            let expression = expression?;
            let file = call.file();
            let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
            let source = FileRange::new(
                file.file(db),
                starpls_syntax::source::expr_range(expression, call.call().into(), parsed.tokens()),
            );
            let declaration = call.declaration()?;
            let input = attribute_value_type(
                db,
                &environment,
                declaration.program_file(db),
                &kind,
                AttributeUse::Input,
            )?;
            let direct_value = ty.is_assignable_to(db, &environment, input);
            let default_value = if ty.is_none(db) {
                DefaultValue::None
            } else if Type::none(db, &environment).is_assignable_to(db, &environment, ty) {
                DefaultValue::Unknown
            } else if direct_value {
                match kind {
                    AttributeKind::String => ty
                        .string_literal_value(db)
                        .map_or(DefaultValue::NonNone, |value| {
                            DefaultValue::String(Box::from(value))
                        }),
                    AttributeKind::Int => ty
                        .as_int_literal()
                        .and_then(|value| i32::try_from(value).ok())
                        .map_or(DefaultValue::NonNone, DefaultValue::Int),
                    AttributeKind::Bool => ty
                        .as_bool_literal()
                        .map_or(DefaultValue::NonNone, DefaultValue::Bool),
                    _ => DefaultValue::NonNone,
                }
            } else {
                // Computed and late-bound defaults do not expose their value here.
                DefaultValue::Unknown
            };
            // Bazel names direct and computed implicit attributes with `$`; late-bound
            // defaults use `:`. The inferred type can leave the source undecided.
            let accepts_implicit_input = if ty.is_none(db)
                || ty.is_subtype_of(db, &environment, input)
                || matches!(ty, Type::FunctionLiteral(_))
                || is_native_instance(ty, "NativeComputedDefault")
            {
                Some(true)
            } else if is_native_instance(ty, "LateBoundDefault") {
                Some(false)
            } else {
                None
            };
            (Some(source), default_value, accepts_implicit_input)
        }
        CheckedArgument::Indeterminate => return None,
    };
    let accepts_implicit_input = if accepts_implicit_input == Some(false)
        || !matches!(kind, AttributeKind::Label | AttributeKind::LabelList)
    {
        accepts_implicit_input
    } else {
        match call.argument("materializer") {
            CheckedArgument::Omitted => accepts_implicit_input,
            CheckedArgument::Value { ty, expression: _ } if ty.is_none(db) => {
                accepts_implicit_input
            }
            CheckedArgument::Value { ty, expression: _ }
                if !Type::none(db, &environment).is_assignable_to(db, &environment, ty) =>
            {
                Some(false)
            }
            CheckedArgument::Indeterminate if keyword_is_absent(call, "materializer") => {
                accepts_implicit_input
            }
            CheckedArgument::Value { .. } | CheckedArgument::Indeterminate => None,
        }
    };
    let flag = |name| match call.argument(name) {
        CheckedArgument::Omitted => Some(false),
        CheckedArgument::Value { ty, expression: _ } => ty.as_bool_literal(),
        CheckedArgument::Indeterminate => None,
    };
    let single_file = match call.argument("allow_single_file") {
        CheckedArgument::Value { ty, expression: _ } => {
            // Bazel sets SINGLE_ARTIFACT for every non-None value, including False.
            let list =
                KnownClass::List.to_specialized_instance(db, &environment, &[Type::unknown()]);
            let boolean = KnownClass::Bool.to_instance(db, &environment);
            if ty.is_none(db) {
                Some(false)
            } else if ty.as_bool_literal().is_some()
                || (matches!(ty, Type::NominalInstance(_))
                    && (ty.is_assignable_to(db, &environment, list)
                        || ty.is_assignable_to(db, &environment, boolean)))
            {
                Some(true)
            } else {
                None
            }
        }
        CheckedArgument::Omitted => Some(false),
        CheckedArgument::Indeterminate => None,
    };
    let configuration = match call.argument("cfg") {
        CheckedArgument::Omitted => AttributeConfiguration::Ordinary,
        CheckedArgument::Value { ty, expression: _ } => {
            if ty == Type::none(db, &environment)
                || matches!(ty.string_literal_value(db), Some("target" | "exec"))
                // Native execution transitions have one destination configuration.
                || is_native_instance(ty, "ExecTransitionFactory")
            {
                AttributeConfiguration::Ordinary
            } else {
                match native_type_argument(db, &environment, declarations, ty, "transition")
                    .and_then(|kind| {
                        kind.expand_top_level_aliases(db, &environment)
                            .string_literal_value(db)
                    }) {
                    Some("split") => AttributeConfiguration::Split,
                    Some("ordinary") => AttributeConfiguration::Ordinary,
                    _ => AttributeConfiguration::Unknown,
                }
            }
        }
        CheckedArgument::Indeterminate => AttributeConfiguration::Unknown,
    };
    let configurability = match call.argument("configurable") {
        CheckedArgument::Omitted => Configurability::Default,
        CheckedArgument::Value { ty, expression: _ } => match ty.as_bool_literal() {
            Some(value) => Configurability::Explicit(value),
            None => Configurability::Unknown,
        },
        CheckedArgument::Indeterminate => Configurability::Unknown,
    };
    descriptor(
        db,
        call,
        "Attribute",
        ProvidedData::new(Attribute {
            kind,
            single_file,
            executable: flag("executable"),
            configuration,
            configurability,
            mandatory,
            default,
            default_value,
            accepts_implicit_input,
            values,
            documentation: doc_string(db, call),
        }),
    )
}

fn scalar_values<'db, T>(
    call: &CheckedCall<'_, 'db>,
    literal: impl Fn(Type<'db>) -> Option<T>,
) -> Option<Box<[T]>> {
    let CheckedArgument::Value { ty: _, expression } = call.argument("values") else {
        return None;
    };
    let elements = literal_sequence_elements(expression?)?;
    // Bazel treats an empty values sequence as unrestricted. Its length must be known,
    // including when the inferred homogeneous element type happens to be a literal.
    if elements.is_empty() {
        return None;
    }
    elements
        .iter()
        .map(|element| {
            let ty = call.expression_type(element)?;
            literal(ty)
        })
        .collect()
}

fn mandatory_attribute_flag<'db>(db: &'db Database, call: &CheckedCall<'_, 'db>) -> Option<bool> {
    if keyword_is_absent(call, "flags") {
        return Some(false);
    }
    match call.argument("flags") {
        CheckedArgument::Omitted => Some(false),
        CheckedArgument::Value { expression, ty: _ } => {
            let mut unknown = false;
            for element in literal_sequence_elements(expression?)? {
                match call
                    .expression_type(element)
                    .and_then(|ty| ty.string_literal_value(db))
                {
                    Some("MANDATORY") => return Some(true),
                    Some(_) => {}
                    None => unknown = true,
                }
            }
            (!unknown).then_some(false)
        }
        CheckedArgument::Indeterminate => None,
    }
}

/// Prove a keyword-only parameter cannot be supplied directly or by unpacking.
fn keyword_is_absent(call: &CheckedCall<'_, '_>, name: &str) -> bool {
    call.call().arguments.keywords.iter().all(|argument| {
        argument
            .arg
            .as_ref()
            .is_some_and(|argument| argument.as_str() != name)
    })
}

pub(super) fn literal_sequence_elements(expression: &Expr) -> Option<&[Expr]> {
    let elements = match expression {
        Expr::List(list) => {
            let ruff_python_ast::ExprList {
                elts,
                ctx: _,
                range: _,
                node_index: _,
            } = list;
            elts
        }
        Expr::Tuple(tuple) => {
            let ruff_python_ast::ExprTuple {
                elts,
                ctx: _,
                range: _,
                node_index: _,
                parenthesized: _,
            } = tuple;
            elts
        }
        _ => return None,
    };
    (!elements.iter().any(Expr::is_starred_expr)).then_some(elements)
}

enum RuleKind {
    Build,
    Repository,
    Macro,
}

fn common_attribute_parameter<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    declarations: ProgramFile<'db>,
    attribute: &starpls_bazel::attr::Attribute,
    kind: &RuleKind,
) -> Option<Parameter<'db>> {
    let ty = attribute_value_type(
        db,
        environment,
        declarations,
        &attribute.r#type,
        AttributeUse::Input,
    )?;
    let ty = if attribute.configurable && !matches!(kind, RuleKind::Repository) {
        configurable_input(db, environment, declarations, ty, true)?
    } else {
        ty
    };
    let parameter = Parameter::keyword_only(Name::new(&attribute.name)).with_annotated_type(ty);
    Some(if attribute.is_mandatory {
        parameter
    } else {
        let parameter = optional_attribute(db, environment, parameter);
        let default = if matches!(kind, RuleKind::Macro) {
            Type::none(db, environment)
        } else {
            Type::unknown()
        };
        parameter.with_default_type(default)
    })
}

/// Keyword arguments forwarded by a wrapper with an explicit `name` parameter.
pub(super) fn common_rule_attrs<'db>(
    db: &'db Database,
    file: ProgramFile<'db>,
    value: Type<'db>,
) -> Option<Type<'db>> {
    let source = db.starlark_file(file)?;
    if source.dialect != starpls_common::Dialect::Bazel || !matches!(value, Type::ClassLiteral(_)) {
        return None;
    }
    let (_, executable) = super::native::COMMON_RULE_ATTRS
        .iter()
        .find(|(name, _)| db.annotation_builtin(source, name) == Some(value))?;
    let environment = ProgramEnvironment::from_file(file);
    let TypeDefinition::StaticClass(definition) = value.definition(db, &environment)? else {
        return None;
    };
    let declarations = definition.program_file(db);
    let rules = db.get_builtin_defs(&source.dialect).rules(db);
    let starpls_bazel::attr::CommonAttributes {
        mut build,
        binary,
        test: _,
        repository: _,
    } = starpls_bazel::attr::make_common_attributes(rules);
    if *executable {
        build.extend(binary);
    }
    let mut fields = TypedDictSchema::default();
    for attribute in build.iter().filter(|attribute| attribute.name != "name") {
        let parameter = common_attribute_parameter(
            db,
            &environment,
            declarations,
            attribute,
            &RuleKind::Build,
        )?;
        let field = TypedDictFieldBuilder::new(parameter.annotated_type())
            .required(!parameter.has_default())
            .build();
        fields.insert(Name::new(&attribute.name), field.clone());
        if let Some(alias) = starpls_bazel::attr::input_alias(&attribute.name) {
            fields.insert(Name::new(alias), field);
        }
    }
    Some(Type::TypedDict(
        TypedDictType::from_schema_items_with_openness(db, fields, TypedDictOpenness::Closed),
    ))
}

fn rule<'db>(db: &'db Database, call: &CheckedCall<'_, 'db>, kind: RuleKind) -> Option<Type<'db>> {
    rule_with_inputs(db, call, kind, None)
}

struct RuleInputs<'call, 'a, 'db> {
    site: &'call CheckedCall<'a, 'db>,
    forwarded: Option<&'call BoundRule<'a, 'db>>,
}

impl<'a, 'db> RuleInputs<'_, 'a, 'db> {
    fn argument(&self, name: &str) -> CheckedArgument<'a, 'db> {
        match self.forwarded {
            Some(bound) => bound.option(name),
            None => self.site.argument(name),
        }
    }

    fn flag(&self, name: &str) -> Option<bool> {
        argument_bool(self.argument(name))
    }

    fn omitted_or(
        &self,
        name: &str,
        predicate: impl FnOnce(Type<'db>, Option<&Expr>) -> bool,
    ) -> bool {
        match self.argument(name) {
            CheckedArgument::Omitted => true,
            CheckedArgument::Value { ty, expression } => predicate(ty, expression),
            CheckedArgument::Indeterminate => keyword_is_absent(self.site, name),
        }
    }
}

fn rule_with_inputs<'a, 'db>(
    db: &'db Database,
    call: &CheckedCall<'a, 'db>,
    kind: RuleKind,
    forwarded: Option<&BoundRule<'a, 'db>>,
) -> Option<Type<'db>> {
    let inputs = RuleInputs {
        site: call,
        forwarded,
    };
    let environment = ProgramEnvironment::from_file(call.file());
    let declaration = match forwarded {
        Some(bound) => bound.forwarder.native,
        None => call.declaration()?,
    };
    let declarations = declaration.program_file(db);
    let rules = db
        .get_builtin_defs(&starpls_common::Dialect::Bazel)
        .rules(db);
    let common = starpls_bazel::attr::make_common_attributes(rules);
    let parent = if matches!(kind, RuleKind::Build) {
        match inputs.argument("parent") {
            CheckedArgument::Omitted => None,
            CheckedArgument::Value { ty, expression: _ } => (!ty.is_none(db)).then_some(ty),
            CheckedArgument::Indeterminate => Some(Type::unknown()),
        }
    } else {
        None
    };
    let parent_data = parent.and_then(|parent| {
        let base = native_class(db, declarations, "rule")?;
        let base = base.to_instance_approximation(db, &environment)?;
        if !parent.is_subtype_of(db, &environment, base) {
            return None;
        }
        let data = parent.provided_data(db, &environment)?;
        data.downcast_ref::<RuleData>()
    });
    let fragments =
        if matches!(kind, RuleKind::Build) && db.environment().options(db).infer_ctx_attributes {
            let mut fragments = match forwarded {
                Some(bound) => bound.fragments(db, call),
                None => super::context::fragment_argument(db, call, call.argument("fragments")),
            };
            if parent.is_some() {
                if let Some(parent) = parent_data {
                    fragments.names.extend_from_slice(&parent.fragments.names);
                    fragments.open |= parent.fragments.open;
                    fragments.normalize();
                } else {
                    fragments.open = true;
                }
            }
            fragments
        } else {
            Fragments::default()
        };
    let outputs = if matches!(kind, RuleKind::Build)
        && db.environment().options(db).infer_ctx_attributes
    {
        match inputs.argument("outputs") {
            CheckedArgument::Omitted => Some(RuleOutputs {
                fields: Box::default(),
                complete: true,
            }),
            CheckedArgument::Indeterminate => None,
            CheckedArgument::Value { expression, ty: _ } => {
                let mapping = match forwarded {
                    Some(_) => expression.and_then(|expr| call.dictionary_items(db, expr)),
                    None => call.dictionary_argument(db, "outputs"),
                };
                let complete = mapping.as_ref().is_some_and(|mapping| {
                    mapping.is_complete() && mapping.items.iter().all(DictionaryItem::is_required)
                });
                let fields = mapping
                    .into_iter()
                    .flat_map(|mapping| mapping.items.into_vec())
                    .filter(DictionaryItem::is_required)
                    .map(|item| (item.name, FileRange::new(call.file().file(db), item.source)))
                    .collect();
                Some(RuleOutputs { fields, complete })
            }
        }
    } else {
        None
    };
    let inherited_initializer =
        parent.is_some() && parent_data.is_none_or(|data| data.may_have_initializer);
    let may_have_initializer = matches!(kind, RuleKind::Build)
        && (inherited_initializer || !inputs.omitted_or("initializer", |ty, _| ty.is_none(db)));
    let test = if matches!(kind, RuleKind::Build) && parent.is_none() {
        any_enabled([inputs.flag("test"), inputs.flag("analysis_test")])
    } else {
        Some(false)
    };
    let executable = if parent.is_some() {
        parent_data.and_then(|data| data.executable)
    } else if matches!(kind, RuleKind::Build) {
        any_enabled([test, inputs.flag("executable")])
    } else {
        Some(false)
    };
    let binary = if parent.is_none() && matches!(kind, RuleKind::Build) {
        match (test, inputs.flag("executable")) {
            (Some(true), _) | (_, Some(false)) => Some(false),
            (Some(false), Some(true)) => Some(true),
            _ => None,
        }
    } else {
        Some(false)
    };
    let mut test_attributes = common.test;
    let mut binary_attributes = common.binary;
    let inherit_common = matches!(inputs.argument("inherit_attrs"), CheckedArgument::Value { ty, expression: _ }
        if ty.string_literal_value(db) == Some("common"));
    let mut common = match kind {
        RuleKind::Build => common.build,
        RuleKind::Repository => common.repository,
        RuleKind::Macro => common
            .build
            .into_iter()
            .filter(|attribute| {
                (inherit_common && !starpls_bazel::attr::is_undocumented(&attribute.name))
                    || matches!(attribute.name.as_str(), "name" | "visibility")
            })
            .collect(),
    };
    let build_setting = if matches!(kind, RuleKind::Build) {
        match inputs.argument("build_setting") {
            CheckedArgument::Omitted => None,
            CheckedArgument::Value { ty, expression: _ } => (!ty.is_none(db)).then_some(ty),
            CheckedArgument::Indeterminate => Some(Type::unknown()),
        }
    } else {
        None
    };
    let setting_kind = build_setting.and_then(|ty| {
        let data = ty.provided_data(db, &environment)?;
        data.downcast_ref::<BuildSetting>().copied()
    });
    if let Some(setting_kind) = setting_kind {
        common.extend(setting_kind.attributes());
    }
    if test == Some(true) {
        common.append(&mut test_attributes);
    }
    if binary == Some(true) {
        common.append(&mut binary_attributes);
    }
    let mut documentation = Documentation {
        text: match inputs.argument("doc") {
            CheckedArgument::Value { ty, expression: _ } => {
                ty.string_literal_value(db).map(Into::into)
            }
            _ => None,
        },
        parameters: common
            .iter()
            .map(|attribute| {
                (
                    Name::new(&attribute.name),
                    attribute.doc.clone().into_boxed_str(),
                )
            })
            .collect(),
    };
    let mut attributes = common
        .into_iter()
        .map(|attribute| {
            let parameter =
                common_attribute_parameter(db, &environment, declarations, &attribute, &kind)?;
            let name = Name::new(&attribute.name);
            Some(RuleAttribute {
                name,
                parameter: Some(parameter),
                source: None,
                analyzed_type: None,
                descriptor: Some(Attribute {
                    kind: attribute.r#type,
                    single_file: Some(false),
                    executable: Some(false),
                    configuration: AttributeConfiguration::Ordinary,
                    configurability: Configurability::Explicit(attribute.configurable),
                    mandatory: Some(attribute.is_mandatory),
                    default: None,
                    default_value: if matches!(kind, RuleKind::Macro)
                        && !attribute.is_mandatory
                        && attribute.name != "visibility"
                    {
                        DefaultValue::None
                    } else {
                        DefaultValue::NonNone
                    },
                    accepts_implicit_input: Some(false),
                    values: None,
                    documentation: Some(attribute.doc.into_boxed_str()),
                }),
            })
        })
        .collect::<Option<Vec<_>>>()?;
    let mut generated_required_inputs_known = build_setting.is_none() || setting_kind.is_some();
    if !generated_required_inputs_known {
        // An unresolved descriptor may be None. Admit its possible attributes
        // without weakening other attributes or accepting arbitrary keywords.
        for name in BuildSetting::ATTRIBUTE_NAMES {
            let name = Name::new(name);
            attributes.push(RuleAttribute {
                parameter: Some(
                    Parameter::keyword_only(name.clone()).with_default_type(Type::unknown()),
                ),
                name,
                descriptor: None,
                analyzed_type: None,
                source: None,
            });
        }
    }
    let uncertain_attributes = test_attributes
        .into_iter()
        .filter(|_| test.is_none())
        .chain(binary_attributes.into_iter().filter(|_| binary.is_none()));
    for attribute in uncertain_attributes {
        generated_required_inputs_known &= !attribute.is_mandatory;
        if !attributes
            .iter()
            .any(|existing| existing.name == attribute.name)
        {
            let name = Name::new(attribute.name);
            attributes.push(RuleAttribute {
                parameter: Some(
                    Parameter::keyword_only(name.clone()).with_default_type(Type::unknown()),
                ),
                name,
                descriptor: None,
                analyzed_type: None,
                source: None,
            });
        }
    }
    let mut complete = match kind {
        RuleKind::Build => match parent {
            Some(parent) => parent_data.is_some_and(|data| {
                inherit_rule_attributes(
                    db,
                    &environment,
                    parent,
                    data,
                    declarations,
                    &mut attributes,
                    &mut documentation,
                )
            }),
            None => true,
        },
        RuleKind::Repository => true,
        RuleKind::Macro => {
            inherit_common
                || inherit_macro_attributes(
                    db,
                    call,
                    declarations,
                    &mut attributes,
                    &mut documentation,
                )
        }
    };
    let uncertain_parent = parent.is_some() && !complete;
    let own_attributes = if let Some(bound) = forwarded {
        Some(bound.attrs.clone())
    } else {
        match inputs.argument("attrs") {
            CheckedArgument::Omitted => Some(DictionaryItems {
                items: Box::default(),
                extra_items: DictionaryExtraItems::Closed,
                first_entry: DictionaryFirstEntry::Empty,
            }),
            CheckedArgument::Value { ty, expression: _ } => {
                if matches!(kind, RuleKind::Repository) && ty.is_none(db) {
                    Some(DictionaryItems {
                        items: Box::default(),
                        extra_items: DictionaryExtraItems::Closed,
                        first_entry: DictionaryFirstEntry::Empty,
                    })
                } else {
                    call.dictionary_argument(db, "attrs")
                }
            }
            CheckedArgument::Indeterminate => None,
        }
    };
    let own_attributes = own_attributes.unwrap_or(DictionaryItems {
        items: Box::default(),
        extra_items: DictionaryExtraItems::Value(Type::unknown()),
        first_entry: DictionaryFirstEntry::Unknown,
    });
    let names_complete = own_attributes.is_complete();
    let DictionaryItems {
        items,
        extra_items,
        first_entry: _,
    } = own_attributes;
    let is_complete = names_complete && items.iter().all(DictionaryItem::is_required);
    let conditional_context_attributes = (names_complete
        && !is_complete
        && !matches!(kind, RuleKind::Macro)
        && parent.is_none()
        && test.is_some()
        && binary.is_some()
        && generated_required_inputs_known)
        .then(|| RuleAttributeData::conditional_items(db, &environment, call.file(), &items))
        .flatten();
    // Initializers receive supplied public Starlark attributes after base-type
    // conversion, but before mandatory and allowed-value checks.
    let initializer_preserves_call_shape = matches!(kind, RuleKind::Build)
        && parent.is_none()
        && is_complete
        && match inputs.argument("initializer") {
            CheckedArgument::Value { ty, expression: _ } => {
                initializer_accepts_rule_attributes(db, &environment, ty)
            }
            CheckedArgument::Omitted | CheckedArgument::Indeterminate => false,
        }
        && items.iter().all(|item| {
            item.name.as_str() != "_legacy_any_type_attrs"
                && is_optional_descriptor(db, &environment, item.ty)
        });
    // Unenumerated optional declarations add no required caller inputs. The
    // rule base, initializer and subrules can also change which calls succeed.
    let mut call_shape_complete = generated_required_inputs_known
        && complete
        && match kind {
            RuleKind::Build => {
                parent_data.is_none_or(|data| data.call_shape_complete)
                    && inputs.omitted_or("dependency_resolution_rule", |ty, _| {
                        ty.as_bool_literal() == Some(false)
                    })
                    && (!may_have_initializer || initializer_preserves_call_shape)
                    && inputs.omitted_or("subrules", |_, expression| {
                        expression
                            .and_then(literal_sequence_elements)
                            .is_some_and(<[Expr]>::is_empty)
                    })
                    && items
                        .iter()
                        .filter(|item| !item.is_required())
                        .all(|item| is_optional_descriptor(db, &environment, item.ty))
                    && match extra_items {
                        DictionaryExtraItems::Closed => true,
                        DictionaryExtraItems::Value(value) => {
                            is_optional_descriptor(db, &environment, value)
                        }
                        DictionaryExtraItems::ParamSpec(_)
                        | DictionaryExtraItems::KeywordTail(_) => false,
                    }
            }
            RuleKind::Repository | RuleKind::Macro => is_complete,
        };
    complete &= is_complete;
    if parent.is_some() && !is_complete {
        // Unseen overrides can replace a public label's default, but not its
        // inherited flags or requiredness.
        for attribute in &mut attributes {
            override_rule_attribute(attribute, None, None);
        }
    }
    if matches!(kind, RuleKind::Macro) && !is_complete {
        // Unknown own attributes can override or remove any inherited contract.
        for RuleAttribute {
            name,
            parameter,
            descriptor,
            analyzed_type,
            source: _,
        } in &mut attributes
        {
            if !matches!(name.as_str(), "name" | "visibility") {
                *parameter = parameter.clone().map(|parameter| {
                    parameter
                        .with_annotated_type(Type::unknown())
                        .with_default_type(Type::unknown())
                });
                *descriptor = None;
                *analyzed_type = None;
            }
        }
    }
    for DictionaryItem {
        name,
        ty: value,
        source,
        kind: _,
    } in IntoIterator::into_iter(items).filter(DictionaryItem::is_required)
    {
        let owner = forwarded
            .and_then(|bound| bound.attribute_owner(&name))
            .unwrap_or(call.file());
        let source = FileRange::new(owner.file(db), source);
        let name = name.as_str();
        if matches!(kind, RuleKind::Macro) && matches!(name, "name" | "visibility") {
            continue;
        }
        if setting_kind.is_some() && BuildSetting::ATTRIBUTE_NAMES.contains(&name) {
            // Bazel rejects declarations that collide with generated attributes.
            continue;
        }
        let attribute = value
            .provided_data(db, &environment)
            .and_then(|data| data.downcast_ref::<Attribute>());
        if matches!(kind, RuleKind::Build) && attribute.is_none() {
            call_shape_complete &= is_optional_descriptor(db, &environment, value);
            if name.starts_with('_') {
                // An unresolved private descriptor may expose an implicit `$name` input.
                complete = false;
            }
        }
        if parent.is_some() {
            if let Some(inherited) = attributes.iter_mut().find(|entry| entry.name == name) {
                override_rule_attribute(inherited, attribute, Some(source));
                continue;
            }
        }
        // An unseen parent may already declare this label attribute. Overrides
        // retain its flags, so the child's descriptor cannot establish them.
        let uncertain_attribute = attribute
            .filter(|attribute| {
                uncertain_parent
                    && !name.starts_with('_')
                    && matches!(
                        attribute.kind,
                        AttributeKind::Label | AttributeKind::LabelList
                    )
            })
            .map(|attribute| Attribute {
                kind: attribute.kind.clone(),
                single_file: None,
                executable: None,
                configuration: AttributeConfiguration::Unknown,
                configurability: Configurability::Unknown,
                mandatory: None,
                default: None,
                default_value: DefaultValue::Unknown,
                accepts_implicit_input: None,
                values: None,
                documentation: attribute.documentation.clone(),
            });
        let attribute = uncertain_attribute.as_ref().or(attribute);
        documentation
            .parameters
            .retain(|(existing, _)| existing.as_str() != name);
        if complete && matches!(kind, RuleKind::Macro) && value.is_none(db) {
            attributes.retain(|attribute| attribute.name.as_str() != name);
            continue;
        }
        let implicit_input_name =
            attribute.and_then(|attribute| attribute.implicit_input_name(name, &kind));
        let uncertain_input = matches!(kind, RuleKind::Build)
            && implicit_input_name.is_some()
            && attribute.is_some_and(|attribute| attribute.accepts_implicit_input.is_none());
        let mut parameter = match implicit_input_name.clone() {
            // If the source is unknown, `$name` is not necessarily the required spelling.
            Some(input)
                if uncertain_input
                    || attribute.is_some_and(|attribute| attribute.mandatory != Some(true)) =>
            {
                Parameter::implicit_keyword_only(input)
            }
            input => Parameter::keyword_only(input.unwrap_or_else(|| Name::new(name))),
        }
        .with_source_range(source);
        if matches!(kind, RuleKind::Macro) && value == Type::none(db, &environment) {
            // A removed macro attribute can be omitted, but cannot accept a value.
            parameter = parameter
                .with_annotated_type(Type::Never)
                .with_default_type(Type::unknown());
        } else if let Some(attribute) = attribute {
            parameter = if inherited_initializer {
                // An ancestor initializer can fill or replace an attribute first
                // declared by this child before Bazel checks the child descriptor.
                parameter.with_default_type(Type::unknown())
            } else {
                attribute.input_parameter(
                    db,
                    &environment,
                    declarations,
                    parameter,
                    AttributeInput::rule(
                        &kind,
                        initializer_preserves_call_shape && !name.starts_with('_'),
                    ),
                )?
            };
            if let Some(doc) = &attribute.documentation {
                documentation
                    .parameters
                    .push((Name::new(name), doc.clone()));
            }
            if uncertain_input {
                // An unresolved source may expose `$name` with this input type, or may
                // expose no `$name` at all. Keep the accepted set bounded by the input.
                let ty = IntersectionType::from_elements(
                    db,
                    &environment,
                    [parameter.annotated_type(), Type::unknown()],
                );
                parameter = parameter.with_annotated_type(ty);
            }
        } else {
            // Keep a known attribute name navigable during recovery. An
            // invalid descriptor supplies no type or requiredness contract.
            parameter = parameter.with_default_type(Type::unknown());
        }
        let parameter = if name.starts_with('_') && implicit_input_name.is_none() {
            // An own private macro keyword may explicitly omit its value.
            matches!(kind, RuleKind::Macro).then(|| {
                parameter
                    .with_annotated_type(Type::none(db, &environment))
                    .with_default_type(Type::none(db, &environment))
            })
        } else {
            Some(parameter)
        };
        let attribute = RuleAttribute {
            name: Name::new(name),
            parameter,
            source: Some(source),
            descriptor: attribute.cloned(),
            analyzed_type: native_type_argument(db, &environment, declarations, value, "Attribute"),
        };
        if let Some(existing) = attributes
            .iter_mut()
            .find(|attribute| attribute.name.as_str() == name)
        {
            *existing = attribute;
        } else {
            attributes.push(attribute);
        }
    }
    let mut parameters = Vec::new();
    let mut descriptors = Vec::new();
    let mut analyzed_types = TypedDictSchema::default();
    for RuleAttribute {
        name,
        parameter,
        descriptor,
        analyzed_type,
        source,
    } in attributes
    {
        call_shape_complete &=
            descriptor
                .as_ref()
                .is_none_or(|attribute| match attribute.mandatory {
                    Some(false) => true,
                    Some(true) => parameter
                        .as_ref()
                        .is_some_and(|parameter| !parameter.has_default()),
                    None => false,
                });
        if matches!(kind, RuleKind::Build) && starpls_bazel::attr::visible_in_rule_context(&name) {
            let value = match &descriptor {
                Some(attribute) => super::context::analyzed_attribute_type(
                    db,
                    &environment,
                    declarations,
                    attribute,
                ),
                None => analyzed_type,
            }
            .unwrap_or_else(Type::unknown);
            analyzed_types.insert(
                name.clone(),
                TypedDictFieldBuilder::new(value)
                    .required(true)
                    .read_only(true)
                    .build(),
            );
        }
        if let Some((parameter, alias)) = parameter.as_ref().zip(
            starpls_bazel::attr::input_alias(&name)
                .filter(|_| matches!(kind, RuleKind::Build | RuleKind::Macro)),
        ) {
            parameters.push(
                Parameter::keyword_only(Name::new(alias))
                    .with_annotated_type(parameter.annotated_type())
                    .with_default_type(Type::unknown()),
            );
        }
        parameters.extend(parameter);
        descriptors.push(RuleAttributeData {
            name,
            descriptor,
            source,
        });
    }
    if !complete {
        // Unknown attribute names remain available for ordinary call checking.
        parameters.push(Parameter::keyword_variadic(Name::new("kwargs")));
    }
    let parameters = Parameters::standard(
        std::iter::once(Parameter::positional_only(Some(Name::new("self")))).chain(parameters),
    );
    let parameters = if call_shape_complete {
        parameters
    } else {
        parameters.with_incomplete_shape()
    };
    let callable =
        Type::function_like_callable(db, Signature::new(parameters, Type::none(db, &environment)));
    let name = match kind {
        RuleKind::Build => "rule",
        RuleKind::Repository => "repository_rule",
        RuleKind::Macro => "macro",
    };
    let bases = if matches!(kind, RuleKind::Build) {
        let openness = if complete {
            TypedDictOpenness::Closed
        } else {
            TypedDictOpenness::ImplicitlyOpen
        };
        let shape = Type::TypedDict(TypedDictType::from_schema_items_with_openness(
            db,
            analyzed_types,
            openness,
        ));
        let base = specialized_native_class(db, declarations, "_AnalyzedRule", vec![shape])?;
        Box::from([base])
    } else {
        declared_base(db, call, name)
    };
    call.class_type(
        db,
        ProvidedClass {
            name: Name::new(name),
            bases,
            class_members: Box::from([(Name::new("__call__"), callable)]),
            instance_fields: ProvidedInstanceFields {
                fields: Box::default(),
                has_dynamic_fields: false,
                implications: Box::default(),
                data: Some(ProvidedData::new(RuleData {
                    documentation,
                    attributes: descriptors.into_boxed_slice(),
                    conditional_context_attributes,
                    outputs,
                    fragments,
                    complete,
                    call_shape_complete,
                    may_have_initializer,
                    executable,
                    build_setting: setting_kind,
                })),
            }
            .into(),
        },
    )
    .to_instance_approximation(db, &environment)
}

fn initializer_accepts_rule_attributes<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    initializer: Type<'db>,
) -> bool {
    if !matches!(initializer, Type::FunctionLiteral(_)) {
        return false;
    }
    let Some(signature) = initializer.single_callable_signature(db, environment) else {
        return false;
    };
    if signature.is_generic()
        || !signature.parameters().is_standard()
        || !signature.parameters().iter().all(|parameter| {
            matches!(
                parameter.kind(),
                ParameterKind::PositionalOrKeyword {
                    name: _,
                    default_type: _,
                } | ParameterKind::KeywordOnly {
                    name: _,
                    default_type: _,
                } | ParameterKind::KeywordVariadic { name: _ }
            )
        })
    {
        return false;
    }
    let object = KnownClass::Object.to_instance(db, environment);
    let initializer = Type::function_like_callable(db, signature.clone().with_return_type(object));
    // Bazel supplies `name` and any caller-supplied public Starlark attributes.
    // This broader domain avoids duplicating Bazel's value conversions.
    let domain = Type::function_like_callable(
        db,
        Signature::new(
            Parameters::standard([
                Parameter::keyword_only(Name::new("name"))
                    .with_annotated_type(KnownClass::Str.to_instance(db, environment)),
                Parameter::keyword_variadic(Name::new("kwargs")).with_annotated_type(object),
            ]),
            object,
        ),
    );
    initializer.is_assignable_to(db, environment, domain)
}

fn is_optional_descriptor<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    ty: Type<'db>,
) -> bool {
    let ty = ty.expand_top_level_aliases(db, environment);
    let alternatives = match ty {
        Type::Never => return true,
        Type::Union(union) => union.elements(db),
        _ => std::slice::from_ref(&ty),
    };
    alternatives.iter().all(|ty| {
        ty.provided_data(db, environment)
            .and_then(|data| data.downcast_ref::<Attribute>())
            .is_some_and(|attribute| attribute.mandatory == Some(false))
    })
}

fn inherit_rule_attributes<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    parent: Type<'db>,
    data: &RuleData,
    declarations: ProgramFile<'db>,
    attributes: &mut Vec<RuleAttribute<'db>>,
    documentation: &mut Documentation,
) -> bool {
    let Some(signature) = callable_signature(db, environment, parent) else {
        return false;
    };
    let shape = native_type_argument(db, environment, declarations, parent, "_AnalyzedRule");
    let shape = shape.and_then(|shape| match shape {
        Type::TypedDict(shape) => Some(shape),
        _ => None,
    });
    attributes.clear();
    documentation
        .parameters
        .clone_from(&data.documentation.parameters);
    let mut complete = data.complete;
    for RuleAttributeData {
        name,
        descriptor,
        source,
    } in &data.attributes
    {
        let input_name = if name.starts_with('_') {
            descriptor
                .as_ref()
                .and_then(|attribute| attribute.implicit_input_name(name, &RuleKind::Build))
        } else {
            Some(name.clone())
        };
        let parameter = input_name.and_then(|input_name| {
            let parameter = signature
                .parameters()
                .iter()
                .find(|parameter| match parameter.kind() {
                    ParameterKind::KeywordOnly {
                        name: parameter_name,
                        default_type: _,
                    } => *parameter_name == input_name,
                    _ => false,
                })
                .cloned();
            complete &= parameter.is_some();
            parameter
        });
        attributes.push(RuleAttribute {
            name: name.clone(),
            parameter,
            descriptor: descriptor.clone(),
            analyzed_type: shape
                .and_then(|shape| shape.items(db).get(name))
                .map(|field| field.declared_type()),
            source: *source,
        });
    }
    complete
}

fn override_rule_attribute(
    inherited: &mut RuleAttribute<'_>,
    attribute: Option<&Attribute>,
    source: Option<FileRange>,
) {
    let RuleAttribute {
        name,
        parameter,
        descriptor,
        analyzed_type,
        source: origin,
    } = inherited;
    let Some(parent) = descriptor else {
        if !name.starts_with('_') {
            *analyzed_type = None;
        }
        return;
    };
    // Bazel permits only public Starlark label attributes to be overridden.
    // The parent retains all flags; only a non-null default and aspects change.
    if origin.is_none()
        || name.starts_with('_')
        || !matches!(parent.kind, AttributeKind::Label | AttributeKind::LabelList)
        || attribute.is_some_and(|attribute| parent.kind != attribute.kind)
    {
        return;
    }
    if let Some(source) = source {
        *origin = Some(source);
        if let Some(parameter) = parameter {
            *parameter = parameter.clone().with_source_range(source);
        }
    }
    if let Some(attribute) = attribute {
        if attribute.default_value == DefaultValue::None {
            return;
        }
        parent.default = attribute.default;
        parent.default_value = attribute.default_value.clone();
    } else {
        // An unknown descriptor may supply a computed default returning None.
        parent.default = None;
        parent.default_value = DefaultValue::Unknown;
    }
    if parent.mandatory != Some(true) {
        if let Some(parameter) = parameter {
            *parameter = match parent.default {
                Some(source) => parameter.clone().with_default(ParameterDefault::Source {
                    ty: parameter.annotated_type(),
                    source,
                }),
                None => parameter.clone().with_default_type(Type::unknown()),
            };
        }
    }
}

fn callable_signature<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    parent: Type<'db>,
) -> Option<Signature<'db>> {
    parent.single_callable_signature(db, environment).cloned()
}

fn boolean_argument(call: &CheckedCall<'_, '_>, name: &str) -> Option<bool> {
    argument_bool(call.argument(name))
}

fn argument_bool(argument: CheckedArgument<'_, '_>) -> Option<bool> {
    match argument {
        CheckedArgument::Omitted => Some(false),
        CheckedArgument::Value { ty, expression: _ } => ty.as_bool_literal(),
        CheckedArgument::Indeterminate => None,
    }
}

fn any_enabled(flags: [Option<bool>; 2]) -> Option<bool> {
    if flags.contains(&Some(true)) {
        Some(true)
    } else if flags.contains(&None) {
        None
    } else {
        Some(false)
    }
}

/// Compose a macro's inherited public attribute contract.
fn inherit_macro_attributes<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
    declarations: ProgramFile<'db>,
    attributes: &mut Vec<RuleAttribute<'db>>,
    documentation: &mut Documentation,
) -> bool {
    let parent = match call.argument("inherit_attrs") {
        CheckedArgument::Omitted => return true,
        CheckedArgument::Indeterminate => return false,
        CheckedArgument::Value { ty, expression: _ } => {
            if ty.is_none(db) {
                return true;
            }
            ty
        }
    };
    let environment = ProgramEnvironment::from_file(call.file());
    if !["rule", "macro"].into_iter().any(|name| {
        declared_class(db, call, name)
            .and_then(|class| class.to_instance_approximation(db, &environment))
            .is_some_and(|base| parent.is_subtype_of(db, &environment, base))
    }) {
        return false;
    }
    let Some(signature) = callable_signature(db, &environment, parent) else {
        return false;
    };
    let parent_documentation = parent
        .provided_data(db, &environment)
        .and_then(Documentation::from_data);
    let parent_data = parent
        .provided_data(db, &environment)
        .and_then(|data| data.downcast_ref::<RuleData>());
    let definition = parent
        .definition(db, &environment)
        .and_then(|definition| definition.definition());
    let native = definition.is_some_and(|definition| {
        matches!(definition.program_file(db).file(db).path(db), FilePath::SystemVirtual(path) if path.as_str().starts_with("starpls-native:"))
    });
    let docstring = definition
        .and_then(|definition| definition.docstring(db))
        .map(ty_ide::Docstring::new);
    let parameter_docs = docstring
        .as_ref()
        .map(ty_ide::Docstring::parameter_documentation)
        .unwrap_or_default();
    let mut complete = true;
    for parameter in signature.parameters().iter() {
        let ParameterKind::KeywordOnly {
            name,
            default_type: _,
        } = parameter.kind()
        else {
            // Native fallback signatures retain nominal identity but have no schema.
            complete = false;
            continue;
        };
        if name.starts_with('_')
            || name.starts_with('$')
            || matches!(name.as_str(), "name" | "visibility")
        {
            continue;
        }
        // Bazel's build-language metadata omits is_documented. These three
        // bookkeeping attributes are explicitly undocumented in Bazel.
        if (native || parent_data.is_some()) && starpls_bazel::attr::is_undocumented(name) {
            continue;
        }
        if signature.parameters().iter().any(|parameter| {
            parameter.name().is_some_and(|canonical| {
                starpls_bazel::attr::input_alias(canonical) == Some(name.as_str())
            })
        }) {
            continue;
        }
        let doc = parent_documentation
            .and_then(|doc| {
                doc.parameters
                    .iter()
                    .find_map(|(key, doc)| (key == name).then(|| doc.clone()))
            })
            .or_else(|| {
                parameter_docs.get(name.as_str()).map(|doc| {
                    ty_ide::DocstringFragment::new(doc)
                        .render(ty_ide::MarkupKind::PlainText)
                        .into_boxed_str()
                })
            });
        if let Some(doc) = doc {
            documentation.parameters.push((name.clone(), doc));
        }
        let parent_attribute =
            parent_data.and_then(|data| data.attributes.iter().find(|entry| entry.name == *name));
        let source = parent_attribute.and_then(|entry| entry.source);
        let mut descriptor = parent_attribute
            .and_then(|entry| entry.descriptor.clone())
            .or_else(|| inherited_native_attribute(db, definition?, name.as_str()));
        let mut parameter = match (parent_data, descriptor.as_ref(), source) {
            (Some(data), Some(descriptor), Some(source)) if data.may_have_initializer => {
                // Macros inherit physical descriptors, independent of the rule's
                // initializer and its caller-facing contract.
                descriptor
                    .input_parameter(
                        db,
                        &environment,
                        declarations,
                        Parameter::keyword_only(name.clone()).with_source_range(source),
                        AttributeInput::rule(&RuleKind::Macro, false),
                    )
                    .unwrap_or_else(|| {
                        complete = false;
                        parameter.clone()
                    })
            }
            _ => parameter.clone(),
        };
        if let Some(descriptor) = &mut descriptor {
            if descriptor.mandatory != Some(true) {
                descriptor.default = None;
                descriptor.default_value = DefaultValue::None;
            }
        }
        if parameter.has_default() {
            parameter = optional_attribute(db, &environment, parameter)
                .with_default_type(Type::none(db, &environment));
        }
        attributes.push(RuleAttribute {
            name: name.clone(),
            parameter: Some(parameter),
            descriptor,
            analyzed_type: None,
            source,
        });
    }
    complete
}

fn optional_attribute<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    parameter: Parameter<'db>,
) -> Parameter<'db> {
    let ty = parameter.annotated_type();
    // An incomplete parent may retain a removed name to reject it through **kwargs.
    if ty == Type::Never {
        return parameter;
    }
    parameter.with_annotated_type(UnionType::from_elements(
        db,
        environment,
        [ty, Type::none(db, environment)],
    ))
}

fn inherited_native_attribute(
    db: &Database,
    definition: Definition<'_>,
    name: &str,
) -> Option<Attribute> {
    let file = definition.program_file(db);
    let FilePath::SystemVirtual(path) = file.file(db).path(db) else {
        return None;
    };
    if !path.as_str().starts_with("starpls-native:") {
        return None;
    }
    let DefinitionKind::Class(class) = definition.kind(db) else {
        return None;
    };
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let class = class.node(&parsed);
    // Native rule classes are generated at module scope; the similarly named
    // nested rule base is only a fallback with no attribute schema.
    if !parsed.suite().iter().any(|statement| matches!(statement, Stmt::ClassDef(candidate) if candidate.range() == class.range())) { return None; }
    let rules = db
        .get_builtin_defs(&starpls_common::Dialect::Bazel)
        .rules(db);
    let rule = rules
        .rule
        .iter()
        .find(|rule| rule.name == class.name.as_str())?;
    let attribute = rule
        .attribute
        .iter()
        .find(|attribute| attribute.name == name)?;
    use starpls_bazel::build::attribute::Discriminator;
    let kind = match attribute.r#type() {
        Discriminator::Boolean => AttributeKind::Bool,
        Discriminator::Integer => AttributeKind::Int,
        Discriminator::IntegerList => AttributeKind::IntList,
        Discriminator::String => AttributeKind::String,
        Discriminator::StringList => {
            if matches!(name, "visibility" | "transitive_configs") {
                AttributeKind::NodepLabelList
            } else {
                AttributeKind::StringList
            }
        }
        Discriminator::StringDict => AttributeKind::StringDict,
        Discriminator::StringListDict => AttributeKind::StringListDict,
        Discriminator::Label => AttributeKind::Label,
        Discriminator::LabelList => AttributeKind::LabelList,
        Discriminator::LabelListDict => AttributeKind::StringKeyedLabelListDict,
        Discriminator::LabelKeyedStringDict => AttributeKind::LabelKeyedStringDict,
        Discriminator::Output => AttributeKind::Output,
        Discriminator::OutputList => AttributeKind::OutputList,
        _ => return None,
    };
    Some(Attribute {
        kind,
        single_file: None,
        executable: None,
        configuration: AttributeConfiguration::Unknown,
        configurability: attribute
            .configurable
            .map_or(Configurability::Unknown, Configurability::Explicit),
        mandatory: Some(attribute.mandatory()),
        default: None,
        default_value: DefaultValue::Unknown,
        accepts_implicit_input: Some(false),
        values: None,
        documentation: attribute.documentation.as_deref().map(Into::into),
    })
}

fn configurable_input<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    declarations: ProgramFile<'db>,
    value: Type<'db>,
    allows_selected_none: bool,
) -> Option<Type<'db>> {
    let alternatives = if allows_selected_none {
        UnionType::from_elements(db, environment, [value, Type::none(db, environment)])
    } else {
        value
    };
    let selected = specialized_native_instance(
        db,
        environment,
        declarations,
        "select",
        vec![
            alternatives,
            KnownClass::Object.to_instance(db, environment),
        ],
    )?;
    Some(UnionType::from_elements(db, environment, [value, selected]))
}

/// Read a native generic projection through ordinary class inheritance.
pub(super) fn native_type_argument<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    declarations: ProgramFile<'db>,
    value: Type<'db>,
    name: &str,
) -> Option<Type<'db>> {
    let class = native_class(db, declarations, name)?;
    let instance = class.to_instance_approximation(db, environment)?;
    let (class, _) = instance.class_specialization(db, environment)?;
    let specialization = value.base_class_specialization(db, environment, class)?;
    let [argument] = specialization.types(db) else {
        return None;
    };
    Some(*argument)
}

pub(super) fn specialized_native_instance<'db>(
    db: &'db dyn ty_python_semantic::Db,
    environment: &ProgramEnvironment<'db>,
    declarations: ProgramFile<'db>,
    name: &str,
    arguments: Vec<Type<'db>>,
) -> Option<Type<'db>> {
    let class = specialized_native_class(db, declarations, name, arguments)?;
    class.to_instance_approximation(db, environment)
}

pub(super) fn specialized_native_class<'db>(
    db: &'db dyn ty_python_semantic::Db,
    declarations: ProgramFile<'db>,
    name: &str,
    arguments: Vec<Type<'db>>,
) -> Option<Type<'db>> {
    let class = native_class(db, declarations, name)?;
    let class = class.as_class_literal()?;
    let specialized = class.apply_specialization(db, |context| context.specialize(db, arguments));
    Some(Type::from(specialized))
}

pub(super) enum AttributeUse<'db> {
    Input,
    BuildContext(Type<'db>),
    RepositoryContext,
    MacroContext,
}

pub(super) fn attribute_value_type<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    declarations: ProgramFile<'db>,
    kind: &AttributeKind,
    usage: AttributeUse<'db>,
) -> Option<Type<'db>> {
    let string = KnownClass::Str.to_instance(db, environment);
    let int = KnownClass::Int.to_instance(db, environment);
    // Bazel copies and converts list attribute inputs; context values are lists.
    let list = |element| {
        let class = match usage {
            AttributeUse::Input => KnownClass::Iterable,
            AttributeUse::BuildContext(_) => KnownClass::List,
            AttributeUse::RepositoryContext => KnownClass::List,
            AttributeUse::MacroContext => KnownClass::List,
        };
        let values = class.to_specialized_instance(db, environment, &[element]);
        if matches!(usage, AttributeUse::Input) {
            if let Some(depset) =
                specialized_native_instance(db, environment, declarations, "depset", vec![element])
            {
                return UnionType::from_elements(db, environment, [values, depset]);
            }
        }
        values
    };
    let dict = |key, value| {
        let class = match usage {
            AttributeUse::Input => KnownClass::Mapping,
            AttributeUse::BuildContext(_) => KnownClass::Dict,
            AttributeUse::RepositoryContext => KnownClass::Dict,
            AttributeUse::MacroContext => KnownClass::Dict,
        };
        class.to_specialized_instance(db, environment, &[key, value])
    };
    let label = || {
        if let AttributeUse::BuildContext(target) = usage {
            return Some(target);
        }
        let declaration = native_class(db, declarations, "Label")?;
        let label = declaration.to_instance_approximation(db, environment)?;
        Some(match usage {
            AttributeUse::Input => UnionType::from_elements(db, environment, [label, string]),
            AttributeUse::BuildContext(_) => label,
            AttributeUse::RepositoryContext => label,
            AttributeUse::MacroContext => label,
        })
    };
    let output = || match usage {
        AttributeUse::Input => label(),
        AttributeUse::BuildContext(_) => {
            let class = native_class(db, declarations, "Label")?;
            class.to_instance_approximation(db, environment)
        }
        AttributeUse::RepositoryContext => Some(Type::unknown()),
        AttributeUse::MacroContext => label(),
    };
    Some(match kind {
        AttributeKind::Bool => {
            let boolean = KnownClass::Bool.to_instance(db, environment);
            match usage {
                // Bazel converts only integer 0 and 1 at attribute inputs.
                AttributeUse::Input => UnionType::from_elements(
                    db,
                    environment,
                    [boolean, Type::int_literal(0), Type::int_literal(1)],
                ),
                AttributeUse::BuildContext(_) => boolean,
                AttributeUse::RepositoryContext => boolean,
                AttributeUse::MacroContext => boolean,
            }
        }
        AttributeKind::Int => int,
        AttributeKind::IntList => list(int),
        AttributeKind::String => string,
        AttributeKind::StringList => list(string),
        AttributeKind::StringDict => dict(string, string),
        AttributeKind::StringListDict => dict(string, list(string)),
        AttributeKind::Label => {
            let label = label()?;
            match usage {
                AttributeUse::BuildContext(_) => {
                    UnionType::from_elements(db, environment, [label, Type::none(db, environment)])
                }
                AttributeUse::Input => label,
                AttributeUse::MacroContext => label,
                AttributeUse::RepositoryContext => {
                    UnionType::from_elements(db, environment, [label, Type::none(db, environment)])
                }
            }
        }
        AttributeKind::LabelList => list(label()?),
        AttributeKind::NodepLabelList => {
            let label = native_class(db, declarations, "Label")?
                .to_instance_approximation(db, environment)?;
            let element = match usage {
                AttributeUse::Input => UnionType::from_elements(db, environment, [label, string]),
                AttributeUse::BuildContext(_)
                | AttributeUse::RepositoryContext
                | AttributeUse::MacroContext => label,
            };
            list(element)
        }
        AttributeKind::LabelKeyedStringDict => {
            let keys = label()?;
            match usage {
                AttributeUse::Input => {
                    let label = native_class(db, declarations, "Label")?
                        .to_instance_approximation(db, environment)?;
                    // Mapping keys are invariant; inputs can use either or both kinds.
                    UnionType::from_elements(
                        db,
                        environment,
                        [
                            dict(label, string),
                            dict(string, string),
                            dict(keys, string),
                        ],
                    )
                }
                AttributeUse::BuildContext(_) => dict(keys, string),
                AttributeUse::RepositoryContext => dict(keys, string),
                AttributeUse::MacroContext => dict(keys, string),
            }
        }
        AttributeKind::StringKeyedLabelDict => dict(string, label()?),
        AttributeKind::StringKeyedLabelListDict => dict(string, list(label()?)),
        AttributeKind::Output => {
            let output = output()?;
            match usage {
                AttributeUse::BuildContext(_) => {
                    UnionType::from_elements(db, environment, [output, Type::none(db, environment)])
                }
                AttributeUse::Input => output,
                AttributeUse::RepositoryContext => output,
                AttributeUse::MacroContext => output,
            }
        }
        AttributeKind::OutputList => list(output()?),
    })
}

fn keyword_record<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
    record: KeywordRecord,
) -> Option<Type<'db>> {
    if call.has_binding_errors() {
        return None;
    }
    let environment = ProgramEnvironment::from_file(call.file());
    let mut fields = Vec::new();
    let mut shape = TypedDictSchema::default();
    let mut openness = TypedDictOpenness::Closed;
    let mut extra_values = Vec::new();
    let mut insert_field = |field: ProvidedField<'db>, required: bool| {
        let schema_field = TypedDictFieldBuilder::new(field.ty)
            .required(required)
            .read_only(true)
            .build();
        match shape.entry(field.name.clone()) {
            Entry::Occupied(mut entry) => {
                if entry.get().is_required() {
                    return;
                }
                entry.insert(schema_field);
            }
            Entry::Vacant(entry) => {
                entry.insert(schema_field);
            }
        }
        if required {
            fields.push(field);
        }
    };
    for keyword in &call.call().arguments.keywords {
        match &keyword.arg {
            Some(name) => {
                let ty = call.expression_type(&keyword.value)?;
                insert_field(
                    ProvidedField {
                        name: name.id.clone(),
                        ty,
                        is_required: true,
                        source: Some(FileRange::new(call.file().file(db), name.range())),
                    },
                    true,
                );
            }
            None => {
                let Some(DictionaryItems {
                    items,
                    extra_items,
                    first_entry: _,
                }) = call.dictionary_items(db, &keyword.value)
                else {
                    openness = TypedDictOpenness::ImplicitlyOpen;
                    extra_values.push(Type::unknown());
                    continue;
                };
                if let Some(ty) = extra_items.value_type() {
                    openness = TypedDictOpenness::ImplicitlyOpen;
                    extra_values.push(ty);
                }
                for item in items {
                    let required = item.is_required();
                    let DictionaryItem {
                        name,
                        ty,
                        kind: _,
                        source,
                    } = item;
                    insert_field(
                        ProvidedField {
                            name,
                            ty,
                            is_required: true,
                            source: Some(FileRange::new(call.file().file(db), source)),
                        },
                        required,
                    );
                }
            }
        }
    }
    let instance = match record {
        KeywordRecord::Struct => {
            let values = UnionType::from_elements(
                db,
                &environment,
                extra_values
                    .into_iter()
                    .chain(shape.values().map(|field| field.declared_type())),
            );
            let shape = Type::TypedDict(TypedDictType::from_schema_items_with_openness(
                db, shape, openness,
            ));
            specialized_native_class(
                db,
                call.declaration()?.program_file(db),
                "struct",
                vec![values, shape],
            )?
            .to_instance_approximation(db, &environment)?
        }
        KeywordRecord::ToolchainInfo => call.return_type(),
    };
    instance.with_provided_instance_fields(
        db,
        fields.into_boxed_slice(),
        ProvidedInstanceDisplay::ClassName,
    )
}

fn provider<'db>(db: &'db Database, call: &CheckedCall<'_, 'db>) -> Option<Type<'db>> {
    let environment = ProgramEnvironment::from_file(call.file());
    let initializer = match call.argument("init") {
        CheckedArgument::Omitted => None,
        CheckedArgument::Indeterminate => return None,
        CheckedArgument::Value { ty, expression: _ } => (!ty.is_none(db)).then_some(ty),
    };
    let name = provider_name(db, call, initializer.is_some());
    let key_base = declared_class(db, call, "Provider")?;
    if let Some(class) = db.provider_interface(call.file(), call.call().node_index().load()) {
        let key = super::providers::key_value(
            db,
            call.file(),
            class,
            key_base,
            initializer,
            &environment,
        )?;
        if initializer.is_none() {
            return Some(key);
        }
        let fields = super::interface::provider_fields(db, class, &environment)?;
        let parameters = fields
            .into_iter()
            .map(
                |ProvidedField {
                     name,
                     ty,
                     is_required,
                     source,
                 }| {
                    let mut parameter = Parameter::keyword_only(name).with_annotated_type(ty);
                    if !is_required {
                        parameter = parameter.with_default_type(Type::unknown());
                    }
                    match source {
                        Some(source) => parameter.with_source_range(source),
                        None => parameter,
                    }
                },
            )
            .chain(super::providers::raw_extra_parameters(db, call, class));
        let parameters = Parameters::standard(parameters);
        let definition = class.definition(db, &environment)?;
        let signature = match definition {
            TypeDefinition::Function(definition) => {
                let signature = super::providers::constructor_signature(db, definition)?;
                signature.with_parameters(parameters)
            }
            _ => {
                let instance = super::providers::constructor_instance(db, class, call.file())?;
                Signature::new(parameters, instance)
            }
        };
        let raw = Type::single_callable(db, signature);
        return Some(Type::heterogeneous_tuple(db, &environment, [key, raw]));
    }
    let mut fields: Vec<ProvidedField<'_>> = Vec::new();
    let mut open = false;
    let mut documentation = Documentation {
        text: doc_string(db, call),
        parameters: Vec::new(),
    };
    match call.argument("fields") {
        CheckedArgument::Omitted => open = true,
        CheckedArgument::Indeterminate => return None,
        CheckedArgument::Value { ty, expression } => {
            if ty.is_none(db) {
                open = true;
            } else {
                let names: Option<Vec<_>> = match expression? {
                    Expr::List(list) => Some(list.elts.iter().collect()),
                    Expr::Tuple(tuple) => Some(tuple.elts.iter().collect()),
                    _ => None,
                };
                if let Some(names) = names {
                    for expression in names {
                        let ty = call.expression_type(expression)?;
                        let name = Name::new(ty.string_literal_value(db)?);
                        if !fields.iter().any(|field| field.name == name) {
                            fields.push(ProvidedField {
                                name,
                                ty: Type::unknown(),
                                is_required: true,
                                source: Some(FileRange::new(
                                    call.file().file(db),
                                    expression.range(),
                                )),
                            });
                        }
                    }
                } else {
                    let mapping = call.dictionary_argument(db, "fields")?;
                    let is_complete = mapping.is_complete();
                    let DictionaryItems {
                        items,
                        extra_items: _,
                        first_entry: _,
                    } = mapping;
                    open = !is_complete || items.iter().any(|item| !item.is_required());
                    for DictionaryItem {
                        name,
                        ty,
                        source,
                        kind: _,
                    } in IntoIterator::into_iter(items).filter(DictionaryItem::is_required)
                    {
                        if let Some(doc) = ty.string_literal_value(db) {
                            documentation.parameters.push((name.clone(), doc.into()));
                        }
                        fields.push(ProvidedField {
                            name,
                            ty: Type::unknown(),
                            is_required: true,
                            source: Some(FileRange::new(call.file().file(db), source)),
                        });
                    }
                }
            }
        }
    }
    // Untyped providers accept arbitrary field values; field reads remain unknown.
    let value_type = KnownClass::Object.to_instance(db, &environment);
    let mut parameters: Vec<_> = fields
        .iter()
        .map(
            |ProvidedField {
                 name,
                 ty: _,
                 is_required: _,
                 source,
             }| {
                let parameter = Parameter::keyword_only(name.clone())
                    .with_annotated_type(value_type)
                    .with_default_type(Type::unknown());
                match source {
                    Some(source) => parameter.with_source_range(*source),
                    None => parameter,
                }
            },
        )
        .collect();
    if open {
        parameters
            .push(Parameter::keyword_variadic(Name::new("kwargs")).with_annotated_type(value_type));
    }
    let self_parameter = || Parameter::positional_only(Some(Name::new("self")));
    let init = if let Some(initializer) = initializer {
        initializer.map_callable_signatures(
            db,
            &environment,
            CallableTypeKind::FunctionLike,
            |signature| {
                let parameters =
                    std::iter::once(self_parameter()).chain(signature.parameters().iter().cloned());
                let parameters = Parameters::from_annotation(db, parameters);
                signature
                    .with_parameters(parameters)
                    .with_return_type(Type::none(db, &environment))
            },
        )?
    } else {
        Type::function_like_callable(
            db,
            Signature::new(
                Parameters::standard(std::iter::once(self_parameter()).chain(parameters.clone())),
                Type::none(db, &environment),
            ),
        )
    };
    let data = ProviderData {
        name: name.unwrap_or_else(|| Name::new("provider")),
        origin: FileRange::new(call.file().file(db), call.call().range()),
        documentation: documentation.clone(),
        fields: (!open).then(|| fields.iter().map(|field| field.name.clone()).collect()),
        initializer: match call.argument("init") {
            CheckedArgument::Value { ty, expression } => {
                if ty.is_none(db) {
                    ProviderInitializer::None
                } else {
                    expression.map_or(ProviderInitializer::Unknown, |expression| {
                        ProviderInitializer::Expression(FileRange::new(
                            call.file().file(db),
                            expression.range(),
                        ))
                    })
                }
            }
            CheckedArgument::Omitted => ProviderInitializer::None,
            CheckedArgument::Indeterminate => return None,
        },
    };
    let class = call.class_type(
        db,
        ProvidedClass {
            name: data.name.clone(),
            bases: declared_base(db, call, "ProviderInstance"),
            class_members: Box::from([(Name::new("__init__"), init)]),
            instance_fields: ProvidedInstanceFields {
                fields: fields.into_boxed_slice(),
                has_dynamic_fields: open,
                implications: Box::default(),
                data: Some(ProvidedData::new(data.clone())),
            }
            .into(),
        },
    );
    let key =
        super::providers::key_value(db, call.file(), class, key_base, initializer, &environment)?;
    if initializer.is_some() {
        let instance = class.to_instance_approximation(db, &environment)?;
        let raw = Type::single_callable(
            db,
            Signature::new(Parameters::standard(parameters), instance),
        )
        .with_callable_data(db, ProvidedData::new(data))?;
        Some(Type::heterogeneous_tuple(db, &environment, [key, raw]))
    } else {
        Some(key)
    }
}

fn provider_name(db: &Database, call: &CheckedCall<'_, '_>, initialized: bool) -> Option<Name> {
    let parsed = ruff_db::parsed::parsed_module(db, call.file().python_file(db)).load(db);
    let node = covering_node(parsed.syntax().into(), call.call().range());
    node.parent().and_then(|parent| {
        let AnyNodeRef::StmtAssign(assignment) = parent else {
            return None;
        };
        let [target] = assignment.targets.as_slice() else {
            return None;
        };
        let target = match target {
            Expr::Tuple(tuple) => {
                if !initialized {
                    return None;
                }
                tuple.elts.first()?
            }
            _ => target,
        };
        let Expr::Name(name) = target else {
            return None;
        };
        Some(name.id.clone())
    })
}

fn declared_base<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
    name: &str,
) -> Box<[Type<'db>]> {
    declared_class(db, call, name).into_iter().collect()
}

fn declared_class<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
    name: &str,
) -> Option<Type<'db>> {
    let declaration = call.declaration()?;
    native_class(db, declaration.program_file(db), name)
}

pub(super) fn native_class<'db>(
    db: &'db dyn ty_python_semantic::Db,
    file: ProgramFile<'db>,
    name: &str,
) -> Option<Type<'db>> {
    ProvidedBindingValue::Export {
        value: None,
        file,
        name: Name::new(format!("_starpls_annotation_{name}")),
    }
    .resolve_type(db)
}

#[cfg(test)]
mod tests {
    use ty_python_semantic::HasType;
    use ty_python_semantic::SemanticModel;

    use super::*;
    use crate::Analysis;
    use crate::FilePosition;

    #[test]
    fn download_results_preserve_flags_and_checksums() {
        for host in ["repository_ctx", "module_ctx"] {
            for method in ["download", "download_and_extract"] {
                let source = format!(
                    r#"def text(value: str) -> None:
    pass
def yes(value: Literal[True]) -> None:
    pass
def integer(value: int) -> None:
    pass
def inspect(ctx: {host}, allow: bool, checksum: str, options: dict[{{'allow_fail': NotRequired[bool]}}]) -> None:
    result = ctx.{method}(url='https://example.com')
    yes(result.success)
    text(result.integrity)
    text(result.sha256)
    text(ctx.{method}(url='https://example.com', sha256='0000000000000000000000000000000000000000000000000000000000000000').sha256)
    unpacked = ctx.{method}(url='https://example.com', **{{'allow_fail': False}})
    if unpacked.success:
        text(unpacked.sha256)
    unpacked = ctx.{method}(url='https://example.com', **options)
    if unpacked.success:
        text(unpacked.integrity)
    result = ctx.{method}(url='https://example.com', allow_fail=allow)
    if result.success:
        text(result.integrity)
        text(result.sha256)
    text(ctx.{method}(url='https://example.com', integrity='sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=').sha256)
    text(ctx.{method}(url='https://example.com', integrity='sha384-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA').integrity)
    result = ctx.{method}(url='https://example.com', integrity=checksum)
    if hasattr(result, 'sha256'):
        text(result.sha256)
    if hasattr(result, 'size_bytes'):
        integer(result.size_bytes)
"#
                );
                let (mut analysis, fixture) = Analysis::from_single_file_fixture(&source);
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
                        &[
                            ("non-static-type".into(), "error".into()),
                            ("possibly-missing-attribute".into(), "error".into()),
                        ]
                        .into(),
                    )
                    .unwrap(),
                );
                let file = fixture.main_file();
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert!(diagnostics.is_empty(), "{host}.{method}: {diagnostics:?}");
                for (extra, expected) in [
                    ("text(result.success)", "invalid-argument-type"),
                    ("text(result.sha256)", "possibly-missing-attribute"),
                    ("result.missing", "unresolved-attribute"),
                    ("result.size_bytes", "possibly-missing-attribute"),
                    ("unpacked.integrity", "unresolved-attribute"),
                    (
                        "ctx.METHOD(url='https://example.com', integrity='sha384-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA').sha256",
                        "unresolved-attribute",
                    ),
                    (
                        "failed = ctx.METHOD(url='https://example.com', allow_fail=True)\n    if not failed.success:\n        failed.integrity",
                        "unresolved-attribute",
                    ),
                    (
                        "ctx.METHOD(url='https://example.com', allow_fail=42)",
                        "invalid-argument-type",
                    ),
                ] {
                    let extra = extra.replace("METHOD", method);
                    analysis.update_file(file, format!("{source}    {extra}\n"));
                    let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                    let [diagnostic] = diagnostics.as_slice() else {
                        panic!("{host}.{method}, {extra}: {diagnostics:?}");
                    };
                    assert_eq!(diagnostic.id().as_str(), expected, "{extra}: {diagnostic:?}");
                    assert!(diagnostic.range().unwrap().start().to_usize() >= source.len());
                }
            }
        }
    }

    #[test]
    fn pending_downloads_preserve_completed_results() {
        let source = r#"def text(value: str) -> None:
    pass
def inspect(ctx: repository_ctx, allow: bool, block: bool) -> None:
    pending = ctx.download(url='https://example.com', block=False)
    text(pending.wait().sha256)
    unpacked = ctx.download(url='https://example.com', **{'block': False, 'allow_fail': allow})
    if hasattr(unpacked, 'wait'):
        completed = unpacked.wait()
        if completed.success:
            text(completed.integrity)
    pending = ctx.download(url='https://example.com', block=False, integrity='sha384-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
    text(pending.wait().integrity)
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
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for extra in [
            "pending.integrity",
            "pending.wait().sha256",
            "ctx.download(url='https://example.com').wait",
            "ctx.download(url='https://example.com', block=block).integrity",
        ] {
            analysis.update_file(file, format!("{source}    {extra}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{extra}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "unresolved-attribute", "{extra}");
            assert!(diagnostic.range().unwrap().start().to_usize() >= source.len());
        }
    }

    #[test]
    fn bound_download_methods_preserve_result_precision() {
        let source = r#"def inspect(ctx: repository_ctx) -> str:
    download = ctx.download
    return download(url='https://example.com').sha256
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
        analysis.update_file(file, source.replace("-> str", "-> int"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-return-type");
    }

    #[test]
    fn common_rule_keyword_schemas_match_factories() {
        let source = r#"def implementation(context: ctx[object, object]) -> list[ProviderInstance]:
    return []
ordinary = rule(implementation=implementation)
executable = rule(implementation=implementation, executable=True)
def forward(**kwargs: Unpack[CommonRuleAttrs]) -> None:
    ordinary(name='plain', **kwargs)
def forward_executable(**kwargs: Unpack[CommonExecutableRuleAttrs]) -> None:
    executable(name='binary', **kwargs)
forward()
forward(tags=['manual'], visibility=['//visibility:public'], testonly=True)
forward(tags=None, features=select({'//conditions:default': ['feature']}))
forward_executable(args=['--verbose'], output_licenses=['notice'])
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
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (invalid, expected) in [
            ("forward(name='other')", "unknown-argument"),
            ("forward(format_keys={'key': 'value'})", "unknown-argument"),
            ("forward(args=['--verbose'])", "unknown-argument"),
            ("forward(tags=[42])", "invalid-argument-type"),
            ("forward_executable(args=[42])", "invalid-argument-type"),
            (
                "forward(visibility=select({'//conditions:default': ['//visibility:public']}))",
                "invalid-argument-type",
            ),
        ] {
            analysis.update_file(file, format!("{source}{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), expected, "{diagnostic:?}");
        }
        // The selected host inventory adds the new spelling and its legacy alias.
        let rules = starpls_bazel::build::BuildLanguage {
            rule: vec![starpls_bazel::build::RuleDefinition {
                name: "genrule".into(),
                attribute: vec![starpls_bazel::build::AttributeDefinition {
                    name: "package_metadata".into(),
                    r#type: starpls_bazel::build::attribute::Discriminator::LabelList as i32,
                    configurable: Some(false),
                    ..Default::default()
                }],
                ..Default::default()
            }],
        };
        let metadata = format!("{source}forward(package_metadata=['//:license'])\nforward(applicable_licenses=['//:license'])\n");
        analysis.update_file(file, metadata.clone());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "unknown-argument");
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                rules,
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for name in ["package_metadata", "applicable_licenses"] {
            analysis.update_file(file, format!("{source}forward({name}=[42])\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{name}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
        }
    }

    #[test]
    fn scalar_attribute_allowed_values_check_explicit_inputs() {
        let source = r#"def implementation(ctx): return []
def macro_implementation(name, visibility, **kwargs): pass
def dynamic() -> str: return "other"
example = rule(implementation=implementation, attrs={
    "_mode": attr.string(values=["script"], default="other"),
    "retries": attr.int(values=(0, 1), mandatory=True),
    "free": attr.string(values=[]),
    "dynamic_default": attr.string(values=["zstd", "gzip"], default=dynamic()),
})
repository = repository_rule(implementation=implementation, attrs={"mode": attr.string(values=["fast"])})
wrapped = macro(implementation=macro_implementation, attrs={"mode": attr.string(values=["fast"])})
example(name="direct", retries=1, free="anything", dynamic_default="zstd", **{"$mode": "script"})
example(name="omitted", retries=0)
example(name="none", retries=1, dynamic_default=None)
example(name="selected", retries=select({"//conditions:default": None}), dynamic_default=select({"//conditions:default": "zstd"}))
selected_retries = select({"//conditions:default": 0, "//:other": 1})
selected_compression = select({"//conditions:default": "zstd", "//:other": "gzip"})
example(name="stored", retries=selected_retries, dynamic_default=selected_compression)
repository(name="repo", mode="fast")
wrapped(name="macro", mode="fast")
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
        for invalid in [
            r#"example(name="bad", retries=1, **{"$mode": "other"})"#,
            r#"example(name="bad", retries=3)"#,
            r#"example(name="bad", retries=1, dynamic_default="other")"#,
            r#"example(name="bad", retries=select({"//conditions:default": 3}))"#,
            r#"example(name="bad", retries=1, dynamic_default=select({"//conditions:default": None}))"#,
            r#"bad_compression = select({"//conditions:default": "zstd", "//:other": "other"})
example(name="bad", retries=0, dynamic_default=bad_compression)"#,
            r#"example(name="bad", retries=0, dynamic_default=select({"//conditions:default": "zstd"} | {"//:other": "other" for _ in (0,)}))"#,
            r#"repository(name="bad", mode="slow")"#,
            r#"wrapped(name="bad", mode="slow")"#,
        ] {
            analysis.update_file(file, format!("{source}{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            assert!(diagnostic.range().unwrap().start().to_usize() >= source.len());
        }
    }

    #[test]
    fn rule_initializer_exposes_caller_attribute_types() {
        let source = r#"def implementation(ctx): return []
def initialize(**kwargs): return {"stamp": 1}
target = rule(implementation, initializer=initialize, attrs={
    "srcs": attr.label_list(),
    "stamp": attr.int(values=[1]),
    "_hidden": attr.int(default=1, values=[1]),
})
def forward(**kwargs: Unpack[KeywordArgs[target]]) -> None:
    target(**kwargs)
def macro_impl(name, visibility, **kwargs): pass
wrapped = macro(implementation=macro_impl, inherit_attrs=target)
forward(name="valid", srcs=["//:data"], stamp=42, tags=["manual"])
forward(name="selected", stamp=select({"//conditions:default": None}))
wrapped(name="valid", stamp=1)
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
        for invalid in [
            r#"forward(name="bad_srcs", srcs=42)"#,
            r#"forward(name="bad_stamp", stamp="wrong")"#,
            r#"target(name="bad_private", **{"$hidden": 42})"#,
            r#"wrapped(name="bad", stamp=42)"#,
        ] {
            analysis.update_file(file, format!("{source}{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
        }
        for (callback, attributes) in [
            (
                "def callback(name, extra, **kwargs): return {}",
                r#"{"extra": attr.string()}"#,
            ),
            ("def callback(*args, **kwargs): return {}", "{}"),
            (
                "def callback(**kwargs: str): return {}",
                r#"{"stamp": attr.int()}"#,
            ),
            (
                "callback = initialize",
                r#"{"stamp": attr.int(mandatory=True)}"#,
            ),
            (
                "callback = initialize",
                r#"{"stamp": attr.int(), "_legacy_any_type_attrs": attr.string_list(default=["stamp"])}"#,
            ),
        ] {
            let declaration = format!(
                "{callback}\nuncertain = rule(implementation, initializer=callback, attrs={attributes})"
            );
            analysis.update_file(
                file,
                format!("{source}{declaration}\ndef use(**kwargs: Unpack[KeywordArgs[uncertain]]) -> None: pass\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{declaration}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-type-form");
        }
    }

    #[test]
    fn rule_initializer_can_rewrite_descendant_attributes() {
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
            "//:base.bzl",
            r#"def implementation(ctx): return []
def initialize(name, **kwargs):
    if name.startswith("grandchild"):
        return {"child": "ok", "grandchild": 1}
    return {"child": "ok"}
base = rule(implementation, initializer=initialize, attrs={"stamp": attr.int(default=1, values=[1])})
"#,
        );
        fixture.add_file(
            &mut analysis.db,
            "//:child.bzl",
            r#"load("//:base.bzl", "base", "implementation")
child = rule(implementation, parent=base, attrs={"child": attr.string(mandatory=True)})
"#,
        );
        let descendants = fixture.add_file(
            &mut analysis.db,
            "//:descendants.bzl",
            r#"load("//:base.bzl", "implementation")
load("//:child.bzl", "child")
grandchild = rule(implementation, parent=child, attrs={"grandchild": attr.int(mandatory=True)})
def macro_impl(name, visibility, **kwargs): pass
wrapped = macro(implementation=macro_impl, inherit_attrs=child)
def forward(**kwargs: Unpack[KeywordArgs[grandchild]]) -> None: pass
"#,
        );
        let source = r#"load("//:child.bzl", "child")
load("//:descendants.bzl", "grandchild", "wrapped")
child(name="child_omitted")
child(name="child_rewritten", child=42)
grandchild(name="grandchild_omitted")
grandchild(name="grandchild_rewritten", child=42, grandchild="wrong")
wrapped(name="macro_valid", child="ok", stamp=1)
"#;
        let caller = fixture.add_file_with_options(
            &mut analysis.db,
            "BUILD.bazel",
            source,
            starpls_common::Dialect::Bazel,
            Some(starpls_common::FileInfo::Bazel {
                api_context: starpls_bazel::APIContext::Build,
                is_external: false,
                bundled_cc_common: false,
            }),
        );
        loader.add_files_from_fixture(&fixture);
        let diagnostics = analysis.snapshot().diagnostics(descendants).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-type-form");
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (invalid, id) in [
            ("wrapped(name='macro_missing')", "missing-argument"),
            (
                "wrapped(name='macro_bad_child', child=42)",
                "invalid-argument-type",
            ),
            (
                "wrapped(name='macro_bad_stamp', child='ok', stamp=42)",
                "invalid-argument-type",
            ),
        ] {
            analysis.update_file(caller, format!("{source}{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), id, "{invalid}");
        }
    }

    #[test]
    fn private_rule_attributes_use_host_input_names() {
        let source = r#"def implementation(ctx): return []
def computed(): return "//:computed"
def materialize(context: object) -> None: return None
def undecided(value): return value
def macro_impl(name, visibility, **kwargs): pass
example = rule(implementation=implementation, extendable=True, attrs={
    "_direct": attr.label(default=Label("//:default")),
    "_computed": attr.label(default=computed),
    "_late": attr.label(default=configuration_field(fragment="cpp", name="compiler")),
    "_uncertain": attr.label(default=json.decode('"//:uncertain"')),
    "_materialized": attr.label(materializer=materialize),
    "_maybe_materialized": attr.label(default=Label("//:default"), mandatory=False, **json.decode("{}")),
    "visible": attr.string(),
})
stable = rule(implementation=implementation, attrs={"_direct": attr.label(default=Label("//:default"))})
lifted = subrule(implementation=lambda ctx, _dep: None, attrs={"_dep": attr.label(default="//:dep", mandatory=True)})
with_subrule = rule(implementation=implementation, subrules=[lifted])
alternate = rule(implementation=implementation, dependency_resolution_rule=True)
initialized = rule(implementation=implementation, initializer=lambda name, extra: {}, attrs={"extra": attr.string()})
child = rule(parent=example, implementation=implementation)
wrapped = macro(implementation=macro_impl, inherit_attrs=example)
repository = repository_rule(implementation=implementation, attrs={"_direct": attr.string(default="x")})
mandatory = rule(implementation=implementation, attrs={"_secret": attr.string(mandatory=True), "visible": attr.string()})
mandatory_uncertain = rule(implementation=implementation, attrs={"_secret": attr.label(mandatory=True, default=undecided(configuration_field(fragment="cpp", name="compiler")))})
mandatory_repository = repository_rule(implementation=implementation, attrs={"_secret": attr.string(mandatory=True)})
mandatory_wrapped = macro(implementation=macro_impl, inherit_attrs=mandatory)
example(name="ok", **{"$direct": "//:override", "$computed": "//:other", "$uncertain": "//:value", "$maybe_materialized": "//:value"}, $0visible="ok")
child(name="inherited", **{"$direct": "//:override"})
repository(name="private", _direct="override")
mandatory(name="ok", **{"$secret": "value"})
mandatory_repository(name="repo", _secret="value")
mandatory_wrapped(name="wrapped")
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
        let (file_id, pos) = fixture.cursor_pos.unwrap();
        let source = source.replace("$0", "");
        {
            let snapshot = analysis.snapshot();
            let diagnostics = snapshot.diagnostics(file_id).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
            let help = snapshot
                .signature_help(FilePosition { file_id, pos })
                .unwrap()
                .unwrap();
            let [signature] = help.signatures.as_slice() else {
                panic!("{help:?}");
            };
            assert!(signature.label.contains("visible: str"), "{help:?}");
            assert!(!signature.label.contains("$direct"), "{help:?}");
            let hover = snapshot
                .hover(FilePosition {
                    file_id,
                    pos: source
                        .find("example(name=\"ok\"")
                        .unwrap()
                        .try_into()
                        .unwrap(),
                })
                .unwrap()
                .unwrap();
            assert!(
                !hover.contents.value.contains("$direct"),
                "{}",
                hover.contents.value
            );
            let call = "mandatory(name=\"ok\", ";
            let pos = (source.find(call).unwrap() + call.len())
                .try_into()
                .unwrap();
            let help = snapshot
                .signature_help(FilePosition { file_id, pos })
                .unwrap()
                .unwrap();
            assert!(
                help.signatures[0].label.contains("$secret: str"),
                "{help:?}"
            );
            let items = snapshot
                .completions(FilePosition { file_id, pos }, None)
                .unwrap()
                .unwrap();
            assert!(
                items.iter().any(|item| item.label == "visible="),
                "{items:?}"
            );
            assert!(
                !items.iter().any(|item| item.label == "$secret="),
                "{items:?}"
            );
        }
        for (call, expected) in [
            (
                "example(name='bad', **{'$direct': 42})",
                "invalid-argument-type",
            ),
            (
                "example(name='bad', **{'$diretc': '//:value'})",
                "unknown-argument",
            ),
            (
                "example(name='bad', _direct='//:value')",
                "unknown-argument",
            ),
            (
                "example(name='bad', **{'$late': '//:value'})",
                "unknown-argument",
            ),
            (
                "example(name='bad', **{'$materialized': '//:value'})",
                "unknown-argument",
            ),
            (
                "example(name='bad', **{'$uncertain': 42})",
                "invalid-argument-type",
            ),
            (
                "example(name='bad', **{'$maybe_materialized': 42})",
                "invalid-argument-type",
            ),
            (
                "wrapped(name='bad', **{'$direct': '//:value'})",
                "unknown-argument",
            ),
            (
                "repository(name='bad', **{'$direct': 'value'})",
                "unknown-argument",
            ),
            (
                "repository(name='bad', _direct=42)",
                "invalid-argument-type",
            ),
            ("mandatory(name='missing')", "missing-argument"),
            ("mandatory_repository(name='missing')", "missing-argument"),
            // `:secret` remains unsupported, but `$secret` must not also be required.
            (
                "mandatory_uncertain(name='other', **{':secret': '//:value'})",
                "unknown-argument",
            ),
        ] {
            analysis.update_file(file_id, format!("{source}{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file_id).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{call}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), expected, "{call}: {diagnostic:?}");
        }
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let mut checked = source.clone();
        let mut expected = Vec::new();
        for (fragment, callee) in [
            ("stable(name='known', **{'$direct': '//:value'})", None),
            ("example(name='omitted', **{'$direct': '//:value'})", Some("example(")),
            ("example(name='uncertain', **{'$uncertain': '//:value'})", Some("example(")),
            ("example(name='maybe_materialized', **{'$maybe_materialized': '//:value'})", Some("example(")),
            ("mandatory_uncertain(name='uncertain', **{'$secret': '//:value'})", Some("mandatory_uncertain(")),
            ("mandatory_uncertain(name='omitted')", Some("mandatory_uncertain(")),
            ("with_subrule(name='omitted')", Some("with_subrule(")),
            ("alternate(name='alternate', toolchains=['//:toolchain'])", Some("alternate(")),
            ("initialized(name='initialized')", Some("initialized(")),
            ("def invoke_union(flag: bool) -> None:\n    chosen = example if flag else stable\n    chosen(name='union')", Some("chosen(")),
        ] {
            if let Some(callee) = callee {
                expected.push(checked.len() + fragment.find(callee).unwrap());
            }
            checked.push_str(fragment);
            checked.push('\n');
        }
        analysis.update_file(file_id, checked);
        let diagnostics = analysis.snapshot().diagnostics(file_id).unwrap();
        let calls = diagnostics
            .iter()
            .filter(|diagnostic| {
                diagnostic
                    .range()
                    .is_some_and(|range| range.start().to_usize() >= source.len())
            })
            .collect::<Vec<_>>();
        assert_eq!(calls.len(), expected.len(), "{calls:?}");
        for (diagnostic, start) in calls.iter().zip(expected) {
            assert_eq!(diagnostic.id().as_str(), "non-static-type");
            assert_eq!(diagnostic.range().unwrap().start().to_usize(), start);
        }
    }

    #[test]
    fn list_attribute_inputs_accept_depsets() {
        let source = r#"def implementation(ctx): return []
example = rule(implementation=implementation, attrs={
    'names': attr.string_list(),
    'numbers': attr.int_list(),
    'groups': attr.string_list_dict(),
})
example(name='valid', names=depset(['a']), numbers=depset([1]), groups={'g': depset(['b'])})
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
        for argument in [
            "names=depset([1])",
            "numbers=depset(['a'])",
            "groups={'g': depset([1])}",
        ] {
            analysis.update_file(file, format!("{source}example(name='bad', {argument})\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{argument}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
        }
    }

    #[test]
    fn loaded_build_settings_check_defaults_after_edits() {
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
        let settings = fixture.add_file(&mut analysis.db, "//:settings.bzl", "");
        fixture.add_file(
            &mut analysis.db,
            "//:defs.bzl",
            r#"
load("//:settings.bzl", "setting")
def implementation(ctx): pass
typed_rule = rule(implementation, build_setting=setting, attrs={"extra": attr.int()})
"#,
        );
        let caller = fixture.add_file_with_options(
            &mut analysis.db,
            "BUILD.bazel",
            "",
            starpls_common::Dialect::Bazel,
            Some(starpls_common::FileInfo::Bazel {
                api_context: starpls_bazel::APIContext::Build,
                is_external: false,
                bundled_cc_common: false,
            }),
        );
        loader.add_files_from_fixture(&fixture);
        for (factory, options, valid, invalid) in [
            ("bool", "flag=True", "True", "\"yes\""),
            ("int", "", "42", "\"42\""),
            ("string", "allow_multiple=True", "\"value\"", "[\"value\"]"),
            (
                "string_list",
                "flag=True, repeatable=True",
                "[\"value\"]",
                "[42]",
            ),
        ] {
            analysis.update_file(
                settings,
                format!("make = config.{factory}\nsetting = make({options})\n"),
            );
            for (arguments, expected) in [
                (
                    format!("build_setting_default={valid}, help=\"description\", extra=1"),
                    None,
                ),
                (
                    format!("build_setting_default={invalid}"),
                    Some("invalid-argument-type"),
                ),
                (String::new(), Some("missing-argument")),
                (
                    "build_setting_default=None".to_owned(),
                    Some("invalid-argument-type"),
                ),
                (
                    format!("build_setting_default=select({{\"//conditions:default\": {valid}}})"),
                    Some("invalid-argument-type"),
                ),
                (
                    format!("build_setting_default={valid}, help=1"),
                    Some("invalid-argument-type"),
                ),
                (
                    format!("build_setting_default={valid}, help=select({{\"//conditions:default\": \"text\"}})"),
                    Some("invalid-argument-type"),
                ),
                (
                    format!("build_setting_default={valid}, extra=\"bad\""),
                    Some("invalid-argument-type"),
                ),
            ] {
                analysis.update_file(caller, format!("load(\"//:defs.bzl\", \"typed_rule\")\ntyped_rule(name=\"value\", {arguments})\n"));
                let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
                let ids: Vec<_> = diagnostics
                    .iter()
                    .map(|diagnostic| diagnostic.id().as_str())
                    .collect();
                assert_eq!(
                    ids,
                    expected.into_iter().collect::<Vec<_>>(),
                    "{factory}({options}), {arguments}: {diagnostics:?}"
                );
            }
        }
    }

    #[test]
    fn uncertain_build_settings_preserve_known_attributes() {
        let (mut analysis, _) = Analysis::new_for_test();
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
        let file = fixture.add_file(
            &mut analysis.db,
            "main.bzl",
            r#"
def implementation(ctx): pass
def make(setting):
    target = rule(implementation, build_setting=setting, attrs={"extra": attr.int()})
    target(name="omitted")
    target(name="supplied", build_setting_default=True, help="description")
    target(name="bad", extra="bad")
    target(name="unknown", unrelated=1)
ordinary = rule(implementation, build_setting=None)
ordinary(name="bad", build_setting_default=True)
ordinary(name="bad_help", help="description")
def with_own_attributes(setting):
    target = rule(implementation, build_setting=setting, attrs={"help": attr.int(), "build_setting_default": attr.string()})
    target(name="valid", help=1, build_setting_default="value")
    target(name="bad", help="text")
def bool():
    # type: () -> None
    return None
config = struct(bool=bool)
shadowed = rule(implementation, build_setting=config.bool())
shadowed(name="bad", build_setting_default=True)
"#,
        );
        let snapshot = analysis.snapshot();
        let mut diagnostics = snapshot.diagnostics(file).unwrap();
        diagnostics
            .sort_by_key(|diagnostic| diagnostic.primary_span().unwrap().range().unwrap().start());
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(
            ids,
            [
                "invalid-argument-type",
                "unknown-argument",
                "unknown-argument",
                "unknown-argument",
                "invalid-argument-type",
                "unknown-argument"
            ],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn build_settings_supply_inherited_signatures() {
        let (mut analysis, _) = Analysis::new_for_test();
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
        let file = fixture.add_file(
            &mut analysis.db,
            "main.bzl",
            r#"
def implementation(ctx): pass
def macro_impl(name, visibility, **kwargs): pass
setting = rule(implementation, build_setting=config.string_list())
inherited = macro(implementation=macro_impl, inherit_attrs=setting)
inherited(name="valid", build_setting_default=("a", "b"))
inherited(name="missing")
inherited(name="selected", build_setting_default=select({"//conditions:default": ["a"]}))
inherited(name="wrong_help", build_setting_default=[], help=1)
inherited(name="signature", build_setting_default=$0[])
"#,
        );
        let (file_id, pos) = fixture.cursor_pos.unwrap();
        let snapshot = analysis.snapshot();
        let help = snapshot
            .signature_help(FilePosition { file_id, pos })
            .unwrap()
            .unwrap();
        let [signature] = help.signatures.as_slice() else {
            panic!("{help:?}");
        };
        let parameters = signature.parameters.as_ref().unwrap();
        let default = parameters
            .iter()
            .find(|parameter| parameter.label.starts_with("build_setting_default:"))
            .unwrap();
        assert_eq!(
            default.label,
            "build_setting_default: Iterable[str] | depset[str]"
        );
        assert_eq!(
            default.documentation.as_deref(),
            Some("Default value of this build setting.")
        );
        let diagnostics = snapshot.diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(
            ids,
            [
                "missing-argument",
                "invalid-argument-type",
                "invalid-argument-type"
            ],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn struct_values_are_assignable_by_field_shape() {
        let source = r#"def require_entry(entry: struct[{"file": str, "path": str}]) -> None:
    pass
def collect(path):
    # type: (str) -> None
    entries = [struct(file="input", path=path)]
    entries.extend([struct(file="input", path="")])
    require_entry(struct(file="input", path=42))
    require_entry(struct(file="input"))
def require_int_fields(entry: struct[int]) -> None:
    pass
def optional_keys(duplicate: dict[{"x": NotRequired[str]}], distinct: dict[{"y": NotRequired[str]}]) -> None:
    require_int_fields(struct(x=1, **duplicate))
    require_int_fields(struct(x=1, **distinct))
"#;
        for complete_inventory in [true, false] {
            let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
            let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
                "../../../starpls/src/builtin/builtin.pb"
            ))
            .unwrap();
            if !complete_inventory {
                builtins.r#type.retain(|class| class.name != "struct");
            }
            analysis
                .set_builtin_defs(builtins, Default::default())
                .unwrap();
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert_eq!(
                diagnostics
                    .iter()
                    .map(|diagnostic| (
                        diagnostic.id().as_str(),
                        &source[diagnostic.range().unwrap()]
                    ))
                    .collect::<Vec<_>>(),
                [
                    ("invalid-argument-type", "struct(file=\"input\", path=42)"),
                    ("invalid-argument-type", "struct(file=\"input\")"),
                    ("invalid-argument-type", "struct(x=1, **distinct)"),
                ],
                "complete inventory: {complete_inventory}; {diagnostics:?}"
            );
        }
    }

    #[test]
    fn struct_signature_preserves_fields_and_host_operations() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let file = fixture.add_file(
            &mut analysis.db,
            "main.bzl",
            r#"
def increment(value: int) -> int:
    return value + 1
empty = struct()
record = struct(callback=increment)
mixed = struct(text="x", number=1)
params = {"value": "x"}
spread = struct(**params)
callback = record.callback
result = record.callback(1)
text = mixed.text
number = mixed.number
spread_value = spread.value
opaque: dict[str, int] = {}
uncertain = struct(**opaque)
uncertain_repr = uncertain.__repr__
uncertain_str = uncertain.__str__
uncertain_class = uncertain.__class__
known_repr = struct(__repr__=1).__repr__
rendered = repr(empty)
stringified = str(empty)
equal = empty == struct()
label = Label("//:target")
items = depset([1])
integer = int("1")
boolean = bool(empty)
sequence = list((1,))
wrong_argument = record.callback("wrong")
"#,
        );
        let snapshot = analysis.snapshot();
        let db = &snapshot.db;
        let program = db.starlark_program_file(file);
        let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
        let model = SemanticModel::new(db, program);
        let environment = model.program_environment();
        let mut values = std::collections::BTreeMap::new();
        for statement in parsed.suite() {
            let Stmt::Assign(assignment) = statement else {
                continue;
            };
            let [target] = assignment.targets.as_slice() else {
                panic!("one target");
            };
            let Expr::Name(name) = target else {
                panic!("named target");
            };
            let ty = assignment.value.inferred_type(&model).unwrap();
            values.insert(name.id.as_str(), ty.display(db, &environment).to_string());
            if let Expr::Call(call) = assignment.value.as_ref() {
                if let Expr::Name(name) = call.func.as_ref() {
                    if name.id == "struct" {
                        let ty = call.func.inferred_type(&model).unwrap();
                        let normalized = ty
                            .map_callable_signatures(
                                db,
                                &environment,
                                ty_python_semantic::types::CallableTypeKind::FunctionLike,
                                std::convert::identity,
                            )
                            .unwrap();
                        assert!(normalized.is_fully_static(db, &environment));
                    }
                }
            }
        }
        for (name, expected) in [
            ("empty", "struct"),
            ("callback", "def increment(value: int) -> int"),
            ("result", "int"),
            ("text", "Literal[\"x\"]"),
            ("number", "Literal[1]"),
            ("spread_value", "Literal[\"x\"]"),
            ("uncertain_repr", "int"),
            ("uncertain_str", "int"),
            ("uncertain_class", "int"),
            ("known_repr", "Literal[1]"),
            ("rendered", "str"),
            ("stringified", "str"),
            ("equal", "bool"),
            ("label", "Label"),
            ("items", "depset[int]"),
            ("integer", "int"),
            ("boolean", "Literal[True]"),
            ("sequence", "list[int]"),
        ] {
            assert_eq!(values[name], expected, "{name}");
        }
        let diagnostics = snapshot.diagnostics(file).unwrap();
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
    fn factories_keep_identity_and_callable_fields() {
        let (mut analysis, _) = Analysis::new_for_test();
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
        let file = fixture.add_file(
            &mut analysis.db,
            "main.bzl",
            r#"
def increment(value):
    # type: (int) -> int
    return value + 1
make = struct
record = make(callback=increment)
result = record.callback(1)
record.callback("bad")
def consume_record(value):
    # type: (struct) -> None
    pass
def consume_attribute(value):
    # type: (Attribute) -> None
    pass
consume_record(record)
consume_attribute(attr.string())
factory = provider
First = factory(fields=["value"])
Second = factory(fields=["value"])
def consume(value):
    # type: (First) -> None
    pass
consume(First(value=1))
consume(Second(value=1))
def shadowed():
    # type: () -> int
    def struct(value):
        # type: (int) -> int
        return value
    return struct(1)
shadow = shadowed()
"#,
        );
        let snapshot = analysis.snapshot();
        let db = &snapshot.db;
        let file = db.starlark_program_file(file);
        let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
        let model = SemanticModel::new(db, file);
        for statement in parsed.suite() {
            let Stmt::Assign(assignment) = statement else {
                continue;
            };
            if assignment.targets.iter().any(|target| match target {
                Expr::Name(name) => name.id == "result" || name.id == "shadow",
                _ => false,
            }) {
                let ty = assignment.value.inferred_type(&model).unwrap();
                assert_eq!(
                    ty.display(db, &model.program_environment()).to_string(),
                    "int"
                );
            }
        }
        let diagnostics = ty_python_semantic::check_file_unwrap(db, file);
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().to_string())
            .collect();
        assert_eq!(
            ids,
            ["invalid-argument-type", "invalid-argument-type"],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn provider_initializer_keeps_its_first_argument() {
        let (mut analysis, _) = Analysis::new_for_test();
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
            "main.bzl",
            r#"
def initialize(value, optional=0):
    # type: (int, int) -> dict
    return {"field": value}
Info, raw = provider(doc="Provider documentation", fields={"field": "Field documentation"}, init=initialize)
Info(1$0)
raw(field=1)
"#,
        );
        let (file_id, pos) = fixture.cursor_pos.unwrap();
        let snapshot = analysis.snapshot();
        let help = snapshot
            .signature_help(FilePosition { file_id, pos })
            .unwrap()
            .unwrap();
        let [signature] = help.signatures.as_slice() else {
            panic!("{help:?}");
        };
        assert_eq!(signature.active_parameter, Some(0));
        assert!(signature.label.starts_with("def Info("), "{help:?}");
        assert_eq!(
            signature.documentation.as_deref(),
            Some("Provider documentation")
        );
        let labels: Vec<_> = signature
            .parameters
            .as_ref()
            .unwrap()
            .iter()
            .map(|parameter| parameter.label.as_str())
            .collect();
        assert_eq!(labels, ["value: int", "optional: int = 0"], "{help:?}");
        let diagnostics = ty_python_semantic::check_file_unwrap(
            &snapshot.db,
            snapshot.db.starlark_program_file(file_id),
        );
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn provider_mapping_fields_keep_documentation_and_origins() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
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
        for field in ["value", "renamed", "value"] {
            for inline in [true, false] {
                let (prefix, fields) = if inline {
                    (
                        String::new(),
                        format!("{{'{field}': 'Field documentation'}}"),
                    )
                } else {
                    (
                        format!("FIELDS = dict({field}='Field documentation')\n"),
                        "FIELDS".to_owned(),
                    )
                };
                let source = format!("{prefix}Info = provider(fields={fields})\nInfo({field}=1)\nInfo(unexpected=1)\n");
                analysis.update_file(file, source.clone());
                let snapshot = analysis.snapshot();
                let diagnostics = snapshot.diagnostics(file).unwrap();
                let ids: Vec<_> = diagnostics
                    .iter()
                    .map(|diagnostic| diagnostic.id().as_str())
                    .collect();
                assert_eq!(ids, ["unknown-argument"], "{source}: {diagnostics:?}");
                let position = FilePosition {
                    file_id: file,
                    pos: (source.find(&format!("Info({field}")).unwrap() as u32 + 5).into(),
                };
                let help = snapshot.signature_help(position.clone()).unwrap().unwrap();
                let [signature] = help.signatures.as_slice() else {
                    panic!("{help:?}");
                };
                assert!(!signature.label.contains("**kwargs"), "{help:?}");
                let parameter = &signature.parameters.as_ref().unwrap()[0];
                assert!(
                    parameter.label.starts_with(&format!("{field}:")),
                    "{help:?}"
                );
                assert_eq!(
                    parameter.documentation.as_deref(),
                    Some("Field documentation")
                );
                let locations = snapshot.goto_definition(position, false).unwrap().unwrap();
                let [crate::LocationLink::Local {
                    target_file_id,
                    target_selection_range,
                    origin_selection_range: _,
                    target_range: _,
                }] = locations.as_slice()
                else {
                    panic!("{locations:?}");
                };
                assert_eq!(*target_file_id, file.source);
                let key = if inline {
                    format!("'{field}'")
                } else {
                    field.to_owned()
                };
                assert_eq!(&source[*target_selection_range], key);
            }
        }
        for (annotation, value) in [
            ("list[Literal['name']]", "['name']"),
            (
                "dict[Literal['name'], Literal['documentation']]",
                "{'name': 'documentation'}",
            ),
            (
                "dict[{'name': Literal['documentation']}]",
                "{'name': 'documentation'}",
            ),
        ] {
            analysis.update_file(
                file,
                format!("fields: {annotation} = {value}\nInfo = provider(fields=fields)\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{annotation}: {diagnostics:?}");
        }
        for (prefix, fields) in [
            ("", "{'name': 1}"),
            ("", "{1: 'documentation'}"),
            ("", "'name'"),
            ("", "[1]"),
            ("fields: dict[{'name': int}] = {'name': 1}\n", "fields"),
        ] {
            analysis.update_file(file, format!("{prefix}Info = provider(fields={fields})\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{fields}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
        }
    }

    #[test]
    fn conditional_provider_fields_remain_open() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(
            r#"def make_provider(flag: bool):
    fields = {'always': 'Always present'}
    if flag:
        fields['conditional'] = 'Sometimes present'
    Info = provider(fields=fields)
    Info($0always=1, conditional=2)
    return Info
Example = make_provider(True)
"#,
        );
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let (file_id, pos) = fixture.cursor_pos.unwrap();
        let snapshot = analysis.snapshot();
        let help = snapshot
            .signature_help(FilePosition { file_id, pos })
            .unwrap()
            .unwrap();
        let [signature] = help.signatures.as_slice() else {
            panic!("{help:?}");
        };
        assert!(signature.label.contains("always:"), "{help:?}");
        assert!(signature.label.contains("**kwargs"), "{help:?}");
        assert!(!signature.label.contains("conditional:"), "{help:?}");
        let diagnostics = snapshot.diagnostics(file_id).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn conditional_attributes_do_not_promise_parameters() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(
            r#"def implementation(ctx): return []
def make_rule(flag: bool):
    attributes = {}
    if flag:
        attributes["dep"] = attr.label(mandatory=True, allow_single_file=True)
    generated = rule(implementation=implementation, attrs=attributes)
    def register(name):
        if flag:
            generated(name=name, dep="//:input")
        else:
            generated($0name=name)
    return generated, register
example, register = make_rule(False)
"#,
        );
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let (file_id, pos) = fixture.cursor_pos.unwrap();
        let snapshot = analysis.snapshot();
        let help = snapshot
            .signature_help(FilePosition { file_id, pos })
            .unwrap()
            .unwrap();
        let [signature] = help.signatures.as_slice() else {
            panic!("{help:?}");
        };
        assert!(signature.label.contains("name: str"), "{help:?}");
        assert!(signature.label.contains("**kwargs"), "{help:?}");
        assert!(!signature.label.contains("dep:"), "{help:?}");
        let diagnostics = snapshot.diagnostics(file_id).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn incomplete_rule_shapes_preserve_known_parameters() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(
            r#"def implementation(ctx): return []
def macro_impl(name, visibility, **kwargs): pass
def attributes(): return {"exports": attr.label(mandatory=True)}
target = rule(implementation, attrs=dict(attributes(), count=attr.int()))
inherited = macro(implementation=macro_impl, inherit_attrs=target)
inherited($0name="valid", count=1)
inherited(name="bad", count="wrong")
target(name="bad", count="wrong")
target()
target(name=1)
target("positional")
"#,
        );
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let (file, pos) = fixture.cursor_pos.unwrap();
        let snapshot = analysis.snapshot();
        let db = &snapshot.db;
        let program = db.starlark_program_file(file);
        let environment = ProgramEnvironment::from_file(program);
        let named = Type::single_callable(
            db,
            Signature::new(
                Parameters::standard([Parameter::keyword_only(Name::new("name"))
                    .with_annotated_type(KnownClass::Str.to_instance(db, &environment))]),
                Type::none(db, &environment),
            ),
        );
        for name in ["target", "inherited"] {
            let ty = ProvidedBindingValue::Export {
                value: None,
                file: program,
                name: Name::new(name),
            }
            .resolve_type(db)
            .unwrap();
            let data = ty.provided_data(db, &environment).unwrap();
            assert!(!data.downcast_ref::<RuleData>().unwrap().complete);
            assert!(ty.is_assignable_to(db, &environment, named), "{name}");
        }
        let help = snapshot
            .signature_help(FilePosition { file_id: file, pos })
            .unwrap()
            .unwrap();
        let [signature] = help.signatures.as_slice() else {
            panic!("{help:?}")
        };
        assert!(signature.label.contains("name: str"), "{help:?}");
        assert!(signature.label.contains("count:"), "{help:?}");
        assert!(signature.label.contains("**kwargs"), "{help:?}");
        let diagnostics = snapshot.diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(
            ids,
            [
                "invalid-argument-type",
                "invalid-argument-type",
                "missing-argument",
                "invalid-argument-type",
                "too-many-positional-arguments",
                "missing-argument"
            ],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn dictionary_union_attributes_preserve_required_inputs() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(
            r#"def implementation(ctx): return []
base = {"exports": attr.label(mandatory=True), "count": attr.string()}
extra = {"count": attr.int()}
target_test = rule(implementation, attrs=base | extra, test=True)
target_test($0name="valid", exports="//:input", count=1)
"#,
        );
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let (file_id, pos) = fixture.cursor_pos.unwrap();
        let snapshot = analysis.snapshot();
        let help = snapshot
            .signature_help(FilePosition { file_id, pos })
            .unwrap()
            .unwrap();
        let [signature] = help.signatures.as_slice() else {
            panic!("{help:?}");
        };
        assert!(
            signature
                .label
                .contains("exports: Label | str | select[Label | str | None, object]"),
            "{help:?}"
        );
        assert!(
            signature
                .label
                .contains("count: int | select[int | None, object] | None = ..."),
            "{help:?}"
        );
        assert!(!signature.label.contains("**kwargs"), "{help:?}");
        let diagnostics = snapshot.diagnostics(file_id).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        drop(snapshot);
        analysis.update_file(
            file_id,
            r#"def implementation(ctx): return []
base = {"exports": attr.label(mandatory=True)}
extra = {"count": attr.int()}
target_test = rule(implementation, attrs=base | extra, test=True)
target_test(name="missing")
"#
            .to_owned(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file_id).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "missing-argument");
    }

    #[test]
    fn conditional_descriptors_preserve_guaranteed_rule_inputs() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(
            r#"def implementation(context: ctx[object, object]) -> list[DefaultInfo]: return [DefaultInfo()]
def register(flag: bool) -> None:
    extra = {"_mode": attr.string(default="fast")} if flag else {"_mode": attr.string(default="slow")}
    target = rule(implementation, attrs={"src": attr.label(mandatory=True), "count": attr.int()} | extra)
    target($0name="valid", src="//:input", count=1)
    target(name="missing")
    target(name="wrong", src="//:input", count="bad")
    uncertain = rule(implementation, attrs={"mode": attr.string(mandatory=True)} if flag else {"mode": attr.string()})
    uncertain(name="missing")
"#,
        );
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
        let snapshot = analysis.snapshot();
        let (file_id, pos) = fixture.cursor_pos.unwrap();
        let help = snapshot
            .signature_help(FilePosition { file_id, pos })
            .unwrap()
            .unwrap();
        assert!(help.signatures[0].label.contains("**kwargs"), "{help:?}");
        let diagnostics = snapshot.diagnostics(file_id).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(
            ids,
            [
                "missing-argument",
                "invalid-argument-type",
                "non-static-type"
            ],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn comprehension_attributes_preserve_call_schema() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(
            r#"def implementation(ctx): return []
attrs = {key: attr.string() for key in ("setting_a",)}
target = rule(implementation, attrs=attrs | {"exports": attr.label(mandatory=True)})
target(name="valid", exports="//:input", setting_a="fast")
target(name="wrong", exports="//:input", setting_a=42)
target(name="invented", exports="//:input", invented="fast")
target(name="missing", setting_a="fast")
"#,
        );
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(
            ids,
            [
                "invalid-argument-type",
                "unknown-argument",
                "missing-argument"
            ],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn mutated_rule_attributes_keep_types_and_requiredness() {
        let (mut analysis, _) = Analysis::new_for_test();
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
        let source = r#"
def implementation(ctx): pass
attrs = {"before": attr.string()}
attrs["after"] = attr.int(mandatory=True)
attrs.update({"before": attr.int()})
target = rule(implementation, attrs=attrs)
target($0name="valid", before=1, after=2)
"#;
        fixture.add_file(&mut analysis.db, "main.bzl", source);
        let (file_id, pos) = fixture.cursor_pos.unwrap();
        let snapshot = analysis.snapshot();
        let help = snapshot
            .signature_help(FilePosition { file_id, pos })
            .unwrap()
            .unwrap();
        let [signature] = help.signatures.as_slice() else {
            panic!("{help:?}");
        };
        let parameters = signature.parameters.as_ref().unwrap();
        assert!(
            parameters.iter().any(|parameter| parameter.label
                == "before: int | select[int | None, object] | None = ..."),
            "{help:?}"
        );
        assert!(
            parameters
                .iter()
                .any(|parameter| parameter.label == "after: int | select[int | None, object]"),
            "{help:?}"
        );
        assert!(!signature.label.contains("**kwargs"), "{help:?}");
        let diagnostics = ty_python_semantic::check_file_unwrap(
            &snapshot.db,
            snapshot.db.starlark_program_file(file_id),
        );
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        drop(snapshot);
        let source = source.replace("$0", "");
        for (call, expected) in [
            ("target(name='missing')", "missing-argument"),
            ("target(name='wrong', after='bad')", "invalid-argument-type"),
            (
                "target(name='extra', after=1, extra=True)",
                "unknown-argument",
            ),
            ("target(after=1)", "missing-argument"),
        ] {
            analysis.update_file(file_id, format!("{source}\n{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file_id).unwrap();
            assert_eq!(diagnostics.len(), 1, "{call}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), expected, "{call}");
        }
    }
}
