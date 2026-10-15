//! Field-map annotations use Ty's structural dictionary schemas.

use std::collections::btree_map::Entry;

use ruff_python_ast::name::Name;
use ruff_python_ast::Expr;
use ruff_python_ast::ExprDict;
use ruff_python_ast::HasNodeIndex;
use ruff_python_ast::Stmt;
use ruff_text_size::Ranged;
use ty_python_core::definition::Definition;
use ty_python_semantic::provided::ProvidedGetattrPresence;
use ty_python_semantic::provided::ProvidedTypeApplication;
use ty_python_semantic::provided::TypeExpressionContext;
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

pub(super) fn getattr_presence<'db>(
    db: &'db Database,
    definition: Definition<'db>,
    receiver: Type<'db>,
    attribute: &str,
) -> ProvidedGetattrPresence {
    if !matches!(
        super::factory::declaration(db, definition),
        Some(super::factory::BuiltinFunction::StructGetattr)
    ) {
        return ProvidedGetattrPresence::Present;
    }
    let environment = ProgramEnvironment::from_file(definition.program_file(db));
    if let Some(presence) =
        super::providers::getattr_presence(db, receiver, &environment, attribute)
    {
        return presence;
    }
    let Some((class, _)) = super::factory::native_class(db, definition.program_file(db), "struct")
        .and_then(|class| class.to_instance_approximation(db, &environment))
        .and_then(|instance| instance.class_specialization(db, &environment))
    else {
        return ProvidedGetattrPresence::PossiblyMissing;
    };
    let Some(specialization) = receiver.base_class_specialization(db, &environment, class) else {
        return ProvidedGetattrPresence::PossiblyMissing;
    };
    let Some(Type::TypedDict(shape)) = specialization.types(db).get(1).copied() else {
        return ProvidedGetattrPresence::PossiblyMissing;
    };
    if matches!(shape.openness(db), TypedDictOpenness::Closed)
        && !shape.items(db).contains_key(attribute)
    {
        ProvidedGetattrPresence::Absent
    } else {
        ProvidedGetattrPresence::PossiblyMissing
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
        if (is_struct || is_record) && qualifiers.contains(TypeQualifiers::NOT_REQUIRED) {
            context.report_invalid_type_form(
                item.value.range(),
                "NotRequired fields are supported in dictionaries; struct and record fields must be present",
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
        if function.type_params.is_some() || !function.decorator_list.is_empty() {
            context.report_invalid_type_form(
                function.name.range(),
                "Provider constructor declarations cannot have type parameters or decorators",
            );
        }
        return super::providers::instance(db, program, function);
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
"#;
        let file = fixture.add_file(&mut analysis.db, "main.bzl", valid);
        let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
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
