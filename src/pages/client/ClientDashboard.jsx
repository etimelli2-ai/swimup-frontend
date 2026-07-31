import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import {
  ClipboardList, CreditCard, ArrowRight, Loader2,
  AlertTriangle, CheckCircle2
} from 'lucide-react'

export default function ClientDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/client/stats')
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

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="section-title">Espace Client</h1>

      {stats?.bloquerSiDette && !stats?.paiementValide && (
        <div className="p-4 rounded-xl bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Compte bloqué</p>
            <p className="text-xs mt-1">Tu as une dette de {parseFloat(stats.aPayerTotal).toFixed(2)} €. Contacte l'admin.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{stats?.total || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Avis commandés</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats?.valides || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Validés</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.enCours || 0}</p>
          <p className="text-xs text-slate-500 mt-1">En cours</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {parseFloat(stats?.aPayerTotal || 0).toFixed(2)} €
          </p>
          <p className="text-xs text-slate-500 mt-1">À payer</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/client/avis" className="card p-4 flex flex-col items-center text-center gap-2 hover:-translate-y-1">
          <ClipboardList className="w-6 h-6 text-aqua-600 dark:text-aqua-400" />
          <span className="text-sm font-medium">Mes avis</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
        <Link to="/client/paiement" className="card p-4 flex flex-col items-center text-center gap-2 hover:-translate-y-1">
          <CreditCard className="w-6 h-6 text-aqua-600 dark:text-aqua-400" />
          <span className="text-sm font-medium">Paiement</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>
    </div>
  )
}
