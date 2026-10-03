import json
from pathlib import Path

from .embeddings import embed_text
from .store import save_vectors


BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_FILE = BASE_DIR / "data" / "analyzed_trends.json"


def build_embedding_text(trend):
    return f"""
Topic: {trend.get('topic', '')}
Category: {trend.get('category', '')}
Region: {trend.get('region', '')}
Language: {trend.get('language', '')}
Trend score: {trend.get('trend_score', '')}
Momentum: {trend.get('momentum', '')}
Creative opportunities: {', '.join(
    trend.get('creative_opportunities', [])
)}
Indian relevance: {trend.get('indian_relevance', '')}
""".strip()


def index_trends():
    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Missing {INPUT_FILE}"
        )

    with INPUT_FILE.open(
        "r",
        encoding="utf-8",
    ) as f:
        trends = json.load(f)

    records = []

    for index, trend in enumerate(trends, 1):
        print(
            f"🧠 Embedding trend {index}/{len(trends)}: "
            f"{trend.get('topic', '')}"
        )

        text = build_embedding_text(trend)

        embedding = embed_text(text)

        record = dict(trend)
        record["embedding"] = embedding

        records.append(record)

    save_vectors(records)

    print()
    print(
        f"✅ Indexed {len(records)} trends"
    )


if __name__ == "__main__":
    print("🧠 MuseAI RAG Indexer")
    print()

    index_trends()
