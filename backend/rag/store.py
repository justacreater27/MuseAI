import json
from pathlib import Path
from typing import Any, Dict, List


BASE_DIR = Path(__file__).resolve().parent.parent
STORE_FILE = BASE_DIR / "data" / "trend_vectors.json"


def save_vectors(records: List[Dict[str, Any]]) -> None:
    STORE_FILE.parent.mkdir(parents=True, exist_ok=True)

    with STORE_FILE.open("w", encoding="utf-8") as f:
        json.dump(
            records,
            f,
            ensure_ascii=False,
        )


def load_vectors() -> List[Dict[str, Any]]:
    if not STORE_FILE.exists():
        return []

    with STORE_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)
