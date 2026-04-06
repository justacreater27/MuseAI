import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const words = ['Scripts', 'Jingles', 'Visuals', 'Campaigns']

export default function Home() {
  const navigate = useNavigate()
  const [wordIdx, setWordIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setWordIdx(i => (i + 1) % words.length)
        setFade(true)
      }, 300)
    }, 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF7',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Decorative top bar */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(to right, #C9A84C, #8B6E25, #C9A84C)',
      }} />

      {/* Nav */}
      <nav style={{
        padding: '1.25rem 3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(184,151,58,0.12)',
        background: '#FFFFFF',
      }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.6rem',
          fontWeight: 600,
          color: '#B8973A',
          letterSpacing: '0.02em',
        }}>
          Muse<span style={{ fontStyle: 'italic' }}>AI</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => navigate('/pricing')} style={{
            background: 'transparent',
            border: '1px solid rgba(184,151,58,0.25)',
            color: '#6A6050',
            padding: '0.55rem 1.4rem',
            borderRadius: '50px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontFamily: 'Jost, sans-serif',
            transition: 'all 0.2s',
          }}>Pricing</button>
          <button onClick={() => navigate('/login')} className="btn-gold">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '5rem 2rem 4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background radial */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(184,151,58,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(184,151,58,0.1)',
          border: '1px solid rgba(184,151,58,0.3)',
          color: '#8B6E25',
          borderRadius: '50px',
          padding: '0.4rem 1.2rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '2.5rem',
        }}>
          🇮🇳 Built for Bharat
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(3rem, 8vw, 5.5rem)',
          fontWeight: 300,
          lineHeight: 1.1,
          color: '#1A1A14',
          marginBottom: '1.25rem',
          letterSpacing: '-0.01em',
        }}>
          AI-generated
          <br />
          <span style={{
            color: '#B8973A',
            fontStyle: 'italic',
            fontWeight: 400,
            transition: 'opacity 0.3s',
            opacity: fade ? 1 : 0,
          }}>
            {words[wordIdx]}
          </span>
          <br />
          for India
        </h1>

        <p style={{
          color: '#6A6050',
          fontSize: '1.05rem',
          maxWidth: '500px',
          lineHeight: 1.8,
          marginBottom: '2.5rem',
        }}>
          Create culturally authentic ad scripts, visual concepts, jingles and campaign plans in 11 Indian languages.
        </p>

        <button className="btn-gold" onClick={() => navigate('/login')}
          style={{ fontSize: '1rem', padding: '1rem 3.5rem' }}>
          Start Creating →
        </button>

        {/* Feature cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginTop: '5rem',
          maxWidth: '720px',
          width: '100%',
        }}>
          {[
            { icon: '🎬', label: 'Ad Scripts',       border: 'rgba(184,151,58,0.25)',   bg: 'rgba(184,151,58,0.06)' },
            { icon: '🖼️', label: 'Visual Concepts',  border: 'rgba(74,155,155,0.2)',   bg: 'rgba(74,155,155,0.05)' },
            { icon: '🎵', label: 'Jingles',           border: 'rgba(184,151,58,0.2)',   bg: 'rgba(184,151,58,0.04)' },
            { icon: '📣', label: 'Campaigns',         border: 'rgba(100,130,180,0.2)',  bg: 'rgba(100,130,180,0.05)' },
          ].map(({ icon, label, border, bg }) => (
            <div key={label} style={{
              background: '#FFFFFF',
              border: `1px solid ${border}`,
              borderRadius: '16px',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              boxShadow: '0 2px 12px rgba(100,80,20,0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>{icon}</div>
              <div style={{ fontSize: '0.72rem', color: '#6A6050', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Language tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
          {['English','हिंदी','தமிழ்','తెలుగు','ಕನ್ನಡ','മലയാളം','বাংলা','ਪੰਜਾਬੀ'].map(lang => (
            <span key={lang} style={{
              background: '#FFFFFF',
              border: '1px solid rgba(184,151,58,0.2)',
              borderRadius: '50px',
              padding: '0.35rem 1rem',
              fontSize: '0.82rem',
              color: '#6A6050',
              boxShadow: '0 1px 4px rgba(100,80,20,0.06)',
            }}>{lang}</span>
          ))}
        </div>
      </div>

      {/* Footer line */}
      <div style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid rgba(184,151,58,0.12)',
        color: '#8A8070',
        fontSize: '0.78rem',
      }}>
        MuseAI — Creative AI for India · © 2025
      </div>
    </div>
  )
}
