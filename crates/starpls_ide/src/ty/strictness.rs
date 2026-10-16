//! Optional completeness checks over Ty's inferred types.

use ruff_db::diagnostic::Annotation;
use ruff_db::diagnostic::Diagnostic;
use ruff_db::diagnostic::DiagnosticId;
use ruff_db::diagnostic::Severity;
use ruff_db::diagnostic::Span;
use ruff_python_ast::visitor;
use ruff_python_ast::visitor::Visitor;
use ruff_python_ast::AnyNodeRef;
use ruff_python_ast::Expr;
use ruff_python_ast::ExprContext;
use ruff_python_ast::HasNodeIndex;
use ruff_python_ast::NodeIndex;
use ruff_python_ast::Parameter;
use ruff_python_ast::Stmt;
use ruff_python_ast::TypeParam;
use ruff_text_size::Ranged;
use ruff_text_size::TextRange;
use starpls_common::File;
use ty_python_core::definition::Definition;
use ty_python_semantic::lint::LintMetadata;
use ty_python_semantic::types::ide_support::call_input_types;
use ty_python_semantic::types::ide_support::CallInputError;
use ty_python_semantic::types::Type;
use ty_python_semantic::Db as _;
use ty_python_semantic::HasType;
use ty_python_semantic::SemanticModel;

use super::diagnostics::EXPLICIT_ANY;
use super::diagnostics::NON_STATIC_TYPE;
use crate::Database;

pub(super) fn diagnostics(db: &Database, file: File) -> Vec<Diagnostic> {
    let rules = db.rule_selection(file.source);
    let enabled = |name| rules.enabled().any(|lint| lint.name() == name);
    let explicit_any = enabled(EXPLICIT_ANY.name());
    let non_static = enabled(NON_STATIC_TYPE.name());
    if !explicit_any && !non_static {
        return Vec::new();
    }
    let program = db.starlark_program_file(file);
    let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
    let model = SemanticModel::new(db, program);
    let mut checks = Checks {
        db,
        file,
        model: &model,
        explicit_any,
        non_static,
        diagnostics: Vec::new(),
    };
    checks.visit_body(parsed.suite());
    checks.diagnostics
}

struct Checks<'a, 'db> {
    db: &'db Database,
    file: File,
    model: &'a SemanticModel<'db>,
    explicit_any: bool,
    non_static: bool,
    diagnostics: Vec<Diagnostic>,
}

impl<'db> Checks<'_, 'db> {
    fn definition(&self, node: AnyNodeRef<'_>) -> Option<Definition<'db>> {
        let index = ty_python_core::semantic_index(self.db, self.model.program_file());
        let definitions = index.try_definitions(node)?;
        let [definition] = definitions else {
            return None;
        };
        Some(*definition)
    }

    fn report(&mut self, range: TextRange, lint: &'static LintMetadata, message: String) {
        let mut diagnostic =
            Diagnostic::new(DiagnosticId::Lint(lint.name()), Severity::Warning, message);
        diagnostic.annotate(Annotation::primary(
            Span::from(self.file.source).with_range(range),
        ));
        self.diagnostics.push(diagnostic);
    }

    fn check_type(&mut self, range: TextRange, ty: Type<'_>, subject: &str) {
        if !self.non_static {
            return;
        }
        let env = self.model.program_environment();
        // Materialization also inspects lazy function signatures, which the
        // stored-type query skips. Equivalence preserves callable variance and
        // lets Ty handle recursive types and externally visible overloads.
        if !ty.is_fully_static(self.db, &env)
            || !ty.is_equivalent_to(self.db, &env, ty.top_materialization(self.db, &env))
        {
            self.report(
                range,
                &NON_STATIC_TYPE,
                format!(
                    "Cannot establish a fully static type for {subject}: `{}`",
                    ty.display(self.db, &self.model.program_environment())
                ),
            );
        }
    }

    fn check_expression(&mut self, expression: &Expr, subject: &str) {
        if !self.non_static {
            return;
        }
        if let Some(ty) = expression.inferred_type(self.model) {
            self.check_type(expression.range(), ty, subject);
        }
    }

    fn check_call_inputs(&mut self, call: &ruff_python_ast::ExprCall) {
        // Excluded source syntax does not participate in ordinary call inference.
        if self.model.scope(call.into()).is_none() {
            return;
        }
        let env = self.model.program_environment();
        match call_input_types(self.model, call) {
            Ok(arguments) => {
                // A checked invocation need only satisfy the selected contracts for supplied
                // arguments. Subtyping proves that no gradual alternative was needed; the
                // argument values and the checked result are inspected separately below.
                for input in arguments.into_iter().flatten() {
                    if !input
                        .argument_type
                        .is_subtype_of(self.db, &env, input.parameter_type)
                    {
                        self.report(
                            call.func.range(),
                            &NON_STATIC_TYPE,
                            format!(
                                "Cannot establish a fully static input contract for called function: `{}` is not a subtype of `{}`",
                                input.argument_type.display(self.db, &env),
                                input.parameter_type.display(self.db, &env),
                            ),
                        );
                        break;
                    }
                }
            }
            Err(CallInputError::Invalid) => {}
            Err(CallInputError::Incomplete) => {
                // Some valid calls, including overload expansion, do not retain all matched
                // inputs. A fully static whole callable is a stronger proof for those calls.
                if let Some(callee) = call.func.inferred_type(self.model) {
                    self.check_type(call.func.range(), callee, "called function");
                } else {
                    self.report(
                        call.func.range(),
                        &NON_STATIC_TYPE,
                        "Cannot establish fully static input contracts for called function".into(),
                    );
                }
            }
        }
    }

    fn check_provided_annotation(&mut self, owner: NodeIndex) {
        if !self.explicit_any {
            return;
        }
        if let Some((parsed, model)) = self.model.enter_provided_annotation(owner) {
            self.check_annotation(parsed.expr(), &model);
        }
    }

    fn check_annotation(&mut self, expression: &Expr, model: &SemanticModel<'_>) {
        if !self.explicit_any {
            return;
        }
        let mut visitor = AnyAnnotations {
            db: self.db,
            model,
            ranges: Vec::new(),
        };
        visitor.visit_expr(expression);
        for range in visitor.ranges {
            self.report(range, &EXPLICIT_ANY, "Explicit `Any` annotation".into());
        }
    }
}

impl<'ast> Visitor<'ast> for Checks<'_, '_> {
    fn visit_stmt(&mut self, statement: &'ast Stmt) {
        let index = ty_python_core::semantic_index(self.db, self.model.program_file());
        if index.provided_statement_definitions(statement).is_some() {
            // The frontend supplies bindings for imports; their source expressions are not calls.
            return;
        }
        if !self.file.is_type_interface(self.db) {
            if let Stmt::Return(statement) = statement {
                if let Some(value) = &statement.value {
                    self.check_expression(value, "returned value");
                }
            }
        }
        match statement {
            Stmt::FunctionDef(function) => {
                self.check_provided_annotation(function.node_index().load());
                if self.non_static {
                    if let Some(definition) = self.definition(function.into()) {
                        if let Type::FunctionLiteral(function_type) =
                            self.model.definition_type(definition)
                        {
                            for overload in function_type.iter_overloads_and_implementation(self.db)
                            {
                                if overload.definition(self.db) == definition {
                                    self.check_type(
                                        function.name.range(),
                                        overload.signature(self.db).return_type(),
                                        "function return",
                                    );
                                }
                            }
                        }
                    }
                }
            }
            Stmt::TypeAlias(alias) => {
                if let Some(parameters) = &alias.type_params {
                    self.visit_type_params(parameters);
                }
                self.check_annotation(&alias.value, self.model);
                return;
            }
            Stmt::ClassDef(class) => {
                if let Some(arguments) = &class.arguments {
                    for base in &arguments.args {
                        self.check_annotation(base, self.model);
                    }
                    for keyword in &arguments.keywords {
                        if keyword
                            .arg
                            .as_ref()
                            .is_some_and(|name| name == "extra_items")
                        {
                            self.check_annotation(&keyword.value, self.model);
                        }
                    }
                }
            }
            _ => {}
        }
        visitor::walk_stmt(self, statement);
    }

    fn visit_parameter(&mut self, parameter: &'ast Parameter) {
        self.check_provided_annotation(parameter.node_index().load());
        if self.non_static {
            if let Some(definition) = self.definition(parameter.into()) {
                self.check_type(
                    parameter.name.range(),
                    self.model.definition_type(definition),
                    "parameter",
                );
            }
        }
        visitor::walk_parameter(self, parameter);
    }

    fn visit_annotation(&mut self, expression: &'ast Expr) {
        self.check_annotation(expression, self.model);
    }

    fn visit_type_param(&mut self, parameter: &'ast TypeParam) {
        if !self.explicit_any {
            return;
        }
        let mut visitor = AnyAnnotations {
            db: self.db,
            model: self.model,
            ranges: Vec::new(),
        };
        visitor.visit_type_param(parameter);
        for range in visitor.ranges {
            self.report(range, &EXPLICIT_ANY, "Explicit `Any` annotation".into());
        }
    }

    fn visit_expr(&mut self, expression: &'ast Expr) {
        if let Expr::Name(name) = expression {
            if name.ctx == ExprContext::Store {
                self.check_provided_annotation(name.node_index().load());
                self.check_expression(expression, "variable");
            }
        }
        if self.non_static && !self.file.is_type_interface(self.db) {
            if let Expr::Call(call) = expression {
                let result = expression.inferred_type(self.model);
                self.check_call_inputs(call);
                if let Some(result) = result {
                    self.check_type(expression.range(), result, "call result");
                }
                for argument in &call.arguments.args {
                    self.check_expression(argument, "argument");
                }
                for keyword in &call.arguments.keywords {
                    self.check_expression(&keyword.value, "argument");
                }
            }
        }
        visitor::walk_expr(self, expression);
    }
}

struct AnyAnnotations<'a, 'db> {
    db: &'db Database,
    model: &'a SemanticModel<'db>,
    ranges: Vec<TextRange>,
}

impl<'ast> Visitor<'ast> for AnyAnnotations<'_, '_> {
    fn visit_expr(&mut self, expression: &'ast Expr) {
        if let Expr::StringLiteral(string) = expression {
            if let Some((parsed, model)) = self.model.enter_string_annotation(string) {
                let mut nested = AnyAnnotations {
                    db: self.db,
                    model: &model,
                    ranges: Vec::new(),
                };
                nested.visit_expr(parsed.expr());
                self.ranges.extend(nested.ranges);
                return;
            }
        }
        if expression
            .inferred_type(self.model)
            .is_some_and(|ty| ty.is_explicit_any(self.db))
        {
            self.ranges.push(expression.range());
        } else {
            visitor::walk_expr(self, expression);
        }
    }
}

#[cfg(test)]
mod tests {
    use starpls_hir::Fixture;

    use crate::Analysis;
    use crate::DiagnosticRules;

    fn rules(names: &[&str]) -> DiagnosticRules {
        DiagnosticRules::from_settings(
            &names
                .iter()
                .map(|name| ((*name).into(), "error".into()))
                .collect(),
        )
        .unwrap()
    }

    #[test]
    fn loads_do_not_contribute_call_contracts() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        fixture.add_file(
            &mut analysis.db,
            "api.bzli",
            "def complete(value: int) -> int: ...\ndef gradual(value: Any) -> int: ...\n",
        );
        let source = r#"
load("api.bzli", "complete")
load(
    "api.bzli",
    "gradual",
    renamed = "complete",
)
complete(1)
renamed(2)
"#;
        let file = fixture.add_file(&mut analysis.db, "main.bzl", source);
        loader.add_files_from_fixture(&fixture);
        analysis.set_rules(rules(&["non-static-type"]));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(file, format!("{source}gradual(1)\n"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "non-static-type");
        assert_eq!(
            diagnostics[0].range().unwrap().start().to_usize(),
            source.len()
        );
    }

    #[test]
    fn explicit_any_uses_annotation_semantics_and_comments() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let file = fixture.add_file(&mut analysis.db, "types.bzli",
            "type Dynamic = Any\ndef consume(value: list[Dynamic]) -> None: ...\ndef quoted(value: list['Any']) -> None: ...\ndef commented(value):  # type: (Any) -> Any\n    ...\ndef default[T = Any](value: T) -> T: ...\ndef bounded[T: Any](value: T) -> T: ...\ntype Values[T = Any] = list[T]\nclass Bag(TypedDict, extra_items=Any): ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_rules(rules(&["explicit-any"]));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 9, "{diagnostics:?}");
        assert!(
            diagnostics
                .iter()
                .all(|d| d.id().as_str() == "explicit-any"),
            "{diagnostics:?}"
        );
        analysis.update_file(file, "def stringify(value: object) -> str: ...\n".into());
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
    }

    #[test]
    fn incomplete_values_are_opt_in_and_suppressions_expire() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture("values = []\n");
        let file = fixture.main_file();
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
        analysis.set_rules(rules(&["non-static-type"]));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "non-static-type");
        assert!(
            diagnostics[0].headline_message().contains("list[Unknown]"),
            "{diagnostics:?}"
        );
        analysis.update_file(file, "values = []  # ty: ignore[non-static-type]\n".into());
        assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
        analysis.update_file(
            file,
            "values: list[str] = []  # ty: ignore[non-static-type]\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "unused-ignore-comment");
    }

    #[test]
    fn calls_use_refined_results_and_preserve_input_contracts() {
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
        fixture.add_file(
            &mut analysis.db,
            "library.bzl",
            r#"
def consume(value: Any) -> None:
    pass
def mixed(value: int | Any) -> None:
    pass
def optional(value: Any = None) -> None:
    pass
def key(value: str) -> int:
    return len(value)
def gradual_result() -> Any:
    return 1
def unknown_result() -> list:
    return []
"#,
        );
        fixture.add_file(
            &mut analysis.db,
            "overloads.bzli",
            r#"
@overload
def complete(value: int) -> int: ...
@overload
def complete(value: str) -> str: ...
def complete(value): ...
@overload
def gradual(value: int) -> int: ...
@overload
def gradual(value: str, extra: Any = ...) -> str: ...
def gradual(value, extra=None): ...
choice: int | str
"#,
        );
        let source = r#"load("library.bzl", "consume", "mixed", "optional", "key", "gradual_result", "unknown_result")
load("overloads.bzli", "complete", "gradual", "choice")
selected = select({"//:enabled": ["known"]})
combined = selected + ["more"]
sorted(["known"])
sorted(["known"], key=None)
sorted(["known"], key=key)
values: dict[str, int] = {"known": 1}
values.update({"more": 2})
optional()
mixed(1)
complete(choice)
"#;
        let file = fixture.add_file(&mut analysis.db, "caller.bzl", source);
        loader.add_files_from_fixture(&fixture);
        analysis.set_rules(rules(&["non-static-type"]));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (extra, subject) in [
            ("consume(1)", "called function"),
            ("mixed('wrong')", "called function"),
            ("gradual(choice)", "called function"),
            ("saved = consume", "variable"),
            ("saved = gradual_result", "variable"),
            ("gradual_result()", "call result"),
            ("mixed(unknown_result())", "argument"),
            ("select({'//:enabled': gradual_result()})", "call result"),
            ("select({'//:enabled': unknown_result()})", "call result"),
        ] {
            analysis.update_file(file, format!("{source}{extra}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| {
                    diagnostic.id().as_str() == "non-static-type"
                        && diagnostic.headline_message().contains(subject)
                        && diagnostic.range().unwrap().start().to_usize() >= source.len()
                }),
                "{extra}: {diagnostics:?}"
            );
        }
        analysis.update_file(file, format!("{source}key(42)\n"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
    }

    #[test]
    fn provider_initializers_preserve_static_call_contracts() {
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
        fixture.add_file(
            &mut analysis.db,
            "callbacks.bzli",
            "gradual: Callable[..., Any]\nunknown: Callable\n",
        );
        let valid = r#"
load("callbacks.bzli", "gradual", "unknown")
Plain = provider(fields=["value"])
ExplicitNone = provider(fields=["value"], init=None)
def _init(value, count=0):
    return {"value": value, "count": count}
Initialized, raw = provider(fields=["value", "count"], init=_init)
plain_text: str = Plain(value="plain").value
none_text: str = ExplicitNone(value="none").value
initialized_text: str = Initialized("initialized").value
raw_text: str = raw(value="raw", count=1).value
"#;
        let source = fixture.add_file(&mut analysis.db, "info.bzl", valid);
        let interface = fixture.add_file(
            &mut analysis.db,
            "info.bzli",
            r#"
def Plain(*, value: str) -> record[{"value": str}]: ...
def ExplicitNone(*, value: str) -> record[{"value": str}]: ...
def _init(value: str, count: int = ...) -> dict[{"value": str, "count": int}]: ...
def Initialized(value: str, count: int = ...) -> record[{"value": str, "count": int}]: ...
"#,
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        analysis.set_rules(rules(&["non-static-type"]));
        for file in [source, interface] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        for invalid in ["Initialized(42)", "raw(value=42, count=1)"] {
            analysis.update_file(source, format!("{valid}\n{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert_eq!(diagnostics.len(), 1, "{invalid}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
        }
        for callback in ["gradual", "unknown"] {
            let updated = valid.replace("init=_init", &format!("init={callback}"));
            analysis.update_file(source, updated.clone());
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| {
                    diagnostic.id().as_str() == "non-static-type"
                        && diagnostic.headline_message().contains("argument")
                        && diagnostic.range().is_some_and(|range| {
                            &updated[range.start().to_usize()..range.end().to_usize()] == callback
                        })
                }),
                "{callback}: {diagnostics:?}"
            );
        }
        analysis.update_file(source, valid.replace("init=_init", "init=42"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn contextual_collections_and_opaque_objects_pass() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(
            "def stringify(value: object) -> str:\n    return str(value)\ndef consume(values: list[str]) -> None:\n    pass\nvalues: list[str] = []\nlookup: dict[str, int] = {}\nresult = stringify('known')\nconsume([])\n",
        );
        analysis.set_rules(rules(&[
            "explicit-any",
            "non-static-type",
            "unsound-assignment",
            "unsound-return-statement",
        ]));
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn zip_preserves_element_types_for_variadic_inputs() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(
            "pairs = zip([1], ['text'])\nrows = zip([1], ['text'], [True], [2])\nvalues: list[list[str]] = [['text']]\nunpacked = zip(*values)\n",
        );
        analysis.set_rules(rules(&["non-static-type"]));
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            file,
            "rows = zip([1], ['text'], [True], [2])\nwrong: str = rows[0][0]\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-assignment");
        analysis.set_rules(DiagnosticRules::default());
        analysis.update_file(file, "zip([1], ['text'], [True], 2)\n".into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
    }

    #[test]
    fn comparison_keys_preserve_comparable_result_types() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(
            r#"
values = sorted([3, 1])
keys = sorted([3, 1], key=lambda value: str(value))
pairs: list[tuple[str, list[str]]] = sorted([("key", ["value"])])
records = sorted([struct(rank=2), struct(rank=1)], key=lambda value: value.rank)
minimum: int = min([3, 1], key=lambda value: str(value))
maximum: int = max([3, 1], key=lambda value: str(value))
first: int = min(3, 1, key=lambda value: str(value))
last: int = max(3, 1, key=lambda value: str(value))
"#,
        );
        analysis.set_rules(rules(&["non-static-type"]));
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_rules(DiagnosticRules::default());
        for (call, expected) in [
            (
                "sorted([3, 1], key=lambda value: None)",
                "no-matching-overload",
            ),
            (
                "min([3, 1], key=lambda value: None)",
                "no-matching-overload",
            ),
            (
                "max([3, 1], key=lambda value: None)",
                "no-matching-overload",
            ),
            (
                "sorted([struct(rank=1), struct(rank=2)])",
                "invalid-argument-type",
            ),
            (
                "sorted([{'rank': 1}, {'rank': 2}], key=None)",
                "no-matching-overload",
            ),
            ("min(3, 1, key=lambda value: None)", "no-matching-overload"),
            ("max(3, 1, key=lambda value: None)", "no-matching-overload"),
        ] {
            analysis.update_file(file, format!("{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{call}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), expected, "{call}");
        }
    }

    #[test]
    fn parameters_return_contracts_and_nested_values_are_checked() {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(
            "def unknown(value):\n    return value\ndef gradual(values: list[dict[str, Any]]) -> list[dict[str, Any]]:\n    return values\n",
        );
        analysis.set_rules(rules(&["non-static-type"]));
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        assert_eq!(diagnostics.len(), 6, "{diagnostics:?}");
        assert!(
            diagnostics
                .iter()
                .all(|d| d.id().as_str() == "non-static-type"),
            "{diagnostics:?}"
        );
        assert!(
            diagnostics
                .iter()
                .any(|d| d.headline_message().contains("list[dict[str, Any]]")),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn interface_contracts_and_edits_control_source_completeness() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "def identity(value):\n    return value\n",
        );
        let stub = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            "def identity(value: Any) -> Any: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        analysis.set_rules(rules(&["explicit-any", "non-static-type"]));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 3, "{diagnostics:?}");
        assert!(
            diagnostics
                .iter()
                .all(|d| d.id().as_str() == "non-static-type"),
            "{diagnostics:?}"
        );
        let diagnostics = analysis.snapshot().diagnostics(stub).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .filter(|d| d.id().as_str() == "explicit-any")
                .count(),
            2,
            "{diagnostics:?}"
        );
        analysis.update_file(stub, "def identity(value: str) -> str: ...\n".into());
        for file in [source, stub] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        analysis.update_file(stub, "def identity[T](value: T) -> T: ...\n".into());
        analysis.update_file(
            source,
            "def identity(value):\n    return value\nresult = identity('known')\n".into(),
        );
        for file in [source, stub] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
    }

    #[test]
    fn imported_callbacks_and_stub_variables_expose_incomplete_contracts() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let library = fixture.add_file(
            &mut analysis.db,
            "library.bzl",
            "def consume(value) -> None:\n    pass\n",
        );
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "load('library.bzl', 'consume')\nconsume(42)\ncallbacks = [consume]\n",
        );
        let stub = fixture.add_file(&mut analysis.db, "values.bzli", "values: list\n");
        loader.add_files_from_fixture(&fixture);
        analysis.set_rules(rules(&["non-static-type"]));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(
            diagnostics
                .iter()
                .all(|d| d.id().as_str() == "non-static-type"),
            "{diagnostics:?}"
        );
        let diagnostics = analysis.snapshot().diagnostics(stub).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "non-static-type");
        analysis.update_file(
            library,
            "def consume(value: int) -> None:\n    pass\n".into(),
        );
        analysis.update_file(stub, "values: list[str]\n".into());
        for file in [source, stub] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
    }

    #[test]
    fn higher_order_callbacks_and_public_overloads() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let library = fixture.add_file(
            &mut analysis.db,
            "library.bzl",
            "def consume(value) -> None:\n    pass\ndef factory() -> Callable[[Any], None]:\n    return consume\n",
        );
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "load('library.bzl', 'factory')\ncallbacks = [factory]\n",
        );
        fixture.add_file(
            &mut analysis.db,
            "overloads.bzli",
            "@overload\ndef consume(value: int) -> int: ...\n@overload\ndef consume(value: str) -> str: ...\ndef consume(value): ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_rules(rules(&["non-static-type"]));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "non-static-type");
        analysis.update_file(
            library,
            "def consume(value: int) -> None:\n    pass\ndef factory() -> Callable[[int], None]:\n    return consume\n"
                .into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            source,
            "load('overloads.bzli', 'consume')\ncallbacks = [consume]\ntext: str = consume('ok')\nnumber: int = consume(1)\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn recursive_aliases_terminate() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let file = fixture.add_file(
            &mut analysis.db,
            "types.bzli",
            "type Tree = int | list[Tree]\nvalue: Tree\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_rules(rules(&["non-static-type"]));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            file,
            "type Growing[T] = T | list[Growing[list[T]]]\nvalue: Growing[int]\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "non-static-type");
    }
}
