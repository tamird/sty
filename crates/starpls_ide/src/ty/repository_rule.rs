//! Bazel repository rules selected in MODULE.bazel.

use std::collections::HashSet;

use ruff_db::diagnostic::Annotation;
use ruff_db::diagnostic::Diagnostic;
use ruff_db::diagnostic::DiagnosticId;
use ruff_db::diagnostic::Severity;
use ruff_db::diagnostic::Span;
use ruff_python_ast::name::Name;
use ruff_python_ast::visitor;
use ruff_python_ast::visitor::Visitor;
use ruff_python_ast::Expr;
use ruff_python_ast::ExprCall;
use ruff_python_ast::ExprRef;
use ruff_text_size::Ranged;
use ruff_text_size::TextRange;
use starpls_bazel::APIContext;
use starpls_common::Dialect;
use starpls_common::File;
use starpls_hir::Db as _;
use ty_python_core::ProgramFile;
use ty_python_semantic::provided::BuiltinUsage;
use ty_python_semantic::provided::ProvidedBindingValue;
use ty_python_semantic::provided::ProvidedClass;
use ty_python_semantic::provided::ProvidedData;
use ty_python_semantic::provided::ProvidedInstanceFields;
use ty_python_semantic::types::ide_support::unreachable_ranges;
use ty_python_semantic::types::CheckedArgument;
use ty_python_semantic::types::CheckedCall;
use ty_python_semantic::types::KnownClass;
use ty_python_semantic::types::Parameter;
use ty_python_semantic::types::ParameterKind;
use ty_python_semantic::types::Parameters;
use ty_python_semantic::types::Type;
use ty_python_semantic::HasType;
use ty_python_semantic::ProgramEnvironment;
use ty_python_semantic::SemanticModel;

use super::factory;
use super::load;
use super::native::REPOSITORY_RULE_PROXY_TYPE;
use crate::Database;

#[derive(Debug, Eq, PartialEq, Hash, get_size2::GetSize)]
struct Selection {
    #[get_size(ignore)]
    source: File,
    range: TextRange,
    label: Box<str>,
    name: Name,
}

pub(super) fn proxy<'db>(db: &'db Database, call: &CheckedCall<'_, 'db>) -> Option<Type<'db>> {
    if call.has_binding_errors() {
        return None;
    }
    let source = db.starlark_file(call.file())?;
    if source.dialect != Dialect::Bazel || source.api_context() != Some(APIContext::Module) {
        return None;
    }
    let environment = ProgramEnvironment::from_file(call.file());
    let declarations = call.declaration()?.program_file(db);
    let base = factory::native_class(db, declarations, REPOSITORY_RULE_PROXY_TYPE)?;
    if call.return_type() != base.to_instance_approximation(db, &environment)? {
        return None;
    }
    let CheckedArgument::Value { ty: label, .. } = call.argument_at(0) else {
        return None;
    };
    let CheckedArgument::Value { ty: name, .. } = call.argument_at(1) else {
        return None;
    };
    factory::descriptor(
        db,
        call,
        REPOSITORY_RULE_PROXY_TYPE,
        ProvidedData::new(Selection {
            source,
            range: call.call().range(),
            label: label.string_literal_value(db)?.into(),
            name: Name::new(name.string_literal_value(db)?),
        }),
    )
}

pub(super) fn call_target<'db>(
    db: &'db Database,
    file: ProgramFile<'db>,
    call: &ExprCall,
    class: Type<'db>,
    data: &ProvidedData,
) -> Result<Option<Type<'db>>, Diagnostic> {
    let Some(selection) = data.downcast_ref::<Selection>() else {
        return Ok(None);
    };
    if !definitely_active(call) {
        return Ok(None);
    }
    let Some(selected) = selection.export(db, file, call)? else {
        return Ok(None);
    };
    let environment = ProgramEnvironment::from_file(file);
    let Some(expected) = db
        .language_builtin(file, "repository_rule", BuiltinUsage::Annotation)
        .and_then(|binding| binding.resolve_type(db))
        .and_then(|class| class.to_instance_approximation(db, &environment))
    else {
        return Ok(None);
    };
    if selected.is_disjoint_from(db, &environment, expected) {
        return Err(selection.diagnostic(
            db,
            file,
            call,
            format!(
                "Selected export `{}` has type `{}`, expected a repository rule",
                selection.name,
                selected.display(db, &environment),
            ),
        ));
    }
    if !selected.is_subtype_of(db, &environment, expected) {
        return Ok(None);
    }
    let Some(signature) = selected.single_callable_signature(db, &environment) else {
        return Ok(None);
    };
    if !signature.parameters().is_standard() {
        return Ok(None);
    }
    let mut parameters = vec![
        Parameter::positional_only(Some(Name::new_static("self"))),
        Parameter::keyword_only(Name::new_static("dev_dependency"))
            .with_annotated_type(KnownClass::Bool.to_instance(db, &environment))
            .with_default_type(Type::bool_literal(false)),
    ];
    for parameter in signature.parameters().iter() {
        match parameter.kind() {
            ParameterKind::KeywordOnly { name, default_type } => {
                if name == "dev_dependency" {
                    if default_type.is_none() {
                        return Err(selection.diagnostic(
                            db,
                            file,
                            call,
                            format!(
                                "Repository rule `{}` requires `dev_dependency`, but `use_repo_rule` consumes that attribute",
                                selection.name,
                            ),
                        ));
                    }
                    continue;
                }
            }
            ParameterKind::KeywordVariadic { name: _ } => {}
            ParameterKind::PositionalOnly {
                name: _,
                default_type: _,
            } => return Ok(None),
            ParameterKind::PositionalOrKeyword {
                name: _,
                default_type: _,
            } => return Ok(None),
            ParameterKind::Variadic { name: _ } => return Ok(None),
        }
        parameters.push(parameter.clone());
    }
    let signature = signature
        .clone()
        .with_parameters(Parameters::standard(parameters))
        .with_return_type(Type::none(db, &environment));
    let Some(refined) = (ProvidedClass {
        name: Name::new(REPOSITORY_RULE_PROXY_TYPE),
        bases: Box::from([class]),
        class_members: Box::from([(
            Name::new_static("__call__"),
            Type::function_like_callable(db, signature),
        )]),
        instance_fields: ProvidedInstanceFields {
            data: Some(data.clone()),
            ..ProvidedInstanceFields::default()
        }
        .into(),
    })
    .into_type_at_expression(db, file, ExprRef::Call(call)) else {
        return Ok(None);
    };
    Ok(refined.to_instance_approximation(db, &environment))
}

impl Selection {
    fn is_visible(&self, db: &Database) -> Option<bool> {
        if !self.name.starts_with('_') {
            return Some(true);
        }
        // Bazel 7 and 8 admitted private globals. Bazel 9 rejected them after
        // c538f4e6f305, but the tracked major/minor version cannot distinguish
        // early 9.0 prereleases from versions containing that fix.
        let version = db
            .get_builtin_defs(&self.source.dialect)
            .bazel_version(db)
            .as_ref()?;
        if version.at_least(9, 1) {
            Some(false)
        } else if version.at_least(9, 0) {
            None
        } else {
            Some(true)
        }
    }

    fn export<'db>(
        &self,
        db: &'db Database,
        caller: ProgramFile<'db>,
        call: &ExprCall,
    ) -> Result<Option<Type<'db>>, Diagnostic> {
        let missing_export = || {
            self.diagnostic(
                db,
                caller,
                call,
                format!("Selected source does not export `{}`", self.name),
            )
        };
        match self.is_visible(db) {
            Some(true) => {}
            Some(false) => return Err(missing_export()),
            None => return Ok(None),
        }
        let loaded = match load::resolve_dependency(db, self.source, &self.label) {
            load::LoadResolution::Resolved(file) => file,
            load::LoadResolution::Pending => return Ok(None),
            load::LoadResolution::Failed(cause) => {
                return Err(self.with_provenance(
                    db,
                    caller,
                    call,
                    load::failed_load_error(&self.label, &cause),
                ));
            }
        };
        if loaded.source == self.source.source {
            return Ok(None);
        }
        let file = db.starlark_program_file(loaded);
        if db.load_export_file(self.source, loaded, &self.name) != file {
            return Ok(None);
        }
        let selected = (!load::is_loaded_alias(db, file, &self.name))
            .then(|| ProvidedBindingValue::Export {
                file,
                name: self.name.clone(),
                value: None,
            })
            .and_then(|binding| binding.resolve_type(db));
        selected.map(Some).ok_or_else(missing_export)
    }

    fn diagnostic(
        &self,
        db: &Database,
        caller: ProgramFile<'_>,
        call: &ExprCall,
        message: String,
    ) -> Diagnostic {
        self.with_provenance(
            db,
            caller,
            call,
            Diagnostic::new(
                DiagnosticId::lint("invalid-argument-type"),
                Severity::Error,
                message,
            ),
        )
    }

    fn with_provenance(
        &self,
        db: &Database,
        caller: ProgramFile<'_>,
        call: &ExprCall,
        mut diagnostic: Diagnostic,
    ) -> Diagnostic {
        diagnostic.annotate(Annotation::primary(
            Span::from(caller.file(db)).with_range(call.func.range()),
        ));
        diagnostic.annotate(
            Annotation::secondary(Span::from(self.source.source).with_range(self.range))
                .message("Repository rule selected here"),
        );
        diagnostic
    }
}

/// Read the selected repository rule from each active call's inferred callee. Recording
/// edges while checking its arguments would accumulate values inside ty's inference cycles.
pub(crate) fn dependencies(db: &Database, file: File) -> Vec<(File, load::LoadDependency)> {
    if file.api_context() != Some(APIContext::Module) {
        return Vec::new();
    }
    let program = db.starlark_program_file(file);
    let mut calls = RepositoryRuleCalls {
        db,
        model: SemanticModel::new(db, program),
        seen: HashSet::new(),
        dependencies: Vec::new(),
    };
    calls.visit_body(starpls_common::parsed_module(db, file).load(db).suite());
    calls.dependencies
}

struct RepositoryRuleCalls<'db> {
    db: &'db Database,
    model: SemanticModel<'db>,
    seen: HashSet<(File, TextRange)>,
    dependencies: Vec<(File, load::LoadDependency)>,
}

impl RepositoryRuleCalls<'_> {
    fn dependency(&mut self, call: &ExprCall) -> Option<(File, load::LoadDependency)> {
        if !definitely_active(call) {
            return None;
        }
        let callee @ Type::NominalInstance(_) = call.func.inferred_type(&self.model)? else {
            return None;
        };
        let program = self.model.program_file();
        let selection = callee
            .provided_data(self.db, &ProgramEnvironment::from_file(program))?
            .downcast_ref::<Selection>()?;
        if selection.is_visible(self.db) != Some(true)
            || unreachable_ranges(self.db, program)
                .iter()
                .any(|entry| entry.range.contains_range(call.range()))
            || !self.seen.insert((selection.source, selection.range))
        {
            return None;
        }
        Some((
            selection.source,
            load::LoadDependency {
                module: selection.label.clone(),
                range: selection.range,
                resolution: load::resolve_dependency(self.db, selection.source, &selection.label),
            },
        ))
    }
}

impl<'ast> Visitor<'ast> for RepositoryRuleCalls<'_> {
    fn visit_expr(&mut self, expression: &'ast Expr) {
        if let Expr::Call(call) = expression {
            if let Some(dependency) = self.dependency(call) {
                self.dependencies.push(dependency);
            }
        }
        visitor::walk_expr(self, expression);
    }
}

fn definitely_active(call: &ExprCall) -> bool {
    if !call.arguments.args.is_empty() {
        return false;
    }
    let mut seen = HashSet::new();
    let mut name = None;
    for keyword in &call.arguments.keywords {
        let Some(argument) = keyword.arg.as_ref().map(|name| name.as_str()) else {
            return false;
        };
        if !seen.insert(argument) {
            return false;
        }
        if argument == "name" {
            let Expr::StringLiteral(literal) = &keyword.value else {
                return false;
            };
            name = Some(literal.value.to_str());
        } else if argument == "dev_dependency"
            && !matches!(&keyword.value, Expr::BooleanLiteral(literal) if !literal.value)
        {
            return false;
        }
    }
    name.is_some_and(definitely_valid_repository_name)
}

// Bazel validates the repository name before creating an extension usage.
// This common subset is accepted by all supported Bazel releases.
fn definitely_valid_repository_name(name: &str) -> bool {
    let mut bytes = name.bytes();
    bytes.next().is_some_and(|byte| byte.is_ascii_alphabetic())
        && bytes.all(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'-' | b'.'))
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeSet;

    use starpls_bazel::APIContext;
    use starpls_common::Dialect;
    use starpls_common::FileInfo;

    use crate::Analysis;
    use crate::DiagnosticRules;
    use crate::FilePosition;

    #[test]
    fn active_repository_proxy_checks_the_selected_export() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        fixture.add_file(
            &mut analysis.db,
            "good.bzl",
            r#"def _impl(ctx): pass
repository = repository_rule(implementation=_impl, attrs={'value': attr.string(mandatory=True), 'platforms': attr.string_list()})
optional_dev = repository_rule(implementation=_impl, attrs={'dev_dependency': attr.string(default='fallback')})
required_dev = repository_rule(implementation=_impl, attrs={'dev_dependency': attr.string(mandatory=True)})
"#,
        );
        fixture.add_file(
            &mut analysis.db,
            "not_rule.bzl",
            "def ordinary(name): pass\n",
        );
        let direct_source = "load('good.bzl', 'repository')\nrepository(name='direct', value=42)\n";
        let direct = fixture.add_file_with_options(
            &mut analysis.db,
            "WORKSPACE",
            direct_source,
            Dialect::Bazel,
            Some(FileInfo::Bazel {
                api_context: APIContext::Workspace,
                is_external: false,
                bundled_cc_common: false,
            }),
        );
        let source = r#"choose = use_repo_rule
repository = choose('good.bzl', 'repository')
repository(name='ok', value='value')
repository(name='wrong', value=42)
platforms = ['linux/amd64']
repository(name='images', value='ok', platforms=platforms)
repository(name='wrong_platforms', value='ok', platforms=42)
optional_dev = choose('good.bzl', 'optional_dev')
optional_dev(name='optional', dev_dependency=False)
optional_dev(name='invalid_host', dev_dependency='wrong')
required_dev = choose('good.bzl', 'required_dev')
required_dev(name='required')
invalid = use_repo_rule('not_rule.bzl', 'ordinary')
copied = invalid
copied(name='bad')
missing = use_repo_rule('good.bzl', 'missing')
missing(name='missing')
unused = use_repo_rule('unused.bzl', 'ordinary')
ignored = use_repo_rule('ignored.bzl', 'ordinary')
ignored(name='skip', dev_dependency=True, value='gradual')
malformed = use_repo_rule('malformed.bzl', 'ordinary')
malformed(name=42)
unavailable = use_repo_rule('unavailable.bzl', 'ordinary')
unavailable(name='unavailable')
unavailable(name='suppressed')  # ty: ignore[load-error]
"#;
        let module = fixture.add_file_with_options(
            &mut analysis.db,
            "MODULE.bazel",
            source,
            Dialect::Bazel,
            Some(FileInfo::Bazel {
                api_context: APIContext::Module,
                is_external: false,
                bundled_cc_common: false,
            }),
        );
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
        let snapshot = analysis.snapshot();
        let signature = snapshot
            .signature_help(FilePosition {
                file_id: module,
                pos: u32::try_from(source.find("value='value'").unwrap() + "value=".len())
                    .unwrap()
                    .into(),
            })
            .unwrap()
            .unwrap();
        let [signature] = signature.signatures.as_slice() else {
            panic!("{signature:?}");
        };
        for parameter in ["name: str", "dev_dependency: bool", "value: str"] {
            assert!(signature.label.contains(parameter), "{signature:?}");
        }
        let diagnostics = snapshot.diagnostics(module).unwrap();
        let direct_diagnostics = snapshot.diagnostics(direct).unwrap();
        assert!(
            direct_diagnostics.iter().any(|diagnostic| {
                diagnostic.id().as_str() == "invalid-argument-type"
                    && &direct_source[diagnostic.range().unwrap()] == "value=42"
            }),
            "{direct_diagnostics:?}"
        );
        let actual = diagnostics
            .iter()
            .map(|diagnostic| {
                (
                    diagnostic.id().as_str(),
                    &source[diagnostic.range().unwrap()],
                )
            })
            .collect::<Vec<_>>();
        assert_eq!(
            actual,
            [
                ("invalid-argument-type", "value=42"),
                ("invalid-argument-type", "platforms=42"),
                ("invalid-argument-type", "dev_dependency='wrong'"),
                ("invalid-argument-type", "required_dev"),
                ("invalid-argument-type", "copied"),
                ("invalid-argument-type", "missing"),
                ("invalid-argument-type", "name=42"),
                ("load-error", "unavailable"),
            ],
            "{diagnostics:?}",
        );
        assert_eq!(
            loader
                .requests
                .lock()
                .unwrap()
                .iter()
                .cloned()
                .collect::<BTreeSet<_>>(),
            BTreeSet::from([
                "good.bzl".to_owned(),
                "not_rule.bzl".to_owned(),
                "unavailable.bzl".to_owned(),
            ]),
        );
        drop(snapshot);
        analysis.set_rules(
            DiagnosticRules::from_settings(&[("non-static-type".into(), "error".into())].into())
                .unwrap(),
        );
        let strict = analysis.snapshot().diagnostics(module).unwrap();
        let non_static_at = |text: &str| {
            let offset = source.find(text).unwrap();
            strict.iter().any(|diagnostic| {
                diagnostic.id().as_str() == "non-static-type"
                    && diagnostic
                        .range()
                        .is_some_and(|range| usize::from(range.start()) == offset)
            })
        };
        assert!(!non_static_at("repository(name='ok'"), "{strict:?}");
        assert!(non_static_at("ignored(name='skip'"), "{strict:?}");
    }

    #[test]
    fn private_repository_proxy_follows_bazel_version() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        fixture.add_file(
            &mut analysis.db,
            "private.bzl",
            "def _impl(ctx): pass\n_private = repository_rule(implementation=_impl, attrs={'value': attr.string()})\n",
        );
        let source = "private = use_repo_rule('private.bzl', '_private')\nprivate(name='example', value=42)\n";
        let module = fixture.add_file_with_options(
            &mut analysis.db,
            "MODULE.bazel",
            source,
            Dialect::Bazel,
            Some(FileInfo::Bazel {
                api_context: APIContext::Module,
                is_external: false,
                bundled_cc_common: false,
            }),
        );
        loader.add_files_from_fixture(&fixture);
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        for (release, expected_range, acquired) in [
            ("development version", None, false),
            ("release 8.0.0", Some("value=42"), true),
            ("release 9.0.0", None, false),
            ("release 9.1.0", Some("private"), false),
        ] {
            loader.requests.lock().unwrap().clear();
            analysis
                .set_builtin_defs_with_release(builtins.clone(), Default::default(), release)
                .unwrap();
            let snapshot = analysis.snapshot();
            let diagnostics = snapshot.diagnostics(module).unwrap();
            assert_eq!(
                diagnostics.len(),
                usize::from(expected_range.is_some()),
                "{release}: {diagnostics:?}"
            );
            if let Some(expected_range) = expected_range {
                assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
                assert_eq!(&source[diagnostics[0].range().unwrap()], expected_range);
            }
            let loads = snapshot.diagnostic_loads(module).unwrap();
            assert_eq!(loads.len(), usize::from(acquired), "{release}: {loads:?}");
            assert_eq!(
                loader
                    .requests
                    .lock()
                    .unwrap()
                    .iter()
                    .any(|path| path == "private.bzl"),
                acquired,
                "{release}"
            );
        }
    }
}
