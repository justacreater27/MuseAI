import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = FastAPI(title="MuseAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset
DATASET = []
dataset_path = os.path.join(os.path.dirname(__file__), "data", "dataset.json")
if os.path.exists(dataset_path):
    with open(dataset_path, "r", encoding="utf-8") as f:
        DATASET = json.load(f)
    print(f"Dataset loaded successfully ({len(DATASET)} examples)")
else:
    print("No dataset found — running without examples")

def get_examples(content_type: str, n: int = 2) -> str:
    matches = [d for d in DATASET if d.get("type") == content_type][:n]
    if not matches:
        return ""
    block = "\n\nFEW-SHOT EXAMPLES (match this quality and cultural depth):\n"
    for i, ex in enumerate(matches, 1):
        block += f"\nExample {i}:\n{ex.get('content', '')}\n---"
    return block

class BrandInfo(BaseModel):
    brand: str
    industry: str
    audience: str
    tone: str
    theme: str
    output_language: str

class CultureProfile(BaseModel):
    region: str
    festival: str
    elements: List[str]
    language_style: str

class ScriptOptions(BaseModel):
    platform: str = "YouTube"
    duration: str = "30 seconds"
    style: str = "Storytelling"
    structure: str = "Problem to Solution to CTA"
    characters: str = "Young urban Indian couple"
    setting: str = "City neighbourhood"
    cta: str = "Download the app now"
    variants: int = 2
    draft: Optional[str] = ""

class VisualOptions(BaseModel):
    format: str = "Instagram Post (1:1)"
    style: str = "Vibrant and bold"
    palette: str = "Saffron, deep green, gold"
    setting: str = "Festival street"
    key_elements: str = "Brand logo, product, cultural motif"
    variants: int = 2

class MusicOptions(BaseModel):
    length: str = "15 seconds"
    genre: str = "Carnatic fusion"
    tempo: str = "Medium 90-110 BPM"
    vibe: str = "Joyful and celebratory"
    instruments: str = "Tabla, veena, acoustic guitar"
    variants: int = 2

class CampaignOptions(BaseModel):
    goal: str = "Brand awareness"
    duration: str = "4 weeks"
    budget: str = "5 to 10 Lakhs"
    channels: str = "Instagram, YouTube, WhatsApp"
    geography: str = "Pan-India"
    festival: str = "Diwali"
    variants: int = 1

class GenerateRequest(BaseModel):
    brand_info: BrandInfo
    culture: CultureProfile
    content_type: str
    script_options: Optional[ScriptOptions] = None
    visual_options: Optional[VisualOptions] = None
    music_options: Optional[MusicOptions] = None
    campaign_options: Optional[CampaignOptions] = None

class ChatRequest(BaseModel):
    message: str
    system: Optional[str] = "You are a helpful assistant for MuseAI."

def build_culture_block(culture: dict) -> str:
    elements_str = ", ".join(culture.get("elements", ["Everyday Indian life"]))
    return f"""INDIAN CULTURE REQUIREMENTS (MUST FOLLOW):
- Region focus: {culture.get("region")}
- Occasion/Festival: {culture.get("festival")}
- Language style: {culture.get("language_style")}
- Include authentic Indian cultural elements: {elements_str}
- Keep religious references respectful."""

def run_gemini(prompt: str, api_key: str) -> str:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt
    )
    return response.text.strip()

@app.get("/")
def root():
    return {"status": "MuseAI API is running"}

@app.get("/config/culture-data")
def get_culture_data():
    return {
        "languages": ["English","Tamil","Hindi","Malayalam","Telugu","Kannada","Marathi","Bengali","Gujarati","Punjabi","Urdu"],
        "regions": ["Pan-India","Tamil Nadu","Kerala","Karnataka","Telangana","Andhra Pradesh","Maharashtra","Gujarat","Punjab","West Bengal","Delhi/NCR","North India","North-East India"],
        "festivals": ["None / Everyday","Pongal","Diwali","Ramzan/Eid","Onam","Navratri/Durga Puja","Ganesh Chaturthi","Christmas (India)","Wedding season","Exam season","Monsoon season"],
        "cultural_elements": ["Local street market","Tea stall / chai kadai","Auto-rickshaw","College campus","Joint family home","Temple festival vibe","Local food","Neighborhood shopkeeper","Indian wedding vibe","Cricket moment","Metro/local bus","Festival decorations"],
        "tones": ["Emotional","Fun","Bold","Professional"],
        "content_types": ["script","visual","music","campaign"]
    }

# ── HelpDesk Chat endpoint ──────────────────────────────────────────
@app.post("/chat")
def chat(req: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set in .env")
    try:
        prompt = f"""SYSTEM: {req.system}

USER: {req.message}

Reply in 2-3 sentences max. Be friendly and helpful."""
        result = run_gemini(prompt, api_key)
        return {"output": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Main generate endpoint ──────────────────────────────────────────
@app.post("/generate")
def generate(req: GenerateRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set in .env")

    brand = req.brand_info.dict()
    culture = req.culture.dict()
    ct = req.content_type.lower()
    culture_block = build_culture_block(culture)
    examples = get_examples(ct)

    base = f"""Brand: {brand['brand']}
Industry: {brand['industry']}
Target Audience: {brand['audience']}
Tone: {brand['tone']}
Theme: {brand['theme']}
Output Language: {brand['output_language']} (use native script, no language mixing)

{culture_block}
{examples}

STRICT RULES:
- Output ONLY the requested content, no preamble
- Be deeply culturally authentic to India
- Use real Indian references, places, idioms where relevant
- Output in {brand['output_language']} as requested"""

    try:
        if ct == "script":
            o = req.script_options.dict() if req.script_options else {}
            draft_block = f"\n\nIMPROVE THIS DRAFT:\n{o.get('draft')}" if o.get("draft") else ""
            prompt = f"""{base}

Write {o.get('variants', 2)} variations of a {o.get('duration', '30 seconds')} {o.get('platform', 'YouTube')} ad script.
Style: {o.get('style')}. Structure: {o.get('structure')}.
Characters: {o.get('characters')}. Setting: {o.get('setting')}.
CTA: {o.get('cta')}.{draft_block}

Format each as:
SCRIPT [N]:
[Full script with scene directions]
---"""

        elif ct == "visual":
            o = req.visual_options.dict() if req.visual_options else {}
            prompt = f"""{base}

Create {o.get('variants', 2)} visual concepts for {o.get('format', 'Instagram Post')}.
Style: {o.get('style')}. Colors: {o.get('palette')}. Setting: {o.get('setting')}.
Must include: {o.get('key_elements')}.

Format each as:
VISUAL CONCEPT [N]:
HEADLINE:
LAYOUT:
IMAGERY:
COLOR STORY:
TYPOGRAPHY:
---"""

        elif ct == "music":
            o = req.music_options.dict() if req.music_options else {}
            prompt = f"""{base}

Create {o.get('variants', 2)} jingle concepts for a {o.get('length', '15 seconds')} ad.
Genre: {o.get('genre')}. Tempo: {o.get('tempo')}. Vibe: {o.get('vibe')}.
Instruments: {o.get('instruments')}.

Format each as:
JINGLE [N]:
LYRICS:
[lyrics here]
MOOD:
INSTRUMENTS:
ARRANGEMENT NOTES:
---"""

        elif ct == "campaign":
            o = req.campaign_options.dict() if req.campaign_options else {}
            prompt = f"""{base}

Design {o.get('variants', 1)} complete campaign plan(s).
Goal: {o.get('goal')}. Duration: {o.get('duration')}. Budget: {o.get('budget')}.
Channels: {o.get('channels')}. Geography: {o.get('geography')}. Festival: {o.get('festival')}.

Format as:
CAMPAIGN PLAN [N]:
KEY MESSAGE:
TARGET AUDIENCE INSIGHT:
CONTENT PILLARS:
WEEKLY PLAN:
CHANNEL STRATEGY:
KPIs:
---"""

        else:
            raise HTTPException(status_code=400, detail=f"Unknown content type: {ct}")

        result = run_gemini(prompt, api_key)
        return {"success": True, "content_type": ct, "output": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))