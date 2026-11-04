//! Check a macro that inspects previously instantiated rules in the calling BUILD package.
//!
//! The ordinary .bzl program has no package. Each observed call gets its own ty semantic
//! namespace: it shares the parsed source and load graph, while its inferred types may
//! depend on the declarations preceding that particular call.

use std::path::Path;

use ruff_db::diagnostic::Annotation;
use ruff_db::diagnostic::Diagnostic;
use ruff_db::diagnostic::Span;
use ruff_python_ast::name::Name;
use ruff_text_size::Ranged;
use ruff_text_size::TextSize;
use rustc_hash::FxHashMap;
use starpls_common::File;
use ty_python_core::definition::DefinitionKind;
use ty_python_core::program::Program;
use ty_python_core::ProgramFile;
use ty_python_semantic::types::check_types;
use ty_python_semantic::types::CheckedCall;
use ty_python_semantic::types::Type;
use ty_python_semantic::types::UnionType;
use ty_python_semantic::ProgramEnvironment;

use super::factory;
use super::reflection_origins;
use super::source_context;
use crate::Database;

pub(super) fn source_namespace(name: &Name) -> &str {
    name.as_str()
        .split_once('\n')
        .map_or(name.as_str(), |(source, _)| source)
}

/// Keep the BUILD path last: it can contain any character, including a newline.
/// The offset identifies the macro invocation in that BUILD file.
fn at_call<'db>(
    db: &'db Database,
    source: ProgramFile<'db>,
    build: ProgramFile<'db>,
    start: TextSize,
) -> Option<ProgramFile<'db>> {
    let program = source.program(db);
    let source_ns = program.semantic_namespace(db).as_ref()?;
    let build_ns = build.program(db).semantic_namespace(db).as_ref()?;
    let path = build.file(db).path(db).as_system_path()?;
    let namespace = Name::new(format!(
        "{source_ns}\n{build_ns}\n{}\n{path}",
        u32::from(start)
    ));
    let package_program = Program::with_semantic_namespace(
        db,
        program.python_platform(db),
        program.resolver_environment(db),
        &namespace,
    );
    Some(ProgramFile::from_python_file_with_kind(
        db,
        source.python_file(db),
        package_program,
        source.kind(db),
    ))
}

pub(super) fn rows_for_call<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
) -> Option<Type<'db>> {
    let namespace = call.file().program(db).semantic_namespace(db).as_ref()?;
    let (_, package) = namespace.as_str().split_once('\n')?;
    let (build_ns, site) = package.split_once('\n')?;
    let (offset, path) = site.split_once('\n')?;
    let offset = TextSize::new(offset.parse().ok()?);
    let (dialect, info) = source_context(build_ns)?;
    let build = File::from_path(db, Path::new(path), dialect, info).ok()?;
    let consumer = reflection_origins::direct_consumers(db, db.starlark_program_file(build))
        .iter()
        .find(|consumer| consumer.call.start() == offset)?;
    if !reflection_origins::read_ranges(db, consumer.function)
        .iter()
        .any(|range| range.start() == call.call().start())
    {
        return None;
    }
    let declarations = call.declaration()?.program_file(db);
    // Other calls can create additional rules of the same kind. Their presence
    // neither invalidates a witnessed producer nor establishes another schema.
    let mut rows = vec![factory::ambient_rule_type(db, declarations)?];
    rows.extend(consumer.origins.iter().filter_map(|origin| {
        factory::reflected_rule_type(
            db,
            declarations,
            &origin.name,
            origin.rule,
            &origin.plain_arguments,
        )
    }));
    Some(UnionType::from_elements(
        db,
        &ProgramEnvironment::from_file(call.file()),
        rows,
    ))
}

pub(super) fn diagnostics(db: &Database, build: ProgramFile<'_>) -> Vec<Diagnostic> {
    let mut diagnostics = Vec::new();
    let mut checked = FxHashMap::default();
    for consumer in reflection_origins::direct_consumers(db, build) {
        if consumer.origins.is_empty() {
            continue;
        }
        let definition = consumer.function;
        let DefinitionKind::Function(function) = definition.kind(db) else {
            continue;
        };
        let source = definition.program_file(db);
        let parsed = ruff_db::parsed::parsed_module(db, source.python_file(db)).load(db);
        let function = function.node(&parsed);
        // Two invocations with the same producer declarations supply the same
        // types to this body, even when they occur at different BUILD lines.
        let failures = checked
            .entry((definition, &consumer.origins))
            .or_insert_with(|| {
                let Some(specialized) = at_call(db, source, build, consumer.call.start()) else {
                    return Vec::new();
                };
                let ranges = reflection_origins::read_ranges(db, definition);
                let ordinary = check_types(db, source);
                check_types(db, specialized)
                    .into_iter()
                    .filter(|failure| {
                        let Some(span) = failure.primary_span() else {
                            return false;
                        };
                        span.expect_ty_file() == source.file(db)
                            && span.range().is_some_and(|site| {
                                ranges.iter().any(|range| range.contains_range(site))
                            })
                            && failure.id().as_str() != "unused-ignore-comment"
                            && !ordinary.iter().any(|previous| {
                                previous.id() == failure.id()
                                    && previous.range() == failure.range()
                                    && previous.headline_message() == failure.headline_message()
                            })
                    })
                    .collect()
            });
        for failure in failures.iter() {
            let span = failure.expect_primary_span();
            // The BUILD caller supplies the rule declarations. Report there as well as
            // at the expression in the macro; another package may call it successfully.
            let mut diagnostic =
                Diagnostic::new(failure.id(), failure.severity(), failure.headline_message());
            diagnostic.annotate(
                Annotation::primary(Span::from(build.file(db)).with_range(consumer.call)).message(
                    format!("while checking `{}` in this package", function.name.id),
                ),
            );
            diagnostic.annotate(
                Annotation::secondary(span).message(
                    failure
                        .primary_annotation()
                        .and_then(Annotation::get_message)
                        .unwrap_or("this expression uses a reflected rule attribute"),
                ),
            );
            for annotation in failure.secondary_annotations() {
                diagnostic.annotate(annotation.clone());
            }
            diagnostics.push(diagnostic);
        }
    }
    diagnostics
}

#[cfg(test)]
mod tests {
    use starpls_bazel::APIContext;
    use starpls_common::Dialect;
    use starpls_common::FileInfo;
    use starpls_hir::Fixture;

    use super::*;
    use crate::Analysis;

    #[test]
    fn check_the_same_macro_against_each_calling_package() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        starpls_bazel::env::apply_versioned_signatures(&mut builtins, "release 8.8.1");
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let db = &mut analysis.db;
        for (path, kind) in [("good.bzl", "output"), ("bad.bzl", "int")] {
            fixture.add_file(db, path, &format!(
                "def _impl(ctx):\n    pass\nrenderer = rule(implementation = _impl, attrs = {{'out': attr.{kind}(mandatory = True)}})\n"
            ));
        }
        let helper = fixture.add_file(
            db,
            "reader.bzl",
            r#"def inspect():
    for rule in native.existing_rules().values():
        if rule["kind"] == "renderer":
            rule["out"].startswith(":")

def inspect_if(enabled):
    for rule in native.existing_rules().values():
        if enabled and rule["kind"] == "renderer":
            rule["out"].startswith(":")

def inspect_first():
    for rule in native.existing_rules().values():
        rule["out"].startswith(":")
        break

def inspect_until(enabled):
    for rule in native.existing_rules().values():
        rule["out"].startswith(":")
        if enabled:
            return

def inspect_manual():
    for rule in native.existing_rules().values():
        if rule["name"] == "manual":
            rule["out"].startswith(":")
    for name, rule in native.existing_rules().items():
        if name == "manual":
            rule["out"].startswith(":")
    native.existing_rules()["manual"]["out"].startswith(":")
"#,
        );
        let prefix = "load('reader.bzl', 'inspect', 'inspect_first', 'inspect_if', 'inspect_manual', 'inspect_until')\nload('good.bzl', good = 'renderer')\nload('bad.bzl', bad = 'renderer')\ngood(name = 'manual', out = 'manual.txt')\n";
        let build = |fixture: &mut Fixture, db: &mut Database, path, body: &str| {
            fixture.add_file_with_options(
                db,
                path,
                &format!("{prefix}{body}"),
                Dialect::Bazel,
                Some(FileInfo::Bazel {
                    api_context: APIContext::Build,
                    is_external: false,
                    bundled_cc_common: false,
                }),
            )
        };
        let good = build(
            &mut fixture,
            db,
            "docs/BUILD",
            "inspect()\nbad(name = 'late', out = 42)\n",
        );
        let mixed = build(
            &mut fixture,
            db,
            "other/BUILD",
            "bad(name = 'early', out = 42)\ninspect()\ninspect_manual()\ninspect_if(False)\ninspect_first()\ninspect_until(True)\n",
        );
        loader.add_files_from_fixture(&fixture);

        let ordinary = super::super::diagnostics::check(db, helper);
        assert!(
            !ordinary
                .iter()
                .any(|d| d.headline_message().contains("startswith")),
            "{ordinary:?}"
        );
        assert!(diagnostics(db, db.starlark_program_file(good)).is_empty());
        let failures = diagnostics(db, db.starlark_program_file(mixed));
        let [failure] = &failures[..] else {
            panic!("{failures:?}")
        };
        assert!(
            failure.headline_message().contains("startswith"),
            "{failure:?}"
        );
        let source = ruff_db::source::source_text(db, helper.source);
        assert!(failure.secondary_annotations().any(|label| {
            let span = label.get_span();
            span.expect_ty_file() == helper.source
                && span
                    .range()
                    .is_some_and(|range| source.as_str()[range].contains("startswith"))
        }));
        assert_eq!(failure.expect_primary_span().expect_ty_file(), mixed.source);
        let call = failure.expect_primary_span().range().unwrap();
        let mixed_source = ruff_db::source::source_text(db, mixed.source);
        assert_eq!(&mixed_source.as_str()[call], "inspect");
        analysis.update_file(mixed, format!("{prefix}inspect()\n"));
        let db = &analysis.db;
        assert!(diagnostics(db, db.starlark_program_file(mixed)).is_empty());
    }
}
