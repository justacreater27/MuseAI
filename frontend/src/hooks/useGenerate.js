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
      addEntry({
        content_type: payload.content_type,
        brand: payload.brand_info.brand,
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
