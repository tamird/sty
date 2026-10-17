//! Field-map annotations use Ty's structural dictionary schemas.

use std::collections::btree_map::Entry;

use ruff_python_ast::name::Name;
use ruff_python_ast::Expr;
use ruff_python_ast::ExprDict;
use ruff_python_ast::HasNodeIndex;
use ruff_python_ast::Stmt;
use ruff_text_size::Ranged;
use starpls_hir::Db as _;
use ty_python_core::definition::Definition;
use ty_python_semantic::provided::ProvidedGetattrPresence;
use ty_python_semantic::provided::ProvidedGetattrResult;
use ty_python_semantic::provided::ProvidedTypeApplication;
use ty_python_semantic::provided::TypeExpressionContext;
use ty_python_semantic::types::CheckedArgument;
use ty_python_semantic::types::CheckedCall;
use ty_python_semantic::types::IntersectionType;
use ty_python_semantic::types::KnownClass;
use ty_python_semantic::types::Type;
use ty_python_semantic::types::TypedDictFieldBuilder;
use ty_python_semantic::types::TypedDictOpenness;
use ty_python_semantic::types::TypedDictSchema;
use ty_python_semantic::types::TypedDictType;
use ty_python_semantic::types::UnionType;
use ty_python_semantic::ProgramEnvironment;
use ty_python_semantic::TypeQualifiers;

use crate::Database;

pub(super) fn mapping_argument(expression: &Expr) -> Option<(&Expr, &ExprDict, bool)> {
    match expression {
        expression @ Expr::Dict(mapping) => Some((expression, mapping, false)),
        Expr::Tuple(arguments) => match arguments.elts.as_slice() {
            [expression @ Expr::Dict(mapping), Expr::EllipsisLiteral(_)] => {
                Some((expression, mapping, true))
            }
            _ => None,
        },
        _ => None,
    }
}

/// A dynamic field name preserves a struct's uniform value bound.
pub(super) fn getattr_call_result<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
) -> Option<Type<'db>> {
    if call.has_binding_errors() {
        return None;
    }
    let CheckedArgument::Value {
        ty: names,
        expression: _,
    } = call.argument_at(1)
    else {
        return None;
    };
    let environment = ProgramEnvironment::from_file(call.file());
    let names = names.expand_top_level_aliases(db, &environment);
    let finite_names = match names {
        Type::Union(union) => union
            .elements(db)
            .iter()
            .all(|name| name.string_literal_value(db).is_some()),
        name => name.string_literal_value(db).is_some(),
    };
    // Ty owns finite lookups, including gradual recovery. A declined lookup
    // must not replace the selected field with unrelated fields' types.
    if finite_names {
        return None;
    }
    let file = db.starlark_file(call.file())?;
    let definitions = db.get_builtin_defs(&file.dialect);
    let structure = definitions
        .builtins(db)
        .r#type
        .iter()
        .find(|class| class.name == "struct")?;
    // Older hosts expose methods such as to_json outside the field-value bound.
    if !structure.field.is_empty() {
        return None;
    }
    let CheckedArgument::Value {
        ty: receiver,
        expression: _,
    } = call.argument_at(0)
    else {
        return None;
    };
    let instance = db
        .annotation_builtin(file, "struct")?
        .to_instance_approximation(db, &environment)?;
    let (class, _) = instance.class_specialization(db, &environment)?;
    let specialization = receiver.base_class_specialization(db, &environment, class)?;
    let [value, _shape] = specialization.types(db) else {
        return None;
    };
    let default = match call.argument_at(2) {
        CheckedArgument::Omitted => Type::Never,
        CheckedArgument::Value { ty, expression: _ } => ty,
        CheckedArgument::Indeterminate => return None,
    };
    Some(UnionType::from_two_elements(
        db,
        &environment,
        *value,
        default,
    ))
}

pub(super) fn getattr_result<'db>(
    db: &'db Database,
    definition: Definition<'db>,
    receiver: Type<'db>,
    attribute: &str,
) -> ProvidedGetattrResult<'db> {
    if !matches!(
        super::factory::declaration(db, definition),
        Some(super::factory::BuiltinFunction::StructGetattr)
    ) {
        return ProvidedGetattrResult::default();
    }
    let environment = ProgramEnvironment::from_file(definition.program_file(db));
    if let Some(presence) =
        super::providers::getattr_presence(db, receiver, &environment, attribute)
    {
        return presence.into();
    }
    let possibly_missing = ProvidedGetattrPresence::PossiblyMissing.into();
    let Some((class, _)) = super::factory::native_class(db, definition.program_file(db), "struct")
        .and_then(|class| class.to_instance_approximation(db, &environment))
        .and_then(|instance| instance.class_specialization(db, &environment))
    else {
        return possibly_missing;
    };
    let Some(specialization) = receiver.base_class_specialization(db, &environment, class) else {
        return possibly_missing;
    };
    let [_, Type::TypedDict(shape)] = specialization.types(db) else {
        return possibly_missing;
    };
    if let Some(field) = shape.items(db).get(attribute) {
        ProvidedGetattrResult {
            presence: if field.is_required() {
                ProvidedGetattrPresence::Present
            } else {
                ProvidedGetattrPresence::PossiblyMissing
            },
            return_type: Some(field.declared_type()),
            immutable_storage: field.is_required(),
        }
    } else if matches!(shape.openness(db), TypedDictOpenness::Closed) {
        ProvidedGetattrPresence::Absent.into()
    } else {
        possibly_missing
    }
}

pub(super) fn type_application<'db>(
    db: &'db Database,
    application: ProvidedTypeApplication<'_, 'db>,
    context: &mut dyn TypeExpressionContext<'db>,
) -> Option<Type<'db>> {
    let file = db.starlark_file(context.program_file())?;
    let ProvidedTypeApplication {
        expression,
        value_type,
        definition: _,
    } = application;
    let Type::ClassLiteral(class) = value_type else {
        return None;
    };
    let environment = ProgramEnvironment::from_file(context.program_file());
    let object = KnownClass::Object.to_instance(db, &environment);
    let is_struct = db.annotation_builtin(file, "struct") == Some(value_type);
    let is_record = db.annotation_builtin(file, "record") == Some(value_type);
    if value_type != KnownClass::Dict.to_class_literal(db, &environment) && !is_struct && !is_record
    {
        return None;
    }
    let (mapping_expression, mapping, openness) = match expression.slice.as_ref() {
        mapping_expression @ Expr::Dict(mapping) => {
            (mapping_expression, mapping, TypedDictOpenness::Closed)
        }
        Expr::Tuple(arguments) => {
            let Some(mapping_expression @ Expr::Dict(mapping)) = arguments.elts.first() else {
                if is_struct {
                    context.report_invalid_type_form(
                        expression.slice.range(),
                        "struct accepts one value type, or a field map with an optional trailing `...`",
                    );
                    return Some(Type::unknown());
                }
                return None;
            };
            if !matches!(arguments.elts.as_slice(), [_, Expr::EllipsisLiteral(_)]) {
                context.report_invalid_type_form(
                    expression.slice.range(),
                    "A field map accepts only a trailing `...` to allow extra fields",
                );
                return Some(Type::unknown());
            }
            (
                mapping_expression,
                mapping,
                TypedDictOpenness::extra(db, object, true),
            )
        }
        _ => return None,
    };
    let mut fields = TypedDictSchema::default();
    for item in &mapping.items {
        let Some(key_expression @ Expr::StringLiteral(key)) = &item.key else {
            context.report_invalid_type_form(item.range(), "Field names must be string literals");
            continue;
        };
        context.store_expression_type(key_expression, Type::string_literal(db, key.value.to_str()));
        let (ty, qualifiers) = context.infer_annotation_expression(&item.value);
        if !(qualifiers
            - (TypeQualifiers::REQUIRED | TypeQualifiers::NOT_REQUIRED | TypeQualifiers::READ_ONLY))
            .is_empty()
        {
            context.report_invalid_type_form(
                item.value.range(),
                "Field types support Required, NotRequired, and ReadOnly qualifiers",
            );
        }
        if is_record && qualifiers.contains(TypeQualifiers::NOT_REQUIRED) {
            context.report_invalid_type_form(
                item.value.range(),
                "Record fields must be present; NotRequired is supported in dictionary and struct field maps",
            );
        }
        let name = Name::new(key.value.to_str());
        let field = TypedDictFieldBuilder::new(ty)
            .required(!qualifiers.contains(TypeQualifiers::NOT_REQUIRED))
            .read_only(is_struct || is_record || qualifiers.contains(TypeQualifiers::READ_ONLY))
            .build();
        match fields.entry(name) {
            Entry::Vacant(entry) => {
                entry.insert(field);
            }
            Entry::Occupied(_) => context.report_invalid_type_form(
                key.range(),
                "A field map cannot declare the same name twice",
            ),
        }
    }
    let schema = TypedDictType::from_schema_items_with_openness(db, fields, openness);
    let shape = Type::TypedDict(schema);
    context.store_expression_type(mapping_expression, shape);
    if is_record {
        let program = context.program_file();
        let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
        let function = parsed.suite().iter().find_map(|statement| match statement {
            Stmt::FunctionDef(function)
                if function.returns.as_deref().is_some_and(|returns| {
                    returns.node_index().load() == expression.node_index().load()
                }) =>
            {
                Some(function)
            }
            _ => None,
        });
        if !file.is_type_interface(db) || function.is_none() {
            context.report_invalid_type_form(expression.range(), "A record shape must be the return annotation of a provider constructor in a .bzli file");
            return Some(Type::unknown());
        }
        let function = function?;
        if !function.decorator_list.is_empty() {
            context.report_invalid_type_form(
                function.name.range(),
                "Provider constructor declarations cannot have decorators",
            );
        }
        let instance = super::providers::instance(db, program, function)?;
        if function.type_params.is_none() {
            return Some(instance);
        }
        let members = Type::protocol_with_readonly_members(
            db,
            &environment,
            schema
                .items(db)
                .iter()
                .map(|(name, field)| (name.as_str(), field.declared_type())),
        );
        return Some(IntersectionType::from_two_elements(
            db,
            &environment,
            instance,
            members,
        ));
    }
    if !is_struct {
        return Some(shape);
    }
    let values = if matches!(openness, TypedDictOpenness::Closed) {
        UnionType::from_elements(
            db,
            &environment,
            schema.items(db).values().map(|field| field.declared_type()),
        )
    } else {
        object
    };
    let carrier = Type::from(class.apply_specialization(db, |parameters| {
        parameters.specialize(db, vec![values, shape])
    }))
    .to_instance_approximation(db, &environment)?;
    let members = Type::protocol_with_readonly_members(
        db,
        &environment,
        schema
            .items(db)
            .iter()
            .filter(|(_, field)| field.is_required())
            .map(|(name, field)| (name.as_str(), field.declared_type())),
    );
    Some(IntersectionType::from_elements(
        db,
        &environment,
        [carrier, members],
    ))
}

#[cfg(test)]
mod tests {
    use starpls_hir::Fixture;
    use ty_python_semantic::types::KnownClass;
    use ty_python_semantic::types::Type;
    use ty_python_semantic::ProgramEnvironment;

    use crate::Analysis;
    use crate::FilePosition;

    #[test]
    fn dictionary_shapes_check_calls_and_preserve_optional_keys() {
        let (mut analysis, loader) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let source = fixture.add_file(
            &mut analysis.db,
            "api.bzl",
            "def closed(value): return value\ndef open_shape(value): return value\ndef optional(value): return value\n",
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "api.bzli",
            r#"
type _Closed = dict[{"name": str}]
def closed(value: _Closed) -> _Closed: ...
def open_shape(value: dict[{"name": str}, ...]) -> str: ...
def optional(value: dict[{"name": str, "count": NotRequired[int]}]) -> None: ...
"#,
        );
        let valid = r#"
load("api.bzl", "closed", "open_shape", "optional")
result = closed({"name": "ok"})
open_shape({"name": "ok", "extra": 1})
optional({"name": "ok"})
optional({"name": "ok", "count": 2})
text = result["name"]
"#;
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", valid);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for file in [interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        let hover = analysis
            .snapshot()
            .hover(FilePosition {
                file_id: caller,
                pos: (valid.rfind("text").unwrap() as u32).into(),
            })
            .unwrap()
            .unwrap();
        assert!(
            hover.contents.value.contains("str"),
            "{}",
            hover.contents.value
        );
        for invalid in [
            "closed({})",
            "closed({'name': 1})",
            "closed({'name': 'ok', 'extra': 1})",
            "optional({'name': 'ok', 'count': None})",
            "optional({'name': 'ok', 'other': 1})",
        ] {
            analysis.update_file(caller, format!("{valid}\n{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            assert!(!diagnostics.is_empty(), "accepted {invalid}");
            assert!(
                diagnostics
                    .iter()
                    .all(|diagnostic| diagnostic.id().as_str() != "invalid-type-form"),
                "{invalid}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn dictionary_shapes_check_union_assignments() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let valid = r#"
def merge(a: dict[{"name": str}], b: dict[{"count": int}]) -> dict[{"name": str, "count": int}]:
    print(a | b)
    ab: dict[{"name": str, "count": int}] = a | b
    return ab
"#;
        let file = fixture.add_file(&mut analysis.db, "main.bzl", valid);
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        let invalid = r#"
def wrong(a: dict[{"name": str}], b: dict[{"name": int}]):
    result: dict[{"name": str}] = a | b
    return result
"#;
        analysis.update_file(file, format!("{valid}\n{invalid}"));
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn finite_struct_lookup_preserves_gradual_fields() {
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
        let features = fixture.add_file(
            &mut analysis.db,
            "features.bzl",
            r#"globals = struct(
    ProtoInfo = getattr(getattr(native, "legacy_globals", None), "ProtoInfo", None),
    macro = macro,
    set = set,
    DefaultInfo = DefaultInfo,
)
bazel_features = struct(globals = globals)
"#,
        );
        let provider = fixture.add_file(
            &mut analysis.db,
            "proto.bzl",
            r#"load("features.bzl", "bazel_features")
_ProtoInfo = provider(fields = ["sources"])
ProtoInfo = getattr(bazel_features.globals, "ProtoInfo", None) or _ProtoInfo
"#,
        );
        let source = r#"load("proto.bzl", "ProtoInfo")
load("features.bzl", "bazel_features")
def sources(target: Target):
    return target[ProtoInfo].sources
def by_name(target: Target, name: Name):
    return target[getattr(bazel_features.globals, name)].sources
def missing(value: struct[{"count": int}]) -> str:
    return getattr(value, "missing", "fallback")
def mixed(value: struct[{"count": int}], name: Literal["count", "missing"]) -> int | str:
    return getattr(value, name, "fallback")
"#;
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", source);
        let interface = fixture.add_file(
            &mut analysis.db,
            "main.bzli",
            "type Name = Literal['ProtoInfo', 'missing']\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(caller, interface)]).unwrap();
        for file in [features, provider, caller, interface] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        analysis.update_file(
            caller,
            format!("{source}\ndef invalid(target: Target):\n    return target[macro]\n"),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-argument-type"),
            "{diagnostics:?}"
        );
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        let gradual = r#"load("features.bzl", "bazel_features")
def unresolved() -> object:
    return getattr(bazel_features.globals, "ProtoInfo", None)
"#;
        analysis.update_file(caller, gradual.to_owned());
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert!(
            diagnostics.iter().any(|diagnostic| {
                diagnostic.id().as_str() == "non-static-type"
                    && diagnostic.headline_message().contains("call result")
                    && diagnostic.range().is_some_and(|range| {
                        &gradual[range] == "getattr(bazel_features.globals, \"ProtoInfo\", None)"
                    })
            }),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn dynamic_struct_lookup_preserves_the_value_bound() {
        let mut builtins = starpls_bazel::decode_builtins(include_bytes!(
            "../../../starpls/src/builtin/builtin.pb"
        ))
        .unwrap();
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        analysis
            .set_builtin_defs(builtins.clone(), Default::default())
            .unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[
                    ("non-static-type".into(), "error".into()),
                    ("unsound-return-statement".into(), "error".into()),
                ]
                .into(),
            )
            .unwrap(),
        );
        let source = r#"def homogeneous(value: struct[int], name: str) -> int:
    return getattr(value, name)
def heterogeneous(value: struct[{"count": int, "name": str}], name: str) -> int | str:
    return getattr(value, name)
def precise(value: struct[{"count": int, "name": str}]) -> int:
    return getattr(value, "count")
def defaulted(value: struct[int], name: str) -> int | None:
    return getattr(value, name, None)
def opaque(value: struct[object], name: str) -> object:
    return getattr(value, name)
"#;
        let file = fixture.add_file(&mut analysis.db, "main.bzl", source);
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        // Both struct parameters are covariant, so materialization is carried
        // by the projected value, including invariant containers nested in it.
        let db = &analysis.db;
        let environment = ProgramEnvironment::from_file(db.starlark_program_file(file));
        let Type::ClassLiteral(class) = db.annotation_builtin(file, "struct").unwrap() else {
            panic!("expected the native struct class");
        };
        let list = KnownClass::List.to_specialized_instance(db, &environment, &[Type::unknown()]);
        let receiver = Type::from(class.apply_specialization(db, |parameters| {
            parameters.specialize(db, vec![list, Type::unknown()])
        }))
        .to_instance_approximation(db, &environment)
        .unwrap();
        let (class, _) = receiver.class_specialization(db, &environment).unwrap();
        let specialization = receiver
            .top_materialization(db, &environment)
            .base_class_specialization(db, &environment, class)
            .unwrap();
        let [value, _shape] = specialization.types(db) else {
            panic!("expected struct's two type arguments");
        };
        assert_eq!(*value, list.top_materialization(db, &environment));
        assert!(!value.is_equivalent_to(db, &environment, list));
        for invalid in [
            "def wrong(value: struct[int], name: str) -> str:\n    return getattr(value, name)",
            "def omitted(value: struct[int], name: str) -> int:\n    return getattr(value, name, None)",
            "def heterogeneous(value: struct[{'count': int, 'name': str}], name: str) -> int:\n    return getattr(value, name)",
        ] {
            analysis.update_file(file, invalid.to_owned());
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            let [diagnostic] = diagnostics.as_slice() else {
                panic!("{invalid}: {diagnostics:?}");
            };
            assert_eq!(diagnostic.id().as_str(), "invalid-return-type");
        }
        for receiver in ["object", "struct[int] | str"] {
            analysis.update_file(
                file,
                format!("def unknown(value: {receiver}, name: str) -> object:\n    return getattr(value, name)\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| {
                    diagnostic.id().as_str() == "non-static-type"
                        && diagnostic.headline_message().contains("call result")
                }),
                "{receiver}: {diagnostics:?}"
            );
        }
        builtins
            .r#type
            .iter_mut()
            .find(|class| class.name == "struct")
            .unwrap()
            .field
            .push(starpls_bazel::builtin::Value {
                name: "to_json".into(),
                callable: Some(starpls_bazel::builtin::Callable {
                    return_type: "string".into(),
                    ..Default::default()
                }),
                ..Default::default()
            });
        analysis
            .set_builtin_defs(builtins, Default::default())
            .unwrap();
        analysis.update_file(file, source.to_owned());
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(
            diagnostics.iter().any(|diagnostic| {
                diagnostic.id().as_str() == "non-static-type"
                    && diagnostic.headline_message().contains("call result")
            }),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn struct_shapes_compare_fields_across_construction_sites() {
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
        let valid = r#"
def closed(value: struct[{"name": str}]) -> str:
    return value.name
def open_shape(value: struct[{"name": str}, ...]) -> str:
    return value.name
closed(struct(name="first"))
closed(struct(name="second"))
open_shape(struct(name="ok", extra=1))
fields = {"name": "spread"}
closed(struct(**fields))
def identity(value: struct[{"name": str}]) -> struct[{"name": str}]:
    return value
closed(identity(struct(name="nested")))
def legacy(value: struct[str]) -> str:
    return value.name
def forward(value: struct[{"name": str}]) -> str:
    return legacy(value)
def tagged(value: struct[{"kind": Literal["name"], "name": str}] | struct[{"kind": Literal["count"], "count": int}]) -> str:
    if value.kind == "name":
        return value.name
    return str(value.count)
tagged(struct(kind="name", name="ok"))
tagged(struct(kind="count", count=1))
def default(value: struct[{"name": str}]) -> int:
    return getattr(value, "absent", 42)
def saved_optional(
    value: struct[{"attr": struct[{"runtime_jre_version": str}]}] | struct[{"attr": struct[{"jre_version": str}]}],
    jdk_version: str,
) -> str:
    runtime_version = getattr(value.attr, "runtime_jre_version", None)
    if runtime_version != None:
        pass
    else:
        runtime_version = value.attr.jre_version
    runtime_version = runtime_version or jdk_version
    return runtime_version
"#;
        let file = fixture.add_file(&mut analysis.db, "main.bzl", valid);
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(
            file,
            valid.replace("if runtime_version != None:", "if runtime_version == None:"),
        );
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "unresolved-attribute");
        for invalid in [
            "closed(struct())",
            "closed(struct(name=1))",
            "closed(struct(name='ok', extra=1))",
            "def erased(value: struct[{'name': str}, ...]):\n    closed(value)",
            "def spread(values: dict[str, int]):\n    closed(struct(name='ok', **values))",
            "def wrong(value: struct[{'name': str}]):\n    value.name = 'changed'",
            "def absent(value: struct[{'name': str}]) -> object:\n    return value.other",
        ] {
            analysis.update_file(file, format!("{valid}\n{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(!diagnostics.is_empty(), "accepted {invalid}");
            assert!(
                diagnostics
                    .iter()
                    .all(|diagnostic| diagnostic.id().as_str() != "invalid-type-form"),
                "{invalid}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn optional_struct_fields_preserve_presence_and_types() {
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
        let source = fixture.add_file(
            &mut analysis.db,
            "compiler.bzl",
            r#"
def _is_gcc_compiler(compiler):
    return "gcc" in compiler
def flags(context):
    return ["-fprofile-correction"] if hasattr(context.attr, "compiler") and _is_gcc_compiler(context.attr.compiler) else []
def optional_value(value):
    return getattr(value, "compiler", None)
def guarded_value(value):
    if hasattr(value, "compiler"):
        return value.compiler
    return None
def truthy_value(value):
    if getattr(value, "compiler", None):
        return value.compiler
    return None
def required_value(value):
    return value.compiler
def generic(value):
    return getattr(value, "item", None)
"#,
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "compiler.bzli",
            r#"
type _CompilerAttrs = struct[{"compiler": NotRequired[str]}, ...]
def _is_gcc_compiler(compiler: str) -> bool: ...
def flags(context: ctx[object, _CompilerAttrs]) -> list[str]: ...
def optional_value(value: _CompilerAttrs) -> str | None: ...
def guarded_value(value: _CompilerAttrs) -> str | None: ...
def truthy_value(value: _CompilerAttrs) -> str | None: ...
def required_value(value: struct[{"compiler": str}, ...]) -> str: ...
def generic[T](value: struct[{"item": NotRequired[T]}, ...]) -> T | None: ...
"#,
        );
        let valid = r#"
load("compiler.bzl", "optional_value", "guarded_value", "truthy_value", "required_value", "generic")
optional_value(struct())
optional_value(struct(compiler="gcc"))
optional_value(struct(compiler="clang", extra=42))
optional_value(struct(extra=42))
guarded_value(struct())
guarded_value(struct(compiler="gcc"))
truthy_value(struct())
truthy_value(struct(compiler="gcc"))
required_value(struct(compiler="gcc"))
def closed(value: struct[{"compiler": NotRequired[str]}]) -> str | None:
    return getattr(value, "compiler", None)
closed(struct())
closed(struct(compiler="gcc"))
text: str | None = generic(struct(item="known", extra=42))
def forward(value: struct[{"item": str}, ...]) -> str | None:
    return generic(value)
def opaque(context: ctx[object, struct[object]]) -> object:
    return context.attr.unmodeled
def selected(value: struct[{"compiler": str}] | struct[{}]) -> str | None:
    return value.compiler if getattr(value, "compiler", None) else None
def present(value: struct[{"compiler": str}] | struct[{}]) -> str | None:
    return value.compiler if hasattr(value, "compiler") else None
"#;
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", valid);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())].into(),
            )
            .unwrap(),
        );
        for file in [source, interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        let aliased = format!(
            r#"{valid}
lookup = getattr
def selected_alias(value: struct[{{"compiler": str}}] | struct[{{}}]) -> str | None:
    return value.compiler if lookup(value, "compiler", None) else None
"#
        );
        analysis.update_file(caller, aliased.clone());
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        // The builtin's general callable signature is gradual. Its checked
        // finite lookup still narrows the receiver through the saved callable.
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].id().as_str(), "non-static-type");
        assert_eq!(&aliased[diagnostics[0].range().unwrap()], "lookup");
        for (invalid, expected) in [
            ("optional_value(struct(compiler=42))", "invalid-argument-type"),
            ("closed(struct(compiler=42))", "invalid-argument-type"),
            ("closed(struct(extra=42))", "invalid-argument-type"),
            ("def erased(value: struct[object]) -> None:\n    optional_value(value)", "invalid-argument-type"),
            ("def optional(value: struct[{'compiler': NotRequired[str]}, ...]) -> None:\n    required_value(value)", "invalid-argument-type"),
            ("def opaque(context: ctx[object, struct[object]]) -> str:\n    return context.attr.unmodeled", "invalid-return-type"),
            ("def unchecked(value: struct[{}]) -> None:\n    if getattr(value, 'compiler', True):\n        value.compiler", "unresolved-attribute"),
            ("def shadowed(value: struct[{}], getattr: Callable[[object, str, object], bool]) -> None:\n    if getattr(value, 'compiler', None):\n        value.compiler", "unresolved-attribute"),
        ] {
            analysis.update_file(caller, format!("{valid}\n{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            assert_eq!(diagnostics.len(), 1, "{invalid}: {diagnostics:?}");
            assert_eq!(diagnostics[0].id().as_str(), expected);
        }
        analysis.update_file(
            interface,
            "def Info(*, value: str = ...) -> record[{'value': NotRequired[str]}]: ...\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(interface).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-type-form"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn malformed_field_maps_report_annotation_errors() {
        let (mut analysis, _) = Analysis::new_for_test();
        let mut fixture = Fixture::new(&mut analysis.db);
        let file = fixture.add_file(&mut analysis.db, "types.bzli", "");
        for annotation in [
            "dict[{1: str}]",
            "dict[{'name': str, 'name': int}]",
            "dict[{'name': str}, int]",
            "dict[{'name': Final[str]}]",
        ] {
            analysis.update_file(file, format!("value: {annotation}\n"));
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == "invalid-type-form"),
                "{annotation}: {diagnostics:?}"
            );
        }
    }
}
