import { useEffect, useState } from 'react'
import api from '../lib/api'
import {
  Clock, Link2, CheckCircle2, XCircle, AlertTriangle,
  RotateCcw, Loader2, ExternalLink, Copy, Check
} from 'lucide-react'

export default function MonAvis() {
  const [avis, setAvis] = useState([])
  const [lien, setLien] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get('/avis/mes-avis')
      .then(r => setAvis(r.data))
      .catch(() => setMsg({ type: 'error', text: 'Erreur de chargement' }))
      .finally(() => setLoading(false))
  }, [])

  const soumettre = async (id) => {
    if (!lien.trim()) return setMsg({ type: 'error', text: 'Colle le lien de ton avis Google Maps' })
    try {
      await api.post(`/avis/${id}/soumettre`, { lien_avis: lien })
      setMsg({ type: 'success', text: 'Avis soumis et validé !' })
      setAvis(prev => prev.map(a => a.id === id ? { ...a, statut: 'valide' } : a))
      setLien('')
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur' })
    }
  }

  const annuler = async (id) => {
    if (!confirm('Annuler la réservation ?')) return
    try {
      await api.post(`/avis/${id}/annuler`)
      setAvis(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur' })
    }
  }

  const copyLink = (url) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'valide': return <span className="badge-green flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Validé</span>
      case 'refuse': return <span className="badge-red flex items-center gap-1"><XCircle className="w-3 h-3" /> Refusé</span>
      case 'paye': return <span className="badge-aqua flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Payé</span>
      default: return <span className="badge-yellow flex items-center gap-1"><Clock className="w-3 h-3" /> En cours</span>
    }
  }

  const enCours = avis.filter(a => ['reserve', 'en_verification'].includes(a.statut))
  const termines = avis.filter(a => ['valide', 'refuse', 'paye'].includes(a.statut))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-aqua-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="section-title">Mon avis</h1>

      {msg && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          msg.type === 'error'
            ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
        }`}>
          {msg.text}
        </div>
      )}

      {enCours.length === 0 && termines.length === 0 && (
        <div className="card-flat text-center py-16">
          <AlertTriangle className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Tu n'as aucun avis en cours</p>
          <p className="text-xs text-slate-400 mt-1">Va dans "Avis" pour en réserver un</p>
        </div>
      )}

      {enCours.map(a => {
        const reserveAt = new Date(a.reserve_at)
        const diff = 3600000 - (Date.now() - reserveAt.getTime())
        const minutes = Math.max(0, Math.floor(diff / 60000))
        const secondes = Math.max(0, Math.floor((diff % 60000) / 1000))

        return (
          <div key={a.id} className="card border-l-4 border-l-aqua-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-slate-900 dark:text-white">{a.nom_societe}</h3>
              {getStatusBadge(a.statut)}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-3">
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{a.texte}"</p>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => copyLink(a.lien_maps)} className="btn-ghost flex items-center gap-1 text-xs">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copié' : 'Copier le lien'}
              </button>
              <a href={a.lien_maps} target="_blank" rel="noreferrer"
                className="btn-ghost flex items-center gap-1 text-xs">
                <ExternalLink className="w-3.5 h-3.5" /> Ouvrir Maps
              </a>
            </div>

            <div className="flex items-center gap-2 mb-3 text-sm">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {String(minutes).padStart(2, '0')}:{String(secondes).padStart(2, '0')}
              </span>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="url" placeholder="Colle le lien de ton avis ici" value={lien}
                  onChange={e => setLien(e.target.value)} className="input pl-11 text-sm" />
              </div>
              <button onClick={() => soumettre(a.id)} className="btn-primary text-sm py-3">
                Soumettre mon avis
              </button>
              <button onClick={() => annuler(a.id)} className="btn-secondary text-sm py-3">
                <RotateCcw className="w-4 h-4 inline mr-1" /> Annuler
              </button>
            </div>
          </div>
        )
      })}

      {termines.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Historique</h2>
          <div className="space-y-2">
            {termines.map(a => (
              <div key={a.id} className="card-flat p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{a.nom_societe}</p>
                  <p className="text-xs text-slate-500">{parseFloat(a.prix).toFixed(2)} €</p>
                </div>
                {getStatusBadge(a.statut)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
