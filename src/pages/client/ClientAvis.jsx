import { useEffect, useState } from 'react'
import api from '../../lib/api'
import {
  Plus, X, Star, Clock, Euro, Loader2,
  AlertTriangle
} from 'lucide-react'

export default function ClientAvis() {
  const [avis, setAvis] = useState([])
  const [form, setForm] = useState({ lien_maps: '', texte: '', nb_etoiles: 5, delai_paiement: 30, nom_etablissement: '' })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvis()
  }, [])

  const fetchAvis = () => {
    api.get('/client/avis')
      .then(r => setAvis(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const ajouter = async (e) => {
    e.preventDefault()
    try {
      await api.post('/client/avis', form)
      setForm({ lien_maps: '', texte: '', nb_etoiles: 5, delai_paiement: 30, nom_etablissement: '' })
      setShowForm(false)
      fetchAvis()
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur')
    }
  }

  const supprimer = async (id) => {
    if (!confirm('Supprimer cet avis ?')) return
    try {
      await api.delete(`/client/avis/${id}`)
      fetchAvis()
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur')
    }
  }

  const getBadge = (statut) => {
    switch (statut) {
      case 'disponible': return <span className="badge-blue">Disponible</span>
      case 'reserve': return <span className="badge-yellow">Réservé</span>
      case 'valide': return <span className="badge-green">Validé</span>
      case 'paye': return <span className="badge-aqua">Payé</span>
      case 'refuse': return <span className="badge-red">Refusé</span>
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

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Mes avis</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-xl bg-aqua-600 text-white flex items-center justify-center hover:bg-aqua-500 transition-colors">
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={ajouter} className="card space-y-3 animate-slide-up">
          <input type="text" placeholder="Nom de l'établissement" value={form.nom_etablissement}
            onChange={e => setForm({...form, nom_etablissement: e.target.value})} className="input" required />
          <input type="url" placeholder="Lien Google Maps" value={form.lien_maps}
            onChange={e => setForm({...form, lien_maps: e.target.value})} className="input" required />
          <textarea placeholder="Texte de l'avis" value={form.texte}
            onChange={e => setForm({...form, texte: e.target.value})} className="input min-h-[80px] resize-none" required />
          <div className="flex gap-2">
            <input type="number" placeholder="Étoiles" value={form.nb_etoiles} min={1} max={5}
              onChange={e => setForm({...form, nb_etoiles: e.target.value})} className="input flex-1" />
            <input type="number" placeholder="Délai (jours)" value={form.delai_paiement}
              onChange={e => setForm({...form, delai_paiement: e.target.value})} className="input flex-1" />
          </div>
          <button type="submit" className="btn-primary text-sm py-3">Ajouter</button>
        </form>
      )}

      {avis.length === 0 ? (
        <div className="card-flat text-center py-12 text-slate-400">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          Aucun avis
        </div>
      ) : (
        <div className="space-y-2">
          {avis.map(a => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{a.nom_etablissement || 'Sans nom'}</p>
                  <p className="text-xs text-slate-500">{a.membre_email || 'Non réservé'}</p>
                </div>
                {getBadge(a.statut)}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {a.nb_etoiles}</span>
                <span className="flex items-center gap-1"><Euro className="w-3 h-3" /> 3.00 €</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.delai_paiement}j</span>
              </div>
              {a.statut === 'disponible' && (
                <button onClick={() => supprimer(a.id)} className="btn-danger text-xs py-2">
                  <X className="w-3 h-3 inline mr-1" /> Supprimer
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
