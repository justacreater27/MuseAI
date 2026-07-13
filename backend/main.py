import os
import json
import base64
import re
import httpx
import time
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="MuseAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://frontend-sage-gamma-22.vercel.app",
        "https://frontend-r6jvjs6ab-fouzuls-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load dataset ──────────────────────────────────────────────────────
DATASET = []
dataset_path = os.path.join(os.path.dirname(__file__), "data", "dataset.json")
if os.path.exists(dataset_path):
    with open(dataset_path, "r", encoding="utf-8") as f:
        DATASET = json.load(f)
    print(f"✅ Dataset loaded ({len(DATASET)} examples)")
else:
    print("⚠️  No dataset found — running without examples")


def get_examples(content_type: str, n: int = 2) -> str:
    matches = [d for d in DATASET if d.get("type") == content_type][:n]
    if not matches:
        return ""
    block = "\n\nFEW-SHOT EXAMPLES (match this quality and cultural depth):\n"
    for i, ex in enumerate(matches, 1):
        block += f"\nExample {i}:\n{ex.get('content', '')}\n---"
    return block


# ── Pydantic models ───────────────────────────────────────────────────
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


class ViralRequest(BaseModel):
    message: str
    system: Optional[str] = "You are a viral content strategist."
    ai_provider: Optional[str] = "grok"  # "grok" | "gemini"
    image_base64: Optional[str] = None
    image_mime_type: Optional[str] = None
    image_data: Optional[str] = None  # base64 encoded image
    image_type: Optional[str] = None  # e.g., "image/jpeg", "image/png"


# ── AI runners ────────────────────────────────────────────────────────
def run_gemini(prompt: str, api_key: str, image_data: Optional[str] = None, image_type: Optional[str] = None) -> str:
    client = genai.Client(api_key=api_key)
    
    # If image data is provided, use vision API
    if image_data and image_type:
        # Build content with image
        contents = [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": image_type,  # e.g., "image/jpeg"
                    "data": image_data,
                },
            },
            {
                "type": "text",
                "text": prompt,
            },
        ]
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents
        )
    else:
        # Text-only request
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
    
    return response.text.strip()


def run_gemini_with_image(prompt: str, image_base64: str, image_mime_type: str, api_key: str) -> str:
    client = genai.Client(api_key=api_key)
    image_bytes = base64.b64decode(image_base64)
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[
            prompt,
            types.Part.from_bytes(data=image_bytes, mime_type=image_mime_type),
        ],
    )
    return response.text.strip()


def run_grok(system: str, user_message: str, api_key: str) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "grok-3-latest",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user",   "content": user_message},
        ],
        "max_tokens": 4000,
        "temperature": 0.85,
    }
    with httpx.Client(timeout=90.0) as client:
        response = client.post(
            "https://api.x.ai/v1/chat/completions",
            headers=headers,
            json=payload,
        )
        if response.status_code != 200:
            raise Exception(
                f"Grok API error {response.status_code}: {response.text}"
            )
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()


def is_gemini_access_error(error_text: str) -> bool:
    text = error_text.lower()
    return any(token in text for token in [
        "permission_denied",
        "reported as leaked",
        "api key",
        "quota",
        "resource_exhausted",
        "403",
    ])


def build_local_generate_fallback(req: GenerateRequest) -> str:
    brand = req.brand_info.dict()
    culture = req.culture.dict()
    ct = req.content_type.lower()

    brand_name = brand.get("brand") or "Your Brand"
    industry = brand.get("industry") or "your industry"
    audience = brand.get("audience") or "your audience"
    tone = brand.get("tone") or "clear"
    theme = brand.get("theme") or "your theme"
    output_language = brand.get("output_language") or "English"
    region = culture.get("region") or "Pan-India"
    festival = culture.get("festival") or "Everyday"

    if ct == "script":
        return f"""SCRIPT 1:
Scene 1: A {region.lower()} setting introduces {brand_name}, a brand for {audience} in {industry}.
Scene 2: The problem around {theme.lower()} is shown clearly.
Scene 3: {brand_name} solves it with a {tone.lower()} message that feels native to {festival.lower()} moments.
CTA: Invite viewers to take action today.
---
SCRIPT 2:
Scene 1: A relatable day in the life of {audience}.
Scene 2: The tension builds around the core need.
Scene 3: {brand_name} delivers the answer in a simple, memorable way.
CTA: Download, try, or sign up now.
---"""

    if ct == "visual":
        return f"""VISUAL CONCEPT 1:
HEADLINE: {brand_name} for {audience}
LAYOUT: Bold hero visual with clear product focus and cultural accents from {region}.
IMAGERY: Authentic, real-world scene tied to {theme}.
COLOR STORY: Warm, premium, India-ready palette.
TYPOGRAPHY: Strong headline with clean supporting copy.
---
VISUAL CONCEPT 2:
HEADLINE: Make {brand_name} memorable
LAYOUT: Split layout with social proof and product detail.
IMAGERY: Everyday Indian context, styled for trust.
COLOR STORY: Balanced contrast with accent highlights.
TYPOGRAPHY: Modern, high-clarity, mobile-first.
---"""

    if ct == "music":
        return f"""JINGLE 1:
LYRICS:
{brand_name}, made for you and me
Built for {audience}, clear and easy
MOOD: Uplifting and memorable
INSTRUMENTS: Tabla, clap, soft synth
ARRANGEMENT NOTES: Start simple, end with a strong sing-along hook.
---
JINGLE 2:
LYRICS:
From {region} to every screen
{brand_name} keeps the message clean
MOOD: Warm, catchy, and confident
INSTRUMENTS: Percussion, flute, acoustic layers
ARRANGEMENT NOTES: Keep the hook short and repeatable.
---"""

    return f"""CAMPAIGN PLAN 1:
KEY MESSAGE: {brand_name} helps {audience} in {industry} move faster with clarity.
TARGET AUDIENCE INSIGHT: People respond to simple, trustworthy messaging tied to real outcomes.
CONTENT PILLARS:
1. Trust
2. Clarity
3. Cultural relevance
WEEKLY PLAN:
Week 1: Introduce the problem and promise.
Week 2: Show product benefits and proof.
Week 3: Share customer stories.
Week 4: Drive conversions with a clear CTA.
CHANNEL STRATEGY: Instagram, YouTube, and WhatsApp for local reach.
KPIs: Click-through rate, saves, and conversions.
Output language: {output_language}.
---"""


def build_local_chat_fallback() -> str:
    return "I’m having trouble reaching the AI provider right now, but the app itself is working. Try again in a moment or switch provider if available."


# ── Helpers ───────────────────────────────────────────────────────────
def build_culture_block(culture: dict) -> str:
    elements_str = ", ".join(culture.get("elements", ["Everyday Indian life"]))
    return f"""INDIAN CULTURE REQUIREMENTS (MUST FOLLOW):
- Region focus: {culture.get("region")}
- Occasion/Festival: {culture.get("festival")}
- Language style: {culture.get("language_style")}
- Include authentic Indian cultural elements: {elements_str}
- Keep religious references respectful."""


def build_local_brand_fallback(req: ViralRequest) -> str:
    message = req.message or ""

    def extract(label: str, fallback: str = "Not specified") -> str:
        pattern = rf"{label}:\s*(.+?)(?=\n[A-Z ]+:|$)"
        match = re.search(pattern, message, re.IGNORECASE | re.DOTALL)
        if match:
            value = match.group(1).strip()
            return value or fallback
        return fallback

    industry = extract("INDUSTRY")
    audience = extract("TARGET AUDIENCE")
    problem = extract("CORE PROBLEM SOLVED")
    vibe = extract("BRAND VIBE")
    personality = extract("BRAND PERSONALITY")
    tone = extract("TONE OF VOICE")
    scope = extract("MARKET SCOPE")
    language = extract("OUTPUT LANGUAGE", "English")

    brand_name = industry.split(",")[0].strip() if industry != "Not specified" else "Your Brand"
    if not brand_name:
        brand_name = "Your Brand"

    return f"""---BRAND NAMES---
1. {brand_name} Forge | A strong, modern name built for growth and clarity
2. {brand_name} Story | A name that turns your brand into something memorable

---TAGLINES---
1. Build trust. Grow faster.
2. Made for {audience}.

---BRAND STRATEGY---
Mission: Help {audience.lower()} solve {problem.lower()} with a clear and credible brand system.
Vision: Become the most trusted and recognizable brand in this space.
Unique Value Proposition: A focused, practical, and India-ready brand identity tailored to {scope.lower()} audiences.
Positioning Statement: For {audience}, {brand_name} delivers a {vibe.lower()} experience with a {tone.lower()} voice.
Core Values:
— Clarity
— Trust
— Consistency
Competitor Differentiation: Fast, practical, and culturally relevant brand direction instead of generic advice.

---TARGET PERSONA---
Persona Name: Primary Decision Maker
Age: 24-40
Location: India
Occupation: Founder, marketer, or business owner
Monthly Income: Varies
Goals: Build a memorable brand and grow confidently
Pain Points: Generic branding, unclear messaging, inconsistent identity
Daily Behavior: Uses mobile-first tools, social media, and quick decision workflows
Why They Choose This Brand: It saves time and gives a clear direction
Quote: "I need a brand that feels real and works in the market."

---BRAND IDENTITY---
Logo Style Direction: Clean, modern, and scalable with a memorable symbol
Primary Color: (#B8973A) — warm premium gold
Secondary Color: (#8BAF8D) — calm growth green
Accent Color: (#4A9B9B) — digital trust teal
Background Color: (#FAF7F0) — soft neutral canvas
Primary Font: Cormorant Garamond or a similar elegant serif
Secondary Font: Jost or a similar clean sans serif
Visual Mood: Confident, premium, and approachable
Design Inspiration: Indian modern craft blended with startup minimalism

---BRAND VOICE---
Personality Traits: {personality}
What the Brand Sounds Like: Clear, helpful, and confident
What the Brand Never Says: Vague claims or generic marketing fluff
Sample Instagram Caption: Build a brand that speaks before you do.
Sample LinkedIn Post Opening: Great brands are not accidental. They are designed.
Sample WhatsApp Broadcast: Here is your next clear step for better brand growth.

---CONTENT STRATEGY---
Content Pillars:
1. Education
2. Proof
3. Trust
4. Culture
5. Growth

10 Content Ideas:
1. Brand audit checklist
2. Before/after positioning story
3. Customer transformation example
4. Founder insight post
5. Naming breakdown
6. Mistakes to avoid
7. Cultural brand inspiration
8. Product trust builder
9. Behind-the-scenes process
10. Growth tip carousel

Viral Content Angle: Show how a clear brand system removes confusion and increases trust.
Platform Strategy:
Instagram: Visual proof, carousels, and reels
LinkedIn: Founder-led insights and case studies
YouTube: Short explainers and brand breakdowns
WhatsApp: Conversion-focused updates and direct offers

---PRODUCT BRANDING---
Service/Product Naming Ideas:
1. Brand Launch
2. Brand Blueprint
3. Identity Kit
Pricing Perception Strategy: Offer clear tiers with premium anchoring
Packaging/Presentation Language: Simple, polished, and outcome-focused
Customer Journey:
Awareness: See a strong promise
Interest: Understand the value quickly
Decision: Compare clear deliverables
Retention: Repeatable brand support and updates

---GROWTH STRATEGY---
30-Day Launch Plan:
Week 1: Finalize brand direction and core messaging
Week 2: Publish content and collect feedback
Week 3: Start outreach and partnerships
Week 4: Optimize based on response and conversions

Organic Growth Tactics:
1. Share before/after examples
2. Post founder insights
3. Educate with short practical content
4. Use social proof
5. Collaborate with relevant creators

Collaboration Ideas: Work with founders, creators, and community pages
Key Metric to Track: Leads, saves, and conversion rate

---BONUS ASSETS---
Domain Name Ideas:
1. {brand_name.lower().replace(' ', '')}.com
2. {brand_name.lower().replace(' ', '')}studio.com
3. get{brand_name.lower().replace(' ', '')}.com

Instagram Handle Ideas:
1. @{brand_name.lower().replace(' ', '')}
2. @{brand_name.lower().replace(' ', '')}studio
3. @{brand_name.lower().replace(' ', '')}official

Brand Hashtag: #{brand_name.replace(' ', '')}
Community Hashtags: #BrandBuilding #StartupGrowth #BrandStrategy
Niche Hashtags: #IndianBrands #SaaSBranding #FounderBrand
Indian Market Hashtags: #StartupIndia #MadeForIndia #DesiBusiness

Final Brand Mantra: Build with clarity, grow with trust.

Output language: {language}. Be highly specific."""


# ── Routes ────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "MuseAI API is running",
        "ai_providers": ["grok", "gemini"],
    }


@app.get("/config/culture-data")
def get_culture_data():
    return {
        "languages": [
            "English", "Tamil", "Hindi", "Malayalam", "Telugu",
            "Kannada", "Marathi", "Bengali", "Gujarati", "Punjabi", "Urdu",
        ],
        "regions": [
            "Pan-India", "Tamil Nadu", "Kerala", "Karnataka", "Telangana",
            "Andhra Pradesh", "Maharashtra", "Gujarat", "Punjab",
            "West Bengal", "Delhi/NCR", "North India", "North-East India",
        ],
        "festivals": [
            "None / Everyday", "Pongal", "Diwali", "Ramzan/Eid", "Onam",
            "Navratri/Durga Puja", "Ganesh Chaturthi", "Christmas (India)",
            "Wedding season", "Exam season", "Monsoon season",
        ],
        "cultural_elements": [
            "Local street market", "Tea stall / chai kadai", "Auto-rickshaw",
            "College campus", "Joint family home", "Temple festival vibe",
            "Local food", "Neighborhood shopkeeper", "Indian wedding vibe",
            "Cricket moment", "Metro/local bus", "Festival decorations",
        ],
        "tones": ["Emotional", "Fun", "Bold", "Professional"],
        "content_types": ["script", "visual", "music", "campaign"],
    }


@app.get("/ai/providers")
def get_ai_providers():
    gemini_ok = bool(os.getenv("GEMINI_API_KEY"))
    grok_ok   = bool(os.getenv("XAI_API_KEY"))
    return {
        "providers": [
            {
                "id": "grok",
                "name": "Grok",
                "model": "grok-3-latest",
                "available": grok_ok,
                "badge": "🔥 Recommended",
            },
            {
                "id": "gemini",
                "name": "Gemini",
                "model": "gemini-2.5-flash-lite",
                "available": gemini_ok,
                "badge": "⚡ Fast",
            },
        ]
    }


# ── HelpDesk Chat (Gemini — short replies) ────────────────────────────
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
        error_text = str(e)
        if is_gemini_access_error(error_text):
            xai_api_key = os.getenv("XAI_API_KEY")
            if xai_api_key:
                try:
                    result = run_grok(req.system or "You are a helpful assistant for MuseAI.", req.message, xai_api_key)
                    return {"output": result}
                except Exception:
                    return {"output": build_local_chat_fallback()}
            return {"output": build_local_chat_fallback()}
        raise HTTPException(status_code=500, detail=error_text)


# ── Viral / LinkedIn content (Grok or Gemini) ─────────────────────────
@app.post("/viral")
def viral_generate(req: ViralRequest):
    provider = (req.ai_provider or "grok").lower()

    full_system = f"""{req.system}

CRITICAL RULES — NEVER BREAK THESE:
1. Write COMPLETE, PUBLISH-READY content. Zero placeholder text like [text here].
2. Use EXACTLY the ---SECTION NAME--- delimiters as given.
3. Every hook, script, and caption must be specific to the topic provided.
4. Write as a professional content creator, not as an AI assistant.
5. Match the platform tone, algorithm preferences, and audience expectations perfectly.
6. Output must be detailed, thorough, and immediately usable without editing."""

    try:
        if req.image_base64:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise HTTPException(
                    status_code=500, detail="GEMINI_API_KEY not set in .env"
                )
            image_prompt = f"""{full_system}

USER REQUEST:
{req.message}

Use the attached image as the primary source of truth. Describe only what is visible and write captions that match the uploaded image exactly."""
            result = run_gemini_with_image(
                image_prompt,
                req.image_base64,
                req.image_mime_type or "image/jpeg",
                api_key,
            )
            provider = "gemini"

        elif provider == "grok":
            api_key = os.getenv("XAI_API_KEY")
            if not api_key:
                raise HTTPException(
                    status_code=500, detail="XAI_API_KEY not set in .env"
                )
            result = run_grok(full_system, req.message, api_key)

        else:  # gemini fallback
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise HTTPException(
                    status_code=500, detail="GEMINI_API_KEY not set in .env"
                )
            
            # If image data is present, pass it to run_gemini for vision processing
            if req.image_data and req.image_type:
                result = run_gemini(req.message, api_key, req.image_data, req.image_type)
            else:
                # Text-only request
                combined = f"SYSTEM: {full_system}\n\nUSER: {req.message}"
                try:
                    result = run_gemini(combined, api_key)
                except Exception as gemini_error:
                    error_text = str(gemini_error).lower()
                    xai_api_key = os.getenv("XAI_API_KEY")
                    if xai_api_key and ("429" in error_text or "quota" in error_text or "resource_exhausted" in error_text or "permission_denied" in error_text or "reported as leaked" in error_text):
                        try:
                            result = run_grok(full_system, req.message, xai_api_key)
                            provider = "grok"
                        except Exception:
                            result = build_local_brand_fallback(req)
                            provider = "local_fallback"
                    else:
                        result = build_local_brand_fallback(req)
                        provider = "local_fallback"

        return {"output": result, "provider": provider}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── History storage (simple file-based) ─────────────────────────────────
history_path = os.path.join(os.path.dirname(__file__), 'data', 'history.json')

def load_history():
    if not os.path.exists(history_path):
        return []
    try:
        with open(history_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def save_history(records):
    os.makedirs(os.path.dirname(history_path), exist_ok=True)
    with open(history_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)


@app.get('/history')
def get_history(user_id: str):
    all_records = load_history()
    user_records = [r for r in all_records if r.get('user_id') == user_id]
    # sort by timestamp desc
    try:
        user_records.sort(key=lambda r: r.get('timestamp', ''), reverse=True)
    except Exception:
        pass
    return {'history': user_records}


@app.post('/history')
def post_history(payload: dict = None):
    if payload is None:
        raise HTTPException(status_code=400, detail='Invalid payload')
    user_id = payload.get('user_id')
    entry = payload.get('entry') or {}
    if not user_id or not entry:
        raise HTTPException(status_code=400, detail='user_id and entry are required')

    records = load_history()
    new_rec = dict(entry)
    # server-side id and timestamp
    new_rec.update({'user_id': user_id, 'id': int(time.time() * 1000)})
    if not new_rec.get('timestamp'):
        new_rec['timestamp'] = datetime.utcnow().isoformat()
    records.append(new_rec)
    save_history(records)
    return {'saved': True, 'entry': new_rec}


@app.post('/history/sync')
def sync_history(payload: dict = None):
    if payload is None:
        raise HTTPException(status_code=400, detail='Invalid payload')
    user_id = payload.get('user_id')
    entries = payload.get('entries') or []
    if not user_id or not isinstance(entries, list):
        raise HTTPException(status_code=400, detail='user_id and entries[] are required')

    records = load_history()
    added = []
    for e in entries:
        rec = dict(e)
        rec.update({'user_id': user_id, 'id': int(time.time() * 1000)})
        if not rec.get('timestamp'):
            rec['timestamp'] = datetime.utcnow().isoformat()
        records.append(rec)
        added.append(rec)

    save_history(records)
    # return full user history
    user_records = [r for r in records if r.get('user_id') == user_id]
    user_records.sort(key=lambda r: r.get('timestamp', ''), reverse=True)
    return {'synced': True, 'history': user_records}


# ── Main generate endpoint (Gemini) ──────────────────────────────────
@app.post("/generate")
def generate(req: GenerateRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set in .env")

    brand   = req.brand_info.dict()
    culture = req.culture.dict()
    ct      = req.content_type.lower()
    culture_block = build_culture_block(culture)
    examples      = get_examples(ct)

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
            draft_block = (
                f"\n\nIMPROVE THIS DRAFT:\n{o.get('draft')}"
                if o.get("draft") else ""
            )
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
            raise HTTPException(
                status_code=400, detail=f"Unknown content type: {ct}"
            )

        try:
            result = run_gemini(prompt, api_key)
            return {"success": True, "content_type": ct, "output": result, "provider": "gemini"}
        except Exception as gemini_error:
            error_text = str(gemini_error)
            if is_gemini_access_error(error_text):
                xai_api_key = os.getenv("XAI_API_KEY")
                if xai_api_key:
                    try:
                        result = run_grok(
                            "You are MuseAI, an expert Indian creative strategist. Return only the requested content with clean structure.",
                            prompt,
                            xai_api_key,
                        )
                        return {"success": True, "content_type": ct, "output": result, "provider": "grok"}
                    except Exception:
                        pass
                return {"success": True, "content_type": ct, "output": build_local_generate_fallback(req), "provider": "local_fallback"}
            raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))