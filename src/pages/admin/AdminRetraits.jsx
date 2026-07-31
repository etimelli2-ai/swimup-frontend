import { useState, useEffect } from 'react'
import api from '../../lib/api'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

export default function AdminRetraits() {
  const [retraits, setRetraits] = useState([])
  const [filter, setFilter]     = useState('en_attente')
  const [loadingAction, setLA]  = useState(null)
  const [msg, setMsg]           = useState(null)

  const load = () => api.get('/admin/retraits').then(r => setRetraits(r.data))
  useEffect(() => { load() }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const traiter = async (id, statut) => {
    setLA(`${statut}_${id}`)
    try {
      await api.put(`/admin/retraits/${id}`, { statut })
      showMsg('success', statut === 'paye' ? '✅ Retrait marqué payé !' : '❌ Retrait refusé !')
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur')
    }
    setLA(null)
  }

  const filtered = retraits.filter(r => filter === 'tous' || r.statut === filter)

  // Fix — || 0 pour éviter NaN
  const totalAttente = retraits
    .filter(r => r.statut === 'en_attente')
    .reduce((s, r) => s + (parseFloat(r.montant) || 0), 0)

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold">Retraits</h2>
        <p className="text-sm text-brand-600 font-semibold mt-1">
          À payer : {totalAttente.toFixed(2)}€
        </p>
      </div>

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {[['en_attente', 'En attente'], ['paye', 'Payés'], ['tous', 'Tous']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              filter === v ? 'bg-white shadow text-brand-700' : 'text-gray-500'
            }`}>
            {l}
            {v === 'en_attente' && retraits.filter(r => r.statut === 'en_attente').length > 0 && (
              <span className="ml-1 bg-brand-600 text-white text-xs rounded-full px-1.5">
                {retraits.filter(r => r.statut === 'en_attente').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-xl text-gray-900">{parseFloat(r.montant || 0).toFixed(2)}€</p>
                <p className="text-sm text-gray-600">{r.email}</p>
                <p className="text-xs text-gray-400">
                  PayPal : <span className="font-medium text-gray-700">{r.paypal}</span>
                </p>
                {r.discord_id && <p className="text-xs text-gray-400">Discord : {r.discord_id}</p>}
                <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString('fr-FR')}</p>
              </div>
              <div>
                {r.statut === 'en_attente' && <span className="badge-yellow">En attente</span>}
                {r.statut === 'paye'       && <span className="badge-green">Payé ✓</span>}
                {r.statut === 'refuse'     && <span className="badge-red">Refusé</span>}
              </div>
            </div>

            {r.statut === 'en_attente' && (
              <div className="flex gap-2">
                <button
                  onClick={() => traiter(r.id, 'paye')}
                  disabled={loadingAction !== null}
                  className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loadingAction === `paye_${r.id}` ? <><Spinner /> Traitement...</> : '✅ Marquer payé'}
                </button>
                <button
                  onClick={() => traiter(r.id, 'refuse')}
                  disabled={loadingAction !== null}
                  className="flex-1 bg-red-100 text-red-600 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loadingAction === `refuse_${r.id}` ? <><Spinner /> Traitement...</> : '❌ Refuser'}
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-10 text-gray-400">Aucun retrait</div>
        )}
      </div>
    </div>
  )
}
