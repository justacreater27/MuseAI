from typing import List, Optional

from pydantic import BaseModel, Field


class CalendarRequest(BaseModel):
    brand_name: str = Field(..., min_length=1, max_length=120)
    industry: str = "General"
    target_audience: str = "Indian audience"
    platform: str = "Instagram"
    content_type: str = "Post"
    topic: str = ""
    language: str = "English"
    region: str = "Pan-India"
    days: int = Field(default=7, ge=1, le=30)


class CalendarItem(BaseModel):
    date: str
    day: str
    time: str
    platform: str
    content_type: str
    trend: Optional[str] = None
    trend_score: Optional[float] = None
    trend_source: Optional[str] = None
    reach_score: int
    engagement_score: int
    recommended_format: str
    caption_angle: str
    hashtags: List[str]
    reason: str
    priority: str
    # Keep the original field names available to existing calendar consumers.
    topic: str
    language: str
    opportunity_score: int
    opportunity_level: str
    reasons: List[str]
    recommended_action: str


class CalendarResponse(BaseModel):
    brand_name: str
    generated_for: str
    algorithm: str
    items: List[CalendarItem]
