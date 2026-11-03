use std::cell::RefCell;
use std::collections::BTreeMap;

use ruff_python_ast::token::TokenKind;
use ruff_python_ast::token::Tokens;
use ruff_python_ast::visitor::transformer;
use ruff_python_ast::visitor::transformer::Transformer;
use ruff_python_ast::Expr;
use ruff_python_ast::ModModule;
use ruff_python_ast::Stmt;
use ruff_python_ast::TypeParams;
use ruff_python_parser::ParseError;
use ruff_python_parser::ParseErrorType;
use ruff_python_parser::ParseOptions;
use ruff_python_parser::Parsed;
use ruff_text_size::Ranged;
use ruff_text_size::TextSize;

use crate::parser::comment_source;
use crate::parser::parse_type_comments;
use crate::parser::TypeComment;

pub fn parse_module(source: &str, options: ParseOptions) -> Parsed<ModModule> {
    let mut parsed = crate::comment_alias::parse_module(source, options.clone());
    if !parsed.tokens().iter().any(|token| {
        token.kind() == TokenKind::Comment
            && source[token.range()]
                .strip_prefix("# type: ")
                .is_some_and(|text| text.trim_start().starts_with('['))
    }) {
        return parsed;
    }
    parsed.transform_suite(|suite, tokens| bind(source, options, suite, tokens));
    parsed
}

fn bind(
    source: &str,
    options: ParseOptions,
    suite: &mut [Stmt],
    tokens: &Tokens,
) -> Vec<ParseError> {
    // The syntax query reports errors in the parameter and return annotations.
    let comments = parse_type_comments(source, tokens, &mut |_| {});
    let mut pending = BTreeMap::new();
    let mut errors = Vec::new();
    for comment in &comments {
        let Some(params) = comment
            .parsed
            .tree()
            .body()
            .and_then(|body| body.type_parameters())
        else {
            continue;
        };
        let range = comment.source_range(&params);
        match ruff_python_parser::parse_type_params_range(
            &comment_source(source, range),
            range,
            options.clone(),
        ) {
            Ok(params) => {
                pending.insert(comment.range.start(), params.into_syntax());
            }
            Err(error) => errors.push(error),
        }
    }
    let visitor = BindParameters {
        comments: &comments,
        tokens,
        pending: RefCell::new(pending),
        errors: RefCell::new(errors),
    };
    visitor.visit_body(suite);
    let mut errors = visitor.errors.into_inner();
    errors.extend(
        visitor
            .pending
            .into_inner()
            .into_values()
            .map(|params| ParseError {
                error: ParseErrorType::OtherError(
                    "A generic signature comment must precede the first statement in a function"
                        .into(),
                ),
                location: params.range,
            }),
    );
    errors
}

struct BindParameters<'a> {
    comments: &'a [TypeComment],
    tokens: &'a Tokens,
    pending: RefCell<BTreeMap<TextSize, TypeParams>>,
    errors: RefCell<Vec<ParseError>>,
}

impl Transformer for BindParameters<'_> {
    fn visit_stmt(&self, stmt: &mut Stmt) {
        if let Stmt::FunctionDef(function) = stmt {
            if let Some(comment) = TypeComment::for_function(self.comments, self.tokens, function) {
                if let Some(params) = self.pending.borrow_mut().remove(&comment.range.start()) {
                    if function.type_params.is_some() {
                        self.errors.borrow_mut().push(ParseError {
                            error: ParseErrorType::OtherError(
                                "This function already declares type parameters".into(),
                            ),
                            location: params.range,
                        });
                    } else {
                        function.type_params = Some(Box::new(params));
                    }
                }
            }
        }
        stacker::maybe_grow(32 * 1024, 1024 * 1024, || {
            transformer::walk_stmt(self, stmt)
        });
    }

    fn visit_expr(&self, _: &mut Expr) {}
}
