# Synesthesia — Claude Code Guide

## Project Overview

**Synesthesia** is an AI project that maps text tokens to visual attributes (RGB colors, typefaces, fonts) based on semantic meaning. The end goal is to augment an encoder model (BERT-family) with a projection head that maps token embeddings to color/style vectors, creating a "synesthetic" reading experience.

### Two main components

1. **visualAnnotator** — A data-collection tool used to build the labeled training dataset. Users are shown a generated phrase, tokenized into individual words, and manually assign color (RGBA), font family, and typeface styles to each token. Samples are persisted to a cloud database.

2. **Model (planned)** — A fine-tuned/augmented BERT model with a projection head that predicts RGB values (and style attributes) directly from token embeddings.

---

## Architecture

### visualAnnotator (Python/Streamlit + GCP)

| Layer | Technology |
|---|---|
| UI | Streamlit |
| Phrase generation | Anthropic Claude API (`claude-haiku-4-5-20251001`) |
| Tokenization | HuggingFace `transformers` (DistilBERT) |
| Database | GCP Firestore |
| Auth | GCP Application Default Credentials (ADC) |
| Language | Python 3.11+ |
| Packaging | `pyproject.toml` (uv / pip) |

GCP services replace AWS equivalents:

| AWS (old) | GCP (new) |
|---|---|
| DynamoDB | Firestore (Native mode) |
| IAM access keys | Application Default Credentials |

### Model (planned)

- Base: `bert-base-uncased` or `distilbert-base-uncased`
- Augmentation: additional projection head mapping CLS/token embeddings → RGB (+ style latent vector)
- Training data: samples collected by visualAnnotator
- Training infra: GCP (Vertex AI or local GPU)

---

## Repository Layout

```
synesthesia/
├── visualAnnotator/      # Data collection Streamlit app (Python)
│   ├── app.py            # Streamlit entry point
│   ├── services/
│   │   ├── llm.py        # Claude phrase generation
│   │   ├── tokenizer.py  # HuggingFace DistilBERT tokenization
│   │   ├── database.py   # GCP Firestore persistence
│   │   └── inspiration.py# Random inspiration generator
│   ├── prompts/
│   │   └── generate_phrase.txt
├── model/                # (planned) Model training + inference
├── sandbox/              # Notebooks for experimentation
├── pyproject.toml        # Root-level Python project config
└── CLAUDE.md             # This file
```

---

## Data Model

Each saved training sample (Firestore document in `synesthesia-training` collection):

```json
{
  "id": "<uuid-v7>",
  "phrase": "cerulean dreams on velvet night",
  "tokens": ["cerulean", "dreams", "on", "velvet", "night"],
  "colors": [
    { "R": 42, "G": 130, "B": 218, "A": 200 },
    ...
  ],
  "typefaces": ["serif", "sans-serif", ...],
  "fonts": [["bold"], ["italic", "bold"], [], ...],
  "source": "llm",
  "timestamp": "<ISO-8601>"
}
```

---

## Development Setup

### Prerequisites

- Python 3.11+
- `uv` (recommended) or `pip`
- GCP project with Firestore enabled
- `gcloud` CLI authenticated (`gcloud auth application-default login`)
- Anthropic API key

### Environment variables

```
ANTHROPIC_API_KEY=
GCP_PROJECT_ID=
GCP_FIRESTORE_DATABASE=                         # optional, defaults to "(default)"
GCP_FIRESTORE_COLLECTION=synesthesia-training   # optional, has default
```

### Running locally

```bash
uv run --no-project streamlit run visualAnnotator/app.py
```

---

## Git Strategy

- **Never commit automatically.** Always wait for an explicit instruction from the user before creating a git commit.
- **Never push directly to `main`.** All changes must be made on a feature branch created off `main`.
- Branch naming: `feat/<short-description>`, `fix/<short-description>`, or `chore/<short-description>`.
- Once work on a branch is complete and the user explicitly requests it, open a pull request targeting `main` and merge via PR (do not merge locally).
- Commit messages should follow Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).

### Workflow summary

```
main
 └── feat/python-refactor   ← work here
      ↓ (PR) → merge into main
```

---

## Key Design Decisions

- **Streamlit** is chosen over a separate React frontend + FastAPI backend to minimize boilerplate and keep the dataset tool self-contained in Python.
- **Firestore** is used over Cloud Bigtable or Cloud SQL because the data model is document-oriented, the schema is flexible (easy to add font/typeface fields later), and Firestore's free tier is generous for a dataset collection workload.
- **Application Default Credentials** remove the need to manage long-lived service account keys in environment files.
- **DistilBERT** is used for tokenization now (matching what the eventual model will see at inference time), so tokens in the training data exactly match the model's vocabulary.
- **Batch phrase generation** — the LLM generates 5 phrases per API call. They are queued in session state and served one at a time, so the loading spinner only appears every 5 annotations.
