import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { useHistory } from '../context/HistoryContext'
import { useLanguage } from '../context/LanguageContext'

const TYPE_ICONS = { script: '🎬', visual: '🖼️', music: '🎵', campaign: '📣' }
const TYPE_COLORS = { script: '#B8973A', visual: '#4A9B9B', music: '#6B9B6B', campaign: '#6482B4' }

function downloadTxt(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function History() {
  const { history, clearHistory } = useHistory()
  const { labels } = useLanguage()
  const [selected, setSelected] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const handleCopy = (h) => {
    navigator.clipboard.writeText(h.output)
    setCopiedId(h.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownload = (h) => {
    const brandName = (h.brand || 'output').replace(/\s+/g, '_')
    const filename = `MuseAI_${brandName}_${h.content_type}_${new Date(h.timestamp).toISOString().slice(0,10)}.txt`
    const content = [`MuseAI Generated Output`, `========================`, `Brand      : ${h.brand}`, `Type       : ${h.content_type}`, `Language   : ${h.language}`, `Tone       : ${h.tone}`, `Generated  : ${new Date(h.timestamp).toLocaleString()}`, `========================`, ``, h.output].join('\n')
    downloadTxt(content, filename)
  }

  return (
    <AppLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem', fontWeight: 300, color: '#1A1A14' }}>
              {labels.generationHistory} <em style={{ color: '#B8973A' }}>{labels.historyItalic}</em>
            </h1>
            <p style={{ color: '#8A8070', fontSize: '0.85rem', marginTop: '0.35rem' }}>
              {history.length} {labels.generationsSession}
            </p>
          </div>
          {history.length > 0 && (
            <button onClick={clearHistory} style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', color: '#C0392B', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Jost, sans-serif' }}>
              {labels.clearAll}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#8A8070', border: '1px dashed rgba(184,151,58,0.2)' }}>
            {labels.noHistory}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map(h => {
              const color = TYPE_COLORS[h.content_type] || '#B8973A'
              const isOpen = selected?.id === h.id
              return (
                <div key={h.id}>
                  <div className="card" onClick={() => setSelected(isOpen ? null : h)}
                    style={{ cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', borderColor: isOpen ? color : 'rgba(184,151,58,0.12)', borderRadius: isOpen ? '12px 12px 0 0' : '12px', boxShadow: isOpen ? `0 2px 12px ${color}22` : '0 2px 8px rgba(100,80,20,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.25rem' }}>{TYPE_ICONS[h.content_type]}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A1A14', marginBottom: '0.15rem' }}>
                            {h.brand} — <span style={{ color, textTransform: 'capitalize' }}>{h.content_type}</span>
                          </div>
                          <div style={{ color: '#8A8070', fontSize: '0.78rem' }}>
                            {h.language} · {h.tone} · {new Date(h.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span style={{ color: '#B8A080', fontSize: '0.8rem' }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ background: '#FAFAF7', border: `1px solid ${color}33`, borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '0.75rem 1.25rem', borderBottom: `1px solid ${color}18`, background: '#FFFFFF' }}>
                        <button onClick={(e) => { e.stopPropagation(); handleCopy(h) }} style={{ background: `${color}15`, border: `1px solid ${color}44`, color, padding: '0.3rem 0.9rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 600, fontFamily: 'Jost, sans-serif' }}>
                          {copiedId === h.id ? labels.copied : labels.copy}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDownload(h) }} style={{ background: color, border: 'none', color: '#FFFFFF', padding: '0.3rem 0.9rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 600, fontFamily: 'Jost, sans-serif', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: `0 2px 8px ${color}44` }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {labels.download}
                        </button>
                      </div>
                      <div style={{ padding: '1.25rem', whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: 1.8, color: '#2A2A20' }}>
                        {h.output}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </AppLayout>
  )
}