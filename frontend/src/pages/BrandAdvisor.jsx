/**
 * Brand Strategy Advisor — full UI language support via LanguageContext
 * API: Anthropic Claude directly (no localhost backend required)
 */
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useLanguage } from '../context/LanguageContext'
import { useHistory } from '../context/HistoryContext'
import { generateBrandAdvisor } from '../utils/api'
import {
  IconBrandNames, IconTaglines, IconStrategy, IconPersona,
  IconIdentity, IconVoice, IconContent, IconProduct,
  IconGrowth, IconBonus, IconBack, IconDownload, IconRefresh, IconCheck, IconCopy,
} from '../components/ui/Icons'

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

// ── All UI text translations ──────────────────────────────────────────
const BRAND_UI = {
  English: {
    backBtn: 'Back to Studio Hub',
    aiLabel: '✦ AI Brand Intelligence',
    pageTitle: 'Brand',
    pageTitleItalic: 'Strategy Advisor',
    pageDesc: 'Select your options — get a complete 10-section brand system including names, strategy, identity, content plan & growth blueprint.',
    industryLabel: '1 · Industry *',
    audienceLabel: '2 · Target Audience',
    problemLabel: '3 · Core Problem You Solve *',
    problemPH: 'e.g. Indian founders spend months on branding but get generic results...',
    vibeLabel: '4 · Brand Vibe',
    personalityLabel: '5 · Brand Personality',
    toneLabel: '6 · Tone of Voice',
    scopeLabel: '7 · Market Scope',
    outputLangLabel: 'Output Language',
    otherIndustryPH: 'Other industry (type here)...',
    otherAudiencePH: 'Other audience (type here)...',
    speak: 'Speak',
    stop: 'Stop',
    generateBtn: (n) => `✦ Generate ${n} Section${n !== 1 ? 's' : ''}`,
    buildingBtn: 'Building...',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    regenerate: 'Regenerate',
    copyAll: 'Copy All',
    copiedAll: 'Copied!',
    cards: 'Cards',
    fullText: 'Full Text',
    whatYouGet: 'What You Get',
    selectorDesc: (n, total) =>
      n === total ? `All ${total} sections selected`
      : n === 0   ? 'Pick at least one section'
      :             `${n} of ${total} sections selected`,
    readyTitle: 'Ready to build your brand?',
    readyDesc: 'Select your options on the left, choose sections to generate, then hit Generate.',
    buildingTitle: 'Building your brand system...',
    buildingDesc: (n) => `Generating ${n} sections`,
    errIndustry: 'Please select at least one industry.',
    errProblem: 'Please describe the core problem you solve.',
    errSections: 'Please select at least one output section.',
    errApi: 'AI is unavailable right now. Please check your connection and try again.',
    errTimeout: 'Request timed out. Please try again.',
    secBrandNames: 'Brand Names',
    secTaglines: 'Taglines',
    secStrategy: 'Brand Strategy',
    secPersona: 'Target Persona',
    secIdentity: 'Brand Identity',
    secVoice: 'Brand Voice',
    secContent: 'Content Strategy',
    secProduct: 'Product Branding',
    secGrowth: 'Growth Strategy',
    secBonus: 'Bonus Assets',
    descBrandNames: '12 unique names with meaning, etymology & domain hints',
    descTaglines: '8 taglines — bold, emotional, Hindi & minimalist angles',
    descStrategy: 'Mission, vision, UVP, positioning & competitor differentiation',
    descPersona: 'Full persona with income, behavior, pain points & quote',
    descIdentity: 'HEX color palette, font pairings, logo direction & mood',
    descVoice: 'Brand traits + sample Instagram, LinkedIn & WhatsApp copy',
    descContent: '5 pillars, 10 ideas & platform-by-platform strategy',
    descProduct: 'Naming, pricing perception & full customer journey map',
    descGrowth: '30-day week-by-week launch plan + 5 organic tactics',
    descBonus: 'Domain ideas, Instagram handles & 20 clickable hashtags',
    cardBrandNames: 'Brand Name Suggestions',
    cardTaglines: 'Taglines & Slogans',
    cardStrategy: 'Brand Strategy',
    cardPersona: 'Target Audience Persona',
    cardIdentity: 'Brand Identity',
    cardVoice: 'Brand Voice & Messaging',
    cardContent: 'Content Strategy',
    cardProduct: 'Product Branding',
    cardGrowth: 'Growth Strategy',
    cardBonus: 'Bonus Assets',
    INDUSTRY: ['AI / Tech','EdTech','Beauty / Henna','Fashion','Personal Brand','SaaS','Food & Beverage','Health & Wellness','Finance / FinTech','E-commerce','Agriculture','Real Estate','Entertainment'],
    AUDIENCE: ['Students','Job Seekers','Content Creators','Startups / Founders','Women Entrepreneurs','Gen Z','Professionals (25-40)','General Audience'],
    VIBE: ['Modern','Minimal','Premium','Gen Z','Bold','Cultural / Traditional','Futuristic','Friendly','Luxury'],
    PERSONALITY: ['Professional','Playful','Inspirational','Smart / Intelligent','Emotional / Empathetic','Creative / Artistic'],
    TONE: ['Casual (Gen Z Style)','Professional','Friendly','Bold & Confident','Storytelling'],
    SCOPE: ['Local (India)','Global','Both'],
    OUTPUT_LANGS: ['English','Hindi','Tamil','Telugu','Malayalam','Kannada','Bengali','Marathi','Gujarati'],
  },
  Tamil: {
    backBtn: 'ஸ்டுடியோ மையத்திற்கு திரும்பு',
    aiLabel: '✦ AI பிராண்ட் நுண்ணறிவு',
    pageTitle: 'பிராண்ட்',
    pageTitleItalic: 'உத்தி ஆலோசகர்',
    pageDesc: 'உங்கள் விருப்பங்களை தேர்ந்தெடுக்கவும் — பெயர்கள், உத்தி, அடையாளம், உள்ளடக்க திட்டம் & வளர்ச்சி வரைபடம் உட்பட 10-பிரிவு பிராண்ட் அமைப்பை பெறவும்.',
    industryLabel: '1 · தொழில்துறை *',
    audienceLabel: '2 · இலக்கு பார்வையாளர்கள்',
    problemLabel: '3 · நீங்கள் தீர்க்கும் முக்கிய பிரச்சனை *',
    problemPH: 'எ.கா. இந்திய நிறுவனர்கள் பிராண்டிங்கில் மாதங்கள் செலவிடுகின்றனர்...',
    vibeLabel: '4 · பிராண்ட் வைப்',
    personalityLabel: '5 · பிராண்ட் ஆளுமை',
    toneLabel: '6 · குரலின் தொனி',
    scopeLabel: '7 · சந்தை நோக்கம்',
    outputLangLabel: 'வெளியீட்டு மொழி',
    otherIndustryPH: 'வேறு தொழில்துறை (இங்கே தட்டச்சு செய்யுங்கள்)...',
    otherAudiencePH: 'வேறு பார்வையாளர்கள் (இங்கே தட்டச்சு செய்யுங்கள்)...',
    speak: 'பேசுங்கள்',
    stop: 'நிறுத்து',
    generateBtn: (n) => `✦ ${n} பிரிவுகள் உருவாக்கு`,
    buildingBtn: 'உருவாக்குகிறது...',
    selectAll: 'அனைத்தும் தேர்ந்தெடு',
    deselectAll: 'அனைத்தும் நீக்கு',
    regenerate: 'மீண்டும் உருவாக்கு',
    copyAll: 'அனைத்தும் நகல்',
    copiedAll: 'நகலெடுக்கப்பட்டது!',
    cards: 'கார்டுகள்',
    fullText: 'முழு உரை',
    whatYouGet: 'நீங்கள் பெறுவது',
    selectorDesc: (n, total) =>
      n === total ? `அனைத்து ${total} பிரிவுகளும் தேர்ந்தெடுக்கப்பட்டன`
      : n === 0   ? 'குறைந்தது ஒரு பிரிவை தேர்ந்தெடுக்கவும்'
      :             `${n} / ${total} பிரிவுகள் தேர்ந்தெடுக்கப்பட்டன`,
    readyTitle: 'உங்கள் பிராண்டை உருவாக்க தயாரா?',
    readyDesc: 'இடதுபுறம் விருப்பங்களை தேர்ந்தெடுத்து, பிரிவுகளை தேர்ந்தெடுத்து, உருவாக்கு பொத்தானை அழுத்தவும்.',
    buildingTitle: 'உங்கள் பிராண்ட் அமைப்பை உருவாக்குகிறது...',
    buildingDesc: (n) => `${n} பிரிவுகள் உருவாக்கப்படுகின்றன`,
    errIndustry: 'குறைந்தது ஒரு தொழில்துறையை தேர்ந்தெடுக்கவும்.',
    errProblem: 'நீங்கள் தீர்க்கும் முக்கிய பிரச்சனையை விவரிக்கவும்.',
    errSections: 'குறைந்தது ஒரு வெளியீட்டு பிரிவை தேர்ந்தெடுக்கவும்.',
    errApi: 'AI இப்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
    errTimeout: 'கோரிக்கை நேரம் முடிந்தது. மீண்டும் முயற்சிக்கவும்.',
    secBrandNames: 'பிராண்ட் பெயர்கள்',
    secTaglines: 'டேக்லைன்கள்',
    secStrategy: 'பிராண்ட் உத்தி',
    secPersona: 'இலக்கு பர்சோனா',
    secIdentity: 'பிராண்ட் அடையாளம்',
    secVoice: 'பிராண்ட் குரல்',
    secContent: 'உள்ளடக்க உத்தி',
    secProduct: 'தயாரிப்பு பிராண்டிங்',
    secGrowth: 'வளர்ச்சி உத்தி',
    secBonus: 'போனஸ் சொத்துக்கள்',
    descBrandNames: '12 தனித்துவமான பெயர்கள்',
    descTaglines: '8 டேக்லைன்கள்',
    descStrategy: 'திட்டம், தூரநோக்கு, UVP',
    descPersona: 'முழுமையான பர்சோனா',
    descIdentity: 'HEX வண்ண தட்டு, எழுத்துரு',
    descVoice: 'பிராண்ட் பண்புகள் + மாதிரி நகல்',
    descContent: '5 தூண்கள், 10 யோசனைகள்',
    descProduct: 'பெயரிடல், விலை உணர்வு',
    descGrowth: '30 நாள் வார வாரம் திட்டம்',
    descBonus: 'டொமைன், Instagram, ஹேஷ்டேக்கள்',
    cardBrandNames: 'பிராண்ட் பெயர் பரிந்துரைகள்',
    cardTaglines: 'டேக்லைன்கள் & முழக்கங்கள்',
    cardStrategy: 'பிராண்ட் உத்தி',
    cardPersona: 'இலக்கு பார்வையாளர் பர்சோனா',
    cardIdentity: 'பிராண்ட் அடையாளம்',
    cardVoice: 'பிராண்ட் குரல் & செய்திகள்',
    cardContent: 'உள்ளடக்க உத்தி',
    cardProduct: 'தயாரிப்பு பிராண்டிங்',
    cardGrowth: 'வளர்ச்சி உத்தி',
    cardBonus: 'போனஸ் சொத்துக்கள்',
    INDUSTRY: ['AI / தொழில்நுட்பம்','EdTech','அழகு / மேஹந்தி','நாகரிகம்','தனிப்பட்ட பிராண்ட்','SaaS','உணவு & பானம்','ஆரோக்கியம் & நலவாழ்வு','நிதி / FinTech','மின்-வணிகம்','விவசாயம்','ரியல் எஸ்டேட்','பொழுதுபோக்கு'],
    AUDIENCE: ['மாணவர்கள்','வேலை தேடுவோர்','உள்ளடக்க உருவாக்குநர்கள்','ஸ்டார்ட்-அப்கள் / நிறுவனர்கள்','பெண் தொழில்முனைவோர்','Gen Z','நிபுணர்கள் (25-40)','பொது பார்வையாளர்கள்'],
    VIBE: ['நவீன','குறைந்தபட்சம்','பிரீமியம்','Gen Z','தைரியமான','கலாச்சார / பாரம்பரிய','எதிர்காலம்','நட்பான','ஆடம்பரம்'],
    PERSONALITY: ['தொழில்முறை','விளையாட்டுத்தனமான','உந்துதல்','புத்திசாலி','உணர்ச்சிமிக்க','படைப்பாற்றல்'],
    TONE: ['சாதாரண (Gen Z நடை)','தொழில்முறை','நட்பான','தைரியமான & நம்பிக்கையான','கதை சொல்லல்'],
    SCOPE: ['உள்ளூர் (இந்தியா)','உலகளாவிய','இரண்டும்'],
    OUTPUT_LANGS: ['ஆங்கிலம்','இந்தி','தமிழ்','தெலுங்கு','மலையாளம்','கன்னடம்','வங்காளம்','மராத்தி','குஜராத்தி'],
  },
  Hindi: {
    backBtn: 'स्टूडियो हब पर वापस',
    aiLabel: '✦ AI ब्रांड इंटेलिजेंस',
    pageTitle: 'ब्रांड',
    pageTitleItalic: 'स्ट्रेटेजी एडवाइजर',
    pageDesc: 'अपने विकल्प चुनें — नाम, रणनीति, पहचान, कंटेंट प्लान और ग्रोथ ब्लूप्रिंट सहित 10-सेक्शन ब्रांड सिस्टम पाएं।',
    industryLabel: '1 · उद्योग *',
    audienceLabel: '2 · लक्षित दर्शक',
    problemLabel: '3 · मुख्य समस्या जो आप हल करते हैं *',
    problemPH: 'जैसे भारतीय संस्थापक ब्रांडिंग पर महीने बिताते हैं...',
    vibeLabel: '4 · ब्रांड वाइब',
    personalityLabel: '5 · ब्रांड पर्सनालिटी',
    toneLabel: '6 · आवाज़ का टोन',
    scopeLabel: '7 · बाजार का दायरा',
    outputLangLabel: 'आउटपुट भाषा',
    otherIndustryPH: 'अन्य उद्योग (यहाँ टाइप करें)...',
    otherAudiencePH: 'अन्य दर्शक (यहाँ टाइप करें)...',
    speak: 'बोलें',
    stop: 'रोकें',
    generateBtn: (n) => `✦ ${n} सेक्शन बनाएं`,
    buildingBtn: 'बन रहा है...',
    selectAll: 'सब चुनें',
    deselectAll: 'सब हटाएं',
    regenerate: 'फिर से बनाएं',
    copyAll: 'सब कॉपी करें',
    copiedAll: 'कॉपी हो गया!',
    cards: 'कार्ड्स',
    fullText: 'पूरा टेक्स्ट',
    whatYouGet: 'आपको क्या मिलेगा',
    selectorDesc: (n, total) =>
      n === total ? `सभी ${total} सेक्शन चुने गए`
      : n === 0   ? 'कम से कम एक सेक्शन चुनें'
      :             `${n} / ${total} सेक्शन चुने गए`,
    readyTitle: 'अपना ब्रांड बनाने के लिए तैयार?',
    readyDesc: 'बाईं ओर विकल्प चुनें, सेक्शन चुनें, फिर Generate दबाएं।',
    buildingTitle: 'आपका ब्रांड सिस्टम बन रहा है...',
    buildingDesc: (n) => `${n} सेक्शन बन रहे हैं`,
    errIndustry: 'कृपया कम से कम एक उद्योग चुनें।',
    errProblem: 'कृपया मुख्य समस्या का वर्णन करें।',
    errSections: 'कृपया कम से कम एक आउटपुट सेक्शन चुनें।',
    errApi: 'AI अभी उपलब्ध नहीं है। दोबारा कोशिश करें।',
    errTimeout: 'रिक्वेस्ट टाइम आउट हो गई। दोबारा कोशिश करें।',
    secBrandNames: 'ब्रांड नाम',
    secTaglines: 'टैगलाइन',
    secStrategy: 'ब्रांड रणनीति',
    secPersona: 'लक्षित पर्सोना',
    secIdentity: 'ब्रांड पहचान',
    secVoice: 'ब्रांड आवाज़',
    secContent: 'कंटेंट रणनीति',
    secProduct: 'प्रोडक्ट ब्रांडिंग',
    secGrowth: 'ग्रोथ रणनीति',
    secBonus: 'बोनस एसेट्स',
    descBrandNames: '12 अनूठे नाम',
    descTaglines: '8 टैगलाइन',
    descStrategy: 'मिशन, विज़न, UVP',
    descPersona: 'पूर्ण पर्सोना',
    descIdentity: 'HEX कलर, फ़ॉन्ट, लोगो',
    descVoice: 'ब्रांड विशेषताएं + नमूना कॉपी',
    descContent: '5 स्तंभ, 10 विचार',
    descProduct: 'नामकरण, मूल्य धारणा',
    descGrowth: '30-दिन लॉन्च प्लान',
    descBonus: 'डोमेन, हैंडल, हैशटैग',
    cardBrandNames: 'ब्रांड नाम सुझाव',
    cardTaglines: 'टैगलाइन और नारे',
    cardStrategy: 'ब्रांड रणनीति',
    cardPersona: 'लक्षित दर्शक पर्सोना',
    cardIdentity: 'ब्रांड पहचान',
    cardVoice: 'ब्रांड आवाज़ और संदेश',
    cardContent: 'कंटेंट रणनीति',
    cardProduct: 'प्रोडक्ट ब्रांडिंग',
    cardGrowth: 'ग्रोथ रणनीति',
    cardBonus: 'बोनस एसेट्स',
    INDUSTRY: ['AI / तकनीक','EdTech','सौंदर्य / मेहंदी','फैशन','पर्सनल ब्रांड','SaaS','खाना & पेय','स्वास्थ्य & वेलनेस','वित्त / FinTech','ई-कॉमर्स','कृषि','रियल एस्टेट','मनोरंजन'],
    AUDIENCE: ['छात्र','नौकरी तलाशने वाले','कंटेंट क्रिएटर','स्टार्टअप / संस्थापक','महिला उद्यमी','Gen Z','पेशेवर (25-40)','सामान्य दर्शक'],
    VIBE: ['आधुनिक','मिनिमल','प्रीमियम','Gen Z','बोल्ड','सांस्कृतिक / पारंपरिक','भविष्यवादी','मैत्रीपूर्ण','लग्जरी'],
    PERSONALITY: ['पेशेवर','चंचल','प्रेरणादायक','स्मार्ट','भावनात्मक','रचनात्मक'],
    TONE: ['आकस्मिक (Gen Z स्टाइल)','पेशेवर','मैत्रीपूर्ण','बोल्ड & आत्मविश्वासी','कहानी शैली'],
    SCOPE: ['स्थानीय (भारत)','वैश्विक','दोनों'],
    OUTPUT_LANGS: ['अंग्रेज़ी','हिंदी','तमिल','तेलुगु','मलयालम','कन्नड़','बंगाली','मराठी','गुजराती'],
  },
  Telugu: {
    backBtn: 'స్టూడియో హబ్‌కి తిరిగి వెళ్ళు',
    aiLabel: '✦ AI బ్రాండ్ ఇంటెలిజెన్స్',
    pageTitle: 'బ్రాండ్',
    pageTitleItalic: 'స్ట్రాటెజీ అడ్వైజర్',
    pageDesc: 'మీ ఎంపికలు చేసుకోండి — 10-విభాగ బ్రాండ్ సిస్టమ్ పొందండి.',
    industryLabel: '1 · పరిశ్రమ *',
    audienceLabel: '2 · లక్ష్య ప్రేక్షకులు',
    problemLabel: '3 · మీరు పరిష్కరించే ప్రధాన సమస్య *',
    problemPH: 'ఉదా. భారతీయ వ్యవస్థాపకులు బ్రాండింగ్‌పై నెలలు గడుపుతారు...',
    vibeLabel: '4 · బ్రాండ్ వైబ్',
    personalityLabel: '5 · బ్రాండ్ పర్సనాలిటీ',
    toneLabel: '6 · స్వరం టోన్',
    scopeLabel: '7 · మార్కెట్ స్కోప్',
    outputLangLabel: 'అవుట్‌పుట్ భాష',
    otherIndustryPH: 'ఇతర పరిశ్రమ...',
    otherAudiencePH: 'ఇతర ప్రేక్షకులు...',
    speak: 'మాట్లాడండి',
    stop: 'ఆపు',
    generateBtn: (n) => `✦ ${n} విభాగాలు సృష్టించు`,
    buildingBtn: 'నిర్మిస్తోంది...',
    selectAll: 'అన్నీ ఎంచుకో',
    deselectAll: 'అన్నీ తీసివేయి',
    regenerate: 'మళ్ళీ సృష్టించు',
    copyAll: 'అన్నీ కాపీ',
    copiedAll: 'కాపీ అయింది!',
    cards: 'కార్డులు',
    fullText: 'పూర్తి వచనం',
    whatYouGet: 'మీకు లభించేది',
    selectorDesc: (n, total) =>
      n === total ? `అన్ని ${total} విభాగాలు ఎంచుకోబడ్డాయి`
      : n === 0   ? 'కనీసం ఒక విభాగం ఎంచుకోండి'
      :             `${n} / ${total} విభాగాలు ఎంచుకోబడ్డాయి`,
    readyTitle: 'మీ బ్రాండ్ నిర్మించడానికి సిద్ధంగా ఉన్నారా?',
    readyDesc: 'ఎడమవైపు ఎంపికలు చేసుకోండి, విభాగాలు ఎంచుకోండి, సృష్టించు నొక్కండి.',
    buildingTitle: 'మీ బ్రాండ్ సిస్టమ్ నిర్మిస్తోంది...',
    buildingDesc: (n) => `${n} విభాగాలు సృష్టిస్తోంది`,
    errIndustry: 'దయచేసి కనీసం ఒక పరిశ్రమ ఎంచుకోండి.',
    errProblem: 'దయచేసి ప్రధాన సమస్యను వివరించండి.',
    errSections: 'దయచేసి కనీసం ఒక విభాగం ఎంచుకోండి.',
    errApi: 'AI ఇప్పుడు అందుబాటులో లేదు. మళ్ళీ ప్రయత్నించండి.',
    errTimeout: 'అభ్యర్థన గడువు ముగిసింది. మళ్ళీ ప్రయత్నించండి.',
    secBrandNames: 'బ్రాండ్ పేర్లు', secTaglines: 'ట్యాగ్‌లైన్లు', secStrategy: 'బ్రాండ్ స్ట్రాటెజీ',
    secPersona: 'లక్ష్య పెర్సోనా', secIdentity: 'బ్రాండ్ ఐడెంటిటీ', secVoice: 'బ్రాండ్ వాయిస్',
    secContent: 'కంటెంట్ స్ట్రాటెజీ', secProduct: 'ప్రొడక్ట్ బ్రాండింగ్', secGrowth: 'గ్రోత్ స్ట్రాటెజీ', secBonus: 'బోనస్ అసెట్స్',
    descBrandNames: '12 ప్రత్యేకమైన పేర్లు', descTaglines: '8 ట్యాగ్‌లైన్లు', descStrategy: 'మిషన్, విజన్, UVP',
    descPersona: 'పూర్తి పెర్సోనా', descIdentity: 'HEX రంగులు, ఫాంట్లు', descVoice: 'బ్రాండ్ లక్షణాలు',
    descContent: '5 స్తంభాలు, 10 ఆలోచనలు', descProduct: 'పేర్లు, ధర అవగాహన', descGrowth: '30-రోజుల ప్లాన్', descBonus: 'డొమైన్, హ్యాండిల్స్, హ్యాష్‌ట్యాగ్‌లు',
    cardBrandNames: 'బ్రాండ్ పేరు సూచనలు', cardTaglines: 'ట్యాగ్‌లైన్లు & నినాదాలు', cardStrategy: 'బ్రాండ్ స్ట్రాటెజీ',
    cardPersona: 'లక్ష్య ప్రేక్షక పెర్సోనా', cardIdentity: 'బ్రాండ్ ఐడెంటిటీ', cardVoice: 'బ్రాండ్ వాయిస్ & సందేశాలు',
    cardContent: 'కంటెంట్ స్ట్రాటెజీ', cardProduct: 'ప్రొడక్ట్ బ్రాండింగ్', cardGrowth: 'గ్రోత్ స్ట్రాటెజీ', cardBonus: 'బోనస్ అసెట్స్',
    INDUSTRY: ['AI / టెక్','EdTech','అందం / మెహందీ','ఫ్యాషన్','పర్సనల్ బ్రాండ్','SaaS','ఆహారం & పానీయం','ఆరోగ్యం & వెల్నెస్','ఫైనాన్స్ / FinTech','ఇ-కామర్స్','వ్యవసాయం','రియల్ ఎస్టేట్','వినోదం'],
    AUDIENCE: ['విద్యార్థులు','ఉద్యోగ అన్వేషకులు','కంటెంట్ క్రియేటర్లు','స్టార్టప్స్ / వ్యవస్థాపకులు','మహిళా పారిశ్రామికవేత్తలు','Gen Z','నిపుణులు (25-40)','సాధారణ ప్రేక్షకులు'],
    VIBE: ['ఆధునిక','కనిష్ఠ','ప్రీమియం','Gen Z','ధైర్యమైన','సాంస్కృతిక','భవిష్యవాద','స్నేహపూర్వక','లగ్జరీ'],
    PERSONALITY: ['వృత్తిపరమైన','చురుకైన','స్ఫూర్తిదాయకమైన','స్మార్ట్','భావోద్వేగ','సృజనాత్మక'],
    TONE: ['సాధారణ (Gen Z స్టైల్)','వృత్తిపరమైన','స్నేహపూర్వక','ధైర్యమైన','కథ శైలి'],
    SCOPE: ['స్థానిక (భారతదేశం)','అంతర్జాతీయ','రెండూ'],
    OUTPUT_LANGS: ['ఆంగ్లం','హిందీ','తమిళం','తెలుగు','మలయాళం','కన్నడ','బెంగాలీ','మరాఠీ','గుజరాతీ'],
  },
  Malayalam: {
    backBtn: 'സ്റ്റുഡിയോ ഹബ്ബിലേക്ക് മടങ്ങുക',
    aiLabel: '✦ AI ബ്രാൻഡ് ഇന്റലിജൻസ്',
    pageTitle: 'ബ്രാൻഡ്',
    pageTitleItalic: 'സ്ട്രാറ്റജി അഡ്വൈസർ',
    pageDesc: 'നിങ്ങളുടെ ഓപ്ഷനുകൾ തിരഞ്ഞെടുക്കുക — 10-വിഭാഗ ബ്രാൻഡ് സിസ്റ്റം നേടുക.',
    industryLabel: '1 · വ്യവസായം *',
    audienceLabel: '2 · ലക്ഷ്യ പ്രേക്ഷകർ',
    problemLabel: '3 · നിങ്ങൾ പരിഹരിക്കുന്ന പ്രധാന പ്രശ്നം *',
    problemPH: 'ഉദാ. ഇന്ത്യൻ സ്ഥാപകർ ബ്രാൻഡിംഗിൽ മാസങ്ങൾ ചെലവഴിക്കുന്നു...',
    vibeLabel: '4 · ബ്രാൻഡ് വൈബ്',
    personalityLabel: '5 · ബ്രാൻഡ് വ്യക്തിത്വം',
    toneLabel: '6 · ശബ്ദ ടോൺ',
    scopeLabel: '7 · മാർക്കറ്റ് സ്കോപ്പ്',
    outputLangLabel: 'ഔട്ട്പുട്ട് ഭാഷ',
    otherIndustryPH: 'മറ്റ് വ്യവസായം...',
    otherAudiencePH: 'മറ്റ് പ്രേക്ഷകർ...',
    speak: 'സംസാരിക്കുക',
    stop: 'നിർത്തുക',
    generateBtn: (n) => `✦ ${n} വിഭാഗങ്ങൾ സൃഷ്ടിക്കുക`,
    buildingBtn: 'നിർമ്മിക്കുന്നു...',
    selectAll: 'എല്ലാം തിരഞ്ഞെടുക്കുക',
    deselectAll: 'എല്ലാം നീക്കുക',
    regenerate: 'വീണ്ടും സൃഷ്ടിക്കുക',
    copyAll: 'എല്ലാം പകർത്തുക',
    copiedAll: 'പകർത്തി!',
    cards: 'കാർഡുകൾ',
    fullText: 'പൂർണ്ണ ടെക്സ്റ്റ്',
    whatYouGet: 'നിങ്ങൾക്ക് ലഭിക്കുന്നത്',
    selectorDesc: (n, total) =>
      n === total ? `എല്ലാ ${total} വിഭാഗങ്ങളും തിരഞ്ഞെടുത്തു`
      : n === 0   ? 'കുറഞ്ഞത് ഒരു വിഭാഗം തിരഞ്ഞെടുക്കുക'
      :             `${n} / ${total} വിഭാഗങ്ങൾ തിരഞ്ഞെടുത്തു`,
    readyTitle: 'നിങ്ങളുടെ ബ്രാൻഡ് നിർമ്മിക്കാൻ തയ്യാറോ?',
    readyDesc: 'ഇടത്ത് ഓപ്ഷനുകൾ തിരഞ്ഞെടുക്കുക, Generate അമർത്തുക.',
    buildingTitle: 'നിങ്ങളുടെ ബ്രാൻഡ് സിസ്റ്റം നിർമ്മിക്കുന്നു...',
    buildingDesc: (n) => `${n} വിഭാഗങ്ങൾ സൃഷ്ടിക്കുന്നു`,
    errIndustry: 'ദയവായി കുറഞ്ഞത് ഒരു വ്യവസായം തിരഞ്ഞെടുക്കുക.',
    errProblem: 'ദയവായി മുഖ്യ പ്രശ്നം വിവരിക്കുക.',
    errSections: 'ദയവായി കുറഞ്ഞത് ഒരു വിഭാഗം തിരഞ്ഞെടുക്കുക.',
    errApi: 'AI ഇപ്പോൾ ലഭ്യമല്ല. വീണ്ടും ശ്രമിക്കുക.',
    errTimeout: 'അഭ്യർത്ഥന കാലഹരണപ്പെട്ടു. വീണ്ടും ശ്രമിക്കുക.',
    secBrandNames: 'ബ്രാൻഡ് നാമങ്ങൾ', secTaglines: 'ടാഗ്‌ലൈനുകൾ', secStrategy: 'ബ്രാൻഡ് തന്ത്രം',
    secPersona: 'ലക്ഷ്യ പേഴ്‌സോണ', secIdentity: 'ബ്രാൻഡ് ഐഡന്റിറ്റി', secVoice: 'ബ്രാൻഡ് വോയ്‌സ്',
    secContent: 'കണ്ടെന്റ് തന്ത്രം', secProduct: 'പ്രൊഡക്ട് ബ്രാൻഡിംഗ്', secGrowth: 'ഗ്രോത്ത് തന്ത്രം', secBonus: 'ബോണസ് ആസ്തികൾ',
    descBrandNames: '12 അദ്വിതീയ നാമങ്ങൾ', descTaglines: '8 ടാഗ്‌ലൈനുകൾ', descStrategy: 'മിഷൻ, വിഷൻ, UVP',
    descPersona: 'പൂർണ്ണ പേഴ്‌സോണ', descIdentity: 'HEX കളർ, ഫോണ്ട്', descVoice: 'ബ്രാൻഡ് ഗുണങ്ങൾ',
    descContent: '5 സ്തംഭങ്ങൾ, 10 ആശയങ്ങൾ', descProduct: 'നാമകരണം, വില', descGrowth: '30-ദിവസ പ്ലാൻ', descBonus: 'ഡൊമൈൻ, ഹ്യാൻഡിലുകൾ',
    cardBrandNames: 'ബ്രാൻഡ് നാമ നിർദ്ദേശങ്ങൾ', cardTaglines: 'ടാഗ്‌ലൈനുകൾ & മുദ്രാവാക്യങ്ങൾ', cardStrategy: 'ബ്രാൻഡ് തന്ത്രം',
    cardPersona: 'ലക്ഷ്യ പ്രേക്ഷക പേഴ്‌സോണ', cardIdentity: 'ബ്രാൻഡ് ഐഡന്റിറ്റി', cardVoice: 'ബ്രാൻഡ് വോയ്‌സ് & സന്ദേശങ്ങൾ',
    cardContent: 'കണ്ടെന്റ് തന്ത്രം', cardProduct: 'പ്രൊഡക്ട് ബ്രാൻഡിംഗ്', cardGrowth: 'ഗ്രോത്ത് തന്ത്രം', cardBonus: 'ബോണസ് ആസ്തികൾ',
    INDUSTRY: ['AI / ടെക്','EdTech','സൗന്ദര്യം / മൈലാഞ്ചി','ഫാഷൻ','പേഴ്‌സണൽ ബ്രാൻഡ്','SaaS','ഭക്ഷണം & പാനീയം','ആരോഗ്യം & വെൽനസ്','ഫിനാൻസ് / FinTech','ഇ-കൊമേഴ്‌സ്','കൃഷി','റിയൽ എസ്റ്റേറ്റ്','വിനോദം'],
    AUDIENCE: ['വിദ്യാർഥികൾ','ജോലി തേടുന്നവർ','കണ്ടെന്റ് ക്രിയേറ്ററുകൾ','സ്റ്റാർട്ടപ്പ് / സ്ഥാപകർ','വനിതാ സംരംഭകർ','Gen Z','പ്രൊഫഷണലുകൾ (25-40)','സാധാരണ പ്രേക്ഷകർ'],
    VIBE: ['ആധുനിക','മിനിമൽ','പ്രീമിയം','Gen Z','ധൈര്യം','സാംസ്കാരിക','ഭാവിവാദ','സൗഹൃദ','ആഡംബര'],
    PERSONALITY: ['പ്രൊഫഷണൽ','കളിയായ','പ്രചോദനം','ബുദ്ധിശാലി','വൈകാരിക','ക്രിയേറ്റീവ്'],
    TONE: ['സൗകര്യ (Gen Z ശൈലി)','പ്രൊഫഷണൽ','സൗഹൃദ','ധൈര്യം & ആത്മവിശ്വാസ','കഥ പറയൽ'],
    SCOPE: ['പ്രാദേശിക (ഇന്ത്യ)','ആഗോള','രണ്ടും'],
    OUTPUT_LANGS: ['ഇംഗ്ലീഷ്','ഹിന്ദി','തമിഴ്','തെലുഗ്','മലയാളം','കന്നഡ','ബംഗാളി','മറാഠി','ഗുജറാത്തി'],
  },
  Kannada: {
    backBtn: 'ಸ್ಟೂಡಿಯೋ ಹಬ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    aiLabel: '✦ AI ಬ್ರಾಂಡ್ ಇಂಟೆಲಿಜೆನ್ಸ್',
    pageTitle: 'ಬ್ರಾಂಡ್',
    pageTitleItalic: 'ಸ್ಟ್ರಾಟೆಜಿ ಅಡ್ವೈಸರ್',
    pageDesc: 'ನಿಮ್ಮ ಆಯ್ಕೆಗಳನ್ನು ಆರಿಸಿ — 10-ವಿಭಾಗ ಬ್ರಾಂಡ್ ಸಿಸ್ಟಮ್ ಪಡೆಯಿರಿ.',
    industryLabel: '1 · ಉದ್ಯಮ *',
    audienceLabel: '2 · ಗುರಿ ಪ್ರೇಕ್ಷಕರು',
    problemLabel: '3 · ನೀವು ಪರಿಹರಿಸುವ ಮುಖ್ಯ ಸಮಸ್ಯೆ *',
    problemPH: 'ಉದಾ. ಭಾರತೀಯ ಸ್ಥಾಪಕರು ಬ್ರ್ಯಾಂಡಿಂಗ್‌ನಲ್ಲಿ ತಿಂಗಳುಗಳನ್ನು ಕಳೆಯುತ್ತಾರೆ...',
    vibeLabel: '4 · ಬ್ರಾಂಡ್ ವೈಬ್',
    personalityLabel: '5 · ಬ್ರಾಂಡ್ ವ್ಯಕ್ತಿತ್ವ',
    toneLabel: '6 · ಧ್ವನಿ ಟೋನ್',
    scopeLabel: '7 · ಮಾರುಕಟ್ಟೆ ವ್ಯಾಪ್ತಿ',
    outputLangLabel: 'ಔಟ್‌ಪುಟ್ ಭಾಷೆ',
    otherIndustryPH: 'ಇತರ ಉದ್ಯಮ...',
    otherAudiencePH: 'ಇತರ ಪ್ರೇಕ್ಷಕರು...',
    speak: 'ಮಾತಾಡಿ',
    stop: 'ನಿಲ್ಲಿಸಿ',
    generateBtn: (n) => `✦ ${n} ವಿಭಾಗಗಳನ್ನು ರಚಿಸಿ`,
    buildingBtn: 'ನಿರ್ಮಿಸುತ್ತಿದೆ...',
    selectAll: 'ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆ ಮಾಡಿ',
    deselectAll: 'ಎಲ್ಲವನ್ನೂ ತೆಗೆದುಹಾಕಿ',
    regenerate: 'ಮತ್ತೆ ರಚಿಸಿ',
    copyAll: 'ಎಲ್ಲವನ್ನೂ ನಕಲಿಸಿ',
    copiedAll: 'ನಕಲಿಸಲಾಗಿದೆ!',
    cards: 'ಕಾರ್ಡ್‌ಗಳು',
    fullText: 'ಪೂರ್ಣ ಪಠ್ಯ',
    whatYouGet: 'ನೀವು ಪಡೆಯುವುದು',
    selectorDesc: (n, total) =>
      n === total ? `ಎಲ್ಲಾ ${total} ವಿಭಾಗಗಳು ಆಯ್ಕೆಯಾಗಿವೆ`
      : n === 0   ? 'ಕನಿಷ್ಠ ಒಂದು ವಿಭಾಗ ಆಯ್ಕೆ ಮಾಡಿ'
      :             `${n} / ${total} ವಿಭಾಗಗಳು ಆಯ್ಕೆಯಾಗಿವೆ`,
    readyTitle: 'ನಿಮ್ಮ ಬ್ರಾಂಡ್ ನಿರ್ಮಿಸಲು ತಯಾರಾಗಿದ್ದೀರಾ?',
    readyDesc: 'ಎಡಭಾಗದಲ್ಲಿ ಆಯ್ಕೆಗಳನ್ನು ಆರಿಸಿ, ರಚಿಸಿ ಒತ್ತಿರಿ.',
    buildingTitle: 'ನಿಮ್ಮ ಬ್ರಾಂಡ್ ಸಿಸ್ಟಮ್ ನಿರ್ಮಿಸುತ್ತಿದೆ...',
    buildingDesc: (n) => `${n} ವಿಭಾಗಗಳನ್ನು ರಚಿಸುತ್ತಿದೆ`,
    errIndustry: 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಉದ್ಯಮ ಆಯ್ಕೆ ಮಾಡಿ.',
    errProblem: 'ದಯವಿಟ್ಟು ಮುಖ್ಯ ಸಮಸ್ಯೆ ವಿವರಿಸಿ.',
    errSections: 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಔಟ್‌ಪುಟ್ ವಿಭಾಗ ಆಯ್ಕೆ ಮಾಡಿ.',
    errApi: 'AI ಈಗ ಲಭ್ಯವಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    errTimeout: 'ವಿನಂತಿ ಸಮಯ ಮೀರಿತು. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    secBrandNames: 'ಬ್ರಾಂಡ್ ಹೆಸರುಗಳು', secTaglines: 'ಟ್ಯಾಗ್‌ಲೈನ್‌ಗಳು', secStrategy: 'ಬ್ರಾಂಡ್ ತಂತ್ರ',
    secPersona: 'ಗುರಿ ಪರ್ಸೋನಾ', secIdentity: 'ಬ್ರಾಂಡ್ ಐಡೆಂಟಿಟಿ', secVoice: 'ಬ್ರಾಂಡ್ ವಾಯ್ಸ್',
    secContent: 'ಕಂಟೆಂಟ್ ತಂತ್ರ', secProduct: 'ಪ್ರೊಡಕ್ಟ್ ಬ್ರ್ಯಾಂಡಿಂಗ್', secGrowth: 'ಬೆಳವಣಿಗೆ ತಂತ್ರ', secBonus: 'ಬೋನಸ್ ಆಸ್ತಿಗಳು',
    descBrandNames: '12 ಅನನ್ಯ ಹೆಸರುಗಳು', descTaglines: '8 ಟ್ಯಾಗ್‌ಲೈನ್‌ಗಳು', descStrategy: 'ಮಿಷನ್, ವಿಷನ್, UVP',
    descPersona: 'ಪೂರ್ಣ ಪರ್ಸೋನಾ', descIdentity: 'HEX ಬಣ್ಣ, ಫಾಂಟ್', descVoice: 'ಬ್ರಾಂಡ್ ಗುಣಗಳು',
    descContent: '5 ಸ್ತಂಭಗಳು, 10 ಆಲೋಚನೆಗಳು', descProduct: 'ಹೆಸರಿಡುವಿಕೆ, ಬೆಲೆ', descGrowth: '30-ದಿನ ಯೋಜನೆ', descBonus: 'ಡೊಮೈನ್, ಹ್ಯಾಂಡಲ್‌ಗಳು',
    cardBrandNames: 'ಬ್ರಾಂಡ್ ಹೆಸರು ಸಲಹೆಗಳು', cardTaglines: 'ಟ್ಯಾಗ್‌ಲೈನ್‌ಗಳು & ಘೋಷಣೆಗಳು', cardStrategy: 'ಬ್ರಾಂಡ್ ತಂತ್ರ',
    cardPersona: 'ಗುರಿ ಪ್ರೇಕ್ಷಕ ಪರ್ಸೋನಾ', cardIdentity: 'ಬ್ರಾಂಡ್ ಐಡೆಂಟಿಟಿ', cardVoice: 'ಬ್ರಾಂಡ್ ವಾಯ್ಸ್ & ಸಂದೇಶಗಳು',
    cardContent: 'ಕಂಟೆಂಟ್ ತಂತ್ರ', cardProduct: 'ಪ್ರೊಡಕ್ಟ್ ಬ್ರ್ಯಾಂಡಿಂಗ್', cardGrowth: 'ಬೆಳವಣಿಗೆ ತಂತ್ರ', cardBonus: 'ಬೋನಸ್ ಆಸ್ತಿಗಳು',
    INDUSTRY: ['AI / ಟೆಕ್','EdTech','ಸೌಂದರ್ಯ / ಮದರಂಗಿ','ಫ್ಯಾಷನ್','ಪರ್ಸನಲ್ ಬ್ರಾಂಡ್','SaaS','ಆಹಾರ & ಪಾನೀಯ','ಆರೋಗ್ಯ & ವೆಲ್ನೆಸ್','ಹಣಕಾಸು / FinTech','ಇ-ಕಾಮರ್ಸ್','ಕೃಷಿ','ರಿಯಲ್ ಎಸ್ಟೇಟ್','ಮನರಂಜನೆ'],
    AUDIENCE: ['ವಿದ್ಯಾರ್ಥಿಗಳು','ಉದ್ಯೋಗ ಹುಡುಕುವವರು','ಕಂಟೆಂಟ್ ಕ್ರಿಯೇಟರ್‌ಗಳು','ಸ್ಟಾರ್ಟಪ್ / ಸಂಸ್ಥಾಪಕರು','ಮಹಿಳಾ ಉದ್ಯಮಿಗಳು','Gen Z','ವೃತ್ತಿಪರರು (25-40)','ಸಾಮಾನ್ಯ ಪ್ರೇಕ್ಷಕರು'],
    VIBE: ['ಆಧುನಿಕ','ಕನಿಷ್ಠ','ಪ್ರೀಮಿಯಂ','Gen Z','ಧೈರ್ಯ','ಸಾಂಸ್ಕೃತಿಕ','ಭವಿಷ್ಯವಾದಿ','ಸ್ನೇಹಪರ','ಐಷಾರಾಮ'],
    PERSONALITY: ['ವೃತ್ತಿಪರ','ತುಂಟ','ಸ್ಫೂರ್ತಿದಾಯಕ','ಬುದ್ಧಿವಂತ','ಭಾವನಾತ್ಮಕ','ಸೃಜನಶೀಲ'],
    TONE: ['ಸಾಧಾರಣ (Gen Z ಶೈಲಿ)','ವೃತ್ತಿಪರ','ಸ್ನೇಹಪರ','ಧೈರ್ಯ & ಆತ್ಮವಿಶ್ವಾಸ','ಕಥೆ ಹೇಳುವಿಕೆ'],
    SCOPE: ['ಸ್ಥಳೀಯ (ಭಾರತ)','ಜಾಗತಿಕ','ಎರಡೂ'],
    OUTPUT_LANGS: ['ಇಂಗ್ಲಿಷ್','ಹಿಂದಿ','ತಮಿಳು','ತೆಲುಗು','ಮಲಯಾಳಂ','ಕನ್ನಡ','ಬಂಗಾಳಿ','ಮರಾಠಿ','ಗುಜರಾತಿ'],
  },
}

const getUI = (lang) => BRAND_UI[lang] || BRAND_UI['English']

const SPEECH_LOCALES = {
  English:'en-IN', Tamil:'ta-IN', Hindi:'hi-IN', Telugu:'te-IN',
  Malayalam:'ml-IN', Kannada:'kn-IN', Bengali:'bn-IN', Marathi:'mr-IN',
  Gujarati:'gu-IN', Punjabi:'pa-IN', Urdu:'ur-IN',
}
const SPEECH_LANGUAGES = Object.keys(SPEECH_LOCALES)

function MicButton({ onResult, voiceLang, speakLabel, stopLabel }) {
  const [listening, setListening] = useState(false)
  const recogRef = useRef(null)
  const toggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { alert('Use Chrome for speech recognition.'); return }
    if (listening) { recogRef.current?.stop(); setListening(false); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = SPEECH_LOCALES[voiceLang] || 'en-IN'; r.continuous = true; r.interimResults = false
    r.onresult = e => onResult(Array.from(e.results).map(x => x[0].transcript).join(' '))
    r.onerror = () => setListening(false); r.onend = () => setListening(false)
    r.start(); recogRef.current = r; setListening(true)
  }
  return (
    <button onClick={toggle} style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', cursor: 'pointer', background: listening ? 'rgba(192,57,43,0.08)' : 'var(--gold-bg)', border: `1.5px solid ${listening ? '#C0392B' : 'var(--gold-border)'}`, display: 'flex', alignItems: 'center', gap: '0.4rem', color: listening ? '#C0392B' : 'var(--gold)', fontSize: '0.74rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
      {listening ? stopLabel : speakLabel}
      {listening && <span style={{ animation: 'pulse 1s infinite', fontSize: '7px' }}>●</span>}
    </button>
  )
}

function ChipGroup({ options, selected, onToggle, color = '#B8973A' }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
      {options.map(opt => {
        const sel = selected.includes(opt)
        return (
          <button key={opt} onClick={() => onToggle(opt)} style={{ padding: '0.32rem 0.85rem', borderRadius: '50px', cursor: 'pointer', border: `1.5px solid ${sel ? color : 'var(--gold-border)'}`, background: sel ? `${color}14` : 'var(--bg-input)', color: sel ? color : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: sel ? 600 : 400, fontFamily: 'Jost, sans-serif', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '5px' }}>
            {sel && <span style={{ fontSize: '9px', color }}>✓</span>}
            {opt}
          </button>
        )
      })}
    </div>
  )
}

const iStyle = { width: '100%', padding: '0.62rem 0.9rem', border: '1.5px solid var(--input-border)', borderRadius: '10px', fontSize: '0.86rem', fontFamily: 'Jost, sans-serif', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }
const lStyle = { fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.55rem', display: 'block' }

const OUTPUT_SECTIONS_CFG = [
  { key: 'brandNames', Icon: IconBrandNames, secKey: 'secBrandNames', descKey: 'descBrandNames', color: '#B8973A' },
  { key: 'taglines',   Icon: IconTaglines,   secKey: 'secTaglines',   descKey: 'descTaglines',   color: '#7A9EC5' },
  { key: 'strategy',   Icon: IconStrategy,   secKey: 'secStrategy',   descKey: 'descStrategy',   color: '#8BAF8D' },
  { key: 'persona',    Icon: IconPersona,    secKey: 'secPersona',    descKey: 'descPersona',    color: '#9B7AC5' },
  { key: 'identity',   Icon: IconIdentity,   secKey: 'secIdentity',   descKey: 'descIdentity',   color: '#C07A6A' },
  { key: 'voice',      Icon: IconVoice,      secKey: 'secVoice',      descKey: 'descVoice',      color: '#E07B5A' },
  { key: 'content',    Icon: IconContent,    secKey: 'secContent',    descKey: 'descContent',    color: '#4A9B9B' },
  { key: 'product',    Icon: IconProduct,    secKey: 'secProduct',    descKey: 'descProduct',    color: '#6B9B6B' },
  { key: 'growth',     Icon: IconGrowth,     secKey: 'secGrowth',     descKey: 'descGrowth',     color: '#6482B4' },
  { key: 'bonus',      Icon: IconBonus,      secKey: 'secBonus',      descKey: 'descBonus',      color: '#C5A07A' },
]

function SectionSelectorDropdown({ selected, onToggle, onSelectAll, onDeselectAll, ui }) {
  const [open, setOpen] = useState(false)
  const n = selected.size; const total = OUTPUT_SECTIONS_CFG.length
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.1rem', background: open ? 'var(--gold-bg-strong)' : 'var(--gold-bg)', border: `1.5px solid ${open ? 'var(--gold-border-2)' : 'var(--gold-border)'}`, borderRadius: open ? '12px 12px 0 0' : '12px', cursor: 'pointer', transition: 'all 0.25s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, var(--gold-light), var(--gold-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#1A1208' }}>
            <IconBonus size={16} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold)', fontFamily: 'Jost, sans-serif' }}>{ui.whatYouGet}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif', marginTop: '1px' }}>{ui.selectorDesc(n, total)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: 'var(--gold)', color: '#fff', borderRadius: '50px', padding: '1px 8px', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'Jost, sans-serif' }}>{n}</span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      </button>
      <div style={{ maxHeight: open ? `${total * 58 + 60}px` : '0px', overflow: 'hidden', transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1)', borderLeft: open ? '1.5px solid var(--gold-border)' : '1.5px solid transparent', borderRight: open ? '1.5px solid var(--gold-border)' : '1.5px solid transparent', borderBottom: open ? '1.5px solid var(--gold-border)' : '1.5px solid transparent', borderRadius: '0 0 12px 12px', background: 'var(--bg-surface)' }}>
        {OUTPUT_SECTIONS_CFG.map((s, i) => {
          const sel = selected.has(s.key)
          return (
            <div key={s.key} onClick={() => onToggle(s.key)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', borderBottom: i < OUTPUT_SECTIONS_CFG.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: sel ? `${s.color}18` : 'transparent', border: sel ? `1.5px solid ${s.color}40` : '1.5px solid transparent', borderRadius: '8px', margin: '0.3rem', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--gold-bg)' }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${sel ? s.color : 'var(--border-soft)'}`, background: sel ? s.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: sel ? `0 0 8px ${s.color}40` : 'none' }}>
                {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: sel ? `${s.color}25` : `${s.color}0d`, border: `2px solid ${sel ? s.color+'50' : s.color+'18'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, transition: 'all 0.15s', boxShadow: sel ? `0 0 12px ${s.color}30` : 'none' }}>
                <s.Icon size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: sel ? 700 : 500, color: sel ? s.color : 'var(--text-soft)', fontFamily: 'Jost, sans-serif', transition: 'color 0.15s' }}>{ui[s.secKey]}</div>
                <div style={{ fontSize: '0.71rem', color: sel ? s.color : 'var(--text-muted)', fontFamily: 'Jost, sans-serif', marginTop: '2px', lineHeight: 1.4, fontWeight: sel ? 500 : 400 }}>{ui[s.descKey]}</div>
              </div>
            </div>
          )
        })}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--gold-bg)' }}>
          {[[ui.selectAll, onSelectAll], [ui.deselectAll, onDeselectAll]].map(([lbl, fn]) => (
            <button key={lbl} onClick={e => { e.stopPropagation(); fn() }} style={{ padding: '0.3rem 0.85rem', borderRadius: '8px', background: lbl === ui.selectAll ? 'var(--gold-bg-strong)' : 'var(--bg-surface)', border: '1px solid var(--gold-border)', color: 'var(--gold)', fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>{lbl}</button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'Jost, sans-serif', alignSelf: 'center' }}>{selected.size} / {OUTPUT_SECTIONS_CFG.length}</span>
        </div>
      </div>
    </div>
  )
}

function Card({ SectionIcon, title, color, badge, children, downloadContent, downloadFilename }) {
  const [downloaded, setDownloaded] = useState(false)
  const handleDownload = () => {
    if (!downloadContent) return
    const blob = new Blob([downloadContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = downloadFilename || 'section.txt'
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    setDownloaded(true); setTimeout(() => setDownloaded(false), 2000)
  }
  return (
    <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: `1px solid ${color}20`, borderTop: `3px solid ${color}`, padding: '1.35rem', boxShadow: `0 4px 20px ${color}10`, animation: 'fadeUp 0.4s ease both', transition: 'box-shadow 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${color}14`, border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            <SectionIcon size={16} />
          </div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color, fontWeight: 600, margin: 0 }}>{title}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {badge && <span style={{ fontSize: '0.63rem', background: `${color}10`, border: `1px solid ${color}28`, color, borderRadius: '50px', padding: '0.15rem 0.6rem', fontWeight: 600, fontFamily: 'Jost, sans-serif' }}>{badge}</span>}
          {downloadContent && (
            <button onClick={handleDownload} style={{ background: downloaded ? 'var(--success-bg)' : 'transparent', border: `1px solid ${downloaded ? 'var(--success)' : color+'35'}`, color: downloaded ? 'var(--success)' : color, borderRadius: '7px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' }}>
              {downloaded ? <><IconCheck size={11} /> Saved</> : <><IconDownload size={11} /> Download</>}
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

function CopyChip({ text, color = '#B8973A' }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0.55rem 0.85rem', background: `${color}07`, border: `1px solid ${color}22`, borderRadius: '10px', marginBottom: '0.4rem', gap: '0.5rem', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}10`}
      onMouseLeave={e => e.currentTarget.style.background = `${color}07`}>
      <span style={{ color: 'var(--text-primary)', fontSize: '0.84rem', fontFamily: 'Jost, sans-serif', flex: 1, lineHeight: 1.55 }}>{text}</span>
      <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        style={{ background: copied ? 'var(--success-bg)' : 'transparent', border: `1px solid ${copied ? 'var(--success)' : color+'38'}`, color: copied ? 'var(--success)' : color, borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.67rem', fontWeight: 700, fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '3px' }}>
        {copied ? <><IconCheck size={10} /> ✓</> : <><IconCopy size={10} /> Copy</>}
      </button>
    </div>
  )
}

function ColorSwatch({ line }) {
  const hex = line.match(/#([0-9A-Fa-f]{3,6})/)?.[0]
  const parts = line.split(/[-–—]/, 2); const label = parts[0]?.trim(); const desc = parts[1]?.trim()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
      {hex && <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: hex, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0, transition: 'transform 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      />}
      <div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'Jost, sans-serif' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '1px', fontFamily: 'Jost, sans-serif' }}>{desc}</div>}
      </div>
    </div>
  )
}

function buildPrompt(f, sel) {
  const want = (key) => !sel || sel.has(key)
  return `ROLE: You are an elite brand strategist, world-class creative director, and startup advisor with 25+ years of experience building billion-dollar brands. You think like McKinsey, create like Pentagram, and execute like a startup founder.

TASK: Create a COMPLETE, professional-grade, ready-to-implement BRAND SYSTEM

CLIENT CONTEXT:
INDUSTRY: ${f.industry.join(', ') || 'Not specified'}
TARGET AUDIENCE: ${f.audience.join(', ') || 'Not specified'}
CORE PROBLEM SOLVED: ${f.problem || 'Not specified'}
BRAND VIBE: ${f.vibe.join(', ') || 'Not specified'}
BRAND PERSONALITY: ${f.personality.join(', ') || 'Not specified'}
TONE OF VOICE: ${f.tone.join(', ') || 'Not specified'}
MARKET SCOPE: ${f.scope.join(', ') || 'Not specified'}
OUTPUT LANGUAGE: ${f.language}

CRITICAL REQUIREMENTS:
1. ZERO placeholders, brackets, or generic filler — every detail is specific
2. Professional-grade quality — suitable for presenting to investors/boardrooms
3. Comprehensive — each section must be complete, actionable, and detailed
4. Distinctive — specific to this brand's context, never generic
5. Total minimum output: 5000+ words
6. All content is FINAL and IMMEDIATELY IMPLEMENTABLE
7. Use these exact section headers ONLY — no variations, no additions
8. No intro, summary, markdown tables, or closing statements — only the sections

${want('brandNames') ? `---BRAND NAMES---
Generate 12 unique, modern, legally brandable names. For each name provide:
[#]. [Full Name] | [Word Origin/Meaning] | [Why It Works For ${f.industry.join('/')} in ${f.scope.join('/')}]

Every name must:
- Be memorable and easy to spell
- Feel premium and distinctive
- Have meaning that connects to the audience and problem solved
- Work globally and in Indian markets
- Be available as a domain and social handle (check your knowledge)
` : ''}
${want('taglines') ? `---TAGLINES---
Create 8 powerful taglines representing different angles:

1. BOLD & SHOCKING: [A surprising statement that challenges status quo about ${f.problem}]
2. EMOTIONAL: [A heartfelt statement that resonates with ${f.audience}]
3. BENEFIT-DRIVEN: [A clear outcome statement for ${f.audience}]
4. HINDI/REGIONAL: [A tagline in Hindi or relevant Indian language]
5. PROBLEM-TO-SOLUTION: [Frame the problem, hint at solution]
6. COMMUNITY-FOCUSED: [Emphasizes belonging and community]
7. MINIMALIST: [2-3 words maximum, maximum impact]
8. FUTURE-FORWARD: [Positions brand as forward-thinking for ${f.scope}]

Each must be memorable, ownable, and differentiated.
` : ''}
${want('strategy') ? `---BRAND STRATEGY---
Mission (50-75 words): [Why this brand exists beyond profit — the deeper purpose for ${f.audience}]

Vision (50-75 words): [What the world looks like when this brand succeeds — be specific about ${f.industry}]

Unique Value Proposition (40-60 words): [Specific benefit to ${f.audience} that competitors cannot claim about solving ${f.problem}]

Positioning Statement (50-75 words): [For [target audience], [brand name] is the [category] that [unique benefit] because [reason to believe].]

Core Values (5 values with 1-sentence explanation each):
— Value 1: [Definition and why it matters for this brand]
— Value 2: [Definition and why it matters for this brand]
— Value 3: [Definition and why it matters for this brand]
— Value 4: [Definition and why it matters for this brand]
— Value 5: [Definition and why it matters for this brand]

Competitor Differentiation (150 words): [Specific ways this brand differs from top 3 competitors in ${f.industry}. Include positioning, tone, audience approach, and why it matters.]
` : ''}
${want('persona') ? `---TARGET PERSONA---
Persona Name: [A realistic first name representing your primary audience]

Demographics:
Age Range: [Specific age range]
Location: [Geographic focus within India and beyond]
Occupation: [Specific job titles this person holds]
Monthly Income: [Salary range in INR]

Psychographics:
Goals (3 main ones): [Specific, measurable goals about ${f.problem}]
Pain Points (3 main ones): [Specific frustrations they face daily]
Daily Behavior: [How they spend time, what devices, which platforms]
Current Solutions: [What they use now instead of your brand]

Brand Connection:
Why They Choose This Brand: [Specific emotional and functional reasons]
Decision Timeline: [How long they take to decide]
Price Sensitivity: [Are they price-conscious or premium-focused]
Key Quote: [One powerful quote that represents how they feel/think]

Media Consumption:
Top 3 Platforms: [Where they spend time]
Content Preferences: [What type of content resonates]
Influencers They Follow: [Specific people or brands they trust]
` : ''}
${want('identity') ? `---BRAND IDENTITY---
Logo Style Direction: [Specific visual style — e.g., "Geometric monogram with negative space," not generic]

PRIMARY COLOR: [#HEX CODE] — [Color name] — [Why this color for ${f.audience} and ${f.vibe}. Psychology. Usage.]

SECONDARY COLOR: [#HEX CODE] — [Color name] — [Support color for depth and flexibility. Psychology. Usage.]

ACCENT COLOR: [#HEX CODE] — [Color name] — [Highlights, CTAs, attention. Psychology. Usage.]

BACKGROUND COLOR: [#HEX CODE] — [Color name] — [Default background for content. Psychology. Usage.]

Primary Font: [Font name] + [Specific font weights to use] — [Why this font for headlines/logo. Character. Versatility.]

Secondary Font: [Font name] + [Specific font weights to use] — [Why this font for body text. Legibility. Personality.]

Visual Mood: [2-3 sentences describing overall visual feeling — color palette emotion, texture, visual weight, energy level]

Design Inspiration: [3 specific visual references or design styles that influenced this identity]

Usage Guidelines:
- Logo Clear Space: [Specification]
- Minimum Size: [Specification]
- Color Applications: [Primary vs secondary usage rules]
- Don't Ever: [Common mistakes to avoid]
` : ''}
${want('voice') ? `---BRAND VOICE---
Personality Traits (5 key traits): [Specific adjectives — not "authentic" but "brutally honest," etc.]
- Trait 1: [Definition and how it shows in communication]
- Trait 2: [Definition and how it shows in communication]
- Trait 3: [Definition and how it shows in communication]
- Trait 4: [Definition and how it shows in communication]
- Trait 5: [Definition and how it shows in communication]

What the Brand Sounds Like: [150 words describing tone, vocabulary choices, sentence structure, personality]

What the Brand NEVER Says: [Things that would be out of character — 5-7 examples]

Platform-Specific Voice Samples:

INSTAGRAM CAPTION EXAMPLE:
[250-word sample post that embodies brand voice. Hook + value + CTA. Specific to Instagram culture. Use emojis appropriately.]

LINKEDIN POST OPENING EXAMPLE:
[100-word sample post opening. Professional but distinctive. Thought leadership angle. Specific to LinkedIn culture.]

WHATSAPP BROADCAST EXAMPLE:
[50-75 word sample message. Conversational. Direct. Action-oriented. Builds relationship.]
` : ''}
${want('content') ? `---CONTENT STRATEGY---
Content Pillars (5 pillars): [These are content categories that support brand positioning and audience needs]
1. [Pillar 1] — [Why this pillar matters for ${f.audience}]
2. [Pillar 2] — [Why this pillar matters for ${f.audience}]
3. [Pillar 3] — [Why this pillar matters for ${f.audience}]
4. [Pillar 4] — [Why this pillar matters for ${f.audience}]
5. [Pillar 5] — [Why this pillar matters for ${f.audience}]

10 Specific Content Ideas (with platform suggestions):
1. [Idea + Platform + Why it works]
2. [Idea + Platform + Why it works]
3. [Idea + Platform + Why it works]
4. [Idea + Platform + Why it works]
5. [Idea + Platform + Why it works]
6. [Idea + Platform + Why it works]
7. [Idea + Platform + Why it works]
8. [Idea + Platform + Why it works]
9. [Idea + Platform + Why it works]
10. [Idea + Platform + Why it works]

Viral Content Angle: [Specific insight into what makes content shareable for ${f.audience}. Psychology + execution tips.]

Platform Strategy:
INSTAGRAM: [200 words — focus on aesthetics, story, engagement, content mix, posting frequency, hashtag strategy]
LINKEDIN: [200 words — focus on thought leadership, insights, network building, posting frequency, engagement tactics]
YOUTUBE: [200 words — focus on video style, series ideas, upload frequency, audience building, shorts strategy]
WHATSAPP/EMAIL: [150 words — focus on direct communication, frequency, value delivery, conversion approach]
` : ''}
${want('product') ? `---PRODUCT BRANDING---
Service/Product Naming Ideas (3 names with explanations):
1. [Name] — [Why this name works for ${f.industry}]
2. [Name] — [Why this name works for ${f.industry}]
3. [Name] — [Why this name works for ${f.industry}]

Pricing Perception Strategy: [150 words on how to price this in ${f.scope} market. Psychology. Positioning. Competitor comparison. Payment options.]

Packaging/Presentation Language: [100 words describing how to present this product/service. Unboxing experience. Language. Visual design. Quality signals.]

Customer Journey Map:
AWARENESS: [How ${f.audience} first learns about this brand and its offerings]
INTEREST: [What specific content/experience builds interest and consideration]
DECISION: [What pushes them to make the purchase decision]
RETENTION: [How to keep them engaged and buying repeatedly]
ADVOCACY: [How to turn them into brand ambassadors]

Objection Handling: [Common objections ${f.audience} might have when considering this product + specific responses for each]
` : ''}
${want('growth') ? `---GROWTH STRATEGY---
30-Day Launch Plan (Week by Week):

WEEK 1: [Specific launch week activities — brand reveal, PR, partnerships, content, promotions]

WEEK 2: [Building momentum — content acceleration, engagement tactics, paid strategy, community building]

WEEK 3: [Optimization phase — what's working, what to double down on, partnerships, influencer engagement]

WEEK 4: [Sustained growth — retention focus, referral program launch, community deepening, metrics review]

5 Organic Growth Tactics (with specific implementation):
1. [Tactic] — [Exactly how to execute this for ${f.industry}]
2. [Tactic] — [Exactly how to execute this for ${f.industry}]
3. [Tactic] — [Exactly how to execute this for ${f.industry}]
4. [Tactic] — [Exactly how to execute this for ${f.industry}]
5. [Tactic] — [Exactly how to execute this for ${f.industry}]

Collaboration & Partnership Ideas: [3-4 specific partnership types + examples of companies/creators to approach]

Key Metrics to Track: [10 specific metrics with why each matters for ${f.industry}. How to measure. Targets.]

Growth Hacks (Platform-Specific):
- For ${f.scope}: [3 specific, actionable hacks]
- Quick Wins: [3 tactics that can be implemented immediately]
- Long-term Moats: [What defensible advantages this brand can build]
` : ''}
${want('bonus') ? `---BONUS ASSETS---
Domain Name Ideas (3 options with availability notes):
1. [Domain] — [Why this domain works. Availability status.]
2. [Domain] — [Why this domain works. Availability status.]
3. [Domain] — [Why this domain works. Availability status.]

Instagram Handle Ideas (3 options with strategy):
1. @[handle] — [Why this handle works. Memorable. Relevant keywords.]
2. @[handle] — [Why this handle works. Memorable. Relevant keywords.]
3. @[handle] — [Why this handle works. Memorable. Relevant keywords.]

Brand Hashtag: #[hashtag] — [Why this hashtag. Easy to spell. Memorable.]

Community Hashtags (5-7 hashtags): [Hashtags relevant to ${f.audience} and ${f.industry}]

Niche Hashtags (5-7 hashtags): [Specific, less-searched hashtags for micro-community building]

Indian Market Hashtags (5-7 hashtags): [India-specific, culturally relevant hashtags]

Final Brand Mantra (1 powerful statement): [One sentence that encapsulates the entire brand philosophy and promise]
` : ''}

LANGUAGE: Output ENTIRELY in ${f.language}. No code, no markdown, no language mixing.
FORMAT: Use section headers EXACTLY as shown. No variations.
QUALITY: This is final output for implementation. No rough drafts, no approximations.`
}

function parse(text) {
  const get = (key) => {
    const patterns = [
      `---${key}---`,
      `## ${key}`,
      `# ${key}`,
      `**${key}**`,
      `${key}:`,
    ]

    for (const prefix of patterns) {
      const re = new RegExp(`${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)(?=---[A-Z ]+---|##\\s+[A-Z ]+|#\\s+[A-Z ]+|\*\*[A-Z ]+\*\*|[A-Z][A-Z ]{2,}:|$)`, 'i')
      const match = text.match(re)
      if (match?.[1]) return match[1].trim()
    }

    return ''
  }
  const lines = (b) => b.split('\n').map(l => l.trim()).filter(Boolean)
  return {
    brandNames: lines(get('BRAND NAMES')), taglines: lines(get('TAGLINES')),
    strategy: get('BRAND STRATEGY'), persona: get('TARGET PERSONA'),
    identity: get('BRAND IDENTITY'), voice: get('BRAND VOICE'),
    content: get('CONTENT STRATEGY'), product: get('PRODUCT BRANDING'),
    growth: get('GROWTH STRATEGY'), bonus: get('BONUS ASSETS'),
  }
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
export default function BrandAdvisor() {
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const ui = getUI(lang)

  const [form, setForm] = useState({ industry: [], audience: [], problem: '', vibe: [], personality: [], tone: [], scope: [], language: 'English', voiceLang: 'English' })
  const [customIndustry, setCustomIndustry] = useState('')
  const [customAudience, setCustomAudience]  = useState('')
  const [selectedSections, setSelectedSections] = useState(new Set(OUTPUT_SECTIONS_CFG.map(s => s.key)))
  const toggleSection = (key) => setSelectedSections(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  const [loading, setLoading] = useState(false)
  const [data, setData]       = useState(null)
  const [raw, setRaw]         = useState('')
  const [error, setError]     = useState('')
  const [view, setView]       = useState('cards')
  const [copiedAll, setCopiedAll] = useState(false)
  const toggle = (field, val) => setForm(p => ({ ...p, [field]: p[field].includes(val) ? p[field].filter(x => x !== val) : [...p[field], val] }))

  // ── Backend API call (uses configured provider keys server-side) ──
  const { addEntry } = useHistory()

  const handleGenerate = async () => {
    if (!form.industry.length && !customIndustry.trim()) { setError(ui.errIndustry); return }
    if (!form.problem.trim()) { setError(ui.errProblem); return }
    if (selectedSections.size === 0) { setError(ui.errSections); return }

    const merged = {
      ...form,
      industry: [...form.industry, ...(customIndustry.trim() ? [customIndustry.trim()] : [])],
      audience: [...form.audience, ...(customAudience.trim() ? [customAudience.trim()] : [])],
    }

    setLoading(true); setError(''); setData(null); setRaw('')

    try {
      const response = await generateBrandAdvisor({
        ai_provider: 'gemini',
        system: 'You are a senior brand advisor, startup strategist, and creative director with 20+ years experience. Always respond in the exact structured format with ---SECTION--- delimiters. Be specific, creative, and India-focused.',
        message: buildPrompt(merged, selectedSections),
      })

      const txt = response?.data?.output || ''
      if (txt) {
        setRaw(txt)
        setData(parse(txt))
        // Save to history
        await addEntry({
          feature: 'brand_advisor',
          content_type: 'brand_advisor',
          brand: merged.industry[0] || 'Brand Advisor',
          title: form.problem.substring(0, 60),
          output: txt,
          industry: merged.industry.join(', '),
          audience: merged.audience.join(', '),
          tone: form.tone.join(', '),
          language: form.language,
          metadata: {
            sections: Array.from(selectedSections).join(', '),
            vibe: form.vibe.join(', '),
            personality: form.personality.join(', '),
            scope: form.scope.join(', '),
          }
        })
      } else {
        setError(ui.errApi)
      }
    } catch (err) {
      if (err?.code === 'ECONNABORTED') setError(ui.errTimeout)
      else setError(ui.errApi)
    }

    setLoading(false)
  }

  return (
    <AppLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>

        <button onClick={() => navigate('/ai-suggestion')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--gold-border)', borderRadius: '8px', padding: '0.38rem 0.85rem', cursor: 'pointer', color: 'var(--gold)', fontSize: '0.76rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', marginBottom: '1.5rem', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold-bg)'; e.currentTarget.style.transform = 'translateX(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)' }}>
          <IconBack size={14} /> {ui.backBtn}
        </button>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: '50px', padding: '0.28rem 0.85rem', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.63rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>{ui.aiLabel}</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
            {ui.pageTitle} <em style={{ color: 'var(--gold)' }}>{ui.pageTitleItalic}</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '560px', lineHeight: 1.65, margin: 0, fontFamily: 'Jost, sans-serif' }}>{ui.pageDesc}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1.75rem', alignItems: 'start' }}>

          {/* LEFT PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'sticky', top: '1rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={lStyle}>{ui.industryLabel}</label>
                <ChipGroup options={ui.INDUSTRY} selected={form.industry} onToggle={v => toggle('industry', v)} />
                <input placeholder={ui.otherIndustryPH} value={customIndustry} onChange={e => setCustomIndustry(e.target.value)} style={{ ...iStyle, marginTop: '0.5rem', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={lStyle}>{ui.audienceLabel}</label>
                <ChipGroup options={ui.AUDIENCE} selected={form.audience} onToggle={v => toggle('audience', v)} />
                <input placeholder={ui.otherAudiencePH} value={customAudience} onChange={e => setCustomAudience(e.target.value)} style={{ ...iStyle, marginTop: '0.5rem', fontSize: '0.82rem' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                  <label style={{ ...lStyle, marginBottom: 0 }}>{ui.problemLabel}</label>
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <select value={form.voiceLang} onChange={e => setForm(p => ({ ...p, voiceLang: e.target.value }))} style={{ fontSize: '0.68rem', border: '1px solid var(--gold-border)', borderRadius: '6px', padding: '2px 5px', background: 'var(--bg-input)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                      {SPEECH_LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                    <MicButton voiceLang={form.voiceLang} speakLabel={ui.speak} stopLabel={ui.stop} onResult={t => setForm(p => ({ ...p, problem: p.problem ? p.problem + ' ' + t : t }))} />
                  </div>
                </div>
                <textarea rows={3} placeholder={ui.problemPH} value={form.problem} onChange={e => setForm(p => ({ ...p, problem: e.target.value }))} style={{ ...iStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
              <div>
                <label style={lStyle}>{ui.vibeLabel}</label>
                <ChipGroup options={ui.VIBE} selected={form.vibe} onToggle={v => toggle('vibe', v)} />
              </div>
              <div>
                <label style={lStyle}>{ui.personalityLabel}</label>
                <ChipGroup options={ui.PERSONALITY} selected={form.personality} onToggle={v => toggle('personality', v)} />
              </div>
              <div>
                <label style={lStyle}>{ui.toneLabel}</label>
                <ChipGroup options={ui.TONE} selected={form.tone} onToggle={v => toggle('tone', v)} />
              </div>
              <div>
                <label style={lStyle}>{ui.scopeLabel}</label>
                <ChipGroup options={ui.SCOPE} selected={form.scope} onToggle={v => toggle('scope', v)} />
              </div>
              <div>
                <label style={lStyle}>{ui.outputLangLabel}</label>
                <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} style={{ ...iStyle, cursor: 'pointer' }}>
                  {ui.OUTPUT_LANGS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div style={{ padding: '0.7rem 1rem', background: 'var(--error-bg)', border: '1px solid var(--error)', borderLeft: '3px solid var(--error)', borderRadius: '8px', color: 'var(--error)', fontSize: '0.81rem', fontFamily: 'Jost, sans-serif' }}>⚠️ {error}</div>
            )}

            <button onClick={handleGenerate} disabled={loading} style={{ padding: '1rem', width: '100%', fontSize: '0.9rem', background: loading ? 'var(--gold-bg-strong)' : 'linear-gradient(135deg, var(--gold-light), var(--gold-dark))', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', color: '#1A1208', fontWeight: 700, fontFamily: 'Jost, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: loading ? 'none' : '0 6px 24px var(--gold-glow,rgba(184,151,58,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s' }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 10px 32px var(--gold-glow,rgba(184,151,58,0.4))' }}}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 24px var(--gold-glow,rgba(184,151,58,0.3))' }}}>
              {loading
                ? <><div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(26,18,8,0.3)', borderTop: '2px solid #1A1208', animation: 'spin 0.8s linear infinite' }} /> {ui.buildingBtn}</>
                : ui.generateBtn(selectedSections.size)}
            </button>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {!data && !loading && (
              <>
                <div style={{ background: 'var(--bg-surface)', border: '1.5px dashed var(--gold-border)', borderRadius: '16px', padding: '2.5rem 2rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--gold)', opacity: 0.6 }}>
                    <IconBrandNames size={52} />
                  </div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--gold)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>{ui.readyTitle}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '340px', margin: '0 auto 0', lineHeight: 1.65, fontFamily: 'Jost, sans-serif' }}>{ui.readyDesc}</p>
                </div>

                <SectionSelectorDropdown
                  selected={selectedSections}
                  onToggle={toggleSection}
                  onSelectAll={() => setSelectedSections(new Set(OUTPUT_SECTIONS_CFG.map(s => s.key)))}
                  onDeselectAll={() => setSelectedSections(new Set())}
                  ui={ui}
                />
              </>
            )}

            {loading && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '3px solid var(--border)', borderTop: '3px solid var(--gold)', animation: 'spin 0.9s linear infinite', margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--gold)', fontSize: '1.3rem', marginBottom: '0.4rem' }}>{ui.buildingTitle}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem', fontFamily: 'Jost, sans-serif' }}>{ui.buildingDesc(selectedSections.size)}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.4rem' }}>
                  {OUTPUT_SECTIONS_CFG.filter(s => selectedSections.has(s.key)).map((s, i) => (
                    <span key={s.key} style={{ fontSize: '0.7rem', background: `${s.color}10`, border: `1px solid ${s.color}28`, color: s.color, borderRadius: '50px', padding: '0.2rem 0.6rem', animation: `pulse 1.5s infinite ${i * 0.1}s`, fontFamily: 'Jost, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <s.Icon size={10} /> {ui[s.secKey]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', background: 'var(--bg-surface-3)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border)' }}>
                    {[['cards', ui.cards], ['raw', ui.fullText]].map(([v, label]) => (
                      <button key={v} onClick={() => setView(v)} style={{ padding: '0.32rem 0.8rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: view === v ? 'var(--bg-surface)' : 'transparent', color: view === v ? 'var(--gold)' : 'var(--text-muted)', fontSize: '0.76rem', fontWeight: view === v ? 600 : 400, fontFamily: 'Jost, sans-serif', transition: 'all 0.2s' }}>{label}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleGenerate} style={{ background: 'transparent', border: '1px solid var(--gold-border)', color: 'var(--gold)', padding: '0.38rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <IconRefresh size={12} /> {ui.regenerate}
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(raw); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000) }}
                      style={{ background: copiedAll ? 'var(--success-bg)' : 'var(--gold-bg)', border: `1px solid ${copiedAll ? 'var(--success)' : 'var(--gold-border)'}`, color: copiedAll ? 'var(--success)' : 'var(--gold)', padding: '0.38rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {copiedAll ? <><IconCheck size={12} /> {ui.copiedAll}</> : <><IconCopy size={12} /> {ui.copyAll}</>}
                    </button>
                  </div>
                </div>

                {view === 'raw' && (
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem', whiteSpace: 'pre-wrap', fontSize: '0.84rem', lineHeight: 1.9, color: 'var(--text-primary)', maxHeight: '75vh', overflowY: 'auto', fontFamily: 'Jost, sans-serif' }}>{raw}</div>
                )}

                {view === 'cards' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {data.brandNames?.length > 0 && selectedSections.has('brandNames') && (
                      <Card SectionIcon={IconBrandNames} title={ui.cardBrandNames} color="#B8973A" badge={`${data.brandNames.length} names`} downloadContent={data.brandNames.join('\n\n')} downloadFilename="brand-names.txt">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                          {data.brandNames.map((n, i) => <CopyChip key={i} text={n} color="#B8973A" />)}
                        </div>
                      </Card>
                    )}
                    {data.taglines?.length > 0 && selectedSections.has('taglines') && (
                      <Card SectionIcon={IconTaglines} title={ui.cardTaglines} color="#7A9EC5" badge={`${data.taglines.length} options`} downloadContent={data.taglines.join('\n\n')} downloadFilename="taglines.txt">
                        {data.taglines.map((t, i) => <CopyChip key={i} text={t} color="#7A9EC5" />)}
                      </Card>
                    )}
                    {data.strategy && selectedSections.has('strategy') && (
                      <Card SectionIcon={IconStrategy} title={ui.cardStrategy} color="#8BAF8D" badge="Full system" downloadContent={data.strategy} downloadFilename="brand-strategy.txt">
                        <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(data.strategy)}</div>
                      </Card>
                    )}
                    {data.persona && selectedSections.has('persona') && (
                      <Card SectionIcon={IconPersona} title={ui.cardPersona} color="#9B7AC5" downloadContent={data.persona} downloadFilename="target-persona.txt">
                        <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(data.persona)}</div>
                      </Card>
                    )}
                    {data.identity && selectedSections.has('identity') && (
                      <Card SectionIcon={IconIdentity} title={ui.cardIdentity} color="#C07A6A" badge="Colors + fonts + logo" downloadContent={data.identity} downloadFilename="brand-identity.txt">
                        {data.identity.split('\n').filter(Boolean).map((line, i) =>
                          line.match(/#([0-9A-Fa-f]{3,6})/)
                            ? <ColorSwatch key={i} line={line} />
                            : <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.75, margin: '0.25rem 0', fontFamily: 'Jost, sans-serif' }}>{line}</p>
                        )}
                      </Card>
                    )}
                    {data.voice && selectedSections.has('voice') && (
                      <Card SectionIcon={IconVoice} title={ui.cardVoice} color="#E07B5A" downloadContent={data.voice} downloadFilename="brand-voice.txt">
                        <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(data.voice)}</div>
                      </Card>
                    )}
                    {data.content && selectedSections.has('content') && (
                      <Card SectionIcon={IconContent} title={ui.cardContent} color="#4A9B9B" badge="Pillars + ideas" downloadContent={data.content} downloadFilename="content-strategy.txt">
                        <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.85, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(data.content)}</div>
                      </Card>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {data.product && selectedSections.has('product') && (
                        <Card SectionIcon={IconProduct} title={ui.cardProduct} color="#6B9B6B" downloadContent={data.product} downloadFilename="product-branding.txt">
                          <div style={{ whiteSpace: 'pre-line', fontSize: '0.84rem', color: 'var(--text-soft)', lineHeight: 1.8, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(data.product)}</div>
                        </Card>
                      )}
                      {data.growth && selectedSections.has('growth') && (
                        <Card SectionIcon={IconGrowth} title={ui.cardGrowth} color="#6482B4" badge="30-day plan" downloadContent={data.growth} downloadFilename="growth-strategy.txt">
                          <div style={{ whiteSpace: 'pre-line', fontSize: '0.84rem', color: 'var(--text-soft)', lineHeight: 1.8, fontFamily: 'Jost, sans-serif' }}>{parseMarkdownToJSX(data.growth)}</div>
                        </Card>
                      )}
                    </div>
                    {data.bonus && selectedSections.has('bonus') && (
                      <Card SectionIcon={IconBonus} title={ui.cardBonus} color="#C5A07A" badge="Domains + handles + hashtags" downloadContent={data.bonus} downloadFilename="bonus-assets.txt">
                        {data.bonus.split('\n').filter(Boolean).map((line, i) => {
                          const tags = line.match(/#\w+/g)
                          if (tags && tags.length > 1) {
                            const label = line.match(/^([^:]+):/)?.[1]?.trim()
                            return (
                              <div key={i} style={{ marginBottom: '0.65rem' }}>
                                {label && <div style={{ fontSize: '0.63rem', color: '#C5A07A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem', fontFamily: 'Jost, sans-serif' }}>{label}</div>}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                  {tags.map((tag, j) => (
                                    <button key={j} onClick={() => navigator.clipboard.writeText(tag)}
                                      style={{ background: 'rgba(197,160,122,0.08)', border: '1px solid rgba(197,160,122,0.25)', color: '#C5A07A', borderRadius: '50px', padding: '0.18rem 0.6rem', cursor: 'pointer', fontSize: '0.76rem', fontFamily: 'Jost, sans-serif', transition: 'all 0.15s' }}
                                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,160,122,0.18)'; e.currentTarget.style.transform = 'scale(1.05)' }}
                                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(197,160,122,0.08)'; e.currentTarget.style.transform = 'scale(1)' }}>
                                      {tag}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                          return <p key={i} style={{ fontSize: '0.84rem', color: 'var(--text-soft)', lineHeight: 1.75, margin: '0.2rem 0', fontFamily: 'Jost, sans-serif' }}>{line}</p>
                        })}
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:1} }
      `}</style>
    </AppLayout>
  )
}