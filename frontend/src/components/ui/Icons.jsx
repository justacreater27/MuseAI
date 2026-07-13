/**
 * Icons — shared SVG icon set
 * src/components/ui/Icons.jsx
 *
 * All icons use stroke="currentColor" so they inherit color from parent.
 * Default size 20x20, pass size prop to override.
 */

const d = (size, children, extra = {}) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    {...extra}
  >
    {children}
  </svg>
)

// ── Dashboard ──────────────────────────────────────────────────────────

// Total Created — sparkle diamond
export const IconSparkle = ({ size = 20 }) => d(size, <>
  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
</>)

// Script — document with lines
export const IconScript = ({ size = 20 }) => d(size, <>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
  <polyline points="14 2 14 8 20 8"/>
  <line x1="16" y1="13" x2="8" y2="13"/>
  <line x1="16" y1="17" x2="8" y2="17"/>
  <line x1="10" y1="9" x2="8" y2="9"/>
</>)

// Visual — image/landscape
export const IconVisual = ({ size = 20 }) => d(size, <>
  <rect x="3" y="3" width="18" height="18" rx="2"/>
  <circle cx="8.5" cy="8.5" r="1.5"/>
  <polyline points="21 15 16 10 5 21"/>
</>)

// Music / Jingle — music note
export const IconMusic = ({ size = 20 }) => d(size, <>
  <path d="M9 18V5l12-2v13"/>
  <circle cx="6" cy="18" r="3"/>
  <circle cx="18" cy="16" r="3"/>
</>)

// Campaign — megaphone
export const IconCampaign = ({ size = 20 }) => d(size, <>
  <path d="M22 3L9.218 10.083"/>
  <path d="M11.698 20.334L7 17H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h3l4.698-2.667"/>
  <path d="M22 3L22 21"/>
  <path d="M22 21L9.218 13.917"/>
</>)

// ── Brand Advisor sections ─────────────────────────────────────────────

// Brand Names — tag / label
export const IconBrandNames = ({ size = 20 }) => d(size, <>
  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
  <line x1="7" y1="7" x2="7.01" y2="7"/>
</>)

// Taglines — quote / speech
export const IconTaglines = ({ size = 20 }) => d(size, <>
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
</>)

// Brand Strategy — chess / strategy
export const IconStrategy = ({ size = 20 }) => d(size, <>
  <path d="M2 20h20"/>
  <path d="M5 20V8l7-6 7 6v12"/>
  <path d="M9 20v-5h6v5"/>
  <path d="M12 8v4"/>
  <path d="M10 10h4"/>
</>)

// Target Persona — person
export const IconPersona = ({ size = 20 }) => d(size, <>
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
</>)

// Brand Identity — palette
export const IconIdentity = ({ size = 20 }) => d(size, <>
  <circle cx="13.5" cy="6.5" r=".5"/>
  <circle cx="17.5" cy="10.5" r=".5"/>
  <circle cx="8.5" cy="7.5" r=".5"/>
  <circle cx="6.5" cy="12.5" r=".5"/>
  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
</>)

// Brand Voice — mic / voice
export const IconVoice = ({ size = 20 }) => d(size, <>
  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
  <line x1="12" y1="19" x2="12" y2="23"/>
  <line x1="8" y1="23" x2="16" y2="23"/>
</>)

// Content Strategy — layout / grid
export const IconContent = ({ size = 20 }) => d(size, <>
  <rect x="3" y="3" width="18" height="18" rx="2"/>
  <path d="M3 9h18"/>
  <path d="M9 21V9"/>
</>)

// Product Branding — box / package
export const IconProduct = ({ size = 20 }) => d(size, <>
  <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"/>
  <polyline points="2.32 6.16 12 11 21.68 6.16"/>
  <line x1="12" y1="22.76" x2="12" y2="11"/>
</>)

// Growth Strategy — trending up
export const IconGrowth = ({ size = 20 }) => d(size, <>
  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
  <polyline points="17 6 23 6 23 12"/>
</>)

// Bonus Assets — gift
export const IconBonus = ({ size = 20 }) => d(size, <>
  <polyline points="20 12 20 22 4 22 4 12"/>
  <rect x="2" y="7" width="20" height="5"/>
  <line x1="12" y1="22" x2="12" y2="7"/>
  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
</>)

// ── Viral Studio sections ──────────────────────────────────────────────

// Viral Hook — fishing hook / lightning
export const IconHook = ({ size = 20 }) => d(size, <>
  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
</>)

// Full Script — film / clapperboard
export const IconScrollScript = ({ size = 20 }) => d(size, <>
  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
  <line x1="16" y1="8" x2="2" y2="22"/>
  <line x1="17.5" y1="15" x2="9" y2="15"/>
</>)

// Scene Breakdown — film strip
export const IconScene = ({ size = 20 }) => d(size, <>
  <rect x="2" y="2" width="20" height="20" rx="2.18"/>
  <line x1="7" y1="2" x2="7" y2="22"/>
  <line x1="17" y1="2" x2="17" y2="22"/>
  <line x1="2" y1="12" x2="22" y2="12"/>
  <line x1="2" y1="7" x2="7" y2="7"/>
  <line x1="2" y1="17" x2="7" y2="17"/>
  <line x1="17" y1="17" x2="22" y2="17"/>
  <line x1="17" y1="7" x2="22" y2="7"/>
</>)

// Caption / pen writing
export const IconCaption = ({ size = 20 }) => d(size, <>
  <path d="M12 20h9"/>
  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
</>)

// Hashtag
export const IconHashtag = ({ size = 20 }) => d(size, <>
  <line x1="4" y1="9" x2="20" y2="9"/>
  <line x1="4" y1="15" x2="20" y2="15"/>
  <line x1="10" y1="3" x2="8" y2="21"/>
  <line x1="16" y1="3" x2="14" y2="21"/>
</>)

// Music suggestion — headphones
export const IconHeadphones = ({ size = 20 }) => d(size, <>
  <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
</>)

// Editing tips — scissors
export const IconEdit = ({ size = 20 }) => d(size, <>
  <circle cx="6" cy="6" r="3"/>
  <circle cx="6" cy="18" r="3"/>
  <line x1="20" y1="4" x2="8.12" y2="15.88"/>
  <line x1="14.47" y1="14.48" x2="20" y2="20"/>
  <line x1="8.12" y1="8.12" x2="12" y2="12"/>
</>)

// Growth insights — bar chart up
export const IconChart = ({ size = 20 }) => d(size, <>
  <line x1="18" y1="20" x2="18" y2="10"/>
  <line x1="12" y1="20" x2="12" y2="4"/>
  <line x1="6" y1="20" x2="6" y2="14"/>
  <line x1="2" y1="20" x2="22" y2="20"/>
</>)

// ── Misc ───────────────────────────────────────────────────────────────

// Back arrow
export const IconBack = ({ size = 16 }) => d(size, <>
  <line x1="19" y1="12" x2="5" y2="12"/>
  <polyline points="12 19 5 12 12 5"/>
</>)

// Download
export const IconDownload = ({ size = 14 }) => d(size, <>
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="7 10 12 15 17 10"/>
  <line x1="12" y1="15" x2="12" y2="3"/>
</>)

// Regenerate
export const IconRefresh = ({ size = 14 }) => d(size, <>
  <polyline points="1 4 1 10 7 10"/>
  <path d="M3.51 15a9 9 0 1 0 .49-4.96"/>
</>)

// Copy
export const IconCopy = ({ size = 14 }) => d(size, <>
  <rect x="9" y="9" width="13" height="13" rx="2"/>
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
</>)

// Check
export const IconCheck = ({ size = 14 }) => d(size, <>
  <polyline points="20 6 9 17 4 12"/>
</>)