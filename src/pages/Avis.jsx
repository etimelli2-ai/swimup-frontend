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
    api.get('/avis')
      .then(r => {
        const sorted = r.data.sort((a, b) => {
          if ((b.prioritaire || 0) !== (a.prioritaire || 0)) {
            return (b.prioritaire || 0) - (a.prioritaire || 0)
          }
          return new Date(b.created_at) - new Date(a.created_at)
        })
        setAvis(sorted)
      })
      .finally(() => setLoading(false))
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
    if (nb <= 2) return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800'
    if (nb === 3) return 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800'
    return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800'
  }

  const renderAvis = (a) => {
    const { stars, label } = etoilesDisplay(a.nb_etoiles)
    const gain = parseFloat(a.prix_membre || a.prix || 1)
    const isPrioritaire = !!a.prioritaire

    return (
      <div key={a.id} className={`card space-y-3 ${
        isPrioritaire
          ? 'border-2 border-orange-300 dark:border-orange-600 bg-orange-50/30 dark:bg-orange-900/10'
          : ''
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white">{a.nom_societe}</p>
          </div>
          <div className={`shrink-0 rounded-xl px-3 py-2 text-center ${
            isPrioritaire
              ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700'
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
          }`}>
            <p className={`font-bold text-lg ${isPrioritaire ? 'text-orange-600 dark:text-orange-400' : 'text-green-700 dark:text-green-400'}`}>
              +{gain.toFixed(2)}€
            </p>
            <p className={`text-xs ${isPrioritaire ? 'text-orange-500' : 'text-green-600 dark:text-green-500'}`}>
              à gagner
            </p>
          </div>
        </div>

        {/* Étoiles */}
        <div className={`rounded-xl p-3 border ${etoilesColor(a.nb_etoiles)}`}>
          <p className="text-xs font-medium mb-1">Note à mettre sur Google :</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{stars}</span>
            <span className="font-bold text-sm">{label}</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-1">Texte à copier :</p>
          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed line-clamp-3">{a.texte}</p>
        </div>

        <button
          className={`w-full py-3 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 transition-colors ${
            isPrioritaire
              ? 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
              : 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700'
          }`}
          onClick={() => reserver(a.id)}
          disabled={reserving !== null}
        >
          {reserving === a.id
            ? <><Spinner /> Réservation...</>
            : isPrioritaire
              ? '🔥 Réserver cet avis prioritaire'
              : '✋ Réserver cet avis'
          }
        </button>
      </div>
    )
  }

  const avisPrioritaires = avis.filter(a => a.prioritaire)
  const avisNormaux = avis.filter(a => !a.prioritaire)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Avis disponibles</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{avis.length} avis en attente de rédaction</p>
      </div>

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {avis.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold text-gray-700 dark:text-slate-300">Aucun avis disponible</p>
          <p className="text-sm text-gray-400 mt-1">Reviens plus tard !</p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Section prioritaires */}
          {avisPrioritaires.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xl">🔥</span>
                <h3 className="font-bold text-orange-600 dark:text-orange-400">Avis prioritaires</h3>
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  {avisPrioritaires.length}
                </span>
                <span className="text-xs text-orange-500 dark:text-orange-400 ml-1">— Fais-les en premier !</span>
              </div>
              {avisPrioritaires.map(a => renderAvis(a))}
            </div>
          )}

          {/* Séparateur */}
          {avisPrioritaires.length > 0 && avisNormaux.length > 0 && (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">Autres avis disponibles</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            </div>
          )}

          {/* Section normale */}
          {avisNormaux.length > 0 && (
            <div className="space-y-3">
              {avisNormaux.map(a => renderAvis(a))}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
