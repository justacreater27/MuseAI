import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { postHistory, getHistory, syncHistory } from '../utils/api'

const HistoryContext = createContext(null)
export const useHistory = () => useContext(HistoryContext)

export function HistoryProvider({ children }) {
  const STORAGE_KEY = 'museai_history_v1'
  const { user } = useAuth()
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  const addEntry = useCallback((entry) => {
    const now = new Date().toISOString()
    const deriveTitle = (e) => {
      if (e.title) return e.title
      if (e.brand) return `${e.brand} — ${e.content_type || ''}`.trim()
      if (e.output) {
        const firstLine = (e.output || '').split('\n').find(l => l.trim()) || ''
        return firstLine.substring(0, 80)
      }
      return `${(e.content_type || 'Generation').replace(/_/g, ' ')} ${new Date().toLocaleString()}`
    }

    const publicId = user && user.uid ? (localStorage.getItem(`museai_handle_${user.uid}`) || (user.email ? user.email.split('@')[0] : null)) : null

    const newEntry = {
      id: Date.now(),
      timestamp: now,
      title: deriveTitle(entry),
      public_id: publicId,
      ...entry
    }

    if (user && user.uid) {
      // send to backend
      postHistory({ user_id: user.uid, entry: newEntry }).then(res => {
        const saved = res?.data?.entry || newEntry
        setHistory(prev => [saved, ...prev])
      }).catch(() => {
        // fallback to local
        setHistory(prev => [newEntry, ...prev])
      })
    } else {
      setHistory(prev => [newEntry, ...prev])
    }
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])

  // persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (e) {
      // ignore storage errors
    }
  }, [history])

  // Sync local history to server when a user logs in, and fetch server history
  useEffect(() => {
    if (!user || !user.uid) return

    const localRaw = localStorage.getItem(STORAGE_KEY)
    let localEntries = []
    try {
      localEntries = localRaw ? JSON.parse(localRaw) : []
    } catch (e) {
      localEntries = []
    }

    const doFetch = async () => {
      try {
        // If there are local entries, sync them first
        if (localEntries.length > 0) {
          const syncRes = await syncHistory({ user_id: user.uid, entries: localEntries })
          const merged = syncRes?.data?.history || []
          setHistory(merged)
          // clear local cache after sync
          localStorage.removeItem(STORAGE_KEY)
          return
        }

        // otherwise just fetch server history
        const res = await getHistory(user.uid)
        const serverHist = res?.data?.history || []
        setHistory(serverHist)
      } catch (e) {
        console.error('History sync/fetch failed', e)
      }
    }

    doFetch()
  }, [user])

  return (
    <HistoryContext.Provider value={{ history, addEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  )
}
