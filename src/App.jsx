import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Avis from './pages/Avis'
import MonAvis from './pages/MonAvis'
import Profil from './pages/Profil'
import Portefeuille from './pages/Portefeuille'
import Loterie from './pages/Loterie'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAvis from './pages/admin/AdminAvis'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRetraits from './pages/admin/AdminRetraits'
import AdminLoterie from './pages/admin/AdminLoterie'
import ClientDashboard from './pages/client/ClientDashboard'
import Layout from './components/Layout'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  // Fix — Navigate au lieu de return undefined
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index                element={<Dashboard />} />
        <Route path="avis"          element={<Avis />} />
        <Route path="mon-avis"      element={<MonAvis />} />
        <Route path="portefeuille"  element={<Portefeuille />} />
        <Route path="profil"        element={<Profil />} />
        <Route path="loterie"       element={<Loterie />} />
      </Route>

      <Route path="/admin" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
        <Route index           element={<AdminDashboard />} />
        <Route path="avis"     element={<AdminAvis />} />
        <Route path="users"    element={<AdminUsers />} />
        <Route path="retraits" element={<AdminRetraits />} />
        <Route path="loterie"  element={<AdminLoterie />} />
        <Route path="commande" element={<ClientDashboard />} />
      </Route>

      <Route path="/client" element={<PrivateRoute roles={['client','admin']}><Layout /></PrivateRoute>}>
        <Route index element={<ClientDashboard />} />
      </Route>

      {/* Fix — Route 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
