import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Sidebar />
      <main className="app-main" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2.5rem 3rem',
        maxWidth: '1100px',
        background: 'var(--bg-page)',
      }}>
        {children}
      </main>
    </div>
  )
}
