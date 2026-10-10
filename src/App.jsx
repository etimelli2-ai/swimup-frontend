import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
const Avis = lazy(() => import('./pages/Avis'))
const Profil = lazy(() => import('./pages/Profil'))
const Portefeuille = lazy(() => import('./pages/Portefeuille'))
const Loterie = lazy(() => import('./pages/Loterie'))
const Boutique = lazy(() => import('./pages/Boutique'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminAvis = lazy(() => import('./pages/admin/AdminAvis'))
const AdminAvisPublics = lazy(() => import('./pages/admin/AdminAvisPublics'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminRetraits = lazy(() => import('./pages/admin/AdminRetraits'))
const AdminLoterie = lazy(() => import('./pages/admin/AdminLoterie'))
const AdminBoutique = lazy(() => import('./pages/admin/AdminBoutique'))
const AdminCommandes = lazy(() => import('./pages/admin/AdminCommandes'))
const AdminProspection = lazy(() => import('./pages/admin/AdminProspection'))
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'))
const ClientPaiement = lazy(() => import('./pages/client/ClientPaiement'))
const ClientCommandes = lazy(() => import('./pages/client/ClientCommandes'))
const ClientSuccess = lazy(() => import('./pages/client/ClientSuccess'))
const ClientPremium = lazy(() => import('./pages/client/ClientPremium'))
const ClientStats = lazy(() => import('./pages/client/ClientStats'))
const ClientOutils = lazy(() => import('./pages/client/ClientOutils'))
const Parrainage = lazy(() => import('./pages/Parrainage'))
import PublicCommander from './pages/PublicCommander'
const PublicSuivi = lazy(() => import('./pages/PublicSuivi'))
const AideCommercantsIndex = lazy(() => import('./pages/AideCommercants').then(m => ({ default: m.AideCommercantsIndex })))
const AideCommercantsGuide = lazy(() => import('./pages/AideCommercants').then(m => ({ default: m.AideCommercantsGuide })))
const VerifierEmail = lazy(() => import('./pages/VerifierEmail'))
const MotDePasseOublie = lazy(() => import('./pages/MotDePasseOublie'))
const ReinitialiserMotDePasse = lazy(() => import('./pages/ReinitialiserMotDePasse'))
const VerificationRequise = lazy(() => import('./pages/VerificationRequise'))
import Layout from './components/Layout'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  // Email non vérifié — bloque tout l'accès au site (sauf pour les admins)
  // jusqu'à confirmation du lien reçu par email.
  if (user.role !== 'admin' && user.email_verifie === false) {
    return <Navigate to="/verification-requise" replace />
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

// Racine du site (swimup.net) : un visiteur non connecté arrive sur la page de
// commande publique au lieu d'être renvoyé vers /login — c'est la page qui
// vend, elle doit être la première chose qu'il voit. Un compte connecté garde
// son espace comme avant, et les autres adresses (/dashboard, /avis...) restent
// protégées. Pendant le chargement de la session on laisse PrivateRoute afficher
// son spinner, pour ne pas montrer la page publique une demi-seconde à un
// membre déjà connecté.
function RacineRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (!loading && !user && location.pathname === '/') return <PublicCommander />
  return <PrivateRoute>{children}</PrivateRoute>
}

// Le compte doit être connecté pour voir cette page, mais elle ne doit PAS
// elle-même être bloquée par la vérification email (sinon boucle infinie).
function RouteConnecteSeulement({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>}>
    <Routes>
      {/* Pages publiques — sans auth */}
      <Route path="/commander" element={<PublicCommander />} />
      <Route path="/suivi"     element={<PublicSuivi />} />
      <Route path="/aide-commercants" element={<AideCommercantsIndex />} />
      <Route path="/aide-commercants/:slug" element={<AideCommercantsGuide />} />
      <Route path="/verifier-email" element={<VerifierEmail />} />
      <Route path="/verification-requise" element={
        <RouteConnecteSeulement><VerificationRequise /></RouteConnecteSeulement>
      } />

      <Route path="/login"    element={<Login />} />
      <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />
      <Route path="/register" element={<Register />} />

      {/* Routes membres */}
      <Route path="/" element={<RacineRoute><Layout /></RacineRoute>}>
        <Route index               element={<Dashboard />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="avis"         element={<Avis />} />
        {/* "Mon avis" a fusionné dans /avis (même page : réserver, remplir, suivre) */}
        <Route path="mon-avis"     element={<Navigate to="/avis" replace />} />
        <Route path="portefeuille" element={<Portefeuille />} />
        <Route path="profil"       element={<Profil />} />
        <Route path="loterie"      element={<Loterie />} />
        <Route path="boutique"     element={<Boutique />} />
        <Route path="parrainage"   element={<Parrainage />} />
      </Route>

      {/* Routes admin */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
        <Route index           element={<AdminDashboard />} />
        <Route path="avis"     element={<AdminAvis />} />
        <Route path="avis-publics" element={<AdminAvisPublics />} />
        <Route path="users"    element={<AdminUsers />} />
        <Route path="retraits" element={<AdminRetraits />} />
        <Route path="loterie"  element={<AdminLoterie />} />
        <Route path="commande" element={<ClientDashboard />} />
        <Route path="commandes-clients" element={<AdminCommandes />} />
        <Route path="boutique" element={<AdminBoutique />} />
        <Route path="prospection" element={<AdminProspection />} />
      </Route>

      {/* Routes client */}
      <Route path="/client" element={<PrivateRoute roles={['client','admin']}><Layout /></PrivateRoute>}>
        <Route index            element={<ClientDashboard />} />
        <Route path="payer"     element={<ClientPaiement />} />
        <Route path="premium"   element={<ClientPremium />} />
        <Route path="commandes" element={<ClientCommandes />} />
        <Route path="stats"     element={<ClientStats />} />
        <Route path="outils"    element={<ClientOutils />} />
      </Route>

      <Route path="/client/success" element={
        <PrivateRoute roles={['client','admin']}>
          <ClientSuccess />
        </PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  )
}
