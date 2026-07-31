import { useEffect, useState } from 'react'
import api from '../../lib/api'
import {
  Landmark, CheckCircle2, XCircle, Clock, Loader2,
  ArrowDownRight
} from 'lucide-react'

export default function AdminRetraits() {
  const [retraits, setRetraits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/retraits')
      .then(r => setRetraits(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateStatut = async (id, statut) => {
    try {
      await api.put(`/admin/retraits/${id}`, { statut })
      setRetraits(prev => prev.map(r => r.id === id ? { ...r, statut } : r))
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur')
    }
  }

  const total = retraits
    .filter(r => r.statut === 'en_attente')
    .reduce((s, r) => s + (parseFloat(r.montant) || 0), 0)

  const getBadge = (statut) => {
    switch (statut) {
      case 'paye': return <span className="badge-green"><CheckCircle2 className="w-3 h-3" /> Payé</span>
      case 'refuse': return <span className="badge-red"><XCircle className="w-3 h-3" /> Refusé</span>
      default: return <span className="badge-yellow"><Clock className="w-3 h-3" /> Attente</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-aqua-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="section-title flex items-center gap-2">
        <Landmark className="w-6 h-6 text-aqua-500" /> Retraits
      </h1>

      <div className="card bg-gradient-to-br from-amber-500 to-orange-400 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-100 text-sm">Total en attente</p>
            <p className="font-display text-2xl font-bold">{total.toFixed(2)} €</p>
          </div>
          <ArrowDownRight className="w-8 h-8 text-amber-200" />
        </div>
      </div>

      <div className="space-y-2">
        {retraits.map(r => (
          <div key={r.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{r.email}</p>
                <p className="text-xs text-slate-500">{r.paypal}</p>
              </div>
              <span className="font-display font-bold text-lg">{parseFloat(r.montant).toFixed(2)} €</span>
            </div>
            <div className="flex items-center justify-between">
              {getBadge(r.statut)}
              {r.statut === 'en_attente' && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatut(r.id, 'paye')} className="btn-ghost text-xs py-2 text-emerald-600">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" /> Valider
                  </button>
                  <button onClick={() => updateStatut(r.id, 'refuse')} className="btn-ghost text-xs py-2 text-red-600">
                    <XCircle className="w-3 h-3 inline mr-1" /> Refuser
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
