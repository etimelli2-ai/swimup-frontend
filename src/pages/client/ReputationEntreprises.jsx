// Onglet « Entreprises » de la page Réputation :
// - modifier l'entreprise sur laquelle on travaille (nom + fiche Google), pour tout le monde ;
// - gérer plusieurs entreprises avec le même abonnement (Premium : 3, Business : 10).
import { useState, useEffect, useCallback } from 'react'
import { Link } from '../../components/Lien'
import { Building2, Crown, Pencil, Plus, Trash2, Check, X, Repeat, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { compteActif, choisirCompte } from '../../lib/api'
import { t } from '../../lib/i18n'

const erreurApi = (e, defaut = t('Une erreur est survenue, réessaie.')) => e.response?.data?.error || defaut

// ---------- L'entreprise sur laquelle on travaille ----------

function EntrepriseActive({ apercu, rafraichir, FicheGoogle }) {
  const [nom, setNom] = useState('')
  const [initial, setInitial] = useState('')
  const [occupe, setOccupe] = useState(false)
  const [changerFiche, setChangerFiche] = useState(false)

  useEffect(() => {
    api.get('/client/commercant').then(r => {
      const n = r.data.config?.nom_commerce || r.data.nom_societe || ''
      setNom(n); setInitial(n)
    }).catch(() => {})
  }, [])

  const enregistrer = async (e) => {
    e.preventDefault()
    setOccupe(true)
    try {
      const r = await api.put('/client/commercant', { nom_commerce: nom.trim() })
      const n = r.data.config?.nom_commerce || nom.trim()
      setNom(n); setInitial(n)
      toast.success(t('Nom enregistré'))
    } catch (err) { toast.error(erreurApi(err)) }
    setOccupe(false)
  }

  const fiche = apercu?.etablissement
  return (
    <div className="card space-y-4">
      <div>
        <h2 className="section-title flex items-center gap-2"><Building2 size={17} />{' '}{t('Mon entreprise')}</h2>
        <p className="text-sm text-muted mt-1">{t('Le nom apparaît sur ton affiche, tes emails d\'avis et ton espace. La fiche Google sert à récupérer tes avis et à suivre ta position.')}</p>
      </div>

      <form onSubmit={enregistrer} className="space-y-1.5">
        <label htmlFor="nom-entreprise" className="text-sm font-medium">{t('Nom de l\'entreprise')}</label>
        <div className="flex gap-2">
          <input id="nom-entreprise" className="input flex-1" value={nom} onChange={e => setNom(e.target.value)} maxLength={100} />
          <button className="btn-primary" disabled={occupe || nom.trim().length < 2 || nom.trim() === initial}>{t('Enregistrer')}</button>
        </div>
      </form>

      <div className="space-y-2">
        <p className="text-sm font-medium">{t('Fiche Google')}</p>
        {!changerFiche && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3">
            <p className="text-sm flex items-center gap-2 min-w-0">
              <MapPin size={15} className="shrink-0 text-slate-500" />
              {fiche?.configure
                ? <span className="min-w-0">{fiche.nom ? <><span className="font-medium">{fiche.nom}</span>{' '}{t('est reliée à ton compte.')}</> : t('Une fiche est reliée à ton compte.')}</span>
                : <span>{t('Aucune fiche reliée pour l\'instant.')}</span>}
            </p>
            <button className="btn-secondary px-3 py-1.5 text-xs shrink-0" onClick={() => setChangerFiche(true)}>
              {fiche?.configure ? t('Changer de fiche') : t('Relier ma fiche')}
            </button>
          </div>
        )}
        {changerFiche && (
          <div className="space-y-2">
            <FicheGoogle titre={fiche?.configure ? t('Choisis la nouvelle fiche') : t('Indique ton établissement')} apres={() => { setChangerFiche(false); rafraichir() }} />
            <button className="btn-secondary text-xs" onClick={() => setChangerFiche(false)}><X size={14} />{' '}{t('Annuler')}</button>
          </div>
        )}
        {changerFiche && fiche?.configure && <p className="text-xs text-muted">{t('Changer de fiche remet à zéro les avis gardés en mémoire pour cette entreprise ; l\'historique de ta note reste.')}</p>}
      </div>
    </div>
  )
}

// ---------- Mes entreprises ----------

function Ligne({ e, principale, actuelle, surCompte, onRenommer, onRetirer, occupe }) {
  const [edition, setEdition] = useState(false)
  const [nom, setNom] = useState(e.nom)
  const [confirme, setConfirme] = useState(false)

  const valider = async (ev) => {
    ev.preventDefault()
    if (await onRenommer(e.client_id, nom)) setEdition(false)
  }

  return (
    <li className="py-3 space-y-2">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {edition ? (
            <form onSubmit={valider} className="flex gap-2">
              <input className="input flex-1" value={nom} onChange={ev => setNom(ev.target.value)} maxLength={60} autoFocus aria-label={t('Nouveau nom')} />
              <button className="btn-primary px-3" disabled={occupe || nom.trim().length < 2} aria-label={t('Enregistrer le nom')}><Check size={15} /></button>
              <button type="button" className="btn-secondary px-3" onClick={() => { setEdition(false); setNom(e.nom) }} aria-label={t('Annuler')}><X size={15} /></button>
            </form>
          ) : (
            <>
              <p className="text-sm font-medium truncate">{e.nom}</p>
              <p className="text-xs text-muted">
                {principale ? t('Ton entreprise principale') : t('Entreprise ajoutée')} · {e.fiche_google ? t('fiche Google reliée') : t('fiche Google à relier')}
              </p>
            </>
          )}
        </div>
        {!edition && (
          actuelle
            ? <span className="text-xs font-medium rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-200 px-2.5 py-1 shrink-0">{t('En cours')}</span>
            : <button className="btn-secondary px-3 py-1.5 text-xs shrink-0" onClick={() => surCompte(e.client_id, principale)}><Repeat size={13} />{' '}{t('Travailler dessus')}</button>
        )}
      </div>
      {!principale && !edition && (
        <div className="flex gap-2 justify-end">
          <button className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1" onClick={() => setEdition(true)}><Pencil size={12} />{' '}{t('Renommer')}</button>
          {!confirme
            ? <button className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1" onClick={() => setConfirme(true)}><Trash2 size={12} />{' '}{t('Retirer')}</button>
            : (
              <span className="text-xs inline-flex items-center gap-2">
                <span className="text-red-600 dark:text-red-400">{t('Ses avis, mots-clés et campagnes seront effacés.')}</span>
                <button className="font-semibold text-red-600 underline" disabled={occupe} onClick={() => onRetirer(e.client_id)}>{t('Retirer')}</button>
                <button className="underline" onClick={() => setConfirme(false)}>{t('Garder')}</button>
              </span>
            )}
        </div>
      )}
    </li>
  )
}

function MesEntreprises({ d, recharger }) {
  const [nom, setNom] = useState('')
  const [lien, setLien] = useState('')
  const [occupe, setOccupe] = useState(false)
  const actif = compteActif()
  const verrouille = d.offre === 'gratuit'
  const plein = d.total >= d.limite

  const surCompte = (id, principale) => {
    choisirCompte(principale ? null : id)
    window.location.reload()
  }
  const ajouter = async (ev) => {
    ev.preventDefault()
    setOccupe(true)
    try {
      const r = await api.post('/client/etablissements', { nom: nom.trim(), ...(lien.trim() ? { place_id: lien.trim() } : {}) })
      toast.success(t('{nom} ajoutée', { nom: r.data.nom }))
      setNom(''); setLien('')
      await recharger()
    } catch (e) { toast.error(erreurApi(e)) }
    setOccupe(false)
  }
  const renommer = async (id, n) => {
    setOccupe(true)
    try { await api.put(`/client/etablissements/${id}`, { nom: n.trim() }); toast.success(t('Nom enregistré')); await recharger(); setOccupe(false); return true }
    catch (e) { toast.error(erreurApi(e)); setOccupe(false); return false }
  }
  const retirer = async (id) => {
    setOccupe(true)
    try {
      await api.delete(`/client/etablissements/${id}`)
      toast.success(t('Entreprise retirée'))
      if (String(id) === String(actif)) { choisirCompte(null); window.location.reload(); return }
      await recharger()
    } catch (e) { toast.error(erreurApi(e)) }
    setOccupe(false)
  }

  const toutes = [{ ...d.principal, principale: true }, ...d.ajoutes]
  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="section-title">{t('Mes entreprises')}</h2>
          <p className="text-sm text-muted mt-1">{t('Un seul abonnement, plusieurs entreprises. Chacune a ses avis, sa position sur Google Maps, ses campagnes et ses quotas.')}</p>
        </div>
        <span className="text-sm font-semibold shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1" aria-label={t('{total} entreprises sur {limite}', { total: d.total, limite: d.limite })}>{d.total} / {d.limite}</span>
      </div>

      <ul className="divide-y divide-slate-100 dark:divide-slate-700">
        {toutes.map(e => (
          <Ligne key={e.client_id} e={e} principale={!!e.principale}
            actuelle={e.principale ? !actif : String(e.client_id) === actif}
            surCompte={surCompte} onRenommer={renommer} onRetirer={retirer} occupe={occupe} />
        ))}
      </ul>

      {verrouille && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-4 text-sm space-y-3">
          <p className="flex items-start gap-2"><Crown size={16} className="text-amber-500 mt-0.5 shrink-0" />{' '}{t('Avec Premium, tu gères jusqu\'à 3 entreprises avec le même abonnement. Business monte à 10.')}</p>
          <Link to="/client/premium" className="btn-primary w-full justify-center">{t('Débloquer avec Premium')}</Link>
        </div>
      )}

      <fieldset disabled={verrouille || plein} className={verrouille ? 'opacity-60 select-none' : plein ? 'opacity-70' : ''}>
        <form onSubmit={ajouter} className="space-y-2">
          <p className="text-sm font-medium">{t('Ajouter une entreprise')}</p>
          <input className="input" placeholder={t('Nom de l\'entreprise')} value={nom} onChange={e => setNom(e.target.value)} maxLength={60} aria-label={t('Nom de la nouvelle entreprise')} required={!verrouille} />
          <input className="input" placeholder={t('Lien Google ou identifiant de lieu (facultatif)')} value={lien} onChange={e => setLien(e.target.value)} maxLength={500} aria-label={t('Fiche Google (facultatif)')} />
          <p className="text-xs text-muted">{t('Tu pourras relier la fiche Google plus tard, depuis « Travailler dessus ».')}</p>
          <button className="btn-primary w-full justify-center" disabled={occupe || nom.trim().length < 2}><Plus size={15} />{' '}{t('Ajouter')}</button>
        </form>
      </fieldset>

      {!verrouille && plein && (
        d.offre === 'premium'
          ? <p className="text-sm flex items-start gap-2"><Crown size={15} className="text-indigo-500 mt-0.5 shrink-0" />{' '}{t('Tu as atteint les {limite} entreprises de Premium.', { limite: d.limite })}{' '}<Link to="/client/premium" className="underline font-medium">{t('Business en permet {business}.', { business: d.limites.business })}</Link></p>
          : d.offre === 'business' && d.limites?.agence
            ? <p className="text-sm flex items-start gap-2"><Crown size={15} className="text-violet-500 mt-0.5 shrink-0" />{' '}{t('Tu as atteint les {limite} entreprises de Business.', { limite: d.limite })}{' '}<Link to="/client/premium" className="underline font-medium">{t('Agence en permet {agence}.', { agence: d.limites.agence })}</Link></p>
            : <p className="text-sm text-muted">{t('Tu as atteint les {limite} entreprises de ton offre.', { limite: d.limite })}</p>
      )}
    </div>
  )
}

export default function ReputationEntreprises({ apercu, rafraichir, FicheGoogle }) {
  const [d, setD] = useState(null)
  const recharger = useCallback(async () => {
    try { setD((await api.get('/client/etablissements')).data) }
    catch { toast.error(t('Chargement impossible')) }
  }, [])
  useEffect(() => { recharger() }, [recharger])

  return (
    <div className="space-y-5">
      <EntrepriseActive apercu={apercu} rafraichir={rafraichir} FicheGoogle={FicheGoogle} />
      {d ? <MesEntreprises d={d} recharger={recharger} /> : <div className="card animate-pulse h-32" />}
    </div>
  )
}
