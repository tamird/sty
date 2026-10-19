//! Finite keyword contracts projected from existing callable values.

use std::collections::BTreeSet;

use ruff_python_ast::Expr;
use ruff_text_size::Ranged;
use ty_python_semantic::provided::ProvidedTypeApplication;
use ty_python_semantic::provided::TypeExpressionContext;
use ty_python_semantic::types::keyword_arguments_type;
use ty_python_semantic::types::KnownClass;
use ty_python_semantic::types::ParameterKind;
use ty_python_semantic::types::Type;
use ty_python_semantic::ProgramEnvironment;

use crate::Database;

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
    let Some(signature) = value.single_callable_signature(db, &environment) else {
        context.report_invalid_type_form(
            callable.range(),
            "KeywordArgs requires a callable with exactly one signature",
        );
        return Some(Type::unknown());
    };
    // Preserve parameter-list completeness while inspecting only the input contract.
    // Default values and the callable's result are not fields of the keyword row.
    let inputs = Type::function_like_callable(
        db,
        signature
            .clone()
            .with_return_type(KnownClass::Object.to_instance(db, &environment)),
    );
    if signature.is_generic()
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
        if !signature
            .parameters()
            .iter()
            .any(|parameter| parameter.name().is_some_and(|parameter| parameter == name))
        {
            context.report_invalid_type_form(
                exclusion.range(),
                &format!("The callable has no keyword parameter named `{name}`"),
            );
            return Some(Type::unknown());
        }
        if !excluded.insert(name) {
            context.report_invalid_type_form(
                exclusion.range(),
                &format!("Keyword parameter `{name}` is excluded more than once"),
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
        let source_text = r#"
def _impl(ctx):
    return []
target = rule(_impl, attrs={"items": attr.string_list(mandatory=True), "fixed": attr.bool(mandatory=True), "number": attr.int()})
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
        for file in [interface, source, caller] {
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
            ("def target(*, value: int) -> None: ...", "target, 'missing'"),
            ("def target(*, value: int) -> None: ...", "target, 'value', 'value'"),
            ("def target(*, value: int) -> None: ...", "target, 1"),
            ("def target(*, value: int) -> None: ...\nname: Literal['value']", "target, name"),
            ("def target[T](*, value: T) -> None: ...", "target"),
            ("target: Callable[[int], None]", "target"),
            ("def target(*values: int) -> None: ...", "target"),
            ("def target(**values: int) -> None: ...", "target"),
            ("def target(*, value: Unknown) -> None: ...", "target, 'value'"),
            ("target: Callable[..., None]", "target"),
            ("@overload\ndef target(*, value: int) -> int: ...\n@overload\ndef target(*, value: str) -> str: ...", "target"),
            ("target: int", "target"),
        ] {
            analysis.update_file(file, format!("{declaration}\ntype Row = KeywordArgs[{application}]\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let ids: Vec<_> = diagnostics.iter().map(|diagnostic| diagnostic.id().as_str()).collect();
            assert_eq!(ids, ["invalid-type-form"], "{declaration}: {diagnostics:?}");
        }
    }
}
