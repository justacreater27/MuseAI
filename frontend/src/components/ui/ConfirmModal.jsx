import React from 'react'

export default function ConfirmModal({ open, title = 'Confirm', message = '', confirmLabel = 'Yes', cancelLabel = 'Cancel', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,12,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
      <div style={{ width: '420px', maxWidth: '92%', background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 12px 40px rgba(0,0,0,0.35)', fontFamily: 'Jost, sans-serif' }}>
        <div style={{ marginBottom: '0.6rem', fontSize: '1.05rem', fontWeight: 700, color: '#1A1A14' }}>{title}</div>
        <div style={{ color: '#6F6B63', marginBottom: '1rem', fontSize: '0.95rem' }}>{message}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
          <button onClick={onCancel} style={{ padding: '0.55rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(120,120,120,0.12)', background: 'transparent', cursor: 'pointer' }}>{cancelLabel}</button>
          <button onClick={onConfirm} style={{ padding: '0.55rem 0.9rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#B8973A,#9A7D2A)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
