"""Generates evocative phrases for annotation using the Anthropic Claude API."""

import os
import re
from pathlib import Path

import anthropic

_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "generate_phrase.txt"
_MODEL = "claude-haiku-4-5-20251001"


def _system_prompt() -> str:
    return _PROMPT_PATH.read_text(encoding="utf-8")


def generate_phrases(n: int, inspirations: list[str]) -> list[str]:
    """Call Claude to generate *n* colorful phrases, one per inspiration.

    Args:
        n: Number of phrases to generate. Must equal ``len(inspirations)``.
        inspirations: Seed strings from ``inspiration.generate_inspiration``.

    Returns:
        List of generated phrase strings (up to *n*; may be fewer if the model
        omits some outputs, which is rare).
    """
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    lines = [f"Inspiration {i + 1}: {ins}" for i, ins in enumerate(inspirations)]
    user_content = "\n".join(lines)

    message = client.messages.create(
        model=_MODEL,
        max_tokens=512,
        temperature=1.0,
        system=_system_prompt(),
        messages=[{"role": "user", "content": user_content}],
    )

    text = message.content[0].text
    phrases = re.findall(r"<output>(.*?)</output>", text, re.DOTALL)
    return [p.strip() for p in phrases]
