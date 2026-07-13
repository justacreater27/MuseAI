/**
 * Viral Content Studio — with language support,
 * section selector, and image caption upload
 * API: Backend /viral endpoint with configured AI providers
 */
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useLanguage } from '../context/LanguageContext'
import { useHistory } from '../context/HistoryContext'
import { generateBrandAdvisor } from '../utils/api'
import {
  IconHook, IconScrollScript, IconScene, IconCaption,
  IconHashtag, IconHeadphones, IconEdit, IconChart,
  IconBack, IconDownload, IconRefresh, IconCheck, IconCopy,
} from '../components/ui/Icons'

function IconLinkedIn({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}
function IconArticle({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  )
}
function IconPost({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="8" y1="9" x2="16" y2="9"/>
      <line x1="8" y1="13" x2="14" y2="13"/>
    </svg>
  )
}
function IconTrendingUp({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  )
}
function IconImage({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}
function IconUpload({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  )
}

// ── Markdown Parser ────────────────────────────────────────────────────────
function parseMarkdownToJSX(text) {
  if (!text) return ''
  
  const parts = []
  let lastIndex = 0
  const regex = /\*\*([^*]+)\*\*/g
  let match
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    // Add bold text
    parts.push({ type: 'bold', content: match[1] })
    lastIndex = regex.lastIndex
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }
  
  return parts.map((part, i) => 
    part.type === 'bold' 
      ? <b key={i}>{part.content}</b>
      : part.content
  )
}

function renderMarkdownText(text) {
  if (!text) return null

  return parseMarkdownToJSX(text)
}

// ── Backend API caller ──────────────────────────────────────────────────────
async function callBackendAI({ system, prompt, timeout = 90000, image = null }) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  try {
    const payload = {
      ai_provider: 'gemini',
      system,
      message: prompt,
    }

    if (image?.base64) {
      payload.image_base64 = image.base64
      payload.image_mime_type = image.type || 'image/jpeg'
    }

    const response = await generateBrandAdvisor(payload)
    clearTimeout(timeoutId)
    return response?.data?.output || ''
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

// ── Translations ──────────────────────────────────────────────────────
const VIRAL_UI = {
  English: {
    platforms: ['Instagram','YouTube','TikTok','LinkedIn','Twitter/X','Facebook','Snapchat'],
    contentTypes: ['Reel / Short','Post (Image)','Story','Script','Caption Only','Full Content Package'],
    goals: ['Entertainment','Education','Branding','Product Promotion','Lead Generation','Community Building','Inspiration'],
    tones: ['Funny & Relatable','Bold & Powerful','Emotional & Heartfelt','Professional & Credible','Trendy & Gen-Z','Motivational','Storytelling'],
    languages: ['English','Hindi','Tamil','Telugu','Malayalam','Kannada','Bengali','Marathi','Gujarati'],
    contentDetailsTitle: 'Content Details',
    brandTopicLabel: 'Brand / Topic *',
    brandTopicPlaceholder: 'e.g. FarmFresh — connecting farmers to urban buyers',
    audienceLabel: 'Target Audience',
    audiencePlaceholder: 'e.g. Urban millennials aged 22-35',
    platformLabel: 'Platform',
    contentTypeLabel: 'Content Type',
    goalLabel: 'Goal',
    toneLabel: 'Tone',
    languageLabel: 'Language',
    generateBtn: 'Generate Viral Content',
    generatingBtn: 'Generating...',
    whatYouGet: '✦ What you get',
    emptyTitle: 'Ready to go viral?',
    emptyDesc: 'Fill in your content details and generate a complete viral content package',
    loadingTitle: 'Creating viral content',
    loadingDesc: 'Generating hooks, scripts, scenes and growth strategy',
    sectionsTitle: '✦ Select Sections',
    sectionsDesc: 'Choose what to generate',
    hooks: '3 viral hooks per generation',
    scripts: '3 full script variations',
    scenes: 'Scene-by-scene breakdown',
    music: 'Music & audio suggestions',
    editing: 'Pro editing tips',
    growth: 'Growth & algorithm insights',
    imageCaptionTitle: 'Image Caption Generator',
    imageCaptionDesc: 'Upload an image to get AI-generated captions',
    uploadBtn: 'Upload Image',
    uploadHint: 'Click or drag to upload (JPG, PNG, WEBP)',
    generateCaptionBtn: 'Generate Caption',
    generatingCaption: 'Generating caption...',
    captionResult: 'Generated Captions',
    noImageError: 'Please upload an image first.',
    regenerate: 'Regenerate',
    copyAll: 'Copy All',
    download: 'Download',
    copied: 'Copied!',
    backToHub: 'Back to Studio Hub',
    studioTitle: 'Content',
    studioTitleItalic: 'Creator Studio',
    studioDesc: 'Generate viral social content, LinkedIn articles, and platform-optimised posts — all powered by AI.',
    viralTab: 'Viral Content',
    viralTabDesc: 'Reels, posts, scripts',
    linkedinTab: 'LinkedIn',
    linkedinTabDesc: 'Articles & posts',
    imageCaptionTab: 'Image Caption',
    imageCaptionTabDesc: 'AI captions for images',
    topicRequired: 'Please describe your content topic or brand.',
    errApi: 'AI is unavailable right now. Please try again.',
    errTimeout: 'Request timed out. Please try again.',
  },
  Tamil: {
    platforms: ['Instagram','YouTube','TikTok','LinkedIn','Twitter/X','Facebook','Snapchat'],
    contentTypes: ['ரீல் / குறும்படம்','படுகை (படம்)','கதை','திரைக்கதை','தலைப்பு மட்டும்','முழு உள்ளடக்கம்'],
    goals: ['பொழுதுபோக்கு','கல்வி','பிராண்டிங்','தயாரிப்பு விளம்பரம்','வாடிக்கையாளர் கிடைப்பு','சமூக கட்டுமானம்','உத்வேகம்'],
    tones: ['வேடிக்கை & தொடர்புடையது','தைரியமான & சக்திவாய்ந்த','உணர்ச்சிமிகுந்த','தொழில்முறை','ட்ரெண்டி & ஜென்-Z','உந்துதல்','கதைசொல்லல்'],
    languages: ['English','Hindi','Tamil','Telugu','Malayalam','Kannada','Bengali','Marathi','Gujarati'],
    contentDetailsTitle: 'உள்ளடக்க விவரங்கள்',
    brandTopicLabel: 'பிராண்ட் / தலைப்பு *',
    brandTopicPlaceholder: 'எ.கா. FarmFresh — விவசாயிகளை நகர வாங்குபவர்களுடன் இணைக்கிறது',
    audienceLabel: 'இலக்கு பார்வையாளர்கள்',
    audiencePlaceholder: 'எ.கா. 22-35 வயதுடைய நகர மில்லினியல்கள்',
    platformLabel: 'தளம்',
    contentTypeLabel: 'உள்ளடக்க வகை',
    goalLabel: 'இலக்கு',
    toneLabel: 'தொனி',
    languageLabel: 'மொழி',
    generateBtn: 'வைரல் உள்ளடக்கம் உருவாக்கு',
    generatingBtn: 'உருவாக்குகிறது...',
    whatYouGet: '✦ நீங்கள் பெறுவது',
    emptyTitle: 'வைரல் ஆக தயாரா?',
    emptyDesc: 'உள்ளடக்க விவரங்களை நிரப்பி முழுமையான வைரல் தொகுப்பை உருவாக்கவும்',
    loadingTitle: 'வைரல் உள்ளடக்கம் உருவாக்குகிறது',
    loadingDesc: 'ஹுக்குகள், திரைக்கதைகள், காட்சிகள் உருவாக்குகிறது',
    sectionsTitle: '✦ பிரிவுகள் தேர்ந்தெடு',
    sectionsDesc: 'என்ன உருவாக்க வேண்டும்',
    hooks: '3 வைரல் ஹுக்குகள்',
    scripts: '3 முழு திரைக்கதை மாறுபாடுகள்',
    scenes: 'காட்சி-வாரியான விவரம்',
    music: 'இசை & ஆடியோ பரிந்துரைகள்',
    editing: 'தொழில்முறை திருத்த குறிப்புகள்',
    growth: 'வளர்ச்சி & அல்காரிதம் நுண்ணறிவு',
    imageCaptionTitle: 'படம் தலைப்பு உருவாக்கி',
    imageCaptionDesc: 'AI உருவாக்கிய தலைப்புகளுக்கு படம் பதிவேற்றவும்',
    uploadBtn: 'படம் பதிவேற்று',
    uploadHint: 'கிளிக் செய்யவும் அல்லது இழுக்கவும் (JPG, PNG, WEBP)',
    generateCaptionBtn: 'தலைப்பு உருவாக்கு',
    generatingCaption: 'தலைப்பு உருவாக்குகிறது...',
    captionResult: 'உருவாக்கப்பட்ட தலைப்புகள்',
    noImageError: 'முதலில் படம் பதிவேற்றவும்.',
    regenerate: 'மீண்டும் உருவாக்கு',
    copyAll: 'அனைத்தும் நகல்',
    download: 'பதிவிறக்கம்',
    copied: 'நகலெடுக்கப்பட்டது!',
    backToHub: 'ஸ்டுடியோ ஹப்பிற்கு திரும்பு',
    studioTitle: 'உள்ளடக்க',
    studioTitleItalic: 'படைப்பு ஸ்டுடியோ',
    studioDesc: 'வைரல் சமூக உள்ளடக்கம், LinkedIn கட்டுரைகள் மற்றும் தளம் உகந்த இடுகைகளை உருவாக்கவும்.',
    viralTab: 'வைரல் உள்ளடக்கம்',
    viralTabDesc: 'ரீல்கள், இடுகைகள், திரைக்கதைகள்',
    linkedinTab: 'LinkedIn',
    linkedinTabDesc: 'கட்டுரைகள் & இடுகைகள்',
    imageCaptionTab: 'படம் தலைப்பு',
    imageCaptionTabDesc: 'AI தலைப்புகள்',
    topicRequired: 'உள்ளடக்க தலைப்பு அல்லது பிராண்டை விவரிக்கவும்.',
    errApi: 'AI இப்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
    errTimeout: 'கோரிக்கை நேரம் முடிந்தது. மீண்டும் முயற்சிக்கவும்.',
  },
  Hindi: {
    platforms: ['Instagram','YouTube','TikTok','LinkedIn','Twitter/X','Facebook','Snapchat'],
    contentTypes: ['रील / शॉर्ट','पोस्ट (इमेज)','स्टोरी','स्क्रिप्ट','केवल कैप्शन','पूरा कंटेंट पैकेज'],
    goals: ['मनोरंजन','शिक्षा','ब्रांडिंग','उत्पाद प्रचार','लीड जनरेशन','समुदाय निर्माण','प्रेरणा'],
    tones: ['मजेदार & संबंधित','साहसी & शक्तिशाली','भावनात्मक','पेशेवर','ट्रेंडी & जेन-Z','प्रेरक','कहानी सुनाना'],
    languages: ['English','Hindi','Tamil','Telugu','Malayalam','Kannada','Bengali','Marathi','Gujarati'],
    contentDetailsTitle: 'कंटेंट विवरण',
    brandTopicLabel: 'ब्रांड / विषय *',
    brandTopicPlaceholder: 'जैसे FarmFresh — किसानों को शहरी खरीदारों से जोड़ना',
    audienceLabel: 'लक्षित दर्शक',
    audiencePlaceholder: 'जैसे 22-35 साल के शहरी मिलेनियल्स',
    platformLabel: 'प्लेटफॉर्म',
    contentTypeLabel: 'कंटेंट प्रकार',
    goalLabel: 'लक्ष्य',
    toneLabel: 'टोन',
    languageLabel: 'भाषा',
    generateBtn: 'वायरल कंटेंट बनाएं',
    generatingBtn: 'बना रहा है...',
    whatYouGet: '✦ आपको क्या मिलेगा',
    emptyTitle: 'वायरल होने के लिए तैयार?',
    emptyDesc: 'कंटेंट विवरण भरें और पूरा वायरल पैकेज बनाएं',
    loadingTitle: 'वायरल कंटेंट बना रहा है',
    loadingDesc: 'हुक्स, स्क्रिप्ट, सीन और ग्रोथ स्ट्रेटेजी बना रहा है',
    sectionsTitle: '✦ सेक्शन चुनें',
    sectionsDesc: 'क्या बनाना है चुनें',
    hooks: '3 वायरल हुक्स',
    scripts: '3 पूरी स्क्रिप्ट',
    scenes: 'सीन-दर-सीन ब्रेकडाउन',
    music: 'म्यूजिक & ऑडियो सुझाव',
    editing: 'प्रो एडिटिंग टिप्स',
    growth: 'ग्रोथ & एल्गोरिदम इनसाइट्स',
    imageCaptionTitle: 'इमेज कैप्शन जेनरेटर',
    imageCaptionDesc: 'AI कैप्शन के लिए इमेज अपलोड करें',
    uploadBtn: 'इमेज अपलोड करें',
    uploadHint: 'क्लिक करें या खींचें (JPG, PNG, WEBP)',
    generateCaptionBtn: 'कैप्शन बनाएं',
    generatingCaption: 'कैप्शन बना रहा है...',
    captionResult: 'बने हुए कैप्शन',
    noImageError: 'पहले इमेज अपलोड करें।',
    regenerate: 'दोबारा बनाएं',
    copyAll: 'सब कॉपी करें',
    download: 'डाउनलोड',
    copied: 'कॉपी हो गया!',
    backToHub: 'स्टूडियो हब पर वापस',
    studioTitle: 'कंटेंट',
    studioTitleItalic: 'क्रिएटर स्टूडियो',
    studioDesc: 'वायरल सोशल कंटेंट, LinkedIn आर्टिकल और प्लेटफॉर्म-ऑप्टिमाइज्ड पोस्ट बनाएं।',
    viralTab: 'वायरल कंटेंट',
    viralTabDesc: 'रील्स, पोस्ट, स्क्रिप्ट',
    linkedinTab: 'LinkedIn',
    linkedinTabDesc: 'आर्टिकल & पोस्ट',
    imageCaptionTab: 'इमेज कैप्शन',
    imageCaptionTabDesc: 'AI कैप्शन',
    topicRequired: 'कृपया कंटेंट विषय या ब्रांड का वर्णन करें।',
    errApi: 'AI अभी उपलब्ध नहीं है। दोबारा कोशिश करें।',
    errTimeout: 'रिक्वेस्ट टाइम आउट हो गई। दोबारा कोशिश करें।',
  },
}

const getUI = (lang) => VIRAL_UI[lang] || VIRAL_UI['English']

const ALL_SECTION_KEYS = ['hooks','scripts','scenes','music','editing','growth']

const SECTION_META = [
  { key: 'hooks',   Icon: IconHook,         color: '#E07B5A' },
  { key: 'scripts', Icon: IconScrollScript, color: '#9B7AC5' },
  { key: 'scenes',  Icon: IconScene,        color: '#7A9EC5' },
  { key: 'music',   Icon: IconHeadphones,   color: '#6B9B6B' },
  { key: 'editing', Icon: IconEdit,         color: '#B8973A' },
  { key: 'growth',  Icon: IconChart,        color: '#6482B4' },
]

const iStyle  = { width: '100%', padding: '0.65rem 0.95rem', border: '1.5px solid rgba(224,123,90,0.25)', borderRadius: '10px', fontSize: '0.88rem', fontFamily: 'Jost, sans-serif', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }
const liStyle = { width: '100%', padding: '0.65rem 0.95rem', border: '1.5px solid rgba(10,102,194,0.22)', borderRadius: '10px', fontSize: '0.88rem', fontFamily: 'Jost, sans-serif', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }
const lStyle  = { fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }

const LI_GOALS      = ['Build Personal Brand','Thought Leadership','Lead Generation','Product/Service Promotion','Company Branding','Recruitment','Community Building','Share Expertise']
const LI_TONES      = ['Professional & Authoritative','Conversational & Warm','Inspirational & Motivational','Data-Driven & Analytical','Storytelling','Bold & Contrarian','Humble & Authentic']
const LI_INDUSTRIES = ['Technology','Marketing & Advertising','Finance & Banking','Healthcare','Education','Startups & Entrepreneurship','HR & Recruitment','Sales','Consulting','Design & Creative','Legal','Real Estate']
const LI_LENGTHS    = ['Short (500-800 words)','Medium (1000-1500 words)','Long (2000-2500 words)','Deep Dive (3000+ words)']
const LI_BLUE       = '#0A66C2'

// ── Prompts ───────────────────────────────────────────────────────────
function buildViralPrompt(vf, selectedSections) {
  const want = (k) => selectedSections.has(k)
  return `ROLE: You are a professional viral content strategist with 10+ years of experience across YouTube, TikTok, Instagram, and emerging platforms. You write award-winning, publish-ready content.

TASK: Create professional-grade, COMPLETE viral content for ${vf.platform} about: "${vf.topic}"
TARGET AUDIENCE: ${vf.audience || 'General social media users'}
TONE: ${vf.tone}
OUTPUT LANGUAGE: ${vf.language}

CRITICAL RULES (NON-NEGOTIABLE):
1. NEVER leave placeholders, brackets, or incomplete sentences like [text here], [describe], or [add x here]
2. Every single word must be final, polished, and publish-ready
3. Write with specific details, names, numbers, and real examples — never generic filler
4. Each section must be COMPLETE and STANDALONE
5. Use professional formatting with clear structure
6. For "${vf.platform}" platform: follow native formats and algorithm preferences exactly
7. Response must total 2000+ words across all sections

${want('hooks') ? `---VIRAL HOOK---
Generate 3 COMPLETE, scroll-stopping hooks that work specifically for ${vf.platform}:

Variation 1 (Bold/Shocking Pattern):
[Write the FULL, complete hook — a 1-2 sentence shock statement that stops scrolling immediately]

Variation 2 (Question/Curiosity Pattern):
[Write the FULL, complete hook — an irresistible question that compels viewers to watch]

Variation 3 (Emotional/Relatable Pattern):
[Write the FULL, complete hook — a deeply relatable statement that creates instant connection]

Each hook must be specific to "${vf.topic}" — no generic placeholders.
` : ''}
${want('scripts') ? `---FULL SCRIPT---
Create 3 COMPLETE, ready-to-shoot ${vf.platform} scripts for "${vf.topic}" with exact timing and dialogue:

VARIATION 1 — [Name the hook type, e.g., "Story-Driven Hook"]:
[0-3s HOOK] [Write the complete opening hook — exact words to say]
[3-15s BUILD] [Write the complete build section — exact narrative or demonstration]
[15-40s MAIN] [Write the complete main content — specific details, examples, or teaching]
[40-55s CTA] [Write the complete call-to-action — specific, action-oriented direction]

VARIATION 2 — [Different hook type]:
[Full script with exact timing and all dialogue — no placeholders]

VARIATION 3 — [Third hook type]:
[Full script with exact timing and all dialogue — no placeholders]

Every script must be READY TO RECORD. No approximations.
` : ''}
${want('scenes') ? `---SCENE BREAKDOWN---
Complete shot-by-shot breakdown for a professional ${vf.platform} video:

Scene 1 (0-3s): [Specific visual description | Exact text overlay | Exact audio cue]
Scene 2 (3-10s): [Specific visual description | Exact text overlay | Exact audio cue]
Scene 3 (10-20s): [Specific visual description | Exact text overlay | Exact audio cue]
Scene 4 (20-35s): [Specific visual description | Exact text overlay | Exact audio cue]
Scene 5 (35-60s): [Specific visual description | Exact text overlay | Exact audio cue]

CAMERA MOVEMENTS: Specify zoom, pan, cut, or transition for each scene.
VISUAL MOOD: [Describe exact color grade, lighting, and atmosphere]
B-ROLL GUIDANCE: [Specify what content to film for each scene]
` : ''}
${want('music') ? `---MUSIC SUGGESTION---
PRIMARY TRACK: [Specific genre, tempo, energy level | Exact reasoning why it works for "${vf.topic}"]
BACKUP 1: [Specific alternative | Why it works as fallback]
BACKUP 2: [Another specific alternative | Different mood option]

AUDIO STRATEGY:
- Intro (0-3s): [Exact audio cue — e.g., "hard drop," "ambient swell"]
- Build (3-40s): [Exact pacing and energy progression]
- Climax (40-55s): [Peak moment description]
- Resolution (55-60s): [Final audio signature]

MOOD PROFILE: [Describe exact energy, instrumentation, and emotional arc — no vague descriptions]
` : ''}
${want('editing') ? `---EDITING TIPS---
6 SPECIFIC, PROFESSIONAL editing techniques for this ${vf.platform} content:

1. [Complete, actionable editing tip with specifics — e.g., not "add cuts" but "cut every 2-3 seconds in first 15s using hard transitions"]
2. [Another specific technique with implementation details]
3. [Color grading or visual effect specific tip]
4. [Text overlay or graphics specific tip]
5. [Pacing or rhythm specific tip]
6. [Final professional polish tip]

Each tip must be immediately implementable by a professional editor.
` : ''}
${want('growth') ? `---GROWTH INSIGHTS---
POSTING STRATEGY:
Best Posting Times: [Specific days and exact times in IST for ${vf.platform}]
Upload Frequency: [Specific number per week with reasoning]
Best Seasons/Trends: [Current relevant trends for this content type]

ALGORITHM OPTIMIZATION:
Tip 1 (Engagement): [Specific, platform-native tactic — e.g., "Reply to first 10 comments within 5 minutes with 2+ sentence responses"]
Tip 2 (Distribution): [Specific cross-platform tactic — e.g., "Share to Story with specific text and sticker strategy"]
Tip 3 (Watch Time): [Specific retention technique with exact implementation]
Tip 4 (Discovery): [Hashtag, tag, or SEO strategy with exact keywords]

ENGAGEMENT FORMULA:
Caption Strategy: [Exact caption structure with hook statement and specific CTA]
First Comment: [Write the exact first comment to post — drives engagement]
Engagement Bait: [Write the exact question or statement that drives comments]

FIRST 30 MINUTES CHECKLIST:
Minute 1: [Exact action]
Minutes 2-5: [Exact action]
Minutes 6-10: [Exact action]
Minutes 11-30: [Exact action]
` : ''}

LANGUAGE: Output ENTIRELY in ${vf.language}. No language mixing.
FORMAT: Use the section delimiters EXACTLY as shown above.`
}

function buildLinkedInPrompt(lf) {
  const isArticle = lf.contentFormat === 'article'
  return `ROLE: You are a professional LinkedIn ghostwriter with 15+ years of experience. You write viral, board-level, conversion-driving LinkedIn content.

TASK: Create professional-grade LinkedIn content for: "${lf.topic}"
GOAL: ${lf.goal}
AUDIENCE: LinkedIn professionals in ${lf.industry}
TONE: ${lf.tone}
OUTPUT LANGUAGE: ${lf.language}

CRITICAL RULES:
1. ZERO placeholders, brackets, or incomplete sentences
2. Every word is final, polished, professional-grade
3. Use specific numbers, names, and real examples
4. Each section must be COMPLETE and IMMEDIATELY PUBLISHABLE
5. Response minimum 2500+ words
6. LinkedIn native format (short paragraphs, line breaks, strong opens, conversation-starting closes)

${isArticle ? `---LI ARTICLE TITLE---
Option 1: [Write a magnetic, SEO-optimized title about ${lf.topic} — specific, intriguing, 8-12 words]
Option 2: [Write a question-based compelling title about ${lf.topic}]
Option 3: [Write a how-to/transformation title about ${lf.topic}]

---LI ARTICLE HOOK---
[Write the COMPLETE opening hook — 3-4 powerful paragraphs that set up the article's core thesis. Start with a bold statement or personal story about ${lf.topic}]

---LI ARTICLE BODY---
[Write the COMPLETE, fully detailed article body with H2 subheadings and short paragraphs. Length: ${lf.articleLength}. Cover main insights, frameworks, lessons, and specific examples related to ${lf.topic}]

---LI ARTICLE CONCLUSION---
[Write a strong conclusion — the key insight, the transformation promised, and a clear, conversation-starting CTA about ${lf.topic}]

---LI ARTICLE TAGS---
[Generate 7 LinkedIn article tags — exact, searchable, relevant to ${lf.industry} and ${lf.topic}]

---LI POST COMPANION---
[Write a 200-word LinkedIn post to promote this article — hook + 2-3 key points from article + CTA to read full article]
` : `---LI POST HOOK---
Option 1: [Write COMPLETE 1-2 line scroll-stopping hook about ${lf.topic} for ${lf.goal}]
Option 2: [Write COMPLETE personal story hook about ${lf.topic}]
Option 3: [Write COMPLETE contrarian/bold question hook about ${lf.topic}]

---LI POST BODY---
Variation 1 (Story Arc):
[Write the COMPLETE post — personal story format leading to key insight about ${lf.topic}. 300-400 words with line breaks. End with conversation-starting question.]

Variation 2 (Insight-Based):
[Write the COMPLETE post — bold insight broken into 4-5 key points about ${lf.topic}. Numbered or bulleted. Specific examples. Actionable advice. Clear CTA.]

Variation 3 (Contrarian/Bold):
[Write the COMPLETE post — controversial but credible opinion about ${lf.topic}. Reasoning backed by logic/data. Specific examples. Ends with thought-provoking question.]

---LI HOOK PSYCHOLOGY---
[For each of the 3 hooks above, write a detailed explanation of why it works psychologically. What specific psychological principle does each trigger? Why will professionals stop scrolling?]

---LI HASHTAGS---
Core Strategic: #hashtag1 #hashtag2 #hashtag3 [relevant to ${lf.goal}]
Industry-Specific: #hashtag1 #hashtag2 #hashtag3 [relevant to ${lf.industry}]
Reach/Discovery: #hashtag1 #hashtag2 #hashtag3 [high-volume professional hashtags]

---LI ENGAGEMENT STRATEGY---
Best Time to Post: [Specific day and time in IST with reasoning for ${lf.industry}]

First Comment (Post Within 60 Seconds):
[Write the COMPLETE first comment — 2-3 sentences adding value, asking engagement question, or continuing narrative. This drives algorithm visibility.]

Engagement Triggers:
Question 1: [Write a specific question that drives thoughtful comments — not generic, specific to ${lf.topic}]
Question 2: [Another engagement-driving question]

Algorithm Optimization:
Tip 1: [Specific engagement tactic — e.g., "Respond to comments with 3-4 sentence responses within first hour"]
Tip 2: [Specific distribution tactic — e.g., "Share this post to your LinkedIn Story with this specific caption"]
Tip 3: [Specific reach tactic — e.g., "Tag 2-3 relevant professionals or companies in comments within 10 minutes"]

---LI PROFILE OPTIMIZATION---
Headline Suggestion: [Write a magnetic LinkedIn headline for this professional about ${lf.topic}. 120-200 characters. Include keyword, value prop, unique angle.]
About Section Hook: [Write the first 2-3 lines of a compelling LinkedIn About section — storytelling opener that hooks professionals]
`}

FULL OUTPUT LANGUAGE: ${lf.language} throughout
FORMATTING: Use section delimiters EXACTLY — no modifications`
}

function parseViral(text) {
  const get = (key) => { const re = new RegExp('---' + key + '---([\\s\\S]*?)(?=---|$)', 'i'); const m = text.match(re); return m ? m[1].trim() : '' }
  return {
    hooks:    get('VIRAL HOOK'),
    scripts:  get('FULL SCRIPT'),
    scenes:   get('SCENE BREAKDOWN'),
    captions: get('CAPTION'),
    hashtags: get('HASHTAGS'),
    music:    get('MUSIC SUGGESTION'),
    editing:  get('EDITING TIPS'),
    growth:   get('GROWTH INSIGHTS'),
  }
}

function parseLinkedIn(text) {
  const get = (key) => { const re = new RegExp('---' + key + '---([\\s\\S]*?)(?=---|$)', 'i'); const m = text.match(re); return m ? m[1].trim() : '' }
  return {
    articleTitle:      get('LI ARTICLE TITLE'),
    articleHook:       get('LI ARTICLE HOOK'),
    articleBody:       get('LI ARTICLE BODY'),
    articleConclusion: get('LI ARTICLE CONCLUSION'),
    articleTags:       get('LI ARTICLE TAGS'),
    postCompanion:     get('LI POST COMPANION'),
    postHook:          get('LI POST HOOK'),
    postBody:          get('LI POST BODY'),
    postHooksAnalysis: get('LI POST HOOKS ANALYSIS'),
    liHashtags:        get('LI HASHTAGS'),
    liEngagement:      get('LI ENGAGEMENT STRATEGY'),
    liProfile:         get('LI PROFILE OPTIMIZATION'),
  }
}

function viralFallback(vf) {
  return `---VIRAL HOOK---
Variation 1: Stop scrolling — you've been doing ${vf.topic} completely wrong, and it's costing you every single day.
Variation 2: What if one small shift in how you approach ${vf.topic} could change everything you know about it?
Variation 3: Nobody talks about this side of ${vf.topic}, and honestly, it's the only thing that matters.

---FULL SCRIPT---
Variation 1:
[0-3s] HOOK: "Stop scrolling — you've been doing ${vf.topic} wrong."
[3-10s] Most people approach ${vf.topic} the same tired way. They follow the same playbook and wonder why nothing changes.
[10-25s] The truth? The top 1% doing ${vf.topic} know one thing that nobody talks about.
[25-40s] Here's the shift: focus on outcome first, process second. Build the smallest possible system. Measure ruthlessly.
[40-55s] Start today. Not tomorrow. Not Monday. Today. Follow for more like this.
Variation 2:
[0-3s] "This is why 90% of people fail at ${vf.topic}..."
[3-15s] We were exactly where you are — stuck, frustrated, trying everything.
[15-35s] Then we made one decision that changed the entire outcome.
[35-55s] Want to know what it was? Save this and follow for part 2.
Variation 3:
[0-3s] Close-up. Silence. "What I'm about to tell you about ${vf.topic} will make you uncomfortable."
[3-20s] "Most advice on this topic is designed to keep you consuming, not succeeding."
[20-45s] Here's what actually moves the needle — and it's embarrassingly simple.
[45-60s] Share this with someone who needs to hear it. They'll thank you.

---SCENE BREAKDOWN---
Scene 1 (0-3s): Extreme close-up on face or product | Bold text overlay with hook | Music drops hard
Scene 2 (3-10s): Pull back to reveal setting | Problem visualised on screen | Slow zoom in
Scene 3 (10-20s): Quick cuts showing the old way vs new way | Text callouts on key points
Scene 4 (20-40s): Step-by-step demonstration | Text overlay for each step | Upbeat pacing
Scene 5 (40-60s): Result reveal | CTA text animation | Music fade | Handle + watermark visible

---MUSIC SUGGESTION---
Primary: High-energy lo-fi hip hop with a hard intro drop — builds instant tension then settles into focus mode
Backup 1: Cinematic orchestral swell — works perfectly for emotional transformation arcs
Backup 2: Trending Bollywood/pop fusion — instant relatability for Indian audiences
Mood: Start punchy, build through the middle, resolve with an uplifting finish that cues the CTA

---EDITING TIPS---
1. Cut every 2-3 seconds in the first 15 seconds — attention is most fragile here
2. Bold white text with black stroke on every key point — never assume viewers have audio on
3. Use a hard zoom-in transition at the 3-second mark to signal the shift
4. Apply a warm, slightly desaturated grade for lifestyle content — cool tones for tech/education
5. Shoot 3x more B-roll than you think you need — you will always run short in the edit
6. Thumbnail: one strong facial expression or one bold number — no clutter, no exceptions

---GROWTH INSIGHTS---
Best Posting Time: Tuesday, Wednesday, and Friday between 6 PM and 9 PM IST
Frequency: 4-5 times per week for the first 30 days to build algorithmic momentum
Algorithm Tip 1: Watch time percentage beats raw view count — hook hard and cut anything that loses pace
Algorithm Tip 2: Reply to every comment within the first 60 minutes — this signals engagement to the algorithm
Algorithm Tip 3: Share to your Story immediately after posting — cross-platform signals boost initial distribution
Engagement Strategy: End every caption with a direct question that takes 3 seconds to answer
First 30 Minutes: Post → share to Story → reply to first 5 comments → DM 5 close followers → check analytics`
}

function linkedInFallback(lf) {
  const isArticle = lf.contentFormat === 'article'
  if (isArticle) {
    return `---LI ARTICLE TITLE---
Option 1: The ${lf.industry} Playbook Nobody Talks About
Option 2: Why Most ${lf.industry} Professionals Are Solving the Wrong Problem
Option 3: 7 Counterintuitive Lessons That Changed How I Think About ${lf.topic}

---LI ARTICLE HOOK---
I was wrong about ${lf.topic} for years.

Not slightly wrong. Completely, embarrassingly wrong in a way that cost me clients, time, and credibility I'm still rebuilding.

The moment I realised it, I stopped mid-sentence in a meeting and said nothing for what felt like an entire minute.

---LI ARTICLE BODY---
## The Problem With How We Think About This

Most advice about ${lf.topic} sounds reasonable in theory. The problem is that it is designed for a different era, a different market, and frankly, a different kind of professional.

## What the Data Actually Shows

When I looked back at the patterns, the signal was clear. The professionals who consistently win in ${lf.industry} are not doing more. They are doing less — but with ruthless intentionality.

## The Framework That Changed Everything

Start with the outcome. Work backwards to the single constraint. Build the minimum viable system. Then measure without mercy.

## Common Mistakes to Avoid

The three mistakes I see repeated most often in ${lf.industry}: optimising for visibility over credibility, confusing activity with progress, and treating feedback as validation rather than data.

---LI ARTICLE CONCLUSION---
The irony of ${lf.topic} is that the more you simplify your approach, the more complex and rewarding your results become.

Start with one thing. Do it consistently. Then add the next layer.

What is the one thing you are going to simplify this week? Tell me in the comments.

---LI ARTICLE TAGS---
${lf.industry}, Professional Development, Leadership, Career Growth, Business Strategy

---LI POST COMPANION---
I wrote something I have been sitting on for six months.

Most advice about ${lf.topic} is technically correct and practically useless.

The article breaks down the framework that actually works — and the three mistakes that quietly kill careers in ${lf.industry}.

Link in the first comment. Would love to know what resonates.

#${lf.industry.replace(/\s+/g, '')} #ProfessionalDevelopment #Leadership`
  }
  return `---LI POST HOOK---
Option 1: I used to think success in ${lf.topic} was about strategy. Three years later, I know it is about something else entirely.
Option 2: Hot take: 90% of ${lf.industry} professionals are optimising for the wrong metric — and it shows.
Option 3: The best advice I ever received about ${lf.topic} came from someone who had failed at it twice before succeeding.

---LI POST BODY---
Variation 1 (Story format):
Three years ago, I had no idea what I was doing.

I was neck-deep in ${lf.topic}, following every framework, buying every course, and attending every webinar I could find.

Nothing was working.

Then a mentor asked me one question that reframed everything: "Are you solving the real problem, or the comfortable one?"

I have thought about that question every single week since.

What question has reframed how you approach your work?

---

Variation 2 (Insight format):
Most people approach ${lf.topic} in entirely the wrong order.

Here is the sequence that actually works:

→ Get ruthlessly clear on the outcome
→ Identify the single biggest constraint
→ Build the smallest system that removes it
→ Measure the one metric that proves it's working

Everything else is noise until those four steps are locked in.

What would you add or change?

---

Variation 3 (Contrarian format):
Unpopular opinion: ${lf.industry} professionals spend far too much time on strategy and not nearly enough time on consistent execution.

A decent plan executed with intensity beats a perfect plan executed occasionally.

Every time.

Disagree? Tell me exactly why — I want to be challenged on this.

---LI POST HOOKS ANALYSIS---
Option 1 works because it opens with a confession and a pivot — vulnerability earns trust, and the pivot creates curiosity about the conclusion.
Option 2 works because it makes a bold, specific claim that triggers either agreement or disagreement — both drive engagement equally.
Option 3 works because it promises a story with a transformation arc, and the detail "failed twice" adds credibility and intrigue.

---LI HASHTAGS---
Core: #${lf.industry.replace(/\s+/g, '')} #ProfessionalDevelopment #Leadership
Industry: #BusinessStrategy #GrowthMindset #CareerAdvice
Reach: #LinkedIn #Entrepreneurship #WorkSmart

---LI ENGAGEMENT STRATEGY---
Best Time to Post: Tuesday through Thursday between 8 AM and 10 AM IST
First Comment Strategy: Post a follow-up question or additional insight within 5 minutes of publishing
Engagement Bait: End every post with a direct, easy-to-answer question — "What would you add?" gets more responses than "Thoughts?"
Algorithm Tips:
1. LinkedIn rewards posts that generate engagement within the first 60-90 minutes — respond to every comment immediately.
2. Text-only posts consistently outperform image posts for thought leadership content in most industries.
3. Avoid posting links in the body — put them in the first comment and reference that in the post.

---LI PROFILE OPTIMIZATION---
Headline Suggestion: Helping ${lf.audience || lf.industry + ' professionals'} achieve measurable results in ${lf.topic} | ${lf.industry} Specialist
About Section Hook: I spent years following the conventional rules of ${lf.industry}. Then I started questioning them — and everything changed.`
}

// ── Shared UI components ──────────────────────────────────────────────
function ContentCard({ SectionIcon, title, color, badge, children }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: `1px solid ${hov ? color+'40' : color+'20'}`, borderTop: `3px solid ${color}`, padding: '1.35rem', boxShadow: hov ? `0 8px 28px ${color}20` : `0 4px 20px ${color}10`, transition: 'all 0.25s', transform: hov ? 'translateY(-2px)' : 'translateY(0)', animation: 'fadeUp 0.4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${color}14`, border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, transition: 'transform 0.2s', transform: hov ? 'scale(1.1) rotate(4deg)' : 'scale(1)' }}>
            <SectionIcon size={16} />
          </div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color, fontWeight: 600, margin: 0 }}>{title}</h3>
        </div>
        {badge && <span style={{ fontSize: '0.65rem', background: `${color}12`, border: `1px solid ${color}30`, color, borderRadius: '50px', padding: '0.15rem 0.6rem', fontWeight: 600, fontFamily: 'Jost, sans-serif' }}>{badge}</span>}
      </div>
      {children}
    </div>
  )
}

function VariationTabs({ raw, color }) {
  const [active, setActive] = useState(0)
  const parts = raw.split(/Variation\s+\d+[:(---]\s*/i).filter(p => p.trim())
  const labels = ['Var 1', 'Var 2', 'Var 3']
  if (parts.length <= 1) return <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85 }}>{renderMarkdownText(raw)}</div>
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.85rem' }}>
        {parts.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ padding: '0.28rem 0.8rem', borderRadius: '50px', cursor: 'pointer', border: `1.5px solid ${active === i ? color : color+'30'}`, background: active === i ? `${color}14` : 'var(--bg-surface)', color: active === i ? color : 'var(--text-muted)', fontSize: '0.73rem', fontWeight: active === i ? 700 : 400, fontFamily: 'Jost, sans-serif', transition: 'all 0.15s' }}>
            {labels[i]}
          </button>
        ))}
      </div>
      <div style={{ background: `${color}06`, border: `1px solid ${color}18`, borderRadius: '12px', padding: '1rem' }}>
        <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{renderMarkdownText(parts[active]?.trim())}</div>
      </div>
      <button onClick={() => navigator.clipboard.writeText(parts[active]?.trim())} style={{ marginTop: '0.55rem', background: 'transparent', border: `1px solid ${color}35`, color, borderRadius: '8px', padding: '0.32rem 0.85rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <IconCopy size={11} /> Copy this variation
      </button>
    </div>
  )
}

function OptionTabs({ raw, color, labels: customLabels }) {
  const [active, setActive] = useState(0)
  const parts = raw.split(/Option\s+\d+[:(]\s*/i).filter(p => p.trim())
  const labels = customLabels || parts.map((_, i) => `Option ${i + 1}`)
  if (parts.length <= 1) return <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85 }}>{renderMarkdownText(raw)}</div>
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        {parts.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ padding: '0.28rem 0.8rem', borderRadius: '50px', cursor: 'pointer', border: `1.5px solid ${active === i ? color : color+'30'}`, background: active === i ? `${color}14` : 'var(--bg-surface)', color: active === i ? color : 'var(--text-muted)', fontSize: '0.73rem', fontWeight: active === i ? 700 : 400, fontFamily: 'Jost, sans-serif', transition: 'all 0.15s' }}>
            {labels[i] || 'Option ' + (i+1)}
          </button>
        ))}
      </div>
      <div style={{ background: `${color}06`, border: `1px solid ${color}18`, borderRadius: '12px', padding: '1rem' }}>
        <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{renderMarkdownText(parts[active]?.trim())}</div>
      </div>
      <button onClick={() => navigator.clipboard.writeText(parts[active]?.trim())} style={{ marginTop: '0.55rem', background: 'transparent', border: `1px solid ${color}35`, color, borderRadius: '8px', padding: '0.32rem 0.85rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <IconCopy size={11} /> Copy this option
      </button>
    </div>
  )
}

function CopyBlock({ text, color }) {
  const [copied, setCopied] = useState(false)
  return (
    <div>
      <div style={{ background: `${color}06`, border: `1px solid ${color}18`, borderRadius: '12px', padding: '1rem', whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif', maxHeight: '320px', overflowY: 'auto' }}>{renderMarkdownText(text)}</div>
      <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) }}
        style={{ marginTop: '0.55rem', background: copied ? 'var(--success-bg)' : 'transparent', border: `1px solid ${copied ? 'var(--success)' : color+'35'}`, color: copied ? 'var(--success)' : color, borderRadius: '8px', padding: '0.32rem 0.85rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}>
        {copied ? <><IconCheck size={11} /> Copied!</> : <><IconCopy size={11} /> Copy</>}
      </button>
    </div>
  )
}

// ── Section Selector ──────────────────────────────────────────────────
function ViralSectionSelector({ selected, onToggle, onSelectAll, onDeselect, ui }) {
  const [open, setOpen] = useState(false)
  const n = selected.size
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: open ? 'rgba(224,123,90,0.1)' : 'rgba(224,123,90,0.05)', border: `1.5px solid ${open ? 'rgba(224,123,90,0.4)' : 'rgba(224,123,90,0.2)'}`, borderRadius: open ? '12px 12px 0 0' : '12px', cursor: 'pointer', transition: 'all 0.25s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(224,123,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E07B5A' }}><IconScrollScript size={14} /></div>
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#E07B5A', fontFamily: 'Jost, sans-serif' }}>{ui.sectionsTitle}</div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif' }}>{n} / {ALL_SECTION_KEYS.length} {ui.sectionsDesc}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ background: '#E07B5A', color: '#fff', borderRadius: '50px', padding: '1px 7px', fontSize: '0.69rem', fontWeight: 700, fontFamily: 'Jost, sans-serif' }}>{n}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E07B5A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      </button>
      <div style={{ maxHeight: open ? '520px' : '0px', overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)', border: open ? '1.5px solid rgba(224,123,90,0.2)' : '1.5px solid transparent', borderTop: 'none', borderRadius: '0 0 12px 12px', background: 'var(--bg-surface)' }}>
        {SECTION_META.map((s, i) => {
          const sel = selected.has(s.key)
          return (
            <div key={s.key} onClick={() => onToggle(s.key)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.9rem', borderBottom: i < SECTION_META.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: sel ? `${s.color}09` : 'transparent', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'rgba(224,123,90,0.04)' }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}>
              <div style={{ width: '17px', height: '17px', borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${sel ? s.color : 'var(--border-soft)'}`, background: sel ? s.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {sel && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div style={{ width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0, background: sel ? `${s.color}18` : `${s.color}0d`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <s.Icon size={13} />
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: sel ? 600 : 400, color: sel ? s.color : 'var(--text-soft)', fontFamily: 'Jost, sans-serif' }}>{ui[s.key]}</div>
            </div>
          )
        })}
        <div style={{ display: 'flex', gap: '0.4rem', padding: '0.6rem 0.9rem', borderTop: '1px solid var(--border)', background: 'rgba(224,123,90,0.04)' }}>
          <button onClick={e => { e.stopPropagation(); onSelectAll() }} style={{ padding: '0.28rem 0.7rem', borderRadius: '7px', background: 'rgba(224,123,90,0.12)', border: '1px solid rgba(224,123,90,0.25)', color: '#E07B5A', fontSize: '0.71rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Select all</button>
          <button onClick={e => { e.stopPropagation(); onDeselect() }} style={{ padding: '0.28rem 0.7rem', borderRadius: '7px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.71rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>Deselect all</button>
          <span style={{ marginLeft: 'auto', fontSize: '0.69rem', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif', alignSelf: 'center' }}>{n} / {ALL_SECTION_KEYS.length}</span>
        </div>
      </div>
    </div>
  )
}

// ── Image Caption Tab ─────────────────────────────────────────────────
function ImageCaptionTab({ ui, addEntry }) {
  const [image, setImage]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [captions, setCaptions] = useState('')
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [platform, setPlatform] = useState('Instagram')
  const [captionLang, setCaptionLang] = useState('English')
  const fileRef = useRef(null)

  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const b64 = e.target.result.split(',')[1]
      setImage({ url: e.target.result, base64: b64, type: file.type })
      setCaptions(''); setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); loadFile(e.dataTransfer.files[0]) }

  const handleGenerate = async () => {
    if (!image) { setError(ui.noImageError); return }
    setLoading(true); setError(''); setCaptions('')
    const prompt = `Analyze this image carefully and generate 3 complete, engaging, platform-ready captions for ${platform}.

Variation 1 (Engaging with emojis): Write the full caption with relevant emojis, a strong hook, a clear CTA, and 5 relevant hashtags. Make it specific to what you actually see in the image.
Variation 2 (Storytelling): Write a full narrative-style caption — no emojis, human tone, and 3 hashtags. Tell a story inspired by what the image shows.
Variation 3 (Short & Punchy): Write 1-3 powerful lines with 3 hashtags. Punchy, memorable, specific.

Platform: ${platform}. Language: ${captionLang}.
Write every caption as a professional social media manager who has studied this image. Never use placeholder text. Make each caption specific to the actual image content.

[Image context will be analyzed by AI — no need for descriptions]`

    try {
      const txt = await callBackendAI({
        system: `You are a professional social media caption writer. Analyze images and write platform-specific, engaging captions. Be creative, specific to the actual image content, and never use placeholder text.`,
        prompt,
        timeout: 50000,
        image,
      })
      if (txt) {
        setCaptions(txt)
        // Save to history
        await addEntry({
          feature: 'image_caption',
          title: `${platform} Caption`,
          output: txt,
          platform: platform,
          language: captionLang,
          metadata: { imageType: 'user-uploaded' }
        })
        setLoading(false)
        return
      }
      setError(ui.errApi)
    } catch (err) {
      setError(err?.name === 'AbortError' ? ui.errTimeout : ui.errApi)
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(224,123,90,0.15)', borderTop: '3px solid #E07B5A', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(224,123,90,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E07B5A' }}><IconImage size={14} /></div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#E07B5A', fontSize: '1.05rem', margin: 0 }}>{ui.imageCaptionTitle}</h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif', marginBottom: '1rem', lineHeight: 1.6 }}>{ui.imageCaptionDesc}</p>

          <div onClick={() => fileRef.current?.click()} onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            style={{ border: `2px dashed ${dragOver ? '#E07B5A' : 'rgba(224,123,90,0.3)'}`, borderRadius: '12px', padding: image ? '0' : '2.5rem 1rem', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(224,123,90,0.06)' : image ? 'transparent' : 'rgba(224,123,90,0.02)', transition: 'all 0.2s', overflow: 'hidden', marginBottom: '1rem' }}>
            {image ? (
              <div style={{ position: 'relative' }}>
                <img src={image.url} alt="Upload" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '10px', display: 'block' }} />
                <button onClick={e => { e.stopPropagation(); setImage(null); setCaptions('') }}
                  style={{ position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            ) : (
              <>
                <div style={{ color: '#E07B5A', opacity: 0.5, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}><IconUpload size={28} /></div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif', margin: 0 }}>{ui.uploadHint}</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />

          <div style={{ marginBottom: '0.85rem' }}>
            <label style={lStyle}>Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
              {['Instagram','LinkedIn','Twitter/X','Facebook','TikTok','YouTube'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={lStyle}>Caption Language</label>
            <select value={captionLang} onChange={e => setCaptionLang(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
              {['English','Hindi','Tamil','Telugu','Malayalam','Kannada','Bengali','Marathi','Gujarati'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          {error && <div style={{ padding: '0.65rem 0.9rem', background: 'var(--error-bg)', border: '1px solid var(--error)', borderLeft: '3px solid var(--error)', borderRadius: '8px', color: 'var(--error)', fontSize: '0.8rem', fontFamily: 'Jost, sans-serif', marginBottom: '0.75rem' }}>⚠️ {error}</div>}

          <button onClick={handleGenerate} disabled={loading}
            style={{ padding: '0.9rem', width: '100%', fontSize: '0.88rem', background: loading ? 'rgba(224,123,90,0.3)' : 'linear-gradient(135deg, #E07B5A, #C05A3A)', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', fontWeight: 700, fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
            {loading
              ? <><div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', animation: 'spin 0.8s linear infinite' }} /> {ui.generatingCaption}</>
              : <><IconImage size={15} /> {ui.generateCaptionBtn}</>}
          </button>
        </div>

        <div style={{ background: 'rgba(224,123,90,0.04)', border: '1px solid rgba(224,123,90,0.15)', borderRadius: '12px', padding: '1rem' }}>
          <p style={{ fontSize: '0.67rem', color: '#E07B5A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem', fontFamily: 'Jost, sans-serif' }}>✦ What you get</p>
          {[['3 caption variations per image','#E07B5A'],['Platform-specific tone','#9B7AC5'],['Hashtag suggestions included','#4A9B9B'],['Multi-language support','#6B9B6B']].map(([label, color]) => (
            <div key={label} style={{ fontSize: '0.74rem', color: 'var(--text-soft)', marginBottom: '0.3rem', display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
              <span style={{ color, fontSize: '8px' }}>●</span> {label}
            </div>
          ))}
        </div>
      </div>

      <div>
        {!captions && !loading && (
          <div style={{ background: 'var(--bg-surface)', border: '1.5px dashed rgba(224,123,90,0.25)', borderRadius: '16px', padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#E07B5A', opacity: 0.4 }}><IconImage size={52} /></div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#E07B5A', fontSize: '1.4rem', marginBottom: '0.5rem' }}>{ui.imageCaptionTitle}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', maxWidth: '300px', margin: '0 auto', lineHeight: 1.65, fontFamily: 'Jost, sans-serif' }}>Upload any image and get 3 platform-ready captions instantly</p>
          </div>
        )}
        {loading && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(224,123,90,0.15)', borderRadius: '20px', padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 1.5rem' }}>
              <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '2px solid rgba(224,123,90,0.2)', animation: 'ringPulse 1.8s ease-out infinite' }} />
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #E07B5A, #C05A3A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IconImage size={24} /></div>
            </div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', fontSize: '1.35rem', marginBottom: '0.4rem' }}>
              Analysing image<span style={{ animation: 'dotDance 1.4s infinite', display: 'inline-block' }}>.</span><span style={{ animation: 'dotDance 1.4s infinite 0.2s', display: 'inline-block' }}>.</span><span style={{ animation: 'dotDance 1.4s infinite 0.4s', display: 'inline-block' }}>.</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'Jost, sans-serif' }}>Reading image context and writing for {platform}</p>
          </div>
        )}
        {captions && (
          <ContentCard SectionIcon={IconCaption} title={ui.captionResult} color="#E07B5A" badge="3 variations">
            <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { navigator.clipboard.writeText(captions); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                style={{ background: copied ? 'var(--success-bg)' : 'rgba(224,123,90,0.08)', border: `1px solid ${copied ? 'var(--success)' : 'rgba(224,123,90,0.3)'}`, color: copied ? 'var(--success)' : '#E07B5A', padding: '0.38rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {copied ? <><IconCheck size={12} /> {ui.copied}</> : <><IconCopy size={12} /> {ui.copyAll}</>}
              </button>
              <button onClick={handleGenerate} style={{ background: 'transparent', border: '1px solid rgba(224,123,90,0.3)', color: '#E07B5A', padding: '0.38rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IconRefresh size={12} /> {ui.regenerate}
              </button>
            </div>
            <VariationTabs raw={captions} color="#E07B5A" />
          </ContentCard>
        )}
      </div>
    </div>
  )
}

// ── Tab switcher ──────────────────────────────────────────────────────
function StudioTabs({ active, onChange, ui }) {
  const tabs = [
    { id: 'viral',        label: ui.viralTab,        Icon: IconScrollScript, color: '#E07B5A', desc: ui.viralTabDesc        },
    { id: 'linkedin',     label: ui.linkedinTab,     Icon: IconLinkedIn,     color: LI_BLUE,   desc: ui.linkedinTabDesc     },
    { id: 'imageCaption', label: ui.imageCaptionTab, Icon: IconImage,        color: '#9B7AC5', desc: ui.imageCaptionTabDesc },
  ]
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '0.4rem' }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '0.75rem 0.75rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: active === tab.id ? `${tab.color}12` : 'transparent', color: active === tab.id ? tab.color : 'var(--text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: active === tab.id ? 600 : 400, fontSize: '0.85rem', boxShadow: active === tab.id ? `inset 0 0 0 1.5px ${tab.color}40` : 'none', transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)', transform: active === tab.id ? 'scale(1.02)' : 'scale(1)' }}
          onMouseEnter={e => { if (active !== tab.id) e.currentTarget.style.background = `${tab.color}07` }}
          onMouseLeave={e => { if (active !== tab.id) e.currentTarget.style.background = 'transparent' }}>
          <tab.Icon size={16} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ lineHeight: 1.2 }}>{tab.label}</div>
            <div style={{ fontSize: '0.66rem', fontWeight: 400, color: active === tab.id ? `${tab.color}bb` : 'var(--text-faint)', lineHeight: 1.2, marginTop: '1px' }}>{tab.desc}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

function FormatToggle({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-surface-2)', borderRadius: '10px', padding: '3px', marginBottom: '1.25rem', border: '1px solid rgba(10,102,194,0.15)' }}>
      {[['article', IconArticle, 'Long Article'], ['post', IconPost, 'Post']].map(([val, Icon, label]) => (
        <button key={val} onClick={() => onChange(val)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: value === val ? LI_BLUE : 'transparent', color: value === val ? '#fff' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: value === val ? 600 : 400, fontFamily: 'Jost, sans-serif', transition: 'all 0.2s' }}>
          <Icon size={14} /> {label}
        </button>
      ))}
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────
export default function ViralStudio() {
  const navigate = useNavigate()
  const { lang }  = useLanguage()
  const ui        = getUI(lang)

  const [studio, setStudio] = useState('viral')

  // Viral state
  const [vform, setVform] = useState({ platform: '', contentType: '', goal: '', audience: '', topic: '', tone: '', language: 'English' })
  const [selectedSections, setSelectedSections] = useState(new Set(ALL_SECTION_KEYS))
  const [vloading, setVload]  = useState(false)
  const [vdata,    setVdata]  = useState(null)
  const [vraw,     setVraw]   = useState('')
  const [verror,   setVerr]   = useState('')
  const [vcopied,  setVcopy]  = useState(false)
  const vset = k => e => setVform(p => ({ ...p, [k]: e.target.value }))

  const prevLang = useRef(lang)
  if (prevLang.current !== lang) {
    prevLang.current = lang
    const newUI = getUI(lang)
    setVform(p => ({
      ...p,
      platform:    p.platform    && ui.platforms.includes(p.platform)       ? newUI.platforms[ui.platforms.indexOf(p.platform)]         : newUI.platforms[0],
      contentType: p.contentType && ui.contentTypes.includes(p.contentType) ? newUI.contentTypes[ui.contentTypes.indexOf(p.contentType)] : newUI.contentTypes[0],
      goal:        p.goal        && ui.goals.includes(p.goal)               ? newUI.goals[ui.goals.indexOf(p.goal)]                      : newUI.goals[0],
      tone:        p.tone        && ui.tones.includes(p.tone)               ? newUI.tones[ui.tones.indexOf(p.tone)]                      : newUI.tones[0],
    }))
  }

  const initialized = useRef(false)
  if (!initialized.current) {
    initialized.current = true
    vform.platform    = ui.platforms[0]
    vform.contentType = ui.contentTypes[0]
    vform.goal        = ui.goals[0]
    vform.tone        = ui.tones[0]
  }

  // LinkedIn state
  const [lform, setLform] = useState({ topic: '', audience: '', goal: 'Thought Leadership', industry: 'Technology', tone: 'Professional & Authoritative', contentFormat: 'post', articleLength: 'Medium (1000-1500 words)', language: 'English' })
  const [lloading, setLload] = useState(false)
  const [ldata,    setLdata] = useState(null)
  const [lraw,     setLraw]  = useState('')
  const [lerror,   setLerr]  = useState('')
  const [lcopied,  setLcopy] = useState(false)
  const lset = k => e => setLform(p => ({ ...p, [k]: e.target.value }))

  const { addEntry } = useHistory()

  // ── Viral handler — calls backend /viral endpoint ──────────────────────
  const handleViralGenerate = async () => {
    if (!vform.topic.trim()) { setVerr(ui.topicRequired); return }
    if (selectedSections.size === 0) { setVerr('Please select at least one section.'); return }
    setVload(true); setVerr(''); setVdata(null); setVraw('')
    try {
      const txt = await callBackendAI({
        system: `You are a world-class viral content strategist for ${vform.platform}. Write COMPLETE, READY-TO-USE content. Never use placeholder text. Every word must be real, specific, and publish-ready. Be creative, culturally relevant, and platform-native.`,
        prompt: buildViralPrompt(vform, selectedSections),
      })
      if (txt) {
        setVraw(txt)
        setVdata(parseViral(txt))
        // Save to history
        await addEntry({
          feature: 'viral',
          title: vform.topic.substring(0, 60),
          output: txt,
          platform: vform.platform,
          contentType: vform.contentType,
          goal: vform.goal,
          audience: vform.audience,
          tone: vform.tone,
          language: vform.language,
          metadata: { sections: Array.from(selectedSections).join(', ') }
        })
      } else { setVerr(ui.errApi) }
    } catch (err) {
      if (err?.name === 'AbortError') {
        setVerr(ui.errTimeout)
      } else {
        setVerr(ui.errApi)
      }
    }
    setVload(false)
  }

  // ── LinkedIn handler — calls backend /viral endpoint ───────────────────
  const handleLinkedInGenerate = async () => {
    if (!lform.topic.trim()) { setLerr('Please describe your topic or subject.'); return }
    setLload(true); setLerr(''); setLdata(null); setLraw('')
    try {
      const txt = await callBackendAI({
        system: `You are a top LinkedIn ghostwriter and content strategist. Write COMPLETE, READY-TO-PUBLISH LinkedIn content. Never use placeholder text. Every word must be real, specific, and immediately publishable. Write like the person's authentic voice — not like an AI assistant.`,
        prompt: buildLinkedInPrompt(lform),
      })
      if (txt) {
        setLraw(txt)
        setLdata(parseLinkedIn(txt))
        // Save to history
        await addEntry({
          feature: 'linkedin',
          title: lform.topic.substring(0, 60),
          output: txt,
          contentFormat: lform.contentFormat,
          goal: lform.goal,
          industry: lform.industry,
          tone: lform.tone,
          language: lform.language,
          metadata: { articleLength: lform.articleLength }
        })
      } else { setLerr(ui.errApi) }
    } catch (err) {
      if (err?.name === 'AbortError') {
        setLerr(ui.errTimeout)
      } else {
        setLerr(ui.errApi)
      }
    }
    setLload(false)
  }

  const handleDownload = (raw, platform, topic) => {
    if (!raw) return
    const blob = new Blob([`CONTENT — MuseAI\nPlatform: ${platform} | Topic: ${topic}\n${'='.repeat(60)}\n\n` + raw], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${platform.toLowerCase()}-content-${Date.now()}.txt`; a.click(); URL.revokeObjectURL(url)
  }

  const isArticle = lform.contentFormat === 'article'

  return (
    <AppLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <button onClick={() => navigate('/ai-suggestion')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid rgba(224,123,90,0.25)', borderRadius: '8px', padding: '0.4rem 0.9rem', cursor: 'pointer', color: '#E07B5A', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', marginBottom: '1.5rem', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(224,123,90,0.08)'; e.currentTarget.style.transform = 'translateX(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)' }}>
          <IconBack size={14} /> {ui.backToHub}
        </button>

        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {ui.studioTitle} <em style={{ color: '#E07B5A' }}>{ui.studioTitleItalic}</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.4rem', maxWidth: '560px', lineHeight: 1.6, fontFamily: 'Jost, sans-serif' }}>{ui.studioDesc}</p>
        </div>

        <StudioTabs active={studio} onChange={setStudio} ui={ui} />

        {/* ─── VIRAL TAB ─── */}
        {studio === 'viral' && (
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(224,123,90,0.15)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(224,123,90,0.12)', border: '1px solid rgba(224,123,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E07B5A' }}><IconScrollScript size={14} /></div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#E07B5A', fontSize: '1.05rem', margin: 0 }}>{ui.contentDetailsTitle}</h3>
                </div>
                <div style={{ marginBottom: '0.85rem' }}><label style={lStyle}>{ui.brandTopicLabel}</label><input placeholder={ui.brandTopicPlaceholder} value={vform.topic} onChange={vset('topic')} style={iStyle} /></div>
                <div style={{ marginBottom: '0.85rem' }}><label style={lStyle}>{ui.audienceLabel}</label><input placeholder={ui.audiencePlaceholder} value={vform.audience} onChange={vset('audience')} style={iStyle} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><label style={lStyle}>{ui.platformLabel}</label><select value={vform.platform} onChange={vset('platform')} style={{ ...iStyle, cursor: 'pointer' }}>{ui.platforms.map(o => <option key={o}>{o}</option>)}</select></div>
                  <div><label style={lStyle}>{ui.contentTypeLabel}</label><select value={vform.contentType} onChange={vset('contentType')} style={{ ...iStyle, cursor: 'pointer' }}>{ui.contentTypes.map(o => <option key={o}>{o}</option>)}</select></div>
                  <div><label style={lStyle}>{ui.goalLabel}</label><select value={vform.goal} onChange={vset('goal')} style={{ ...iStyle, cursor: 'pointer' }}>{ui.goals.map(o => <option key={o}>{o}</option>)}</select></div>
                  <div><label style={lStyle}>{ui.toneLabel}</label><select value={vform.tone} onChange={vset('tone')} style={{ ...iStyle, cursor: 'pointer' }}>{ui.tones.map(o => <option key={o}>{o}</option>)}</select></div>
                </div>
                <div style={{ marginTop: '0.75rem' }}><label style={lStyle}>{ui.languageLabel}</label><select value={vform.language} onChange={vset('language')} style={{ ...iStyle, cursor: 'pointer' }}>{ui.languages.map(l => <option key={l}>{l}</option>)}</select></div>
              </div>

              {verror && <div style={{ padding: '0.75rem 1rem', background: 'var(--error-bg)', border: '1px solid var(--error)', borderLeft: '3px solid var(--error)', borderRadius: '8px', color: 'var(--error)', fontSize: '0.82rem', fontFamily: 'Jost, sans-serif' }}>⚠️ {verror}</div>}

              <button onClick={handleViralGenerate} disabled={vloading}
                style={{ padding: '1rem', width: '100%', fontSize: '0.9rem', background: vloading ? 'rgba(224,123,90,0.3)' : 'linear-gradient(135deg, #E07B5A, #C05A3A)', border: 'none', borderRadius: '12px', cursor: vloading ? 'not-allowed' : 'pointer', color: '#fff', fontWeight: 700, fontFamily: 'Jost, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: vloading ? 'none' : '0 6px 24px rgba(224,123,90,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s' }}
                onMouseEnter={e => { if (!vloading) e.currentTarget.style.transform = 'scale(1.02)' }}
                onMouseLeave={e => { if (!vloading) e.currentTarget.style.transform = 'scale(1)' }}>
                {vloading
                  ? <><div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', animation: 'spin 0.8s linear infinite' }} /> {ui.generatingBtn}</>
                  : <><IconScrollScript size={16} /> {ui.generateBtn}</>}
              </button>

              <ViralSectionSelector
                selected={selectedSections}
                onToggle={key => setSelectedSections(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })}
                onSelectAll={() => setSelectedSections(new Set(ALL_SECTION_KEYS))}
                onDeselect={() => setSelectedSections(new Set())}
                ui={ui}
              />
            </div>

            <div>
              {!vdata && !vloading && (
                <div style={{ background: 'var(--bg-surface)', border: '1.5px dashed rgba(224,123,90,0.25)', borderRadius: '16px', padding: '5rem 2rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#E07B5A', opacity: 0.45 }}><IconScene size={56} /></div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#E07B5A', fontSize: '1.4rem', marginBottom: '0.5rem' }}>{ui.emptyTitle}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '320px', margin: '0 auto', lineHeight: 1.65, fontFamily: 'Jost, sans-serif' }}>{ui.emptyDesc}</p>
                </div>
              )}
              {vloading && (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(224,123,90,0.15)', borderRadius: '20px', padding: '3.5rem 2rem', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 2rem' }}>
                    <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: '2px solid rgba(224,123,90,0.2)', animation: 'ringPulse 1.8s ease-out infinite' }} />
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #E07B5A, #C05A3A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IconScrollScript size={28} /></div>
                  </div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>
                    {ui.loadingTitle}<span style={{ animation: 'dotDance 1.4s infinite 0s', display: 'inline-block' }}>.</span><span style={{ animation: 'dotDance 1.4s infinite 0.2s', display: 'inline-block' }}>.</span><span style={{ animation: 'dotDance 1.4s infinite 0.4s', display: 'inline-block' }}>.</span>
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'Jost, sans-serif' }}>{ui.loadingDesc}</p>
                </div>
              )}
              {vdata && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif' }}>{vform.platform} · {vform.contentType} · {vform.tone}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={handleViralGenerate} style={{ background: 'transparent', border: '1px solid rgba(224,123,90,0.3)', color: '#E07B5A', padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}><IconRefresh size={12} /> {ui.regenerate}</button>
                      <button onClick={() => { navigator.clipboard.writeText(vraw); setVcopy(true); setTimeout(() => setVcopy(false), 2000) }}
                        style={{ background: vcopied ? 'var(--success-bg)' : 'rgba(224,123,90,0.08)', border: `1px solid ${vcopied ? 'var(--success)' : 'rgba(224,123,90,0.3)'}`, color: vcopied ? 'var(--success)' : '#E07B5A', padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {vcopied ? <><IconCheck size={12} /> {ui.copied}</> : <><IconCopy size={12} /> {ui.copyAll}</>}
                      </button>
                      <button onClick={() => handleDownload(vraw, vform.platform, vform.topic)}
                        style={{ background: 'linear-gradient(135deg, #E07B5A, #C05A3A)', border: 'none', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 3px 10px rgba(224,123,90,0.3)' }}><IconDownload size={12} /> {ui.download}</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {vdata.hooks   && selectedSections.has('hooks')   && <ContentCard SectionIcon={IconHook}         title="Viral Hooks"     color="#E07B5A" badge="3 variations"><VariationTabs raw={vdata.hooks}   color="#E07B5A" /></ContentCard>}
                    {vdata.scripts && selectedSections.has('scripts') && <ContentCard SectionIcon={IconScrollScript} title="Full Script"      color="#9B7AC5" badge="3 variations"><VariationTabs raw={vdata.scripts} color="#9B7AC5" /></ContentCard>}
                    {vdata.scenes  && selectedSections.has('scenes')  && <ContentCard SectionIcon={IconScene}        title="Scene Breakdown" color="#7A9EC5" badge="Shot list"><div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(vdata.scenes)}</div></ContentCard>}
                    {vdata.captions && <ContentCard SectionIcon={IconCaption} title="Captions" color="#4A9B9B" badge="3 variations"><VariationTabs raw={vdata.captions} color="#4A9B9B" /></ContentCard>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {vdata.hashtags && (
                        <ContentCard SectionIcon={IconHashtag} title="Hashtags" color="#4A9B9B">
                          {vdata.hashtags.split('\n').filter(l => l.trim()).map((row, i) => {
                            const tags  = row.replace(/^(Primary|Niche|Trending|Location):\s*/i, '')
                            const label = row.match(/^(Primary|Niche|Trending|Location):/i)?.[0]?.replace(':', '') || `Set ${i+1}`
                            return (
                              <div key={i} style={{ marginBottom: '0.6rem' }}>
                                <div style={{ fontSize: '0.63rem', color: '#4A9B9B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem', fontFamily: 'Jost, sans-serif' }}>{label}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                  {tags.split(/\s+/).filter(t => t.startsWith('#')).map((tag, j) => (
                                    <button key={j} onClick={() => navigator.clipboard.writeText(tag)} style={{ background: 'rgba(74,155,155,0.08)', border: '1px solid rgba(74,155,155,0.25)', color: '#4A9B9B', borderRadius: '50px', padding: '0.18rem 0.6rem', cursor: 'pointer', fontSize: '0.76rem', fontFamily: 'Jost, sans-serif', transition: 'all 0.15s' }}>{tag}</button>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                          <button onClick={() => navigator.clipboard.writeText(vdata.hashtags)} style={{ marginTop: '0.4rem', background: 'rgba(74,155,155,0.1)', border: '1px solid rgba(74,155,155,0.3)', color: '#4A9B9B', borderRadius: '8px', padding: '0.35rem 0.9rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}><IconCopy size={11} /> Copy All</button>
                        </ContentCard>
                      )}
                      {vdata.music && selectedSections.has('music') && <ContentCard SectionIcon={IconHeadphones} title="Music Suggestions" color="#6B9B6B"><div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(vdata.music)}</div></ContentCard>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {vdata.editing && selectedSections.has('editing') && <ContentCard SectionIcon={IconEdit}  title="Editing Tips"    color="#B8973A"><div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(vdata.editing)}</div></ContentCard>}
                      {vdata.growth  && selectedSections.has('growth')  && <ContentCard SectionIcon={IconChart} title="Growth Insights" color="#6482B4"><div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(vdata.growth)}</div></ContentCard>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── LINKEDIN TAB ─── */}
        {studio === 'linkedin' && (
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>
              <div style={{ background: 'var(--bg-surface)', border: `1px solid rgba(10,102,194,0.18)`, borderTop: `3px solid ${LI_BLUE}`, borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(10,102,194,0.1)', border: '1px solid rgba(10,102,194,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: LI_BLUE }}><IconLinkedIn size={14} /></div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: LI_BLUE, fontSize: '1.05rem', margin: 0 }}>LinkedIn Creator</h3>
                </div>
                <FormatToggle value={lform.contentFormat} onChange={v => setLform(p => ({ ...p, contentFormat: v }))} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div><label style={lStyle}>Topic / Subject *</label><input placeholder={isArticle ? 'e.g. Why most founders fail at personal branding' : 'e.g. The mindset shift that doubled my productivity'} value={lform.topic} onChange={lset('topic')} style={liStyle} /></div>
                  <div><label style={lStyle}>Target Audience</label><input placeholder="e.g. Startup founders, HR managers, marketing professionals" value={lform.audience} onChange={lset('audience')} style={liStyle} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div><label style={lStyle}>Goal</label><select value={lform.goal} onChange={lset('goal')} style={{ ...liStyle, cursor: 'pointer' }}>{LI_GOALS.map(o => <option key={o}>{o}</option>)}</select></div>
                    <div><label style={lStyle}>Industry</label><select value={lform.industry} onChange={lset('industry')} style={{ ...liStyle, cursor: 'pointer' }}>{LI_INDUSTRIES.map(o => <option key={o}>{o}</option>)}</select></div>
                  </div>
                  <div><label style={lStyle}>Tone</label><select value={lform.tone} onChange={lset('tone')} style={{ ...liStyle, cursor: 'pointer' }}>{LI_TONES.map(o => <option key={o}>{o}</option>)}</select></div>
                  {isArticle && <div><label style={lStyle}>Article Length</label><select value={lform.articleLength} onChange={lset('articleLength')} style={{ ...liStyle, cursor: 'pointer' }}>{LI_LENGTHS.map(o => <option key={o}>{o}</option>)}</select></div>}
                  <div><label style={lStyle}>Language</label><select value={lform.language} onChange={lset('language')} style={{ ...liStyle, cursor: 'pointer' }}>{['English','Hindi','Tamil','Telugu','Malayalam','Kannada','Bengali','Marathi','Gujarati'].map(l => <option key={l}>{l}</option>)}</select></div>
                </div>
              </div>

              {lerror && <div style={{ padding: '0.75rem 1rem', background: 'var(--error-bg)', border: '1px solid var(--error)', borderLeft: '3px solid var(--error)', borderRadius: '8px', color: 'var(--error)', fontSize: '0.82rem', fontFamily: 'Jost, sans-serif' }}>⚠️ {lerror}</div>}

              <button onClick={handleLinkedInGenerate} disabled={lloading}
                style={{ padding: '1rem', width: '100%', fontSize: '0.9rem', background: lloading ? 'rgba(10,102,194,0.25)' : `linear-gradient(135deg, ${LI_BLUE}, #004182)`, border: 'none', borderRadius: '12px', cursor: lloading ? 'not-allowed' : 'pointer', color: '#fff', fontWeight: 700, fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: lloading ? 'none' : '0 6px 24px rgba(10,102,194,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s' }}>
                {lloading
                  ? <><div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', animation: 'spin 0.8s linear infinite' }} /> Generating...</>
                  : <><IconLinkedIn size={16} /> Generate {isArticle ? 'Article' : 'Post'}</>}
              </button>

              <div style={{ background: 'rgba(10,102,194,0.04)', border: '1px solid rgba(10,102,194,0.14)', borderRadius: '12px', padding: '1rem' }}>
                <p style={{ fontSize: '0.68rem', color: LI_BLUE, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem', fontFamily: 'Jost, sans-serif' }}>✦ What you get</p>
                {(isArticle ? [
                  [IconArticle,'3 title options','#0A66C2'],
                  [IconPost,'Full article with hook, body & conclusion','#0077B5'],
                  [IconHashtag,'Article tags + companion post','#4A9B9B'],
                  [IconChart,'LinkedIn engagement strategy','#6482B4'],
                  [IconTrendingUp,'Profile optimisation tips','#6B9B6B'],
                ] : [
                  [IconPost,'3 hook variations','#0A66C2'],
                  [IconScrollScript,'3 full post variations','#9B7AC5'],
                  [IconHashtag,'Hashtag strategy','#4A9B9B'],
                  [IconChart,'Algorithm and engagement tips','#6482B4'],
                  [IconTrendingUp,'Profile headline and about section','#6B9B6B'],
                ]).map(([Icon, label, color]) => (
                  <div key={label} style={{ fontSize: '0.76rem', color: 'var(--text-soft)', marginBottom: '0.35rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color, flexShrink: 0, display: 'flex' }}><Icon size={14} /></span> {label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              {!ldata && !lloading && (
                <div style={{ background: 'var(--bg-surface)', border: `1.5px dashed rgba(10,102,194,0.22)`, borderRadius: '16px', padding: '5rem 2rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: LI_BLUE, opacity: 0.4 }}><IconLinkedIn size={56} /></div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: LI_BLUE, fontSize: '1.4rem', marginBottom: '0.5rem' }}>Ready to grow on LinkedIn?</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '340px', margin: '0 auto', lineHeight: 1.65, fontFamily: 'Jost, sans-serif' }}>
                    Choose {isArticle ? 'Article' : 'Post'} format, fill in your topic, and generate LinkedIn content that gets real engagement.
                  </p>
                </div>
              )}
              {lloading && (
                <div style={{ background: 'var(--bg-surface)', border: `1px solid rgba(10,102,194,0.15)`, borderRadius: '20px', padding: '3.5rem 2rem', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 2rem' }}>
                    <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: `2px solid rgba(10,102,194,0.2)`, animation: 'ringPulse 1.8s ease-out infinite' }} />
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `linear-gradient(135deg, ${LI_BLUE}, #004182)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IconLinkedIn size={28} /></div>
                  </div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>
                    Crafting your LinkedIn {isArticle ? 'article' : 'post'}<span style={{ animation: 'dotDance 1.4s infinite 0s', display: 'inline-block' }}>.</span><span style={{ animation: 'dotDance 1.4s infinite 0.2s', display: 'inline-block' }}>.</span><span style={{ animation: 'dotDance 1.4s infinite 0.4s', display: 'inline-block' }}>.</span>
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'Jost, sans-serif' }}>Optimised for the LinkedIn algorithm</p>
                </div>
              )}
              {ldata && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: LI_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IconLinkedIn size={12} /></div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif' }}>{isArticle ? 'Article' : 'Post'} · {lform.goal} · {lform.tone}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={handleLinkedInGenerate} style={{ background: 'transparent', border: `1px solid rgba(10,102,194,0.3)`, color: LI_BLUE, padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}><IconRefresh size={12} /> Regenerate</button>
                      <button onClick={() => { navigator.clipboard.writeText(lraw); setLcopy(true); setTimeout(() => setLcopy(false), 2000) }}
                        style={{ background: lcopied ? 'var(--success-bg)' : `rgba(10,102,194,0.08)`, border: `1px solid ${lcopied ? 'var(--success)' : 'rgba(10,102,194,0.3)'}`, color: lcopied ? 'var(--success)' : LI_BLUE, padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {lcopied ? <><IconCheck size={12} /> Copied!</> : <><IconCopy size={12} /> Copy All</>}
                      </button>
                      <button onClick={() => handleDownload(lraw, 'LinkedIn', lform.topic)}
                        style={{ background: `linear-gradient(135deg, ${LI_BLUE}, #004182)`, border: 'none', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 3px 10px rgba(10,102,194,0.28)' }}><IconDownload size={12} /> Download</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {isArticle && <>
                      {ldata.articleTitle      && <ContentCard SectionIcon={IconArticle}      title="Article Title Options"          color={LI_BLUE}  badge="3 options"><OptionTabs raw={ldata.articleTitle} color={LI_BLUE} labels={['Option 1','Option 2','Option 3']} /></ContentCard>}
                      {ldata.articleHook       && <ContentCard SectionIcon={IconPost}         title="Opening Hook — First Paragraphs" color="#0077B5"  badge="Scroll-stopper"><CopyBlock text={ldata.articleHook} color="#0077B5" /></ContentCard>}
                      {ldata.articleBody       && <ContentCard SectionIcon={IconScrollScript} title="Full Article Body"               color="#9B7AC5"  badge={lform.articleLength}><CopyBlock text={ldata.articleBody} color="#9B7AC5" /></ContentCard>}
                      {ldata.articleConclusion && <ContentCard SectionIcon={IconCaption}      title="Conclusion & CTA"                color="#6B9B6B"><CopyBlock text={ldata.articleConclusion} color="#6B9B6B" /></ContentCard>}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {ldata.articleTags   && <ContentCard SectionIcon={IconHashtag} title="Article Tags"                    color="#4A9B9B"><div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(ldata.articleTags)}</div></ContentCard>}
                        {ldata.postCompanion && <ContentCard SectionIcon={IconPost}    title="Companion Post to Promote Article" color="#E07B5A" badge="To promote"><CopyBlock text={ldata.postCompanion} color="#E07B5A" /></ContentCard>}
                      </div>
                    </>}
                    {!isArticle && <>
                      {ldata.postHook          && <ContentCard SectionIcon={IconPost}         title="Post Hook Options"    color={LI_BLUE}  badge="3 options"><OptionTabs raw={ldata.postHook} color={LI_BLUE} labels={['Story angle','Personal experience','Question hook']} /></ContentCard>}
                      {ldata.postBody          && <ContentCard SectionIcon={IconScrollScript} title="Full Post Variations" color="#9B7AC5"  badge="3 formats"><VariationTabs raw={ldata.postBody} color="#9B7AC5" /></ContentCard>}
                      {ldata.postHooksAnalysis && <ContentCard SectionIcon={IconChart}        title="Why These Hooks Work" color="#6B9B6B"  badge="Psychology"><div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(ldata.postHooksAnalysis)}</div></ContentCard>}
                    </>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {ldata.liHashtags   && <ContentCard SectionIcon={IconHashtag} title="LinkedIn Hashtags"   color="#4A9B9B"  badge="Strategy included"><div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(ldata.liHashtags)}</div></ContentCard>}
                      {ldata.liEngagement && <ContentCard SectionIcon={IconChart}   title="Engagement Strategy" color="#6482B4"  badge="Algorithm tips"><div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(ldata.liEngagement)}</div></ContentCard>}
                    </div>
                    {ldata.liProfile && <ContentCard SectionIcon={IconTrendingUp} title="Profile Optimisation Tips" color="#B8973A" badge="Bonus"><div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(ldata.liProfile)}</div></ContentCard>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── IMAGE CAPTION TAB ─── */}
        {studio === 'imageCaption' && <ImageCaptionTab ui={ui} addEntry={addEntry} />}
      </div>

      <style>{`
        @keyframes spin      { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
        @keyframes fadeIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse     { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes ringPulse { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
        @keyframes dotDance  { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-5px);opacity:1} }
      `}</style>
    </AppLayout>
  )
}