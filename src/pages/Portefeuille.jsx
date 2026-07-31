// ============================================================
// frontend/src/pages/Portefeuille.jsx -- NOUVEAU (redesign)
// ============================================================

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSolde, useTransactions, useDemanderRetrait } from '../hooks/useAvis'
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  ChevronRight,
  CreditCard
} from 'lucide-react'
import { motion } from 'framer-motion'

const typeConfig = {
  credit: { label: 'Credit', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: ArrowDownLeft },
  debit: { label: 'Debit', color: 'text-red-600', bg: 'bg-red-50', icon: ArrowUpRight },
  retrait: { label: 'Retrait', color: 'text-amber-600', bg: 'bg-amber-50', icon: ArrowUpRight },
  penalite: { label: 'Penalite', color: 'text-red-600', bg: 'bg-red-50', icon: ArrowUpRight },
}

export default function Portefeuille() {
  const { user } = useAuth()
  const { data: soldeData } = useSolde()
  const { data: transactions, isLoading } = useTransactions()
  const retrait = useDemanderRetrait()

  const [montant, setMontant] = useState('')

  const solde = soldeData?.solde || 0
  const hasPaypal = !!user?.paypal_email

  const handleRetrait = (e) => {
    e.preventDefault()
    const m = parseFloat(montant)
    if (!m || m < 5) return
    retrait.mutate(m, {
      onSuccess: () => setMontant('')
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title">Portefeuille</h1>

      {/* Solde card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-sky-500 border-sky-400 text-white"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sky-100 text-sm font-medium">Solde disponible</span>
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Wallet size={20} className="text-white" />
          </div>
        </div>
        <div className="text-4xl font-extrabold tracking-tight">
          {solde.toFixed(2)} <span className="text-xl font-semibold">EUR</span>
        </div>
        <p className="text-sky-100 text-sm mt-2">Retrait minimum : 5 EUR</p>
      </motion.div>

      {/* Retrait form */}
      {!hasPaypal ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-5 border-l-4 border-l-amber-400 flex items-start gap-3"
        >
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-800">PayPal requis</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Ajoute ton adresse PayPal dans ton profil pour pouvoir retirer ton solde.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleRetrait}
          className="card p-5"
        >
          <h2 className="section-title mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-sky-500" />
            Demander un retrait
          </h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">EUR</span>
              <input
                type="number"
                min="5"
                step="0.01"
                max={solde}
                value={montant}
                onChange={e => setMontant(e.target.value)}
                placeholder="0.00"
                required
                className="input pl-12"
              />
            </div>
            <button
              type="submit"
              disabled={retrait.isPending || parseFloat(montant) > solde || parseFloat(montant) < 5}
              className="btn-primary px-6"
            >
              {retrait.isPending ? 'Envoi...' : 'Retirer'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Paiement effectue sous 24 a 48h sur : {user.paypal_email}
          </p>
        </motion.form>
      )}

      {/* Historique */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Historique des transactions</h2>
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg" />
            ))}
          </div>
        ) : !transactions?.length ? (
          <div className="text-center py-8">
            <Clock size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Aucune transaction pour le moment</p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((t) => {
              const config = typeConfig[t.type] || typeConfig.debit
              const Icon = config.icon
              const isPositive = t.type === 'credit'
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{config.label}</p>
                    <p className="text-xs text-slate-400">{t.note || '-'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {isPositive ? '+' : '-'}{parseFloat(t.montant).toFixed(2)} EUR
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(t.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
