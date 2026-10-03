import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateContentCalendar } from '../utils/api'

const PLATFORMS = [
  'Instagram',
  'YouTube',
  'LinkedIn',
  'Facebook',
  'X',
  'Pinterest'
]

const CONTENT_TYPES = [
  'Post',
  'Reel',
  'Article',
  'Carousel',
  'Video',
  'Story'
]

const LANGUAGES = [
  'English',
  'Tamil',
  'Hindi',
  'Telugu',
  'Malayalam',
  'Kannada',
  'Bengali',
  'Marathi',
  'Gujarati'
]

const REGIONS = [
  'Pan-India',
  'Tamil Nadu',
  'Kerala',
  'Karnataka',
  'Telangana',
  'Andhra Pradesh',
  'Maharashtra',
  'Gujarat',
  'Punjab',
  'West Bengal',
  'Delhi/NCR',
  'North India'
]

const inputStyle = {
  width: '100%',
  padding: '0.8rem 1rem',
  border: '1px solid rgba(184,151,58,0.25)',
  borderRadius: '10px',
  background: '#fffdf8',
  color: '#4b4438',
  fontFamily: 'Jost, sans-serif',
  fontSize: '0.92rem',
  outline: 'none',
  boxSizing: 'border-box'
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.45rem',
  color: '#75684f',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
}

function CalendarCard({ item, index }) {
  const date =
    item.date ||
    item.post_date ||
    item.scheduled_date ||
    `Day ${index + 1}`

  const time =
    item.time ||
    item.posting_time ||
    item.recommended_time ||
    'Recommended time'

  const title =
    item.title ||
    item.content_idea ||
    item.topic ||
    item.idea ||
    'Content opportunity'

  const format =
    item.format ||
    item.content_type ||
    'Post'

  const reason =
    item.reason ||
    item.reasoning ||
    item.why ||
    item.recommendation ||
    'Based on the selected audience, platform and current content signals.'

  const trend =
    item.trend ||
    item.trend_topic ||
    item.trend_relevance ||
    'Audience relevance'

  const score =
    item.score ??
    item.reach_score ??
    item.opportunity_score ??
    null
  const trendScore = item.trend_score
  const engagementScore = item.engagement_score
  const hashtags = Array.isArray(item.hashtags) ? item.hashtags : []

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(184,151,58,0.18)',
        borderRadius: '18px',
        padding: '1.25rem',
        marginBottom: '1rem',
        boxShadow: '0 8px 25px rgba(80,60,20,0.05)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}
      >
        <div>
          <div
            style={{
              color: '#B8973A',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            {item.day || `Day ${index + 1}`}
          </div>

          <h3
            style={{
              margin: '0.3rem 0 0',
              color: '#302b24',
              fontFamily: 'Georgia, serif',
              fontSize: '1.15rem'
            }}
          >
            {date}
          </h3>
        </div>

        {score !== null && (
          <div
            style={{
              minWidth: '75px',
              textAlign: 'center',
              padding: '0.55rem',
              borderRadius: '12px',
              background: '#f7f1df',
              color: '#9b7922'
            }}
          >
            <div style={{ fontSize: '0.7rem' }}>REACH SIGNAL</div>
            <strong style={{ fontSize: '1.1rem' }}>
              {score}
            </strong>
          </div>
        )}
      </div>

      <div
        className="calendar-card-metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
          gap: '0.7rem',
          marginBottom: '1rem'
        }}
      >
        <div
          style={{
            padding: '0.75rem',
            borderRadius: '10px',
            background: '#faf8f1'
          }}
        >
          <small style={{ color: '#8b806c' }}>POST TIME</small>
          <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>
            {time}
          </div>
        </div>

        <div
          style={{
            padding: '0.75rem',
            borderRadius: '10px',
            background: '#faf8f1'
          }}
        >
          <small style={{ color: '#8b806c' }}>FORMAT</small>
          <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>
            {format}
          </div>
        </div>

        <div
          style={{
            padding: '0.75rem',
            borderRadius: '10px',
            background: '#faf8f1'
          }}
        >
          <small style={{ color: '#8b806c' }}>SIGNAL</small>
          <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>
            {trend || 'No matching current trend'}
          </div>
          {item.trend_source && <small style={{ color: '#8b806c' }}>via {item.trend_source}</small>}
        </div>
      </div>

      <div className="calendar-score-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '0.7rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: '10px', background: '#faf8f1' }}>
          <small style={{ color: '#8b806c' }}>TREND SCORE</small>
          <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>{trendScore == null ? 'Not available' : `${trendScore}/100`}</div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '10px', background: '#faf8f1' }}>
          <small style={{ color: '#8b806c' }}>ENGAGEMENT SIGNAL</small>
          <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>{engagementScore == null ? 'Not available' : `${engagementScore}/100`}</div>
        </div>
      </div>

      <div
        style={{
          padding: '1rem',
          borderRadius: '12px',
          background: '#fffaf0',
          borderLeft: '3px solid #B8973A'
        }}
      >
        <div
          style={{
            fontSize: '0.72rem',
            color: '#92752d',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '0.35rem'
          }}
        >
          Caption Angle
        </div>

        <div
          style={{
            color: '#3d372e',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          {item.caption_angle || title}
        </div>

        <div
          style={{
            marginTop: '0.55rem',
            color: '#766d5f',
            lineHeight: 1.55,
            fontSize: '0.9rem'
          }}
        >
          {reason}
        </div>
        {hashtags.length > 0 && <div style={{ marginTop: '0.7rem', color: '#92752d', fontSize: '0.86rem', lineHeight: 1.6 }}>{hashtags.join('  ')}</div>}
      </div>
    </div>
  )
}

export default function ContentCalendar() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    brand_name: '',
    industry: '',
    target_audience: '',
    platform: 'Instagram',
    content_type: 'Post',
    language: 'English',
    region: 'Pan-India',
    days: 7
  })

  const [calendar, setCalendar] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const update = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const generate = async () => {
    if (!form.brand_name.trim()) {
      setError('Please enter a brand name.')
      return
    }

    setError('')
    setNotice('')
    setLoading(true)

    try {
      const response = await generateContentCalendar({
        ...form,
        days: Number(form.days)
      })

      const data = response.data

      const items =
        data.items ||
        data.calendar ||
        data.entries ||
        []

      setCalendar(items)
      if (items.length === 0) setNotice('The trend and audience signals did not produce calendar entries. Please try again or adjust the inputs.')
    } catch (err) {
      console.error(err)

      setError(
        err?.response?.data?.detail ||
        (err?.request ? 'Could not reach MuseAI. Check that the backend is running and the /api proxy is available.' : 'Unable to generate the content calendar. Please review the request and try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="content-calendar-page"
      style={{
        minHeight: '100vh',
        background: '#f8f5ed',
        padding: '2rem 3rem',
        fontFamily: 'Jost, sans-serif'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* HEADER */}

        <button type="button" onClick={() => navigate(-1)} style={{ marginBottom: '1rem', border: '1px solid rgba(184,151,58,0.3)', borderRadius: '999px', padding: '0.55rem 1rem', color: '#75684f', background: '#fff', cursor: 'pointer', font: 'inherit' }}>
          ← Back
        </button>

        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              color: '#B8973A',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            MuseAI Intelligence
          </div>

          <h1
            style={{
              margin: '0.35rem 0',
              fontFamily: 'Georgia, serif',
              fontSize: '2.4rem',
              fontWeight: 500,
              color: '#302b24'
            }}
          >
            Content <span style={{ color: '#B8973A' }}>Calendar</span>
          </h1>

          <p
            style={{
              margin: 0,
              color: '#756d60',
              maxWidth: '720px',
              lineHeight: 1.6
            }}
          >
            Plan your next content cycle using audience context,
            platform patterns and current trend signals.
          </p>
        </div>

        {/* INPUT PANEL */}

        <div
          style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '1.6rem',
            border: '1px solid rgba(184,151,58,0.18)',
            boxShadow: '0 10px 35px rgba(70,50,20,0.06)',
            marginBottom: '2rem'
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontFamily: 'Georgia, serif',
              fontWeight: 500,
              color: '#3b342b'
            }}
          >
            Calendar Strategy
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
              gap: '1rem'
            }}
            className="calendar-form-grid"
          >
            <div>
              <label style={labelStyle}>Brand Name</label>
              <input
                style={inputStyle}
                value={form.brand_name}
                onChange={update('brand_name')}
                placeholder="e.g. Amul"
              />
            </div>

            <div>
              <label style={labelStyle}>Industry</label>
              <input
                style={inputStyle}
                value={form.industry}
                onChange={update('industry')}
                placeholder="e.g. FMCG"
              />
            </div>

            <div>
              <label style={labelStyle}>Target Audience</label>
              <input
                style={inputStyle}
                value={form.target_audience}
                onChange={update('target_audience')}
                placeholder="e.g. Urban youth 18-28"
              />
            </div>

            <div>
              <label style={labelStyle}>Platform</label>
              <select
                style={inputStyle}
                value={form.platform}
                onChange={update('platform')}
              >
                {PLATFORMS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Content Type</label>
              <select
                style={inputStyle}
                value={form.content_type}
                onChange={update('content_type')}
              >
                {CONTENT_TYPES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Language</label>
              <select
                style={inputStyle}
                value={form.language}
                onChange={update('language')}
              >
                {LANGUAGES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Region</label>
              <select
                style={inputStyle}
                value={form.region}
                onChange={update('region')}
              >
                {REGIONS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Planning Period</label>
              <select
                style={inputStyle}
                value={form.days}
                onChange={update('days')}
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '1.3rem',
              padding: '1rem',
              border: 'none',
              borderRadius: '12px',
              background: loading
                ? '#b7aaa0'
                : 'linear-gradient(90deg, #B8973A, #c9a84f)',
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: loading ? 'wait' : 'pointer',
              fontSize: '0.88rem'
            }}
          >
            {loading
              ? 'ANALYZING CONTENT OPPORTUNITIES...'
              : '✦ GENERATE CONTENT CALENDAR'}
          </button>

          {error && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.9rem',
                borderRadius: '10px',
                background: '#fff1ed',
                color: '#a23a27'
              }}
            >
              {error}
            </div>
          )}
          {notice && <div role="status" style={{ marginTop: '1rem', color: '#75684f' }}>{notice}</div>}
        </div>

        {/* RESULTS */}

        {calendar.length > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: 'Georgia, serif',
                    fontWeight: 500,
                    color: '#302b24'
                  }}
                >
                  Your Publishing Plan
                </h2>

                <p
                  style={{
                    margin: '0.35rem 0 0',
                    color: '#807666',
                    fontSize: '0.88rem'
                  }}
                >
                  {calendar.length} content opportunities identified
                </p>
              </div>

              <div
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '999px',
                  background: '#eef7f5',
                  color: '#438d83',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                TREND + AUDIENCE SIGNALS
              </div>
            </div>

            {calendar.map((item, index) => (
              <CalendarCard
                key={item.id || index}
                item={item}
                index={index}
              />
            ))}
          </div>
        )}

        {!loading && calendar.length === 0 && (
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '3rem',
              textAlign: 'center',
              border: '1px dashed rgba(184,151,58,0.3)',
              color: '#837968'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>
              📅
            </div>

            <h3
              style={{
                margin: 0,
                color: '#4b4338',
                fontFamily: 'Georgia, serif'
              }}
            >
              Your content calendar is waiting
            </h3>

            <p>
              Enter your brand details above and generate a publishing plan.
            </p>
          </div>
        )}

      </div>
      <style>{`
        @media (max-width: 720px) {
          .content-calendar-page { padding: 1.1rem !important; }
          .calendar-form-grid { grid-template-columns: 1fr !important; }
          .calendar-card-metrics { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
