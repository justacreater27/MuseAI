/**
 * MuseAI — Animation Utilities
 * Reusable components and hooks for transitions across the whole app.
 *
 * Usage:
 *   import { PageWrapper, FadeIn, SlideIn, Toggle, Tabs, SkeletonBlock } from '../utils/animations'
 */

import { useState, useEffect, useRef, Children, cloneElement } from 'react'

// ── Page wrapper — wraps every page with an entrance animation ──────
export function PageWrapper({ children, className = '' }) {
  return (
    <div className={`page-enter ${className}`}>
      {children}
    </div>
  )
}

// ── FadeIn — fades + slides content in on mount ─────────────────────
export function FadeIn({ children, delay = 0, direction = 'up', duration = 400, className = '' }) {
  const animMap = { up: 'fadeUp', down: 'fadeDown', left: 'fadeLeft', right: 'fadeRight', scale: 'scaleIn', spring: 'springIn', fade: 'fadeIn' }
  const anim = animMap[direction] || 'fadeUp'
  return (
    <div
      className={className}
      style={{
        animation: `${anim} ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms both`,
      }}
    >
      {children}
    </div>
  )
}

// ── StaggerList — wraps a list of items with cascading entrance ──────
export function StaggerList({ children, baseDelay = 0, step = 70, direction = 'up', className = '' }) {
  const animMap = { up: 'fadeUp', down: 'fadeDown', left: 'fadeLeft', right: 'fadeRight' }
  const anim = animMap[direction] || 'fadeUp'
  return (
    <div className={className}>
      {Children.map(children, (child, i) =>
        child ? (
          <div style={{ animation: `${anim} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${baseDelay + i * step}ms both` }}>
            {child}
          </div>
        ) : null
      )}
    </div>
  )
}

// ── Collapse — smooth height toggle for any content ──────────────────
export function Collapse({ open, children }) {
  const ref = useRef(null)
  const [height, setHeight] = useState(open ? 'auto' : '0px')
  const [overflow, setOverflow] = useState(open ? 'visible' : 'hidden')

  useEffect(() => {
    if (!ref.current) return
    if (open) {
      const h = ref.current.scrollHeight
      setHeight(`${h}px`)
      setOverflow('hidden')
      const t = setTimeout(() => { setHeight('auto'); setOverflow('visible') }, 380)
      return () => clearTimeout(t)
    } else {
      const h = ref.current.scrollHeight
      setHeight(`${h}px`)
      setOverflow('hidden')
      requestAnimationFrame(() => requestAnimationFrame(() => setHeight('0px')))
    }
  }, [open])

  return (
    <div style={{
      height,
      overflow,
      transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div ref={ref}>{children}</div>
    </div>
  )
}

// ── Accordion item ────────────────────────────────────────────────────
export function AccordionItem({ trigger, children, defaultOpen = false, accentColor = '#B8973A' }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      border: `1px solid ${open ? accentColor + '35' : 'rgba(184,151,58,0.12)'}`,
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
      boxShadow: open ? `0 2px 12px ${accentColor}12` : 'none',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.85rem 1rem',
          background: open ? `${accentColor}08` : '#FAFAF8',
          border: 'none', cursor: 'pointer',
          transition: 'background 0.2s ease',
          fontFamily: 'Jost, sans-serif',
        }}
      >
        {typeof trigger === 'function' ? trigger(open) : trigger}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <Collapse open={open}>
        <div style={{ padding: '0.9rem 1rem 1rem', borderTop: `1px solid ${accentColor}12`, background: '#FFFFFF' }}>
          {children}
        </div>
      </Collapse>
    </div>
  )
}

// ── Toggle switch ────────────────────────────────────────────────────
export function ToggleSwitch({ value, onChange, onColor = '#B8973A', offColor = '#D1C9B8', size = 'md' }) {
  const sizes = {
    sm: { track: { width: 34, height: 20 }, thumb: 16, travel: 14 },
    md: { track: { width: 42, height: 24 }, thumb: 20, travel: 18 },
    lg: { track: { width: 52, height: 30 }, thumb: 26, travel: 22 },
  }
  const s = sizes[size] || sizes.md
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: 'inline-flex', alignItems: 'center',
        width: `${s.track.width}px`, height: `${s.track.height}px`,
        borderRadius: '50px', padding: '2px',
        background: value ? onColor : offColor,
        border: 'none', cursor: 'pointer',
        transition: 'background 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: `${s.thumb}px`, height: `${s.thumb}px`,
        borderRadius: '50%',
        background: '#FFFFFF',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        transition: `transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)`,
        transform: value ? `translateX(${s.travel}px)` : 'translateX(0px)',
      }} />
    </button>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────
export function AnimatedTabs({ tabs, active, onChange, accentColor = '#B8973A' }) {
  const containerRef = useRef(null)
  const [sliderStyle, setSliderStyle] = useState({})

  useEffect(() => {
    if (!containerRef.current) return
    const activeEl = containerRef.current.querySelector(`[data-tab="${active}"]`)
    if (!activeEl) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const tabRect = activeEl.getBoundingClientRect()
    setSliderStyle({
      width: `${tabRect.width}px`,
      transform: `translateX(${tabRect.left - containerRect.left - 3}px)`,
    })
  }, [active])

  return (
    <div ref={containerRef} style={{
      position: 'relative', display: 'inline-flex',
      background: `${accentColor}0a`, borderRadius: '10px', padding: '3px',
      border: `1px solid ${accentColor}18`,
    }}>
      {/* Sliding background */}
      <div style={{
        position: 'absolute', top: '3px', left: '3px',
        height: 'calc(100% - 6px)',
        background: '#FFFFFF',
        borderRadius: '7px',
        boxShadow: '0 1px 4px rgba(100,80,20,0.12)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'none',
        ...sliderStyle,
      }} />
      {tabs.map(tab => (
        <button
          key={tab.value}
          data-tab={tab.value}
          onClick={() => onChange(tab.value)}
          style={{
            position: 'relative', zIndex: 1,
            padding: '0.35rem 0.85rem',
            border: 'none', background: 'transparent',
            borderRadius: '7px', cursor: 'pointer',
            fontSize: '0.78rem', fontFamily: 'Jost, sans-serif',
            fontWeight: active === tab.value ? 600 : 400,
            color: active === tab.value ? accentColor : '#8A8070',
            transition: 'color 0.2s ease, font-weight 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ── Hover card ────────────────────────────────────────────────────────
export function HoverCard({ children, color = '#B8973A', style: extraStyle = {}, ...props }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, border-color 0.25s ease',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov ? `0 8px 28px ${color}22` : `0 2px 8px ${color}0d`,
        ...extraStyle,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Copy button ───────────────────────────────────────────────────────
export function CopyButton({ text, color = '#B8973A', children, style: extraStyle = {} }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button
      onClick={copy}
      style={{
        background: copied ? 'rgba(90,138,106,0.1)' : 'transparent',
        border: `1px solid ${copied ? '#5A8A6A' : color + '38'}`,
        color: copied ? '#5A8A6A' : color,
        borderRadius: '7px', padding: '3px 10px',
        cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700,
        fontFamily: 'Jost, sans-serif',
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        transition: 'all 0.22s ease',
        transform: copied ? 'scale(0.95)' : 'scale(1)',
        ...extraStyle,
      }}
      onMouseEnter={e => { if (!copied) e.currentTarget.style.transform = 'scale(1.06)' }}
      onMouseLeave={e => { if (!copied) e.currentTarget.style.transform = 'scale(1)' }}
    >
      {copied
        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
        : children || 'Copy'
      }
    </button>
  )
}

// ── Animated counter ──────────────────────────────────────────────────
export function AnimatedCounter({ value, color = '#B8973A' }) {
  const [display, setDisplay] = useState(value)
  const [key, setKey] = useState(0)
  const prev = useRef(value)

  useEffect(() => {
    if (value !== prev.current) {
      setKey(k => k + 1)
      prev.current = value
    }
    setDisplay(value)
  }, [value])

  return (
    <span key={key} style={{
      display: 'inline-block',
      animation: 'countUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      color,
    }}>
      {display}
    </span>
  )
}

// ── Skeleton block ────────────────────────────────────────────────────
export function SkeletonBlock({ width = '100%', height = '1rem', borderRadius = '8px', style: extraStyle = {} }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, #F0EDE4 25%, #E8E4D8 50%, #F0EDE4 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
      ...extraStyle,
    }} />
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────
export function SkeletonCard({ lines = 3 }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(184,151,58,0.1)', padding: '1.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <SkeletonBlock width="34px" height="34px" borderRadius="10px" />
        <SkeletonBlock width="140px" height="18px" />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} width={i === lines - 1 ? '65%' : '100%'} height="14px" style={{ marginBottom: '0.5rem' }} />
      ))}
    </div>
  )
}

// ── Toast / notification ──────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const colors = { success: '#5A8A6A', error: '#C0604A', info: '#6482B4', warning: '#B8973A' }
  const icons  = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }
  const color  = colors[type] || colors.info

  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.75rem 1.1rem',
      background: '#FFFFFF',
      border: `1px solid ${color}35`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '10px',
      boxShadow: `0 4px 20px ${color}18`,
      animation: 'toastSlide 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      fontFamily: 'Jost, sans-serif',
      fontSize: '0.84rem', color: '#2A2015',
      minWidth: '240px', maxWidth: '360px',
    }}>
      <span style={{ color, fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>{icons[type]}</span>
      <span style={{ flex: 1, lineHeight: 1.45 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9A8A70', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0, padding: '0 2px' }}>✕</button>
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────
export function Modal({ open, onClose, children, maxWidth = '520px' }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(26,18,8,0.45)',
        animation: 'overlayIn 0.25s ease',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF', borderRadius: '20px',
          padding: '2rem', width: '100%', maxWidth,
          boxShadow: '0 24px 80px rgba(26,18,8,0.2)',
          animation: 'modalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(184,151,58,0.08)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', color: '#8A8070', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,151,58,0.15)'; e.currentTarget.style.transform = 'scale(1.1)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(184,151,58,0.08)'; e.currentTarget.style.transform = 'scale(1)' }}>
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

// ── Progress bar ────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = '#B8973A', height = '6px', label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontFamily: 'Jost, sans-serif', fontSize: '0.74rem', color: '#8A8070' }}>
          <span>{label}</span>
          <span style={{ color, fontWeight: 600 }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{ background: `${color}18`, borderRadius: '50px', height, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '50px',
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          width: `${pct}%`,
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  )
}

// ── Ripple button ─────────────────────────────────────────────────────
export function RippleButton({ children, onClick, color = '#B8973A', style: extraStyle = {}, disabled = false, ...props }) {
  const btnRef = useRef(null)

  const handleClick = (e) => {
    if (disabled) return
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      width:6px; height:6px;
      left:${x - 3}px; top:${y - 3}px;
      background:${color}40;
      animation:ripple 0.55s ease-out forwards;
    `
    btn.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
    onClick?.(e)
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={disabled}
      style={{ position: 'relative', overflow: 'hidden', ...extraStyle }}
      {...props}
    >
      {children}
    </button>
  )
}