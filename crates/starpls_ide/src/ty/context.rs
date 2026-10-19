//! Bazel implementation-parameter contracts for function bodies and registrations.

use ruff_db::diagnostic::Annotation;
use ruff_db::diagnostic::Diagnostic;
use ruff_db::diagnostic::DiagnosticId;
use ruff_db::diagnostic::LintName;
use ruff_db::diagnostic::Severity;
use ruff_db::diagnostic::Span;
use ruff_db::files::FileRange;
use ruff_python_ast::find_node::covering_node;
use ruff_python_ast::name::Name;
use ruff_python_ast::visitor;
use ruff_python_ast::visitor::Visitor;
use ruff_python_ast::AnyNodeRef;
use ruff_python_ast::ArgOrKeyword;
use ruff_python_ast::Expr;
use ruff_python_ast::ExprCall;
use ruff_python_ast::Stmt;
use ruff_text_size::Ranged;
use starpls_bazel::attr::AttributeKind;
use starpls_common::Dialect;
use starpls_hir::Db as _;
use ty_python_core::definition::Definition;
use ty_python_core::definition::DefinitionKind;
use ty_python_core::definition::ParameterDefinitionNodeKind;
use ty_python_core::scope::FileScopeId;
use ty_python_core::ProgramFile;
use ty_python_semantic::provided::ProvidedClass;
use ty_python_semantic::provided::ProvidedField;
use ty_python_semantic::provided::ProvidedFieldImplication;
use ty_python_semantic::provided::ProvidedInstanceFields;
use ty_python_semantic::types::ide_support::resolved_call_signature;
use ty_python_semantic::types::ide_support::CallSignatureDetails;
use ty_python_semantic::types::CheckedArgument;
use ty_python_semantic::types::CheckedCall;
use ty_python_semantic::types::DictionaryExtraItems;
use ty_python_semantic::types::DictionaryFirstEntry;
use ty_python_semantic::types::DictionaryItem;
use ty_python_semantic::types::DictionaryItems;
use ty_python_semantic::types::KnownClass;
use ty_python_semantic::types::Parameter;
use ty_python_semantic::types::Parameters;
use ty_python_semantic::types::Signature;
use ty_python_semantic::types::Type;
use ty_python_semantic::types::TypedDictFieldBuilder;
use ty_python_semantic::types::TypedDictOpenness;
use ty_python_semantic::types::TypedDictSchema;
use ty_python_semantic::types::TypedDictType;
use ty_python_semantic::types::UnionType;
use ty_python_semantic::HasDefinition;
use ty_python_semantic::HasType;
use ty_python_semantic::ProgramEnvironment;
use ty_python_semantic::SemanticModel;

use super::factory;
use super::factory::Attribute;
use super::factory::AttributeConfiguration;
use super::factory::AttributeUse;
use super::factory::BuiltinFunction;
use super::factory::RuleAttributeData;
use crate::Database;

pub(super) fn contextual_parameters(db: &Database, definition: Definition<'_>) -> Box<[Name]> {
    if !db.environment().options(db).infer_ctx_attributes {
        return Box::default();
    }
    match factory::declaration(db, definition) {
        Some(BuiltinFunction::Rule { repository: _ }) => Box::from([Name::new("implementation")]),
        Some(BuiltinFunction::Aspect) => Box::from([Name::new("implementation")]),
        _ => Box::default(),
    }
}

pub(super) fn argument_context<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
    parameter: &str,
) -> Option<Type<'db>> {
    if !db.environment().options(db).infer_ctx_attributes || parameter != "implementation" {
        return None;
    }
    // Named functions receive body contracts through their own parameter definitions.
    if let CheckedArgument::Value { ty, expression: _ } = call.argument("implementation") {
        if matches!(ty, Type::FunctionLiteral(_)) {
            return None;
        }
    }
    registration_invocation(db, call)
}

fn registration_invocation<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
) -> Option<Type<'db>> {
    if !db.environment().options(db).infer_ctx_attributes {
        return None;
    }
    let declaration = call.declaration()?;
    let kind = match factory::declaration(db, declaration)? {
        BuiltinFunction::Rule { repository } => {
            if repository {
                ContextKind::Repository
            } else {
                ContextKind::Build
            }
        }
        BuiltinFunction::Aspect => ContextKind::Aspect,
        _ => return None,
    };
    // Factory schemas depend on sibling arguments, never on the callback body or call result.
    let context = context_type(
        db,
        Registration {
            file: call.file(),
            declaration,
            result: factory::result(db, call).unwrap_or_else(|| call.return_type()),
            kind,
        },
        &|name| match call.argument(name) {
            CheckedArgument::Omitted => Ok(Some(empty_mapping())),
            CheckedArgument::Value {
                ty: _,
                expression: _,
            } => Ok(call.dictionary_argument(db, name)),
            CheckedArgument::Indeterminate => Err(()),
        },
        &|class| Some(call.class_type(db, class)),
    )?;
    callback_invocation(db, call.file(), declaration, kind, context)
}

fn callback_invocation<'db>(
    db: &'db Database,
    file: ProgramFile<'db>,
    declaration: Definition<'db>,
    kind: ContextKind,
    context: Type<'db>,
) -> Option<Type<'db>> {
    let environment = ProgramEnvironment::from_file(file);
    let mut parameters = Vec::new();
    if kind == ContextKind::Aspect {
        let target = factory::native_class(db, declaration.program_file(db), "Target")?;
        let target = target.to_instance_approximation(db, &environment)?;
        parameters.push(Parameter::positional_only(None).with_annotated_type(target));
    }
    parameters.push(Parameter::positional_only(None).with_annotated_type(context));
    Some(Type::single_callable(
        db,
        Signature::new(
            Parameters::from_annotation(db, parameters),
            KnownClass::Object.to_instance(db, &environment),
        ),
    ))
}

pub(super) fn call_diagnostics<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
) -> Vec<Diagnostic> {
    if call.has_binding_errors() {
        return Vec::new();
    }
    let CheckedArgument::Value {
        ty,
        expression: Some(argument),
    } = call.argument("implementation")
    else {
        return Vec::new();
    };
    let Some(invocation) = registration_invocation(db, call) else {
        return Vec::new();
    };
    let environment = ProgramEnvironment::from_file(call.file());
    if ty.is_assignable_to(db, &environment, invocation) {
        return Vec::new();
    }
    vec![callback_diagnostic(
        db,
        &environment,
        call.file(),
        argument,
        ty,
        invocation,
    )]
}

fn callback_diagnostic(
    db: &Database,
    environment: &ProgramEnvironment<'_>,
    file: ProgramFile<'_>,
    argument: &Expr,
    ty: Type<'_>,
    invocation: Type<'_>,
) -> Diagnostic {
    let mut diagnostic = Diagnostic::new(
        DiagnosticId::Lint(LintName::of("invalid-argument-type")),
        Severity::Error,
        format!(
            "Callback `{}` does not accept the arguments supplied by this registration: `{}`",
            ty.display(db, environment),
            invocation.display(db, environment),
        ),
    );
    diagnostic.annotate(Annotation::primary(
        Span::from(file.file(db)).with_range(argument.range()),
    ));
    diagnostic
}

pub(super) struct CallbackContract<'a, 'db> {
    pub argument: &'a Expr,
    pub ty: Type<'db>,
    invocation: Type<'db>,
}

/// A callback view applies only to the registration that supplies its runtime arguments.
/// Its public function type stays independent of registration and body inference.
pub(super) fn callback_contract<'a, 'db>(
    db: &'db Database,
    model: &SemanticModel<'db>,
    call: &'a ExprCall,
) -> Option<CallbackContract<'a, 'db>> {
    if !db.environment().options(db).infer_ctx_attributes
        || model.scope(call.into()) != Some(FileScopeId::global())
    {
        return None;
    }
    let registration = resolved_call_signature(model, call)?;
    let declaration = registration.definition?;
    let factory = factory::declaration(db, declaration)?;
    let context_kind = match factory {
        BuiltinFunction::Rule { repository } => {
            if repository {
                ContextKind::Repository
            } else {
                ContextKind::Build
            }
        }
        BuiltinFunction::Aspect => ContextKind::Aspect,
        _ => return None,
    };
    let argument = argument(call, &registration, "implementation").ok()??;
    let Type::FunctionLiteral(function_type) = argument.inferred_type(model)? else {
        return None;
    };
    let mut overloads = function_type.iter_overloads_and_implementation(db);
    let overload = overloads.next()?;
    if overloads.next().is_some() {
        return None;
    }
    let definition = overload.definition(db);
    let file = definition.program_file(db);
    // Other modules are checked with their own registrations and declared contracts.
    if file != model.program_file() {
        return None;
    }
    let signature = overload.signature(db);
    let context = registration_context_type(db, model, file, call, &registration, context_kind)?;
    let invocation = callback_invocation(db, file, declaration, context_kind, context)?;
    // The body binding already combines every registration, source defaults, and annotation
    // precedence. Project only unannotated slots; the declared return remains authoritative.
    let signature = signature
        .with_inferred_parameter_context(|parameter| Some(model.definition_type(parameter)));
    Some(CallbackContract {
        argument,
        ty: Type::single_callable(db, signature),
        invocation,
    })
}

pub(super) fn diagnostics(db: &Database, file: starpls_common::File) -> Vec<Diagnostic> {
    if !db.environment().options(db).infer_ctx_attributes || file.is_type_interface(db) {
        return Vec::new();
    }
    let program = db.starlark_program_file(file);
    let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
    let model = SemanticModel::new(db, program);
    let environment = model.program_environment();
    let mut calls = RegistrationCalls::default();
    calls.visit_body(parsed.suite());
    calls
        .calls
        .into_iter()
        .filter_map(|call| {
            let CallbackContract {
                argument,
                ty,
                invocation,
            } = callback_contract(db, &model, call)?;
            // The completed-call hook checks the public callable signature. This
            // pass adds only mismatches exposed by inferred body parameters.
            let public_type = argument.inferred_type(&model)?;
            if !public_type.is_assignable_to(db, &environment, invocation)
                || ty.is_assignable_to(db, &environment, invocation)
            {
                return None;
            }
            Some(callback_diagnostic(
                db,
                &environment,
                program,
                argument,
                ty,
                invocation,
            ))
        })
        .collect()
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum ContextKind {
    Build,
    Repository,
    Aspect,
}

pub(super) fn parameter_type<'db>(
    db: &'db Database,
    definition: Definition<'db>,
) -> Option<Type<'db>> {
    if !db.environment().options(db).infer_ctx_attributes {
        return None;
    }
    let definition = super::interface::source_parameter(db, definition).unwrap_or(definition);
    let file = definition.program_file(db);
    if db.starlark_file(file)?.dialect != Dialect::Bazel {
        return None;
    }
    let DefinitionKind::Parameter(parameter) = definition.kind(db) else {
        return None;
    };
    let ParameterDefinitionNodeKind::Parameter(parameter) = parameter else {
        return None;
    };
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let parameter = parameter.node(&parsed);
    let function = covering_node(parsed.syntax().into(), parameter.range())
        .ancestors()
        .find_map(|node| match node {
            AnyNodeRef::StmtFunctionDef(function) => Some(function),
            _ => None,
        })?;
    let model = SemanticModel::new(db, file);
    let implementation = function.definition(&model);
    let environment = model.program_environment();
    let mut calls = RegistrationCalls::default();
    for statement in parsed.suite() {
        calls.visit_stmt(statement);
    }
    let mut parameter_types = Vec::new();
    for call in calls.calls {
        let Some(signature) = resolved_call_signature(&model, call) else {
            continue;
        };
        let Some(declaration) = signature.definition else {
            continue;
        };
        let Some(factory) = factory::declaration(db, declaration) else {
            continue;
        };
        if !matches!(
            factory,
            BuiltinFunction::Rule { repository: _ }
                | BuiltinFunction::Aspect
                | BuiltinFunction::Macro
        ) {
            continue;
        }
        // An unknown expansion could register this callback with another schema;
        // every possible body contract must be accounted for.
        let Some(argument) = argument(call, &signature, "implementation").ok()? else {
            continue;
        };
        // An inline lambda is a distinct callback from this named function.
        if matches!(argument, Expr::Lambda(_)) {
            continue;
        }
        let ty = argument.inferred_type(&model)?;
        if !matches!(ty, Type::FunctionLiteral(_)) {
            return None;
        }
        let target = ty
            .definition(db, &environment)
            .and_then(|ty| ty.definition())?;
        if target != implementation {
            continue;
        }
        parameter_types.push(registration_parameter_type(
            db,
            &model,
            file,
            function,
            parameter.name().as_str(),
            call,
            &signature,
        )?);
    }
    if parameter_types.is_empty() {
        return None;
    }
    // A shared implementation must accept the context from every registration.
    Some(UnionType::from_elements(db, &environment, parameter_types))
}

fn registration_parameter_type<'db>(
    db: &'db Database,
    model: &SemanticModel<'db>,
    file: ProgramFile<'db>,
    function: &ruff_python_ast::StmtFunctionDef,
    parameter: &str,
    call: &ExprCall,
    signature: &CallSignatureDetails<'db>,
) -> Option<Type<'db>> {
    let environment = model.program_environment();
    let declaration = signature.definition?;
    let factory = factory::declaration(db, declaration)?;
    let declarations = declaration.program_file(db);
    let context_kind = match factory {
        BuiltinFunction::Macro => {
            let result = call.inferred_type(model)?;
            let data = result.provided_data(db, &environment)?;
            let data = data.downcast_ref::<factory::RuleData>()?;
            return data.parameter_type(db, &environment, declarations, parameter);
        }
        BuiltinFunction::Rule { repository } => {
            if repository {
                ContextKind::Repository
            } else {
                ContextKind::Build
            }
        }
        BuiltinFunction::Aspect => ContextKind::Aspect,
        BuiltinFunction::Attribute(_) => return None,
        BuiltinFunction::BuildSetting(_) => return None,
        BuiltinFunction::Struct => return None,
        BuiltinFunction::StructGetattr => return None,
        BuiltinFunction::Getattr => return None,
        BuiltinFunction::Provider => return None,
        BuiltinFunction::Select => return None,
        BuiltinFunction::Download { always_blocking: _ } => return None,
    };
    let parameter_count = if context_kind == ContextKind::Aspect {
        2
    } else {
        1
    };
    if function.parameters.iter_non_variadic_params().count() != parameter_count
        || function.parameters.vararg.is_some()
        || function.parameters.kwarg.is_some()
    {
        return None;
    }
    if context_kind == ContextKind::Aspect {
        if !function.parameters.kwonlyargs.is_empty() {
            return None;
        }
        if function.parameters.index(parameter) == Some(0) {
            let target = factory::native_class(db, declarations, "Target")?;
            return target.to_instance_approximation(db, &environment);
        }
    }
    registration_context_type(db, model, file, call, signature, context_kind)
}

fn registration_context_type<'db>(
    db: &'db Database,
    model: &SemanticModel<'db>,
    file: ProgramFile<'db>,
    call: &ExprCall,
    signature: &CallSignatureDetails<'db>,
    context_kind: ContextKind,
) -> Option<Type<'db>> {
    context_type(
        db,
        Registration {
            file,
            declaration: signature.definition?,
            result: call.inferred_type(model)?,
            kind: context_kind,
        },
        &|name| {
            Ok(match argument(call, signature, name)? {
                Some(expression) => model.dictionary_items(expression),
                None => Some(empty_mapping()),
            })
        },
        &|class| model.provided_class_at_call(call, class),
    )
}

fn empty_mapping<'db>() -> DictionaryItems<'db> {
    DictionaryItems {
        items: Box::default(),
        extra_items: DictionaryExtraItems::Closed,
        first_entry: DictionaryFirstEntry::Empty,
    }
}

struct Registration<'db> {
    file: ProgramFile<'db>,
    declaration: Definition<'db>,
    result: Type<'db>,
    kind: ContextKind,
}

fn context_type<'db>(
    db: &'db Database,
    registration: Registration<'db>,
    dictionary_argument: &dyn Fn(&str) -> Result<Option<DictionaryItems<'db>>, ()>,
    class_type: &dyn Fn(ProvidedClass<'db>) -> Option<Type<'db>>,
) -> Option<Type<'db>> {
    let Registration {
        file,
        declaration,
        result,
        kind: context_kind,
    } = registration;
    let environment = ProgramEnvironment::from_file(file);
    let declarations = declaration.program_file(db);
    let rule = result
        .provided_data(db, &environment)
        .and_then(|data| data.downcast_ref::<factory::RuleData>());
    let aspect_attributes;
    let mut analyzed_types = TypedDictSchema::default();
    let (attributes, complete) = if context_kind == ContextKind::Aspect {
        let mapping = dictionary_argument("attrs")
            .ok()?
            .unwrap_or(DictionaryItems {
                items: Box::default(),
                extra_items: DictionaryExtraItems::Value(Type::unknown()),
                first_entry: DictionaryFirstEntry::Unknown,
            });
        let is_complete = mapping.is_complete();
        let DictionaryItems {
            items,
            extra_items: _,
            first_entry: _,
        } = mapping;
        let is_complete = is_complete && items.iter().all(DictionaryItem::is_required);
        for item in items.iter().filter(|item| item.is_required()) {
            if let Some(value) =
                factory::native_type_argument(db, &environment, declarations, item.ty, "Attribute")
            {
                analyzed_types.insert(
                    item.name.clone(),
                    TypedDictFieldBuilder::new(value)
                        .required(true)
                        .read_only(true)
                        .build(),
                );
            }
        }
        aspect_attributes = items
            .iter()
            .filter(|item| item.is_required())
            .map(
                |DictionaryItem {
                     name,
                     ty,
                     source,
                     kind: _,
                 }| RuleAttributeData {
                    name: name.clone(),
                    descriptor: ty
                        .provided_data(db, &environment)
                        .and_then(|data| data.downcast_ref::<Attribute>())
                        .cloned(),
                    source: Some(FileRange::new(file.file(db), *source)),
                },
            )
            .collect::<Vec<_>>();
        (aspect_attributes.as_slice(), is_complete)
    } else {
        let rule = rule?;
        if context_kind == ContextKind::Build {
            analyzed_types = factory::native_type_argument(
                db,
                &environment,
                declarations,
                result,
                "_AnalyzedRule",
            )
            .and_then(|shape| match shape {
                Type::TypedDict(shape) => Some(shape.items(db).clone()),
                _ => None,
            })
            .unwrap_or_default();
        }
        (rule.attributes.as_ref(), rule.complete)
    };
    let make_class = |name, base, fields, has_dynamic_fields, implications| {
        let class = class_type(ProvidedClass {
            name: Name::new(name),
            bases: vec![base].into_boxed_slice(),
            class_members: Box::default(),
            instance_fields: ProvidedInstanceFields {
                fields,
                has_dynamic_fields,
                implications,
                data: None,
            }
            .into(),
        })?;
        class.to_instance_approximation(db, &environment)
    };
    let mut context_fields = Vec::new();
    for view in [
        View::Attr,
        View::Files,
        View::File,
        View::Executable,
        View::Outputs,
        View::SplitAttr,
    ] {
        if context_kind == ContextKind::Repository && view != View::Attr {
            continue;
        }
        if context_kind == ContextKind::Aspect && matches!(view, View::Outputs | View::SplitAttr) {
            continue;
        }
        let mut complete = complete;
        let mut fields = Vec::new();
        for RuleAttributeData {
            name,
            descriptor,
            source,
        } in attributes
        {
            // Bazel accepts hints at rule call sites but hides them from ctx.attr.
            if context_kind == ContextKind::Build
                && !starpls_bazel::attr::visible_in_rule_context(name)
            {
                continue;
            }
            let ty = if let Some(attribute) = descriptor {
                let finite = if view == View::Attr {
                    attribute.finite_value_type(db, &environment, name.starts_with('_'))
                } else {
                    None
                };
                if let Some(ty) = finite {
                    ty
                } else if context_kind == ContextKind::Repository {
                    if attribute.kind == AttributeKind::Label && attribute.has_non_none_value() {
                        factory::native_class(db, declarations, "Label")?
                            .to_instance_approximation(db, &environment)?
                    } else {
                        factory::attribute_value_type(
                            db,
                            &environment,
                            declarations,
                            &attribute.kind,
                            AttributeUse::RepositoryContext,
                        )?
                    }
                } else {
                    let Some(ty) = field_type(db, &environment, declarations, view, attribute)
                    else {
                        continue;
                    };
                    ty
                }
            } else {
                if view != View::Attr {
                    // A typed helper can describe ctx.attr without retaining the
                    // constructor flags that establish other context fields.
                    complete = false;
                    continue;
                }
                analyzed_types
                    .get(name)
                    .map_or_else(Type::unknown, |field| field.declared_type())
            };
            fields.push(ProvidedField {
                name: name.clone(),
                ty,
                source: *source,
            });
        }
        if view == View::Outputs {
            let output = factory::native_class(db, declarations, "File")?
                .to_instance_approximation(db, &environment)?;
            match dictionary_argument("outputs").ok()? {
                Some(mapping) => {
                    let is_complete = mapping.is_complete();
                    let DictionaryItems {
                        items,
                        extra_items: _,
                        first_entry: _,
                    } = mapping;
                    let is_complete = is_complete && items.iter().all(DictionaryItem::is_required);
                    complete &= is_complete;
                    for DictionaryItem {
                        name,
                        ty: _,
                        source,
                        kind: _,
                    } in IntoIterator::into_iter(items).filter(DictionaryItem::is_required)
                    {
                        insert_field(
                            &mut fields,
                            ProvidedField {
                                name,
                                ty: if is_complete { output } else { Type::unknown() },
                                source: Some(FileRange::new(file.file(db), source)),
                            },
                        );
                    }
                }
                None => complete = false,
            }
            match rule?.executable {
                Some(true) => insert_field(
                    &mut fields,
                    ProvidedField {
                        name: Name::new("executable"),
                        ty: output,
                        source: None,
                    },
                ),
                Some(false) => {}
                None => complete = false,
            }
        }
        let object = KnownClass::Object.to_instance(db, &environment);
        let schema = TypedDictType::from_schema_items_with_openness(
            db,
            fields
                .iter()
                .map(|field| {
                    (
                        field.name.clone(),
                        TypedDictFieldBuilder::new(field.ty)
                            .required(true)
                            .read_only(true)
                            .build(),
                    )
                })
                .collect(),
            if complete {
                TypedDictOpenness::Closed
            } else {
                TypedDictOpenness::extra(db, object, true)
            },
        );
        let values = UnionType::from_elements(
            db,
            &environment,
            fields
                .iter()
                .map(|field| field.ty)
                .chain((!complete).then_some(object)),
        );
        let base = factory::specialized_native_class(
            db,
            declarations,
            "struct",
            vec![values, Type::TypedDict(schema)],
        )?;
        let ty = make_class(
            view.name(),
            base,
            fields.into_boxed_slice(),
            !complete,
            Box::default(),
        )?;
        context_fields.push(ProvidedField {
            name: Name::new(view.name()),
            ty,
            source: None,
        });
    }
    let name = if context_kind == ContextKind::Repository {
        "repository_ctx"
    } else {
        "ctx"
    };
    let base = if context_kind == ContextKind::Repository {
        factory::native_class(db, declarations, name)?
    } else {
        let build_setting = match rule.and_then(|rule| rule.build_setting) {
            Some(setting) => setting.value_type(db, &environment),
            None => {
                // The native default describes every successful build-setting read,
                // even when the exact descriptor is unavailable.
                let instance = factory::native_class(db, declarations, name)?
                    .to_instance_approximation(db, &environment)?;
                let (_, specialization) = instance.class_specialization(db, &environment)?;
                let [value, _attrs] = specialization.types(db) else {
                    return None;
                };
                *value
            }
        };
        let attributes = context_fields
            .iter()
            .find(|field| field.name == "attr")
            .expect("every context has an attribute view")
            .ty;
        factory::specialized_native_class(db, declarations, name, vec![build_setting, attributes])?
    };
    let mut implications = Vec::new();
    // Valid single-file and executable prerequisites provide a File in each
    // enabled view when the target is present. These types describe accepted
    // inputs; Bazel can record prerequisite errors during context construction
    // and still invoke the implementation.
    if context_kind != ContextKind::Repository {
        for RuleAttributeData {
            name,
            descriptor,
            source: _,
        } in attributes
        {
            let Some(attribute) = descriptor else {
                continue;
            };
            if attribute.kind != AttributeKind::Label
                || attribute.configuration != AttributeConfiguration::Ordinary
                || attribute.has_non_none_value()
            {
                continue;
            }
            for (view, enabled) in [
                (View::File, attribute.single_file),
                (View::Executable, attribute.executable),
            ] {
                if enabled != Some(true) {
                    continue;
                }
                let file_class = factory::native_class(db, declarations, "File")?;
                let ty = file_class.to_instance_approximation(db, &environment)?;
                implications.push(ProvidedFieldImplication {
                    guard: Box::from([Name::new("attr"), name.clone()]),
                    target: Box::from([Name::new(view.name()), name.clone()]),
                    ty,
                });
            }
        }
    }
    make_class(
        name,
        base,
        context_fields.into_boxed_slice(),
        false,
        implications.into_boxed_slice(),
    )
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum View {
    Attr,
    Files,
    File,
    Executable,
    Outputs,
    SplitAttr,
}

impl View {
    fn name(self) -> &'static str {
        match self {
            Self::Attr => "attr",
            Self::Files => "files",
            Self::File => "file",
            Self::Executable => "executable",
            Self::Outputs => "outputs",
            Self::SplitAttr => "split_attr",
        }
    }
}

fn insert_field<'db>(fields: &mut Vec<ProvidedField<'db>>, field: ProvidedField<'db>) {
    if let Some(existing) = fields
        .iter_mut()
        .find(|existing| existing.name == field.name)
    {
        *existing = field;
    } else {
        fields.push(field);
    }
}

fn dependency(kind: &AttributeKind) -> bool {
    matches!(
        kind,
        AttributeKind::Label
            | AttributeKind::LabelList
            | AttributeKind::LabelKeyedStringDict
            | AttributeKind::StringKeyedLabelDict
            | AttributeKind::StringKeyedLabelListDict
    )
}

fn native_file_list<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    declarations: ProgramFile<'db>,
) -> Option<Type<'db>> {
    let file = factory::native_class(db, declarations, "File")?
        .to_instance_approximation(db, environment)?;
    Some(KnownClass::List.to_specialized_instance(db, environment, &[file]))
}

/// The value an attribute produces in an analyzed rule or aspect's `ctx.attr`.
/// Repository and macro values, flags, and other views remain descriptor-owned.
pub(super) fn analyzed_attribute_type<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    declarations: ProgramFile<'db>,
    attribute: &Attribute,
) -> Option<Type<'db>> {
    attribute
        .finite_value_type(db, environment, false)
        .or_else(|| field_type(db, environment, declarations, View::Attr, attribute))
}

fn field_type<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    declarations: ProgramFile<'db>,
    view: View,
    attribute: &Attribute,
) -> Option<Type<'db>> {
    let native = |name| {
        factory::native_class(db, declarations, name)?.to_instance_approximation(db, environment)
    };
    let list = |ty| KnownClass::List.to_specialized_instance(db, environment, &[ty]);
    let dict =
        |key, value| KnownClass::Dict.to_specialized_instance(db, environment, &[key, value]);
    let optional =
        |ty| UnionType::from_elements(db, environment, [ty, Type::none(db, environment)]);
    let present = |ty| {
        if attribute.has_non_none_value() {
            ty
        } else {
            optional(ty)
        }
    };
    let optional_file = |enabled| {
        if attribute.kind != AttributeKind::Label {
            return None;
        }
        match enabled {
            Some(true) => Some(present(native("File")?)),
            Some(false) => None,
            None => Some(Type::unknown()),
        }
    };
    let target = || {
        // Successful executable/single-artifact prerequisites exclude targets
        // without FilesToRunProvider. Other dependencies can be environment groups.
        let provider = if attribute.executable == Some(true) {
            let file = native("File")?;
            factory::specialized_native_instance(
                db,
                environment,
                declarations,
                "FilesToRunProvider",
                vec![file],
            )?
        } else {
            native("FilesToRunProvider")?
        };
        let target = factory::specialized_native_instance(
            db,
            environment,
            declarations,
            "Target",
            vec![provider],
        )?;
        if attribute.executable == Some(true) || attribute.single_file == Some(true) {
            Some(target)
        } else {
            let group = factory::specialized_native_instance(
                db,
                environment,
                declarations,
                "Target",
                vec![Type::none(db, environment)],
            )?;
            Some(UnionType::from_elements(db, environment, [target, group]))
        }
    };
    match view {
        View::Attr => {
            if attribute.kind == AttributeKind::Label {
                match attribute.configuration {
                    AttributeConfiguration::Split => return Some(list(target()?)),
                    AttributeConfiguration::Unknown => return Some(Type::unknown()),
                    AttributeConfiguration::Ordinary => return Some(present(target()?)),
                }
            }
            if attribute.kind == AttributeKind::Output {
                return Some(present(native("Label")?));
            }
            factory::attribute_value_type(
                db,
                environment,
                declarations,
                &attribute.kind,
                AttributeUse::BuildContext(target()?),
            )
        }
        View::Files => dependency(&attribute.kind)
            .then(|| native_file_list(db, environment, declarations))
            .flatten(),
        View::File => optional_file(attribute.single_file),
        View::Executable => optional_file(attribute.executable),
        View::Outputs => match attribute.kind {
            AttributeKind::Output => Some(present(native("File")?)),
            AttributeKind::OutputList => Some(list(native("File")?)),
            _ => None,
        },
        View::SplitAttr => {
            if !dependency(&attribute.kind) {
                return None;
            }
            match attribute.configuration {
                AttributeConfiguration::Ordinary => return None,
                AttributeConfiguration::Unknown => return Some(Type::unknown()),
                AttributeConfiguration::Split => {}
            }
            let string = KnownClass::Str.to_instance(db, environment);
            let target = target()?;
            let value = match attribute.kind {
                AttributeKind::Label => target,
                AttributeKind::LabelList => list(target),
                AttributeKind::LabelKeyedStringDict => list(target),
                AttributeKind::StringKeyedLabelDict => dict(string, target),
                AttributeKind::StringKeyedLabelListDict => dict(string, list(target)),
                _ => unreachable!("split attributes are dependencies"),
            };
            Some(dict(optional(string), value))
        }
    }
}

/// Select a definite source argument using Ty's existing binding. Expanded
/// arguments can supply or overwrite either field, so they leave this policy gradual.
fn argument<'a>(
    call: &'a ExprCall,
    signature: &CallSignatureDetails<'_>,
    name: &str,
) -> Result<Option<&'a Expr>, ()> {
    let parameter = signature
        .parameters
        .iter()
        .position(|parameter| parameter.name == name)
        .ok_or(())?;
    let mut selected = None;
    for (index, argument) in call.arguments.iter_source_order().enumerate() {
        let expression = match argument {
            ArgOrKeyword::Arg(expression) => {
                if matches!(expression, Expr::Starred(_)) {
                    return Err(());
                }
                expression
            }
            ArgOrKeyword::Keyword(keyword) => {
                keyword.arg.as_ref().ok_or(())?;
                &keyword.value
            }
        };
        if signature.argument_to_displayed_parameter_mapping.get(index) == Some(&Some(parameter)) {
            if selected.is_some() {
                return Err(());
            }
            selected = Some(expression);
        }
    }
    Ok(selected)
}

#[derive(Default)]
struct RegistrationCalls<'a> {
    calls: Vec<&'a ExprCall>,
}

impl<'a> Visitor<'a> for RegistrationCalls<'a> {
    fn visit_stmt(&mut self, statement: &'a Stmt) {
        // Only module-executed registrations establish this opt-in contract.
        // Inferring deferred bodies here could re-enter the parameter being supplied.
        if !matches!(statement, Stmt::FunctionDef(_) | Stmt::ClassDef(_)) {
            visitor::walk_stmt(self, statement);
        }
    }

    fn visit_expr(&mut self, expression: &'a Expr) {
        match expression {
            Expr::Lambda(_) => {}
            Expr::Call(call) => {
                // Skip calls that cannot supply an implementation argument.
                // The shared matcher still decides every candidate's meaning.
                if !call.arguments.args.is_empty()
                    || call.arguments.keywords.iter().any(|keyword| {
                        keyword
                            .arg
                            .as_ref()
                            .is_none_or(|name| name.as_str() == "implementation")
                    })
                {
                    self.calls.push(call);
                }
                visitor::walk_expr(self, expression);
            }
            _ => visitor::walk_expr(self, expression),
        }
    }
}

#[cfg(test)]
mod tests {
    use ruff_python_ast::Stmt;
    use salsa::Setter;
    use starpls_bazel::build::attribute::Discriminator;
    use starpls_hir::Db as _;
    use starpls_hir::Fixture;
    use ty_python_semantic::types::CallableTypeKind;
    use ty_python_semantic::types::ParameterKind;
    use ty_python_semantic::types::Type;
    use ty_python_semantic::HasDefinition;
    use ty_python_semantic::HasType;
    use ty_python_semantic::SemanticModel;

    use crate::Analysis;
    use crate::FilePosition;
    use crate::LocationLink;

    fn enable_context(analysis: &mut Analysis) {
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis
            .db
            .environment()
            .set_options(&mut analysis.db)
            .to(crate::InferenceOptions {
                infer_ctx_attributes: true,
                ..Default::default()
            });
    }

    #[test]
    fn repeated_attributes_preserve_context_fields() {
        for (factory, parameters, expression, descriptor, result) in [
            ("rule", "ctx", "ctx.attr.message", "attr.string()", "[]"),
            (
                "repository_rule",
                "ctx",
                "ctx.attr.message",
                "attr.string()",
                "None",
            ),
            (
                "aspect",
                "target, ctx",
                "ctx.attr.message",
                "attr.string()",
                "[]",
            ),
            (
                "macro",
                "name, visibility, message",
                "message",
                "attr.string(mandatory=True, configurable=False)",
                "None",
            ),
        ] {
            let source = format!(
                r#"def implementation({parameters}):
    checked: str = {expression}
    print(checked)
    return {result}
attributes = {{"message": {descriptor}}}
first = {factory}(implementation=implementation, attrs=attributes)
second = {factory}(implementation=implementation, attrs=attributes)
"#
            );
            let (mut analysis, fixture) = Analysis::from_single_file_fixture(&source);
            enable_context(&mut analysis);
            analysis.set_rules(
                crate::DiagnosticRules::from_settings(
                    &[("unsound-assignment".into(), "error".into())].into(),
                )
                .unwrap(),
            );
            let file = fixture.main_file();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{factory}: {diagnostics:?}");
            for (edit, expected) in [
                ("attributes['message'] = attr.int()\n", "invalid-assignment"),
                (
                    "def expose(value): pass\nexpose(attributes)\n",
                    "unsound-assignment",
                ),
            ] {
                analysis.update_file(file, source.replace("second =", &format!("{edit}second =")));
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert!(
                    diagnostics
                        .iter()
                        .any(|diagnostic| diagnostic.id().as_str() == expected
                            && diagnostic
                                .range()
                                .is_some_and(|range| range.end().to_usize()
                                    < source.find("attributes =").unwrap())),
                    "{factory}, {edit}: {diagnostics:?}"
                );
            }
        }
    }

    #[test]
    fn stub_parameters_share_generated_source_context() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        enable_context(&mut analysis);
        let text = "def implementation(ctx):\n    target: Target = ctx.attr.src\n    print(target)\n    return []\ndef unrelated(value):\n    pass\nunrelated_rule = rule(implementation=lambda context: [])\nexample = rule(implementation=implementation, attrs={'src': attr.label(mandatory=True)})\nsecond = rule(implementation=implementation, attrs={'src': attr.label(mandatory=True), 'enabled': attr.bool()})\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", text);
        let stub = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "def implementation(ctx) -> list[DefaultInfo]: ...\ndef unrelated(value) -> None: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("missing-parameter-annotation".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        for file in [source, stub] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "missing-parameter-annotation");
            assert!(diagnostics[0].headline_message().contains("`value`"));
        }
        let parameter_type = |file| {
            let program = analysis.db.starlark_program_file(file);
            let parsed =
                ruff_db::parsed::parsed_module(&analysis.db, program.python_file(&analysis.db))
                    .load(&analysis.db);
            let statement = parsed
                .suite()
                .first()
                .expect("expected implementation statement");
            let Stmt::FunctionDef(function) = statement else {
                panic!("expected implementation function");
            };
            let [parameter] = function.parameters.args.as_ref() else {
                panic!("expected one implementation parameter");
            };
            let model = SemanticModel::new(&analysis.db, program);
            model.definition_type(parameter.parameter.definition(&model))
        };
        assert_eq!(parameter_type(stub), parameter_type(source));

        // Editing the source schema updates the shared context without weakening its fields.
        for changed in [
            text.replace("mandatory=True", "mandatory=False"),
            text.replacen("attr.label(mandatory=True)", "attr.string()", 1),
        ] {
            analysis.update_file(source, changed);
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            let ids: Vec<_> = diagnostics.iter().map(|d| d.id().as_str()).collect();
            assert_eq!(
                ids,
                ["invalid-assignment", "missing-parameter-annotation"],
                "{diagnostics:?}"
            );
        }
        analysis.update_file(
            source,
            text.replacen(
                "'src': attr.label(mandatory=True)",
                "'other': attr.string()",
                1,
            ),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|d| d.id().as_str() == "unresolved-attribute"),
            "{diagnostics:?}"
        );

        // Without a unique, compatible implementation, the omitted stub slot stays untyped.
        analysis.set_type_interfaces([]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(stub).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(diagnostics
            .iter()
            .all(|d| d.id().as_str() == "missing-parameter-annotation"));
        let other = fixture.add_file(&mut analysis.db, "other.bzl", text);
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_type_interfaces([(source, stub), (other, stub)])
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(stub).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(diagnostics
            .iter()
            .all(|d| d.id().as_str() == "missing-parameter-annotation"));
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        analysis.update_file(
            source,
            text.replace("implementation(ctx)", "implementation(ctx, extra)"),
        );
        let diagnostics = analysis.snapshot().diagnostics(stub).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|d| d.id().as_str() == "missing-parameter-annotation"
                    && d.headline_message().contains("`ctx`")),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn successful_provider_lookup_establishes_files_to_run() {
        let source = r#"Info = provider(fields=["message"])
def implementation(ctx):
    target = ctx.attr.dep
    info = target[Info]
    print(info)
    executable = target[DefaultInfo].files_to_run.executable # type: File | None
    if executable != None:
        print(executable.path)
    for dependency in ctx.attr.deps:
        for artifact in dependency[OutputGroupInfo]["exe"].to_list():
            print(artifact.path)
        manifest = dependency[DefaultInfo].files_to_run.runfiles_manifest # type: File | None
        if manifest != None:
            print(manifest.path)
    return []
example = rule(implementation=implementation, attrs={
    "dep": attr.label(mandatory=True),
    "deps": attr.label_list(),
})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for (original, replacement, expression) in [
            (
                "    if executable != None:\n        print(executable.path)",
                "    print(executable.path)",
                "executable.path",
            ),
            (
                "        if manifest != None:\n            print(manifest.path)",
                "        print(manifest.path)",
                "manifest.path",
            ),
            (
                "info = target[Info]",
                "info = target[DefaultInfo]",
                "target[DefaultInfo].files_to_run.executable",
            ),
        ] {
            let source = source.replace(original, replacement);
            analysis.update_file(file, source.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{expression}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "unresolved-attribute");
            assert!(diagnostic.concise_message().to_string().contains("None"));
            let range = diagnostic.range().unwrap();
            assert_eq!(
                &source[range.start().to_usize()..range.end().to_usize()],
                expression,
            );
        }
    }

    #[test]
    fn attribute_guards_refine_matching_file_views() {
        let source = r#"def implementation(ctx):
    if ctx.attr.jar:
        print(ctx.file.jar.path)
        if ctx.attr.tool:
            print(ctx.file.jar.path, ctx.executable.tool.path)
    selected = ctx.file.jar if ctx.attr.jar else ctx.files.jars[0]
    print(selected.path)
    if ctx.attr.tool:
        print(ctx.executable.tool.path)
    return []
example = rule(implementation=implementation, attrs={
    "jar": attr.label(allow_single_file=True),
    "jars": attr.label_list(allow_files=True),
    "other": attr.label(allow_single_file=True),
    "tool": attr.label(executable=True, cfg="exec"),
})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for (expression, key) in [
            ("ctx.file.jar", "\"jar\""),
            ("ctx.executable.tool", "\"tool\""),
        ] {
            check_field(&analysis.snapshot(), file, source, expression, "File", key);
        }

        for (statement, expression) in [
            ("    print(ctx.file.jar.path)", "ctx.file.jar.path"),
            (
                "    if not ctx.attr.jar:\n        print(ctx.file.jar.path)",
                "ctx.file.jar.path",
            ),
            (
                "    if ctx.attr.jar:\n        print(ctx.file.other.path)",
                "ctx.file.other.path",
            ),
            (
                "    if ctx.attr.jar:\n        print(ctx.executable.tool.path)",
                "ctx.executable.tool.path",
            ),
            (
                "    if ctx.attr.tool:\n        print(ctx.file.jar.path)",
                "ctx.file.jar.path",
            ),
        ] {
            let changed = source.replace("    return []", &format!("{statement}\n    return []"));
            analysis.update_file(file, changed.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{statement}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "unresolved-attribute");
            assert!(diagnostic.concise_message().to_string().contains("None"));
            assert_eq!(&changed[diagnostic.range().unwrap()], expression);
        }
        analysis.update_file(
            file,
            source.replace("allow_single_file=True", "allow_single_file=False"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (option, replacement, expression, key, errors) in [
            (
                "allow_single_file=True",
                "allow_single_file=None",
                "ctx.file.jar",
                "\"jar\"",
                3,
            ),
            (
                "executable=True",
                "executable=False",
                "ctx.executable.tool",
                "\"tool\"",
                2,
            ),
        ] {
            let changed = source.replace(option, replacement);
            analysis.update_file(file, changed.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), errors, "{option}: {diagnostics:?}");
            assert!(
                diagnostics.iter().all(|diagnostic| {
                    diagnostic.id().as_str() == "unresolved-attribute"
                        && changed[diagnostic.range().unwrap()].starts_with(expression)
                }),
                "{option}: {diagnostics:?}"
            );
            check_field(
                &analysis.snapshot(),
                file,
                &changed,
                expression,
                "Unknown",
                "",
            );
            analysis.update_file(file, source.to_owned());
            check_field(&analysis.snapshot(), file, source, expression, "File", key);
        }
    }

    #[test]
    fn provider_field_mappings_preserve_list_inference() {
        let providers = r#"FIELDS = dict(value='Value documentation')
SecondInfo = provider(fields=FIELDS)
ThirdInfo = provider(fields=FIELDS)
"#;
        let source = r#"load('providers.bzl', 'SecondInfo', 'ThirdInfo')
FirstInfo = provider(fields=['value'])
def implementation(ctx):
    image = ctx.attr.image
    result = [image[DefaultInfo], FirstInfo(value=1)]
    for provider_type in [SecondInfo, ThirdInfo, OutputGroupInfo]:
        if provider_type in image:
            result.append(image[provider_type])
    _ = result[0]
    return result
example = rule(implementation=implementation, attrs={'image': attr.label(mandatory=True)})
"#;
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        fixture.add_file(&mut analysis.db, "providers.bzl", providers);
        let file = fixture.add_file(&mut analysis.db, "defs.bzl", source);
        loader.add_files_from_fixture(&fixture);
        enable_context(&mut analysis);
        let snapshot = analysis.snapshot();
        let diagnostics = snapshot.diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        let db = &snapshot.db;
        let program = db.starlark_program_file(file);
        let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
        let model = SemanticModel::new(db, program);
        let [_load, _provider, implementation, _rule] = parsed.suite().as_slice() else {
            panic!("expected provider fixture declarations");
        };
        let Stmt::FunctionDef(function) = implementation else {
            panic!("expected implementation function");
        };
        let [_image, _initial, _loop, observation, _return] = function.body.as_slice() else {
            panic!("expected list construction, appends, and observation");
        };
        let Stmt::Assign(assignment) = observation else {
            panic!("expected list element observation");
        };
        let ty = assignment.value.inferred_type(&model).unwrap();
        let mut elements: Vec<_> = ty
            .as_union()
            .expect("expected a union of provider instances")
            .elements(db)
            .iter()
            .map(|ty| ty.display(db, &model.program_environment()).to_string())
            .collect();
        elements.sort();
        assert_eq!(
            elements,
            [
                "DefaultInfo[depset[File], FilesToRunProvider[File | None]]",
                "DefaultInfo[depset[File], None]",
                "FirstInfo",
                "OutputGroupInfo",
                "SecondInfo",
                "ThirdInfo",
            ]
        );
    }

    fn check_field(
        snapshot: &crate::AnalysisSnapshot,
        file: starpls_common::File,
        source: &str,
        expression: &str,
        expected: &str,
        key: &str,
    ) {
        let pos = (source.find(expression).unwrap() + expression.len() - 1) as u32;
        let position = FilePosition {
            file_id: file,
            pos: pos.into(),
        };
        let hover = snapshot.hover(position.clone()).unwrap().unwrap();
        assert!(
            hover.contents.value.contains(&format!(": {expected}\n")),
            "{expression}: {}",
            hover.contents.value
        );
        if !key.is_empty() {
            let locations = snapshot.goto_definition(position, false).unwrap().unwrap();
            let [LocationLink::Local {
                target_file_id,
                target_selection_range,
                origin_selection_range: _,
                target_range: _,
            }] = locations.as_slice()
            else {
                panic!("{locations:?}");
            };
            assert_eq!(*target_file_id, file.source);
            assert_eq!(&source[*target_selection_range], key);
        }
    }

    #[test]
    fn private_scalar_attributes_preserve_default_literals() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
        enable_context(&mut analysis);
        let file = fixture.main_file();
        for (descriptor, private, public) in [
            ("attr.string(default='fast')", "Literal[\"fast\"]", "str"),
            ("attr.string()", "Literal[\"\"]", "str"),
            ("attr.int(default=42)", "Literal[42]", "int"),
            ("attr.int()", "Literal[0]", "int"),
            ("attr.bool(default=True)", "Literal[True]", "bool"),
            ("attr.bool()", "Literal[False]", "bool"),
            ("attr.string(default=dynamic())", "str", "str"),
            (
                "attr.label(default='//:tool')",
                "Target[FilesToRunProvider[File | None]] | Target[None]",
                "Target[FilesToRunProvider[File | None]] | Target[None]",
            ),
        ] {
            let source = format!("def dynamic() -> str: return 'fast'\ndef implementation(ctx):\n    ctx.attr._private\n    ctx.attr.public\nexample = rule(implementation=implementation, attrs={{'_private': {descriptor}, 'public': {descriptor}}})\n");
            analysis.update_file(file, source.clone());
            let snapshot = analysis.snapshot();
            let diagnostics = snapshot.diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{descriptor}: {diagnostics:?}");
            check_field(&snapshot, file, &source, "ctx.attr._private", private, "");
            check_field(&snapshot, file, &source, "ctx.attr.public", public, "");
        }
    }

    #[test]
    fn shared_rule_contexts_narrow_through_saved_tags() {
        let source = r#"
def implementation(ctx):
    kind = ctx.attr._kind
    if kind == "library":
        sources: Sequence[Target] = ctx.attr.sources
        print(sources)
    else:
        version: str = ctx.attr.version
        print(version)
    return []
library = rule(implementation=implementation, attrs={
    "_kind": attr.string(default="library"),
    "sources": attr.label_list(),
})
binary = rule(implementation=implementation, attrs={
    "_kind": attr.string(default="binary"),
    "version": attr.string(),
})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(file, source.replace("if kind ==", "if kind !="));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(diagnostics
            .iter()
            .all(|diagnostic| diagnostic.id().as_str() == "unresolved-attribute"));
    }

    #[test]
    fn shared_rule_contexts_narrow_through_saved_getattr() {
        let source = r#"
def implementation(ctx):
    runtime_version = getattr(ctx.attr, "runtime_jre_version", None)
    if runtime_version != None:
        pass
    else:
        runtime_version = ctx.attr.jre_version
    version: str = runtime_version or "default"
    print(version)
    return []
runtime = rule(implementation=implementation, attrs={
    "runtime_jre_version": attr.string(),
})
toolchain = rule(implementation=implementation, attrs={
    "jre_version": attr.string(),
})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            file,
            source.replace("if runtime_version != None:", "if runtime_version == None:"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "unresolved-attribute");
    }

    #[test]
    fn scalar_attribute_values_include_permitted_defaults() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
        enable_context(&mut analysis);
        let file = fixture.main_file();
        for (descriptor, expected) in [
            (
                "attr.string(values=['fast', 'slow'], default='fast')",
                "Literal[\"fast\", \"slow\"]",
            ),
            (
                "attr.string(values=('fast', 'slow'), mandatory=True)",
                "Literal[\"fast\", \"slow\"]",
            ),
            (
                "make(values=['fast', 'fast'], mandatory=True)",
                "Literal[\"fast\"]",
            ),
            ("attr.string(values=['fast'])", "Literal[\"fast\", \"\"]"),
            (
                "attr.string(values=['fast'], default='other')",
                "Literal[\"fast\", \"other\"]",
            ),
            ("attr.string(values=['fast'], default=dynamic())", "str"),
            (
                "attr.string(values=['fast'], default=dynamic(), mandatory=True)",
                "Literal[\"fast\"]",
            ),
            ("attr.string(values=['fast', dynamic()])", "str"),
            ("attr.string(values=allowed)", "str"),
            ("attr.string(values=[])", "str"),
            ("attr.string(values=())", "str"),
            ("attr.string()", "str"),
            ("attr.string(values=unknown())", "str"),
            ("attr.int(values=[-1, 1, 1], default=-1)", "Literal[-1, 1]"),
            (
                "attr.int(values=(-2147483648, 2147483647), mandatory=True)",
                "Literal[-2147483648, 2147483647]",
            ),
            ("attr.int(values=[1])", "Literal[1, 0]"),
            ("attr.int(values=[1], default=2)", "Literal[1, 2]"),
            ("attr.int(values=[1], default=number())", "int"),
            ("attr.int(values=[1, number()])", "int"),
            ("attr.int(values=[2147483648], mandatory=True)", "int"),
            ("attr.int(values=[1], default=-2147483649)", "int"),
            ("attr.int(values=[])", "int"),
            ("attr.int()", "int"),
            (
                "attr.string(values=['fast']) if flag() else attr.string(values=['slow'])",
                "Unknown",
            ),
            ("fake(values=['fast'], mandatory=True)", "Unknown"),
        ] {
            let source = format!(
                "def dynamic() -> str: return 'other'\ndef number() -> int: return 2\ndef flag() -> bool: return True\ndef unknown(): pass\ndef fake(**kwargs): return None\nallowed = ['fast']\nmake = attr.string\ndef implementation(ctx):\n    ctx.attr.mode\nexample = rule(implementation=implementation, attrs={{'mode': {descriptor}}})\n"
            );
            analysis.update_file(file, source.clone());
            let snapshot = analysis.snapshot();
            check_field(
                &snapshot,
                file,
                &source,
                "ctx.attr.mode",
                expected,
                "'mode'",
            );
            let diagnostics = snapshot.diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{descriptor}: {diagnostics:?}");
        }
        let source = "def implementation(ctx):\n    ctx.attr.mode\nexample = rule(implementation=implementation, attrs={'mode': attr.int(values=[True], mandatory=True)})\n";
        analysis.update_file(file, source.to_owned());
        let snapshot = analysis.snapshot();
        check_field(&snapshot, file, source, "ctx.attr.mode", "int", "'mode'");
        let diagnostics = snapshot.diagnostics(file).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn finite_attribute_guards_follow_descriptor_edits() {
        let source = r#"def dynamic() -> str: return "zstd"
def implementation(ctx):
    if ctx.attr.mode == "zstd":
        pass
    elif ctx.attr.mode == "gzip":
        pass
    else:
        print(ctx.attrs)
    print(ctx.missing)
    return []
example = rule(implementation=implementation, attrs={
    "mode": attr.string(values=["zstd", "gzip"], default="zstd"),
})
example(name="dynamic", mode=dynamic())
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        for (edited, errors) in [
            (source.to_owned(), vec!["ctx.missing"]),
            (
                source.replace("values=[\"zstd\", \"gzip\"]", "values=[]"),
                vec!["ctx.attrs", "ctx.missing"],
            ),
            (
                source.replace("default=\"zstd\"", "default=dynamic()"),
                vec!["ctx.attrs", "ctx.missing"],
            ),
            (source.to_owned(), vec!["ctx.missing"]),
        ] {
            analysis.update_file(file, edited.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), errors.len(), "{diagnostics:?}");
            for (diagnostic, expression) in diagnostics.into_iter().zip(errors) {
                assert_eq!(diagnostic.id().as_str(), "unresolved-attribute");
                assert_eq!(
                    usize::from(diagnostic.range().unwrap().start()),
                    edited.find(expression).unwrap(),
                    "{diagnostic:?}"
                );
            }
        }
    }

    #[test]
    fn inherited_rule_attributes_preserve_contracts_and_origins() {
        let parent = r#"def implementation(ctx): return []
base_test = rule(implementation=implementation, test=True, extendable=True, attrs={
    "deps": attr.label_list(mandatory=True),
    "tool": attr.label(default="//:tool", executable=True, cfg="exec"),
    "single": attr.label(default="//:input", allow_single_file=True),
    "_private": attr.string(default="private", values=["private", "other"]),
})
"#;
        let source = r#"load("parent.bzl", imported="base_test")
alias = imported
def implementation(ctx):
    ctx.attr.deps
    ctx.attr.tool
    ctx.attr._private
    ctx.attr.timeout
    ctx.executable.tool
    ctx.file.single
    ctx.outputs.executable
example_test = rule(parent=alias, implementation=implementation, attrs={
    "own": attr.string(mandatory=True),
    "deps": attr.label_list(),
    "tool": attr.label(default="//:replacement"),
})
example_test(name="ok", own="value", deps=["//:dep"], timeout="short")
example_test(name="selected", own="value", deps=select({"//conditions:default": []}))
"#;
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        let parent_file = fixture.add_file(&mut analysis.db, "parent.bzl", parent);
        let file = fixture.add_file(&mut analysis.db, "defs.bzl", source);
        loader.add_files_from_fixture(&fixture);
        enable_context(&mut analysis);
        let snapshot = analysis.snapshot();
        let diagnostics = snapshot.diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (expression, expected, key) in [
            (
                "ctx.attr.deps",
                "list[Target[FilesToRunProvider[File | None]] | Target[None]]",
                "\"deps\"",
            ),
            (
                "ctx.attr.tool",
                "Target[FilesToRunProvider[File]]",
                "\"tool\"",
            ),
            ("ctx.attr.timeout", "str", ""),
            ("ctx.executable.tool", "File", "\"tool\""),
            ("ctx.file.single", "File", ""),
            ("ctx.outputs.executable", "File", ""),
            ("ctx.attr._private", "Literal[\"private\"]", ""),
        ] {
            check_field(&snapshot, file, source, expression, expected, key);
        }
        let position = FilePosition {
            file_id: file,
            pos: (source.find("ctx.attr._private").unwrap() as u32 + 16).into(),
        };
        let locations = snapshot.goto_definition(position, false).unwrap().unwrap();
        let [LocationLink::Local {
            target_file_id,
            target_selection_range,
            origin_selection_range: _,
            target_range: _,
        }] = locations.as_slice()
        else {
            panic!("{locations:?}");
        };
        assert_eq!(*target_file_id, parent_file.source);
        assert_eq!(&parent[*target_selection_range], "\"_private\"");
        drop(snapshot);
        for invalid in [
            "example_test(name='bad', own='value')",
            "example_test(name='bad', own='value', deps=[1])",
            "example_test(name='bad', deps=[])",
            "example_test(name='bad', own='value', deps=[], _private='value')",
        ] {
            analysis
                .open_document(
                    std::path::Path::new("/defs.bzl"),
                    starpls_common::Dialect::Bazel,
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
        let edited = source.replace("    \"deps\": attr.label_list(),\n", "");
        analysis
            .open_document(
                std::path::Path::new("/defs.bzl"),
                starpls_common::Dialect::Bazel,
                None,
                edited.clone(),
                3,
            )
            .unwrap();
        analysis
            .open_document(
                std::path::Path::new("/parent.bzl"),
                starpls_common::Dialect::Bazel,
                None,
                parent.replace(
                    "attr.label_list(mandatory=True)",
                    "attr.string(mandatory=True)",
                ),
                2,
            )
            .unwrap();
        let snapshot = analysis.snapshot();
        check_field(&snapshot, file, &edited, "ctx.attr.deps", "str", "");
        assert_eq!(snapshot.diagnostics(file).unwrap().len(), 2);
    }

    #[test]
    fn inherited_label_defaults_account_for_computed_overrides() {
        let parent = "def implementation(ctx): return []\nbase = rule(implementation=implementation, extendable=True, attrs={'dep': attr.label(default='//:input', allow_single_file=True)})\n";
        for (attrs, expected) in [
            ("{'dep': attr.label(default=None)}", "File"),
            ("dict(more(), dep=attr.label(default='//:new'))", "File"),
            (
                "{'dep': attr.label(default='//:new')} | more()",
                "File | None",
            ),
            ("{'dep': attr.label(default=computed)}", "File | None"),
            (
                "{'dep': opaque(attr.label(default=computed))}",
                "File | None",
            ),
            (
                "opaque({'dep': attr.label(default=computed)})",
                "File | None",
            ),
        ] {
            let source = format!(
                r#"load("parent.bzl", "base")
def opaque(value): return value
def more() -> dict[str, Attribute]: return {{}}
def computed(): return None
def implementation(ctx):
    ctx.file.dep
example = rule(parent=base, implementation=implementation, attrs={attrs})
example(name="test", dep="//:explicit")
"#
            );
            let (mut analysis, loader) = Analysis::new_for_test();
            let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
            fixture.add_file(&mut analysis.db, "parent.bzl", parent);
            let file = fixture.add_file(&mut analysis.db, "main.bzl", &source);
            loader.add_files_from_fixture(&fixture);
            enable_context(&mut analysis);
            let snapshot = analysis.snapshot();
            let diagnostics = snapshot.diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{attrs}: {diagnostics:?}");
            check_field(&snapshot, file, &source, "ctx.file.dep", expected, "");
            if expected == "File" {
                let key = if attrs.starts_with("dict(") {
                    "dep"
                } else {
                    "'dep'"
                };
                check_field(&snapshot, file, &source, "ctx.file.dep", expected, key);
                let position = FilePosition {
                    file_id: file,
                    pos: (source.rfind("dep=").unwrap() as u32).into(),
                };
                let locations = snapshot.goto_definition(position, false).unwrap().unwrap();
                let [LocationLink::Local {
                    target_file_id,
                    target_selection_range,
                    origin_selection_range: _,
                    target_range: _,
                }] = locations.as_slice()
                else {
                    panic!("{locations:?}");
                };
                assert_eq!(*target_file_id, file.source);
                assert_eq!(&source[*target_selection_range], key);
            }
        }
    }

    #[test]
    fn unknown_rule_parents_preserve_only_proven_own_contracts() {
        let parent = "def implementation(ctx): return []\nbase = rule(implementation=implementation, extendable=True, attrs={'dep': attr.label(), 'unseen': attr.bool()})\n";
        let source = r#"load("parent.bzl", "base")
def opaque(value): return value
def implementation(ctx):
    ctx.attr.dep
    ctx.attr.own
    ctx.executable.dep
example = rule(parent=opaque(base), implementation=implementation, attrs={
    "dep": attr.label(default="//:dep"),
    "own": attr.string(mandatory=True),
})
example(name="ok", own="value", unseen=True)
"#;
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        fixture.add_file(&mut analysis.db, "parent.bzl", parent);
        let file = fixture.add_file(&mut analysis.db, "main.bzl", source);
        loader.add_files_from_fixture(&fixture);
        enable_context(&mut analysis);
        let snapshot = analysis.snapshot();
        let diagnostics = snapshot.diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        check_field(
            &snapshot,
            file,
            source,
            "ctx.attr.dep",
            "Unknown",
            "\"dep\"",
        );
        check_field(
            &snapshot,
            file,
            source,
            "ctx.executable.dep",
            "Unknown",
            "\"dep\"",
        );
        check_field(&snapshot, file, source, "ctx.attr.own", "str", "\"own\"");
        drop(snapshot);
        for invalid in [
            "example(name='bad', own=1)",
            "example(name='bad')",
            "example(name='bad', own='value', dep=1)",
        ] {
            analysis
                .open_document(
                    std::path::Path::new("/main.bzl"),
                    starpls_common::Dialect::Bazel,
                    None,
                    format!("{source}{invalid}\n"),
                    2,
                )
                .unwrap();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{invalid}: {diagnostics:?}");
        }
    }

    #[test]
    fn common_rule_attributes_preserve_inputs_contexts_and_inheritance() {
        use starpls_bazel::build::attribute::Discriminator;
        let source = r#"def implementation(ctx):
    metadata: Sequence[Target] = ctx.attr.package_metadata
    generated: str = ctx.attr.generator_name
    expected: str = ctx.attr.expect_failure
    configs: list[Label] = ctx.attr.transitive_configs
    visibility: list[Label] = ctx.attr.visibility
    print(metadata, generated, expected, configs, visibility)
example = rule(implementation=implementation, extendable=True)
child = rule(implementation=implementation, parent=example)
def macro_impl(name, visibility, package_metadata, **kwargs):
    value: list[Label] | None = package_metadata
    print(name, visibility, value, kwargs)
wrapper = macro(implementation=macro_impl, inherit_attrs=example)
common_wrapper = macro(implementation=macro_impl, inherit_attrs="common")
example(name="ok", package_metadata=["//:metadata"], applicable_licenses=[Label("//:old")], transitive_configs=["//:config"], generator_name="generated", generator_function="macro", generator_location="defs.bzl:1", expect_failure="expected", exec_group_compatible_with={"tools": ["//:constraint"]})
child(name="child", applicable_licenses=["//:metadata"])
wrapper(name="wrapper", applicable_licenses=["//:metadata"])
common_wrapper(name="common", applicable_licenses=["//:metadata"])
def repo_impl(ctx): pass
repo = repository_rule(implementation=repo_impl, attrs={"package_metadata": attr.string()})
repo(name="repository", package_metadata="value")
native.inventory(package_metadata=["//:metadata"], applicable_licenses=[Label("//:old")], exec_group_compatible_with={"tools": ["//:constraint"]})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let builtins = analysis
            .db
            .get_builtin_defs(&starpls_common::Dialect::Bazel)
            .builtins(&analysis.db)
            .clone();
        let inventory = starpls_bazel::build::BuildLanguage {
            rule: vec![starpls_bazel::build::RuleDefinition {
                name: "inventory".to_owned(),
                attribute: [
                    ("package_metadata", Discriminator::LabelList),
                    ("exec_group_compatible_with", Discriminator::LabelListDict),
                ]
                .into_iter()
                .map(|(name, kind)| starpls_bazel::build::AttributeDefinition {
                    name: name.to_owned(),
                    r#type: kind as i32,
                    configurable: Some(false),
                    ..Default::default()
                })
                .collect(),
                ..Default::default()
            }],
        };
        analysis
            .set_builtin_defs(builtins.clone(), inventory.clone())
            .unwrap();
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (field, expected) in [
            ("ctx.attr.transitive_configs", "list[Label]"),
            ("ctx.attr.visibility", "list[Label]"),
            ("ctx.attr.generator_name", "str"),
            ("ctx.attr.expect_failure", "str"),
        ] {
            check_field(&analysis.snapshot(), file, source, field, expected, "");
        }
        for (invalid, expected) in [
            (
                "example(name='bad', generator_name=1)",
                "invalid-argument-type",
            ),
            (
                "example(name='bad', transitive_configs=[1])",
                "invalid-argument-type",
            ),
            (
                "example(name='bad', applicable_licenses=[1])",
                "invalid-argument-type",
            ),
            (
                "example(name='bad', applicable_licenses=select({'//conditions:default': []}))",
                "invalid-argument-type",
            ),
            (
                "native.inventory(applicable_licenses=select({'//conditions:default': []}))",
                "invalid-argument-type",
            ),
            (
                "example(name='bad', exec_group_compatible_with={'tools': [1]})",
                "invalid-argument-type",
            ),
            (
                "example(name='bad', distribs=['internal'])",
                "unknown-argument",
            ),
            (
                "repo(name='bad', applicable_licenses='value')",
                "unknown-argument",
            ),
            (
                "wrapper(name='bad', generator_name='hidden')",
                "unknown-argument",
            ),
            (
                "common_wrapper(name='bad', generator_name='hidden')",
                "unknown-argument",
            ),
        ] {
            analysis.update_file(file, format!("{source}\n{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{invalid}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), expected, "{invalid}");
        }
        for field in ["applicable_licenses", "exec_group_compatible_with"] {
            let updated = source.replace(
                "generated: str = ctx.attr.generator_name",
                &format!("generated: str = ctx.attr.{field}"),
            );
            analysis.update_file(file, updated);
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == "unresolved-attribute"),
                "{field}: {diagnostics:?}"
            );
        }
        // Only the canonical field is inherited; removing it also removes its input alias.
        let updated = source.replace(
            "inherit_attrs=example)",
            "inherit_attrs=example, attrs={'package_metadata': None})",
        );
        analysis.update_file(file, updated);
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "unknown-argument"),
            "{diagnostics:?}"
        );
        // A metadata replacement invalidates the generated declaration and its schema.
        analysis.update_file(file, source.to_owned());
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        assert!(!analysis.snapshot().diagnostics(file).unwrap().is_empty());
        analysis.set_builtin_defs(builtins, inventory).unwrap();
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
    }

    #[test]
    fn executable_rule_attributes_do_not_leak_into_other_rule_kinds() {
        let source = r#"def implementation(ctx):
    args: list[str] = ctx.attr.args
    licenses: list[str] = ctx.attr.output_licenses
    print(args, licenses)
example = rule(implementation=implementation, executable=True)
example(name="ok", args=["flag"], output_licenses=["notice"])
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
        for invalid in ["args=[1]", "output_licenses=[1]", "timeout='short'"] {
            analysis.update_file(file, format!("{source}example(name='bad', {invalid})\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{invalid}: {diagnostics:?}");
        }
        for options in ["", "test=True", "analysis_test=True"] {
            let source = format!("def implementation(ctx): pass\nexample = rule(implementation=implementation, {options})\nexample(name='bad', output_licenses=['notice'])\n");
            analysis.update_file(file, source);
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{options}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "unknown-argument");
        }
        let source = "def flag() -> bool: return True\ndef implementation(ctx): print(ctx.attr.output_licenses)\nexample = rule(implementation=implementation, executable=flag())\nexample(name='ok', output_licenses=['notice'])\n";
        analysis.update_file(file, source.to_owned());
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
    }

    #[test]
    fn test_rule_attributes_share_the_call_and_context_schema() {
        for option in [
            "test=True",
            "analysis_test=True",
            "test=False, analysis_test=True",
        ] {
            let source = format!(
                r#"def implementation(ctx):
    timeout: str = ctx.attr.timeout
    size: str = ctx.attr.size
    flaky: bool = ctx.attr.flaky
    shards: int = ctx.attr.shard_count
    local: bool = ctx.attr.local
    args: list[str] = ctx.attr.args
    ctx.outputs.executable.basename
    (timeout, size, flaky, shards, local, args)
example_test = rule(implementation=implementation, {option})
example_test(name="test", timeout="short", size="small", flaky=True, shard_count=2, local=True, args=["--flag"], aspect_hints=["//:hint"])
"#
            );
            let (mut analysis, fixture) = Analysis::from_single_file_fixture(&source);
            enable_context(&mut analysis);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert!(diagnostics.is_empty(), "{option}: {diagnostics:?}");
            for (expression, expected) in
                [("ctx.attr.timeout", "str"), ("ctx.attr.args", "list[str]")]
            {
                check_field(
                    &analysis.snapshot(),
                    fixture.main_file(),
                    &source,
                    expression,
                    expected,
                    "",
                );
            }
            for invalid in [
                "timeout=1",
                "timeout=select({'//conditions:default': 'short'})",
                "aspect_hints=[1]",
            ] {
                analysis
                    .open_document(
                        std::path::Path::new("/main.bzl"),
                        starpls_common::Dialect::Bazel,
                        None,
                        format!("{source}example_test(name='bad', {invalid})\n"),
                        2,
                    )
                    .unwrap();
                let diagnostics = analysis
                    .snapshot()
                    .diagnostics(fixture.main_file())
                    .unwrap();
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{invalid}: {diagnostics:?}");
                };
                assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
            }
        }
    }

    #[test]
    fn generated_rule_attributes_have_bounded_visibility() {
        for (options, name, field, argument, errors) in [
            ("", "example", "timeout", "timeout='short'", 2),
            ("test=False", "example", "timeout", "timeout='short'", 2),
            (
                "test=True",
                "example_test",
                "aspect_hints",
                "timeout='short'",
                1,
            ),
            (
                "test=unknown()",
                "example_test",
                "timeout",
                "timeout='short'",
                0,
            ),
            (
                "analysis_test=unknown()",
                "example_test",
                "timeout",
                "timeout='short'",
                0,
            ),
            (
                "test=unknown()",
                "example_test",
                "missing",
                "nonexistent=True",
                2,
            ),
        ] {
            let source = format!("def unknown() -> bool: return True\ndef implementation(ctx):\n    ctx.attr.{field}\n{name} = rule(implementation=implementation, {options})\n{name}(name='test', {argument})\n");
            let (mut analysis, fixture) = Analysis::from_single_file_fixture(&source);
            enable_context(&mut analysis);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert_eq!(
                diagnostics.len(),
                errors,
                "{options}, {field}: {diagnostics:?}"
            );
            check_field(
                &analysis.snapshot(),
                fixture.main_file(),
                &source,
                &format!("ctx.attr.{field}"),
                "Unknown",
                "",
            );
        }
    }

    #[test]
    fn aspect_callbacks_use_target_and_own_attributes() {
        let source = r#"def implementation(subject, context):
    subject.files.to_list()
    context.attr.mode
    context.attr._tool.label
    context.files._tool
    context.file._tool
    context.executable._tool
    context.rule.attr.unselected
    if hasattr(context.rule.attr, "deps"):
        context.rule.attr.deps
        for dep in context.rule.attr.deps:
            print(dep)
    if (hasattr(context.rule.files, "package_metadata") and
        hasattr(context.rule.files, "compile_data") and
        context.rule.files.package_metadata):
        context.rule.files.compile_data
        sorted(context.rule.files.compile_data, key=lambda file: file.path)
        metadata = context.rule.files.package_metadata
        if metadata:
            len(metadata)
            metadata[0]
    if hasattr(context.files, "_tool"):
        context.files._tool
        context.files._tool[0].path
    _wrong_target: str = subject.files.to_list()
    _wrong_mode: int = context.attr.mode
    print(_wrong_target, _wrong_mode)
make_aspect = aspect
example = make_aspect(implementation=implementation, attrs={
    "mode": attr.string(default="fast", values=["fast", "slow"]),
    "_tool": attr.label(default="//:tool", allow_single_file=True, executable=True, cfg="exec"),
})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let snapshot = analysis.snapshot();
        check_field(
            &snapshot,
            file,
            source,
            "    subject.files",
            "depset[File]",
            "",
        );
        check_field(
            &snapshot,
            file,
            source,
            "    context.attr.mode",
            "Literal[\"fast\", \"slow\"]",
            "\"mode\"",
        );
        check_field(
            &snapshot,
            file,
            source,
            "    context.files._tool",
            "list[File]",
            "\"_tool\"",
        );
        check_field(
            &snapshot,
            file,
            source,
            "    context.file._tool",
            "File",
            "\"_tool\"",
        );
        check_field(
            &snapshot,
            file,
            source,
            "    context.executable._tool",
            "File",
            "\"_tool\"",
        );
        check_field(
            &snapshot,
            file,
            source,
            "        context.rule.attr.deps",
            "Unknown",
            "",
        );
        check_field(
            &snapshot,
            file,
            source,
            "        metadata = context.rule.files.package_metadata",
            "list[File] & ~AlwaysFalsy",
            "",
        );
        check_field(
            &snapshot,
            file,
            source,
            "        context.rule.files.compile_data",
            "list[File]",
            "",
        );
        check_field(
            &snapshot,
            file,
            source,
            "        context.files._tool",
            "list[File]",
            "\"_tool\"",
        );
        let diagnostics = snapshot.diagnostics(file).unwrap();
        let mut ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        ids.sort_unstable();
        assert_eq!(
            ids,
            ["invalid-assignment", "invalid-assignment"],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn aspect_parameter_contract_requires_a_unique_registration() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
        enable_context(&mut analysis);
        let file = fixture.main_file();
        for (parameters, extra, registration, expected) in [
            ("item, env", "", "aspect(implementation=implementation, attrs={'mode': attr.string(default='fast', values=['fast'])})", "Literal[\"fast\"]"),
            ("item, env", "", "aspect(implementation=implementation, attrs={'mode': attr.int(default=1, values=[1])})", "Literal[1]"),
            ("item, env", "", "aspect(implementation=implementation, attrs={'mode': attr.string(default='fast', values=['fast'])})", "Literal[\"fast\"]"),
            ("item, env", "other = aspect(implementation=implementation)", "aspect(implementation=implementation)", "Unknown"),
            ("item, *, env", "", "aspect(implementation=implementation)", "Unknown"),
            ("item, env, *rest", "", "aspect(implementation=implementation)", "Unknown"),
            ("item, env", "def aspect(implementation): pass", "aspect(implementation=implementation)", "Unknown"),
        ] {
            let source = format!("def implementation({parameters}):\n    env.attr.mode\n{extra}\nexample = {registration}\n");
            analysis.update_file(file, source.clone());
            check_field(&analysis.snapshot(), file, &source, "    env.attr.mode", expected, "");
        }
        let source = "def implementation(item: str, env):\n    item.upper()\nexample = aspect(implementation=implementation)\n";
        analysis.update_file(file, source.to_owned());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
        assert_eq!(&source[diagnostic.range().unwrap()], "implementation");
    }

    #[test]
    fn inferred_context_satisfies_named_attribute_schema() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        enable_context(&mut analysis);
        let helper = fixture.add_file(
            &mut analysis.db,
            "//:helper.bzl",
            "def read(value): return value.attr.exports\n",
        );
        let interface = fixture.add_file(&mut analysis.db, "//:helper.bzli", "");
        let file = fixture.add_file(&mut analysis.db, "//:defs.bzl", "");
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(helper, interface)]).unwrap();
        for declaration in [
            "class _Attrs(Protocol):\n    @property\n    def exports(self) -> Sequence[Target]: ...\n",
            "type _Attrs = struct[{\"exports\": Sequence[Target]}, ...]\n",
        ] {
            analysis.update_file(
                interface,
                format!("{declaration}def read(value: ctx[object, _Attrs]) -> Sequence[Target]: ...\n"),
            );
            for (attrs, errors) in [
                ("{'exports': attr.label_list()}", 0),
                ("{'exports': attr.string()}", 1),
                ("{}", 1),
                ("dict(more(), exports=attr.label_list())", 0),
                ("dict(more(), exports=attr.string())", 1),
                ("{'exports': attr.label_list()}", 0),
            ] {
                analysis.update_file(file, format!("load(\"//:helper.bzl\", \"read\")\ndef more() -> dict[str, Attribute]: return {{}}\ndef implementation(context):\n    read(context)\n    return []\nexample = rule(implementation=implementation, attrs={attrs})\n"));
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert_eq!(diagnostics.len(), errors, "{attrs}: {diagnostics:?}");
                if let [diagnostic] = diagnostics.as_slice() {
                    assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
                }
            }
        }
    }

    #[test]
    fn attribute_contracts_preserve_helper_context_values() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        enable_context(&mut analysis);
        let helper_text = "def attributes():\n    return {'enabled': attr.bool(), 'dep': attr.label(default='//:dep'), 'tool': attr.label(mandatory=True, executable=True, cfg='exec')}\ndef read(context):\n    return context.attr.enabled\n";
        let helper = fixture.add_file(&mut analysis.db, "//:helper.bzl", helper_text);
        let interface = fixture.add_file(
            &mut analysis.db,
            "//:helper.bzli",
            r#"def attributes() -> dict[{
    "enabled": Attribute[bool],
    "dep": Attribute[Target],
    "tool": Attribute[Target[FilesToRunProvider[File]]],
}]: ...
def read(context: ctx[object, struct[{"enabled": bool}, ...]]) -> bool: ...
"#,
        );
        let file = fixture.add_file(&mut analysis.db, "//:defs.bzl", "");
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(helper, interface)]).unwrap();
        // The source body must establish the declared projection, including presence.
        for invalid in [
            helper_text.replace("attr.bool()", "attr.string()"),
            helper_text.replace("attr.label(default='//:dep')", "attr.bool()"),
            helper_text.replace("default='//:dep'", "default=None"),
        ] {
            analysis.update_file(helper, invalid);
            let diagnostics = analysis.snapshot().diagnostics(helper).unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            assert_eq!(
                ids,
                ["invalid-argument-type", "invalid-return-type"],
                "{diagnostics:?}"
            );
        }
        analysis.update_file(helper, helper_text.to_owned());
        for (factory, parameters) in [("rule", "ctx"), ("aspect", "target, ctx")] {
            let source = format!("load('//:helper.bzl', 'attributes', 'read')\ndef implementation({parameters}):\n    enabled: bool = read(ctx)\n    dep: Target = ctx.attr.dep\n    tool: File = ctx.attr.tool[DefaultInfo].files_to_run.executable\n    print(enabled, dep, tool, ctx.executable.tool, ctx.file.dep)\n    return []\nexample = {factory}(implementation=implementation, attrs=attributes())\n");
            analysis.update_file(file, source.clone());
            for checked in [helper, interface, file] {
                let diagnostics = analysis.snapshot().diagnostics(checked).unwrap();
                assert!(diagnostics.is_empty(), "{factory}: {diagnostics:?}");
            }
            let snapshot = analysis.snapshot();
            check_field(
                &snapshot,
                file,
                &source,
                "ctx.executable.tool",
                "Unknown",
                "",
            );
            check_field(&snapshot, file, &source, "ctx.file.dep", "Unknown", "");
            drop(snapshot);
            analysis.update_file(file, source.replace("dep: Target", "dep: str"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{factory}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-assignment");
        }
    }

    #[test]
    fn attribute_contracts_follow_inheritance_and_mapping_presence() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        enable_context(&mut analysis);
        let helper = fixture.add_file(
            &mut analysis.db,
            "//:attrs.bzl",
            "def attributes(): return {'dep': attr.label(default='//:dep'), '_private': attr.label(default='//:private')}\ndef read(context): return context.attr.dep\n",
        );
        let contract = "def attributes() -> dict[{'dep': Attribute[Target], '_private': Attribute[Target]}]: ...\ndef read(context: ctx[object, struct[{'dep': Target}, ...]]) -> Target: ...\n";
        let interface = fixture.add_file(&mut analysis.db, "//:attrs.bzli", contract);
        let file = fixture.add_file(&mut analysis.db, "//:defs.bzl", "");
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(helper, interface)]).unwrap();
        let inherited = "load('//:attrs.bzl', 'attributes')\ndef more() -> dict[str, Attribute]: return {}\ndef parent(ctx): return []\nbase = rule(implementation=parent, attrs=attributes(), extendable=True)\ndef implementation(ctx):\n    ctx.attr.dep\n    ctx.attr._private\n    return []\nexample = rule(parent=base, implementation=implementation, attrs=OVERRIDES)\n";
        let target = "Target[FilesToRunProvider[File | None] | None]";
        for (overrides, expected) in [("{}", target), ("more()", "Unknown"), ("{}", target)] {
            let source = inherited.replace("OVERRIDES", overrides);
            analysis.update_file(file, source.clone());
            let snapshot = analysis.snapshot();
            let diagnostics = snapshot.diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{overrides}: {diagnostics:?}");
            check_field(&snapshot, file, &source, "ctx.attr.dep", expected, "");
            check_field(&snapshot, file, &source, "ctx.attr._private", target, "");
        }
        let direct = "load('//:attrs.bzl', 'attributes', 'read')\ndef more() -> dict[str, Attribute]: return {}\ndef implementation(ctx):\n    read(ctx)\n    return []\nexample = rule(implementation=implementation, attrs=ATTRS)\n";
        for (attrs, error) in [
            ("attributes()", None),
            ("dict(more(), dep=attributes()['dep'])", None),
            (
                "{'dep': attributes()['dep']} | more()",
                Some("invalid-argument-type"),
            ),
            ("{}", Some("invalid-argument-type")),
        ] {
            let source = direct.replace("ATTRS", attrs);
            analysis.update_file(file, source.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            assert_eq!(
                ids,
                error.into_iter().collect::<Vec<_>>(),
                "{attrs}: {diagnostics:?}"
            );
        }
        analysis.update_file(file, direct.replace("ATTRS", "attributes()"));
        analysis.update_file(
            interface,
            contract.replace(
                "'dep': Attribute[Target]",
                "'dep': NotRequired[Attribute[Target]]",
            ),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
    }

    #[test]
    fn attribute_contracts_do_not_describe_other_host_views() {
        let source = "def typed() -> Attribute[Target]: return attr.label(default='//:dep')\ndef implementation(ctx):\n    ctx.attr.dep\n    return []\nexample = repository_rule(implementation=implementation, attrs={'dep': typed()})\n";
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let snapshot = analysis.snapshot();
        let diagnostics = snapshot.diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        check_field(&snapshot, file, source, "ctx.attr.dep", "Unknown", "");
        drop(snapshot);
        let source = source.replace("'dep': typed()", "'dep': attr.label(default='//:dep')");
        analysis.update_file(file, source.clone());
        let snapshot = analysis.snapshot();
        let diagnostics = snapshot.diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        check_field(&snapshot, file, &source, "ctx.attr.dep", "Label", "");
    }

    #[test]
    fn attribute_contracts_preserve_metadata_without_native_target() {
        let source = r#"def implementation(ctx): return []
example = rule(implementation=implementation, attrs={"count": attr.int(mandatory=True)})
example(name="good", count=1)
example(name="wrong", count="text")
example(name="missing")
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let mut builtins = analysis
            .db
            .get_builtin_defs(&starpls_common::Dialect::Bazel)
            .builtins(&analysis.db)
            .clone();
        builtins.r#type.retain(|native| native.name != "Target");
        analysis
            .set_builtin_defs(builtins, Default::default())
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
            ["invalid-argument-type", "missing-argument"],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn attribute_contracts_keep_mapping_inputs_nominal() {
        let source = r#"def implementation(ctx): return []
good = rule(implementation=implementation, attrs={"enabled": attr.bool()})
wrong = rule(implementation=implementation, attrs={"enabled": 42})
fake = rule(implementation=implementation, attrs=struct(items=lambda: []))
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
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
            ["invalid-argument-type", "invalid-argument-type"],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn partial_attribute_mappings_preserve_definite_overrides() {
        for (factory, parameters) in [
            ("rule", "ctx"),
            ("repository_rule", "ctx"),
            ("aspect", "target, ctx"),
        ] {
            let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
            enable_context(&mut analysis);
            let file = fixture.main_file();
            for (attributes, expected) in [
                ("dict(more(), count=attr.int())", "int"),
                ("dict(more(), count=attr.string())", "str"),
                ("{'count': attr.int()} | more()", "Unknown"),
                ("dict(more(), count=attr.int())", "int"),
            ] {
                let source = format!("def more() -> dict[str, Attribute]: return {{}}\ndef implementation({parameters}):\n    ctx.attr.count\n    return []\nexample = {factory}(implementation=implementation, attrs={attributes})\n");
                analysis.update_file(file, source.clone());
                let snapshot = analysis.snapshot();
                let diagnostics = snapshot.diagnostics(file).unwrap();
                assert!(
                    diagnostics.is_empty(),
                    "{factory}, {attributes}: {diagnostics:?}"
                );
                check_field(&snapshot, file, &source, "ctx.attr.count", expected, "");
            }
        }
    }

    #[test]
    fn inline_callbacks_use_registration_schemas() {
        for (factory, parameters) in [
            ("rule", "ctx"),
            ("repository_rule", "ctx"),
            ("aspect", "target, ctx"),
        ] {
            for attributes_first in [false, true] {
                let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
                enable_context(&mut analysis);
                analysis.set_rules(
                    crate::DiagnosticRules::from_settings(
                        &[("non-static-type".into(), "error".into())].into(),
                    )
                    .unwrap(),
                );
                let file = fixture.main_file();
                for (attribute, expected) in [
                    ("bool", None),
                    ("int", Some("invalid-argument-type")),
                    ("bool", None),
                ] {
                    let implementation = format!(
                        "implementation=lambda {parameters}: require_bool(ctx.attr.enabled)"
                    );
                    let attributes = format!("attrs={{'enabled': attr.{attribute}()}}");
                    let arguments = if attributes_first {
                        format!("{attributes}, {implementation}")
                    } else {
                        format!("{implementation}, {attributes}")
                    };
                    analysis.update_file(file, format!("def require_bool(value: bool) -> None: pass\nregistered = {factory}({arguments})\n"));
                    let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                    assert_eq!(
                        diagnostics
                            .iter()
                            .map(|diagnostic| diagnostic.id().as_str())
                            .collect::<Vec<_>>(),
                        expected.into_iter().collect::<Vec<_>>(),
                        "{factory}, {arguments}: {diagnostics:?}",
                    );
                }
            }
        }
    }

    #[test]
    fn inline_callbacks_validate_runtime_arguments() {
        for (factory, parameter) in [
            ("rule", ""),
            ("rule", "ctx, extra"),
            ("repository_rule", ""),
            ("aspect", "ctx"),
        ] {
            let source =
                format!("registered = {factory}(implementation=lambda {parameter}: None)\n");
            let (mut analysis, fixture) = Analysis::from_single_file_fixture(&source);
            enable_context(&mut analysis);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert_eq!(
                diagnostics
                    .iter()
                    .map(|diagnostic| diagnostic.id().as_str())
                    .collect::<Vec<_>>(),
                ["invalid-argument-type"],
                "{source}: {diagnostics:?}",
            );
        }
    }

    #[test]
    fn repository_none_attributes_keep_a_closed_context() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
        enable_context(&mut analysis);
        let file = fixture.main_file();
        for attributes in ["", ", attrs=None", ", attrs={}"] {
            let source = format!("def require_str(value: str) -> None: pass\nregistered = repository_rule(implementation=lambda ctx: require_str(ctx.attr.name){attributes})\n");
            analysis.update_file(file, source.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{attributes}: {diagnostics:?}");
            analysis.update_file(file, source.replace("ctx.attr.name", "ctx.attr.misspelled"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(
                diagnostics
                    .iter()
                    .map(|diagnostic| diagnostic.id().as_str())
                    .collect::<Vec<_>>(),
                ["unresolved-attribute"],
                "{attributes}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn inline_callback_contracts_follow_options() {
        let source = "registered = rule(implementation=lambda: None)\n";
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        for enabled in [false, true, false] {
            let mut options = analysis.db.environment().options(&analysis.db).clone();
            options.infer_ctx_attributes = enabled;
            analysis
                .db
                .environment()
                .set_options(&mut analysis.db)
                .to(options);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            let expected = if enabled {
                vec!["invalid-argument-type"]
            } else {
                Vec::new()
            };
            assert_eq!(ids, expected, "{enabled}: {diagnostics:?}");
        }
    }

    #[test]
    fn conditional_inline_callbacks_use_each_branch() {
        let source = r#"def require_bool(value: bool) -> None: pass
def register(flag: bool) -> object:
    return rule(
        implementation=(lambda ctx: require_bool(ctx.attr.enabled)) if flag else (lambda ctx: require_bool(ctx.attr.enabled)),
        attrs={"enabled": attr.bool()},
    )
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            file,
            source.replace(
                "else (lambda ctx: require_bool(ctx.attr.enabled))",
                "else (lambda: None)",
            ),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
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
    fn inline_callbacks_resolve_factory_identity() {
        let source = r#"def require_bool(value: bool) -> None: pass
register = rule
def deferred() -> object:
    return register(implementation=lambda ctx=None: require_bool(ctx.attr.enabled), attrs={'enabled': attr.bool()})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            file,
            source.replace("ctx.attr.enabled", "ctx.attr.misspelled"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect::<Vec<_>>(),
            ["unresolved-attribute"],
            "{diagnostics:?}",
        );
        let source = "def rule(implementation: Callable[[str], object]) -> None: pass\nrule(implementation=lambda ctx: ctx.attr.enabled)\n";
        analysis.update_file(file, source.into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect::<Vec<_>>(),
            ["unresolved-attribute"],
            "{diagnostics:?}",
        );
    }

    #[test]
    fn named_callback_signatures_are_checked_at_each_registration() {
        for (parameter, expected) in [
            ("", Some("invalid-argument-type")),
            ("context: str", Some("invalid-argument-type")),
            ("context: object", None),
        ] {
            for imported in [false, true] {
                let (mut analysis, loader) = Analysis::new_for_test();
                let mut fixture = Fixture::new(&mut analysis.db);
                enable_context(&mut analysis);
                let source = if imported {
                    fixture.add_file(
                        &mut analysis.db,
                        "//:helper.bzl",
                        &format!("def implementation({parameter}) -> None: pass\n"),
                    );
                    "load('//:helper.bzl', 'implementation')\nregistered = rule(implementation=implementation)\n".to_owned()
                } else {
                    format!("def register() -> object:\n    def implementation({parameter}) -> None: pass\n    return rule(implementation=implementation)\n")
                };
                let file = fixture.add_file(&mut analysis.db, "//:main.bzl", &source);
                loader.add_files_from_fixture(&fixture);
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert_eq!(
                    diagnostics
                        .iter()
                        .map(|diagnostic| diagnostic.id().as_str())
                        .collect::<Vec<_>>(),
                    expected.into_iter().collect::<Vec<_>>(),
                    "{parameter}, imported={imported}: {diagnostics:?}",
                );
            }
        }
    }

    #[test]
    fn registered_callback_contracts_are_local_to_each_use() {
        let source = r#"def implementation(ctx) -> list[DefaultInfo]:
    value: bool | str = ctx.attr.enabled
    print(value)
    return []
first = rule(implementation=implementation, attrs={"enabled": attr.bool()})
second = rule(implementation=implementation, attrs={"enabled": attr.string()})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
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
            "saved = implementation\n",
            "implementation(None)\n",
            "def later() -> object:\n    return rule(implementation=implementation, attrs={'enabled': attr.int()})\n",
        ] {
            analysis.update_file(file, format!("{source}{extra}"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(!diagnostics.is_empty(), "{extra}");
            assert!(
                diagnostics
                    .iter()
                    .all(|diagnostic| diagnostic.id().as_str() == "non-static-type"),
                "{extra}: {diagnostics:?}"
            );
            assert!(
                diagnostics.iter().all(
                    |diagnostic| diagnostic.range().unwrap().start().to_usize() >= source.len()
                ),
                "{extra}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn registered_callback_contracts_use_stub_annotations() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "def implementation(ctx):\n    enabled: bool = ctx.attr.enabled\n    print(enabled)\n    return None\nexample = rule(implementation=implementation, attrs={'enabled': attr.bool()})\n",
        );
        let stub = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "def implementation(ctx) -> None: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        enable_context(&mut analysis);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        for file in [source, stub] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        analysis.update_file(stub, "def implementation(ctx: str) -> None: ...\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn registered_callbacks_validate_runtime_arguments_without_strictness() {
        for (parameters, body, expected) in [
            ("ctx: str", "return None", "invalid-argument-type"),
            ("", "return None", "invalid-argument-type"),
            ("*, ctx: object", "return None", "invalid-argument-type"),
            (
                "ctx",
                "value: str = ctx.attr.enabled\n    print(value)\n    return None",
                "invalid-assignment",
            ),
        ] {
            let source = format!("def implementation({parameters}) -> None:\n    {body}\nexample = rule(implementation=implementation, attrs={{'enabled': attr.bool()}})\n");
            let (mut analysis, fixture) = Analysis::from_single_file_fixture(&source);
            enable_context(&mut analysis);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert_eq!(
                diagnostics
                    .iter()
                    .map(|diagnostic| diagnostic.id().as_str())
                    .collect::<Vec<_>>(),
                [expected],
                "{parameters}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn registered_callbacks_preserve_unannotated_returns() {
        let source = "def implementation(ctx):\n    return None\nexample = rule(implementation=implementation)\n";
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "non-static-type"
                    && diagnostic.headline_message().contains("argument")),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn unspecified_build_setting_values_have_a_static_domain() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        enable_context(&mut analysis);
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("unsound-return-statement".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let source = "def setting(context: ctx) -> bool | int | str | list[str] | set[str]:\n    return context.build_setting_value\n";
        let file = fixture.add_file(&mut analysis.db, "//:settings.bzl", source);
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            file,
            source.replace("bool | int | str | list[str] | set[str]", "str"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-return-type");
    }

    #[test]
    fn loaded_build_setting_values_follow_descriptor_edits() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        enable_context(&mut analysis);
        let settings = fixture.add_file(&mut analysis.db, "//:settings.bzl", "");
        let source = r#"load("//:settings.bzl", "setting")
def implementation(context):
    context.build_setting_value
    context.attr.build_setting_default
    context.attr.help
    _wrong_value: None = context.build_setting_value
    _wrong_default: None = context.attr.build_setting_default
    _wrong_help: None = context.attr.help
    print(_wrong_value, _wrong_default, _wrong_help)
example = rule(implementation=implementation, build_setting=setting)
"#;
        let file = fixture.add_file(&mut analysis.db, "//:defs.bzl", source);
        loader.add_files_from_fixture(&fixture);
        for (descriptor, value, default) in [
            ("config.bool()", "bool", "bool"),
            ("config.int()", "int", "int"),
            ("config.string()", "str", "str"),
            ("config.string(allow_multiple=True)", "list[str]", "str"),
            ("config.string(allow_multiple=False)", "str", "str"),
            (
                "config.string(allow_multiple=option())",
                "str | list[str]",
                "str",
            ),
            ("config.string_list()", "list[str]", "list[str]"),
            (
                "config.string_list(flag=True, repeatable=True)",
                "list[str]",
                "list[str]",
            ),
            ("config.bool()", "bool", "bool"),
        ] {
            analysis.update_file(
                settings,
                format!("def option() -> bool: return True\nsetting = {descriptor}\n"),
            );
            let snapshot = analysis.snapshot();
            let setting_diagnostics = snapshot.diagnostics(settings).unwrap();
            assert!(
                setting_diagnostics.is_empty(),
                "{descriptor}: {setting_diagnostics:?}"
            );
            check_field(
                &snapshot,
                file,
                source,
                "    context.build_setting_value",
                value,
                "",
            );
            check_field(
                &snapshot,
                file,
                source,
                "    context.attr.build_setting_default",
                default,
                "",
            );
            check_field(&snapshot, file, source, "    context.attr.help", "str", "");
            let diagnostics = snapshot.diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 3, "{descriptor}: {diagnostics:?}");
            assert!(
                diagnostics
                    .iter()
                    .all(|diagnostic| diagnostic.id().as_str() == "invalid-assignment"),
                "{diagnostics:?}"
            );
        }
        let position = FilePosition {
            file_id: file,
            pos: ((source.find("build_setting_value").unwrap() + "build_setting_value".len() - 1)
                as u32)
                .into(),
        };
        {
            let snapshot = analysis.snapshot();
            let hover = snapshot.hover(position).unwrap().unwrap();
            assert!(
                hover
                    .contents
                    .value
                    .contains("Value of the build setting represented"),
                "{}",
                hover.contents.value
            );
        }
        analysis.update_file(
            file,
            source.replace(
                "    print(",
                "    context.build_setting_value = True\n    print(",
            ),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 4, "{diagnostics:?}");
        assert!(
            diagnostics.iter().any(|diagnostic| diagnostic
                .concise_message()
                .to_string()
                .contains("read-only")),
            "{diagnostics:?}"
        );
        analysis.update_file(file, source.to_owned());
        analysis.update_file(
            settings,
            "def choose(value): return value\nsetting = choose(None)\n".to_owned(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-assignment");
        assert!(diagnostics[0].range().unwrap().contains(
            (source
                .find("context.build_setting_value\n    _wrong_default")
                .unwrap() as u32)
                .into()
        ));
        let source = source.replace("build_setting=setting)", "build_setting=setting, attrs={\"build_setting_default\": attr.int(), \"help\": attr.bool()})");
        analysis.update_file(file, source.clone());
        for (descriptor, default, help, errors) in [
            ("choose(None)", "int", "bool", 3),
            ("config.string()", "str", "str", 3),
        ] {
            analysis.update_file(
                settings,
                format!("def choose(value): return value\nsetting = {descriptor}\n"),
            );
            let snapshot = analysis.snapshot();
            check_field(
                &snapshot,
                file,
                &source,
                "    context.attr.build_setting_default",
                default,
                "",
            );
            check_field(&snapshot, file, &source, "    context.attr.help", help, "");
            let diagnostics = snapshot.diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), errors, "{descriptor}: {diagnostics:?}");
        }
    }

    #[test]
    fn macro_defaults_and_registration_follow_edits() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
        enable_context(&mut analysis);
        let file = fixture.main_file();
        // The default expression's range and the public callable are unchanged.
        // Only raw metadata for the private callback parameter changes.
        for (default, expected, errors) in [
            ("None         ", "None", 1),
            ("Label('//:x')", "Label", 0),
            ("None         ", "None", 1),
        ] {
            let source = format!(
                r#"DEFAULT = {default}
def implementation(name, visibility, _value):
    _value.name
example = macro(implementation=implementation, attrs={{
    "_value": attr.label(default=DEFAULT, configurable=False),
}})
"#
            );
            analysis.update_file(file, source.clone());
            for _ in 0..2 {
                let snapshot = analysis.snapshot();
                check_field(&snapshot, file, &source, "    _value", expected, "");
                let diagnostics = snapshot.diagnostics(file).unwrap();
                assert_eq!(diagnostics.len(), errors, "{diagnostics:?}");
                if let Some(diagnostic) = diagnostics.first() {
                    assert_eq!(diagnostic.id().as_str(), "unresolved-attribute");
                }
            }
        }
        for (parameter, annotation, registrations, expected) in [
            ("value", "", "example = macro(implementation=implementation, attrs={'value': attr.string(configurable=False, values=['fast'], default='fast')})", "str"),
            ("value", "", "example = macro(implementation=implementation, attrs={'value': attr.int(configurable=False, values=[1], default=1)})", "int"),
            ("value", "", "example = macro(implementation=implementation, attrs={'value': attr.string(configurable=False)})", "str"),
            ("value", "", "example = macro(implementation=implementation, attrs={'value': attr.int(configurable=False)})", "int"),
            ("value", "", "example = macro(implementation=implementation, attrs={'value': attr.string(configurable=False)})", "str"),
            ("value", "", "first = macro(implementation=implementation, attrs={'value': attr.string()})\nsecond = macro(implementation=implementation, attrs={'value': attr.int()})", "select[str | None, object] | select[int | None, object]"),
            ("value", "    # type: (str, list[Label], Unknown) -> None\n", "example = macro(implementation=implementation, attrs={'value': attr.string()})", "Unknown"),
            ("value=42", "", "example = macro(implementation=implementation, attrs={'value': attr.string()})", "select[str | None, object] | Literal[42]"),
        ] {
            let source = format!("def implementation(name, visibility, {parameter}):\n{annotation}    value\n{registrations}\n");
            analysis.update_file(file, source.clone());
            check_field(&analysis.snapshot(), file, &source, "    value", expected, "");
        }
        // Invalid non-None macro returns still need stable body inference during
        // editing. Resolving this return re-enters the registration expression.
        let source = "def implementation(name, visibility, value):\n    return value\nexample = macro(implementation=implementation, attrs={'value': attr.string(configurable=False)})\n";
        analysis.update_file(file, source.to_owned());
        for _ in 0..2 {
            check_field(
                &analysis.snapshot(),
                file,
                source,
                "return value",
                "str",
                "",
            );
        }
    }

    #[test]
    fn dependency_contracts_preserve_provider_presence() {
        let source = r#"def transition_impl(settings, attr):
    return [{}]
split = transition(implementation=transition_impl, inputs=[], outputs=[])
def implementation(ctx):
    files_to_run = ctx.attr.single[DefaultInfo].files_to_run
    optional_executable = files_to_run.executable
    if optional_executable != None:
        print(optional_executable.path)
    ctx.attr.tool[DefaultInfo].files_to_run.executable.path
    ctx.attr.single[DefaultInfo].files_to_run.runfiles_manifest
    ctx.attr.split[0][DefaultInfo].files_to_run.executable.path
    for target in ctx.split_attr.split.values():
        print(target[DefaultInfo].files_to_run.executable.path)
    ctx.actions.run(executable=files_to_run, outputs=[])
    ctx.actions.run(executable=ctx.attr.tool[DefaultInfo].files_to_run, outputs=[])
example = rule(implementation=implementation, attrs={
    "tool": attr.label(mandatory=True, executable=True, cfg="exec"),
    "single": attr.label(mandatory=True, allow_single_file=True),
    "split": attr.label(mandatory=True, executable=True, cfg=split),
})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for expression in [
            "ctx.attr.single[DefaultInfo].files_to_run.executable.path",
            "ctx.attr.tool[DefaultInfo].files_to_run.runfiles_manifest.path",
        ] {
            let source = source.replacen(
                "    files_to_run =",
                &format!("    {expression}\n    files_to_run ="),
                1,
            );
            analysis.update_file(file, source.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{expression}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "unresolved-attribute");
            assert_eq!(
                &source[diagnostic.range().unwrap()],
                expression,
                "{diagnostic:?}"
            );
        }
    }

    #[test]
    fn provider_presence_tracks_descriptor_edits() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
        enable_context(&mut analysis);
        let file = fixture.main_file();
        for (options, errors) in [
            ("", 1),
            (", executable=True, cfg='exec'", 0),
            ("", 1),
            (", executable=unknown(), cfg='exec'", 1),
            (", allow_single_file=True", 0),
            (", allow_single_file=unknown()", 1),
            (", providers=[PackageSpecificationInfo]", 1),
        ] {
            let source = format!("def unknown():\n    pass\ndef implementation(ctx):\n    ctx.attr.dep[DefaultInfo].files_to_run.executable\nexample = rule(implementation=implementation, attrs={{'dep': attr.label(mandatory=True{options})}})\n");
            analysis.update_file(file, source.clone());
            for _ in 0..2 {
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert_eq!(diagnostics.len(), errors, "{options}: {diagnostics:?}");
                if let Some(diagnostic) = diagnostics.first() {
                    assert_eq!(diagnostic.id().as_str(), "unresolved-attribute");
                    assert!(diagnostic.concise_message().to_string().contains("None"));
                }
            }
        }
    }

    #[test]
    fn required_and_defaulted_context_values_are_present() {
        let source = r#"def computed(name):
    return None
def implementation(ctx):
    ctx.attr.required[DefaultInfo]
    ctx.attr.defaulted[DefaultInfo]
    ctx.file.required.basename
    ctx.file.defaulted.basename
    ctx.executable.tool.path
    ctx.attr.output.name
    ctx.outputs.output.path
    ctx.actions.run(executable=ctx.executable.tool, outputs=[])
    ctx.attr.optional[DefaultInfo]
    ctx.file.optional.basename
    ctx.executable.optional_tool.path
    ctx.attr.computed[DefaultInfo]
example = rule(implementation=implementation, attrs={
    "required": attr.label(mandatory=True, allow_single_file=True),
    "defaulted": attr.label(default="//:input", allow_single_file=True),
    "tool": attr.label(default=Label("//:tool"), executable=True, cfg="exec"),
    "output": attr.output(mandatory=True),
    "optional": attr.label(allow_single_file=True),
    "optional_tool": attr.label(executable=True, cfg="exec"),
    "computed": attr.label(default=computed),
})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let snapshot = analysis.snapshot();
        for (expression, expected, key) in [
            (
                "ctx.attr.required",
                "Target[FilesToRunProvider[File | None]]",
                "\"required\"",
            ),
            (
                "ctx.attr.defaulted",
                "Target[FilesToRunProvider[File | None]]",
                "\"defaulted\"",
            ),
            ("ctx.file.required", "File", "\"required\""),
            ("ctx.file.defaulted", "File", "\"defaulted\""),
            ("ctx.executable.tool", "File", "\"tool\""),
            ("ctx.attr.output", "Label", "\"output\""),
            ("ctx.outputs.output", "File", "\"output\""),
            (
                "ctx.attr.optional",
                "Target[FilesToRunProvider[File | None]] | None",
                "\"optional\"",
            ),
            ("ctx.file.optional", "File | None", "\"optional\""),
            (
                "ctx.executable.optional_tool",
                "File | None",
                "\"optional_tool\"",
            ),
            (
                "ctx.attr.computed",
                "Target[FilesToRunProvider[File | None]] | Target[None] | None",
                "\"computed\"",
            ),
        ] {
            check_field(&snapshot, file, source, expression, expected, key);
        }
        let diagnostics = snapshot.diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 4, "{diagnostics:?}");
        for diagnostic in diagnostics {
            let range = diagnostic.range().unwrap();
            assert!(
                usize::from(range.start()) >= source.find("    ctx.attr.optional").unwrap(),
                "{diagnostic:?}"
            );
            assert!(
                usize::from(range.end()) < source.find("example =").unwrap(),
                "{diagnostic:?}"
            );
        }
    }

    #[test]
    fn repository_labels_preserve_required_and_optional_values() {
        let source = r#"def implementation(ctx):
    ctx.read(ctx.attr.required)
    ctx.attr.required.name
    ctx.read(ctx.attr.defaulted)
    ctx.attr.defaulted.name
    ctx.attr.label_default.name
    if ctx.attr.optional != None:
        ctx.read(ctx.attr.optional)
    ctx.attr.optional.name
    ctx.attr.mode
example = repository_rule(implementation=implementation, attrs={
    "required": attr.label(mandatory=True),
    "defaulted": attr.label(default="//:input"),
    "label_default": attr.label(default=Label("//:input")),
    "optional": attr.label(),
    "mode": attr.string(values=["fast"], default="other"),
})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let snapshot = analysis.snapshot();
        for (name, expected) in [
            ("required", "Label"),
            ("defaulted", "Label"),
            ("label_default", "Label"),
            ("optional", "Label | None"),
            ("mode", "Literal[\"fast\", \"other\"]"),
        ] {
            check_field(
                &snapshot,
                file,
                source,
                &format!("ctx.attr.{name}"),
                expected,
                &format!("\"{name}\""),
            );
        }
        let diagnostics = snapshot.diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "unresolved-attribute");
        assert_eq!(
            usize::from(diagnostic.range().unwrap().start()),
            source.find("ctx.attr.optional.name").unwrap()
        );
    }

    #[test]
    fn context_presence_tracks_default_only_edits() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
        enable_context(&mut analysis);
        let file = fixture.main_file();
        for (factory, access, present) in [
            (
                "rule",
                "[DefaultInfo]",
                "Target[FilesToRunProvider[File | None]] | Target[None]",
            ),
            ("repository_rule", ".name", "Label"),
        ] {
            for (default, optional) in [("None   ", true), ("'//:x' ", false), ("None   ", true)] {
                let source = format!("DEFAULT = {default}\ndef implementation(ctx):\n    ctx.attr.dep{access}\nexample = {factory}(implementation=implementation, attrs={{'dep': attr.label(default=DEFAULT)}})\n");
                analysis.update_file(file, source.clone());
                let snapshot = analysis.snapshot();
                let expected = if optional {
                    format!("{present} | None")
                } else {
                    present.to_owned()
                };
                check_field(&snapshot, file, &source, "ctx.attr.dep", &expected, "'dep'");
                let diagnostics = snapshot.diagnostics(file).unwrap();
                assert_eq!(
                    diagnostics.len(),
                    usize::from(optional),
                    "{factory}: {diagnostics:?}"
                );
            }
        }
    }

    #[test]
    fn macro_callbacks_inherit_native_attribute_metadata() {
        for erased in [false, true] {
            let mut expected_signatures = None;
            for keyword_parameters in [false, true] {
                let parameters = if keyword_parameters {
                    "name, visibility, **kwargs"
                } else {
                    "name, visibility, srcs, optional, **kwargs"
                };
                let (srcs, optional) = if keyword_parameters {
                    ("kwargs[\"srcs\"]", "kwargs[\"optional\"]")
                } else {
                    ("srcs", "optional")
                };
                let parent = if erased {
                    "erase(native.example)"
                } else {
                    "native.example"
                };
                let source = format!(
                    "def erase(value: rule) -> rule: return value
def implementation({parameters}):
    name
    visibility
    {srcs}
    {optional}
    kwargs
    native.example(srcs={srcs}, optional={optional})
parent = {parent}
example = macro(implementation=implementation, inherit_attrs=parent)
"
                );
                let (mut analysis, fixture) = Analysis::from_single_file_fixture(&source);
                enable_context(&mut analysis);
                let builtins = analysis
                    .db
                    .get_builtin_defs(&starpls_common::Dialect::Bazel)
                    .builtins(&analysis.db)
                    .clone();
                analysis
                    .set_builtin_defs(
                        builtins,
                        starpls_bazel::build::BuildLanguage {
                            rule: vec![starpls_bazel::build::RuleDefinition {
                                name: "example".to_owned(),
                                attribute: [
                                    ("srcs", Discriminator::LabelList, true, false),
                                    ("optional", Discriminator::Boolean, false, true),
                                ]
                                .into_iter()
                                .map(|(name, kind, mandatory, configurable)| {
                                    starpls_bazel::build::AttributeDefinition {
                                        name: name.to_owned(),
                                        r#type: kind as i32,
                                        mandatory: Some(mandatory),
                                        configurable: Some(configurable),
                                        ..Default::default()
                                    }
                                })
                                .collect(),
                                ..Default::default()
                            }],
                        },
                    )
                    .unwrap();
                let snapshot = analysis.snapshot();
                let file = fixture.main_file();
                let db = &snapshot.db;
                let program = db.starlark_program_file(file);
                let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
                let model = SemanticModel::new(db, program);
                let environment = model.program_environment();
                let [_erase, implementation, parent, registration] = parsed.suite().as_slice()
                else {
                    panic!("expected callback and registration fixture");
                };
                let Stmt::FunctionDef(implementation) = implementation else {
                    panic!("expected callback definition");
                };
                let Stmt::Assign(parent) = parent else {
                    panic!("expected inherited parent");
                };
                let Stmt::Assign(registration) = registration else {
                    panic!("expected macro registration");
                };
                let parent_type = parent.value.inferred_type(&model).unwrap();
                let macro_type = registration.value.inferred_type(&model).unwrap();
                let data = macro_type.provided_data(db, &environment).unwrap();
                let data = data.downcast_ref::<super::factory::RuleData>().unwrap();
                assert_eq!(data.complete, !erased);
                assert!(data
                    .attributes
                    .iter()
                    .all(|attribute| attribute.descriptor.is_some()));
                assert_eq!(
                    data.attributes
                        .iter()
                        .map(|attribute| attribute.name.as_str())
                        .collect::<Vec<_>>(),
                    if erased {
                        vec!["name", "visibility"]
                    } else {
                        vec!["name", "visibility", "srcs", "optional"]
                    }
                );
                let mut signatures = Vec::new();
                macro_type.map_callable_signatures(
                    db,
                    &environment,
                    CallableTypeKind::Regular,
                    |signature| {
                        assert_eq!(
                            signature.parameters().iter().any(|parameter| matches!(
                                parameter.kind(),
                                ParameterKind::KeywordVariadic { .. }
                            )),
                            erased,
                            "only the erased parent needs an open keyword signature"
                        );
                        signatures.push(
                            Type::single_callable(db, signature.clone())
                                .display(db, &environment)
                                .to_string(),
                        );
                        signature
                    },
                );
                assert!(
                    !signatures.is_empty(),
                    "macro must retain a callable signature"
                );
                if let Some(expected) = &expected_signatures {
                    assert_eq!(
                        &signatures, expected,
                        "callback parameters must not change the public macro signature"
                    );
                } else {
                    expected_signatures = Some(signatures);
                }
                let diagnostics = snapshot.diagnostics(file).unwrap();
                assert!(diagnostics.is_empty(), "{diagnostics:?}");
                if erased {
                    assert!(
                        matches!(parent_type, Type::NominalInstance(_)),
                        "erasure must retain a nominal rule"
                    );
                    assert!(
                        parent_type.provided_data(db, &environment).is_none(),
                        "erased rule must lose native metadata"
                    );
                    assert_eq!(parent_type.display(db, &environment).to_string(), "rule");
                }
                let (srcs_type, optional_type) = if !erased && !keyword_parameters {
                    ("list[Label]", "select[bool | None, object] | None")
                } else {
                    ("Unknown", "Unknown")
                };
                let [name, visibility, srcs, optional, kwargs, _forward] =
                    implementation.body.as_slice()
                else {
                    panic!("expected callback field observations and native forwarding");
                };
                for (statement, expected) in [
                    (name, "str"),
                    (visibility, "list[Label]"),
                    (srcs, srcs_type),
                    (optional, optional_type),
                    (kwargs, "dict[str, Unknown]"),
                ] {
                    let Stmt::Expr(statement) = statement else {
                        panic!("expected callback field observation");
                    };
                    let ty = statement.value.inferred_type(&model).unwrap();
                    assert_eq!(
                        ty.display(db, &environment).to_string(),
                        expected,
                        "erased={erased}, kwargs={keyword_parameters}: {:?}",
                        statement.range
                    );
                }
            }
        }
    }

    #[test]
    fn label_list_dictionary_context_views() {
        let source = r#"def _transition(settings, attributes):
    return {}
change = transition(implementation=_transition, inputs=[], outputs=[])
def _impl(ctx):
    ctx.attr.inputs
    ctx.files.inputs
    ctx.split_attr.split_inputs
    return []
grouped = rule(implementation=_impl, attrs={
    "inputs": attr.label_list_dict(),
    "split_inputs": attr.label_list_dict(cfg=change),
})
def _repo_impl(repo_ctx):
    repo_ctx.attr.repo_inputs
repository = repository_rule(implementation=_repo_impl, attrs={"repo_inputs": attr.label_list_dict()})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        starpls_bazel::env::apply_versioned_signatures(&mut builtins, "release 9.0.0");
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let file = fixture.main_file();
        let snapshot = analysis.snapshot();
        let diagnostics = snapshot.diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (expression, expected, key) in [
            (
                "ctx.attr.inputs",
                "dict[str, list[Target[FilesToRunProvider[File | None]] | Target[None]]]",
                "\"inputs\"",
            ),
            ("ctx.files.inputs", "list[File]", "\"inputs\""),
            (
                "ctx.split_attr.split_inputs",
                "dict[str | None, dict[str, list[Target[FilesToRunProvider[File | None]] | Target[None]]]]",
                "\"split_inputs\"",
            ),
            (
                "repo_ctx.attr.repo_inputs",
                "dict[str, list[Label]]",
                "\"repo_inputs\"",
            ),
        ] {
            check_field(&snapshot, file, source, expression, expected, key);
        }
    }

    #[test]
    fn context_views_share_attribute_origins_and_transition_types() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        fixture.add_file(&mut analysis.db, "transitions.bzl", "def implementation(settings, attrs): return {}\nfactory = transition\nchange = factory(implementation=implementation, inputs=[], outputs=[])\n");
        let source = r#"load("transitions.bzl", imported="change")
def implementation(ctx):
    ctx.attr.dep
    ctx.attr.out
    ctx.attr.outs
    ctx.attr.split
    ctx.files.srcs
    ctx.files.keyed
    ctx.files.named
    ctx.file.empty
    ctx.file.extension
    ctx.file.false_value
    ctx.executable.tool
    ctx.outputs.out
    ctx.outputs.outs
    ctx.outputs.implicit
    ctx.outputs.executable
    ctx.split_attr.split
    ctx.split_attr.split_list
    ctx.split_attr.split_keyed
    ctx.split_attr.split_named
    ctx.actions.run
example = rule(implementation=implementation, executable=True, outputs={"implicit": "%{name}.txt"}, attrs={
    "dep": attr.label(),
    "out": attr.output(),
    "outs": attr.output_list(),
    "srcs": attr.label_list(),
    "keyed": attr.label_keyed_string_dict(),
    "named": attr.string_keyed_label_dict(),
    "empty": attr.label(allow_single_file=[]),
    "extension": attr.label(allow_single_file=[".txt"]),
    "false_value": attr.label(allow_single_file=False),
    "tool": attr.label(executable=True, cfg="exec"),
    "split": attr.label(cfg=imported),
    "split_list": attr.label_list(cfg=imported),
    "split_keyed": attr.label_keyed_string_dict(cfg=imported),
    "split_named": attr.string_keyed_label_dict(cfg=imported),
})
"#;
        let file = fixture.add_file(&mut analysis.db, "defs.bzl", source);
        loader.add_files_from_fixture(&fixture);
        enable_context(&mut analysis);
        let snapshot = analysis.snapshot();
        for (expression, expected, key) in [
            (
                "ctx.attr.dep",
                "Target[FilesToRunProvider[File | None]] | Target[None] | None",
                "\"dep\"",
            ),
            ("ctx.attr.out", "Label | None", "\"out\""),
            ("ctx.attr.outs", "list[Label]", "\"outs\""),
            (
                "ctx.attr.split",
                "list[Target[FilesToRunProvider[File | None]] | Target[None]]",
                "\"split\"",
            ),
            ("ctx.files.srcs", "list[File]", "\"srcs\""),
            ("ctx.files.keyed", "list[File]", "\"keyed\""),
            ("ctx.files.named", "list[File]", "\"named\""),
            ("ctx.file.empty", "File | None", "\"empty\""),
            ("ctx.file.extension", "File | None", "\"extension\""),
            ("ctx.file.false_value", "File | None", "\"false_value\""),
            ("ctx.executable.tool", "File | None", "\"tool\""),
            ("ctx.outputs.out", "File | None", "\"out\""),
            ("ctx.outputs.outs", "list[File]", "\"outs\""),
            ("ctx.outputs.implicit", "File", "\"implicit\""),
            ("ctx.outputs.executable", "File", ""),
            (
                "ctx.split_attr.split",
                "dict[str | None, Target[FilesToRunProvider[File | None]] | Target[None]]",
                "\"split\"",
            ),
            (
                "ctx.split_attr.split_list",
                "dict[str | None, list[Target[FilesToRunProvider[File | None]] | Target[None]]]",
                "\"split_list\"",
            ),
            (
                "ctx.split_attr.split_keyed",
                "dict[str | None, list[Target[FilesToRunProvider[File | None]] | Target[None]]]",
                "\"split_keyed\"",
            ),
            (
                "ctx.split_attr.split_named",
                "dict[str | None, dict[str, Target[FilesToRunProvider[File | None]] | Target[None]]]",
                "\"split_named\"",
            ),
        ] {
            check_field(&snapshot, file, source, expression, expected, key);
        }
        let pos = (source.find("ctx.actions.run").unwrap() + "ctx.actions.".len()) as u32;
        let hover = snapshot
            .hover(FilePosition {
                file_id: file,
                pos: pos.into(),
            })
            .unwrap()
            .unwrap();
        assert!(
            hover.contents.value.contains("(method)"),
            "{}",
            hover.contents.value
        );
    }

    #[test]
    fn transition_contracts_preserve_attribute_configuration() {
        let source = r#"def implementation(settings: dict[str, object], attrs: object) -> dict[str, object]:
    return {}
def create() -> transition[Literal['split']]:
    return transition(implementation=implementation, inputs=[], outputs=[])
def split_attribute(change: transition[Literal['split']]) -> Attribute[Sequence[Target]]:
    return attr.label(cfg=change)
def erased_attribute(change: transition) -> Attribute:
    return attr.label(cfg=change)
def unknown() -> transition:
    return config.target()
def rule_impl(ctx):
    ctx.attr.split
    ctx.attr.helper
    ctx.attr.ordinary
    ctx.attr.unknown
    ctx.split_attr.split
example = rule(implementation=rule_impl, attrs={
    'split': attr.label(cfg=create()),
    'helper': split_attribute(create()),
    'ordinary': attr.label(cfg=config.none()),
    'unknown': erased_attribute(create()),
})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let snapshot = analysis.snapshot();
        let diagnostics = snapshot.diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (expression, expected) in [
            (
                "ctx.attr.split",
                "list[Target[FilesToRunProvider[File | None]] | Target[None]]",
            ),
            (
                "ctx.attr.ordinary",
                "Target[FilesToRunProvider[File | None]] | Target[None] | None",
            ),
            (
                "ctx.attr.helper",
                "Sequence[Target[FilesToRunProvider[File | None] | None]]",
            ),
            ("ctx.attr.unknown", "Unknown"),
        ] {
            check_field(&snapshot, file, source, expression, expected, "");
        }
        drop(snapshot);
        for statement in [
            "split_attribute(config.none())",
            "split_attribute(config.target())",
            "split_attribute(unknown())",
        ] {
            analysis.update_file(file, format!("{source}{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{statement}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
        }
        analysis.update_file(
            file,
            source
                .replace("return {}", "return [{}]")
                .replace("-> dict[str, object]:", "-> list[dict[str, object]]:"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn uncertain_flags_keep_unrelated_context_fields_precise() {
        let source = r#"def unknown(): pass
def implementation(ctx):
    ctx.attr.count
    ctx.attr.dep
    ctx.files.dep
    ctx.file.dep
    ctx.executable.dep
    ctx.split_attr.dep
    ctx.attr.native
    ctx.attr.none_transition
    ctx.outputs.dynamic
    ctx.file.
example = rule(implementation=implementation, outputs=unknown(), executable=unknown(), attrs={
    "count": attr.int(),
    "dep": attr.label(allow_single_file=unknown(), executable=unknown(), cfg=unknown()),
    "native": attr.label(cfg=config.target()),
    "none_transition": attr.label(cfg=config.none()),
    "absent": attr.label(allow_single_file=None, executable=False),
})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let snapshot = analysis.snapshot();
        for (expression, expected) in [
            ("ctx.attr.count", "int"),
            ("ctx.attr.dep", "Unknown"),
            ("ctx.files.dep", "list[File]"),
            ("ctx.file.dep", "Unknown"),
            ("ctx.executable.dep", "Unknown"),
            ("ctx.split_attr.dep", "Unknown"),
            (
                "ctx.attr.native",
                "Target[FilesToRunProvider[File | None]] | Target[None] | None",
            ),
            (
                "ctx.attr.none_transition",
                "Target[FilesToRunProvider[File | None]] | Target[None] | None",
            ),
            ("ctx.outputs.dynamic", "Unknown"),
        ] {
            check_field(&snapshot, file, source, expression, expected, "");
        }
        let pos = (source.rfind("ctx.file.").unwrap() + "ctx.file.".len()) as u32;
        let completions = snapshot
            .completions(
                FilePosition {
                    file_id: file,
                    pos: pos.into(),
                },
                None,
            )
            .unwrap()
            .unwrap();
        assert!(completions
            .iter()
            .any(|completion| completion.label == "dep"));
        assert!(!completions
            .iter()
            .any(|completion| completion.label == "absent"));
    }

    #[test]
    fn repository_attributes_keep_labels_and_native_methods() {
        let source = r#"def implementation(ctx):
    ctx.attr.dep
    ctx.download
example = repository_rule(implementation=implementation, attrs={"dep": attr.label()})
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        enable_context(&mut analysis);
        let file = fixture.main_file();
        let snapshot = analysis.snapshot();
        check_field(
            &snapshot,
            file,
            source,
            "ctx.attr.dep",
            "Label | None",
            "\"dep\"",
        );
        let hover = snapshot
            .hover(FilePosition {
                file_id: file,
                pos: (source.find("download").unwrap() as u32).into(),
            })
            .unwrap()
            .unwrap();
        assert!(hover.contents.value.contains("(method)"));
    }
}
