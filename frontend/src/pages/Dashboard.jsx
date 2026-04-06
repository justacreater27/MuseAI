import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useAuth } from '../context/AuthContext'
import { useHistory } from '../context/HistoryContext'
import { useLanguage } from '../context/LanguageContext'

const TYPE_META = {
  script:   { bg: 'rgba(184,151,58,0.07)',  border: 'rgba(184,151,58,0.2)',  icon: '🎬', color: '#B8973A' },
  visual:   { bg: 'rgba(74,155,155,0.07)',  border: 'rgba(74,155,155,0.2)',  icon: '🖼️', color: '#4A9B9B' },
  music:    { bg: 'rgba(107,155,107,0.07)', border: 'rgba(107,155,107,0.2)', icon: '🎵', color: '#6B9B6B' },
  campaign: { bg: 'rgba(100,130,180,0.07)', border: 'rgba(100,130,180,0.2)', icon: '📣', color: '#6482B4' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { history } = useHistory()
  const { labels } = useLanguage()
  const navigate = useNavigate()
  const name = user?.displayName?.split(' ')[0] || 'Creator'

  const stats = {
    total: history.length,
    script: history.filter(h => h.content_type === 'script').length,
    music: history.filter(h => h.content_type === 'music').length,
    campaign: history.filter(h => h.content_type === 'campaign').length,
  }

  const typeLabels = {
    script: labels.script, visual: labels.visual, music: labels.music, campaign: labels.campaign
  }

  return (
    <AppLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(184,151,58,0.1)',
            border: '1px solid rgba(184,151,58,0.25)', color: '#8B6E25',
            borderRadius: '50px', padding: '0.25rem 0.9rem', fontSize: '0.68rem',
            fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem',
          }}>
            {labels.studio}
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem', fontWeight: 300, color: '#1A1A14' }}>
            {labels.welcomeBack}, <em style={{ color: '#B8973A' }}>{name}</em>
          </h1>
          <p style={{ color: '#8A8070', marginTop: '0.35rem', fontSize: '0.9rem' }}>
            {labels.readyToCreate}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: labels.totalCreated, value: stats.total,    icon: '✦', gold: true },
            { label: labels.scripts,      value: stats.script,   icon: '🎬' },
            { label: labels.jingles,      value: stats.music,    icon: '🎵' },
            { label: labels.campaigns,    value: stats.campaign, icon: '📣' },
          ].map(({ label, value, icon, gold }) => (
            <div key={label} className="card" style={{
              textAlign: 'center', padding: '1.5rem 1rem',
              background: gold ? 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(184,151,58,0.06))' : '#FFFFFF',
              border: gold ? '1px solid rgba(184,151,58,0.3)' : '1px solid rgba(184,151,58,0.12)',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem', fontWeight: 400, color: gold ? '#B8973A' : '#1A1A14', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.72rem', color: '#8A8070', marginTop: '0.35rem', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Quick create */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#B8973A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {labels.quickCreate}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(184,151,58,0.25), transparent)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {['script', 'visual', 'music', 'campaign'].map(type => {
              const m = TYPE_META[type]
              return (
                <button key={type} onClick={() => navigate('/generate')} style={{
                  background: m.bg, border: `1px solid ${m.border}`, borderRadius: '14px',
                  padding: '1.25rem 1rem', cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.2s', color: m.color, boxShadow: '0 2px 8px rgba(100,80,20,0.06)',
                }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{m.icon}</div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 600 }}>{typeLabels[type]}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#B8973A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {labels.recentGenerations}
              </span>
              <div style={{ width: '60px', height: '1px', background: 'rgba(184,151,58,0.25)' }} />
            </div>
            <button onClick={() => navigate('/history')} style={{
              background: 'transparent', border: 'none', color: '#B8973A',
              cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Jost, sans-serif', fontWeight: 500,
            }}>{labels.viewAll}</button>
          </div>

          {history.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#8A8070', border: '1px dashed rgba(184,151,58,0.2)' }}>
              {labels.noGenerations}{' '}
              <button onClick={() => navigate('/generate')} style={{ color: '#B8973A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>
                {labels.createFirst}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.slice(0, 5).map(h => {
                const m = TYPE_META[h.content_type] || TYPE_META.script
                return (
                  <div key={h.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem 1.25rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: m.bg, border: `1px solid ${m.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                      {m.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1A1A14', marginBottom: '0.2rem' }}>
                        {h.brand} — <span style={{ color: m.color, textTransform: 'capitalize' }}>{h.content_type}</span>
                      </div>
                      <div style={{ color: '#8A8070', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {h.output?.substring(0, 100)}...
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#B8A080', flexShrink: 0 }}>
                      {new Date(h.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}