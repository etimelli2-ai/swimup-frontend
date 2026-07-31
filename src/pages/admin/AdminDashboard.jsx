import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import {
  Users, ClipboardList, CheckCircle2, Landmark, Wallet,
  ArrowUpRight, Loader2, Shield
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-aqua-600 animate-spin" />
      </div>
    )
  }

  const cards = [
    { label: 'Membres', value: stats?.users, icon: Users, color: 'text-blue-600 bg-blue-500/10' },
    { label: 'Avis total', value: stats?.avisTotal, icon: ClipboardList, color: 'text-aqua-600 bg-aqua-500/10' },
    { label: 'Avis validés', value: stats?.avisValides, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Retraits attente', value: stats?.retraitsAttente, icon: Landmark, color: 'text-amber-600 bg-amber-500/10' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="section-title flex items-center gap-2">
          <Shield className="w-6 h-6 text-aqua-500" /> Admin
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{value ?? 0}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="card bg-gradient-to-br from-aqua-600 to-teal-500 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-aqua-100 text-sm">Solde total membre</p>
            <p className="font-display text-2xl font-bold">{parseFloat(stats?.soldeTotal || 0).toFixed(2)} €</p>
          </div>
          <Wallet className="w-8 h-8 text-aqua-200" />
        </div>
      </div>

      <div className="card">
        <p className="text-sm text-slate-500 mb-3">Montant retraits en attente</p>
        <p className="font-display text-xl font-bold text-slate-900 dark:text-white">
          {parseFloat(stats?.montantRetraitsAttente || 0).toFixed(2)} €
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { path: '/admin/avis', label: 'Gérer les avis', icon: ClipboardList },
          { path: '/admin/users', label: 'Utilisateurs', icon: Users },
          { path: '/admin/retraits', label: 'Retraits', icon: Landmark },
          { path: '/admin/loterie', label: 'Loterie', icon: CheckCircle2 },
        ].map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path}
            className="card p-4 flex flex-col items-center text-center gap-2 hover:-translate-y-1">
            <Icon className="w-6 h-6 text-aqua-600 dark:text-aqua-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}
