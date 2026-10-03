from datetime import datetime, timedelta
from pathlib import Path
import json
import math


DATA_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "calendar"
    / "content_calendar.json"
)


# ---------------------------------------------------------
# Platform baseline posting windows
# These are starting heuristics, not guaranteed reach times.
# ---------------------------------------------------------

PLATFORM_WINDOWS = {
    "Instagram": [
        ("09:00", 0.78),
        ("12:30", 0.82),
        ("18:30", 0.92),
        ("20:30", 0.96),
        ("21:30", 0.88),
    ],
    "Facebook": [
        ("09:00", 0.75),
        ("13:00", 0.84),
        ("18:00", 0.89),
        ("20:00", 0.91),
    ],
    "LinkedIn": [
        ("08:30", 0.91),
        ("10:00", 0.96),
        ("12:00", 0.82),
        ("17:30", 0.72),
    ],
    "YouTube": [
        ("12:00", 0.78),
        ("15:00", 0.86),
        ("18:00", 0.94),
        ("20:00", 0.97),
    ],
    "X": [
        ("09:00", 0.82),
        ("12:00", 0.88),
        ("18:00", 0.93),
        ("21:00", 0.89),
    ],
}


CONTENT_TYPE_MULTIPLIER = {
    "Reel": 1.08,
    "Short Video": 1.10,
    "Carousel": 1.02,
    "Image": 0.96,
    "Article": 0.94,
    "Text": 0.88,
    "Story": 0.91,
}


DAY_MULTIPLIER = {
    0: 0.91,  # Monday
    1: 0.96,
    2: 1.00,
    3: 1.04,
    4: 1.08,
    5: 1.02,
    6: 0.94,
}


def load_trends():
    trend_file = (
        Path(__file__).resolve().parent.parent
        / "data"
        / "analyzed_trends.json"
    )

    if not trend_file.exists():
        return []

    try:
        with open(trend_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_calendar(items):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


def load_calendar():
    if not DATA_FILE.exists():
        return []

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def trend_score_for_content(content_topic):
    """
    Match the requested content topic against MuseAI's
    existing Trend Engine output.
    """

    trends = load_trends()

    if not trends or not content_topic:
        return 0.0, None

    query = content_topic.lower()

    best_score = 0.0
    best_trend = None

    for trend in trends:
        topic = str(trend.get("topic", "")).lower()

        if not topic:
            continue

        score = 0

        if query in topic or topic in query:
            score += 40

        query_words = set(query.split())
        topic_words = set(topic.split())

        overlap = query_words.intersection(topic_words)

        if overlap:
            score += min(len(overlap) * 15, 30)

        raw_trend_score = float(trend.get("trend_score", 0))
        score += raw_trend_score * 0.3

        if score > best_score:
            best_score = score
            best_trend = trend

    return min(best_score, 100), best_trend


def calculate_score(
    platform,
    content_type,
    topic,
    day_index,
    time_score,
    audience_activity=1.0,
):
    platform_score = time_score

    content_multiplier = CONTENT_TYPE_MULTIPLIER.get(
        content_type,
        1.0,
    )

    day_multiplier = DAY_MULTIPLIER.get(
        day_index,
        1.0,
    )

    trend_score, matched_trend = trend_score_for_content(topic)

    final_score = (
        platform_score
        * content_multiplier
        * day_multiplier
        * audience_activity
        * (1 + trend_score / 250)
        * 100
    )

    return min(round(final_score, 2), 100), matched_trend


def generate_recommendations(
    platform="Instagram",
    content_type="Reel",
    topic="",
    days=7,
):
    windows = PLATFORM_WINDOWS.get(
        platform,
        PLATFORM_WINDOWS["Instagram"],
    )

    recommendations = []

    now = datetime.now()

    for day_offset in range(days):
        target_date = now + timedelta(days=day_offset)
        day_index = target_date.weekday()

        for time_string, time_score in windows:
            hour, minute = map(int, time_string.split(":"))

            score, matched_trend = calculate_score(
                platform=platform,
                content_type=content_type,
                topic=topic,
                day_index=day_index,
                time_score=time_score,
            )

            recommendations.append(
                {
                    "date": target_date.strftime("%Y-%m-%d"),
                    "day": target_date.strftime("%A"),
                    "time": time_string,
                    "platform": platform,
                    "content_type": content_type,
                    "score": score,
                    "trend": (
                        matched_trend.get("topic")
                        if matched_trend
                        else None
                    ),
                    "trend_momentum": (
                        matched_trend.get("momentum")
                        if matched_trend
                        else None
                    ),
                    "trend_relevance": (
                        matched_trend.get("indian_relevance")
                        if matched_trend
                        else None
                    ),
                    "reason": build_reason(
                        score,
                        matched_trend,
                        content_type,
                    ),
                }
            )

    recommendations.sort(
        key=lambda x: x["score"],
        reverse=True,
    )

    return recommendations


def build_reason(
    score,
    matched_trend,
    content_type,
):
    reasons = []

    if score >= 90:
        reasons.append("strong audience activity window")
    elif score >= 80:
        reasons.append("good audience activity window")
    else:
        reasons.append("moderate audience activity window")

    if content_type in ["Reel", "Short Video"]:
        reasons.append("short-form content receives a format boost")

    if matched_trend:
        reasons.append(
            f"related trend detected: {matched_trend.get('topic')}"
        )

    return ", ".join(reasons)


def create_calendar(
    platform,
    content_type,
    topic,
    start_date=None,
    number_of_posts=7,
):
    recommendations = generate_recommendations(
        platform=platform,
        content_type=content_type,
        topic=topic,
        days=max(number_of_posts, 7),
    )

    selected = recommendations[:number_of_posts]

    calendar = load_calendar()

    for item in selected:
        calendar.append(
            {
                "id": f"{item['date']}-{item['time']}-{platform}",
                "title": topic or "Untitled Content",
                "topic": topic,
                "platform": platform,
                "content_type": content_type,
                "date": item["date"],
                "time": item["time"],
                "score": item["score"],
                "status": "planned",
                "trend": item["trend"],
                "reason": item["reason"],
            }
        )

    save_calendar(calendar)

    return selected
