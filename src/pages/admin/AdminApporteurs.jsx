import { useState, useEffect } from 'react'
import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const euros = (n) => `${(Number(n) || 0).toFixed(2).replace('.', ',')} €`
const jour = (d) => (d ? new Date(String(d).replace(' ', 'T') + 'Z').toLocaleDateString('fr-FR') : '')

export default function AdminApporteurs() {
  const [liste, setListe] = useState([])
  const [retraits, setRetraits] = useState([])
  const [commissions, setCommissions] = useState([])
  const [email, setEmail] = useState('')
  const [occupe, setOccupe] = useState(false)

  const charger = () => Promise.all([
    api.get('/admin/apporteurs'), api.get('/admin/apporteurs/retraits'), api.get('/admin/apporteurs/commissions'),
  ]).then(([a, r, c]) => { setListe(a.data); setRetraits(r.data); setCommissions(c.data) })
    .catch(() => toast.error('Chargement impossible'))
  useEffect(() => { charger() }, [])

  const agir = async (fn, ok) => {
    setOccupe(true)
    try { await fn(); if (ok) toast.success(ok); await charger() }
    catch (e) { toast.error(e.response?.data?.errors?.[0]?.message || e.response?.data?.error || 'Erreur') }
    finally { setOccupe(false) }
  }

  const creer = (e) => {
    e.preventDefault()
    agir(async () => {
      const r = await api.post('/admin/apporteurs', { email: email.trim() })
      setEmail('')
      toast(r.data.cree ? `Apporteur créé, code ${r.data.code}` : `Déjà apporteur, code ${r.data.code}`)
    })
  }
  const copier = (lien) => { navigator.clipboard.writeText(lien); toast.success('Lien copié') }
  const enAttente = retraits.filter(r => r.statut === 'en_attente')
  const aPayer = enAttente.reduce((s, r) => s + (parseFloat(r.montant) || 0), 0)

  return (
    <div className="p-4 space-y-5 max-w-3xl">
      <div>
        <h2 className="page-title">Apporteurs</h2>
        <p className="text-sm text-gray-500 mt-1">20 % du premier paiement d'abonnement des entreprises amenées par leur lien. Ils accèdent à leur espace sur /apporteur.</p>
      </div>

      <form onSubmit={creer} className="card flex gap-2">
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email du compte à passer apporteur"
          className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm" aria-label="Email du compte" />
        <button disabled={occupe} className="bg-sky-500 text-white rounded-full px-4 text-sm font-medium disabled:opacity-60">Créer</button>
      </form>

      {enAttente.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-semibold text-gray-900">Retraits à payer · {euros(aPayer)}</h3>
          {enAttente.map(r => (
            <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm">
                <p className="font-bold text-lg text-gray-900">{euros(r.montant)}</p>
                <p className="text-gray-600">{r.email} · PayPal : <span className="font-medium">{r.paypal}</span></p>
                <p className="text-xs text-gray-400">{jour(r.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <button disabled={occupe} onClick={() => agir(() => api.put(`/admin/apporteurs/retraits/${r.id}`, { statut: 'paye' }), 'Marqué payé')}
                  className="bg-emerald-500 text-white rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60">Marquer payé</button>
                <button disabled={occupe} onClick={() => agir(() => api.put(`/admin/apporteurs/retraits/${r.id}`, { statut: 'refuse' }), 'Refusé')}
                  className="bg-red-50 text-red-600 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60">Refuser</button>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-2">
        <h3 className="font-semibold text-gray-900">Apporteurs ({liste.length})</h3>
        {liste.length === 0 && <div className="card text-center py-8 text-gray-400 text-sm">Aucun apporteur pour l'instant</div>}
        {liste.map(a => (
          <div key={a.id} className="card space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{a.email}</p>
                <p className="text-xs text-gray-500">Code <span className="font-semibold">{a.code}</span> · {a.nb_clients} inscrits · {a.nb_payeurs} abonnés</p>
              </div>
              <button disabled={occupe} onClick={() => agir(() => api.put(`/admin/apporteurs/${a.id}/actif`, { actif: !a.actif }), a.actif ? 'Lien désactivé' : 'Lien réactivé')}
                className={`shrink-0 text-xs font-medium rounded-full px-3 py-1.5 ${a.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {a.actif ? 'Actif' : 'Désactivé'}
              </button>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <span>Gagné : <b>{euros(a.acquis)}</b></span>
              <span>Retiré ou demandé : <b>{euros(a.retire)}</b></span>
              <span>Disponible : <b>{euros(a.disponible)}</b></span>
            </div>
            <button onClick={() => copier(a.lien)} className="inline-flex items-center gap-1.5 text-xs text-sky-600"><Copy size={12} /> Copier son lien</button>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold text-gray-900">Commissions</h3>
        {commissions.length === 0 && <div className="card text-center py-6 text-gray-400 text-sm">Aucune commission pour l'instant</div>}
        {commissions.map(c => (
          <div key={c.id} className="card flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="text-gray-800 truncate">{c.email} <span className="text-gray-400">· {jour(c.created_at)}</span></p>
              <p className="text-xs text-gray-500">{euros(c.base)} payés × {Math.round(c.taux * 100)} %{c.statut === 'annulee' && ' · annulée'}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <b className={c.statut === 'annulee' ? 'text-gray-400 line-through' : 'text-gray-900'}>{euros(c.montant)}</b>
              {c.statut === 'acquise' && (
                <button disabled={occupe} onClick={() => { if (window.confirm('Annuler cette commission (remboursement, fraude…) ?')) agir(() => api.put(`/admin/apporteurs/commissions/${c.id}/annuler`), 'Commission annulée') }}
                  className="text-xs text-red-600">Annuler</button>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
