import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import { HistoryProvider } from './context/HistoryContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider }   from './context/ThemeContext'
import ProtectedRoute from './components/ui/ProtectedRoute'

import Home         from './pages/Home'
import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Generate     from './pages/Generate'
import History      from './pages/History'
import Profile      from './pages/Profile'
import Pricing      from './pages/Pricing'
import Settings     from './pages/Settings'
import HelpDesk     from './pages/HelpDesk'
import Aihub        from './pages/Aihub'
import BrandAdvisor from './pages/BrandAdvisor'
import ViralStudio  from './pages/ViralStudio'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/"                      element={<Home />} />
        <Route path="/login"                 element={<Login />} />
        <Route path="/dashboard"             element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/generate"              element={<ProtectedRoute><Generate /></ProtectedRoute>} />
        <Route path="/history"               element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/profile"               element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/pricing"               element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
        <Route path="/settings"              element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/helpdesk"              element={<ProtectedRoute><HelpDesk /></ProtectedRoute>} />
        <Route path="/ai-suggestion"         element={<ProtectedRoute><Aihub /></ProtectedRoute>} />
        <Route path="/ai-suggestion/brand"   element={<ProtectedRoute><BrandAdvisor /></ProtectedRoute>} />
        <Route path="/ai-suggestion/viral"   element={<ProtectedRoute><ViralStudio /></ProtectedRoute>} />
        <Route path="*"                      element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    // ThemeProvider must wrap everything so useTheme() works in all components
    <ThemeProvider>
      <AuthProvider>
        <HistoryProvider>
          <LanguageProvider>
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </LanguageProvider>
        </HistoryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}