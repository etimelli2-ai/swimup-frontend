import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Search, Mail, Phone, Globe, Star, Trash2, Send, Pencil, ExternalLink, Plus } from 'lucide-react'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

// Liste fermée de métiers reconnus par Google Places — évite les fautes de
// frappe / termes mal formulés qui font que Google ne comprend pas la
// requête. "__autre__" garde une échappatoire en texte libre si besoin.
const METIERS = [
  'Restaurant', 'Bar', 'Café', 'Boulangerie', 'Pâtisserie', 'Traiteur', 'Boucherie',
  'Hôtel', 'Gîte', 'Chambre d\'hôtes',
  'Coiffeur', 'Salon de beauté', 'Institut de beauté', 'Barbier', 'Onglerie', 'Spa',
  'Garage automobile', 'Auto-école', 'Concessionnaire automobile', 'Contrôle technique',
  'Plombier', 'Électricien', 'Menuisier', 'Peintre en bâtiment', 'Serrurier', 'Maçon', 'Couvreur', 'Chauffagiste',
  'Pharmacie', 'Dentiste', 'Médecin généraliste', 'Kinésithérapeute', 'Ostéopathe', 'Vétérinaire', 'Opticien',
  'Avocat', 'Notaire', 'Agence immobilière', 'Assurance', 'Banque', 'Comptable',
  'Fleuriste', 'Bijouterie', 'Magasin de vêtements', 'Cordonnier', 'Pressing', 'Photographe',
  'Salle de sport', 'Déménageur', 'Épicerie', 'Supermarché',
  '__autre__',
]
const LABEL_METIER = { __autre__: 'Autre (préciser)' }

// On mène avec la valeur (pourquoi une bonne fiche Google compte) plutôt
// qu'avec "on vend des avis" — le service n'arrive qu'ensuite, en douceur,
// avec l'essai gratuit comme porte d'entrée sans engagement.
const SUJET_DEFAUT = 'Votre visibilité sur Google Maps'
const MESSAGE_DEFAUT = (nom) => `Bonjour,

En regardant les fiches Google Maps du secteur, je suis tombé sur "${nom}".

Aujourd'hui, la fiche Google d'un établissement est souvent le tout premier réflexe d'un client avant de passer la porte — avant même le site web ou les réseaux sociaux. Une bonne note et une fiche active jouent directement sur le classement dans les recherches locales ("restaurant près de moi", etc.) et sur la confiance des gens qui hésitent encore entre plusieurs adresses du quartier.

Chez SwimUp, on accompagne des établissements comme le vôtre sur ce sujet : mise en valeur de la fiche, suivi de la réputation, et un vrai service autour des avis Google quand c'est utile pour donner un coup de pouce.

Si ça vous intéresse d'y jeter un œil, on vous offre un premier avis gratuit pour voir concrètement ce que ça peut changer, sans engagement de votre part. Il suffit de cliquer ici pour le réclamer :

{{LIEN_ESSAI}}

Bonne journée,
L'équipe SwimUp`

export default function AdminProspection() {
  const [recherches, setRecherches] = useState([{ requete: '', ville: '', autre: false }])
  const [maxAvis, setMaxAvis]       = useState(20)
  const [prospects, setProspects]   = useState([])
  const [filtre, setFiltre]         = useState('tous')
  const [loadingRecherche, setLR]   = useState(false)
  const [loadingAction, setLA]      = useState(null)
  const [editEmail, setEditEmail]   = useState({})
  const [modal, setModal]           = useState(null) // prospect en cours d'envoi
  const [sujet, setSujet]           = useState(SUJET_DEFAUT)
  const [message, setMessage]       = useState('')
  const [essaiGratuit, setEssaiGratuit] = useState(true)
  const [msg, setMsg]               = useState(null)
  const [ajoutManuel, setAjoutManuel] = useState(false)
  const [formManuel, setFormManuel] = useState({ nom: '', email: '', telephone: '', site_web: '', adresse: '' })
  const [loadingManuel, setLM]      = useState(false)

  const load = () => api.get('/admin/prospection').then(r => setProspects(r.data))
  useEffect(() => { load() }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const ajouterLigne = () => setRecherches([...recherches, { requete: '', ville: '', autre: false }])
  const retirerLigne = (i) => setRecherches(recherches.filter((_, idx) => idx !== i))
  const majLigne = (i, champ, val) => {
    const copie = [...recherches]
    copie[i][champ] = val
    setRecherches(copie)
  }

  const rechercher = async (e) => {
    e.preventDefault()
    const valides = recherches.filter(r => r.requete.trim() && r.ville.trim())
    if (valides.length === 0) return showMsg('error', 'Renseigne au moins un métier + une ville')

    setLR(true)
    try {
      const r = await api.post('/admin/prospection/rechercher', { recherches: valides, maxAvis })
      if (r.data.notes?.length) {
        setMsg({ type: 'info', text: `✅ ${r.data.total} prospect(s) trouvé(s). ${r.data.notes.join(' ')}` })
        setTimeout(() => setMsg(null), 10000)
      } else {
        showMsg('success', `✅ ${r.data.total} prospect(s) trouvé(s)`)
      }
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur lors de la recherche')
    }
    setLR(false)
  }

  const ouvrirModal = (p) => {
    setModal(p)
    setSujet(SUJET_DEFAUT)
    setMessage(MESSAGE_DEFAUT(p.nom))
    setEssaiGratuit(true)
  }

  const envoyerEmail = async () => {
    setLA(`envoi_${modal.id}`)
    try {
      await api.post(`/admin/prospection/${modal.id}/envoyer-email`, { sujet, message, essaiGratuit })
      showMsg('success', `✅ Email envoyé à ${modal.nom}`)
      setModal(null)
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || "Erreur lors de l'envoi")
    }
    setLA(null)
  }

  const sauverEmail = async (id) => {
    const email = editEmail[id]
    if (!email) return
    setLA(`email_${id}`)
    try {
      await api.put(`/admin/prospection/${id}/email`, { email })
      showMsg('success', '✅ Email enregistré')
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Email invalide')
    }
    setLA(null)
  }

  const ajouterManuellement = async (e) => {
    e.preventDefault()
    if (!formManuel.nom.trim()) return showMsg('error', 'Le nom est requis')
    setLM(true)
    try {
      await api.post('/admin/prospection/manuel', {
        ...formManuel,
        site_web: formManuel.site_web || undefined,
        email: formManuel.email || undefined,
      })
      showMsg('success', `✅ ${formManuel.nom} ajouté`)
      setFormManuel({ nom: '', email: '', telephone: '', site_web: '', adresse: '' })
      setAjoutManuel(false)
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || "Erreur lors de l'ajout")
    }
    setLM(false)
  }

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce prospect ?')) return
    setLA(`suppr_${id}`)
    try {
      await api.delete(`/admin/prospection/${id}`)
      setProspects(prospects.filter(p => p.id !== id))
    } catch {
      showMsg('error', 'Erreur')
    }
    setLA(null)
  }

  const filtered = prospects.filter(p => {
    if (filtre === 'a_contacter') return !p.email_envoye && p.email
    if (filtre === 'sans_email') return !p.email
    if (filtre === 'contactes') return !!p.email_envoye
    return true
  })

  return (
    <div className="p-4 space-y-4">
      <h2 className="page-title">🔎 Prospection</h2>
      <p className="text-sm text-gray-500">
        Cherche des commerces peu avisés sur Google Maps et contacte-les directement par email depuis le site.
      </p>

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium ${
          msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          msg.type === 'info'    ? 'bg-amber-50 text-amber-700 border border-amber-200' :
          'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Formulaire de recherche */}
      <form onSubmit={rechercher} className="card space-y-3">
        <h3 className="font-bold text-gray-900">Nouvelle recherche</h3>
        {recherches.map((r, i) => (
          <div key={i} className="space-y-2">
            <div className="flex gap-2">
              <select
                value={r.autre ? '__autre__' : r.requete}
                onChange={e => {
                  const val = e.target.value
                  const copie = [...recherches]
                  copie[i] = val === '__autre__'
                    ? { ...copie[i], autre: true, requete: '' }
                    : { ...copie[i], autre: false, requete: val }
                  setRecherches(copie)
                }}
                className="input flex-1"
              >
                <option value="" disabled>Choisir un métier</option>
                {METIERS.map(m => (
                  <option key={m} value={m}>{LABEL_METIER[m] || m}</option>
                ))}
              </select>
              <input
                type="text" placeholder="Code postal (ex: 75011)" value={r.ville}
                onChange={e => majLigne(i, 'ville', e.target.value)}
                className="input flex-1"
              />
              {recherches.length > 1 && (
                <button type="button" onClick={() => retirerLigne(i)} className="text-red-400 px-2">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            {r.autre && (
              <input
                type="text" placeholder="Précise le métier (texte libre)" value={r.requete}
                onChange={e => majLigne(i, 'requete', e.target.value)}
                className="input text-sm"
              />
            )}
          </div>
        ))}
        <button type="button" onClick={ajouterLigne} className="text-sky-500 text-xs font-medium">
          + Ajouter un métier/ville
        </button>

        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 font-medium">Max avis par fiche</label>
          <input
            type="number" min="0" value={maxAvis}
            onChange={e => setMaxAvis(e.target.value)}
            className="input w-24"
          />
        </div>

        <button type="submit" disabled={loadingRecherche} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70">
          {loadingRecherche ? <><Spinner /> Recherche en cours...</> : <><Search size={16} /> Lancer la recherche</>}
        </button>
      </form>

      {/* Ajout manuel — utile tant que la recherche Google est HS, ou pour
          un prospect trouvé par un autre biais (bouche-à-oreille, etc.) */}
      {!ajoutManuel ? (
        <button
          onClick={() => setAjoutManuel(true)}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl py-2.5"
        >
          <Plus size={16} /> Ajouter un prospect manuellement
        </button>
      ) : (
        <form onSubmit={ajouterManuellement} className="card space-y-3">
          <h3 className="font-bold text-gray-900">Ajouter manuellement</h3>
          <input type="text" placeholder="Nom de l'établissement *" required
            value={formManuel.nom} onChange={e => setFormManuel({ ...formManuel, nom: e.target.value })}
            className="input" />
          <input type="email" placeholder="Email"
            value={formManuel.email} onChange={e => setFormManuel({ ...formManuel, email: e.target.value })}
            className="input" />
          <input type="text" placeholder="Téléphone"
            value={formManuel.telephone} onChange={e => setFormManuel({ ...formManuel, telephone: e.target.value })}
            className="input" />
          <input type="url" placeholder="Site web (https://...)"
            value={formManuel.site_web} onChange={e => setFormManuel({ ...formManuel, site_web: e.target.value })}
            className="input" />
          <input type="text" placeholder="Adresse complète (rue, code postal, ville)"
            value={formManuel.adresse} onChange={e => setFormManuel({ ...formManuel, adresse: e.target.value })}
            className="input" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setAjoutManuel(false)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-full text-sm font-medium">
              Annuler
            </button>
            <button type="submit" disabled={loadingManuel} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-70">
              {loadingManuel ? <><Spinner /> Ajout...</> : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

      {/* Filtres */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 overflow-x-auto">
        {[['tous', 'Tous'], ['a_contacter', 'À contacter'], ['sans_email', 'Sans email'], ['contactes', 'Contactés']].map(([v, l]) => (
          <button key={v} onClick={() => setFiltre(v)}
            className={`flex-1 py-2 text-xs font-medium rounded-full transition-all whitespace-nowrap px-3 ${
              filtre === v ? 'bg-white text-sky-700' : 'text-gray-500'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* Liste des prospects */}
      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="card space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-gray-900">{p.nom}</p>
                <p className="text-xs text-gray-500">{p.adresse}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {p.note || '—'} ({p.nb_avis} avis)</span>
                  {p.telephone && <span className="flex items-center gap-1"><Phone size={12} /> {p.telephone}</span>}
                </div>
                {p.site_web && (
                  <a href={p.site_web} target="_blank" rel="noreferrer" className="text-xs text-sky-500 flex items-center gap-1 mt-1">
                    <Globe size={12} /> Site web <ExternalLink size={10} />
                  </a>
                )}
              </div>
              {p.email_envoye ? (
                <span className="badge-green text-xs shrink-0">✅ Contacté</span>
              ) : (
                <button onClick={() => supprimer(p.id)} disabled={loadingAction === `suppr_${p.id}`} className="text-gray-300 hover:text-red-400 shrink-0">
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {p.email ? (
              <div className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg p-2">
                <span className="text-xs text-gray-700 flex items-center gap-1 truncate"><Mail size={12} className="shrink-0" /> {p.email}</span>
                {!p.email_envoye && (
                  <button
                    onClick={() => ouvrirModal(p)}
                    className="bg-sky-500 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-all shrink-0"
                  >
                    <Send size={12} /> Envoyer
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="email" placeholder="Email introuvable — renseigne-le"
                  value={editEmail[p.id] ?? ''}
                  onChange={e => setEditEmail({ ...editEmail, [p.id]: e.target.value })}
                  className="input text-xs flex-1 py-2"
                />
                <button
                  onClick={() => sauverEmail(p.id)}
                  disabled={loadingAction === `email_${p.id}`}
                  className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-10 text-gray-400">Aucun prospect pour l'instant — lance une recherche ci-dessus.</div>
        )}
      </div>

      {/* Modal d'envoi d'email */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900">Envoyer à {modal.nom}</h3>
            <p className="text-xs text-gray-500">{modal.email}</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sujet</label>
              <input type="text" value={sujet} onChange={e => setSujet(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
              <textarea rows={9} value={message} onChange={e => setMessage(e.target.value)} className="input text-sm" />
              <p className="text-[11px] text-gray-400 mt-1">
                Le texte <code className="bg-gray-100 px-1 rounded">{'{{LIEN_ESSAI}}'}</code> sera remplacé par le vrai lien de réclamation à l'envoi.
              </p>
            </div>
            <label className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 cursor-pointer">
              <input type="checkbox" checked={essaiGratuit} onChange={e => setEssaiGratuit(e.target.checked)} className="w-4 h-4" />
              <span className="text-xs font-medium text-emerald-700">
                Offrir un essai gratuit (1 avis publié offert, sans paiement)
              </span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-full text-sm font-medium">
                Annuler
              </button>
              <button
                onClick={envoyerEmail}
                disabled={loadingAction === `envoi_${modal.id}`}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loadingAction === `envoi_${modal.id}` ? <><Spinner /> Envoi...</> : <><Send size={16} /> Envoyer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
