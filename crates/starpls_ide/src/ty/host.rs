//! Workspace-owned extensions to Bazel's builtin types.

use std::collections::BTreeSet;

use ruff_db::files::FilePath;
use salsa::Setter;
use starpls_common::Dialect;
use starpls_common::File;
use starpls_hir::BuiltinExtension;
use starpls_hir::Db as _;
use ty_python_core::ProgramFile;
use ty_python_semantic::provided::ProvidedBindingValue;
use ty_python_semantic::types::KnownClass;
use ty_python_semantic::types::Type;
use ty_python_semantic::types::TypeDefinition;
use ty_python_semantic::types::TypedDictOpenness;
use ty_python_semantic::types::TypedDictType;
use ty_python_semantic::ObjectMembers;
use ty_python_semantic::ProgramEnvironment;
use ty_python_semantic::SemanticModel;

use crate::Analysis;
use crate::Database;

pub(super) const BINDING_PREFIX: &str = "_sty_bazel_extension_";
const REGISTRATION: &str = "builtins";

impl Analysis {
    pub fn bazel_builtin_extension_file(&self) -> Option<File> {
        self.db
            .get_builtin_defs(&Dialect::Bazel)
            .extension(&self.db)
            .map(|extension| extension.file)
    }

    /// Add workspace-declared members to Bazel's builtin classes.
    pub fn set_bazel_builtin_extension(&mut self, extension: Option<File>) -> anyhow::Result<()> {
        let Self { db } = self;
        let definitions = db.get_builtin_defs(&Dialect::Bazel);
        if definitions.extension(db).is_some() {
            // Validate replacements against the unextended catalog. Invalid
            // configuration must not leave the previous declarations trusted.
            let source = super::native::generate(
                Dialect::Bazel,
                definitions.builtins(db),
                definitions.rules(db),
            )?;
            db.install_native_source(source);
            definitions.set_extension(db).to(None);
        }
        let Some(file) = extension else {
            return Ok(());
        };
        let names = extension_classes(db, file)?;
        let source = super::native::generate_with_extensions(
            Dialect::Bazel,
            definitions.builtins(db),
            definitions.rules(db),
            &names,
        )?;
        db.install_native_source(source);
        let contents = file.contents(db);
        definitions.set_extension(db).to(Some(BuiltinExtension {
            file,
            contents,
            classes: names.into(),
        }));
        Ok(())
    }

    /// Revoke host declarations when the edited file no longer matches the validated source.
    pub fn invalidate_bazel_builtin_extension(&mut self) -> anyhow::Result<bool> {
        let Some(extension) = self
            .db
            .get_builtin_defs(&Dialect::Bazel)
            .extension(&self.db)
        else {
            return Ok(false);
        };
        if extension.contents == extension.file.contents(&self.db) {
            return Ok(false);
        }
        self.set_bazel_builtin_extension(None)?;
        Ok(true)
    }
}

pub(super) fn binding<'db>(
    db: &'db Database,
    file: ProgramFile<'db>,
    name: &str,
) -> Option<ProvidedBindingValue<'db>> {
    let name = name.strip_prefix(BINDING_PREFIX)?;
    let FilePath::SystemVirtual(path) = file.file(db).path(db) else {
        return None;
    };
    if path.as_str() != super::native::path(Dialect::Bazel).as_str() {
        return None;
    }
    let extension = db.get_builtin_defs(&Dialect::Bazel).extension(db)?;
    if extension.file.contents(db) != extension.contents {
        // An unresolved superclass would make all members unknown. Falling
        // back to object preserves ordinary missing-member diagnostics.
        return Some(ProvidedBindingValue::Value(
            KnownClass::Object.to_class_literal(db, &ProgramEnvironment::from_file(file)),
        ));
    }
    let entry = registrations(db, extension.file)?.items(db).get(name)?;
    let class = protocol_class(
        db,
        db.starlark_program_file(extension.file),
        entry.declared_type(),
    )?;
    Some(ProvidedBindingValue::Value(class))
}

fn registrations<'db>(db: &'db Database, file: File) -> Option<TypedDictType<'db>> {
    let program = db.starlark_program_file(file);
    let definitions = super::interface::export_definitions(db, program, REGISTRATION);
    let [definition] = definitions.as_slice() else {
        return None;
    };
    let Type::TypedDict(table) = SemanticModel::new(db, program).definition_type(*definition)
    else {
        return None;
    };
    Some(table)
}

fn protocol_class<'db>(
    db: &'db Database,
    program: ProgramFile<'db>,
    ty: Type<'db>,
) -> Option<Type<'db>> {
    if !matches!(ty, Type::ProtocolInstance(_)) {
        return None;
    }
    let environment = ProgramEnvironment::from_file(program);
    let TypeDefinition::StaticClass(definition) = ty.definition(db, &environment)? else {
        return None;
    };
    let class = SemanticModel::new(db, definition.program_file(db))
        .definition_type(definition)
        .as_class_literal()?;
    Some(match ty.class_specialization(db, &environment) {
        Some((_, specialization)) => Type::from(class.apply_specialization(db, |_| specialization)),
        None => Type::from(class),
    })
}

fn extension_classes(db: &Database, file: File) -> anyhow::Result<BTreeSet<String>> {
    anyhow::ensure!(
        file.is_type_interface(db),
        "Bazel builtins must be declared in a .bzli file: {}",
        file.path(db).display()
    );
    anyhow::ensure!(
        super::load::statement_locations(db, file).is_empty(),
        "Bazel builtins {} must be self-contained",
        file.path(db).display()
    );
    if let Some(diagnostic) = starpls_common::syntax_diagnostics(db, file).first() {
        anyhow::bail!(
            "invalid Bazel builtins {}: {}",
            file.path(db).display(),
            diagnostic.concise_message()
        );
    }
    let program = db.starlark_program_file(file);
    let model = SemanticModel::new(db, program);
    let table = registrations(db, file).ok_or_else(|| {
        anyhow::anyhow!(
            "Bazel builtins {} must declare `{REGISTRATION}` as a field map",
            file.path(db).display()
        )
    })?;
    anyhow::ensure!(
        matches!(table.openness(db), TypedDictOpenness::Closed),
        "Bazel builtin registrations must form a closed field map"
    );
    let items = table.items(db);
    anyhow::ensure!(
        !items.is_empty(),
        "Bazel builtins {} declares no builtin types",
        file.path(db).display()
    );
    for (name, field) in items.iter() {
        let name = name.as_str();
        let Some(builtin) = db
            .annotation_builtin(file, name)
            .and_then(|value| value.to_instance_approximation(db, &model.program_environment()))
        else {
            anyhow::bail!(
                "unknown Bazel builtin type `{name}` in {}",
                file.path(db).display()
            );
        };
        anyhow::ensure!(
            field.is_required(),
            "Bazel builtin registration `{name}` must be required"
        );
        let instance = field.declared_type();
        anyhow::ensure!(
            protocol_class(db, program, instance).is_some(),
            "Bazel builtin extension `{name}` must name a protocol class"
        );
        let builtin_members: BTreeSet<_> = model
            .member_completions(builtin, ObjectMembers::Exclude)
            .into_iter()
            .map(|member| member.name)
            .collect();
        for member in model.member_completions(instance, ObjectMembers::Exclude) {
            if builtin_members.contains(&member.name) {
                anyhow::bail!(
                    "Bazel builtin extension `{name}` redeclares `{}`",
                    member.name
                );
            }
        }
    }
    Ok(items.keys().map(ToString::to_string).collect())
}

#[cfg(test)]
mod tests {
    use starpls_hir::Fixture;

    use crate::Analysis;

    #[test]
    fn host_builtin_contract_preserves_methods() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "main.bzl",
            r#"def only_module(ctx: module_ctx) -> None: pass
def use(repo: repository_ctx, module: module_ctx) -> None:
    repo.copy(repo.path("in"), "out", watch_src="auto")
    module.copy("in", module.path("out"))
    only_module(repo.next())
    repo.copy(1, "out")
    repo.copy(src="in", dst="out")
    module.copy("in", "out", "yes")
    only_module(repo)
"#,
        );
        let extension = fixture.add_file(
            &mut analysis.db,
            "host.bzli",
            r#"class _ExternalContext(Protocol):
    def copy(self, src: str | Label | path, dst: str | Label | path, /, *, watch_src: Literal["yes", "no", "auto"] = ...) -> None: ...

class _RepositoryContext(_ExternalContext, Protocol):
    def next(self) -> module_ctx: ...

builtins: dict[{"repository_ctx": _RepositoryContext, "module_ctx": _ExternalContext}]
"#,
        );
        loader.add_files_from_fixture(&fixture);
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        let original = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(original.len(), 7, "{original:#?}");
        assert_eq!(
            original
                .iter()
                .filter(|diagnostic| diagnostic.id().as_str() == "unresolved-attribute")
                .count(),
            6,
            "{original:#?}"
        );

        analysis
            .set_bazel_builtin_extension(Some(extension))
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 5, "{diagnostics:#?}");
        assert_eq!(
            diagnostics
                .iter()
                .filter(
                    |diagnostic| diagnostic.id().as_str() == "positional-only-parameter-as-kwarg"
                )
                .count(),
            2,
            "{diagnostics:#?}"
        );
        assert_eq!(
            diagnostics
                .iter()
                .filter(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type")
                .count(),
            2,
            "{diagnostics:#?}"
        );
        assert!(diagnostics
            .iter()
            .any(|diagnostic| diagnostic.id().as_str() == "too-many-positional-arguments"));

        analysis.update_file(
            extension,
            "class _Context(Protocol):\n    def copy(self, src: int, dst: int) -> None: ...\nbuiltins: dict[{\"repository_ctx\": _Context}]\n".into(),
        );
        let changed = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            changed
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "unresolved-attribute"),
            "{changed:#?}"
        );
        analysis.set_bazel_builtin_extension(None).unwrap();
        let reset = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(reset.len(), original.len(), "{reset:#?}");
    }

    #[test]
    fn attr_license_defers_to_a_workspace_extension() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(&mut analysis.db, "main.bzl", "def expect(value: Literal[False]): pass\ndef check():\n    expect(hasattr(attr, 'license'))\n    attr.license('yes')\n    attr.license(1)\n");
        let extension = fixture.add_file(&mut analysis.db, "host.bzli", "class _Attr(Protocol):\n    def license(self, value: str) -> int: ...\nbuiltins: dict[{\"attr\": _Attr}]\n");
        loader.add_files_from_fixture(&fixture);
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        analysis
            .set_builtin_defs_with_info(
                builtins,
                Default::default(),
                &starpls_bazel::client::BazelInfo {
                    release: "release 9.3.0".into(),
                    starlark_semantics: "StarlarkSemantics{}".into(),
                    ..Default::default()
                },
            )
            .unwrap();
        analysis
            .set_bazel_builtin_extension(Some(extension))
            .unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert_eq!(diagnostics.len(), 2, "{diagnostics:#?}");
        assert!(
            diagnostics
                .iter()
                .all(|d| d.id().as_str() == "invalid-argument-type"),
            "{diagnostics:#?}"
        );
    }

    #[test]
    fn host_builtin_contract_rejects_invalid_declarations() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let cases = [
            (
                "syntax.bzli",
                "class repository_ctx(Protocol):\n    def copy(self,",
                "invalid Bazel builtins",
            ),
            (
                "unknown.bzli",
                "class _Context(Protocol): ...\nbuiltins: dict[{\"repository_contex\": _Context}]\n",
                "unknown Bazel builtin type",
            ),
            (
                "class.bzli",
                "builtins: dict[{\"repository_ctx\": str}]\n",
                "must name a protocol class",
            ),
            (
                "collision.bzli",
                "class _Shared(Protocol):\n    def path(self, src: str) -> str: ...\nclass _Context(_Shared, Protocol): ...\nbuiltins: dict[{\"repository_ctx\": _Context}]\n",
                "redeclares `path`",
            ),
            (
                "generated.bzli",
                "class _Target(Protocol):\n    def __getitem__(self, key: str) -> str: ...\nbuiltins: dict[{\"Target\": _Target}]\n",
                "redeclares `__getitem__`",
            ),
            (
                "imported.bzli",
                "load(':shared.bzli', '_Context')\nbuiltins: dict[{\"repository_ctx\": _Context}]\n",
                "must be self-contained",
            ),
        ];
        let files: Vec<_> = cases
            .into_iter()
            .map(|(path, source, expected)| {
                (fixture.add_file(&mut analysis.db, path, source), expected)
            })
            .collect();
        loader.add_files_from_fixture(&fixture);
        let builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        for (file, expected) in files {
            let error = analysis
                .set_bazel_builtin_extension(Some(file))
                .unwrap_err();
            assert!(error.to_string().contains(expected), "{error:#}");
        }
    }
}
