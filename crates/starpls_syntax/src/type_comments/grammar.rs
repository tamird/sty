use super::marker::CompletedMarker;
use super::Parser;
use crate::syntax_kind::SyntaxKindSet;
use crate::SyntaxKind;
use crate::SyntaxKind::*;
use crate::T;

const LITERAL_START: SyntaxKindSet =
    SyntaxKindSet::new(&[STRING, INT, FLOAT, T![True], T![False], T![+], T![-]]);
const TYPE_START: SyntaxKindSet =
    SyntaxKindSet::new(&[T![ident], T![None], T!['['], T!['{'], ELLIPSIS]).union(LITERAL_START);

const PARAMETER_TYPE_START: SyntaxKindSet = TYPE_START.union(SyntaxKindSet::new(&[T![*], T![**]]));

const EMPTY: SyntaxKindSet = SyntaxKindSet::new(&[]);

pub(crate) fn types(p: &mut Parser, stop: Option<SyntaxKind>) {
    let cond = |p: &mut Parser| match stop {
        Some(stop) => !p.at(EOF) && !p.at(stop),
        None => !p.at(EOF),
    };
    if !cond(p) {
        return;
    }
    union_type(p);
    while cond(p) {
        if !p.eat(T![,]) {
            p.error_recover_until("Expected \",\"", EMPTY);
            break;
        }
        if !cond(p) {
            break;
        }
        if !p.at_kinds(TYPE_START) {
            p.error_recover_until("Expected type", EMPTY);
            break;
        }
        union_type(p);
    }
}

pub(crate) fn parameter_types(p: &mut Parser) {
    parameter_type(p);
    while p.at(T![,]) && PARAMETER_TYPE_START.contains(p.nth(1)) {
        p.bump(T![,]);
        parameter_type(p);
    }
}

pub(crate) fn parameter_type(p: &mut Parser) {
    let m = p.start();
    match p.current() {
        T![*] => {
            p.bump(T![*]);
            union_type(p);
            m.complete(p, ARGS_LIST_PARAMETER_TYPE);
        }
        T![**] => {
            p.bump(T![**]);
            union_type(p);
            m.complete(p, KWARGS_DICT_PARAMETER_TYPE);
        }
        ELLIPSIS => {
            p.bump(ELLIPSIS);
            m.complete(p, SIMPLE_PARAMETER_TYPE);
        }
        kind if TYPE_START.contains(kind) => {
            union_type(p);
            m.complete(p, SIMPLE_PARAMETER_TYPE);
        }
        _ => unreachable!(),
    }
}

pub(crate) fn union_type(p: &mut Parser) {
    let mut m = match type_(p) {
        Some(m) => m,
        None => return,
    };
    let union_marker = if p.at(T![|]) {
        m.precede(p)
    } else {
        return;
    };
    while p.at(T![|]) {
        p.bump(T![|]);
        type_(p);
    }
    union_marker.complete(p, UNION_TYPE);
}

pub(crate) fn type_(p: &mut Parser) -> Option<CompletedMarker> {
    Some(match p.current() {
        T![None] => {
            let m = p.start();
            p.bump(T![None]);
            m.complete(p, NONE_TYPE)
        }
        T![ident] => {
            let m = p.start();
            path_segment(p);
            while p.eat(T![.]) {
                if !p.at(T![ident]) {
                    p.error_recover_until("Expected type segment", EMPTY);
                    return Some(m.complete(p, PATH_TYPE));
                }
                path_segment(p);
            }
            if p.at(T!['[']) {
                let m = p.start();
                p.bump(T!['[']);
                types(p, Some(T![']']));
                p.eat(T![']']);
                m.complete(p, GENERIC_ARGUMENTS);
            }
            m.complete(p, PATH_TYPE)
        }
        T!['('] => function_type(p),
        T!['['] => {
            let m = p.start();
            p.bump(T!['[']);
            types(p, Some(T![']']));
            if !p.eat(T![']']) {
                p.error_recover_until("\"[\" was not closed", EMPTY);
            }
            m.complete(p, TYPE_LIST)
        }
        T!['{'] => type_dict(p),
        ELLIPSIS => {
            let m = p.start();
            p.bump(ELLIPSIS);
            m.complete(p, ELLIPSIS_TYPE)
        }
        kind if LITERAL_START.contains(kind) => {
            let m = p.start();
            p.bump_any();
            if matches!(kind, T![+] | T![-]) {
                if matches!(p.current(), INT | FLOAT) {
                    p.bump_any();
                } else {
                    p.error_recover_until("Expected numeric literal", EMPTY);
                }
            }
            m.complete(p, LITERAL_VALUE)
        }
        _ => {
            p.error_recover_until("Expected type", EMPTY);
            return None;
        }
    })
}

fn type_dict(p: &mut Parser) -> CompletedMarker {
    let m = p.start();
    p.bump(T!['{']);
    let end = SyntaxKindSet::new(&[T!['}']]);
    while !p.at(T!['}']) && !p.at(EOF) {
        if !p.eat(STRING) {
            p.error_recover_until("Expected string key", end);
            break;
        }
        if !p.eat(T![:]) {
            p.error_recover_until("Expected \":\"", end);
            break;
        }
        if !p.at_kinds(TYPE_START) {
            p.error_recover_until("Expected type", end);
            break;
        }
        union_type(p);
        if p.at(T!['}']) {
            break;
        }
        if !p.eat(T![,]) {
            p.error_recover_until("Expected \",\"", end);
            break;
        }
    }
    if !p.eat(T!['}']) {
        p.error("\"{\" was not closed");
    }
    m.complete(p, TYPE_DICT)
}

pub(crate) fn function_type(p: &mut Parser) -> CompletedMarker {
    let m = p.start();
    p.bump(T!['(']);
    if p.at_kinds(PARAMETER_TYPE_START) {
        let m = p.start();
        parameter_types(p);
        m.complete(p, PARAMETER_TYPES);
    }
    if !p.eat(T![')']) {
        p.error_recover_until("\"(\" was not closed", EMPTY);
        return m.complete(p, FUNCTION_TYPE);
    }
    if !p.eat(ARROW) {
        p.error_recover_until("Expected \"->\"", EMPTY);
        return m.complete(p, FUNCTION_TYPE);
    }
    union_type(p);
    m.complete(p, FUNCTION_TYPE)
}

pub(crate) fn path_segment(p: &mut Parser) {
    let m = p.start();
    p.bump(T![ident]);
    m.complete(p, PATH_SEGMENT);
}

pub(crate) fn type_comment_body(p: &mut Parser) {
    let m = p.start();
    match p.current() {
        T![ignore] => {
            let m = p.start();
            // Ty owns suppression codes and malformed-directive diagnostics.
            while !p.at(EOF) {
                p.bump_any();
            }
            m.complete(p, IGNORE_TYPE);
        }
        T!['('] => {
            function_type(p);
        }
        _ => union_type(p),
    }

    // We only parse one type, so if there's any remaining tokens, add them
    // to an error node.
    if !p.at(EOF) {
        p.error_recover_until("Unexpected token", SyntaxKindSet::new(&[]));
    }
    m.complete(p, TYPE_COMMENT_BODY);
}
