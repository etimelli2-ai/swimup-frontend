import { useState, useEffect } from 'react'
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
  ClipboardCheck,
  Globe,
  Crown,
  QrCode,
  Search,
  TrendingUp,
  Gift,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'
import { springSheet, springSmooth } from '../lib/motion'
import { ACCENT_DEFAUT, couleurHover, ARRONDIS, TAILLES, ICONES } from '../lib/themePremium'

const DiscordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
)

function DiscordButton() {
  return React.createElement(
    'a',
    {
      href: 'https://discord.gg/Dt2rmcHB5u',
      target: '_blank',
      rel: 'noreferrer',
      className: 'flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:text-indigo-400 transition-all'
    },
    React.createElement(DiscordIcon),
    'Rejoindre Discord'
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin  = user?.role === 'admin'
  const isClient = user?.role === 'client'

  // Thème premium — couleur d'accent, forme, taille du texte, nom et icône
  // choisis par le client (sinon valeurs par défaut du site). Le backend ne
  // renvoie user.theme que tant que le premium est actif.
  const accent = (isClient && user?.theme_color) || ACCENT_DEFAUT
  const accentHover = couleurHover(accent)
  const theme = isClient ? user?.theme : null
  const forme = ARRONDIS[theme?.arrondi] || ARRONDIS.pilule
  const nomEspace = theme?.nom_espace || 'SwimUp'
  const { Icon: LogoIcon, plein: logoPlein } = ICONES[theme?.icone] || ICONES.etoile
  const taillePct = TAILLES[theme?.taille_texte]?.pct || null

  // La taille du texte se règle sur la racine (tout est en rem) ; on remet
  // la valeur d'origine en quittant le layout (déconnexion, autre rôle).
  useEffect(() => {
    if (!taillePct) return
    const html = document.documentElement
    const avant = html.style.fontSize
    html.style.fontSize = taillePct
    return () => { html.style.fontSize = avant }
  }, [taillePct])

  const navItems = isAdmin ? [
    { path: '/admin',          label: 'Dashboard',   icon: LayoutDashboard },
    { path: '/admin/avis',     label: 'Avis',         icon: Star },
    { path: '/admin/avis-publics', label: 'Avis publics', icon: Globe },
    { path: '/admin/users',    label: 'Membres',      icon: User },
    { path: '/admin/retraits', label: 'Retraits',     icon: Wallet },
    { path: '/admin/loterie',  label: 'Loterie',      icon: Ticket },
    { path: '/admin/commande', label: 'Commande',     icon: FileText },
    { path: '/admin/commandes-clients', label: 'Commandes clients', icon: ClipboardCheck },
    { path: '/admin/boutique', label: 'Boutique',     icon: ShoppingBag },
    { path: '/admin/prospection', label: 'Prospection', icon: Search },
    { path: '/profil',         label: 'Profil',       icon: User },
  ] : isClient ? [
    { path: '/client',           label: 'Dashboard',    icon: LayoutDashboard },
    { path: '/client/payer',     label: 'Commander',    icon: CreditCard },
    { path: '/client/commandes', label: 'Mes commandes', icon: ShoppingBag },
    { path: '/client/stats',     label: 'Statistiques', icon: TrendingUp },
    { path: '/client/outils',    label: 'Outils avis',  icon: QrCode },
    { path: '/client/premium',   label: 'Premium',      icon: Crown },
    { path: '/profil',           label: 'Profil',       icon: User },
  ] : [
    { path: '/dashboard',    label: 'Tableau de bord',  icon: LayoutDashboard },
    { path: '/avis',         label: 'Avis',             icon: Star },
    { path: '/portefeuille', label: 'Portefeuille',     icon: Wallet },
    { path: '/parrainage',   label: 'Parrainage',       icon: Gift },
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

  // scope distingue la pastille active de la sidebar desktop de celle du
  // menu mobile — deux instances React séparées, chacune doit avoir son
  // propre layoutId sinon Framer Motion essaie de faire glisser une pastille
  // entre deux arbres différents au lieu de l'animer dans chacun.
  const NavLink = ({ item, onClick, scope }) => {
    const active = isActive(item.path)
    const Icon = item.icon
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active
            ? ''
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
        }`}
      >
        {active && (
          <motion.div
            layoutId={`nav-active-pill-${scope}`}
            transition={springSmooth}
            className="absolute inset-0 rounded-lg"
            style={{ backgroundColor: `${accent}1a` }}
          />
        )}
        <Icon size={18} className={`relative ${active ? '' : 'text-slate-400 dark:text-slate-500'}`} style={active ? { color: accent } : undefined} />
        <span className="relative" style={active ? { color: accent } : undefined}>{item.label}</span>
      </Link>
    )
  }

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-900 flex"
      style={{
        '--accent': accent, '--accent-hover': accentHover,
        '--radius-btn': forme.btn, '--radius-card': forme.card, '--radius-input': forme.input,
      }}
    >

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full z-20">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
          <Link to={isAdmin ? '/admin' : isClient ? '/client' : '/dashboard'} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent }}>
              <LogoIcon size={18} className={`text-white ${logoPlein ? 'fill-white' : ''}`} />
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight truncate">{nomEspace}</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => <NavLink key={item.path} item={item} scope="desktop" />)}
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

      {/* Mobile Header — verre dépoli façon barre de nav iOS : laisse deviner
          le contenu qui défile dessous au lieu d'une plaque opaque. */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 material-glass border-b border-slate-200/70 dark:border-slate-700/70 z-30 flex items-center justify-between px-4">
        <Link to={isAdmin ? '/admin' : isClient ? '/client' : '/dashboard'} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent }}>
            <LogoIcon size={15} className={`text-white ${logoPlein ? 'fill-white' : ''}`} />
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight truncate max-w-[200px]">{nomEspace}</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile — vraie feuille qui glisse depuis le bord, au lieu d'un
          plein écran qui apparaît d'un coup. Se ferme au tap sur le fond
          assombri, ou en la faisant glisser vers la gauche (hérite de la
          vélocité du geste : un petit coup sec la ferme même sans aller au
          bout de la course). */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed top-14 inset-x-0 bottom-0 z-20 bg-slate-900/30"
          />
        )}
        {mobileOpen && (
          <motion.div
            key="sheet"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={springSheet}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.5, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x < -90 || velocity.x < -500) setMobileOpen(false)
            }}
            className="lg:hidden fixed left-0 top-14 bottom-0 z-[25] w-[82vw] max-w-[300px] material-glass border-r border-slate-200/70 dark:border-slate-700/70"
          >
            <nav className="p-3 space-y-0.5 h-full overflow-y-auto">
              {navItems.map(item => (
                <NavLink key={item.path} item={item} scope="mobile" onClick={() => setMobileOpen(false)} />
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
