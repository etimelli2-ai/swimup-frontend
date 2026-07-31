import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Avis from './pages/Avis'
import MonAvis from './pages/MonAvis'
import Portefeuille from './pages/Portefeuille'
import Profil from './pages/Profil'
import Loterie from './pages/Loterie'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAvis from './pages/admin/AdminAvis'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRetraits from './pages/admin/AdminRetraits'
import AdminLoterie from './pages/admin/AdminLoterie'
import ClientDashboard from './pages/client/ClientDashboard'
import ClientAvis from './pages/client/ClientAvis'
import ClientPaiement from './pages/client/ClientPaiement'
import { useAuth } from './hooks/useAuth'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="w-10 h-10 border-3 border-aqua-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <Layout>{children}</Layout>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/avis" element={<PrivateRoute><Avis /></PrivateRoute>} />
      <Route path="/mon-avis" element={<PrivateRoute><MonAvis /></PrivateRoute>} />
      <Route path="/portefeuille" element={<PrivateRoute><Portefeuille /></PrivateRoute>} />
      <Route path="/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
      <Route path="/loterie" element={<PrivateRoute><Loterie /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/avis" element={<PrivateRoute roles={['admin']}><AdminAvis /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
      <Route path="/admin/retraits" element={<PrivateRoute roles={['admin']}><AdminRetraits /></PrivateRoute>} />
      <Route path="/admin/loterie" element={<PrivateRoute roles={['admin']}><AdminLoterie /></PrivateRoute>} />
      <Route path="/client" element={<PrivateRoute roles={['client','admin']}><ClientDashboard /></PrivateRoute>} />
      <Route path="/client/avis" element={<PrivateRoute roles={['client','admin']}><ClientAvis /></PrivateRoute>} />
      <Route path="/client/paiement" element={<PrivateRoute roles={['client','admin']}><ClientPaiement /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
