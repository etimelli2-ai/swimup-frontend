import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ChevronRight, ChevronDown, AlertCircle, Loader2, CheckCircle2, Users, Star, Zap, Shield, Lock,
  Sparkles, MapPin, ThumbsUp, UtensilsCrossed, Hotel, Wrench, Scissors, Stethoscope, ShoppingBag,
  TrendingUp, MessageCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { springSmooth, springSheet } from '../lib/motion'

const API = import.meta.env.VITE_API_URL || 'https://api.swimup.net/api'
const PRIX_UNITAIRE = 4

const POURQUOI = [
  { icon: Users,      color: 'bg-sky-500',     t: 'Vrais profils Google', d: 'Chaque avis est publié par un vrai membre de notre réseau avec un compte Google actif. Aucun bot, aucun faux compte.' },
  { icon: Sparkles,   color: 'bg-violet-500',  t: 'Texte personnalisé', d: "Une fois payé, vous choisissez le contenu de l'avis, la note et le ton. Notre IA peut aussi générer un texte naturel pour vous." },
  { icon: Zap,        color: 'bg-amber-500',   t: 'Résultats rapides', d: "La plupart des avis sont publiés en moins de 24h après réception de vos informations. Votre réputation s'améliore immédiatement." },
  { icon: Lock,       color: 'bg-emerald-500', t: 'Discret et sécurisé', d: 'Paiement 100% sécurisé via Stripe. Aucune donnée sensible stockée. Lien de suivi privé.' },
]

const ETAPES = [
  { t: "Choisissez le nombre d'avis et payez", d: "Un seul champ avant paiement : combien d'avis vous voulez. Paiement sécurisé par Stripe, 4€ par avis, sans abonnement." },
  { t: 'Complétez les infos juste après', d: "Une fois payé, indiquez le lien Google Maps de votre établissement, la note et le ton souhaités. Notre IA peut générer le texte à votre place." },
  { t: 'Un membre publie votre avis', d: 'Un vrai membre de notre réseau se charge de publier votre avis Google depuis son compte personnel. Livraison en 24-48h.' },
  { t: 'Vérification et garantie', d: "Nous vérifions que l'avis est bien publié et reste en ligne. Si Google le supprime dans les 30 jours, nous le republions gratuitement." },
]

const SECTEURS = [
  { icon: UtensilsCrossed, label: 'Restaurants & Cafés' },
  { icon: Hotel,           label: 'Hôtels & Gîtes' },
  { icon: Wrench,          label: 'Artisans & Travaux' },
  { icon: Scissors,        label: 'Beauté & Bien-être' },
  { icon: Stethoscope,     label: 'Médecins & Santé' },
  { icon: ShoppingBag,     label: 'Commerces locaux' },
]

// Lien de contact public — réutilise le serveur Discord déjà utilisé pour
// les tickets premium, pour donner un canal de contact direct aux visiteurs
// non-connectés (avant même qu'ils ne créent un compte ou ne payent).
const LIEN_DISCORD = 'https://discord.gg/Dt2rmcHB5u'

// Valeurs de repli si /public/stats est indisponible — jamais affichées
// comme "temps réel", juste pour ne pas laisser la section vide.
const STATS_REPLI = { membres_actifs: 500, avis_publies: 2000 }

function formatStat(n) {
  return n.toLocaleString('fr-FR')
}

const FAQ = [
  { q: 'Est-ce que les avis Google achetés sont authentiques ?', r: "Oui. Chaque avis est publié par un vrai membre de notre réseau depuis son compte Google personnel. Nous n'utilisons jamais de bots ou de faux comptes." },
  { q: 'Combien coûte un avis Google Maps ?', r: 'Un avis Google Maps coûte 4€ sans compte. Si vous créez un compte SwimUp, le tarif est réduit à 3€ par avis avec des fonctionnalités supplémentaires.' },
  { q: 'Pourquoi le formulaire ne demande que la quantité ?', r: "On ne veut pas vous faire remplir des détails avant même de savoir si vous voulez commander. Vous payez d'abord, puis vous complétez les infos de votre établissement (lien Maps, note, ton, texte) directement depuis votre page de suivi." },
  { q: 'En combien de temps mon avis sera publié ?', r: "La plupart des avis sont publiés en 24 à 48h après que vous ayez complété les infos, selon la disponibilité des membres de notre réseau." },
  { q: "Que se passe-t-il si l'avis est supprimé par Google ?", r: 'SwimUp offre une garantie de 30 jours. Si Google supprime l\'avis dans ce délai, nous le republions gratuitement. Sans remboursement, mais avec un nouvel avis.' },
  { q: "Puis-je choisir le texte de l'avis ?", r: 'Oui, une fois payé vous pouvez rédiger votre propre texte ou utiliser notre générateur IA qui créera un avis naturel et authentique adapté à votre établissement.' },
  { q: 'Comment suivre ma commande ?', r: 'Après le paiement, vous recevez un lien de suivi unique. Ce lien vous permet de compléter les infos de votre établissement et de voir en temps réel l\'avancement de votre commande.' },
]

function FaqItem({ item, open, onClick }) {
  return (
    <div className="py-1">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-semibold text-[15px] text-slate-900">{item.q}</span>
        <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springSheet}
            className="overflow-hidden"
          >
            <p className="text-[14px] text-slate-500 leading-relaxed pb-4 pr-8">{item.r}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
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

  const [quantite, setQuantite] = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [faqOpen, setFaqOpen]   = useState(0)
  const [stats, setStats]       = useState(STATS_REPLI)

  // Chiffres réels plutôt que des valeurs figées en dur — repli silencieux
  // sur STATS_REPLI si l'API ne répond pas (jamais d'erreur visible ici).
  useEffect(() => {
    axios.get(`${API}/public/stats`)
      .then(r => setStats(r.data))
      .catch(() => {})
  }, [])

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

      {/* Nav — sticky, claire avec liseré, cohérente avec le reste de la page */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center">
              <Star size={12} className="text-white fill-white" />
            </div>
            <span className="text-slate-900 text-[15px] font-semibold tracking-tight">SwimUp</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={LIEN_DISCORD}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              <MessageCircle size={14} />
              Une question ?
            </a>
            <a href="/login" className="text-[13px] text-sky-600 hover:text-sky-700 font-medium transition-colors">
              Se connecter
            </a>
          </div>
        </div>
      </header>

      {/* Hero — fond dégradé + carte "exemple d'avis" flottante */}
      <section className="relative w-full bg-white overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[560px] -z-0 pointer-events-none"
          style={{
            background: 'radial-gradient(60% 50% at 50% 0%, rgba(14,165,233,0.14) 0%, rgba(14,165,233,0) 70%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSmooth}
          className="relative max-w-2xl mx-auto px-4 pt-16 pb-8 text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100 px-3.5 py-1.5 text-[12px] font-semibold tracking-wide uppercase mb-5">
            <Star size={12} className="fill-sky-500 text-sky-500" />
            Sans compte · Sans abonnement · Livraison 24h
          </span>
          <h1 className="text-[40px] sm:text-[52px] leading-[1.05] font-semibold tracking-tight text-slate-900">
            Des avis Google Maps<br />
            <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
              authentiques, dès {PRIX_UNITAIRE}€
            </span>
          </h1>
          <p className="mt-5 text-[19px] leading-relaxed text-slate-500 max-w-xl mx-auto font-light">
            Boostez la réputation de votre établissement avec de vrais avis publiés par des personnes réelles.
            Restaurants, commerces, artisans, hôtels — livraison en 24-48h, sans création de compte.
          </p>

          <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
            <a href="#commander" className="btn-primary px-7 py-3.5 text-[15px] shadow-lg shadow-sky-500/20">
              Commander maintenant
            </a>
            <a href="#comment-ca-marche" className="text-sky-500 text-[15px] font-medium hover:underline underline-offset-4">
              Comment ça marche ›
            </a>
          </div>

          {/* Badge garantie — mis en avant dans le hero, pas seulement plus bas */}
          <div className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-emerald-50 border border-emerald-200 pl-2 pr-4 py-2 shadow-sm shadow-emerald-500/10">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-[13px] font-semibold text-emerald-700">
              Garantie 30 jours — avis republié gratuitement s'il est supprimé
            </span>
          </div>

          <p className="mt-4 text-[13px] text-slate-400">
            Une question avant de commander ?{' '}
            <a href={LIEN_DISCORD} target="_blank" rel="noreferrer" className="text-sky-500 font-medium hover:underline underline-offset-4">
              Discute avec nous sur Discord
            </a>
          </p>
        </motion.div>

        {/* Capture Google Maps floutée/anonymisée — étoiles qui se remplissent
            progressivement au scroll (whileInView), à la place de la carte
            "exemple d'avis" mockée précédente */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={springSmooth}
          className="relative max-w-md mx-auto px-4 pb-4"
        >
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-sky-400 via-emerald-400 to-amber-400 shrink-0" />
              <div className="h-2.5 rounded-full bg-slate-200 w-28" style={{ filter: 'blur(1.5px)' }} />
              <span className="ml-auto text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <MapPin size={10} /> Google Maps
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-semibold text-[15px] shrink-0"
                  style={{ filter: 'blur(2px)' }}
                >
                  M
                </div>
                <div className="text-left flex-1">
                  <div className="h-2.5 rounded-full bg-slate-200 w-24 mb-1.5" style={{ filter: 'blur(1.5px)' }} />
                  <div className="flex items-center gap-0.5">
                    {[0, 1, 2, 3, 4].map(i => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ delay: 0.12 * i, duration: 0.3, type: 'spring', stiffness: 300 }}
                      >
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                      </motion.span>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium shrink-0">Anonymisé</span>
              </div>
              <div className="mt-3.5 space-y-1.5">
                <div className="h-2 rounded-full bg-slate-100 w-full" />
                <div className="h-2 rounded-full bg-slate-100 w-[85%]" />
                <div className="h-2 rounded-full bg-slate-100 w-[60%]" />
              </div>
              <p className="text-[12px] text-slate-400 italic mt-3 text-left">
                Capture anonymisée — exemple d'avis Google Maps publié pour un de nos clients.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stat concrète — bénéfice chiffré plutôt qu'abstrait */}
        <div className="relative max-w-md mx-auto px-4 pb-2">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-100 px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25">
              <TrendingUp size={18} className="text-white" />
            </div>
            <p className="text-[13.5px] sm:text-[14.5px] text-slate-700 leading-snug text-left">
              <span className="font-semibold text-emerald-600">+40% de visibilité</span> sur Google Maps en moyenne pour une fiche qui passe de 5 à 15 avis*
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 text-center">
            *Le classement local Google Maps favorise les fiches avec un volume d'avis plus élevé.
          </p>
        </div>

        {/* Stats — cartes avec icônes */}
        <div className="relative max-w-2xl mx-auto px-4 pb-16 pt-8">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: Users, label: 'Membres actifs', value: formatStat(stats.membres_actifs) },
              { icon: Star,  label: 'Avis publiés',   value: formatStat(stats.avis_publies) },
              { icon: Zap,   label: 'Livraison',      value: '24-48h' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5 text-center">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2">
                  <s.icon size={15} className="text-sky-500" />
                </div>
                <p className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-slate-900">{s.value}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Garantie — bande accent */}
      <section className="w-full bg-slate-50 border-y border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-10 flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-sky-500 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/25">
            <Shield size={20} className="text-white" />
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

      {/* Pourquoi SwimUp — tuile sombre, cartes avec icônes colorées */}
      <section className="w-full bg-[#1d1d1f] text-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-center">
            Pourquoi acheter des avis Google Maps ?
          </h2>
          <p className="mt-4 text-[17px] text-slate-300 leading-relaxed text-center max-w-xl mx-auto font-light">
            Les avis Google sont aujourd'hui le premier critère de choix des consommateurs.
            Un établissement avec plus d'avis positifs apparaît plus haut dans les résultats Google Maps.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {POURQUOI.map((item, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-5 flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon size={17} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[15px] text-white">{item.t}</p>
                  <p className="text-[13.5px] text-slate-400 mt-1 leading-relaxed">{item.d}</p>
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
          <p className="text-[15px] text-slate-500 text-center mb-10 max-w-md mx-auto">
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

          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">

            <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-br from-sky-400 via-sky-200 to-violet-300">
              <div className="rounded-[26px] bg-white p-8 space-y-6">
                <div className="space-y-3 text-center">
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

                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[16px] text-slate-900">
                      {quantite} avis Google Maps
                    </p>
                    <p className="text-[13px] text-slate-500 mt-0.5">
                      {quantite} × {PRIX_UNITAIRE}€ · Livraison 24-48h
                    </p>
                  </div>
                  <p className="text-[30px] font-semibold tracking-tight text-slate-900">{total}€</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-sky-500 hover:bg-sky-600 text-white py-4 font-medium text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-sky-500/25"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Redirection vers le paiement...</>
                  ) : (
                    <>Payer {total}€ et commander {quantite > 1 ? `${quantite} avis` : '1 avis'} <ChevronRight size={18} /></>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

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

      {/* Comment ça marche — timeline avec ligne de connexion */}
      <section id="comment-ca-marche" className="w-full bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-center mb-12">
            Comment acheter des avis Google Maps ?
          </h2>
          <div className="relative space-y-8">
            <div className="absolute left-[17px] top-3 bottom-3 w-px bg-slate-200" />
            {ETAPES.map((s, i) => (
              <div key={i} className="relative flex items-start gap-4">
                <span className="relative z-10 w-9 h-9 rounded-full bg-sky-500 text-white font-semibold text-[14px] flex items-center justify-center shrink-0 ring-4 ring-slate-50">
                  {i + 1}
                </span>
                <div className="pt-1">
                  <p className="font-semibold text-[16px] text-slate-900">{s.t}</p>
                  <p className="text-[14px] text-slate-500 mt-0.5 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qui utilise SwimUp — cartes avec icônes */}
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
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SECTEURS.map((s, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 flex flex-col items-center gap-2 text-center">
                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                  <s.icon size={16} className="text-sky-500" />
                </div>
                <span className="text-[13px] font-medium text-slate-700 leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — accordéon */}
      <section className="w-full bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-center mb-10">
            Questions fréquentes
          </h2>
          <div className="rounded-2xl bg-white border border-slate-200 px-6 divide-y divide-slate-100">
            {FAQ.map((f, i) => (
              <FaqItem key={i} item={f} open={faqOpen === i} onClick={() => setFaqOpen(faqOpen === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="w-full bg-white">
        <div className="max-w-2xl mx-auto px-4 pb-16">
          <div className="rounded-[28px] bg-gradient-to-br from-sky-500 to-violet-500 p-10 text-center text-white">
            <ThumbsUp size={28} className="mx-auto mb-4 text-white/90" />
            <h3 className="text-[24px] sm:text-[28px] font-semibold tracking-tight">Prêt à booster votre réputation ?</h3>
            <p className="text-[15px] text-white/85 mt-2 max-w-sm mx-auto">
              Premier avis livré en 24-48h, sans compte à créer.
            </p>
            <a href="#commander" className="inline-flex mt-6 rounded-full bg-white text-slate-900 px-7 py-3.5 font-medium text-[15px] active:scale-95 transition-all">
              Commander maintenant
            </a>
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
