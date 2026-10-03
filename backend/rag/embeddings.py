import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from google import genai


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

EMBEDDING_MODEL = "gemini-embedding-001"


def get_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            f"GEMINI_API_KEY not found. Checked: {BASE_DIR / '.env'}"
        )

    return genai.Client(api_key=api_key)


def embed_text(text: str) -> List[float]:
    client = get_client()

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )

    return response.embeddings[0].values


def embed_documents(documents: List[str]) -> List[List[float]]:
    client = get_client()

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=documents,
    )

    return [
        embedding.values
        for embedding in response.embeddings
    ]
