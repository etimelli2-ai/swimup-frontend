import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, AlertCircle, Loader2, Check, Lock, Star, ChevronDown, MessageCircle } from 'lucide-react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'https://api.swimup.net/api'
const PRIX_UNITAIRE = 4
const PACKS = [1, 5, 10, 25]
const PACK_PAR_DEFAUT = 5

// Salon Discord déjà utilisé pour le support : canal direct pour les visiteurs
const LIEN_DISCORD = 'https://discord.gg/Dt2rmcHB5u'

const ETAPES = [
  { t: 'Vous choisissez et vous payez', d: `${PRIX_UNITAIRE} € par avis, paiement par carte sur Stripe. Pas de compte à créer.` },
  { t: 'Vous donnez le lien de votre fiche', d: "Juste après le paiement : le lien Google Maps de votre établissement, la note et le texte. Pas de texte ? Notre générateur en propose un." },
  { t: 'Un membre publie votre avis', d: 'Sous 24 à 48 h. Vous suivez la commande depuis un lien privé, envoyé aussi par email.' },
]

const FAQ = [
  { q: 'Combien ça coûte ?', r: `${PRIX_UNITAIRE} € par avis, sans abonnement et sans compte. Avec un compte client gratuit, l'avis passe à 3 €.` },
  { q: "Qui publie l'avis ?", r: "Un membre de notre réseau, depuis son propre compte Google. Chaque avis vient d'un membre différent." },
  { q: 'Et si Google supprime un avis ?', r: "La garantie dure 30 jours : si Google le retire dans ce délai, on le republie gratuitement. Pas de remboursement, mais un nouvel avis." },
  { q: "Puis-je choisir le texte de l'avis ?", r: "Oui. Après le paiement, vous écrivez votre texte, ou vous utilisez le générateur qui en propose un adapté à votre établissement." },
  { q: 'Comment suivre ma commande ?', r: "Après le paiement, vous recevez un lien de suivi privé. C'est aussi là que vous renseignez votre fiche Google Maps." },
]

const eur = (n) => `${n.toLocaleString('fr-FR')} €`

export default function PublicCommander() {
  const [searchParams] = useSearchParams()
  const wasCancelled = searchParams.get('cancel') === '1'

  const [quantite, setQuantite] = useState(PACK_PAR_DEFAUT)
  const [autre, setAutre]       = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const total = quantite * PRIX_UNITAIRE

  const payer = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const r = await axios.post(`${API}/stripe/public-checkout`, { quantite })
      window.location.href = r.data.url
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur — réessayez dans quelques secondes.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#0B1F33]">

      <header className="border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2" aria-label="SwimUp">
            <span className="w-7 h-7 rounded-lg bg-[#0369A1] flex items-center justify-center">
              <Star size={13} className="text-white fill-white" />
            </span>
            <span className="font-display text-[17px] font-bold tracking-tight">SwimUp</span>
          </a>
          <nav className="flex items-center gap-5 text-[14px]">
            <a href="/register" className="hidden sm:inline text-slate-600 hover:text-[#0B1F33]">Gagner de l'argent avec des avis</a>
            <a href="/login" className="font-semibold text-[#0369A1] hover:underline underline-offset-4">Se connecter</a>
          </nav>
        </div>
      </header>

      {/* Accueil : le message et la commande tiennent sur le même écran */}
      <section className="bg-[#EEF6FB]">
        <div className="max-w-5xl mx-auto px-5 py-8 sm:py-16 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">

          <div>
            <h1 className="font-display text-[34px] sm:text-[52px] leading-[1.06] font-bold tracking-tight">
              Des avis Google Maps pour votre établissement
            </h1>
            <p className="mt-3 sm:mt-4 text-[17px] sm:text-[18px] leading-relaxed text-slate-600 max-w-md">
              Vous choisissez le nombre d'avis et vous payez. Un membre les publie en 24 à 48 h.
            </p>
            <ul className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3 text-[16px]">
              {[
                'Pas de compte à créer',
                'Garantie 30 jours',
                'Paiement sécurisé par Stripe',
              ].map(t => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#0369A1] flex items-center justify-center shrink-0">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Commande : 1 clic pour le nombre, 1 clic pour payer */}
          <form id="commander" onSubmit={payer} className="rounded-3xl bg-white border border-slate-200 shadow-[0_20px_50px_-20px_rgba(3,105,161,0.35)] p-6 sm:p-7">
            {wasCancelled && (
              <p className="mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[14px] px-4 py-3">
                Paiement annulé, rien n'a été débité. Vous pouvez recommencer.
              </p>
            )}

            <fieldset>
              <legend className="font-display text-[20px] font-bold">Combien d'avis ?</legend>
              <div className="mt-4 grid grid-cols-4 gap-2.5">
                {PACKS.map(n => (
                  <label key={n} className="cursor-pointer">
                    <input
                      type="radio"
                      name="pack"
                      value={n}
                      checked={!autre && quantite === n}
                      onChange={() => { setQuantite(n); setAutre(false) }}
                      className="peer sr-only"
                    />
                    <span className="flex flex-col items-center justify-center rounded-2xl border-2 border-slate-200 bg-white py-3.5 transition-colors
                                     peer-checked:border-[#0369A1] peer-checked:bg-[#EEF6FB] peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[#0369A1]
                                     hover:border-slate-300">
                      <span className="font-display text-[26px] font-bold leading-none">{n}</span>
                      <span className="mt-1 text-[12px] text-slate-500">{eur(n * PRIX_UNITAIRE)}</span>
                    </span>
                  </label>
                ))}
              </div>

              {autre ? (
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button type="button" aria-label="Un avis de moins" onClick={() => setQuantite(q => Math.max(1, q - 1))}
                    className="w-11 h-11 rounded-full border border-slate-200 text-lg active:scale-95">−</button>
                  <input
                    type="number" min="1" inputMode="numeric" aria-label="Nombre d'avis" value={quantite}
                    onChange={e => setQuantite(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center rounded-xl border border-slate-200 py-2.5 text-[20px] font-bold focus:outline-none focus:ring-2 focus:ring-[#0369A1]"
                  />
                  <button type="button" aria-label="Un avis de plus" onClick={() => setQuantite(q => q + 1)}
                    className="w-11 h-11 rounded-full border border-slate-200 text-lg active:scale-95">+</button>
                </div>
              ) : (
                <button type="button" onClick={() => setAutre(true)} className="mt-3 text-[13px] text-slate-500 hover:text-[#0369A1] underline underline-offset-4">
                  Un autre nombre
                </button>
              )}
            </fieldset>

            <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-5">
              <div>
                <p className="text-[14px] text-slate-500">Total</p>
                <p className="text-[12px] text-slate-400">{quantite} × {eur(PRIX_UNITAIRE)}</p>
              </div>
              <p className="font-display text-[44px] leading-none font-bold tracking-tight">{eur(total)}</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-full bg-[#0369A1] hover:bg-[#075985] text-white py-4 font-semibold text-[17px] flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-60"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Ouverture du paiement…</>
                : <>Payer {eur(total)} <ArrowRight size={18} /></>}
            </button>

            <div aria-live="polite">
              {error && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 text-red-700 text-[14px] px-4 py-3">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                </p>
              )}
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] text-slate-500 text-center">
              <Lock size={12} className="shrink-0" />
              Paiement par carte sur Stripe. Le lien de votre fiche se donne après.
            </p>
          </form>
        </div>

        <p className="max-w-5xl mx-auto px-5 pb-6 text-[13.5px] text-slate-500">
          Vous voulez écrire des avis et être payé ?{' '}
          <a href="/register" className="font-semibold text-[#0369A1] underline underline-offset-4">Créez un compte membre, c'est gratuit</a>.
        </p>
      </section>

      {/* 3 étapes, une vraie séquence */}
      <section className="max-w-5xl mx-auto px-5 py-14 sm:py-20">
        <h2 className="font-display text-[28px] sm:text-[34px] font-bold tracking-tight">Comment ça marche</h2>
        <ol className="mt-8 grid sm:grid-cols-3 gap-8 sm:gap-6">
          {ETAPES.map((e, i) => (
            <li key={e.t} className="flex sm:block gap-4">
              <span className="font-display text-[34px] leading-none font-bold text-[#0369A1] shrink-0 w-9 sm:w-auto">{i + 1}</span>
              <div className="sm:mt-3">
                <p className="font-semibold text-[17px]">{e.t}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{e.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Garantie */}
      <section className="bg-[#0B1F33] text-white">
        <div className="max-w-5xl mx-auto px-5 py-12 sm:py-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight">Garantie 30 jours</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-slate-300">
              Si Google supprime un avis dans les 30 jours, on le republie gratuitement. Vous ne payez qu'une fois.
            </p>
          </div>
          <a href="#commander" className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#0B1F33] px-7 py-3.5 font-semibold text-[16px] shrink-0 active:scale-[0.98] transition">
            Commander <ArrowRight size={17} />
          </a>
        </div>
      </section>

      {/* Questions */}
      <section className="max-w-3xl mx-auto px-5 py-14 sm:py-20">
        <h2 className="font-display text-[28px] sm:text-[34px] font-bold tracking-tight">Questions fréquentes</h2>
        <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
          {FAQ.map(f => (
            <details key={f.q} className="group py-1">
              <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none font-semibold text-[16px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown size={18} className="text-slate-400 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-4 pr-8 text-[15px] leading-relaxed text-slate-600">{f.r}</p>
            </details>
          ))}
        </div>
        <a href={LIEN_DISCORD} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-[15px] text-[#0369A1] font-medium hover:underline underline-offset-4">
          <MessageCircle size={16} /> Une autre question ? Écrivez-nous sur Discord
        </a>
      </section>

      <footer className="border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-7 flex flex-wrap items-center justify-between gap-3 text-[13px] text-slate-500">
          <span>© {new Date().getFullYear()} SwimUp</span>
          <span className="flex items-center gap-5">
            <a href="/aide-commercants" className="hover:text-[#0B1F33]">Aide aux commerçants</a>
            <a href="/login" className="hover:text-[#0B1F33]">Espace membres</a>
          </span>
        </div>
      </footer>
    </div>
  )
}
