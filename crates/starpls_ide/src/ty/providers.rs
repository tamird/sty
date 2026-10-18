//! Nominal provider declarations keep constructor inputs separate from stored fields.

use ruff_db::diagnostic::Annotation;
use ruff_db::diagnostic::Diagnostic;
use ruff_db::diagnostic::DiagnosticId;
use ruff_db::diagnostic::Severity;
use ruff_db::diagnostic::Span;
use ruff_db::files::FileRange;
use ruff_python_ast::find_node::covering_node;
use ruff_python_ast::name::Name;
use ruff_python_ast::AnyNodeRef;
use ruff_python_ast::AnyRootNodeRef;
use ruff_python_ast::Expr;
use ruff_python_ast::HasNodeIndex;
use ruff_python_ast::NodeIndex;
use ruff_python_ast::Stmt;
use ruff_python_ast::StmtFunctionDef;
use ruff_text_size::Ranged;
use ruff_text_size::TextRange;
use rustc_hash::FxHashMap;
use rustc_hash::FxHashSet;
use starpls_hir::Db as _;
use ty_python_core::definition::Definition;
use ty_python_core::definition::DefinitionKind;
use ty_python_core::definition::ParameterDefinitionNodeKind;
use ty_python_core::global_scope;
use ty_python_core::place_table;
use ty_python_core::ProgramFile;
use ty_python_semantic::provided::BuiltinUsage;
use ty_python_semantic::provided::ProvidedBindingValue;
use ty_python_semantic::provided::ProvidedClass;
use ty_python_semantic::provided::ProvidedData;
use ty_python_semantic::provided::ProvidedField;
use ty_python_semantic::provided::ProvidedGetattrPresence;
use ty_python_semantic::provided::ProvidedInstanceFields;
use ty_python_semantic::provided::ProvidedInstanceFieldsSource;
use ty_python_semantic::provided::ProvidedTypeApplication;
use ty_python_semantic::provided::TypeExpressionContext;
use ty_python_semantic::types::ide_support::definitions_for_name;
use ty_python_semantic::types::CallableTypeKind;
use ty_python_semantic::types::CheckedArgument;
use ty_python_semantic::types::CheckedCall;
use ty_python_semantic::types::IntersectionType;
use ty_python_semantic::types::KnownClass;
use ty_python_semantic::types::Parameter;
use ty_python_semantic::types::ParameterKind;
use ty_python_semantic::types::Parameters;
use ty_python_semantic::types::Signature;
use ty_python_semantic::types::Type;
use ty_python_semantic::types::TypeDefinition;
use ty_python_semantic::types::TypedDictFieldBuilder;
use ty_python_semantic::types::TypedDictOpenness;
use ty_python_semantic::types::TypedDictSchema;
use ty_python_semantic::types::TypedDictType;
use ty_python_semantic::types::UnionType;
use ty_python_semantic::HasDefinition;
use ty_python_semantic::HasType;
use ty_python_semantic::ImportAliasResolution;
use ty_python_semantic::ProgramEnvironment;
use ty_python_semantic::SemanticModel;

use crate::Database;

#[derive(Debug, Clone, PartialEq, Eq, Hash, get_size2::GetSize)]
struct RecordDeclaration {
    function: u32,
    fields: Box<[Name]>,
    open: bool,
    generic: bool,
}

/// The constructor and key are the same native value, while its returned record
/// has a separate nominal identity. Keep the declaration for annotation uses.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub(super) struct ProviderKeyData {
    declaration: Option<(starpls_common::File, TextRange)>,
    pub(super) constructor_data: Option<ProvidedData>,
}

impl get_size2::GetSize for ProviderKeyData {
    fn get_heap_size(&self) -> usize {
        let Self {
            declaration: _,
            constructor_data,
        } = self;
        get_size2::GetSize::get_heap_size(constructor_data)
    }
}

pub(super) fn constructor_definition<'db>(
    db: &'db Database,
    constructor: Type<'db>,
    environment: &ProgramEnvironment<'db>,
) -> Option<TypeDefinition<'db>> {
    if let Some(data) = constructor.provided_data(db, environment) {
        if let Some(key) = data.downcast_ref::<ProviderKeyData>() {
            let (source, range) = key.declaration?;
            let file = db.starlark_program_file(source);
            let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
            let node = covering_node(parsed.syntax().into(), range);
            let model = SemanticModel::new(db, file);
            return match node.node() {
                AnyNodeRef::StmtFunctionDef(function) => {
                    Some(TypeDefinition::Function(function.definition(&model)))
                }
                AnyNodeRef::StmtClassDef(class) => {
                    Some(TypeDefinition::StaticClass(class.definition(&model)))
                }
                _ => None,
            };
        }
    }
    constructor.definition(db, environment)
}

/// Build the callable key at its original declaration, never at an importing use.
pub(super) fn key_value<'db>(
    db: &'db Database,
    origin_file: ProgramFile<'db>,
    constructor: Type<'db>,
    base: Type<'db>,
    environment: &ProgramEnvironment<'db>,
) -> Option<Type<'db>> {
    let data = constructor.provided_data(db, environment);
    if data
        .as_ref()
        .is_some_and(|data| data.downcast_ref::<ProviderKeyData>().is_some())
    {
        return Some(constructor);
    }
    let declaration = match constructor.definition(db, environment) {
        Some(TypeDefinition::Function(definition) | TypeDefinition::StaticClass(definition)) => {
            Some(definition)
        }
        _ => None,
    };
    let file = declaration.map_or(origin_file, |definition| definition.program_file(db));
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let (name, source) = if let Some(definition) = declaration {
        match definition.kind(db) {
            DefinitionKind::Function(function) => {
                let function = function.node(&parsed);
                (
                    function.name.id.clone(),
                    Some((db.starlark_file(file)?, function.range())),
                )
            }
            DefinitionKind::Class(class) => {
                let class = class.node(&parsed);
                (
                    class.name.id.clone(),
                    Some((db.starlark_file(file)?, class.range())),
                )
            }
            _ => return None,
        }
    } else {
        let provider = data?.downcast_ref::<super::factory::ProviderData>()?;
        (provider.name.clone(), None)
    };
    let mut results = Vec::new();
    let callable = constructor.map_callable_signatures(
        db,
        environment,
        CallableTypeKind::FunctionLike,
        |signature| {
            let signature = match legacy_instance(db, signature.return_type(), environment) {
                Some(instance) => signature.with_return_type(instance),
                None => signature,
            };
            results.push(signature.upper_specialized_return_type(db, environment));
            let parameters = std::iter::once(Parameter::positional_only(Some(Name::new("self"))))
                .chain(signature.parameters().iter().cloned());
            let parameters = Parameters::from_annotation(db, parameters);
            signature.with_parameters(parameters)
        },
    )?;
    // A runtime key identifies all constructor specializations. Its lookup view closes
    // those binders while the callable above retains them for ordinary construction.
    let result = UnionType::from_elements(db, environment, results);
    let base = base.as_class_literal()?;
    let base =
        Type::from(base.apply_specialization(db, |context| context.specialize(db, vec![result])));
    let class = ProvidedClass {
        name,
        bases: Box::from([base]),
        class_members: Box::from([(Name::new("__call__"), callable)]),
        instance_fields: ProvidedInstanceFields {
            fields: Box::default(),
            has_dynamic_fields: false,
            implications: Box::default(),
            data: Some(ProvidedData::new(ProviderKeyData {
                declaration: source,
                constructor_data: data.cloned().or_else(|| {
                    let text = declaration?.docstring(db)?;
                    Some(ProvidedData::new(super::factory::Documentation {
                        text: Some(text.into()),
                        parameters: Vec::new(),
                    }))
                }),
            })),
        }
        .into(),
    };
    let class = if let Some(definition) = declaration {
        class.into_type_at_definition(db, definition)?
    } else {
        let provider = data?.downcast_ref::<super::factory::ProviderData>()?;
        let node = covering_node(parsed.syntax().into(), provider.origin.range());
        let AnyNodeRef::ExprCall(call) = node.node() else {
            return None;
        };
        class.into_type_at_expression(db, file, call.into())?
    };
    class.to_instance_approximation(db, environment)
}

pub(super) fn key_export<'db>(
    db: &'db Database,
    file: ProgramFile<'db>,
    name: &str,
) -> Option<Type<'db>> {
    let source = db.starlark_file(file)?;
    if !source.is_type_interface(db) {
        return None;
    }
    let constructor = ProvidedBindingValue::Export {
        file,
        name: Name::new(name),
        value: None,
    }
    .resolve_type(db)?;
    let environment = ProgramEnvironment::from_file(file);
    let declaration = constructor.definition(db, &environment)?;
    let is_provider = match declaration {
        TypeDefinition::Function(definition) => is_declaration(db, definition),
        TypeDefinition::StaticClass(_) => {
            super::interface::provider_definition(db, constructor, &environment).is_some()
        }
        _ => false,
    };
    if !is_provider {
        return None;
    }
    let base = db.annotation_builtin(source, "Provider")?;
    key_value(db, file, constructor, base, &environment)
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
    has_record_return(function)
        && place_table(db, global_scope(db, file))
            .symbol_by_name("record")
            .is_none_or(|symbol| !symbol.is_bound() && !symbol.is_declared())
}

pub(super) fn has_record_return(function: &StmtFunctionDef) -> bool {
    let Some(Expr::Subscript(application)) = function.returns.as_deref() else {
        return false;
    };
    matches!(application.value.as_ref(), Expr::Name(name) if name.id == "record")
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
    let function = function.node(&parsed);
    if function.type_params.is_some() {
        let signature = constructor_signature(db, definition)?;
        return Some(signature.default_specialized_return_type(db));
    }
    instance(db, file, function)
}

#[derive(Clone, Debug, PartialEq, Eq, salsa::SalsaValue)]
struct RecursiveProvider;

#[salsa::tracked(returns(ref), cycle_result=|_, _, _| Err(RecursiveProvider))]
fn record_signature<'db>(
    db: &'db dyn super::interface::Db,
    definition: Definition<'db>,
) -> Result<Option<Signature<'db>>, RecursiveProvider> {
    let model = SemanticModel::new(db, definition.program_file(db));
    let Type::FunctionLiteral(function) = model.definition_type(definition) else {
        return Ok(None);
    };
    let mut declarations = function.iter_overloads_and_implementation(db);
    let Some(declaration) = declarations.next() else {
        return Ok(None);
    };
    if declarations.next().is_some() {
        return Ok(None);
    }
    Ok(Some(declaration.signature(db)))
}

pub(super) fn constructor_signature<'db>(
    db: &'db Database,
    definition: Definition<'db>,
) -> Option<Signature<'db>> {
    let signature = record_signature(db, definition).as_ref().ok()?;
    signature.clone()
}

pub(super) fn type_application<'db>(
    db: &'db Database,
    application: &ProvidedTypeApplication<'_, 'db>,
    context: &mut dyn TypeExpressionContext<'db>,
) -> Option<Type<'db>> {
    let environment = ProgramEnvironment::from_file(context.program_file());
    let TypeDefinition::Function(definition) =
        constructor_definition(db, application.value_type, &environment)?
    else {
        return None;
    };
    if !is_declaration(db, definition) {
        return None;
    }
    let signature = match record_signature(db, definition) {
        Ok(signature) => signature,
        Err(RecursiveProvider) => return Some(Type::unknown()),
    };
    let signature = signature.as_ref()?;
    Some(context.infer_specialized_return_type(application.expression, signature))
}

pub(super) fn constructor_instance<'db>(
    db: &'db Database,
    constructor: Type<'db>,
    environment: &ProgramEnvironment<'db>,
) -> Option<Type<'db>> {
    if let Some(instance) = constructor.to_instance_approximation(db, environment) {
        if let Some(instance) = legacy_instance(db, instance, environment) {
            return Some(instance);
        }
    }
    if let Some(TypeDefinition::Function(definition)) =
        constructor_definition(db, constructor, environment)
    {
        if let Some(instance) = reference(db, definition) {
            return Some(instance);
        }
    }
    let data = constructor.provided_data(db, environment)?;
    data.downcast_ref::<ProviderKeyData>()?;
    let mut returns = Vec::new();
    constructor.map_callable_signatures(
        db,
        environment,
        CallableTypeKind::Regular,
        |signature| {
            returns.push(signature.default_specialized_return_type(db));
            signature
        },
    )?;
    Some(UnionType::from_elements(db, environment, returns))
}

/// Legacy class declarations retain ty's class identity and field ownership.
/// Their host instance view also guarantees Bazel's common Info contract.
fn legacy_instance<'db>(
    db: &'db Database,
    instance: Type<'db>,
    environment: &ProgramEnvironment<'db>,
) -> Option<Type<'db>> {
    let definition = super::interface::provider_definition(db, instance, environment)?;
    let source = db.starlark_file(definition.program_file(db))?;
    if !source.is_type_interface(db) {
        return None;
    }
    let base = db
        .annotation_builtin(source, "ProviderInstance")?
        .to_instance_approximation(db, environment)?;
    Some(IntersectionType::from_two_elements(
        db,
        environment,
        instance,
        base,
    ))
}

pub(super) fn constructor_fields<'db>(
    db: &'db Database,
    constructor: Type<'db>,
    environment: &ProgramEnvironment<'db>,
) -> Option<Vec<ProvidedField<'db>>> {
    let TypeDefinition::Function(definition) =
        constructor_definition(db, constructor, environment)?
    else {
        return None;
    };
    if !is_declaration(db, definition) {
        return None;
    }
    let DefinitionKind::Function(function) = definition.kind(db) else {
        return None;
    };
    let file = definition.program_file(db);
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let instance = instance(db, file, function.node(&parsed))?;
    let data = instance.provided_data(db, environment)?;
    let declaration = data.downcast_ref::<RecordDeclaration>()?;
    declaration_fields(db, file, declaration)
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
        generic: function.type_params.is_some(),
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
    // Generic fields live in the constructor's structural return type, where ty
    // applies its ordinary function specialization. The nominal identity carries
    // no competing fields containing the constructor's unbound type parameters.
    let fields = if declaration.generic {
        Vec::new()
    } else {
        declaration_fields(db, file, declaration)?
    };
    Some(ProvidedInstanceFields {
        fields: fields.into_boxed_slice(),
        has_dynamic_fields: false,
        implications: Box::default(),
        data: Some(data.clone()),
    })
}

fn declaration_fields<'db>(
    db: &'db Database,
    file: ProgramFile<'db>,
    declaration: &RecordDeclaration,
) -> Option<Vec<ProvidedField<'db>>> {
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
    Some(fields)
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

/// Registered callback identity is resolved without inferring the callback's body.
#[derive(Clone, Debug, PartialEq, Eq, salsa::SalsaValue)]
struct InitializerContract<'db> {
    declaration: Definition<'db>,
    provider_file: ProgramFile<'db>,
    provider_node: u32,
}

#[salsa::tracked(returns(ref))]
fn initializer_contracts(
    db: &dyn super::interface::Db,
) -> FxHashMap<Definition<'_>, Vec<InitializerContract<'_>>> {
    let mut result: FxHashMap<_, Vec<_>> = FxHashMap::default();
    for ((file, node), declarations) in super::interface::provider_pairs(db) {
        let [declaration] = declarations.as_slice() else {
            continue;
        };
        let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
        let AnyRootNodeRef::Expr(Expr::Call(call)) = parsed.get_by_index(NodeIndex::from(*node))
        else {
            continue;
        };
        let Some(factory) = resolve_function(db, *file, &call.func, &mut FxHashSet::default())
        else {
            continue;
        };
        if !matches!(
            super::factory::declaration(db, factory),
            Some(super::factory::BuiltinFunction::Provider)
        ) {
            continue;
        }
        let Some(initializer) = call.arguments.find_keyword("init") else {
            continue;
        };
        let Some(definition) =
            resolve_function(db, *file, &initializer.value, &mut FxHashSet::default())
        else {
            continue;
        };
        let contracts = result.entry(definition).or_default();
        let contract = InitializerContract {
            declaration: *declaration,
            provider_file: *file,
            provider_node: *node,
        };
        if !contracts.contains(&contract) {
            contracts.push(contract);
        }
    }
    result
}

fn resolve_function<'db>(
    db: &'db dyn super::interface::Db,
    file: ProgramFile<'db>,
    expression: &Expr,
    visited: &mut FxHashSet<Definition<'db>>,
) -> Option<Definition<'db>> {
    let Expr::Name(name) = expression else {
        return None;
    };
    let model = SemanticModel::new(db, file);
    let definitions = definitions_for_name(
        &model,
        &name.id,
        name.into(),
        ImportAliasResolution::PreserveAliases,
    );
    let definition = match definitions.as_slice() {
        [definition] => definition.definition()?,
        [] => match model
            .builtin_type(&name.id, BuiltinUsage::Runtime)?
            .definition(db, &model.program_environment())?
        {
            TypeDefinition::Function(definition) => definition,
            _ => return None,
        },
        _ => return None,
    };
    resolve_definition(db, definition, visited)
}

fn resolve_definition<'db>(
    db: &'db dyn super::interface::Db,
    definition: Definition<'db>,
    visited: &mut FxHashSet<Definition<'db>>,
) -> Option<Definition<'db>> {
    if !visited.insert(definition) {
        return None;
    }
    match definition.kind(db) {
        DefinitionKind::Function(_) => Some(definition),
        DefinitionKind::Assignment(assignment) => {
            let file = definition.program_file(db);
            let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
            resolve_function(db, file, assignment.value(&parsed), visited)
        }
        DefinitionKind::ProvidedBinding(_) => {
            let (from, module, name) = super::load::binding_names(db, definition)?;
            let source = starpls_common::Db::load_file(db, &module, from.dialect, from).ok()??;
            let definitions =
                super::interface::export_definitions(db, db.starlark_program_file(source), &name);
            let [definition] = definitions.as_slice() else {
                return None;
            };
            resolve_definition(db, *definition, visited)
        }
        _ => None,
    }
}

pub(super) fn parameter_type<'db>(
    db: &'db Database,
    definition: Definition<'db>,
) -> Option<Type<'db>> {
    let DefinitionKind::Parameter(parameter_node) = definition.kind(db) else {
        return None;
    };
    let file = definition.program_file(db);
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let parameter = match parameter_node {
        ParameterDefinitionNodeKind::Parameter(parameter) => &parameter.node(&parsed).parameter,
        ParameterDefinitionNodeKind::VariadicPositionalParameter(parameter)
        | ParameterDefinitionNodeKind::VariadicKeywordParameter(parameter) => {
            parameter.node(&parsed)
        }
    };
    let function = covering_node(parsed.syntax().into(), parameter.range())
        .ancestors()
        .find_map(|node| match node {
            AnyNodeRef::StmtFunctionDef(function) => Some(function),
            _ => None,
        })?;
    let model = SemanticModel::new(db, file);
    let [contract] = initializer_contracts(db)
        .get(&function.definition(&model))?
        .as_slice()
    else {
        return None;
    };
    let contract = contract.declaration;
    let contract_file = contract.program_file(db);
    let parsed = ruff_db::parsed::parsed_module(db, contract_file.python_file(db)).load(db);
    let constructor = match contract.kind(db) {
        DefinitionKind::Function(function) => function.node(&parsed),
        DefinitionKind::Class(class) => {
            class
                .node(&parsed)
                .body
                .iter()
                .find_map(|statement| match statement {
                    Stmt::FunctionDef(function) if function.name.as_str() == "__init__" => {
                        Some(function)
                    }
                    _ => None,
                })?
        }
        _ => return None,
    };
    let model = SemanticModel::new(db, contract_file);
    if matches!(
        parameter_node,
        ParameterDefinitionNodeKind::VariadicPositionalParameter(_)
    ) {
        // Different fixed prefixes change which arguments enter *args. Keep ordinary
        // inference until that correspondence can be established by call binding.
        if function.parameters.args.len() != constructor.parameters.args.len() {
            return None;
        }
        let input = constructor.parameters.vararg.as_deref()?;
        let definitions =
            ty_python_core::semantic_index(db, contract_file).try_definitions(input.into())?;
        let [definition] = definitions else {
            return None;
        };
        return Some(model.definition_type(*definition));
    }
    if matches!(
        parameter_node,
        ParameterDefinitionNodeKind::VariadicKeywordParameter(_)
    ) {
        let mut fields = TypedDictSchema::default();
        let mut openness = TypedDictOpenness::Closed;
        for input in constructor.parameters.iter_non_variadic_params() {
            if matches!(contract.kind(db), DefinitionKind::Class(_))
                && input.parameter.name.id == "self"
            {
                continue;
            }
            if function
                .parameters
                .iter_non_variadic_params()
                .any(|source| source.parameter.name.id == input.parameter.name.id)
            {
                continue;
            }
            let ty = input
                .parameter
                .annotation
                .as_deref()
                .and_then(|annotation| annotation.inferred_type(&model))
                .unwrap_or_else(Type::unknown);
            let required = constructor
                .parameters
                .kwonlyargs
                .iter()
                .any(|keyword| keyword.parameter.name.id == input.parameter.name.id)
                && input.default.is_none();
            fields.insert(
                input.parameter.name.id.clone(),
                TypedDictFieldBuilder::new(ty).required(required).build(),
            );
        }
        if let Some(kwargs) = &constructor.parameters.kwarg {
            let value_type = kwargs
                .annotation
                .as_deref()
                .and_then(|annotation| annotation.inferred_type(&model))
                .unwrap_or_else(Type::unknown);
            let binding_type = ty_python_core::semantic_index(db, contract_file)
                .try_definitions(kwargs.as_ref().into())
                .and_then(|definitions| match definitions {
                    [definition] => Some(model.definition_type(*definition)),
                    _ => None,
                });
            match binding_type {
                Some(Type::TypedDict(schema)) => {
                    for (name, field) in schema.items(db) {
                        if !function
                            .parameters
                            .iter_non_variadic_params()
                            .any(|source| source.parameter.name.id == *name)
                        {
                            fields.insert(name.clone(), field.clone());
                        }
                    }
                    openness = schema.openness(db);
                }
                _ => openness = TypedDictOpenness::extra(db, value_type, false),
            }
        }
        return Some(Type::TypedDict(
            TypedDictType::from_schema_items_with_openness(db, fields, openness),
        ));
    }
    let input = constructor
        .parameters
        .iter()
        .find(|input| input.name().id == parameter.name.id)?;
    input.annotation()?.inferred_type(&model)
}

pub(super) fn return_contract<'db>(
    db: &'db Database,
    definition: Definition<'db>,
) -> Option<(Type<'db>, FileRange)> {
    let [contract] = initializer_contracts(db).get(&definition)?.as_slice() else {
        return None;
    };
    let (fields, source) = field_contract(db, contract.declaration)?;
    let parsed =
        ruff_db::parsed::parsed_module(db, contract.provider_file.python_file(db)).load(db);
    let AnyRootNodeRef::Expr(Expr::Call(call)) =
        parsed.get_by_index(NodeIndex::from(contract.provider_node))
    else {
        return None;
    };
    Some((
        restrict_fields(
            db,
            &ProgramEnvironment::from_file(contract.provider_file),
            fields,
            allowed_fields(call),
        ),
        source,
    ))
}

fn allowed_fields(call: &ruff_python_ast::ExprCall) -> Option<Vec<Name>> {
    let fields = &call.arguments.find_keyword("fields")?.value;
    let names: Vec<_> = match fields {
        Expr::List(list) => list.elts.iter().collect(),
        Expr::Tuple(tuple) => tuple.elts.iter().collect(),
        Expr::Dict(mapping) => mapping
            .items
            .iter()
            .map(|item| item.key.as_ref())
            .collect::<Option<_>>()?,
        _ => return None,
    };
    names
        .into_iter()
        .map(|name| match name {
            Expr::StringLiteral(name) => Some(Name::new(name.value.to_str())),
            _ => None,
        })
        .collect()
}

fn restrict_fields<'db>(
    db: &'db Database,
    environment: &ProgramEnvironment<'db>,
    fields: Type<'db>,
    allowed: Option<Vec<Name>>,
) -> Type<'db> {
    let (Type::TypedDict(schema), Some(allowed)) = (fields, allowed) else {
        return fields;
    };
    if matches!(schema.openness(db), TypedDictOpenness::Closed) {
        return fields;
    }
    let mut fields = schema.items(db).clone();
    let object = KnownClass::Object.to_instance(db, environment);
    for name in allowed {
        fields
            .entry(name)
            .or_insert_with(|| TypedDictFieldBuilder::new(object).read_only(true).build());
    }
    Type::TypedDict(TypedDictType::from_schema_items_with_openness(
        db,
        fields,
        TypedDictOpenness::Closed,
    ))
}

fn field_contract<'db>(
    db: &'db Database,
    definition: Definition<'db>,
) -> Option<(Type<'db>, FileRange)> {
    let file = definition.program_file(db);
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let model = SemanticModel::new(db, file);
    let environment = ProgramEnvironment::from_file(file);
    match definition.kind(db) {
        DefinitionKind::Function(function) => {
            let function = function.node(&parsed);
            let Expr::Subscript(application) = function.returns.as_deref()? else {
                return None;
            };
            let (mapping, _, _) = super::shapes::mapping_argument(&application.slice)?;
            let ty = mapping.inferred_type(&model)?;
            matches!(ty, Type::TypedDict(_))
                .then_some((ty, FileRange::new(file.file(db), mapping.range())))
        }
        DefinitionKind::Class(class) => {
            let ty = model.definition_type(definition);
            let fields = super::interface::provider_fields(db, ty, &environment)?;
            let fields: TypedDictSchema<'_> = fields
                .into_iter()
                .map(
                    |ProvidedField {
                         name,
                         ty,
                         source: _,
                     }| {
                        (
                            name,
                            TypedDictFieldBuilder::new(ty)
                                .required(true)
                                .read_only(true)
                                .build(),
                        )
                    },
                )
                .collect();
            let openness = TypedDictOpenness::extra(
                db,
                KnownClass::Object.to_instance(db, &environment),
                true,
            );
            let schema = TypedDictType::from_schema_items_with_openness(db, fields, openness);
            Some((
                Type::TypedDict(schema),
                FileRange::new(file.file(db), class.node(&parsed).name.range()),
            ))
        }
        _ => None,
    }
}

pub(super) fn raw_extra_parameters<'db>(
    db: &'db Database,
    call: &CheckedCall<'_, 'db>,
    constructor: Type<'db>,
) -> Vec<Parameter<'db>> {
    let environment = ProgramEnvironment::from_file(call.file());
    let schema = constructor
        .definition(db, &environment)
        .and_then(|definition| definition.definition())
        .and_then(|definition| field_contract(db, definition));
    let Some((Type::TypedDict(schema), _)) = schema else {
        return Vec::new();
    };
    if matches!(schema.openness(db), TypedDictOpenness::Closed) {
        return Vec::new();
    }
    let object = KnownClass::Object.to_instance(db, &environment);
    match allowed_fields(call.call()) {
        Some(names) => names
            .into_iter()
            .filter(|name| !schema.items(db).contains_key(name))
            .map(|name| {
                Parameter::keyword_only(name)
                    .with_annotated_type(object)
                    .with_default_type(Type::unknown())
            })
            .collect(),
        None => vec![Parameter::keyword_variadic(Name::new("kwargs")).with_annotated_type(object)],
    }
}

pub(super) fn call_diagnostics(db: &Database, call: &CheckedCall<'_, '_>) -> Vec<Diagnostic> {
    let Some(declaration) = call.declaration() else {
        return Vec::new();
    };
    if call.has_binding_errors()
        || !matches!(
            super::factory::declaration(db, declaration),
            Some(super::factory::BuiltinFunction::Provider)
        )
    {
        return Vec::new();
    }
    let Some(constructor) = db.provider_interface(call.file(), call.call().node_index().load())
    else {
        return Vec::new();
    };
    let environment = ProgramEnvironment::from_file(call.file());
    let Some(contract) = constructor
        .definition(db, &environment)
        .and_then(|definition| definition.definition())
    else {
        return Vec::new();
    };
    let Some((fields, source)) = field_contract(db, contract) else {
        return Vec::new();
    };
    let allowed = allowed_fields(call.call());
    let declared_outside_source = match (fields, &allowed) {
        (Type::TypedDict(schema), Some(allowed)) => schema
            .items(db)
            .keys()
            .filter(|name| !allowed.contains(name))
            .cloned()
            .collect::<Vec<_>>(),
        _ => Vec::new(),
    };
    let fields = restrict_fields(db, &environment, fields, allowed);
    let mut diagnostics = Vec::new();
    let mut report = |message: String| {
        let mut diagnostic = Diagnostic::new(
            DiagnosticId::Lint(super::diagnostics::INVALID_PROVIDER_INTERFACE.name()),
            Severity::Error,
            message,
        );
        diagnostic.annotate(Annotation::primary(
            Span::from(call.file().file(db)).with_range(call.call().range()),
        ));
        diagnostic.annotate(
            Annotation::secondary(Span::from(source.file()).with_range(source.range()))
                .message("Provider fields declared here"),
        );
        diagnostics.push(diagnostic);
    };
    let object = KnownClass::Object.to_instance(db, &environment);
    for name in declared_outside_source {
        report(format!(
            "Field `{name}` is excluded by the source provider's fields declaration"
        ));
    }
    let expected_inputs = constructor.map_callable_signatures(
        db,
        &environment,
        CallableTypeKind::FunctionLike,
        |signature| signature.with_return_type(object),
    );
    match call.argument("init") {
        CheckedArgument::Value { ty, expression: _ } if !ty.is_none(db) => {
            let actual_inputs = ty.map_callable_signatures(db, &environment, CallableTypeKind::FunctionLike, |signature| {
                if !signature.return_type().is_assignable_to(db, &environment, fields) {
                    report(format!("Initializer returns `{}`, which does not satisfy the declared provider fields `{}`", signature.return_type().display(db, &environment), fields.display(db, &environment)));
                }
                signature.with_return_type(object)
            });
            if let (Some(actual), Some(expected)) = (actual_inputs, expected_inputs) {
                if !actual.is_assignable_to(db, &environment, expected) {
                    report(
                        "Initializer does not accept the declared provider constructor arguments"
                            .into(),
                    );
                }
            }
        }
        CheckedArgument::Indeterminate => {
            report("Cannot determine the initializer for this provider contract".into());
        }
        _ => {
            let _ = constructor.map_callable_signatures(db, &environment, CallableTypeKind::FunctionLike, |signature| {
                let mut actual_fields = TypedDictSchema::default();
                let mut openness = TypedDictOpenness::Closed;
                for parameter in signature.parameters().iter() {
                    match parameter.kind() {
                        ParameterKind::KeywordOnly { name, default_type: _ } => {
                            actual_fields.insert(name.clone(), TypedDictFieldBuilder::new(parameter.annotated_type()).required(!parameter.has_default()).read_only(true).build());
                        }
                        ParameterKind::KeywordVariadic { name: _ } => {
                            openness = TypedDictOpenness::extra(db, parameter.annotated_type(), true);
                        }
                        _ => report("A provider without an initializer accepts only keyword arguments".into()),
                    }
                }
                let actual = Type::TypedDict(TypedDictType::from_schema_items_with_openness(db, actual_fields, openness));
                if !actual.is_assignable_to(db, &environment, fields) {
                    report(format!("Constructor arguments `{}` do not guarantee the declared provider fields `{}`", actual.display(db, &environment), fields.display(db, &environment)));
                }
                signature
            });
        }
    }
    diagnostics
}

pub(super) fn declaration_diagnostics(
    db: &Database,
    file: starpls_common::File,
) -> Vec<Diagnostic> {
    if !file.is_type_interface(db) {
        return Vec::new();
    }
    let mapped = db
        .environment()
        .type_interfaces(db)
        .values()
        .any(|(_, interface)| *interface == file);
    let program = db.starlark_program_file(file);
    let parsed = ruff_db::parsed::parsed_module(db, program.python_file(db)).load(db);
    let index = ty_python_core::semantic_index(db, program);
    let mut diagnostics = Vec::new();
    for statement in parsed.suite() {
        let Stmt::FunctionDef(function) = statement else {
            continue;
        };
        let Some([definition]) = index.try_definitions(function.into()) else {
            continue;
        };
        let definition = *definition;
        if !is_declaration(db, definition) {
            continue;
        }
        if function.type_params.is_some() && record_signature(db, definition).is_err() {
            let mut diagnostic = Diagnostic::new(
                DiagnosticId::Lint(super::diagnostics::INVALID_PROVIDER_INTERFACE.name()),
                Severity::Error,
                "A recursive generic provider declaration is not supported",
            );
            diagnostic.annotate(Annotation::primary(
                Span::from(file.source).with_range(function.name.range()),
            ));
            diagnostics.push(diagnostic);
            continue;
        }
        if !mapped {
            continue;
        }
        let valid_source =
            super::interface::provider_pairs(db)
                .iter()
                .any(|((file, node), declarations)| {
                    if !declarations.contains(&definition) {
                        return false;
                    }
                    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
                    let AnyRootNodeRef::Expr(Expr::Call(call)) =
                        parsed.get_by_index(NodeIndex::from(*node))
                    else {
                        return false;
                    };
                    resolve_function(db, *file, &call.func, &mut FxHashSet::default()).is_some_and(
                        |definition| {
                            matches!(
                                super::factory::declaration(db, definition),
                                Some(super::factory::BuiltinFunction::Provider)
                            )
                        },
                    )
                });
        if !valid_source {
            let mut diagnostic = Diagnostic::new(
                DiagnosticId::Lint(super::diagnostics::INVALID_PROVIDER_INTERFACE.name()),
                Severity::Error,
                format!(
                    "Provider constructor `{}` must describe a source provider() declaration",
                    function.name
                ),
            );
            diagnostic.annotate(Annotation::primary(
                Span::from(file.source).with_range(function.name.range()),
            ));
            diagnostics.push(diagnostic);
        }
    }
    diagnostics
}

#[cfg(test)]
mod tests {
    use starpls_hir::Fixture;

    use crate::Analysis;
    use crate::FilePosition;

    #[test]
    fn provider_keys_preserve_constructors_and_reject_unrelated_callables() {
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
Info = provider(fields=["value", "items"])
def _init(value):
    return {"value": value}
Initialized, raw = provider(fields=["value"], init=_init)
Empty = provider(fields=[])
def _legacy_init(value, next=None):
    return {"value": value, "next": next}
Legacy, raw_legacy = provider(fields=["value", "next"], init=_legacy_init)
def by_key(target, key):
    return target[key]
"#,
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "info.bzli",
            r#"
def Info[T](*, value: T, items: list[T]) -> record[{"value": T, "items": list[T]}]: ...
def Initialized(value: str) -> record[{"value": str}]: ...
def raw(*, value: str) -> Initialized: ...
class Empty:
    def __init__(self) -> None: ...
class Legacy:
    value: Final[str]
    next: Final[Legacy | None]
    def __init__(self, value: str, next: Legacy | None = ...) -> None: ...
class Shape(Protocol):
    value: str
class Dictionary(TypedDict):
    value: str
def by_key[T](target: Target, key: Provider[T]) -> T: ...
"#,
        );
        fixture.add_file(
            &mut analysis.db,
            "aliases.bzl",
            "load('info.bzl', Original='Info', Legacy='Legacy')\nAlias = Original\nLegacyAlias = Legacy\n",
        );
        let valid = r#"
load("info.bzl", "Info", "Initialized", "raw", "Empty", "Legacy", "raw_legacy", "by_key")
load("info.bzli", "Shape", "Dictionary")
load("aliases.bzl", Renamed="Alias", LegacyAlias="LegacyAlias")
def forward(target: Target, keys: Sequence[ProviderKey]) -> list[ProviderInstance]:
    return [target[key] for key in keys if key in target]
def instance(value: ProviderInstance) -> None: pass
def legacy_instance(value: Empty) -> ProviderInstance:
    return value
def widened_lookup(target: Target, key: Provider[object]) -> object:
    return target[key]
def objc_instance(value: ObjcProvider) -> ProviderInstance:
    return value
instance(Info(value="text", items=["text"]))
instance(Initialized("text"))
instance(raw(value="text"))
instance(Empty())
legacy: LegacyAlias = Legacy("root", next=Legacy("leaf"))
instance(legacy)
instance(raw_legacy(value="raw", next=legacy))
instance(DefaultInfo())
instance(struct(value=1))
Local = provider(fields=())
instance(Local())
def initialized_key(key: Provider[Initialized]) -> None: pass
def construct_and_lookup(target: Target, key: Intersection[Provider[Initialized], Callable[[str], Initialized]]) -> str:
    return key("constructed").value + target[key].value
def initialized_constructor(key: Intersection[Provider[Initialized], Callable[[str], Initialized]]) -> None: pass
initialized_constructor(Initialized)
def default_key(key: Provider[DefaultInfo]) -> None: pass
initialized_key(Initialized)
default_key(DefaultInfo)
def inspect(target: Target) -> str:
    forward(target, [Info, Renamed, Initialized, Empty, DefaultInfo, platform_common.ConstraintSettingInfo])
    value: Renamed[str] = Info(value="text", items=["text"])
    text: str = value.items[0]
    return text + target[Initialized].value + by_key(target, Initialized).value
def arbitrary(value: str) -> Initialized:
    return Initialized(value)
raw(value="text")
empty: Empty = Empty()
"#;
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", valid);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        {
            let snapshot = analysis.snapshot();
            let db = &snapshot.db;
            let key = super::key_export(db, db.starlark_program_file(interface), "Info").unwrap();
            let source_key = ty_python_semantic::provided::ProvidedBindingValue::Export {
                file: db.starlark_program_file(source),
                name: ruff_python_ast::name::Name::new("Info"),
                value: None,
            }
            .resolve_type(db)
            .unwrap();
            assert_eq!(key, source_key);
        }
        for file in [source, interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        analysis.set_rules(
            crate::DiagnosticRules::from_settings(
                &[("non-static-type".into(), "error".into())]
                    .into_iter()
                    .collect(),
            )
            .unwrap(),
        );
        let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.set_rules(Default::default());
        for (invalid, expected) in [
            ("def bad(target: Target):\n    return target[raw]", "invalid-argument-type"),
            ("def bad(target: Target):\n    return target[arbitrary]", "invalid-argument-type"),
            ("def bad(target: Target):\n    return arbitrary in target", "unsupported-operator"),
            ("def bad(target: Target):\n    return target[str]", "invalid-argument-type"),
            ("def bad(target: Target):\n    first = target[Info]\n    second = target[Info]\n    first.items.append(second.value)", "invalid-argument-type"),
            ("Initialized(42)", "invalid-argument-type"),
            ("raw(value=42)", "invalid-argument-type"),
            ("initialized_key(arbitrary)", "invalid-argument-type"),
            ("initialized_constructor(arbitrary)", "invalid-argument-type"),
            ("initialized_constructor(raw)", "invalid-argument-type"),
            ("def wrong_call(key: Intersection[Provider[Initialized], Callable[[str], Initialized]]) -> None:\n    key(42)", "invalid-argument-type"),
            ("def concrete(key: Provider[Info[str]]) -> None: pass\nconcrete(Info)", "invalid-argument-type"),
            ("instance(42)", "invalid-argument-type"),
            ("instance('not a provider')", "invalid-argument-type"),
            ("instance({'value': 1})", "invalid-argument-type"),
            ("instance(DefaultInfo)", "invalid-argument-type"),
            ("def bad(value: FilesToRunProvider) -> None:\n    instance(value)", "invalid-argument-type"),
            ("def bad(value: object) -> None:\n    instance(value)", "invalid-argument-type"),
            ("def bad(value: Shape) -> None:\n    instance(value)", "invalid-argument-type"),
            ("def bad(value: Dictionary) -> None:\n    instance(value)", "invalid-argument-type"),
            ("LegacyAlias(42)", "invalid-argument-type"),
            ("def bad(value: DefaultInfo) -> object:\n    return value.missing", "unresolved-attribute"),
        ] {
            analysis.update_file(caller, format!("{valid}\n{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == expected),
                "accepted {invalid}: {diagnostics:?}"
            );
        }
    }

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

    #[test]
    fn generic_provider_fields_follow_constructor_arguments() {
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
            "Info = provider(fields=['value', 'pieces'])\nOther = provider(fields=['value', 'pieces'])\nEnvelope = provider(fields=['inner'])\nDefaulted = provider(fields=['value'])\nBounded = provider(fields=['value'])\n",
        );
        let interface = fixture.add_file(
            &mut analysis.db,
            "info.bzli",
            r#"
def Info[T](*, value: T, pieces: depset[tuple[str, T]]) -> record[{"value": T, "pieces": depset[tuple[str, T]]}]: ...
def Other[T](*, value: T, pieces: depset[tuple[str, T]]) -> record[{"value": T, "pieces": depset[tuple[str, T]]}]: ...
def Envelope[T](*, inner: Info[T]) -> record[{"inner": Info[T]}]: ...
def Defaulted[T = str](*, value: T) -> record[{"value": T}]: ...
def Bounded[T: str](*, value: T) -> record[{"value": T}]: ...
"#,
        );
        let valid = r#"
load("info.bzl", "Info", "Other", "Envelope", "Defaulted", "Bounded")
alias = Info
value = alias(value="ok", pieces=depset([("source", "piece")]))
text: str = value.value
pieces: list[tuple[str, str]] = value.pieces.to_list()
def consume(value: Info[str]) -> str:
    return value.value
def readonly(value: Info[object]) -> object:
    return value.value
consume(value)
readonly(value)
envelope: Envelope[str] = Envelope(inner=value)
nested: str = envelope.inner.value
default_value: Defaulted = Defaulted(value="default")
bounded_value: Bounded[str] = Bounded(value="bounded")
absent = getattr(value, "absent", None)
def absent_union(value: Info[str] | Info[int]) -> None:
    return getattr(value, "absent", None)
def from_target(target: Target):
    erased = target[Info].value
    defaulted = target[Defaulted].value
    return erased, defaulted
"#;
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", valid);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for file in [source, interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        for variable in ["erased", "defaulted"] {
            let hover = analysis
                .snapshot()
                .hover(FilePosition {
                    file_id: caller,
                    pos: (valid.find(&format!("{variable} =")).unwrap() as u32).into(),
                })
                .unwrap()
                .unwrap();
            assert!(
                hover.contents.value.contains("object") && !hover.contents.value.contains("Any"),
                "{}",
                hover.contents.value
            );
        }
        for (invalid, expected) in [
            ("wrong: int = value.value", "invalid-assignment"),
            (
                "wrong: list[tuple[str, int]] = value.pieces.to_list()",
                "invalid-assignment",
            ),
            (
                "consume(Info(value=1, pieces=depset([('source', 2)])))",
                "invalid-argument-type",
            ),
            (
                "consume(Other(value='same fields', pieces=depset([])))",
                "invalid-argument-type",
            ),
            (
                "consume(struct(value='same fields', pieces=depset([])))",
                "invalid-argument-type",
            ),
            ("value.value = 'changed'", "invalid-assignment"),
            ("wrong: Info[str, int] = value", "invalid-type-arguments"),
            (
                "wrong_default: Defaulted = Defaulted(value=42)",
                "invalid-assignment",
            ),
            (
                "def bad_bound(value: Bounded[int]) -> None: pass",
                "invalid-type-arguments",
            ),
        ] {
            analysis.update_file(caller, format!("{valid}\n{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            assert_eq!(diagnostics.len(), 1, "{invalid}: {diagnostics:?}");
            assert_eq!(
                diagnostics[0].id().as_str(),
                expected,
                "{invalid}: {diagnostics:?}"
            );
        }
        analysis.update_file(caller, valid.into());
        let hover = analysis
            .snapshot()
            .hover(FilePosition {
                file_id: caller,
                pos: (valid.find("absent =").unwrap() as u32).into(),
            })
            .unwrap()
            .unwrap();
        assert!(
            hover.contents.value.contains(": None\n"),
            "{}",
            hover.contents.value
        );
    }

    #[test]
    fn recursive_generic_provider_fields_are_diagnosed() {
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
        let interface = fixture.add_file(&mut analysis.db, "info.bzli", "");
        loader.add_files_from_fixture(&fixture);
        for source in [
            "def Node[T](*, value: T, child: Node[T] | None) -> record[{'value': T, 'child': Node[T] | None}]: ...\n",
            "def Left[T](*, value: T, right: Right[T] | None) -> record[{'value': T, 'right': Right[T] | None}]: ...\ndef Right[T](*, value: T, left: Left[T] | None) -> record[{'value': T, 'left': Left[T] | None}]: ...\n",
            "def Node[T](*, value: T, child: Node | None) -> record[{'value': T, 'child': Node | None}]: ...\n",
            "type Child[T] = Node[T]\ndef Node[T](*, value: T, child: Child[T] | None) -> record[{'value': T, 'child': Child[T] | None}]: ...\n",
            "def Left[T](*, value: T, right: Right | None) -> record[{'value': T, 'right': Right | None}]: ...\ndef Right[T](*, value: T, left: Left | None) -> record[{'value': T, 'left': Left | None}]: ...\n",
        ] {
            analysis.update_file(interface, source.into());
            let diagnostics = analysis.snapshot().diagnostics(interface).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic|
                    diagnostic.id().as_str() == "invalid-provider-interface"
                    && diagnostic.headline_message().contains("recursive")
                ),
                "{source}: {diagnostics:?}"
            );
        }
    }

    #[test]
    fn generic_provider_initializers_and_raw_constructors_preserve_fields() {
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
        let valid = r#"
def _init(value):
    return {"value": value, "values": [value]}
Info, raw = provider(fields=["value", "values"], init=_init)
_init("direct")
"#;
        let source = fixture.add_file(&mut analysis.db, "info.bzl", valid);
        let interface = fixture.add_file(
            &mut analysis.db,
            "info.bzli",
            r#"
def Info[T](value: T) -> record[{"value": T, "values": list[T]}]: ...
"#,
        );
        let caller_source = r#"
load("info.bzl", "Info", "raw")
value = Info("text")
texts: list[str] = ["text"]
raw_value = raw(value="text", values=texts)
contextual: Info[str] = Info("other")
text: str = value.value
raw_text: str = raw_value.value
def accept(value: Info[str]) -> list[str]:
    return value.values
accept(value)
accept(raw_value)
accept(contextual)
def mutate(value: Info[object]) -> None:
    value.values.append(42)
"#;
        let caller = fixture.add_file(&mut analysis.db, "main.bzl", caller_source);
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, interface)]).unwrap();
        for file in [source, interface, caller] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        for (invalid, expected) in [
            ("wrong: int = raw_value.value", "invalid-assignment"),
            (
                "accept(raw(value=42, values=[42]))",
                "invalid-argument-type",
            ),
            ("raw(value=42, values=texts)", "invalid-argument-type"),
            ("mutate(value)", "invalid-argument-type"),
        ] {
            analysis.update_file(caller, format!("{caller_source}\n{invalid}\n"));
            let diagnostics = analysis.snapshot().diagnostics(caller).unwrap();
            assert_eq!(diagnostics.len(), 1, "{invalid}: {diagnostics:?}");
            assert_eq!(
                diagnostics[0].id().as_str(),
                expected,
                "{invalid}: {diagnostics:?}"
            );
        }
        analysis.update_file(source, valid.replacen("[value]", "[42]", 1));
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        let mut ids: Vec<_> = diagnostics
            .iter()
            .map(|diagnostic| diagnostic.id().as_str())
            .collect();
        ids.sort_unstable();
        assert_eq!(
            ids,
            ["invalid-argument-type", "invalid-return-type"],
            "{diagnostics:?}"
        );
    }

    #[test]
    fn provider_initializers_check_inputs_and_returned_fields() {
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
        let valid = r#"
def _init(value, count=0):
    return {"value": value, "count": count}
Info, raw_info = provider(fields=["value", "count"], init=_init)
"#;
        let source = fixture.add_file(&mut analysis.db, "info.bzl", valid);
        let stub = fixture.add_file(
            &mut analysis.db,
            "info.bzli",
            r#"
def Info(value: str, count: int = ...) -> record[{"value": str, "count": int}]: ...
"#,
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for returned in [
            "{'value': 1, 'count': count}",
            "{'value': value}",
            "{'value': value, 'count': count, 'extra': True}",
            "None",
        ] {
            let body = valid.replace("{\"value\": value, \"count\": count}", returned);
            analysis.update_file(source, body);
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(
                diagnostics.iter().any(|diagnostic| matches!(
                    diagnostic.id().as_str(),
                    "invalid-return-type"
                        | "invalid-key"
                        | "missing-typed-dict-key"
                        | "invalid-provider-interface"
                )),
                "accepted {returned}: {diagnostics:?}"
            );
        }
        analysis.update_file(source, valid.replace("count=0", "count='bad default'"));
        assert!(!analysis.snapshot().diagnostics(source).unwrap().is_empty());
        analysis.update_file(
            source,
            valid.replace("value, count=0", "value: int, count=0"),
        );
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.headline_message()
                    == "Initializer does not accept the declared provider constructor arguments"),
            "{diagnostics:?}"
        );
        analysis.update_file(source, valid.into());
        assert!(analysis.snapshot().diagnostics(source).unwrap().is_empty());
    }

    #[test]
    fn variadic_initializers_receive_constructor_keyword_types() {
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
def _init(**values):
    return {"value": values["value"]}
Info, _raw = provider(fields=["value"], init=_init)
"#,
        );
        let stub = fixture.add_file(
            &mut analysis.db,
            "info.bzli",
            "def Info(*, value: str) -> record[{'value': str}]: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(source, "def _init(**values):\n    return {'value': values['value'] + 1}\nInfo, _raw = provider(fields=['value'], init=_init)\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "unsupported-operator"),
            "{diagnostics:?}"
        );
        for (annotation, access, value_type, invalid) in [
            (
                "dict[{'x': int}]",
                "values['first']['x']",
                "int",
                "values['first']['missing']",
            ),
            (
                "Unpack[dict[{'value': str}]]",
                "values['value']",
                "str",
                "values['value'] + 1",
            ),
        ] {
            analysis.update_file(
                stub,
                format!(
                    "def Info(**values: {annotation}) -> record[{{'value': {value_type}}}]: ...\n"
                ),
            );
            analysis.update_file(source, format!("def _init(**values):\n    return {{'value': {access}}}\nInfo, _raw = provider(fields=['value'], init=_init)\n"));
            for file in [stub, source] {
                let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
                assert!(diagnostics.is_empty(), "{annotation}: {diagnostics:?}");
            }
            analysis.update_file(source, format!("def _init(**values):\n    return {{'value': {invalid}}}\nInfo, _raw = provider(fields=['value'], init=_init)\n"));
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(!diagnostics.is_empty(), "accepted {invalid}");
        }
        analysis.update_file(
            stub,
            "def Info(*parts: str) -> record[{'value': str}]: ...\n".into(),
        );
        analysis.update_file(source, "def _init(*values):\n    return {'value': values[0]}\nInfo, _raw = provider(fields=['value'], init=_init)\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        analysis.update_file(source, "def _init(*values):\n    return {'value': values[0] + 1}\nInfo, _raw = provider(fields=['value'], init=_init)\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "unsupported-operator"),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn open_provider_contracts_check_loaded_initializers_and_source_fields() {
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
        let helper = fixture.add_file(
            &mut analysis.db,
            "helper.bzl",
            "def initialize(value):\n    return {'value': value, 'extra': True}\n",
        );
        let source = fixture.add_file(
            &mut analysis.db,
            "info.bzl",
            "load('helper.bzl', 'initialize')\nInfo, raw = provider(fields=['value', 'extra'], init=initialize)\nraw(value='direct', extra=1)\nraw(value='direct')\n",
        );
        let stub = fixture.add_file(
            &mut analysis.db,
            "info.bzli",
            "def Info(value: str) -> record[{'value': str}, ...]: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        for file in [source, stub, helper] {
            let diagnostics = analysis.snapshot().diagnostics(file).unwrap();
            assert!(diagnostics.is_empty(), "{diagnostics:?}");
        }
        for returned in [
            "{'value': value + 1}",
            "{'extra': True}",
            "{'value': value, 'forbidden': True}",
        ] {
            analysis.update_file(
                helper,
                format!("def initialize(value):\n    return {returned}\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(helper).unwrap();
            assert!(!diagnostics.is_empty(), "accepted {returned}");
        }
        analysis.update_file(
            helper,
            "def initialize(value):\n    return {'value': value}\n".into(),
        );
        analysis.update_file(source, "load('helper.bzl', 'initialize')\nInfo, raw = provider(fields=['extra'], init=initialize)\n".into());
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(
            diagnostics.iter().any(|diagnostic| diagnostic
                .headline_message()
                .contains("Field `value` is excluded")),
            "{diagnostics:?}"
        );
    }

    #[test]
    fn provider_declarations_require_matching_constructors() {
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
            "Info = provider(fields=['value'])\n",
        );
        let stub = fixture.add_file(
            &mut analysis.db,
            "info.bzli",
            "def Info(*, value: str) -> record[{'value': str}]: ...\n",
        );
        loader.add_files_from_fixture(&fixture);
        analysis.set_type_interfaces([(source, stub)]).unwrap();
        let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
        assert!(diagnostics.is_empty(), "{diagnostics:?}");
        for signature in ["value: str", "*, value: str = ...", "*, value: int"] {
            analysis.update_file(
                stub,
                format!("def Info({signature}) -> record[{{'value': str}}]: ...\n"),
            );
            let diagnostics = analysis.snapshot().diagnostics(source).unwrap();
            assert!(
                diagnostics
                    .iter()
                    .any(|diagnostic| diagnostic.id().as_str() == "invalid-provider-interface"),
                "{signature}: {diagnostics:?}"
            );
        }
        analysis.update_file(
            stub,
            "def Info(*, value: str) -> record[{'value': str}]: ...\n".into(),
        );
        analysis.update_file(
            source,
            "def Info(value):\n    return struct(value=value)\n".into(),
        );
        let diagnostics = analysis.snapshot().diagnostics(stub).unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|diagnostic| diagnostic.id().as_str() == "invalid-provider-interface"),
            "{diagnostics:?}"
        );
    }
}
