from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# ── Load cultural dataset ──────────────────────────────────────────
with open("cultural_data.json", "r", encoding="utf-8") as f:
    CULTURAL_DATA = json.load(f)


# ── Request models ─────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    brand_name: str
    content_type: str        # script | music | visual | campaign
    language: str            # Tamil | Hindi | English etc.
    region: str = "National"
    tone: str = "modern"
    theme: str = ""
    duration: str = "30 seconds"
    additional_info: str = ""


class ChatRequest(BaseModel):
    message: str
    language: str = "English"


# ── Cultural context builder ───────────────────────────────────────
def build_cultural_context(region: str, language: str, tone: str, content_type: str) -> str:
    ctx = []

    # Region-specific context
    region_data = CULTURAL_DATA["regions"].get(region)
    if region_data:
        ctx.append(f"Region: {region}")
        ctx.append(f"Cultural values: {', '.join(region_data['values'])}")
        ctx.append(f"Local food/references: {', '.join(region_data['food'][:4])}")
        ctx.append(f"Ad style preference: {region_data['ad_style']}")
        if region_data.get("culture_keywords"):
            ctx.append(f"Cultural keywords in {language}: {', '.join(region_data['culture_keywords'][:3])}")

    # Tone context
    tone_data = CULTURAL_DATA["brand_tones"].get(tone)
    if tone_data:
        ctx.append(f"Brand tone: {tone_data['description']}")
        ctx.append(f"Key tone words: {', '.join(tone_data['keywords'])}")

    # Content type context
    ct_data = CULTURAL_DATA["content_types"].get(content_type)
    if ct_data:
        if content_type == "script":
            ctx.append(f"Suggested structure: {ct_data['structures'][0]}")
            ctx.append(f"Hook style: {ct_data['hooks'][0]}")
        elif content_type == "music":
            ctx.append(f"Suggested genres: {', '.join(ct_data['genres'][:3])}")
            ctx.append(f"Regional instruments: {', '.join(ct_data['instruments'][:4])}")
        elif content_type == "visual":
            ctx.append(f"Visual style: {ct_data['styles'][0]}")
        elif content_type == "campaign":
            ctx.append(f"Recommended channels: {', '.join(ct_data['channels'][:4])}")

    # Indian ad insights
    insights = CULTURAL_DATA["indian_ad_insights"]
    ctx.append(f"Key emotional trigger to use: {insights['emotional_triggers'][0]}")
    ctx.append(f"Core Indian value to reflect: {insights['cultural_values'][0]}")

    return "\n".join(ctx)


def get_festivals_for_region(region: str) -> str:
    festivals = CULTURAL_DATA["festivals"].get(region) or CULTURAL_DATA["festivals"]["National"]
    return ", ".join(festivals[:4])


# ── Generate endpoint ──────────────────────────────────────────────
@app.post("/generate")
async def generate_content(req: GenerateRequest):
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

        cultural_context = build_cultural_context(
            req.region, req.language, req.tone, req.content_type
        )
        festivals = get_festivals_for_region(req.region)

        prompt = f"""
You are MuseAI, an expert Indian advertising content creator.
Generate a {req.content_type} for the brand "{req.brand_name}".

CULTURAL CONTEXT (use this to make content deeply Indian and authentic):
{cultural_context}
Relevant festivals: {festivals}

REQUIREMENTS:
- Language: {req.language} (write the actual content in {req.language})
- Duration/Format: {req.duration}
- Theme: {req.theme if req.theme else 'General brand promotion'}
- Additional info: {req.additional_info if req.additional_info else 'None'}

INSTRUCTIONS:
1. Make it feel authentically Indian — not a translated Western ad
2. Use cultural references, emotions, and values natural to {req.region}
3. The content must resonate with {req.language}-speaking audiences
4. Be creative, memorable, and emotionally engaging
5. For scripts: include scene descriptions, dialogues, and voiceover
6. For music: include lyrics, genre, instruments, and mood
7. For visuals: include detailed visual descriptions, colors, and composition
8. For campaigns: include multi-channel strategy with timeline

Generate the {req.content_type} now:
"""

        response = model.generate_content(prompt)
        return {
            "status": "success",
            "content": response.text,
            "metadata": {
                "brand": req.brand_name,
                "type": req.content_type,
                "language": req.language,
                "region": req.region,
                "tone": req.tone
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Chat / HelpDesk endpoint ───────────────────────────────────────
@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

        prompt = f"""
You are MuseAI's helpful support assistant. 
Answer in {req.language} language.
Be concise, friendly and helpful.
Only answer questions about MuseAI's features:
- Generating scripts, music, visuals, campaigns
- Supported languages (Tamil, Hindi, Malayalam, Telugu, Kannada, Marathi, Bengali, Gujarati, Punjabi, Urdu, English)
- How to use the platform
- Pricing and plans

User message: {req.message}
"""

        response = model.generate_content(prompt)
        return {"reply": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Cultural data endpoint (for presentation) ──────────────────────
@app.get("/cultural-data")
async def get_cultural_data():
    return {
        "status": "success",
        "supported_regions": list(CULTURAL_DATA["regions"].keys()),
        "supported_tones": list(CULTURAL_DATA["brand_tones"].keys()),
        "content_types": list(CULTURAL_DATA["content_types"].keys()),
        "total_festivals": sum(len(v) for v in CULTURAL_DATA["festivals"].values()),
        "emotional_triggers": CULTURAL_DATA["indian_ad_insights"]["emotional_triggers"],
        "seasonal_opportunities": CULTURAL_DATA["indian_ad_insights"]["seasonal_opportunities"]
    }


# ── Health check ───────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "status": "MuseAI API is running",
        "version": "2.0",
        "dataset": "Indian Cultural Context Dataset loaded",
        "regions": len(CULTURAL_DATA["regions"]),
        "languages": 11
    }