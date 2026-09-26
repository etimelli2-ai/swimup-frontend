import { useState, useEffect } from 'react'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState([])
  const [filter, setFilter]       = useState('en_attente')
  const [loadingAction, setLA]    = useState(null)
  const [nettoyage, setNettoyage] = useState(false)

  const load = () => api.get('/admin/commandes').then(r => setCommandes(r.data))
  useEffect(() => { load() }, [])

  const valider = async (id) => {
    setLA(`valider_${id}`)
    try {
      await api.put(`/admin/commandes/${id}/valider`)
      toast.success('Commande validée !')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
    }
    setLA(null)
  }

  const refuser = async (id) => {
    if (!confirm('Refuser cette commande ? Elle sera supprimée.')) return
    setLA(`refuser_${id}`)
    try {
      await api.put(`/admin/commandes/${id}/refuser`)
      toast.success('Commande refusée')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
    }
    setLA(null)
  }

  const nettoyer = async () => {
    setNettoyage(true)
    try {
      const r = await api.get('/cleanup-commandes-vides')
      toast.success(`${r.data.supprimees || 0} commande(s) vide(s) supprimée(s)`)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
    }
    setNettoyage(false)
  }

  const filtered = commandes.filter(c => filter === 'tous' || c.statut === filter)
  const nbEnAttente = commandes.filter(c => c.statut === 'en_attente').length

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className="page-title">Commandes clients</h2>
        <button
          onClick={nettoyer}
          disabled={nettoyage}
          className="btn-ghost text-xs flex items-center gap-1.5"
          title="Supprime les commandes payées qui n'ont plus aucun avis rattaché"
        >
          {nettoyage ? <Spinner /> : <Trash2 size={13} />}
          Nettoyer les commandes vides
        </button>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 gap-1">
        {[['en_attente', 'En attente'], ['paye', 'Validées'], ['tous', 'Toutes']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`flex-1 py-2 text-xs font-medium rounded-full transition-all ${
              filter === v ? 'bg-white dark:bg-slate-600 text-sky-700 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'
            }`}>
            {l}
            {v === 'en_attente' && nbEnAttente > 0 && (
              <span className="ml-1 bg-sky-500 text-white text-xs rounded-full px-1.5">{nbEnAttente}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {c.nb_avis} avis — {parseFloat(c.montant).toFixed(2)}€
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{c.nom_societe || c.client_email}</p>
                <p className="text-xs text-slate-400">{c.client_email}</p>
                {c.infos_attente?.nom_etablissement && (
                  <p className="text-xs text-slate-400 mt-1">
                    Établissement : <span className="text-slate-600 dark:text-slate-300">{c.infos_attente.nom_etablissement}</span>
                  </p>
                )}
                {c.infos_attente?.lien_maps && (
                  <a href={c.infos_attente.lien_maps} target="_blank" rel="noreferrer" className="text-xs text-sky-500 hover:underline block truncate max-w-xs">
                    {c.infos_attente.lien_maps}
                  </a>
                )}
                <p className="text-xs text-slate-400 mt-1">{new Date(c.created_at).toLocaleString('fr-FR')}</p>
              </div>
              <div>
                {c.statut === 'en_attente' && <span className="badge-amber">En attente</span>}
                {c.statut === 'paye'       && <span className="badge-green">Validée · {c.nb_avis_crees} avis</span>}
              </div>
            </div>

            {c.statut === 'en_attente' && (
              <div className="flex gap-2">
                <button
                  onClick={() => valider(c.id)}
                  disabled={loadingAction !== null}
                  className="flex-1 bg-emerald-500 text-white py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
                >
                  {loadingAction === `valider_${c.id}` ? <><Spinner /> Validation...</> : 'Valider (paiement reçu)'}
                </button>
                <button
                  onClick={() => refuser(c.id)}
                  disabled={loadingAction !== null}
                  className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
                >
                  {loadingAction === `refuser_${c.id}` ? <><Spinner /> Refus...</> : 'Refuser'}
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-10 text-slate-400">Aucune commande</div>
        )}
      </div>
    </div>
  )
}
