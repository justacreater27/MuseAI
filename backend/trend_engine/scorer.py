import re
from typing import Dict


def parse_traffic(value: str) -> int:
    if not value:
        return 0

    match = re.search(r"([\d,.]+)\s*([KMB]?)", value.upper())
    if not match:
        return 0

    number = float(match.group(1).replace(",", ""))
    suffix = match.group(2)

    multiplier = {
        "": 1,
        "K": 1_000,
        "M": 1_000_000,
        "B": 1_000_000_000,
    }.get(suffix, 1)

    return int(number * multiplier)


def traffic_score(traffic: str) -> float:
    value = parse_traffic(traffic)

    if value >= 1_000_000:
        return 100
    if value >= 500_000:
        return 90
    if value >= 100_000:
        return 80
    if value >= 50_000:
        return 70
    if value >= 10_000:
        return 60
    if value >= 5_000:
        return 50
    if value >= 1_000:
        return 40
    if value >= 500:
        return 30
    if value >= 200:
        return 20
    if value >= 100:
        return 15

    return 10


def freshness_score(trend: Dict) -> float:
    # Google Trends RSS entries are already current when collected.
    # Give fresh records a strong baseline score.
    return 90


def calculate_trend_score(trend: Dict) -> float:
    traffic = traffic_score(trend.get("traffic", ""))
    freshness = freshness_score(trend)

    # v1 weighting.
    score = (
        traffic * 0.70
        + freshness * 0.30
    )

    return round(min(score, 100), 2)


def momentum_label(score: float) -> str:
    if score >= 80:
        return "Very High"

    if score >= 60:
        return "High"

    if score >= 40:
        return "Medium"

    if score >= 20:
        return "Low"

    return "Very Low"
