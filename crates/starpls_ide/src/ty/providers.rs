//! Provider declarations establish nominal identity before resolving their fields.

use ruff_db::files::FileRange;
use ruff_python_ast::name::Name;
use ruff_python_ast::AnyRootNodeRef;
use ruff_python_ast::Expr;
use ruff_python_ast::HasNodeIndex;
use ruff_python_ast::NodeIndex;
use ruff_python_ast::Stmt;
use ruff_python_ast::StmtFunctionDef;
use ruff_text_size::Ranged;
use ty_python_core::definition::Definition;
use ty_python_core::definition::DefinitionKind;
use ty_python_core::global_scope;
use ty_python_core::place_table;
use ty_python_core::ProgramFile;
use ty_python_semantic::provided::ProvidedClass;
use ty_python_semantic::provided::ProvidedData;
use ty_python_semantic::provided::ProvidedField;
use ty_python_semantic::provided::ProvidedGetattrPresence;
use ty_python_semantic::provided::ProvidedInstanceFields;
use ty_python_semantic::provided::ProvidedInstanceFieldsSource;
use ty_python_semantic::types::Type;
use ty_python_semantic::types::TypeDefinition;
use ty_python_semantic::HasType;
use ty_python_semantic::ProgramEnvironment;
use ty_python_semantic::SemanticModel;

use crate::Database;

#[derive(Debug, Clone, PartialEq, Eq, Hash, get_size2::GetSize)]
struct RecordDeclaration {
    function: u32,
    fields: Box<[Name]>,
    open: bool,
}

/// Selecting a provider declaration must not infer its signature: fields can refer to itself.
pub(super) fn is_declaration(db: &dyn super::interface::Db, definition: Definition<'_>) -> bool {
    let file = definition.program_file(db);
    let Some(source) = db.starlark_file(file) else {
        return false;
    };
    if !source.is_type_interface(db) || definition.scope(db) != global_scope(db, file) {
        return false;
    }
    let DefinitionKind::Function(function) = definition.kind(db) else {
        return false;
    };
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let function = function.node(&parsed);
    let Some(Expr::Subscript(application)) = function.returns.as_deref() else {
        return false;
    };
    matches!(application.value.as_ref(), Expr::Name(name) if name.id == "record")
        && place_table(db, global_scope(db, file))
            .symbol_by_name("record")
            .is_none_or(|symbol| !symbol.is_bound() && !symbol.is_declared())
}

pub(super) fn reference<'db>(db: &'db Database, definition: Definition<'db>) -> Option<Type<'db>> {
    if !is_declaration(db, definition) {
        return None;
    }
    let DefinitionKind::Function(function) = definition.kind(db) else {
        return None;
    };
    let file = definition.program_file(db);
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    instance(db, file, function.node(&parsed))
}

pub(super) fn constructor_instance<'db>(
    db: &'db Database,
    constructor: Type<'db>,
    environment: &ProgramEnvironment<'db>,
) -> Option<Type<'db>> {
    let TypeDefinition::Function(definition) = constructor.definition(db, environment)? else {
        return None;
    };
    reference(db, definition)
}

pub(super) fn constructor_fields<'db>(
    db: &'db Database,
    constructor: Type<'db>,
    environment: &ProgramEnvironment<'db>,
) -> Option<Vec<ProvidedField<'db>>> {
    let TypeDefinition::Function(definition) = constructor.definition(db, environment)? else {
        return None;
    };
    let instance = reference(db, definition)?;
    let data = instance.provided_data(db, environment)?;
    let fields = fields(db, definition.program_file(db), data)?;
    Some(fields.fields.into_vec())
}

pub(super) fn instance<'db>(
    db: &'db Database,
    file: ProgramFile<'db>,
    function: &StmtFunctionDef,
) -> Option<Type<'db>> {
    let expression = function.returns.as_deref()?;
    let Expr::Subscript(application) = expression else {
        return None;
    };
    let (_, mapping, open) = super::shapes::mapping_argument(&application.slice)?;
    let declaration = RecordDeclaration {
        function: function.node_index().load().as_u32()?,
        fields: mapping
            .items
            .iter()
            .filter_map(|item| match &item.key {
                Some(Expr::StringLiteral(key)) => Some(Name::new(key.value.to_str())),
                _ => None,
            })
            .collect(),
        open,
    };
    let class = ProvidedClass {
        name: function.name.id.clone(),
        bases: db
            .annotation_builtin(db.starlark_file(file)?, "record")
            .into_iter()
            .collect(),
        class_members: Box::default(),
        instance_fields: ProvidedInstanceFieldsSource::Deferred(ProvidedData::new(declaration)),
    }
    .into_type_at_expression(db, file, expression.into())?;
    class.to_instance_approximation(db, &ProgramEnvironment::from_file(file))
}

pub(super) fn fields<'db>(
    db: &'db Database,
    file: ProgramFile<'db>,
    data: &ProvidedData,
) -> Option<ProvidedInstanceFields<'db>> {
    let declaration = data.downcast_ref::<RecordDeclaration>()?;
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let AnyRootNodeRef::Stmt(Stmt::FunctionDef(function)) =
        parsed.get_by_index(NodeIndex::from(declaration.function))
    else {
        return None;
    };
    let Expr::Subscript(application) = function.returns.as_deref()? else {
        return None;
    };
    let (_, mapping, _) = super::shapes::mapping_argument(&application.slice)?;
    let model = SemanticModel::new(db, file);
    let mut fields = Vec::new();
    for item in &mapping.items {
        let Some(Expr::StringLiteral(key)) = &item.key else {
            continue;
        };
        let ty = item.value.inferred_type(&model)?;
        fields.push(ProvidedField {
            name: Name::new(key.value.to_str()),
            ty,
            source: Some(FileRange::new(file.file(db), key.range())),
        });
    }
    Some(ProvidedInstanceFields {
        fields: fields.into_boxed_slice(),
        has_dynamic_fields: false,
        implications: Box::default(),
        data: Some(data.clone()),
    })
}

pub(super) fn getattr_presence<'db>(
    db: &'db Database,
    receiver: Type<'db>,
    environment: &ProgramEnvironment<'db>,
    attribute: &str,
) -> Option<ProvidedGetattrPresence> {
    let data = receiver.provided_data(db, environment)?;
    let record = data.downcast_ref::<RecordDeclaration>()?;
    Some(
        if !record.open && !record.fields.iter().any(|field| field == attribute) {
            ProvidedGetattrPresence::Absent
        } else {
            ProvidedGetattrPresence::PossiblyMissing
        },
    )
}

#[cfg(test)]
mod tests {
    use starpls_hir::Fixture;

    use crate::Analysis;
    use crate::FilePosition;

    #[test]
    fn record_constructors_preserve_recursive_nominal_identity() {
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
            "info.bzl",
            r#"
def _init(value, next=None):
    return {"value": value, "next": next}
Info, raw_info = provider(fields=["value", "next"], init=_init)
Other = provider(fields=["value"])
def consume(value: Info) -> Info:
    return value
original = raw_info(value="original", next=None)
"#,
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "info.bzli",
            r#"
def Info(value: str, next: Info | None = ...) -> record[{"value": str, "next": Info | None}]: ...
def Other(*, value: str) -> record[{"value": str}]: ...
def raw_info(*, value: str, next: Info | None) -> Info: ...
"#,
        );
        let valid = r#"
load("info.bzl", "Info", "Other", "consume", "original", "raw_info")
alias = Info
value = consume(alias("ok", original))
raw = consume(raw_info(value="raw", next=None))
def read_next(value: Info) -> str:
    if value.next == None:
        return value.value
    return value.next.value
read_next(value)
def target_value(target: Target) -> str:
    return target[Info].value
absent_result = getattr(value, "absent", None)
"#;
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", valid);
        loader.add_files_from_fixture(&fixture);
        // Standalone interfaces establish identity before a source pair is selected.
        let diagnostics = analysis.snapshot().diagnostics(interface).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for file in [source, interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        let hover = analysis
            .snapshot()
            .hover(FilePosition {
                file_id: caller,
                pos: (valid.rfind("absent_result").unwrap() as u32).into(),
            })
            .unwrap()
            .unwrap();
        assert!(
            hover.contents.value.contains("None")
                && !hover.contents.value.contains("Unknown")
                && !hover.contents.value.contains("Any"),
            "{}",
            hover.contents.value
        );
        for invalid in [
            "Info(1)",
            "consume(Other(value='same field'))",
            "consume(struct(value='same field', next=None))",
            "value.value = 'changed'",
            "raw_info(value=1, next=None)",
        ] {
            analysis.update_file(caller, format!("{valid}\n{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            assert!(!diagnostics.is_empty(), "accepted {invalid}");
        }
    }
}
