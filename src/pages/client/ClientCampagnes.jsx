import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Crown, Send, Square, Trash2, ChevronDown, ChevronUp, AlertTriangle, Check, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const erreurApi = (e, defaut = 'Une erreur est survenue, réessaie.') => e.response?.data?.error || defaut
const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/
const dateFr = (s) => s ? new Date(String(s).replace(' ', 'T') + 'Z').toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'

const STATUTS = {
  planifiee: ['Planifiée', 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'],
  en_cours: ['En cours', 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'],
  terminee: ['Terminée', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'],
  arretee: ['Arrêtée', 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'],
}
const STATUT_DEST = {
  en_attente: 'En attente', envoye: 'Envoyé', echec: 'Échec d\'envoi', desinscrit: 'Désinscrit', deja_contacte: 'Contacté il y a moins de 30 jours',
  rebond: 'Adresse invalide', plainte: 'Signalé comme indésirable', annule: 'Annulé',
}

// « email, prénom » une personne par ligne (virgule, point-virgule ou tabulation).
function lireDestinataires(texte) {
  const valides = []
  const invalides = []
  const vus = new Set()
  let doublons = 0
  for (const brut of texte.split(/\r?\n/)) {
    const ligne = brut.trim()
    if (!ligne) continue
    const [email, ...reste] = ligne.split(/[,;\t]/).map(x => x.trim())
    if (!EMAIL.test(email || '')) { invalides.push(ligne); continue }
    const cle = email.toLowerCase()
    if (vus.has(cle)) { doublons++; continue }
    vus.add(cle)
    valides.push({ email: cle, prenom: reste.join(' ').trim().slice(0, 40) || null })
  }
  return { valides, invalides, doublons }
}

function Compteur({ libelle, valeur, aide }) {
  return (
    <div className="text-center" title={aide}>
      <p className="text-lg font-semibold tabular-nums">{valeur}</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{libelle}</p>
    </div>
  )
}

export default function ClientCampagnes() {
  const [infos, setInfos] = useState(null)
  const [campagnes, setCampagnes] = useState(null)
  const [erreur, setErreur] = useState(false)
  const [creation, setCreation] = useState(false)

  const charger = useCallback(() => {
    api.get('/client/campagnes/modeles').then(r => setInfos(r.data)).catch(() => setErreur(true))
    api.get('/client/campagnes').then(r => setCampagnes(r.data.campagnes)).catch(() => setErreur(true))
  }, [])
  useEffect(() => { charger() }, [charger])

  // Tant qu'une campagne est en cours, on rafraîchit les chiffres.
  useEffect(() => {
    if (!campagnes?.some(c => ['planifiee', 'en_cours'].includes(c.statut))) return
    const t = setInterval(() => api.get('/client/campagnes').then(r => setCampagnes(r.data.campagnes)).catch(() => {}), 30000)
    return () => clearInterval(t)
  }, [campagnes])

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Campagnes d'avis</h1>
          <p className="text-muted mt-1">Demande un avis à tes clients par email, en plusieurs envois, avec le suivi de ce qui part.</p>
        </div>
        {infos && !creation && infos.config_ok && infos.premium && (
          <button className="btn-primary shrink-0" onClick={() => setCreation(true)}><Plus size={15} /> Nouvelle</button>
        )}
      </div>

      {erreur && <div className="card text-center text-sm text-red-500 py-8">Impossible de charger cette page. Recharge-la dans un instant.</div>}

      {infos && !infos.premium && (
        <div className="card space-y-3">
          <p className="font-medium flex items-center gap-2"><Crown size={16} className="text-amber-500" /> Les campagnes d'emails font partie de Premium</p>
          <p className="text-sm text-muted">
            Envoie ta demande d'avis à toute ta clientèle d'un coup (jusqu'à {infos.destinataires_premium} adresses par campagne), avec ton propre texte, un envoi programmé et une relance.
            En Gratuit, tu peux déjà demander un avis à quelques clients par jour depuis <Link to="/client/outils" className="underline">Outils avis</Link>.
          </p>
          <Link to="/client/premium" className="btn-primary w-full justify-center">Voir Premium</Link>
        </div>
      )}

      {infos && !infos.config_ok && infos.premium && (
        <div className="card text-sm space-y-2">
          <p className="font-medium">Il manque le nom de ton commerce ou ton lien d'avis.</p>
          <p className="text-muted">Renseigne-les dans <Link to="/client/outils" className="underline">Outils avis</Link>, puis reviens ici.</p>
        </div>
      )}
      {infos && !infos.email_disponible && (
        <div className="card text-sm text-amber-700 dark:text-amber-300">L'envoi d'emails n'est pas disponible pour le moment. Tu peux préparer ta campagne, elle partira dès que ce sera rétabli.</div>
      )}

      {infos && creation && (
        <Formulaire infos={infos} annuler={() => setCreation(false)} fait={() => { setCreation(false); charger() }} />
      )}

      {campagnes && campagnes.length === 0 && !creation && infos?.config_ok && infos.premium && (
        <div className="card text-center py-10 space-y-3">
          <Mail size={28} className="mx-auto text-slate-400" />
          <p className="font-medium">Aucune campagne pour l'instant</p>
          <p className="text-sm text-muted max-w-sm mx-auto">Colle les adresses de clients qui t'ont donné leur email, choisis un modèle, et SwimUp s'occupe de l'envoi.</p>
          <button className="btn-primary" onClick={() => setCreation(true)}>Créer ma première campagne</button>
        </div>
      )}

      {campagnes?.map(c => <CarteCampagne key={c.id} c={c} suivi={infos?.suivi_actif} rafraichir={charger} />)}

      {infos && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Chaque email contient un lien de désinscription, et les personnes désinscrites ne sont plus jamais contactées. On ne propose ni cadeau ni remise en échange d'un avis, et on ne trie pas les clients selon leur satisfaction : c'est interdit par Google. Un clic sur le bouton n'est pas un avis publié, seul Google le sait.
        </p>
      )}
    </div>
  )
}

function Formulaire({ infos, annuler, fait }) {
  const premium = infos.premium
  const [nom, setNom] = useState('')
  const [modele, setModele] = useState(infos.modeles[0].cle)
  const [sujet, setSujet] = useState(infos.modeles[0].sujet)
  const [corps, setCorps] = useState(infos.modeles[0].corps)
  const [adresses, setAdresses] = useState('')
  const [quand, setQuand] = useState('')
  const [relance, setRelance] = useState('')
  const [attestation, setAttestation] = useState(false)
  const [problemes, setProblemes] = useState([])
  const [occupe, setOccupe] = useState(false)
  const lim = infos.limites

  const dest = useMemo(() => lireDestinataires(adresses), [adresses])

  const choisirModele = (cle) => {
    setModele(cle)
    const m = infos.modeles.find(x => x.cle === cle)
    if (m) { setSujet(m.sujet); setCorps(m.corps) }
    else { setSujet(''); setCorps('') }
  }

  // Contrôle du texte en direct (rien n'est envoyé).
  useEffect(() => {
    if (!premium || !sujet || !corps) { setProblemes([]); return }
    const t = setTimeout(() => {
      api.post('/client/campagnes/verifier', { modele, sujet, corps }).then(r => setProblemes(r.data.problemes)).catch(() => {})
    }, 500)
    return () => clearTimeout(t)
  }, [premium, modele, sujet, corps])

  const corpsEnvoi = () => ({ modele, ...(premium ? { sujet, corps } : {}) })

  const essai = async () => {
    setOccupe(true)
    try { const r = await api.post('/client/campagnes/test', corpsEnvoi()); toast.success(`Essai envoyé à ${r.data.envoye_a}`) }
    catch (e) { toast.error(erreurApi(e)) }
    setOccupe(false)
  }

  const lancer = async () => {
    setOccupe(true)
    try {
      const body = {
        nom, ...corpsEnvoi(), destinataires: dest.valides, attestation,
        ...(premium && quand ? { planifiee_at: new Date(quand).toISOString() } : {}),
        ...(premium && relance ? { relance_jours: Number(relance) } : {}),
      }
      const r = await api.post('/client/campagnes', body)
      const { a_envoyer, ignores } = r.data
      const ign = ignores.desinscrits + ignores.deja_contactes + ignores.doublons
      toast.success(`${a_envoyer} email${a_envoyer > 1 ? 's' : ''} à envoyer${ign ? ` (${ign} ignoré${ign > 1 ? 's' : ''})` : ''}`)
      fait()
    } catch (e) {
      const p = e.response?.data?.problemes
      if (p) setProblemes(p)
      toast.error(erreurApi(e))
    }
    setOccupe(false)
  }

  const trop = dest.valides.length > lim.destinataires
  const pret = nom.trim() && dest.valides.length > 0 && !trop && attestation && problemes.length === 0 && sujet && corps

  return (
    <div className="card space-y-5">
      <h2 className="section-title">Nouvelle campagne</h2>

      <div>
        <label className="text-sm font-medium" htmlFor="camp-nom">Nom (pour toi)</label>
        <input id="camp-nom" className="input mt-1 w-full" maxLength={80} placeholder="ex : Clients de mars" value={nom} onChange={e => setNom(e.target.value)} />
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="camp-modele">Modèle de message</label>
        <select id="camp-modele" className="input mt-1 w-full" value={modele} onChange={e => choisirModele(e.target.value)}>
          {infos.modeles.map(m => <option key={m.cle} value={m.cle}>{m.nom}</option>)}
          {premium && <option value="perso">Mon propre texte</option>}
        </select>
        {infos.modeles.find(x => x.cle === modele)?.remarque && (
          <p className="text-xs text-slate-500 mt-1">{infos.modeles.find(x => x.cle === modele).remarque}</p>
        )}
        {!premium && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Crown size={12} className="text-amber-500" /> Avec Premium, tu peux modifier le texte, planifier l'envoi et programmer une relance.</p>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-sm font-medium" htmlFor="camp-sujet">Objet</label>
          <input id="camp-sujet" className="input mt-1 w-full" maxLength={lim.sujet_max} value={sujet} onChange={e => setSujet(e.target.value)} readOnly={!premium} />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="camp-corps">Message</label>
          <textarea id="camp-corps" className="input mt-1 w-full" rows={7} maxLength={lim.corps_max} value={corps} onChange={e => setCorps(e.target.value)} readOnly={!premium} />
          <p className="text-xs text-slate-500 mt-1">
            {'{prenom}'} et {'{commerce}'} sont remplacés pour chaque personne. Le bouton « Donner mon avis » et le lien de désinscription sont ajoutés automatiquement.
          </p>
        </div>
        {problemes.length > 0 && (
          <ul className="text-sm text-red-600 dark:text-red-400 space-y-1" role="alert">
            {problemes.map(p => <li key={p} className="flex gap-2"><AlertTriangle size={15} className="shrink-0 mt-0.5" />{p}</li>)}
          </ul>
        )}
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="camp-adresses">Tes clients</label>
        <textarea id="camp-adresses" className="input mt-1 w-full font-mono text-xs" rows={6}
          placeholder={'marie@exemple.fr, Marie\njean@exemple.fr\n…'} value={adresses} onChange={e => setAdresses(e.target.value)} />
        <p className="text-xs mt-1 text-slate-500">
          Une personne par ligne : l'email, puis le prénom si tu l'as. {dest.valides.length} adresse{dest.valides.length > 1 ? 's' : ''} sur {lim.destinataires} maximum.
          {dest.doublons > 0 && ` ${dest.doublons} doublon${dest.doublons > 1 ? 's' : ''} retiré${dest.doublons > 1 ? 's' : ''}.`}
        </p>
        {trop && <p className="text-xs text-red-600 mt-1">Trop d'adresses pour ton offre : {lim.destinataires} au maximum par campagne.</p>}
        {dest.invalides.length > 0 && (
          <p className="text-xs text-red-600 mt-1">Lignes ignorées (email invalide) : {dest.invalides.slice(0, 3).join(' · ')}{dest.invalides.length > 3 ? ` … +${dest.invalides.length - 3}` : ''}</p>
        )}
        <p className="text-xs text-slate-500 mt-1">Les adresses sont effacées de SwimUp dès que la campagne est terminée.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium flex items-center gap-1" htmlFor="camp-quand">Envoyer plus tard {!premium && <Crown size={12} className="text-amber-500" />}</label>
          <input id="camp-quand" type="datetime-local" className="input mt-1 w-full" value={quand} onChange={e => setQuand(e.target.value)} disabled={!premium} />
          <p className="text-xs text-slate-500 mt-1">{premium ? 'Vide : l\'envoi démarre tout de suite.' : 'Réservé à Premium.'}</p>
        </div>
        <div>
          <label className="text-sm font-medium flex items-center gap-1" htmlFor="camp-relance">Relance unique {!premium && <Crown size={12} className="text-amber-500" />}</label>
          <select id="camp-relance" className="input mt-1 w-full" value={relance} onChange={e => setRelance(e.target.value)} disabled={!infos.relance_disponible}>
            <option value="">Aucune relance</option>
            {[3, 5, 7, 10, 14].filter(n => n >= lim.relance_min && n <= lim.relance_max).map(n => <option key={n} value={n}>Après {n} jours</option>)}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            {!premium ? 'Réservé à Premium.' : !infos.relance_disponible ? 'Pas disponible pour le moment.' : 'Un seul rappel, seulement à ceux qui n\'ont pas cliqué.'}
          </p>
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <input type="checkbox" className="mt-1" checked={attestation} onChange={e => setAttestation(e.target.checked)} />
        <span>Ces personnes sont bien mes clients et m'ont donné leur adresse email. Je n'offre rien en échange d'un avis.</span>
      </label>

      <p className="text-xs text-slate-500">
        Envoi étalé : au plus {infos.quota_email.limite} emails par jour sur ton offre ({infos.quota_email.restant} restant{infos.quota_email.restant > 1 ? 's' : ''} aujourd'hui). Le reste part les jours suivants.
      </p>

      <div className="flex flex-wrap gap-2 justify-end">
        <button className="btn-ghost" onClick={annuler} disabled={occupe}>Annuler</button>
        <button className="btn-secondary" onClick={essai} disabled={occupe || !sujet || !corps || problemes.length > 0}>M'envoyer un essai</button>
        <button className="btn-primary" onClick={lancer} disabled={occupe || !pret}>
          <Send size={15} /> {premium && quand ? 'Planifier' : 'Lancer la campagne'}
        </button>
      </div>
    </div>
  )
}

function CarteCampagne({ c, suivi, rafraichir }) {
  const [ouvert, setOuvert] = useState(false)
  const [d, setD] = useState(null)
  const [occupe, setOccupe] = useState(false)
  const [libelle, couleur] = STATUTS[c.statut] || STATUTS.terminee
  const s = c.stats
  const actif = ['planifiee', 'en_cours'].includes(c.statut)

  useEffect(() => {
    if (!ouvert) return
    api.get(`/client/campagnes/${c.id}`).then(r => setD(r.data)).catch(() => toast.error('Détail indisponible'))
  }, [ouvert, c.id, c.stats.envoyes, c.statut])

  const agir = async (action) => {
    setOccupe(true)
    try {
      if (action === 'arreter') { await api.post(`/client/campagnes/${c.id}/arreter`); toast.success('Campagne arrêtée') }
      else { await api.delete(`/client/campagnes/${c.id}`); toast.success('Campagne supprimée') }
      rafraichir()
    } catch (e) { toast.error(erreurApi(e)) }
    setOccupe(false)
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{c.nom}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {c.statut === 'planifiee' ? `Part le ${dateFr(c.planifiee_at)}` : c.finished_at ? `Terminée le ${dateFr(c.finished_at)}` : `Démarrée le ${dateFr(c.started_at)}`}
            {c.relance_jours ? ` · relance à ${c.relance_jours} jours` : ''}
          </p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${couleur}`}>{libelle}</span>
      </div>

      <div className={`grid gap-2 ${suivi ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <Compteur libelle="envoyés" valeur={`${s.envoyes}/${s.total}`} />
        {suivi && <Compteur libelle="livrés" valeur={s.livres} aide="Emails arrivés dans la boîte du destinataire" />}
        {suivi && <Compteur libelle="clics" valeur={s.clics} aide="Personnes ayant cliqué sur « Donner mon avis ». Ce n'est pas un avis publié." />}
        <Compteur libelle="désinscrits" valeur={s.desinscrits} />
        {!suivi && <Compteur libelle="en attente" valeur={s.en_attente} />}
      </div>
      {(s.rebonds > 0 || s.plaintes > 0 || s.deja_contactes > 0 || s.echecs > 0) && (
        <p className="text-xs text-slate-500">
          {[s.deja_contactes && `${s.deja_contactes} déjà contacté${s.deja_contactes > 1 ? 's' : ''} il y a moins de 30 jours`,
            s.rebonds && `${s.rebonds} adresse${s.rebonds > 1 ? 's' : ''} invalide${s.rebonds > 1 ? 's' : ''}`,
            s.plaintes && `${s.plaintes} signalement${s.plaintes > 1 ? 's' : ''}`,
            s.echecs && `${s.echecs} envoi${s.echecs > 1 ? 's' : ''} en échec`].filter(Boolean).join(' · ')}
        </p>
      )}
      {c.statut === 'en_cours' && s.en_attente > 0 && (
        <p className="text-xs text-amber-700 dark:text-amber-300">{s.en_attente} email{s.en_attente > 1 ? 's' : ''} encore à envoyer. Les envois reprennent quand le quota du jour le permet.</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-ghost text-xs px-2 py-1" onClick={() => setOuvert(o => !o)} aria-expanded={ouvert}>
          {ouvert ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Détail
        </button>
        <div className="flex-1" />
        {actif && <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => agir('arreter')} disabled={occupe}><Square size={13} /> Arrêter</button>}
        {!actif && <button className="btn-danger text-xs px-3 py-1.5" onClick={() => window.confirm('Supprimer cette campagne et ses statistiques ?') && agir('supprimer')} disabled={occupe}><Trash2 size={13} /> Supprimer</button>}
      </div>

      {ouvert && d && (
        <div className="space-y-3 border-t border-slate-100 dark:border-slate-700 pt-3">
          <div className="text-sm">
            <p className="font-medium">{d.sujet}</p>
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line mt-1">{d.corps}</p>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-64 overflow-y-auto text-sm">
            {d.destinataires.map((x, i) => (
              <li key={i} className="py-1.5 flex items-center justify-between gap-2">
                <span className="truncate">{x.email || 'Adresse effacée'}{x.prenom ? ` · ${x.prenom}` : ''}</span>
                <span className="text-xs text-slate-500 shrink-0 flex items-center gap-1">
                  {x.clique && <Check size={12} className="text-emerald-500" />}
                  {x.clique ? 'A cliqué' : x.livre ? 'Livré' : STATUT_DEST[x.statut] || x.statut}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">Les adresses sont masquées, puis effacées de SwimUp à la fin de la campagne.</p>
        </div>
      )}
    </div>
  )
}
