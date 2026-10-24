//! Source functions that return a single native rule registration.

use ruff_python_ast::name::Name;
use ruff_python_ast::Expr;
use ruff_python_ast::Stmt;
use ty_python_core::definition::Definition;
use ty_python_core::definition::DefinitionKind;
use ty_python_core::global_scope;
use ty_python_core::place_table;
use ty_python_core::scope::NodeWithScopeKind;
use ty_python_semantic::provided::BuiltinUsage;
use ty_python_semantic::types::CheckedArgument;
use ty_python_semantic::types::CheckedCall;
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
pub(super) struct ForwardedRule<'db> {
    pub(super) native: Definition<'db>,
    pub(super) implementation: Name,
    native_type: Type<'db>,
    supplied: Box<[Name]>,
    attrs: Name,
    empty_default: bool,
    parameters: Box<[Name]>,
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
    let attrs = parameter(&call.arguments.find_keyword("attrs")?.value)?;
    if attrs.parameter.name == implementation.parameter.name {
        return None;
    }
    let mut variadic = None;
    for keyword in &call.arguments.keywords {
        match keyword.arg.as_ref().map(|arg| arg.as_str()) {
            Some("implementation" | "attrs") => {}
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
    Some(ForwardedRule {
        native,
        native_type,
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
    })
}

pub(super) struct BoundRule<'a, 'db> {
    pub(super) forwarder: &'db ForwardedRule<'db>,
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
        let attrs = match call.argument(forwarder.attrs.as_str()) {
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
        if owner != call.file() {
            let model = SemanticModel::new(db, call.file());
            let scope = model.scope(call.call().into())?;
            super::load::loaded_function_at_call(
                db,
                scope.to_scope_id(db, call.file()),
                &call.call().func,
                source,
            )?;
        }
        Some(Self {
            forwarder,
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
}
