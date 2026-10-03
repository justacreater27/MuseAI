import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useAuth } from '../context/AuthContext'
import { useHistory } from '../context/HistoryContext'


// ═════════════════════════════════════════════════════════════
// MUSEAI ICONS
// Same visual language as Generate page
// ═════════════════════════════════════════════════════════════

function ScriptIcon({ active = false }) {
  const c = active ? '#B8973A' : '#A09080'

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 36 36"
      fill="none"
    >
      <rect
        x="6"
        y="4"
        width="24"
        height="28"
        rx="3"
        fill={
          active
            ? 'rgba(184,151,58,0.15)'
            : 'rgba(160,144,128,0.08)'
        }
        stroke={c}
        strokeWidth="1.5"
      >
        {active && (
          <animate
            attributeName="stroke-opacity"
            values="1;0.4;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </rect>

      {[11, 16, 21].map((y, i) => (
        <line
          key={y}
          x1="11"
          y1={y}
          x2={i === 2 ? 20 : 25}
          y2={y}
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          {active && (
            <animate
              attributeName="x2"
              values={
                i === 2
                  ? '20;25;20'
                  : '25;20;25'
              }
              dur={`${1.2 + i * 0.2}s`}
              repeatCount="indefinite"
            />
          )}
        </line>
      ))}
    </svg>
  )
}


function VisualIcon({ active = false }) {
  const c = active ? '#4A9B9B' : '#A09080'

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 36 36"
      fill="none"
    >
      <rect
        x="4"
        y="7"
        width="28"
        height="22"
        rx="3"
        fill={
          active
            ? 'rgba(74,155,155,0.12)'
            : 'rgba(160,144,128,0.08)'
        }
        stroke={c}
        strokeWidth="1.5"
      />

      <circle
        cx="13"
        cy="14"
        r="3"
        fill={c}
      >
        {active && (
          <animate
            attributeName="r"
            values="3;4;3"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      <path
        d="M4 22 L11 16 L17 20 L23 14 L32 22"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}


function MusicIcon({ active = false }) {
  const c = active ? '#8BAF8D' : '#A09080'

  const bars = [
    { x: 8, h: 10 },
    { x: 13, h: 18 },
    { x: 18, h: 14 },
    { x: 23, h: 20 },
    { x: 28, h: 8 },
  ]

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 36 36"
      fill="none"
    >
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={30 - b.h}
          width="3.5"
          height={b.h}
          rx="2"
          fill={c}
        >
          {active && (
            <animate
              attributeName="height"
              values={`${b.h};${b.h * 0.4};${b.h}`}
              dur="0.8s"
              begin={`${i * 0.15}s`}
              repeatCount="indefinite"
            />
          )}

          {active && (
            <animate
              attributeName="y"
              values={`${30 - b.h};${30 - b.h * 0.4};${30 - b.h}`}
              dur="0.8s"
              begin={`${i * 0.15}s`}
              repeatCount="indefinite"
            />
          )}
        </rect>
      ))}
    </svg>
  )
}


function CampaignIcon({ active = false }) {
  const c = active ? '#7A9EC5' : '#A09080'

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 36 36"
      fill="none"
    >
      <path
        d="M8 14 L22 9 L22 27 L8 22 Z"
        fill={
          active
            ? 'rgba(122,158,197,0.18)'
            : 'rgba(160,144,128,0.08)'
        }
        stroke={c}
        strokeWidth="1.5"
      >
        {active && (
          <animate
            attributeName="stroke-opacity"
            values="1;0.3;1"
            dur="1.2s"
            repeatCount="indefinite"
          />
        )}
      </path>

      <rect
        x="4"
        y="14"
        width="5"
        height="8"
        rx="1"
        fill={c}
      />

      <path
        d="M8 22 L10 30"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {active &&
        [0, 1, 2].map((i) => (
          <circle
            key={i}
            cx="28"
            cy="18"
            r={4 + i * 4}
            fill="none"
            stroke={c}
            strokeWidth="1"
            strokeOpacity="0.35"
          >
            <animate
              attributeName="r"
              values={`${4 + i * 4};${8 + i * 4};${4 + i * 4}`}
              dur="1.5s"
              begin={`${i * 0.3}s`}
              repeatCount="indefinite"
            />

            <animate
              attributeName="stroke-opacity"
              values="0.35;0;0.35"
              dur="1.5s"
              begin={`${i * 0.3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
    </svg>
  )
}


// ═════════════════════════════════════════════════════════════
// CONTENT TYPE CONFIG
// ═════════════════════════════════════════════════════════════

const TYPE_META = {
  script: {
    label: 'Script',
    bg: 'rgba(184,151,58,0.08)',
    strongBg: 'rgba(184,151,58,0.14)',
    border: 'rgba(184,151,58,0.28)',
    color: '#B8973A',
    icon: ScriptIcon,
  },

  visual: {
    label: 'Visual',
    bg: 'rgba(74,155,155,0.08)',
    strongBg: 'rgba(74,155,155,0.14)',
    border: 'rgba(74,155,155,0.28)',
    color: '#4A9B9B',
    icon: VisualIcon,
  },

  music: {
    label: 'Music',
    bg: 'rgba(139,175,141,0.08)',
    strongBg: 'rgba(139,175,141,0.14)',
    border: 'rgba(139,175,141,0.28)',
    color: '#8BAF8D',
    icon: MusicIcon,
  },

  campaign: {
    label: 'Campaign',
    bg: 'rgba(122,158,197,0.08)',
    strongBg: 'rgba(122,158,197,0.14)',
    border: 'rgba(122,158,197,0.28)',
    color: '#7A9EC5',
    icon: CampaignIcon,
  },
}


// ═════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════

export default function Dashboard() {
  const navigate = useNavigate()

  const { user } = useAuth()
  const { history } = useHistory()

  const [hoveredType, setHoveredType] = useState(null)


  // ───────────────────────────────────────────────────────────
  // STATS
  // ───────────────────────────────────────────────────────────

  const stats = {
    total: history.length,

    script: history.filter(
      (h) => h.content_type === 'script'
    ).length,

    music: history.filter(
      (h) => h.content_type === 'music'
    ).length,

    campaign: history.filter(
      (h) => h.content_type === 'campaign'
    ).length,
  }


  // ───────────────────────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────────────────────

  const getType = (type) => {
    return TYPE_META[type] || TYPE_META.script
  }


  const getTitle = (item) => {
    return (
      item.title ||
      item.name ||
      item.brand ||
      `${getType(item.content_type).label} Generation`
    )
  }


  const getDate = (item) => {
    if (!item.created_at) {
      return 'Recently created'
    }

    return new Date(
      item.created_at
    ).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }


  return (
    <AppLayout>

      <main
        style={{
          animation: 'dashboardFade 0.45s ease',
        }}
      >

        {/* ═══════════════════════════════════════════════
            TOP HEADER
        ═══════════════════════════════════════════════ */}

        <section
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '1.25rem',
          }}
        >

          <div>

            <div
              style={{
                fontSize: '0.67rem',
                color: '#A09080',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
                fontWeight: 600,
              }}
            >
              Dashboard
            </div>

            <h1
              style={{
                fontFamily:
                  'Cormorant Garamond, serif',
                fontSize: '2rem',
                fontWeight: 600,
                color: '#1A1208',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Welcome back
              {user?.displayName
                ? `, ${user.displayName}`
                : ''}

              <span
                style={{
                  color: '#B8973A',
                  marginLeft: '0.35rem',
                }}
              >
                ✦
              </span>
            </h1>

            <p
              style={{
                color: '#8A8070',
                fontSize: '0.78rem',
                margin:
                  '0.35rem 0 0 0',
              }}
            >
              Your creative workspace at a glance.
            </p>

          </div>


          <button
            onClick={() => navigate('/generate')}
            style={{
              background: '#B8973A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding:
                '0.62rem 1rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow:
                '0 3px 10px rgba(184,151,58,0.18)',
              transition:
                'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                'translateY(-2px)'
              e.currentTarget.style.boxShadow =
                '0 6px 16px rgba(184,151,58,0.24)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                'translateY(0)'
              e.currentTarget.style.boxShadow =
                '0 3px 10px rgba(184,151,58,0.18)'
            }}
          >
            + Create New
          </button>

        </section>


        {/* ═══════════════════════════════════════════════
            WELCOME / HERO PANEL
        ═══════════════════════════════════════════════ */}

        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '118px',
            borderRadius: '14px',
            border:
              '1px solid rgba(184,151,58,0.18)',
            background:
              'linear-gradient(105deg, rgba(184,151,58,0.10), rgba(255,255,255,0.96))',
            padding:
              '1.35rem 1.6rem',
            marginBottom: '1.35rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >

          {/* Decorative MuseAI shapes */}
          <div
            style={{
              position: 'absolute',
              right: '8%',
              top: '-45px',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border:
                '1px solid rgba(184,151,58,0.14)',
              opacity: 0.8,
            }}
          />

          <div
            style={{
              position: 'absolute',
              right: '16%',
              bottom: '-65px',
              width: '125px',
              height: '125px',
              borderRadius: '50%',
              border:
                '1px solid rgba(74,155,155,0.12)',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '65%',
            }}
          >

            <div
              style={{
                fontFamily:
                  'Cormorant Garamond, serif',
                fontSize: '1.35rem',
                fontWeight: 600,
                color: '#2A2015',
                marginBottom: '0.3rem',
              }}
            >
              Create something meaningful.
            </div>

            <p
              style={{
                margin: 0,
                color: '#8A8070',
                fontSize: '0.73rem',
                lineHeight: 1.5,
              }}
            >
              Turn your ideas into culturally
              intelligent scripts, visuals, music,
              and campaigns with MuseAI.
            </p>

          </div>

          <div
            style={{
              position: 'absolute',
              right: '2.5rem',
              top: '50%',
              transform:
                'translateY(-50%)',
              fontSize: '3rem',
              color:
                'rgba(184,151,58,0.15)',
              fontFamily:
                'Cormorant Garamond, serif',
              fontWeight: 600,
            }}
          >
            ✦
          </div>

        </section>


        {/* ═══════════════════════════════════════════════
            OVERVIEW
        ═══════════════════════════════════════════════ */}

        <div
          style={{
            fontSize: '0.68rem',
            color: '#A09080',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            marginBottom: '0.6rem',
          }}
        >
          Overview
        </div>


        <section
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(4, minmax(0, 1fr))',
            gap: '0.7rem',
            marginBottom: '1.5rem',
          }}
        >

          {/* TOTAL */}

          <div
            style={{
              minHeight: '104px',
              borderRadius: '10px',
              background:
                'rgba(184,151,58,0.11)',
              border:
                '1px solid rgba(184,151,58,0.18)',
              padding:
                '0.9rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
              }}
            >

              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background:
                    'rgba(255,255,255,0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#B8973A',
                  fontSize: '1rem',
                }}
              >
                ✦
              </div>

              <span
                style={{
                  fontSize: '0.6rem',
                  color: '#A09080',
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '0.05em',
                }}
              >
                Total
              </span>

            </div>

            <div>

              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#2A2015',
                  lineHeight: 1,
                }}
              >
                {stats.total}
              </div>

              <div
                style={{
                  fontSize: '0.63rem',
                  color: '#8A8070',
                  marginTop: '0.25rem',
                }}
              >
                Total Created
              </div>

            </div>

          </div>


          {/* SCRIPTS */}

          <div
            style={{
              minHeight: '104px',
              borderRadius: '10px',
              background:
                'rgba(184,151,58,0.11)',
              border:
                '1px solid rgba(184,151,58,0.18)',
              padding:
                '0.9rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
              }}
            >

              <ScriptIcon active={true} />

              <span
                style={{
                  fontSize: '0.6rem',
                  color: '#B8973A',
                  fontWeight: 700,
                }}
              >
                SCRIPTS
              </span>

            </div>

            <div>

              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#2A2015',
                  lineHeight: 1,
                }}
              >
                {stats.script}
              </div>

              <div
                style={{
                  fontSize: '0.63rem',
                  color: '#8A8070',
                  marginTop: '0.25rem',
                }}
              >
                Scripts Created
              </div>

            </div>

          </div>


          {/* MUSIC */}

          <div
            style={{
              minHeight: '104px',
              borderRadius: '10px',
              background:
                'rgba(139,175,141,0.12)',
              border:
                '1px solid rgba(139,175,141,0.2)',
              padding:
                '0.9rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
              }}
            >

              <MusicIcon active={true} />

              <span
                style={{
                  fontSize: '0.6rem',
                  color: '#6F9272',
                  fontWeight: 700,
                }}
              >
                MUSIC
              </span>

            </div>

            <div>

              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#2A2015',
                  lineHeight: 1,
                }}
              >
                {stats.music}
              </div>

              <div
                style={{
                  fontSize: '0.63rem',
                  color: '#8A8070',
                  marginTop: '0.25rem',
                }}
              >
                Music Created
              </div>

            </div>

          </div>


          {/* CAMPAIGNS */}

          <div
            style={{
              minHeight: '104px',
              borderRadius: '10px',
              background:
                'rgba(122,158,197,0.11)',
              border:
                '1px solid rgba(122,158,197,0.2)',
              padding:
                '0.9rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
              }}
            >

              <CampaignIcon active={true} />

              <span
                style={{
                  fontSize: '0.6rem',
                  color: '#6685A7',
                  fontWeight: 700,
                }}
              >
                CAMPAIGNS
              </span>

            </div>

            <div>

              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#2A2015',
                  lineHeight: 1,
                }}
              >
                {stats.campaign}
              </div>

              <div
                style={{
                  fontSize: '0.63rem',
                  color: '#8A8070',
                  marginTop: '0.25rem',
                }}
              >
                Campaigns Created
              </div>

            </div>

          </div>

        </section>


        {/* ═══════════════════════════════════════════════
            RECENT GENERATIONS
        ═══════════════════════════════════════════════ */}

        <section>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'space-between',
              marginBottom: '0.65rem',
            }}
          >

            <div>

              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#A09080',
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '0.08em',
                  fontWeight: 700,
                  marginBottom: '0.15rem',
                }}
              >
                Library
              </div>

              <h2
                style={{
                  fontFamily:
                    'Cormorant Garamond, serif',
                  fontSize: '1.3rem',
                  color: '#2A2015',
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                Recent Generations
              </h2>

            </div>


            <button
              onClick={() => navigate('/history')}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#B8973A',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View all →
            </button>

          </div>


          {history.length === 0 ? (

            /* EMPTY STATE */

            <div
              style={{
                background: '#FFFFFF',
                border:
                  '1px solid rgba(184,151,58,0.14)',
                borderRadius: '12px',
                padding: '2.25rem',
                textAlign: 'center',
                boxShadow:
                  '0 2px 10px rgba(100,80,20,0.04)',
              }}
            >

              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background:
                    'rgba(184,151,58,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin:
                    '0 auto 0.7rem',
                  color: '#B8973A',
                  fontSize: '1.4rem',
                }}
              >
                ✦
              </div>

              <div
                style={{
                  fontFamily:
                    'Cormorant Garamond, serif',
                  fontSize: '1.1rem',
                  color: '#2A2015',
                }}
              >
                No generations yet
              </div>

              <p
                style={{
                  fontSize: '0.7rem',
                  color: '#8A8070',
                  margin:
                    '0.3rem 0 1rem',
                }}
              >
                Your generated content will
                appear here.
              </p>

              <button
                onClick={() =>
                  navigate('/generate')
                }
                style={{
                  border: 'none',
                  background: '#B8973A',
                  color: '#FFFFFF',
                  borderRadius: '7px',
                  padding:
                    '0.55rem 1rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Start Creating
              </button>

            </div>

          ) : (

            /* RECENT CONTENT */

            <div
              style={{
                background: '#FFFFFF',
                border:
                  '1px solid rgba(184,151,58,0.12)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow:
                  '0 2px 10px rgba(100,80,20,0.04)',
              }}
            >

              {history
                .slice(0, 5)
                .map((item, index) => {

                  const type =
                    getType(
                      item.content_type
                    )

                  const Icon = type.icon

                  const id =
                    item.id || index

                  const isHovered =
                    hoveredType === id

                  return (
                    <div
                      key={id}
                      onMouseEnter={() =>
                        setHoveredType(id)
                      }
                      onMouseLeave={() =>
                        setHoveredType(null)
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.9rem',
                        padding:
                          '0.75rem 1rem',

                        borderBottom:
                          index <
                          Math.min(
                            history.length,
                            5
                          ) - 1
                            ? '1px solid rgba(184,151,58,0.08)'
                            : 'none',

                        background:
                          isHovered
                            ? type.bg
                            : '#FFFFFF',

                        transition:
                          'all 0.2s ease',

                        cursor: 'pointer',
                      }}
                    >

                      {/* ICON BLOCK */}

                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          minWidth: '48px',
                          borderRadius: '9px',
                          background:
                            type.strongBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition:
                            'transform 0.2s ease',
                          transform:
                            isHovered
                              ? 'scale(1.04)'
                              : 'scale(1)',
                        }}
                      >
                        <Icon
                          active={isHovered}
                        />
                      </div>


                      {/* CONTENT */}

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom:
                              '0.2rem',
                          }}
                        >

                          <div
                            style={{
                              fontSize:
                                '0.76rem',
                              fontWeight: 700,
                              color: '#2A2015',
                              overflow:
                                'hidden',
                              textOverflow:
                                'ellipsis',
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {getTitle(item)}
                          </div>

                          <span
                            style={{
                              flexShrink: 0,
                              padding:
                                '0.16rem 0.42rem',
                              borderRadius:
                                '20px',
                              background:
                                type.bg,
                              color:
                                type.color,
                              fontSize:
                                '0.52rem',
                              fontWeight: 700,
                              textTransform:
                                'uppercase',
                              letterSpacing:
                                '0.05em',
                            }}
                          >
                            {type.label}
                          </span>

                        </div>


                        <div
                          style={{
                            display: 'flex',
                            alignItems:
                              'center',
                            gap: '0.6rem',
                            fontSize:
                              '0.62rem',
                            color: '#8A8070',
                          }}
                        >

                          <span>
                            {getDate(item)}
                          </span>

                          <span
                            style={{
                              width: '3px',
                              height: '3px',
                              borderRadius:
                                '50%',
                              background:
                                '#C2B8A8',
                            }}
                          />

                          <span>
                            MuseAI
                          </span>

                        </div>

                      </div>


                      {/* RIGHT SIDE */}

                      <div
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: '0.65rem',
                        }}
                      >

                        <span
                          style={{
                            fontSize:
                              '0.58rem',
                            color: '#8A8070',
                          }}
                        >
                          Created
                        </span>

                        <span
                          style={{
                            color:
                              isHovered
                                ? type.color
                                : '#B5AA9A',
                            fontSize:
                              '0.9rem',
                            transition:
                              'all 0.2s ease',
                            transform:
                              isHovered
                                ? 'translateX(3px)'
                                : 'translateX(0)',
                          }}
                        >
                          →
                        </span>

                      </div>

                    </div>
                  )
                })}

            </div>

          )}

        </section>

      </main>


      {/* ═══════════════════════════════════════════════
          RESPONSIVE + ANIMATION
      ═══════════════════════════════════════════════ */}

      <style>{`

        @keyframes dashboardFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          main {
            width: 100%;
          }
        }

        @media (max-width: 760px) {

          section {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
          }

        }

        @media (max-width: 520px) {

          section {
            grid-template-columns:
              1fr !important;
          }

        }

      `}</style>

    </AppLayout>
  )
}