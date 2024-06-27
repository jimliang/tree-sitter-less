#include "tree_sitter/parser.h"

#include <wctype.h>

enum TokenType {
    DESCENDANT_OP,
    PSEUDO_CLASS_SELECTOR_COLON,
    ERROR_RECOVERY,
    CONCAT,
};

static inline void advance(TSLexer *lexer) { lexer->advance(lexer, false); }

static inline void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

void *tree_sitter_less_external_scanner_create() { return NULL; }

void tree_sitter_less_external_scanner_destroy(void *payload) {}

void tree_sitter_less_external_scanner_reset(void *payload) {}

unsigned tree_sitter_less_external_scanner_serialize(void *payload, char *buffer) { return 0; }

void tree_sitter_less_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {}

bool tree_sitter_less_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
    if (valid_symbols[ERROR_RECOVERY]) {
        return false;
    }

    if (valid_symbols[CONCAT]) {
        if (iswalnum(lexer->lookahead) || lexer->lookahead == '@' || lexer->lookahead == '-') {
            lexer->result_symbol = CONCAT;
            if (lexer->lookahead == '@') {
                lexer->mark_end(lexer);
                advance(lexer);
                return lexer->lookahead == '{';
            }
            return true;
        }
    }

    if (iswspace(lexer->lookahead) && valid_symbols[DESCENDANT_OP]) {
        lexer->result_symbol = DESCENDANT_OP;

        skip(lexer);
        while (iswspace(lexer->lookahead)) {
            skip(lexer);
        }
        lexer->mark_end(lexer);

        if (lexer->lookahead == '#' || lexer->lookahead == '.' || lexer->lookahead == '[' || lexer->lookahead == '-' ||
            lexer->lookahead == '*' || lexer->lookahead == '&' || iswalnum(lexer->lookahead)) {
            return true;
        }

        if (lexer->lookahead == ':') {
            advance(lexer);
            if (iswspace(lexer->lookahead)) {
                return false;
            }
            for (;;) {
                if (lexer->lookahead == ';' || lexer->lookahead == '}' || lexer->eof(lexer)) {
                    return false;
                }
                if (lexer->lookahead == '{') {
                    return true;
                }
                advance(lexer);
            }
        }
    }

    if (valid_symbols[PSEUDO_CLASS_SELECTOR_COLON]) {
        while (iswspace(lexer->lookahead)) {
            skip(lexer);
        }
        if (lexer->lookahead == ':') {
            advance(lexer);
            if (lexer->lookahead == ':') {
                return false;
            }
            lexer->mark_end(lexer);
            // We need a { to be a pseudo class selector, a ; indicates a property
            while (lexer->lookahead != ';' && lexer->lookahead != '}' && lexer->lookahead != '$' && lexer->lookahead != '"' && !lexer->eof(lexer)) {
                advance(lexer);
                if (lexer->lookahead == '{') {
                    lexer->result_symbol = PSEUDO_CLASS_SELECTOR_COLON;
                    return true;
                }
            }
            return false;
        }
    }

    return false;
}
