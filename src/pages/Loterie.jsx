import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Wallet, CreditCard, X, Loader2, Trophy, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

function ModalPaiement({ loterie, nbTickets, onClose, onSolde, onStripe, loading }) {
  const total = parseFloat(loterie.prix_ticket) * nbTickets
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg dark:text-white">Comment payer ?</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
          <p className="font-semibold text-slate-900 dark:text-white">
            {nbTickets} ticket{nbTickets > 1 ? 's' : ''} — {loterie.titre}
          </p>
          <p className="text-2xl font-semibold text-sky-600 dark:text-sky-400 mt-1">{total.toFixed(2)}€</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onSolde}
            disabled={!!loading}
            className="w-full border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-left hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center shrink-0">
                <Wallet size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">Payer avec mon solde</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Instantané — déduit de ton solde SwimUp</p>
              </div>
              {loading === 'solde' && <Spinner />}
            </div>
          </button>

          <button
            onClick={onStripe}
            disabled={!!loading}
            className="w-full border-2 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4 text-left hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/40 rounded-lg flex items-center justify-center shrink-0">
                <CreditCard size={20} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">Payer par carte</p>
                <p className="text-xs text-sky-600 dark:text-sky-400">Paiement sécurisé via Stripe</p>
              </div>
              {loading === 'stripe' && <Spinner />}
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Loterie() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [data, setData]           = useState(null)
  const [historique, setHist]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [payLoading, setPayLoad]  = useState(null)
  const [tab, setTab]             = useState('loterie')
  const [error, setError]         = useState(null)
  const [nbTickets, setNbTickets] = useState(1)
  const [showModal, setShowModal] = useState(false)

  const load = async () => {
    try {
      const [l, h] = await Promise.all([
        api.get('/loterie'),
        api.get('/loterie/historique'),
      ])
      setData(l.data)
      setHist(h.data)
    } catch {
      setError('Impossible de charger la loterie')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    if (searchParams.get('success') === '1') {
      toast.success('Tickets achetés avec succès !')
    }
    if (searchParams.get('cancel') === '1') {
      toast.error('Paiement annulé.')
    }
  }, [])

  const payerSolde = async () => {
    const total = data.loterie.prix_ticket * nbTickets
    if (parseFloat(user?.solde || 0) < total) {
      return toast.error(`Solde insuffisant — tu as ${parseFloat(user?.solde || 0).toFixed(2)}€, il faut ${total.toFixed(2)}€`)
    }

    setPayLoad('solde')
    try {
      await api.post('/loterie/acheter', {
        loterie_id: data.loterie.id,
        nb_tickets: nbTickets,
      })
      toast.success(`${nbTickets} ticket${nbTickets > 1 ? 's' : ''} acheté${nbTickets > 1 ? 's' : ''} !`)
      setShowModal(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
    }
    setPayLoad(null)
  }

  const payerStripe = async () => {
    setPayLoad('stripe')
    try {
      const r = await api.post('/stripe/loterie-checkout', {
        loterie_id: data.loterie.id,
        nb_tickets: nbTickets,
      })
      window.location.href = r.data.url
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
      setPayLoad(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-sky-500" />
    </div>
  )

  if (error) return (
    <div className="p-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <AnimatePresence>
        {showModal && data?.loterie && (
          <ModalPaiement
            loterie={data.loterie}
            nbTickets={nbTickets}
            onClose={() => { setShowModal(false); setPayLoad(null) }}
            onSolde={payerSolde}
            onStripe={payerStripe}
            loading={payLoading}
          />
        )}
      </AnimatePresence>

      <h2 className="page-title">Loterie</h2>

      <div className="inline-flex bg-slate-100 dark:bg-slate-700 rounded-full p-1 gap-1">
        <button onClick={() => setTab('loterie')}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${tab === 'loterie' ? 'bg-white dark:bg-slate-600 text-sky-700 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`}>
          En cours
        </button>
        <button onClick={() => setTab('historique')}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${tab === 'historique' ? 'bg-white dark:bg-slate-600 text-sky-700 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`}>
          Historique
        </button>
      </div>

      {tab === 'loterie' && (
        <>
          {!data?.loterie ? (
            <div className="card p-10 text-center">
              <AlertTriangle size={28} className="text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-600 dark:text-slate-400">Aucune loterie en cours</p>
              <p className="text-sm text-slate-400 mt-1">Reviens un peu plus tard</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Jackpot — même grammaire que le solde du dashboard : un seul aplat sky-500 */}
              <div className="rounded-2xl bg-sky-500 text-white p-7">
                <p className="text-sky-100 text-[13px] font-medium">{data.loterie.titre}</p>
                <p className="text-[44px] font-semibold tracking-tight leading-none mt-2">
                  {data.loterie.montant_gain}<span className="text-[20px] font-medium text-sky-100">€ à gagner</span>
                </p>
                <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/15 text-[14px]">
                  <div>
                    <p className="text-sky-100">Tes tickets</p>
                    <p className="font-semibold mt-0.5">{data.tickets}</p>
                  </div>
                  {data.tickets > 0 && data.totalTickets > 0 && (
                    <>
                      <div className="w-px h-8 bg-white/15" />
                      <div>
                        <p className="text-sky-100">Tes chances</p>
                        <p className="font-semibold mt-0.5">{((data.tickets / data.totalTickets) * 100).toFixed(1)}%</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Acheter des tickets */}
              <div className="card space-y-4">
                <h3 className="section-title">Acheter des tickets</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Prix : <strong className="text-sky-600">{data.loterie.prix_ticket}€</strong> / ticket
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNbTickets(n => Math.max(1, n - 1))}
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center font-medium text-lg hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                  >−</button>
                  <input
                    type="number" min="1"
                    value={nbTickets}
                    onChange={e => setNbTickets(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input w-20 text-center font-bold text-lg"
                  />
                  <button
                    onClick={() => setNbTickets(n => n + 1)}
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center font-medium text-lg hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                  >+</button>
                  <span className="text-sm text-slate-400">
                    = <strong className="text-slate-700 dark:text-slate-200">
                      {(data.loterie.prix_ticket * nbTickets).toFixed(2)}€
                    </strong>
                  </span>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary w-full"
                >
                  Acheter {nbTickets} ticket{nbTickets > 1 ? 's' : ''} — {(data.loterie.prix_ticket * nbTickets).toFixed(2)}€
                </button>
              </div>

              {/* Comment ça marche */}
              <div>
                <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide mb-5">Comment participer</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                  {[
                    { n: '1', t: 'Achète des tickets', d: `${data.loterie.prix_ticket}€ pièce, avec ton solde ou par carte` },
                    { n: '2', t: 'Plus t\'en as, mieux c\'est', d: 'Chaque ticket ajoute une chance de gagner' },
                    { n: '3', t: 'Tirage au sort', d: `Le gagnant reçoit ${data.loterie.montant_gain}€ sur son solde` },
                  ].map(s => (
                    <div key={s.n}>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-500 text-white text-[12px] font-semibold mb-2.5">
                        {s.n}
                      </span>
                      <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">{s.t}</p>
                      <p className="text-[13px] text-slate-400 mt-0.5 leading-relaxed">{s.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'historique' && (
        <div className="space-y-3">
          {historique.length === 0 ? (
            <div className="card p-10 text-center">
              <Trophy size={28} className="text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-600 dark:text-slate-400">Aucune loterie terminée</p>
            </div>
          ) : historique.map(l => (
            <div key={l.id} className="card space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-white">{l.titre}</p>
                <span className="badge-green">Terminée</span>
              </div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{l.montant_gain}€</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gagnant : <span className="font-medium text-slate-700 dark:text-slate-300">{l.gagnant_email || '—'}</span>
              </p>
              <p className="text-xs text-slate-400">
                {l.termine_at ? new Date(l.termine_at).toLocaleDateString('fr-FR') : '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
