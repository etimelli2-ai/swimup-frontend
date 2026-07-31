import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

export default function Avis() {
  const [avis, setAvis]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [reserving, setReserving] = useState(null)
  const [msg, setMsg]             = useState(null)
  const navigate                  = useNavigate()

  useEffect(() => {
    api.get('/avis').then(r => setAvis(r.data)).finally(() => setLoading(false))
  }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const reserver = async (id) => {
    setReserving(id)
    try {
      await api.post(`/avis/${id}/reserver`)
      showMsg('success', '✅ Avis réservé ! Tu as 1h pour le publier.')
      navigate('/mon-avis')
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur')
    }
    setReserving(null)
  }

  const etoilesDisplay = n => {
    const nb = parseInt(n) || 5
    return { stars: '⭐'.repeat(nb), label: `${nb} étoile${nb > 1 ? 's' : ''}` }
  }

  const etoilesColor = n => {
    const nb = parseInt(n) || 5
    if (nb <= 2) return 'bg-red-50 border-red-200 text-red-700'
    if (nb === 3) return 'bg-yellow-50 border-yellow-200 text-yellow-700'
    return 'bg-green-50 border-green-200 text-green-700'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Avis disponibles</h2>
        <p className="text-sm text-gray-500 mt-1">{avis.length} avis en attente de rédaction</p>
      </div>

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {avis.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold text-gray-700">Aucun avis disponible</p>
          <p className="text-sm text-gray-400 mt-1">Reviens plus tard !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {avis.map(a => {
            const { stars, label } = etoilesDisplay(a.nb_etoiles)
            return (
              <div key={a.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {/* Nom entreprise au lieu de l'email */}
                    <p className="font-bold text-gray-900">{a.nom_societe}</p>
                  </div>
                  <div className="shrink-0 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-center">
                    <p className="text-green-700 font-bold text-lg">+1,00€</p>
                    <p className="text-xs text-green-600">à gagner</p>
                  </div>
                </div>

                {/* Nombre d'étoiles à mettre */}
                <div className={`rounded-xl p-3 border ${etoilesColor(a.nb_etoiles)}`}>
                  <p className="text-xs font-medium mb-1">Note à mettre sur Google :</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stars}</span>
                    <span className="font-bold text-sm">{label}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Texte à copier :</p>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{a.texte}</p>
                </div>

                <button
                  className="btn-primary py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                  onClick={() => reserver(a.id)}
                  disabled={reserving !== null}
                >
                  {reserving === a.id ? <><Spinner /> Réservation...</> : '✋ Réserver cet avis'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
