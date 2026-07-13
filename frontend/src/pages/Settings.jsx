import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useLanguage, APP_LANGUAGES } from '../context/LanguageContext'
import { logOut } from '../utils/firebase'
import ConfirmModal from '../components/ui/ConfirmModal'

const SETTINGS_LABELS = {
  English:   { defaults: 'Default Preferences', outputLang: 'Default Output Language', region: 'Default Region', tone: 'Default Tone', notifications: 'Notifications', notifDesc: 'Receive generation alerts', autoCopy: 'Auto Copy Output', autoCopyDesc: 'Automatically copy generated content', save: 'Save Settings', saved: '✓ Saved!', uiSection: 'App Language & Display', uiLangLabel: 'UI Language', uiLangDesc: 'Changes language across the entire app including sidebar', title: 'Settings' },
  Tamil:     { defaults: 'இயல்புநிலை விருப்பங்கள்', outputLang: 'வெளியீட்டு மொழி', region: 'பிராந்தியம்', tone: 'தொனி', notifications: 'அறிவிப்புகள்', notifDesc: 'உருவாக்கல் விழிப்பூட்டல்கள்', autoCopy: 'தானியங்கி நகல்', autoCopyDesc: 'உள்ளடக்கத்தை தானாக நகலெடு', save: 'சேமி', saved: '✓ சேமிக்கப்பட்டது!', uiSection: 'பயன்பாட்டு மொழி', uiLangLabel: 'UI மொழி', uiLangDesc: 'முழு பயன்பாட்டிலும் மொழியை மாற்றுகிறது', title: 'அமைப்புகள்' },
  Hindi:     { defaults: 'डिफ़ॉल्ट प्राथमिकताएं', outputLang: 'आउटपुट भाषा', region: 'क्षेत्र', tone: 'टोन', notifications: 'सूचनाएं', notifDesc: 'जनरेशन अलर्ट प्राप्त करें', autoCopy: 'ऑटो कॉपी', autoCopyDesc: 'सामग्री अपने आप कॉपी करें', save: 'सेव करें', saved: '✓ सेव हो गया!', uiSection: 'ऐप भाषा', uiLangLabel: 'UI भाषा', uiLangDesc: 'पूरे ऐप में भाषा बदलता है', title: 'सेटिंग्स' },
  Telugu:    { defaults: 'డిఫాల్ట్ ప్రాధాన్యతలు', outputLang: 'అవుట్‌పుట్ భాష', region: 'ప్రాంతం', tone: 'టోన్', notifications: 'నోటిఫికేషన్లు', notifDesc: 'జనరేషన్ అలర్ట్‌లు', autoCopy: 'ఆటో కాపీ', autoCopyDesc: 'కంటెంట్ ఆటోమేటిగా కాపీ', save: 'సేవ్ చేయి', saved: '✓ సేవ్ అయింది!', uiSection: 'యాప్ భాష', uiLangLabel: 'UI భాష', uiLangDesc: 'మొత్తం యాప్‌లో భాష మారుతుంది', title: 'సెట్టింగ్స్' },
  Malayalam: { defaults: 'സ്ഥിര മുൻഗണനകൾ', outputLang: 'ഔട്ട്പുട്ട് ഭാഷ', region: 'പ്രദേശം', tone: 'ടോൺ', notifications: 'അറിയിപ്പുകൾ', notifDesc: 'ജനറേഷൻ അലർട്ടുകൾ', autoCopy: 'ഓട്ടോ കോപ്പി', autoCopyDesc: 'ഉള്ളടക്കം സ്വയം കോപ്പി', save: 'സേവ് ചെയ്യുക', saved: '✓ സേവ് ആയി!', uiSection: 'ആപ്പ് ഭാഷ', uiLangLabel: 'UI ഭാഷ', uiLangDesc: 'മുഴുവൻ ആപ്പിലും ഭാഷ മാറുന്നു', title: 'ക്രമീകരണങ്ങൾ' },
  Kannada:   { defaults: 'ಡಿಫಾಲ್ಟ್ ಆದ್ಯತೆಗಳು', outputLang: 'ಔಟ್‌ಪುಟ್ ಭಾಷೆ', region: 'ಪ್ರದೇಶ', tone: 'ಟೋನ್', notifications: 'ಅಧಿಸೂಚನೆಗಳು', notifDesc: 'ಜನರೇಷನ್ ಎಚ್ಚರಿಕೆಗಳು', autoCopy: 'ಆಟೋ ಕಾಪಿ', autoCopyDesc: 'ವಿಷಯ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನಕಲು', save: 'ಉಳಿಸಿ', saved: '✓ ಉಳಿಸಲಾಗಿದೆ!', uiSection: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ', uiLangLabel: 'UI ಭಾಷೆ', uiLangDesc: 'ಇಡೀ ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ಭಾಷೆ ಬದಲಾಗುತ್ತದೆ', title: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
}

// Custom Translate SVG Icon (two speech bubbles with 文 and A)
function TranslateIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left bubble */}
      <rect x="2" y="3" width="24" height="22" rx="4"
        fill="rgba(184,151,58,0.12)" stroke="#B8973A" strokeWidth="2" />
      {/* Left bubble tail */}
      <path d="M8 25 L5 32 L14 25" fill="rgba(184,151,58,0.12)" stroke="#B8973A" strokeWidth="2" strokeLinejoin="round" />
      {/* 文 character - horizontal top */}
      <line x1="8" y1="10" x2="20" y2="10" stroke="#B8973A" strokeWidth="1.8" strokeLinecap="round" />
      {/* 文 vertical center */}
      <line x1="14" y1="8" x2="14" y2="20" stroke="#B8973A" strokeWidth="1.8" strokeLinecap="round" />
      {/* 文 left diagonal */}
      <line x1="9" y1="15" x2="14" y2="20" stroke="#B8973A" strokeWidth="1.8" strokeLinecap="round" />
      {/* 文 right diagonal */}
      <line x1="19" y1="15" x2="14" y2="20" stroke="#B8973A" strokeWidth="1.8" strokeLinecap="round" />

      {/* Right bubble */}
      <rect x="26" y="17" width="24" height="22" rx="4"
        fill="rgba(184,151,58,0.12)" stroke="#B8973A" strokeWidth="2" />
      {/* Right bubble tail */}
      <path d="M44 39 L47 46 L38 39" fill="rgba(184,151,58,0.12)" stroke="#B8973A" strokeWidth="2" strokeLinejoin="round" />
      {/* A character - left leg */}
      <line x1="33" y1="35" x2="38" y2="22" stroke="#B8973A" strokeWidth="1.8" strokeLinecap="round" />
      {/* A character - right leg */}
      <line x1="43" y1="35" x2="38" y2="22" stroke="#B8973A" strokeWidth="1.8" strokeLinecap="round" />
      {/* A character - crossbar */}
      <line x1="34.5" y1="30" x2="41.5" y2="30" stroke="#B8973A" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const TOGGLE_STYLE = (active) => ({
  width: '40px', height: '22px', borderRadius: '50px',
  background: active ? 'linear-gradient(135deg, #B8973A, #9A7D2A)' : 'rgba(184,151,58,0.15)',
  border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.25s',
  flexShrink: 0,
})

const KNOB_STYLE = (active) => ({
  position: 'absolute', top: '3px',
  left: active ? '20px' : '3px',
  width: '16px', height: '16px',
  borderRadius: '50%', background: active ? '#fff' : '#B8973A',
  transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
})

const card = {
  background: '#FFFFFF',
  border: '1px solid rgba(184,151,58,0.15)',
  borderRadius: '16px',
  padding: '1.5rem',
  marginBottom: '1.25rem',
  boxShadow: '0 2px 12px rgba(100,80,20,0.06)',
}

const labelStyle = {
  fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.1em', color: '#8A8070',
  marginBottom: '0.4rem', display: 'block',
}

const selectStyle = {
  width: '100%', padding: '0.65rem 0.95rem',
  border: '1.5px solid rgba(184,151,58,0.2)', borderRadius: '10px',
  background: '#FAFAF8', color: '#2A2015',
  fontFamily: 'Jost, sans-serif', fontSize: '0.88rem', outline: 'none',
  cursor: 'pointer', transition: 'border-color 0.2s',
}

const rowStyle = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', padding: '0.85rem 0',
  borderBottom: '1px solid rgba(184,151,58,0.08)',
}

export default function Settings() {
  const navigate = useNavigate()
  const { lang, setLang, labels } = useLanguage()
  const L = SETTINGS_LABELS[lang] || SETTINGS_LABELS.English

  const [settings, setSettings] = useState({
    defaultLanguage: 'English',
    defaultRegion: 'Pan-India',
    defaultTone: 'Emotional',
    notifications: true,
    autoCopy: false,
  })
  const [saved, setSaved] = useState(false)

  const set = k => e => setSettings(p => ({ ...p, [k]: e.target.value }))
  const toggle = k => setSettings(p => ({ ...p, [k]: !p[k] }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  const [signoutOpen, setSignoutOpen] = useState(false)
  const doSignOut = async () => {
    setSignoutOpen(false)
    try {
      await logOut()
    } catch (err) {
      console.error('Logout failed', err)
    }
    navigate('/login')
  }

  return (
    <AppLayout>
      <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: '600px' }}>

        {/* ── Fixed Title ── */}
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, marginBottom: '2rem', color: '#1A1208' }}>
          <em style={{ color: '#B8973A' }}>{L.title}</em>
        </h1>

        {/* ── UI Language Section ── */}
        <div style={{ ...card, border: '1.5px solid rgba(184,151,58,0.3)', background: 'linear-gradient(135deg, #FFFDF7, #FAFAF3)' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#5A4A2A', marginBottom: '0.4rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <TranslateIcon />
            {L.uiSection}
          </h3>
          <p style={{ color: '#8A8070', fontSize: '0.78rem', marginBottom: '1.1rem' }}>
            {L.uiLangDesc}
          </p>
          <div>
            <label style={labelStyle}>{L.uiLangLabel}</label>
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              style={{ ...selectStyle, border: '1.5px solid rgba(184,151,58,0.4)', fontWeight: 600, color: '#8A5E10' }}
            >
              {APP_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* ── Default Preferences ── */}
        <div style={card}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#5A4A2A', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
            {L.defaults}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>{L.outputLang}</label>
              <select value={settings.defaultLanguage} onChange={set('defaultLanguage')} style={selectStyle}>
                {['English','Tamil','Hindi','Malayalam','Telugu','Kannada','Bengali','Marathi','Gujarati','Punjabi','Urdu'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{L.region}</label>
              <select value={settings.defaultRegion} onChange={set('defaultRegion')} style={selectStyle}>
                {['Pan-India','Tamil Nadu','Maharashtra','Karnataka','Kerala','Andhra Pradesh','Gujarat','Punjab','West Bengal','Delhi/NCR'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{L.tone}</label>
              <select value={settings.defaultTone} onChange={set('defaultTone')} style={selectStyle}>
                {['Emotional','Fun','Bold','Professional'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Toggles ── */}
        <div style={card}>
          <div style={rowStyle}>
            <div>
              <div style={{ fontSize: '0.88rem', color: '#2A2015', fontWeight: 500 }}>{L.notifications}</div>
              <div style={{ fontSize: '0.75rem', color: '#8A8070', marginTop: '0.15rem' }}>{L.notifDesc}</div>
            </div>
            <button onClick={() => toggle('notifications')} style={TOGGLE_STYLE(settings.notifications)}>
              <div style={KNOB_STYLE(settings.notifications)} />
            </button>
          </div>
          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <div>
              <div style={{ fontSize: '0.88rem', color: '#2A2015', fontWeight: 500 }}>{L.autoCopy}</div>
              <div style={{ fontSize: '0.75rem', color: '#8A8070', marginTop: '0.15rem' }}>{L.autoCopyDesc}</div>
            </div>
            <button onClick={() => toggle('autoCopy')} style={TOGGLE_STYLE(settings.autoCopy)}>
              <div style={KNOB_STYLE(settings.autoCopy)} />
            </button>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} style={{
          width: '100%', padding: '0.9rem', fontSize: '0.95rem',
          background: saved ? 'linear-gradient(135deg, #6A9B6A, #4A7A4A)' : 'linear-gradient(135deg, #B8973A, #9A7D2A)',
          color: '#FFFFFF', border: 'none', borderRadius: '50px',
          cursor: 'pointer', fontWeight: 700, fontFamily: 'Jost, sans-serif',
          letterSpacing: '0.06em', boxShadow: '0 4px 16px rgba(184,151,58,0.3)',
          transition: 'all 0.3s',
        }}>
          {saved ? L.saved : L.save}
        </button>

        <button onClick={() => setSignoutOpen(true)} style={{
          marginTop: '0.75rem', width: '100%', padding: '0.7rem', fontSize: '0.92rem',
          background: 'transparent', color: '#C23A3A', border: '1px solid rgba(194,58,58,0.12)', borderRadius: '10px',
          cursor: 'pointer', fontWeight: 700, fontFamily: 'Jost, sans-serif'
        }}>{(labels && labels.signout) || 'Sign out'}</button>

        <ConfirmModal open={signoutOpen} title={(labels && labels.signout) || 'Sign out'} message={'Sign out of MuseAI?'} confirmLabel={(labels && labels.signout) || 'Sign out'} cancelLabel={'Cancel'} onConfirm={doSignOut} onCancel={() => setSignoutOpen(false)} />

      </div>
    </AppLayout>
  )
}