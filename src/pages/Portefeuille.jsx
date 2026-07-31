import { useState, useEffect } from 'react'
import api from '../lib/api'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

export default function Portefeuille() {
  const [solde, setSolde]       = useState(0)
  const [transactions, setTx]   = useState([])
  const [retraits, setRetraits] = useState([])
  const [montant, setMontant]   = useState('')
  const [msg, setMsg]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [submitting, setSub]    = useState(false)
  const [tab, setTab]           = useState('transactions')

  const load = async () => {
    const [s, tx, r] = await Promise.all([
      api.get('/paiements/solde'),
      api.get('/paiements/transactions'),
      api.get('/paiements/retraits'),
    ])
    setSolde(s.data.solde)
    setTx(tx.data)
    setRetraits(r.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const retirer = async () => {
    const m = parseFloat(montant)
    if (!m || m < 1) return showMsg('error', 'Montant minimum : 1€')
    setSub(true)
    try {
      const r = await api.post('/paiements/retrait', { montant: m })
      showMsg('success', r.data.message)
      setMontant('')
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur')
    }
    setSub(false)
  }

  const txIcon  = t => ({ credit: '💰', debit: '📤', retrait: '🏦', penalite: '⚠️' }[t] || '💳')
  const txColor = t => t === 'credit' ? 'text-green-600' : 'text-red-500'

  const retraitBadge = s => ({
    en_attente: <span className="badge-yellow">En attente</span>,
    paye:       <span className="badge-green">Payé ✓</span>,
    refuse:     <span className="badge-red">Refusé</span>,
  }[s])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white">
        <p className="text-brand-200 text-sm">Solde disponible</p>
        <p className="text-4xl font-extrabold mt-1">{solde.toFixed(2)} €</p>
      </div>

      <div className="card space-y-3">
        <h3 className="font-bold text-gray-900">Demander un retrait</h3>

        {msg && (
          <div className={`rounded-xl p-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {msg.text}
          </div>
        )}

        <div className="relative">
          <input className="input pr-12" type="number" min="1" step="0.01" placeholder="Montant"
            value={montant} onChange={e => setMontant(e.target.value)} />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
        </div>

        <button
          className="btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
          onClick={retirer}
          disabled={submitting}
        >
          {submitting ? <><Spinner /> Envoi en cours...</> : '💸 Demander le paiement PayPal'}
        </button>
        <p className="text-xs text-gray-400 text-center">Paiement sous 24-48h · Minimum 1€</p>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1">
        <button onClick={() => setTab('transactions')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'transactions' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}>
          Transactions
        </button>
        <button onClick={() => setTab('retraits')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'retraits' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}>
          Retraits
        </button>
      </div>

      {tab === 'transactions' && (
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">Aucune transaction</div>
          ) : transactions.map(t => (
            <div key={t.id} className="card flex items-center gap-3">
              <span className="text-2xl">{txIcon(t.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{t.note || t.type}</p>
                <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className={`font-bold ${txColor(t.type)}`}>
                {t.type === 'credit' ? '+' : '-'}{parseFloat(t.montant).toFixed(2)}€
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'retraits' && (
        <div className="space-y-2">
          {retraits.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">Aucun retrait</div>
          ) : retraits.map(r => (
            <div key={r.id} className="card flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{parseFloat(r.montant).toFixed(2)}€</p>
                <p className="text-xs text-gray-400">{r.paypal} · {new Date(r.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              {retraitBadge(r.statut)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
