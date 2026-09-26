import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Star, Flame, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

function Etoiles({ n }) {
  const nb = parseInt(n) || 5
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className={i <= nb ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'} />
      ))}
    </div>
  )
}

function CarteAvis({ a, onReserver, reserving }) {
  const [copied, setCopied] = useState(false)
  const gain = parseFloat(a.prix_membre || a.prix || 1)
  const isPrioritaire = !!a.prioritaire

  const copierTexte = () => {
    navigator.clipboard.writeText(a.texte)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`card space-y-3 ${isPrioritaire ? 'border-sky-200 dark:border-sky-800' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900 dark:text-white truncate">{a.nom_societe}</p>
            {isPrioritaire && (
              <span className="badge-blue text-xs flex items-center gap-1">
                <Flame size={11} /> Prioritaire
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <Etoiles n={a.nb_etoiles} />
            <span className="text-xs text-slate-400">{parseInt(a.nb_etoiles) || 5} étoiles à mettre</span>
          </div>
        </div>
        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
          +{gain.toFixed(2)}€
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 relative">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pr-8 line-clamp-3">{a.texte}</p>
        <button
          onClick={copierTexte}
          title="Copier le texte"
          className="absolute top-2.5 right-2.5 p-1.5 text-slate-400 hover:text-sky-500 transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>

      <button
        className="btn-primary w-full"
        onClick={() => onReserver(a.id)}
        disabled={reserving !== null}
      >
        {reserving === a.id ? <><Spinner /> Réservation...</> : 'Réserver cet avis'}
      </button>
    </div>
  )
}

export default function Avis() {
  const [avis, setAvis]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [reserving, setReserving] = useState(null)
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

  const reserver = async (id) => {
    setReserving(id)
    try {
      await api.post(`/avis/${id}/reserver`)
      toast.success('Avis réservé — tu as 1h pour le publier.')
      navigate('/mon-avis')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
      setReserving(null)
    }
  }

  const avisPrioritaires = avis.filter(a => a.prioritaire)
  const avisNormaux = avis.filter(a => !a.prioritaire)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-sky-500" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Avis disponibles</h1>
        <p className="text-muted mt-1">
          {avis.length > 0 ? `${avis.length} avis en attente de rédaction` : 'Aucun avis pour le moment'}
        </p>
      </div>

      {avis.length === 0 ? (
        <div className="card p-10 text-center">
          <AlertTriangle size={28} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600 dark:text-slate-400">Aucun avis disponible</p>
          <p className="text-sm text-slate-400 mt-1">Reviens un peu plus tard</p>
        </div>
      ) : (
        <div className="space-y-6">
          {avisPrioritaires.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide">
                Prioritaires — à faire en premier
              </h2>
              {avisPrioritaires.map(a => (
                <CarteAvis key={a.id} a={a} onReserver={reserver} reserving={reserving} />
              ))}
            </div>
          )}

          {avisNormaux.length > 0 && (
            <div className="space-y-3">
              {avisPrioritaires.length > 0 && (
                <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide">
                  Autres avis
                </h2>
              )}
              {avisNormaux.map(a => (
                <CarteAvis key={a.id} a={a} onReserver={reserver} reserving={reserving} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
