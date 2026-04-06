import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../utils/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Timeout fallback — if Firebase doesn't respond in 5s, stop loading
    const timeout = setTimeout(() => setLoading(false), 5000)

    const unsub = onAuthStateChanged(auth, (u) => {
      clearTimeout(timeout)
      setUser(u)
      setLoading(false)
    }, (error) => {
      // Firebase error — stop loading so app still renders
      clearTimeout(timeout)
      console.error('Auth error:', error)
      setLoading(false)
    })

    return () => {
      unsub()
      clearTimeout(timeout)
    }
  }, [])

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0F',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: '2px solid rgba(201,168,76,0.2)',
        borderTop: '2px solid #C9A84C',
        animation: 'spin 0.9s linear infinite'
      }} />
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}