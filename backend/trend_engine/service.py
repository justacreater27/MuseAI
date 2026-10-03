import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]


def run_module(module_name: str):
    print(f"\n🚀 Running {module_name}...")

    result = subprocess.run(
        [
            sys.executable,
            "-m",
            module_name,
        ],
        cwd=PROJECT_ROOT,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"{module_name} failed with exit code "
            f"{result.returncode}"
        )


def refresh_trends():
    print("🧠 MuseAI Trend Intelligence")
    print("=" * 50)

    # 1. Collect fresh public trend data
    run_module(
        "backend.trend_engine.scraper"
    )

    # 2. Analyze and score trends
    run_module(
        "backend.trend_engine.analyzer"
    )

    # 3. Generate embeddings and update RAG
    run_module(
        "backend.rag.indexer"
    )

    print()
    print("=" * 50)
    print("✅ Trend intelligence refreshed")
    print("🕷️ Scrapy → Analyzer → Embeddings → RAG")


if __name__ == "__main__":
    refresh_trends()
