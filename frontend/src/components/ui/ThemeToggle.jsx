/**
 * ThemeToggle
 * src/components/ui/ThemeToggle.jsx
 *
 * Drop anywhere:  <ThemeToggle />
 * In sidebar:     <ThemeToggle variant="sidebar" />
 */
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ variant = 'pill' }) {
  const { isDark, toggleTheme } = useTheme()

  /* ── sidebar row variant ── */
  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%',
          padding: '0.6rem 1.25rem',
          background: 'transparent',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontFamily: 'Jost, sans-serif',
          fontSize: '0.84rem',
          fontWeight: 400,
          transition: 'background 0.2s ease, color 0.2s ease',
          textAlign: 'left',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--gold-bg)'
          e.currentTarget.style.color = 'var(--gold)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
      >
        {/* Icon with swap animation */}
        <span style={{
          width: '18px', height: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)',
        }}>
          {isDark ? <SunIcon /> : <MoonIcon />}
        </span>
        <span>{isDark ? 'Light mode' : 'Dark mode'}</span>

        {/* Mini pill indicator */}
        <span style={{
          marginLeft: 'auto',
          width: '32px', height: '18px',
          borderRadius: '50px',
          background: isDark ? 'var(--gold-bg-strong)' : 'rgba(184,151,58,0.1)',
          border: '1px solid var(--border-strong)',
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.3s ease',
        }}>
          <span style={{
            position: 'absolute',
            top: '2px',
            left: isDark ? '14px' : '2px',
            width: '12px', height: '12px',
            borderRadius: '50%',
            background: 'var(--gold)',
            transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }} />
        </span>
      </button>
    )
  }

  /* ── default pill (for header / standalone use) ── */
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.85rem',
        borderRadius: '50px',
        border: '1px solid var(--border-strong)',
        background: 'var(--gold-bg)',
        color: 'var(--gold)',
        cursor: 'pointer',
        fontSize: '0.76rem',
        fontWeight: 600,
        fontFamily: 'Jost, sans-serif',
        transition: 'all 0.25s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--gold-bg-strong)'
        e.currentTarget.style.transform = 'scale(1.04)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--gold-bg)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <span style={{
        display: 'inline-flex',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        transform: isDark ? 'rotate(0deg)' : 'rotate(20deg)',
      }}>
        {isDark ? <SunIcon size={14} /> : <MoonIcon size={14} />}
      </span>
      {isDark ? 'Light' : 'Dark'}
    </button>
  )
}

function SunIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1"  x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22"   x2="5.64"  y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12" x2="3"  y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}