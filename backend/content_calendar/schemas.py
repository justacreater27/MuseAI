from pydantic import BaseModel, Field
from typing import Optional


class CalendarRecommendationRequest(BaseModel):
    platform: str = "Instagram"
    content_type: str = "Reel"
    topic: str = ""
    days: int = Field(default=7, ge=1, le=30)


class CalendarCreateRequest(BaseModel):
    platform: str = "Instagram"
    content_type: str = "Reel"
    topic: str = ""
    number_of_posts: int = Field(default=7, ge=1, le=30)


class CalendarItem(BaseModel):
    id: str
    title: str
    topic: str
    platform: str
    content_type: str
    date: str
    time: str
    score: float
    status: str
    trend: Optional[str] = None
    reason: str
