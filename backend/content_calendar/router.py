from fastapi import APIRouter, HTTPException

from .models import CalendarRequest, CalendarResponse
from .service import generate_calendar


router = APIRouter(
    prefix="/content-calendar",
    tags=["Content Calendar"]
)


@router.get("/health")
def calendar_health():
    return {
        "status": "ok",
        "service": "MuseAI Content Calendar"
    }


@router.post("/generate", response_model=CalendarResponse)
def create_calendar(request: CalendarRequest):
    try:
        result = generate_calendar(request)

        if not result["items"]:
            raise HTTPException(
                status_code=400,
                detail="Unable to generate calendar entries."
            )

        return result

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Content calendar generation failed: {exc}"
        )
