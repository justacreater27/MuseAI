import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useLanguage } from '../context/LanguageContext'

export default function Pricing() {
  const navigate = useNavigate()
  const { labels } = useLanguage()

  const plans = [
    {
      name: 'Free', price: '₹0', period: '/month',
      features: ['5 generations/month', 'Script & Music only', 'English only', 'Basic cultural context'],
      cta: labels.getStarted, highlight: false,
    },
    {
      name: 'Pro', price: '₹999', period: '/month',
      features: ['100 generations/month', 'All content types', '11 Indian languages', 'Deep cultural AI', 'History & export', 'Priority support'],
      cta: labels.startTrial, highlight: true,
    },
    {
      name: 'Agency', price: '₹4999', period: '/month',
      features: ['Unlimited generations', 'All Pro features', 'Team collaboration', 'Custom brand profiles', 'API access', 'Dedicated support'],
      cta: labels.contactSales, highlight: false,
    },
  ]

  return (
    <AppLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: '#1A1A14' }}>
            {labels.simplePricing} <em style={{ color: '#B8973A' }}>{labels.pricingItalic}</em>
          </h1>
          <p style={{ color: '#8A8070', marginTop: '0.5rem' }}>{labels.noSurprises}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {plans.map(({ name, price, period, features, cta, highlight }) => (
            <div key={name} className="card" style={{
              background: highlight ? 'linear-gradient(160deg, rgba(201,168,76,0.08) 0%, rgba(184,151,58,0.04) 100%)' : '#FFFFFF',
              border: highlight ? '1.5px solid rgba(184,151,58,0.4)' : '1px solid rgba(184,151,58,0.12)',
              display: 'flex', flexDirection: 'column',
              boxShadow: highlight ? '0 4px 24px rgba(184,151,58,0.15)' : '0 2px 12px rgba(100,80,20,0.06)',
              position: 'relative', overflow: 'hidden',
            }}>
              {highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, #C9A84C, #8B6E25)' }} />}
              {highlight && (
                <div style={{ background: 'linear-gradient(135deg, #C9A84C, #8B6E25)', color: '#FFFFFF', fontSize: '0.65rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '50px', alignSelf: 'flex-start', marginBottom: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {labels.mostPopular}
                </div>
              )}
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#1A1A14', marginBottom: '0.5rem' }}>{name}</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.75rem', fontWeight: 400, color: highlight ? '#B8973A' : '#1A1A14' }}>{price}</span>
                <span style={{ color: '#8A8070', fontSize: '0.85rem' }}>{period}</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, marginBottom: '1.5rem' }}>
                {features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.85rem', color: '#4A4535', alignItems: 'flex-start' }}>
                    <span style={{ color: '#B8973A', marginTop: '1px', flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              {highlight ? (
                <button className="btn-gold" onClick={() => navigate('/generate')} style={{ width: '100%', padding: '0.75rem' }}>{cta}</button>
              ) : (
                <button onClick={() => navigate('/generate')} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid rgba(184,151,58,0.25)', color: '#6A6050', borderRadius: '50px', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>{cta}</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}