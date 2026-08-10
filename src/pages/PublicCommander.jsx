import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapPin, Mail, Star, ChevronRight, AlertCircle, Loader2, Sparkles, CheckCircle2, Users, Zap, Shield } from 'lucide-react'
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
    document.title = 'Acheter des avis Google Maps authentiques — SwimUp | 4€ sans compte'

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = 'Achetez de vrais avis Google Maps en 24h à partir de 4€. Sans inscription, sans abonnement. Paiement sécurisé Stripe, garantie 30 jours. Plus de 500 avis publiés pour des restaurants, commerces, artisans.'

    const ogMetas = [
      { property: 'og:title',       content: 'Acheter des avis Google Maps — SwimUp | 4€ pièce' },
      { property: 'og:description', content: 'Vrais avis Google Maps en 24h pour 4€. Sans compte, paiement Stripe, garantie 30 jours.' },
      { property: 'og:url',         content: 'https://swimup.net/commander' },
      { property: 'og:type',        content: 'website' },
    ]
    ogMetas.forEach(({ property, content }) => {
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
      return setError("Précise le type d'établissement")
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
            Sans compte · Sans abonnement · Livraison 24h
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-tight">
            Achetez des avis Google Maps<br />
            <span className="text-[#C73E1D]">authentiques à {PRIX_UNITAIRE}€</span>
          </h1>
          <p className="text-[#1A1A1A]/70 text-lg leading-relaxed">
            Boostez la réputation de votre établissement avec de vrais avis Google Maps publiés par des personnes réelles.
            Restaurants, commerces, artisans, hôtels — livraison en 24-48h, sans création de compte.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: 'Membres actifs', value: '500+' },
              { icon: Star, label: 'Avis publiés', value: '2 000+' },
              { icon: Zap, label: 'Livraison', value: '24-48h' },
            ].map((s, i) => (
              <div key={i} className="border-2 border-[#1A1A1A] bg-white p-3 text-center">
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-xs text-[#1A1A1A]/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Garantie */}
          <div className="border-2 border-[#1A1A1A] bg-white p-4 flex items-start gap-3">
            <Shield size={20} className="text-[#C73E1D] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Garantie 30 jours</p>
              <p className="text-sm text-[#1A1A1A]/70 mt-1">
                Si un avis est supprimé par Google dans les 30 jours suivant la livraison,
                on le refait gratuitement. Vous ne payez qu'une seule fois.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pourquoi SwimUp — Section SEO */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight">
            Pourquoi acheter des avis Google Maps ?
          </h2>
          <p className="text-[#1A1A1A]/70 leading-relaxed">
            Les avis Google sont aujourd'hui le premier critère de choix des consommateurs. Un établissement avec plus d'avis positifs apparaît plus haut dans les résultats Google Maps et attire davantage de clients. SwimUp vous permet d'obtenir des avis Google authentiques rapidement, sans risque.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {[
              { t: 'Vrais profils Google', d: 'Chaque avis est publié par un vrai membre de notre réseau avec un compte Google actif. Aucun bot, aucun faux compte.' },
              { t: 'Texte personnalisé', d: 'Vous choisissez le contenu de l\'avis, la note et le ton. Notre IA peut aussi générer un texte naturel pour vous.' },
              { t: 'Résultats rapides', d: 'La plupart des avis sont publiés en moins de 24h. Votre réputation s\'améliore immédiatement.' },
              { t: 'Discret et sécurisé', d: 'Paiement 100% sécurisé via Stripe. Aucune donnée sensible stockée. Lien de suivi par email.' },
            ].map((item, i) => (
              <div key={i} className="border-2 border-[#1A1A1A] bg-white p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#C73E1D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">{item.t}</p>
                  <p className="text-sm text-[#1A1A1A]/70 mt-0.5">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Annulation */}
        {wasCancelled && (
          <div className="border-2 border-[#C73E1D] bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-[#C73E1D] shrink-0 mt-0.5" />
            <p className="text-sm text-[#C73E1D] font-medium">
              Paiement annulé — aucun débit effectué. Tu peux recommencer.
            </p>
          </div>
        )}

        {/* Formulaire */}
        <section>
          <h2 className="text-2xl font-black tracking-tight mb-6">Commander des avis Google Maps</h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest">
                Votre adresse email *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
                <input
                  type="email"
                  placeholder="vous@email.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                  className="w-full border-2 border-[#1A1A1A] bg-white pl-9 pr-4 py-3 text-sm rounded-none focus:outline-none focus:border-[#C73E1D] transition-colors"
                />
              </div>
              <p className="text-xs text-[#1A1A1A]/50">Votre lien de suivi de commande sera envoyé ici.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest">
                Lien Google Maps de votre établissement *
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
                Sur Google Maps → votre établissement → copiez l'URL de la page.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest">
                Nom de l'établissement
              </label>
              <input
                type="text"
                placeholder="Ex: Restaurant Le Petit Bistro"
                value={form.nom_etablissement}
                onChange={e => set('nom_etablissement', e.target.value)}
                className="w-full border-2 border-[#1A1A1A] bg-white px-4 py-3 text-sm rounded-none focus:outline-none focus:border-[#C73E1D] transition-colors"
              />
            </div>

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
              {form.type_etablissement === 'Autre' && (
                <input
                  type="text"
                  placeholder="Précisez le type d'établissement..."
                  value={form.type_autre}
                  onChange={e => set('type_autre', e.target.value)}
                  className="w-full border-2 border-[#C73E1D] bg-white px-4 py-3 text-sm rounded-none focus:outline-none transition-colors mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest">
                Note à attribuer ({form.nb_etoiles} étoile{form.nb_etoiles > 1 ? 's' : ''})
              </label>
              <EtoilesPicker value={form.nb_etoiles} onChange={v => set('nb_etoiles', v)} />
              <p className="text-xs text-[#1A1A1A]/50">Choisissez la note que le membre devra mettre sur Google.</p>
            </div>

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
                placeholder="Rédigez votre avis ou cliquez sur Générer avec l'IA pour un texte naturel et authentique."
                value={form.texte_avis}
                onChange={e => set('texte_avis', e.target.value)}
                rows={4}
                className="w-full border-2 border-[#1A1A1A] bg-white px-4 py-3 text-sm rounded-none focus:outline-none focus:border-[#C73E1D] resize-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest">
                Nombre d'avis à commander
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => set('quantite', Math.max(1, form.quantite - 1))}
                  className="w-10 h-10 border-2 border-[#1A1A1A] bg-white text-xl font-bold hover:bg-[#F0EDE8] transition-colors flex items-center justify-center"
                >−</button>
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
                >+</button>
                <span className="text-sm text-[#1A1A1A]/60">
                  × {PRIX_UNITAIRE}€ = <strong className="text-[#1A1A1A]">{total}€</strong>
                </span>
              </div>
              <p className="text-xs text-[#1A1A1A]/50">
                Chaque avis est publié par un membre différent avec un profil Google distinct. Plus naturel, moins risqué.
              </p>
            </div>

            {error && (
              <div className="border-2 border-[#C73E1D] bg-red-50 p-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-[#C73E1D] shrink-0 mt-0.5" />
                <p className="text-sm text-[#C73E1D] font-medium">{error}</p>
              </div>
            )}

            <div className="border-2 border-[#1A1A1A] bg-white p-5 flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">
                  {form.quantite} avis Google Maps{form.quantite > 1 ? '' : ''}
                </p>
                <p className="text-sm text-[#1A1A1A]/60">
                  Livraison 24-48h · Suivi par email · Garantie 30 jours
                </p>
              </div>
              <p className="text-3xl font-black">{total}€</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C73E1D] text-white border-2 border-[#C73E1D] py-4 font-bold text-base tracking-tight flex items-center justify-center gap-2 hover:bg-[#A8331A] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Redirection vers le paiement...</>
              ) : (
                <>Payer {total}€ et commander vos avis Google <ChevronRight size={18} /></>
              )}
            </button>

            <p className="text-center text-xs text-[#1A1A1A]/50">
              Paiement 100% sécurisé par Stripe · Sans abonnement · Garantie 30 jours · Avis authentiques
            </p>
          </form>
        </section>

        {/* Comment ça marche — Section SEO */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight">Comment acheter des avis Google Maps ?</h2>
          <div className="space-y-3">
            {[
              { n: '1', t: 'Remplissez le formulaire', d: 'Indiquez le lien Google Maps de votre établissement, choisissez la note et le ton de l\'avis. Notre IA peut générer un texte naturel à votre place.' },
              { n: '2', t: 'Payez en ligne', d: 'Paiement sécurisé par Stripe. 4€ par avis, sans abonnement. Vous recevez un lien de suivi par email immédiatement après.' },
              { n: '3', t: 'Un membre publie votre avis', d: 'Un vrai membre de notre réseau se charge de publier votre avis Google depuis son compte personnel. Livraison en 24-48h.' },
              { n: '4', t: 'Vérification et garantie', d: 'Nous vérifions que l\'avis est bien publié et reste en ligne. Si Google le supprime dans les 30 jours, nous le republions gratuitement.' },
            ].map((s, i) => (
              <div key={i} className="border-2 border-[#1A1A1A] bg-white p-4 flex items-start gap-4">
                <span className="w-8 h-8 bg-[#C73E1D] text-white font-black text-sm flex items-center justify-center shrink-0">
                  {s.n}
                </span>
                <div>
                  <p className="font-bold text-sm">{s.t}</p>
                  <p className="text-sm text-[#1A1A1A]/70 mt-0.5">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Qui utilise SwimUp — Section SEO */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight">Qui utilise SwimUp ?</h2>
          <p className="text-[#1A1A1A]/70 leading-relaxed">
            SwimUp est utilisé par des propriétaires de restaurants, hôtels, commerces de proximité, artisans, professionnels de santé et bien d'autres établissements qui souhaitent améliorer leur réputation sur Google Maps. Nos avis Google sont publiés par des personnes réelles et permettent d'augmenter votre note globale et d'attirer de nouveaux clients.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              '🍕 Restaurants & Cafés',
              '🏨 Hôtels & Gîtes',
              '🔧 Artisans & Travaux',
              '💇 Beauté & Bien-être',
              '🏥 Médecins & Santé',
              '🛒 Commerces locaux',
            ].map((t, i) => (
              <div key={i} className="border-2 border-[#1A1A1A] bg-white px-3 py-2 text-sm font-medium">
                {t}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t-2 border-[#1A1A1A] pt-8 space-y-4">
          <h2 className="text-2xl font-black tracking-tight">Questions fréquentes</h2>
          {[
            { q: 'Est-ce que les avis Google achetés sont authentiques ?', r: 'Oui. Chaque avis est publié par un vrai membre de notre réseau depuis son compte Google personnel. Nous n\'utilisons jamais de bots ou de faux comptes.' },
            { q: 'Combien coûte un avis Google Maps ?', r: 'Un avis Google Maps coûte 4€ sans compte. Si vous créez un compte SwimUp, le tarif est réduit à 3€ par avis avec des fonctionnalités supplémentaires.' },
            { q: 'En combien de temps mon avis sera publié ?', r: 'La plupart des avis sont publiés en 24 à 48h selon la disponibilité des membres de notre réseau.' },
            { q: 'Que se passe-t-il si l\'avis est supprimé par Google ?', r: 'SwimUp offre une garantie de 30 jours. Si Google supprime l\'avis dans ce délai, nous le republions gratuitement. Sans remboursement, mais avec un nouvel avis.' },
            { q: 'Puis-je choisir le texte de l\'avis ?', r: 'Oui, vous pouvez rédiger votre propre texte ou utiliser notre générateur IA qui créera un avis naturel et authentique adapté à votre établissement.' },
            { q: 'Comment suivre ma commande ?', r: 'Après le paiement, vous recevez un lien de suivi unique par email. Ce lien vous permet de voir en temps réel l\'avancement de votre commande.' },
            { q: 'Combien d\'avis puis-je commander à la fois ?', r: 'Il n\'y a pas de limite. Vous pouvez commander autant d\'avis que vous souhaitez. Chaque avis est publié par un membre différent pour un résultat plus naturel.' },
          ].map((f, i) => (
            <div key={i} className="border-2 border-[#1A1A1A] bg-white p-4 space-y-1">
              <p className="font-bold text-sm">{f.q}</p>
              <p className="text-sm text-[#1A1A1A]/70">{f.r}</p>
            </div>
          ))}
        </section>

      </main>

      <footer className="border-t-2 border-[#1A1A1A] mt-16 py-6">
        <div className="max-w-2xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#1A1A1A]/50">
            <span>© 2025 SwimUp — Acheter des avis Google Maps authentiques</span>
            <a href="/login" className="underline hover:text-[#1A1A1A]">Espace membres</a>
          </div>
          <p className="text-xs text-[#1A1A1A]/40">
            SwimUp · Avis Google Maps · 4€ par avis · Livraison 24h · Garantie 30 jours · Paiement Stripe sécurisé
          </p>
        </div>
      </footer>
    </div>
  )
}
