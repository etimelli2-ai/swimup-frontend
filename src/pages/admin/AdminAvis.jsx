import { useState, useEffect } from 'react'
import api from '../../lib/api'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

const STATUT_FILTRES = ['tous', 'disponible', 'reserve', 'en_verification', 'valide', 'refuse', 'paye']

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
      showMsg('success', 'Avis ajouté !')
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
      showMsg('success', 'Avis supprimé !')
    } catch { showMsg('error', 'Erreur') }
    setLA(null)
  }

  const valider = async (avisId) => {
    if (!confirm('Valider manuellement ?')) return
    setLA('valider')
    try {
      await api.put(`/admin/avis/${avisId}/valider`)
      showMsg('success', '✅ Avis validé !')
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
      showMsg('success', '❌ Avis refusé !')
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
      showMsg('success', '🔄 Avis remis en disponible !')
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
      showMsg('success', !estPrioritaire ? '🔥 Avis marqué prioritaire !' : '✅ Priorité retirée')
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
      showMsg('success', '🔍 Vérification lancée ! Rafraîchis dans 1-2 minutes.')
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
      showMsg('success', '🔗 Membre notifié !')
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
      showMsg('success', '🔗 Lien modifié et validé !')
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
      showMsg('success', '✏️ Avis modifié !')
      setEditForm(null)
      setDetail(null)
      load()
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLA(null)
  }

  const statutBadge = s => ({
    disponible:      <span className="badge-blue">Dispo</span>,
    reserve:         <span className="badge-yellow">Réservé</span>,
    en_verification: <span className="badge-yellow">Vérif.</span>,
    valide:          <span className="badge-green">Validé</span>,
    refuse:          <span className="badge-red">Refusé</span>,
    paye:            <span className="badge-green">Payé</span>,
    lien_incorrect:  <span className="badge-red">🔗 Lien ❌</span>,
  }[s])

  const verifBadge = (a) => {
    if (!a.last_check) return <span className="text-xs text-gray-400">Jamais vérifié</span>
    const date = new Date(a.last_check).toLocaleDateString('fr-FR')
    if (a.verif_statut === 'paye') return <span className="text-xs text-green-600">✅ Payé</span>
    if (a.verif_statut === 'inactif') return <span className="text-xs text-red-500">❌ Inactif</span>
    return <span className="text-xs text-blue-600">🔍 Vérifié {date} ({a.nb_checks}x)</span>
  }

  const getNomEtablissement = (a) => {
    if (a.nom_etablissement) return a.nom_etablissement
    if (a.nom_societe && !a.nom_societe.includes('@')) return a.nom_societe
    return 'Établissement inconnu'
  }

  const formatDate = d => d ? new Date(d).toLocaleString('fr-FR') : '—'
  const closeDetail = () => { setDetail(null); setEditForm(null); setNewLien(''); setVerifResult(null) }

  const nbMenuage = avis.filter(a => a.statut === 'refuse' || a.statut === 'paye').length

  let avisFiltres = [...avis]
  if (filtre !== 'tous') avisFiltres = avisFiltres.filter(a => a.statut === filtre)
  if (search) avisFiltres = avisFiltres.filter(a =>
    getNomEtablissement(a).toLowerCase().includes(search.toLowerCase()) ||
    a.membre_email?.toLowerCase().includes(search.toLowerCase()) ||
    String(a.id).includes(search)
  )
  if (tri === 'recent') avisFiltres.sort((a, b) => new Date(b.soumis_at || b.created_at) - new Date(a.soumis_at || a.created_at))
  if (tri === 'ancien') avisFiltres.sort((a, b) => new Date(a.soumis_at || a.created_at) - new Date(b.soumis_at || b.created_at))
  if (tri === 'valide') avisFiltres.sort((a, b) => new Date(b.valide_at || 0) - new Date(a.valide_at || 0))
  if (tri === 'verif')  avisFiltres.sort((a, b) => new Date(b.last_check || 0) - new Date(a.last_check || 0))
  if (tri === 'id')     avisFiltres.sort((a, b) => b.id - a.id)
  // Prioritaires toujours en premier
  avisFiltres.sort((a, b) => (b.prioritaire || 0) - (a.prioritaire || 0))

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold dark:text-white">Avis ({avis.length})</h2>
        <div className="flex gap-2">
          {nbMenuage > 0 && (
            <button onClick={faireLeMenuage} disabled={loadingAction === 'menage'}
              className="bg-red-100 text-red-600 px-3 py-2 rounded-xl font-medium text-sm flex items-center gap-1 disabled:opacity-70">
              {loadingAction === 'menage' ? <Spinner /> : '🗑️'} Ménage ({nbMenuage})
            </button>
          )}
          <button onClick={() => setShow(!show)} className="bg-sky-500 text-white px-4 py-2 rounded-xl font-medium text-sm">
            + Ajouter
          </button>
        </div>
      </div>

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <input className="input" placeholder="🔍 Rechercher par nom, membre ou #ID..."
        value={search} onChange={e => setSearch(e.target.value)} />

      <select className="input text-sm" value={tri} onChange={e => setTri(e.target.value)}>
        <option value="recent">📅 Plus récent</option>
        <option value="ancien">📅 Plus ancien</option>
        <option value="id">🔢 Par numéro</option>
        <option value="valide">✅ Date validation</option>
        <option value="verif">🔍 Dernière vérification</option>
      </select>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUT_FILTRES.map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filtre === f ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
            }`}>
            {f === 'tous' ? `Tous (${avis.length})` : f}
          </button>
        ))}
      </div>

      {/* Modal détail */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={closeDetail}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                Avis #{detail.id}
                {detail.prioritaire ? <span className="text-sm bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">🔥 Prioritaire</span> : null}
              </h3>
              <button onClick={closeDetail} className="text-gray-400 text-2xl">×</button>
            </div>

            <div className="space-y-2">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Établissement</p>
                <p className="font-medium dark:text-white">{getNomEtablissement(detail)}</p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Statut</p>
                {statutBadge(detail.statut)}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 space-y-2">
                <p className="text-xs text-blue-600 font-medium">🔍 Vérification Outscraper</p>
                <div>{verifBadge(detail)}</div>
                {verifResult && (
                  <div className={`rounded-lg p-2 text-xs font-medium ${verifResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {verifResult.message}
                  </div>
                )}
                <button onClick={() => verifierMaintenant(detail.id)} disabled={loadingAction === 'verifier'}
                  className="w-full bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                  {loadingAction === 'verifier' ? <><Spinner /> Lancé...</> : '🔍 Vérifier maintenant via Outscraper'}
                </button>
              </div>

              {detail.membre_email && (
                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Membre</p>
                  <p className="font-medium dark:text-white">{detail.membre_email}</p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Texte de l'avis</p>
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                  {cleanText(detail.texte)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Soumis le</p>
                  <p className="text-xs font-medium dark:text-white">{formatDate(detail.soumis_at)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Validé le</p>
                  <p className="text-xs font-medium dark:text-white">{formatDate(detail.valide_at)}</p>
                </div>
              </div>

              {detail.lien_avis_poste && (
                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Lien publié</p>
                  <a href={detail.lien_avis_poste} target="_blank" rel="noreferrer"
                    className="text-sky-500 text-xs break-all underline">{detail.lien_avis_poste}</a>
                </div>
              )}
            </div>

            {/* Modifier */}
            {editForm ? (
              <div className="space-y-3 border-t border-gray-100 dark:border-slate-700 pt-3">
                <p className="text-sm font-bold dark:text-white">✏️ Modifier</p>
                <textarea className="input text-sm min-h-[80px]" value={editForm.texte}
                  onChange={e => setEditForm(p => ({ ...p, texte: e.target.value }))} />
                <input className="input text-sm" value={editForm.lien_maps}
                  onChange={e => setEditForm(p => ({ ...p, lien_maps: e.target.value }))} />
                <div className="flex gap-2">
                  <button onClick={() => modifierAvis(detail.id)} disabled={loadingAction === 'modifier'}
                    className="flex-1 bg-sky-500 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                    {loadingAction === 'modifier' ? <><Spinner /> Sauvegarde...</> : '💾 Sauvegarder'}
                  </button>
                  <button onClick={() => setEditForm(null)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-semibold">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditForm({ lien_maps: detail.lien_maps, texte: detail.texte, prix: detail.prix, delai_paiement: detail.delai_paiement, statut: detail.statut })}
                className="w-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-semibold">
                ✏️ Modifier l'avis
              </button>
            )}

            {/* Actions */}
            <div className="space-y-2 border-t border-gray-100 dark:border-slate-700 pt-3">
              <p className="text-sm font-bold dark:text-white">⚡ Actions</p>

              {/* Prioritaire */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 space-y-2">
                <p className="text-xs text-orange-600 font-medium">🔥 Avis prioritaire</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Gain membre (€)</label>
                    <input className="input text-sm" type="number" min="1" step="0.5"
                      value={prixPrioritaire}
                      onChange={e => setPrixPrio(e.target.value)} />
                  </div>
                  <button
                    onClick={() => togglePrioritaire(detail.id, !!detail.prioritaire)}
                    disabled={loadingAction === 'prioritaire'}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70 ${
                      detail.prioritaire
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-orange-500 text-white'
                    }`}
                  >
                    {loadingAction === 'prioritaire' ? <Spinner /> : detail.prioritaire ? '❌ Retirer priorité' : '🔥 Marquer prioritaire'}
                  </button>
                </div>
                {detail.prioritaire && (
                  <p className="text-xs text-orange-600">
                    Gain actuel : {parseFloat(detail.prix_membre || 1).toFixed(2)}€
                  </p>
                )}
              </div>

              {detail.statut !== 'valide' && detail.statut !== 'paye' && (
                <button onClick={() => valider(detail.id)} disabled={loadingAction === 'valider'}
                  className="w-full bg-green-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                  {loadingAction === 'valider' ? <><Spinner /> Validation...</> : '✅ Valider manuellement'}
                </button>
              )}

              {['refuse', 'valide', 'reserve', 'en_verification'].includes(detail.statut) && (
                <button onClick={() => remettreEnDispo(detail.id)} disabled={loadingAction === 'dispo'}
                  className="w-full bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                  {loadingAction === 'dispo' ? <><Spinner /> Traitement...</> : '🔄 Remettre en disponible'}
                </button>
              )}

              {detail.statut !== 'refuse' && detail.statut !== 'disponible' && (
                <button onClick={() => refuser(detail.id)} disabled={loadingAction === 'refuser'}
                  className="w-full bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                  {loadingAction === 'refuser' ? <><Spinner /> Traitement...</> : '❌ Refuser — plus sur Google'}
                </button>
              )}

              {(detail.statut === 'valide' || detail.statut === 'reserve') && (
                <button onClick={() => lienIncorrect(detail.id)} disabled={loadingAction === 'lien'}
                  className="w-full bg-orange-400 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                  {loadingAction === 'lien' ? <><Spinner /> Envoi...</> : '🔗 Lien incorrect — demander correction'}
                </button>
              )}

              <div className="space-y-2 pt-1">
                <p className="text-xs text-gray-500 dark:text-slate-400">Modifier le lien et valider :</p>
                <input className="input text-sm" placeholder="Nouveau lien..."
                  value={newLien} onChange={e => setNewLien(e.target.value)} />
                <button onClick={() => modifierLienEtValider(detail.id)}
                  disabled={loadingAction === 'modifier_lien' || !newLien.trim()}
                  className="w-full bg-sky-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                  {loadingAction === 'modifier_lien' ? <><Spinner /> Traitement...</> : '🔗 Modifier et valider'}
                </button>
              </div>
            </div>

            <button onClick={closeDetail} className="w-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 py-2.5 rounded-xl text-sm font-semibold">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Formulaire ajout */}
      {show && (
  <div className="card space-y-3 border-2 border-sky-200">
    <h3 className="font-bold dark:text-white">Nouvel avis</h3>
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
        <label className="text-xs text-gray-500 mb-1 block">Étoiles</label>
        <select className="input" value={form.nb_etoiles || '5'} onChange={e => setForm(p => ({ ...p, nb_etoiles: e.target.value }))}>
          <option value="1">⭐ 1</option>
          <option value="2">⭐⭐ 2</option>
          <option value="3">⭐⭐⭐ 3</option>
          <option value="4">⭐⭐⭐⭐ 4</option>
          <option value="5">⭐⭐⭐⭐⭐ 5</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Délai paiement (jours)</label>
        <input className="input" type="number" placeholder="30"
          value={form.delai_paiement} onChange={e => setForm(p => ({ ...p, delai_paiement: e.target.value }))} />
      </div>
    </div>
    <button onClick={ajouter} disabled={loadingAction === 'ajouter'}
      className="w-full bg-sky-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
      {loadingAction === 'ajouter' ? <><Spinner /> Ajout...</> : "✅ Ajouter l'avis directement"}
    </button>
  </div>
)}

      <p className="text-xs text-gray-400">{avisFiltres.length} avis</p>

      <div className="space-y-2">
        {avisFiltres.map(a => (
          <div key={a.id}
            className={`card space-y-1 cursor-pointer active:bg-gray-50 dark:active:bg-slate-700 ${a.prioritaire ? 'border-2 border-orange-300 dark:border-orange-700' : ''}`}
            onClick={() => { setDetail(a); setEditForm(null); setNewLien(''); setVerifResult(null) }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 font-mono shrink-0">#{a.id}</span>
                  {a.prioritaire ? <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full shrink-0">🔥</span> : null}
                  <p className="font-bold text-sm truncate dark:text-white">{getNomEtablissement(a)}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {cleanText(a.texte)?.slice(0, 50)}...
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  {a.membre_email ? `👤 ${a.membre_email}` : 'Non réservé'}
                  {a.soumis_at ? ` · 📅 ${new Date(a.soumis_at).toLocaleDateString('fr-FR')}` : ''}
                  {a.prioritaire ? ` · 💰 ${parseFloat(a.prix_membre || 1).toFixed(2)}€` : ''}
                </p>
                <div className="mt-1">{verifBadge(a)}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {statutBadge(a.statut)}
                {a.statut === 'disponible' && (
                  <button onClick={e => { e.stopPropagation(); supprimer(a.id) }}
                    disabled={loadingAction === `sup_${a.id}`}
                    className="text-red-400 text-xl disabled:opacity-50">
                    {loadingAction === `sup_${a.id}` ? '...' : '×'}
                  </button>
                )}
              </div>
            </div>
            {a.lien_avis_poste && (
              <a href={a.lien_avis_poste} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs text-sky-500 underline truncate block">
                🔗 Voir l'avis
              </a>
            )}
          </div>
        ))}
        {avisFiltres.length === 0 && (
          <div className="card text-center py-10 text-gray-400">Aucun avis</div>
        )}
      </div>
    </div>
  )
}
