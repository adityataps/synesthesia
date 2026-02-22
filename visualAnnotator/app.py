"""Synesthesia — Visual Annotator

A Streamlit app for building the synesthesia training dataset.
Users are shown a generated phrase, then assign color, opacity, font family,
and typeface styles to each word token. Annotated samples are saved to GCP Firestore.

Run:
    streamlit run app.py
"""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

import streamlit as st

from services.database import save_sample
from services.inspiration import generate_inspiration
from services.llm import generate_phrases
from services.tokenizer import tokenize

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_BATCH_SIZE = 5

_DEFAULT_COLOR = "#808080"
_DEFAULT_FONTS: list[str] = []

# 20 Google Fonts spanning serif, sans, display, script, mono, and decorative
_GOOGLE_FONTS: list[str] = sorted([
    "Roboto",
    "Montserrat",
    "Raleway",
    "Oswald",
    "Quicksand",
    "Josefin Sans",
    "Exo 2",
    "Playfair Display",
    "Lora",
    "Merriweather",
    "Crimson Text",
    "Cinzel",
    "Bebas Neue",
    "Abril Fatface",
    "Righteous",
    "Dancing Script",
    "Pacifico",
    "Satisfy",
    "Permanent Marker",
    "Space Mono",
])

_DEFAULT_TYPEFACE = "Roboto"

_FONT_OPTIONS = ["bold", "italic", "strikethrough"]


def _google_fonts_url() -> str:
    families = "&family=".join(f.replace(" ", "+") for f in _GOOGLE_FONTS)
    return f"https://fonts.googleapis.com/css2?family={families}&display=swap"


def _css_font_family(font_name: str) -> str:
    """Return a CSS font-family declaration for a Google Font name."""
    quoted = f"'{font_name}'" if " " in font_name else font_name
    return f"{quoted}, sans-serif"


def _font_reference_html() -> str:
    """Render all 20 Google Fonts as labelled specimens in a 4-column grid."""
    items = []
    for font in _GOOGLE_FONTS:
        css_font = _css_font_family(font)
        items.append(
            f'<div style="padding:10px 12px; background:#1a1a1a; border-radius:6px; border:1px solid #2e2e2e;">'
            f'<div style="font-size:0.65rem; color:#666; margin-bottom:4px; font-family:sans-serif; letter-spacing:0.04em;">{font.upper()}</div>'
            f'<div style="font-family:{css_font}; font-size:1.05rem; color:#ddd;">The quick brown fox</div>'
            f'</div>'
        )
    grid = "".join(items)
    return (
        f'<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px;">'
        f"{grid}"
        f"</div>"
    )


def _hex_to_rgba(hex_color: str, alpha: int = 255) -> dict[str, int]:
    """Convert a CSS hex color string and an alpha value to an RGBA dict."""
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i : i + 2], 16) for i in (0, 2, 4))
    return {"R": r, "G": g, "B": b, "A": alpha}


def _hex_to_rgb_tuple(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _colored_phrase_html(
    tokens: list[str],
    colors: list[str],
    alphas: list[int],
    typefaces: list[str],
    fonts: list[list[str]],
    bg_color: str = "#111",
) -> str:
    """Build an HTML preview of the phrase with per-token color, opacity, font, and style."""
    spans = []
    for t, c, a, tf, fs in zip(tokens, colors, alphas, typefaces, fonts):
        r, g, b = _hex_to_rgb_tuple(c)
        css_color = f"rgba({r},{g},{b},{a/255:.3f})"
        css_font = _css_font_family(tf)
        extra = ""
        if "bold" in fs:
            extra += "font-weight:700;"
        if "italic" in fs:
            extra += "font-style:italic;"
        if "strikethrough" in fs:
            extra += "text-decoration:line-through;"
        spans.append(
            f'<span style="color:{css_color}; font-family:{css_font}; padding:0 3px; {extra}">{t}</span>'
        )
    inner = " ".join(spans)
    return (
        f'<div style="background:{bg_color}; border-radius:8px; padding:16px 20px; '
        f'font-size:1.6rem; letter-spacing:0.02em;">'
        f"{inner}</div>"
    )


# ---------------------------------------------------------------------------
# Session state management
# ---------------------------------------------------------------------------


def _refill_queue() -> None:
    """Fetch a batch of phrases from the LLM and append them to the queue."""
    inspirations = [generate_inspiration() for _ in range(_BATCH_SIZE)]
    with st.spinner("Generating phrases…"):
        phrases = generate_phrases(_BATCH_SIZE, inspirations)
    queue: list[str] = st.session_state.get("phrase_queue", [])
    queue.extend(phrases)
    st.session_state.phrase_queue = queue


def _load_next_phrase() -> None:
    """Pop the next phrase from the queue (refilling if empty) and set session state."""
    if not st.session_state.get("phrase_queue"):
        _refill_queue()

    phrase = st.session_state.phrase_queue.pop(0)
    tokens = tokenize(phrase)

    # Bump the phrase counter so widget keys are unique across phrases
    st.session_state.phrase_id = st.session_state.get("phrase_id", -1) + 1
    st.session_state.phrase = phrase
    st.session_state.phrase_source = "llm"
    st.session_state.tokens = tokens

    pid = st.session_state.phrase_id
    for i in range(len(tokens)):
        st.session_state[f"color_{pid}_{i}"] = _DEFAULT_COLOR
        st.session_state[f"alpha_{pid}_{i}"] = 255
        st.session_state[f"typeface_{pid}_{i}"] = _DEFAULT_TYPEFACE
        st.session_state[f"fonts_{pid}_{i}"] = list(_DEFAULT_FONTS)


def _copy_formatting(pid: int, src: int, dst: int) -> None:
    """Copy color, opacity, typeface, and style from token *src* to token *dst*."""
    for attr in ("color", "alpha", "typeface"):
        src_key = f"{attr}_{pid}_{src}"
        if src_key in st.session_state:
            st.session_state[f"{attr}_{pid}_{dst}"] = st.session_state[src_key]
    fonts_src = f"fonts_{pid}_{src}"
    if fonts_src in st.session_state:
        st.session_state[f"fonts_{pid}_{dst}"] = list(st.session_state[fonts_src])


def _current_colors() -> list[str]:
    pid = st.session_state.phrase_id
    tokens = st.session_state.tokens
    return [st.session_state.get(f"color_{pid}_{i}", _DEFAULT_COLOR) for i in range(len(tokens))]


def _current_alphas() -> list[int]:
    pid = st.session_state.phrase_id
    tokens = st.session_state.tokens
    return [st.session_state.get(f"alpha_{pid}_{i}", 255) for i in range(len(tokens))]


def _current_typefaces() -> list[str]:
    pid = st.session_state.phrase_id
    tokens = st.session_state.tokens
    return [st.session_state.get(f"typeface_{pid}_{i}", _DEFAULT_TYPEFACE) for i in range(len(tokens))]


def _current_fonts() -> list[list[str]]:
    pid = st.session_state.phrase_id
    tokens = st.session_state.tokens
    return [st.session_state.get(f"fonts_{pid}_{i}", list(_DEFAULT_FONTS)) for i in range(len(tokens))]


# ---------------------------------------------------------------------------
# App layout
# ---------------------------------------------------------------------------


def main() -> None:
    st.set_page_config(
        page_title="Synesthesia — Visual Annotator",
        page_icon="🎨",
        layout="wide",
    )
    st.markdown(
        f'<link href="{_google_fonts_url()}" rel="stylesheet">',
        unsafe_allow_html=True,
    )

    st.title("Synesthesia — Visual Annotator")
    st.caption("Assign color, opacity, font, and style to each word. Submit to save or skip to get a new phrase.")

    # Bootstrap on first load
    if "phrase_id" not in st.session_state:
        _load_next_phrase()

    phrase: str = st.session_state.phrase
    tokens: list[str] = st.session_state.tokens
    pid: int = st.session_state.phrase_id

    # ------------------------------------------------------------------
    # Font reference panel
    # ------------------------------------------------------------------
    with st.expander("Browse fonts"):
        st.markdown(_font_reference_html(), unsafe_allow_html=True)

    # ------------------------------------------------------------------
    # Per-token controls: color, typeface, font styles
    # ------------------------------------------------------------------
    st.subheader("Assign styles")

    max_cols = min(len(tokens), 6)
    cols = st.columns(max_cols)

    for i, token in enumerate(tokens):
        col = cols[i % max_cols]
        key_color = f"color_{pid}_{i}"
        key_alpha = f"alpha_{pid}_{i}"
        key_typeface = f"typeface_{pid}_{i}"
        key_fonts = f"fonts_{pid}_{i}"
        with col:
            color = st.color_picker(
                f"`{token}`",
                st.session_state.get(key_color, _DEFAULT_COLOR),
                key=key_color,
            )
            st.markdown(
                f'<div style="background:{color}; border-radius:5px; padding:6px; '
                f'text-align:center; color:#fff; font-weight:600; font-size:0.85rem; '
                f'text-shadow:0 1px 2px rgba(0,0,0,0.6);">{token}</div>',
                unsafe_allow_html=True,
            )
            btn_l, btn_r = st.columns(2)
            with btn_l:
                if st.button("← copy", key=f"copy_left_{pid}_{i}", disabled=(i == 0), use_container_width=True):
                    _copy_formatting(pid, i - 1, i)
                    st.rerun()
            with btn_r:
                if st.button("copy →", key=f"copy_right_{pid}_{i}", disabled=(i == len(tokens) - 1), use_container_width=True):
                    _copy_formatting(pid, i + 1, i)
                    st.rerun()
            st.markdown('<div style="margin-top:6px"></div>', unsafe_allow_html=True)
            st.slider(
                "Opacity",
                min_value=0,
                max_value=255,
                value=st.session_state.get(key_alpha, 255),
                key=key_alpha,
                label_visibility="collapsed",
            )
            st.selectbox(
                "Font",
                _GOOGLE_FONTS,
                index=_GOOGLE_FONTS.index(st.session_state.get(key_typeface, _DEFAULT_TYPEFACE)),
                key=key_typeface,
                label_visibility="collapsed",
            )
            st.multiselect(
                "Style",
                _FONT_OPTIONS,
                default=st.session_state.get(key_fonts, list(_DEFAULT_FONTS)),
                key=key_fonts,
                label_visibility="collapsed",
                placeholder="style…",
            )

    # ------------------------------------------------------------------
    # Live phrase preview
    # ------------------------------------------------------------------
    preview_header, preview_toggle = st.columns([6, 1])
    with preview_header:
        st.subheader("Preview")
    with preview_toggle:
        dark_mode = st.toggle("Dark", value=True, key="dark_mode")
    bg_color = "#111111" if dark_mode else "#f5f5f5"
    st.markdown(
        _colored_phrase_html(tokens, _current_colors(), _current_alphas(), _current_typefaces(), _current_fonts(), bg_color),
        unsafe_allow_html=True,
    )

    # ------------------------------------------------------------------
    # Action buttons
    # ------------------------------------------------------------------
    st.write("")
    btn_col1, btn_col2, _ = st.columns([1, 1, 6])

    with btn_col1:
        if st.button("Submit", type="primary", use_container_width=True):
            rgba_colors = [_hex_to_rgba(c, a) for c, a in zip(_current_colors(), _current_alphas())]
            try:
                source = st.session_state.get("phrase_source", "llm")
                doc_id = save_sample(phrase, tokens, rgba_colors, _current_typefaces(), _current_fonts(), source)
                st.success(f"Saved! `{doc_id}`")
            except Exception as exc:  # noqa: BLE001
                st.error(f"Failed to save: {exc}")
                st.stop()
            _load_next_phrase()
            st.rerun()

    with btn_col2:
        if st.button("Skip", use_container_width=True):
            _load_next_phrase()
            st.rerun()


if __name__ == "__main__":
    main()
