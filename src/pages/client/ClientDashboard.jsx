import { useState, useEffect } from 'react'
import api from '../../lib/api'

const PRIX_AVIS = 3

// Fix — nettoyer les entités HTML
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
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

const getPrompts = (nom, type, etoiles) => {
  const nb = parseInt(etoiles) || 5

  if (nb === 1) return [
    () => `Écris un avis Google NÉGATIF en français pour "${nom}" (${type}). Tu es un client très déçu. Parle d'un problème précis : mauvais accueil, attente excessive, qualité médiocre, personnel désagréable. Style naturel et frustré, 2-3 phrases. Pas de majuscules excessives. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Tu laisses un avis 1 étoile sur Google pour "${nom}" (${type}). Tu es déçu et tu le fais savoir calmement mais clairement. Mentionne ce qui ne t'a pas plu avec un détail concret. 2 phrases max. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Avis Google 1 étoile pour "${nom}" (${type}). Client mécontent qui ne reviendra pas. Sois direct et concis sur ce qui n'allait pas. Style naturel, pas agressif. 2-3 phrases. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Rédige un avis négatif authentique pour "${nom}" (${type}). Déception par rapport aux attentes. Mentionne un point précis et négatif lié au ${type}. 2 phrases. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Avis 1 étoile pour "${nom}" (${type}). Tu décris une mauvaise expérience de façon honnête et posée. Pas d'insultes. Un détail négatif spécifique. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
  ]

  if (nb === 2) return [
    () => `Écris un avis 2 étoiles en français pour "${nom}" (${type}). Pas catastrophique mais décevant. Mentionne 1 point positif et 1-2 points négatifs. Style honnête, 2-3 phrases. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Avis Google 2 étoiles pour "${nom}" (${type}). Client mitigé plutôt déçu. Quelque chose de bien mais trop de défauts. 2-3 phrases naturelles. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Tu laisses 2 étoiles à "${nom}" (${type}). L'expérience était en dessous des attentes sans être terrible. Explique pourquoi en 2 phrases. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Rédige un avis 2 étoiles pour "${nom}" (${type}). Déception modérée avec une nuance positive. 2-3 phrases simples. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Avis 2 étoiles authentique pour "${nom}" (${type}). Ni excellent ni horrible. Souligne ce qui déçoit principalement. 2 phrases. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
  ]

  if (nb === 3) return [
    () => `Écris un avis 3 étoiles en français pour "${nom}" (${type}). Expérience correcte mais sans plus. Équilibre entre points positifs et négatifs. Style neutre et honnête, 2-3 phrases. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Avis Google 3 étoiles pour "${nom}" (${type}). Ni déçu ni emballé. Quelques bons points et quelques moins bons. 2-3 phrases naturelles. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Tu laisses 3 étoiles à "${nom}" (${type}). C'était moyen. Quelque chose de bien et quelque chose de perfectible. 2 phrases simples. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Rédige un avis mitigé pour "${nom}" (${type}). Expérience dans la moyenne. 1 point positif, 1 point à améliorer. 2-3 phrases. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Avis 3 étoiles honnête pour "${nom}" (${type}). Correct sans être exceptionnel. Mentionne un détail concret positif et un négatif. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
  ]

  if (nb === 4) return [
    () => `Écris un avis 4 étoiles en français pour "${nom}" (${type}). Très bonne expérience avec un petit bémol. Principalement positif mais pas parfait. 2-3 phrases naturelles. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Avis Google 4 étoiles pour "${nom}" (${type}). Client satisfait mais avec une petite réserve. Surtout positif, un léger point à améliorer. 2-3 phrases. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Tu laisses 4 étoiles à "${nom}" (${type}). Très bien dans l'ensemble avec juste un petit détail moins bien. 2 phrases simples et naturelles. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Rédige un avis 4 étoiles pour "${nom}" (${type}). Expérience réussie avec une légère imperfection. Style chaleureux et honnête. 2-3 phrases. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
    () => `Avis 4 étoiles authentique pour "${nom}" (${type}). Très satisfait sans être parfait. Mentionne ce qui était bien et un tout petit bémol. Réponds UNIQUEMENT avec le texte de l'avis, sans guillemets.`,
  ]

  // 5 étoiles
  return [
    () => `Écris un avis Google 5 étoiles enthousiaste en français pour "${nom}" (${type}). Client ravi. Mentionne un détail spécifique positif. Style décontracté, 2-3 phrases. PAS de guillemets. Réponds UNIQUEMENT avec le texte de l'avis.`,
    () => `Avis 5 étoiles authentique pour "${nom}" (${type}). Raconte une mini-anecdote personnelle positive en 2-3 phrases. Naturel, expressions françaises du quotidien. PAS de guillemets. Réponds UNIQUEMENT avec le texte de l'avis.`,
    () => `Court avis 5 étoiles pour "${nom}" (${type}). 2 phrases maximum. Style naturel comme si tu écrivais depuis ton téléphone. Très positif et précis. PAS de guillemets. Réponds UNIQUEMENT avec le texte de l'avis.`,
    () => `Avis 5 étoiles détaillé pour "${nom}" (${type}). 4-5 phrases. Pourquoi tu es venu, ce qui t'a surpris positivement, un détail concret. Ton naturel et sincère. PAS de guillemets. Réponds UNIQUEMENT avec le texte de l'avis.`,
    () => `Avis 5 étoiles percutant pour "${nom}" (${type}). 1-2 phrases mémorables et précises. Pas de guillemets. Réponds UNIQUEMENT avec le texte de l'avis.`,
    () => `Avis 5 étoiles chaleureux pour "${nom}" (${type}). Comme si tu en parlais à un ami. 3 phrases, ton conversationnel. PAS de guillemets. Réponds UNIQUEMENT avec le texte de l'avis.`,
    () => `Avis 5 étoiles de quelqu'un qui était sceptique au départ mais agréablement surpris par "${nom}" (${type}). 3-4 phrases. Crédible et naturel. PAS de guillemets. Réponds UNIQUEMENT avec le texte de l'avis.`,
    () => `Avis 5 étoiles d'un habitué de "${nom}" (${type}). Mentionne que ce n'est pas la première fois. 2-3 phrases. PAS de guillemets. Réponds UNIQUEMENT avec le texte de l'avis.`,
    () => `Avis 5 étoiles spontané pour "${nom}" (${type}). Commence par une réaction émotionnelle. 2 phrases max. Très naturel. PAS de guillemets. Réponds UNIQUEMENT avec le texte de l'avis.`,
    () => `Avis 5 étoiles pour "${nom}" (${type}). Simple, direct, authentique. 2 phrases. PAS de guillemets. Réponds UNIQUEMENT avec le texte de l'avis.`,
  ]
}

async function genererTexteIA(nomEtablissement, typeEtablissement, index, etoiles) {
  try {
    const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY
    const prompts = getPrompts(nomEtablissement, typeEtablissement || 'établissement', etoiles)
    const prompt = prompts[index % prompts.length]()

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Tu génères des avis Google authentiques en français. Tu écris UNIQUEMENT le texte de l\'avis, sans guillemets, sans introduction, sans explication, sans entités HTML. Utilise des apostrophes normales, pas d\'entités HTML.',
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 1.2,
        top_p: 0.95,
      }),
    })
    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content?.trim() || ''
    // Fix — nettoyer le texte généré par l'IA
    return cleanText(raw).replace(/^["'«»]|["'«»]$/g, '')
  } catch {
    return ''
  }
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

export default function ClientDashboard() {
  const [avis, setAvis]             = useState([])
  const [stats, setStats]           = useState(null)
  const [notifs, setNotifs]         = useState([])
  const [show, setShow]             = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [msg, setMsg]               = useState(null)
  const [generating, setGen]        = useState(false)
  const [genProgress, setGenProg]   = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    nom_etablissement:  '',
    type_etablissement: '',
    lien_maps:          '',
    textes:             [''],
    delai_paiement:     '30',
    nb_etoiles:         '5',
    quantite:           '1',
  })

  const load = async () => {
    const [a, s, n] = await Promise.all([
      api.get('/client/avis'),
      api.get('/client/stats'),
      api.get('/client/notifications'),
    ])
    setAvis(a.data)
    setStats(s.data)
    setNotifs(n.data)
  }

  useEffect(() => { load() }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const marquerLues = async () => {
    await api.put('/client/notifications/lire')
    setNotifs(n => n.map(x => ({ ...x, lu: 1 })))
  }

  const genererTousIA = async () => {
    if (!form.nom_etablissement) return showMsg('error', 'Entre d\'abord le nom de l\'établissement')
    const quantite = parseInt(form.quantite) || 1
    setGen(true)
    setGenProg(0)

    const textes = []
    for (let i = 0; i < quantite; i += 5) {
      const batch = []
      for (let j = i; j < Math.min(i + 5, quantite); j++) {
        batch.push(genererTexteIA(form.nom_etablissement, form.type_etablissement, j, form.nb_etoiles))
      }
      const results = await Promise.all(batch)
      textes.push(...results.map(t => t || ''))
      setGenProg(Math.round((Math.min(i + 5, quantite) / quantite) * 100))
    }

    setForm(p => ({ ...p, textes }))
    showMsg('success', `${quantite} textes générés ✨`)
    setGen(false)
  }

  const updateTexte = (index, value) => {
    const newTextes = [...form.textes]
    newTextes[index] = value
    setForm(p => ({ ...p, textes: newTextes }))
  }

  const updateQuantite = (val) => {
    const q = parseInt(val) || 1
    const textes = Array.from({ length: q }, (_, i) => form.textes[i] || '')
    setForm(p => ({ ...p, quantite: val, textes }))
  }

  const ajouter = async () => {
    if (submitting) return
    if (!form.lien_maps) return showMsg('error', 'Lien Google Maps requis')
    const quantite = parseInt(form.quantite) || 1
    if (form.textes.some(t => !t.trim())) return showMsg('error', 'Tous les textes doivent être remplis')

    setSubmitting(true)
    let added = 0
    let lastError = null

    for (let i = 0; i < quantite; i++) {
      try {
        await api.post('/client/avis', {
          lien_maps:        form.lien_maps,
          texte:            form.textes[i],
          delai_paiement:   form.delai_paiement,
          nb_etoiles:       parseInt(form.nb_etoiles),
          nom_etablissement: form.nom_etablissement,
        })
        added++
      } catch (e) {
        lastError = e.response?.data?.error || 'Erreur'
        break
      }
    }

    if (added > 0) {
      showMsg('success', `${added} avis commandé${added > 1 ? 's' : ''} ! Coût : ${added * PRIX_AVIS}€`)
      setForm({ nom_etablissement: '', type_etablissement: '', lien_maps: '', textes: [''], delai_paiement: '30', nb_etoiles: '5', quantite: '1' })
      setShow(false)
      load()
    } else {
      showMsg('error', lastError || 'Erreur')
    }
    setSubmitting(false)
  }

  const supprimer = async id => {
    if (!confirm('Supprimer cet avis ?')) return
    await api.delete(`/client/avis/${id}`)
    load()
  }

  const etoilesLabel = n => {
    const nb = parseInt(n) || 5
    return { 1: '😡 Très mauvais', 2: '😞 Mauvais', 3: '😐 Moyen', 4: '😊 Bien', 5: '🤩 Excellent' }[nb] || 'Excellent'
  }

  const etoilesDisplay = n => {
    const nb = parseInt(n) || 5
    return '⭐'.repeat(nb)
  }

  const statutBadge = s => ({
    disponible:      <span className="badge-blue">En attente</span>,
    reserve:         <span className="badge-yellow">En cours</span>,
    en_verification: <span className="badge-yellow">Vérification</span>,
    valide:          <span className="badge-green">Validé ✓</span>,
    refuse:          <span className="badge-red">Refusé</span>,
    paye:            <span className="badge-green">Payé 💸</span>,
  }[s])

  const quantite = parseInt(form.quantite) || 1
  const total = quantite * PRIX_AVIS
  const notifsNonLues = notifs.filter(n => !n.lu).length

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold dark:text-white">Mes avis</h2>
        <div className="flex gap-2">
          <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) marquerLues() }}
            className="relative p-2 bg-gray-100 dark:bg-slate-700 rounded-xl">
            🔔
            {notifsNonLues > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {notifsNonLues}
              </span>
            )}
          </button>
          <button onClick={() => setShow(!show)}
            className="bg-sky-500 text-white px-4 py-2 rounded-xl font-medium text-sm">
            + Commander
          </button>
        </div>
      </div>

      {showNotifs && (
        <div className="card space-y-2">
          <h3 className="font-bold dark:text-white">🔔 Notifications</h3>
          {notifs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucune notification</p>
          ) : notifs.map(n => (
            <div key={n.id} className={`rounded-xl p-3 ${n.lu ? 'bg-gray-50 dark:bg-slate-700' : 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800'}`}>
              <p className="text-sm font-semibold dark:text-white">{n.titre}</p>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Total avis</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-700 dark:text-green-400">{stats.valides}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Validés</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{stats.enCours}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">En cours</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-red-700 dark:text-red-400">{(stats.aPayerTotal || 0).toFixed(2)}€</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">À payer</p>
          </div>
        </div>
      )}

      {stats?.aPayerTotal > 0 && !stats?.paiementValide && stats?.bloquerSiDette && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
          <p className="text-sm font-bold text-orange-700 dark:text-orange-400">⚠️ Compte bloqué</p>
          <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
            Tu as une dette de <strong>{stats.aPayerTotal.toFixed(2)}€</strong>. Contacte l'admin pour débloquer.
          </p>
        </div>
      )}

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {show && (
        <div className="card space-y-3 border-2 border-sky-200 dark:border-sky-800">
          <div className="flex items-center justify-between">
            <h3 className="font-bold dark:text-white">Commander des avis</h3>
            <span className="text-sm font-bold text-sky-500">{PRIX_AVIS}€/avis</span>
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">Nom de l'établissement</label>
            <input className="input" placeholder="Ex: Restaurant Le Petit Bistro"
              value={form.nom_etablissement}
              onChange={e => setForm(p => ({ ...p, nom_etablissement: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">Type d'établissement</label>
            <input className="input" placeholder="Ex: restaurant, hôtel, couvreur..."
              value={form.type_etablissement}
              onChange={e => setForm(p => ({ ...p, type_etablissement: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">Lien Google Maps</label>
            <input className="input" placeholder="https://maps.google.com/..."
              value={form.lien_maps}
              onChange={e => setForm(p => ({ ...p, lien_maps: e.target.value }))} />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">Nombre d'étoiles</label>
              <select className="input" value={form.nb_etoiles}
                onChange={e => setForm(p => ({ ...p, nb_etoiles: e.target.value, textes: Array.from({ length: parseInt(p.quantite) || 1 }, () => '') }))}>
                <option value="1">⭐ 1 — 😡 Très mauvais</option>
                <option value="2">⭐⭐ 2 — 😞 Mauvais</option>
                <option value="3">⭐⭐⭐ 3 — 😐 Moyen</option>
                <option value="4">⭐⭐⭐⭐ 4 — 😊 Bien</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 — 🤩 Excellent</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">Quantité</label>
              <input className="input" type="number" min="1" max="50"
                value={form.quantite}
                onChange={e => updateQuantite(e.target.value)} />
            </div>
          </div>

          <div className={`rounded-xl p-3 text-center ${
            parseInt(form.nb_etoiles) <= 2 ? 'bg-red-50 dark:bg-red-900/20 border border-red-200' :
            parseInt(form.nb_etoiles) === 3 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200' :
            'bg-green-50 dark:bg-green-900/20 border border-green-200'
          }`}>
            <p className="text-2xl">{etoilesDisplay(form.nb_etoiles)}</p>
            <p className={`text-sm font-medium mt-1 ${
              parseInt(form.nb_etoiles) <= 2 ? 'text-red-600' :
              parseInt(form.nb_etoiles) === 3 ? 'text-yellow-600' : 'text-green-600'
            }`}>{etoilesLabel(form.nb_etoiles)}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">L'IA va générer des textes adaptés</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">Délai paiement rédacteur (jours)</label>
            <input className="input" type="number" placeholder="30"
              value={form.delai_paiement}
              onChange={e => setForm(p => ({ ...p, delai_paiement: e.target.value }))} />
          </div>

          <button onClick={genererTousIA} disabled={generating}
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {generating
              ? <><Spinner /> Génération... {genProgress}%</>
              : `✨ Générer ${quantite} texte${quantite > 1 ? 's' : ''} IA (${parseInt(form.nb_etoiles)}⭐)`
            }
          </button>

          {generating && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${genProgress}%` }} />
            </div>
          )}

          {form.textes.map((texte, i) => (
            <div key={i}>
              <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">
                Texte avis {quantite > 1 ? `#${i + 1}` : ''} {etoilesDisplay(form.nb_etoiles)}
              </label>
              <textarea className="input min-h-[80px]"
                placeholder="Texte généré par IA ou saisi manuellement..."
                value={texte}
                onChange={e => updateTexte(i, e.target.value)} />
            </div>
          ))}

          <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3">
            <p className="text-sm text-sky-700 dark:text-sky-400 font-medium">
              💰 Total : <strong>{total}€</strong> pour {quantite} avis
            </p>
          </div>

          <button className="w-full bg-sky-500 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            onClick={ajouter} disabled={submitting}>
            {submitting ? <><Spinner /> Commande en cours...</> : `Commander ${quantite} avis — ${total}€`}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {avis.map(a => (
          <div key={a.id} className="card space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{a.lien_maps}</p>
                {/* Fix — nettoyer le texte affiché */}
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate mt-0.5">
                  {cleanText(a.texte)?.slice(0, 60)}...
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  {'⭐'.repeat(parseInt(a.nb_etoiles) || 5)} · Délai : {a.delai_paiement}j
                  {a.membre_email && ` · ${a.membre_email}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {statutBadge(a.statut)}
                {a.statut === 'disponible' && (
                  <button onClick={() => supprimer(a.id)} className="text-red-400 text-xs">
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {avis.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-gray-500 dark:text-slate-400 font-medium">Aucun avis commandé</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Clique sur + Commander pour commencer</p>
          </div>
        )}
      </div>
    </div>
  )
}
