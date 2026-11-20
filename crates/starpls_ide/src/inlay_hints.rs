use starpls_common::File;
use starpls_syntax::TextRange;
use ty_python_semantic::SemanticModel;

use crate::Database;
use crate::InlayHint;

pub(crate) fn inlay_hints(db: &Database, file: File, range: TextRange) -> Vec<InlayHint> {
    let model = SemanticModel::new(db, db.starlark_program_file(file));
    let range = ruff_text_size::TextRange::new(
        u32::from(range.start()).into(),
        u32::from(range.end()).into(),
    );
    let settings = ty_ide::InlayHintSettings {
        variable_types: true,
        call_argument_names: true,
        return_types: true,
    };
    ty_ide::inlay_hints_for_model(&model, range, &settings)
}

#[cfg(test)]
mod tests {
    use crate::Analysis;

    #[test]
    fn inferred_return_hints_preserve_positions_and_do_not_offer_edits() {
        let source = r#"# 😀
def width(value: str):
    return len(value)

def declared() -> int:
    return 1

def commented():
    # type: () -> int
    return 1

def interfaced():
    return 1
"#;
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        let file = fixture.add_file(&mut analysis.db, "defs.bzl", source);
        fixture.add_file(
            &mut analysis.db,
            "defs.bzli",
            "def interfaced() -> int: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        let hints = analysis
            .snapshot()
            .inlay_hints(
                file,
                starpls_syntax::TextRange::new(0.into(), (source.len() as u32).into()),
            )
            .unwrap();
        let return_hints: Vec<_> = hints
            .iter()
            .filter(|hint| hint.display().to_string().starts_with(" -> "))
            .collect();
        let expected_position = source.find("):").unwrap() + 1;
        std::assert_matches!(
            return_hints.as_slice(),
            [hint] if hint.display().to_string() == " -> int"
                && usize::from(hint.position) == expected_position,
            "expected an int return hint at byte {expected_position}",
        );
        assert!(
            hints.iter().all(|hint| hint.text_edits.is_empty()),
            "{hints:?}"
        );
    }

    #[test]
    fn loaded_calls_supply_hints_and_navigation_without_edits() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        let definition = fixture.add_file(
            &mut analysis.db,
            "defs.bzl",
            "def measure(value: str) -> int: return len(value)\n",
        );
        let file = fixture.add_file(&mut analysis.db, "main.bzl", "");
        loader.add_files_from_fixture(&fixture);
        for prefix in ["", "# moved\n", ""] {
            let source =
                format!("{prefix}load(\"defs.bzl\", call=\"measure\")\ncount = call(\"😀\")\n");
            analysis.update_file(file, source.clone());
            let hints = analysis
                .snapshot()
                .inlay_hints(
                    file,
                    starpls_syntax::TextRange::new(0.into(), (source.len() as u32).into()),
                )
                .unwrap();
            let labels: Vec<_> = hints
                .iter()
                .map(|hint| hint.display().to_string())
                .collect();
            assert!(labels.iter().any(|label| label == ": int"), "{labels:?}");
            assert!(labels.iter().any(|label| label == "value="), "{labels:?}");
            assert!(hints.iter().all(|hint| hint.text_edits.is_empty()));
            let parameter = hints
                .iter()
                .find(|hint| hint.display().to_string() == "value=")
                .unwrap();
            assert_eq!(
                usize::from(parameter.position),
                source.rfind("\"😀\"").unwrap()
            );
            let target = parameter.label.parts()[0].target().unwrap();
            assert_eq!(target.file(), definition.source);
            assert_eq!(target.focus_range(), (12.into()..17.into()).into());
            let range = starpls_syntax::TextRange::new(
                u32::from(parameter.position).into(),
                (source.len() as u32).into(),
            );
            let narrow = analysis.snapshot().inlay_hints(file, range).unwrap();
            let labels: Vec<_> = narrow
                .iter()
                .map(|hint| hint.display().to_string())
                .collect();
            assert_eq!(labels, ["value="]);
        }
    }
}
