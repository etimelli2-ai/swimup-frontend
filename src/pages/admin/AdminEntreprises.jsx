import { useState, useEffect, useCallback } from 'react'
import { Search, ArrowLeft, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const FILTRES = [
  ['', 'Toutes'], ['premium', 'Premium'], ['gratuit', 'Gratuites'],
  ['carte', 'Par carte'], ['impaye', 'Impayés'], ['expire', 'Expirées'],
]
const SOURCES = { stripe: 'Carte', paypal: 'PayPal', admin: 'Offert' }

const date = (s) => s ? new Date(String(s).replace(' ', 'T') + 'Z').toLocaleDateString('fr-FR') : '—'
const dateHeure = (s) => s ? new Date(String(s).replace(' ', 'T') + 'Z').toLocaleString('fr-FR') : '—'

export default function AdminEntreprises() {
  const [onglet, setOnglet] = useState('entreprises')
  const [ouverte, setOuverte] = useState(null)

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="page-title">Entreprises</h2>
        <p className="text-sm text-muted mt-1">Les clients, leur offre, leur usage et leurs demandes d'aide.</p>
      </div>
      {!ouverte && (
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
          {[['entreprises', 'Entreprises'], ['aide', 'Demandes d\'aide']].map(([v, l]) => (
            <button key={v} onClick={() => setOnglet(v)}
              className={`flex-1 py-2 text-xs font-medium rounded-full transition-all ${onglet === v ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300' : 'text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>
      )}
      {ouverte
        ? <Fiche id={ouverte} retour={() => setOuverte(null)} />
        : onglet === 'entreprises' ? <Liste ouvrir={setOuverte} /> : <DemandesAide ouvrir={setOuverte} />}
    </div>
  )
}

function Liste({ ouvrir }) {
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('')
  const [tri, setTri] = useState('recent')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [erreur, setErreur] = useState(false)

  const charger = useCallback(() => {
    const p = new URLSearchParams({ page, tri })
    if (recherche.trim()) p.set('search', recherche.trim())
    if (filtre) p.set('filtre', filtre)
    api.get(`/admin/entreprises?${p}`).then(r => { setData(r.data); setErreur(false) }).catch(() => setErreur(true))
  }, [page, tri, recherche, filtre])

  // Petite attente pendant la frappe pour ne pas interroger le serveur à chaque lettre
  useEffect(() => { const t = setTimeout(charger, recherche ? 300 : 0); return () => clearTimeout(t) }, [charger])
  useEffect(() => { setPage(1) }, [recherche, filtre, tri])

  const pages = data ? Math.max(1, Math.ceil(data.total / data.par_page)) : 1

  return (
    <>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Rechercher un nom ou un email" value={recherche}
          onChange={e => setRecherche(e.target.value)} maxLength={80} />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {FILTRES.map(([v, l]) => (
          <button key={v} onClick={() => setFiltre(v)}
            className={filtre === v ? 'badge-blue' : 'badge-gray'}>{l}</button>
        ))}
        <select className="input !w-auto !py-1.5 text-xs ml-auto" value={tri} onChange={e => setTri(e.target.value)} aria-label="Trier">
          <option value="recent">Plus récentes</option>
          <option value="nom">Nom</option>
          <option value="avis">Plus d'avis</option>
          <option value="usage">Plus d'usage (30 j)</option>
        </select>
      </div>

      {erreur && <div className="card text-center py-8 text-sm text-red-500">Impossible de charger la liste.</div>}
      {data && (
        <>
          <p className="text-xs text-muted">{data.total} entreprise{data.total > 1 ? 's' : ''}</p>
          <div className="space-y-2">
            {data.entreprises.map(e => (
              <button key={e.id} onClick={() => ouvrir(e.id)} className="card w-full text-left space-y-1 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{e.nom_societe || 'Sans nom'}</p>
                    <p className="text-xs text-muted truncate">{e.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end shrink-0">
                    {e.premium_actif ? <span className="badge-amber"><Crown size={11} /> Premium</span> : <span className="badge-gray">Gratuit</span>}
                    {e.statut_carte === 'impaye' && <span className="badge-red">Impayé</span>}
                  </div>
                </div>
                <p className="text-xs text-muted">
                  Inscrit le {date(e.created_at)} · {e.nb_avis} avis · {e.usage_30j} actions IA/emails en 30 j
                  {e.premium_actif && ` · ${SOURCES[e.premium_source] || '—'} jusqu'au ${date(e.premium_expire_at)}`}
                </p>
              </button>
            ))}
            {data.entreprises.length === 0 && <div className="card text-center py-10 text-gray-400">Aucune entreprise ne correspond.</div>}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button className="btn-secondary px-4 py-1.5 text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</button>
              <span className="text-muted">Page {page} / {pages}</span>
              <button className="btn-secondary px-4 py-1.5 text-xs" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Suivant</button>
            </div>
          )}
        </>
      )}
    </>
  )
}

function Fiche({ id, retour }) {
  const [d, setD] = useState(null)
  const [erreur, setErreur] = useState(false)
  const charger = useCallback(() => {
    api.get(`/admin/entreprises/${id}`).then(r => setD(r.data)).catch(() => setErreur(true))
  }, [id])
  useEffect(() => { charger() }, [charger])

  if (erreur) return <div className="card text-center py-8 text-sm text-red-500">Fiche introuvable. <button className="underline" onClick={retour}>Retour</button></div>
  if (!d) return null
  const e = d.entreprise
  const carte = d.abonnement_carte

  return (
    <div className="space-y-4">
      <button onClick={retour} className="text-sm text-sky-600 flex items-center gap-1"><ArrowLeft size={15} /> Retour à la liste</button>

      <div className="card space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{e.nom_societe || 'Sans nom'}</h3>
            <p className="text-sm text-muted break-all">{e.email}</p>
          </div>
          {e.premium_actif ? <span className="badge-amber"><Crown size={11} /> Premium</span> : <span className="badge-gray">Gratuit</span>}
        </div>
        <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <dt className="text-muted">Inscrit le</dt><dd>{date(e.created_at)}</dd>
          <dt className="text-muted">Dernière connexion</dt><dd>{dateHeure(e.last_login)}</dd>
          <dt className="text-muted">Avis commandés</dt><dd>{e.nb_avis}</dd>
          <dt className="text-muted">Lien d'avis Google</dt><dd>{e.lien_avis_configure ? 'configuré' : 'non configuré'}</dd>
          {e.premium_actif && <><dt className="text-muted">Premium</dt><dd>{SOURCES[e.premium_source] || '—'}, jusqu'au {date(e.premium_expire_at)}</dd></>}
          {carte && <><dt className="text-muted">Abonnement carte</dt>
            <dd>{carte.statut}{carte.resiliation_prevue ? ' (résilié, fin de période)' : ''}</dd></>}
        </dl>
      </div>

      <PremiumManuel id={id} actif={e.premium_actif} apres={charger} />

      <div className="card space-y-2">
        <h3 className="section-title">Usage</h3>
        <ul className="text-sm space-y-1">
          <li>Emails d'avis : {d.quotas.email_avis.utilise_aujourdhui} / {d.quotas.email_avis.limite} aujourd'hui · {d.quotas.email_avis.total_30j} en 30 j</li>
          <li>Réponses IA : {d.quotas.reponse_ia.utilise_aujourdhui} / {d.quotas.reponse_ia.limite} aujourd'hui · {d.quotas.reponse_ia.total_30j} en 30 j</li>
          <li>Passages sur le lien d'avis (30 j) : QR {d.suivi_liens_30j.qr || 0}, lien {d.suivi_liens_30j.lien || 0}, email {d.suivi_liens_30j.email || 0}</li>
        </ul>
      </div>

      <div className="card space-y-2">
        <h3 className="section-title">Paiements Premium</h3>
        {d.paiements.length === 0 ? <p className="text-sm text-muted">Aucun paiement.</p> : (
          <ul className="text-[13px] divide-y divide-slate-100 dark:divide-slate-700">
            {d.paiements.map((p, i) => (
              <li key={i} className="flex justify-between py-1.5 gap-2">
                <span>{date(p.created_at)} · {SOURCES[p.source] || p.source}{p.statut === 'echec' ? ' · refusé' : ''}</span>
                <span className={p.statut === 'echec' ? 'text-red-500' : ''}>{Number(p.montant).toFixed(2)} €</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card space-y-2">
        <h3 className="section-title">Changements faits à la main</h3>
        {d.journal_premium.length === 0 ? <p className="text-sm text-muted">Rien pour l'instant.</p> : (
          <ul className="text-[13px] space-y-2">
            {d.journal_premium.map((j, i) => (
              <li key={i}>
                <span className="font-medium">{j.action === 'activer' ? `Activé ${j.jours} j` : 'Retiré'}</span>
                <span className="text-muted"> · {dateHeure(j.created_at)} · {j.admin_email || 'admin'}</span>
                <p className="text-slate-600 dark:text-slate-300">{j.motif}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {d.demandes_assistance.length > 0 && (
        <div className="card space-y-2">
          <h3 className="section-title">Demandes d'aide</h3>
          <ul className="text-[13px] space-y-1">
            {d.demandes_assistance.map(x => (
              <li key={x.id}>{date(x.created_at)} · {x.sujet} <span className={x.statut === 'ouverte' ? 'badge-yellow' : 'badge-green'}>{x.statut === 'ouverte' ? 'ouverte' : 'traitée'}</span></li>
            ))}
          </ul>
        </div>
      )}

      {d.erreurs.length > 0 && (
        <div className="card space-y-2">
          <h3 className="section-title">Erreurs récentes liées à ce client</h3>
          <ul className="text-[13px] space-y-1">
            {d.erreurs.map((x, i) => <li key={i}><span className="text-muted">{dateHeure(x.created_at)}</span> · {x.contexte} : {x.message}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function PremiumManuel({ id, actif, apres }) {
  const [ouvert, setOuvert] = useState(false)
  const [action, setAction] = useState(actif ? 'retirer' : 'activer')
  const [jours, setJours] = useState(30)
  const [offre, setOffre] = useState('premium')
  const [motif, setMotif] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const valider = async () => {
    setEnvoi(true)
    try {
      const r = await api.post(`/admin/entreprises/${id}/premium`, { action, jours: action === 'activer' ? Number(jours) : undefined, offre: action === 'activer' ? offre : undefined, motif })
      toast.success(action === 'activer' ? `${offre === 'business' ? 'Business' : 'Premium'} activé` : 'Offre retirée')
      if (r.data?.avertissement) toast(r.data.avertissement, { duration: 9000 })
      setMotif(''); setOuvert(false); apres()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
    }
    setEnvoi(false)
  }

  if (!ouvert) {
    return <button className="btn-secondary w-full" onClick={() => { setAction(actif ? 'retirer' : 'activer'); setOuvert(true) }}>
      {actif ? 'Retirer ou prolonger le Premium' : 'Activer le Premium à la main'}
    </button>
  }
  return (
    <div className="card space-y-3">
      <h3 className="section-title">Premium à la main</h3>
      <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
        {[['activer', 'Activer / prolonger'], ['retirer', 'Retirer']].map(([v, l]) => (
          <button key={v} onClick={() => setAction(v)}
            className={`flex-1 py-2 text-xs font-medium rounded-full ${action === v ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300' : 'text-gray-500'}`}>{l}</button>
        ))}
      </div>
      {action === 'activer' && (
        <label className="block text-sm">Offre
          <select className="input mt-1" value={offre} onChange={e => setOffre(e.target.value)}>
            <option value="premium">Premium</option>
            <option value="business">Business</option>
          </select>
        </label>
      )}
      {action === 'activer' && (
        <label className="block text-sm">Durée en jours
          <input type="number" min={1} max={365} className="input mt-1" value={jours} onChange={e => setJours(e.target.value)} />
        </label>
      )}
      <label className="block text-sm">Motif (obligatoire, gardé dans le journal)
        <textarea className="input mt-1" rows={2} maxLength={300} value={motif} onChange={e => setMotif(e.target.value)}
          placeholder="Ex : geste commercial après un bug du QR code" />
      </label>
      {action === 'retirer' && <p className="text-xs text-muted">Si un abonnement par carte est en cours, il est aussi résilié pour éviter un nouveau prélèvement.</p>}
      <div className="flex gap-2">
        <button className="btn-secondary flex-1" onClick={() => setOuvert(false)} disabled={envoi}>Annuler</button>
        <button className="btn-primary flex-1" onClick={valider} disabled={envoi || motif.trim().length < 5}>Confirmer</button>
      </div>
    </div>
  )
}

function DemandesAide({ ouvrir }) {
  const [statut, setStatut] = useState('ouverte')
  const [liste, setListe] = useState(null)
  const charger = useCallback(() => { api.get(`/admin/entreprises/support/demandes?statut=${statut}`).then(r => setListe(r.data)) }, [statut])
  useEffect(() => { charger() }, [charger])

  const traiter = async (id) => {
    try { await api.put(`/admin/entreprises/support/demandes/${id}/traitee`); charger() }
    catch (e) { toast.error(e.response?.data?.error || 'Erreur') }
  }

  return (
    <>
      <div className="flex gap-2">
        {[['ouverte', 'À traiter'], ['traitee', 'Traitées']].map(([v, l]) => (
          <button key={v} onClick={() => setStatut(v)} className={statut === v ? 'badge-blue' : 'badge-gray'}>{l}</button>
        ))}
      </div>
      <div className="space-y-2">
        {(liste || []).map(d => (
          <div key={d.id} className="card space-y-2">
            <div className="flex justify-between gap-2">
              <button className="text-left min-w-0" onClick={() => ouvrir(d.client_id)}>
                <p className="font-medium truncate">{d.sujet}</p>
                <p className="text-xs text-muted truncate">{d.nom_societe || d.email} · {dateHeure(d.created_at)}</p>
              </button>
              {d.statut === 'ouverte' && <button className="btn-secondary px-3 py-1.5 text-xs shrink-0" onClick={() => traiter(d.id)}>Marquer traitée</button>}
            </div>
          </div>
        ))}
        {liste && liste.length === 0 && <div className="card text-center py-10 text-gray-400">Rien ici.</div>}
      </div>
    </>
  )
}
