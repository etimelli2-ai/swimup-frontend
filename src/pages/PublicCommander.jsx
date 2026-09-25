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

// Sélecteur d'étoiles — icônes pleines Action Blue, sans encadré (grammaire Apple)
function EtoilesPicker({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          className="p-1 active:scale-90 transition-transform"
        >
          <Star
            size={30}
            className={value >= n ? 'text-sky-500 fill-sky-500' : 'text-slate-200 fill-slate-200'}
          />
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
    <div className="min-h-screen bg-white text-slate-900">

      {/* Nav — sticky, noir translucide, grammaire Apple */}
      <header className="sticky top-0 z-20 bg-[#1d1d1f]/95 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center">
              <Star size={12} className="text-white fill-white" />
            </div>
            <span className="text-white text-[15px] font-semibold tracking-tight">SwimUp</span>
          </div>
          <a href="/login" className="text-[13px] text-sky-400 hover:text-sky-300 transition-colors">
            J'ai un compte
          </a>
        </div>
      </header>

      {/* Hero — tuile claire full-bleed */}
      <section className="w-full bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto px-4 pt-16 pb-14 text-center"
        >
          <p className="text-sky-500 text-[13px] font-semibold tracking-wide uppercase mb-4">
            Sans compte · Sans abonnement · Livraison 24h
          </p>
          <h1 className="text-[40px] sm:text-[48px] leading-[1.05] font-semibold tracking-tight text-slate-900">
            Des avis Google Maps<br />authentiques, dès {PRIX_UNITAIRE}€
          </h1>
          <p className="mt-5 text-[19px] leading-relaxed text-slate-500 max-w-xl mx-auto font-light">
            Boostez la réputation de votre établissement avec de vrais avis publiés par des personnes réelles.
            Restaurants, commerces, artisans, hôtels — livraison en 24-48h, sans création de compte.
          </p>

          <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
            <a href="#commander" className="btn-primary px-7 py-3.5 text-[15px]">
              Commander maintenant
            </a>
            <a href="#comment-ca-marche" className="text-sky-500 text-[15px] font-medium hover:underline underline-offset-4">
              Comment ça marche ›
            </a>
          </div>

          {/* Stats — sans encadré, juste de la typographie */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[
              { icon: Users, label: 'Membres actifs', value: '500+' },
              { icon: Star,  label: 'Avis publiés',   value: '2 000+' },
              { icon: Zap,   label: 'Livraison',      value: '24-48h' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-[26px] font-semibold tracking-tight text-slate-900">{s.value}</p>
                <p className="text-[13px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Garantie — bande parchemin */}
      <section className="w-full bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-[17px] text-slate-900">Garantie 30 jours</p>
            <p className="text-[15px] text-slate-500 mt-1 leading-relaxed">
              Si un avis est supprimé par Google dans les 30 jours suivant la livraison,
              on le refait gratuitement. Vous ne payez qu'une seule fois.
            </p>
          </div>
        </div>
      </section>

      {/* Pourquoi SwimUp — tuile sombre full-bleed */}
      <section className="w-full bg-[#1d1d1f] text-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-center">
            Pourquoi acheter des avis Google Maps ?
          </h2>
          <p className="mt-4 text-[17px] text-slate-300 leading-relaxed text-center max-w-xl mx-auto font-light">
            Les avis Google sont aujourd'hui le premier critère de choix des consommateurs.
            Un établissement avec plus d'avis positifs apparaît plus haut dans les résultats Google Maps.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-6">
            {[
              { t: 'Vrais profils Google', d: 'Chaque avis est publié par un vrai membre de notre réseau avec un compte Google actif. Aucun bot, aucun faux compte.' },
              { t: 'Texte personnalisé', d: 'Vous choisissez le contenu de l\'avis, la note et le ton. Notre IA peut aussi générer un texte naturel pour vous.' },
              { t: 'Résultats rapides', d: 'La plupart des avis sont publiés en moins de 24h. Votre réputation s\'améliore immédiatement.' },
              { t: 'Discret et sécurisé', d: 'Paiement 100% sécurisé via Stripe. Aucune donnée sensible stockée. Lien de suivi par email.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[15px] text-white">{item.t}</p>
                  <p className="text-[14px] text-slate-400 mt-0.5 leading-relaxed">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire — tuile claire */}
      <section id="commander" className="w-full bg-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-center mb-10">
            Commander des avis Google Maps
          </h2>

          {wasCancelled && (
            <div className="rounded-xl bg-red-50 p-4 flex items-start gap-3 mb-6">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">
                Paiement annulé — aucun débit effectué. Tu peux recommencer.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">

            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-slate-700">
                Votre adresse email *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="vous@email.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                  className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[13px] text-slate-400">Votre lien de suivi de commande sera envoyé ici.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-slate-700">
                Lien Google Maps de votre établissement *
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={form.lien_maps}
                  onChange={e => set('lien_maps', e.target.value)}
                  required
                  className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[13px] text-slate-400">
                Sur Google Maps → votre établissement → copiez l'URL de la page.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-slate-700">
                Nom de l'établissement
              </label>
              <input
                type="text"
                placeholder="Ex: Restaurant Le Petit Bistro"
                value={form.nom_etablissement}
                onChange={e => set('nom_etablissement', e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-slate-700">
                Type d'établissement
              </label>
              <select
                value={form.type_etablissement}
                onChange={e => set('type_etablissement', e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none transition-all"
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
                  className="w-full rounded-full border border-sky-400 bg-white px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-slate-700">
                Note à attribuer ({form.nb_etoiles} étoile{form.nb_etoiles > 1 ? 's' : ''})
              </label>
              <EtoilesPicker value={form.nb_etoiles} onChange={v => set('nb_etoiles', v)} />
              <p className="text-[13px] text-slate-400">Choisissez la note que le membre devra mettre sur Google.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-slate-700">
                Ton de l'avis
              </label>
              <div className="flex flex-wrap gap-2">
                {TONS.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set('ton', t.id)}
                    className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-all active:scale-95 ${
                      form.ton === t.id
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="block text-[13px] font-semibold text-slate-700">
                  Texte de l'avis <span className="font-normal text-slate-400">(optionnel)</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerer}
                  disabled={generating}
                  className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3.5 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
                >
                  {generating
                    ? <><Loader2 size={12} className="animate-spin" /> Génération...</>
                    : <><Sparkles size={12} className="text-sky-500" /> Générer avec l'IA</>
                  }
                </button>
              </div>
              <textarea
                placeholder="Rédigez votre avis ou cliquez sur Générer avec l'IA pour un texte naturel et authentique."
                value={form.texte_avis}
                onChange={e => set('texte_avis', e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-slate-700">
                Nombre d'avis à commander
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => set('quantite', Math.max(1, form.quantite - 1))}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white text-lg font-medium hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
                >−</button>
                <input
                  type="number"
                  min="1"
                  value={form.quantite}
                  onChange={e => set('quantite', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-[16px] font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => set('quantite', form.quantite + 1)}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white text-lg font-medium hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
                >+</button>
                <span className="text-[14px] text-slate-500">
                  × {PRIX_UNITAIRE}€ = <strong className="text-slate-900 font-semibold">{total}€</strong>
                </span>
              </div>
              <p className="text-[13px] text-slate-400">
                Chaque avis est publié par un membre différent avec un profil Google distinct. Plus naturel, moins risqué.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[17px] text-slate-900">
                  {form.quantite} avis Google Maps
                </p>
                <p className="text-[14px] text-slate-500 mt-0.5">
                  Livraison 24-48h · Suivi par email · Garantie 30 jours
                </p>
              </div>
              <p className="text-[30px] font-semibold tracking-tight text-slate-900">{total}€</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-sky-500 hover:bg-sky-600 text-white py-4 font-medium text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Redirection vers le paiement...</>
              ) : (
                <>Payer {total}€ et commander vos avis Google <ChevronRight size={18} /></>
              )}
            </button>

            <p className="text-center text-[13px] text-slate-400">
              Paiement 100% sécurisé par Stripe · Sans abonnement · Garantie 30 jours · Avis authentiques
            </p>
          </form>
        </div>
      </section>

      {/* Comment ça marche — tuile parchemin */}
      <section id="comment-ca-marche" className="w-full bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-center mb-10">
            Comment acheter des avis Google Maps ?
          </h2>
          <div className="space-y-7">
            {[
              { n: '1', t: 'Remplissez le formulaire', d: 'Indiquez le lien Google Maps de votre établissement, choisissez la note et le ton de l\'avis. Notre IA peut générer un texte naturel à votre place.' },
              { n: '2', t: 'Payez en ligne', d: 'Paiement sécurisé par Stripe. 4€ par avis, sans abonnement. Vous recevez un lien de suivi par email immédiatement après.' },
              { n: '3', t: 'Un membre publie votre avis', d: 'Un vrai membre de notre réseau se charge de publier votre avis Google depuis son compte personnel. Livraison en 24-48h.' },
              { n: '4', t: 'Vérification et garantie', d: 'Nous vérifions que l\'avis est bien publié et reste en ligne. Si Google le supprime dans les 30 jours, nous le republions gratuitement.' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="w-9 h-9 rounded-full bg-sky-500 text-white font-semibold text-[14px] flex items-center justify-center shrink-0">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold text-[16px] text-slate-900">{s.t}</p>
                  <p className="text-[14px] text-slate-500 mt-0.5 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qui utilise SwimUp */}
      <section className="w-full bg-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-center mb-5">
            Qui utilise SwimUp ?
          </h2>
          <p className="text-[16px] text-slate-500 leading-relaxed text-center max-w-xl mx-auto font-light">
            SwimUp est utilisé par des propriétaires de restaurants, hôtels, commerces de proximité, artisans,
            professionnels de santé et bien d'autres établissements qui souhaitent améliorer leur réputation
            sur Google Maps.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {[
              '🍕 Restaurants & Cafés',
              '🏨 Hôtels & Gîtes',
              '🔧 Artisans & Travaux',
              '💇 Beauté & Bien-être',
              '🏥 Médecins & Santé',
              '🛒 Commerces locaux',
            ].map((t, i) => (
              <span key={i} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[14px] font-medium text-slate-700">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — tuile parchemin, sans encadrés, juste des séparateurs fins */}
      <section className="w-full bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-center mb-10">
            Questions fréquentes
          </h2>
          <div className="divide-y divide-slate-200">
            {[
              { q: 'Est-ce que les avis Google achetés sont authentiques ?', r: 'Oui. Chaque avis est publié par un vrai membre de notre réseau depuis son compte Google personnel. Nous n\'utilisons jamais de bots ou de faux comptes.' },
              { q: 'Combien coûte un avis Google Maps ?', r: 'Un avis Google Maps coûte 4€ sans compte. Si vous créez un compte SwimUp, le tarif est réduit à 3€ par avis avec des fonctionnalités supplémentaires.' },
              { q: 'En combien de temps mon avis sera publié ?', r: 'La plupart des avis sont publiés en 24 à 48h selon la disponibilité des membres de notre réseau.' },
              { q: 'Que se passe-t-il si l\'avis est supprimé par Google ?', r: 'SwimUp offre une garantie de 30 jours. Si Google supprime l\'avis dans ce délai, nous le republions gratuitement. Sans remboursement, mais avec un nouvel avis.' },
              { q: 'Puis-je choisir le texte de l\'avis ?', r: 'Oui, vous pouvez rédiger votre propre texte ou utiliser notre générateur IA qui créera un avis naturel et authentique adapté à votre établissement.' },
              { q: 'Comment suivre ma commande ?', r: 'Après le paiement, vous recevez un lien de suivi unique par email. Ce lien vous permet de voir en temps réel l\'avancement de votre commande.' },
              { q: 'Combien d\'avis puis-je commander à la fois ?', r: 'Il n\'y a pas de limite. Vous pouvez commander autant d\'avis que vous souhaitez. Chaque avis est publié par un membre différent pour un résultat plus naturel.' },
            ].map((f, i) => (
              <div key={i} className="py-5">
                <p className="font-semibold text-[15px] text-slate-900">{f.q}</p>
                <p className="text-[14px] text-slate-500 mt-1.5 leading-relaxed">{f.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer — parchemin, fine print, comme apple.com */}
      <footer className="w-full bg-slate-50 border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-2">
          <div className="flex items-center justify-between text-[12px] text-slate-400 flex-wrap gap-2">
            <span>© 2025 SwimUp — Acheter des avis Google Maps authentiques</span>
            <a href="/login" className="text-sky-500 hover:underline">Espace membres</a>
          </div>
          <p className="text-[11px] text-slate-400">
            SwimUp · Avis Google Maps · 4€ par avis · Livraison 24h · Garantie 30 jours · Paiement Stripe sécurisé
          </p>
        </div>
      </footer>
    </div>
  )
}
