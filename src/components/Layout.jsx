import { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard,
  Star,
  FileText,
  Wallet,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Ticket,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = user?.role === 'admin'
  const isClient = user?.role === 'client'

  const navItems = isAdmin ? [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/avis', label: 'Avis', icon: Star },
    { path: '/admin/users', label: 'Membres', icon: User },
    { path: '/admin/retraits', label: 'Retraits', icon: Wallet },
    { path: '/admin/loterie', label: 'Loterie', icon: Ticket },
    { path: '/admin/commande', label: 'Commande', icon: FileText },
  ] : isClient ? [
    { path: '/client', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/profil', label: 'Profil', icon: User },
  ] : [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/avis', label: 'Avis disponibles', icon: Star },
    { path: '/mon-avis', label: 'Mon avis', icon: FileText },
    { path: '/portefeuille', label: 'Portefeuille', icon: Wallet },
    { path: '/loterie', label: 'Loterie', icon: Ticket },
    { path: '/profil', label: 'Profil', icon: User },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : []),
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true
    if (path === '/client' && location.pathname === '/client') return true
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true
    return location.pathname === path || (path !== '/admin' && path !== '/client' && path !== '/dashboard' && location.pathname.startsWith(path + '/'))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-20">
        <div className="p-5 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center shadow-sm">
              <Star size={18} className="text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">SwimUp</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={18} className={active ? 'text-sky-500' : 'text-slate-400'} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto text-sky-400" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-slate-700 truncate">{user?.email}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <Star size={15} className="text-white fill-white" />
          </div>
          <span className="font-bold text-slate-900">SwimUp</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-500">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="lg:hidden fixed inset-0 z-20 bg-white pt-14"
          >
            <nav className="p-3 space-y-0.5">
              {navItems.map((item) => {
                const active = isActive(item.path)
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content — Fix: Outlet au lieu de children */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
