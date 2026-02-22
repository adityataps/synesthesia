"""Tokenizes phrases using DistilBERT's vocabulary.

BERT uses WordPiece sub-word tokenization, producing tokens like
``["ce", "##rule", "##an", "dreams"]``. For human annotation we merge those
back into whole words so the user sees ``["cerulean", "dreams"]``.  The
training pipeline can re-tokenize with the same model to recover the exact
sub-word alignment.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from transformers import PreTrainedTokenizerFast

_MODEL_NAME = "distilbert-base-uncased"
_tokenizer: "PreTrainedTokenizerFast | None" = None


def _get_tokenizer() -> "PreTrainedTokenizerFast":
    global _tokenizer
    if _tokenizer is None:
        from transformers import AutoTokenizer

        _tokenizer = AutoTokenizer.from_pretrained(_MODEL_NAME)
    return _tokenizer


def tokenize(text: str) -> list[str]:
    """Return whole-word tokens for *text* using the DistilBERT vocabulary.

    Sub-word continuation tokens (``##…``) are merged into their root token so
    that each returned string corresponds to a complete word.
    """
    tokenizer = _get_tokenizer()
    raw_tokens: list[str] = tokenizer.tokenize(text)

    words: list[str] = []
    current = ""
    for token in raw_tokens:
        if token.startswith("##"):
            current += token[2:]
        else:
            if current:
                words.append(current)
            current = token
    if current:
        words.append(current)

    return words
