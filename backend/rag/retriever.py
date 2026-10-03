import math
from typing import Any, Dict, List

from .embeddings import embed_text
from .store import load_vectors


def cosine_similarity(a: List[float], b: List[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0

    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot / (norm_a * norm_b)


def category_match(
    trend_category: str,
    content_type: str,
) -> float:
    mapping = {
        "script": {
            "sports": 0.8,
            "entertainment": 1.0,
            "technology": 0.9,
            "news": 0.6,
            "travel": 0.8,
            "finance": 0.7,
            "lifestyle": 1.0,
            "general": 0.5,
        },
        "visual": {
            "sports": 0.8,
            "entertainment": 1.0,
            "technology": 0.8,
            "news": 0.5,
            "travel": 1.0,
            "finance": 0.6,
            "lifestyle": 1.0,
            "general": 0.5,
        },
        "music": {
            "sports": 0.7,
            "entertainment": 1.0,
            "technology": 0.5,
            "news": 0.4,
            "travel": 0.8,
            "finance": 0.3,
            "lifestyle": 0.9,
            "general": 0.5,
        },
        "campaign": {
            "sports": 0.9,
            "entertainment": 1.0,
            "technology": 1.0,
            "news": 0.6,
            "travel": 0.9,
            "finance": 0.8,
            "lifestyle": 1.0,
            "general": 0.5,
        },
    }

    return mapping.get(
        content_type,
        mapping["script"],
    ).get(
        trend_category,
        0.5,
    )


def region_match(
    trend: Dict[str, Any],
    region: str,
) -> float:
    trend_region = str(
        trend.get("region", "")
    ).lower()

    requested_region = str(
        region or ""
    ).lower()

    if not requested_region:
        return 0.5

    if requested_region in trend_region:
        return 1.0

    # Google Trends source is already collected from India.
    if requested_region in {
        "tamil nadu",
        "india",
    } and trend_region == "india":
        return 0.8

    return 0.4


def language_match(
    trend: Dict[str, Any],
    language: str,
) -> float:
    trend_language = str(
        trend.get("language", "")
    ).lower()

    requested_language = str(
        language or ""
    ).lower()

    if not requested_language:
        return 0.5

    if requested_language in trend_language:
        return 1.0

    # English trends can still be useful for regional-language
    # creative when the underlying topic is relevant.
    if trend_language == "english":
        return 0.6

    return 0.4


def build_query(
    brand: str,
    industry: str,
    audience: str,
    language: str,
    region: str,
    content_type: str,
) -> str:
    return f"""
Brand: {brand}
Industry: {industry}
Audience: {audience}
Language: {language}
Region: {region}
Content type: {content_type}

Find current trends that are genuinely useful
for creating content for this brand and audience.
Prioritize culturally relevant and creatively useful
topics rather than unrelated high-volume topics.
""".strip()


def calculate_final_score(
    semantic: float,
    trend_score: float,
    category: float,
    region: float,
    language: float,
) -> float:

    normalized_trend = trend_score / 100.0

    score = (
        semantic * 0.45
        + normalized_trend * 0.20
        + category * 0.20
        + region * 0.10
        + language * 0.05
    )

    return round(score, 4)


def retrieve_trends(
    brand: str,
    industry: str,
    audience: str,
    language: str,
    region: str,
    content_type: str,
    top_k: int = 5,
) -> List[Dict[str, Any]]:

    records = load_vectors()

    if not records:
        return []

    query = build_query(
        brand=brand,
        industry=industry,
        audience=audience,
        language=language,
        region=region,
        content_type=content_type,
    )

    query_vector = embed_text(query)

    results = []

    for record in records:
        vector = record.get("embedding", [])

        semantic = cosine_similarity(
            query_vector,
            vector,
        )

        category = category_match(
            record.get("category", "general"),
            content_type,
        )

        region_score = region_match(
            record,
            region,
        )

        language_score = language_match(
            record,
            language,
        )

        final_score = calculate_final_score(
            semantic=semantic,
            trend_score=float(
                record.get("trend_score", 0)
            ),
            category=category,
            region=region_score,
            language=language_score,
        )

        trend = dict(record)

        trend["semantic_score"] = round(
            semantic,
            4,
        )

        trend["category_match"] = category
        trend["region_match"] = region_score
        trend["language_match"] = language_score

        trend["retrieval_score"] = final_score

        results.append(trend)

    results.sort(
        key=lambda item: item.get(
            "retrieval_score",
            0,
        ),
        reverse=True,
    )

    return results[:top_k]


def format_trends_for_prompt(
    trends: List[Dict[str, Any]],
) -> str:

    if not trends:
        return ""

    lines = [
        "",
        "CURRENT TREND INTELLIGENCE:",
        "Use these trends only when genuinely relevant.",
        "",
    ]

    for index, trend in enumerate(
        trends,
        1,
    ):
        opportunities = ", ".join(
            trend.get(
                "creative_opportunities",
                [],
            )
        )

        lines.append(
            f"""
TREND {index}
Topic: {trend.get('topic', '')}
Category: {trend.get('category', '')}
Trend score: {trend.get('trend_score', '')}
Momentum: {trend.get('momentum', '')}
Region: {trend.get('region', '')}
Language: {trend.get('language', '')}
Creative opportunities: {opportunities}
Relevance score: {trend.get('retrieval_score', '')}
""".strip()
        )

    lines.append(
        """
TREND USAGE RULE:
Do not force trends into the creative.
Use a trend only when it naturally supports
the brand, audience, region, language and
requested content type.
""".strip()
    )

    return "\n".join(lines)
