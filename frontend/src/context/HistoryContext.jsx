import { createContext, useContext, useState, useCallback } from 'react'

const HistoryContext = createContext(null)
export const useHistory = () => useContext(HistoryContext)

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([])

  const addEntry = useCallback((entry) => {
    setHistory(prev => [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...entry
    }, ...prev])
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])

  return (
    <HistoryContext.Provider value={{ history, addEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  )
}
