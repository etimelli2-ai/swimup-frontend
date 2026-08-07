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
  Ticket,
  ChevronRight,
  CreditCard,
  ShoppingBag,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const DiscordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
)

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin  = user?.role === 'admin'
  const isClient = user?.role === 'client'

  const navItems = isAdmin ? [
    { path: '/admin',          label: 'Dashboard',   icon: LayoutDashboard },
    { path: '/admin/avis',     label: 'Avis',         icon: Star },
    { path: '/admin/users',    label: 'Membres',      icon: User },
    { path: '/admin/retraits', label: 'Retraits',     icon: Wallet },
    { path: '/admin/loterie',  label: 'Loterie',      icon: Ticket },
    { path: '/admin/commande', label: 'Commande',     icon: FileText },
    { path: '/admin/boutique', label: 'Boutique',     icon: ShoppingBag },
  ] : isClient ? [
    { path: '/client',           label: 'Dashboard',    icon: LayoutDashboard },
    { path: '/client/payer',     label: 'Commander',    icon: CreditCard },
    { path: '/client/commandes', label: 'Mes commandes', icon: ShoppingBag },
    { path: '/profil',           label: 'Profil',       icon: User },
  ] : [
    { path: '/dashboard',    label: 'Tableau de bord',  icon: LayoutDashboard },
    { path: '/avis',         label: 'Avis disponibles', icon: Star },
    { path: '/mon-avis',     label: 'Mon avis',         icon: FileText },
    { path: '/portefeuille', label: 'Portefeuille',     icon: Wallet },
    { path: '/loterie',      label: 'Loterie',          icon: Ticket },
    { path: '/boutique',     label: 'Boutique',         icon: ShoppingBag },
    { path: '/profil',       label: 'Profil',           icon: User },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/admin'     && location.pathname === '/admin')     return true
    if (path === '/client'    && location.pathname === '/client')    return true
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true
    return location.pathname === path ||
      (path !== '/admin' && path !== '/client' && path !== '/dashboard' &&
       location.pathname.startsWith(path + '/'))
  }

  const NavLink = ({ item, onClick }) => {
    const active = isActive(item.path)
    const Icon = item.icon
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          active
            ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
        }`}
      >
        <Icon size={18} className={active ? 'text-sky-500' : 'text-slate-400 dark:text-slate-500'} />
        {item.label}
        {active && <ChevronRight size={14} className="ml-auto text-sky-400" />}
      </Link>
    )
  }

  const DiscordButton = () => (
    
      href="https://discord.gg/Dt2rmcHB5u"
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:text-indigo-400 transition-all"
    >
      <DiscordIcon />
      Rejoindre Discord
    </a>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full z-20">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
          <Link to={isAdmin ? '/admin' : isClient ? '/client' : '/dashboard'} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center shadow-sm">
              <Star size={18} className="text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">SwimUp</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => <NavLink key={item.path} item={item} />)}
        </nav>

        <div className="p-3 border-t border-slate-100 dark:border-slate-700 space-y-0.5">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{user?.email}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{user?.role}</p>
          </div>
          <DiscordButton />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-30 flex items-center justify-between px-4">
        <Link to={isAdmin ? '/admin' : isClient ? '/client' : '/dashboard'} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <Star size={15} className="text-white fill-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">SwimUp</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
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
            className="lg:hidden fixed inset-0 z-20 bg-white dark:bg-slate-800 pt-14"
          >
            <nav className="p-3 space-y-0.5">
              {navItems.map(item => (
                <NavLink key={item.path} item={item} onClick={() => setMobileOpen(false)} />
              ))}
              <DiscordButton />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
