import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF7' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2.5rem 3rem',
        maxWidth: '1100px',
        background: '#FAFAF7',
      }}>
        {children}
      </main>
    </div>
  )
}
