import { useEffect, useState } from 'react'
import api from '../lib/api'
import {
  Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2,
  XCircle, Loader2, Banknote
} from 'lucide-react'

export default function Portefeuille() {
  const [solde, setSolde] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [retraits, setRetraits] = useState([])
  const [montant, setMontant] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [soldeRes, transRes, retrRes] = await Promise.all([
          api.get('/paiements/solde'),
          api.get('/paiements/transactions'),
          api.get('/paiements/retraits'),
        ])
        setSolde(soldeRes.data.solde)
        setTransactions(transRes.data)
        setRetraits(retrRes.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const demanderRetrait = async () => {
    const m = parseFloat(montant)
    if (isNaN(m) || m < 1) return setMsg({ type: 'error', text: 'Montant minimum : 1€' })
    if (m > solde) return setMsg({ type: 'error', text: 'Solde insuffisant' })
    try {
      await api.post('/paiements/retrait', { montant: m })
      setMsg({ type: 'success', text: 'Demande envoyée !' })
      setMontant('')
      const [s, t, r] = await Promise.all([
        api.get('/paiements/solde'),
        api.get('/paiements/transactions'),
        api.get('/paiements/retraits'),
      ])
      setSolde(s.data.solde)
      setTransactions(t.data)
      setRetraits(r.data)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur' })
    }
  }

  const getTransIcon = (type) => {
    switch (type) {
      case 'credit': return <ArrowDownRight className="w-4 h-4 text-emerald-500" />
      case 'debit': return <ArrowUpRight className="w-4 h-4 text-red-500" />
      case 'retrait': return <Banknote className="w-4 h-4 text-amber-500" />
      case 'penalite': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getRetraitBadge = (statut) => {
    switch (statut) {
      case 'paye': return <span className="badge-green"><CheckCircle2 className="w-3 h-3" /> Payé</span>
      case 'refuse': return <span className="badge-red"><XCircle className="w-3 h-3" /> Refusé</span>
      default: return <span className="badge-yellow"><Clock className="w-3 h-3" /> En attente</span>
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
    <div className="space-y-5 animate-fade-in">
      <h1 className="section-title">Portefeuille</h1>

      {/* Solde */}
      <div className="card bg-gradient-to-br from-aqua-600 to-teal-500 text-white border-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-aqua-100 text-sm font-medium">Solde</span>
          <Wallet className="w-5 h-5 text-aqua-200" />
        </div>
        <div className="font-display text-3xl font-bold">{parseFloat(solde).toFixed(2)} €</div>
      </div>

      {/* Retrait */}
      <div className="card">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3">Demander un retrait</h3>
        {msg && (
          <div className={`mb-3 p-3 rounded-xl text-sm font-medium ${
            msg.type === 'error'
              ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
          }`}>
            {msg.text}
          </div>
        )}
        <div className="flex gap-2">
          <input type="number" placeholder="Montant (€)" value={montant}
            onChange={e => setMontant(e.target.value)} className="input flex-1" min="1" step="0.01" />
          <button onClick={demanderRetrait} className="btn-primary w-auto px-6">
            <Banknote className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="section-title mb-3">Transactions</h2>
        {transactions.length === 0 ? (
          <div className="card-flat text-center py-8 text-slate-400 text-sm">Aucune transaction</div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t, i) => (
              <div key={i} className="card-flat p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {getTransIcon(t.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{t.note || t.type}</p>
                  <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className={`font-semibold text-sm ${
                  t.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' :
                  t.type === 'debit' || t.type === 'penalite' ? 'text-red-600 dark:text-red-400' :
                  'text-slate-700 dark:text-slate-300'
                }`}>
                  {t.type === 'credit' ? '+' : t.type === 'debit' || t.type === 'penalite' ? '-' : ''}
                  {parseFloat(t.montant).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Retraits */}
      {retraits.length > 0 && (
        <div>
          <h2 className="section-title mb-3">Retraits</h2>
          <div className="space-y-2">
            {retraits.map((r, i) => (
              <div key={i} className="card-flat p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{parseFloat(r.montant).toFixed(2)} €</p>
                  <p className="text-xs text-slate-500">{r.paypal}</p>
                </div>
                {getRetraitBadge(r.statut)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
