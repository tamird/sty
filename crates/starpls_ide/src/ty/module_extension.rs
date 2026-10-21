//! Source-owned Bazel module extension tag schemas.

use ruff_db::files::FileRange;
use ruff_python_ast::name::Name;
use starpls_common::Db as _;
use starpls_hir::Db as _;
use ty_python_core::ProgramFile;
use ty_python_semantic::provided::ProvidedBindingValue;
use ty_python_semantic::provided::ProvidedClass;
use ty_python_semantic::provided::ProvidedData;
use ty_python_semantic::provided::ProvidedField;
use ty_python_semantic::provided::ProvidedInstanceFields;
use ty_python_semantic::types::CheckedArgument;
use ty_python_semantic::types::CheckedCall;
use ty_python_semantic::types::DictionaryItem;
use ty_python_semantic::types::Parameter;
use ty_python_semantic::types::Parameters;
use ty_python_semantic::types::Signature;
use ty_python_semantic::types::Type;
use ty_python_semantic::ProgramEnvironment;

use super::factory;
use super::factory::Attribute;
use super::factory::RuleAttributeData;
use super::load;
use super::native::MODULE_EXTENSION_PROXY_TYPE;
use super::native::MODULE_EXTENSION_TYPE;
use crate::Database;

#[derive(Clone, Debug, Eq, PartialEq, Hash, get_size2::GetSize)]
struct TagClassData {
    attributes: Box<[RuleAttributeData]>,
    names_complete: bool,
}

#[derive(Debug, Eq, PartialEq, Hash, get_size2::GetSize)]
struct ExtensionData {
    tags: Box<[Tag]>,
}

#[derive(Debug, Eq, PartialEq, Hash, get_size2::GetSize)]
struct Tag {
    name: Name,
    schema: TagClassData,
    source: FileRange,
}

pub(super) fn tag_class<'db>(db: &'db Database, call: &CheckedCall<'_, 'db>) -> Option<Type<'db>> {
    if call.has_binding_errors() {
        return None;
    }
    let (attributes, names_complete) = if matches!(call.argument("attrs"), CheckedArgument::Omitted)
    {
        (Box::default(), true)
    } else {
        let dictionary = call.dictionary_argument(db, "attrs")?;
        let names_complete =
            dictionary.is_complete() && dictionary.items.iter().all(DictionaryItem::is_required);
        let environment = ProgramEnvironment::from_file(call.file());
        let attributes = dictionary
            .items
            .into_vec()
            .into_iter()
            .filter(DictionaryItem::is_required)
            .map(|item| RuleAttributeData {
                name: item.name,
                descriptor: item
                    .ty
                    .provided_data(db, &environment)
                    .and_then(|data| data.downcast_ref::<Attribute>())
                    .cloned(),
                source: Some(FileRange::new(call.file().file(db), item.source)),
            })
            .collect();
        (attributes, names_complete)
    };
    factory::descriptor(
        db,
        call,
        "tag_class",
        ProvidedData::new(TagClassData {
            attributes,
            names_complete,
        }),
    )
}

pub(super) fn extension<'db>(db: &'db Database, call: &CheckedCall<'_, 'db>) -> Option<Type<'db>> {
    if call.has_binding_errors() {
        return None;
    }
    let dictionary = call.dictionary_argument(db, "tag_classes")?;
    let environment = ProgramEnvironment::from_file(call.file());
    let tags = dictionary
        .items
        .into_vec()
        .into_iter()
        .filter(DictionaryItem::is_required)
        .filter_map(|item| {
            Some(Tag {
                name: item.name,
                schema: item
                    .ty
                    .provided_data(db, &environment)?
                    .downcast_ref::<TagClassData>()?
                    .clone(),
                source: FileRange::new(call.file().file(db), item.source),
            })
        })
        .collect();
    factory::descriptor(
        db,
        call,
        MODULE_EXTENSION_TYPE,
        ProvidedData::new(ExtensionData { tags }),
    )
}

pub(super) fn proxy<'db>(db: &'db Database, call: &CheckedCall<'_, 'db>) -> Option<Type<'db>> {
    if call.has_binding_errors() {
        return None;
    }
    let environment = ProgramEnvironment::from_file(call.file());
    let declarations = call.declaration()?.program_file(db);
    let base = factory::native_class(db, declarations, MODULE_EXTENSION_PROXY_TYPE)?;
    if call.return_type() != base.to_instance_approximation(db, &environment)? {
        return None;
    }
    let fields = proxy_fields(db, call, declarations, &environment).unwrap_or_default();
    call.class_type(
        db,
        ProvidedClass {
            name: Name::new(MODULE_EXTENSION_PROXY_TYPE),
            bases: Box::from([base]),
            class_members: Box::default(),
            instance_fields: ProvidedInstanceFields {
                fields,
                // Bazel returns a callable for every field lookup; undeclared
                // tags are rejected only when an active extension evaluates.
                has_dynamic_fields: true,
                ..Default::default()
            }
            .into(),
        },
    )
    .to_instance_approximation(db, &environment)
}

fn proxy_fields<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
    declarations: ProgramFile<'db>,
    environment: &ProgramEnvironment<'db>,
) -> Option<Box<[ProvidedField<'db>]>> {
    match call.argument("dev_dependency") {
        CheckedArgument::Omitted => {}
        CheckedArgument::Value { ty, .. } if ty == Type::bool_literal(false) => {}
        // A development dependency can be ignored by Bazel. Its tags are then
        // never validated, even when their schema is available.
        _ => return None,
    }
    let source = db.starlark_file(call.file())?;
    let version = db
        .get_builtin_defs(&source.dialect)
        .bazel_version(db)
        .as_ref()?;
    load::module_extension_label(call.call())?;
    let CheckedArgument::Value { ty: label, .. } = call.argument_at(0) else {
        return None;
    };
    let CheckedArgument::Value { ty: name, .. } = call.argument_at(1) else {
        return None;
    };
    let label = label.string_literal_value(db)?;
    let name = name.string_literal_value(db)?;
    let loaded = db.load_file(label, source.dialect, source).ok()??;
    if loaded.source == source.source {
        return None;
    }
    let file = db.starlark_program_file(loaded);
    // `use_extension` selects a physical module global. A bare load binding
    // is file-local, and a selected interface may replace the public contract.
    if load::is_loaded_alias(db, file, name) || db.load_export_file(source, loaded, name) != file {
        return None;
    }
    let value = ProvidedBindingValue::Export {
        file,
        name: Name::new(name),
        value: None,
    }
    .resolve_type(db)?;
    let data = value.provided_data(db, environment)?;
    let data = data.downcast_ref::<ExtensionData>()?;
    let none_is_omission = version.at_least(9, 0);
    Some(
        data.tags
            .iter()
            .map(|tag| ProvidedField {
                name: tag.name.clone(),
                ty: tag
                    .schema
                    .callable(db, environment, declarations, none_is_omission),
                source: Some(tag.source),
            })
            .collect(),
    )
}

impl TagClassData {
    fn callable<'db>(
        &self,
        db: &'db Database,
        environment: &ProgramEnvironment<'db>,
        declarations: ProgramFile<'db>,
        none_is_omission: bool,
    ) -> Type<'db> {
        let mut shape_complete = self.names_complete;
        let mut parameters = Vec::with_capacity(self.attributes.len() + 1);
        for attribute in &self.attributes {
            let mut parameter = Parameter::keyword_only(attribute.name.clone());
            if let Some(source) = attribute.source {
                parameter = parameter.with_source_range(source);
            }
            let (parameter, known_requiredness) = attribute
                .descriptor
                .as_ref()
                .and_then(|descriptor| {
                    descriptor.tag_parameter(
                        db,
                        environment,
                        declarations,
                        parameter.clone(),
                        none_is_omission,
                    )
                })
                .unwrap_or_else(|| (parameter.with_default_type(Type::unknown()), false));
            shape_complete &= known_requiredness;
            parameters.push(parameter);
        }
        if !self.names_complete {
            parameters.push(Parameter::keyword_variadic(Name::new("kwargs")));
        } else if none_is_omission {
            // Bazel 9 ignores explicit None values before validating tag keys.
            parameters.push(
                Parameter::keyword_variadic(Name::new("kwargs"))
                    .with_annotated_type(Type::none(db, environment)),
            );
        }
        let parameters = Parameters::standard(parameters);
        let parameters = if shape_complete {
            parameters
        } else {
            parameters.with_incomplete_shape()
        };
        Type::single_callable(db, Signature::new(parameters, Type::none(db, environment)))
    }
}

#[cfg(test)]
mod tests {
    use starpls_bazel::APIContext;
    use starpls_common::Dialect;
    use starpls_common::FileInfo;

    use crate::Analysis;

    #[test]
    fn module_extension_tags_follow_the_source_schema_and_bazel_release() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = starpls_hir::Fixture::new(&mut analysis.db);
        fixture.add_file(
            &mut analysis.db,
            "owner.bzl",
            r#"load("unrelated.bzl", "unrelated")
def implementation(ctx): pass
download = module_extension(implementation, tag_classes={"download": tag_class(attrs={
    "target": attr.label(mandatory=True),
    "enabled": attr.bool(),
    "_secret": attr.string(),
})})
"#,
        );
        fixture.add_file(
            &mut analysis.db,
            "reexport.bzl",
            "load('owner.bzl', _download='download')\ndownload = _download\n",
        );
        let module = fixture.add_file_with_options(
            &mut analysis.db,
            "MODULE.bazel",
            "",
            Dialect::Bazel,
            Some(FileInfo::Bazel {
                api_context: APIContext::Module,
                is_external: false,
            }),
        );
        loader.add_files_from_fixture(&fixture);
        for release in ["release 8.4.2", "release 9.0.0"] {
            analysis
                .set_builtin_defs_with_release(
                    starpls_bazel::decode_builtins(include_bytes!(
                        "../../../starpls/src/builtin/builtin.pb"
                    ))
                    .unwrap(),
                    Default::default(),
                    release,
                )
                .unwrap();
            let calls = [
                (
                    "extension.download(target='//:target', enabled=True, _secret='secret')",
                    false,
                ),
                ("extension.download(target=42)", true),
                ("extension.download()", true),
                (
                    "extension.download(target='//:target', enabled='true')",
                    true,
                ),
                (
                    "extension.download(target='//:target', unexpected=True)",
                    true,
                ),
                ("extension.download(target=None)", true),
                (
                    "extension.download(target='//:target', enabled=None)",
                    release.starts_with("release 8"),
                ),
                (
                    "extension.download(target='//:target', unexpected=None)",
                    release.starts_with("release 8"),
                ),
            ];
            let source = format!(
                "extension = use_extension('reexport.bzl', 'download', dev_dependency=False)\nuse_repo(extension, 'generated')\n{}\ndev = use_extension('reexport.bzl', 'download', dev_dependency=True)\ndev.download(target=42)\n",
                calls.iter().map(|(call, _)| *call).collect::<Vec<_>>().join("\n")
            );
            analysis.update_file(module, source.clone());
            let diagnostics = analysis.snapshot().diagnostics(module).unwrap();
            let mut actual: Vec<_> = diagnostics
                .iter()
                .map(|diagnostic| {
                    source[..usize::from(diagnostic.range().unwrap().start())]
                        .bytes()
                        .filter(|byte| *byte == b'\n')
                        .count()
                })
                .collect();
            actual.sort_unstable();
            let expected: Vec<_> = calls
                .iter()
                .enumerate()
                .filter_map(|(line, (_, error))| error.then_some(line + 2))
                .collect();
            assert_eq!(actual, expected, "{release}: {diagnostics:?}");
        }
        assert!(!loader
            .requests
            .lock()
            .unwrap()
            .contains(&"unrelated.bzl".to_owned()));
    }
}
