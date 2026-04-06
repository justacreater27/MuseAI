import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGoogle, signInEmail, signUpEmail } from '../utils/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../utils/firebase'

// ── Clean professional error messages ─────────────────────────────
function getFriendlyError(code) {
  const map = {
    'auth/email-already-in-use':    'This email is already registered. Try signing in instead.',
    'auth/user-not-found':          'No account found with this email. Please sign up first.',
    'auth/wrong-password':          'Incorrect password. Please try again or reset your password.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password is too weak. Use at least 6 characters.',
    'auth/too-many-requests':       'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed':  'Network error. Please check your internet connection.',
    'auth/popup-closed-by-user':    'Sign-in popup was closed. Please try again.',
    'auth/popup-blocked':           'Popup was blocked by your browser. Please allow popups and try again.',
    'auth/account-exists-with-different-credential': 'An account already exists with a different sign-in method. Try signing in with Google.',
    'auth/invalid-credential':      'Invalid credentials. Please check your email and password.',
    'auth/user-disabled':           'This account has been disabled. Please contact support.',
    'auth/requires-recent-login':   'For security, please sign out and sign in again.',
    'Passwords do not match':       'Passwords do not match. Please make sure both passwords are the same.',
  }
  const match = (code || '').match(/\(([^)]+)\)/)
  const extracted = match ? match[1] : code
  return map[extracted] || map[code] || 'Something went wrong. Please try again.'
}

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab]     = useState('signin')
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleGoogle = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (e) { setError(getFriendlyError(e.code || e.message)) }
    finally { setLoading(false) }
  }

  const handleEmail = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      if (tab === 'signup') {
        if (form.password !== form.confirm) throw new Error('Passwords do not match')
        await signUpEmail(form.email, form.password)
      } else {
        await signInEmail(form.email, form.password)
      }
      navigate('/dashboard')
    } catch (e) { setError(getFriendlyError(e.code || e.message)) }
    finally { setLoading(false) }
  }

  const handleForgotPassword = async () => {
    setError(''); setSuccess('')

    if (!form.email || form.email.trim() === '') {
      setError('Please enter your email address above, then click Forgot Password.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const actionCodeSettings = {
        // Change this to your custom domain once it's set up: 'https://museai.in/login'
        url: 'https://museai-ec37f.firebaseapp.com/login',
        handleCodeInApp: false,
      }

      await sendPasswordResetEmail(auth, form.email.trim(), actionCodeSettings)

      setSuccess(`✓ Password reset email sent to ${form.email}. Please check your inbox and spam folder.`)
      setTimeout(() => setSuccess(''), 5000)
    } catch (e) {
      setError(getFriendlyError(e.code || e.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FAFAF7' }}>

      {/* ── Left panel ── */}
      <div style={{
        width: '45%',
        background: 'linear-gradient(160deg, #1A1A14 0%, #2A2010 50%, #1A1408 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '4rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#C9A84C', marginBottom: '2.5rem', position: 'relative' }}>
          Muse<span style={{ fontStyle: 'italic' }}>AI</span>
        </div>

        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.75rem', fontWeight: 300, lineHeight: 1.25, color: '#FAFAF7', marginBottom: '1.5rem', position: 'relative' }}>
          Create content<br />
          <em style={{ color: '#C9A84C' }}>India loves</em>
        </h2>

        <p style={{ color: 'rgba(250,250,247,0.45)', lineHeight: 1.8, fontSize: '0.9rem', marginBottom: '3rem', position: 'relative' }}>
          AI-powered scripts, jingles, visuals and campaigns — deeply rooted in Indian culture and languages.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
          {['🎬 Ad scripts in 11 Indian languages', '🎵 AI jingles with cultural context', '📣 Full campaign planning'].map(f => (
            <div key={f} style={{ color: 'rgba(250,250,247,0.6)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{f}</div>
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }} />
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', maxWidth: '480px', margin: '0 auto' }}>

        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#1A1A14', marginBottom: '0.4rem' }}>
          {tab === 'signin' ? 'Welcome back' : 'Create account'}
        </h3>
        <p style={{ color: '#8A8070', marginBottom: '2rem', fontSize: '0.88rem' }}>
          {tab === 'signin' ? 'Sign in to continue creating' : "Join MuseAI — it's free"}
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', background: '#F4F2EC', borderRadius: '10px', padding: '3px', border: '1px solid rgba(184,151,58,0.12)' }}>
          {['signin', 'signup'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }} style={{
              flex: 1, padding: '0.55rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: tab === t ? '#FFFFFF' : 'transparent',
              color: tab === t ? '#B8973A' : '#8A8070',
              fontSize: '0.85rem', fontWeight: tab === t ? 600 : 400,
              fontFamily: 'Jost, sans-serif', transition: 'all 0.2s',
              boxShadow: tab === t ? '0 1px 4px rgba(100,80,20,0.1)' : 'none',
            }}>
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Google */}
        <button onClick={handleGoogle} disabled={loading} style={{
          width: '100%', padding: '0.85rem', marginBottom: '1.25rem',
          background: '#FFFFFF', border: '1px solid rgba(184,151,58,0.2)',
          color: '#1A1A14', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem', fontFamily: 'Jost, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(100,80,20,0.08)',
          opacity: loading ? 0.6 : 1,
        }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          {loading ? 'Please wait...' : 'Continue with Google'}
        </button>

        <div style={{ textAlign: 'center', color: '#C0B090', marginBottom: '1.25rem', fontSize: '0.8rem' }}>— or —</div>

        {/* Email form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

          {tab === 'signup' && (
            <div>
              <label className="label">Full Name</label>
              <input placeholder="Your name" value={form.name} onChange={set('name')} />
            </div>
          )}

          <div>
            <label className="label">Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>

          {/* Password with Forgot Password link */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="label" style={{ margin: 0 }}>Password</label>
              {tab === 'signin' && (
                <button onClick={handleForgotPassword} disabled={loading} style={{
                  background: 'none', border: 'none',
                  color: loading ? '#C0B090' : '#B8973A',
                  fontSize: '0.75rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Jost, sans-serif',
                  fontWeight: 500, padding: 0,
                  textDecoration: 'underline', textUnderlineOffset: '2px',
                  opacity: loading ? 0.5 : 1,
                }}>
                  {loading ? 'Sending...' : 'Forgot password?'}
                </button>
              )}
            </div>
            <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
          </div>

          {tab === 'signup' && (
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            marginTop: '1rem', padding: '0.85rem 1rem',
            background: 'rgba(192,57,43,0.05)',
            border: '1px solid rgba(192,57,43,0.18)',
            borderLeft: '3px solid #C0392B',
            borderRadius: '8px',
            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ color: '#9A3020', fontSize: '0.83rem', lineHeight: 1.5, fontFamily: 'Jost, sans-serif' }}>
              {error}
            </span>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div style={{
            marginTop: '1rem', padding: '0.85rem 1rem',
            background: 'rgba(90,138,106,0.06)',
            border: '1px solid rgba(90,138,106,0.25)',
            borderLeft: '3px solid #5A8A6A',
            borderRadius: '8px',
            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5A8A6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ color: '#3A6A4A', fontSize: '0.83rem', lineHeight: 1.5, fontFamily: 'Jost, sans-serif' }}>
              {success}
            </span>
          </div>
        )}

        <button className="btn-gold" onClick={handleEmail} disabled={loading}
          style={{ marginTop: '1.25rem', width: '100%', padding: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

      </div>
    </div>
  )
}