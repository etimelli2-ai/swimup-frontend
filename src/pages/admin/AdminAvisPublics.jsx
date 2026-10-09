import { useState, useEffect } from 'react'
import api from '../../lib/api'
import BadgePause from '../../components/BadgePause'
import toast from 'react-hot-toast'
import {
  ExternalLink, CheckCircle2, XCircle, Loader2, Mail, Building2, Euro,
} from 'lucide-react'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

function formatDate(d) {
  if (!d) return '—'
  const s = String(d)
  const iso = s.includes('T') ? s : s.replace(' ', 'T') + (s.endsWith('Z') ? '' : 'Z')
  const date = new Date(iso)
  return isNaN(date.getTime()) ? '—' : date.toLocaleString('fr-FR')
}

const BADGES = {
  soumis: <span className="badge-amber">À vérifier</span>,
  valide: <span className="badge-green">Validé</span>,
  refuse: <span className="badge-red">Refusé</span>,
}

export default function AdminAvisPublics() {
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)

  const load = () => {
    api.get('/admin/avis-publics')
      .then(r => setAvis(r.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const valider = async (id) => {
    setActionId(id)
    try {
      const r = await api.put(`/admin/avis-publics/${id}/valider`)
      toast.success(r.data?.message || 'Validé !')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    }
    setActionId(null)
  }

  const refuser = async (id) => {
    if (!confirm('Refuser cet avis public ? Aucun crédit ne sera versé, il repart dans le pool disponible.')) return
    setActionId(id)
    try {
      const r = await api.put(`/admin/avis-publics/${id}/refuser`)
      toast.success(r.data?.message || 'Refusé')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    }
    setActionId(null)
  }

  const aVerifier = avis.filter(a => a.statut === 'soumis')
  const historique = avis.filter(a => a.statut !== 'soumis')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-sky-500" size={28} />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <h2 className="page-title">Avis publics ({aVerifier.length} à vérifier)</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Ces avis viennent du flux "commande publique" (client sans compte). Le crédit du membre n'est versé qu'après validation ici — jamais automatiquement à la soumission.
      </p>

      {aVerifier.length === 0 ? (
        <div className="card text-center py-10 text-slate-400">Rien à vérifier pour le moment.</div>
      ) : (
        <div className="space-y-3">
          {aVerifier.map(a => (
            <div key={a.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Building2 size={14} className="text-slate-400 shrink-0" />
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{a.nom_etablissement || 'Établissement non précisé'}</p>
                    {BADGES[a.statut]}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Mail size={12} /> Membre : {a.membre_email || '—'}<BadgePause actif={a.membre_avis_bloque} size={12} /> · Commande : {a.commande_email}
                  </p>
                  <p className="text-xs text-slate-400">Soumis le {formatDate(a.soumis_at)}</p>
                </div>
                <span className="badge-blue shrink-0 flex items-center gap-1"><Euro size={12} /> 1.50€</span>
              </div>

              {a.lien_avis_poste && (
                <a href={a.lien_avis_poste} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 break-all">
                  <ExternalLink size={14} className="shrink-0" /> {a.lien_avis_poste}
                </a>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => valider(a.id)} disabled={actionId === a.id} className="btn-primary flex-1 justify-center">
                  {actionId === a.id ? <Spinner /> : <><CheckCircle2 size={16} /> Valider et créditer</>}
                </button>
                <button onClick={() => refuser(a.id)} disabled={actionId === a.id} className="btn-danger flex-1 justify-center">
                  <XCircle size={16} /> Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {historique.length > 0 && (
        <div className="pt-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Historique récent</h3>
          {historique.slice(0, 20).map(a => (
            <div key={a.id} className="card-flat p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{a.nom_etablissement || 'Établissement non précisé'}</p>
                <p className="text-xs text-slate-400">{a.membre_email || '—'}<BadgePause actif={a.membre_avis_bloque} size={12} className="ml-1" /> · {formatDate(a.valide_at || a.soumis_at)}</p>
              </div>
              {BADGES[a.statut]}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
