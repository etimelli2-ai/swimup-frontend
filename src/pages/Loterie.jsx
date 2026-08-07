import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Wallet, CreditCard, X, Loader2 } from 'lucide-react'
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
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{total.toFixed(2)}€</p>
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
      toast.success('🎟️ Tickets achetés avec succès !')
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
      toast.success(`🎟️ ${nbTickets} ticket${nbTickets > 1 ? 's' : ''} acheté${nbTickets > 1 ? 's' : ''} !`)
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
    <div className="p-4 space-y-4 animate-fade-in">
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

      <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎰 Loterie</h2>

      <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
        <button onClick={() => setTab('loterie')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'loterie' ? 'bg-white dark:bg-slate-600 shadow text-sky-700 dark:text-sky-400' : 'text-gray-500 dark:text-slate-400'}`}>
          En cours
        </button>
        <button onClick={() => setTab('historique')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'historique' ? 'bg-white dark:bg-slate-600 shadow text-sky-700 dark:text-sky-400' : 'text-gray-500 dark:text-slate-400'}`}>
          Historique
        </button>
      </div>

      {tab === 'loterie' && (
        <>
          {!data?.loterie ? (
            <div className="card text-center py-12">
              <p className="text-5xl mb-3">🎰</p>
              <p className="font-bold text-gray-700 dark:text-slate-300 text-lg">Aucune loterie en cours</p>
              <p className="text-sm text-gray-400 mt-2">Reviens plus tard !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Jackpot */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center">
                <p className="text-sm font-medium opacity-90">🎉 {data.loterie.titre}</p>
                <p className="text-5xl font-extrabold mt-2">{data.loterie.montant_gain}€</p>
                <p className="text-sm opacity-90 mt-1">à gagner</p>
              </div>

              {/* Tes tickets */}
              <div className="card text-center">
                <p className="text-gray-500 dark:text-slate-400 text-sm">Tes tickets</p>
                <p className="text-5xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">{data.tickets}</p>
                {data.tickets > 0 && data.totalTickets > 0 && (
                  <div className="mt-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3">
                    <p className="text-sm text-sky-700 dark:text-sky-400 font-medium">
                      🎯 Probabilité : <strong>
                        {((data.tickets / data.totalTickets) * 100).toFixed(1)}%
                      </strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Acheter des tickets */}
              <div className="card space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white">🎟️ Acheter des tickets</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Prix : <strong className="text-sky-600">{data.loterie.prix_ticket}€</strong> / ticket
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNbTickets(n => Math.max(1, n - 1))}
                    className="w-10 h-10 border-2 border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                  >−</button>
                  <input
                    type="number" min="1"
                    value={nbTickets}
                    onChange={e => setNbTickets(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input w-20 text-center font-bold text-lg"
                  />
                  <button
                    onClick={() => setNbTickets(n => n + 1)}
                    className="w-10 h-10 border-2 border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700"
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
                  🎟️ Acheter {nbTickets} ticket{nbTickets > 1 ? 's' : ''} — {(data.loterie.prix_ticket * nbTickets).toFixed(2)}€
                </button>
              </div>

              {/* Comment ça marche */}
              <div className="card space-y-2">
                <h3 className="font-bold text-gray-900 dark:text-white">Comment participer ?</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <span>1️⃣</span>
                    <p>Achète des tickets à <strong>{data.loterie.prix_ticket}€</strong> pièce avec ton solde ou par carte</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>2️⃣</span>
                    <p>Plus tu as de tickets, plus tu as de chances de gagner !</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>3️⃣</span>
                    <p>Le gagnant est tiré au sort et reçoit <strong>{data.loterie.montant_gain}€</strong> sur son solde</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'historique' && (
        <div className="space-y-3">
          {historique.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">Aucune loterie terminée</div>
          ) : historique.map(l => (
            <div key={l.id} className="card space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900 dark:text-white">{l.titre}</p>
                <span className="badge-green">Terminée</span>
              </div>
              <p className="text-2xl font-extrabold text-yellow-500">{l.montant_gain}€</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                🏆 Gagnant : <strong>{l.gagnant_email || '—'}</strong>
              </p>
              <p className="text-xs text-gray-400">
                {l.termine_at ? new Date(l.termine_at).toLocaleDateString('fr-FR') : '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
