//! Known instances preceding a direct BUILD call to a package-reflection macro.
//! Other possible package writers are represented by the ambient native row.
use ruff_python_ast::name::Name;
use ruff_python_ast::visitor;
use ruff_python_ast::visitor::Visitor;
use ruff_python_ast::CmpOp;
use ruff_python_ast::Expr;
use ruff_python_ast::ExprCall;
use ruff_python_ast::Stmt;
use ruff_text_size::Ranged;
use ruff_text_size::TextRange;
use rustc_hash::FxHashSet;
use starpls_bazel::APIContext;
use ty_python_core::definition::Definition;
use ty_python_core::definition::DefinitionKind;
use ty_python_core::global_scope;
use ty_python_core::ProgramFile;
use ty_python_semantic::types::ide_support::definitions_for_name;
use ty_python_semantic::types::Type;
use ty_python_semantic::types::TypeDefinition;
use ty_python_semantic::HasType;
use ty_python_semantic::ImportAliasResolution;
use ty_python_semantic::SemanticModel;

use super::factory;
use super::factory::BuiltinFunction;
use super::factory::RuleData;
use super::interface::Db;
use super::providers;

#[derive(Clone, Debug, Eq, PartialEq, Hash, salsa::SalsaValue)]
pub(crate) struct RuleOrigin<'db> {
    pub(crate) name: Name,
    pub(crate) declaration: Definition<'db>,
    pub(crate) rule: Type<'db>,
    pub(crate) plain_arguments: Vec<Name>,
}

#[derive(Clone, Debug, Eq, PartialEq, salsa::SalsaValue)]
pub(crate) struct DirectConsumer<'db> {
    pub(crate) call: TextRange,
    pub(crate) function: Definition<'db>,
    pub(crate) origins: Vec<RuleOrigin<'db>>,
}

/// Avoid inspecting rule producers in a package unless one of its direct
/// macro invocations reads the package. Several such reads share one prefix.
#[salsa::tracked(returns(ref))]
pub(crate) fn direct_consumers<'db>(
    db: &'db dyn Db,
    build: ProgramFile<'db>,
) -> Vec<DirectConsumer<'db>> {
    if db.starlark_file(build).and_then(|s| s.api_context()) != Some(APIContext::Build) {
        return Vec::new();
    }
    let parsed = ruff_db::parsed::parsed_module(db, build.python_file(db)).load(db);
    if parsed.has_syntax_errors() {
        return Vec::new();
    }
    let mut calls = Vec::new();
    let mut last = None;
    for stmt in parsed.suite() {
        if stops(stmt) {
            break;
        }
        let Some(call) = statement_call(stmt) else {
            continue;
        };
        let Some(decl) =
            providers::resolve_declaration(db, build, &call.func, &mut FxHashSet::default())
        else {
            continue;
        };
        let reads = !read_ranges(db, decl).is_empty();
        if reads {
            last = Some(calls.len())
        }
        calls.push((call, decl, reads));
    }
    let mut consumers = Vec::new();
    let mut origins = Vec::new();
    if let Some(last) = last {
        for (index, (call, decl, reads)) in calls[..=last].iter().enumerate() {
            if *reads {
                consumers.push(DirectConsumer {
                    call: call.func.range(),
                    function: *decl,
                    origins: origins.clone(),
                });
            }
            if index < last {
                collect_call(db, call, *decl, &mut origins);
            }
        }
    }
    consumers
}

pub(crate) fn read_ranges<'db>(db: &'db dyn Db, function: Definition<'db>) -> &'db [TextRange] {
    &direct_reads(db, function).0
}

#[derive(Clone, Debug, Default, Eq, PartialEq, salsa::SalsaValue)]
struct ReadRanges(Vec<TextRange>);

#[salsa::tracked(returns(ref))]
fn direct_reads<'db>(db: &'db dyn Db, function: Definition<'db>) -> ReadRanges {
    let mut reads = ReadRanges::default();
    let file = function.program_file(db);
    let DefinitionKind::Function(f) = function.kind(db) else {
        return reads;
    };
    if db
        .starlark_file(file)
        .is_none_or(|s| s.is_type_interface(db))
        || file.file(db).path(db).as_system_path().is_none()
    {
        return reads;
    }
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    if parsed.has_syntax_errors() {
        return reads;
    }
    let model = SemanticModel::new(db, file);
    for stmt in &f.node(&parsed).body {
        if let Stmt::For(loop_) = stmt {
            if let Some(range) = checked_loop(&model, loop_) {
                reads.0.push(range);
            }
        }
        if stops(stmt) {
            break;
        }
    }
    reads
}

/// A producer supplies evidence only for a traversal which visits every row.
/// Reaching a read through a break, a callback or a loop-carried value depends
/// on more than the declarations in BUILD.
fn checked_loop(model: &SemanticModel, loop_: &ruff_python_ast::StmtFor) -> Option<TextRange> {
    let row = &loop_.target.as_name_expr()?.id;
    let values = loop_.iter.as_call_expr()?;
    let method = values.func.as_attribute_expr()?;
    if method.attr.as_str() != "values" || !values.arguments.is_empty() {
        return None;
    }
    let read = method.value.as_call_expr()?;
    let db = model.db();
    let TypeDefinition::Function(decl) = read
        .func
        .inferred_type(model)?
        .definition(db, &model.program_environment())?
    else {
        return None;
    };
    if factory::declaration(db, decl) != Some(BuiltinFunction::ExistingRules) {
        return None;
    }
    #[derive(Default)]
    struct LeavesIteration(bool);
    impl<'a> Visitor<'a> for LeavesIteration {
        fn visit_stmt(&mut self, s: &'a Stmt) {
            match s {
                Stmt::Break(_)
                | Stmt::Continue(_)
                | Stmt::Return(_)
                | Stmt::For(_)
                | Stmt::While(_)
                | Stmt::FunctionDef(_) => self.0 = true,
                _ => visitor::walk_stmt(self, s),
            }
        }
        fn visit_expr(&mut self, expr: &'a Expr) {
            // fail() can stop before a later rule reaches the reader.
            if expr.as_call_expr().is_some_and(|call| {
                call.func
                    .as_name_expr()
                    .is_some_and(|name| name.id == "fail")
            }) {
                self.0 = true;
            } else {
                visitor::walk_expr(self, expr);
            }
        }
    }
    let mut leaves = LeavesIteration::default();
    leaves.visit_body(&loop_.body);
    if leaves.0 {
        return None;
    }
    let mut locals = FxHashSet::from_iter([row.clone()]);
    let mut body = loop_.body.as_slice();
    let mut end = None;
    'guard: loop {
        for stmt in body {
            match stmt {
                Stmt::Assign(s) if row_expression(&s.value, &locals) => {
                    let [target] = s.targets.as_slice() else {
                        break 'guard;
                    };
                    let Some(name) = target.as_name_expr() else {
                        break 'guard;
                    };
                    if name.id == *row {
                        break 'guard;
                    }
                    locals.insert(name.id.clone());
                }
                Stmt::Expr(s) if row_expression(&s.value, &locals) => {}
                Stmt::If(s) if row_expression(&s.test, &locals) => {
                    end = Some(s.test.end());
                    // ty can eliminate whole producer rows at these guards.
                    // Other row-dependent tests execute, but their bodies may
                    // not: check the test and stop before either branch.
                    if !discriminates(&s.test, row) {
                        break 'guard;
                    }
                    body = &s.body;
                    continue 'guard;
                }
                Stmt::Pass(_) => {}
                _ => break 'guard,
            }
            end = Some(stmt.end());
        }
        break;
    }
    Some(TextRange::new(read.start(), end?))
}

fn row_expression(expr: &Expr, locals: &FxHashSet<Name>) -> bool {
    let local = |e: &Expr| row_expression(e, locals);
    match expr {
        Expr::Name(name) => locals.contains(&name.id),
        Expr::Attribute(field) => local(&field.value),
        Expr::Subscript(field) => local(&field.value) && local(&field.slice),
        Expr::Compare(cmp) => cmp.ops.len() == 1 && cmp.operands.iter().all(local),
        Expr::Call(call) => {
            local(&call.func)
                && call.arguments.args.iter().all(local)
                && call
                    .arguments
                    .keywords
                    .iter()
                    .all(|kw| kw.arg.is_some() && local(&kw.value))
        }
        _ => expr.is_literal_expr(),
    }
}

fn discriminates(expr: &Expr, row: &Name) -> bool {
    let Some(cmp) = expr.as_compare_expr() else {
        return false;
    };
    let [Expr::Subscript(field), Expr::StringLiteral(_)] = cmp.operands.as_ref() else {
        return false;
    };
    cmp.ops.as_ref() == [CmpOp::Eq]
        && field.value.as_name_expr().is_some_and(|n| n.id == *row)
        && field
            .slice
            .as_string_literal_expr()
            .is_some_and(|s| s.value.to_str() == "kind")
}

fn statement_call(stmt: &Stmt) -> Option<&ExprCall> {
    match stmt {
        Stmt::Expr(s) => s.value.as_call_expr(),
        Stmt::Assign(s) => s.value.as_call_expr(),
        _ => None,
    }
}

/// Do not witness a statement that a return may skip. A nested function's
/// return belongs to that function.
fn stops(stmt: &Stmt) -> bool {
    #[derive(Default)]
    struct Return(bool);
    impl<'a> Visitor<'a> for Return {
        fn visit_expr(&mut self, _: &'a Expr) {}
        fn visit_stmt(&mut self, s: &'a Stmt) {
            match s {
                Stmt::Return(_) => self.0 = true,
                Stmt::FunctionDef(_) => {}
                _ => visitor::walk_stmt(self, s),
            }
        }
    }
    if statement_call(stmt).is_some_and(|c| c.func.as_name_expr().is_some_and(|n| n.id == "fail")) {
        return true;
    }
    let mut ret = Return::default();
    ret.visit_stmt(stmt);
    ret.0
}

fn collect_call<'db>(
    db: &'db dyn Db,
    call: &ExprCall,
    decl: Definition<'db>,
    origins: &mut Vec<RuleOrigin<'db>>,
) {
    let file = decl.program_file(db);
    if db
        .starlark_file(file)
        .is_none_or(|s| s.is_type_interface(db))
        || file.file(db).path(db).as_system_path().is_none()
    {
        return;
    }
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    if parsed.has_syntax_errors() {
        return;
    }
    match decl.kind(db) {
        DefinitionKind::Function(f) => {
            let mut defaults = Vec::new();
            if !call.arguments.keywords.iter().any(|k| k.arg.is_none()) {
                for parameter in &f.node(&parsed).parameters.kwonlyargs {
                    let Some(default) = parameter.default() else {
                        continue;
                    };
                    let name = parameter.name();
                    let value = call
                        .arguments
                        .find_keyword(name)
                        .map_or(default, |kw| &kw.value);
                    if let Some(s) = value.as_string_literal_expr() {
                        defaults.push((name.id.clone(), s.value.to_str().to_owned()));
                    }
                }
            }
            for origin in producers(db, decl, defaults) {
                if !origins.contains(origin) {
                    origins.push(origin.clone())
                }
            }
        }
        DefinitionKind::Assignment(a)
            if decl.scope(db) == global_scope(db, file) && a.unpack().is_none() =>
        {
            let Some(name) = a.target(&parsed).as_name_expr() else {
                return;
            };
            let Some(registration) = a.value(&parsed).as_call_expr() else {
                return;
            };
            let Some(constructor) = providers::resolve_function(
                db,
                file,
                &registration.func,
                &mut FxHashSet::default(),
            ) else {
                return;
            };
            if factory::declaration(db, constructor)
                != Some(BuiltinFunction::Rule { repository: false })
            {
                return;
            }
            let model = SemanticModel::new(db, file);
            let Some(rule) = a.value(&parsed).inferred_type(&model) else {
                return;
            };
            if !rule
                .provided_data(db, &model.program_environment())
                .is_some_and(|d| d.downcast_ref::<RuleData>().is_some())
            {
                return;
            }
            let mut plain_arguments: Vec<_> = call
                .arguments
                .keywords
                .iter()
                .filter(|kw| kw.value.is_literal_expr())
                .filter_map(|kw| kw.arg.as_ref().map(|a| a.id.clone()))
                .collect();
            plain_arguments.sort_unstable();
            let origin = RuleOrigin {
                name: name.id.clone(),
                declaration: decl,
                rule,
                plain_arguments,
            };
            if !origins.contains(&origin) {
                origins.push(origin);
            }
        }
        _ => {}
    }
}

/// Keep simple keyword-only dispatch precise without interpreting a macro.
/// A reassignment, an unpacked keyword mapping, or an unknown argument cannot
/// witness the guarded producer.
#[salsa::tracked(returns(ref),cycle_result=|_,_,_,_|Vec::new())]
fn producers<'db>(
    db: &'db dyn Db,
    function: Definition<'db>,
    defaults: Vec<(Name, String)>,
) -> Vec<RuleOrigin<'db>> {
    let file = function.program_file(db);
    let DefinitionKind::Function(f) = function.kind(db) else {
        return Vec::new();
    };
    let parsed = ruff_db::parsed::parsed_module(db, file.python_file(db)).load(db);
    let model = SemanticModel::new(db, file);
    let mut origins = Vec::new();
    let mut record = |s: &Stmt| {
        let call = statement_call(s)?;
        let decl = providers::resolve_declaration(db, file, &call.func, &mut FxHashSet::default())?;
        collect_call(db, call, decl, &mut origins);
        Some(())
    };
    for stmt in &f.node(&parsed).body {
        if let Stmt::If(branch) = stmt {
            if guard_matches(db, &model, &branch.test, &defaults) {
                for inner in &branch.body {
                    if stops(inner) {
                        break;
                    }
                    record(inner);
                }
            }
        } else {
            record(stmt);
        }
        if stops(stmt) {
            break;
        }
    }
    origins
}

fn guard_matches(
    db: &dyn Db,
    model: &SemanticModel,
    expr: &Expr,
    defaults: &[(Name, String)],
) -> bool {
    let Some(cmp) = expr.as_compare_expr() else {
        return false;
    };
    let [Expr::Name(n), Expr::StringLiteral(s)] = cmp.operands.as_ref() else {
        return false;
    };
    if cmp.ops.as_ref() != [CmpOp::Eq]
        || !defaults
            .iter()
            .any(|(key, value)| *key == n.id && value == s.value.to_str())
    {
        return false;
    }
    let defs = definitions_for_name(
        model,
        &n.id,
        n.into(),
        ImportAliasResolution::PreserveAliases,
    );
    matches!(defs.as_slice(), [d] if d.definition().is_some_and(|d|matches!(d.kind(db),DefinitionKind::Parameter(_))))
}

#[cfg(test)]
mod tests {
    use ruff_text_size::TextSize;
    use starpls_common::Dialect;
    use starpls_common::FileInfo;
    use starpls_hir::Fixture;

    use super::*;
    use crate::Analysis;

    #[test]
    fn direct_consumers_receive_only_preceding_witnesses() {
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
        let db = &mut analysis.db;
        for (name, attr) in [("a.bzl", "string"), ("b.bzl", "int")] {
            fixture.add_file(db,name,&format!("def impl(ctx): pass\nwidget = rule(implementation=impl, attrs={{'x':attr.{attr}()}})\n"));
        }
        let source = "load('a.bzl', first = 'widget')
load('b.bzl', second = 'widget')
read = native.existing_rules
def report():
    for r in read().values(): pass
def format_rule(*, mode='text'):
    if mode == 'text':
        first(name='a', x='plain')
def wrapper():
    format_rule()
def conditional(flag):
    if flag:
        second(name='fake')
    [second(name='fake2') for x in []]
def early_return(flag):
    if flag: return
    second(name='fake3')
def rebound(*, mode='text'):
    mode='other'
    if mode=='text': second(name='fake4')
def dead():
    return
    second(name='fake5')
def abort():
    fail('stop')
    second(name='fake6')
def consume_indirectly():
    report()
";
        fixture.add_file(db, "helpers.bzl", source);
        let text="load('helpers.bzl','format_rule','wrapper','conditional','early_return','rebound','dead','abort','consume_indirectly', tell='report')
load('b.bzl', different='widget')
conditional(False)
early_return(True)
dead()
rebound()
format_rule(mode='other')
format_rule(**options)
consume_indirectly()
tell()
wrapper()
tell()
different(name='b',x=42)
tell()
";
        let build = fixture.add_file_with_options(
            db,
            "BUILD",
            text,
            Dialect::Bazel,
            Some(FileInfo::Bazel {
                api_context: APIContext::Build,
                is_external: false,
                bundled_cc_common: false,
            }),
        );
        loader.add_files_from_fixture(&fixture);
        let reads = direct_consumers(db, db.starlark_program_file(build));
        assert_eq!(reads.len(), 3, "{reads:?}");
        for site in reads {
            assert_eq!(&text[site.call], "tell");
        }
        assert_eq!(
            read_ranges(db, reads[0].function)
                .iter()
                .map(Ranged::start)
                .collect::<Vec<_>>(),
            [TextSize::try_from(source.find("read().values()").unwrap()).unwrap()]
        );
        assert!(reads[0].origins.is_empty());
        assert_eq!(reads[1].origins.len(), 1);
        let both = &reads[2].origins;
        assert_eq!(both.len(), 2);
        assert_eq!(both[0], reads[1].origins[0]);
        assert!(both.iter().all(|r| r.name == "widget"
            && r.plain_arguments.as_slice() == [Name::new_static("name"), Name::new_static("x")]));
        assert_ne!(both[0].declaration, both[1].declaration);
        assert_ne!(both[0].rule, both[1].rule);
    }
}
