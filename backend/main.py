import os
import json
import base64
import re
import httpx
import time
import sys
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types
from backend.content_calendar.router import router as content_calendar_router

# Windows terminals often default to cp1252, which cannot encode the Unicode
# status symbols used in request logs. Prevent a log message from failing an
# otherwise valid API request.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(errors="backslashreplace")

# ── Optional RAG Trend Intelligence ──────────────────────────────
try:
    from backend.rag.retriever import retrieve_trends, format_trends_for_prompt
except ImportError:
    retrieve_trends = None
    format_trends_for_prompt = None


# Import social media and database modules
try:
    from social_media_integration import (
        LinkedInShareRequest,
        InstagramShareRequest,
        social_media_manager,
    )
except ImportError:
    try:
        from backend.social_media_integration import (
            LinkedInShareRequest,
            InstagramShareRequest,
            social_media_manager,
        )
    except ImportError:
        social_media_manager = None

try:
    from database_manager import db_manager
except ImportError:
    try:
        from backend.database_manager import db_manager
    except ImportError:
        db_manager = None

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI(title="MuseAI API")
app.include_router(
    content_calendar_router
)

configured_origins = os.getenv("FRONTEND_ORIGINS", "")
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://museai-frontend.onrender.com",
    *[origin.strip() for origin in configured_origins.split(",") if origin.strip()],
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
    # Keep startup logging compatible with the default Windows cp1252 console.
    print(f"Dataset loaded ({len(DATASET)} examples)")
else:
    print("No dataset found; running without examples")


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
    ai_provider: Optional[str] = "groq"  # "groq" | "gemini"
    image_base64: Optional[str] = None
    image_mime_type: Optional[str] = None
    image_data: Optional[str] = None  # base64 encoded image
    image_type: Optional[str] = None  # e.g., "image/jpeg", "image/png"


# ── AI runners ────────────────────────────────────────────────────────
def run_gemini(
    prompt: str,
    api_key: str,
    image_data: Optional[str] = None,
    image_type: Optional[str] = None,
    system_instruction: Optional[str] = None,
) -> str:
    """Generate text with Gemini, optionally with an image."""
    client = genai.Client(api_key=api_key)

    config = (
        types.GenerateContentConfig(system_instruction=system_instruction)
        if system_instruction
        else None
    )

    if image_data and image_type:
        image_bytes = base64.b64decode(image_data)
        contents = [
            types.Part.from_bytes(data=image_bytes, mime_type=image_type),
            prompt,
        ]
    else:
        contents = prompt

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=contents,
        config=config,
    )

    if not response or not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    return response.text.strip()


def run_gemini_with_image(prompt: str, image_base64: str, image_mime_type: str, api_key: str) -> str:
    client = genai.Client(api_key=api_key)
    image_bytes = base64.b64decode(image_base64)
    contents = [
        prompt,
        types.Part.from_bytes(data=image_bytes, mime_type=image_mime_type),
    ]
    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=contents,
        )
    except Exception as error:
        # Vision capacity can temporarily throttle the full model; retry with
        # the lighter vision model before surfacing an error to the user.
        if "503" not in str(error) and "unavailable" not in str(error).lower():
            raise
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=contents,
        )
    return response.text.strip()


def run_groq(system: str, user_message: str, api_key: str) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "openai/gpt-oss-120b",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user",   "content": user_message},
        ],
        "max_tokens": 4000,
        "temperature": 0.85,
    }
    with httpx.Client(timeout=90.0) as client:
        response = client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
        )
        if response.status_code != 200:
            raise Exception(
                f"Groq API error {response.status_code}: {response.text}"
            )
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()


def run_groq_with_image(
    system: str,
    user_message: str,
    image_data: str,
    image_type: str,
    api_key: str,
) -> str:
    """Generate text from an image using Groq's vision capable Qwen model."""
    image_bytes = base64.b64decode(image_data)
    data_url = f"data:{image_type};base64,{base64.b64encode(image_bytes).decode('ascii')}"
    payload = {
        "model": "qwen/qwen3.8-27b",
        "messages": [
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_message},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            },
        ],
        "max_tokens": 4000,
        "temperature": 0.7,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    with httpx.Client(timeout=90.0) as client:
        response = client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
        )
    if response.status_code != 200:
        raise RuntimeError(f"Groq vision API error {response.status_code}: {response.text}")
    result = response.json()["choices"][0]["message"]["content"]
    if not result:
        raise RuntimeError("Groq vision returned an empty response.")
    return result.strip()


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


SUPPORTED_LANGUAGES = {
    "English": "English",
    "Tamil": "Tamil (தமிழ்)",
    "Hindi": "Hindi (हिन्दी)",
    "Telugu": "Telugu (తెలుగు)",
    "Malayalam": "Malayalam (മലയാളം)",
    "Kannada": "Kannada (ಕನ್ನಡ)",
    "Bengali": "Bengali (বাংলা)",
    "Marathi": "Marathi (मराठी)",
    "Gujarati": "Gujarati (ગુજરાતી)",
    "Punjabi": "Punjabi (ਪੰਜਾਬੀ)",
    "Urdu": "Urdu (اردو)",
}

LANGUAGE_RULES = {
    "English": "Write naturally in English.",
    "Tamil": "Write entirely in Tamil using Tamil Unicode script (தமிழ்). Do not use Romanized Tamil.",
    "Hindi": "Write entirely in Hindi using Devanagari script (हिन्दी). Do not use Romanized Hindi.",
    "Telugu": "Write entirely in Telugu using Telugu Unicode script (తెలుగు). Do not use Romanized Telugu.",
    "Malayalam": "Write entirely in Malayalam using Malayalam Unicode script (മലയാളം). Do not use Romanized Malayalam.",
    "Kannada": "Write entirely in Kannada using Kannada Unicode script (ಕನ್ನಡ). Do not use Romanized Kannada.",
    "Bengali": "Write entirely in Bengali using Bengali Unicode script (বাংলা). Do not use Romanized Bengali.",
    "Marathi": "Write entirely in Marathi using Devanagari script (मराठी). Do not use Romanized Marathi.",
    "Gujarati": "Write entirely in Gujarati using Gujarati Unicode script (ગુજરાતી). Do not use Romanized Gujarati.",
    "Punjabi": "Write entirely in Punjabi using Gurmukhi script (ਪੰਜਾਬੀ). Do not use Romanized Punjabi.",
    "Urdu": "Write entirely in Urdu using Urdu/Arabic script (اردو). Do not use Romanized Urdu.",
}

SCRIPT_RANGES = {
    "Tamil": (0x0B80, 0x0BFF),
    "Hindi": (0x0900, 0x097F),
    "Marathi": (0x0900, 0x097F),
    "Telugu": (0x0C00, 0x0C7F),
    "Malayalam": (0x0D00, 0x0D7F),
    "Kannada": (0x0C80, 0x0CFF),
    "Bengali": (0x0980, 0x09FF),
    "Gujarati": (0x0A80, 0x0AFF),
    "Punjabi": (0x0A00, 0x0A7F),
    "Urdu": (0x0600, 0x06FF),
}

def normalize_language(language: str) -> str:
    """Normalize frontend language labels to the canonical language name."""
    value = (language or "English").strip()
    if value in SUPPORTED_LANGUAGES:
        return value

    lower = value.lower()
    for name in SUPPORTED_LANGUAGES:
        if lower == name.lower() or lower.startswith(name.lower() + " "):
            return name

    aliases = {
        "tamil (தமிழ்)": "Tamil",
        "hindi (हिन्दी)": "Hindi",
        "telugu (తెలుగు)": "Telugu",
        "malayalam (മലയാളം)": "Malayalam",
        "kannada (ಕನ್ನಡ)": "Kannada",
        "bengali (বাংলা)": "Bengali",
        "marathi (मराठी)": "Marathi",
        "gujarati (ગુજરાતી)": "Gujarati",
        "punjabi (ਪੰਜਾਬੀ)": "Punjabi",
        "urdu (اردو)": "Urdu",
    }
    return aliases.get(lower, "English")


def build_language_instruction(language: str) -> str:
    language = normalize_language(language)
    rule = LANGUAGE_RULES.get(
        language,
        f"Write naturally in {language} using its standard native script.",
    )

    return f"""
MUSEAI LANGUAGE POLICY — ABSOLUTE AND NON-NEGOTIABLE

SELECTED OUTPUT LANGUAGE: {language}

{rule}

The final answer MUST be written in {language}.

For a non-English language, ALL of these must be in the selected native
script:
- titles and headings
- concepts and audience insights
- scene descriptions
- dialogue and voiceover
- audio/SFX descriptions
- on-screen text and captions
- production notes
- CTA
- labels and explanations

DO NOT:
- answer in English
- write an English template with only dialogue translated
- transliterate the requested language into Latin/English letters
- mix English sentences with the requested language
- use English headings for regional-language content
- write Romanized Tamil/Hindi/Telugu/Malayalam/Kannada/etc.

English is allowed only for:
- an exact user-supplied brand/product name
- a URL
- a technical identifier
- an unavoidable proper noun
- exact text the user explicitly asked to preserve

IMPORTANT:
The requested language is not merely the dialogue language.
The ENTIRE creative response must be localized.

FINAL CHECK BEFORE RESPONSE:
1. Inspect every line.
2. If the selected language is not English, rewrite unnecessary English prose
   into the selected native script.
3. Do not return analysis or an explanation of the translation.
4. Return ONLY the final creative content.
"""


def _native_script_ratio(text: str, language: str) -> float:
    """Estimate how much alphabetic text is in the requested Unicode script."""
    language = normalize_language(language)
    if language == "English":
        return 1.0

    lo, hi = SCRIPT_RANGES.get(language, (0, 0))
    native = latin = 0

    for ch in text:
        if ch.isalpha():
            code = ord(ch)
            if lo <= code <= hi:
                native += 1
            elif "LATIN" in __import__("unicodedata").name(ch, ""):
                latin += 1

    total = native + latin
    return native / total if total else 1.0


def needs_language_correction(text: str, language: str) -> bool:
    """Return True when a regional-language response is mostly Latin/English."""
    language = normalize_language(language)
    if language == "English":
        return False

    ratio = _native_script_ratio(text or "", language)
    # A normal regional-language answer should have substantial native script.
    # Brand names/URLs can remain Latin, so we use a deliberately conservative
    # threshold rather than requiring 100% native characters.
    return ratio < 0.45


def build_language_correction_prompt(
    generated: str,
    language: str,
) -> str:
    language = normalize_language(language)
    return f"""
REWRITE THE FOLLOWING CREATIVE CONTENT INTO {language}.

{build_language_instruction(language)}

This is a correction pass. Preserve:
- the exact creative idea
- brand/product names
- facts and numbers
- scene timings
- structure
- CTA intent
- production details

Translate/localize the actual prose, headings, dialogue, voiceover, captions,
scene directions, labels, and CTA into natural {language}.

DO NOT summarize.
DO NOT remove details.
DO NOT explain what you changed.
DO NOT output an English version.

SOURCE CONTENT:
----------------
{generated}
----------------

Return ONLY the corrected {language} creative content.
"""

def build_native_fallback(language: str) -> str:
    """Never silently return an English fallback for a regional language."""
    language = normalize_language(language)

    if language == "Tamil":
        return "மன்னிக்கவும். தமிழ் மொழியில் உள்ளடக்கத்தை உருவாக்குவதில் தற்போது சிக்கல் ஏற்பட்டுள்ளது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
    if language == "Hindi":
        return "क्षमा करें। हिन्दी में सामग्री तैयार करने में अभी समस्या हुई है। कृपया पुनः प्रयास करें।"
    if language == "Telugu":
        return "క్షమించండి. తెలుగులో కంటెంట్ రూపొందించడంలో ప్రస్తుతం సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి."
    if language == "Malayalam":
        return "ക്ഷമിക്കണം. മലയാളത്തിൽ ഉള്ളടക്കം സൃഷ്ടിക്കുന്നതിൽ ഇപ്പോൾ ഒരു പ്രശ്നമുണ്ടായി. ദയവായി വീണ്ടും ശ്രമിക്കുക."
    if language == "Kannada":
        return "ಕ್ಷಮಿಸಿ. ಕನ್ನಡದಲ್ಲಿ ವಿಷಯವನ್ನು ರಚಿಸುವಾಗ ಪ್ರಸ್ತುತ ಸಮಸ್ಯೆ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
    if language == "Bengali":
        return "দুঃখিত। বাংলায় বিষয়বস্তু তৈরি করতে বর্তমানে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
    if language == "Marathi":
        return "क्षमस्व. मराठीत सामग्री तयार करताना सध्या समस्या आली आहे. कृपया पुन्हा प्रयत्न करा."
    if language == "Gujarati":
        return "માફ કરશો. ગુજરાતીમાં સામગ્રી બનાવવામાં હાલમાં સમસ્યા આવી છે. કૃપા કરીને ફરી પ્રયાસ કરો."
    if language == "Punjabi":
        return "ਮਾਫ਼ ਕਰਨਾ। ਪੰਜਾਬੀ ਵਿੱਚ ਸਮੱਗਰੀ ਬਣਾਉਣ ਵਿੱਚ ਇਸ ਵੇਲੇ ਸਮੱਸਿਆ ਆਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
    if language == "Urdu":
        return "معذرت۔ اردو میں مواد تیار کرنے میں فی الحال مسئلہ پیش آیا ہے۔ براہِ کرم دوبارہ کوشش کریں۔"

    return "Sorry. Content generation is temporarily unavailable. Please try again."



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
        options = req.script_options.dict() if req.script_options else {}
        platform = options.get("platform") or "YouTube"
        duration = options.get("duration") or "30 seconds"
        style = options.get("style") or "Storytelling"
        structure = options.get("structure") or "Problem to Solution to CTA"
        characters = options.get("characters") or f"A relatable member of {audience}"
        setting = options.get("setting") or f"A real {region} neighborhood"
        cta = options.get("cta") or f"Choose {brand_name} today"
        variants = max(1, min(int(options.get("variants") or 2), 3))
        draft = options.get("draft") or ""
        draft_note = (
            f"\nDRAFT IMPROVEMENT NOTE: Preserve the useful intent of this draft while making it more specific:\n{draft}\n"
            if draft else ""
        )

        scripts = [f"""SCRIPT 1: THE EVERYDAY SWITCH
    Platform: {platform}
    Duration: {duration}
    Style: {style}
    Structure: {structure}
    Audience insight: {audience} want a practical choice that fits their real routine without losing the feeling of {theme.lower()}.

    SCENE 1 - 0:00-0:05 - THE MORNING PRESSURE
    Location: {setting}, early morning during a normal {festival.lower()} day.
    Characters: {characters}.
    Visual: A phone alarm shows 7:45 AM. A half-packed bag, an unfinished breakfast, and a crowded commute notification establish the pressure. The camera moves from the clock to the character's tired expression.
    Dialogue: CHARACTER: "Already late... and I still need one good thing to start the day."
    Audio: Alarm stops, kettle/traffic ambience, then a soft rhythmic beat begins.
    On-screen text: "Busy day. Real needs."

    SCENE 2 - 0:05-0:12 - THE RELATABLE PROBLEM
    Visual: At a local food moment in {region}, the character sees other people sharing a familiar everyday moment. The character hesitates because the usual option feels generic, inconvenient, or disconnected from the promise of {theme.lower()}.
    Dialogue: FRIEND: "Why settle for something that does not feel made for your day?"
    Audio: Ambient sound briefly drops, leaving the question clear.
    On-screen text: "What if the better choice felt this easy?"

    SCENE 3 - 0:12-0:21 - THE BRAND SOLUTION
    Visual: {brand_name} enters in a clean close-up. Show the pack/product/service clearly, including one distinctive detail that proves its value for {industry}. The character uses it in the same setting without interrupting the routine. Cut to a genuine smile and a second person joining the moment.
    Voiceover: "Meet {brand_name}: a {industry} choice designed around real people, real routines, and the everyday feeling of {theme.lower()}."
    Audio: Beat opens into warm percussion with a subtle regional texture.
    On-screen text: "Specific to your day. Made to be remembered."

    SCENE 4 - 0:21-0:27 - THE EMOTIONAL PAYOFF
    Visual: Two or three quick shots show the product/service becoming part of the moment: a hand passing it across the table, a relaxed commute, and a shared smile. Keep the brand visible but natural.
    Dialogue: CHARACTER: "This is the kind of everyday change you actually notice."
    Voiceover: "{brand_name}. A better way to bring {theme.lower()} into the moments that matter."

    SCENE 5 - 0:27-0:30 - CTA
    Visual: Hero product shot with logo, brand color, website/app handle, and a simple cultural detail from {region}. Hold for the final two seconds.
    Voiceover: "{cta}."
    On-screen text: "{cta} | {brand_name}"
    Audio: Brand sound mark and one clean percussion accent.
    Production notes: Shoot in natural light, use close-ups for trust, keep subtitles on for mobile viewing, and show the product within the first 12 seconds.
    """,
        f"""SCRIPT 2: THE SHARED MOMENT
    Platform: {platform}
    Duration: {duration}
    Style: {style}
    Structure: Hook to story to offer
    Audience insight: {audience} are more likely to remember a brand when its benefit appears inside a recognizable Indian moment rather than as a generic claim.

    SCENE 1 - 0:00-0:04 - THE HOOK
    Location: {setting}.
    Visual: Start on a specific detail: a crowded table, a tea stall exchange, a ringing phone, or a shared snack being passed from one person to another. Reveal {characters} in the middle of the moment.
    Dialogue: CHARACTER 1: "The best moments are never planned."
    On-screen text: "Some moments just happen."
    Audio: One natural location sound, followed by a warm beat.

    SCENE 2 - 0:04-0:11 - THE TENSION
    Visual: The group realizes that the usual choice does not match the need: it is too inconvenient, too ordinary, or fails to bring people together around {theme.lower()}. Use three fast reaction shots, not a generic problem montage.
    Dialogue: CHARACTER 2: "We have five minutes, one decision, and everyone wants something different."
    Audio: Beat pauses for half a second, then resumes with light hand percussion.

    SCENE 3 - 0:11-0:19 - THE DISCOVERY
    Visual: A character introduces {brand_name}. Show exactly how it solves the problem in one action. Include a close-up of the key feature, benefit, or experience that makes it different in {industry}.
    Dialogue: CHARACTER 1: "Try {brand_name}. It fits the moment, and it gives us a reason to stay together."
    Voiceover: "For {audience}, {brand_name} makes {theme.lower()} feel simple, relevant, and real."
    On-screen text: "{brand_name}: {theme}"

    SCENE 4 - 0:19-0:26 - THE PAYOFF
    Visual: The group shares the result in an authentic {region} setting. Include one culturally grounded detail such as {', '.join(culture.get('elements') or ['local food and familiar conversation'])}. End on a real laugh or relieved expression, not a staged thumbs-up.
    Dialogue: CHARACTER 2: "Now this feels like our kind of moment."
    Voiceover: "Built for the way {audience} live, choose, and connect."

    SCENE 5 - 0:26-0:30 - CTA
    Visual: Product/service hero shot, logo, one proof point, and CTA. Use a readable mobile-safe layout with no more than eight words on screen.
    Voiceover: "{cta}."
    On-screen text: "{brand_name} | {cta}"
    Audio: Short memorable brand hook that repeats the brand name once.
    Production notes: Capture one wide shot, three close-ups, and one human reaction per location. Record clean dialogue separately. Add subtitles in {output_language} and keep the final logo frame on screen for two seconds.
    """]

        if output_language != "English":
            return build_native_fallback(output_language)
        return "\n---\n".join(scripts[:variants]) + draft_note

    if ct == "visual":
        options = req.visual_options.dict() if req.visual_options else {}
        visual_format = options.get("format") or "Instagram Post (1:1)"
        visual_style = options.get("style") or "Vibrant and bold"
        palette = options.get("palette") or "Saffron, deep green, gold"
        visual_setting = options.get("setting") or f"A {region} everyday setting"
        key_elements = options.get("key_elements") or "Brand logo, product, cultural motif"
        return f"""VISUAL CONCEPT 1:
FORMAT: {visual_format}
STYLE: {visual_style}
CREATIVE IDEA: Turn {theme.lower()} into a recognizable moment for {audience}.
AUDIENCE INSIGHT: {audience} respond to familiar Indian details when the product is shown inside a real routine.
HEADLINE: "{brand_name}: {theme}"
SUPPORTING COPY: "Made for the moments you share, wherever your day takes you."
LAYOUT AND COMPOSITION: Use a 60/40 composition. Place the {brand_name} product and people in the right 60 percent, leaving the left 40 percent clear for copy. Keep a 10 percent crop-safe margin.
SUBJECT AND ACTION: Show two people from {audience} sharing the product naturally in {visual_setting}. One person passes it while the other reacts with visible relief and warmth. Clearly show {key_elements}.
CAMERA AND CROP: Eye-level 35mm hero shot, plus a macro product close-up. Keep faces, logo, and headline inside the central safe area.
SETTING AND PROPS: Use {visual_setting}, with {', '.join(culture.get('elements') or ['local food and familiar Indian details'])}. Add only story-relevant props.
LIGHTING AND TEXTURE: Warm natural side light, soft facial fill, crisp product highlights, and tactile texture matching {visual_style}.
COLOR PALETTE: Primary {palette}; add #FFF8E7 for copy space and #2B2B2B for readable text.
TYPOGRAPHY: Bold sans-serif headline under 7 words, readable supporting copy, and strong mobile contrast.
BRANDING AND CTA: Logo top-left, product lower-right, CTA badge: "Discover {brand_name}".
WHY IT WORKS: The shared action makes {theme.lower()} visible and gives {audience} a specific reason to remember {brand_name}.
PRODUCTION NOTES: Deliver 1:1, 4:5, and 9:16 crops. Capture separate RAW product and people shots.
---
VISUAL CONCEPT 2:
FORMAT: {visual_format}
STYLE: {visual_style}
CREATIVE IDEA: Show a real {region} moment changing from rushed to connected after {brand_name} enters naturally.
AUDIENCE INSIGHT: People remember a brand when they can immediately imagine using it with friends or family.
HEADLINE: "Bring the good moment closer."
SUPPORTING COPY: "{brand_name} makes {theme.lower()} feel easy, warm, and yours."
LAYOUT AND COMPOSITION: Use three panels: before, product interaction, and after. Reserve the bottom 18 percent for logo, proof point, and CTA.
SUBJECT AND ACTION: Begin with distraction, move to a close-up of {brand_name} being used, and finish with a group sharing the result.
CAMERA AND CROP: Tight crop for tension, macro product detail, then wide joyful group frame. Keep every frame readable without sound.
SETTING AND PROPS: {visual_setting}; use believable local details rather than a generic studio background.
LIGHTING AND TEXTURE: Start with neutral daylight, then add warm highlights around the product and final group moment.
COLOR PALETTE: Base {palette}; use #D85C45 as a restrained CTA accent and #FAFAF5 as text space.
TYPOGRAPHY: One headline family with three weights. Keep supporting copy under 18 words.
BRANDING AND CTA: Reveal the logo after the product interaction, then end with: "Choose {brand_name} for your next {theme.lower()} moment."
WHY IT WORKS: The before-and-after structure communicates a clear benefit and specific audience behavior.
PRODUCTION NOTES: Photograph all panels in the same light direction and preserve space for {output_language} localization.
---"""

    if ct == "music":
        options = req.music_options.dict() if req.music_options else {}
        length = options.get("length") or "30 seconds"
        genre = options.get("genre") or "Carnatic fusion"
        tempo = options.get("tempo") or "Medium 90-110 BPM"
        vibe = options.get("vibe") or "Joyful and celebratory"
        instruments = options.get("instruments") or "Tabla, veena, acoustic guitar"
        return f"""JINGLE 1:
LENGTH: {length} | GENRE: {genre} | TEMPO: {tempo} | VIBE: {vibe}
LYRICS:
0:00-0:04 INTRO: [Spoken] "Listen close, this moment is ours."
0:04-0:10 VERSE: "When the day runs fast and the road feels long / We find our people, we find our song / A little joy in the things we do / {brand_name} brings the good back to you."
0:10-0:20 CHORUS / BRAND HOOK: "{brand_name}, saath saath, every day feels bright / {brand_name}, dil se dil, bringing us together tonight / For {audience}, for every new start / {brand_name} puts the feeling in your heart."
0:20-0:26 BRIDGE: "From {region} streets to every home / Wherever we are, we are not alone."
0:26-0:30 OUTRO / CTA: "Choose {brand_name} today" followed by "{brand_name}, saath saath."
MELODY: Warm mid-register verse; lift three notes on the brand name so the hook is easy to remember.
INSTRUMENTS: {instruments}, soft bass, and handclaps in the chorus.
ARRANGEMENT: Veena and room ambience at 0:00; guitar at 0:04; tabla at 0:08; claps at 0:10; full ensemble at 0:20; strip back to the brand voice at 0:26.
VOCAL DIRECTION: One warm lead voice in {output_language}; add a small group response on the second brand name. Leave a half-beat pause after it.
SOUND DESIGN: Add a kettle, street, or soft festive bell cue below the vocal to establish an Indian setting.
MIX NOTES: Keep voice centered and 2-3 dB above music, use short reverb on the chorus, duck music under the CTA, and master for mobile speakers.
---
JINGLE 2:
LENGTH: {length} | GENRE: {genre} with regional lift | TEMPO: {tempo} | VIBE: {vibe}
LYRICS:
0:00-0:05 INTRO: "One table, many stories, one feeling."
0:05-0:12 VERSE: "A laugh from a friend, a call from home / A familiar taste wherever we roam / Small little moments, memories start / {brand_name} brings us heart to heart."
0:12-0:23 CHORUS: "Hey {brand_name}, let the good times begin / Hey {brand_name}, share the smile, let everybody in / {theme} in every beat we play / {brand_name} makes a better day."
0:23-0:27 CALL AND RESPONSE: LEAD: "Who brings us closer?" GROUP: "{brand_name}!" LEAD: "Who makes it brighter?" GROUP: "{brand_name}!"
0:27-0:30 OUTRO / CTA: "{brand_name} - {audience} ke saath, every day."
MELODY: Use a memorable five-note motif and repeat it beneath the final CTA.
INSTRUMENTS: {instruments}, with a restrained flute or veena lead.
ARRANGEMENT: Dry vocal at 0:00; guitar and flute at 0:05; tabla and claps at 0:12; group vocals at 0:23; clean logo sound mark at the end.
VOCAL DIRECTION: Conversational lead, friendly group response, clear diction, and an audible pause before every brand hook.
SOUND AND MIX NOTES: Add a short crowd lift at the chorus, control low frequencies for phones, and leave the CTA dry and intelligible.
---"""

    options = req.campaign_options.dict() if req.campaign_options else {}
    goal = options.get("goal") or "Brand awareness"
    campaign_duration = options.get("duration") or "4 weeks"
    budget = options.get("budget") or "5 to 10 Lakhs"
    channels = options.get("channels") or "Instagram, YouTube, and WhatsApp"
    geography = options.get("geography") or region
    campaign_festival = options.get("festival") or festival
    return f"""CAMPAIGN PLAN 1:
CAMPAIGN NAME: {brand_name} - {theme}
GOAL: {goal} | PERIOD: {campaign_duration} | MARKET: {geography} | OCCASION: {campaign_festival}
KEY MESSAGE: {brand_name} helps {audience} experience {theme.lower()} through a trustworthy {industry} choice.
CAMPAIGN INSIGHT: {audience} engage when the brand appears in an authentic routine and gives them a reason to share the moment.
POSITIONING AND OFFER: Position {brand_name} as the practical, emotionally relevant choice. Use a first-use incentive, shareable bundle, or limited {campaign_festival} offer with a clear deadline.
TARGET AUDIENCE INSIGHT: They discover products on mobile, compare quickly, trust visible proof, and respond to local language, real people, and clear value.
CONTENT PILLARS:
1. Everyday proof: one real use case and one product reason to believe.
2. Shared culture: respectful {campaign_festival} and {region} details.
3. Community participation: customers share their own {theme.lower()} moment.
4. Conversion: clear price, deadline, and next step.
WEEKLY PLAN:
Week 1 FOUNDATION: Publish a 20-second insight film, three poll Stories, one product proof post, and a tracked landing page with offer and FAQ.
Week 2 DEMONSTRATION: Publish two Reels in {', '.join(culture.get('elements') or ['local everyday settings'])}, one comparison carousel, and creator briefs. Retarget 50% video viewers.
Week 3 PARTICIPATION: Launch "Show us your {theme.lower()} moment." Repost five entries, run one creator Live, and send a time-limited WhatsApp bundle.
Week 4 CONVERSION: Run a seven-day countdown, retarget engaged users with proof and offer ads, publish testimonials, and close with final-day urgency.
CHANNEL STRATEGY: Instagram for Reels, Stories, UGC, and retargeting; YouTube for hero film and Shorts; {channels} for consideration and conversion; WhatsApp for reminders and support.
SAMPLE CONTENT AND COPY: Hook: "What does {theme.lower()} look like on your busiest day?" Caption: "For {audience}, the best choices fit real life. Discover {brand_name} and share your moment." CTA: "Try {brand_name} before {campaign_festival} ends."
CREATOR PLAN: Work with three micro-creators representing {audience} in {geography}: routine demonstration, cultural moment, and honest review. Track unique links and assisted conversions.
BUDGET ALLOCATION: Use {budget} as the ceiling: 35% reach/video, 25% retargeting, 15% creators, 10% production, 10% offers/sampling, 5% testing.
CONVERSION JOURNEY: Video awareness, proof and FAQ consideration, limited offer decision, fast mobile checkout, then follow-up referral and repeat-purchase message.
KPIs: 500,000 relevant reach; 20% video completion; 1.5% landing CTR; 4% save/share rate; 3% creator-link conversion; CAC within margin; 15% repeat/referral action in 30 days.
TESTING AND OPTIMIZATION: Test emotional versus benefit hooks, testimonials versus demonstrations, and regional versus English copy. Review after 72 hours and shift spend to the top two combinations.
RISKS AND MITIGATIONS: Use real cultural details, native-speaker review, no unverified health claims, and backup creative for fatigue.
OUTPUT LANGUAGE: {output_language}.
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


def build_local_viral_fallback(req: ViralRequest) -> str:
    message = req.message or "your topic"
    topic_match = re.search(r'(?:about|topic)\s*:\s*["\']?([^"\'\n]+)', message, re.IGNORECASE)
    platform_match = re.search(r'for\s+(Instagram|YouTube|TikTok|LinkedIn|Twitter/X|Facebook)', message, re.IGNORECASE)
    topic = topic_match.group(1).strip() if topic_match else "your topic"
    platform = platform_match.group(1) if platform_match else "Instagram"
    return f'''---VIRAL HOOK---
Variation 1: Stop scrolling: the fastest way to improve {topic} is to solve one real problem today.
Variation 2: What would change if you could make measurable progress on {topic} before the day ends?
Variation 3: Most advice about {topic} sounds impressive but fails in real life. Here is the practical version.

---FULL SCRIPT---
Variation 1:
0-3s HOOK: "You are approaching {topic} in the most expensive way possible."
3-12s BUILD: Show a realistic problem and its consequence for the target viewer.
12-35s MAIN: Demonstrate three steps: define the outcome, remove the largest blocker, and complete one measurable action.
35-50s PROOF: Show the before-and-after result with one visible metric or time saved.
50-60s CTA: "Save this, try step one today, and comment with the part of {topic} you want explained next."
Variation 2:
0-3s HOOK: "A small mistake in {topic} can quietly cost you weeks."
3-15s STORY: Show a specific everyday situation and the wrong decision.
15-38s LESSON: Replace a vague goal with one observable result and one small action.
38-52s APPLICATION: Demonstrate exactly how to apply the lesson to {topic}.
52-60s CTA: "Share this with someone working on {topic}."

---SCENE BREAKDOWN---
Scene 1, 0-3s: Close-up of the problem with the text "The costly mistake in {topic}" and a sharp audio drop.
Scene 2, 3-12s: Show the viewer facing the problem; cut to the failed action with a push-in.
Scene 3, 12-30s: Demonstrate the three-step solution with one label per step.
Scene 4, 30-50s: Show a before-and-after comparison and the measurable result.
Scene 5, 50-60s: Deliver the CTA and hold the handle or logo for two seconds.
CAMERA MOVEMENTS: Hard cut, handheld problem shot, locked demonstration, smooth proof push-in, static CTA.
VISUAL MOOD: Warm, clear, high-contrast lighting with readable subtitles.
B-ROLL GUIDANCE: Film hands using the process, the real environment, key details, one reaction, and the result.

---CAPTION---
{topic} becomes easier when you stop trying to fix everything at once. Start with one visible outcome, remove one blocker, and take one measurable action today. Save this and tell us which step you will try first.

---HASHTAGS---
Primary: #ContentStrategy #IndianCreators #PracticalGrowth
Niche: #CreatorWorkflow #BuildInPublic #LearnByDoing
Discovery: #GrowthTips #BusinessTips #LearnOnSocial

---MUSIC SUGGESTION---
Primary: Medium-tempo lo-fi percussion at 95 BPM with a beat drop at 0:03.
Backup 1: Light Indian acoustic fusion with tabla accents.
Backup 2: Minimal cinematic pulse for a problem-to-proof story.
AUDIO STRATEGY: Silence for the hook, rhythm during the build, bass lift under proof, and a short sound mark at the CTA.
MOOD PROFILE: Focused, practical, confident, and optimistic.

---EDITING TIPS---
1. Cut every 2-3 seconds during the first 15 seconds.
2. Burn subtitles into every spoken line.
3. Use a before-and-after split-screen at the proof moment.
4. Zoom recordings to the exact action being demonstrated.
5. Lower music by 4 dB under dialogue.
6. End with a two-second CTA frame containing one action and one handle.

---GROWTH INSIGHTS---
Best Posting Times: Tuesday or Thursday at 7:30 PM IST for {platform}; test Saturday at 11:00 AM.
Upload Frequency: Publish 3 focused videos per week for 30 days.
Algorithm Optimization: Reply to the first 10 comments within 15 minutes and publish a follow-up within 48 hours.
Caption Strategy: Lead with the problem, give one actionable step, then ask which part of {topic} viewers want explained next.
First Comment: What is the most difficult part of {topic}? Share the specific situation.
FIRST 30 MINUTES: Publish, share to Stories, reply to comments, pin a useful answer, and record retention drop-off.
'''


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

    if "viral content strategist" in (req.system or "").lower() or "viral content" in message.lower():
        return build_local_viral_fallback(req)

    return f"""---BRAND NAMES---
1. {brand_name} Forge | A strong, modern name built for growth and clarity
2. {brand_name} Story | A name that turns your brand into something memorable

1. Build trust. Grow faster.
2. Made for {audience}.

Mission: Help {audience.lower()} solve {problem.lower()} with a clear and credible brand system.
Vision: Become the most trusted and recognizable brand in this space.
Unique Value Proposition: A focused, practical, and India-ready brand identity tailored to {scope.lower()} audiences.
Positioning Statement: For {audience}, {brand_name} delivers a {vibe.lower()} experience with a {tone.lower()} voice.
Core Values:
— Clarity
— Trust
— Consistency
Competitor Differentiation: Fast, practical, and culturally relevant brand direction instead of generic advice.

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

Logo Style Direction: Clean, modern, and scalable with a memorable symbol
Primary Color: (#B8973A) — warm premium gold
Secondary Color: (#8BAF8D) — calm growth green
Accent Color: (#4A9B9B) — digital trust teal
Background Color: (#FAF7F0) — soft neutral canvas
Primary Font: Cormorant Garamond or a similar elegant serif
Secondary Font: Jost or a similar clean sans serif
Visual Mood: Confident, premium, and approachable
Design Inspiration: Indian modern craft blended with startup minimalism

Personality Traits: {personality}
What the Brand Sounds Like: Clear, helpful, and confident
What the Brand Never Says: Vague claims or generic marketing fluff
Sample Instagram Caption: Build a brand that speaks before you do.
Sample LinkedIn Post Opening: Great brands are not accidental. They are designed.
Sample WhatsApp Broadcast: Here is your next clear step for better brand growth.

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
        "ai_providers": ["groq", "gemini"],
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
    groq_ok = bool(os.getenv("GROQ_API_KEY"))
    return {
        "providers": [
            {
                "id": "groq",
                "name": "Groq",
                "model": "openai/gpt-oss-120b",
                "available": groq_ok,
                "badge": "🔥 Recommended",
            },
            {
                "id": "gemini",
                "name": "Gemini",
                "model": "gemini-3.5-flash-lite",
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
        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key:
            try:
                return {"output": run_groq(req.system or "You are a helpful assistant for MuseAI.", req.message, groq_api_key)}
            except Exception as exc:
                raise HTTPException(status_code=502, detail=f"Groq chat failed: {exc}")
        raise HTTPException(status_code=503, detail="Set GEMINI_API_KEY or GROQ_API_KEY in backend/.env")
    try:
        prompt = f"""SYSTEM: {req.system}

USER: {req.message}

Reply in 2-3 sentences max. Be friendly and helpful."""
        result = run_gemini(prompt, api_key)
        return {"output": result}
    except Exception as e:
        error_text = str(e)
        if is_gemini_access_error(error_text):
            groq_api_key = os.getenv("GROQ_API_KEY")
            if groq_api_key:
                try:
                    result = run_groq(req.system or "You are a helpful assistant for MuseAI.", req.message, groq_api_key)
                    return {"output": result}
                except Exception:
                    return {"output": build_local_chat_fallback()}
            return {"output": build_local_chat_fallback()}
        raise HTTPException(status_code=500, detail=error_text)


# ── Viral / LinkedIn content (Groq or Gemini) ─────────────────────────
@app.post("/viral")
def viral_generate(req: ViralRequest):
    provider = (req.ai_provider or "groq").lower()
    provider_error = None
    image_data = req.image_base64 or req.image_data

    full_system = f"""{req.system}

CRITICAL RULES — NEVER BREAK THESE:
1. Write COMPLETE, PUBLISH-READY content. Zero placeholder text like [text here].
2. Use EXACTLY the ---SECTION NAME--- delimiters as given.
3. Every hook, script, and caption must be specific to the topic provided.
4. Write as a professional content creator, not as an AI assistant.
5. Match the platform tone, algorithm preferences, and audience expectations perfectly.
6. Output must be detailed, thorough, and immediately usable without editing."""

    try:
        if image_data:
            image_prompt = f"""{full_system}

IMAGE CAPTION TASK
The attached image is the only source of truth. Ignore assumptions from the text request when they conflict with the image.

First inspect the image and silently identify: the main subject, every clearly visible object, people and their visible actions, setting, colors, composition, mood, readable words or logos, and any distinctive visual detail. Do not invent a location, event, product feature, person identity, or action that cannot be seen. If a detail is uncertain, use neutral wording.

USER REQUEST:
{req.message}

Return exactly three finished caption variations for the requested platform and language:
Variation 1 (Engaging): 3-5 sentences, emojis allowed, a hook, a CTA, and 5 hashtags.
Variation 2 (Storytelling): 4-6 sentences, no emojis, a human narrative based only on visible details, and 3 hashtags.
Variation 3 (Short): 1-3 specific lines and 3 hashtags.

Every variation MUST mention at least two concrete details that are visibly present in the image. Do not use generic captions, stock phrases, square brackets, placeholders, image assumptions, or a description unrelated to the uploaded image. Return captions only, with no analysis or preamble."""
            if image_data.startswith("data:"):
                header, separator, encoded_image = image_data.partition(",")
                if not separator:
                    raise HTTPException(status_code=400, detail="Invalid image data URL.")
                image_data = encoded_image
                if not req.image_mime_type and not req.image_type:
                    image_type_from_url = header[5:].split(";", 1)[0]
                else:
                    image_type_from_url = None
            else:
                image_type_from_url = None
            image_type = req.image_mime_type or req.image_type or image_type_from_url or "image/jpeg"
            gemini_error = None
            gemini_key = os.getenv("GEMINI_API_KEY")
            if gemini_key:
                try:
                    result = run_gemini_with_image(
                        image_prompt, image_data, image_type, gemini_key
                    )
                    provider = "gemini"
                except Exception as error:
                    gemini_error = str(error)
            else:
                gemini_error = "GEMINI_API_KEY is not configured"

            if gemini_error:
                groq_key = os.getenv("GROQ_API_KEY")
                if not groq_key:
                    raise HTTPException(
                        status_code=503,
                        detail=f"Gemini image captions failed ({gemini_error}); GROQ_API_KEY is not configured.",
                    )
                try:
                    result = run_groq_with_image(
                        full_system,
                        image_prompt,
                        image_data,
                        image_type,
                        groq_key,
                    )
                    provider = "groq"
                except Exception as groq_error:
                    raise HTTPException(
                        status_code=502,
                        detail=f"Image caption generation failed. Gemini: {gemini_error}; Groq: {groq_error}",
                    ) from groq_error

        elif provider == "groq":
            api_key = os.getenv("GROQ_API_KEY")
            if api_key:
                result = run_groq(full_system, req.message, api_key)
            else:
                result = build_local_brand_fallback(req)
                provider = "local_fallback"
                provider_error = "GROQ_API_KEY not set"

        else:  # gemini fallback
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
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
                        groq_api_key = os.getenv("GROQ_API_KEY")
                        if groq_api_key and ("429" in error_text or "quota" in error_text or "resource_exhausted" in error_text or "permission_denied" in error_text or "reported as leaked" in error_text):
                            try:
                                result = run_groq(full_system, req.message, groq_api_key)
                                provider = "groq"
                            except Exception as groq_error:
                                provider_error = str(groq_error)
                                result = build_local_brand_fallback(req)
                                provider = "local_fallback"
                        else:
                            provider_error = str(gemini_error)
                            result = build_local_brand_fallback(req)
                            provider = "local_fallback"
            else:
                result = build_local_brand_fallback(req)
                provider = "local_fallback"
                provider_error = "GEMINI_API_KEY not set"

        response = {"output": result, "provider": provider}
        if provider == "local_fallback" and provider_error:
            response["provider_error"] = provider_error
        return response

    except HTTPException:
        raise
    except Exception as e:
        if image_data:
            raise HTTPException(status_code=502, detail=f"Image caption generation failed: {e}")
        fallback = build_local_brand_fallback(req)
        return {"output": fallback, "provider": "local_fallback", "error": str(e)}


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
    brand   = req.brand_info.dict()
    culture = req.culture.dict()
    ct      = req.content_type.lower()
    brand["output_language"] = normalize_language(brand.get("output_language", "English"))
    culture_block = build_culture_block(culture)
    examples      = get_examples(ct)

    # ── Optional RAG Trend Intelligence ─────────────────────
    trend_context = ""

    try:
        if retrieve_trends and format_trends_for_prompt:
            trends = retrieve_trends(
                brand=brand.get("brand", ""),
                industry=brand.get("industry", ""),
                audience=brand.get("audience", ""),
                language=brand.get("output_language", "English"),
                region=culture.get("region", ""),
                content_type=ct,
                top_k=5,
            )

            trend_context = format_trends_for_prompt(trends)

            print(
                f"📈 RAG retrieved {len(trends)} relevant trends"
            )

    except Exception as trend_error:
        print(
            f"⚠️ RAG trend retrieval skipped: {trend_error}"
        )

    base = f"""Brand: {brand['brand']}
Industry: {brand['industry']}
Target Audience: {brand['audience']}
Tone: {brand['tone']}
Theme: {brand['theme']}
Output Language: {brand['output_language']} (use native script, no language mixing)

{culture_block}

{trend_context}

{examples}

STRICT RULES:
- Output ONLY the requested content, no preamble
- Be deeply culturally authentic to India
- Use real Indian references, places, idioms where relevant
- Output in {brand['output_language']} as requested
- Make every answer specific to the supplied brand, audience, theme, and options
- Prefer concrete examples, numbers, timings, copy, actions, and implementation instructions
- Do not use placeholders, empty labels, generic filler, or repeat the same idea in different words
- Ensure the requested number of variants is complete and meaningfully different"""

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

DETAIL LEVEL: Make every variation production-ready and specific. Include exact time ranges that add up to the requested duration, shot type and camera movement, location and props, character action and emotion, complete dialogue/voiceover, sound design or music cues, on-screen text, transitions, product visibility, and the final CTA. Make the cultural details natural to the selected region, festival, audience, and language. Do not use placeholders or vague phrases such as "show the product".

Format each as:
SCRIPT [N]:
[CONCEPT: A distinct creative angle and one-sentence audience insight]
[SCENE 1 — TIME: 0:00-0:05]
VISUAL / ACTION:
DIALOGUE / VOICEOVER:
AUDIO / SFX:
ON-SCREEN TEXT:
[Continue with timed scenes through the CTA]
PRODUCTION NOTES:
CTA:
---"""

        elif ct == "visual":
            o = req.visual_options.dict() if req.visual_options else {}
            prompt = f"""{base}

Create {o.get('variants', 2)} visual concepts for {o.get('format', 'Instagram Post')}.
Style: {o.get('style')}. Colors: {o.get('palette')}. Setting: {o.get('setting')}.
Must include: {o.get('key_elements')}.

DETAIL LEVEL: Make each concept ready for a designer or photographer to execute. Specify the exact subject, pose or action, composition and focal point, camera angle, crop-safe area, background, props, lighting, cultural details, color usage with HEX suggestions, typography hierarchy, headline and supporting copy, logo placement, accessibility/contrast guidance, and a clear action CTA. Explain why the concept will resonate with the stated audience. Never use generic filler.
MINIMUM COMPLETENESS: Write at least 350 words per concept. Every labeled field must contain concrete, brand-specific instructions and at least one example of final copy.

Format each as:
VISUAL CONCEPT [N]:
CREATIVE IDEA:
AUDIENCE INSIGHT:
HEADLINE:
SUPPORTING COPY:
LAYOUT AND COMPOSITION:
SUBJECT / IMAGERY:
CAMERA / CROP:
SETTING / PROPS:
LIGHTING:
COLOR PALETTE:
TYPOGRAPHY:
BRANDING / LOGO PLACEMENT:
CTA:
WHY IT WORKS:
---"""

        elif ct == "music":
            o = req.music_options.dict() if req.music_options else {}
            prompt = f"""{base}

Create {o.get('variants', 2)} jingle concepts for a {o.get('length', '15 seconds')} ad.
Genre: {o.get('genre')}. Tempo: {o.get('tempo')}. Vibe: {o.get('vibe')}.
Instruments: {o.get('instruments')}.

DETAIL LEVEL: Make each concept record-ready and specific. Include a time-coded arrangement, exact lyric structure with a memorable brand hook, pronunciation or language notes, melody direction, chord or rhythmic feel, instrument roles, vocal direction, sound effects, mix/mastering guidance, and how the CTA or brand name lands. Keep lyrics original and culturally respectful. Do not write generic phrases without explaining how they should be performed.
MINIMUM COMPLETENESS: Write at least 250 words per jingle. Include complete original lyrics, not only an outline, and specify what happens in every part of the requested duration.

Format each as:
JINGLE [N]:
LYRICS:
INTRO (time):
VERSE (time):
CHORUS / BRAND HOOK (time):
OUTRO / CTA (time):
MOOD:
INSTRUMENTS:
TEMPO / RHYTHM:
VOCAL DIRECTION:
ARRANGEMENT NOTES:
RECORDING AND MIX NOTES:
---"""

        elif ct == "campaign":
            o = req.campaign_options.dict() if req.campaign_options else {}
            prompt = f"""{base}

Design {o.get('variants', 1)} complete campaign plan(s).
Goal: {o.get('goal')}. Duration: {o.get('duration')}. Budget: {o.get('budget')}.
Channels: {o.get('channels')}. Geography: {o.get('geography')}. Festival: {o.get('festival')}.

DETAIL LEVEL: Produce an execution-ready plan specific to this brand, audience, geography, budget, channels, and occasion. Include a sharp insight, positioning, offer, funnel, channel roles, content formats, sample messages, creator/partner strategy, budget allocation with percentages and indicative amounts, weekly milestones, publishing cadence, conversion journey, measurement method, KPI targets, testing plan, risks, and optimization actions. Give concrete examples instead of generic marketing advice.
MINIMUM COMPLETENESS: Write at least 900 words for each campaign plan. Include a day-by-day or milestone-level action plan, sample copy, numeric targets, and budget math that matches the selected budget range.

Format as:
CAMPAIGN PLAN [N]:
KEY MESSAGE:
CAMPAIGN INSIGHT:
POSITIONING AND OFFER:
TARGET AUDIENCE INSIGHT:
CONTENT PILLARS:
WEEKLY PLAN (milestones, content, owners, and spend):
CHANNEL STRATEGY:
SAMPLE CONTENT AND COPY:
CREATOR / PARTNERSHIP PLAN:
BUDGET ALLOCATION:
CONVERSION JOURNEY:
KPIs:
TESTING AND OPTIMIZATION:
RISKS AND MITIGATIONS:
---"""

        else:
            raise HTTPException(
                status_code=400, detail=f"Unknown content type: {ct}"
            )

        api_key = os.getenv("GEMINI_API_KEY")
        language = normalize_language(brand.get("output_language", "English"))
        system_instruction = build_language_instruction(language)

        if not api_key:
            # If Gemini is unavailable, try Groq before giving up.
            groq_api_key = os.getenv("GROQ_API_KEY")
            if groq_api_key:
                try:
                    print(f"🔄 Gemini unavailable; trying Groq in {language}...")
                    result = run_groq(system_instruction, prompt, groq_api_key)

                    if language != "English" and needs_language_correction(result, language):
                        correction_prompt = build_language_correction_prompt(result, language)
                        result = run_groq(system_instruction, correction_prompt, groq_api_key)

                    return {
                        "success": True,
                        "content_type": ct,
                        "output": result,
                        "provider": "groq",
                        "language": language,
                    }
                except Exception as groq_error:
                    print(f"❌ Groq generation failed: {groq_error}")

            raise HTTPException(
                status_code=503,
                detail="No AI provider is configured. Set GEMINI_API_KEY or GROQ_API_KEY in .env."
            )

        try:
            print(f"🌐 Generating {ct} content in: {language}")

            result = run_gemini(
                prompt=prompt,
                api_key=api_key,
                system_instruction=system_instruction,
            )

            # HARD LANGUAGE GATE:
            # If Gemini ignored the native-script requirement, send the result
            # through a dedicated correction pass before returning it.
            if language != "English" and needs_language_correction(result, language):
                print(f"⚠️ Gemini output is not sufficiently {language}; running correction pass...")
                correction_prompt = build_language_correction_prompt(result, language)

                corrected = run_gemini(
                    prompt=correction_prompt,
                    api_key=api_key,
                    system_instruction=system_instruction,
                )

                if corrected and not needs_language_correction(corrected, language):
                    result = corrected
                else:
                    # One more direct instruction gives the model the full
                    # original prompt plus the language requirement.
                    retry_prompt = f"""
{prompt}

LANGUAGE CORRECTION — THIS OVERRIDES ANY EARLIER FORMAT AMBIGUITY:
The selected language is {language}.
Return the COMPLETE creative output in {language} native Unicode script.
Do not use English prose or Romanized {language}.
Every heading, label, scene direction, dialogue, voiceover, caption,
production note and CTA must be in {language}.
"""
                    corrected = run_gemini(
                        prompt=retry_prompt,
                        api_key=api_key,
                        system_instruction=system_instruction,
                    )
                    if corrected:
                        result = corrected

            print(f"✅ Generated content in {language}")

            return {
                "success": True,
                "content_type": ct,
                "output": result,
                "provider": "gemini",
                "language": language,
            }

        except Exception as gemini_error:
            error_text = str(gemini_error)
            print(f"❌ Gemini generation failed: {error_text}")

            groq_api_key = os.getenv("GROQ_API_KEY")
            groq_error_text = None
            if groq_api_key:
                try:
                    print(f"🔄 Trying Groq fallback in {language}...")

                    result = run_groq(
                        system_instruction,
                        prompt,
                        groq_api_key,
                    )

                    if language != "English" and needs_language_correction(result, language):
                        print(f"⚠️ Groq output is not sufficiently {language}; correcting...")
                        correction_prompt = build_language_correction_prompt(result, language)
                        result = run_groq(
                            system_instruction,
                            correction_prompt,
                            groq_api_key,
                        )

                    return {
                        "success": True,
                        "content_type": ct,
                        "output": result,
                        "provider": "groq",
                        "language": language,
                    }

                except Exception as groq_error:
                    groq_error_text = str(groq_error)
                    print(f"❌ Groq generation failed: {groq_error}")

            # Provider errors are not generated content. Prevent an apology
            # from being shown as a completed script or stored in history.
            details = f"Gemini: {error_text}"
            if groq_error_text:
                details += f"; Groq: {groq_error_text}"
            raise HTTPException(
                status_code=503,
                detail=f"AI generation failed. Check that your provider API key is valid and has available quota. {details}",
            )

    except HTTPException:
        raise

    except Exception as e:
        print(f"❌ /generate endpoint error: {e}")

        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )

# ── Social Media Integration Endpoints ──────────────────────────────────

@app.post("/social-media/share")
def share_to_social_media(payload: dict):
    """Share generated content to LinkedIn and/or Instagram"""
    if not social_media_manager:
        raise HTTPException(status_code=503, detail="Social media integration not configured")
    
    user_id = payload.get("user_id")
    content = payload.get("content")
    image_url = payload.get("image_url")
    platforms = payload.get("platforms", ["linkedin", "instagram"])
    hashtags = payload.get("hashtags", [])
    campaign_id = payload.get("campaign_id")
    
    if not user_id or not content:
        raise HTTPException(status_code=400, detail="user_id and content are required")
    
    results = social_media_manager.share_to_multiple_platforms(
        user_id=user_id,
        content=content,
        image_url=image_url or "",
        platforms=platforms,
        hashtags=hashtags,
        campaign_id=campaign_id
    )
    
    return results


@app.get("/social-media/connected")
def get_connected_accounts(user_id: str):
    """Get user's connected social media accounts"""
    if not social_media_manager:
        raise HTTPException(status_code=503, detail="Social media integration not configured")
    
    return social_media_manager.get_connected_platforms(user_id)


@app.post("/social-media/posts")
def get_social_posts(payload: dict):
    """Get user's social media post history"""
    if not db_manager:
        raise HTTPException(status_code=503, detail="Database manager not configured")
    
    user_id = payload.get("user_id")
    platform = payload.get("platform")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    posts = db_manager.get_user_social_posts(user_id, platform)
    return {"posts": posts, "count": len(posts)}


# ── Database Management Endpoints ───────────────────────────────────────

@app.get("/database/stats")
def get_database_stats():
    """Get database statistics and health"""
    if not db_manager:
        return {"status": "Database manager not configured"}
    
    stats = db_manager.get_database_stats()
    return stats


@app.post("/database/export")
def export_user_data(payload: dict):
    """Export user data as JSON"""
    if not db_manager:
        raise HTTPException(status_code=503, detail="Database manager not configured")
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    from pathlib import Path
    export_path = Path(f"/tmp/{user_id}_export_{int(time.time())}.json")
    
    success = db_manager.export_data(export_path, user_id)
    
    if success:
        return {
            "status": "success",
            "message": f"Data exported to {export_path}",
            "file_path": str(export_path)
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to export data")


@app.post("/database/backup")
def backup_database():
    """Create database backup"""
    if not db_manager:
        raise HTTPException(status_code=503, detail="Database manager not configured")
    
    from pathlib import Path
    import shutil
    
    timestamp = int(time.time())
    backup_path = Path(f"/tmp/museai_backup_{timestamp}")
    backup_path.mkdir(parents=True, exist_ok=True)
    
    try:
        for key, file_path in db_manager.db_files.items():
            if file_path.exists():
                shutil.copy2(file_path, backup_path / file_path.name)
        
        return {
            "status": "success",
            "backup_path": str(backup_path),
            "timestamp": timestamp
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")


# ── Platform Information Endpoints ─────────────────────────────────────

@app.get("/platform/info")
def get_platform_info():
    """Get application platform and compatibility information"""
    import platform as sys_platform
    
    platform_info = {
        "system": sys_platform.system(),  # Windows, Darwin (macOS), Linux
        "platform": sys_platform.platform(),
        "python_version": sys_platform.python_version(),
        "architecture": sys_platform.architecture(),
        "database": "Cross-platform JSON" if db_manager else "Not configured",
        "social_media": "Connected" if social_media_manager else "Not configured"
    }
    
    return platform_info


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "gemini_available": bool(os.getenv("GEMINI_API_KEY")),
        "groq_available": bool(os.getenv("GROQ_API_KEY")),
        "database_available": db_manager is not None,
        "social_media_available": social_media_manager is not None
    }
