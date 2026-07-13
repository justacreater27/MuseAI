import { useState } from 'react'
import { generateContent } from '../utils/api'
import { useHistory } from '../context/HistoryContext'

export function useGenerate() {
  const [output, setOutput] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { addEntry } = useHistory()

  const generate = async (payload) => {
    setLoading(true)
    setError(null)
    setOutput(null)
    try {
      const res = await generateContent(payload)
      const result = res.data.output
      setOutput(result)
      // derive title from first non-empty line of the result if available
      const firstLine = (result || '').split('\n').find(l => l.trim()) || ''
      addEntry({
        content_type: payload.content_type,
        brand: payload.brand_info.brand,
        title: firstLine.substring(0, 100),
        output: result,
        tone: payload.brand_info.tone,
        language: payload.brand_info.output_language,
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return { output, loading, error, generate }
}
