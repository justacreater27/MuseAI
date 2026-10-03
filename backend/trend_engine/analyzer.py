import json
import re
from pathlib import Path
from typing import Dict, List


BASE_DIR = Path(__file__).resolve().parents[1]
INPUT_FILE = BASE_DIR / "data" / "trends.json"
OUTPUT_FILE = BASE_DIR / "data" / "analyzed_trends.json"


CATEGORY_KEYWORDS = {
    "sports": [
        "epl", "fpl", "football", "soccer", "cricket",
        "ipl", "serie a", "champions league", "premier league",
        "vs", "fc", "milan", "chelsea", "arsenal", "liverpool",
        "manchester", "real madrid", "barcelona",
    ],
    "entertainment": [
        "movie", "film", "actor", "actress", "cinema",
        "music", "song", "concert", "celebrity",
    ],
    "technology": [
        "ai", "artificial intelligence", "iphone", "android",
        "google", "apple", "microsoft", "chatgpt", "technology",
    ],
    "travel": [
        "travel", "tourism", "japan", "paris", "dubai",
        "flight", "hotel", "destination",
    ],
    "finance": [
        "stock", "stocks", "market", "dow jone", "nasdaq",
        "sensex", "nifty", "bank", "bitcoin", "finance",
    ],
    "news": [
        "minister", "मंत्री", "election", "government",
        "policy", "earthquake", "power outage", "war",
        "protest", "breaking",
    ],
}


INDIA_KEYWORDS = [
    "india",
    "indian",
    "tamil",
    "tamil nadu",
    "chennai",
    "mumbai",
    "delhi",
    "bengaluru",
    "bangalore",
    "hyderabad",
    "kerala",
    "telangana",
    "karnataka",
    "maharashtra",
    "bollywood",
    "kollywood",
    "tollywood",
    "ipl",
    "bcci",
    "nagarjuna",
    "minister",
    "मंत्री",
]


def normalize(text: str) -> str:
    return re.sub(
        r"\s+",
        " ",
        str(text or "").lower().strip(),
    )


def detect_category(topic: str, description: str = "") -> str:
    text = normalize(f"{topic} {description}")

    scores = {}

    for category, keywords in CATEGORY_KEYWORDS.items():
        score = 0

        for keyword in keywords:
            if keyword in text:
                score += 1

        scores[category] = score

    best_category = max(
        scores,
        key=scores.get,
    )

    if scores[best_category] == 0:
        return "general"

    return best_category


def detect_india_relevance(
    topic: str,
    description: str = "",
    region: str = "",
    language: str = "",
) -> str:

    text = normalize(
        f"{topic} {description} {region} {language}"
    )

    for keyword in INDIA_KEYWORDS:
        if normalize(keyword) in text:
            return "high"

    if normalize(region) == "india":
        return "medium"

    if "hindi" in text or "tamil" in text:
        return "medium"

    return "low"


def parse_traffic(value: str) -> int:
    numbers = re.findall(
        r"\d+",
        str(value or ""),
    )

    if not numbers:
        return 0

    return int(numbers[0])


def calculate_score(trend: Dict) -> float:
    traffic = parse_traffic(
        trend.get("traffic", "")
    )

    score = 30.0

    if traffic >= 2000:
        score += 25
    elif traffic >= 1000:
        score += 20
    elif traffic >= 500:
        score += 15
    elif traffic >= 200:
        score += 10
    elif traffic >= 100:
        score += 5

    category = trend.get(
        "category",
        "general",
    )

    if category in {
        "sports",
        "entertainment",
        "technology",
        "news",
    }:
        score += 5

    india = trend.get(
        "indian_relevance",
        "low",
    )

    if india == "high":
        score += 10
    elif india == "medium":
        score += 5

    return min(
        round(score, 1),
        100.0,
    )


def detect_momentum(score: float) -> str:
    if score >= 70:
        return "High"

    if score >= 45:
        return "Medium"

    return "Low"


def creative_opportunities(category: str) -> List[str]:

    opportunities = {
        "sports": [
            "short-form reaction content",
            "fan-focused storytelling",
            "real-time social conversation",
        ],
        "entertainment": [
            "cultural storytelling",
            "reaction content",
            "conversation-driven creative",
        ],
        "technology": [
            "educational short-form content",
            "product-led storytelling",
            "trend explainers",
        ],
        "travel": [
            "destination storytelling",
            "visual discovery content",
            "experience-focused campaigns",
        ],
        "finance": [
            "educational content",
            "data-led storytelling",
            "timely explainers",
        ],
        "news": [
            "timely educational content",
            "context-driven storytelling",
            "social commentary",
        ],
        "general": [
            "short-form storytelling",
            "conversation-driven content",
            "timely creative hooks",
        ],
    }

    return opportunities.get(
        category,
        opportunities["general"],
    )


def analyze_trend(trend: Dict) -> Dict:

    result = dict(trend)

    topic = trend.get(
        "topic",
        "",
    )

    description = trend.get(
        "description",
        "",
    )

    category = detect_category(
        topic,
        description,
    )

    india_relevance = detect_india_relevance(
        topic,
        description,
        trend.get("region", ""),
        trend.get("language", ""),
    )

    result["category"] = category

    result["indian_relevance"] = india_relevance

    result["trend_score"] = calculate_score(
        result
    )

    result["momentum"] = detect_momentum(
        result["trend_score"]
    )

    result["creative_opportunities"] = (
        creative_opportunities(category)
    )

    return result


def load_trends() -> List[Dict]:

    if not INPUT_FILE.exists():
        return []

    with INPUT_FILE.open(
        "r",
        encoding="utf-8",
    ) as f:
        return json.load(f)


def save_trends(
    trends: List[Dict],
) -> None:

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            trends,
            f,
            ensure_ascii=False,
            indent=2,
        )


def analyze() -> List[Dict]:

    trends = load_trends()

    results = [
        analyze_trend(trend)
        for trend in trends
    ]

    results.sort(
        key=lambda x: x.get(
            "trend_score",
            0,
        ),
        reverse=True,
    )

    save_trends(results)

    return results


if __name__ == "__main__":

    print("📈 MuseAI Trend Analyzer")
    print()

    results = analyze()

    print(
        f"✅ Analyzed {len(results)} trends"
    )

    print(
        f"📁 Saved to: {OUTPUT_FILE}"
    )

    print()

    for index, trend in enumerate(
        results[:10],
        1,
    ):
        print(
            f"{index}. "
            f"{trend.get('topic', '')} | "
            f"{trend.get('category', '')} | "
            f"{trend.get('momentum', '')} | "
            f"Score: {trend.get('trend_score', '')} | "
            f"India: {trend.get('indian_relevance', '')}"
        )
