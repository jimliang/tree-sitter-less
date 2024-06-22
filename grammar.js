/**
 * @file SCSS grammar for tree-sitter
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const CSS = require('tree-sitter-css/grammar');

module.exports = grammar(CSS, {
  name: 'less',

  externals: ($, original) => original.concat([
    $._concat,
  ]),

  rules: {
    _top_level_item: ($, original) => choice(
      original,
      $.plugin_statement,
    ),

    _block_item: ($, original) => choice(
      original,
      $.plugin_statement,
    ),

    // Selectors

    _selector: ($, original) => choice(
      original,
      alias($._concatenated_identifier, $.tag_name),
    ),

    class_selector: $ => prec(1, seq(
      optional($._selector),
      choice('.', $.nesting_selector),
      alias(choice($.identifier, $._concatenated_identifier), $.class_name),
      optional($.parameters), // mixin
    )),

    id_selector: $ => seq(
      optional($._selector),
      '#',
      alias($.identifier, $.id_name),
      optional($.parameters), // mixin
    ),

    pseudo_class_selector: $ => seq(
      optional($._selector),
      alias($._pseudo_class_selector_colon, ':'),
      alias(choice($.identifier, $._concatenated_identifier), $.class_name),
      optional(alias($.pseudo_class_arguments, $.arguments)),
    ),

    // Declarations

    declaration: $ => seq(
      alias(
        choice($.identifier, $.variable, $._concatenated_identifier, $.at_keyword),
        $.property_name,
      ),
      ':',
      $._value,
      repeat(seq(optional(','), $._value)),
      optional($.important),
      ';',
    ),

    // Media queries

    _query: ($, original) => choice(
      original,
      prec(-1, $.interpolation),
    ),

    // Property Values

    _value: ($, original) => choice(
      original,
      $.value_value,
      $.property_value,
      prec(-1, choice(
        $.nesting_selector,
        $._concatenated_identifier,
        $.list_value,
      )),
      $.variable,
    ),

    parameters: $ => seq('(', sep1(',', $.parameter), ')'),

    parameter: $ => seq(
      $.variable,
      optional(seq(
        ':',
        field('default', $._value),
      )),
    ),

    plugin_statement: $ => seq('@plugin', $._value, ';'),

    import_statement: $ => seq(
      '@import',
      optional($._value),
      $._value,
      sep(',', $._query),
      ';',
    ),

    // mixin_expression: $ => seq(
    //   alias($._mixin_name, $.function_name),
    //   optional($.arguments),
    //   ';',
    // ),

    call_expression: $ => seq(
      alias(choice($.identifier, $.plain_value), $.function_name),
      $.arguments,
    ),

    binary_expression: $ => prec.left(seq(
      $._value,
      choice('+', '-', '*', '/', '==', '<', '>', '!=', '<=', '>='),
      $._value,
    )),

    list_value: $ => seq(
      '(',
      sep2(',', $._value),
      ')',
    ),

    interpolation: $ => seq('@{', $._value, '}'),

    _concatenated_identifier: $ => choice(
      seq(
        $.identifier,
        repeat1(seq(
          $._concat,
          choice($.interpolation, $.identifier, alias(token.immediate('-'), $.identifier)),
        )),
      ),
      seq(
        $.interpolation,
        repeat(seq(
          $._concat,
          choice($.interpolation, $.identifier, alias(token.immediate('-'), $.identifier)),
        )),
      ),
    ),

    _mixin_name: $ => /[.#][a-zA-Z0-9-_]+/,

    property_value: $ => seq('$', alias($.identifier, $.property_name)),

    value_value: $ => seq('@@', alias($.identifier, $.property_name)),

    variable: _ => /([a-zA-Z_]+\.)?@[a-zA-Z-_][a-zA-Z0-9-_]*/,
  },
});

/**
 * Creates a rule to optionally match one or more of the rules separated by `separator`
 *
 * @param {RuleOrLiteral} separator
 *
 * @param {RuleOrLiteral} rule
 *
 * @return {ChoiceRule}
 *
 */
function sep(separator, rule) {
  return optional(sep1(separator, rule));
}
/**
 * Creates a rule to match one or more of the rules separated by `separator`
 *
 * @param {RuleOrLiteral} separator
 *
 * @param {RuleOrLiteral} rule
 *
 * @return {SeqRule}
 *
 */
function sep1(separator, rule) {
  return seq(rule, repeat(seq(separator, rule)));
}

/**
 * Creates a rule to match two or more of the rules separated by `separator`
 *
 * @param {RuleOrLiteral} separator
 *
 * @param {RuleOrLiteral} rules
 *
 * @return {SeqRule}
 */
function sep2(separator, rules) {
  return seq(rules, repeat1(seq(separator, rules)));
}
