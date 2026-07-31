import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import {
  MapPin, Star, Euro, Clock, ArrowRight, Target,
  Loader2, AlertTriangle
} from 'lucide-react'

export default function Avis() {
  const { user } = useAuth()
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    api.get('/avis')
      .then(r => setAvis(r.data))
      .catch(() => setMsg({ type: 'error', text: 'Impossible de charger les avis' }))
      .finally(() => setLoading(false))
  }, [])

  const reserver = async (id) => {
    try {
      await api.post(`/avis/${id}/reserver`)
      setMsg({ type: 'success', text: 'Avis réservé ! Va dans "Mon avis".' })
      setAvis(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur' })
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Avis disponibles</h1>
        <Link to="/mon-avis" className="text-sm text-aqua-600 dark:text-aqua-400 font-medium hover:underline flex items-center gap-1">
          Mon avis <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          msg.type === 'error'
            ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
        }`}>
          {msg.text}
        </div>
      )}

      {avis.length === 0 ? (
        <div className="card-flat text-center py-16">
          <Target className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun avis disponible</p>
          <p className="text-xs text-slate-400 mt-1">Reviens plus tard</p>
        </div>
      ) : (
        <div className="space-y-3">
          {avis.map((a, i) => (
            <div key={a.id} className="card" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white truncate">
                    {a.nom_societe || 'Établissement'}
                  </h3>
                  <a href={a.lien_maps} target="_blank" rel="noreferrer"
                    className="text-xs text-aqua-600 dark:text-aqua-400 flex items-center gap-1 mt-1 hover:underline">
                    <MapPin className="w-3 h-3" /> Voir sur Maps
                  </a>
                </div>
                <span className="badge-aqua flex-shrink-0">{parseFloat(a.prix).toFixed(2)} €</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-3">
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{a.texte}"</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {a.nb_etoiles} étoiles
                </span>
                <span className="flex items-center gap-1">
                  <Euro className="w-3.5 h-3.5" /> {parseFloat(a.prix).toFixed(2)} €
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Paiement {a.delai_paiement}j
                </span>
              </div>

              <button onClick={() => reserver(a.id)} className="btn-primary text-sm py-3">
                Réserver cet avis
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
