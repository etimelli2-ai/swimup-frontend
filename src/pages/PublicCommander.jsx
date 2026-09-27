import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronRight, AlertCircle, Loader2, CheckCircle2, Users, Star, Zap, Shield, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'https://swimup-backend-production.up.railway.app/api'
const PRIX_UNITAIRE = 4

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

  const [quantite, setQuantite] = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const total = quantite * PRIX_UNITAIRE

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const r = await axios.post(`${API}/stripe/public-checkout`, { quantite })
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
              { t: 'Texte personnalisé', d: 'Une fois payé, vous choisissez le contenu de l\'avis, la note et le ton. Notre IA peut aussi générer un texte naturel pour vous.' },
              { t: 'Résultats rapides', d: 'La plupart des avis sont publiés en moins de 24h après réception de vos informations. Votre réputation s\'améliore immédiatement.' },
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

      {/* Formulaire — tuile claire, réduit au strict minimum avant paiement */}
      <section id="commander" className="w-full bg-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-center mb-3">
            Commander des avis Google Maps
          </h2>
          <p className="text-[15px] text-slate-500 text-center mb-10">
            Choisissez juste le nombre d'avis — vous détaillerez votre établissement juste après le paiement.
          </p>

          {wasCancelled && (
            <div className="rounded-xl bg-red-50 p-4 flex items-start gap-3 mb-6">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">
                Paiement annulé — aucun débit effectué. Tu peux recommencer.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 space-y-6">
              <div className="space-y-2 text-center">
                <label className="block text-[13px] font-semibold text-slate-700">
                  Nombre d'avis à commander
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantite(Math.max(1, quantite - 1))}
                    className="w-11 h-11 rounded-full border border-slate-200 bg-white text-lg font-medium hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
                  >−</button>
                  <input
                    type="number"
                    min="1"
                    value={quantite}
                    onChange={e => setQuantite(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-center text-[20px] font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantite(quantite + 1)}
                    className="w-11 h-11 rounded-full border border-slate-200 bg-white text-lg font-medium hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
                  >+</button>
                </div>
                <p className="text-[13px] text-slate-400">
                  Chaque avis est publié par un membre différent avec un profil Google distinct.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-slate-200 p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[16px] text-slate-900">
                    {quantite} avis Google Maps
                  </p>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    {quantite} × {PRIX_UNITAIRE}€ · Livraison 24-48h · Garantie 30 jours
                  </p>
                </div>
                <p className="text-[28px] font-semibold tracking-tight text-slate-900">{total}€</p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-sky-500 hover:bg-sky-600 text-white py-4 font-medium text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Redirection vers le paiement...</>
              ) : (
                <>Payer {total}€ et commander {quantite > 1 ? `${quantite} avis` : '1 avis'} <ChevronRight size={18} /></>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-4 py-2.5 w-fit mx-auto">
              <Lock size={14} className="text-slate-500" />
              <span className="text-[13px] font-medium text-slate-600">Paiement 100% sécurisé par Stripe</span>
            </div>
            <p className="text-center text-[13px] text-slate-400">
              Sans abonnement · Garantie 30 jours · Avis authentiques
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
              { n: '1', t: 'Choisissez le nombre d\'avis et payez', d: 'Un seul champ avant paiement : combien d\'avis vous voulez. Paiement sécurisé par Stripe, 4€ par avis, sans abonnement.' },
              { n: '2', t: 'Complétez les infos juste après', d: 'Une fois payé, indiquez le lien Google Maps de votre établissement, la note et le ton souhaités. Notre IA peut générer le texte à votre place.' },
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
              { q: 'Pourquoi le formulaire ne demande que la quantité ?', r: 'On ne veut pas vous faire remplir des détails avant même de savoir si vous voulez commander. Vous payez d\'abord, puis vous complétez les infos de votre établissement (lien Maps, note, ton, texte) directement depuis votre page de suivi.' },
              { q: 'En combien de temps mon avis sera publié ?', r: 'La plupart des avis sont publiés en 24 à 48h après que vous ayez complété les infos, selon la disponibilité des membres de notre réseau.' },
              { q: 'Que se passe-t-il si l\'avis est supprimé par Google ?', r: 'SwimUp offre une garantie de 30 jours. Si Google supprime l\'avis dans ce délai, nous le republions gratuitement. Sans remboursement, mais avec un nouvel avis.' },
              { q: 'Puis-je choisir le texte de l\'avis ?', r: 'Oui, une fois payé vous pouvez rédiger votre propre texte ou utiliser notre générateur IA qui créera un avis naturel et authentique adapté à votre établissement.' },
              { q: 'Comment suivre ma commande ?', r: 'Après le paiement, vous recevez un lien de suivi unique. Ce lien vous permet de compléter les infos de votre établissement et de voir en temps réel l\'avancement de votre commande.' },
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
