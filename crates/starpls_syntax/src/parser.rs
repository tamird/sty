use std::borrow::Cow;
use std::marker::PhantomData;

use rowan::ast::AstNode;
use rowan::GreenNode;
use rowan::GreenNodeBuilder;
use rowan::Language;
use rowan::TextRange;

use crate::type_comments::parse_type_list;
use crate::type_comments::StrStep;
use crate::type_comments::StrWithTokens;
use crate::StarlarkLanguage;
use crate::SyntaxKind::*;
use crate::SyntaxNode;

const TYPE_COMMENT_PREFIX_STR: &str = "# type: ";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SyntaxError {
    pub message: String,
    pub range: TextRange,
}

/// A parsed type-comment tree with ranges local to the comment.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseTree<T> {
    green: GreenNode,
    _ty: PhantomData<fn() -> T>,
}

impl<T> ParseTree<T> {
    fn new(green: GreenNode) -> Self {
        ParseTree {
            green,
            _ty: PhantomData,
        }
    }

    pub fn syntax(&self) -> SyntaxNode {
        SyntaxNode::new_root(self.green.clone())
    }
}

impl<T: AstNode<Language = StarlarkLanguage>> ParseTree<T> {
    pub fn tree(&self) -> T {
        T::cast(self.syntax()).unwrap()
    }
}

fn build_type_comment(
    builder: &mut GreenNodeBuilder,
    text: &str,
    physical: &str,
    text_start: usize,
    errors_sink: &mut dyn FnMut(SyntaxError),
) {
    builder.start_node(StarlarkLanguage::kind_to_raw(TYPE_COMMENT));
    builder.token(
        StarlarkLanguage::kind_to_raw(TYPE_COMMENT_PREFIX),
        TYPE_COMMENT_PREFIX_STR,
    );

    let str_with_tokens = StrWithTokens::new(&text[TYPE_COMMENT_PREFIX_STR.len()..]);
    let output = parse_type_list(&str_with_tokens.to_input());

    let mut cursor = TYPE_COMMENT_PREFIX_STR.len();
    str_with_tokens.build_with_trivia(output, &mut |str_step| match str_step {
        StrStep::Start { kind } => builder.start_node(StarlarkLanguage::kind_to_raw(kind)),
        StrStep::Finish => builder.finish_node(),
        StrStep::Token { kind, text } => {
            let end = cursor + text.len();
            builder.token(StarlarkLanguage::kind_to_raw(kind), &physical[cursor..end]);
            cursor = end;
        }
        StrStep::Error { message, pos } => {
            let offset = ((text_start + TYPE_COMMENT_PREFIX_STR.len()) as u32
                + str_with_tokens.token_pos(pos))
            .into();
            errors_sink(SyntaxError {
                message,
                range: TextRange::new(offset, offset),
            })
        }
    });

    builder.finish_node();
}

/// A type comment has its own small syntax tree; its ranges are relative to the
/// comment, while `range` locates it in the source file.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TypeComment {
    pub range: ruff_text_size::TextRange,
    pub parsed: ParseTree<crate::ast::TypeComment>,
}

pub fn parse_type_comments(
    source: &str,
    tokens: &ruff_python_ast::token::Tokens,
    errors: &mut dyn FnMut(SyntaxError),
) -> Vec<TypeComment> {
    use ruff_text_size::Ranged;
    tokens
        .iter()
        .filter_map(|token| {
            if token.kind() != ruff_python_ast::token::TokenKind::Comment {
                return None;
            }
            let text = &source[token.range()];
            if !text.starts_with(TYPE_COMMENT_PREFIX_STR) {
                return None;
            }
            let start = token.start().to_usize();
            let mut range = token.range();
            let mut text = Cow::Borrowed(text);
            if let Some(indent) = indentation(source, start) {
                let (projected, end, _) = crate::comment_alias::logical_comment(
                    &source[start..],
                    indent,
                    TYPE_COMMENT_PREFIX_STR,
                    "        ",
                );
                let end = projected[..end].trim_end_matches(['\r', '\n']).len();
                if end > text.len() {
                    range = ruff_text_size::TextRange::at(token.start(), end.try_into().unwrap());
                    text = Cow::Owned(projected[..end].to_owned());
                }
            }
            let mut builder = GreenNodeBuilder::new();
            build_type_comment(&mut builder, &text, &source[range], start, errors);
            Some(TypeComment {
                range,
                parsed: ParseTree::new(builder.finish()),
            })
        })
        .collect()
}

/// Whitespace before an item that begins its physical line.
pub fn indentation(source: &str, offset: usize) -> Option<&str> {
    let line = source[..offset].rsplit(['\r', '\n']).next()?;
    line.bytes()
        .all(|byte| matches!(byte, b' ' | b'\t'))
        .then_some(line)
}

/// Parse a detached annotation using offsets in the physical Starlark file.
pub fn parse_annotation(
    source: &str,
    range: ruff_text_size::TextRange,
    options: ruff_python_parser::ParseOptions,
) -> Result<
    ruff_python_parser::Parsed<ruff_python_ast::ModExpression>,
    ruff_python_parser::ParseError,
> {
    use ruff_python_parser::parse_expression_range_with_options;
    let mut projected = None;
    let mut offset = range.start().to_usize();
    for line in source[range].split_inclusive(['\r', '\n']) {
        if offset != range.start().to_usize() {
            let trimmed = line.trim_start_matches([' ', '\t']);
            if trimmed.starts_with('#') {
                let marker = offset + line.len() - trimmed.len();
                let text =
                    projected.get_or_insert_with(|| source[..range.end().to_usize()].to_owned());
                text.replace_range(marker..marker + 1, " ");
            }
        }
        offset += line.len();
    }
    parse_expression_range_with_options(projected.as_deref().unwrap_or(source), range, options)
}
