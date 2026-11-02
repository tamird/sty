//! Parse a commented-out type alias as a normal declaration in the same module.
//! All token and diagnostic offsets still refer to the original source.

use ruff_python_ast::token::TokenKind;
use ruff_python_ast::ModModule;
use ruff_python_parser::lexer::lex;
use ruff_python_parser::parse_cells_unchecked;
use ruff_python_parser::parse_unchecked;
use ruff_python_parser::Mode;
use ruff_python_parser::ParseOptions;
use ruff_python_parser::Parsed;
use ruff_text_size::Ranged;
use ruff_text_size::TextRange;
use ruff_text_size::TextSize;

const PREFIX: &str = "# type ";

pub(crate) fn is_alias(source: &str, range: TextRange) -> bool {
    source[range.start().to_usize()..].starts_with(PREFIX)
}

pub fn parse_module(source: &str, options: ParseOptions) -> Parsed<ModModule> {
    let parsed = parse_unchecked(source, options.clone())
        .try_into_module()
        .expect("expected a module");
    if !source.contains(PREFIX) {
        return parsed;
    }

    let mut projected = None;
    let mut cells = Vec::new();
    let mut cursor = TextSize::default();
    for token in parsed
        .tokens()
        .iter()
        .filter(|t| t.kind() == TokenKind::Comment)
    {
        let start = token.start();
        if start < cursor || !is_alias(source, token.range()) {
            continue;
        }
        let start_byte = start.to_usize();
        if start_byte > 0 && !matches!(source.as_bytes()[start_byte - 1], b'\n' | b'\r') {
            continue;
        }
        // A comment can start at column zero even inside an expression or function.
        let body = &parsed.syntax().body;
        let next = body.partition_point(|statement| statement.end() <= start);
        if body.get(next).is_some_and(|s| s.range().contains(start)) {
            continue;
        }
        let header = &source[token.range()][PREFIX.len()..];
        let mut header = lex(header, Mode::Module);
        let name = header.next_token();
        if !(name == TokenKind::Identifier || name.is_soft_keyword())
            || !matches!(header.next_token(), TokenKind::Equal | TokenKind::Lsqb)
        {
            continue;
        }
        let (text, bytes) = alias_text(&source[start_byte..]);
        let end = start + TextSize::try_from(bytes).unwrap();
        let projected = projected.get_or_insert_with(|| source.to_owned());
        projected.replace_range(start_byte..end.to_usize(), &text[..bytes]);
        if cursor < start {
            cells.push(TextRange::new(cursor, start));
        }
        cells.push(TextRange::new(start, end));
        cursor = end;
    }
    let Some(mut projected) = projected else {
        return parsed;
    };
    let end = TextSize::of(source);
    if cursor < end {
        cells.push(TextRange::new(cursor, end));
    }
    // An unterminated alias must not consume the next Starlark statement in recovery.
    for cell in &mut cells {
        if cell.end() < end {
            // Ruff requires an LF between cells. Normalize a lone CR only there.
            let newline = cell.end() - TextSize::new(1);
            let separator = TextRange::new(newline, cell.end());
            if &projected[separator] == "\r" {
                projected.replace_range(newline.to_usize()..cell.end().to_usize(), "\n");
            }
            *cell = TextRange::new(cell.start(), newline);
        }
    }
    parse_cells_unchecked(&projected, cells, &options)
}

/// Unwrap one logical statement; normal comments after its closing delimiter stay comments.
fn alias_text(source: &str) -> (String, usize) {
    let mut lines = source.split_inclusive(['\r', '\n']);
    let mut text = String::from(lines.next().unwrap());
    text.replace_range(..PREFIX.len(), "type   ");
    for line in lines {
        if line == "\n" && text.ends_with('\r') {
            text.push('\n');
            continue;
        }
        let Some(rest) = line.strip_prefix('#') else {
            break;
        };
        if line.starts_with(PREFIX) {
            break;
        }
        text.push(' ');
        text.push_str(rest);
    }
    let mut lexer = lex(&text, Mode::Module);
    let (end, semi) = loop {
        match lexer.next_token() {
            TokenKind::Newline => break (lexer.current_range().end().to_usize(), None),
            TokenKind::EndOfFile => break (text.len(), None),
            // The directive declares one type. Its trailing text cannot introduce runtime names.
            TokenKind::Semi => {
                let semi = lexer.current_range().start().to_usize();
                let end = text[semi..].find(['\n', '\r']).map_or(text.len(), |i| {
                    let newline = semi + i;
                    newline
                        + if text[newline..].starts_with("\r\n") {
                            2
                        } else {
                            1
                        }
                });
                break (end, Some(semi));
            }
            _ => {}
        }
    };
    if let Some(semi) = semi {
        text.replace_range(semi..semi + 1, "#");
    }
    (text, end)
}

#[cfg(test)]
mod tests {
    use ruff_python_ast::PySourceType;
    use ruff_python_ast::Stmt;
    use ruff_python_parser::ParseOptions;
    use ruff_text_size::Ranged;

    use super::parse_module;

    #[test]
    fn aliases_only_between_module_statements() {
        let source = "\
text = '''
# type String = str
'''
items = [
# type InsideList = int
]
def f():
    a = 1
# type InsideFunction = int
    b = 2
# type Row = dict[{
#     'é': str,
# }]
# existing prose after the alias
# type match = list[Row]
# type of ordinary prose
";
        for text in [
            source.to_owned(),
            source.replace('\n', "\r\n"),
            source.replace('\n', "\r"),
        ] {
            let parsed = parse_module(&text, ParseOptions::from(PySourceType::Python));
            assert!(parsed.has_valid_syntax(), "{:?}", parsed.errors());
            let found: Vec<_> = parsed
                .syntax()
                .body
                .iter()
                .filter_map(|s| {
                    let Stmt::TypeAlias(alias) = s else {
                        return None;
                    };
                    Some((&text[alias.name.range()], &text[alias.value.range()]))
                })
                .collect();
            assert_eq!(found.len(), 2);
            assert_eq!(found[0].0, "Row");
            assert!(found[0].1.contains("'é': str"));
            assert_eq!(found[1], ("match", "list[Row]"));
        }
    }

    #[test]
    fn malformed_alias_cannot_hide_later_code() {
        for source in [
            "# type Row = list[\nreal = 1\n",
            "# type Row = list[\n# type Other = int\nreal = 1\n",
            "# type Row = list[\n# ] + (\r\nreal = 1\r\n",
        ] {
            let parsed = parse_module(source, ParseOptions::from(PySourceType::Python));
            assert!(!parsed.has_valid_syntax());
            assert!(matches!(parsed.syntax().body.last(), Some(Stmt::Assign(_))));
        }
        let source = "# type Row = int; sneaky = 3\nreal = 1";
        let parsed = parse_module(source, ParseOptions::from(PySourceType::Python));
        assert_eq!(parsed.syntax().body.len(), 2);
        assert_eq!(&source[parsed.syntax().body[1].range()], "real = 1");
    }
}
