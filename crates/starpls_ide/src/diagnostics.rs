use starpls_common::Diagnostic;
use starpls_common::Dialect;
use starpls_common::File;
use starpls_common::FileInfo;
use starpls_hir::diagnostics_for_file;

use crate::Database;

#[salsa::db]
trait Db: salsa::Database {
    fn collect_diagnostics(&self, file: File) -> Vec<Diagnostic>;
}

#[salsa::db]
impl Db for Database {
    fn collect_diagnostics(&self, file: File) -> Vec<Diagnostic> {
        let diagnostics = crate::ty::check(self, file);

        // Limit the amount of syntax errors we send, as this many syntax errors probably means something
        // is really wrong with the file being analyzed.
        diagnostics_for_file(self, file)
            .take(128)
            .chain(diagnostics)
            .collect()
    }
}

pub(crate) fn diagnostics(db: &Database, file: File) -> Vec<Diagnostic> {
    let File {
        source,
        dialect,
        info,
    } = file;
    cached_diagnostics(db, source, (dialect, info))
}

#[salsa::tracked(returns(clone))]
fn cached_diagnostics(
    db: &dyn Db,
    source: ruff_db::files::File,
    context: (Dialect, Option<FileInfo>),
) -> Vec<Diagnostic> {
    let (dialect, info) = context;
    db.collect_diagnostics(File {
        source,
        dialect,
        info,
    })
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use ruff_db::diagnostic::Severity;
    use salsa::Setter;
    use starpls_hir::Db as _;
    use starpls_hir::Fixture;

    use crate::Analysis;
    use crate::InferenceOptions;
    use crate::SimpleFileLoader;

    fn native_analysis(source: &str) -> (Analysis, Fixture) {
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        (analysis, fixture)
    }

    #[test]
    fn annotation_policy_accepts_generated_bazel_contracts() {
        let source = "def implementation(ctx) -> None:\n    print(ctx.attr.value)\ndef unregistered(ctx) -> None:\n    print(ctx)\nexample = rule(implementation=implementation, attrs={'value': attr.string()})\n";
        let (mut analysis, fixture) = native_analysis(source);
        let environment = analysis.db.environment();
        let mut options = environment.options(&analysis.db).clone();
        options.infer_ctx_attributes = true;
        environment.set_options(&mut analysis.db).to(options);
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[
                    ("missing-parameter-annotation".into(), "error".into()),
                    ("missing-return-annotation".into(), "error".into()),
                ]
                .into(),
            )
            .unwrap(),
        );
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "missing-parameter-annotation");
        let range = diagnostics[0].range().unwrap();
        assert!(range.start().to_usize() > source.find("def unregistered").unwrap());
    }

    #[test]
    fn selector_runtime_kind_ordinary_diagnostics() {
        let mut failures = Vec::new();
        for (body, parameters, ordinary_error) in [
            // Native integer representations can impose additional value restrictions.
            ("select({'//:a': 1}) + 2", "", false),
            ("2 + select({'//:a': 1})", "", false),
            ("select({'//:a': 1}) + 2147483648", "", false),
            ("select({'//:a': 1}) | select({'//:b': 2})", "", true),
            (
                "select(value) + select(value)",
                "value: Mapping[str, str | None]",
                true,
            ),
            ("value + value", "value: select[str]", true),
            ("value + value", "value: select[str, Literal['str']]", false),
            ("value + 1", "value: select[int]", true),
            ("value | {'x': 1}", "value: select[Mapping[str, int]]", true),
            ("select(value) + ['suffix']", "value: Unknown", false),
            ("{'prefix': 1} | select(value)", "value: Any", false),
            ("select(value) + ['suffix']", "value: object", true),
            ("select(value) + ['suffix']", "value: int | Unknown", true),
            ("select({'//:a': value}) + ['suffix']", "value: Unknown", false),
            ("['prefix'] + select({'//:a': value})", "value: Any", false),
            ("select({'//:a': value}) | {'suffix': 1}", "value: Unknown", false),
            ("{'prefix': 1} | select({'//:a': value})", "value: Any", false),
            ("select({'//:a': value}) + ['suffix']", "value: list[str] | Unknown", false),
            ("select({'//:a': value}) | {'suffix': 1}", "value: ExactDict[str, int] | Any", false),
            ("select({'//:a': value}) + ['suffix']", "value: int | Unknown", true),
            ("select({'//:a': value}) + ['suffix']", "value: list[str] | int | Any", true),
            ("select({'//:a': value}) + ['suffix']", "value: None | Unknown", true),
            ("select({'//:a': value}) + ['suffix']", "value: ExactDict[str, int] | Any", true),
            ("select({'//:a': value}) | {'suffix': 1}", "value: list[str] | Unknown", true),
            ("select({'//:a': value}) + ['suffix']", "value: object", true),
            ("select({'//:a': value}) + ['suffix']", "value: struct[object]", true),
            // This payload admits both list-first and None-first selectors.
            ("value + None", "value: select[list[str] | None]", true),
            ("None + value", "value: select[list[str] | None]", true),
            // Reflected dispatch accepts this selected dictionary.
            ("{} | select({'//:a': {'x': 1}})", "", false),
            ("('x',) + select({'//:a': [1]})", "", false),
            // Empty plain dictionaries compose with nullable selected dictionaries.
            (
                "select({'//:a': {'x': 1}, '//conditions:default': None}) | {} | select({'//:a': {'x': 1}, '//conditions:default': None})",
                "",
                false,
            ),
        ] {
            let (analysis, fixture) = native_analysis(&format!("def make({parameters}):\n    {body}\n"));
            let ordinary = analysis.snapshot().diagnostics(fixture.main_file()).unwrap();
            if ordinary
                .iter()
                .any(|diagnostic| diagnostic.severity() == Severity::Error)
                != ordinary_error
            {
                failures.push(format!("ordinary {body}: {ordinary:#?}"));
            }
        }
        assert!(failures.is_empty(), "{}", failures.join("\n"));
    }

    #[test]
    fn selectors_are_disjoint_from_mappings() {
        for (annotation, expected) in [
            ("Mapping[str, object]", &[][..]),
            (
                "Mapping[str, object] | select[object, object]",
                &["invalid-return-type"][..],
            ),
        ] {
            let source = format!(
                r#"
def is_selected(value: object) -> TypeIs[select[object, object]]:
    return type(value) == "select"

def mapping(value: {annotation}) -> Mapping[str, object]:
    if is_selected(value):
        return select({{"//:condition": []}})
    return value
"#
            );
            let (analysis, fixture) = native_analysis(&source);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            let ids: Vec<_> = diagnostics.iter().map(|d| d.id().as_str()).collect();
            assert_eq!(ids, expected, "{source}: {diagnostics:?}");
        }
    }

    #[test]
    fn selector_composition_preserves_heterogeneous_payloads() {
        for (kind, payload, plain, operation) in [
            ("none", "list[str] | dict[str, str] | None", "None", "+"),
            (
                "list",
                "Sequence[str] | dict[str, str]",
                "Sequence[str]",
                "+",
            ),
            (
                "dict",
                "list[str] | dict[str, str]",
                "ExactDict[str, str]",
                "|",
            ),
            ("str", "str | list[str]", "str", "+"),
            ("bool", "bool | list[str]", "bool", "+"),
            ("label", "Label | list[str]", "Label", "+"),
            (
                "dict",
                "list[str] | ExactDict[str, str]",
                "ExactDict[str, str]",
                "|",
            ),
        ] {
            let selected = format!("select[{payload}, Literal['{kind}']]");
            for (left, right) in [
                (selected.as_str(), selected.as_str()),
                (selected.as_str(), plain),
                (plain, selected.as_str()),
            ] {
                let source = format!(
                    "def combine(left: {left}, right: {right}) -> {selected}:\n    return left {operation} right\n"
                );
                let (mut analysis, fixture) = native_analysis(&source);
                analysis.set_rules(
                    crate::DiagnosticRules::from_settings(
                        &[("non-static-type".into(), "error".into())].into(),
                    )
                    .unwrap(),
                );
                let file = fixture.main_file();
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert!(diagnostics.is_empty(), "{source}: {diagnostics:?}");

                // Composition must retain every payload, not just the first branch's kind.
                analysis.update_file(
                    file,
                    source.replace(&format!("-> {selected}"), "-> select[list[str]]"),
                );
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert_eq!(diagnostics.len(), 1, "{source}: {diagnostics:?}");
                assert!(
                    diagnostics
                        .iter()
                        .all(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"),
                    "{source}: {diagnostics:?}"
                );
            }
        }

        // Attribute conversion checks every fragment. Both branches can supply
        // strings, but a string_dict attribute rejects the list branch.
        let source = r#"
mixed = select({"//conditions:default": None, "//:dict": {"key": "value"}}) + select({"//conditions:default": None, "//:list": ["value"]})
plain_mixed = select({"//conditions:default": ["value"], "//:dict": {"key": "value"}}) + ["plain"]
example = rule(implementation=lambda ctx: [], attrs={"srcs": attr.string_list(), "values": attr.string_dict()})
example(name="ok", srcs=mixed)
example(name="bad", values=mixed)
example(name="plain_ok", srcs=plain_mixed)
example(name="plain_bad", values=plain_mixed)
"#;
        let (analysis, fixture) = native_analysis(source);
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(diagnostics
            .iter()
            .all(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"));
    }

    #[test]
    fn selector_label_kind_and_concatenation() {
        let source = r#"
def embed(branches: dict[str, Label]) -> select[Label, Literal["label"]]:
    return select(branches)

def mixed(first: Label) -> select[Label | str, Literal["label"]]:
    return select({"//conditions:default": first, "//:other": "text"})

label = Label("//:target")
selected = select({"//conditions:default": label})
pair: select[Label, Literal["label"]] = selected + selected
right: select[Label, Literal["label"]] = selected + label
left: select[Label, Literal["label"]] = label + selected
nullable: select[Label | None, Literal["label"]] = select({"//conditions:default": label, "//:other": None}) + label
"#;
        let (mut analysis, fixture) = native_analysis(source);
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for expression in [
            "selected + 'text'",
            "selected + select({'//conditions:default': 'text'})",
            "selected | label",
        ] {
            analysis.update_file(file, format!("{source}\n{expression}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{expression}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "unsupported-operator");
        }

        analysis.update_file(file, source.replace("select[Label | str,", "select[Label,"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-return-type");
    }

    #[test]
    fn selector_reflection_preserves_augmented_rebinding() {
        let source = r#"
def append(values: list[str], more: select[list[int], Literal["list"]]) -> tuple[list[str], select[list[str | int], Literal["list"]]]:
    result = values
    result += more
    return values, result

def merge(values: ExactDict[str, str], more: select[dict[str, int], Literal["dict"]]) -> tuple[dict[str, str], select[dict[str, str | int], Literal["dict"]]]:
    result = values
    result |= more
    return values, result

def add_union(left: list[str] | select[list[str], Literal["list"]], right: list[str] | select[list[str], Literal["list"]]) -> list[str] | select[list[str], Literal["list"]]:
    return left + right

def add_nullable(value: list[str], more: select[list[int] | None, Literal["list"]]) -> select[list[str | int] | None, Literal["list"]]:
    return value + more

def reflected(values: list[str]) -> int:
    return 42
"#;
        let (mut analysis, fixture) = native_analysis(source);
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for statement in [
            "['a'] + select({'//conditions:default': 'text'})",
            "{'a': 1} | select({'//conditions:default': ['text']})",
            "values = ['a']\nvalues += select({'//conditions:default': 'text'})",
            "values = {'a': 1}\nvalues |= select({'//conditions:default': ['text']})",
            "values: list[str] = ['a']\nvalues += [1]",
            "values: dict[str, str] = {'a': 'b'}\nvalues |= {'a': 1}",
            "['a'] + struct(__radd__=reflected)",
            "values = ['a']\nvalues += struct(__radd__=reflected)",
        ] {
            analysis.update_file(file, format!("{source}\n{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{statement}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "unsupported-operator");
        }
    }

    #[test]
    fn selector_integer_kind_and_concatenation() {
        let source = r#"
def embed(value: int) -> select[int, Literal["int"]]:
    return select({"//conditions:default": value})

def mapping(values: dict[str, int]) -> select[int, Literal["int"]]:
    return select(values)
"#;
        let (mut analysis, fixture) = native_analysis(source);
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for expression in [
            "def combine() -> select[int, Literal['int']]:\n    return embed(1) + 2",
            "def combine() -> select[int, Literal['int']]:\n    return 2 + embed(1)",
            "def combine() -> select[int, Literal['int']]:\n    return embed(1) + 1099511627776",
            "def combine() -> select[int, Literal['int']]:\n    return embed(1) + embed(1099511627776)",
            "value = embed(1)\nvalue += 2",
            "value = 2\nvalue += embed(1)",
        ] {
            analysis.update_file(file, format!("{source}\n{expression}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{expression}: {diagnostics:?}");
        }

        analysis.update_file(file, format!("{source}\nembed(True)\n"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");

        analysis.update_file(file, source.replace("-> select[int,", "-> select[str,"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:?}");
        assert!(diagnostics
            .iter()
            .all(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"));
    }

    #[test]
    fn selector_construction_preserves_possible_runtime_kinds() {
        let selected =
            "select[list[str] | None, Literal['list']] | select[list[str] | None, Literal['none']]";
        let source = format!("def embed(branches: dict[str, list[str] | None]) -> {selected}:\n    value = select(branches)\n    return value\n");
        let (mut analysis, mut fixture) = native_analysis(&source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        let hover = analysis
            .snapshot()
            .hover(crate::FilePosition {
                file_id: file,
                pos: (source.find("value =").unwrap() as u32).into(),
            })
            .unwrap()
            .unwrap();
        // Kind is determined by the first branch; each alternative keeps every branch's payload.
        assert!(hover.contents.value.contains("value: select[list[str] | None, Literal[\"list\"]] | select[list[str] | None, Literal[\"none\"]]\n"), "{}", hover.contents.value);

        for (value, expected) in [
            ("object", &["invalid-return-type"][..]),
            ("list[str] | Unknown", &[][..]),
            ("list[str] | Any", &[][..]),
            ("list[str] | int | Unknown", &["invalid-return-type"][..]),
        ] {
            analysis.update_file(file, format!("def embed(branches: dict[str, {value}]) -> {selected}:\n    return select(branches)\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let ids: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| diagnostic.id().as_str())
                .collect();
            assert_eq!(ids, expected, "{value}: {diagnostics:?}");
        }
        // A known first branch wins over unrelated kinds in later branches.
        analysis.update_file(file, "def first(first: list[str]) -> select[list[str] | None, Literal['list']]:\n    return select({'//:first': first, '//conditions:default': None})\n".into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        // Splitting an uncertain first branch must not discard later payloads.
        analysis.update_file(file, format!("def first(first: list[str] | None) -> {selected}:\n    return select({{'//:first': first, '//conditions:default': 42}})\n"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-return-type");

        for (left, right) in [("list", "none"), ("none", "list")] {
            analysis.update_file(file, format!("def combine(left: select[list[str] | None, Literal['{left}']], right: select[list[str] | None, Literal['{right}']]) -> object:\n    return left + right\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "unsupported-operator");
        }
        analysis.update_file(file, "def combine(left: dict[str, list[str] | None], right: dict[str, list[str] | None]) -> object:\n    return select(left) + select(right)\n".into());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "unsupported-operator");

        let interface = fixture.add_file(
            &mut analysis.db,
            "selector.bzli",
            &format!("type Value = list[str] | None\ntype Nested = Value\ndef embed(branches: dict[str, Value]) -> {selected}: ...\ndef nested(branches: dict[str, Nested]) -> {selected}: ...\n"),
        );
        analysis.update_file(file, "def embed(branches):\n    return select(branches)\ndef nested(branches):\n    return select(branches)\n".into());
        analysis.set_type_interfaces([(file, interface)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn selector_construction_preserves_setdefault_first_branch() {
        let source = r#"
def embed(key: str, first: list[str], rest: dict[str, list[str] | None]) -> select[list[str] | None, Literal["list"]]:
    branches: dict[str, list[str] | None] = {}
    branches[key] = first
    for other_key, value in rest.items():
        branches.setdefault(other_key, value)
    return select(branches)
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        // Assignment can replace the first value; setdefault cannot.
        analysis.update_file(
            file,
            source.replace(
                "branches.setdefault(other_key, value)",
                "branches[other_key] = value",
            ),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-return-type");
    }

    #[test]
    fn none_equality_narrows_native_lists() {
        let source = r#"
def absent(value: list[str] | None) -> None:
    if value == None:
        return value
    return None
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        analysis.update_file(file, source.replace("== None", "!= None"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-return-type");
    }

    #[test]
    fn selector_annotations_preserve_static_forwarding() {
        let source = r#"
def forward(values: Sequence[str] | select[Sequence[str]]) -> Sequence[str] | select[Sequence[str]]:
    return values
forward(["plain"])
forward(select({"//:condition": ["selected"]}))
"#;
        let (mut analysis, fixture) = native_analysis(source);
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
            format!("{source}forward(select({{'//:condition': [42]}}))\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
    }

    #[test]
    fn selector_sequence_payloads_prove_concatenation() {
        let source = r#"
def append(values: select[list[str]]) -> select[list[str | int], Literal["list"]]:
    return values + [1]
def prepend(values: select[list[str]]) -> select[list[str | int], Literal["list"]]:
    return [1] + values
def prepend_tuple(values: select[tuple[str, ...]]) -> select[list[str | int], Literal["list"]]:
    return (1,) + values
def combine(left: select[Sequence[str]], right: select[Sequence[int]]) -> select[list[str | int], Literal["list"]]:
    return left + right
def nullable_peer(left: select[Sequence[str]], right: select[Sequence[int] | None, Literal["list"]]) -> select[list[str | int] | None, Literal["list"]]:
    return left + right
def nullable_receiver(left: select[Sequence[str] | None, Literal["list"]], right: select[Sequence[int]]) -> select[list[str | int] | None, Literal["list"]]:
    return left + right
def append_nullable(left: select[Sequence[str]], right: select[Sequence[int] | None, Literal["list"]]) -> select[list[str | int] | None, Literal["list"]]:
    return left + right + [1]
def prepend_nullable(left: select[Sequence[str]], right: select[Sequence[int] | None, Literal["list"]]) -> select[list[str | int] | None, Literal["list"]]:
    return [1] + (left + right)
"#;
        let (mut analysis, fixture) = native_analysis(source);
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        analysis.update_file(file, source.replace("list[str | int]", "list[str]"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 8, "{diagnostics:?}");
        assert!(
            diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"),
            "{diagnostics:?}"
        );

        analysis.update_file(
            file,
            source.replace(
                "-> select[list[str | int] | None",
                "-> select[list[str | int]",
            ),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 4, "{diagnostics:?}");
        assert!(
            diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() == "invalid-return-type"),
            "{diagnostics:?}"
        );

        analysis.update_file(
            file,
            format!("{source}\ndef consume(values: select[list[str]]) -> None:\n    pass\ndef caller(values: select[Sequence[str]]) -> None:\n    consume(values + [1])\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
    }

    #[test]
    fn selector_sequence_payloads_require_compatible_alternatives() {
        for payload in [
            "Sequence[str] | None",
            "Sequence[str] | int",
            "Sequence[str] | Mapping[str, int]",
            "str",
        ] {
            for expression in [
                "values + [1]",
                "[1] + values",
                "values + peer",
                "peer + values",
            ] {
                let source = format!("def combine(values: select[{payload}], peer: select[Sequence[int]]) -> object:\n    return {expression}\n");
                let (analysis, fixture) = native_analysis(&source);
                let diagnostics = analysis
                    .snapshot()
                    .diagnostics(fixture.main_file())
                    .unwrap();
                assert_eq!(
                    diagnostics.len(),
                    1,
                    "{payload}, {expression}: {diagnostics:?}"
                );
                assert_eq!(diagnostics[0].id().as_str(), "unsupported-operator");
            }
        }
    }

    #[test]
    fn selector_sequence_composition_preserves_generic_kind() {
        let source = r#"
def append(values):
    return values + [1]
def prepend(values):
    return [1] + values
def combine(left, right):
    return left + right
def nullable_peer(left, right):
    return left + right
"#;
        let (mut analysis, mut fixture) = native_analysis(source);
        let file = fixture.main_file();
        let interface = fixture.add_file(
            &mut analysis.db,
            "selectors.bzli",
            r#"
def append[K](values: select[Sequence[str], K]) -> select[list[str | int], K]: ...
def prepend[K](values: select[Sequence[str], K]) -> select[list[str | int], K]: ...
def combine[K](left: select[Sequence[str], K], right: select[Sequence[int]]) -> select[list[str | int], K]: ...
def nullable_peer[K](left: select[Sequence[str], K], right: select[Sequence[int] | None, Literal["list"]]) -> select[list[str | int] | None, K]: ...
"#,
        );
        analysis.set_type_interfaces([(file, interface)]).unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn selector_gradual_mapping_transform_obeys_strict_policy() {
        let source = r#"
def with_or_dict(branches):
    result = {}
    for key, value in branches.items():
        if type(key) == type(()):
            for condition in key:
                result[condition] = value
        else:
            result[key] = value
    return result

def with_or(branches):
    return select(with_or_dict(branches))

def forward(branches):
    return select(branches)

lists = ["prefix"] + with_or({("//:a", "//:b"): ["selected"]}) + ["suffix"]
dictionaries = {"prefix": 1} | with_or({("//:a", "//:b"): {"selected": 2}}) | {"suffix": 3}
forwarded_lists = ["prefix"] + forward({"//:a": ["selected"]}) + ["suffix"]
forwarded_dictionaries = {"prefix": 1} | forward({"//:a": {"selected": 2}}) | {"suffix": 3}
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() == "non-static-type"),
            "{diagnostics:?}"
        );
        for name in [
            "lists",
            "dictionaries",
            "forwarded_lists",
            "forwarded_dictionaries",
        ] {
            let start = source.find(&format!("\n{name} =")).unwrap() + 1;
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.range().is_some_and(|range| {
                        range.start().to_usize() == start
                            && range.end().to_usize() == start + name.len()
                    })),
                "missing strict diagnostic for {name}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn selector_gradual_composition_preserves_known_payloads() {
        let source = r#"
def consume(values: list[str] | select[list[str]]) -> None:
    pass

def combine(first: Unknown) -> None:
    left = select({"//:first": first, "//:later": ["left"]})
    right = select({"//:first": first, "//:later": ["right"]})
    combined = left + right
    consume(combined)
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        for gradual in ["Unknown", "Any"] {
            let source = source.replace("Unknown", gradual);
            analysis.update_file(file, source.clone());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{gradual}: {diagnostics:?}");

            for branch in ["left", "right"] {
                let invalid_source = source.replace(&format!("[\"{branch}\"]"), "42");
                analysis.update_file(file, invalid_source);
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert_eq!(diagnostics.len(), 1, "{gradual}, {branch}: {diagnostics:?}");
                assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
            }
        }
    }

    #[test]
    fn selector_gradual_composition_requires_static_checks() {
        let source = r#"
def with_or(branches):
    return select(branches)

def consume(values: list[str] | select[list[str]]) -> None:
    pass

known = ["prefix"] + select({"//:a": ["known"], "//:b": ["later"]})
first = known + with_or({"//:a": ["dynamic"]})
second = first + with_or({"//:b": ["dynamic"]})
combined = second + select({"//:a": ["suffix"]})
consume(known)
consume(first)
consume(second)
consume(combined)
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        let invalid_source = source.replace("[\"later\"]", "[42]");
        analysis.update_file(file, invalid_source.clone());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let start = invalid_source.find("consume(known)").unwrap() + "consume(".len();
        assert!(
            diagnostics.iter().any(|diagnostic| {
                diagnostic.id().as_str() == "invalid-argument-type"
                    && diagnostic.range().is_some_and(|range| {
                        range.start().to_usize() == start
                            && range.end().to_usize() == start + "known".len()
                    })
            }),
            "{diagnostics:?}"
        );

        // Ambiguous gradual composition needs strict checks at each consuming call.
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        for source in [source, invalid_source.as_str()] {
            analysis.update_file(file, source.into());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            for name in ["first", "second", "combined"] {
                let start = source.find(&format!("consume({name})")).unwrap() + "consume(".len();
                assert!(
                    diagnostics.iter().any(|diagnostic| {
                        diagnostic.id().as_str() == "non-static-type"
                            && diagnostic.range().is_some_and(|range| {
                                range.start().to_usize() == start
                                    && range.end().to_usize() == start + name.len()
                            })
                    }),
                    "missing strict diagnostic for {name}: {diagnostics:?}"
                );
            }
        }
    }

    #[test]
    fn native_callable_receivers_are_positional_only() {
        for callable in ["rule", "macro"] {
            for (parameters, body, expected) in [
                (
                    format!("callback: {callable}, *, name: str, **kwargs: object"),
                    "callback(name=name, **kwargs)",
                    &[][..],
                ),
                (
                    format!("callback: {callable}"),
                    "callback(name='target', self=1)",
                    &[][..],
                ),
                (
                    format!("callback: {callable}"),
                    "callback(name=1)",
                    &["invalid-argument-type"][..],
                ),
                (
                    format!("callback: {callable}"),
                    "callback('target')",
                    &["too-many-positional-arguments", "missing-argument"][..],
                ),
            ] {
                let source = format!("def make({parameters}) -> None:\n    {body}\n");
                let (analysis, fixture) = native_analysis(&source);
                let diagnostics = analysis
                    .snapshot()
                    .diagnostics(fixture.main_file())
                    .unwrap();
                let ids: Vec<_> = diagnostics.iter().map(|d| d.id().as_str()).collect();
                assert_eq!(ids, expected, "{source}: {diagnostics:?}");
            }
        }
    }

    #[test]
    fn native_getattr_refines_literal_names() {
        for (source, expected) in [
            ("def read() -> str: return getattr(struct(field='value'), 'field')\n", &[][..]),
            ("def read() -> int: return getattr(struct(field='value'), 'field')\n", &["invalid-return-type"][..]),
            ("def read(value: struct[object], name: str) -> object: return getattr(value, name)\n", &[][..]),
            ("def read(value: struct[str]) -> object: return getattr(value, 0)\n", &["invalid-argument-type"][..]),
        ] {
            let (analysis, fixture) = native_analysis(source);
            let diagnostics = analysis.snapshot().diagnostics(fixture.main_file()).unwrap();
            let ids: Vec<_> = diagnostics.iter().map(|d| d.id().as_str()).collect();
            assert_eq!(ids, expected, "{source}: {diagnostics:?}");
        }
    }

    #[test]
    fn type_predicates_preserve_bool_and_int_branches() {
        for (kind, fallback, other, other_fallback) in
            [("bool", "False", "int", "0"), ("int", "0", "bool", "False")]
        {
            let source = format!(
                "_TYPE = type({fallback})\ndef is_kind(value: object) -> TypeIs[{kind}]:\n    return type(value) == _TYPE\ndef read(value: object) -> {kind}:\n    if is_kind(value):\n        return value\n    return {fallback}\ndef other(value: {kind} | {other}) -> {other}:\n    if is_kind(value):\n        return {other_fallback}\n    return value\n"
            );
            let (analysis, fixture) = native_analysis(&source);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert!(diagnostics.is_empty(), "{source}: {diagnostics:?}");
            let wrong = source.replace("return value", &format!("return {other_fallback}"));
            let (analysis, fixture) = native_analysis(&wrong);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|d| d.id().as_str() == "invalid-return-type"),
                "{wrong}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn top_materialization_preserves_list_constraints() {
        let source = r#"
def is_list(value: object) -> TypeIs[Top[list[Unknown]]]:
    return type(value) == "list"

def branch(value: list[str] | tuple[int, ...]) -> str | int:
    if is_list(value):
        return value[0].upper()
    return value[0] + 1

def join(left: object, right: object) -> Sequence[object]:
    if is_list(left) and is_list(right):
        return left + right
    return ()

def mutate(value: object) -> None:
    if is_list(value):
        value.append(42)
"#;
        let (mut analysis, fixture) = native_analysis(source);
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
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
        let range = diagnostics[0].range().unwrap();
        assert_eq!(
            &source[range.start().to_usize()..range.end().to_usize()],
            "42"
        );
    }

    #[test]
    fn type_names_narrow_native_values() {
        let source = r#"
DEPSET_TYPE = type(depset())
def files(value: depset[File] | runfiles) -> depset[File]:
    if type(value) == DEPSET_TYPE:
        return value
    return value.files
def as_runfiles(context: ctx, value: depset[File] | runfiles) -> runfiles:
    if type(value) != type(context.runfiles()):
        return context.runfiles(transitive_files=value)
    return value
def empty(value: depset[File]) -> bool:
    if value:
        return False
    return True
def rewrapped(value: depset[File] | runfiles) -> depset[File] | runfiles:
    if type(value) != DEPSET_TYPE:
        return value
    return depset(transitive=[value])
def members(value: runfiles) -> tuple[depset[File], depset[SymlinkEntry], depset[SymlinkEntry], depset[str]]:
    return (value.files, value.symlinks, value.root_symlinks, value.empty_filenames)
def paths(value: depset[File] | runfiles) -> list[File]:
    if type(value) == "depset":
        return value.to_list()
    return value.files.to_list()
def executable(value: File | str | FilesToRunProvider) -> File | None:
    if type(value) == "FilesToRunProvider":
        return value.executable
    return None
def required_executable(value: File | FilesToRunProvider[File]) -> File:
    if type(value) == "FilesToRunProvider":
        return value.executable
    return value
def path(value: File | str) -> str:
    if type(value) == "File":
        return value.path
    return value
def file_or_fallback(value: File | str, fallback: File) -> File:
    if type(value) != type(fallback):
        return fallback
    return value
def sequence(value: list[File] | tuple[File, ...] | None) -> list[File]:
    result: list[File] = []
    if type(value) in ("list", "tuple"):
        result.extend(value)
    return result
"#;
        let (mut analysis, fixture) = native_analysis(source);
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("unsound-return-statement".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (old, new, expected) in [
            (
                "return value\n",
                "return value.files\n",
                "unresolved-attribute",
            ),
            ("return value.path", "return value", "invalid-return-type"),
            ("-> list[File]:", "-> list[str]:", "invalid-return-type"),
            (
                "return value.executable",
                "return value",
                "invalid-return-type",
            ),
            (
                "result.extend(value)",
                "result.append(value)",
                "invalid-argument-type",
            ),
        ] {
            analysis.update_file(file, source.replacen(old, new, 1));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == expected),
                "{new}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn tuple_type_test_requires_element_checks() {
        let source = r#"def checked(value: object) -> list[str]:
    if type(value) != "tuple":
        fail("expected tuple")
    result: list[str] = []
    for element in value:
        if type(element) != "string":
            fail("expected string")
        result.append(element)
    return result

def unchecked(value: object) -> str:
    if type(value) == "tuple":
        return value[0]
    return ""
"#;
        let (mut analysis, fixture) = native_analysis(source);
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
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-return-type");
        assert_eq!(&source[diagnostics[0].range().unwrap()], "value[0]");
    }

    #[test]
    fn collection_annotations_preserve_element_types() {
        let source = r#"
def collect(values):
    # type: (Collection[str]) -> set[str]
    result = set()
    result.update(values)
    return result
collect(["a"])
collect(("a",))
collect(set(["a"]))
collect({"a": 1})
def widen(values: Collection[str]) -> Collection[object]:
    return values
def contains(values: Collection[str], candidate: object) -> bool:
    return candidate in values
"#;
        let (mut analysis, fixture) = native_analysis(source);
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(file, format!("{source}collect([1])\ncollect('abc')\n"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics.iter().map(|d| d.id().as_str()).collect();
        assert_eq!(
            ids,
            ["invalid-argument-type", "invalid-argument-type"],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn nested_iterable_annotations_preserve_element_types() {
        let source = r#"
def nested(values: Iterable[Iterable[str]]) -> None:
    pass
def deeper(values: Iterable[Iterable[Iterable[str]]]) -> None:
    pass
def specifications(values):
    # type: (Iterable[tuple[Collection[str], Mapping[str, Collection[str]]]]) -> None
    pass
nested([["ok"]])
nested((("ok",),))
deeper([[["ok"]]])
specifications([(["shared"], {"linux": ["dep"]})])
wrong: list[list[int]] = [[42]]
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        analysis.update_file(
            file,
            format!(
                "{source}nested(wrong)\ndeeper([wrong])\nspecifications([([\"shared\"], {{\"linux\": [42]}})])\n"
            ),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let ids: Vec<_> = diagnostics.iter().map(|d| d.id().as_str()).collect();
        assert_eq!(
            ids,
            [
                "invalid-argument-type",
                "invalid-argument-type",
                "invalid-argument-type"
            ],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn repeated_host_boolean_guards_preserve_boundness() {
        let (analysis, fixture) = native_analysis(
            r#"def inspect(value):
    flag = bool(value)
    if flag:
        result = 1
    if flag:
        print(result)
"#,
        );
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
    }

    #[test]
    fn native_function_annotations_check_bodies_and_build_calls() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let original = "def identity(value: int = 1) -> int:\n    # type: (string) -> string\n    return value\n";
        let definition = fixture.add_file(&mut analysis.db, "//:defs.bzl", original);
        let caller = fixture.add_file_with_options(
            &mut analysis.db,
            "BUILD.bazel",
            r#"load("//:defs.bzl", "identity")
answer = identity(1)
"#,
            starpls_common::Dialect::Bazel,
            Some(starpls_common::FileInfo::Bazel {
                api_context: starpls_bazel::APIContext::Build,
                is_external: false,
            }),
        );
        loader.add_files_from_fixture(&fixture);
        for file in [definition, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        for (source, expected) in [
            (
                original.replace("= 1", "= 'bad'"),
                "invalid-parameter-default",
            ),
            (
                original.replace("return value", "return 'bad'"),
                "invalid-return-type",
            ),
            (
                original.replace("return value", "return value + 'bad'"),
                "unsupported-operator",
            ),
        ] {
            analysis.update_file(definition, source.clone());
            let diagnostics = analysis.snapshot().diagnostics(definition).unwrap();
            assert_eq!(diagnostics.len(), 1, "{source}: {diagnostics:?}");
            assert_eq!(
                diagnostics[0].id().as_str(),
                expected,
                "{source}: {diagnostics:?}"
            );
        }
        for (source, valid) in [
            (original.to_owned(), true),
            (
                "def identity(value: string = 'ok') -> string:\n    return value\n".to_owned(),
                false,
            ),
            (original.to_owned(), true),
        ] {
            analysis.update_file(definition, source);
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            assert_eq!(diagnostics.is_empty(), valid, "{diagnostics:?}");
            if !valid {
                assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
                assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
            }
        }
    }

    #[test]
    fn source_type_aliases_are_type_only() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = r#"type Result = Name
type Name = str
type Names[T] = list[T]
type Node = str | list[Node]
def first(values: Names[Name]) -> Result:
    return values[0]
def node(value: Node) -> Node:
    return value
def shadow(Name: str) -> str:
    return Name
"#;
        let definition = fixture.add_file(&mut analysis.db, "//:defs.bzl", source);
        let caller = fixture.add_file(
            &mut analysis.db,
            "//:caller.bzl",
            "load('//:defs.bzl', 'first')\nfirst(['ok'])\n",
        );
        loader.add_files_from_fixture(&fixture);
        for file in [definition, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }

        for (file, changed, expected) in [
            (
                definition,
                source.replace("return values[0]", "return 1"),
                "invalid-return-type",
            ),
            (
                definition,
                format!("{source}print(Name)\n"),
                "unresolved-reference",
            ),
            (
                caller,
                "load('//:defs.bzl', 'first')\nfirst([1])\n".into(),
                "invalid-argument-type",
            ),
            (
                caller,
                "load('//:defs.bzl', 'Name')\n".into(),
                "unresolved-import",
            ),
        ] {
            analysis.update_file(definition, source.into());
            analysis.update_file(file, changed);
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{expected}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), expected);
        }

        for source in [
            "value = 42\ntype value = str\nresult: int = value\ntyped: value = 'ok'\n",
            "type value = str\nvalue = 42\nresult: int = value\ntyped: value = 'ok'\n",
        ] {
            analysis.update_file(definition, source.into());
            let diagnostics = analysis.snapshot().diagnostics(definition).unwrap();
            assert!(diagnostics.is_empty(), "{source}: {diagnostics:?}");
        }

        analysis.update_file(definition, "type Name = str\ntype Name = int\n".into());
        let diagnostics = analysis.snapshot().diagnostics(definition).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert!(diagnostics[0]
            .headline_message()
            .contains("already defined"));
    }

    #[test]
    fn native_assignments_check_initialization_and_reassignment() {
        let source = "value: int = 1 # type: string\nvalue = 2\nvalues: list[int] = []\nvalues.append(value)\n";
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (statement, expected) in [
            ("value: int = 'bad'", "invalid-assignment"),
            ("value: int = 1\nvalue = 'bad'", "invalid-assignment"),
            ("values: list[int] = ['bad']", "invalid-assignment"),
            (
                "values: list[int] = []\nvalues.append('bad')",
                "invalid-argument-type",
            ),
        ] {
            analysis.update_file(file, statement.to_owned());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{statement}: {diagnostics:?}");
            assert_eq!(
                diagnostics[0].id().as_str(),
                expected,
                "{statement}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn native_annotations_keep_host_types_and_nominal_shadowing() {
        let source = r#"
First = provider(fields=["value"])
Second = provider(fields=["value"])
api = struct(Info=First)
def consume(value: api.Info, items: list[int | string], pairs: tuple[int, ...]) -> api.Info:
    return value
def label(value: Label) -> Label:
    return value
def local():
    Label = First
    def identity(value: Label) -> Label:
        return value
    return identity(First(value=1))
consume(First(value=1), [1, "two"], (1, 2))
label(Label("//:target"))
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for call in [
            "consume(Second(value=1), [], ())",
            "consume(First(value=1), [None], ())",
            "label(First(value=1))",
        ] {
            analysis.update_file(file, format!("{source}\n{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{call}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
        }
        for name in ["string", "Mapping", "type_check_only"] {
            analysis.update_file(file, format!("{source}\nruntime_name = {name}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "unresolved-reference");
        }
    }

    #[test]
    fn native_annotations_remain_a_bzl_policy() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        for (path, dialect, context) in [
            (
                "defs.bzl",
                starpls_common::Dialect::Bazel,
                starpls_bazel::APIContext::Bzl,
            ),
            (
                "defs.scl",
                starpls_common::Dialect::Bazel,
                starpls_bazel::APIContext::Bzl,
            ),
            (
                "prelude.bzl",
                starpls_common::Dialect::Bazel,
                starpls_bazel::APIContext::Prelude,
            ),
            (
                "deploy.star",
                starpls_common::Dialect::Standard,
                starpls_bazel::APIContext::Bzl,
            ),
            (
                "BUILD.bazel",
                starpls_common::Dialect::Bazel,
                starpls_bazel::APIContext::Build,
            ),
        ] {
            let file = fixture.add_file_with_options(
                &mut analysis.db,
                path,
                "value: int = 1\ndef identity(value: int) -> int:\n    return value\n",
                dialect,
                Some(starpls_common::FileInfo::Bazel {
                    api_context: context,
                    is_external: false,
                }),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(
                diagnostics.is_empty(),
                path == "defs.bzl",
                "{path}: {diagnostics:?}"
            );
        }

        for (path, body) in [("modes.bzl", "return value"), ("modes.bzli", "...")] {
            let source =
                format!("def identity(value: int) -> int:\n    # type: (int) -> int\n    {body}\n");
            let comment_offset = ruff_text_size::TextSize::try_from(
                source.find("# type: (int) -> int").unwrap() + "# type: (int) -> ".len(),
            )
            .unwrap();
            let file = fixture.add_file(&mut analysis.db, path, &source);
            let contexts = [
                (
                    starpls_common::Dialect::Bazel,
                    starpls_bazel::APIContext::Bzl,
                    false,
                ),
                (
                    starpls_common::Dialect::Bazel,
                    starpls_bazel::APIContext::Prelude,
                    false,
                ),
                (
                    starpls_common::Dialect::Standard,
                    starpls_bazel::APIContext::Bzl,
                    false,
                ),
                (
                    starpls_common::Dialect::Bazel,
                    starpls_bazel::APIContext::Bzl,
                    true,
                ),
            ];
            for (dialect, api_context, is_external) in contexts {
                let contextual = starpls_common::File {
                    source: file.source,
                    dialect,
                    info: Some(starpls_common::FileInfo::Bazel {
                        api_context,
                        is_external,
                    }),
                };
                let admitted = dialect == starpls_common::Dialect::Bazel
                    && api_context == starpls_bazel::APIContext::Bzl;
                let diagnostics = starpls_common::syntax_diagnostics(&analysis.db, contextual);
                assert_eq!(
                    diagnostics.is_empty(),
                    admitted,
                    "{path}: {contextual:?}: {diagnostics:?}",
                );
                assert_eq!(
                    starpls_hir::Source::new(&analysis.db)
                        .type_comment_owner(contextual, comment_offset)
                        .is_some(),
                    admitted,
                    "{path}: {contextual:?}",
                );
            }
        }
    }

    #[test]
    fn macro_attributes_use_shared_call_checking() {
        let source = r#"
def implementation(**kwargs):
    pass
constructor = macro
miniature = constructor(
    implementation=implementation,
    attrs={
        "optional": attr.string(),
        "required": attr.string(mandatory=True),
        "flag": attr.bool(),
        "disabled": None,
    },
)
miniature(name="example", required="ok", optional="ok")
miniature(name="example", **{"required": "ok"})
miniature(name="example", required="ok", flag=0)
miniature(name="example", required="ok", flag=1)
miniature(name="example", required="ok", flag=True)
miniature(name="example", **{"required": "ok", "flag": False})
example_rule = rule(implementation=implementation, attrs={"flag": attr.bool()})
example_rule(name="zero", flag=0)
example_rule(name="one", flag=1)
example_rule(name="true", flag=True)
example_rule(name="false", flag=False)
def shadowed():
    def macro(value):
        # type: (int) -> int
        return value
    return macro(1)
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for (call, expected) in [
            (
                "miniature(name=\"example\", required=\"ok\", optional=1)",
                "invalid-argument-type",
            ),
            ("miniature(name=\"example\", optional=\"ok\")", "missing-argument"),
            (
                "miniature(name=\"example\", required=\"ok\", disabled=\"bad\")",
                "unknown-argument",
            ),
            (
                "miniature(name=\"example\", **{\"required\": \"ok\", \"disabled\": \"bad\"})",
                "unknown-argument",
            ),
            ("miniature(name=\"example\", required=\"ok\", flag=2)", "invalid-argument-type"),
            (
                "def generic(value):\n    # type: (int) -> None\n    miniature(name=\"example\", required=\"ok\", flag=value)",
                "invalid-argument-type",
            ),
            ("example_rule(name=\"bad\", flag=2)", "invalid-argument-type"),
            (
                "def generic(value):\n    # type: (int) -> None\n    example_rule(name=\"bad\", flag=value)",
                "invalid-argument-type",
            ),
            ("attr.bool(mandatory=1)", "invalid-argument-type"),
        ] {
            analysis.update_file(file, format!("{source}\n{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{call}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), expected, "{call}");
            assert!(diagnostics[0].range().unwrap().start().to_usize() >= source.len());
        }
    }

    #[test]
    fn macro_inheritance_requires_nominal_rules() {
        let source = r#"
def implementation(**kwargs):
    pass
precise = rule(implementation=implementation, attrs={"value": attr.string()})
def unknown_rule(attributes):
    return rule(implementation=implementation, attrs=attributes)
fallback = unknown_rule({})
parent = macro(implementation=implementation, attrs={})
child = macro(implementation=implementation, inherit_attrs=precise)
macro(implementation=implementation, inherit_attrs=fallback)
macro(implementation=implementation, inherit_attrs=parent)
precise(name="ok", value="value")
fallback(name="unknown", arbitrary=1)
child(name="child", value="value")
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for call in [
            "macro(implementation=implementation, inherit_attrs=implementation)",
            "macro(implementation=implementation, inherit_attrs=42)",
            "macro(implementation=implementation, inherit_attrs=repository_rule(implementation=implementation, attrs={}))",
            "precise(name=\"bad\", value=42)",
        ] {
            analysis.update_file(file, format!("{source}\n{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{call}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
            if call.starts_with("macro(") {
                assert_eq!(
                    diagnostics[0].headline_message(),
                    "Argument to function `macro` is incorrect"
                );
            }
            assert!(diagnostics[0].range().unwrap().start().to_usize() >= source.len());
        }
    }

    #[test]
    fn macros_compose_public_attribute_contracts() {
        let source = r#"
def implementation(**kwargs):
    pass
base = rule(implementation=implementation, attrs={
    "required": attr.label_list(mandatory=True),
    "optional": attr.string(default="parent", doc="Original optional attribute."),
    "removed": attr.int(),
    "_private": attr.string(),
    "generator_custom": attr.string(),
})
child = macro(implementation=implementation, inherit_attrs=base, attrs={
    "optional": attr.int(default=3),
    "removed": None,
    "own": attr.string(mandatory=True),
})
grandchild = macro(implementation=implementation, inherit_attrs=child)
common = macro(implementation=implementation, inherit_attrs="common")
closed = macro(implementation=implementation, inherit_attrs=None)
def uncertain():
    # type: () -> Any
    pass
unknown = macro(implementation=implementation, inherit_attrs=uncertain(),
                attrs={"own": attr.int(mandatory=True), "removed": None})
unknown_child = macro(implementation=implementation, inherit_attrs=unknown)
partial = macro(implementation=implementation, attrs=uncertain())
partial_child = macro(implementation=implementation, inherit_attrs=base, attrs=uncertain())
partial_common = macro(implementation=implementation, inherit_attrs="common", attrs=uncertain())
observed = {"observed": attr.int(mandatory=True)}
mutable = macro(implementation=implementation, attrs=observed)
child(name="ok", required=["//:input"], own="ok", optional=None)
grandchild(name="ok", required=[], own="ok", optional=42, generator_custom="ok")
common(name="ok", tags=["tag"], visibility=None)
closed(name="ok", visibility=["//visibility:public"])
unknown(name="ok", own=42, anything="ok")
partial(name="ok", anything=42)
partial_child(name="ok")
partial_child(name="ok", required=42)
partial_common(name="ok", tags=42)
mutable(name="ok", observed=1)
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (call, expected) in [
            ("mutable(name='bad')", "missing-argument"),
            (
                "mutable(name='bad', observed='unproved')",
                "invalid-argument-type",
            ),
            (
                "child(name='bad', required=42, own='ok')",
                "invalid-argument-type",
            ),
            (
                "child(name='bad', required=None, own='ok')",
                "invalid-argument-type",
            ),
            ("child(name='bad', own='ok')", "missing-argument"),
            (
                "child(name='bad', required=[], own='ok', optional='bad')",
                "invalid-argument-type",
            ),
            (
                "grandchild(name='bad', required=[], own='ok', removed=None)",
                "unknown-argument",
            ),
            (
                "child(name='bad', required=[], own='ok', _private=None)",
                "unknown-argument",
            ),
            ("child(required=[], own='ok')", "missing-argument"),
            ("closed(name=42)", "invalid-argument-type"),
            ("closed(name='bad', visibility=42)", "invalid-argument-type"),
            ("closed(name='bad', arbitrary=None)", "unknown-argument"),
            ("common(name='bad', tags=42)", "invalid-argument-type"),
            ("unknown(name='bad', own='bad')", "invalid-argument-type"),
            ("unknown(name='bad')", "missing-argument"),
            (
                "unknown(name='bad', own=42, removed=None)",
                "invalid-argument-type",
            ),
            (
                "unknown_child(name='bad', own=42, removed=None)",
                "invalid-argument-type",
            ),
            (
                "macro(implementation=implementation, inherit_attrs='other')",
                "invalid-argument-type",
            ),
        ] {
            analysis.update_file(file, format!("{source}\n{call}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{call}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), expected, "{call}");
            assert!(diagnostics[0].range().unwrap().start().to_usize() >= source.len());
        }
    }

    #[test]
    fn rule_kwargs_preserve_dictionary_snapshot_keys() {
        let source = r#"
def implementation(ctx):
    return []
example = rule(implementation=implementation, attrs={
    "first": attr.string_list(),
    "second": attr.string_list(),
    "enabled": attr.bool(),
})
def wrapper(targets: list[str] | None):
    attributes = {"first": targets, "second": targets}
    options = {name: value for name, value in attributes.items() if value != None}
    example(name="target", **options)
    entries = attributes.items() # type: list[tuple[str, list[str] | None]]
    entries.append(("additional", None))
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        let source = source.replace("list[str]", "list[int]");
        analysis.update_file(file, source.clone());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            !diagnostics.is_empty(),
            "integer attribute values were accepted"
        );
        for diagnostic in diagnostics {
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
            let range = diagnostic.range().unwrap();
            assert!(source[range.start().to_usize()..range.end().to_usize()].contains("options"));
            let message = diagnostic.concise_message().to_string();
            assert!(message.contains("list[int]"), "{message}");
            assert!(message.contains("str"), "{message}");
            assert!(!message.contains("bool"), "{message}");
        }
    }

    #[test]
    fn macro_implementation_parameters_use_converted_attributes() {
        let source = r#"
def rule_impl(ctx):
    pass
base = rule(implementation=rule_impl, attrs={"inherited": attr.string()})
def implementation(name, visibility, srcs, tool, optional, inherited, _private, _private_list, out, **kwargs):
    checked_name = name # type: str
    checked_visibility = visibility # type: list[Label]
    checked_srcs = srcs # type: select[list[Label] | None]
    checked_tool = tool # type: Label
    checked_optional = optional # type: select[Label | None] | None
    checked_inherited = inherited # type: select[str | None] | None
    checked_private = _private # type: select[int]
    combined_private = _private_list + [] # type: select[list[Label]]
    checked_out = out # type: Label | None
    base(name=name, inherited=inherited)
    # EXTRA
    return None
example = macro(implementation=implementation, inherit_attrs=base, attrs={
    "srcs": attr.label_list(),
    "tool": attr.label(mandatory=True, configurable=False),
    "optional": attr.label(),
    "_private": attr.int(default=3),
    "_private_list": attr.label_list(default=["//:private"]),
    "out": attr.output(),
})
example(name="ok", tool="//:tool", srcs=["//:source"])
example(name="omitted", tool="//:tool", _private=None)
"#;
        let (mut analysis, fixture) = native_analysis(source);
        analysis
            .db
            .environment()
            .set_options(&mut analysis.db)
            .to(crate::InferenceOptions {
                infer_ctx_attributes: true,
                use_code_flow_analysis: false,
                allow_unused_definitions: true,
                skip_load_cycle_checks: false,
            });
        let file = fixture.main_file();
        for _ in 0..2 {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        for (name, expected) in [
            ("srcs", "select[list[Label] | None, object]"),
            ("combined_private", "select[list[Label], Literal[\"list\"]]"),
        ] {
            let hover = analysis
                .snapshot()
                .hover(crate::FilePosition {
                    file_id: file,
                    pos: (source.find(name).unwrap() as u32).into(),
                })
                .unwrap()
                .unwrap();
            assert!(
                hover
                    .contents
                    .value
                    .contains(&format!("{name}: {expected}\n")),
                "{}",
                hover.contents.value
            );
        }
        for (statement, expected) in [
            ("bad = srcs # type: list[Label]", "invalid-assignment"),
            (
                "bad = srcs # type: select[list[int] | None]",
                "invalid-assignment",
            ),
            ("bad = srcs + []", "unsupported-operator"),
            ("bad = tool # type: str", "invalid-assignment"),
            ("bad = visibility # type: list[str]", "invalid-assignment"),
            (
                "bad = inherited # type: select[str | None]",
                "invalid-assignment",
            ),
            ("bad = _private # type: int", "invalid-assignment"),
            ("srcs[0]", "not-subscriptable"),
        ] {
            analysis.update_file(file, source.replace("# EXTRA", statement));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{statement}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), expected, "{statement}");
        }
        for statement in [
            "example(name='bad', tool='//:tool', _private=3)",
            "attr.label_list(default=[42])",
        ] {
            analysis.update_file(file, format!("{source}\n{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{statement}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
        }
    }

    #[test]
    fn configurable_attributes_check_select_alternatives() {
        let source = r#"
def rule_impl(ctx):
    pass
def implementation(name, visibility, **kwargs):
    pass
source_rule = rule(implementation=rule_impl, attrs={
    "srcs": attr.label_list(), "out": attr.output(),
})
required_rule = rule(implementation=rule_impl, attrs={"value": attr.string(mandatory=True)})
repository = repository_rule(implementation=rule_impl, attrs={"srcs": attr.label_list()})
required_repository = repository_rule(implementation=rule_impl, attrs={"value": attr.string(mandatory=True)})
parent = macro(implementation=implementation, attrs={
    "srcs": attr.label_list(),
    "target": attr.label(mandatory=True, configurable=False),
})
child = macro(implementation=implementation, inherit_attrs=parent)
common = macro(implementation=implementation, inherit_attrs="common")
native_child = macro(implementation=implementation, inherit_attrs=native.example)
def uncertain():
    # type: () -> bool
    return True
partial = macro(implementation=implementation,
                attrs={"value": attr.string(configurable=uncertain())})
paths = select({"//:condition": ["//:input"], "//conditions:default": []})
source_rule(name="ok", srcs=paths + ["//:extra"], out="out")
source_rule(name="label_output", out=Label("//:out"))
source_rule(name="default", srcs=select({"//:condition": None}))
source_rule(name="omitted", srcs=None, out=None, tags=None)
repository(name="omitted", srcs=None)
child(name="ok", target="//:input", srcs=paths)
common(name="ok", features=select({"//:condition": ["feature"]}))
native.example(name="ok", srcs=paths, target="//:input", uncertain=select({"//:condition": "ok"}), outs=[Label("//:out")])
native.example(name="omitted", srcs=None, target=None, outs=None)
native_child(name="ok", srcs=paths, target="//:input")
partial(name="ok", value=select({"//:condition": "ok"}))
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let builtins = analysis
            .db
            .get_builtin_defs(&starpls_common::Dialect::Bazel)
            .builtins(&analysis.db)
            .clone();
        use starpls_bazel::build::attribute::Discriminator;
        analysis
            .set_builtin_defs(
                builtins,
                starpls_bazel::build::BuildLanguage {
                    rule: vec![starpls_bazel::build::RuleDefinition {
                        name: "example".to_owned(),
                        attribute: [
                            ("name", Discriminator::String, Some(false), true),
                            ("srcs", Discriminator::LabelList, Some(true), false),
                            ("target", Discriminator::Label, Some(false), false),
                            ("uncertain", Discriminator::String, None, false),
                            ("outs", Discriminator::OutputList, None, false),
                        ]
                        .into_iter()
                        .map(|(name, kind, configurable, mandatory)| {
                            starpls_bazel::build::AttributeDefinition {
                                name: name.to_owned(),
                                r#type: kind as i32,
                                configurable,
                                mandatory: Some(mandatory),
                                ..Default::default()
                            }
                        })
                        .collect(),
                        ..Default::default()
                    }],
                },
            )
            .unwrap();
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for statement in [
            "source_rule(name=None)",
            "required_rule(name='bad', value=None)",
            "required_repository(name='bad', value=None)",
            "native.example(name=None)",
            "child(name='bad', target=None)",
            "source_rule(name='bad', srcs=select({'//:condition': [42]}))",
            "source_rule(name='bad', srcs=select({'//:condition': ['ok'], '//conditions:default': [42]}))",
            "source_rule(name='bad', out=select({'//:condition': 'out'}))",
            "repository(name='bad', srcs=select({'//:condition': ['//:input']}))",
            "source_rule(name=select({'//:condition': 'bad'}))",
            "child(name='bad', target=select({'//:condition': '//:input'}))",
            "child(name='bad', target='//:input', srcs=select({'//:condition': [42]}))",
            "common(name='bad', tags=select({'//:condition': ['tag']}))",
            "native.example(name='bad', target=select({'//:condition': '//:input'}))",
            "native.example(name='bad', srcs=select({'//:condition': [42]}))",
            "native.example(name='bad', uncertain=select({'//:condition': 42}))",
            "native.example(name='bad', outs=select({'//:condition': ['out']}))",
            "native_child(name='bad', target=select({'//:condition': '//:input'}))",
            "partial(name='bad', value=select({'//:condition': 42}))",
        ] {
            analysis.update_file(file, format!("{source}\n{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{statement}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type", "{statement}");
            assert!(diagnostics[0].range().unwrap().start().to_usize() >= source.len());
        }
    }

    #[test]
    fn boolean_selector_addition() {
        let boolean = "select({'//:a': True})";
        let none = "select({'//conditions:default': None, '//:a': True})";
        for (expression, valid) in [
            (format!("{boolean} + {boolean}"), true),
            (format!("{boolean} + False"), true),
            (format!("False + {boolean}"), true),
            (format!("{boolean} | {boolean}"), false),
            (format!("{boolean} | False"), false),
            (format!("False | {boolean}"), false),
            (format!("{boolean} + 1"), false),
            (format!("1 + {boolean}"), false),
            (format!("{boolean} + select({{'//:b': 1}})"), false),
            (format!("select({{'//:b': 1}}) + {boolean}"), false),
            (format!("{boolean} + {none}"), false),
            (format!("{none} + {boolean}"), false),
            ("True + False".to_owned(), false),
        ] {
            let (analysis, fixture) = native_analysis(&expression);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert_eq!(
                diagnostics.is_empty(),
                valid,
                "{expression}: {diagnostics:#?}"
            );
        }
    }

    #[test]
    fn selects_preserve_alternatives_and_deferred_operations() {
        let source = r#"
strings = {"//:condition": ["a"], "//conditions:default": []}
labels = {Label("//:condition"): ["a"]}
mixed_keys = {"//:condition": ["a"], Label("//:other"): ["b"]}
values = select(strings)
known_values = select({"//:condition": ["a"]})
known_mixed = known_values + [42]
literal_text = select({"//:condition": "a"}) + select({"//:condition": "b"})
known_empty = known_values + []
known_empty_left = [] + known_values
unknown_elements = [] # type: list[Unknown]
gradual_elements = known_values + unknown_elements
gradual_selected = known_values + select({"//conditions:default": unknown_elements})
any_elements = [] # type: list[Any]
any_selected = known_values + select({"//conditions:default": any_elements})
def add_unknown(other):
    gradual_operand = known_values + other
    return gradual_operand
declared_values = known_values # type: select[list[str]]
declared_mixed = declared_values + [42]
nullable_values = select({"//:condition": ["a"], "//conditions:default": None})
nullable_mixed = nullable_values + [42]
nullable_empty = nullable_values + []
mapping_empty = select({"//:condition": {"a": 1}}) | {}
mapping_empty_left = {} | select({"//:condition": {"a": 1}})
select(labels)
select(mixed_keys)
right = values + ["b"] # type: select[list[str]]
left = ["b"] + values # type: select[list[str]]
pair = values + select({"//:condition": ["b"]}) # type: select[list[str]]
tuple_values = select({"//:condition": ("a",)}) + ["b"] # type: select[list[str]]
range_values = select({"//:condition": range(3)}) + [4] # type: select[list[int]]
range_right = known_values + range(3)
range_left = range(3) + known_values
mixed_values = select({"//:condition": ["a"], "//conditions:default": [42]}) + [] # type: select[list[str | int]]
defaulted = select({"//:condition": ["a"], "//conditions:default": None}) # type: select[list[str] | None]
defaulted_right = defaulted + ["b"] # type: select[list[str] | None]
defaulted_left = ["b"] + defaulted # type: select[list[str] | None]
defaulted_text = "b" + select({"//:condition": "a", "//conditions:default": None}) # type: select[str | None]
defaulted_mapping = {"a": 1} | select({"//:condition": {"b": "c"}, "//conditions:default": None}) # type: select[dict[str, int | str] | None]
integer_right = select({"//:condition": 1}) + 2
integer_left = 2 + select({"//:condition": 1})
integer_pair = select({"//:condition": 1}) + select({"//:condition": 2})
integer_defaulted = select({"//:condition": 1, "//conditions:default": None}) + 2
none_right = select({"//:condition": None}) + None
none_left = None + select({"//:condition": None})
none_pair = select({"//:condition": None}) + select({"//:condition": None})
text = select({"//:condition": "a"}) + "b" # type: select[str]
text_before = "b" + select({"//:condition": "a"}) # type: select[str]
mapping = select({"//:condition": {"a": 1}}) | {"b": "c"} # type: select[dict[str, int | str]]
mapping_before = {"a": 1} | select({"//:condition": {"b": "c"}}) # type: select[dict[str, int | str]]
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let mut mismatches = Vec::new();
        for (name, expected) in [
            ("integer_right", "select[int, Literal[\"int\"]]"),
            ("integer_left", "select[int, Literal[\"int\"]]"),
            ("integer_pair", "select[int, Literal[\"int\"]]"),
            ("integer_defaulted", "select[int | None, Literal[\"int\"]]"),
            ("none_right", "select[None, Literal[\"none\"]]"),
            ("none_left", "select[None, Literal[\"none\"]]"),
            ("none_pair", "select[None, Literal[\"none\"]]"),
            ("known_mixed", "select[list[str | int], Literal[\"list\"]]"),
            ("literal_text", "select[str, Literal[\"str\"]]"),
            ("mixed_values", "select[list[str | int], Literal[\"list\"]]"),
            ("range_right", "select[list[str | int], Literal[\"list\"]]"),
            ("range_left", "select[list[str | int], Literal[\"list\"]]"),
            (
                "declared_mixed",
                "select[list[str | int], Literal[\"list\"]]",
            ),
            (
                "nullable_mixed",
                "select[list[str | int] | None, Literal[\"list\"]]",
            ),
            (
                "known_empty",
                "select[list[str | Unknown], Literal[\"list\"]]",
            ),
            (
                "known_empty_left",
                "select[list[str | Unknown], Literal[\"list\"]]",
            ),
            (
                "nullable_empty",
                "select[list[str | Unknown] | None, Literal[\"list\"]]",
            ),
            (
                "mapping_empty",
                "select[dict[str | Unknown, int | Unknown], Literal[\"dict\"]]",
            ),
            (
                "mapping_empty_left",
                "select[dict[str | Unknown, int | Unknown], Literal[\"dict\"]]",
            ),
            (
                "gradual_elements",
                "select[list[str | Unknown], Literal[\"list\"]]",
            ),
            (
                "gradual_selected",
                "select[list[str | Unknown], Literal[\"list\"]]",
            ),
            ("any_selected", "select[list[str | Any], Literal[\"list\"]]"),
            ("gradual_operand", "Unknown"),
        ] {
            let hover = analysis
                .snapshot()
                .hover(crate::FilePosition {
                    file_id: file,
                    pos: (source.find(name).unwrap() as u32).into(),
                })
                .unwrap()
                .unwrap();
            if !hover
                .contents
                .value
                .contains(&format!("{name}: {expected}\n"))
            {
                mismatches.push(hover.contents.value);
            }
        }
        assert!(mismatches.is_empty(), "{mismatches:#?}");
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for (statement, expected) in [
            (
                "bad = values # type: select[list[int]]",
                "invalid-assignment",
            ),
            (
                "bad = known_empty # type: select[list[int]]",
                "invalid-assignment",
            ),
            (
                "bad = known_mixed # type: select[list[str]]",
                "invalid-assignment",
            ),
            (
                "bad = known_mixed # type: select[list[int]]",
                "invalid-assignment",
            ),
            (
                "bad = nullable_mixed # type: select[list[str] | None]",
                "invalid-assignment",
            ),
            (
                "bad = nullable_mixed # type: select[list[int] | None]",
                "invalid-assignment",
            ),
            (
                "bad = nullable_empty # type: select[list[int] | None]",
                "invalid-assignment",
            ),
            (
                "bad = mapping_empty # type: select[dict[str, str]]",
                "invalid-assignment",
            ),
            (
                "bad = mixed_values # type: select[list[str]]",
                "invalid-assignment",
            ),
            (
                "bad = range_right # type: select[list[str]]",
                "invalid-assignment",
            ),
            (
                "bad = range_left # type: select[list[str]]",
                "invalid-assignment",
            ),
            (
                "select({'//:condition': None}) + range(3)",
                "unsupported-operator",
            ),
            (
                "range(3) + select({'//:condition': None})",
                "unsupported-operator",
            ),
            (
                "bad = mapping # type: select[dict[str, str]]",
                "invalid-assignment",
            ),
            ("select({42: ['a']})", "invalid-argument-type"),
            ("values[0]", "not-subscriptable"),
            ("list(values)", "invalid-argument-type"),
            ("values.append('a')", "unresolved-attribute"),
            ("values + 'a'", "unsupported-operator"),
            (
                "bad = defaulted_right # type: select[list[str]]",
                "invalid-assignment",
            ),
            (
                "bad = defaulted_left # type: select[list[str]]",
                "invalid-assignment",
            ),
            (
                "bad = defaulted_text # type: select[str]",
                "invalid-assignment",
            ),
            (
                "bad = defaulted_mapping # type: select[dict[str, int | str]]",
                "invalid-assignment",
            ),
            ("select({'//:condition': 1}) + 'a'", "unsupported-operator"),
            ("select({'//:condition': 1}) + True", "unsupported-operator"),
            ("select({'//:condition': 1}) + None", "unsupported-operator"),
            (
                "select({'//:condition': -1}) + None",
                "unsupported-operator",
            ),
            ("None + select({'//:condition': 1})", "unsupported-operator"),
            (
                "(select({'//:condition': 1}) + 2) + None",
                "unsupported-operator",
            ),
            (
                "None + (2 + select({'//:condition': 1}))",
                "unsupported-operator",
            ),
            // The annotation on defaulted erases its kind; nullable_values retains it.
            ("nullable_values + None", "unsupported-operator"),
            ("None + nullable_values", "unsupported-operator"),
            (
                "select({'//:condition': None}) | None",
                "unsupported-operator",
            ),
            ("None + None", "unsupported-operator"),
        ] {
            analysis.update_file(file, format!("{source}\n{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{statement}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), expected, "{statement}");
        }
    }

    #[test]
    fn sets_preserve_elements_and_starlark_operations() {
        let source = r#"numbers = set([1, 2])
copied: set[int] = numbers.union()
mixed: set[int | str] = numbers.union(['a'], {'b': 1})
combined: set[int | str] = numbers | set(['a'])
changed: set[int | str] = numbers ^ set(['a'])
shared: set[int] = numbers & set(['a'])
remaining: set[int] = numbers - set(['a'])
intersected: set[int] = numbers.intersection([1], {1: 'one'})
difference: set[int] = numbers.difference(['a'])
symmetric: set[int | str] = numbers.symmetric_difference(['a'])
elements: list[int] = list(numbers)
element: int = numbers.pop()
characters: set[str] = set('abc'.elems())
characters.update('def'.elems())
more_characters: set[str] = characters.union('ghi'.elems())
numbers.add(3)
numbers.update([4], {5: 'five'})
numbers.difference_update(['a'])
numbers.intersection_update([1, 2])
numbers.symmetric_difference_update([1, 3])
numbers |= set([4])
numbers ^= set([5])
numbers &= set(['a'])
numbers -= set(['a'])
wide: set[int | str] = set([1, 'a'])
wide |= numbers
wide ^= numbers
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for statement in [
            "numbers.add('bad')",
            "numbers.update(['bad'])",
            "numbers |= set(['bad'])",
            "numbers ^= set(['bad'])",
            "numbers |= [1]",
            "numbers | [1]",
            "numbers < set([2])",
            "numbers.copy()",
            "set(elements=[1])",
            "set('abc')",
            "bad: set[str] = numbers.union()",
            "bad: str = numbers.pop()",
        ] {
            analysis.update_file(file, format!("{source}{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{statement}: {diagnostics:?}");
            };
            assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
        }
    }

    #[test]
    fn min_and_max_preserve_comparable_element_types() {
        for name in ["min", "max"] {
            let source = format!(
                r#"def key(value: dict[str, int]) -> int:
    return value["size"]
numbers = [1, 2]
records = [{{"size": 1}}, {{"size": 2}}]
integer: int = {name}(numbers)
scalar: int = {name}(1, 2, 3)
floating: float = {name}((1.0, 2.0))
text: str = {name}("abc".elems(), key=None)
flag: bool = {name}([False, True])
selected: dict[str, int] = {name}(records, key=key)
pair: dict[str, int] = {name}(records[0], records[1], key=key)
"#
            );
            let (mut analysis, fixture) = native_analysis(&source);
            let file = fixture.main_file();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{name}: {diagnostics:?}");
            for statement in [
                format!("{name}(numbers, default=0)"),
                format!("{name}(numbers, key=42)"),
                format!("{name}(1)"),
                format!("{name}(records)"),
                format!("{name}(numbers, key)"),
                format!("bad: str = {name}(numbers)"),
                format!("bad: int = {name}(records, key=key)"),
            ] {
                analysis.update_file(file, format!("{source}{statement}\n"));
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                let [diagnostic] = diagnostics.as_slice() else {
                    panic!("{statement}: {diagnostics:?}");
                };
                assert!(usize::from(diagnostic.range().unwrap().start()) >= source.len());
            }
        }
    }

    #[test]
    fn depsets_preserve_element_types_and_target_defaults() {
        let source = r#"
def inspect(target, artifact):
    # type: (Target, File) -> None
    files = target[DefaultInfo].files.to_list() # type: list[File]
    inputs = [artifact]
    direct = depset(inputs)
    tuple_direct = depset((artifact,))
    children = [direct]
    transitive = depset(transitive=children)
    combined = depset([artifact], transitive=[transitive])
    for values in [direct, tuple_direct, transitive, combined]:
        checked = values.to_list() # type: list[File]
        print(checked)
    raw = DefaultInfo(files=direct).files.to_list() # type: list[File]
    strings = depset(["value"]).to_list() # type: list[str]
    print(files, raw, strings)
def unknown(target, key, values):
    # type: (Target, Unknown, Unknown) -> None
    gradual = target[key] # type: int
    elements = depset(values).to_list() # type: list[int]
    transitive = depset(transitive=values).to_list() # type: list[str]
    empty = depset().to_list()
    print(gradual, elements, transitive, empty)
def unknown_elements(direct: list[Unknown], transitive: list[depset[Unknown]], dynamic: Any, dynamic_direct: list[Any], dynamic_transitive: list[depset[Any]]) -> None:
    values = depset(direct).to_list() # type: list[int]
    children = depset(transitive=transitive).to_list() # type: list[str]
    dynamic_values = depset(dynamic).to_list() # type: list[int]
    dynamic_elements = depset(dynamic_direct).to_list() # type: list[str]
    dynamic_children = depset(transitive=dynamic_transitive).to_list() # type: list[int]
    print(values, children, dynamic_values, dynamic_elements, dynamic_children)
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for expression in [
            "depset([\"value\"]).to_list().append(1)",
            "DefaultInfo(files=depset([\"value\"]))",
            "DefaultInfo(files=depset(transitive=[depset([\"value\"])]))",
            "DefaultInfo().files.to_list()",
            "DefaultInfo(files=None).files.to_list()",
            "depset(transitive=[[1]])",
            "depset(\"value\")",
            "list(depset([1]))",
            "depset([], \"default\", [])",
            "def invalid_target(target):\n    # type: (Target) -> None\n    target[DefaultInfo].files.to_list().append(\"bad\")",
            "def invalid_raw(info):\n    # type: (DefaultInfo) -> None\n    info.files.to_list()",
        ] {
            analysis.update_file(file, format!("{source}\n{expression}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(!diagnostics.is_empty(), "{expression}");
            assert!(
                diagnostics.iter().all(|diagnostic| diagnostic
                    .range()
                    .is_some_and(|range| range.start().to_usize() >= source.len())),
                "{expression}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn default_info_tracks_files_to_run_presence() {
        let source = r#"
def inspect(target: Target, artifact: File, info: DefaultInfo, precise: DefaultInfo[depset[File]]):
    raw = DefaultInfo().files_to_run # type: None
    raw_executable = DefaultInfo(executable=artifact).files_to_run # type: None
    files = DefaultInfo(files=depset([artifact])).files.to_list() # type: list[File]
    configured_files = target[DefaultInfo].files.to_list() # type: list[File]
    for value in [target[DefaultInfo].files_to_run, info.files_to_run, precise.files_to_run]:
        if value != None:
            executable = value.executable
            if executable != None:
                print(executable.path)
    print(raw, raw_executable, files, configured_files)
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for expression in [
            "DefaultInfo().files_to_run.executable",
            "DefaultInfo(executable=artifact).files_to_run.executable",
            "target[DefaultInfo].files_to_run.executable",
            "info.files_to_run.executable",
            "precise.files_to_run.executable",
        ] {
            analysis.update_file(file, format!("{source}    {expression}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{expression}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "unresolved-attribute");
            assert!(diagnostic.concise_message().to_string().contains("None"));
            assert!(diagnostic
                .range()
                .is_some_and(|range| range.start().to_usize() >= source.len()));
        }
    }

    #[test]
    fn targets_expose_labels_and_typed_provider_lookup() {
        let source = r#"
Info = provider(fields=["message"])
def inspect(target):
    # type: (Target) -> None
    label = target.label # type: Label
    info = target[DefaultInfo] # type: DefaultInfo
    cc = target[CcInfo] # type: CcInfo
    coverage = target[InstrumentedFilesInfo] # type: InstrumentedFilesInfo
    custom = target[Info] # type: Info
    for key in [DefaultInfo, CcInfo, InstrumentedFilesInfo, Info]:
        if key in target:
            print(target[key])
    print(label, info, cc, coverage, custom)
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for statement in [
            "    wrong = target[DefaultInfo] # type: CcInfo",
            "    wrong = target[InstrumentedFilesInfo] # type: CcInfo",
            "    wrong = target[Info] # type: DefaultInfo",
            "    target[42]",
            "    42 in target",
        ] {
            analysis.update_file(file, format!("{source}{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| {
                    matches!(
                        diagnostic.id().as_str(),
                        "invalid-assignment" | "invalid-argument-type" | "unsupported-operator"
                    ) && diagnostic
                        .range()
                        .is_some_and(|range| range.start().to_usize() >= source.len())
                }),
                "{statement}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn qualified_provider_comments_keep_nominal_identity() {
        let source = r#"
First = provider(fields=["value"])
Second = provider(fields=["value"])
api = struct(Info=First)
def consume(value):
    # type: (api.Info) -> api.Info
    return value
accepted = consume(First(value=1)) # type: api.Info
"#;
        let (mut analysis, fixture) = native_analysis(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        analysis.update_file(file, format!("{source}\nconsume(Second(value=1))\n"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "invalid-argument-type");
    }

    #[test]
    fn collection_operators_keep_starlark_contracts() {
        let source = r#"
items = [1] + ["x"] # type: list[int | string]
mapping = {"x": 1} | {2: "y"} # type: dict[int | string, int | string]
forward = "x" * 2 # type: string
reverse = 2 * "x" # type: string
repeated = 2 * [1] # type: list[int]
"example".startswith(("e", "x"))
"#;
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        let file = fixture.main_file();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");

        for (statement, expected) in [
            ("narrow = items # type: list[int]", "invalid-assignment"),
            (
                "narrow = mapping # type: dict[string, int]",
                "invalid-assignment",
            ),
            ("narrow = reverse # type: int", "invalid-assignment"),
            (
                "\"example\".startswith((\"e\", 1))",
                "invalid-argument-type",
            ),
        ] {
            analysis.update_file(file, format!("{source}\n{statement}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert_eq!(diagnostics.len(), 1, "{statement}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), expected, "{statement}");
        }
    }

    #[test]
    fn flow_reachability_is_invalidated_after_edits() {
        let options = InferenceOptions {
            use_code_flow_analysis: true,
            ..Default::default()
        };
        let mut analysis = Analysis::with_system(
            Arc::new(SimpleFileLoader::default()),
            options,
            ruff_db::system::InMemorySystem::default(),
        );
        let original = "fail()\nx = 1\n";
        let (fixture, _) = Fixture::from_single_file(&mut analysis.db, original);

        for (source, unreachable) in [
            (original, true),
            ("str()\nx = 1\n", false),
            (original, true),
        ] {
            analysis.update_file(fixture.main_file(), source.to_owned());

            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert_eq!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.headline_message() == "Code is unreachable"),
                unreachable,
                "{source}: {diagnostics:?}",
            );
        }
    }

    #[test]
    fn incomplete_headers_do_not_capture_later_statements() {
        for source in [
            "def broken()\nx = {\"k\": 1}\ny = 2\n",
            "if x\n    pass\ny = {\"a\": 1}\n",
            "if x:\nif y:\n    pass\nz = 1\n",
        ] {
            let (analysis, fixture) = Analysis::from_single_file_fixture(source);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert!(!diagnostics.is_empty(), "{source}");
        }
    }
    #[test]
    fn type_ignore_only_suppresses_inference() {
        for input in ["\"x\" + 1", "fail(msg = \"x\")"] {
            let (mut analysis, fixture) = Analysis::from_single_file_fixture(input);
            let file = fixture.main_file();
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(!diagnostics.is_empty(), "{input}");
            assert!(diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().is_lint()));
            analysis.update_file(file, format!("{input} # type: ignore\n"));
            assert!(analysis.snapshot().diagnostics(file).unwrap().is_empty());
        }
        let (analysis, fixture) = Analysis::from_single_file_fixture("1 = 2 # type: ignore\n");
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        assert!(diagnostics
            .iter()
            .any(|diagnostic| diagnostic.is_invalid_syntax()));

        for (source, suppressed) in [
            ("\"x\" + ( # type: ignore\n  1\n)\n", true),
            ("\"x\" + (\n  1\n) # type: ignore\n", true),
            ("\"x\" + (\n  1 # type: ignore\n)\n", false),
        ] {
            let (analysis, fixture) = Analysis::from_single_file_fixture(source);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert_eq!(
                diagnostics.is_empty(),
                suppressed,
                "{source}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn unused_definitions_keep_starlark_visibility_policy() {
        let source = "public = 1\nvalues = [0 for item in [1]]\n_private = 1\n_ = 1\ndef public_function(parameter):\n    local = 1\n    _local = 1\n    used = 1\n    return used\ndef _private_function():\n    pass\n";
        for allow_unused_definitions in [false, true] {
            let mut analysis = Analysis::with_system(
                Arc::new(SimpleFileLoader::default()),
                InferenceOptions {
                    allow_unused_definitions,
                    ..Default::default()
                },
                ruff_db::system::InMemorySystem::default(),
            );
            let (fixture, _) = Fixture::from_single_file(&mut analysis.db, source);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            let mut names: Vec<_> = diagnostics
                .iter()
                .filter(|diagnostic| diagnostic.id().as_str() == "unused-definition")
                .map(|diagnostic| source[diagnostic.range().unwrap()].to_owned())
                .collect();
            names.sort();
            if allow_unused_definitions {
                assert!(names.is_empty(), "{diagnostics:?}");
            } else {
                assert_eq!(
                    names,
                    ["_local", "_private", "_private_function", "item", "local"]
                );
            }
            let used = source.replace("[0 for item", "[item for item").replace(
                "    return used",
                "    print(local, _local)\n    return used",
            ) + "\nprint(_private)\n_private_function()\n";
            analysis.update_file(fixture.main_file(), used);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert!(
                diagnostics
                    .iter()
                    .all(|diagnostic| diagnostic.id().as_str() != "unused-definition"),
                "{diagnostics:?}"
            );
        }
    }

    #[test]
    fn named_discards_are_limited_to_iteration_and_partial_unpacking() {
        let source = r#"_module_discard, exported = (1, 2)
_module_first, _module_second = (1, 2)
def unpack(values):
    kept, (_nested_first, _nested_second) = (1, (2, 3))
    [_list_discard, listed] = [1, 2]
    unused, _unused_sibling = (1, 2)
    _all_first, [_all_second, _] = (1, [2, 3])
    _single, = (1,)
    _stored, values[0] = (1, 2)
    return kept, listed
def iterate(rows):
    for _loop in rows:
        pass
    for _outer, (_inner, value) in [(1, (2, 3))]:
        print(value)
    for ordinary in rows:
        pass
    plain = [1 for _comp in rows]
    nested = [value for _outer, (_inner, value) in [(1, (2, 3))]]
    mapping = {value: value for _key, value in [(1, 2)]}
    _shadowed = [1 for _shadowed in rows]
    return plain, nested, mapping
"#;
        let (analysis, fixture) = Analysis::from_single_file_fixture(source);
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        assert!(
            diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() == "unused-definition"),
            "{diagnostics:?}"
        );
        let mut names: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| &source[diagnostic.range().unwrap()])
            .collect();
        names.sort();
        assert_eq!(
            names,
            [
                "_all_first",
                "_all_second",
                "_module_first",
                "_module_second",
                "_shadowed",
                "_single",
                "_stored",
                "ordinary",
                "unused",
            ]
        );
        let shadowed = diagnostics
            .iter()
            .find(|diagnostic| &source[diagnostic.range().unwrap()] == "_shadowed")
            .unwrap();
        assert_eq!(
            usize::from(shadowed.range().unwrap().start()),
            source.find("_shadowed =").unwrap()
        );
    }

    #[test]
    fn private_rule_bindings_can_be_required_exports() {
        let source = r#"def implementation(ctx): pass
factory = rule
def make() -> rule:
    return factory(implementation=implementation)
def pair() -> tuple[rule, str]:
    return make(), "unused"
def maybe(enabled: bool) -> rule | None:
    return make() if enabled else None
def opaque():
    return make()
def opaque_pair():
    return pair()
def dynamic() -> Any:
    return make()
def broad_callable() -> Callable[..., None]:
    return make()
def mixed(enabled: bool) -> rule | str:
    return make() if enabled else "unused"
_direct = factory(implementation=implementation)
_alias = _direct
_repository = repository_rule(implementation=implementation)
_helper_result = make()
_optional = maybe(True)
_unpacked, _scalar = pair()
_unknown = opaque()
_unknown_unpacked, text = opaque_pair()
_dynamic = dynamic()
_callable = broad_callable()
_mixed = mixed(True)
_container = [make()]
def local():
    _local_rule = make()
def _unused_function() -> rule:
    return make()
"#;
        let (analysis, fixture) = native_analysis(source);
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        assert!(
            diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() == "unused-definition"),
            "{diagnostics:?}"
        );
        let mut names = diagnostics
            .iter()
            .map(|diagnostic| &source[diagnostic.range().unwrap()])
            .collect::<Vec<_>>();
        names.sort();
        assert_eq!(
            names,
            ["_container", "_local_rule", "_scalar", "_unused_function"]
        );
    }

    #[test]
    fn private_rule_export_policy_follows_binding_edits() {
        let source = "def implementation(ctx): pass\nfactory = rule\n_private = factory(implementation=implementation)\n";
        let (mut analysis, fixture) = native_analysis(source);
        for (source, expected) in [
            (source.to_owned(), false),
            (
                source.replace(
                    "factory = rule",
                    "def factory(implementation): return rule(implementation=implementation)",
                ),
                false,
            ),
            (
                source.replace(
                    "factory = rule",
                    "def factory(implementation) -> int: return 1",
                ),
                true,
            ),
            (source.to_owned(), false),
            (
                source.replace(
                    "_private = factory(implementation=implementation)",
                    "_private = 1",
                ),
                true,
            ),
        ] {
            analysis.update_file(fixture.main_file(), source);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert_eq!(diagnostics.len(), usize::from(expected), "{diagnostics:?}");
            assert!(diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() == "unused-definition"));
        }
    }

    #[test]
    fn build_bindings_do_not_export_loaded_rules() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        fixture.add_file(
            &mut analysis.db,
            "defs.bzl",
            "def implementation(ctx): pass\nexisting = rule(implementation=implementation)\n",
        );
        let source = "load('defs.bzl', 'existing')\n_private = existing\n";
        let file = fixture.add_file_with_options(
            &mut analysis.db,
            "BUILD.bazel",
            source,
            starpls_common::Dialect::Bazel,
            Some(starpls_common::FileInfo::Bazel {
                api_context: starpls_bazel::APIContext::Build,
                is_external: false,
            }),
        );
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "unused-definition");
        assert_eq!(&source[diagnostic.range().unwrap()], "_private");
    }

    #[test]
    fn host_diagnostics_share_type_ignore_suppression() {
        for source in [
            "_unused = 1 # type: ignore\n",
            "load(\"missing.bzl\") # type: ignore\n",
            "load(\"missing.bzl\", \"value\") # type: ignore\n",
            "def f():\n    return\n    print(1) # type: ignore\n",
        ] {
            let mut analysis = Analysis::with_system(
                Arc::new(SimpleFileLoader::default()),
                InferenceOptions {
                    use_code_flow_analysis: true,
                    ..Default::default()
                },
                ruff_db::system::InMemorySystem::default(),
            );
            let (fixture, _) = Fixture::from_single_file(&mut analysis.db, source);
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            assert!(
                diagnostics
                    .iter()
                    .all(|diagnostic| !diagnostic.id().is_lint()),
                "{source}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn invalid_comment_types_keep_the_original_ranges() {
        let source = "value = 1 # type: missing_assignment\ndef function(\n    parameter, # type: missing_parameter\n):\n    pass\n";
        let (analysis, fixture) = Analysis::from_single_file_fixture(source);
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        let mut unresolved: Vec<_> = diagnostics
            .iter()
            .filter(|diagnostic| diagnostic.id().as_str() == "unresolved-reference")
            .map(|diagnostic| &source[diagnostic.range().unwrap()])
            .collect();
        unresolved.sort();
        assert_eq!(
            unresolved,
            ["missing_assignment", "missing_parameter"],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn flow_and_unused_definitions_use_shared_binding_facts() {
        let source = "def outer(flag):\n    value = 1\n    value = 2\n    left, (middle, right) = 1, (2, 3)\n    def helper():\n        return value\n    helper()\n    if flag:\n        maybe = 1\n    print(maybe)\n    for item in [1]:\n        break\n        print(\"break\")\n    for item in [1]:\n        continue\n        print(\"continue\")\n    return left\n";
        let (mut analysis, fixture) = Analysis::from_single_file_fixture(source);
        for use_code_flow_analysis in [false, true, false, true] {
            analysis
                .db
                .environment()
                .set_options(&mut analysis.db)
                .to(InferenceOptions {
                    use_code_flow_analysis,
                    ..Default::default()
                });
            let diagnostics = analysis
                .snapshot()
                .diagnostics(fixture.main_file())
                .unwrap();
            let mut unused: Vec<_> = diagnostics
                .iter()
                .filter(|diagnostic| diagnostic.id().as_str() == "unused-definition")
                .map(|diagnostic| &source[diagnostic.range().unwrap()])
                .collect();
            unused.sort();
            assert_eq!(
                unused,
                ["item", "item", "middle", "right", "value"],
                "{diagnostics:?}"
            );
            assert_eq!(
                diagnostics
                    .iter()
                    .filter(|diagnostic| diagnostic.id().as_str() == "possibly-unresolved-reference")
                    .count(),
                usize::from(use_code_flow_analysis),
                "{diagnostics:?}"
            );
            let unreachable: Vec<_> = diagnostics
                .iter()
                .filter(|diagnostic| diagnostic.id().as_str() == "unreachable-code")
                .map(|diagnostic| &source[diagnostic.range().unwrap()])
                .collect();
            let expected = if use_code_flow_analysis {
                vec!["print(\"break\")", "print(\"continue\")"]
            } else {
                Vec::new()
            };
            assert_eq!(unreachable, expected, "{diagnostics:?}");
        }
    }

    #[test]
    fn deprecated_arguments_follow_the_intrinsic_declaration() {
        let (analysis, fixture) = Analysis::from_single_file_fixture(
            "abort = fail\ndef first():\n    abort(msg = \"old\", attr = \"field\")\ndef second():\n    fail(\"message\", sep = \" \")\ndef user_fail(msg):\n    return msg\ndef third():\n    fail = user_fail\n    fail(msg = \"local\")\n",
        );
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        let deprecated: Vec<_> = diagnostics
            .iter()
            .filter(|diagnostic| diagnostic.id().as_str() == "deprecated-argument")
            .collect();
        assert_eq!(deprecated.len(), 2, "{diagnostics:?}");
        assert!(deprecated
            .iter()
            .all(|diagnostic| diagnostic.severity() == ruff_db::diagnostic::Severity::Info));

        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        fixture.add_prelude_file(&mut analysis.db, "def fail(msg):\n    return msg\n");
        let build = fixture.add_file_with_options(
            &mut analysis.db,
            "BUILD",
            "fail(msg = \"from prelude\")\n",
            starpls_common::Dialect::Bazel,
            Some(starpls_common::FileInfo::Bazel {
                api_context: starpls_bazel::APIContext::Build,
                is_external: false,
            }),
        );
        let diagnostics = analysis.snapshot().diagnostics(build).unwrap();
        assert!(
            diagnostics
                .iter()
                .all(|diagnostic| diagnostic.id().as_str() != "deprecated-argument"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn syntax_limit_does_not_limit_inference() {
        let input = "if True: pass\n".repeat(129) + "unknown\n";
        let (analysis, fixture) = Analysis::from_single_file_fixture(&input);
        let diagnostics = analysis
            .snapshot()
            .diagnostics(fixture.main_file())
            .unwrap();
        assert_eq!(
            diagnostics
                .iter()
                .filter(|diagnostic| diagnostic.is_invalid_syntax())
                .count(),
            128
        );
        assert_eq!(
            diagnostics
                .iter()
                .filter(|diagnostic| diagnostic.id().is_lint())
                .count(),
            1
        );
    }

    #[test]
    fn shared_protocol_preserves_fluent_types_and_rule_exports() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let implementation =
            fixture.add_file(&mut analysis.db, "builder.bzl", "def builder(kind): pass\n");
        let interface = fixture.add_file(
            &mut analysis.db,
            "builder.bzli",
            "load(':types.bzli', _Builder='Builder')\ndef builder(kind: Callable[..., None]) -> _Builder: ...\n",
        );
        let types = fixture.add_file(
            &mut analysis.db,
            ":types.bzli",
            r#"class _Set(Protocol):
    def __call__(self, name: str, value: int) -> Builder: ...

class Builder(Protocol):
    @property
    def set(self) -> _Set: ...
    @property
    def clone(self) -> Callable[[], Builder]: ...
    @property
    def build(self) -> Callable[[], tuple[Callable[..., None], rule | None]]: ...
"#,
        );
        let source = "load('builder.bzl', 'builder')\ndef macro(**kwargs): pass\nwrapped, _internal = builder(macro).set(name='count', value=1).clone().build()\ndef use():\n    wrapped(name='target')\n";
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", source);
        loader.add_files_from_fixture(&fixture);
        analysis
            .set_builtin_defs(
                starpls_bazel::decode_builtins(include_bytes!(
                    "../../starpls/src/builtin/builtin.pb"
                ))
                .unwrap(),
                Default::default(),
            )
            .unwrap();
        analysis
            .set_type_interfaces([(implementation, interface)])
            .unwrap();
        for file in [types, interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        for invalid in [
            "builder(42)",
            "builder(macro).set(42, 1)",
            "builder(macro).set('count', 'value')",
        ] {
            analysis.update_file(caller, format!("{source}{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-argument-type");
        }
        analysis.update_file(
            caller,
            format!("{source}def use_internal():\n    _internal(name='optional')\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        let [diagnostic] = diagnostics.as_slice() else {
            panic!("{diagnostics:?}");
        };
        assert_eq!(diagnostic.id().as_str(), "call-non-callable");
    }

    #[test]
    fn renderer_uses_snapshot_source() {
        let (analysis, fixture) = Analysis::from_single_file_fixture("value = 1 # type: string\n");
        let snapshot = analysis.snapshot();
        let diagnostics = snapshot.diagnostics(fixture.main_file()).unwrap();
        let rendered = snapshot
            .render_diagnostics(
                &diagnostics,
                &ruff_db::diagnostic::DisplayDiagnosticConfig::new("starpls"),
            )
            .unwrap();
        expect_test::expect![[r#"
            error[invalid-assignment]: Object of type `Literal[1]` is not assignable to `str`
             --> main.bzl:1:9
              |
            1 | value = 1 # type: string
              |         ^         ------ Declared type
              |         |
              |         Incompatible value of type `Literal[1]`

        "#]]
        .assert_eq(&rendered);
    }
}
