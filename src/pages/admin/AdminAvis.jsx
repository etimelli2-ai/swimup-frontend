import { useEffect, useState } from 'react'
import api from '../../lib/api'
import {
  Search, CheckCircle2, XCircle, Link2, Loader2,
  Clock, AlertTriangle, MapPin, Star, Euro
} from 'lucide-react'

const STATUT_FILTRES = ['tous', 'disponible', 'reserve', 'en_verification', 'valide', 'refuse', 'paye']

export default function AdminAvis() {
  const [avis, setAvis] = useState([])
  const [filtre, setFiltre] = useState('tous')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/avis')
      .then(r => setAvis(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtrer = () => {
    return avis.filter(a => {
      const matchStatut = filtre === 'tous' || a.statut === filtre
      const q = search.toLowerCase()
      const matchSearch = !q || (a.nom_societe || '').toLowerCase().includes(q) || (a.texte || '').toLowerCase().includes(q)
      return matchStatut && matchSearch
    })
  }

  const getBadge = (statut) => {
    switch (statut) {
      case 'disponible': return <span className="badge-blue"><Clock className="w-3 h-3" /> Disponible</span>
      case 'reserve': return <span className="badge-yellow"><Clock className="w-3 h-3" /> Réservé</span>
      case 'en_verification': return <span className="badge-purple"><Clock className="w-3 h-3" /> Vérification</span>
      case 'valide': return <span className="badge-green"><CheckCircle2 className="w-3 h-3" /> Validé</span>
      case 'refuse': return <span className="badge-red"><XCircle className="w-3 h-3" /> Refusé</span>
      case 'paye': return <span className="badge-aqua"><CheckCircle2 className="w-3 h-3" /> Payé</span>
      default: return <span className="badge-gray">{statut}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-aqua-600 animate-spin" />
      </div>
    )
  }

  const filtered = filtrer()

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="section-title">Gestion des avis</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Rechercher..." value={search}
            onChange={e => setSearch(e.target.value)} className="input pl-9 text-sm" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUT_FILTRES.map(s => (
          <button key={s} onClick={() => setFiltre(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filtre === s
                ? 'bg-aqua-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">{filtered.length} résultat(s)</p>

      {filtered.length === 0 ? (
        <div className="card-flat text-center py-12 text-slate-400">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          Aucun avis
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {a.nom_societe || 'Sans nom'}
                  </p>
                  <p className="text-xs text-slate-500">{a.membre_email || 'Non réservé'}</p>
                </div>
                {getBadge(a.statut)}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 mb-2">
                <p className="text-xs text-slate-700 dark:text-slate-300 italic truncate">"{a.texte}"</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {a.nb_etoiles}</span>
                <span className="flex items-center gap-1"><Euro className="w-3 h-3" /> {parseFloat(a.prix).toFixed(2)}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> <a href={a.lien_maps} target="_blank" rel="noreferrer" className="text-aqua-600 hover:underline">Maps</a></span>
              </div>
              {a.lien_avis_poste && (
                <a href={a.lien_avis_poste} target="_blank" rel="noreferrer"
                  className="text-xs text-aqua-600 dark:text-aqua-400 flex items-center gap-1 mb-2 hover:underline">
                  <Link2 className="w-3 h-3" /> Lien avis posté
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
