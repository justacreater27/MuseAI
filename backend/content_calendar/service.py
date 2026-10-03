import json
import re
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List


DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "analyzed_trends.json"

# Baseline windows are editorial heuristics. They are not predictions of reach.
PLATFORM_WINDOWS = {
    "instagram": [("08:30", 66), ("12:30", 74), ("18:45", 86), ("20:15", 90), ("21:15", 80)],
    "facebook": [("09:00", 70), ("13:00", 77), ("18:30", 84), ("20:30", 82)],
    "youtube": [("10:00", 64), ("14:00", 72), ("18:30", 86), ("20:30", 90)],
    "linkedin": [("08:30", 88), ("10:00", 91), ("12:30", 82), ("17:30", 72)],
    "x": [("08:30", 70), ("12:30", 79), ("18:30", 86), ("21:00", 80)],
    "pinterest": [("09:00", 70), ("14:00", 77), ("19:00", 86), ("21:00", 88)],
}

DAY_FACTORS = (0.94, 0.99, 1.02, 1.04, 1.06, 1.03, 0.97)
FORMAT_BY_TYPE = {
    "reel": "Short vertical video",
    "short video": "Short vertical video",
    "video": "Short vertical video",
    "carousel": "Carousel with a clear opening slide",
    "story": "Interactive story sequence",
    "article": "Practical long-form explainer",
    "post": "Single image or graphic post",
    "image": "Single image or graphic post",
    "text": "Conversation-led text post",
}


def _read_trend_file() -> List[Dict[str, Any]]:
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        return [item for item in data if isinstance(item, dict)] if isinstance(data, list) else []
    except (OSError, json.JSONDecodeError):
        return []


def retrieve_relevant_trends(request, top_k: int = 30) -> List[Dict[str, Any]]:
    """Use the project's semantic RAG index where available, with analyzed
    Trend Engine output as a local fallback when embeddings are unavailable.
    """
    try:
        from backend.rag.retriever import retrieve_trends

        ranked = retrieve_trends(
            brand=request.brand_name,
            industry=request.industry,
            audience=request.target_audience,
            language=request.language,
            region=request.region,
            content_type=request.content_type,
            top_k=top_k,
        )
        if ranked:
            return [{**item, "trend_source": "RAG"} for item in ranked]
    except Exception:
        # RAG may be unavailable (for example, missing embedding credentials).
        # Keep planning usable with the real analyzed Trend Engine records.
        pass
    return [{**item, "trend_source": "Trend Engine"} for item in _read_trend_file()]


def _norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def _trend_fit(trend: Dict[str, Any], request, day_index: int) -> float:
    topic = _norm(trend.get("topic"))
    category = _norm(trend.get("category"))
    relevance = _norm(trend.get("indian_relevance"))
    momentum = _norm(trend.get("momentum"))
    query_words = set(re.findall(r"[\w]+", _norm(
        f"{request.topic} {request.industry} {request.target_audience} {request.region}"
    )))
    topic_words = set(re.findall(r"[\w]+", topic))
    overlap = len(query_words & topic_words)
    raw_score = float(trend.get("trend_score") or 0)
    retrieval_score = float(trend.get("retrieval_score") or 0)

    category_bonus = 5 if category in {
        "sports" if _norm(request.content_type) in {"reel", "video", "post"} else "general",
        "entertainment", "lifestyle", "technology", "news", "travel", "finance", "general",
    } else 0
    region_bonus = 12 if relevance == "high" else 6 if relevance == "medium" else 0
    momentum_bonus = 8 if momentum in {"high", "very high"} else 4 if momentum == "medium" else 0
    # Day-dependent tie-breaking is small; the source rank and trend signals dominate.
    return retrieval_score * 100 + raw_score * 0.35 + region_bonus + momentum_bonus + category_bonus + overlap * 3 + ((day_index * 7 + len(topic)) % 11) * 0.1


def _select_trends(trends: List[Dict[str, Any]], request) -> List[Dict[str, Any]]:
    if not trends:
        return []
    selected: List[Dict[str, Any]] = []
    used = set()
    category_counts: Dict[str, int] = {}
    for day_index in range(request.days):
        candidates = []
        for trend in trends:
            key = _norm(trend.get("topic"))
            if not key:
                continue
            category = _norm(trend.get("category")) or "general"
            reuse_penalty = 10000 if key in used else 0
            category_penalty = category_counts.get(category, 0) * 2.5
            candidates.append((_trend_fit(trend, request, day_index) - reuse_penalty - category_penalty, trend))
        if not candidates:
            selected.append({})
            continue
        candidates.sort(key=lambda pair: pair[0], reverse=True)
        trend = candidates[0][1]
        selected.append(trend)
        used.add(_norm(trend.get("topic")))
        category = _norm(trend.get("category")) or "general"
        category_counts[category] = category_counts.get(category, 0) + 1
    return selected


def _choose_time(request, post_date: date, index: int, trend: Dict[str, Any], recent_times: List[str]) -> tuple[str, int]:
    windows = PLATFORM_WINDOWS.get(_norm(request.platform), PLATFORM_WINDOWS["instagram"])
    day_factor = DAY_FACTORS[post_date.weekday()]
    audience = _norm(request.target_audience)
    content_type = _norm(request.content_type)
    best = None
    for window_index, (time_text, baseline) in enumerate(windows):
        hour, minute = map(int, time_text.split(":"))
        audience_adjust = 3 if any(token in audience for token in ("student", "youth", "18-", "gen z")) and hour >= 18 else 0
        work_adjust = 3 if any(token in audience for token in ("professional", "business", "b2b")) and 8 <= hour <= 13 else 0
        video_adjust = 2 if content_type in {"reel", "video", "short video"} and hour >= 18 else 0
        momentum_adjust = 2 if _norm(trend.get("momentum")) in {"high", "very high"} and hour >= 18 else 0
        repeat_penalty = 16 if time_text in recent_times[-2:] else 0
        # Stable day/index variation selects useful alternates when scores are close.
        variety = ((post_date.weekday() * 3 + index * 5 + window_index * 7 + minute // 15) % 9) * 0.35
        score = baseline * day_factor + audience_adjust + work_adjust + video_adjust + momentum_adjust + variety - repeat_penalty
        candidate = (score, time_text, baseline)
        if best is None or candidate[0] > best[0]:
            best = candidate
    return best[1], best[2]


def _caption_angle(request, trend: Dict[str, Any], index: int) -> str:
    brand = request.brand_name.strip()
    topic = trend.get("topic")
    if topic:
        angles = (
            f"Connect {topic} to a real customer moment for {brand}.",
            f"Offer {brand}'s useful perspective on {topic}, with a concrete takeaway.",
            f"Use {topic} as a timely hook, then bring the story back to {brand}'s audience.",
            f"Invite the audience to share how {topic} shows up in their everyday lives.",
        )
        return angles[index % len(angles)]
    return f"Share one specific, useful idea from {brand} that fits this audience and day."


def generate_calendar(request) -> Dict[str, Any]:
    start = datetime.now().date()
    trends = retrieve_relevant_trends(request)
    selected_trends = _select_trends(trends, request)
    output_format = FORMAT_BY_TYPE.get(_norm(request.content_type), f"{request.content_type} content")
    hashtags = [
        "#" + re.sub(r"[^\w]", "", part.title())
        for part in re.findall(r"[\w]+", request.brand_name)
        if part
    ][:2]
    hashtags.extend(["#" + re.sub(r"[^\w]", "", request.industry.title()), "#India"])
    hashtags = [tag for tag in hashtags if tag != "#"]

    items = []
    for index in range(request.days):
        post_date = start + timedelta(days=index)
        day_name = post_date.strftime("%A")
        trend = selected_trends[index] if index < len(selected_trends) else {}
        recent_times = [item["time"] for item in items]
        time_text, time_score = _choose_time(request, post_date, index, trend, recent_times)
        trend_name = str(trend.get("topic") or "") or None
        trend_source = str(trend.get("trend_source") or "") or None
        raw_trend_score = trend.get("trend_score")
        trend_score = round(float(raw_trend_score), 1) if raw_trend_score is not None else None
        retrieval_score = float(trend.get("retrieval_score") or 0)
        momentum = _norm(trend.get("momentum"))
        region = _norm(trend.get("indian_relevance"))
        trend_component = trend_score or 45
        reach_score = max(25, min(95, round(time_score * DAY_FACTORS[post_date.weekday()] * 0.64 + trend_component * 0.28 + min(retrieval_score * 100, 10) * 0.08)))
        engagement_score = max(25, min(95, round(reach_score * 0.76 + (9 if _norm(request.content_type) in {"reel", "carousel", "story"} else 3) + (4 if momentum in {"high", "very high"} else 0))))
        angle = _caption_angle(request, trend, index)
        explanation = (
            f"Suggested {time_text} IST from {request.platform} activity-window heuristics, weekday, audience, and format signals. These are planning recommendations, not guaranteed outcomes."
        )
        if trend_name:
            explanation += f" Trend context from {trend_source or 'Trend Engine'}: {trend_name} ({trend_score:g}/100, {momentum or 'momentum unavailable'} momentum; India relevance: {region or 'unrated'})."
        else:
            explanation += " No current trend record matched; this idea uses the brand and audience brief."
        if request.topic.strip():
            idea = f"{angle} Focus: {request.topic.strip()}"
        else:
            idea = angle
        reasons = [explanation]
        items.append({
            "date": post_date.isoformat(),
            "day": day_name,
            "time": time_text,
            "platform": request.platform,
            "content_type": request.content_type,
            "trend": trend_name,
            "trend_score": trend_score,
            "trend_source": trend_source,
            "reach_score": reach_score,
            "engagement_score": engagement_score,
            "recommended_format": output_format,
            "caption_angle": angle,
            "hashtags": hashtags,
            "reason": explanation,
            "priority": "High" if reach_score >= 78 else "Medium" if reach_score >= 60 else "Test",
            "topic": idea,
            "language": request.language,
            "opportunity_score": reach_score,
            "opportunity_level": "High" if reach_score >= 78 else "Medium" if reach_score >= 60 else "Low",
            "reasons": reasons,
            "recommended_action": "Use this as a suggested posting window, publish the planned creative, and compare results with your own audience analytics.",
        })

    return {
        "brand_name": request.brand_name,
        "generated_for": request.target_audience,
        "algorithm": "MuseAI Trend Engine + RAG with audience and posting-window heuristics",
        "items": items,
    }
