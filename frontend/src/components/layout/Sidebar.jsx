import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { logOut } from '../../utils/firebase'

export default function Sidebar() {
  const { user } = useAuth()
  const { labels } = useLanguage()
  const navigate = useNavigate()

  const links = [
    { to: '/dashboard', label: labels.dashboard,  icon: '◈' },
    { to: '/generate',  label: labels.generate,   icon: '✦' },
    { to: '/history',   label: labels.history,    icon: '◷' },
    { to: '/pricing',   label: labels.pricing,    icon: '◇' },
    { to: '/helpdesk', label: labels.helpdesk, icon: '⌨' },
    { to: '/profile',   label: labels.profile,    icon: '◉' },
    { to: '/settings',  label: labels.settings,   icon: '◎' },
  ]

  const handleLogout = async () => {
    await logOut()
    navigate('/login')
  }

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      flexShrink: 0,
      background: '#FFFFFF',
      borderRight: '1px solid rgba(184,151,58,0.15)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
      position: 'sticky',
      top: 0,
      height: '100vh',
      boxShadow: '2px 0 12px rgba(100,80,20,0.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 1.25rem 2rem' }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#B8973A',
          letterSpacing: '0.03em',
        }}>
          Muse<span style={{ fontStyle: 'italic' }}>AI</span>
        </div>
        <div style={{
          fontSize: '0.65rem',
          color: '#8A8070',
          marginTop: '0.15rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          {labels.studio}
        </div>
        <div style={{
          marginTop: '1rem',
          height: '1px',
          background: 'linear-gradient(to right, rgba(184,151,58,0.4), transparent)',
        }} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 1.25rem',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: isActive ? 600 : 400,
            color: isActive ? '#B8973A' : '#6A6050',
            background: isActive ? 'rgba(184,151,58,0.08)' : 'transparent',
            borderLeft: isActive ? '3px solid #B8973A' : '3px solid transparent',
            transition: 'all 0.2s',
          })}>
            <span style={{ fontSize: '0.95rem' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid rgba(184,151,58,0.12)',
        background: 'rgba(184,151,58,0.03)',
      }}>
        {user && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#2A2A20', fontWeight: 600 }}>
              {user.displayName || 'User'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#8A8070', marginTop: '0.15rem' }}>
              {user.email}
            </div>
          </div>
        )}
        <button onClick={handleLogout} style={{
          width: '100%',
          padding: '0.5rem',
          background: 'transparent',
          border: '1px solid rgba(184,151,58,0.2)',
          color: '#8A8070',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.78rem',
          transition: 'all 0.2s',
          fontFamily: 'Jost, sans-serif',
        }}>
          {labels.signout}
        </button>
      </div>
    </aside>
  )
}