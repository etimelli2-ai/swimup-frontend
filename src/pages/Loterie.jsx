import { useState, useEffect } from 'react'
import api from '../lib/api'

export default function Loterie() {
  const [data, setData]       = useState(null)
  const [historique, setHist] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('loterie')
  const [error, setError]     = useState(null)

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

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (error) return (
    <div className="p-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">🎰 Loterie</h2>

      <div className="flex bg-gray-100 rounded-xl p-1">
        <button onClick={() => setTab('loterie')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'loterie' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}>
          En cours
        </button>
        <button onClick={() => setTab('historique')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'historique' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}>
          Historique
        </button>
      </div>

      {tab === 'loterie' && (
        <>
          {!data?.loterie ? (
            <div className="card text-center py-12">
              <p className="text-5xl mb-3">🎰</p>
              <p className="font-bold text-gray-700 text-lg">Aucune loterie en cours</p>
              <p className="text-sm text-gray-400 mt-2">Reviens plus tard !</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center">
                <p className="text-sm font-medium opacity-90">🎉 {data.loterie.titre}</p>
                <p className="text-5xl font-extrabold mt-2">{data.loterie.montant_gain}€</p>
                <p className="text-sm opacity-90 mt-1">à gagner</p>
              </div>

              <div className="card text-center">
                <p className="text-gray-500 text-sm">Tes tickets</p>
                <p className="text-5xl font-extrabold text-brand-600 mt-1">{data.tickets}</p>
                <p className="text-xs text-gray-400 mt-1">
                  sur {data.totalTickets} tickets au total
                </p>
                {/* Fix — division par zéro */}
                {data.tickets > 0 && data.totalTickets > 0 && (
                  <div className="mt-3 bg-brand-50 rounded-xl p-3">
                    <p className="text-sm text-brand-700 font-medium">
                      🎯 Probabilité : <strong>
                        {((data.tickets / data.totalTickets) * 100).toFixed(1)}%
                      </strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="card space-y-2">
                <h3 className="font-bold text-gray-900">Comment participer ?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span>1️⃣</span>
                    <p>Achète des tickets sur PayPal à <strong>{data.loterie.prix_ticket}€</strong> pièce</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>2️⃣</span>
                    <p>L'admin ajoute tes tickets sur ton compte</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>3️⃣</span>
                    <p>Plus tu as de tickets, plus tu as de chances de gagner !</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>4️⃣</span>
                    <p>Le gagnant est tiré au sort et reçoit <strong>{data.loterie.montant_gain}€</strong> sur son solde</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <p className="text-sm text-gray-500">👥 <strong>{data.totalTickets}</strong> tickets vendus au total</p>
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
                <p className="font-bold text-gray-900">{l.titre}</p>
                <span className="badge-green">Terminée</span>
              </div>
              <p className="text-2xl font-extrabold text-yellow-500">{l.montant_gain}€</p>
              <p className="text-sm text-gray-600">
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
