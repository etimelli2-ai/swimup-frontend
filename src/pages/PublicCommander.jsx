import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Mail, Star, ChevronRight, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'https://swimup-backend-production.up.railway.app/api'

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

export default function PublicCommander() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const wasCancelled = searchParams.get('cancel') === '1'

  const [form, setForm] = useState({
    email:              '',
    lien_maps:          '',
    nom_etablissement:  '',
    type_etablissement: '',
    texte_avis:         '',
    nb_etoiles:         5,
    ton:                'naturel',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.email)     return setError('Entre ton adresse email')
    if (!form.lien_maps) return setError('Entre le lien Google Maps de ton établissement')

    setLoading(true)
    try {
      const r = await axios.post(`${API}/stripe/public-checkout`, form)
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
            <div
              className="w-8 h-8 bg-[#C73E1D] flex items-center justify-center"
              style={{ transform: 'rotate(3deg)' }}
            >
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
            Un avis Google,<br />4€, livré vite.
          </h1>
          <p className="text-[#1A1A1A]/70 text-lg leading-relaxed">
            Tu remplis le formulaire, tu paies, on s'occupe du reste.
            Aucune création de compte. Ton lien de suivi arrive par email.
          </p>
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
            <label className="block text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
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
            <label className="block text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
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
            <label className="block text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
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
            <label className="block text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
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
          </div>

          {/* Note étoiles */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
              Note à mettre ({form.nb_etoiles} étoile{form.nb_etoiles > 1 ? 's' : ''})
            </label>
            <EtoilesPicker value={form.nb_etoiles} onChange={v => set('nb_etoiles', v)} />
          </div>

          {/* Ton */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
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

          {/* Texte personnalisé */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
              Texte personnalisé <span className="font-normal normal-case tracking-normal text-[#1A1A1A]/50">(optionnel — sinon on génère)</span>
            </label>
            <textarea
              placeholder="Si tu as un texte précis en tête, mets-le ici. Sinon on s'en occupe."
              value={form.texte_avis}
              onChange={e => set('texte_avis', e.target.value)}
              rows={4}
              className="w-full border-2 border-[#1A1A1A] bg-white px-4 py-3 text-sm rounded-none focus:outline-none focus:border-[#C73E1D] resize-none transition-colors"
            />
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
              <p className="font-bold text-lg">1 avis Google Maps</p>
              <p className="text-sm text-[#1A1A1A]/60">Livraison sous 48h · Suivi par email</p>
            </div>
            <p className="text-3xl font-black">4€</p>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C73E1D] text-white border-2 border-[#C73E1D] py-4 font-bold text-base tracking-tight flex items-center justify-center gap-2 hover:bg-[#A8331A] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirection vers le paiement...
              </>
            ) : (
              <>
                Payer et commander — 4€
                <ChevronRight size={18} />
              </>
            )}
          </button>

          <p className="text-center text-xs text-[#1A1A1A]/50">
            Paiement sécurisé par Stripe · Aucun abonnement · Remboursement si non livré
          </p>
        </form>

        {/* FAQ rapide */}
        <div className="border-t-2 border-[#1A1A1A] pt-8 space-y-4">
          <h2 className="font-black text-lg">Questions fréquentes</h2>
          {[
            { q: 'Comment ça marche ?', r: 'Tu paies, un membre de notre réseau publie un vrai avis Google sur ton établissement. Tu reçois un lien de suivi par email.' },
            { q: 'C\'est quoi la différence avec un compte ?', r: 'Avec un compte tu as accès à des tarifs réduits (3€/avis au lieu de 4€) et tu peux commander plusieurs avis à la fois.' },
            { q: 'Sous combien de temps ?', r: 'En général sous 24-48h selon la disponibilité de nos membres.' },
            { q: 'Et si l\'avis est supprimé ?', r: 'On vérifie que l\'avis reste en ligne. Si Google le supprime dans les 30 jours, on te rembourse.' },
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
