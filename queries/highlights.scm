[
  "@import"
] @keyword

(js_comment) @comment @spell

(function_name) @function

[
  ">="
  "<="
] @operator

(function_statement
  (parameters
    (parameter) @variable.parameter))

(plain_value) @string

(keyword_query) @function

(identifier) @variable

(variable) @variable

(argument) @variable.parameter

(arguments
  (variable) @variable.parameter)

[
  "["
  "]"
] @punctuation.bracket

(import_statement
  (identifier) @function)
