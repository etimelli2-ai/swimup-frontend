import { useState, useEffect } from 'react'
import api from '../../lib/api'
import {
  Search, Plus, Trash2, X, Flame, Clock, CheckCircle2, XCircle,
  Loader2, AlertTriangle, ExternalLink, Link2, Pencil, Save,
  RotateCcw, ShieldQuestion, ListFilter, CalendarClock, User,
  FileText, BadgeCheck, ArrowDownUp,
} from 'lucide-react'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

const STATUT_FILTRES = [
  { v: 'tous',            l: 'Tous' },
  { v: 'a_verifier',      l: 'À vérifier' },
  { v: 'disponible',      l: 'Disponible' },
  { v: 'reserve',         l: 'Réservé' },
  { v: 'en_verification', l: 'En vérif.' },
  { v: 'valide',          l: 'Validé' },
  { v: 'refuse',          l: 'Refusé' },
  { v: 'paye',            l: 'Payé' },
]

const CHECKPOINT_JOURS = 4

// Convertit une date SQLite ("YYYY-MM-DD HH:MM:SS") en Date UTC fiable.
function parseSqlDate(d) {
  if (!d) return null
  const s = String(d)
  const iso = s.includes('T') ? s : s.replace(' ', 'T') + (s.endsWith('Z') ? '' : 'Z')
  const date = new Date(iso)
  return isNaN(date.getTime()) ? null : date
}

// Calcule où en est un avis dans le cycle de vérification manuelle :
// soumission -> checkpoints tous les 4 jours -> checkpoint final au délai
// choisi par l'acheteur, qui déclenche (ou non) le crédit du solde.
function checkpointInfo(a) {
  const soumisAt = parseSqlDate(a.soumis_at)
  if (!soumisAt || !['en_verification', 'valide'].includes(a.statut)) return null

  const delai = parseInt(a.delai_paiement) || 30
  const joursEcoules = Math.floor((Date.now() - soumisAt.getTime()) / 86400000)
  const joursRestants = Math.max(0, delai - joursEcoules)
  const estFinal = joursEcoules >= delai
  const nbChecks = a.nb_checks || 0

  const lastCheck = parseSqlDate(a.last_check)
  const joursDepuisDernierCheck = lastCheck
    ? Math.floor((Date.now() - lastCheck.getTime()) / 86400000)
    : joursEcoules

  const aVerifierMaintenant = estFinal || !lastCheck || joursDepuisDernierCheck >= CHECKPOINT_JOURS

  return { joursEcoules, joursRestants, estFinal, nbChecks, aVerifierMaintenant, delai }
}

function cleanText(text) {
  if (!text) return ''
  return String(text)
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
}

export default function AdminAvis() {
  const [avis, setAvis]               = useState([])
  const [clients, setClients]         = useState([])
  const [form, setForm]               = useState({ client_id: '', lien_maps: '', texte: '', delai_paiement: '30', nom_etablissement: '', nb_etoiles: '5' })
  const [show, setShow]               = useState(false)
  const [msg, setMsg]                 = useState(null)
  const [detail, setDetail]           = useState(null)
  const [newLien, setNewLien]         = useState('')
  const [editForm, setEditForm]       = useState(null)
  const [loadingAction, setLA]        = useState(null)
  const [filtre, setFiltre]           = useState('tous')
  const [tri, setTri]                 = useState('recent')
  const [search, setSearch]           = useState('')
  const [verifResult, setVerifResult] = useState(null)
  const [prixPrioritaire, setPrixPrio] = useState('2')

  const load = async () => {
    const [a, c] = await Promise.all([api.get('/admin/avis'), api.get('/admin/clients')])
    setAvis(a.data)
    setClients(c.data)
  }

  useEffect(() => { load() }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const ajouter = async () => {
    setLA('ajouter')
    try {
      await api.post('/admin/avis', { ...form, prix: 1 })
      showMsg('success', 'Avis ajouté.')
      setForm({ client_id: '', lien_maps: '', texte: '', delai_paiement: '30' })
      setShow(false)
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur')
    }
    setLA(null)
  }

  const supprimer = async (id) => {
    if (!confirm('Supprimer cet avis ?')) return
    setLA(`sup_${id}`)
    try {
      await api.delete(`/admin/avis/${id}`)
      load()
      showMsg('success', 'Avis supprimé.')
    } catch { showMsg('error', 'Erreur') }
    setLA(null)
  }

  const valider = async (avisId) => {
    if (!confirm('Confirmer ce checkpoint de vérification ?')) return
    setLA('valider')
    try {
      const r = await api.put(`/admin/avis/${avisId}/valider`)
      showMsg('success', r.data?.paye ? 'Avis validé, solde crédité.' : 'Checkpoint validé.')
      setDetail(null)
      load()
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLA(null)
  }

  const refuser = async (avisId) => {
    if (!confirm('Refuser cet avis ?')) return
    setLA('refuser')
    try {
      await api.put(`/admin/avis/${avisId}/refuser`)
      showMsg('success', 'Avis refusé.')
      setDetail(null)
      load()
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLA(null)
  }

  const remettreEnDispo = async (avisId) => {
    if (!confirm('Remettre cet avis en disponible ?')) return
    setLA('dispo')
    try {
      await api.put(`/admin/avis/${avisId}/remettre-dispo`)
      showMsg('success', 'Avis remis en disponible.')
      setDetail(null)
      load()
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLA(null)
  }

  const togglePrioritaire = async (avisId, estPrioritaire) => {
    setLA('prioritaire')
    try {
      await api.put(`/admin/avis/${avisId}/prioritaire`, {
        prioritaire: !estPrioritaire,
        prix_membre: parseFloat(prixPrioritaire) || 2,
      })
      showMsg('success', !estPrioritaire ? 'Avis marqué prioritaire.' : 'Priorité retirée.')
      setDetail(p => ({ ...p, prioritaire: !estPrioritaire ? 1 : 0, prix_membre: parseFloat(prixPrioritaire) || 2 }))
      load()
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLA(null)
  }

  const faireLeMenuage = async () => {
    const nbSuppr = avis.filter(a => a.statut === 'paye').length
    const nbReset = avis.filter(a => a.statut === 'refuse').length

    if (!confirm(`Ménage :\n- ${nbSuppr} avis payés → supprimés\n- ${nbReset} avis refusés → remis en disponible\n\nConfirmer ?`)) return

    setLA('menage')
    try {
      const r = await api.delete('/admin/avis/menage')
      showMsg('success', r.data.message)
      load()
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLA(null)
  }

  const verifierMaintenant = async (avisId) => {
    setLA('verifier')
    setVerifResult(null)
    try {
      const r = await api.post(`/admin/avis/${avisId}/verifier`)
      setVerifResult(r.data)
      showMsg('success', 'Indice lancé, rafraîchis dans 1-2 minutes.')
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur')
    }
    setLA(null)
  }

  const lienIncorrect = async (avisId) => {
    if (!confirm('Marquer le lien comme incorrect ?')) return
    setLA('lien')
    try {
      await api.put(`/admin/avis/${avisId}/lien-incorrect`)
      showMsg('success', 'Membre notifié.')
      setDetail(null)
      load()
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLA(null)
  }

  const modifierLienEtValider = async (avisId) => {
    if (!newLien.trim()) return showMsg('error', 'Entre le nouveau lien')
    if (!confirm('Modifier le lien et valider ?')) return
    setLA('modifier_lien')
    try {
      await api.put(`/admin/avis/${avisId}/valider`, { lien_avis_poste: newLien })
      showMsg('success', 'Lien modifié et validé.')
      setNewLien('')
      setDetail(null)
      load()
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLA(null)
  }

  const modifierAvis = async (avisId) => {
    setLA('modifier')
    try {
      await api.put(`/admin/avis/${avisId}`, editForm)
      showMsg('success', 'Avis modifié.')
      setEditForm(null)
      setDetail(null)
      load()
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLA(null)
  }

  // Un avis "disponible" dont le texte n'a pas encore été renseigné n'est
  // jamais montré aux membres (le backend le filtre côté /api/avis) — on
  // l'affiche distinctement pour que ce soit clair côté admin.
  const manqueTexte = (a) => !cleanText(a?.texte)?.trim()

  // Un avis "disponible" dont la date de visibilité programmée n'est pas
  // encore atteinte n'est pas réellement dispo pour les membres — on
  // l'affiche distinctement avec la date/heure prévue plutôt que "Dispo".
  const estProgramme = (a) => {
    if (a?.statut !== 'disponible' || !a.visible_a_partir_de) return false
    const d = new Date(a.visible_a_partir_de.replace(' ', 'T') + 'Z')
    return !isNaN(d.getTime()) && d.getTime() > Date.now()
  }

  const statutBadge = a => {
    const s = typeof a === 'string' ? a : a?.statut
    if (typeof a === 'object' && a && s === 'disponible' && manqueTexte(a)) {
      return (
        <span className="badge-yellow" title="Texte en attente — visible uniquement par l'admin, pas encore proposé aux membres">
          <FileText size={11} /> Texte en attente
        </span>
      )
    }
    if (typeof a === 'object' && a && estProgramme(a)) {
      const d = new Date(a.visible_a_partir_de.replace(' ', 'T') + 'Z')
      return (
        <span className="badge-blue" title="Programmé — pas encore visible des membres">
          <CalendarClock size={11} /> {d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      )
    }
    return ({
      disponible:      <span className="badge-blue">Disponible</span>,
      reserve:         <span className="badge-yellow">Réservé</span>,
      en_verification: <span className="badge-yellow">Vérif.</span>,
      valide:          <span className="badge-green">Validé</span>,
      refuse:          <span className="badge-red">Refusé</span>,
      paye:            <span className="badge-green">Payé</span>,
      lien_incorrect:  <span className="badge-red"><Link2 size={11} /> Lien incorrect</span>,
    }[s])
  }

  const verifBadge = (a) => {
    const info = checkpointInfo(a)
    if (a.verif_statut === 'paye') return <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Payé</span>
    if (!info) {
      if (!a.last_check) return <span className="text-xs text-slate-400">Jamais vérifié</span>
      return <span className="text-xs text-slate-400">—</span>
    }
    if (info.estFinal) {
      return <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Délai atteint · à créditer</span>
    }
    if (info.aVerifierMaintenant) {
      return <span className="text-xs font-medium text-amber-600 dark:text-amber-400">À vérifier · {info.joursRestants}j avant paiement</span>
    }
    return (
      <span className="text-xs text-sky-600 dark:text-sky-400">
        Vérifié {info.nbChecks}x · {info.joursRestants}j avant paiement
      </span>
    )
  }

  const getNomEtablissement = (a) => {
    if (a.nom_etablissement) return a.nom_etablissement
    if (a.nom_societe && !a.nom_societe.includes('@')) return a.nom_societe
    return 'Établissement inconnu'
  }

  const formatDate = d => d ? new Date(d).toLocaleString('fr-FR') : '—'
  const closeDetail = () => { setDetail(null); setEditForm(null); setNewLien(''); setVerifResult(null) }

  const nbMenuage = avis.filter(a => a.statut === 'refuse' || a.statut === 'paye').length

  const nbAVerifier = avis.filter(a => checkpointInfo(a)?.aVerifierMaintenant).length

  let avisFiltres = [...avis]
  if (filtre === 'a_verifier') avisFiltres = avisFiltres.filter(a => checkpointInfo(a)?.aVerifierMaintenant)
  else if (filtre !== 'tous') avisFiltres = avisFiltres.filter(a => a.statut === filtre)
  if (search) avisFiltres = avisFiltres.filter(a =>
    getNomEtablissement(a).toLowerCase().includes(search.toLowerCase()) ||
    a.membre_email?.toLowerCase().includes(search.toLowerCase()) ||
    String(a.id).includes(search)
  )
  if (tri === 'recent') avisFiltres.sort((a, b) => new Date(b.soumis_at || b.created_at) - new Date(a.soumis_at || a.created_at))
  if (tri === 'ancien') avisFiltres.sort((a, b) => new Date(a.soumis_at || a.created_at) - new Date(b.soumis_at || b.created_at))
  if (tri === 'valide') avisFiltres.sort((a, b) => new Date(b.valide_at || 0) - new Date(a.valide_at || 0))
  if (tri === 'verif')  avisFiltres.sort((a, b) => new Date(b.last_check || 0) - new Date(a.last_check || 0))
  if (tri === 'urgence') avisFiltres.sort((a, b) => (checkpointInfo(a)?.joursRestants ?? 999) - (checkpointInfo(b)?.joursRestants ?? 999))
  if (tri === 'id')     avisFiltres.sort((a, b) => b.id - a.id)
  // Les avis à vérifier maintenant remontent toujours en premier, puis les prioritaires
  avisFiltres.sort((a, b) => (checkpointInfo(b)?.aVerifierMaintenant ? 1 : 0) - (checkpointInfo(a)?.aVerifierMaintenant ? 1 : 0))
  avisFiltres.sort((a, b) => (b.prioritaire || 0) - (a.prioritaire || 0))

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Avis</h1>
          <p className="text-muted mt-0.5">{avis.length} au total</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {nbMenuage > 0 && (
            <button onClick={faireLeMenuage} disabled={loadingAction === 'menage'}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full font-medium text-sm bg-red-50 text-red-600 active:scale-95 transition-all disabled:opacity-70 dark:bg-red-900/20 dark:text-red-400">
              {loadingAction === 'menage' ? <Spinner /> : <Trash2 size={15} />} Ménage ({nbMenuage})
            </button>
          )}
          <button onClick={() => setShow(!show)} className="btn-primary">
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium border ${
          msg.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Rechercher par nom, membre ou #ID..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative sm:w-56 shrink-0">
          <ArrowDownUp size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select className="input pl-9 text-sm appearance-none" value={tri} onChange={e => setTri(e.target.value)}>
            <option value="recent">Plus récent</option>
            <option value="ancien">Plus ancien</option>
            <option value="urgence">Paiement le plus proche</option>
            <option value="id">Par numéro</option>
            <option value="valide">Date validation</option>
            <option value="verif">Dernière vérification</option>
          </select>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUT_FILTRES.map(({ v, l }) => (
          <button key={v} onClick={() => setFiltre(v)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              filtre === v
                ? 'bg-sky-500 text-white'
                : v === 'a_verifier' && nbAVerifier > 0
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}>
            {v === 'a_verifier' && <Clock size={12} />}
            {v === 'tous' ? `Tous (${avis.length})` : v === 'a_verifier' ? `À vérifier (${nbAVerifier})` : l}
          </button>
        ))}
      </div>

      {/* Modal détail */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={closeDetail}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="section-title flex items-center gap-2">
                Avis #{detail.id}
                {detail.prioritaire ? <span className="badge-amber"><Flame size={11} /> Prioritaire</span> : null}
              </h3>
              <button onClick={closeDetail} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="card-flat">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Établissement</p>
                <p className="font-medium">{getNomEtablissement(detail)}</p>
              </div>

              <div className="card-flat">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Statut</p>
                {statutBadge(detail)}
                {detail.statut === 'disponible' && manqueTexte(detail) && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                    Ajoute le texte de l'avis pour qu'il devienne visible et réservable par les membres.
                  </p>
                )}
              </div>

              {/* Suivi de paiement — cœur du système de vérification manuelle */}
              {(() => {
                const info = checkpointInfo(detail)
                if (!info) return null
                return (
                  <div className={`rounded-xl p-3 space-y-2 border ${
                    info.estFinal
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                      : info.aVerifierMaintenant
                        ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-600'
                  }`}>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <CalendarClock size={13} /> Suivi de paiement
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-semibold">{info.joursEcoules}j</p>
                        <p className="text-[10px] text-slate-400">écoulés</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{info.joursRestants}j</p>
                        <p className="text-[10px] text-slate-400">restants</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{info.nbChecks}</p>
                        <p className="text-[10px] text-slate-400">vérif. faites</p>
                      </div>
                    </div>
                    <p className="text-xs text-center font-medium">
                      {info.estFinal
                        ? 'Délai atteint — valider créditera le solde du membre'
                        : info.aVerifierMaintenant
                          ? `Checkpoint dû (tous les ${CHECKPOINT_JOURS} jours) — vérifie que l'avis est toujours en ligne`
                          : `Prochaine vérification due dans ${Math.max(0, CHECKPOINT_JOURS - (info.joursEcoules % CHECKPOINT_JOURS || CHECKPOINT_JOURS))}j environ`}
                    </p>
                  </div>
                )
              })()}

              <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-3 space-y-2">
                <p className="text-xs text-sky-700 dark:text-sky-400 font-medium flex items-center gap-1.5">
                  <ShieldQuestion size={14} /> Indice Outscraper (optionnel)
                </p>
                <p className="text-[11px] text-sky-600/80 dark:text-sky-400/70">
                  Ne décide jamais tout seul — sert juste d'aide avant de valider ou refuser à la main.
                </p>
                {detail.hint_checked_at && (
                  <div className={`rounded-lg p-2 text-xs font-medium ${detail.hint_trouve ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {detail.hint_trouve ? 'Trouvé sur Google Maps' : 'Non trouvé sur Google Maps'} · {new Date(detail.hint_checked_at).toLocaleString('fr-FR')}
                  </div>
                )}
                {verifResult && (
                  <div className="rounded-lg p-2 text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                    {verifResult.message}
                  </div>
                )}
                <button onClick={() => verifierMaintenant(detail.id)} disabled={loadingAction === 'verifier'}
                  className="w-full bg-sky-500 text-white py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
                  {loadingAction === 'verifier' ? <><Spinner /> Lancé...</> : 'Lancer un indice Outscraper'}
                </button>
              </div>

              {detail.membre_email && (
                <div className="card-flat">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <User size={12} /> Membre
                  </p>
                  <p className="font-medium">{detail.membre_email}</p>
                </div>
              )}

              <div className="card-flat">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Texte de l'avis</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {cleanText(detail.texte) || <span className="italic text-slate-400">Aucun texte pour le moment</span>}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="card-flat">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Soumis le</p>
                  <p className="text-xs font-medium">{formatDate(detail.soumis_at)}</p>
                </div>
                <div className="card-flat">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Validé le</p>
                  <p className="text-xs font-medium">{formatDate(detail.valide_at)}</p>
                </div>
              </div>

              {detail.lien_avis_poste && (
                <div className="card-flat">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Lien publié</p>
                  <a href={detail.lien_avis_poste} target="_blank" rel="noreferrer"
                    className="text-sky-500 text-xs break-all underline inline-flex items-center gap-1">
                    {detail.lien_avis_poste} <ExternalLink size={11} className="shrink-0" />
                  </a>
                </div>
              )}
            </div>

            {/* Modifier */}
            {editForm ? (
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                <p className="text-sm font-semibold flex items-center gap-1.5"><Pencil size={14} /> Modifier</p>
                <textarea className="input text-sm min-h-[80px]" value={editForm.texte}
                  onChange={e => setEditForm(p => ({ ...p, texte: e.target.value }))} />
                <input className="input text-sm" value={editForm.lien_maps}
                  onChange={e => setEditForm(p => ({ ...p, lien_maps: e.target.value }))} />
                <div className="flex gap-2">
                  <button onClick={() => modifierAvis(detail.id)} disabled={loadingAction === 'modifier'}
                    className="flex-1 btn-primary py-2">
                    {loadingAction === 'modifier' ? <><Spinner /> Sauvegarde...</> : <><Save size={15} /> Sauvegarder</>}
                  </button>
                  <button onClick={() => setEditForm(null)} className="flex-1 btn-secondary py-2">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditForm({ lien_maps: detail.lien_maps, texte: detail.texte, prix: detail.prix, delai_paiement: detail.delai_paiement, statut: detail.statut })}
                className="w-full btn-secondary">
                <Pencil size={15} /> Modifier l'avis
              </button>
            )}

            {/* Actions */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Actions</p>

              {/* Prioritaire */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 space-y-2">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                  <Flame size={13} /> Avis prioritaire
                </p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Gain membre (€)</label>
                    <input className="input text-sm" type="number" min="1" step="0.5"
                      value={prixPrioritaire}
                      onChange={e => setPrixPrio(e.target.value)} />
                  </div>
                  <button
                    onClick={() => togglePrioritaire(detail.id, !!detail.prioritaire)}
                    disabled={loadingAction === 'prioritaire'}
                    className={`flex-1 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70 ${
                      detail.prioritaire
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {loadingAction === 'prioritaire' ? <Spinner /> : detail.prioritaire ? 'Retirer priorité' : 'Marquer prioritaire'}
                  </button>
                </div>
                {detail.prioritaire && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Gain actuel : {parseFloat(detail.prix_membre || 1).toFixed(2)}€
                  </p>
                )}
              </div>

              {['en_verification', 'valide'].includes(detail.statut) && (() => {
                const info = checkpointInfo(detail)
                const label = info?.estFinal
                  ? 'Valider et créditer le solde'
                  : info?.nbChecks
                    ? 'Confirmer — toujours en ligne'
                    : 'Valider ce checkpoint'
                return (
                  <button onClick={() => valider(detail.id)} disabled={loadingAction === 'valider'}
                    className="w-full bg-emerald-500 text-white py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
                    {loadingAction === 'valider' ? <><Spinner /> Validation...</> : <><BadgeCheck size={16} /> {label}</>}
                  </button>
                )
              })()}

              {['refuse', 'valide', 'reserve', 'en_verification'].includes(detail.statut) && (
                <button onClick={() => remettreEnDispo(detail.id)} disabled={loadingAction === 'dispo'}
                  className="w-full bg-sky-500 text-white py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
                  {loadingAction === 'dispo' ? <><Spinner /> Traitement...</> : <><RotateCcw size={15} /> Remettre en disponible</>}
                </button>
              )}

              {detail.statut !== 'refuse' && detail.statut !== 'disponible' && (
                <button onClick={() => refuser(detail.id)} disabled={loadingAction === 'refuser'}
                  className="w-full btn-danger">
                  {loadingAction === 'refuser' ? <><Spinner /> Traitement...</> : <><XCircle size={15} /> Refuser — plus sur Google</>}
                </button>
              )}

              {(detail.statut === 'valide' || detail.statut === 'reserve') && (
                <button onClick={() => lienIncorrect(detail.id)} disabled={loadingAction === 'lien'}
                  className="w-full bg-amber-500 text-white py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
                  {loadingAction === 'lien' ? <><Spinner /> Envoi...</> : <><Link2 size={15} /> Lien incorrect — demander correction</>}
                </button>
              )}

              <div className="space-y-2 pt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">Modifier le lien et valider :</p>
                <input className="input text-sm" placeholder="Nouveau lien..."
                  value={newLien} onChange={e => setNewLien(e.target.value)} />
                <button onClick={() => modifierLienEtValider(detail.id)}
                  disabled={loadingAction === 'modifier_lien' || !newLien.trim()}
                  className="w-full btn-primary">
                  {loadingAction === 'modifier_lien' ? <><Spinner /> Traitement...</> : 'Modifier et valider'}
                </button>
              </div>
            </div>

            <button onClick={closeDetail} className="w-full btn-secondary">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Formulaire ajout */}
      {show && (
        <div className="card space-y-3 border-sky-200 dark:border-sky-800">
          <h3 className="section-title">Nouvel avis</h3>
          <select className="input" value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}>
            <option value="">Sélectionner un client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom_societe} ({c.email})</option>)}
          </select>
          <input className="input" placeholder="Nom établissement"
            value={form.nom_etablissement || ''} onChange={e => setForm(p => ({ ...p, nom_etablissement: e.target.value }))} />
          <input className="input" placeholder="Lien Google Maps"
            value={form.lien_maps} onChange={e => setForm(p => ({ ...p, lien_maps: e.target.value }))} />
          <textarea className="input min-h-[100px]" placeholder="Texte de l'avis"
            value={form.texte} onChange={e => setForm(p => ({ ...p, texte: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Étoiles</label>
              <select className="input" value={form.nb_etoiles || '5'} onChange={e => setForm(p => ({ ...p, nb_etoiles: e.target.value }))}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Délai paiement (jours)</label>
              <input className="input" type="number" placeholder="30"
                value={form.delai_paiement} onChange={e => setForm(p => ({ ...p, delai_paiement: e.target.value }))} />
            </div>
          </div>
          <button onClick={ajouter} disabled={loadingAction === 'ajouter'} className="w-full btn-primary">
            {loadingAction === 'ajouter' ? <><Spinner /> Ajout...</> : "Ajouter l'avis directement"}
          </button>
        </div>
      )}

      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <ListFilter size={12} /> {avisFiltres.length} avis
      </p>

      <div className="space-y-2">
        {avisFiltres.map(a => (
          <div key={a.id}
            className={`card space-y-1.5 cursor-pointer active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors ${a.prioritaire ? 'border-amber-300 dark:border-amber-700' : ''}`}
            onClick={() => { setDetail(a); setEditForm(null); setNewLien(''); setVerifResult(null) }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-mono shrink-0">#{a.id}</span>
                  {a.prioritaire ? <Flame size={12} className="text-amber-500 shrink-0" /> : null}
                  <p className="font-semibold text-sm truncate">{getNomEtablissement(a)}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {cleanText(a.texte) ? `${cleanText(a.texte).slice(0, 50)}...` : <span className="italic text-slate-400">Aucun texte pour le moment</span>}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {a.membre_email ? a.membre_email : 'Non réservé'}
                  {a.soumis_at ? ` · ${new Date(a.soumis_at).toLocaleDateString('fr-FR')}` : ''}
                  {a.prioritaire ? ` · +${parseFloat(a.prix_membre || 1).toFixed(2)}€` : ''}
                </p>
                <div className="mt-1">{verifBadge(a)}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {statutBadge(a)}
                {a.statut === 'disponible' && (
                  <button onClick={e => { e.stopPropagation(); supprimer(a.id) }}
                    disabled={loadingAction === `sup_${a.id}`}
                    className="p-1 text-slate-300 hover:text-red-500 disabled:opacity-50 transition-colors">
                    {loadingAction === `sup_${a.id}` ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                )}
              </div>
            </div>
            {a.lien_avis_poste && (
              <a href={a.lien_avis_poste} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs text-sky-500 underline truncate flex items-center gap-1">
                Voir l'avis publié <ExternalLink size={11} className="shrink-0" />
              </a>
            )}
          </div>
        ))}
        {avisFiltres.length === 0 && (
          <div className="card text-center py-10 text-slate-400 flex flex-col items-center gap-2">
            <AlertTriangle size={22} className="text-slate-300 dark:text-slate-600" />
            Aucun avis
          </div>
        )}
      </div>
    </div>
  )
}
