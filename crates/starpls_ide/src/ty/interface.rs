//! Stub exports supply trusted client contracts and annotations for source declarations.

use std::collections::hash_map::Entry;

use ruff_db::files::FileRange;
use ruff_python_ast::name::Name;
use ruff_python_ast::statement_visitor;
use ruff_python_ast::statement_visitor::StatementVisitor;
use ruff_python_ast::Expr;
use ruff_python_ast::HasNodeIndex;
use ruff_python_ast::NodeIndex;
use ruff_python_ast::Parameter;
use ruff_python_ast::Stmt;
use ruff_python_ast::StmtClassDef;
use ruff_python_ast::StmtFunctionDef;
use ruff_text_size::Ranged;
use ruff_text_size::TextRange;
use rustc_hash::FxHashMap;
use rustc_hash::FxHashSet;
use salsa::Setter;
use starpls_bazel::APIContext;
use starpls_common::Dialect;
use starpls_common::File;
use starpls_common::FileInfo;
use starpls_hir::Db as _;
use ty_python_core::definition::Definition;
use ty_python_core::definition::DefinitionKind;
use ty_python_core::definition::ParameterDefinitionNodeKind;
use ty_python_core::global_scope;
use ty_python_core::place::ScopedPlaceId;
use ty_python_core::place_table;
use ty_python_core::semantic_index;
use ty_python_core::use_def_map;
use ty_python_core::ProgramFile;
use ty_python_semantic::lint::LintMetadata;
use ty_python_semantic::provided::ProvidedField;
use ty_python_semantic::types::ide_support::definitions_for_name;
use ty_python_semantic::types::list_members::all_end_of_scope_members;
use ty_python_semantic::types::CallableTypeKind;
use ty_python_semantic::types::OverloadBodyAnalysis;
use ty_python_semantic::types::Type;
use ty_python_semantic::types::TypeDefinition;
use ty_python_semantic::ImportAliasResolution;
use ty_python_semantic::ProgramEnvironment;
use ty_python_semantic::SemanticModel;

use crate::Analysis;
use crate::Database;

#[salsa::db]
pub(crate) trait Db: ty_python_semantic::Db + starpls_hir::Db {
    /// Immutable for the lifetime of this database.
    fn program_settings(&self) -> &ty_python_core::program::ProgramSettings;
    fn starlark_program_file(&self, file: File) -> ProgramFile<'_>;
    fn starlark_file(&self, file: ProgramFile<'_>) -> Option<File>;
}

#[salsa::db]
impl Db for Database {
    fn program_settings(&self) -> &ty_python_core::program::ProgramSettings {
        &self.semantic.program
    }
    fn starlark_program_file(&self, file: File) -> ProgramFile<'_> {
        Database::starlark_program_file(self, file)
    }
    fn starlark_file(&self, file: ProgramFile<'_>) -> Option<File> {
        Database::starlark_file(self, file)
    }
}

/// Operation declarations specify Starlark syntax and builtin capabilities.
#[salsa::tracked(returns(copy))]
pub(super) fn is_operation_declaration<'db>(db: &'db dyn Db, definition: Definition<'db>) -> bool {
    let program_file = definition.program_file(db);
    let Some(file) = db.starlark_file(program_file) else {
        return false;
    };
    if !file.is_type_interface(db) {
        return false;
    }
    let DefinitionKind::Function(function) = definition.kind(db) else {
        return false;
    };
    let ty_python_core::scope::NodeWithScopeKind::Class(class) = definition.scope(db).node(db)
    else {
        return false;
    };
    let module = ruff_db::parsed::parsed_module(db, program_file.python_file(db)).load(db);
    let function = function.node(&module);
    let class = class.node(&module);
    super::support::is_operation_member(function.name.as_str())
        && function.decorator_list.is_empty()
        && class
            .arguments
            .as_ref()
            .is_some_and(|arguments| !arguments.args.is_empty())
}

#[derive(Default)]
pub(super) struct InterfaceDiagnostics<'db> {
    pub diagnostics: Vec<ruff_db::diagnostic::Diagnostic>,
    pub overload_bodies: Vec<OverloadBodyAnalysis<'db>>,
}

pub(super) fn diagnostics(db: &Database, file: File) -> InterfaceDiagnostics<'_> {
    use ruff_db::diagnostic::Annotation;
    use ruff_db::diagnostic::Diagnostic;
    use ruff_db::diagnostic::DiagnosticId;
    use ruff_db::diagnostic::Severity;
    use ruff_db::diagnostic::Span;
    if !file.is_type_interface(db) {
        return function_diagnostics(db, file);
    }
    let program = db.starlark_program_file(file);
    let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
    let model = SemanticModel::new(db, program);
    let mut diagnostics = Vec::new();
    for (source, interface) in db.environment().type_interfaces(db).values() {
        if *interface != file {
            continue;
        }
        let Some(BindingAnnotations {
            kind,
            interface: _,
            owners: _,
            errors,
        }) = binding_annotations(db, *source)
        else {
            continue;
        };
        let (_, lint) = kind.metadata();
        for (range, message) in errors {
            let mut diagnostic = Diagnostic::new(
                DiagnosticId::Lint(lint.name()),
                Severity::Error,
                message.clone(),
            );
            diagnostic.annotate(Annotation::primary(
                Span::from(file.source).with_range(*range),
            ));
            diagnostics.push(diagnostic);
        }
    }
    let mut report = |range, message: String| {
        let mut diagnostic = Diagnostic::new(
            DiagnosticId::Lint(super::diagnostics::INVALID_PROVIDER_INTERFACE.name()),
            Severity::Error,
            message,
        );
        diagnostic.annotate(Annotation::primary(
            Span::from(file.source).with_range(range),
        ));
        diagnostics.push(diagnostic);
    };
    let index = ty_python_core::semantic_index(db, program);
    for statement in parsed.suite() {
        let Stmt::ClassDef(class) = statement else {
            continue;
        };
        let Some([definition]) = index.try_definitions(class.into()) else {
            continue;
        };
        if !is_provider_class(class) {
            let ty = model.definition_type(*definition);
            let instance = ty.to_instance_approximation(db, &model.program_environment());
            if class
                .arguments
                .as_ref()
                .is_some_and(|arguments| !arguments.keywords.is_empty())
                && !instance.is_some_and(|instance| matches!(instance, Type::TypedDict(_)))
            {
                report(
                    class.name.range,
                    "Only TypedDict declarations accept class keywords".into(),
                );
            } else if !instance.is_some_and(|instance| {
                matches!(instance, Type::ProtocolInstance(_) | Type::TypedDict(_))
            }) {
                report(
                    class.name.range,
                    "Interface classes with bases must declare a Protocol or TypedDict".into(),
                );
            }
            continue;
        }
        if !class.body.iter().any(|statement| matches!(statement, Stmt::FunctionDef(function) if function.name.as_str() == "__init__")) {
            report(class.name.range, "Provider classes require an explicit __init__ declaration".into());
        }
        for statement in &class.body {
            let Stmt::AnnAssign(field) = statement else {
                continue;
            };
            let Some(name) = field.target.as_name_expr() else {
                continue;
            };
            let qualifiers = model.type_qualifiers(name.into());
            if name.id.starts_with("__") && name.id.ends_with("__") {
                report(
                    name.range(),
                    "Provider fields cannot define special methods".into(),
                );
            } else if !qualifiers.contains(ty_python_semantic::TypeQualifiers::FINAL)
                || qualifiers.contains(ty_python_semantic::TypeQualifiers::CLASS_VAR)
            {
                report(
                    name.range(),
                    "Provider fields require an instance annotation of the form Final[T]".into(),
                );
            }
        }
    }
    diagnostics.extend(pairing_diagnostics(db, file));
    diagnostics.extend(super::providers::declaration_diagnostics(db, file));

    InterfaceDiagnostics {
        diagnostics,
        overload_bodies: Vec::new(),
    }
}

#[derive(Debug, PartialEq, Eq)]
struct ImplementationAnnotations {
    interface: File,
    owners: FxHashMap<NodeIndex, NodeIndex>,
    value_declarations: Vec<NodeIndex>,
    overload_counts: FxHashMap<NodeIndex, usize>,
    errors: Vec<(TextRange, TextRange, String)>,
}

/// A companion belongs to the installed Bazel module. The underlying source text
/// may be shared by symlinks in several repositories, each with a different API.
pub(crate) fn adjacent_pair(db: &dyn Db, file: File) -> Option<(File, File)> {
    if !file.allows_native_annotations(db) || !db.environment().interface_configuration_ready(db) {
        return None;
    }
    let stub = file.is_type_interface(db);
    let replace_extension = |extension: &str| {
        File::from_path(
            db,
            &file.path(db).with_extension(extension),
            file.dialect,
            file.info,
        )
        .ok()
    };
    let source = if stub {
        replace_extension("bzl")?
    } else {
        file
    };
    if db
        .environment()
        .type_interfaces(db)
        .contains_key(&source.source)
    {
        return None;
    }
    let interface = if stub {
        file
    } else {
        replace_extension("bzli")?
    };
    Some((source, interface))
}

pub(crate) fn pairs_for_file(db: &dyn Db, file: File) -> impl Iterator<Item = (File, File)> + '_ {
    db.environment()
        .type_interfaces(db)
        .values()
        .copied()
        .filter(move |(source, interface)| {
            source.source == file.source || interface.source == file.source
        })
        .chain(adjacent_pair(db, file))
}

pub(super) fn pair_for_source(db: &dyn Db, file: File) -> Option<(File, File)> {
    db.environment()
        .type_interfaces(db)
        .get(&file.source)
        .copied()
        .or_else(|| adjacent_pair(db, file).filter(|(source, _)| *source == file))
}

fn implementation_annotations(db: &dyn Db, file: File) -> Option<&ImplementationAnnotations> {
    if BindingSource::from_file(file).is_some() || file.is_type_interface(db) {
        return None;
    }
    let (implementation, interface) = pair_for_source(db, file)?;
    if implementation != file {
        return None;
    }
    Some(implementation_annotations_query(
        db,
        file.source,
        (file.dialect, file.info),
        interface,
    ))
}

/// Correspondence is needed during indexing and must depend only on syntax.
#[salsa::tracked(returns(ref))]
fn implementation_annotations_query(
    db: &dyn Db,
    source: ruff_db::files::File,
    context: (Dialect, Option<FileInfo>),
    interface: File,
) -> ImplementationAnnotations {
    let (dialect, info) = context;
    let file = File {
        source,
        dialect,
        info,
    };
    let source_names = module_bindings(db, file);
    let stub_names = module_bindings(db, interface);
    let parsed = starpls_common::parsed_module(db, file).load(db);
    let source_assignments = direct_module_assignments(parsed.suite());
    let source_functions: FxHashMap<_, _> = parsed
        .suite()
        .iter()
        .filter_map(|statement| {
            let Stmt::FunctionDef(function) = statement else {
                return None;
            };
            Some((&function.name.id, function))
        })
        .collect();
    let stub = starpls_common::parsed_module(db, interface).load(db);
    let mut result = ImplementationAnnotations {
        interface,
        owners: FxHashMap::default(),
        value_declarations: Vec::new(),
        overload_counts: FxHashMap::default(),
        errors: Vec::new(),
    };
    let mut declarations = FxHashMap::<_, Vec<_>>::default();
    for statement in stub.suite() {
        if let Stmt::FunctionDef(declaration) = statement {
            declarations
                .entry(&declaration.name.id)
                .or_default()
                .push(declaration);
        }
    }
    for statement in stub.suite() {
        if let Stmt::AnnAssign(declaration) = statement {
            let Expr::Name(name) = declaration.target.as_ref() else {
                continue;
            };
            let Some(&owner) = source_assignments.get(&name.id) else {
                continue;
            };
            if declaration
                .value
                .as_deref()
                .is_none_or(|value| matches!(value, Expr::EllipsisLiteral(_)))
                && source_names.get(&name.id) == Some(&1)
                && stub_names.get(&name.id) == Some(&1)
            {
                result.owners.insert(owner, declaration.node_index().load());
            }
            continue;
        }
        let Stmt::FunctionDef(first) = statement else {
            continue;
        };
        let Some(family) = declarations.remove(&first.name.id) else {
            continue;
        };
        let Some((declaration, overloads)) = family.split_last() else {
            continue;
        };
        // Provider constructors have their own correspondence and field checking.
        if super::providers::has_record_return(declaration) && !stub_names.contains_key("record") {
            continue;
        }
        let source = source_functions.get(&declaration.name.id).copied();
        let error = if stub_names.get(&declaration.name.id) != Some(&family.len()) {
            Some("the stub must bind this name only through its function declarations")
        } else if !overloads.is_empty()
            && (!declaration.decorator_list.is_empty()
                || overloads.iter().any(|overload| {
                    let [decorator] = overload.decorator_list.as_slice() else {
                        return true;
                    };
                    !decorator
                        .expression
                        .as_name_expr()
                        .is_some_and(|name| name.id == "overload")
                }))
        {
            Some("overloads require a final ordinary implementation declaration")
        } else if !overloads.is_empty()
            && (declaration.returns.is_none()
                || declaration
                    .parameters
                    .iter()
                    .any(|parameter| parameter.annotation().is_none()))
        {
            Some("overload implementations require complete parameter and return annotations")
        } else if source_names.get(&declaration.name.id) != Some(&1) {
            Some("the source must bind this name exactly once")
        } else if let Some(source) = source {
            if !source.decorator_list.is_empty() || !declaration.decorator_list.is_empty() {
                Some("decorated function correspondence is unsupported")
            } else {
                match parameter_pairs(source, declaration) {
                    Err(error) => Some(error),
                    Ok(pairs) => {
                        let comments = starpls_hir::Source::new(db);
                        let source_return = source.returns.is_some()
                            || comments
                                .type_comment_annotation(file, source.node_index().load())
                                .is_some();
                        let source_parameter = |parameter: &Parameter| {
                            parameter.annotation.is_some()
                                || comments
                                    .type_comment_annotation(file, parameter.node_index().load())
                                    .is_some()
                        };
                        let has_source_annotation = source.type_params.is_some()
                            || source_return
                            || pairs
                                .iter()
                                .any(|(parameter, _)| source_parameter(parameter));
                        let complete_source = source_return
                            && pairs
                                .iter()
                                .all(|(parameter, _)| source_parameter(parameter));
                        let complete = declaration.returns.is_some()
                            && pairs
                                .iter()
                                .all(|(_, parameter)| parameter.annotation.is_some());
                        if declaration.type_params.is_some()
                            && !complete_source
                            && (has_source_annotation || !complete)
                        {
                            Some("generic signatures require complete source annotations or complete stub annotations with an unannotated source signature")
                        } else {
                            result.owners.insert(
                                source.node_index().load(),
                                declaration.node_index().load(),
                            );
                            for (source, declaration) in pairs {
                                result.owners.insert(
                                    source.node_index().load(),
                                    declaration.node_index().load(),
                                );
                            }
                            None
                        }
                    }
                }
            }
        } else {
            result
                .value_declarations
                .push(declaration.node_index().load());
            None
        };
        if error.is_none() && !overloads.is_empty() {
            result
                .overload_counts
                .insert(declaration.node_index().load(), family.len());
        }
        if let Some(error) = error {
            result.errors.push((
                source.map_or(TextRange::default(), |source| source.name.range()),
                declaration.name.range(),
                format!(
                    "Cannot check `{}` against its stub: {error}",
                    declaration.name.id,
                ),
            ));
        }
    }
    result
}

pub(super) fn implementation_annotation<'db>(
    db: &'db Database,
    file: File,
    owner: NodeIndex,
) -> Option<ty_python_core::ProvidedAnnotation<'db>> {
    let ImplementationAnnotations {
        interface,
        owners,
        value_declarations: _,
        overload_counts: _,
        errors: _,
    } = implementation_annotations(db, file)?;
    let &owner = owners.get(&owner)?;
    Some(ty_python_core::ProvidedAnnotation::External {
        file: db.starlark_program_file(*interface),
        owner,
    })
}

/// An omitted stub parameter can share its implementation's generated Bazel contract.
#[salsa::tracked(returns(copy))]
pub(super) fn source_parameter<'db>(
    db: &'db dyn Db,
    definition: Definition<'db>,
) -> Option<Definition<'db>> {
    let program = definition.program_file(db);
    let file = db.starlark_file(program)?;
    if !file.is_type_interface(db) {
        return None;
    }
    let DefinitionKind::Parameter(parameter) = definition.kind(db) else {
        return None;
    };
    let ParameterDefinitionNodeKind::Parameter(parameter) = parameter else {
        return None;
    };
    let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
    let parameter = &parameter.node(&parsed).parameter;
    if parameter.annotation.is_some() {
        return None;
    }
    // One stub may describe several implementations. It then has no unique body schema.
    let mut sources = pairs_for_file(db, file).map(|(source, _)| source);
    let source = sources.next()?;
    if sources.next().is_some() {
        return None;
    }
    let annotations = implementation_annotations(db, source)?;
    let (&owner, _) = annotations
        .owners
        .iter()
        .find(|(_, owner)| **owner == parameter.node_index().load())?;
    let program = db.starlark_program_file(source);
    let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
    let ruff_python_ast::AnyRootNodeRef::Parameter(parameter) = parsed.get_by_index(owner) else {
        return None;
    };
    let [definition] = semantic_index(db, program).try_definitions(parameter.into())? else {
        return None;
    };
    Some(*definition)
}

fn function_diagnostics(db: &Database, file: File) -> InterfaceDiagnostics<'_> {
    use ruff_db::diagnostic::Annotation;
    use ruff_db::diagnostic::Diagnostic;
    use ruff_db::diagnostic::DiagnosticId;
    use ruff_db::diagnostic::Severity;
    use ruff_db::diagnostic::Span;
    let Some(ImplementationAnnotations {
        interface,
        owners,
        value_declarations,
        overload_counts,
        errors,
    }) = implementation_annotations(db, file)
    else {
        return InterfaceDiagnostics::default();
    };
    let mut diagnostics = Vec::new();
    let mut overload_bodies = Vec::new();
    let diagnostic = |id, source_range, stub_range, message: String| {
        let mut diagnostic = Diagnostic::new(id, Severity::Error, message);
        diagnostic.annotate(Annotation::primary(
            Span::from(file.source).with_range(source_range),
        ));
        diagnostic.annotate(
            Annotation::secondary(Span::from(interface.source).with_range(stub_range))
                .message("Function declared here"),
        );
        diagnostic
    };
    let invalid = |source_range, stub_range, message| {
        diagnostic(
            DiagnosticId::Lint(super::diagnostics::INVALID_FUNCTION_INTERFACE.name()),
            source_range,
            stub_range,
            message,
        )
    };
    for (source, stub, message) in errors {
        diagnostics.push(invalid(*source, *stub, message.clone()));
    }
    let program = db.starlark_program_file(file);
    let stub_program = db.starlark_program_file(*interface);
    let parsed = starpls_common::parsed_module(db, file).load(db);
    let stub = starpls_common::parsed_module(db, *interface).load(db);
    let model = SemanticModel::new(db, program);
    let stub_model = SemanticModel::new(db, stub_program);
    let index = semantic_index(db, program);
    let stub_index = semantic_index(db, stub_program);
    let environment = model.program_environment();
    let mut functions = Vec::new();
    for statement in parsed.suite() {
        let Stmt::FunctionDef(function) = statement else {
            continue;
        };
        let Some(&owner) = owners.get(&function.node_index().load()) else {
            continue;
        };
        let ruff_python_ast::AnyRootNodeRef::Stmt(Stmt::FunctionDef(declaration)) =
            stub.get_by_index(owner)
        else {
            unreachable!("function annotations refer to function declarations");
        };
        let Some([definition]) = index.try_definitions(function.into()) else {
            diagnostics.push(invalid(
                function.name.range(),
                declaration.name.range(),
                format!("Cannot resolve both declarations of `{}`", function.name.id),
            ));
            continue;
        };
        functions.push((*definition, declaration));
    }
    for owner in value_declarations {
        let ruff_python_ast::AnyRootNodeRef::Stmt(Stmt::FunctionDef(declaration)) =
            stub.get_by_index(*owner)
        else {
            unreachable!("value declarations refer to stub functions");
        };
        let definitions = export_definitions(db, program, &declaration.name.id);
        if let [definition] = definitions.as_slice() {
            functions.push((*definition, declaration));
            continue;
        }
        diagnostics.push(invalid(
            definitions.first().map_or(TextRange::default(), |definition| definition.kind(db).target_range(&parsed)),
            declaration.name.range(),
            format!("Cannot check `{}` against its stub: the source binding must resolve to one definition", declaration.name.id),
        ));
    }
    for (definition, declaration) in functions {
        let source_range = definition.kind(db).target_range(&parsed);
        let Some([stub_definition]) = stub_index.try_definitions(declaration.into()) else {
            diagnostics.push(invalid(
                source_range,
                declaration.name.range(),
                format!(
                    "Cannot resolve the stub declaration of `{}`",
                    declaration.name.id
                ),
            ));
            continue;
        };
        let mut actual = model.definition_type(definition);
        let mut expected = stub_model.definition_type(*stub_definition);
        let mut incomplete_overload = false;
        let mut value_overload = None;
        if let Some(&count) = overload_counts.get(&declaration.node_index().load()) {
            let Type::FunctionLiteral(function) = expected else {
                diagnostics.push(invalid(
                    source_range,
                    declaration.name.range(),
                    "Cannot resolve the overloaded implementation".into(),
                ));
                continue;
            };
            let mut family = function.iter_overloads_and_implementation(db);
            let Some(implementation) = family.next_back() else {
                diagnostics.push(invalid(
                    source_range,
                    declaration.name.range(),
                    "Cannot resolve the overloaded implementation".into(),
                ));
                continue;
            };
            let mut actual_count = 1;
            let signature = implementation.signature(db);
            let mut supported = true;
            for overload in family {
                actual_count += 1;
                supported &= signature.supports_overload_implementation_consistency_with(
                    db,
                    &environment,
                    &overload.signature(db),
                );
            }
            if implementation.definition(db) != *stub_definition
                || actual_count != count
                || !supported
            {
                diagnostics.push(invalid(source_range, declaration.name.range(), "The overload family requires an ordinary implementation whose consistency can be checked".into()));
                continue;
            }
            match (definition.kind(db), actual) {
                (DefinitionKind::Function(_), Type::FunctionLiteral(source)) => {
                    let Some(implementation) =
                        source.iter_overloads_and_implementation(db).next_back()
                    else {
                        diagnostics.push(invalid(
                            source_range,
                            declaration.name.range(),
                            "Cannot resolve the source implementation".into(),
                        ));
                        continue;
                    };
                    actual = Type::single_callable(db, implementation.signature(db));
                    let analysis = OverloadBodyAnalysis::new(db, source);
                    incomplete_overload = !analysis.is_complete();
                    overload_bodies.push(analysis);
                }
                (_, Type::FunctionLiteral(_)) => {
                    // The alias's declaration does not supply the target body's annotations.
                    incomplete_overload = true;
                }
                _ => value_overload = Some(expected),
            }
            // Compare implementation signatures; callers use the overloads.
            expected = Type::single_callable(db, signature);
        }
        // Function literals identify declarations; compare their callable signatures.
        let (Some(actual), Some(expected)) = (
            actual.map_callable_signatures(
                db,
                &environment,
                CallableTypeKind::FunctionLike,
                |signature| signature,
            ),
            expected.map_callable_signatures(
                db,
                &environment,
                CallableTypeKind::FunctionLike,
                |signature| signature,
            ),
        ) else {
            diagnostics.push(invalid(
                source_range,
                declaration.name.range(),
                format!(
                    "Cannot resolve both signatures of `{}`",
                    declaration.name.id
                ),
            ));
            continue;
        };
        if !actual.is_assignable_to(db, &environment, expected) {
            diagnostics.push(invalid(
                source_range,
                declaration.name.range(),
                format!(
                    "Function `{}` with type `{}` does not satisfy its stub type `{}`",
                    declaration.name.id,
                    actual.display(db, &environment),
                    expected.display(db, &environment),
                ),
            ));
        } else if incomplete_overload
            || value_overload.is_some_and(|family| {
                !actual.is_fully_static(db, &environment)
                    || !family
                        .map_callable_signatures(
                            db,
                            &environment,
                            CallableTypeKind::FunctionLike,
                            |signature| signature,
                        )
                        .is_some_and(|family| actual.is_assignable_to(db, &environment, family))
            })
        {
            diagnostics.push(diagnostic(
                DiagnosticId::Lint(super::diagnostics::UNVERIFIED_OVERLOAD.name()),
                source_range,
                declaration.name.range(),
                format!(
                    "Could not verify every overload of `{}` against the implementation",
                    declaration.name.id
                ),
            ));
        }
    }
    InterfaceDiagnostics {
        diagnostics,
        overload_bodies,
    }
}

pub(super) fn pairing_diagnostics(
    db: &Database,
    file: File,
) -> Vec<ruff_db::diagnostic::Diagnostic> {
    use ruff_db::diagnostic::Annotation;
    use ruff_db::diagnostic::Diagnostic;
    use ruff_db::diagnostic::DiagnosticId;
    use ruff_db::diagnostic::Severity;
    use ruff_db::diagnostic::Span;
    let program = db.starlark_program_file(file);
    let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
    let mut diagnostics = Vec::new();
    let mut report = |range, message: String| {
        let mut diagnostic = Diagnostic::new(
            DiagnosticId::Lint(super::diagnostics::INVALID_PROVIDER_INTERFACE.name()),
            Severity::Error,
            message,
        );
        diagnostic.annotate(Annotation::primary(
            Span::from(file.source).with_range(range),
        ));
        diagnostics.push(diagnostic);
    };
    for definitions in provider_pairs(db)
        .values()
        .filter(|definitions| definitions.len() > 1)
    {
        for definition in definitions {
            if definition.program_file(db) == program {
                report(
                    definition.kind(db).target_range(&parsed),
                    "Multiple stub classes describe the same provider declaration".into(),
                );
            }
        }
    }
    let mut origins: FxHashMap<Definition<'_>, usize> = FxHashMap::default();
    for definitions in provider_pairs(db).values() {
        for definition in definitions {
            *origins.entry(*definition).or_default() += 1;
        }
    }
    for (definition, count) in origins {
        if count > 1 && definition.program_file(db) == program {
            report(
                definition.kind(db).target_range(&parsed),
                "A provider declaration cannot describe distinct source providers".into(),
            );
        }
    }
    diagnostics
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum BindingSource {
    Build,
    Module,
}

impl BindingSource {
    fn from_file(file: File) -> Option<Self> {
        match (file.dialect, file.api_context()) {
            (Dialect::Bazel, Some(APIContext::Build)) => Some(Self::Build),
            (Dialect::Bazel, Some(APIContext::Module)) => Some(Self::Module),
            _ => None,
        }
    }

    fn metadata(self) -> (&'static str, &'static LintMetadata) {
        match self {
            Self::Build => ("BUILD", &super::diagnostics::INVALID_BUILD_ANNOTATION),
            Self::Module => (
                "MODULE.bazel",
                &super::diagnostics::INVALID_MODULE_ANNOTATION,
            ),
        }
    }
}

/// Binding correspondence must be available while ty indexes source bindings,
/// before semantic inference can run.
#[derive(Debug, PartialEq, Eq)]
struct BindingAnnotations {
    kind: BindingSource,
    interface: File,
    owners: FxHashMap<NodeIndex, NodeIndex>,
    errors: Vec<(TextRange, String)>,
}

fn binding_annotations(db: &dyn Db, file: File) -> Option<&BindingAnnotations> {
    BindingSource::from_file(file)?;
    binding_annotations_query(db, file.source, (file.dialect, file.info)).as_ref()
}

#[salsa::tracked(returns(ref))]
fn binding_annotations_query(
    db: &dyn Db,
    source: ruff_db::files::File,
    context: (Dialect, Option<FileInfo>),
) -> Option<BindingAnnotations> {
    let (dialect, info) = context;
    let file = File {
        source,
        dialect,
        info,
    };
    let &(implementation, interface) = db.environment().type_interfaces(db).get(&source)?;
    if implementation != file {
        return None;
    }
    let kind = BindingSource::from_file(file)?;
    let parsed = starpls_common::parsed_module(db, file).load(db);
    let source_names = module_bindings(db, file);
    let stub_names = module_bindings(db, interface);
    let candidates = direct_module_assignments(parsed.suite());
    let mut result = BindingAnnotations {
        kind,
        interface,
        owners: FxHashMap::default(),
        errors: Vec::new(),
    };
    let (label, _) = kind.metadata();
    let stub = starpls_common::parsed_module(db, interface).load(db);
    for statement in stub.suite() {
        let annotation = match statement {
            Stmt::AnnAssign(annotation) => annotation,
            Stmt::FunctionDef(function) => {
                result.errors.push((
                    function.name.range(),
                    format!(
                        "Function declaration `{}` cannot annotate a {label} binding",
                        function.name.id,
                    ),
                ));
                continue;
            }
            _ => continue,
        };
        let Expr::Name(name) = annotation.target.as_ref() else {
            continue;
        };
        let error = if stub_names.get(&name.id) != Some(&1) {
            Some("the stub binds this name more than once".to_owned())
        } else {
            match source_names.get(&name.id).copied().unwrap_or(0) {
                0 => Some(format!("the {label} file does not bind this name")),
                1 => {
                    if let Some(&owner) = candidates.get(&name.id) {
                        result.owners.insert(owner, annotation.node_index().load());
                        None
                    } else {
                        Some(format!(
                            "the {label} binding must be a direct assignment to a name"
                        ))
                    }
                }
                _ => Some(format!("the {label} file binds this name more than once")),
            }
        };
        if let Some(error) = error {
            result.errors.push((
                name.range(),
                format!(
                    "Cannot apply annotation for `{}` to `{}`: {error}",
                    name.id,
                    file.path(db).display(),
                ),
            ));
        }
    }
    Some(result)
}

fn direct_module_assignments(statements: &[Stmt]) -> FxHashMap<&Name, NodeIndex> {
    statements
        .iter()
        .filter_map(|statement| {
            let target = match statement {
                Stmt::Assign(assignment) => {
                    let [target] = assignment.targets.as_slice() else {
                        return None;
                    };
                    target
                }
                Stmt::AnnAssign(assignment) => &assignment.target,
                _ => return None,
            };
            let Expr::Name(name) = target else {
                return None;
            };
            Some((&name.id, name.node_index().load()))
        })
        .collect()
}

fn module_bindings(db: &dyn Db, file: File) -> FxHashMap<Name, usize> {
    #[derive(Default)]
    struct Bindings(FxHashMap<Name, usize>);
    impl Bindings {
        fn name(&mut self, name: &Name) {
            let Self(bindings) = self;
            *bindings.entry(name.clone()).or_default() += 1;
        }
        fn target(&mut self, target: &Expr) {
            match target {
                Expr::Name(name) => self.name(&name.id),
                Expr::Tuple(tuple) => tuple.elts.iter().for_each(|target| self.target(target)),
                Expr::List(list) => list.elts.iter().for_each(|target| self.target(target)),
                Expr::Starred(starred) => self.target(&starred.value),
                _ => {}
            }
        }
    }
    impl<'a> StatementVisitor<'a> for Bindings {
        fn visit_stmt(&mut self, statement: &'a Stmt) {
            match statement {
                Stmt::FunctionDef(function) => {
                    self.name(&function.name.id);
                    return;
                }
                Stmt::ClassDef(class) => {
                    self.name(&class.name.id);
                    return;
                }
                Stmt::Assign(assignment) => assignment
                    .targets
                    .iter()
                    .for_each(|target| self.target(target)),
                Stmt::AnnAssign(assignment) => self.target(&assignment.target),
                Stmt::TypeAlias(alias) => self.target(&alias.name),
                Stmt::AugAssign(assignment) => self.target(&assignment.target),
                Stmt::For(statement) => self.target(&statement.target),
                _ => {}
            }
            statement_visitor::walk_stmt(self, statement);
        }
    }
    let mut bindings = Bindings::default();
    let parsed = starpls_common::parsed_module(db, file).load(db);
    bindings.visit_body(parsed.suite());
    for statement in super::load::statements(db, file) {
        for binding in statement.bindings {
            bindings.name(&binding.name);
        }
    }
    let Bindings(names) = bindings;
    names
}

pub(super) fn binding_annotation<'db>(
    db: &'db Database,
    file: File,
    owner: NodeIndex,
) -> Option<ty_python_core::ProvidedAnnotation<'db>> {
    let BindingAnnotations {
        kind: _,
        interface,
        owners,
        errors: _,
    } = binding_annotations(db, file)?;
    let &owner = owners.get(&owner)?;
    Some(ty_python_core::ProvidedAnnotation::External {
        file: db.starlark_program_file(*interface),
        owner,
    })
}

pub(super) fn used_binding_annotations(db: &Database, file: File) -> FxHashSet<TextRange> {
    if !file.is_type_interface(db) {
        return FxHashSet::default();
    }
    let parsed = starpls_common::parsed_module(db, file).load(db);
    let mut used = FxHashSet::default();
    for (source, interface) in db.environment().type_interfaces(db).values() {
        if *interface != file {
            continue;
        }
        let Some(BindingAnnotations {
            kind: _,
            interface: _,
            owners,
            errors: _,
        }) = binding_annotations(db, *source)
        else {
            continue;
        };
        for owner in owners.values() {
            let ruff_python_ast::AnyRootNodeRef::Stmt(statement) = parsed.get_by_index(*owner)
            else {
                unreachable!("binding annotations refer to stub statements");
            };
            let Stmt::AnnAssign(annotation) = statement else {
                unreachable!("binding annotations refer to annotated assignments");
            };
            used.insert(annotation.target.range());
        }
    }
    used
}

impl Analysis {
    /// While registrations are incomplete an invalid explicit override cannot fall back
    /// to an otherwise valid sibling.
    pub fn invalidate_type_interfaces(&mut self) {
        let Self { db } = self;
        db.environment()
            .set_type_interfaces(db)
            .to(FxHashMap::default());
        db.environment()
            .set_interface_configuration_ready(db)
            .to(false);
    }

    /// Replace the explicit trusted contracts atomically after validating every mapping.
    pub fn set_type_interfaces(
        &mut self,
        interfaces: impl IntoIterator<Item = (File, File)>,
    ) -> anyhow::Result<()> {
        let Self { db } = self;
        let mut mappings = FxHashMap::default();
        for (source, interface) in interfaces {
            let is_bzl = source.allows_native_annotations(db)
                && source
                    .path(db)
                    .extension()
                    .is_some_and(|extension| extension == "bzl");
            if !is_bzl && BindingSource::from_file(source).is_none() {
                anyhow::bail!(
                    "type interface source must be a .bzl, BUILD, or MODULE.bazel file: {}",
                    source.path(db).display()
                );
            }
            if !interface.is_type_interface(db) {
                anyhow::bail!(
                    "type interface must be a .bzli file: {}",
                    interface.path(db).display()
                );
            }
            match mappings.entry(source.source) {
                Entry::Vacant(entry) => {
                    entry.insert((source, interface));
                }
                Entry::Occupied(entry) => {
                    let (source, previous): &(File, File) = entry.get();
                    anyhow::bail!(
                        "duplicate type interface for {}: {} and {}",
                        source.path(db).display(),
                        previous.path(db).display(),
                        interface.path(db).display()
                    );
                }
            }
        }
        db.environment().set_type_interfaces(db).to(mappings);
        db.environment()
            .set_interface_configuration_ready(db)
            .to(true);
        Ok(())
    }

    /// Physical implementations and their registered type interfaces.
    pub fn type_interface_pairs(&self) -> Vec<(File, File)> {
        let Self { db } = self;
        db.environment()
            .type_interfaces(db)
            .values()
            .copied()
            .collect()
    }

    /// Physical inputs whose declarations may be referenced by trusted interfaces.
    pub fn type_interface_sources(&self) -> Vec<File> {
        let Self { db } = self;
        db.environment()
            .type_interfaces(db)
            .values()
            .map(|(source, _)| *source)
            .collect()
    }

    /// Configured declaration files, including the Bazel host contract.
    pub fn type_interface_files(&self) -> Vec<File> {
        let Self { db } = self;
        let mut files: Vec<_> = db
            .environment()
            .type_interfaces(db)
            .values()
            .map(|(_, interface)| *interface)
            .chain(self.bazel_builtin_extension_file())
            .collect();
        files.sort_by(|left, right| left.path(db).cmp(right.path(db)));
        files.dedup();
        files
    }
}

impl Database {
    /// Pair by a unique source call, including aliases, without inferring its result.
    pub(super) fn provider_interface<'db>(
        &'db self,
        source: ProgramFile<'db>,
        call: NodeIndex,
    ) -> Option<Type<'db>> {
        let [definition] = provider_pairs(self)
            .get(&(source, call.as_u32()?))?
            .as_slice()
        else {
            return None;
        };
        Some(SemanticModel::new(self, definition.program_file(self)).definition_type(*definition))
    }

    pub(crate) fn type_interface(&self, from: File, source: File) -> Option<File> {
        let (implementation, interface) = pair_for_source(self, source)?;
        if implementation.api_context() == Some(APIContext::Build) {
            return None;
        }
        // An interface may import the implementation's existing nominal providers.
        // It must not resolve that import back to its own declaration of the name.
        (interface.source != from.source).then_some(interface)
    }

    pub(crate) fn load_export_file<'db>(
        &'db self,
        from: File,
        source: File,
        name: &str,
    ) -> ProgramFile<'db> {
        if let Some(interface) = self.type_interface(from, source) {
            let file = self.starlark_program_file(interface);
            if !export_definitions(self, file, name).is_empty() {
                return file;
            }
        }
        self.starlark_program_file(source)
    }

    /// Navigation may find an implementation even when its signature is incompatible.
    /// This lookup never participates in selecting or inferring the trusted contract.
    pub(crate) fn interface_implementation<'db>(
        &'db self,
        definition: Definition<'db>,
    ) -> Vec<Definition<'db>> {
        let Some((from, module, name)) = super::load::binding_names(self, definition) else {
            return Vec::new();
        };
        let Ok(Some(source)) = starpls_common::Db::load_file(self, &module, from.dialect, from)
        else {
            return Vec::new();
        };
        let source_file = self.starlark_program_file(source);
        if self.load_export_file(from, source, &name) == source_file {
            return Vec::new();
        }
        export_definitions(self, source_file, &name)
    }
}

/// Correspondence is syntax and binding provenance; type inference begins after selection.
#[salsa::tracked(returns(ref))]
pub(super) fn provider_pairs(
    db: &dyn Db,
) -> FxHashMap<(ProgramFile<'_>, u32), Vec<Definition<'_>>> {
    let mut pairs: FxHashMap<_, Vec<_>> = FxHashMap::default();
    for (implementation, interface) in db.environment().type_interfaces(db).values() {
        if implementation.api_context() == Some(APIContext::Build) {
            continue;
        }
        let file = db.starlark_program_file(*interface);
        for symbol in place_table(db, global_scope(db, file)).symbols() {
            let definitions = export_definitions(db, file, symbol.name());
            let [definition] = definitions.as_slice() else {
                continue;
            };
            let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
            let provider = match definition.kind(db) {
                DefinitionKind::Class(class) => is_provider_class(class.node(&parsed)),
                DefinitionKind::Function(_) => super::providers::is_declaration(db, *definition),
                _ => false,
            };
            if !provider {
                continue;
            }
            let implementations =
                export_definitions(db, db.starlark_program_file(*implementation), symbol.name());
            let [implementation] = implementations.as_slice() else {
                continue;
            };
            let Some(origin) = provider_origin(db, *implementation, &mut FxHashSet::default())
            else {
                continue;
            };
            let definitions = pairs.entry(origin).or_default();
            if !definitions.contains(definition) {
                definitions.push(*definition);
            }
        }
    }
    pairs
}

/// Finite storage declared by an unshadowed native provider without an initializer.
#[salsa::tracked(returns(clone))]
pub(super) fn plain_provider_schema<'db>(
    db: &'db dyn Db,
    definition: Definition<'db>,
) -> Option<Box<[Name]>> {
    let DefinitionKind::Class(class) = definition.kind(db) else {
        return None;
    };
    let declaration = ruff_db::parsed::parsed_module(db, definition.python_file(db)).load(db);
    if class.node(&declaration).type_params.is_some() {
        return None;
    }
    let mut origins = provider_pairs(db)
        .iter()
        .filter(|(_, definitions)| definitions.as_slice() == [definition])
        .map(|(origin, _)| *origin);
    let (file, node) = origins.next()?;
    if origins.next().is_some() {
        return None;
    }
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let ruff_python_ast::AnyRootNodeRef::Expr(Expr::Call(call)) =
        parsed.get_by_index(NodeIndex::from(node))
    else {
        return None;
    };
    native_provider_definition(db, file, call)?;
    if !call.arguments.args.is_empty() {
        return None;
    }
    let mut fields = None;
    for keyword in &call.arguments.keywords {
        match keyword.arg.as_ref()?.as_str() {
            "fields" => {
                if fields.is_some() {
                    return None;
                }
                let elements: Vec<_> = match &keyword.value {
                    Expr::List(list) => list.elts.iter().collect(),
                    Expr::Tuple(tuple) => tuple.elts.iter().collect(),
                    Expr::Dict(dict) => dict
                        .items
                        .iter()
                        .map(|item| item.key.as_ref())
                        .collect::<Option<_>>()?,
                    _ => return None,
                };
                fields = Some(
                    elements
                        .into_iter()
                        .map(|element| {
                            let Expr::StringLiteral(literal) = element else {
                                return None;
                            };
                            Some(Name::new(literal.value.to_str()))
                        })
                        .collect::<Option<Box<[_]>>>()?,
                );
            }
            "init" => {
                if !matches!(keyword.value, Expr::NoneLiteral(_)) {
                    return None;
                }
            }
            "doc" => {}
            _ => return None,
        }
    }
    fields
}

fn native_provider_definition<'db>(
    db: &'db dyn Db,
    file: ProgramFile<'db>,
    call: &ruff_python_ast::ExprCall,
) -> Option<Definition<'db>> {
    let Expr::Name(callee) = call.func.as_ref() else {
        return None;
    };
    let scope = global_scope(db, file);
    let expression_scope =
        semantic_index(db, file).try_expression_scope_id(&ruff_python_ast::ExprRef::from(call))?;
    if expression_scope != scope.file_scope_id(db)
        || place_table(db, scope)
            .symbol_by_name(&callee.id)
            .is_some_and(|symbol| symbol.is_bound() || symbol.is_declared())
    {
        return None;
    }
    let model = SemanticModel::new(db, file);
    let callee = model.builtin_type(
        &callee.id,
        ty_python_semantic::provided::BuiltinUsage::Runtime,
    )?;
    let definition = callee.definition(db, &model.program_environment())?;
    let TypeDefinition::Function(callee) = definition else {
        return None;
    };
    let native = super::factory::declaration(db, callee)?;
    matches!(native, super::factory::BuiltinFunction::Provider).then_some(callee)
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum ConstructorRole {
    Public,
    Raw,
}

/// Only native raw constructors store their supplied inputs directly.
#[salsa::tracked(returns(copy))]
pub(super) fn storage_constructor_declaration<'db>(
    db: &'db dyn Db,
    definition: Definition<'db>,
) -> Option<Definition<'db>> {
    let (file, node, role) = constructor_origin(db, definition, &mut FxHashSet::default())?;
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let ruff_python_ast::AnyRootNodeRef::Expr(expression) =
        parsed.get_by_index(NodeIndex::from(node))
    else {
        return None;
    };
    let Expr::Call(call) = expression else {
        return None;
    };
    native_provider_definition(db, file, call)?;
    // Dynamic factory arguments cannot establish which callable was returned.
    if call.arguments.args.len() > 1
        || call
            .arguments
            .args
            .iter()
            .any(|argument| matches!(argument, Expr::Starred(_)))
    {
        return None;
    }
    let mut keywords = FxHashSet::default();
    for keyword in &call.arguments.keywords {
        let name = keyword.arg.as_ref()?;
        if !matches!(name.as_str(), "doc" | "fields" | "init") {
            return None;
        }
        if !keywords.insert(name.as_str()) {
            return None;
        }
    }
    let initializer = call.arguments.find_keyword("init");
    match role {
        ConstructorRole::Public => {
            if initializer
                .is_some_and(|initializer| !matches!(initializer.value, Expr::NoneLiteral(_)))
            {
                return None;
            }
        }
        ConstructorRole::Raw => {
            let initializer = initializer?;
            super::providers::resolve_function(
                db,
                file,
                &initializer.value,
                &mut FxHashSet::default(),
            )?;
        }
    }
    let declarations = provider_pairs(db).get(&(file, node))?;
    let [declaration] = declarations.as_slice() else {
        return None;
    };
    super::providers::is_declaration(db, *declaration).then_some(*declaration)
}

fn provider_origin<'db>(
    db: &'db dyn Db,
    definition: Definition<'db>,
    visited: &mut FxHashSet<Definition<'db>>,
) -> Option<(ProgramFile<'db>, u32)> {
    let (file, node, role) = constructor_origin(db, definition, visited)?;
    (role == ConstructorRole::Public).then_some((file, node))
}

fn constructor_origin<'db>(
    db: &'db dyn Db,
    definition: Definition<'db>,
    visited: &mut FxHashSet<Definition<'db>>,
) -> Option<(ProgramFile<'db>, u32, ConstructorRole)> {
    if !visited.insert(definition) {
        return None;
    }
    let file = definition.program_file(db);
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    match definition.kind(db) {
        DefinitionKind::Assignment(assignment) => match assignment.value(&parsed) {
            Expr::Call(call) => {
                let role = if assignment.unpack().is_some() {
                    let node = ruff_python_ast::find_node::covering_node(
                        parsed.syntax().into(),
                        call.range(),
                    );
                    let ruff_python_ast::AnyNodeRef::StmtAssign(parent) = node.parent()? else {
                        return None;
                    };
                    let [Expr::Tuple(tuple)] = parent.targets.as_slice() else {
                        return None;
                    };
                    let [constructor, raw] = tuple.elts.as_slice() else {
                        return None;
                    };
                    let target = assignment.target(&parsed).range();
                    if constructor.range() == target {
                        ConstructorRole::Public
                    } else if raw.range() == target {
                        ConstructorRole::Raw
                    } else {
                        return None;
                    }
                } else {
                    ConstructorRole::Public
                };
                Some((file, call.node_index().load().as_u32()?, role))
            }
            Expr::Name(name) => {
                let model = SemanticModel::new(db, file);
                let definitions = definitions_for_name(
                    &model,
                    &name.id,
                    name.into(),
                    ImportAliasResolution::PreserveAliases,
                );
                let [definition] = definitions.as_slice() else {
                    return None;
                };
                constructor_origin(db, definition.definition()?, visited)
            }
            _ => None,
        },
        DefinitionKind::ProvidedBinding(_) => {
            let (from, module, name) = super::load::binding_names(db, definition)?;
            let source = starpls_common::Db::load_file(db, &module, from.dialect, from).ok()??;
            let definitions = export_definitions(db, db.starlark_program_file(source), &name);
            let [definition] = definitions.as_slice() else {
                return None;
            };
            constructor_origin(db, *definition, visited)
        }
        _ => None,
    }
}

/// Read annotation types and origins from Ty's class scope, including recursive fields.
pub(super) fn provider_fields<'db>(
    db: &'db Database,
    class: Type<'db>,
    environment: &ProgramEnvironment<'db>,
) -> Option<Vec<ProvidedField<'db>>> {
    if let Some(fields) = super::providers::constructor_fields(db, class, environment) {
        return Some(fields);
    }
    let definition = provider_definition(db, class, environment)?;
    let DefinitionKind::Class(class) = definition.kind(db) else {
        return None;
    };
    let file = definition.program_file(db);
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let class = class.node(&parsed);
    let index = ty_python_core::semantic_index(db, file);
    let scope = index
        .node_scope(ty_python_core::scope::NodeWithScopeRef::Class(class))
        .to_scope_id(db, file);
    let members: Vec<_> = all_end_of_scope_members(db, scope).collect();
    let mut fields = Vec::new();
    for statement in &class.body {
        let Stmt::AnnAssign(assignment) = statement else {
            continue;
        };
        let name = assignment.target.as_name_expr()?;
        let member = members
            .iter()
            .find(|member| member.member.name == name.id)?;
        fields.push(ProvidedField {
            name: name.id.clone(),
            ty: member.member.ty,
            is_required: true,
            source: Some(FileRange::new(file.file(db), name.range())),
        });
    }
    Some(fields)
}

// Provider correspondence must remain independent of type inference: source
// provider inference asks for this correspondence before constructing its type.
fn is_provider_class(class: &StmtClassDef) -> bool {
    class
        .arguments
        .as_ref()
        .is_none_or(|arguments| arguments.is_empty())
}

pub(super) fn provider_definition<'db>(
    db: &'db dyn Db,
    ty: Type<'db>,
    environment: &ProgramEnvironment<'db>,
) -> Option<Definition<'db>> {
    let TypeDefinition::StaticClass(definition) = ty.definition(db, environment)? else {
        return None;
    };
    let DefinitionKind::Class(class) = definition.kind(db) else {
        return None;
    };
    let parsed = ruff_db::parsed::parsed_module(db, definition.python_file(db)).load(db);
    is_provider_class(class.node(&parsed)).then_some(definition)
}

/// Function and value contracts describe existing implementation bindings.
pub(super) fn is_implementation_contract<'db>(
    db: &'db dyn Db,
    declaration: Definition<'db>,
    implementation: ProgramFile<'db>,
) -> bool {
    let ScopedPlaceId::Symbol(symbol) = declaration.place(db) else {
        return false;
    };
    let table = place_table(db, declaration.scope(db));
    if export_definitions(db, implementation, table.symbol(symbol).name()).is_empty() {
        return false;
    }
    match declaration.kind(db) {
        DefinitionKind::Function(_) => true,
        DefinitionKind::AnnotatedAssignment(_) => {
            let program = declaration.program_file(db);
            declaration.scope(db) == global_scope(db, program)
                && !SemanticModel::new(db, program).is_type_alias_definition(declaration)
        }
        _ => false,
    }
}

pub(crate) fn export_definitions<'db>(
    db: &'db dyn Db,
    file: ProgramFile<'db>,
    name: &str,
) -> Vec<Definition<'db>> {
    let scope = global_scope(db, file);
    let Some(symbol) = place_table(db, scope).symbol_id(name) else {
        return Vec::new();
    };
    use_def_map(db, scope)
        .end_of_scope_symbol_bindings(symbol)
        .filter_map(|binding| binding.binding.definition())
        .filter(|definition| !matches!(definition.kind(db), DefinitionKind::ProvidedBinding(_)))
        .collect()
}

pub(crate) fn parameter_pairs<'a>(
    source: &'a StmtFunctionDef,
    stub: &'a StmtFunctionDef,
) -> Result<Vec<(&'a Parameter, &'a Parameter)>, &'static str> {
    let source = &source.parameters;
    let stub = &stub.parameters;
    if source.posonlyargs.len() != stub.posonlyargs.len()
        || source.args.len() != stub.args.len()
        || source.kwonlyargs.len() != stub.kwonlyargs.len()
        || source.vararg.is_some() != stub.vararg.is_some()
        || source.kwarg.is_some() != stub.kwarg.is_some()
    {
        return Err("parameter layouts differ");
    }
    let mut pairs: Vec<_> = source
        .posonlyargs
        .iter()
        .chain(&source.args)
        .zip(stub.posonlyargs.iter().chain(stub.args.iter()))
        .map(|(source, stub)| (&source.parameter, &stub.parameter))
        .collect();
    for parameter in &source.kwonlyargs {
        let Some(annotation) = stub
            .kwonlyargs
            .iter()
            .find(|stub| stub.parameter.name.id == parameter.parameter.name.id)
        else {
            return Err("keyword-only parameter names differ");
        };
        pairs.push((&parameter.parameter, &annotation.parameter));
    }
    if let (Some(source), Some(stub)) = (&source.vararg, &stub.vararg) {
        pairs.push((source, stub));
    }
    if let (Some(source), Some(stub)) = (&source.kwarg, &stub.kwarg) {
        pairs.push((source, stub));
    }
    Ok(pairs)
}

#[cfg(test)]
mod tests {
    use starpls_bazel::APIContext;
    use starpls_common::Dialect;
    use starpls_common::FileInfo;
    use starpls_hir::Fixture;

    use crate::Analysis;
    use crate::FilePosition;
    use crate::LocationLink;

    #[test]
    #[cfg(unix)]
    fn registered_interface_aliases_share_declaration_usage() {
        let root = std::path::PathBuf::from(std::env::var_os("TEST_TMPDIR").unwrap())
            .join("interface-declaration-usage");
        std::fs::create_dir_all(&root).unwrap();
        let source_path = root.join("source.bzl");
        let authored_path = root.join("authored.bzli");
        let installed_path = root.join("installed.bzli");
        let copied_path = root.join("copied.bzli");
        std::fs::write(&source_path, "_VALUE = 1\nvalue = _VALUE\n").unwrap();
        for path in [&authored_path, &copied_path] {
            std::fs::write(path, "_VALUE: int\n").unwrap();
        }
        std::os::unix::fs::symlink(&authored_path, &installed_path).unwrap();
        let mut analysis = Analysis::new(
            std::sync::Arc::new(crate::SimpleFileLoader::default()),
            Default::default(),
        )
        .unwrap();
        analysis
            .set_builtin_defs(Default::default(), Default::default())
            .unwrap();
        let source = analysis.file(&source_path, Dialect::Bazel, None).unwrap();
        let authored = analysis.file(&authored_path, Dialect::Bazel, None).unwrap();
        let installed = analysis
            .file(&installed_path, Dialect::Bazel, None)
            .unwrap();
        let copied = analysis.file(&copied_path, Dialect::Bazel, None).unwrap();
        assert_ne!(authored.source, installed.source);
        analysis.set_type_interfaces([(source, installed)]).unwrap();
        let assert_usage = |analysis: &Analysis, file, used| {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let names: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            let expected = if used {
                vec![]
            } else {
                vec!["unused-definition"]
            };
            assert_eq!(names, expected, "{diagnostics:?}");
        };
        assert_usage(&analysis, authored, true);
        assert_usage(&analysis, installed, true);
        // Equal contents alone do not associate an interface with a source.
        assert_usage(&analysis, copied, false);
        analysis.set_type_interfaces([]).unwrap();
        assert_usage(&analysis, authored, false);
        analysis.set_type_interfaces([(source, installed)]).unwrap();
        assert_usage(&analysis, authored, true);
        assert_usage(&analysis, installed, true);
        assert_usage(&analysis, copied, false);
        // A repository refresh transfers usage to the new symlink target.
        std::fs::remove_file(&installed_path).unwrap();
        std::os::unix::fs::symlink(&copied_path, &installed_path).unwrap();
        analysis.sync_files(&[installed_path]).unwrap();
        assert_usage(&analysis, authored, false);
        assert_usage(&analysis, copied, true);
        std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn function_stubs_check_bodies_and_follow_edits() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "def convert(value):\n    return value + 1\n",
        );
        let stub = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "def convert(value: str) -> str: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "unsupported-operator"),
            "{diagnostics:?}"
        );
        analysis.update_file(stub, "def convert(value: int) -> int: ...\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            source,
            "def convert(value):\n    value = str(value)\n    return value\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"),
            "{diagnostics:?}"
        );
        assert!(
            !diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-assignment"),
            "{diagnostics:?}"
        );
        analysis.update_file(stub, "def convert(value: int) -> str: ...\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_type_interfaces([]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            source,
            "def convert(*, count, text):\n    return text.upper() if count > 0 else ''\n".into(),
        );
        analysis.update_file(
            stub,
            "def convert(*, text: str, count: int) -> str: ...\n".into(),
        );
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn function_stubs_preserve_source_annotations_and_defaults() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "source.bzl", "");
        let stub = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "def convert(value: str = ...) -> str: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for (text, expected) in [
            ("def convert(value=None):\n    if value == None:\n        value = ''\n    return value\n", None),
            ("def convert(value=None):\n    return value\n", Some("invalid-return-type")),
            ("def convert(value):\n    return value\n", Some("invalid-function-interface")),
            ("def convert(value: int = 0) -> int:\n    return value + 1\n", Some("invalid-function-interface")),
            ("def convert(value=0):\n    # type: (int) -> int\n    return value + 1\n", Some("invalid-function-interface")),
        ] {
            analysis.update_file(source, text.into());
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            if let Some(expected) = expected {
                assert!(diagnostics.iter().any(|diagnostic| diagnostic.id().as_str() == expected), "{text}: {diagnostics:?}");
            } else {
                assert!(diagnostics.is_empty(), "{text}: {diagnostics:?}");
            }
            assert!(!diagnostics.iter().any(|diagnostic| diagnostic.id().as_str() == "unsupported-operator"), "{text}: {diagnostics:?}");
        }
    }

    #[test]
    fn function_stubs_keep_donor_generic_and_load_scopes() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        fixture.add_file(&mut analysis.db, "types.bzli", "type Value = str\n");
        let source_text = "Value = int\ndef identity(value):\n    copied = value # type: T\n    return copied\ndef upper(value):\n    return value.upper()\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", source_text);
        let stub = fixture.add_file(&mut analysis.db, "source.bzli", "load('types.bzli', 'Value')\ndef identity[T](value: T) -> T: ...\ndef upper(value: Value) -> Value: ...\n");
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(source, source_text.replace("copied = value", "copied = 42"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-assignment"),
            "{diagnostics:?}"
        );
        analysis.update_file(source, "Value = int\ndef identity(value):\n    return 1\ndef upper(value):\n    return value.upper()\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"),
            "{diagnostics:?}"
        );
        analysis.update_file(source, "Value = int\ndef identity(value: object) -> object:\n    return value\ndef upper(value):\n    return value.upper()\n".into());
        analysis.update_file(stub, "load('types.bzli', 'Value')\ndef identity[T](value: T) -> object: ...\ndef upper(value: Value) -> Value: ...\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(source, "def collect():\n    return ['bad']\n".into());
        analysis.update_file(
            stub,
            "type record[T] = list[T]\ndef collect() -> record[int]: ...\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn source_annotations_use_the_paired_stub_namespace() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let types_text = "type Entry = str\n";
        let types = fixture.add_file(&mut analysis.db, "types.bzli", types_text);
        let source_text = "def collect(value):\n    values = [value] # type: list[_Entry]\n    values.append('ok')\n    return values\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", source_text);
        let stub = fixture.add_file(
            &mut analysis.db,
            "contract.bzli",
            "load('types.bzli', _Entry='Entry')\ndef collect(value: _Entry) -> list[_Entry]: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        let locations = analysis
            .snapshot()
            .goto_definition(
                FilePosition {
                    file_id: source,
                    pos: (source_text.find("_Entry").unwrap() as u32).into(),
                },
                false,
            )
            .unwrap()
            .unwrap();
        let [LocationLink::Local {
            target_file_id,
            target_selection_range,
            origin_selection_range: _,
            target_range: _,
        }] = locations.as_slice()
        else {
            panic!("{locations:?}");
        };
        assert_eq!(*target_file_id, types.source);
        assert_eq!(&types_text[*target_selection_range], "Entry");

        analysis.update_file(source, source_text.replace("append('ok')", "append(42)"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"),
            "{diagnostics:?}"
        );
        analysis.update_file(types, "type Entry = int\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_type_interfaces([]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "unresolved-reference"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn paired_stub_names_preserve_source_scope_and_runtime_names() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "source.bzl", "");
        let stub = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "type _Entry = str\ndef collect(value: _Entry) -> object: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for (text, expected) in [
            ("_Entry = int\ndef collect(value):\n    values = [value] # type: list[_Entry]\n    return values\n", "invalid-assignment"),
            ("def collect(value):\n    _Entry = 42\n    values = [value] # type: list[_Entry]\n    return values\n", "invalid-type-form"),
            ("def collect(value):\n    return _Entry\n", "unresolved-reference"),
        ] {
            analysis.update_file(source, text.into());
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(diagnostics.iter().any(|diagnostic| diagnostic.id().as_str() == expected), "{text}: {diagnostics:?}");
        }
        analysis.update_file(
            stub,
            "type _Entry = str\ndef collect(value: _Entry, _Entry: int) -> object: ...\n".into(),
        );
        analysis.update_file(source, "def collect(value, _Entry):\n    values = [value] # type: list[_Entry]\n    return values\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-type-form"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn function_stubs_report_unsupported_correspondence() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "source.bzl", "");
        let stub = fixture.add_file(&mut analysis.db, "source.bzli", "");
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for (text, contract) in [
            ("def identity(value): return value\n", "@overload\ndef identity(value: int) -> int: ...\n@overload\ndef identity(value: str) -> str: ...\n"),
            ("def identity(value, other): return value + other\n", "def identity(value: int) -> int: ...\n"),
            ("def identity(other): return other\n", "def identity(value: int) -> int: ...\n"),
            ("def identity(value: int): return value\n", "def identity[T](value: T) -> T: ...\n"),
            ("def identity(value): return value\n", "def identity[T](value) -> T: ...\n"),
        ] {
            analysis.update_file(source, text.into());
            analysis.update_file(stub, contract.into());
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(diagnostics.iter().any(|diagnostic| diagnostic.id().as_str() == "invalid-function-interface"), "{text} {contract}: {diagnostics:?}");
        }
    }

    #[test]
    fn function_stubs_check_overload_implementations() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let body = "def rewrite(value, rewrite_label):\n    return value\nlocal: str = rewrite('value', lambda label: label)\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", body);
        let overloads = r#"
type Value = str | list[str] | dict[str, str] | tuple[str, ...]
@overload
def rewrite(value: str, rewrite_label: Callable[[str], str]) -> str: ...
@overload
def rewrite(value: list[str], rewrite_label: Callable[[str], str]) -> list[str]: ...
@overload
def rewrite(value: dict[str, str], rewrite_label: Callable[[str], str]) -> dict[str, str]: ...
"#;
        let implementation =
            "def rewrite(value: Value, rewrite_label: Callable[[str], str]) -> Value: ...\n";
        let contract = format!("{overloads}{implementation}");
        let stub = fixture.add_file(&mut analysis.db, "source.bzli", &contract);
        let calls = r#"load("source.bzl", "rewrite")
text: str = rewrite("value", lambda label: label)
items: list[str] = rewrite(["value"], lambda label: label)
fields: dict[str, str] = rewrite({"key": "value"}, lambda label: label)
"#;
        let caller = fixture.add_file(&mut analysis.db, "caller.bzl", calls);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for file in [source, stub, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        // The broader implementation accepts tuples, but it is not a public overload.
        analysis.update_file(
            caller,
            format!("{calls}rewrite(('value',), lambda label: label)\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "no-matching-overload");
        analysis.update_file(
            source,
            format!("{body}rewrite(('value',), lambda label: label)\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "no-matching-overload");

        analysis.update_file(
            source,
            "def rewrite(value, rewrite_label):\n    return 42\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-return-type");

        for body in [
            "def rewrite(value: int, rewrite_label: Callable[[str], str]) -> int:\n    return value\n",
            "def rewrite(value, rewrite_label):\n    # type: (int, object) -> int\n    return value\n",
            "def rewrite(other, rewrite_label):\n    return other\n",
        ] {
            analysis.update_file(source, body.into());
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-function-interface");
        }
        analysis.update_file(source, body.into());
        analysis.update_file(
            stub,
            format!("{overloads}def rewrite(value: Value, rewrite_label: Callable[[str], str] = ...) -> Value: ...\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-function-interface");
        // Ty owns both parameter coverage and return compatibility for the donor family.
        for implementation in [
            "def rewrite(value: str, rewrite_label: Callable[[str], str]) -> Value: ...\n",
            "def rewrite(value: Value, rewrite_label: Callable[[str], str]) -> str: ...\n",
        ] {
            analysis.update_file(stub, format!("{overloads}{implementation}"));
            let diagnostics = analysis.snapshot().diagnostics(stub).unwrap();
            assert!(!diagnostics.is_empty());
            assert!(
                diagnostics
                    .iter()
                    .all(|diagnostic| diagnostic.id().as_str() == "invalid-overload"),
                "{diagnostics:?}"
            );
        }
    }

    #[test]
    fn function_stubs_check_overload_return_branches() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let body = "def choose(*, text: bool) -> str | int:\n    if text:\n        return 'value'\n    return 42\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", body);
        let stub = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            r#"
@overload
def choose(*, text: Literal[True]) -> str: ...
@overload
def choose(*, text: Literal[False]) -> int: ...
def choose(*, text: bool) -> str | int: ...
"#,
        );
        let caller = fixture.add_file(
            &mut analysis.db,
            "caller.bzl",
            "load('source.bzl', 'choose')\ntext: str = choose(text=True)\nnumber: int = choose(text=False)\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for file in [source, stub, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }

        // Both results satisfy the broad signature, but only one satisfies this branch.
        let incorrect = body.replace("return 'value'", "return 42");
        analysis.update_file(source, incorrect.clone());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-return-type");
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        analysis.update_file(
            source,
            incorrect.replacen(
                "return 42",
                "return 42  # ty: ignore[invalid-return-type]",
                1,
            ),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        analysis.update_file(
            source,
            body.replace(
                "return 'value'",
                "return 'value'  # ty: ignore[invalid-return-type]",
            ),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "unused-ignore-comment");
    }

    #[test]
    fn function_stubs_check_overloads_using_native_glob() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        let body = "def choose(files):\n    if files:\n        return native.glob(['*.py'])\n    return 42\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", body);
        let stub = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "@overload\ndef choose(files: Literal[True]) -> list[str]: ...\n@overload\ndef choose(files: Literal[False]) -> int: ...\ndef choose(files: bool) -> list[str] | int: ...\n",
        );
        let inherited = fixture.add_file(
            &mut analysis.db,
            "other.bzl",
            "def package(value: native) -> str:\n    return value.package_name()\npackage(native)\n",
        );
        let module = fixture.add_file_with_options(
            &mut analysis.db,
            "MODULE.bazel",
            "native.glob(['*.py'])",
            Dialect::Bazel,
            Some(FileInfo::Bazel {
                api_context: APIContext::Module,
                is_external: false,
                bundled_cc_common: false,
            }),
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for file in [source, inherited] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        let diagnostics = analysis.snapshot().diagnostics(module).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "unresolved-reference");
        let hover = analysis
            .snapshot()
            .hover(FilePosition {
                file_id: source,
                pos: u32::try_from(body.find("glob").unwrap()).unwrap().into(),
            })
            .unwrap()
            .unwrap();
        assert!(
            hover.contents.value.contains("allow_empty"),
            "{}",
            hover.contents.value
        );

        analysis.update_file(
            source,
            body.replace("    if files:", "    bazel = native\n    if files:")
                .replace("native.glob", "bazel.glob"),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        analysis.update_file(
            source,
            body.replace(
                "return native.glob(['*.py'])",
                "native.glob(['*.py'])\n        return 42",
            ),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-return-type");

        analysis.update_file(source, body.replace("['*.py']", "['*.py'], allow_empty=42"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");

        let include = builtins
            .r#type
            .iter_mut()
            .find(|class| class.name == "native")
            .unwrap()
            .field
            .iter_mut()
            .find(|field| field.name == "glob")
            .unwrap()
            .callable
            .as_mut()
            .unwrap()
            .param
            .iter_mut()
            .find(|parameter| parameter.name == "include")
            .unwrap();
        include.r#type = "int".into();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.update_file(source, body.replace("['*.py']", "42"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "unverified-overload");
    }

    #[test]
    fn function_stubs_report_unverified_overloads() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "def choose(value):\n    for _item in [value]:\n        return _item\n    return value\n",
        );
        let stub = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "@overload\ndef choose(value: int) -> int: ...\n@overload\ndef choose(value: str) -> str: ...\ndef choose(value: int | str) -> int | str: ...\n",
        );
        let caller = fixture.add_file(
            &mut analysis.db,
            "caller.bzl",
            "load('source.bzl', 'choose')\ntext: str = choose('value')\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for file in [stub, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "unverified-overload");

        analysis.update_file(
            source,
            "def choose(value):\n    for _item in [value]:\n        return None\n    return value\n"
                .into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(diagnostics
            .iter()
            .any(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"));
        assert!(diagnostics
            .iter()
            .any(|diagnostic| diagnostic.id().as_str() == "unverified-overload"));

        analysis.update_file(source, "def choose(value): return value\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn function_stubs_do_not_reuse_another_functions_overload_analysis() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "def original(value): return value\nchoose = original\n",
        );
        let family = "@overload\ndef NAME(value: int) -> int: ...\n@overload\ndef NAME(value: str) -> str: ...\ndef NAME(value: int | str) -> int | str: ...\n";
        let stub = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            &format!(
                "{}{}",
                family.replace("NAME", "original"),
                family.replace("NAME", "choose")
            ),
        );
        fixture.add_file(
            &mut analysis.db,
            "foreign.bzl",
            "def foreign(value: int | str) -> int | str: return 42\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for body in [
            "def original(value): return value\nchoose = original\n",
            "load('foreign.bzl', 'foreign')\ndef original(value): return value\nchoose = foreign\n",
        ] {
            analysis.update_file(source, body.into());
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "unverified-overload");
        }
    }

    #[test]
    fn function_stubs_check_generic_overload_implementations() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let body = "def identity(value): return value\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", body);
        let contract = r#"
@overload
def identity(value: str) -> str: ...
@overload
def identity(value: list[str]) -> list[str]: ...
@overload
def identity[T](value: T) -> T: ...
def identity[U](value: U) -> U: ...
"#;
        let stub = fixture.add_file(&mut analysis.db, "source.bzli", contract);
        let calls = r#"load("source.bzl", "identity")
text: str = identity("value")
items: list[str] = identity(["value"])
number: int = identity(42)
"#;
        let caller = fixture.add_file(&mut analysis.db, "caller.bzl", calls);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for file in [source, stub, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        analysis.update_file(caller, format!("{calls}bad: int = identity('value')\n"));
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-assignment");

        analysis.update_file(source, "def identity(value): return 42\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-return-type");

        analysis.update_file(source, body.into());
        // An invalid interface also leaves the source relationship unverified.
        analysis.update_file(
            stub,
            contract.replace("value: str) -> str", "value: str) -> int"),
        );
        let diagnostics = analysis.snapshot().diagnostics(stub).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-overload"),
            "{diagnostics:?}"
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "unverified-overload");
    }

    #[test]
    fn function_stubs_reject_unsupported_overload_families() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "def identity(value): return value\n",
        );
        let stub = fixture.add_file(&mut analysis.db, "source.bzli", "");
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for contract in [
            "def identity(value: int | str) -> int | str: ...\n@overload\ndef identity(value: int) -> int: ...\n@overload\ndef identity(value: str) -> str: ...\n",
            "@overload\ndef identity(value: int) -> int: ...\ndef identity(value: str) -> str: ...\ndef identity(value: int | str) -> int | str: ...\n",
            "@overload\ndef identity[T](value: T) -> T: ...\n@overload\ndef identity(value: str) -> str: ...\ndef identity[U](value: U | None) -> U | None: ...\n",
            "@overload\ndef identity(value: int) -> int: ...\n@overload\ndef identity(value: str) -> str: ...\ndef identity(value) -> int | str: ...\n",
            "@overload\ndef identity(value: int) -> int: ...\n@overload\ndef identity(value: str) -> str: ...\ndef identity(value: int | str): ...\n",
        ] {
            analysis.update_file(stub, contract.into());
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(diagnostics.iter().any(|diagnostic| diagnostic.id().as_str() == "invalid-function-interface"), "{contract}: {diagnostics:?}");
        }
        analysis.update_file(stub, "@overload\ndef identity(value: int) -> int: ...\n@overload\ndef identity(value: str) -> str: ...\ndef identity(value: int | str) -> int | str: ...\n".into());
        analysis.update_file(
            source,
            "def helper(value: int) -> int: return value\nidentity = helper\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-function-interface"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn function_stubs_check_generated_callable_values() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "source.bzl", "");
        let stub = fixture.add_file(&mut analysis.db, "source.bzli", "");
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for (mode, other_mode, extra) in [
            ("executable", "test", "output_licenses: list[str] = ..."),
            ("test", "executable", "size: str = ..."),
        ] {
            let body = format!("def _impl(ctx) -> None: return None\ntarget = rule(implementation=_impl, {mode}=True, attrs={{'exports': attr.label(mandatory=True)}})\nalias = target\n");
            let contract = format!("def target(*, name: str, exports: str | Label, {extra}) -> None: ...\ndef alias(*, name: str, exports: str | Label, {extra}) -> None: ...\n");
            analysis.update_file(source, body.clone());
            analysis.update_file(stub, contract.clone());
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(diagnostics.is_empty(), "{mode}: {diagnostics:?}");

            // The same declaration must reject another rule mode, including through an alias.
            analysis.update_file(
                source,
                body.replace(&format!("{mode}=True"), &format!("{other_mode}=True")),
            );
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert_eq!(diagnostics.len(), 2, "{mode}: {diagnostics:?}");
            assert!(
                diagnostics
                    .iter()
                    .all(|diagnostic| diagnostic.id().as_str() == "invalid-function-interface"),
                "{diagnostics:?}"
            );
            analysis.update_file(source, body);
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");

            for invalid in [
                contract.replace("exports: str | Label", "exports: int"),
                contract.replace("-> None", "-> int"),
            ] {
                analysis.update_file(stub, invalid);
                let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
                assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
                assert!(
                    diagnostics
                        .iter()
                        .all(|diagnostic| diagnostic.id().as_str() == "invalid-function-interface"),
                    "{diagnostics:?}"
                );
            }
        }
    }

    #[test]
    fn function_stubs_check_generated_callable_overloads() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "def _impl(ctx) -> None: return None\ntarget = rule(implementation=_impl, attrs={'exports': attr.label(mandatory=True)})\n",
        );
        let contract = "@overload\ndef target(*, name: str, exports: str) -> None: ...\n@overload\ndef target(*, name: str, exports: Label) -> None: ...\ndef target(*, name: str, exports: str | Label) -> None: ...\n";
        let stub = fixture.add_file(&mut analysis.db, "source.bzli", contract);
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        analysis.update_file(
            stub,
            contract
                .replace("exports: str) -> None", "exports: str) -> str")
                .replace(
                    "exports: str | Label) -> None",
                    "exports: str | Label) -> str | None",
                ),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "unverified-overload");
    }

    #[test]
    fn function_stubs_preserve_callable_value_inference() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "source.bzl", "");
        let stub = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "def identity(value: int) -> int: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for body in [
            "def helper(value: str) -> str: return value\nidentity = helper\n",
            "identity = 42\n",
            "def helper(value: int) -> int: return value\nidentity = helper\nidentity = helper\n",
        ] {
            analysis.update_file(source, body.into());
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-function-interface");
        }
        let body = "def helper(value): return value\nidentity = helper\n";
        analysis.update_file(source, body.into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())]
                    .into_iter()
                    .collect(),
            )
            .unwrap(),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics.iter().any(|diagnostic| {
                diagnostic.id().as_str() == "non-static-type"
                    && diagnostic
                        .range()
                        .is_some_and(|range| &body[range] == "identity")
            }),
            "{diagnostics:?}"
        );
        analysis.update_file(
            source,
            "def helper(value: int) -> int: return value\nidentity = helper\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn function_stubs_check_native_raw_constructors() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "source.bzl", "def _init(value):\n    return {'value': value}\nInfo, raw = provider(fields=['value'], init=_init)\n");
        let stub = fixture.add_file(&mut analysis.db, "source.bzli", "");
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for (input, output, valid) in [
            ("str", "Info", true),
            ("int", "Info", false),
            ("str", "int", false),
        ] {
            analysis.update_file(stub, format!("def Info(value: str) -> record[{{'value': str}}]: ...\ndef raw(*, value: {input}) -> {output}: ...\n"));
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            if valid {
                assert!(diagnostics.is_empty(), "{diagnostics:?}");
            } else {
                assert!(
                    diagnostics
                        .iter()
                        .any(|diagnostic| diagnostic.id().as_str() == "invalid-function-interface"),
                    "{diagnostics:?}"
                );
            }
        }
        analysis.update_file(stub, "def raw(*, value: str) -> object: ...\n".into());
        analysis.update_file(source, "def provider(**kwargs) -> tuple[object, Callable[[int], int]]:\n    return (kwargs, lambda value: value)\nInfo, raw = provider(fields=['value'])\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-function-interface"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn private_value_contracts_distinguish_values_from_type_helpers() {
        use starpls_common::Db as _;

        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "_Alias = 1\n_Type = 1\n_Callback = 1\n_Loaded = 1\n_Helper = 1\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_builtin_defs(Default::default(), Default::default())
            .unwrap();
        let super::super::native::DeclarationSource { path, mut contents } =
            super::super::native::generate(
                Dialect::Bazel,
                &Default::default(),
                &Default::default(),
            )
            .unwrap();
        contents.push_str(
            "\nfrom typing import TypeAlias as Marker, Callable, Any as _Loaded\n_Alias: Marker = int\n_Type: type[int]\n_Callback: Callable[[object], object]\nclass _Helper: ...\n",
        );
        analysis
            .db
            .source_system_mut()
            .set_virtual_source(&path, contents);
        let file = analysis.db.files.try_virtual_file(&path).unwrap();
        file.sync(&mut analysis.db);
        let db = &analysis.db;
        let declarations = ty_python_semantic::Db::program_file(db, file.file());
        let implementation = db.starlark_program_file(source);
        for (name, expected) in [
            ("_Alias", false),
            ("_Type", true),
            ("_Callback", true),
            ("_Loaded", false),
            ("_Helper", false),
        ] {
            let definitions = super::export_definitions(db, declarations, name);
            let [definition] = definitions.as_slice() else {
                panic!("Expected one declaration for {name}: {definitions:?}");
            };
            assert_eq!(
                super::is_implementation_contract(db, *definition, implementation),
                expected,
                "{name}",
            );
        }
    }

    #[test]
    fn build_annotations_check_private_tables_and_follow_edits() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let text = "_CASES = [{'name': 'ok', 'enabled': True}]\nvalue = _CASES[0].get('name')\n";
        let source = fixture.add_file_with_options(
            &mut analysis.db,
            "BUILD.bazel",
            text,
            Dialect::Bazel,
            Some(FileInfo::Bazel {
                api_context: APIContext::Build,
                is_external: false,
                bundled_cc_common: false,
            }),
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
        let schema =
            "class _Case(TypedDict):\n    name: str\n    enabled: bool\n_CASES: list[_Case]\n";
        let stub = fixture.add_file(&mut analysis.db, "BUILD.bzli", schema);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for (source_text, stub_text, expected_type, error) in [
            (text.to_owned(), schema.to_owned(), "str", None),
            (
                text.replace(
                    "{'name': 'ok', 'enabled': True}",
                    "dict(name='ok', enabled=True)",
                ),
                schema.to_owned(),
                "str",
                None,
            ),
            (
                text.replace(
                    "{'name': 'ok', 'enabled': True}",
                    "dict(name=1, enabled=True)",
                ),
                schema.to_owned(),
                "str",
                Some("invalid-argument-type"),
            ),
            (
                text.to_owned(),
                schema.replace("name: str", "name: int"),
                "int",
                Some("invalid-assignment"),
            ),
            (
                text.replace("'ok'", "1"),
                schema.replace("name: str", "name: int"),
                "int",
                None,
            ),
            (text.to_owned(), schema.to_owned(), "str", None),
        ] {
            analysis.update_file(source, source_text.clone());
            analysis.update_file(stub, stub_text);
            let snapshot = analysis.snapshot();
            let diagnostics = snapshot.diagnostics(source).unwrap();
            if let Some(error) = error {
                assert!(
                    diagnostics.iter().any(|d| d.id().as_str() == error),
                    "{diagnostics:?}"
                );
            } else {
                assert!(diagnostics.is_empty(), "{diagnostics:?}");
            }
            let diagnostics = snapshot.diagnostics(stub).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
            let hover = snapshot
                .hover(FilePosition {
                    file_id: source,
                    pos: (source_text.find("value =").unwrap() as u32).into(),
                })
                .unwrap()
                .unwrap();
            assert!(
                hover
                    .contents
                    .value
                    .contains(&format!("value: {expected_type}")),
                "{}",
                hover.contents.value
            );
        }
        analysis.update_file(source, format!("{text}_CASES[0]['name'] = True\n"));
        assert!(analysis
            .snapshot()
            .diagnostics(source)
            .unwrap()
            .iter()
            .any(|d| d.id().as_str() == "invalid-assignment"));
        analysis.set_type_interfaces([]).unwrap();
        assert!(analysis.snapshot().diagnostics(source).unwrap().is_empty());
        assert!(analysis
            .snapshot()
            .diagnostics(stub)
            .unwrap()
            .iter()
            .any(|d| d.id().as_str() == "unused-definition"));
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        assert!(analysis.snapshot().diagnostics(stub).unwrap().is_empty());
        assert!(analysis
            .snapshot()
            .diagnostics(source)
            .unwrap()
            .iter()
            .any(|d| d.id().as_str() == "invalid-assignment"));
    }

    #[test]
    fn stub_value_annotations_check_module_implementations() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let text = "_DATA = {'edition': '2024', 'deps': []}\ndef data():\n    return _DATA\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", text);
        let other = fixture.add_file(&mut analysis.db, "other.bzl", text);
        let declaration = "type _Data = dict[{\"edition\": str, \"deps\": list[str]}]\n_DATA: _Data\ndef data() -> _Data: ...\n";
        let stub = fixture.add_file(&mut analysis.db, "data.bzli", declaration);
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_type_interfaces([(source, stub), (other, stub)])
            .unwrap();
        for file in [source, other, stub] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        analysis.update_file(source, text.replace("'2024'", "42"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics.iter().any(|diagnostic| diagnostic.id().as_str()
                == "invalid-argument-type"
                && diagnostic.headline_message().contains("edition")),
            "{diagnostics:?}"
        );
        assert!(analysis.snapshot().diagnostics(other).unwrap().is_empty());
        analysis.update_file(
            stub,
            declaration.replace("\"edition\": str", "\"edition\": int"),
        );
        assert!(analysis.snapshot().diagnostics(source).unwrap().is_empty());
        assert!(analysis
            .snapshot()
            .diagnostics(other)
            .unwrap()
            .iter()
            .any(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"));

        analysis.update_file(stub, declaration.to_owned());
        analysis.update_file(source, format!("_DATA = {{}}\n{text}"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"),
            "{diagnostics:?}"
        );
        assert!(diagnostics
            .iter()
            .all(|diagnostic| diagnostic.id().as_str() != "invalid-assignment"));
    }

    #[test]
    fn stub_value_annotations_leave_type_helpers_in_the_stub() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "_VALUE = 42\nresult = _VALUE + 1\n",
        );
        let stub = fixture.add_file(&mut analysis.db, "source.bzli", "");
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for declaration in [
            "type _VALUE = str\n",
            // Invalid initialized declarations must not supply context before
            // the interface syntax validator reports them.
            "_VALUE: str = 'declaration'\n",
        ] {
            analysis.update_file(stub, declaration.into());
            let annotations = super::implementation_annotations(&analysis.db, source).unwrap();
            assert!(annotations.owners.is_empty(), "{annotations:?}");
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
    }

    #[test]
    fn source_value_annotations_take_precedence_over_stubs() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "source.bzl", "");
        let stub = fixture.add_file(&mut analysis.db, "source.bzli", "_VALUE: int\n");
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for declaration in [
            "_VALUE = 'source' # type: str\n",
            "_VALUE: str = 'source'\n",
        ] {
            analysis.update_file(source, format!("{declaration}result: str = _VALUE\n"));
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
    }

    #[test]
    fn stub_value_annotation_cycles_use_ordinary_recovery() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "source.bzl", "VALUE = {}\n");
        let declaration = "VALUE: dict[str, int]\n";
        let stub = fixture.add_file(&mut analysis.db, "source.bzli", declaration);
        loader.add_files_from_fixture(&fixture);
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for file in [source, stub] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        analysis.update_file(
            stub,
            "load('source.bzl', _SourceValue='VALUE')\nVALUE: _SourceValue\n".into(),
        );
        let source_diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        let stub_diagnostics = analysis.snapshot().diagnostics(stub).unwrap();
        assert!(
            source_diagnostics
                .iter()
                .chain(&stub_diagnostics)
                .any(|diagnostic| diagnostic.id().as_str() == "non-static-type"),
            "source: {source_diagnostics:?}; stub: {stub_diagnostics:?}"
        );
        analysis.update_file(stub, declaration.into());
        for file in [source, stub] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
    }

    #[test]
    fn build_annotations_require_unique_direct_bindings() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file_with_options(
            &mut analysis.db,
            "BUILD",
            "",
            Dialect::Bazel,
            Some(FileInfo::Bazel {
                api_context: APIContext::Build,
                is_external: false,
                bundled_cc_common: false,
            }),
        );
        let stub = fixture.add_file(&mut analysis.db, "BUILD.bzli", "_VALUE: int\n");
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for (text, expected) in [
            ("other = 1\n", "does not bind"),
            ("_VALUE = 1\n_VALUE = 2\n", "more than once"),
            ("_VALUE = 1\n_VALUE += 2\n", "more than once"),
            ("_VALUE, other = (1, 2)\n", "direct assignment"),
            (
                "load('dep.bzl', _VALUE='value')\n_VALUE = 1\n",
                "more than once",
            ),
            ("load('dep.bzl', '_VALUE')\n_VALUE = 1\n", "more than once"),
        ] {
            analysis.update_file(source, text.into());
            let diagnostics = super::diagnostics(&analysis.db, stub).diagnostics;
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{text}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-build-annotation");
            assert!(
                diagnostic.headline_message().contains(expected),
                "{diagnostic:?}"
            );
        }
        analysis.update_file(source, "_VALUE = 1\n".into());
        analysis.update_file(stub, "_VALUE: int\n_VALUE: str\n".into());
        let diagnostics = super::diagnostics(&analysis.db, stub).diagnostics;
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(diagnostics.iter().all(|d| d
            .headline_message()
            .contains("stub binds this name more than once")));
        analysis.update_file(stub, "def macro() -> None: ...\n".into());
        let diagnostics = super::diagnostics(&analysis.db, stub).diagnostics;
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-build-annotation");
        assert!(diagnostic
            .headline_message()
            .contains("cannot annotate a BUILD binding"));
        analysis.update_file(stub, "_VALUE: int\n".into());
        // Local scopes do not make a module assignment ambiguous. This query
        // tests syntax correspondence independently of BUILD's statement rules.
        for text in [
            "_VALUE = 1\nitems = [_VALUE for _VALUE in []]\n",
            "_VALUE = 1\ndef helper():\n    _VALUE = 'local'\n",
        ] {
            analysis.update_file(source, text.into());
            let correspondence = super::binding_annotations(&analysis.db, source).unwrap();
            assert!(correspondence.errors.is_empty(), "{correspondence:?}");
            assert_eq!(correspondence.owners.len(), 1);
        }
    }

    #[test]
    fn build_comments_take_precedence_over_sidecars() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file_with_options(
            &mut analysis.db,
            "BUILD.bazel",
            "_VALUE = 'ok' # type: str\nvalue = _VALUE\n",
            Dialect::Bazel,
            Some(FileInfo::Bazel {
                api_context: APIContext::Build,
                is_external: false,
                bundled_cc_common: false,
            }),
        );
        let stub = fixture.add_file(&mut analysis.db, "BUILD.bzli", "_VALUE: int\n");
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        assert!(analysis.snapshot().diagnostics(source).unwrap().is_empty());
    }

    #[test]
    fn generic_protocols_check_callback_arguments() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source_text = "def invoke(callback, value):\n    callback(data=value)\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", source_text);
        let interface = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "class _Consumer[T](Protocol):\n    def __call__(self, *, data: T) -> None: ...\ndef invoke[T](callback: _Consumer[T], value: T) -> None: ...\n",
        );
        let caller_text = "load('source.bzl', 'invoke')\ndef consume(*, data: list[str]) -> None:\n    print(data)\ninvoke(consume, ['ok'])\n";
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", caller_text);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for file in [source, interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }

        analysis.update_file(caller, caller_text.replace("['ok']", "[42]"));
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");

        analysis.update_file(source, source_text.replace("data=value", "data=42"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
    }

    #[test]
    fn protocol_methods_use_ordinary_types_and_editor_origins() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        // The private helper name also exists in the source, but it describes
        // no provider identity in the interface.
        let source = fixture.add_file(&mut analysis.db, "source.bzl", "_Builder = provider(fields=['value'])\noriginal = _Builder(value='source')\ndef make(): pass\n");
        let interface_text = "class _Builder(Protocol):\n    def set(self, value: int) -> _Builder: ...\n    def build(self) -> str: ...\ndef make() -> _Builder: ...\n";
        let interface = fixture.add_file(&mut analysis.db, "source.bzli", interface_text);
        let caller_text = "load('source.bzl', 'make')\nresult: str = make().set(1).build()\n";
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", caller_text);
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "empty-body");
        for file in [interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        let locations = analysis
            .snapshot()
            .goto_definition(
                FilePosition {
                    file_id: caller,
                    pos: (caller_text.find(".build").unwrap() as u32 + 1).into(),
                },
                false,
            )
            .unwrap()
            .unwrap();
        let [LocationLink::Local {
            target_file_id,
            target_selection_range,
            origin_selection_range: _,
            target_range: _,
        }] = locations.as_slice()
        else {
            panic!("{locations:?}");
        };
        assert_eq!(*target_file_id, interface.source);
        assert_eq!(&interface_text[*target_selection_range], "build");
        for (source, expected) in [
            (
                caller_text.replace("set(1)", "set('bad')"),
                "invalid-argument-type",
            ),
            (
                caller_text.replace("result: str", "result: int"),
                "invalid-assignment",
            ),
        ] {
            analysis.update_file(caller, source);
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), expected);
        }
        analysis.update_file(caller, caller_text.into());
        analysis.update_file(
            interface,
            interface_text.replace("value: int", "value: str"),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
    }

    #[test]
    fn readonly_protocol_callbacks_preserve_call_shapes_and_origins() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "source.bzl", "def make(): pass\n");
        let interface_text = r#"
class _Set(Protocol):
    def __call__(self, value: int, *, enabled: bool = ...) -> _Builder: ...
class _Build(Protocol):
    def __call__(self, *parts: str) -> str: ...
class _Builder(Protocol):
    @property
    def set(self) -> _Set: ...
    @property
    def build(self) -> _Build: ...
def make() -> _Builder: ...
"#;
        let interface = fixture.add_file(&mut analysis.db, "source.bzli", interface_text);
        let caller_text = "load('source.bzl', 'make')\nresult: str = make().set(value=1, enabled=True).set(2).build('a', 'b')\n";
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", caller_text);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        assert!(analysis
            .db
            .builtin_completion_names(
                interface,
                ty_python_semantic::provided::BuiltinUsage::Runtime
            )
            .contains_key("property"));
        assert!(!analysis
            .db
            .builtin_completion_names(
                caller,
                ty_python_semantic::provided::BuiltinUsage::Annotation
            )
            .contains_key("property"));
        for file in [interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        let locations = analysis
            .snapshot()
            .goto_definition(
                FilePosition {
                    file_id: caller,
                    pos: (caller_text.find(".build").unwrap() as u32 + 1).into(),
                },
                false,
            )
            .unwrap()
            .unwrap();
        let [location] = locations.as_slice() else {
            panic!("{locations:?}");
        };
        let LocationLink::Local {
            target_file_id,
            target_selection_range,
            origin_selection_range: _,
            target_range: _,
        } = location
        else {
            panic!("{locations:?}");
        };
        assert_eq!(*target_file_id, interface.source);
        assert_eq!(&interface_text[*target_selection_range], "build");
        for (text, expected) in [
            (
                caller_text.replace("value=1", "wrong=1"),
                "unknown-argument",
            ),
            (caller_text.replace(".set(2)", ".set()"), "missing-argument"),
            (
                caller_text.replace("'a', 'b'", "1"),
                "invalid-argument-type",
            ),
            (
                caller_text.replace("result: str", "result: int"),
                "invalid-assignment",
            ),
            (
                "load('source.bzl', 'make')\nmake().set = make().set\n".into(),
                "invalid-assignment",
            ),
        ] {
            analysis.update_file(caller, text);
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == expected),
                "{expected}: {diagnostics:?}"
            );
            assert!(
                diagnostics
                    .iter()
                    .all(|diagnostic| diagnostic.id().as_str() != "invalid-syntax"),
                "{diagnostics:?}"
            );
        }
        analysis.update_file(caller, caller_text.into());
        analysis.update_file(
            interface,
            interface_text.replace("value: int", "value: str"),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(
            diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"),
            "{diagnostics:?}"
        );
        analysis.update_file(interface, interface_text.into());
        assert!(analysis.snapshot().diagnostics(caller).unwrap().is_empty());
        analysis.update_file(
            interface,
            format!("def property(value: object) -> int: ...\n{interface_text}"),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "call-non-callable"),
            "{diagnostics:?}"
        );
        analysis.update_file(
            interface,
            interface_text.replace("def set(self)", "def set(self, required: int)"),
        );
        let diagnostics = analysis.snapshot().diagnostics(interface).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn typed_dictionary_contracts_retain_keys_across_edits() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "def make(): return {'name': 'example'}\n",
        );
        let stub = "class _Row(TypedDict):\n    name: str\n    count: NotRequired[int]\ndef make() -> _Row: ...\n";
        let interface = fixture.add_file(&mut analysis.db, "source.bzli", stub);
        let caller_text = "load('source.bzl', 'make')\nrow = make()\nvalue = row['name']\nname: str = value\ncount: int | None = row.get('count')\n";
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", caller_text);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for file in [interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        for (declaration, expected_type, valid) in [
            (stub.to_owned(), "str", true),
            (stub.replace("name: str", "name: int"), "int", false),
            (stub.to_owned(), "str", true),
        ] {
            analysis.update_file(interface, declaration);
            let snapshot = analysis.snapshot();
            let diagnostics = snapshot.diagnostics(caller).unwrap();
            if valid {
                assert!(diagnostics.is_empty(), "{diagnostics:?}");
            } else {
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{diagnostics:?}");
                };
                assert_eq!(diagnostic.id().as_str(), "invalid-assignment");
            }
            let hover = snapshot
                .hover(FilePosition {
                    file_id: caller,
                    pos: (caller_text.find("value =").unwrap() as u32).into(),
                })
                .unwrap()
                .unwrap();
            assert!(
                hover
                    .contents
                    .value
                    .contains(&format!("value: {expected_type}")),
                "{}",
                hover.contents.value
            );
            let completions = snapshot
                .completions(
                    FilePosition {
                        file_id: caller,
                        pos: (caller_text.find("'name'").unwrap() as u32 + 2).into(),
                    },
                    None,
                )
                .unwrap()
                .unwrap();
            for name in ["name", "count"] {
                assert!(
                    completions.iter().any(|item| item.label == name),
                    "{completions:?}"
                );
            }
        }
    }

    #[test]
    fn stub_keyword_navigation_uses_the_declaration() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "@rules//:defs.bzl", "");
        let declaration = "def task(*, name: str) -> None: ...\n";
        let interface = fixture.add_file(&mut analysis.db, "defs.bzli", declaration);
        let caller_text = "load('@rules//:defs.bzl', 'task')\ntask(name='demo')\n";
        let caller = fixture.add_file_with_options(
            &mut analysis.db,
            "BUILD.bazel",
            caller_text,
            Dialect::Bazel,
            Some(FileInfo::Bazel {
                api_context: APIContext::Build,
                is_external: false,
                bundled_cc_common: false,
            }),
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        let locations = analysis
            .snapshot()
            .goto_definition(
                FilePosition {
                    file_id: caller,
                    pos: (caller_text.find("name").unwrap() as u32).into(),
                },
                false,
            )
            .unwrap()
            .unwrap();
        let [LocationLink::Local {
            target_file_id,
            origin_selection_range: _,
            target_range: _,
            target_selection_range,
        }] = locations.as_slice()
        else {
            panic!("{locations:?}")
        };
        assert_eq!(*target_file_id, interface.source);
        assert_eq!(
            &declaration[usize::from(target_selection_range.start())
                ..usize::from(target_selection_range.end())],
            "name",
        );
    }

    #[test]
    fn typed_dictionary_interfaces_preserve_field_types() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "data.bzl",
            "DEP_DATA = {}\nEXTRA = 'source export'\n",
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "data.bzli",
            r#"class _Entry(TypedDict, extra_items=ReadOnly[object]):
    name: str
    aliases: dict[str, str]
    deps: list[str]
    by_platform: NotRequired[dict[str, list[str]]]
    config: NotRequired[str]

DEP_DATA: dict[str, _Entry]
"#,
        );
        let caller_text = "load('data.bzl', 'DEP_DATA', 'EXTRA')\nrow = DEP_DATA['sample']\nname: str = row['name']\nalias: str = row['aliases']['//:dep']\nbinary: str = row['aliases'].keys()[0]\nplatform_deps: list[str] = row.get('by_platform', {}).values()[0]\nfeatures: list[str] = row['deps']\nlint: str | None = row.get('config')\nextra: str = EXTRA\nplatforms: object = row['platforms']\n";
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", caller_text);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for file in [interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        for (statement, expected) in [
            ("row['deps'].append(42)", "invalid-argument-type"),
            (
                "row.get('by_platform', {}).values()[0].append(42)",
                "invalid-argument-type",
            ),
            (
                "platform_name: str = row['platforms']",
                "invalid-assignment",
            ),
            ("row['platforms'] = []", "invalid-assignment"),
        ] {
            analysis.update_file(caller, format!("{caller_text}{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{statement}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), expected);
        }
        analysis.update_file(caller, format!("{caller_text}print(object, ReadOnly)\n"));
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(diagnostics
            .iter()
            .all(|diagnostic| diagnostic.id().as_str() == "unresolved-reference"));
    }

    #[test]
    fn excluded_interface_classes_preserve_sibling_diagnostics() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let file = fixture.add_file(&mut analysis.db, "types.bzli", "");
        for invalid in [
            "class Broken(Protocol, metaclass=Meta): pass",
            "class Broken(TypedDict, closed=1): pass",
            "class Broken:\n    value = 1",
            "class Broken:\n    @property\n    def value(self) -> str: ...",
            "class Broken:\n    @property\n    def __init__(self) -> None: ...",
            "class Broken(Protocol):\n    @other\n    def value(self) -> str: ...",
        ] {
            analysis.update_file(
                file,
                format!("{invalid}\nclass Sibling(Protocol, closed=True): pass\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 2, "{invalid}: {diagnostics:?}");
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == "invalid-syntax"),
                "{invalid}: {diagnostics:?}"
            );
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.headline_message()
                        == "Only TypedDict declarations accept class keywords"),
                "{invalid}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn interface_bases_require_supported_type_identity() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let file = fixture.add_file(&mut analysis.db, "types.bzli", "");
        for source in [
            "class Concrete:\n    def __init__(self) -> None: ...\nclass _Derived(Concrete): pass\n",
            "def Protocol() -> int: ...\nclass _Derived(Protocol): pass\n",
            "def TypedDict() -> int: ...\nclass _Derived(TypedDict): pass\n",
        ] {
            analysis.update_file(file, source.into());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.iter().any(|diagnostic| diagnostic.headline_message() == "Interface classes with bases must declare a Protocol or TypedDict"), "{diagnostics:?}");
        }
    }

    #[test]
    fn provider_classes_share_source_identity_and_recursive_fields() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "Info = provider(fields=['value', 'next'])\ndef consume(value: Info) -> Info:\n    return value\noriginal = Info(value='source', next=None)\n",
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "class Info:\n    value: Final[str]\n    next: Final[Info | None]\n    def __init__(self, *, value: str, next: Info | None) -> None: ...\n",
        );
        let caller_text = "load('source.bzl', 'Info', 'consume', 'original')\nitem = consume(Info(value='ok', next=original))\ntext = item.value\n";
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", caller_text);
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for file in [source, interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        let hover = analysis
            .snapshot()
            .hover(FilePosition {
                file_id: caller,
                pos: (caller_text.rfind("value").unwrap() as u32).into(),
            })
            .unwrap()
            .unwrap();
        assert!(
            hover.contents.value.contains("value: str"),
            "{}",
            hover.contents.value
        );
        for bad_call in [
            "Info(value=42, next=None)",
            "Info(value='missing')",
            "item.value = 'changed'",
            "Other = provider(fields=['value', 'next'])\nconsume(Other(value='ok', next=None))",
        ] {
            analysis.update_file(caller, format!("{caller_text}{bad_call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            assert_eq!(diagnostics.len(), 1, "{bad_call}: {diagnostics:?}");
        }
    }

    #[test]
    fn partial_provider_interface_preserves_source_identity() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let fields = "['enabled']";
        let arguments = "enabled=True";
        let source = fixture.add_file(
            &mut analysis.db,
            "providers.bzl",
            &format!(
                r#"Info = provider(fields={fields})
Unmapped = provider(fields=['value'])
def consume(value: Info) -> Info:
    return value
original = Info({arguments})
"#
            ),
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "providers.bzli",
            "class Info:\n    enabled: Final[bool]\n    def __init__(self, *, enabled: bool) -> None: ...\n",
        );
        let caller_text = format!(
            r#"load('providers.bzl', 'Info', 'Unmapped', 'consume', 'original')
item = consume(Info({arguments}))
flag = item.enabled
previous = consume(original)
unmapped = Unmapped(value=1)
value = unmapped.value
"#
        );
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", &caller_text);
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        let snapshot = analysis.snapshot();
        for file in [source, interface, caller] {
            let diagnostics = snapshot.diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        let hover = snapshot
            .hover(FilePosition {
                file_id: caller,
                pos: (caller_text.find("item.enabled").unwrap() as u32 + 5).into(),
            })
            .unwrap()
            .unwrap();
        assert!(
            hover.contents.value.contains("enabled: bool"),
            "{}",
            hover.contents.value
        );
        let locations = snapshot
            .goto_definition(
                FilePosition {
                    file_id: caller,
                    pos: (caller_text.rfind("Unmapped").unwrap() as u32).into(),
                },
                false,
            )
            .unwrap()
            .unwrap();
        let [crate::LocationLink::Local {
            target_file_id,
            origin_selection_range: _,
            target_range: _,
            target_selection_range: _,
        }] = locations.as_slice()
        else {
            panic!("{locations:?}");
        };
        assert_eq!(*target_file_id, source.source);
        drop(snapshot);
        for (bad_call, expected) in [
            (
                format!(
                    "Info({})",
                    arguments.replace("enabled=True", "enabled='bad'")
                ),
                "invalid-argument-type",
            ),
            ("Info()".to_owned(), "missing-argument"),
            (
                format!("Other = provider(fields={fields})\nconsume(Other({arguments}))"),
                "invalid-argument-type",
            ),
        ] {
            analysis.update_file(caller, format!("{caller_text}{bad_call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{bad_call}: {diagnostics:?}");
            };
            assert_eq!(
                diagnostic.id().as_str(),
                expected,
                "{bad_call}: {diagnostic:?}"
            );
        }
    }

    #[test]
    fn provider_aliases_raw_constructors_and_editor_origins_follow_edits() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "source.bzl", "");
        let interface = fixture.add_file(&mut analysis.db, "source.bzli", "");
        let caller_text = "load('source.bzl', 'Info', 'raw')\nitem = raw(value='ok')\ntext = item.value\ndef consume(target: Target) -> str:\n    return target[Info].value\n";
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", caller_text);
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for (prefix, annotation, valid) in [
            ("", "str", true),
            ("# moved declaration\n", "int", false),
            ("\n", "str", true),
        ] {
            let source_text = format!("{prefix}def _init(value):\n    return {{'value': value}}\n_Original, raw = provider(fields=['value'], init=_init)\nInfo = _Original\n");
            let interface_text = format!("{prefix}class Info:\n    \"\"\"Provider documentation.\"\"\"\n    value: Final[{annotation}]\n    def __init__(self, value: {annotation}) -> None: ...\ndef raw(*, value: {annotation}) -> Info: ...\n");
            analysis.update_file(source, source_text.clone());
            analysis.update_file(interface, interface_text.clone());
            let snapshot = analysis.snapshot();
            let diagnostics = snapshot.diagnostics(caller).unwrap();
            assert_eq!(diagnostics.is_empty(), valid, "{diagnostics:?}");
            let hover = snapshot
                .hover(FilePosition {
                    file_id: caller,
                    pos: (caller_text.rfind(".value").unwrap() as u32 + 1).into(),
                })
                .unwrap()
                .unwrap();
            assert!(
                hover.contents.value.contains(annotation),
                "{}",
                hover.contents.value
            );
            let provider_hover = snapshot
                .hover(FilePosition {
                    file_id: caller,
                    pos: (caller_text.rfind("Info").unwrap() as u32).into(),
                })
                .unwrap()
                .unwrap();
            assert!(
                provider_hover
                    .contents
                    .value
                    .contains("Provider documentation."),
                "{}",
                provider_hover.contents.value
            );
            for (needle, target, expected) in
                [(".value", interface, "value"), ("Info", source, "Info")]
            {
                let offset =
                    caller_text.rfind(needle).unwrap() + usize::from(needle.starts_with('.'));
                let locations = snapshot
                    .goto_definition(
                        FilePosition {
                            file_id: caller,
                            pos: (offset as u32).into(),
                        },
                        false,
                    )
                    .unwrap()
                    .unwrap();
                let [LocationLink::Local {
                    target_file_id,
                    target_selection_range,
                    origin_selection_range: _,
                    target_range: _,
                }] = locations.as_slice()
                else {
                    panic!("{locations:?}");
                };
                assert_eq!(*target_file_id, target.source);
                let text = if target == source {
                    &source_text
                } else {
                    &interface_text
                };
                assert_eq!(&text[*target_selection_range], expected);
            }
            let help = snapshot
                .signature_help(FilePosition {
                    file_id: caller,
                    pos: (caller_text.find("'ok'").unwrap() as u32).into(),
                })
                .unwrap()
                .unwrap();
            assert!(
                help.signatures
                    .iter()
                    .any(|signature| signature.label.contains(&format!("value: {annotation}"))),
                "{help:?}"
            );
            let completions = snapshot
                .completions(
                    FilePosition {
                        file_id: caller,
                        pos: (caller_text.rfind(".value").unwrap() as u32 + 1).into(),
                    },
                    None,
                )
                .unwrap()
                .unwrap();
            assert!(
                completions.iter().any(|item| item.label == "value"),
                "{completions:?}"
            );
        }
        analysis.update_file(
            interface,
            "class Info:\n    value: Fi\n    def __init__(self, *, value: str) -> None: ...\n"
                .into(),
        );
        let completions = analysis
            .snapshot()
            .completions(
                FilePosition {
                    file_id: interface,
                    pos: 25.into(),
                },
                None,
            )
            .unwrap()
            .unwrap();
        assert!(
            completions.iter().any(|item| item.label == "Final"),
            "{completions:?}"
        );
    }

    #[test]
    fn provider_pairing_rejects_distinct_contracts_for_one_key() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "Info = provider(fields=['value'])\nAlias = Info\n",
        );
        let reexport = fixture.add_file(
            &mut analysis.db,
            "reexport.bzl",
            "load('source.bzl', _Info='Info')\nInfo = _Info\n",
        );
        let class = "class Info:\n    value: Final[str]\n    def __init__(self, *, value: str) -> None: ...\n";
        let interface = fixture.add_file(&mut analysis.db, "source.bzli", class);
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", "load('source.bzl', 'Info')\nload('reexport.bzl', Other='Info')\ndef consume(value: Info) -> str:\n    return value.value\ntext = consume(Other(value='ok'))\n");
        loader.add_files_from_fixture(&fixture);
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
            .set_type_interfaces([(source, interface), (reexport, interface)])
            .unwrap();
        for file in [interface, caller] {
            assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
        }
        analysis.update_file(
            interface,
            format!("{class}{}", class.replace("Info", "Alias")),
        );
        let diagnostics = analysis.snapshot().diagnostics(interface).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .filter(|diagnostic| diagnostic.id().as_str() == "invalid-provider-interface")
                .count(),
            2,
            "{diagnostics:?}"
        );
        analysis.update_file(interface, class.into());
        for text in [
            "Info = provider(fields=['value'])\n",
            "# shifted\nInfo = provider(fields=['value'])\n",
        ] {
            analysis.update_file(source, text.into());
            assert!(analysis.snapshot().diagnostics(caller).unwrap().is_empty());
        }
    }

    #[test]
    fn trusted_exports_are_partial_and_independent_of_the_implementation() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source_text = "def compute(legacy: int) -> int:\n    return 'bad'\nuntouched = 42\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", source_text);
        let interface = fixture.add_file(&mut analysis.db, "source.bzli", "");
        let caller_text = "load(\"source.bzl\", \"compute\", \"untouched\", \"only\")\nresult = compute(value='ok')\noriginal = untouched\n";
        let caller = fixture.add_file_with_options(
            &mut analysis.db,
            "BUILD",
            caller_text,
            Dialect::Bazel,
            Some(FileInfo::Bazel {
                api_context: APIContext::Build,
                is_external: false,
                bundled_cc_common: false,
            }),
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for (annotation, valid) in [("string", true), ("int", false), ("string", true)] {
            analysis.update_file(
                interface,
                format!("def compute(value: {annotation}) -> {annotation}: ...\nonly: int\n"),
            );
            let snapshot = analysis.snapshot();
            let completions = snapshot
                .completions(
                    FilePosition {
                        file_id: caller,
                        pos: (caller_text.find("only").unwrap() as u32).into(),
                    },
                    None,
                )
                .unwrap()
                .unwrap();
            for name in ["compute", "only", "untouched"] {
                assert_eq!(
                    completions.iter().filter(|item| item.label == name).count(),
                    1,
                    "{name}"
                );
            }
            let diagnostics = snapshot.diagnostics(caller).unwrap();
            assert_eq!(diagnostics.is_empty(), valid, "{diagnostics:?}");
            if !valid {
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{diagnostics:?}")
                };
                assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            }
            let diagnostics = snapshot.diagnostics(source).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"),
                "{diagnostics:?}"
            );
            let hover = snapshot
                .hover(FilePosition {
                    file_id: caller,
                    pos: (caller_text.rfind("untouched").unwrap() as u32).into(),
                })
                .unwrap()
                .unwrap();
            assert!(
                hover.contents.value.contains("Literal[42]"),
                "{}",
                hover.contents.value
            );
            let position = FilePosition {
                file_id: caller,
                pos: (caller_text.rfind("compute").unwrap() as u32).into(),
            };
            let locations = snapshot.goto_definition(position, false).unwrap().unwrap();
            let [LocationLink::Local {
                target_file_id,
                origin_selection_range: _,
                target_range: _,
                target_selection_range: _,
            }] = locations.as_slice()
            else {
                panic!("{locations:?}")
            };
            assert_eq!(*target_file_id, source.source);
            let position = FilePosition {
                file_id: caller,
                pos: (caller_text.find("only").unwrap() as u32).into(),
            };
            let locations = snapshot.goto_definition(position, false).unwrap().unwrap();
            let [LocationLink::Local {
                target_file_id,
                origin_selection_range: _,
                target_range: _,
                target_selection_range: _,
            }] = locations.as_slice()
            else {
                panic!("{locations:?}")
            };
            assert_eq!(*target_file_id, interface.source);
            let help = snapshot
                .signature_help(FilePosition {
                    file_id: caller,
                    pos: (caller_text.find("'ok'").unwrap() as u32).into(),
                })
                .unwrap()
                .unwrap();
            let [signature] = help.signatures.as_slice() else {
                panic!("{help:?}")
            };
            let expected = if valid { "str" } else { "int" };
            assert_eq!(
                signature.label,
                format!("def compute(value: {expected}) -> {expected}")
            );
        }
        analysis.update_file(source, "untouched = 42\nmalformed(\n".to_owned());
        let snapshot = analysis.snapshot();
        let diagnostics = snapshot.diagnostics(caller).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        assert!(!snapshot.diagnostics(source).unwrap().is_empty());
        let locations = snapshot
            .goto_definition(
                FilePosition {
                    file_id: caller,
                    pos: (caller_text.rfind("compute").unwrap() as u32).into(),
                },
                false,
            )
            .unwrap()
            .unwrap();
        let [LocationLink::Local {
            target_file_id,
            origin_selection_range: _,
            target_range: _,
            target_selection_range: _,
        }] = locations.as_slice()
        else {
            panic!("{locations:?}")
        };
        assert_eq!(*target_file_id, interface.source);
    }

    #[test]
    fn navigation_retains_the_loaded_source_and_reexport_policy() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let first = fixture.add_file(&mut analysis.db, "first.bzl", "def compute(): pass\n");
        let origin = fixture.add_file(&mut analysis.db, "origin.bzl", "def original(): pass\n");
        let second = fixture.add_file(
            &mut analysis.db,
            "second.bzl",
            "load(\"origin.bzl\", \"original\")\ncompute = original\n",
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "shared.bzli",
            "def compute(value: int) -> int: ...\n",
        );
        let text = "load(\"second.bzl\", \"compute\")\ncompute(1)\n";
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", text);
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_type_interfaces([(first, interface), (second, interface)])
            .unwrap();
        let snapshot = analysis.snapshot();
        for (skip, expected) in [(false, second), (true, origin)] {
            let locations = snapshot
                .goto_definition(
                    FilePosition {
                        file_id: caller,
                        pos: (text.rfind("compute").unwrap() as u32).into(),
                    },
                    skip,
                )
                .unwrap()
                .unwrap();
            let [LocationLink::Local {
                target_file_id,
                origin_selection_range: _,
                target_range: _,
                target_selection_range: _,
            }] = locations.as_slice()
            else {
                panic!("{locations:?}")
            };
            assert_eq!(*target_file_id, expected.source);
        }
    }

    #[test]
    fn interface_imports_preserve_original_nominal_provider_identity() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "Info = provider(fields=[])\ndef consume(): pass\n",
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "load(\"source.bzl\", Original=\"Info\")\ndef Info() -> Original: ...\ndef consume(value: Original) -> Original: ...\n",
        );
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", "load(\"source.bzl\", \"Info\", \"consume\")\nOther = provider(fields=[])\nresult = consume(Info())\nconsume(Other())\n");
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        let snapshot = analysis.snapshot();
        let diagnostics = snapshot.diagnostics(interface).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        let diagnostics = snapshot.diagnostics(caller).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}")
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
    }
}
