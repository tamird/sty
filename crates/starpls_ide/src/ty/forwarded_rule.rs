//! Source functions that return a single native rule registration.

use ruff_python_ast::name::Name;
use ruff_python_ast::Expr;
use ruff_python_ast::Operator;
use ruff_python_ast::Stmt;
use ty_python_core::definition::Definition;
use ty_python_core::definition::DefinitionKind;
use ty_python_core::global_scope;
use ty_python_core::place_table;
use ty_python_core::scope::NodeWithScopeKind;
use ty_python_core::ProgramFile;
use ty_python_semantic::provided::BuiltinUsage;
use ty_python_semantic::types::CheckedArgument;
use ty_python_semantic::types::CheckedCall;
use ty_python_semantic::types::DictionaryFirstEntry;
use ty_python_semantic::types::DictionaryItems;
use ty_python_semantic::types::KnownClass;
use ty_python_semantic::types::Parameter;
use ty_python_semantic::types::Parameters;
use ty_python_semantic::types::Signature;
use ty_python_semantic::types::Type;
use ty_python_semantic::ProgramEnvironment;
use ty_python_semantic::SemanticModel;

use super::factory;
use super::factory::BuiltinFunction;
use super::interface::Db;
use crate::Database;

#[derive(Clone, Debug, PartialEq, Eq, salsa::SalsaValue)]
enum FixedFragments {
    Parameter {
        name: Name,
        default: factory::Fragments,
    },
    Source(factory::Fragments),
}

/// Only collection construction, ordinary name reads, and native sequence addition are
/// inert. A call while evaluating either option could mutate the `attrs` dictionary.
fn sequence_operands<'a>(
    expression: &'a Expr,
    addition: bool,
    names: &mut Vec<&'a Name>,
) -> Option<()> {
    match expression {
        Expr::Name(name) => {
            if addition {
                names.push(&name.id);
            }
        }
        Expr::BinOp(op) => {
            if op.op != Operator::Add {
                return None;
            }
            sequence_operands(&op.left, true, names)?;
            sequence_operands(&op.right, true, names)?;
        }
        expression => {
            let elements = factory::literal_sequence_elements(expression)?;
            if !elements
                .iter()
                .all(|element| element.is_literal_expr() || element.is_name_expr())
            {
                return None;
            }
        }
    }
    Some(())
}

#[derive(Clone, Debug, PartialEq, Eq, salsa::SalsaValue)]
pub(super) struct ForwardedRule<'db> {
    pub(super) native: Definition<'db>,
    pub(super) implementation: Name,
    native_type: Type<'db>,
    supplied: Box<[Name]>,
    attrs: Name,
    empty_default: bool,
    parameters: Box<[Name]>,
    extra: Option<Name>,
    fragments: Option<FixedFragments>,
    sequence_parameters: Box<[(Name, bool)]>,
    requires_load: bool,
}

#[salsa::tracked(returns(ref), cycle_result=|_, _, _| None)]
pub(super) fn definition<'db>(
    db: &'db dyn Db,
    definition: Definition<'db>,
) -> Option<ForwardedRule<'db>> {
    if !matches!(definition.scope(db).node(db), NodeWithScopeKind::Module) {
        return None;
    }
    let DefinitionKind::Function(function) = definition.kind(db) else {
        return None;
    };
    let file = definition.program_file(db);
    if db.starlark_file(file)?.is_type_interface(db) {
        return None;
    }
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let function = function.node(&parsed);
    if !function.decorator_list.is_empty() || function.parameters.vararg.is_some() {
        return None;
    }
    let (last, prefix) = function.body.split_last()?;
    let Stmt::Return(result) = last else {
        return None;
    };
    match prefix {
        [] => {}
        [Stmt::Expr(doc)] => {
            if !doc.value.is_string_literal_expr() {
                return None;
            }
        }
        _ => return None,
    }
    let returned = result.value.as_deref()?;
    let call = returned.as_call_expr()?;
    if !call.arguments.args.is_empty() {
        return None;
    }
    let parameter = |expr: &Expr| {
        let name = &expr.as_name_expr()?.id;
        function
            .parameters
            .iter_non_variadic_params()
            .find(|p| p.parameter.name.id == *name)
    };
    let implementation = parameter(&call.arguments.find_keyword("implementation")?.value)?;
    let attrs = &call.arguments.find_keyword("attrs")?.value;
    let (attrs, extra) = match attrs {
        Expr::BinOp(union) => {
            if union.op != Operator::BitOr {
                return None;
            }
            let left = parameter(&union.left)?;
            (left, Some(union.right.as_ref()))
        }
        expr => (parameter(expr)?, None),
    };
    if attrs.parameter.name == implementation.parameter.name {
        return None;
    }
    let mut variadic = None;
    let mut operand_names = Vec::new();
    for keyword in &call.arguments.keywords {
        match keyword.arg.as_ref().map(|arg| arg.as_str()) {
            Some("implementation" | "attrs") => {}
            Some("fragments" | "toolchains") => {
                sequence_operands(&keyword.value, false, &mut operand_names)?
            }
            Some(_) => return None,
            None => {
                if variadic
                    .replace(&keyword.value.as_name_expr()?.id)
                    .is_some()
                {
                    return None;
                }
            }
        }
    }
    if variadic
        != function
            .parameters
            .kwarg
            .as_ref()
            .map(|param| &param.name.id)
    {
        return None;
    }
    let model = SemanticModel::new(db, file);
    let name = &call.func.as_name_expr()?.id;
    let scope = model.scope(call.into())?.to_scope_id(db, file);
    if [scope, global_scope(db, file)].into_iter().any(|scope| {
        place_table(db, scope)
            .symbol_by_name(name)
            .is_some_and(|symbol| symbol.is_bound() || symbol.is_declared())
    }) {
        return None;
    }
    let native_type = model.builtin_type(name, BuiltinUsage::Runtime)?;
    let native = native_type
        .definition(db, &model.program_environment())?
        .definition()?;
    if !matches!(
        factory::declaration(db, native),
        Some(BuiltinFunction::Rule { repository: false })
    ) {
        return None;
    }
    let extra = match extra {
        Some(expr) => {
            let name = &expr.as_name_expr()?.id;
            if place_table(db, scope)
                .symbol_by_name(name)
                .is_some_and(|symbol| symbol.is_bound() || symbol.is_declared())
            {
                return None;
            }
            Some(name.clone())
        }
        None => None,
    };
    let mut sequence_parameters = Vec::new();
    let mut requires_load = extra.is_some();
    for name in operand_names {
        if let Some(param) = function
            .parameters
            .iter_non_variadic_params()
            .find(|p| p.parameter.name.id == *name)
        {
            let pair = (
                name.clone(),
                param
                    .default
                    .as_deref()
                    .and_then(factory::literal_sequence_elements)
                    .is_some(),
            );
            if !sequence_parameters.contains(&pair) {
                sequence_parameters.push(pair);
            }
            continue;
        }
        if place_table(db, scope)
            .symbol_by_name(name)
            .is_some_and(|symbol| symbol.is_bound() || symbol.is_declared())
        {
            return None;
        }
        // A completed load establishes which global the function will see. A binding to a
        // list or tuple literal proves the native addition without assuming its contents.
        let exports = super::interface::export_definitions(db, file, name);
        let [binding] = exports.as_slice() else {
            return None;
        };
        let DefinitionKind::Assignment(assignment) = binding.kind(db) else {
            return None;
        };
        if assignment.unpack().is_some()
            || factory::literal_sequence_elements(assignment.value(&parsed)).is_none()
        {
            return None;
        }
        requires_load = true;
    }
    let fragments = call.arguments.find_keyword("fragments").map(|keyword| {
        let source = |expr| {
            factory::Fragments::from_expression(expr, |element| {
                Some(element.as_string_literal_expr()?.value.to_str())
            })
        };
        if let Some(param) = parameter(&keyword.value) {
            FixedFragments::Parameter {
                name: param.parameter.name.id.clone(),
                default: source(param.default.as_deref()),
            }
        } else {
            FixedFragments::Source(source(Some(&keyword.value)))
        }
    });
    Some(ForwardedRule {
        native,
        native_type,
        fragments,
        sequence_parameters: sequence_parameters.into_boxed_slice(),
        requires_load,
        supplied: call
            .arguments
            .keywords
            .iter()
            .filter_map(|keyword| keyword.arg.as_ref().map(|name| name.id.clone()))
            .collect(),
        implementation: implementation.parameter.name.id.clone(),
        attrs: attrs.parameter.name.id.clone(),
        empty_default: attrs
            .default
            .as_deref()
            .and_then(Expr::as_dict_expr)
            .is_some_and(|dict| dict.items.is_empty()),
        parameters: function
            .parameters
            .iter_non_variadic_params()
            .map(|p| p.parameter.name.id.clone())
            .collect(),
        extra,
    })
}

pub(super) struct BoundRule<'a, 'db> {
    pub(super) forwarder: &'db ForwardedRule<'db>,
    extra: Option<(ProgramFile<'db>, DictionaryItems<'db>)>,
    options: Vec<(Name, Type<'db>, Option<&'a Expr>)>,
    pub(super) attrs: DictionaryItems<'db>,
}

impl<'a, 'db> BoundRule<'a, 'db> {
    pub(super) fn bind(
        db: &'db Database,
        call: &CheckedCall<'a, 'db>,
        source: Definition<'db>,
    ) -> Option<Self> {
        let forwarder = definition(db, source).as_ref()?;
        if call.has_binding_errors() {
            return None;
        }
        let environment = ProgramEnvironment::from_file(call.file());
        let mut options = Vec::new();
        let mut add = |name: &Name, ty: Type<'db>, expression| {
            if forwarder.parameters.contains(name) {
                return Some(());
            }
            if forwarder.supplied.contains(name) || options.iter().any(|(key, _, _)| key == name) {
                return None;
            }
            options.push((name.clone(), ty, expression));
            Some(())
        };
        for keyword in &call.call().arguments.keywords {
            if let Some(name) = &keyword.arg {
                if forwarder.parameters.contains(&name.id) {
                    continue;
                }
                add(
                    &name.id,
                    call.expression_type(&keyword.value)?,
                    Some(&keyword.value),
                )?;
            } else {
                let items = call.dictionary_items(db, &keyword.value)?;
                if !items.is_complete() || !items.items.iter().all(|item| item.is_required()) {
                    return None;
                }
                for item in items.items {
                    add(&item.name, item.ty, None)?;
                }
            }
        }
        if !options.is_empty() {
            // Check the native function as a whole so its type variables are solved across
            // all forwarded options. The implementation's context is checked separately.
            let callback = Parameter::keyword_only(Name::new("implementation"))
                .with_annotated_type(Type::unknown());
            let parameters =
                std::iter::once(callback).chain(options.iter().map(|(name, ty, _)| {
                    Parameter::keyword_only(name.clone()).with_annotated_type(*ty)
                }));
            let accepts = Type::single_callable(
                db,
                Signature::new(
                    Parameters::from_annotation(db, parameters),
                    KnownClass::Object.to_instance(db, &environment),
                ),
            );
            if !forwarder
                .native_type
                .is_assignable_to(db, &environment, accepts)
            {
                return None;
            }
        }
        let mut attrs = match call.argument(forwarder.attrs.as_str()) {
            CheckedArgument::Value {
                expression: _,
                ty: _,
            } => call.dictionary_argument(db, forwarder.attrs.as_str())?,
            CheckedArgument::Omitted => {
                if !forwarder.empty_default {
                    return None;
                }
                super::context::empty_mapping()
            }
            CheckedArgument::Indeterminate => return None,
        };
        let owner = source.program_file(db);
        if owner != call.file() || forwarder.requires_load {
            let model = SemanticModel::new(db, call.file());
            let scope = model.scope(call.call().into())?;
            super::load::loaded_function_at_call(
                db,
                scope.to_scope_id(db, call.file()),
                &call.call().func,
                source,
            )?;
        }
        for (name, sequence_default) in &forwarder.sequence_parameters {
            let sequence = match call.argument(name) {
                CheckedArgument::Omitted => *sequence_default,
                CheckedArgument::Value { ty, expression } => {
                    expression
                        .and_then(factory::literal_sequence_elements)
                        .is_some()
                        || ty
                            .class_specialization(db, &environment)
                            .is_some_and(|(class, _)| {
                                factory::is_sequence_class(db, &environment, Type::from(class))
                            })
                }
                CheckedArgument::Indeterminate => false,
            };
            if !sequence {
                return None;
            }
        }
        let extra = match &forwarder.extra {
            Some(name) => {
                let extra = SemanticModel::new(db, owner).frozen_export_dictionary_items(name)?;
                if ![&attrs, &extra.1].into_iter().all(|mapping| {
                    mapping.is_complete() && mapping.items.iter().all(|item| item.is_required())
                }) {
                    return None;
                }
                let mut items = attrs.items.into_vec();
                items.retain(|item| !extra.1.items.iter().any(|other| other.name == item.name));
                items.extend(extra.1.items.iter().cloned());
                attrs.items = items.into_boxed_slice();
                attrs.first_entry = DictionaryFirstEntry::Unknown;
                Some(extra)
            }
            None => None,
        };
        Some(Self {
            forwarder,
            extra,
            options,
            attrs,
        })
    }

    pub(super) fn option(&self, name: &str) -> CheckedArgument<'a, 'db> {
        self.options
            .iter()
            .find(|(key, _, _)| key.as_str() == name)
            .map_or(CheckedArgument::Omitted, |(_, ty, expression)| {
                CheckedArgument::Value {
                    ty: *ty,
                    expression: *expression,
                }
            })
    }

    pub(super) fn fragments(
        &self,
        db: &'db Database,
        call: &CheckedCall<'a, 'db>,
    ) -> factory::Fragments {
        let argument = match &self.forwarder.fragments {
            None => self.option("fragments"),
            Some(FixedFragments::Source(source)) => return source.clone(),
            Some(FixedFragments::Parameter { name, default }) => {
                let argument = call.argument(name);
                if matches!(argument, CheckedArgument::Omitted) {
                    return default.clone();
                }
                argument
            }
        };
        super::context::fragment_argument(db, call, argument)
    }

    pub(super) fn attribute_owner(&self, name: &Name) -> Option<ProgramFile<'db>> {
        let (file, extra) = self.extra.as_ref()?;
        extra
            .items
            .iter()
            .any(|item| item.name == *name)
            .then_some(*file)
    }
}
