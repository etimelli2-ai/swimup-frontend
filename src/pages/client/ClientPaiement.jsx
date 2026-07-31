import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { CreditCard, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'

export default function ClientPaiement() {
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
      <h1 className="section-title">Paiement</h1>

      <div className="card bg-gradient-to-br from-aqua-600 to-teal-500 text-white border-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-aqua-100 text-sm">Solde à payer</span>
          <CreditCard className="w-5 h-5 text-aqua-200" />
        </div>
        <div className="font-display text-3xl font-bold">
          {parseFloat(stats?.aPayerTotal || 0).toFixed(2)} €
        </div>
      </div>

      {stats?.paiementValide ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-medium text-sm">Ton paiement est à jour</p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Paiement en attente</p>
            <p className="text-xs mt-1">Contacte l'admin pour régler {parseFloat(stats?.aPayerTotal || 0).toFixed(2)} €</p>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3">Détails</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Avis total</span>
            <span className="font-medium text-slate-900 dark:text-white">{stats?.total || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Validés</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{stats?.valides || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">En cours</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">{stats?.enCours || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
