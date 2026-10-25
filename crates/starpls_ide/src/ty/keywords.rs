//! Finite keyword contracts projected from existing callable values.

use std::collections::BTreeMap;
use std::collections::BTreeSet;

use ruff_python_ast::Expr;
use ruff_text_size::Ranged;
use ty_python_semantic::provided::ProvidedTypeApplication;
use ty_python_semantic::provided::TypeExpressionContext;
use ty_python_semantic::types::keyword_arguments_type;
use ty_python_semantic::types::KnownClass;
use ty_python_semantic::types::ParameterKind;
use ty_python_semantic::types::Signature;
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
        if !excluded.insert(name) {
            context.report_invalid_type_form(
                exclusion.range(),
                &format!("Keyword parameter `{name}` is excluded more than once"),
            );
            return Some(Type::unknown());
        }
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
    fn keyword_args_project_identical_overload_parameters() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source_text = r#"
def target(*, value, name, optional="one"):
    return value
def wrapper(**kwargs):
    return target(value=1, **kwargs)
"#;
        let source = fixture.add_file(&mut analysis.db, "api.bzl", source_text);
        let interface = fixture.add_file(
            &mut analysis.db,
            "api.bzli",
            r#"
@overload
def target(*, value: int, name: str, optional: str = ...) -> int: ...
@overload
def target(*, optional: str = ..., name: str, value: str) -> str: ...
def target(*, value: int | str, name: str, optional: str = ...) -> int | str: ...
def wrapper(**kwargs: Unpack[KeywordArgs[target, "value"]]) -> int: ...
"#,
        );
        let caller_text = r#"
load("api.bzl", "wrapper")
result: int = wrapper(name="ok")
wrapper(name="ok", optional="set")
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
            ("wrapper(name=1)", "invalid-argument-type"),
            (
                "wrapper(name='ok', optional=False)",
                "invalid-argument-type",
            ),
            ("wrapper(name='ok', value=1)", "unknown-argument"),
        ] {
            analysis.update_file(caller, format!("{caller_text}\n{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            assert_eq!(ids, [expected], "{call}: {diagnostics:?}");
        }
        analysis.update_file(source, source_text.replace("value=1", "value=[]"));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        let ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        assert_eq!(ids, ["no-matching-overload"], "{diagnostics:?}");
    }

    #[test]
    fn keyword_args_compare_every_retained_overload_parameter() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let file = fixture.add_file(&mut analysis.db, "main.bzli", "");
        for (second, exclusions, valid) in [
            ("*, choice: str, value: int = ...", "'choice'", true),
            ("*, choice: str, value: str = ...", "'choice'", false),
            ("*, choice: str, value: int", "'choice'", false),
            ("value: int = ..., *, choice: str", "'choice'", false),
            (
                "*, choice: str, value: int = ..., extra: bool = ...",
                "'choice'",
                false,
            ),
            ("*, value: int = ...", "'choice'", false),
            (
                "*, choice: str, value: int = ...",
                "'choice', 'value'",
                true,
            ),
            ("*, value: int = ...", "'choice', 'value'", false),
            ("*, choice: Unknown, value: int = ...", "'choice'", false),
            (
                "*, choice: str, value: int = ..., **rest: str",
                "'choice'",
                false,
            ),
        ] {
            analysis.update_file(
                file,
                format!(
                    "@overload\ndef target(*, choice: int, value: int = ...) -> int: ...\n\
                     @overload\ndef target({second}) -> str: ...\n\
                     type Row = KeywordArgs[target, {exclusions}]\n"
                ),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            if valid {
                assert!(diagnostics.is_empty(), "{second}: {diagnostics:?}");
            } else {
                assert_eq!(ids, ["invalid-type-form"], "{second}: {diagnostics:?}");
            }
        }
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
    def __call__(self, *, items: list[str], **kwargs: Unpack[KeywordArgs[_callee, "name", "items"]]) -> None: ...
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
    fn keyword_args_load_private_values_only_from_the_paired_source() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source_text = "def _private(*, value: int) -> None: pass\ndef wrapper(**kwargs): _private(**kwargs)\n";
        let source = fixture.add_file(&mut analysis.db, "source.bzl", source_text);
        let interface = fixture.add_file(
            &mut analysis.db,
            "interface.bzli",
            "load('source.bzl', _target='_private')\ndef wrapper(**kwargs: Unpack[KeywordArgs[_target]]) -> None: ...\n",
        );
        let caller = fixture.add_file(
            &mut analysis.db,
            "caller.bzl",
            "load('source.bzl', 'wrapper')\nwrapper(value=1)\n",
        );
        let unrelated = fixture.add_file(
            &mut analysis.db,
            "unrelated.bzl",
            "load('source.bzl', _target='_private')\n",
        );
        let second = fixture.add_file(
            &mut analysis.db,
            "second.bzl",
            "def wrapper(**kwargs): pass\n",
        );
        let second_caller = fixture.add_file(
            &mut analysis.db,
            "second_caller.bzl",
            "load('second.bzl', 'wrapper')\nwrapper(value='wrong')\n",
        );
        let bridge = fixture.add_file(
            &mut analysis.db,
            "bridge.bzl",
            "load('source.bzl', _alias='wrapper')\ndef _own(*, value: str) -> None: pass\npublic = _own\n",
        );
        let adjacent_text =
            "load('bridge.bzl', _target='_own')\ntype Args = KeywordArgs[_target]\n";
        let adjacent = fixture.add_file(&mut analysis.db, "bridge.bzli", adjacent_text);
        loader.add_files_from_fixture(&fixture);
        let check = |analysis: &Analysis, file, expected: &[&str]| {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let ids: Vec<_> = diagnostics.iter().map(|d| d.id().as_str()).collect();
            assert_eq!(ids, expected, "{file:?}: {diagnostics:?}");
        };
        check(&analysis, interface, &["load-error", "invalid-type-form"]);
        analysis
            .set_type_interfaces([(source, interface), (second, interface)])
            .unwrap();
        for file in [source, interface, caller, second, bridge, adjacent] {
            check(&analysis, file, &[]);
        }
        check(&analysis, second_caller, &["invalid-argument-type"]);
        check(&analysis, unrelated, &["load-error"]);
        analysis.update_file(adjacent, format!("{adjacent_text}load('bridge.bzl', _indirect='_alias')\nload('source.bzl', _foreign='_private')\n"));
        check(&analysis, adjacent, &["load-error", "load-error"]);
        analysis.update_file(source, source_text.replace("value: int", "value: str"));
        check(&analysis, caller, &["invalid-argument-type"]);
        check(&analysis, second_caller, &[]);
        analysis.update_file(
            source,
            "def wrapper(**kwargs): pass\n_private = wrapper\n".into(),
        );
        check(&analysis, interface, &["invalid-type-form"]);
        analysis.set_type_interfaces([(second, interface)]).unwrap();
        check(&analysis, interface, &["load-error", "invalid-type-form"]);
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
