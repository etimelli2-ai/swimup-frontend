import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import {
  LayoutDashboard, ClipboardList, Wallet, User, Trophy,
  Sun, Moon, LogOut, Shield, Briefcase
} from 'lucide-react'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const { pathname } = useLocation()

  const isActive = (path) => pathname === path

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Accueil' },
    { path: '/avis', icon: ClipboardList, label: 'Avis' },
    { path: '/portefeuille', icon: Wallet, label: 'Solde' },
    { path: '/loterie', icon: Trophy, label: 'Loterie' },
    { path: '/profil', icon: User, label: 'Profil' },
  ]

  const adminItems = [
    { path: '/admin', icon: Shield, label: 'Admin' },
  ]

  const clientItems = [
    { path: '/client', icon: Briefcase, label: 'Client' },
  ]

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-xl text-gradient">
            SwimUp
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
            </button>
            <button onClick={logout} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pt-5">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 z-50">
        <div className="max-w-lg mx-auto px-2 flex items-center justify-around h-16">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} className={isActive(path) ? 'nav-item-active' : 'nav-item'}>
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
          {user?.role === 'admin' && adminItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} className={isActive(path) ? 'nav-item-active' : 'nav-item'}>
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
          {['client','admin'].includes(user?.role) && clientItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} className={isActive(path) ? 'nav-item-active' : 'nav-item'}>
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
