import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { HistoryProvider } from './context/HistoryContext'
import { LanguageProvider } from './context/LanguageContext'
import ProtectedRoute from './components/ui/ProtectedRoute'

import Home      from './pages/Home'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'
import Generate  from './pages/Generate'
import History   from './pages/History'
import Profile   from './pages/Profile'
import Pricing   from './pages/Pricing'
import Settings  from './pages/Settings'
import HelpDesk  from './pages/HelpDesk'

export default function App() {
  return (
    <AuthProvider>
      <HistoryProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"          element={<Home />} />
              <Route path="/login"     element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/generate"  element={<ProtectedRoute><Generate /></ProtectedRoute>} />
              <Route path="/history"   element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/pricing"   element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
              <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/helpdesk"  element={<ProtectedRoute><HelpDesk /></ProtectedRoute>} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </HistoryProvider>
    </AuthProvider>
  )
}