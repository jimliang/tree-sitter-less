package tree_sitter_less_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter-grammars/tree-sitter-less"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_less.Language())
	if language == nil {
		t.Errorf("Error loading LESS grammar")
	}
}
