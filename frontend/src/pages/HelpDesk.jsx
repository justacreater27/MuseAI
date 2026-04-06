import { useState, useRef, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { useLanguage } from '../context/LanguageContext'

const FAQS_ML = {
  English: [
    { q: 'How do I generate a script?', a: 'Go to Generate → select Script → fill in Brand Name and Theme → click Generate.' },
    { q: 'Which languages are supported?', a: 'MuseAI supports 11 languages: English, Tamil, Hindi, Malayalam, Telugu, Kannada, Marathi, Bengali, Gujarati, Punjabi, and Urdu.' },
    { q: 'How many generations on Free plan?', a: 'Free plan allows 10 generations per month. Upgrade to Pro (100/month) or Agency (unlimited) for more.' },
    { q: 'What is the Campaign content type?', a: 'Campaign generates a full multi-week marketing plan with channels, messaging, budget split, and weekly tactics.' },
    { q: 'How do I use speech input?', a: 'On the Generate page, click the 🎤 mic icon next to any field and speak. Works best in Chrome.' },
  ],
  Tamil: [
    { q: 'ஸ்கிரிப்ட் எப்படி உருவாக்குவது?', a: 'Generate → Script → Brand Name & Theme → Generate கிளிக் செய்யுங்கள்.' },
    { q: 'எந்த மொழிகள் ஆதரிக்கப்படுகின்றன?', a: 'MuseAI 11 மொழிகளை ஆதரிக்கிறது: தமிழ், இந்தி, தெலுங்கு, மலயாளம், கன்னடம் உள்பட.' },
    { q: 'Free திட்டத்தில் எத்தனை generations?', a: 'Free திட்டத்தில் மாதம் 10 generations. Pro (100/மாதம்) அல்லது Agency (unlimited) தேர்வு செய்யலாம்.' },
    { q: 'Campaign என்றால் என்ன?', a: 'Campaign பல வார marketing திட்டத்தை உருவாக்கும் — channels, budget, weekly tactics உட்பட.' },
    { q: 'Speech input எப்படி பயன்படுத்துவது?', a: 'Generate பக்கத்தில் 🎤 கிளிக் செய்து பேசுங்கள். Chrome இல் சிறப்பாக செயல்படும்.' },
  ],
  Hindi: [
    { q: 'स्क्रिप्ट कैसे बनाएं?', a: 'Generate → Script → Brand Name & Theme भरें → Generate करें।' },
    { q: 'कौन सी भाषाएं समर्थित हैं?', a: 'MuseAI 11 भाषाओं को support करता है: हिंदी, तमिल, तेलुगु, मलयालम, कन्नड़ सहित।' },
    { q: 'Free plan में कितने generations?', a: 'Free plan में 10 generations/माह। Pro (100/माह) या Agency (unlimited) अपग्रेड करें।' },
    { q: 'Campaign content type क्या है?', a: 'Campaign एक पूरा marketing plan बनाता है — channels, budget, weekly tactics के साथ।' },
    { q: 'Speech input कैसे उपयोग करें?', a: 'Generate पेज पर 🎤 दबाएं और बोलें। Chrome में सबसे अच्छा काम करता है।' },
  ],
  Telugu: [
    { q: 'స్క్రిప్ట్ ఎలా తయారు చేయాలి?', a: 'Generate → Script → Brand Name & Theme → Generate క్లిక్ చేయండి.' },
    { q: 'ఏ భాషలు మద్దతు ఇస్తున్నాయి?', a: 'MuseAI 11 భాషలకు మద్దతు ఇస్తుంది: తెలుగు, తమిళం, హిందీ మరియు ఇతరాలు.' },
    { q: 'Free ప్లాన్‌లో ఎన్ని generations?', a: 'Free ప్లాన్‌లో నెలకు 10 generations. Pro (100/నెల) లేదా Agency (unlimited) తీసుకోవచ్చు.' },
    { q: 'Campaign అంటే ఏమిటి?', a: 'Campaign పూర్తి marketing ప్లాన్ తయారు చేస్తుంది — channels, budget, weekly tactics తో.' },
    { q: 'Speech input ఎలా వాడాలి?', a: 'Generate పేజీలో 🎤 క్లిక్ చేసి మాట్లాడండి. Chrome లో బాగా పని చేస్తుంది.' },
  ],
  Malayalam: [
    { q: 'സ്ക്രിപ്റ്റ് എങ്ങനെ ഉണ്ടാക്കാം?', a: 'Generate → Script → Brand Name & Theme → Generate ക്ലിക്ക് ചെയ്യൂ.' },
    { q: 'ഏതൊക്കെ ഭാഷകൾ പിന്തുണക്കുന്നു?', a: 'MuseAI 11 ഭാഷകൾ പിന്തുണക്കുന്നു: മലയാളം, തമിഴ്, ഹിന്ദി, തെലുങ്ക് ഉൾപ്പെടെ.' },
    { q: 'Free പ്ലാനിൽ എത്ര generations?', a: 'Free പ്ലാനിൽ മാസം 10 generations. Pro (100/മാസം) അല്ലെങ്കിൽ Agency (unlimited) ആകാം.' },
    { q: 'Campaign എന്താണ്?', a: 'Campaign ഒരു പൂർണ്ണ marketing പ്ലാൻ ഉണ്ടാക്കും — channels, budget, weekly tactics സഹിതം.' },
    { q: 'Speech input എങ്ങനെ ഉപയോഗിക്കാം?', a: 'Generate പേജിൽ 🎤 അമർത്തി സംസാരിക്കൂ. Chrome-ൽ നന്നായി പ്രവർത്തിക്കും.' },
  ],
  Kannada: [
    { q: 'ಸ್ಕ್ರಿಪ್ಟ್ ಹೇಗೆ ತಯಾರಿಸುವುದು?', a: 'Generate → Script → Brand Name & Theme → Generate ಕ್ಲಿಕ್ ಮಾಡಿ.' },
    { q: 'ಯಾವ ಭಾಷೆಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ?', a: 'MuseAI 11 ಭಾಷೆಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ: ಕನ್ನಡ, ತಮಿಳು, ಹಿಂದಿ ಸೇರಿದಂತೆ.' },
    { q: 'Free ಯೋಜನೆಯಲ್ಲಿ ಎಷ್ಟು generations?', a: 'Free ಯೋಜನೆಯಲ್ಲಿ ತಿಂಗಳಿಗೆ 10 generations. Pro (100/ತಿಂಗಳು) ಅಥವಾ Agency (unlimited).' },
    { q: 'Campaign ಎಂದರೇನು?', a: 'Campaign ಸಂಪೂರ್ಣ marketing ಯೋಜನೆ ತಯಾರಿಸುತ್ತದೆ — channels, budget, weekly tactics ಸಹಿತ.' },
    { q: 'Speech input ಹೇಗೆ ಬಳಸುವುದು?', a: 'Generate ಪುಟದಲ್ಲಿ 🎤 ಕ್ಲಿಕ್ ಮಾಡಿ ಮಾತನಾಡಿ. Chrome ನಲ್ಲಿ ಉತ್ತಮ.' },
  ],
}

const ALL_LANGUAGES = ['English','Tamil','Hindi','Telugu','Malayalam','Kannada','Bengali','Marathi','Gujarati','Punjabi','Urdu']

const SPEECH_LOCALES = {
  English:'en-IN', Tamil:'ta-IN', Hindi:'hi-IN', Telugu:'te-IN',
  Malayalam:'ml-IN', Kannada:'kn-IN', Bengali:'bn-IN', Marathi:'mr-IN',
  Gujarati:'gu-IN', Punjabi:'pa-IN', Urdu:'ur-IN',
}

// ── Greeting per language ────────────────────────────────────────────
const GREETINGS = {
  English:   "Hi! 👋 I'm MuseAI Support. Ask me anything — scripts, visuals, jingles, campaigns, pricing, or troubleshooting!",
  Tamil:     "வணக்கம்! 👋 நான் MuseAI ஆதரவு. ஸ்கிரிப்ட், விஷுவல், ஜிங்கில், கேம்பெயின் அல்லது விலை பற்றி கேளுங்கள்!",
  Hindi:     "नमस्ते! 👋 मैं MuseAI सपोर्ट हूँ। स्क्रिप्ट, विजुअल, जिंगल, कैंपेन या कीमत — कुछ भी पूछें!",
  Telugu:    "నమస్కారం! 👋 నేను MuseAI సపోర్ట్. స్క్రిప్ట్, విజువల్, జింగిల్, క్యాంపెయిన్ గురించి అడగండి!",
  Malayalam: "നമസ്കാരം! 👋 ഞാൻ MuseAI സപ്പോർട്ട്. സ്ക്രിപ്റ്റ്, വിഷ്വൽ, ജിംഗിൾ, ക്യാംപെയ്ൻ — ചോദിക്കൂ!",
  Kannada:   "ನಮಸ್ಕಾರ! 👋 ನಾನು MuseAI ಬೆಂಬಲ. ಸ್ಕ್ರಿಪ್ಟ್, ವಿಷುಯಲ್, ಜಿಂಗಲ್ ಬಗ್ಗೆ ಕೇಳಿ!",
  Bengali:   "নমস্কার! 👋 আমি MuseAI সাপোর্ট। স্ক্রিপ্ট, ভিজ্যুয়াল, জিঙ্গেল, ক্যাম্পেইন — যেকোনো প্রশ্ন করুন!",
  Marathi:   "नमस्कार! 👋 मी MuseAI सपोर्ट. स्क्रिप्ट, व्हिज्युअल, जिंगल — काहीही विचारा!",
  Gujarati:  "નમસ્તે! 👋 હું MuseAI સપોર્ટ. સ્ક્રિપ્ટ, વિઝ્યુઅલ, જિંગલ — કંઈ પણ પૂછો!",
  Punjabi:   "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! 👋 ਮੈਂ MuseAI ਸਪੋਰਟ ਹਾਂ। ਸਕ੍ਰਿਪਟ, ਵਿਜ਼ੁਅਲ, ਜਿੰਗਲ ਬਾਰੇ ਪੁੱਛੋ!",
  Urdu:      "السلام علیکم! 👋 میں MuseAI سپورٹ ہوں۔ اسکرپٹ، وژول، جنگل، کیمپین — کچھ بھی پوچھیں!",
}

const LABELS = {
  English:   { title:'Help Desk', support:'Support', chat:'💬 AI Support Chat', contact:'✉️ Contact Us', quick:'Quick Questions', placeholder:'Ask anything about MuseAI...', send:'Send →', name:'Your Name', email:'Email Address', subject:'Subject', message:'Message', sendMsg:'✦ Send Message', sent:'Message Sent!', sentSub:"We'll get back to you within 24 hours.", another:'Send Another', voiceLang:'Voice Language', micTitle:'Speak your question', micStop:'Stop listening' },
  Tamil:     { title:'உதவி மேசை', support:'ஆதரவு', chat:'💬 AI ஆதரவு அரட்டை', contact:'✉️ தொடர்பு கொள்ளுங்கள்', quick:'விரைவு கேள்விகள்', placeholder:'MuseAI பற்றி கேளுங்கள்...', send:'அனுப்பு →', name:'உங்கள் பெயர்', email:'மின்னஞ்சல்', subject:'தலைப்பு', message:'செய்தி', sendMsg:'✦ செய்தி அனுப்பு', sent:'செய்தி அனுப்பப்பட்டது!', sentSub:'24 மணி நேரத்தில் பதிலளிப்போம்.', another:'மீண்டும் அனுப்பு', voiceLang:'குரல் மொழி', micTitle:'பேசுங்கள்', micStop:'நிறுத்து' },
  Hindi:     { title:'हेल्प डेस्क', support:'सहायता', chat:'💬 AI सपोर्ट चैट', contact:'✉️ संपर्क करें', quick:'त्वरित प्रश्न', placeholder:'MuseAI के बारे में पूछें...', send:'भेजें →', name:'आपका नाम', email:'ईमेल', subject:'विषय', message:'संदेश', sendMsg:'✦ संदेश भेजें', sent:'संदेश भेजा गया!', sentSub:'24 घंटे में जवाब देंगे।', another:'दोबारा भेजें', voiceLang:'आवाज़ भाषा', micTitle:'बोलें', micStop:'रोकें' },
  Telugu:    { title:'హెల్ప్ డెస్క్', support:'మద్దతు', chat:'💬 AI సపోర్ట్ చాట్', contact:'✉️ సంప్రదించండి', quick:'త్వరిత ప్రశ్నలు', placeholder:'MuseAI గురించి అడగండి...', send:'పంపండి →', name:'మీ పేరు', email:'ఇమెయిల్', subject:'విషయం', message:'సందేశం', sendMsg:'✦ సందేశం పంపండి', sent:'సందేశం పంపబడింది!', sentSub:'24 గంటల్లో జవాబిస్తాము.', another:'మళ్ళీ పంపండి', voiceLang:'వాయిస్ భాష', micTitle:'మాట్లాడండి', micStop:'ఆపండి' },
  Malayalam: { title:'ഹെൽപ്പ് ഡെസ്ക്', support:'പിന്തുണ', chat:'💬 AI സപ്പോർട്ട് ചാറ്റ്', contact:'✉️ ബന്ധപ്പെടുക', quick:'ദ്രുത ചോദ്യങ്ങൾ', placeholder:'MuseAI-നെ കുറിച്ച് ചോദിക്കൂ...', send:'അയയ്ക്കുക →', name:'നിങ്ങളുടെ പേര്', email:'ഇമെയിൽ', subject:'വിഷയം', message:'സന്ദേശം', sendMsg:'✦ സന്ദേശം അയക്കുക', sent:'സന്ദേശം അയച്ചു!', sentSub:'24 മണിക്കൂറിനുള്ളിൽ മറുപടി നൽകാം.', another:'വീണ്ടും അയക്കുക', voiceLang:'വോയ്സ് ഭാഷ', micTitle:'സംസാരിക്കൂ', micStop:'നിർത്തുക' },
  Kannada:   { title:'ಸಹಾಯ ಮೇಜು', support:'ಬೆಂಬಲ', chat:'💬 ಬೆಂಬಲ ಚಾಟ್', contact:'✉️ ಸಂಪರ್ಕಿಸಿ', quick:'ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳು', placeholder:'MuseAI ಬಗ್ಗೆ ಕೇಳಿ...', send:'ಕಳಿಸಿ →', name:'ನಿಮ್ಮ ಹೆಸರು', email:'ಇಮೇಲ್', subject:'ವಿಷಯ', message:'ಸಂದೇಶ', sendMsg:'✦ ಸಂದೇಶ ಕಳಿಸಿ', sent:'ಸಂದೇಶ ಕಳಿಸಲಾಯಿತು!', sentSub:'24 ಗಂಟೆಯೊಳಗೆ ಉತ್ತರಿಸುತ್ತೇವೆ.', another:'ಮತ್ತೆ ಕಳಿಸಿ', voiceLang:'ಧ್ವನಿ ಭಾಷೆ', micTitle:'ಮಾತನಾಡಿ', micStop:'ನಿಲ್ಲಿಸಿ' },
  Bengali:   { title:'হেল্প ডেস্ক', support:'সহায়তা', chat:'💬 AI সাপোর্ট চ্যাট', contact:'✉️ যোগাযোগ করুন', quick:'দ্রুত প্রশ্ন', placeholder:'MuseAI সম্পর্কে জিজ্ঞাসা করুন...', send:'পাঠান →', name:'আপনার নাম', email:'ইমেইল', subject:'বিষয়', message:'বার্তা', sendMsg:'✦ বার্তা পাঠান', sent:'বার্তা পাঠানো হয়েছে!', sentSub:'২৪ ঘণ্টার মধ্যে উত্তর দেব।', another:'আবার পাঠান', voiceLang:'ভয়েস ভাষা', micTitle:'বলুন', micStop:'থামুন' },
  Marathi:   { title:'मदत डेस्क', support:'सहाय्य', chat:'💬 AI सपोर्ट चॅट', contact:'✉️ संपर्क करा', quick:'जलद प्रश्न', placeholder:'MuseAI बद्दल विचारा...', send:'पाठवा →', name:'तुमचे नाव', email:'ईमेल', subject:'विषय', message:'संदेश', sendMsg:'✦ संदेश पाठवा', sent:'संदेश पाठवला!', sentSub:'२४ तासांत उत्तर देऊ.', another:'पुन्हा पाठवा', voiceLang:'आवाज भाषा', micTitle:'बोला', micStop:'थांबा' },
  Gujarati:  { title:'મદદ ડેસ્ક', support:'સહાય', chat:'💬 AI સપોર્ટ ચેટ', contact:'✉️ સંપર્ક કરો', quick:'ઝડપી પ્રશ્નો', placeholder:'MuseAI વિશે પૂછો...', send:'મોકલો →', name:'તમારું નામ', email:'ઈમેઈલ', subject:'વિષય', message:'સંદેશ', sendMsg:'✦ સંદેશ મોકલો', sent:'સંદેશ મોકલ્યો!', sentSub:'24 કલાકમાં જવાબ આપીશું.', another:'ફરી મોકલો', voiceLang:'અવાજ ભાષા', micTitle:'બોલો', micStop:'રોકો' },
  Punjabi:   { title:'ਮਦਦ ਡੈਸਕ', support:'ਸਹਾਇਤਾ', chat:'💬 AI ਸਪੋਰਟ ਚੈਟ', contact:'✉️ ਸੰਪਰਕ ਕਰੋ', quick:'ਤੇਜ਼ ਸਵਾਲ', placeholder:'MuseAI ਬਾਰੇ ਪੁੱਛੋ...', send:'ਭੇਜੋ →', name:'ਤੁਹਾਡਾ ਨਾਮ', email:'ਈਮੇਲ', subject:'ਵਿਸ਼ਾ', message:'ਸੁਨੇਹਾ', sendMsg:'✦ ਸੁਨੇਹਾ ਭੇਜੋ', sent:'ਸੁਨੇਹਾ ਭੇਜਿਆ!', sentSub:'24 ਘੰਟਿਆਂ ਵਿੱਚ ਜਵਾਬ ਦੇਵਾਂਗੇ।', another:'ਦੁਬਾਰਾ ਭੇਜੋ', voiceLang:'ਆਵਾਜ਼ ਭਾਸ਼ਾ', micTitle:'ਬੋਲੋ', micStop:'ਰੋਕੋ' },
  Urdu:      { title:'ہیلپ ڈیسک', support:'مدد', chat:'💬 AI سپورٹ چیٹ', contact:'✉️ رابطہ کریں', quick:'فوری سوالات', placeholder:'MuseAI کے بارے میں پوچھیں...', send:'بھیجیں →', name:'آپ کا نام', email:'ای میل', subject:'موضوع', message:'پیغام', sendMsg:'✦ پیغام بھیجیں', sent:'پیغام بھیج دیا!', sentSub:'24 گھنٹوں میں جواب دیں گے۔', another:'دوبارہ بھیجیں', voiceLang:'آواز کی زبان', micTitle:'بولیں', micStop:'روکیں' },
}

const SMART_REPLIES = {
  English: [
    { k:['hello','hi','hey','hlo','hai','hii','vanakkam','namaste'], r:"Hello! 👋 I'm MuseAI Support. Ask me anything — scripts, visuals, jingles, campaigns, pricing, or troubleshooting!" },
    { k:['script','generate script','write script'], r:"To generate a script: Generate → 🎬 Script → Brand Name & Theme → Generate. You'll get 2 variations!" },
    { k:['visual','image','design','poster'], r:"For Visuals: Generate → 🖼️ Visual → Format, Style, Color Palette → Generate. Detailed layout descriptions!" },
    { k:['music','jingle','song','audio'], r:"For Jingles: Generate → 🎵 Music → Genre, Tempo, Vibe → Generate. Lyrics with arrangement notes!" },
    { k:['campaign','marketing','plan','strategy'], r:"Campaign mode: set Goal, Duration, Budget & Channels → weekly tactics, KPIs & channel strategy!" },
    { k:['language','languages','tamil','hindi','telugu','kannada','malayalam'], r:"MuseAI supports 11 Indian languages: English, Tamil, Hindi, Malayalam, Telugu, Kannada, Marathi, Bengali, Gujarati, Punjabi & Urdu!" },
    { k:['price','pricing','cost','plan','free','pro','agency','₹'], r:"Plans: Free (₹0, 10/month) | Pro (₹999/month, 100) | Agency (₹4999/month, unlimited)." },
    { k:['mic','speech','voice','speak','microphone'], r:"Speech input: click 🎤 in chat input, pick your language, and speak. Works best in Chrome!" },
    { k:['error','not working','problem','issue','bug'], r:"For issues: 1) Check backend is running. 2) Verify Gemini API key. 3) Refresh the page." },
    { k:['thank','thanks','ok','okay','great'], r:"You're welcome! 😊 Happy creating with MuseAI!" },
    { k:['bye','goodbye'], r:"Goodbye! 👋 Come back anytime!" },
  ],
  Tamil: [
    { k:['வணக்கம்','hello','hi','hai','hlo','namaste','vanakkam'], r:"வணக்கம்! 👋 நான் MuseAI ஆதரவு. ஸ்கிரிப்ட், விஷுவல், ஜிங்கில், கேம்பெயின் அல்லது விலை பற்றி கேளுங்கள்!" },
    { k:['script','ஸ்கிரிப்ட்','எழுது','உருவாக்கு'], r:"ஸ்கிரிப்ட்: Generate → 🎬 Script → Brand Name & Theme → Generate. 2 வேறுபாடுகள் கிடைக்கும்!" },
    { k:['visual','விஷுவல்','படம்','design','போஸ்டர்'], r:"விஷுவல்: Generate → 🖼️ Visual → Format, Style, Color → Generate. விரிவான விளக்கம் கிடைக்கும்!" },
    { k:['music','ஜிங்கில்','பாடல்','இசை'], r:"ஜிங்கில்: Generate → 🎵 Music → Genre, Tempo, Vibe → Generate. பாடல் வரிகளும் notes-உம் கிடைக்கும்!" },
    { k:['campaign','கேம்பெயின்','marketing','திட்டம்'], r:"Campaign: goal, duration, budget, channels → weekly tactics, KPI, channel strategy கிடைக்கும்!" },
    { k:['விலை','price','plan','free','pro','கட்டணம்'], r:"திட்டங்கள்: Free (₹0, 10/மாதம்) | Pro (₹999/மாதம், 100) | Agency (₹4999/மாதம், unlimited)." },
    { k:['மொழி','language','tamil','hindi','telugu'], r:"MuseAI 11 இந்திய மொழிகளை ஆதரிக்கிறது: தமிழ், இந்தி, தெலுங்கு, மலயாளம், கன்னடம் உள்பட!" },
    { k:['mic','மைக்','குரல்','speech','voice','பேசு'], r:"Generate பக்கத்தில் 🎤 கிளிக் செய்து தமிழில் பேசுங்கள். Chrome இல் சிறப்பாக செயல்படும்!" },
    { k:['நன்றி','thanks','ok','okay','சரி','நல்லது'], r:"நன்றி! 😊 MuseAI-ல் மகிழ்ச்சியாக உருவாக்குங்கள்!" },
    { k:['bye','goodbye','விடைபெறுகிறேன்'], r:"வணக்கம்! 👋 மீண்டும் வாருங்கள்!" },
    { k:['ஜெனரேட்','எப்படி','என்ன','கூறு','சொல்லு'], r:"நான் உதவ தயாராக இருக்கிறேன்! ஸ்கிரிப்ட், விஷுவல், இசை அல்லது கேம்பெயின் பற்றி கேளுங்கள். விலை திட்டங்களும் விவரிக்கலாம்!" },
  ],
  Hindi: [
    { k:['नमस्ते','hello','hi','hai','हेलो','नमस्कार'], r:"नमस्ते! 👋 मैं MuseAI सपोर्ट हूँ। स्क्रिप्ट, विजुअल, जिंगल, कैंपेन या कीमत — कुछ भी पूछें!" },
    { k:['script','स्क्रिप्ट','लिखो','बनाओ'], r:"स्क्रिप्ट: Generate → 🎬 Script → Brand Name & Theme → Generate. 2 वेरिएशन मिलेंगे!" },
    { k:['visual','विजुअल','इमेज','design','पोस्टर'], r:"विजुअल: Generate → 🖼️ Visual → Format, Style, Palette → Generate. विस्तृत विवरण मिलेगा!" },
    { k:['music','जिंगल','गाना','संगीत'], r:"जिंगल: Generate → 🎵 Music → Genre, Tempo, Vibe → Generate. बोल और notes मिलेंगे!" },
    { k:['campaign','कैंपेन','marketing','योजना'], r:"Campaign: Goal, Duration, Budget, Channels → weekly tactics, KPIs मिलेंगे!" },
    { k:['कीमत','price','plan','free','pro','दाम'], r:"प्लान: Free (₹0, 10/माह) | Pro (₹999/माह, 100) | Agency (₹4999/माह, unlimited)." },
    { k:['भाषा','language','hindi','tamil','telugu'], r:"MuseAI 11 भारतीय भाषाओं को support करता है: हिंदी, तमिल, तेलुगु, मलयालम, कन्नड़ सहित!" },
    { k:['mic','माइक','आवाज़','speech','बोलो'], r:"Generate पेज पर 🎤 दबाएं और हिंदी में बोलें। Chrome में सबसे अच्छा!" },
    { k:['धन्यवाद','thanks','ok','ठीक है','shukriya'], r:"धन्यवाद! 😊 MuseAI पर खुशी से बनाते रहें!" },
    { k:['bye','goodbye','alvida'], r:"अलविदा! 👋 फिर मिलेंगे!" },
  ],
  Telugu: [
    { k:['నమస్కారం','hello','hi','hai','నమస్తే'], r:"నమస్కారం! 👋 నేను MuseAI సపోర్ట్. స్క్రిప్ట్, విజువల్, జింగిల్, క్యాంపెయిన్ గురించి అడగండి!" },
    { k:['script','స్క్రిప్ట్','రాయండి'], r:"స్క్రిప్ట్: Generate → 🎬 Script → Brand Name & Theme → Generate. 2 వేరియంట్లు వస్తాయి!" },
    { k:['visual','విజువల్','చిత్రం','design'], r:"విజువల్: Generate → 🖼️ Visual → Format, Style, Palette → Generate. వివరణ వస్తుంది!" },
    { k:['music','జింగిల్','పాట','సంగీతం'], r:"జింగిల్: Generate → 🎵 Music → Genre, Tempo, Vibe → Generate. సాహిత్యం & notes వస్తాయి!" },
    { k:['campaign','క్యాంపెయిన్','marketing'], r:"Campaign: Goal, Budget, Channels → weekly tactics, KPIs వస్తాయి!" },
    { k:['ధర','price','plan','free','pro'], r:"ప్లాన్లు: Free (₹0, 10/నెల) | Pro (₹999/నెల, 100) | Agency (₹4999/నెల, unlimited)." },
    { k:['భాష','language','telugu','hindi','tamil'], r:"MuseAI 11 భారతీయ భాషలకు మద్దతు ఇస్తుంది!" },
    { k:['mic','మైక్','speech','voice','మాట్లాడండి'], r:"Generate పేజీలో 🎤 క్లిక్ చేసి తెలుగులో మాట్లాడండి!" },
    { k:['ధన్యవాదాలు','thanks','ok','సరే'], r:"ధన్యవాదాలు! 😊 MuseAI తో సృష్టించండి!" },
    { k:['bye','goodbye'], r:"వీడ్కోలు! 👋 మళ్ళీ రండి!" },
  ],
  Malayalam: [
    { k:['നമസ്കാരം','hello','hi','hai','വണക്കം'], r:"നമസ്കാരം! 👋 ഞാൻ MuseAI സപ്പോർട്ട്. സ്ക്രിപ്റ്റ്, വിഷ്വൽ, ജിംഗിൾ, ക്യാംപെയ്ൻ — ചോദിക്കൂ!" },
    { k:['script','സ്ക്രിപ്റ്റ്','എഴുതുക'], r:"സ്ക്രിപ്റ്റ്: Generate → 🎬 Script → Brand Name & Theme → Generate. 2 വേരിയന്റ് കിട്ടും!" },
    { k:['visual','വിഷ്വൽ','ചിത്രം','design'], r:"വിഷ്വൽ: Generate → 🖼️ Visual → Format, Style, Palette → Generate. വിശദ വിവരണം കിട്ടും!" },
    { k:['music','ജിംഗിൾ','പാട്ട്','സംഗീതം'], r:"ജിംഗിൾ: Generate → 🎵 Music → Genre, Tempo, Vibe → Generate. വരികളും notes-ഉം കിട്ടും!" },
    { k:['campaign','ക്യാംപെയ്ൻ','marketing'], r:"Campaign: Goal, Budget, Channels → weekly tactics, KPIs ലഭിക്കും!" },
    { k:['വില','price','plan','free','pro'], r:"പ്ലാൻ: Free (₹0, 10/മാസം) | Pro (₹999/മാസം, 100) | Agency (₹4999/മാസം, unlimited)." },
    { k:['ഭാഷ','language','malayalam','hindi','tamil'], r:"MuseAI 11 ഇന്ത്യൻ ഭാഷകൾ പിന്തുണക്കുന്നു!" },
    { k:['mic','speech','voice','മൈക്','സംസാരിക്കൂ'], r:"Generate പേജിൽ 🎤 അമർത്തി മലയാളത്തിൽ സംസാരിക്കൂ!" },
    { k:['നന്ദി','thanks','ok','ശരി'], r:"നന്ദി! 😊 MuseAI-ൽ ഹാപ്പിയായി സൃഷ്ടിക്കൂ!" },
    { k:['bye','goodbye'], r:"വിട! 👋 വീണ്ടും വരൂ!" },
  ],
  Kannada: [
    { k:['ನಮಸ್ಕಾರ','hello','hi','hai','ನಮಸ್ತೆ'], r:"ನಮಸ್ಕಾರ! 👋 ನಾನು MuseAI ಬೆಂಬಲ. ಸ್ಕ್ರಿಪ್ಟ್, ವಿಷುಯಲ್, ಜಿಂಗಲ್ ಬಗ್ಗೆ ಕೇಳಿ!" },
    { k:['script','ಸ್ಕ್ರಿಪ್ಟ್','ಬರೆಯಿರಿ'], r:"ಸ್ಕ್ರಿಪ್ಟ್: Generate → 🎬 Script → Brand Name & Theme → Generate. 2 ಆವೃತ್ತಿ ಸಿಗುತ್ತವೆ!" },
    { k:['visual','ವಿಷುಯಲ್','ಚಿತ್ರ','design'], r:"ವಿಷುಯಲ್: Generate → 🖼️ Visual → Format, Style, Palette → Generate. ವಿವರಣೆ ಸಿಗುತ್ತದೆ!" },
    { k:['music','ಜಿಂಗಲ್','ಹಾಡು','ಸಂಗೀತ'], r:"ಜಿಂಗಲ್: Generate → 🎵 Music → Genre, Tempo, Vibe → Generate. ಸಾಹಿತ್ಯ & notes ಸಿಗುತ್ತವೆ!" },
    { k:['campaign','ಕ್ಯಾಂಪೇನ್','marketing'], r:"Campaign: Goal, Budget, Channels → weekly tactics, KPIs ಸಿಗುತ್ತವೆ!" },
    { k:['ಬೆಲೆ','price','plan','free','pro'], r:"ಯೋಜನೆ: Free (₹0, 10/ತಿಂಗಳು) | Pro (₹999/ತಿಂಗಳು, 100) | Agency (₹4999/ತಿಂಗಳು, unlimited)." },
    { k:['ಭಾಷೆ','language','kannada','hindi','tamil'], r:"MuseAI 11 ಭಾರತೀಯ ಭಾಷೆಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ!" },
    { k:['mic','speech','voice','ಮೈಕ್','ಮಾತನಾಡಿ'], r:"Generate ಪುಟದಲ್ಲಿ 🎤 ಕ್ಲಿಕ್ ಮಾಡಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ!" },
    { k:['ಧನ್ಯವಾದ','thanks','ok','ಸರಿ'], r:"ಧನ್ಯವಾದಗಳು! 😊 MuseAI ನಲ್ಲಿ ಸಂತೋಷವಾಗಿ ರಚಿಸಿ!" },
    { k:['bye','goodbye'], r:"ವಿದಾಯ! 👋 ಮತ್ತೆ ಬನ್ನಿ!" },
  ],
}

const FALLBACKS = {
  English:"I'm not sure. Ask about scripts, visuals, music, campaigns, pricing, or use Contact Us! 😊",
  Tamil:"புரியவில்லை. ஸ்கிரிப்ட், விஷுவல், இசை பற்றி கேளுங்கள்! 😊",
  Hindi:"समझ नहीं आया। स्क्रिप्ट, विजुअल, म्यूजिक के बारे में पूछें! 😊",
  Telugu:"అర్థం కాలేదు. స్క్రిప్ట్, విజువల్ గురించి అడగండి! 😊",
  Malayalam:"മനസ്സിലായില്ല. സ്ക്രിപ്റ്റ്, വിഷ്വൽ ചോദിക്കൂ! 😊",
  Kannada:"ಅರ್ಥವಾಗಲಿಲ್ಲ. ಸ್ಕ್ರಿಪ್ಟ್, ವಿಷುಯಲ್ ಬಗ್ಗೆ ಕೇಳಿ! 😊",
  Bengali:"বুঝতে পারিনি। স্ক্রিপ্ট, ভিজ্যুয়াল সম্পর্কে জিজ্ঞেস করুন! 😊",
  Marathi:"समजले नाही। स्क्रिप्ट, व्हिज्युअल बद्दल विचारा! 😊",
  Gujarati:"સમજ ન પડ્યું. સ્ક્રિપ્ટ, વિઝ્યુઅલ વિશે પૂછો! 😊",
  Punjabi:"ਸਮਝ ਨਹੀਂ ਆਈ। ਸਕ੍ਰਿਪਟ, ਵਿਜ਼ੁਅਲ ਬਾਰੇ ਪੁੱਛੋ! 😊",
  Urdu:"سمجھ نہیں آیا۔ اسکرپٹ، وژول کے بارے میں پوچھیں! 😊",
}

function getSmartReply(msg, lang) {
  const lower = msg.toLowerCase()
  const list = SMART_REPLIES[lang] || SMART_REPLIES['English']
  for (const item of list) {
    if (item.k.some(k => lower.includes(k.toLowerCase()))) return item.r
  }
  return FALLBACKS[lang] || FALLBACKS['English']
}

const inputStyle = {
  width:'100%', padding:'0.6rem 0.9rem',
  border:'1.5px solid rgba(184,151,58,0.2)', borderRadius:'8px',
  fontSize:'0.85rem', fontFamily:'Jost, sans-serif',
  background:'#FAFAF8', color:'#2A2015', outline:'none',
}

export default function HelpDesk() {
  const { lang } = useLanguage()
  const L = LABELS[lang] || LABELS['English']

  const [tab, setTab]             = useState('chat')
  const [voiceLang, setVoiceLang] = useState(lang)
  const [listening, setListening] = useState(false)
  const recogRef                  = useRef(null)
  const messagesEndRef            = useRef(null)

  // ✅ KEY FIX: greeting updates when language changes
  const [messages, setMessages] = useState([
    { role: 'assistant', text: GREETINGS[lang] || GREETINGS['English'] }
  ])
  const [input, setInput]             = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [form, setForm]               = useState({ name:'', email:'', subject:'', message:'' })
  const [formSent, setFormSent]       = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  // ✅ KEY FIX: when language changes, update greeting and voice language
  useEffect(() => {
    setVoiceLang(lang)
    setMessages([{ role: 'assistant', text: GREETINGS[lang] || GREETINGS['English'] }])
  }, [lang])

  const toggleMic = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Please use Chrome.')
      return
    }
    if (listening) { recogRef.current?.stop(); setListening(false); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recog = new SR()
    recog.lang = SPEECH_LOCALES[voiceLang] || 'en-IN'
    recog.continuous = false
    recog.interimResults = false
    recog.onresult = e => { setInput(p => p ? p + ' ' + e.results[0][0].transcript : e.results[0][0].transcript); setListening(false) }
    recog.onerror = () => setListening(false)
    recog.onend   = () => setListening(false)
    recog.start()
    recogRef.current = recog
    setListening(true)
  }

  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role:'user', text:userMsg }])
    setChatLoading(true)

    // Try backend first with strict language instruction
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch('http://localhost:8000/chat', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: userMsg,
          // ✅ KEY FIX: very strict language instruction
          system: `You are MuseAI support bot. IMPORTANT: You MUST reply ONLY in ${lang} language. Do NOT use English if the language is not English. Reply in ${lang} script/characters only. Max 2-3 sentences. Key facts: Free=10gen/month, Pro=₹999/month 100gen, Agency=₹4999/month unlimited. Content types: Script, Visual, Music, Campaign.`
        })
      })
      clearTimeout(timeout)
      if (res.ok) {
        const data = await res.json()
        const txt = data.output || data.reply || data.message || null
        if (txt) {
          setMessages(prev => [...prev, { role:'assistant', text:txt }])
          setChatLoading(false)
          return
        }
      }
      throw new Error('no output')
    } catch {
      // ✅ KEY FIX: fallback smart reply in correct language
      await new Promise(r => setTimeout(r, 500))
      setMessages(prev => [...prev, { role:'assistant', text: getSmartReply(userMsg, lang) }])
    }
    setChatLoading(false)
  }

  async function handleContact() {
    setFormLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setFormSent(true)
    setFormLoading(false)
  }

  const card = { background:'#FFFFFF', border:'1px solid rgba(184,151,58,0.15)', borderRadius:'14px', boxShadow:'0 2px 12px rgba(100,80,20,0.06)' }

  return (
    <AppLayout>
      <div style={{ animation:'fadeIn 0.4s ease', maxWidth:'820px', margin:'0 auto' }}>

        <div style={{ marginBottom:'2rem' }}>
          <div style={{ fontSize:'0.7rem', color:'#B8973A', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'0.35rem', fontWeight:600 }}>
            {L.support}
          </div>
          <h1 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'2rem', fontWeight:600, color:'#1A1208' }}>
            {L.title.split(' ')[0]} <em style={{ color:'#B8973A' }}>{L.title.split(' ').slice(1).join(' ')}</em>
          </h1>
        </div>

        <div style={{ display:'flex', borderBottom:'1px solid rgba(184,151,58,0.15)', marginBottom:'1.5rem' }}>
          {[{ id:'chat', label:L.chat }, { id:'contact', label:L.contact }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'0.7rem 1.4rem', border:'none', background:'none', cursor:'pointer',
              fontSize:'0.85rem', fontWeight:500,
              color: tab === t.id ? '#B8973A' : '#8A8070',
              borderBottom: tab === t.id ? '2px solid #B8973A' : '2px solid transparent',
              marginBottom:'-1px', transition:'all 0.2s'
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'chat' && (
          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid rgba(184,151,58,0.12)', background:'rgba(184,151,58,0.03)' }}>
              <p style={{ fontSize:'0.68rem', color:'#8A8070', marginBottom:'0.5rem', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:600 }}>{L.quick}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                {(FAQS_ML[lang] || FAQS_ML['English']).map((f,i) => (
                  <button key={i} onClick={() => setMessages(prev => [...prev, { role:'user', text:f.q }, { role:'assistant', text:f.a }])}
                    style={{ padding:'0.3rem 0.75rem', border:'1px solid rgba(184,151,58,0.25)', borderRadius:'50px', background:'#FFFFFF', cursor:'pointer', fontSize:'0.75rem', color:'#5A4A2A', fontFamily:'Jost, sans-serif' }}>
                    {f.q}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height:'380px', overflowY:'auto', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.85rem', background:'#FDFCF9' }}>
              {messages.map((m,i) => (
                <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems:'flex-end', gap:'0.5rem' }}>
                  {m.role === 'assistant' && (
                    <div style={{ width:'28px', height:'28px', borderRadius:'50%', flexShrink:0, background:'rgba(184,151,58,0.12)', border:'1px solid rgba(184,151,58,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', color:'#B8973A', fontWeight:700 }}>✦</div>
                  )}
                  <div style={{
                    maxWidth:'72%', padding:'0.75rem 1rem', borderRadius:'14px',
                    background: m.role === 'user' ? 'linear-gradient(135deg, #B8973A, #9A7D2A)' : '#FFFFFF',
                    color: m.role === 'user' ? '#FFFFFF' : '#2A2015',
                    fontSize:'0.88rem', lineHeight:1.65,
                    border: m.role === 'assistant' ? '1px solid rgba(184,151,58,0.15)' : 'none',
                    boxShadow: m.role === 'assistant' ? '0 1px 6px rgba(100,80,20,0.08)' : 'none',
                    borderBottomRightRadius: m.role === 'user' ? 4 : 14,
                    borderBottomLeftRadius: m.role === 'assistant' ? 4 : 14,
                  }}>{m.text}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(184,151,58,0.12)', border:'1px solid rgba(184,151,58,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', color:'#B8973A', fontWeight:700 }}>✦</div>
                  <div style={{ padding:'0.75rem 1rem', borderRadius:'14px', borderBottomLeftRadius:4, background:'#FFFFFF', border:'1px solid rgba(184,151,58,0.15)', fontSize:'0.85rem', color:'#8A8070', display:'flex', gap:'0.3rem', alignItems:'center' }}>
                    <span style={{ animation:'pulse 1s infinite' }}>●</span>
                    <span style={{ animation:'pulse 1s infinite 0.2s' }}>●</span>
                    <span style={{ animation:'pulse 1s infinite 0.4s' }}>●</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding:'0.85rem 1.25rem', borderTop:'1px solid rgba(184,151,58,0.12)', background:'#FFFFFF' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.6rem', flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.65rem', color:'#8A8070', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>
                  🎤 {L.voiceLang}:
                </span>
                <select value={voiceLang} onChange={e => setVoiceLang(e.target.value)} style={{
                  padding:'0.2rem 0.5rem', border:'1px solid rgba(184,151,58,0.3)', borderRadius:'6px',
                  fontSize:'0.75rem', fontFamily:'Jost, sans-serif', background:'#FAFAF8', color:'#5A4A2A', cursor:'pointer',
                }}>
                  {ALL_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {listening && <span style={{ fontSize:'0.72rem', color:'#C0392B', fontWeight:600 }}>● {L.micTitle}...</span>}
              </div>
              <div style={{ display:'flex', gap:'0.6rem' }}>
                <div style={{ position:'relative', flex:1 }}>
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={L.placeholder} style={{ ...inputStyle, paddingRight:'2.8rem' }} />
                  <button onClick={toggleMic} title={listening ? L.micStop : L.micTitle} style={{
                    position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)',
                    background: listening ? 'rgba(192,57,43,0.1)' : 'rgba(184,151,58,0.08)',
                    border:`1px solid ${listening ? '#C0392B' : 'rgba(184,151,58,0.3)'}`,
                    borderRadius:'6px', padding:'4px 6px', cursor:'pointer', display:'flex', alignItems:'center', gap:'2px',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={listening ? '#C0392B' : '#8A8070'} strokeWidth="2">
                      <rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/>
                      <line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>
                    </svg>
                    {listening && <span style={{ fontSize:'7px', color:'#C0392B' }}>●</span>}
                  </button>
                </div>
                <button onClick={sendMessage} disabled={chatLoading} style={{
                  padding:'0.65rem 1.4rem', fontSize:'0.85rem', whiteSpace:'nowrap',
                  background:'linear-gradient(135deg, #B8973A, #9A7D2A)',
                  color:'#FFFFFF', border:'none', borderRadius:'8px',
                  cursor: chatLoading ? 'not-allowed' : 'pointer',
                  fontWeight:600, fontFamily:'Jost, sans-serif',
                  opacity: chatLoading ? 0.6 : 1, boxShadow:'0 3px 12px rgba(184,151,58,0.3)',
                }}>{L.send}</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'contact' && (
          <div style={{ ...card, padding:'2rem' }}>
            {formSent ? (
              <div style={{ textAlign:'center', padding:'2.5rem' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
                <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.5rem', color:'#1A1208', marginBottom:'0.5rem' }}>{L.sent}</h2>
                <p style={{ color:'#6A5A40', fontSize:'0.88rem' }}>{L.sentSub}</p>
                <button onClick={() => { setFormSent(false); setForm({ name:'', email:'', subject:'', message:'' }) }}
                  style={{ marginTop:'1.5rem', background:'#FAFAF8', border:'1px solid rgba(184,151,58,0.25)', color:'#6A5A40', padding:'0.6rem 1.5rem', borderRadius:'50px', cursor:'pointer', fontSize:'0.82rem', fontFamily:'Jost, sans-serif' }}>
                  {L.another}
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily:'Cormorant Garamond, serif', color:'#B8973A', marginBottom:'1.5rem', fontSize:'1.2rem' }}>
                  {L.contact.replace('✉️ ','')}
                </h2>
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                    {[['name','text','Your name'],['email','email','you@example.com']].map(([key,type,ph]) => (
                      <div key={key}>
                        <label style={{ fontSize:'0.68rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:'#8A8070', marginBottom:'0.35rem', display:'block' }}>{L[key]}</label>
                        <input type={type} value={form[key]} onChange={e => setForm(p => ({...p,[key]:e.target.value}))} placeholder={ph} style={inputStyle} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={{ fontSize:'0.68rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:'#8A8070', marginBottom:'0.35rem', display:'block' }}>{L.subject}</label>
                    <input value={form.subject} onChange={e => setForm(p => ({...p,subject:e.target.value}))} placeholder="e.g. Issue with generation" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize:'0.68rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:'#8A8070', marginBottom:'0.35rem', display:'block' }}>{L.message}</label>
                    <textarea rows={5} value={form.message} onChange={e => setForm(p => ({...p,message:e.target.value}))} placeholder="Describe your issue..." style={{ ...inputStyle, resize:'vertical' }} />
                  </div>
                  <button onClick={handleContact} disabled={formLoading || !form.name || !form.email || !form.message} style={{
                    padding:'0.9rem', fontSize:'0.88rem', background:'linear-gradient(135deg, #B8973A, #9A7D2A)',
                    color:'#FFFFFF', border:'none', borderRadius:'10px', fontWeight:700, fontFamily:'Jost, sans-serif',
                    cursor: formLoading || !form.name || !form.email || !form.message ? 'not-allowed' : 'pointer',
                    opacity: !form.name || !form.email || !form.message ? 0.5 : 1,
                    boxShadow:'0 4px 16px rgba(184,151,58,0.3)',
                  }}>
                    {formLoading ? '⏳ Sending...' : L.sendMsg}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </AppLayout>
  )
}