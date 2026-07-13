/**
 * Sidebar — language-aware
 * src/components/layout/Sidebar.jsx
 */
import { useNavigate, useLocation } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'
import { useLanguage } from '../../context/LanguageContext'
import { logOut } from '../../utils/firebase'
import ConfirmModal from '../ui/ConfirmModal'
import { useState } from 'react'
import logoSrc from '../../assets/logo.png'   // ← place your logo at src/assets/logo.png

function AIStudioIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.16Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.16Z"/>
    </svg>
  )
}

export default function Sidebar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { labels } = useLanguage()   // ← pulls translated labels
  const isActive  = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  // Nav items now use labels from LanguageContext
  const NAV = [
    { path: '/dashboard',     label: labels.dashboard,  icon: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>) },
    { path: '/generate',      label: labels.generate,   icon: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>) },
    { path: '/ai-suggestion',  label: 'AI Studio',       icon: () => <AIStudioIcon size={18} />, badge: 'AI' },
    { path: '/history',       label: labels.history,    icon: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>) },
    { path: '/pricing',       label: labels.pricing,    icon: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>) },
    { path: '/profile',       label: labels.profile,    icon: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>) },
    { path: '/settings',      label: labels.settings,   icon: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>) },
    { path: '/helpdesk',      label: labels.helpdesk,   icon: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>) },
  ]

  return (
    <aside style={{
      width: '230px', minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      boxShadow: '2px 0 16px var(--sidebar-shadow)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
      transition: 'background 0.3s ease, border-color 0.3s ease',
      flexShrink: 0,
    }}>

      {/* ── Logo ── */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1.2rem 1.3rem 1.1rem',
          cursor: 'pointer',
          borderBottom: '1px solid var(--sidebar-border)',
          userSelect: 'none',
        }}
      >
        {/* Logo image — src/assets/logo.png */}
        <img
          src={logoSrc}
          alt="MuseAI"
          style={{
            width: '42px', height: '42px',
            objectFit: 'contain', flexShrink: 0,
            borderRadius: '10px',
            transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) rotate(4deg)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
          onError={e => {
            // fallback: hide broken image, show M badge
            e.currentTarget.style.display = 'none'
            const fb = document.createElement('div')
            fb.style.cssText = 'width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,#D4B85A,#B8973A);display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:#1A1A14;flex-shrink:0'
            fb.textContent = 'M'
            e.currentTarget.parentNode.insertBefore(fb, e.currentTarget)
          }}
        />

        {/* Wordmark */}
        <div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.55rem', fontWeight: 700,
            color: 'var(--gold)', letterSpacing: '0.01em', lineHeight: 1.1,
          }}>MuseAI</div>
          <div style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            fontFamily: 'Jost, sans-serif',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '1px',
          }}>{labels.studio || 'Creative AI'}</div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{
        flex: 1, padding: '0.9rem 0.7rem',
        display: 'flex', flexDirection: 'column', gap: '3px',
        overflowY: 'auto',
      }}>
        {NAV.map(item => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 1rem',
                borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: active ? 'var(--gold-bg-strong)' : 'transparent',
                color: active ? 'var(--gold)' : 'var(--text-muted)',
                fontFamily: 'Jost, sans-serif', fontSize: '0.9rem',
                fontWeight: active ? 600 : 400,
                width: '100%', textAlign: 'left',
                transition: 'all 0.2s ease', position: 'relative',
                boxShadow: active ? `inset 0 0 0 1px var(--border-strong)` : 'none',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--gold-bg)'; e.currentTarget.style.color = 'var(--text-soft)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}
            >
              {active && (
                <span style={{
                  position: 'absolute', left: 0, top: '18%', bottom: '18%',
                  width: '3px', borderRadius: '0 3px 3px 0',
                  background: 'var(--gold)', animation: 'barIn 0.2s ease',
                }} />
              )}
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, width: '20px',
                transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                transform: active ? 'scale(1.15)' : 'scale(1)',
                color: active ? 'var(--gold)' : 'var(--text-muted)',
              }}>
                {item.icon()}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700,
                  background: active ? 'var(--gold)' : 'var(--gold-bg-strong)',
                  color: active ? '#1A1208' : 'var(--gold)',
                  border: `1px solid ${active ? 'transparent' : 'var(--gold-border)'}`,
                  borderRadius: '4px', padding: '1px 5px',
                  letterSpacing: '0.06em', transition: 'all 0.2s ease', flexShrink: 0,
                }}>{item.badge}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Theme toggle ── */}
      <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: '0.6rem 0.7rem' }}>
        <ThemeToggle variant="sidebar" />
      </div>

      {/* ── Sign out ── */}
      <div style={{ padding: '0.6rem 0.7rem' }}>
        <SignOutButton labels={labels} navigate={navigate} />
      </div>
      <ConfirmModal open={false} />

      <style>{`
        @keyframes barIn { from { transform: scaleY(0); opacity: 0 } to { transform: scaleY(1); opacity: 1 } }
      `}</style>
    </aside>
  )
}


function SignOutButton({ labels, navigate }) {
  const [open, setOpen] = useState(false)
  const handleConfirm = async () => {
    setOpen(false)
    try {
      await logOut()
    } catch (err) {
      console.error('Sign out failed', err)
    }
    navigate('/login')
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(192,57,43,0.12)', background: 'transparent', color: '#C0392B', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 700 }}>
        {labels.signout}
      </button>
      <ConfirmModal open={open} title={labels.signout} message={'Sign out of MuseAI?'} confirmLabel={labels.signout} cancelLabel={'Cancel'} onConfirm={handleConfirm} onCancel={() => setOpen(false)} />
    </>
  )
}