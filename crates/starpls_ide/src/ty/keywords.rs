//! Finite keyword contracts projected from existing callable values.

use std::collections::BTreeMap;
use std::collections::BTreeSet;

use ruff_python_ast::find_node::covering_node;
use ruff_python_ast::name::Name;
use ruff_python_ast::AnyNodeRef;
use ruff_python_ast::Expr;
use ruff_python_ast::ExprSubscript;
use ruff_python_ast::HasNodeIndex;
use ruff_python_ast::Keyword;
use ruff_python_ast::Stmt;
use ruff_python_ast::StmtFunctionDef;
use ruff_text_size::Ranged;
use ty_python_core::ProgramFile;
use ty_python_semantic::provided::ProvidedTypeApplication;
use ty_python_semantic::provided::TypeExpressionContext;
use ty_python_semantic::types::keyword_arguments_type;
use ty_python_semantic::types::KnownClass;
use ty_python_semantic::types::ParameterKind;
use ty_python_semantic::types::Signature;
use ty_python_semantic::types::SpecialFormType;
use ty_python_semantic::types::Type;
use ty_python_semantic::HasType;
use ty_python_semantic::ProgramEnvironment;
use ty_python_semantic::SemanticModel;

use crate::Database;

/// A keyword bound by the wrapper never enters its variadic parameter. A pure
/// forwarding call also owns the names it supplies explicitly. More complex
/// bodies may remove or replace caller keys before forwarding them.
fn wrapper_exclusions<'db>(
    db: &'db Database,
    file: ProgramFile<'db>,
    expression: &ExprSubscript,
    callable: Type<'db>,
) -> Option<BTreeSet<Name>> {
    let source = db.starlark_file(file)?;
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let model = SemanticModel::new(db, file);
    let comment = starpls_hir::Source::new(db).type_comment_owner(source, expression.start());
    let range = comment.map_or(expression.range(), |owner| {
        parsed.get_by_index(owner).range()
    });
    let covering = covering_node(parsed.syntax().into(), range);
    let wrapper = covering.ancestors().find_map(|node| match node {
        AnyNodeRef::StmtFunctionDef(wrapper) => Some(wrapper),
        _ => None,
    })?;
    let kwargs = wrapper.parameters.kwarg.as_ref()?;
    let is_direct_unpack = |annotation: &Expr, model: &SemanticModel| {
        annotation.as_subscript_expr().is_some_and(|annotation| {
            annotation.slice.range() == expression.range()
                && annotation.value.inferred_type(model)
                    == Some(Type::SpecialForm(SpecialFormType::Unpack))
        })
    };
    let direct = match comment {
        Some(owner) => {
            if kwargs.node_index().load() != owner {
                return None;
            }
            let (annotation, model) = model.enter_provided_annotation(owner)?;
            is_direct_unpack(annotation.expr(), &model)
        }
        None => is_direct_unpack(kwargs.annotation.as_ref()?, &model),
    };
    if !direct {
        return None;
    }
    let mut excluded: BTreeSet<_> = wrapper
        .parameters
        .args
        .iter()
        .chain(&wrapper.parameters.kwonlyargs)
        .map(|param| param.parameter.name.id.clone())
        .collect();
    if let Some(fixed) = fixed_keywords(wrapper, &kwargs.name.id, callable, &model) {
        excluded.extend(
            fixed
                .iter()
                .filter_map(|key| key.arg.as_ref().map(|name| name.id.clone())),
        );
    }
    Some(excluded)
}

fn fixed_keywords<'a, 'db>(
    wrapper: &'a StmtFunctionDef,
    kwargs: &Name,
    callable: Type<'db>,
    model: &SemanticModel<'db>,
) -> Option<&'a [Keyword]> {
    let (statement, setup) = wrapper.body.split_last()?;
    let is_kwargs = |expr: &Expr| expr.as_name_expr().is_some_and(|name| &name.id == kwargs);
    if !setup.iter().all(|stmt| {
        matches!(
            stmt,
            Stmt::Expr(_) | Stmt::Assign(_) | Stmt::AnnAssign(_) | Stmt::AugAssign(_)
        )
    }) || ruff_python_ast::helpers::any_over_body(setup, is_kwargs)
    {
        return None;
    }
    let call = match statement {
        Stmt::Expr(statement) => statement.value.as_call_expr()?,
        Stmt::Return(statement) => statement.value.as_deref()?.as_call_expr()?,
        _ => return None,
    };
    let (unpack, supplied) = call.arguments.keywords.split_last()?;
    // A value like size=kwargs.pop("size") actually accepts the caller's key.
    let uses_kwargs =
        |expression: &Expr| ruff_python_ast::helpers::any_over_expr(expression, is_kwargs);
    (unpack.arg.is_none()
        && &unpack.value.as_name_expr()?.id == kwargs
        && call.arguments.args.is_empty()
        && !uses_kwargs(&call.func)
        && supplied
            .iter()
            .all(|key| key.arg.is_some() && !uses_kwargs(&key.value))
        && call.func.inferred_type(model) == Some(callable))
    .then_some(supplied)
}

pub(super) fn type_application<'db>(
    db: &'db Database,
    application: &ProvidedTypeApplication<'_, 'db>,
    context: &mut dyn TypeExpressionContext<'db>,
) -> Option<Type<'db>> {
    let file = db.starlark_file(context.program_file())?;
    let ProvidedTypeApplication {
        expression,
        value_type,
        definition: _,
    } = application;
    if db.annotation_builtin(file, "KeywordArgs") != Some(*value_type) {
        return None;
    }
    let arguments = match expression.slice.as_ref() {
        Expr::Tuple(tuple) => tuple.elts.as_slice(),
        argument => std::slice::from_ref(argument),
    };
    let Some((callable, exclusions)) = arguments.split_first() else {
        context
            .report_invalid_type_form(expression.range(), "KeywordArgs requires a callable value");
        return Some(Type::unknown());
    };
    let environment = ProgramEnvironment::from_file(context.program_file());
    let value = context.infer_value_expression(callable);
    // A protocol names the call contract of its instances. Its class object has
    // a separate constructor signature, which does not describe that contract.
    let value = match value {
        Type::ClassLiteral(_) => match value.to_instance_approximation(db, &environment) {
            Some(instance @ Type::ProtocolInstance(_)) => instance,
            _ => value,
        },
        _ => value,
    };
    if exclusions.is_empty() {
        if let Some(capture) = context.capture_keyword_parameters(expression, value) {
            return Some(capture);
        }
    }
    let Some((signature, overloads)) = value
        .callable_overloads(db, &environment)
        .and_then(|overloads| overloads.split_first())
    else {
        context.report_invalid_type_form(
            callable.range(),
            "KeywordArgs requires exactly one callable alternative",
        );
        return Some(Type::unknown());
    };
    // Preserve parameter-list completeness while inspecting only the input contract.
    // Default values and the callable's result are not fields of the keyword row.
    if std::iter::once(signature)
        .chain(overloads)
        .any(|signature| {
            let inputs = Type::function_like_callable(
                db,
                signature
                    .clone()
                    .with_return_type(KnownClass::Object.to_instance(db, &environment)),
            );
            signature.is_generic()
                || !inputs.is_fully_static(db, &environment)
                || !signature.parameters().iter().all(|parameter| {
                    matches!(
                        parameter.kind(),
                        ParameterKind::PositionalOrKeyword {
                            name: _,
                            default_type: _,
                        } | ParameterKind::KeywordOnly {
                            name: _,
                            default_type: _,
                        }
                    )
                })
        })
    {
        context.report_invalid_type_form(
            callable.range(),
            "KeywordArgs requires a nongeneric, fully known finite keyword signature",
        );
        return Some(Type::unknown());
    }
    let mut excluded = BTreeSet::new();
    for exclusion in exclusions {
        let Expr::StringLiteral(name) = exclusion else {
            context.report_invalid_type_form(
                exclusion.range(),
                "Excluded names must be string literals",
            );
            return Some(Type::unknown());
        };
        let name = name.value.to_str();
        context.store_expression_type(exclusion, Type::string_literal(db, name));
        if std::iter::once(signature)
            .chain(overloads)
            .any(|signature| {
                !signature
                    .parameters()
                    .iter()
                    .any(|parameter| parameter.name().is_some_and(|parameter| parameter == name))
            })
        {
            context.report_invalid_type_form(
                exclusion.range(),
                &format!("A callable signature has no keyword parameter named `{name}`"),
            );
            return Some(Type::unknown());
        }
        if !excluded.insert(Name::new(name)) {
            context.report_invalid_type_form(
                exclusion.range(),
                &format!("Keyword parameter `{name}` is excluded more than once"),
            );
            return Some(Type::unknown());
        }
    }
    if let Some(bound) = wrapper_exclusions(db, context.program_file(), expression, value) {
        excluded.extend(bound);
    }
    if !overloads.is_empty() {
        let retained = |signature: &Signature<'db>| {
            signature
                .parameters()
                .iter()
                .filter_map(|parameter| {
                    let name = parameter.name()?;
                    (!excluded.contains(name.as_str())).then(|| {
                        (
                            name.clone(),
                            (
                                parameter.annotated_type(),
                                parameter.has_default(),
                                std::mem::discriminant(parameter.kind()),
                            ),
                        )
                    })
                })
                .collect::<BTreeMap<_, _>>()
        };
        let parameters = retained(signature);
        if overloads
            .iter()
            .any(|overload| retained(overload) != parameters)
        {
            context.report_invalid_type_form(
                callable.range(),
                "KeywordArgs requires identical keyword parameters in every overload after exclusions",
            );
            return Some(Type::unknown());
        }
    }
    let row = keyword_arguments_type(
        db,
        &environment,
        signature.parameters().iter().filter(|parameter| {
            !parameter
                .name()
                .is_some_and(|name| excluded.contains(name.as_str()))
        }),
    );
    if row.is_none() {
        context.report_invalid_type_form(
            callable.range(),
            "The callable's keyword parameter types are not yet known",
        );
    }
    Some(row.unwrap_or_else(Type::unknown))
}

#[cfg(test)]
mod tests {
    use starpls_hir::Fixture;

    use crate::Analysis;

    #[test]
    fn keyword_args_exclude_bound_and_forwarded_names() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = r#"
def target(*, name: str, srcs: list[str], mode: int = 0) -> None: pass
alias = target
def wrapper(name, src, **kwargs):
    # type: (str, str, **Unpack[KeywordArgs[target]]) -> None
    "A source wrapper."
    sources = [src]
    print(name)
    alias(name=name, srcs=sources, **kwargs)
def outer(name: str, src: str, **kwargs: Unpack[KeywordArgs[wrapper]]) -> None:
    wrapper(name=name, src=src, **kwargs)
def consumed(name: str, **kwargs: Unpack[KeywordArgs[target]]) -> None:
    kwargs.pop("mode", None)
    target(name=name, mode=0, **kwargs)
def defaulted(name: str, **kwargs: Unpack[KeywordArgs[target]]) -> None:
    target(name=name, mode=kwargs.pop("mode", 0), **kwargs)
def row(value: KeywordArgs[target]) -> None: pass
wrapper("n", "s", mode=1)
outer("n", "s", mode=1)
consumed("n", srcs=[], mode=2)
defaulted("n", srcs=[], mode=2)
row({"name": "n", "srcs": []})
"#;
        let file = fixture.add_file(&mut analysis.db, "wrapper.bzl", source);
        for (call, expected) in [
            ("", None),
            ("wrapper('n', 's', srcs=[])", Some("unknown-argument")),
            ("outer('n', 's', srcs=[])", Some("unknown-argument")),
            ("outer('n', 's', mode='bad')", Some("invalid-argument-type")),
            (
                "defaulted('n', srcs=[], mode='bad')",
                Some("invalid-argument-type"),
            ),
        ] {
            analysis.update_file(file, format!("{source}\n{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let ids: Vec<_> = diagnostics.iter().map(|d| d.id().as_str()).collect();
            assert_eq!(
                ids,
                expected.into_iter().collect::<Vec<_>>(),
                "{call}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn callers_can_supply_keys_consumed_before_a_final_call() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        fixture.add_file(
            &mut analysis.db,
            "wrappers.bzl",
            r#"
def target(*, mode: int = 0) -> None: pass
def consume(**kwargs: Unpack[KeywordArgs[target]]) -> None:
    options = kwargs
    options.pop("mode", None)
    target(mode=1, **kwargs)
def skip(done: bool, **kwargs: Unpack[KeywordArgs[target]]) -> None:
    if done: return
    target(mode=1, **kwargs)
"#,
        );
        let caller = fixture.add_file(
            &mut analysis.db,
            "caller.bzl",
            r#"
load("wrappers.bzl", "consume", "skip")
consume(mode=2)
skip(True, mode=2)
"#,
        );
        loader.add_files_from_fixture(&fixture);
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn positional_only_parameters_leave_keywords_in_the_row() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let implementation = "def invoke(callback): callback(1, value='ok')\n";
        let source = fixture.add_file(&mut analysis.db, "api.bzl", implementation);
        let interface = fixture.add_file(
            &mut analysis.db,
            "api.bzli",
            r#"
class _Target(Protocol):
    def __call__(self, *, value: str) -> None: ...
class _Wrapper(Protocol):
    def __call__(self, value: int, /, **kwargs: Unpack[KeywordArgs[_Target]]) -> None: ...
def invoke(callback: _Wrapper) -> None: ...
"#,
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(source, implementation.replace("value='ok'", "value=42"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
    }

    #[test]
    fn keyword_args_check_paired_source_rule_forwarding() {
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
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let fields_text = r#"
def _impl(ctx: ctx[object, object]) -> list[ProviderInstance]:
    return []
common = {"items": attr.string_list(mandatory=True)}
library = struct(attrs=common, implementation=_impl, provides=[DefaultInfo])
library_rule = rule(implementation=library.implementation, attrs=dict(**library.attrs), provides=library.provides)
"#;
        let fields = fixture.add_file(&mut analysis.db, "fields.bzl", fields_text);
        let source_text = r#"
load("fields.bzl", "library")
def _impl(ctx):
    return []
common = dict(**library.attrs)
local = {"fixed": attr.bool(mandatory=True), "number": attr.int()}
launcher = struct(toolchain_type = "//:launcher")
target = rule(_impl, attrs=common | local, toolchains=[launcher.toolchain_type])
def wrapper(**kwargs):
    target(name="generated", fixed=True, **kwargs)
"#;
        let source = fixture.add_file(&mut analysis.db, "api.bzl", source_text);
        let interface = fixture.add_file(
            &mut analysis.db,
            "api.bzli",
            r#"
load("api.bzl", _callee="target")
def _impl(ctx: ctx[object, object]) -> list[ProviderInstance]: ...
def wrapper(**kwargs: Unpack[KeywordArgs[_callee, "name", "fixed"]]) -> None: ...
"#,
        );
        let snapshot = analysis.snapshot();
        assert!(snapshot
            .db
            .builtin_completion_names(
                source,
                ty_python_semantic::provided::BuiltinUsage::Annotation
            )
            .contains_key("KeywordArgs"));
        assert!(!snapshot
            .db
            .builtin_completion_names(source, ty_python_semantic::provided::BuiltinUsage::Runtime)
            .contains_key("KeywordArgs"));
        drop(snapshot);
        let caller_text = r#"
load("api.bzl", "wrapper")
wrapper(items=["ok"])
wrapper(items=[], number=1, tags=["manual"])
"#;
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", caller_text);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for file in [fields, interface, source, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{file:?}: {diagnostics:?}");
        }
        for (call, expected) in [
            ("wrapper()", "missing-argument"),
            ("wrapper(items=[42])", "invalid-argument-type"),
            ("wrapper(items=[], number='wrong')", "invalid-argument-type"),
            ("wrapper(items=[], name='reserved')", "unknown-argument"),
            ("wrapper(items=[], fixed=False)", "unknown-argument"),
        ] {
            analysis.update_file(caller, format!("{caller_text}\n{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            assert_eq!(ids, [expected], "{call}: {diagnostics:?}");
        }
        analysis.update_file(source, source_text.replace("fixed=True", "fixed='wrong'"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["invalid-argument-type"], "{diagnostics:?}");
        analysis.update_file(source, source_text.replace("fixed=True, ", ""));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["missing-argument"], "{diagnostics:?}");
        // A source-owned signature edit must change the projected row, not a copied donor row.
        analysis.update_file(
            source,
            source_text.replace("\"number\": attr.int()", "\"number\": attr.string()"),
        );
        analysis.update_file(
            caller,
            "load('api.bzl', 'wrapper')\nwrapper(items=[], number=1)\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["invalid-argument-type"], "{diagnostics:?}");

        analysis.update_file(
            caller,
            "load('api.bzl', 'wrapper')\nwrapper(items=['item'])\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            fields,
            fields_text.replace("attr.string_list", "attr.int_list"),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["invalid-argument-type"], "{diagnostics:?}");
    }

    #[test]
    fn keyword_args_project_callable_protocols() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        fixture.add_file(
            &mut analysis.db,
            "target.bzl",
            "def target(*, x: int, y: str = '') -> int: return x\n",
        );
        let source_text = r#"
load("target.bzl", "target")
def wrapper(**kwargs):
    return target(**kwargs)
def _identity(callback):
    return callback
_identity(wrapper)(x=1)
"#;
        let source = fixture.add_file(&mut analysis.db, "source.bzl", source_text);
        let interface = fixture.add_file(
            &mut analysis.db,
            "source.bzli",
            r#"
load("target.bzl", _target="target")
class _Contract(Protocol):
    def __call__(self, *, x: int, **kwargs: Unpack[KeywordArgs[_target, "x"]]) -> int: ...
def wrapper(**kwargs: Unpack[KeywordArgs[_Contract]]) -> int: ...
def _identity[T](callback: T) -> T: ...
"#,
        );
        let caller = fixture.add_file(
            &mut analysis.db,
            "caller.bzl",
            "load('source.bzl', 'wrapper')\nwrapper(x=1, y='ok')\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for file in [source, interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{file:?}: {diagnostics:?}");
        }
        analysis.update_file(
            source,
            format!("{source_text}wrapper()\nalias = wrapper\nalias()\n_identity(wrapper)()\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["missing-argument"; 3], "{diagnostics:?}");
        analysis.update_file(
            source,
            source_text.replace("target(**kwargs)", "target(x='bad')"),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
        analysis.update_file(source, source_text.into());
        analysis.update_file(
            caller,
            "load('source.bzl', 'wrapper')\nwrapper(x=1, y=2)\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
    }

    #[test]
    fn keyword_args_project_callable_protocols_through_cycle() {
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
        let source_text = r#"
def _impl(ctx):
    return []
target = rule(_impl, attrs={"items": attr.string_list(mandatory=True)})
def wrapper(**kwargs):
    target(name="generated", **kwargs)
wrapper(items=["local"])
"#;
        let source = fixture.add_file(&mut analysis.db, "api.bzl", source_text);
        let interface = fixture.add_file(
            &mut analysis.db,
            "api.bzli",
            r#"
load("api.bzl", _callee="target")
class _Wrapper(Protocol):
    def __call__(self, *, items: list[str], **kwargs: Unpack[KeywordArgs[_callee, "name"]]) -> None: ...
def wrapper(**kwargs: Unpack[KeywordArgs[_Wrapper]]) -> None: ...
"#,
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for file in [interface, source] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{file:?}: {diagnostics:?}");
        }
        analysis.update_file(source, format!("{source_text}wrapper()\n"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["missing-argument"], "{diagnostics:?}");
    }

    #[test]
    fn keyword_args_preserve_private_load_errors() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        fixture.add_file(
            &mut analysis.db,
            "source.bzl",
            "def _private(*, value: int) -> None: pass\n",
        );
        let file = fixture.add_file(
            &mut analysis.db,
            "interface.bzli",
            "load('source.bzl', _target='_private')\ntype Row = KeywordArgs[_target]\n",
        );
        loader.add_files_from_fixture(&fixture);
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["load-error", "invalid-type-form"], "{diagnostics:?}");
    }

    #[test]
    fn keyword_args_preserve_lexical_values_and_row_types() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = r#"
def target(*, value: int, optional: str = "") -> Any: pass
def use(**kwargs: Unpack[KeywordArgs[target]]) -> None:
    target(**kwargs)
row: KeywordArgs[target] = {"value": 1}
use(**row)
def outer() -> None:
    def target(*, value: str) -> None: pass
    def inner(**kwargs: Unpack[KeywordArgs[target]]) -> None: pass
    inner(value="local")
    inner(value=1)
"#;
        let file = fixture.add_file(&mut analysis.db, "main.bzl", source);
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["invalid-argument-type"], "{diagnostics:?}");
        for (call, expected) in [
            ("use(value=1, optional='ok')", None),
            ("use()", Some("missing-argument")),
            ("use(value='wrong')", Some("invalid-argument-type")),
            ("use(value=1, extra=True)", Some("unknown-argument")),
        ] {
            analysis.update_file(
                file,
                format!("{}\n{call}\n", source.replace("    inner(value=1)\n", "")),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            assert_eq!(
                ids,
                expected.into_iter().collect::<Vec<_>>(),
                "{call}: {diagnostics:?}"
            );
        }
        // A lexical type alias with this spelling keeps its ordinary meaning.
        let shadow = fixture.add_file(&mut analysis.db, "shadow.bzli", "type KeywordArgs[T] = list[T]\ndef ordinary(value: KeywordArgs[int]) -> KeywordArgs[int]: ...\n");
        let diagnostics = analysis.snapshot().diagnostics(shadow).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn keyword_args_recover_from_recursive_callable_annotation() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let file = fixture.add_file(
            &mut analysis.db,
            "recursive.bzli",
            "def target(**kwargs: Unpack[KeywordArgs[target]]) -> None: ...\n",
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["invalid-type-form"], "{diagnostics:?}");
    }

    #[test]
    fn keyword_args_reject_incomplete_generated_rule() {
        let (mut analysis, _) = Analysis::new_for_test();
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
        let file = fixture.add_file(
            &mut analysis.db,
            "main.bzl",
            r#"
def implementation(ctx): return []
def attributes(): return {"exports": attr.label(mandatory=True)}
target = rule(implementation, attrs=dict(attributes(), count=attr.int()))
def consume(row: KeywordArgs[target]) -> None: pass
"#,
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["invalid-type-form"], "{diagnostics:?}");
        // A retaining field preserves the row until the original mapping is mutated.
        for (mutation, expected) in [
            ("", None),
            ("attributes.pop('value')", Some("invalid-type-form")),
        ] {
            analysis.update_file(
                file,
                format!(
                    r#"
def implementation(ctx): return []
attributes = dict(value=attr.int())
utils = struct(attrs=attributes)
{mutation}
target = rule(implementation, attrs=dict({{}}, **utils.attrs))
def consume(row: KeywordArgs[target]) -> None: pass
"#
                ),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            assert_eq!(
                ids,
                expected.into_iter().collect::<Vec<_>>(),
                "{mutation}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn keyword_args_reject_unsupported_contracts_and_exclusions() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let file = fixture.add_file(&mut analysis.db, "main.bzli", "");
        for (declaration, application) in [
            (
                "def target(*, value: int) -> None: ...",
                "target, 'missing'",
            ),
            (
                "def target(*, value: int) -> None: ...",
                "target, 'value', 'value'",
            ),
            ("def target(*, value: int) -> None: ...", "target, 1"),
            (
                "def target(*, value: int) -> None: ...\nname: Literal['value']",
                "target, name",
            ),
            ("def target[T](*, value: T) -> None: ...", "target"),
            ("target: Callable[[int], None]", "target"),
            ("def target(*values: int) -> None: ...", "target"),
            ("def target(**values: int) -> None: ...", "target"),
            (
                "def target(*, value: Unknown) -> None: ...",
                "target, 'value'",
            ),
            ("target: Callable[..., None]", "target"),
            ("target: int", "target"),
        ] {
            analysis.update_file(
                file,
                format!("{declaration}\ntype Row = KeywordArgs[{application}]\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            assert_eq!(ids, ["invalid-type-form"], "{declaration}: {diagnostics:?}");
        }
    }
}
