//! Optional completeness checks over Ty's inferred types.

use ruff_db::diagnostic::Annotation;
use ruff_db::diagnostic::Diagnostic;
use ruff_db::diagnostic::DiagnosticId;
use ruff_db::diagnostic::Severity;
use ruff_db::diagnostic::Span;
use ruff_python_ast::visitor;
use ruff_python_ast::visitor::Visitor;
use ruff_python_ast::AnyNodeRef;
use ruff_python_ast::ArgOrKeyword;
use ruff_python_ast::Expr;
use ruff_python_ast::ExprContext;
use ruff_python_ast::HasNodeIndex;
use ruff_python_ast::NodeIndex;
use ruff_python_ast::Parameter;
use ruff_python_ast::Stmt;
use ruff_python_ast::TypeParam;
use ruff_text_size::Ranged;
use ruff_text_size::TextRange;
use rustc_hash::FxHashSet;
use starpls_common::File;
use ty_python_core::definition::Definition;
use ty_python_semantic::lint::LintMetadata;
use ty_python_semantic::types::ide_support::call_input_types_with_context;
use ty_python_semantic::types::ide_support::CallInputError;
use ty_python_semantic::types::CallableTypeKind;
use ty_python_semantic::types::OverloadBodyAnalysis;
use ty_python_semantic::types::OverloadBodyView;
use ty_python_semantic::types::Type;
use ty_python_semantic::Db as _;
use ty_python_semantic::HasType;
use ty_python_semantic::SemanticModel;

use super::diagnostics::EXPLICIT_ANY;
use super::diagnostics::NON_STATIC_TYPE;
use crate::Database;

pub(super) fn diagnostics<'db>(
    db: &'db Database,
    file: File,
    overload_bodies: &[OverloadBodyAnalysis<'db>],
) -> Vec<Diagnostic> {
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
        overload_bodies,
        domain: None,
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
    overload_bodies: &'a [OverloadBodyAnalysis<'db>],
    domain: Option<OverloadBodyView<'db>>,
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
        // Different domains can reach the same gradual operation. Report identical evidence
        // once, while retaining distinct type explanations from different domains.
        if self.domain.is_none() || !self.diagnostics.contains(&diagnostic) {
            self.diagnostics.push(diagnostic);
        }
    }

    fn check_type(&mut self, range: TextRange, ty: Type<'_>, subject: &str) {
        if self.non_static && !self.is_fully_static(ty) {
            self.report_non_static_type(range, ty, subject);
        }
    }

    fn report_non_static_type(&mut self, range: TextRange, ty: Type<'_>, subject: &str) {
        self.report(
            range,
            &NON_STATIC_TYPE,
            format!(
                "Cannot establish a fully static type for {subject}: `{}`",
                ty.display(self.db, &self.model.program_environment())
            ),
        );
    }

    fn is_fully_static(&self, ty: Type<'_>) -> bool {
        let env = self.model.program_environment();
        // Materialization also inspects lazy function signatures, which the
        // stored-type query skips. Equivalence preserves callable variance and
        // lets Ty handle recursive types and externally visible overloads.
        ty.is_fully_static(self.db, &env)
            && ty.is_equivalent_to(self.db, &env, ty.top_materialization(self.db, &env))
    }

    fn contains_generated_rule(&self, ty: Type<'db>) -> bool {
        let ty = ty.expand_top_level_aliases(self.db, &self.model.program_environment());
        match ty {
            Type::NominalInstance(_) => ty
                .provided_data(self.db, &self.model.program_environment())
                .is_some_and(|data| data.downcast_ref::<super::factory::RuleData>().is_some()),
            Type::Union(union) => union
                .elements(self.db)
                .iter()
                .any(|element| self.contains_generated_rule(*element)),
            Type::Intersection(intersection) => intersection
                .iter_positive(self.db)
                .any(|element| self.contains_generated_rule(element)),
            _ => false,
        }
    }

    fn is_fully_static_invocation(&self, callee: Type<'db>) -> bool {
        let expanded = callee.expand_top_level_aliases(self.db, &self.model.program_environment());
        if matches!(
            expanded,
            Type::NominalInstance(_) | Type::Union(_) | Type::Intersection(_)
        ) {
            if !matches!(expanded, Type::NominalInstance(_))
                && self.contains_generated_rule(expanded)
            {
                // Composite generated rule types need a stronger proof.
                return false;
            }
            // Nominal identities can be fully static even when their bound
            // call signatures are incomplete. Inspect every callable alternative.
            return expanded
                .map_callable_signatures(
                    self.db,
                    &self.model.program_environment(),
                    CallableTypeKind::Regular,
                    std::convert::identity,
                )
                .is_some_and(|callable| self.is_fully_static(callable));
        }
        self.is_fully_static(callee)
    }

    fn expression_type(&self, expression: &Expr) -> Option<Type<'db>> {
        match self.domain {
            Some(domain) => domain.expression_type(expression),
            None => expression.inferred_type(self.model),
        }
    }

    fn check_expression(&mut self, expression: &Expr, subject: &str) {
        if !self.non_static {
            return;
        }
        if let Some(ty) = self.expression_type(expression) {
            self.check_type(expression.range(), ty, subject);
        } else if self.domain.is_some() {
            self.report(
                expression.range(),
                &NON_STATIC_TYPE,
                format!(
                    "Cannot establish a fully static type for {subject}: type information is unavailable"
                ),
            );
        }
    }

    fn check_argument(
        &mut self,
        expression: &Expr,
        callback: Option<&super::context::CallbackContract<'_, 'db>>,
    ) {
        match callback.filter(|callback| callback.argument.range() == expression.range()) {
            Some(callback) => self.check_type(expression.range(), callback.ty, "argument"),
            None => self.check_expression(expression, "argument"),
        }
    }

    /// Returns direct call results consumed by a proven static parameter contract.
    fn check_call_inputs(
        &mut self,
        call: &ruff_python_ast::ExprCall,
        callback: Option<&super::context::CallbackContract<'_, '_>>,
    ) -> FxHashSet<TextRange> {
        // Excluded source syntax does not participate in ordinary call inference.
        if self.model.scope(call.into()).is_none() {
            return FxHashSet::default();
        }
        let env = self.model.program_environment();
        let inputs = match self.domain {
            Some(domain) => domain.call_input_types(call),
            None => call_input_types_with_context(self.model, call, |expression| {
                callback
                    .filter(|callback| callback.argument.range() == expression.range())
                    .map(|callback| callback.ty)
            }),
        };
        match inputs {
            Ok(arguments) => {
                // A checked invocation need only satisfy the selected contracts for supplied
                // arguments. Subtyping proves that no gradual alternative was needed; the
                // argument values and the checked result are inspected separately below.
                for input in arguments.iter().flatten() {
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
                call.arguments
                    .iter_source_order()
                    .zip(arguments)
                    .filter_map(|(argument, inputs)| {
                        let expression = match argument {
                            ArgOrKeyword::Arg(expression) => expression,
                            ArgOrKeyword::Keyword(keyword) => {
                                keyword.arg.as_ref()?;
                                &keyword.value
                            }
                        };
                        if !matches!(expression, Expr::Call(_)) || inputs.is_empty() {
                            return None;
                        }
                        let result = self.expression_type(expression)?;
                        if self.is_fully_static(result) {
                            return None;
                        }
                        // Every runtime value must fit every selected parameter. Top
                        // materialization preserves variance and existential containers.
                        let upper_bound = result.top_materialization(self.db, &env);
                        inputs
                            .iter()
                            .all(|input| {
                                self.is_fully_static(input.parameter_type)
                                    && upper_bound.is_subtype_of(
                                        self.db,
                                        &env,
                                        input.parameter_type,
                                    )
                            })
                            .then_some(expression.range())
                    })
                    .collect()
            }
            Err(CallInputError::Invalid) => FxHashSet::default(),
            Err(CallInputError::Incomplete) => {
                // Some valid calls, including overload expansion, do not retain all matched
                // inputs. A fully static whole callable is a stronger proof for those calls.
                if let Some(callee) = self.expression_type(&call.func) {
                    if self.non_static && !self.is_fully_static_invocation(callee) {
                        self.report_non_static_type(call.func.range(), callee, "called function");
                    }
                } else {
                    self.report(
                        call.func.range(),
                        &NON_STATIC_TYPE,
                        "Cannot establish fully static input contracts for called function".into(),
                    );
                }
                FxHashSet::default()
            }
        }
    }

    fn visit_checked_expr(&mut self, expression: &Expr, consumed: bool) {
        if self
            .domain
            .is_some_and(|domain| !domain.is_reachable(expression.range()))
        {
            return;
        }
        if let Expr::Name(name) = expression {
            if name.ctx == ExprContext::Store {
                self.check_provided_annotation(name.node_index().load());
                self.check_expression(expression, "variable");
            }
        }
        if self.non_static && !self.file.is_type_interface(self.db) {
            if let Expr::Call(call) = expression {
                let callback = if self.domain.is_none() {
                    super::context::callback_contract(self.db, self.model, call)
                } else {
                    // Registration-specific callback views apply only at module scope.
                    // Domain views own function-body calls and their existing inferred arguments.
                    None
                };
                let checked = self.check_call_inputs(call, callback.as_ref());
                if !consumed {
                    self.check_expression(expression, "call result");
                }
                self.visit_expr(&call.func);
                for argument in call
                    .arguments
                    .args
                    .iter()
                    .chain(call.arguments.keywords.iter().map(|keyword| &keyword.value))
                {
                    let consumed = checked.contains(&argument.range());
                    if !consumed {
                        self.check_argument(argument, callback.as_ref());
                    }
                    self.visit_checked_expr(argument, consumed);
                }
                return;
            }
        }
        visitor::walk_expr(self, expression);
    }

    fn check_overload_body<'ast>(
        &mut self,
        function: &'ast ruff_python_ast::StmtFunctionDef,
        analysis: &OverloadBodyAnalysis<'db>,
    ) {
        // Defaults and annotations belong to the ordinary declaration, not to a call domain.
        for decorator in &function.decorator_list {
            self.visit_decorator(decorator);
        }
        if let Some(parameters) = &function.type_params {
            self.visit_type_params(parameters);
        }
        for default in function
            .parameters
            .iter_non_variadic_params()
            .filter_map(|parameter| parameter.default.as_deref())
        {
            self.visit_expr(default);
        }
        for parameter in function
            .parameters
            .iter()
            .map(|parameter| parameter.as_parameter())
        {
            self.check_provided_annotation(parameter.node_index().load());
            visitor::walk_parameter(self, parameter);
        }
        if let Some(returns) = &function.returns {
            self.visit_annotation(returns);
        }
        if self.explicit_any {
            // Annotation policy is source-owned even in branches absent from every domain.
            let non_static = std::mem::replace(&mut self.non_static, false);
            self.visit_body(&function.body);
            self.non_static = non_static;
        }
        if !self.non_static {
            return;
        }
        let explicit_any = std::mem::replace(&mut self.explicit_any, false);
        for domain in analysis.domains(self.db) {
            self.domain = Some(domain);
            for parameter in function
                .parameters
                .iter()
                .map(|parameter| parameter.as_parameter())
            {
                if let Some(definition) = self.definition(parameter.into()) {
                    let ty = domain
                        .definition_type(definition)
                        .unwrap_or_else(Type::unknown);
                    self.check_type(parameter.name.range(), ty, "parameter");
                }
            }
            self.visit_body(&function.body);
        }
        self.domain = None;
        self.explicit_any = explicit_any;
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
        if self
            .domain
            .is_some_and(|domain| !domain.is_reachable(statement.range()))
        {
            return;
        }
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
                if let Some(definition) = self.definition(function.into()) {
                    if let Some(analysis) = self.overload_bodies.iter().find(|analysis| {
                        analysis.is_complete() && analysis.definition(self.db) == definition
                    }) {
                        self.check_overload_body(function, analysis);
                        return;
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
        self.visit_checked_expr(expression, false);
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
    fn type_queries_preserve_container_domains() {
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
        analysis.set_rules(rules(&["non-static-type"]));
        let file = fixture.main_file();
        for expression in [
            "type([])",
            "type({})",
            "type(())",
            "type(set())",
            "type(select({'//conditions:default': 0}))",
        ] {
            analysis.update_file(file, format!("tag = {expression}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{expression}: {diagnostics:?}");
        }
        for (parameter, argument) in [
            ("value: Any", "[value]"),
            ("value", "[value]"),
            ("values: list[Any]", "values"),
            ("value: Any", "{'key': value}"),
            ("value", "{'key': value}"),
            ("fields: dict[str, Any]", "fields"),
            ("values: set[Any]", "values"),
        ] {
            let source = format!("def tag({parameter}) -> str:\n    return type({argument})\n");
            analysis.update_file(file, source.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| {
                    diagnostic.id().as_str() == "non-static-type"
                        && diagnostic.headline_message().contains("argument")
                        && diagnostic.range().is_some_and(|range| {
                            &source[range.start().to_usize()..range.end().to_usize()] == argument
                        })
                }),
                "{source}: {diagnostics:?}"
            );
        }
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
    fn generated_rule_aliases_preserve_invocation_completeness() {
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
        let identity = fixture.add_file(
            &mut analysis.db,
            "identity.bzl",
            "def ident(value): return value\n",
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "identity.bzli",
            "type Identity[T] = T\ndef ident[T](value: T) -> Identity[T]: ...\n",
        );
        fixture.add_file(
            &mut analysis.db,
            "rules.bzl",
            r#"load("identity.bzl", "ident")
def implementation(ctx): return []
complete = ident(rule(implementation=implementation))
direct = rule(implementation=implementation, initializer=lambda name, extra: {}, attrs={"extra": attr.string()})
aliased = ident(direct)
"#,
        );
        let source = r#"load("rules.bzl", "complete", "direct", "aliased")
complete(name="complete")
direct(name="direct")
aliased(name="aliased")
"#;
        let file = fixture.add_file(&mut analysis.db, "caller.bzl", source);
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_type_interfaces([(identity, interface)])
            .unwrap();
        analysis.set_rules(rules(&["non-static-type"]));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let rejected = diagnostics
            .iter()
            .map(|diagnostic| {
                assert_eq!(diagnostic.id().as_str(), "non-static-type");
                let range = diagnostic.range().unwrap();
                &source[range.start().to_usize()..range.end().to_usize()]
            })
            .collect::<Vec<_>>();
        assert_eq!(rejected, ["direct", "aliased"], "{diagnostics:?}");
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
    fn a_static_parameter_can_check_a_gradual_call_result() {
        let prelude = "def accept(value: object) -> None:\n    pass\ndef require_int(value: int) -> None:\n    pass\n";
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(&format!(
            "{prelude}accept(json.decode('{{}}'))\naccept(value=json.decode('{{}}'))\n"
        ));
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis.set_rules(rules(&["non-static-type"]));
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for source in [
            "require_int(json.decode('{}'))",
            "accept(require_int(json.decode('{}')))",
            "accept(*json.decode('{}'))",
            "decoded = json.decode('{}')\naccept(decoded)",
        ] {
            let source = format!("{prelude}{source}\n");
            analysis.update_file(file, source.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| {
                    diagnostic.id().as_str() == "non-static-type"
                        && diagnostic.headline_message().contains("call result")
                        && diagnostic.range().is_some_and(|range| {
                            &source[range.start().to_usize()..range.end().to_usize()]
                                == "json.decode('{}')"
                        })
                }),
                "{source}: {diagnostics:?}"
            );
        }
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
    fn generic_callable_protocol_is_fully_static() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let interface = fixture.add_file(
            &mut analysis.db,
            "callback.bzli",
            r#"
class Callback(Protocol):
    def __call__[T: int | str](self, __value: T | None) -> T | None: ...
def accept(callback: Callback) -> None: ...
"#,
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_rules(rules(&["non-static-type"]));
        let diagnostics = analysis.snapshot().diagnostics(interface).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
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
    fn paired_overload_domains_own_complete_body_facts() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source_text = "def use(value):\n    return value\ndef setting(ctx, override = None):\n    if override == None:\n        override = ctx.value\n    return use(override)\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", source_text);
        let interface_text = r#"
class Context(Protocol):
    @property
    def value(self) -> str: ...
def use(value: str) -> str: ...
@overload
def setting(ctx: Context, override: str | None = ...) -> str: ...
@overload
def setting(ctx: object, override: str) -> str: ...
def setting(ctx: object, override: str | None = ...) -> str: ...
def calls(context: Context, other: object) -> tuple[str, str, str, str]: ...
"#;
        let interface = fixture.add_file(&mut analysis.db, "source.bzli", interface_text);
        let calls = "def calls(context, other):\n    return (setting(context), setting(context, None), setting(other, 'off'), setting(ctx=other, override='off'))\n";
        analysis.update_file(source, format!("{source_text}{calls}"));
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        analysis.set_rules(rules(&["non-static-type", "explicit-any"]));
        for file in [source, interface] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        for (from, to, expected) in [
            (
                "override == None",
                "override != None",
                "unresolved-attribute",
            ),
            ("ctx.value", "ctx.missing", "unresolved-attribute"),
            (
                "    if override == None:\n        override = ctx.value",
                "    override = ctx.value",
                "unresolved-attribute",
            ),
            (
                "return use(override)",
                "return use(42)",
                "invalid-argument-type",
            ),
            ("return use(override)", "return 42", "invalid-return-type"),
            (
                "override = ctx.value",
                "override = ctx.value  # ty: ignore[unresolved-attribute]",
                "unused-ignore-comment",
            ),
            (
                "    if override == None:",
                "    for item in [ctx]:\n        item.value\n    if override == None:",
                "unresolved-attribute",
            ),
        ] {
            analysis.update_file(source, format!("{}{calls}", source_text.replace(from, to)));
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == expected),
                "{to}: {diagnostics:?}"
            );
        }
        analysis.update_file(
            source,
            source_text.replace(
                "ctx.value",
                "ctx.missing  # ty: ignore[unresolved-attribute]",
            ),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            !diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "unused-ignore-comment"),
            "{diagnostics:?}"
        );
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "non-static-type"),
            "{diagnostics:?}"
        );
        analysis.update_file(source, format!("{source_text}{calls}"));
        analysis.update_file(
            interface,
            interface_text.replace("def value(self) -> str", "def value(self) -> Any"),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "non-static-type"),
            "{diagnostics:?}"
        );
        analysis.update_file(interface, interface_text.to_owned());
        assert!(analysis.snapshot().diagnostics(source).unwrap().is_empty());
        analysis.update_file(source, source_text.replace("    return use(override)", "    if False:\n        value = 42  # type: Any\n        return value\n    return use(override)"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .filter(|diagnostic| diagnostic.id().as_str() == "explicit-any")
                .count(),
            1,
            "{diagnostics:?}"
        );
        analysis.update_file(source, format!("{source_text}{calls}unrelated = use(42)\n"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
    }

    #[test]
    fn gradual_callback_result_in_one_overload_domain_is_reported() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "def invoke(callback, flag):\n    return callback()\n",
        );
        let interface_text = "@overload\ndef invoke(callback: Callable[[], object], flag: Literal[True]) -> object: ...\n@overload\ndef invoke(callback: Callable[[], Any], flag: Literal[False]) -> object: ...\ndef invoke(callback: IMPLEMENTATION, flag: bool) -> object: ...\n";
        let interface = fixture.add_file(&mut analysis.db, "source.bzli", "");
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        analysis.set_rules(rules(&["non-static-type"]));
        for implementation in ["object", "Callable[[], object]"] {
            analysis.update_file(
                interface,
                interface_text.replace("IMPLEMENTATION", implementation),
            );
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| {
                    diagnostic.id().as_str() == "non-static-type"
                        && diagnostic.headline_message().contains("call result")
                        && diagnostic.headline_message().contains("Any")
                }),
                "{implementation}: {diagnostics:?}"
            );
        }
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
