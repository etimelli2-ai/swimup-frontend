import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Mail, Star, ChevronRight, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'https://swimup-backend-production.up.railway.app/api'
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY
const PRIX_UNITAIRE = 4

const TONS = [
  { id: 'enthousiaste', label: 'Enthousiaste', emoji: '🔥' },
  { id: 'naturel',      label: 'Naturel',      emoji: '😊' },
  { id: 'neutre',       label: 'Neutre',        emoji: '😐' },
  { id: 'drole',        label: 'Drôle',         emoji: '😂' },
  { id: 'poetique',     label: 'Poétique',      emoji: '✨' },
  { id: 'severe',       label: 'Sévère',        emoji: '😤' },
]

const TYPES = [
  'Restaurant', 'Hôtel', 'Commerce', 'Artisan / Travaux',
  'Médecin / Santé', 'Beauté / Bien-être', 'Sport / Loisirs', 'Autre',
]

function EtoilesPicker({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-10 h-10 border-2 border-[#1A1A1A] text-lg transition-all ${
            value >= n
              ? 'bg-[#C73E1D] text-white'
              : 'bg-white text-[#1A1A1A] hover:bg-[#F0EDE8]'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

async function genererTexteIA(nom, type, etoiles, ton) {
  try {
    const tonDesc = {
      enthousiaste: 'très enthousiaste et positif',
      naturel: 'naturel et authentique',
      neutre: 'neutre et factuel',
      drole: 'drôle et léger',
      poetique: 'poétique et imagé',
      severe: 'critique et sévère',
    }[ton] || 'naturel'

    const positif = etoiles >= 4
    const negatif = etoiles <= 2

    const prompt = `Écris un avis Google ${positif ? 'positif' : negatif ? 'négatif' : 'mitigé'} en français pour "${nom}" (${type || 'établissement'}). Ton : ${tonDesc}. ${etoiles} étoiles sur 5. 2-3 phrases naturelles. Sans guillemets. Sans introduction. Juste le texte de l'avis.`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Tu génères des avis Google authentiques. UNIQUEMENT le texte, sans guillemets, sans entités HTML.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 1.1,
      }),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim()
      .replace(/^["'«»]|["'«»]$/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'") || ''
  } catch {
    return ''
  }
}

export default function PublicCommander() {
  const [searchParams] = useSearchParams()
  const wasCancelled = searchParams.get('cancel') === '1'

  useEffect(() => {
    document.title = 'Acheter un avis Google Maps — SwimUp | 4€ sans compte'

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = 'Obtenez un vrai avis Google Maps en 24h pour seulement 4€. Sans inscription, paiement sécurisé par Stripe, garantie 30 jours.'

    const metas = [
      { property: 'og:title',       content: 'Acheter un avis Google Maps — SwimUp' },
      { property: 'og:description', content: 'Un vrai avis Google Maps en 24h pour 4€. Sans compte, paiement Stripe, garantie 30 jours.' },
      { property: 'og:url',         content: 'https://swimup.net/commander' },
      { property: 'og:type',        content: 'website' },
    ]
    metas.forEach(({ property, content }) => {
      let el = document.querySelector(`meta[property="${property}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el) }
      el.content = content
    })
  }, [])

  const [form, setForm] = useState({
    email:              '',
    lien_maps:          '',
    nom_etablissement:  '',
    type_etablissement: '',
    type_autre:         '',
    texte_avis:         '',
    nb_etoiles:         5,
    ton:                'naturel',
    quantite:           1,
  })
  const [loading, setLoading]       = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError]           = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const typeEffectif = form.type_etablissement === 'Autre' ? form.type_autre : form.type_etablissement
  const total = form.quantite * PRIX_UNITAIRE

  const handleGenerer = async () => {
    const nom = form.nom_etablissement || 'cet établissement'
    setGenerating(true)
    const texte = await genererTexteIA(nom, typeEffectif, form.nb_etoiles, form.ton)
    if (texte) set('texte_avis', texte)
    else setError('Impossible de générer le texte — réessaie ou écris-le toi-même')
    setGenerating(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.email) return setError('Entre ton adresse email')
    if (!form.lien_maps) return setError('Entre le lien Google Maps')
    if (form.quantite < 1) return setError('Minimum 1 avis')
    if (form.type_etablissement === 'Autre' && !form.type_autre.trim()) {
      return setError('Précise le type d\'établissement')
    }

    setLoading(true)
    try {
      const r = await axios.post(`${API}/stripe/public-checkout`, {
        email:              form.email,
        lien_maps:          form.lien_maps,
        nom_etablissement:  form.nom_etablissement,
        type_etablissement: typeEffectif,
        texte_avis:         form.texte_avis,
        nb_etoiles:         form.nb_etoiles,
        ton:                form.ton,
        quantite:           form.quantite,
      })
      window.location.href = r.data.url
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur — réessaie dans quelques secondes')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1A1A1A]">

      {/* Header */}
      <header className="border-b-2 border-[#1A1A1A] bg-[#F7F5F0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C73E1D] flex items-center justify-center" style={{ transform: 'rotate(3deg)' }}>
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-black text-lg tracking-tight">SwimUp</span>
          </div>
          <a href="/login" className="text-sm underline text-[#1A1A1A]/60 hover:text-[#1A1A1A]">
            J'ai un compte →
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="inline-block bg-[#C73E1D] text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">
            Sans compte · Sans abonnement
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-tight">
            Des avis Google,<br />{PRIX_UNITAIRE}€ pièce, livrés vite.
          </h1>
          <p className="text-[#1A1A1A]/70 text-lg leading-relaxed">
            Tu remplis le formulaire, tu paies, on s'occupe du reste.
            Aucune création de compte. Ton lien de suivi arrive par email.
          </p>

          {/* Garantie */}
          <div className="border-2 border-[#1A1A1A] bg-white p-4">
            <p className="font-bold text-sm">🛡️ Garantie 30 jours</p>
            <p className="text-sm text-[#1A1A1A]/70 mt-1">
              Si un avis est supprimé par Google dans les 30 jours suivant la livraison,
              on le refait gratuitement. Pas de remboursement — on remet un nouvel avis.
            </p>
          </div>
        </motion.div>

        {/* Alerte annulation */}
        {wasCancelled && (
          <div className="border-2 border-[#C73E1D] bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-[#C73E1D] shrink-0 mt-0.5" />
            <p className="text-sm text-[#C73E1D] font-medium">
              Paiement annulé — aucun débit effectué. Tu peux recommencer.
            </p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest">
              Ton adresse email *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
              <input
                type="email"
                placeholder="toi@email.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
                className="w-full border-2 border-[#1A1A1A] bg-white pl-9 pr-4 py-3 text-sm rounded-none focus:outline-none focus:border-[#C73E1D] transition-colors"
              />
            </div>
            <p className="text-xs text-[#1A1A1A]/50">On t'envoie ton lien de suivi ici. C'est tout.</p>
          </div>

          {/* Lien Maps */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest">
              Lien Google Maps de ton établissement *
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
              <input
                type="url"
                placeholder="https://maps.google.com/..."
                value={form.lien_maps}
                onChange={e => set('lien_maps', e.target.value)}
                required
                className="w-full border-2 border-[#1A1A1A] bg-white pl-9 pr-4 py-3 text-sm rounded-none focus:outline-none focus:border-[#C73E1D] transition-colors"
              />
            </div>
            <p className="text-xs text-[#1A1A1A]/50">
              Sur Google Maps → ton établissement → copie l'URL de la page.
            </p>
          </div>

          {/* Nom établissement */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest">
              Nom de l'établissement
            </label>
            <input
              type="text"
              placeholder="Ex: Boulangerie Dupont"
              value={form.nom_etablissement}
              onChange={e => set('nom_etablissement', e.target.value)}
              className="w-full border-2 border-[#1A1A1A] bg-white px-4 py-3 text-sm rounded-none focus:outline-none focus:border-[#C73E1D] transition-colors"
            />
          </div>

          {/* Type établissement */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest">
              Type d'établissement
            </label>
            <select
              value={form.type_etablissement}
              onChange={e => set('type_etablissement', e.target.value)}
              className="w-full border-2 border-[#1A1A1A] bg-white px-4 py-3 text-sm rounded-none focus:outline-none focus:border-[#C73E1D] appearance-none transition-colors"
            >
              <option value="">Sélectionner...</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Champ libre si "Autre" */}
            {form.type_etablissement === 'Autre' && (
              <input
                type="text"
                placeholder="Précise le type d'établissement..."
                value={form.type_autre}
                onChange={e => set('type_autre', e.target.value)}
                className="w-full border-2 border-[#C73E1D] bg-white px-4 py-3 text-sm rounded-none focus:outline-none transition-colors mt-2"
              />
            )}
          </div>

          {/* Note étoiles */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest">
              Note à mettre ({form.nb_etoiles} étoile{form.nb_etoiles > 1 ? 's' : ''})
            </label>
            <EtoilesPicker value={form.nb_etoiles} onChange={v => set('nb_etoiles', v)} />
          </div>

          {/* Ton */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest">
              Ton de l'avis
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TONS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set('ton', t.id)}
                  className={`border-2 border-[#1A1A1A] py-2.5 px-3 text-sm font-medium transition-all text-left ${
                    form.ton === t.id
                      ? 'bg-[#1A1A1A] text-white'
                      : 'bg-white text-[#1A1A1A] hover:bg-[#F0EDE8]'
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Texte personnalisé + bouton générer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-widest">
                Texte de l'avis{' '}
                <span className="font-normal normal-case tracking-normal text-[#1A1A1A]/50">
                  (optionnel)
                </span>
              </label>
              <button
                type="button"
                onClick={handleGenerer}
                disabled={generating}
                className="flex items-center gap-1.5 border-2 border-[#1A1A1A] bg-white px-3 py-1.5 text-xs font-bold hover:bg-[#F0EDE8] transition-colors disabled:opacity-50"
              >
                {generating
                  ? <><Loader2 size={12} className="animate-spin" /> Génération...</>
                  : <><Sparkles size={12} /> Générer avec l'IA</>
                }
              </button>
            </div>
            <textarea
              placeholder="Si tu as un texte précis en tête, mets-le ici. Sinon clique sur Générer ou laisse vide."
              value={form.texte_avis}
              onChange={e => set('texte_avis', e.target.value)}
              rows={4}
              className="w-full border-2 border-[#1A1A1A] bg-white px-4 py-3 text-sm rounded-none focus:outline-none focus:border-[#C73E1D] resize-none transition-colors"
            />
          </div>

          {/* Quantité */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest">
              Nombre d'avis
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('quantite', Math.max(1, form.quantite - 1))}
                className="w-10 h-10 border-2 border-[#1A1A1A] bg-white text-xl font-bold hover:bg-[#F0EDE8] transition-colors flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={form.quantite}
                onChange={e => set('quantite', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 border-2 border-[#1A1A1A] bg-white px-3 py-2 text-center text-lg font-bold rounded-none focus:outline-none focus:border-[#C73E1D]"
              />
              <button
                type="button"
                onClick={() => set('quantite', form.quantite + 1)}
                className="w-10 h-10 border-2 border-[#1A1A1A] bg-white text-xl font-bold hover:bg-[#F0EDE8] transition-colors flex items-center justify-center"
              >
                +
              </button>
              <span className="text-sm text-[#1A1A1A]/60">
                × {PRIX_UNITAIRE}€ = <strong className="text-[#1A1A1A]">{total}€</strong>
              </span>
            </div>
            <p className="text-xs text-[#1A1A1A]/50">
              Chaque avis sera publié par un membre différent. Même texte, différents profils.
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="border-2 border-[#C73E1D] bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-[#C73E1D] shrink-0 mt-0.5" />
              <p className="text-sm text-[#C73E1D] font-medium">{error}</p>
            </div>
          )}

          {/* Récap prix */}
          <div className="border-2 border-[#1A1A1A] bg-white p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">
                {form.quantite} avis Google Map{form.quantite > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-[#1A1A1A]/60">
                Livraison sous 48h · Suivi par email · Garantie 30j
              </p>
            </div>
            <p className="text-3xl font-black">{total}€</p>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C73E1D] text-white border-2 border-[#C73E1D] py-4 font-bold text-base tracking-tight flex items-center justify-center gap-2 hover:bg-[#A8331A] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Redirection vers le paiement...
              </>
            ) : (
              <>
                Payer {total}€ et commander
                <ChevronRight size={18} />
              </>
            )}
          </button>

          <p className="text-center text-xs text-[#1A1A1A]/50">
            Paiement sécurisé par Stripe · Aucun abonnement · Garantie 30 jours
          </p>
        </form>

        {/* FAQ */}
        <div className="border-t-2 border-[#1A1A1A] pt-8 space-y-4">
          <h2 className="font-black text-lg">Questions fréquentes</h2>
          {[
            { q: 'Comment ça marche ?', r: 'Tu paies, un membre de notre réseau publie un vrai avis Google sur ton établissement. Tu reçois un lien de suivi par email.' },
            { q: 'C\'est quoi la garantie 30 jours ?', r: 'Si Google supprime l\'avis dans les 30 jours suivant la livraison, on te refait un nouvel avis gratuitement. Pas de remboursement — on garantit la livraison, pas la pérennité de Google.' },
            { q: 'Pourquoi des avis différents si je commande plusieurs ?', r: 'Chaque avis est publié par un membre différent avec un profil différent. C\'est plus naturel et moins risqué pour toi.' },
            { q: 'Sous combien de temps ?', r: 'En général sous 24-48h selon la disponibilité de nos membres.' },
            { q: 'C\'est quoi la différence avec un compte ?', r: 'Avec un compte tu paies 3€/avis au lieu de 4€, tu as un historique et des notifications.' },
          ].map((f, i) => (
            <div key={i} className="border-2 border-[#1A1A1A] p-4 space-y-1">
              <p className="font-bold text-sm">{f.q}</p>
              <p className="text-sm text-[#1A1A1A]/70">{f.r}</p>
            </div>
          ))}
        </div>

      </main>

      <footer className="border-t-2 border-[#1A1A1A] mt-16 py-6">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between text-xs text-[#1A1A1A]/50">
          <span>© 2025 SwimUp</span>
          <a href="/login" className="underline hover:text-[#1A1A1A]">Espace membres</a>
        </div>
      </footer>
    </div>
  )
}
