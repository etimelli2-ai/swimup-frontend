import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import {
  Wallet, ClipboardList, Trophy, TrendingUp, Bell,
  ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notifRes] = await Promise.all([
          api.get('/paiements/solde'),
          api.get('/client/notifications'),
        ])
        setStats(statsRes.data)
        setNotifs(notifRes.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const nonLues = notifs.filter(n => !n.lu).length

  const quickActions = [
    { path: '/avis', icon: ClipboardList, label: 'Avis disponibles', color: 'text-aqua-600 bg-aqua-500/10' },
    { path: '/mon-avis', icon: Clock, label: 'Mon avis en cours', color: 'text-amber-600 bg-amber-500/10' },
    { path: '/portefeuille', icon: Wallet, label: 'Mon portefeuille', color: 'text-emerald-600 bg-emerald-500/10' },
    { path: '/loterie', icon: Trophy, label: 'Loterie', color: 'text-violet-600 bg-violet-500/10' },
  ]

  const getNotifIcon = (titre) => {
    if (titre.includes('validé')) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    if (titre.includes('refusé') || titre.includes('supprimé')) return <XCircle className="w-4 h-4 text-red-500" />
    if (titre.includes('crédité')) return <TrendingUp className="w-4 h-4 text-aqua-500" />
    return <AlertCircle className="w-4 h-4 text-amber-500" />
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Solde Card */}
      <div className="card bg-gradient-to-br from-aqua-600 to-teal-500 text-white border-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-aqua-100 text-sm font-medium">Solde disponible</span>
          <Wallet className="w-5 h-5 text-aqua-200" />
        </div>
        <div className="font-display text-3xl font-bold">
          {stats?.solde !== undefined ? `${parseFloat(stats.solde).toFixed(2)} €` : '0.00 €'}
        </div>
        <Link to="/portefeuille" className="mt-3 inline-flex items-center gap-1 text-sm text-aqua-100 hover:text-white transition-colors">
          Voir les transactions <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title mb-3">Accès rapide</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ path, icon: Icon, label, color }) => (
            <Link key={path} to={path} className="card p-4 flex flex-col items-center text-center gap-2 hover:-translate-y-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Notifications</h2>
          {nonLues > 0 && (
            <span className="badge-aqua">{nonLues} non lue{nonLues > 1 ? 's' : ''}</span>
          )}
        </div>
        {notifs.length === 0 ? (
          <div className="card-flat text-center py-8 text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.slice(0, 5).map((n, i) => (
              <div key={i} className={`card-flat p-4 flex items-start gap-3 ${!n.lu ? 'border-l-4 border-l-aqua-500' : ''}`}>
                {getNotifIcon(n.titre)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.titre}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
