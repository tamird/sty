//! Optional annotation policy over the same contracts used by inference.

use ruff_db::diagnostic::Annotation;
use ruff_db::diagnostic::Diagnostic;
use ruff_db::diagnostic::DiagnosticId;
use ruff_db::diagnostic::Severity;
use ruff_db::diagnostic::Span;
use ruff_python_ast::statement_visitor;
use ruff_python_ast::statement_visitor::StatementVisitor;
use ruff_python_ast::AnyRootNodeRef;
use ruff_python_ast::HasNodeIndex;
use ruff_python_ast::NodeIndex;
use ruff_python_ast::Stmt;
use ruff_python_ast::StmtFunctionDef;
use ruff_text_size::Ranged;
use ruff_text_size::TextRange;
use starpls_common::File;
use ty_python_core::Db as _;
use ty_python_core::ProvidedAnnotation;
use ty_python_semantic::lint::LintMetadata;
use ty_python_semantic::Db as _;
use ty_python_semantic::SemanticModel;

use super::diagnostics::MISSING_PARAMETER_ANNOTATION;
use super::diagnostics::MISSING_RETURN_ANNOTATION;
use crate::Database;

pub(super) fn diagnostics(db: &Database, file: File) -> Vec<Diagnostic> {
    let rules = db.rule_selection(file.source);
    let enabled = |name| rules.enabled().any(|lint| lint.name() == name);
    let parameters = enabled(MISSING_PARAMETER_ANNOTATION.name());
    let returns = enabled(MISSING_RETURN_ANNOTATION.name());
    if !parameters && !returns {
        return Vec::new();
    }
    let program = db.starlark_program_file(file);
    let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
    let mut visitor = AnnotationChecks {
        db,
        file,
        model: SemanticModel::new(db, program),
        parameters,
        returns,
        diagnostics: Vec::new(),
    };
    for statement in parsed.suite() {
        visitor.visit_stmt(statement);
    }
    visitor.diagnostics
}

struct AnnotationChecks<'db> {
    db: &'db Database,
    file: File,
    model: SemanticModel<'db>,
    parameters: bool,
    returns: bool,
    diagnostics: Vec<Diagnostic>,
}

impl AnnotationChecks<'_> {
    fn has_provided_annotation(&self, owner: NodeIndex) -> bool {
        let Some(annotation) = self
            .db
            .provided_annotation(self.model.program_file(), owner)
        else {
            return false;
        };
        match annotation {
            ProvidedAnnotation::Range(_) => true,
            ProvidedAnnotation::External { file, owner } => {
                let parsed = ruff_db::parsed::parsed_module(self.db, file.python_file(self.db))
                    .load(self.db);
                match parsed.get_by_index(owner) {
                    AnyRootNodeRef::Stmt(statement) => statement
                        .as_function_def_stmt()
                        .is_some_and(|function| function.returns.is_some()),
                    AnyRootNodeRef::Parameter(parameter) => parameter.annotation.is_some(),
                    _ => false,
                }
            }
        }
    }

    fn report(&mut self, range: TextRange, lint: &'static LintMetadata, message: String) {
        let mut diagnostic =
            Diagnostic::new(DiagnosticId::Lint(lint.name()), Severity::Warning, message);
        diagnostic.annotate(Annotation::primary(
            Span::from(self.file.source).with_range(range),
        ));
        self.diagnostics.push(diagnostic);
    }

    fn check_function(&mut self, function: &StmtFunctionDef) {
        let db = self.db;
        let index = ty_python_core::semantic_index(db, self.model.program_file());
        let Some(definitions) = index.try_definitions(function.into()) else {
            return;
        };
        let [definition] = definitions else {
            return;
        };
        if self.returns
            && function.returns.is_none()
            && !self.has_provided_annotation(function.node_index().load())
            && db.provided_function_return_type(*definition).is_none()
        {
            self.report(
                function.name.range(),
                &MISSING_RETURN_ANNOTATION,
                format!("Function `{}` has no return type annotation", function.name),
            );
        }
        if !self.parameters {
            return;
        }
        let method =
            definition.scope(db).scope(db).kind() == ty_python_core::scope::ScopeKind::Class;
        for (position, parameter) in function.parameters.iter().enumerate() {
            let parameter = parameter.as_parameter();
            let Some(definitions) = index.try_definitions(parameter.into()) else {
                continue;
            };
            let [definition] = definitions else {
                continue;
            };
            if parameter.annotation.is_some()
                || self.has_provided_annotation(parameter.node_index().load())
                || db.provided_parameter_type(*definition).is_some()
            {
                continue;
            }
            // ty supplies implicit method receivers. Their members can be gradual without
            // making the receiver annotation missing. Static and variadic parameters still
            // require annotations of their own.
            if method
                && position == 0
                && !function.parameters.args.is_empty()
                && !matches!(
                    self.model.definition_type(*definition),
                    ty_python_semantic::types::Type::Dynamic(_)
                        | ty_python_semantic::types::Type::Divergent(_)
                )
            {
                continue;
            }
            self.report(
                parameter.name.range(),
                &MISSING_PARAMETER_ANNOTATION,
                format!("Parameter `{}` has no type annotation", parameter.name),
            );
        }
    }
}

impl<'ast> StatementVisitor<'ast> for AnnotationChecks<'_> {
    fn visit_stmt(&mut self, statement: &'ast Stmt) {
        if let Stmt::FunctionDef(function) = statement {
            self.check_function(function);
        }
        statement_visitor::walk_stmt(self, statement);
    }
}

#[cfg(test)]
mod tests {
    use ruff_db::diagnostic::Severity;
    use starpls_hir::Fixture;

    use crate::Analysis;
    use crate::DiagnosticRules;

    fn rules(level: &str) -> DiagnosticRules {
        DiagnosticRules::from_settings(
            &[
                ("missing-parameter-annotation".into(), level.into()),
                ("missing-return-annotation".into(), level.into()),
            ]
            .into(),
        )
        .unwrap()
    }

    #[test]
    fn policy_changes_levels_and_uses_native_suppressions() {
        let (mut analysis, fixture) =
            Analysis::from_single_file_fixture("def identity(value):\n    return value\n");
        let file = fixture.main_file();
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
        for (level, severity) in [("warn", Severity::Warning), ("error", Severity::Error)] {
            analysis.set_rules(rules(level));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
            assert!(
                diagnostics.iter().all(|d| d.severity() == severity),
                "{diagnostics:?}"
            );
        }
        analysis.update_file(file, "def identity(value):  # ty: ignore[missing-parameter-annotation, missing-return-annotation]\n    return value\n".into());
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
        analysis.update_file(file, "def identity(value: str) -> str:  # ty: ignore[missing-parameter-annotation, missing-return-annotation]\n    return value\n".into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            diagnostics
                .iter()
                .all(|d| d.id().as_str() == "unused-ignore-comment"),
            "{diagnostics:?}"
        );
        assert!(!diagnostics.is_empty());
        analysis.set_rules(rules("ignore"));
        analysis.update_file(file, "def identity(value):\n    return value\n".into());
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
        analysis.update_file(
            file,
            "def consume(value: list) -> None:\n    print(value)\n".into(),
        );
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
        analysis.set_rules(
            DiagnosticRules::from_settings(
                &[("missing-type-argument".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "missing-type-argument");
        assert_eq!(diagnostics[0].severity(), Severity::Error);
        analysis.set_rules(DiagnosticRules::default());
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
        for (name, level) in [
            ("missing-paramter-annotation", "error"),
            ("missing-parameter-annotation", "warning"),
        ] {
            assert!(DiagnosticRules::from_settings(&[(name.into(), level.into())].into()).is_err());
        }
    }

    #[test]
    fn annotation_policy_covers_private_nested_and_variadic_parameters() {
        let source = "def outer(value: int) -> int:\n    def _inner(default=1, *args, **kwargs):\n        return default\n    return _inner(value)\n";
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        let file = fixture.main_file();
        analysis.set_rules(rules("error"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let missing: Vec<_> = diagnostics
            .iter()
            .filter(|d| d.id().as_str().starts_with("missing-"))
            .collect();
        assert_eq!(missing.len(), 4, "{diagnostics:?}");
        analysis.update_file(file, "def identity(\n    value,  # type: list[str]\n):  # type: (...) -> list[str]\n    return value\n".into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_rules(
            DiagnosticRules::from_settings(
                &[("missing-parameter-annotation".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        analysis.update_file(file, "def identity(value: str):\n    return value\n".into());
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
    }

    #[test]
    fn callable_type_comments_check_inputs_and_bodies() {
        let signature =
            "def rewrite(value, callback):\n    # type: (str, Callable[[str], str]) -> str\n";
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
        let file = fixture.main_file();
        analysis.set_rules(rules("error"));
        for (body, call, expected) in [
            (
                "return callback(value)",
                "rewrite('ok', lambda text: text.upper())",
                None,
            ),
            (
                "return callback(value)",
                "rewrite(42, lambda text: text)",
                Some("invalid-argument-type"),
            ),
            (
                "return callback(value)",
                "rewrite('ok', lambda text: 42)",
                Some("invalid-argument-type"),
            ),
            ("return callback(42)", "", Some("invalid-argument-type")),
            ("return 42", "", Some("invalid-return-type")),
        ] {
            analysis.update_file(file, format!("{signature}    {body}\n{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            assert_eq!(
                ids,
                expected.into_iter().collect::<Vec<_>>(),
                "{body}; {call}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn dictionary_shape_type_comments_check_list_elements() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
        let file = fixture.main_file();
        for (element, expected) in [
            (r#"{"name": "ok"}"#, None),
            (r#"{"name": "ok", "aliases": ["other"]}"#, None),
            (r#"{"name": 1}"#, Some("invalid-argument-type")),
            (r#"{"aliases": ["other"]}"#, Some("invalid-assignment")),
        ] {
            analysis.update_file(
                file,
                format!(
                    r#"def consume(value):
    # type: (str) -> None
    pass
items = [{element}]  # type: list[dict[{{"name": str, "aliases": NotRequired[list[str]]}}]]
consume(items[0]["name"])
"#
                ),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            match expected {
                Some(expected) => assert!(
                    diagnostics.iter().any(|d| d.id().as_str() == expected),
                    "{diagnostics:?}"
                ),
                None => assert!(diagnostics.is_empty(), "{diagnostics:?}"),
            }
        }
    }

    #[test]
    fn literal_type_comments_check_callers_and_bodies() {
        let signature = "def configure(operations, enabled, code):\n    # type: (Mapping[str, Literal['set', 'extend']], Literal[True], Literal[1, -1]) -> Literal['split']\n";
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("");
        let file = fixture.main_file();
        analysis.set_rules(rules("error"));
        for (body, call, expected) in [
            (
                "return 'split'",
                "configure({'flag': 'set'}, True, -1)",
                None,
            ),
            (
                "return 'split'",
                "configure({'flag': 'other'}, True, -1)",
                Some("invalid-argument-type"),
            ),
            ("return 'ordinary'", "", Some("invalid-return-type")),
        ] {
            analysis.update_file(file, format!("{signature}    {body}\n{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(
                diagnostics
                    .iter()
                    .map(|diagnostic| diagnostic.id().as_str())
                    .collect::<Vec<_>>(),
                expected.into_iter().collect::<Vec<_>>(),
                "{body}; {call}: {diagnostics:?}"
            );
        }
        analysis.update_file(file, "value = -1  # type: Literal[-]\n".into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            diagnostics.iter().any(|diagnostic| {
                diagnostic.id().as_str() == "invalid-syntax"
                    && diagnostic.headline_message() == "Expected numeric literal"
            }),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn annotation_policy_accepts_provider_initializer_contracts() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let source = fixture.add_file(&mut analysis.db, "info.bzl", "def _init(value):\n    return {'value': value}\nInfo, _raw = provider(fields=['value'], init=_init)\n");
        let stub = fixture.add_file(
            &mut analysis.db,
            "info.bzli",
            "def Info(value: str) -> record[{'value': str}]: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        analysis.set_rules(rules("error"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn effective_interface_slots_follow_edits_without_hiding_body_errors() {
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
        analysis.set_rules(rules("error"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        let ids: Vec<_> = diagnostics.iter().map(|d| d.id().as_str()).collect();
        assert_eq!(ids, ["unsupported-operator"], "{diagnostics:?}");
        for (text, expected) in [
            (
                "def convert(value: int): ...\n",
                "missing-return-annotation",
            ),
            (
                "def convert(value) -> int: ...\n",
                "missing-parameter-annotation",
            ),
        ] {
            analysis.update_file(stub, text.into());
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            let missing: Vec<_> = diagnostics
                .iter()
                .filter(|d| d.id().as_str().starts_with("missing-"))
                .map(|d| d.id().as_str())
                .collect();
            assert_eq!(missing, [expected], "{diagnostics:?}");
        }
        analysis.update_file(stub, "class Visitor[T](Protocol):\n    def visit(self, value: T) -> T: ...\nclass Callback[T](Protocol):\n    def __call__(self, *args: Unknown, data: T, **kwargs: Unknown) -> None: ...\nclass Variadic(Protocol):\n    def __call__(*args) -> None: ...\ndef convert(self) -> int: ...\n".into());
        let diagnostics = analysis.snapshot().diagnostics(stub).unwrap();
        assert!(
            diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() != "invalid-syntax"),
            "{diagnostics:?}"
        );
        let missing: Vec<_> = diagnostics
            .iter()
            .filter(|d| d.id().as_str() == "missing-parameter-annotation")
            .map(|d| d.headline_message())
            .collect();
        assert_eq!(missing.len(), 2, "{diagnostics:?}");
        for name in ["self", "args"] {
            assert!(
                missing
                    .iter()
                    .any(|message| message.contains(&format!("`{name}`"))),
                "{diagnostics:?}"
            );
        }
        analysis.update_file(stub, "class Invalid:\n    def unfinished(\n".into());
        let diagnostics = analysis.snapshot().diagnostics(stub).unwrap();
        assert!(!diagnostics.is_empty());
    }
}
