/**
 * AIHub — Studio landing page
 * src/pages/AIHub.jsx
 */
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useLanguage } from '../context/LanguageContext'

// Per-language hub content
const HUB_LABELS = {
  English:   { eyebrow: 'AI Creative Suite', heading: 'MuseAI', headingItalic: 'Studio', subtitle: 'Your all-in-one AI toolkit for Indian creators and founders — build a complete brand identity or generate viral-ready content in minutes.', brandTitle: 'Brand Strategy Advisor', brandDesc: 'Describe your startup idea and get a complete brand identity kit — names, logo concept, color palette, taglines, hashtags, content calendar, promotion strategy, and more. Built for India.', viralTitle: 'Viral Content Studio', viralDesc: 'Turn your topic into a complete viral content package — hooks, full scripts, scene-by-scene breakdowns, captions, music suggestions, editing tips, and platform growth insights.', brandBtn: 'Open Brand Advisor', viralBtn: 'Open Content Studio', footer: '🎤 Supports 11 Indian languages via voice · 📋 Copy & download every section · 🔄 Regenerate anytime' },
  Tamil:     { eyebrow: 'AI படைப்பு தொகுப்பு', heading: 'MuseAI', headingItalic: 'ஸ்டுடியோ', subtitle: 'இந்திய படைப்பாளர்கள் மற்றும் நிறுவனர்களுக்கான AI கருவி — முழுமையான பிராண்ட் அடையாளம் அல்லது வைரல் உள்ளடக்கம் நிமிடங்களில்.', brandTitle: 'பிராண்ட் உத்தி ஆலோசகர்', brandDesc: 'உங்கள் தொடக்க யோசனையை விவரிக்கவும், முழுமையான பிராண்ட் அடையாள தொகுப்பு பெறவும்.', viralTitle: 'வைரல் உள்ளடக்க ஸ்டுடியோ', viralDesc: 'உங்கள் தலைப்பை முழுமையான வைரல் உள்ளடக்க தொகுப்பாக மாற்றவும்.', brandBtn: 'பிராண்ட் ஆலோசகரைத் திறக்கவும்', viralBtn: 'உள்ளடக்க ஸ்டுடியோ திறக்கவும்', footer: '🎤 11 இந்திய மொழிகளை ஆதரிக்கிறது · 📋 ஒவ்வொரு பகுதியையும் நகலெடுக்கவும் · 🔄 எப்போது வேண்டுமானாலும் மீண்டும் உருவாக்கவும்' },
  Hindi:     { eyebrow: 'AI क्रिएटिव सूट', heading: 'MuseAI', headingItalic: 'स्टूडियो', subtitle: 'भारतीय क्रिएटर्स और फाउंडर्स के लिए AI टूलकिट — मिनटों में पूरी ब्रांड पहचान या वायरल कंटेंट बनाएं।', brandTitle: 'ब्रांड स्ट्रैटेजी एडवाइजर', brandDesc: 'अपना स्टार्टअप आइडिया बताएं और पूरा ब्रांड आइडेंटिटी किट पाएं।', viralTitle: 'वायरल कंटेंट स्टूडियो', viralDesc: 'अपने टॉपिक को पूरे वायरल कंटेंट पैकेज में बदलें।', brandBtn: 'ब्रांड एडवाइजर खोलें', viralBtn: 'कंटेंट स्टूडियो खोलें', footer: '🎤 11 भारतीय भाषाओं का समर्थन · 📋 हर सेक्शन कॉपी और डाउनलोड करें · 🔄 कभी भी पुनः जनरेट करें' },
  Telugu:    { eyebrow: 'AI క్రియేటివ్ సూట్', heading: 'MuseAI', headingItalic: 'స్టూడియో', subtitle: 'భారతీయ సృష్టికర్తలు మరియు వ్యవస్థాపకుల కోసం AI టూల్‌కిట్ — నిమిషాల్లో పూర్తి బ్రాండ్ గుర్తింపు లేదా వైరల్ కంటెంట్.', brandTitle: 'బ్రాండ్ స్ట్రాటజీ అడ్వైజర్', brandDesc: 'మీ స్టార్టప్ ఆలోచనను వివరించి పూర్తి బ్రాండ్ కిట్ పొందండి.', viralTitle: 'వైరల్ కంటెంట్ స్టూడియో', viralDesc: 'మీ అంశాన్ని పూర్తి వైరల్ కంటెంట్ ప్యాకేజీగా మార్చండి.', brandBtn: 'బ్రాండ్ అడ్వైజర్ తెరవండి', viralBtn: 'కంటెంట్ స్టూడియో తెరవండి', footer: '🎤 11 భారతీయ భాషలకు మద్దతు · 📋 ప్రతి విభాగం కాపీ & డౌన్‌లోడ్ · 🔄 ఎప్పుడైనా పునరుత్పత్తి' },
  Malayalam: { eyebrow: 'AI ക്രിയേറ്റീവ് സ്യൂട്ട്', heading: 'MuseAI', headingItalic: 'സ്റ്റുഡിയോ', subtitle: 'ഇന്ത്യൻ സ്രഷ്ടാക്കൾക്കും സ്ഥാപകർക്കുമുള്ള AI ടൂൾകിറ്റ് — മിനിറ്റുകൾക്കുള്ളിൽ ബ്രാൻഡ് ഐഡന്റിറ്റി അല്ലെങ്കിൽ വൈറൽ കണ്ടന്റ്.', brandTitle: 'ബ്രാൻഡ് സ്ട്രാറ്റജി അഡ്വൈസർ', brandDesc: 'നിങ്ങളുടെ ആശയം വിവരിക്കുക, പൂർണ്ണ ബ്രാൻഡ് കിറ്റ് നേടുക.', viralTitle: 'വൈറൽ കണ്ടന്റ് സ്റ്റുഡിയോ', viralDesc: 'നിങ്ങളുടെ വിഷയം പൂർണ്ണ വൈറൽ കണ്ടന്റ് പാക്കേജാക്കി മാറ്റുക.', brandBtn: 'ബ്രാൻഡ് അഡ്വൈസർ തുറക്കുക', viralBtn: 'കണ്ടന്റ് സ്റ്റുഡിയോ തുറക്കുക', footer: '🎤 11 ഇന്ത്യൻ ഭാഷകൾ · 📋 ഓരോ വിഭാഗവും പകർത്തുക · 🔄 എപ്പോൾ വേണമെങ്കിലും' },
  Kannada:   { eyebrow: 'AI ಕ್ರಿಯೇಟಿವ್ ಸೂಟ್', heading: 'MuseAI', headingItalic: 'ಸ್ಟುಡಿಯೋ', subtitle: 'ಭಾರತೀಯ ಸೃಷ್ಟಿಕರ್ತರು ಮತ್ತು ಸ್ಥಾಪಕರಿಗೆ AI ಟೂಲ್‌ಕಿಟ್ — ನಿಮಿಷಗಳಲ್ಲಿ ಬ್ರಾಂಡ್ ಗುರುತು ಅಥವಾ ವೈರಲ್ ಕಂಟೆಂಟ್.', brandTitle: 'ಬ್ರಾಂಡ್ ಸ್ಟ್ರಾಟಜಿ ಅಡ್ವೈಸರ್', brandDesc: 'ನಿಮ್ಮ ಆಲೋಚನೆ ವಿವರಿಸಿ ಪೂರ್ಣ ಬ್ರಾಂಡ್ ಕಿಟ್ ಪಡೆಯಿರಿ.', viralTitle: 'ವೈರಲ್ ಕಂಟೆಂಟ್ ಸ್ಟುಡಿಯೋ', viralDesc: 'ನಿಮ್ಮ ವಿಷಯವನ್ನು ಪೂರ್ಣ ವೈರಲ್ ಕಂಟೆಂಟ್ ಪ್ಯಾಕೇಜ್ ಆಗಿ ಮಾರ್ಪಡಿಸಿ.', brandBtn: 'ಬ್ರಾಂಡ್ ಅಡ್ವೈಸರ್ ತೆರೆಯಿರಿ', viralBtn: 'ಕಂಟೆಂಟ್ ಸ್ಟುಡಿಯೋ ತೆರೆಯಿರಿ', footer: '🎤 11 ಭಾರತೀಯ ಭಾಷೆಗಳು · 📋 ಪ್ರತಿ ವಿಭಾಗ ನಕಲಿಸಿ · 🔄 ಯಾವಾಗ ಬೇಕಾದರೂ ಮರು-ರಚಿಸಿ' },
}

const BRAND_TAGS = ['Brand Names', 'Logo Concept', 'Color Palette', 'Hashtags', 'Content Calendar', 'USP Statement', 'Competitor Analysis']
const VIRAL_TAGS = ['Viral Hooks', 'Full Scripts', 'Scene Breakdown', 'Captions', 'Music Tips', 'Growth Insights']

function HubCard({ icon, title, description, tags, color, buttonLabel, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-surface)', borderRadius: '20px',
        border: `1px solid ${color}28`, borderTop: `3px solid ${color}`,
        padding: '2rem', cursor: 'pointer',
        transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: `0 4px 24px ${color}10`,
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${color}25`; e.currentTarget.style.borderColor = `${color}50` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 24px ${color}10`; e.currentTarget.style.borderColor = `${color}28` }}
    >
      <div style={{ width: '58px', height: '58px', borderRadius: '16px', background: `${color}14`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.65rem', marginBottom: '1.35rem', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) rotate(6deg)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
      >{icon}</div>

      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.7rem', lineHeight: 1.2 }}>{title}</h2>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.5rem', flex: 1, fontFamily: 'Jost, sans-serif' }}>{description}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.85rem' }}>
        {tags.map(t => (
          <span key={t} style={{ fontSize: '0.7rem', padding: '3px 11px', borderRadius: '50px', border: `1px solid ${color}35`, color, background: `${color}0d`, fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>{t}</span>
        ))}
      </div>

      <button
        onClick={e => { e.stopPropagation(); onClick() }}
        style={{ width: '100%', padding: '0.95rem', borderRadius: '12px', background: `linear-gradient(135deg, ${color}, ${color}bb)`, border: 'none', color: '#FFFFFF', fontFamily: 'Jost, sans-serif', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.07em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: `0 6px 20px ${color}38`, transition: 'all 0.2s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = `0 10px 28px ${color}50` }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 6px 20px ${color}38` }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1.02)'}
      >
        {buttonLabel} <span style={{ fontSize: '1.05rem' }}>→</span>
      </button>
    </div>
  )
}

export default function AIHub() {
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const t = HUB_LABELS[lang] || HUB_LABELS.English

  return (
    <AppLayout>
      <div style={{ animation: 'hubIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both', maxWidth: '920px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: '50px', padding: '0.3rem 1rem', marginBottom: '1.1rem' }}>
            <span style={{ fontSize: '0.63rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>✦ {t.eyebrow}</span>
          </div>

          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '1rem' }}>
            {t.heading}{' '}<em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{t.headingItalic}</em>
          </h1>

          <p style={{ fontFamily: 'Jost, sans-serif', color: 'var(--text-soft)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.75 }}>
            {t.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <HubCard
            icon="🏷️" title={t.brandTitle} description={t.brandDesc}
            tags={BRAND_TAGS} color="#B8973A" buttonLabel={t.brandBtn}
            onClick={() => navigate('/ai-suggestion/brand')}
          />
          <HubCard
            icon="🎬" title={t.viralTitle} description={t.viralDesc}
            tags={VIRAL_TAGS} color="#E07B5A" buttonLabel={t.viralBtn}
            onClick={() => navigate('/ai-suggestion/viral')}
          />
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            {t.footer}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes hubIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
      `}</style>
    </AppLayout>
  )
}