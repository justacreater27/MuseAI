import { useState, useRef } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { useGenerate } from '../hooks/useGenerate'
import { useLanguage } from '../context/LanguageContext'

function ScriptIcon({ active }) {
  const c = active ? '#B8973A' : '#A09080'
  return (<svg width="32" height="32" viewBox="0 0 36 36" fill="none"><rect x="6" y="4" width="24" height="28" rx="3" fill={active ? 'rgba(184,151,58,0.15)' : 'rgba(160,144,128,0.08)'} stroke={c} strokeWidth="1.5">{active && <animate attributeName="stroke-opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />}</rect>{[11,16,21].map((y,i)=>(<line key={y} x1="11" y1={y} x2={i===2?20:25} y2={y} stroke={c} strokeWidth="1.5" strokeLinecap="round">{active && <animate attributeName="x2" values={`${i===2?20:25};${i===2?25:20};${i===2?20:25}`} dur={`${1.2+i*0.2}s`} repeatCount="indefinite" />}</line>))}</svg>)
}
function VisualIcon({ active }) {
  const c = active ? '#4A9B9B' : '#A09080'
  return (<svg width="32" height="32" viewBox="0 0 36 36" fill="none"><rect x="4" y="7" width="28" height="22" rx="3" fill={active ? 'rgba(74,155,155,0.12)' : 'rgba(160,144,128,0.08)'} stroke={c} strokeWidth="1.5" /><circle cx="13" cy="14" r="3" fill={c}>{active && <animate attributeName="r" values="3;4;3" dur="1.5s" repeatCount="indefinite" />}</circle><path d="M4 22 L11 16 L17 20 L23 14 L32 22" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>)
}
function MusicIcon({ active }) {
  const c = active ? '#8BAF8D' : '#A09080'
  const bars = [{x:8,h:10},{x:13,h:18},{x:18,h:14},{x:23,h:20},{x:28,h:8}]
  return (<svg width="32" height="32" viewBox="0 0 36 36" fill="none">{bars.map((b,i)=>(<rect key={i} x={b.x} y={30-b.h} width="3.5" height={b.h} rx="2" fill={c}>{active && <animate attributeName="height" values={`${b.h};${b.h*0.4};${b.h}`} dur="0.8s" begin={`${i*0.15}s`} repeatCount="indefinite" />}{active && <animate attributeName="y" values={`${30-b.h};${30-b.h*0.4};${30-b.h}`} dur="0.8s" begin={`${i*0.15}s`} repeatCount="indefinite" />}</rect>))}</svg>)
}
function CampaignIcon({ active }) {
  const c = active ? '#7A9EC5' : '#A09080'
  return (<svg width="32" height="32" viewBox="0 0 36 36" fill="none"><path d="M8 14 L22 9 L22 27 L8 22 Z" fill={active ? 'rgba(122,158,197,0.18)' : 'rgba(160,144,128,0.08)'} stroke={c} strokeWidth="1.5">{active && <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />}</path><rect x="4" y="14" width="5" height="8" rx="1" fill={c} /><path d="M8 22 L10 30" stroke={c} strokeWidth="1.5" strokeLinecap="round" />{active && [0,1,2].map(i=>(<circle key={i} cx="28" cy="18" r={4+i*4} fill="none" stroke={c} strokeWidth="1" strokeOpacity="0.35"><animate attributeName="r" values={`${4+i*4};${8+i*4};${4+i*4}`} dur="1.5s" begin={`${i*0.3}s`} repeatCount="indefinite" /><animate attributeName="stroke-opacity" values="0.35;0;0.35" dur="1.5s" begin={`${i*0.3}s`} repeatCount="indefinite" /></circle>))}</svg>)
}

const ICONS = { script: ScriptIcon, visual: VisualIcon, music: MusicIcon, campaign: CampaignIcon }

function MicBtn({ onResult, color = '#B8973A' }) {
  const [listening, setListening] = useState(false)
  const recogRef = useRef(null)
  const toggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { alert('Speech recognition not supported. Please use Chrome.'); return }
    if (listening) { recogRef.current?.stop(); setListening(false); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recog = new SR()
    recog.lang = 'en-IN'
    recog.onresult = e => { onResult(e.results[0][0].transcript); setListening(false) }
    recog.onerror = () => setListening(false)
    recog.onend = () => setListening(false)
    recog.start(); recogRef.current = recog; setListening(true)
  }
  return (
    <button onClick={toggle} title={listening ? 'Stop' : 'Speak'} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: listening ? `${color}22` : 'transparent', border: `1px solid ${listening ? color : 'rgba(184,151,58,0.2)'}`, borderRadius: '6px', padding: '3px 5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', transition: 'all 0.2s' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={listening ? color : '#8A8070'} strokeWidth="2"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" /></svg>
      {listening && <span style={{ fontSize: '7px', color }}>●</span>}
    </button>
  )
}

function Field({ label, value, onChange, placeholder, as = 'input', rows = 3, options, color = '#B8973A' }) {
  const handleMic = text => onChange({ target: { value: text } })
  const inputStyle = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid rgba(184,151,58,0.2)', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'Jost, sans-serif', background: '#FAFAF8', color: '#2A2015', outline: 'none', transition: 'border-color 0.2s' }
  return (
    <div>
      <label style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A8070', marginBottom: '0.35rem', display: 'block' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {options ? (
          <select value={value} onChange={onChange} style={{ ...inputStyle, paddingRight: '2rem', cursor: 'pointer' }}>{options.map(o => <option key={o}>{o}</option>)}</select>
        ) : as === 'textarea' ? (
          <><textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange} style={{ ...inputStyle, resize: 'vertical', paddingRight: '2.5rem' }} /><div style={{ position: 'absolute', right: '8px', top: '10px' }}><MicBtn onResult={handleMic} color={color} /></div></>
        ) : (
          <><input placeholder={placeholder} value={value} onChange={onChange} style={{ ...inputStyle, paddingRight: '2.5rem' }} /><MicBtn onResult={handleMic} color={color} /></>
        )}
      </div>
    </div>
  )
}

const TONES = ['Emotional', 'Fun', 'Bold', 'Professional']
const CONTENT_TYPES = [
  { id: 'script',   labelKey: 'script',   color: '#B8973A', border: 'rgba(184,151,58,0.4)', bg: 'rgba(184,151,58,0.08)' },
  { id: 'visual',   labelKey: 'visual',   color: '#4A9B9B', border: 'rgba(74,155,155,0.4)',  bg: 'rgba(74,155,155,0.08)'  },
  { id: 'music',    labelKey: 'music',    color: '#8BAF8D', border: 'rgba(139,175,141,0.4)', bg: 'rgba(139,175,141,0.08)' },
  { id: 'campaign', labelKey: 'campaign', color: '#7A9EC5', border: 'rgba(122,158,197,0.4)', bg: 'rgba(122,158,197,0.08)' },
]
const REGIONS = ['Pan-India','Tamil Nadu','Kerala','Karnataka','Telangana','Andhra Pradesh','Maharashtra','Gujarat','Punjab','West Bengal','Delhi/NCR','North India']
const FESTIVALS = ['None / Everyday','Pongal','Diwali','Ramzan/Eid','Onam','Navratri/Durga Puja','Ganesh Chaturthi','Christmas (India)','Wedding season','Monsoon season']
const ELEMENTS = ['Local street market','Tea stall','Auto-rickshaw','College campus','Joint family home','Temple festival vibe','Local food','Indian wedding vibe','Cricket moment','Festival decorations']
const LANGUAGES = ['English','Tamil','Hindi','Telugu','Malayalam','Kannada','Bengali','Marathi','Gujarati','Punjabi','Urdu']
const DD = {
  platform: ['YouTube','Instagram Reels','Facebook','TV','OTT (Hotstar)','Twitter/X'],
  duration: ['15 seconds','30 seconds','45 seconds','60 seconds','2 minutes'],
  style: ['Storytelling','Comedy','Emotional','Documentary','Animation'],
  structure: ['Problem → Solution → CTA','Hook → Story → Offer','Feature → Benefit → CTA'],
  format: ['Instagram Post (1:1)','Instagram Story (9:16)','Facebook Banner','Billboard','YouTube Thumbnail'],
  vstyle: ['Vibrant & Bold','Minimal & Clean','Festive & Traditional','Modern & Sleek'],
  length: ['15 seconds','30 seconds','60 seconds','90 seconds'],
  genre: ['Carnatic Fusion','Bollywood','Folk','Classical','Hip-hop / Urban','Jazz'],
  tempo: ['Slow (60–80 BPM)','Medium (80–110 BPM)','Fast (110–140 BPM)'],
  vibe: ['Joyful & Celebratory','Nostalgic','Energetic','Calm & Soulful','Patriotic'],
  goal: ['Brand Awareness','Lead Generation','Sales Conversion','App Downloads','Footfall'],
  dur4w: ['1 week','2 weeks','4 weeks','3 months','6 months'],
  budget: ['Under ₹1 Lakh','₹1–5 Lakhs','₹5–10 Lakhs','₹10–25 Lakhs','₹25 Lakhs+'],
  channels: ['Instagram + YouTube','Facebook + WhatsApp','TV + Digital','Pan-Channel (All)'],
  variants: ['1','2','3'],
}
const DEFAULT_OPTIONS = {
  script:   { platform: 'YouTube', duration: '30 seconds', style: 'Storytelling', structure: 'Problem → Solution → CTA', characters: 'Young urban Indian couple', setting: 'City neighbourhood', cta: 'Download the app now', variants: '2', draft: '' },
  visual:   { format: 'Instagram Post (1:1)', style: 'Vibrant & Bold', palette: 'Saffron, deep green, gold', setting: 'Festival street', key_elements: 'Brand logo, product, cultural motif', variants: '2' },
  music:    { length: '30 seconds', genre: 'Carnatic Fusion', tempo: 'Medium (80–110 BPM)', vibe: 'Joyful & Celebratory', instruments: 'Tabla, veena, acoustic guitar', variants: '2' },
  campaign: { goal: 'Brand Awareness', duration: '4 weeks', budget: '₹5–10 Lakhs', channels: 'Instagram + YouTube', geography: 'Pan-India', festival: 'Diwali', variants: '1' },
}
const card = { background: '#FFFFFF', border: '1px solid rgba(184,151,58,0.15)', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(100,80,20,0.06)' }

function renderBoldText(text) {
  if (!text) return null

  const lines = text.split('\n')

  return lines.map((line, lineIndex) => {
    const parts = []
    const boldPattern = /\*\*([^*]+)\*\*/g
    let lastIndex = 0
    let match

    while ((match = boldPattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index))
      }

      parts.push(<strong key={`${lineIndex}-${match.index}`}>{match[1]}</strong>)
      lastIndex = boldPattern.lastIndex
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }

    return (
      <span key={lineIndex}>
        {parts}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </span>
    )
  })
}

function downloadTxt(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function Generate() {
  const { labels } = useLanguage()
  const [brand, setBrand] = useState({ brand: '', industry: '', audience: '', tone: 'Emotional', theme: '', output_language: 'English' })
  const [culture, setCulture] = useState({ region: 'Pan-India', festival: 'None / Everyday', elements: [], language_style: 'Casual' })
  const [ct, setCt] = useState('script')
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const [hovered, setHovered] = useState(null)
  const [copied, setCopied] = useState(false)
  const { output, loading, error, generate } = useGenerate()

  const setB = k => e => setBrand(p => ({ ...p, [k]: e.target.value }))
  const setC = k => e => setCulture(p => ({ ...p, [k]: e.target.value }))
  const setO = k => e => setOptions(p => ({ ...p, [ct]: { ...p[ct], [k]: e.target.value } }))
  const o = options[ct]
  const AT = CONTENT_TYPES.find(c => c.id === ct)
  const ATlabel = labels[AT.labelKey] || AT.labelKey

  const toggleEl = el => {
    const curr = culture.elements
    setCulture(p => ({ ...p, elements: curr.includes(el) ? curr.filter(e => e !== el) : [...curr, el] }))
  }

  const handleSubmit = () => {
    if (!brand.brand || !brand.theme) { alert('Please fill in Brand Name and Theme.'); return }
    generate({ brand_info: brand, culture: { ...culture, elements: culture.elements.length ? culture.elements : ['Everyday Indian life'] }, content_type: ct, [`${ct}_options`]: options[ct] })
  }

  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const handleDownload = () => { const brandName = brand.brand.replace(/\s+/g, '_') || 'output'; downloadTxt(output, `MuseAI_${brandName}_${ct}_${Date.now()}.txt`) }

  const selectStyle = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid rgba(184,151,58,0.2)', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'Jost, sans-serif', background: '#FAFAF8', color: '#2A2015', cursor: 'pointer' }
  const sectionTitle = (color) => ({ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 600, color: color || '#B8973A', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' })

  return (
    <AppLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 600, color: '#1A1208' }}>
            {labels.generateTitle} <em style={{ color: '#B8973A' }}>{labels.generateItalic}</em>
          </h1>
          <p style={{ color: '#8A8070', fontSize: '0.85rem', marginTop: '0.3rem' }}>{labels.generateDesc}</p>
        </div>

        {/* Content Type Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.85rem', marginBottom: '1.75rem' }}>
          {CONTENT_TYPES.map(({ id, labelKey, color, border, bg }) => {
            const Icon = ICONS[id]; const isActive = ct === id; const isHov = hovered === id
            return (
              <button key={id} onClick={() => setCt(id)} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)} style={{ padding: '1rem 0.5rem 0.85rem', borderRadius: '14px', cursor: 'pointer', border: isActive ? `2px solid ${color}` : `1px solid ${isHov ? color+'66' : 'rgba(184,151,58,0.15)'}`, background: isActive ? bg : isHov ? bg+'80' : '#FFFFFF', textAlign: 'center', transition: 'all 0.22s', boxShadow: isActive ? `0 4px 18px ${color}25` : '0 1px 4px rgba(100,80,20,0.06)', transform: isActive ? 'translateY(-2px)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.45rem' }}><Icon active={isActive || isHov} /></div>
                <div style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, color: isActive ? color : '#6A5A40', letterSpacing: '0.04em' }}>{labels[labelKey] || labelKey}</div>
                {isActive && <div style={{ width: '20px', height: '2px', background: color, borderRadius: '2px', margin: '0.35rem auto 0' }} />}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Brand */}
            <div style={card}>
              <div style={sectionTitle()}>{labels.brandDetails}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label={labels.brandName} value={brand.brand} onChange={setB('brand')} placeholder="e.g. Amul, Zomato" />
                  <Field label={labels.industry} value={brand.industry} onChange={setB('industry')} placeholder="e.g. FMCG, FinTech" />
                  <Field label={labels.targetAudience} value={brand.audience} onChange={setB('audience')} placeholder="Urban youth 18-28" />
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A8070', marginBottom: '0.35rem', display: 'block' }}>{labels.tone}</label>
                    <select value={brand.tone} onChange={setB('tone')} style={selectStyle}>{TONES.map(t => <option key={t}>{t}</option>)}</select>
                  </div>
                </div>
                <Field label={labels.themeMsg} value={brand.theme} onChange={setB('theme')} placeholder="e.g. India celebrates togetherness" />
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A8070', marginBottom: '0.35rem', display: 'block' }}>{labels.outputLang}</label>
                  <select value={brand.output_language} onChange={setB('output_language')} style={selectStyle}>{LANGUAGES.map(l => <option key={l}>{l}</option>)}</select>
                </div>
              </div>
            </div>

            {/* Culture */}
            <div style={card}>
              <div style={sectionTitle('#5A8A6A')}>{labels.cultureProfile}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div><label style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A8070', marginBottom: '0.35rem', display: 'block' }}>{labels.region}</label><select value={culture.region} onChange={setC('region')} style={selectStyle}>{REGIONS.map(r => <option key={r}>{r}</option>)}</select></div>
                <div><label style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A8070', marginBottom: '0.35rem', display: 'block' }}>{labels.festival}</label><select value={culture.festival} onChange={setC('festival')} style={selectStyle}>{FESTIVALS.map(f => <option key={f}>{f}</option>)}</select></div>
              </div>
              <label style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A8070', marginBottom: '0.5rem', display: 'block' }}>{labels.culturalElements}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {ELEMENTS.map(el => { const active = culture.elements.includes(el); return (<button key={el} onClick={() => toggleEl(el)} style={{ padding: '0.3rem 0.85rem', borderRadius: '50px', cursor: 'pointer', border: active ? '1.5px solid #5A8A6A' : '1px solid rgba(184,151,58,0.25)', background: active ? 'rgba(90,138,106,0.12)' : '#FAFAF8', color: active ? '#3A6A4A' : '#6A5A40', fontSize: '0.78rem', fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}>{el}</button>) })}
              </div>
              {culture.elements.length > 0 && <p style={{ fontSize: '0.72rem', color: '#5A8A6A', marginTop: '0.6rem', fontWeight: 600 }}>{culture.elements.length} {labels.elementsSelected}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ ...card, borderTop: `3px solid ${AT.color}` }}>
              <div style={sectionTitle(AT.color)}>{ct === 'script' ? '🎬' : ct === 'visual' ? '🖼️' : ct === 'music' ? '🎵' : '📣'} {ATlabel} Options</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {ct === 'script' && <><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Platform" value={o.platform} onChange={setO('platform')} options={DD.platform} color={AT.color} />
                  <Field label="Duration" value={o.duration} onChange={setO('duration')} options={DD.duration} color={AT.color} />
                  <Field label="Style" value={o.style} onChange={setO('style')} options={DD.style} color={AT.color} />
                  <Field label="Structure" value={o.structure} onChange={setO('structure')} options={DD.structure} color={AT.color} />
                  <Field label="Characters" value={o.characters} onChange={setO('characters')} placeholder="Young Indian couple" color={AT.color} />
                  <Field label="Setting" value={o.setting} onChange={setO('setting')} placeholder="City neighbourhood" color={AT.color} />
                  <Field label="CTA" value={o.cta} onChange={setO('cta')} placeholder="Download the app now" color={AT.color} />
                  <Field label="Variants" value={o.variants} onChange={setO('variants')} options={DD.variants} color={AT.color} />
                </div><Field label="Existing Draft (optional)" value={o.draft} onChange={setO('draft')} placeholder="Paste a draft here, or leave blank" as="textarea" rows={3} color={AT.color} /></>}
                {ct === 'visual' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Format" value={o.format} onChange={setO('format')} options={DD.format} color={AT.color} />
                  <Field label="Visual Style" value={o.style} onChange={setO('style')} options={DD.vstyle} color={AT.color} />
                  <Field label="Color Palette" value={o.palette} onChange={setO('palette')} placeholder="Saffron, deep green, gold" color={AT.color} />
                  <Field label="Setting" value={o.setting} onChange={setO('setting')} placeholder="Festival street" color={AT.color} />
                  <Field label="Key Elements" value={o.key_elements} onChange={setO('key_elements')} placeholder="Brand logo, product" color={AT.color} />
                  <Field label="Variants" value={o.variants} onChange={setO('variants')} options={DD.variants} color={AT.color} />
                </div>}
                {ct === 'music' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Length" value={o.length} onChange={setO('length')} options={DD.length} color={AT.color} />
                  <Field label="Genre" value={o.genre} onChange={setO('genre')} options={DD.genre} color={AT.color} />
                  <Field label="Tempo" value={o.tempo} onChange={setO('tempo')} options={DD.tempo} color={AT.color} />
                  <Field label="Vibe" value={o.vibe} onChange={setO('vibe')} options={DD.vibe} color={AT.color} />
                  <Field label="Instruments" value={o.instruments} onChange={setO('instruments')} placeholder="Tabla, veena, guitar" color={AT.color} />
                  <Field label="Variants" value={o.variants} onChange={setO('variants')} options={DD.variants} color={AT.color} />
                </div>}
                {ct === 'campaign' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Goal" value={o.goal} onChange={setO('goal')} options={DD.goal} color={AT.color} />
                  <Field label="Duration" value={o.duration} onChange={setO('duration')} options={DD.dur4w} color={AT.color} />
                  <Field label="Budget" value={o.budget} onChange={setO('budget')} options={DD.budget} color={AT.color} />
                  <Field label="Channels" value={o.channels} onChange={setO('channels')} options={DD.channels} color={AT.color} />
                  <Field label="Geography" value={o.geography} onChange={setO('geography')} placeholder="Pan-India / Tamil Nadu" color={AT.color} />
                  <Field label="Festival Tie-in" value={o.festival} onChange={setO('festival')} placeholder="Diwali / Pongal / None" color={AT.color} />
                  <Field label="Variants" value={o.variants} onChange={setO('variants')} options={DD.variants} color={AT.color} />
                </div>}
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{ padding: '1.1rem', fontSize: '0.95rem', width: '100%', background: loading ? 'rgba(184,151,58,0.4)' : `linear-gradient(135deg, ${AT.color}, ${AT.color}cc)`, border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', color: '#FFFFFF', fontWeight: 700, fontFamily: 'Jost, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: loading ? 'none' : `0 6px 24px ${AT.color}44`, transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
              {loading ? (<><div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', animation: 'spin 0.8s linear infinite' }} />{labels.generating} {ATlabel}...</>) : `✦ ${labels.generateTitle || 'Generate'} ${ATlabel}`}
            </button>

            {loading && <div style={{ ...card, textAlign: 'center', padding: '2rem', borderColor: `${AT.color}33` }}><p style={{ color: '#6A5A40', fontSize: '0.88rem' }}>{labels.generatingDesc}</p><p style={{ color: '#A09080', fontSize: '0.78rem', marginTop: '0.3rem' }}>{labels.generatingTime}</p></div>}
            {error && <div style={{ ...card, borderLeft: '3px solid #C0604A', color: '#C0604A', fontSize: '0.88rem' }}>⚠️ {error}</div>}

            {output && (
              <div style={{ ...card, borderTop: `3px solid ${AT.color}`, animation: 'fadeIn 0.4s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', color: AT.color, fontSize: '1.1rem' }}>{labels.generatedOutput}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleCopy} style={{ background: `${AT.color}15`, border: `1px solid ${AT.color}44`, color: AT.color, padding: '0.35rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>{copied ? labels.copied : labels.copy}</button>
                    <button onClick={handleDownload} style={{ background: AT.color, border: 'none', color: '#FFFFFF', padding: '0.35rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: `0 2px 8px ${AT.color}44` }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      {labels.download}
                    </button>
                  </div>
                </div>
                <div style={{ background: '#FAFAF8', border: '1px solid rgba(184,151,58,0.15)', borderRadius: '10px', padding: '1.25rem', whiteSpace: 'pre-wrap', fontSize: '0.88rem', lineHeight: 1.9, color: '#2A2015', maxHeight: '500px', overflowY: 'auto' }}>{renderBoldText(output)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </AppLayout>
  )
}