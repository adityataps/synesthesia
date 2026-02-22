"""Persists annotated training samples to GCP Firestore.

Authentication uses Application Default Credentials (ADC).  Run:
    gcloud auth application-default login
before starting the app, or set GOOGLE_APPLICATION_CREDENTIALS to a service
account key file path.
"""

import os
import uuid
from datetime import datetime, timezone

from google.cloud import firestore

_DEFAULT_COLLECTION = "synesthesia-training"

_db: firestore.Client | None = None


def _get_db() -> firestore.Client:
    global _db
    if _db is None:
        project_id = os.environ.get("GCP_PROJECT_ID")
        database = os.environ.get("GCP_FIRESTORE_DATABASE")
        _db = firestore.Client(project=project_id, database=database)
    return _db


def save_sample(
    phrase: str,
    tokens: list[str],
    colors: list[dict[str, int]],
    typefaces: list[str],
    fonts: list[list[str]],
    source: str = "llm",
) -> str:
    """Write one annotated sample to Firestore and return its document ID.

    Args:
        phrase: The original phrase string.
        tokens: Whole-word tokens (output of ``tokenizer.tokenize``).
        colors: One ``{"R": int, "G": int, "B": int, "A": int}`` dict per token.
        typefaces: Font family per token (e.g. "serif", "monospace").
        fonts: Style attributes per token (e.g. ["bold", "italic"]).
        source: Origin of the phrase — ``"llm"`` (generated) or ``"user"`` (typed).

    Returns:
        The Firestore document ID (UUID4).
    """
    collection = os.environ.get("GCP_FIRESTORE_COLLECTION", _DEFAULT_COLLECTION)
    doc_id = str(uuid.uuid4())

    # Firestore does not support nested arrays; serialize each token's font
    # style list as a comma-separated string (e.g. "bold,italic").
    fonts_flat = [",".join(f) for f in fonts]

    doc = {
        "id": doc_id,
        "phrase": phrase,
        "tokens": tokens,
        "colors": colors,
        "typefaces": typefaces,
        "fonts": fonts_flat,
        "source": source,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    _get_db().collection(collection).document(doc_id).set(doc)
    return doc_id
