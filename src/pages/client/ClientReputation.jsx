import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Star, Crown, RefreshCw, Check, Copy, FileDown, Search, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import MiniLineChart from '../../components/MiniLineChart'

const ONGLETS = [['avis', 'Avis Google'], ['evolution', 'Évolution'], ['visibilite', 'Visibilité'], ['analyse', 'Analyse'], ['pistes', 'À améliorer'], ['rapport', 'Rapport']]

const dateFr = (s) => s ? new Date(s.includes('T') || s.includes('Z') ? s : String(s).replace(' ', 'T') + 'Z').toLocaleDateString('fr-FR') : '—'
const note1 = (n) => (n === null || n === undefined ? '—' : Number(n).toFixed(1).replace('.', ','))
const erreurApi = (e, defaut = 'Une erreur est survenue, réessaie.') => e.response?.data?.error || defaut

function Etoiles({ n }) {
  if (!n) return <span className="text-xs text-slate-400">sans note</span>
  return (
    <span className="inline-flex" aria-label={`${n} sur 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className={i <= n ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
      ))}
    </span>
  )
}

function Segments({ options, valeur, onChoisir }) {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-full p-0.5 text-xs w-fit max-w-full">
      {options.map(([val, label, verrou]) => (
        <button key={val} onClick={() => onChoisir(val)}
          className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 ${valeur === val ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
          {label}{verrou && <Crown size={11} className="text-amber-500" />}
        </button>
      ))}
    </div>
  )
}

export default function ClientReputation() {
  const [onglet, setOnglet] = useState('avis')
  const [apercu, setApercu] = useState(null)
  const [erreur, setErreur] = useState(false)

  const chargerApercu = useCallback(() => {
    api.get('/client/reputation').then(r => setApercu(r.data)).catch(() => setErreur(true))
  }, [])
  useEffect(() => { chargerApercu() }, [chargerApercu])

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Réputation</h1>
        <p className="text-muted mt-1">Tes avis Google, l'évolution de ta note et ce qu'il y a à améliorer.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1" role="tablist">
        {ONGLETS.map(([v, l]) => (
          <button key={v} role="tab" aria-selected={onglet === v} onClick={() => setOnglet(v)}
            className={`px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${onglet === v ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            style={onglet === v ? { backgroundColor: 'var(--accent)' } : undefined}>
            {l}
          </button>
        ))}
      </div>

      {erreur && <div className="card text-center text-sm text-red-500 py-8">Impossible de charger cette page. Recharge-la dans un instant.</div>}
      {apercu && onglet === 'avis' && <AvisGoogle apercu={apercu} rafraichir={chargerApercu} />}
      {apercu && onglet === 'evolution' && <Evolution apercu={apercu} />}
      {apercu && onglet === 'visibilite' && <Visibilite />}
      {apercu && onglet === 'analyse' && <Analyse apercu={apercu} rafraichir={chargerApercu} />}
      {apercu && onglet === 'pistes' && <Pistes />}
      {apercu && onglet === 'rapport' && <Rapport apercu={apercu} />}
    </div>
  )
}

// ---------- Avis Google ----------

function Etablissement({ apres }) {
  const [saisie, setSaisie] = useState('')
  const [nom, setNom] = useState('')
  const [ville, setVille] = useState('')
  const [lieux, setLieux] = useState(null)
  const [occupe, setOccupe] = useState(false)

  const choisir = async (valeur) => {
    setOccupe(true)
    try { await api.put('/client/reputation/etablissement', { place_id: valeur }); toast.success('Établissement enregistré'); apres() }
    catch (e) { toast.error(erreurApi(e)) }
    setOccupe(false)
  }
  const chercher = async () => {
    setOccupe(true)
    try { const r = await api.post('/client/reputation/etablissement/chercher', { nom, ville }); setLieux(r.data.lieux) }
    catch (e) { toast.error(erreurApi(e)) }
    setOccupe(false)
  }

  return (
    <div className="card space-y-4">
      <div>
        <h2 className="section-title">Indique ton établissement</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pour récupérer tes avis, SwimUp a besoin de retrouver ta fiche Google.</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Cherche-le par son nom</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="input flex-1" placeholder="Nom du commerce" value={nom} onChange={e => setNom(e.target.value)} maxLength={100} />
          <input className="input sm:w-40" placeholder="Ville" value={ville} onChange={e => setVille(e.target.value)} maxLength={60} />
          <button className="btn-primary" onClick={chercher} disabled={occupe || nom.trim().length < 2}><Search size={15} /> Chercher</button>
        </div>
        {lieux && (lieux.length === 0
          ? <p className="text-sm text-slate-500">Aucun résultat, essaie avec la ville ou colle ton lien ci-dessous.</p>
          : <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {lieux.map(l => (
                <li key={l.place_id} className="py-2 flex items-center justify-between gap-3">
                  <span className="text-sm min-w-0"><span className="font-medium">{l.nom}</span><br /><span className="text-xs text-muted">{l.adresse}</span></span>
                  <button className="btn-secondary px-3 py-1.5 text-xs shrink-0" onClick={() => choisir(l.place_id)} disabled={occupe}>C'est lui</button>
                </li>
              ))}
            </ul>)}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Ou colle ton lien « Demander des avis »</p>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Lien contenant placeid=… ou identifiant" value={saisie} onChange={e => setSaisie(e.target.value)} />
          <button className="btn-secondary" onClick={() => choisir(saisie)} disabled={occupe || !saisie.trim()}>Valider</button>
        </div>
      </div>
    </div>
  )
}

function AvisGoogle({ apercu, rafraichir }) {
  const [filtres, setFiltres] = useState({ q: '', note: '', traite: '', tri: 'recent' })
  const [d, setD] = useState(null)
  const [occupe, setOccupe] = useState(false)

  const charger = useCallback(() => {
    const p = new URLSearchParams()
    Object.entries(filtres).forEach(([k, v]) => v && p.set(k, v))
    api.get(`/client/reputation/avis?${p}`).then(r => setD(r.data)).catch(() => setD({ etat: 'indisponible', message: 'Chargement impossible.', avis: [] }))
  }, [filtres])
  useEffect(() => { const t = setTimeout(charger, filtres.q ? 300 : 0); return () => clearTimeout(t) }, [charger, filtres.q])

  const maj = (k, v) => setFiltres(f => ({ ...f, [k]: v }))
  const actualiser = async () => {
    setOccupe(true)
    try { await api.post('/client/reputation/avis/actualiser'); toast.success('Avis mis à jour'); charger(); rafraichir() }
    catch (e) { toast.error(erreurApi(e)) }
    setOccupe(false)
  }
  const basculer = async (a) => {
    try { await api.put(`/client/reputation/avis/${a.hash}/traite`, { traite: !a.traite }); charger() }
    catch (e) { toast.error(erreurApi(e)) }
  }
  const copier = async (texte) => {
    try { await navigator.clipboard.writeText(texte); toast.success('Avis copié') } catch { toast.error('Copie impossible') }
  }

  if (!d) return null
  if (d.etat === 'sans_etablissement') return <Etablissement apres={() => { charger(); rafraichir() }} />

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-900 dark:text-sky-200 text-[13px] p-3 leading-relaxed">{d.limite}</div>

      {d.etat === 'indisponible' ? (
        <div className="card space-y-3 text-sm">
          <p>{d.message}</p>
          <p className="text-slate-500 dark:text-slate-400">Dans l'onglet Analyse, tu peux coller tes avis à la main pour les analyser quand même.</p>
        </div>
      ) : (
        <>
          <div className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold">{note1(d.note_google)} <span className="text-sm font-normal text-muted">/ 5 sur Google</span></p>
              <p className="text-xs text-muted">{d.total_google ?? '—'} avis au total · {d.nb_recus} affichés · mis à jour le {dateFr(d.recupere_at)}</p>
            </div>
            <button className="btn-secondary text-xs px-4 py-2" onClick={actualiser} disabled={occupe}>
              <RefreshCw size={14} className={occupe ? 'animate-spin' : ''} /> Actualiser
              {apercu.quotas?.actualiser_avis && <span className="text-muted">({apercu.quotas.actualiser_avis.restant} restant{apercu.quotas.actualiser_avis.restant > 1 ? 's' : ''} aujourd'hui)</span>}
            </button>
          </div>

          {d.a_traiter > 0 && (
            <p className="text-sm rounded-xl p-3 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              {d.a_traiter} avis de 3 étoiles ou moins {d.a_traiter > 1 ? 'ne sont pas marqués' : "n'est pas marqué"} comme traité{d.a_traiter > 1 ? 's' : ''}.
            </p>
          )}

          <div className="space-y-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9" placeholder="Rechercher dans les avis" value={filtres.q} onChange={e => maj('q', e.target.value)} maxLength={80} />
            </div>
            <div className="flex flex-wrap gap-2">
              <select className="input !w-auto !py-1.5 text-xs" value={filtres.note} onChange={e => maj('note', e.target.value)} aria-label="Filtrer par note">
                <option value="">Toutes les notes</option><option value="positif">4 et 5 étoiles</option><option value="negatif">3 étoiles ou moins</option>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} étoile{n > 1 ? 's' : ''}</option>)}
              </select>
              <select className="input !w-auto !py-1.5 text-xs" value={filtres.traite} onChange={e => maj('traite', e.target.value)} aria-label="Filtrer par statut">
                <option value="">Traités ou non</option><option value="non">À traiter</option><option value="oui">Traités</option>
              </select>
              <select className="input !w-auto !py-1.5 text-xs" value={filtres.tri} onChange={e => maj('tri', e.target.value)} aria-label="Trier">
                <option value="recent">Plus récents</option><option value="ancien">Plus anciens</option><option value="note_basse">Note croissante</option><option value="note_haute">Note décroissante</option>
              </select>
            </div>
          </div>

          <ul className="space-y-3">
            {d.avis.map(a => (
              <li key={a.hash} className="card space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0"><span className="font-medium text-sm">{a.auteur}</span> <span className="text-xs text-muted">· {dateFr(a.date)}</span></div>
                  <Etoiles n={a.note} />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line break-words">{a.texte || <em className="text-muted">Avis sans texte</em>}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button onClick={() => basculer(a)} className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 border ${a.traite ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-600 text-slate-500'}`}>
                    <Check size={13} /> {a.traite ? 'Traité' : 'Marquer comme traité'}
                  </button>
                  {a.texte && <button onClick={() => copier(a.texte)} className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1 border border-slate-200 dark:border-slate-600 text-slate-500"><Copy size={13} /> Copier</button>}
                  {a.note && a.note <= 3 && <Link to="/client/outils" className="text-xs px-3 py-1.5 rounded-full text-sky-600 border border-sky-200 dark:border-sky-800">Préparer une réponse</Link>}
                </div>
              </li>
            ))}
            {d.avis.length === 0 && <li className="card text-center text-sm text-muted py-8">Aucun avis ne correspond à ces filtres.</li>}
          </ul>
        </>
      )}
    </div>
  )
}

// ---------- Évolution ----------

function Evolution({ apercu }) {
  const [jours, setJours] = useState(30)
  const [d, setD] = useState(null)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    setD(null); setErreur(null)
    api.get(`/client/reputation/evolution?jours=${jours}`).then(r => setD(r.data)).catch(e => setErreur(erreurApi(e)))
  }, [jours])

  const choisir = (v) => {
    if (v === 365 && !apercu.premium) return toast('L\'historique sur 12 mois est réservé à Premium.')
    setJours(v)
  }
  const delta = d?.delta_note
  const couleur = delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-500' : 'text-slate-500'

  return (
    <div className="space-y-4">
      <Segments valeur={jours} onChoisir={choisir}
        options={[[7, '7 jours'], [30, '30 jours'], [90, '90 jours'], [365, '12 mois', !apercu.premium]]} />
      {erreur && <div className="card text-sm text-red-500 text-center py-6">{erreur}</div>}
      {d && (
        <>
          {!d.suffisant && <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 text-sm p-3 text-slate-600 dark:text-slate-300">{d.message}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div className="card"><p className="text-xs text-muted">Note Google</p>
              <p className="text-2xl font-bold">{note1(d.note_fin)}</p>
              {d.suffisant && <p className={`text-xs mt-1 ${couleur}`}>{delta > 0 ? '+' : ''}{String(delta).replace('.', ',')} sur la période</p>}</div>
            <div className="card"><p className="text-xs text-muted">Nouveaux avis Google</p>
              <p className="text-2xl font-bold">{d.suffisant ? d.nouveaux_avis : '—'}</p>
              {d.nb_avis_fin != null && <p className="text-xs text-muted mt-1">{d.nb_avis_fin} au total</p>}</div>
            <div className="card"><p className="text-xs text-muted">Passages sur ton lien</p>
              <p className="text-2xl font-bold">{d.suivi.qr + d.suivi.lien + d.suivi.email}</p>
              <p className="text-xs text-muted mt-1">QR {d.suivi.qr} · lien {d.suivi.lien} · email {d.suivi.email}</p></div>
            <div className="card"><p className="text-xs text-muted">Demandes envoyées</p>
              <p className="text-2xl font-bold">{d.suivi.emails_envoyes}</p>
              <p className="text-xs text-muted mt-1">par email</p></div>
          </div>
          {d.points.length > 1 && (
            <div className="card space-y-2">
              <h2 className="section-title">Note Google</h2>
              <MiniLineChart points={d.points.map(p => ({ label: dateFr(p.date), value: p.note }))} formatValue={note1} />
            </div>
          )}
          <p className="text-xs text-muted">Un passage sur ton lien n'est pas un avis publié. {d.avis_swimup_publies > 0 && `Avis commandés publiés sur la période : ${d.avis_swimup_publies}.`} La note vient de relevés de ta fiche Google : s'il y en a peu, la courbe l'est aussi.</p>
        </>
      )}
    </div>
  )
}

// ---------- Analyse ----------

function Analyse({ apercu, rafraichir }) {
  const [source, setSource] = useState('google')
  const [texte, setTexte] = useState('')
  const [resultat, setResultat] = useState(null)
  const [occupe, setOccupe] = useState(false)

  useEffect(() => { api.get('/client/reputation/analyse').then(r => setResultat(r.data)).catch(() => {}) }, [])
  const q = apercu.quotas?.analyse_ia

  const lancer = async () => {
    setOccupe(true)
    try {
      const r = await api.post('/client/reputation/analyse', { source, avis: source === 'colle' ? texte : undefined })
      setResultat(r.data); rafraichir()
    } catch (e) { toast.error(erreurApi(e)) }
    setOccupe(false)
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <Segments valeur={source} onChoisir={setSource} options={[['google', 'Mes avis Google'], ['colle', 'Coller des avis']]} />
        {source === 'colle' ? (
          <>
            <textarea className="input" rows={7} value={texte} onChange={e => setTexte(e.target.value)} maxLength={40000}
              placeholder={'Colle tes avis, un par bloc, séparés par une ligne vide.\nTu peux commencer chaque avis par sa note : « 4/5 Très bon accueil ».'} />
            <p className="text-xs text-muted">40 avis au maximum. Les textes ne sont pas conservés, seul le résultat de l'analyse l'est.</p>
          </>
        ) : <p className="text-sm text-slate-500 dark:text-slate-400">Analyse les avis récupérés dans l'onglet « Avis Google » (5 au maximum, c'est la limite de Google).</p>}
        <button className="btn-primary w-full" onClick={lancer} disabled={occupe || (source === 'colle' && texte.trim().length < 3) || q?.restant === 0}>
          {occupe ? 'Analyse…' : 'Analyser'} {q && <span className="opacity-80 font-normal">({q.restant} restante{q.restant > 1 ? 's' : ''} aujourd'hui)</span>}
        </button>
      </div>

      {resultat && (
        <div className="space-y-3">
          <p className="text-xs text-muted">Dernière analyse : {resultat.nb_avis} avis · {dateFr(resultat.created_at)}</p>
          {resultat.avertissement && <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm p-3">{resultat.avertissement}</div>}
          {resultat.resume && <div className="card"><h2 className="section-title mb-1">En résumé</h2><p className="text-sm leading-relaxed">{resultat.resume}</p></div>}
          <div className="card space-y-2">
            <h2 className="section-title">Les sujets qui reviennent</h2>
            {resultat.themes.length === 0 ? <p className="text-sm text-muted">Aucun sujet précis repéré dans ces avis.</p> : (
              <ul className="space-y-2">
                {resultat.themes.map(t => (
                  <li key={t.cle} className="text-sm">
                    <div className="flex justify-between gap-2"><span>{t.libelle}</span>
                      <span className="text-muted shrink-0">{t.mentions} avis{t.note_moyenne !== null ? ` · ${note1(t.note_moyenne)} / 5` : ''}</span></div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 mt-1">
                      <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (t.mentions / resultat.nb_avis) * 100)}%`, backgroundColor: t.note_moyenne !== null && t.note_moyenne <= 3.2 ? '#ef4444' : 'var(--accent)' }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {resultat.points_faibles.length > 0 && <p className="text-sm">À surveiller : {resultat.points_faibles.map(t => t.libelle).join(', ')}. Les pistes sont dans l'onglet « À améliorer ».</p>}
        </div>
      )}
    </div>
  )
}

// ---------- À améliorer ----------

const STATUTS = [['a_faire', 'À faire'], ['en_cours', 'En cours'], ['termine', 'Terminé']]

function Pistes() {
  const [liste, setListe] = useState(null)
  const charger = useCallback(() => { api.get('/client/reputation/recommandations').then(r => setListe(r.data)) }, [])
  useEffect(() => { charger() }, [charger])

  const changer = async (cle, statut) => {
    try { await api.put(`/client/reputation/recommandations/${cle}`, { statut }); charger() }
    catch (e) { toast.error(erreurApi(e)) }
  }
  if (!liste) return null
  if (!liste.length) return <div className="card text-center py-10 text-sm text-slate-500">Rien à signaler pour l'instant. Les pistes apparaissent quand tes chiffres ou tes avis le justifient.</div>

  return (
    <ul className="space-y-3">
      {liste.map(p => (
        <li key={p.cle} className={`card space-y-2 ${p.statut === 'termine' ? 'opacity-70' : ''}`}>
          <h2 className="font-semibold text-slate-900 dark:text-white">{p.titre}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{p.explication}</p>
          <p className="text-sm"><span className="font-medium">Pourquoi : </span>{p.raison}</p>
          <p className="text-sm"><span className="font-medium">À faire : </span>{p.action}</p>
          <p className="text-xs text-muted">{p.indicateur.label} : <span className="font-medium text-slate-700 dark:text-slate-200">{p.indicateur.valeur}</span></p>
          <Segments valeur={p.statut} onChoisir={(s) => changer(p.cle, s)} options={STATUTS} />
        </li>
      ))}
    </ul>
  )
}

// ---------- Rapport mensuel ----------

function derniersMois(n = 12) {
  const liste = []
  const d = new Date()
  for (let i = 0; i < n; i++) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1))
    liste.push({ valeur: `${m.getUTCFullYear()}-${String(m.getUTCMonth() + 1).padStart(2, '0')}`,
      label: m.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }) })
  }
  return liste
}

function Rapport({ apercu }) {
  const mois = derniersMois()
  const [choix, setChoix] = useState(mois[0].valeur)
  const [occupe, setOccupe] = useState(false)

  if (!apercu.premium) {
    return (
      <div className="card text-center space-y-3 py-8">
        <Crown size={28} className="text-amber-500 mx-auto" />
        <p className="font-semibold">Le rapport mensuel est réservé à Premium</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Un PDF avec ta note, tes nouveaux avis, tes passages sur le lien, les sujets qui reviennent et tes pistes en cours.</p>
        <Link to="/client/premium" className="btn-primary inline-flex">Voir Premium</Link>
      </div>
    )
  }
  const telecharger = async () => {
    setOccupe(true)
    try {
      const r = await api.get(`/client/reputation/rapport?mois=${choix}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `rapport-reputation-${choix}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch { toast.error('Impossible de générer le rapport pour l\'instant, réessaie plus tard.') }
    setOccupe(false)
  }
  return (
    <div className="card space-y-3">
      <h2 className="section-title">Rapport mensuel</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">Il reprend ta note, tes nouveaux avis, tes passages sur le lien, la dernière analyse et tes pistes. Il porte le nom de ton commerce et ta couleur.</p>
      <select className="input" value={choix} onChange={e => setChoix(e.target.value)} aria-label="Mois du rapport">
        {mois.map(m => <option key={m.valeur} value={m.valeur}>{m.label}</option>)}
      </select>
      <button className="btn-primary w-full" onClick={telecharger} disabled={occupe}><FileDown size={16} /> {occupe ? 'Génération…' : 'Télécharger le PDF'}</button>
    </div>
  )
}


// ---------- Visibilité locale ----------

const rang = (p) => (p ? `${p}${p === 1 ? 'ᵉʳ' : 'ᵉ'}` : 'hors top 20')

function Visibilite() {
  const [d, setD] = useState(null)
  const [motCle, setMotCle] = useState('')
  const [zone, setZone] = useState('')
  const [occupe, setOccupe] = useState(null)
  const [ouvert, setOuvert] = useState(null)
  const [histo, setHisto] = useState(null)

  const charger = useCallback(() => { api.get('/client/visibilite').then(r => setD(r.data)).catch(() => setD(false)) }, [])
  useEffect(() => { charger() }, [charger])

  const ajouter = async () => {
    setOccupe('ajout')
    try { await api.post('/client/visibilite/mots-cles', { mot_cle: motCle, zone }); setMotCle(''); charger() }
    catch (e) { toast.error(erreurApi(e)) }
    setOccupe(null)
  }
  const verifier = async (m) => {
    setOccupe(m.id)
    try { await api.post(`/client/visibilite/mots-cles/${m.id}/verifier`); toast.success('Position relevée'); charger(); if (ouvert === m.id) voir(m.id, true) }
    catch (e) { toast.error(erreurApi(e)) }
    setOccupe(null)
  }
  const supprimer = async (m) => {
    if (!confirm(`Ne plus suivre « ${m.mot_cle} » à ${m.zone} ? L'historique sera supprimé.`)) return
    try { await api.delete(`/client/visibilite/mots-cles/${m.id}`); setOuvert(null); charger() }
    catch (e) { toast.error(erreurApi(e)) }
  }
  const voir = async (id, force = false) => {
    if (ouvert === id && !force) { setOuvert(null); return }
    setOuvert(id); setHisto(null)
    try { const r = await api.get(`/client/visibilite/mots-cles/${id}/historique`); setHisto(r.data) } catch { setHisto(false) }
  }

  if (d === null) return null
  if (d === false) return <div className="card text-center text-sm text-red-500 py-8">Chargement impossible, recharge la page.</div>

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-900 dark:text-sky-200 text-[13px] p-3 leading-relaxed">{d.note}</div>

      {!d.etablissement_configure && (
        <div className="card text-sm">Pour relever ta position, indique d'abord ton établissement dans l'onglet « Avis Google ».</div>
      )}

      <div className="card space-y-3">
        <h2 className="section-title">Suivre un mot-clé</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="input flex-1" placeholder="Ex : coiffeur" value={motCle} onChange={e => setMotCle(e.target.value)} maxLength={60} />
          <input className="input sm:w-44" placeholder="Ex : Ajaccio" value={zone} onChange={e => setZone(e.target.value)} maxLength={60} />
          <button className="btn-primary" onClick={ajouter} disabled={occupe === 'ajout' || motCle.trim().length < 2 || zone.trim().length < 2 || d.mots_cles.length >= d.max_mots_cles}>Ajouter</button>
        </div>
        <p className="text-xs text-muted">
          {d.mots_cles.length} / {d.max_mots_cles} mots-clés · {d.quota.restant} relevé{d.quota.restant > 1 ? 's' : ''} possible{d.quota.restant > 1 ? 's' : ''} aujourd'hui
          {d.releve_auto ? ' · relevé automatique chaque lundi' : ' · relevé automatique avec Premium'}
        </p>
      </div>

      <ul className="space-y-3">
        {d.mots_cles.map(m => {
          const t = m.tendance
          return (
            <li key={m.id} className="card space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">« {m.mot_cle} » à {m.zone}</p>
                  <p className="text-xs text-muted">{m.dernier ? `Relevé le ${dateFr(m.dernier.date)}` : 'Pas encore de relevé'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold">{m.dernier ? rang(m.dernier.position) : '—'}</p>
                  {t.statut === 'chute' && <p className="text-xs text-red-500 flex items-center gap-1 justify-end"><TrendingDown size={12} /> en baisse{t.precedente ? ` (était ${rang(t.precedente)})` : ''}</p>}
                  {t.statut === 'progres' && <p className="text-xs text-emerald-600 flex items-center gap-1 justify-end"><TrendingUp size={12} /> en hausse{t.precedente ? ` (était ${rang(t.precedente)})` : ''}</p>}
                  {t.statut === 'stable' && <p className="text-xs text-muted">stable</p>}
                </div>
              </div>
              {m.dernier?.concurrents?.length > 0 && <p className="text-xs text-muted">En tête sur cette recherche : {m.dernier.concurrents.join(', ')}</p>}
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => verifier(m)} disabled={occupe === m.id || !d.etablissement_configure}>
                  <RefreshCw size={13} className={occupe === m.id ? 'animate-spin' : ''} /> Relever maintenant
                </button>
                <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => voir(m.id)}>{ouvert === m.id ? 'Masquer l\'historique' : 'Historique'}</button>
                <button className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-red-500" onClick={() => supprimer(m)} aria-label="Supprimer"><Trash2 size={13} /></button>
              </div>
              {ouvert === m.id && histo && (histo.releves.length > 1
                ? <div className="pt-2"><MiniLineChart points={histo.releves.map(r => ({ label: dateFr(r.date), value: 21 - (r.position ?? 21) }))} formatValue={v => (v === 0 ? 'hors top 20' : `${21 - v}ᵉ`)} />
                    <p className="text-xs text-muted">Plus la courbe est haute, mieux ta fiche est placée.</p></div>
                : <p className="text-xs text-muted pt-1">Il faut au moins deux relevés pour tracer une courbe.</p>)}
            </li>
          )
        })}
        {d.mots_cles.length === 0 && <li className="card text-center text-sm text-muted py-8">Aucun mot-clé suivi. Ajoute par exemple ton métier et ta ville.</li>}
      </ul>
    </div>
  )
}
