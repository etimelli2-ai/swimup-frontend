import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ArrowLeft, ChevronRight, Copy, Check, TriangleAlert, Sparkles, MessageSquareReply, MapPin, ShieldAlert, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import usePageTitle from '../hooks/usePageTitle'
import { springSmooth } from '../lib/motion'
import { GUIDES, guideParSlug } from '../content/guidesCommercants'

const LIEN_DISCORD = 'https://discord.gg/Dt2rmcHB5u'

const ICONES = { Star, MessageSquareReply, MapPin, ShieldAlert }
// Classes écrites en entier pour que Tailwind les garde au build
const COULEURS = {
  sky:     { tuile: 'bg-sky-50 text-sky-600 border-sky-100',             halo: 'rgba(14,165,233,0.14)' },
  violet:  { tuile: 'bg-violet-50 text-violet-600 border-violet-100',    halo: 'rgba(139,92,246,0.14)' },
  emerald: { tuile: 'bg-emerald-50 text-emerald-600 border-emerald-100', halo: 'rgba(16,185,129,0.14)' },
  amber:   { tuile: 'bg-amber-50 text-amber-600 border-amber-100',       halo: 'rgba(245,158,11,0.16)' },
}

function Cadre({ children }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center">
              <Star size={12} className="text-white fill-white" />
            </div>
            <span className="text-slate-900 text-[15px] font-semibold tracking-tight">SwimUp</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/aide-commercants" className="hidden sm:inline text-[13px] text-slate-500 hover:text-slate-700 font-medium transition-colors">
              Aide aux commerçants
            </Link>
            <a href="/login" className="text-[13px] text-sky-600 hover:text-sky-700 font-medium transition-colors">Se connecter</a>
          </div>
        </div>
      </header>
      {children}
      <footer className="w-full bg-slate-50 border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-2">
          <div className="flex items-center justify-between text-[12px] text-slate-400 flex-wrap gap-2">
            <span>© 2025 SwimUp</span>
            <a href="/login" className="text-sky-500 hover:underline">Espace membres</a>
          </div>
          <p className="text-[11px] text-slate-400">
            Conseils pratiques, pas des conseils juridiques. Les règles de Google peuvent changer : vérifie toujours l'aide officielle.
          </p>
        </div>
      </footer>
    </div>
  )
}

function Hero({ halo = 'rgba(14,165,233,0.14)', children }) {
  return (
    <section className="relative w-full bg-white overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
        style={{ background: `radial-gradient(60% 55% at 50% 0%, ${halo} 0%, rgba(0,0,0,0) 70%)` }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSmooth}
        className="relative max-w-2xl mx-auto px-4 pt-14 pb-8 text-center"
      >
        {children}
      </motion.div>
    </section>
  )
}

function Cta() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 p-6 sm:p-8 text-center text-white shadow-xl shadow-sky-500/20">
      <h2 className="text-[22px] font-semibold tracking-tight">Un espace pour gérer tout ça</h2>
      <p className="mt-2 text-[15px] text-white/85 max-w-md mx-auto font-light leading-relaxed">
        QR code et affiche à imprimer, demandes d'avis par email à tes clients, aide à la rédaction de tes réponses.
      </p>
      <div className="mt-5 flex items-center justify-center gap-5 flex-wrap">
        <a href="/login" className="inline-flex items-center rounded-full bg-white text-sky-600 text-[14px] font-semibold px-6 py-2.5 hover:bg-sky-50 transition-colors">
          Se connecter
        </a>
        <a href={LIEN_DISCORD} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-white/90 hover:text-white underline-offset-4 hover:underline">
          <MessageCircle size={14} /> Une question ? Discord
        </a>
      </div>
    </div>
  )
}

export function AideCommercantsIndex() {
  usePageTitle('Aide aux commerçants', "Guides gratuits pour les commerçants : obtenir de vrais avis Google, y répondre, optimiser sa fiche et gérer un avis injuste.")
  return (
    <Cadre>
      <Hero>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100 px-3.5 py-1.5 text-[12px] font-semibold tracking-wide uppercase mb-5">
          <Star size={12} className="fill-sky-500 text-sky-500" />
          Guides gratuits
        </span>
        <h1 className="text-[36px] sm:text-[48px] leading-[1.05] font-semibold tracking-tight text-slate-900">
          Ta réputation sur Google,<br />
          <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">sans prise de tête</span>
        </h1>
        <p className="mt-5 text-[18px] leading-relaxed text-slate-500 max-w-xl mx-auto font-light">
          Récolter de vrais avis, y répondre, tenir ta fiche à jour : des guides courts, concrets, pensés pour les commerçants.
        </p>
      </Hero>

      <main className="max-w-2xl mx-auto px-4 pb-16">
        <ul className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map(g => {
            const Icone = ICONES[g.icone] || Star
            const c = COULEURS[g.couleur] || COULEURS.sky
            return (
              <li key={g.slug}>
                <Link
                  to={`/aide-commercants/${g.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 transition-all hover:-translate-y-0.5 hover:border-slate-300"
                >
                  <span className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.tuile}`}>
                    <Icone size={20} />
                  </span>
                  <h2 className="mt-4 text-[17px] font-semibold tracking-tight text-slate-900 leading-snug">{g.titre}</h2>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-slate-500 flex-1">{g.resume}</p>
                  <span className="mt-4 inline-flex items-center text-[13px] font-medium text-sky-500 group-hover:underline underline-offset-4">
                    Lire le guide <ChevronRight size={14} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="mt-10"><Cta /></div>
      </main>
    </Cadre>
  )
}

function ModeleCopiable({ texte }) {
  const [ok, setOk] = useState(false)
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte.replace(/^«\s*|\s*»$/g, ''))
      setOk(true)
      setTimeout(() => setOk(false), 1800)
    } catch {
      toast.error('Copie impossible, sélectionne le texte à la main.')
    }
  }
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-[15px] leading-relaxed text-slate-700 italic">{texte}</p>
      <button
        onClick={copier}
        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-sky-500 hover:text-sky-600"
      >
        {ok ? <Check size={14} /> : <Copy size={14} />} {ok ? 'Copié' : 'Copier le modèle'}
      </button>
    </div>
  )
}

function Section({ s }) {
  const titre = <h2 className="text-[22px] font-semibold tracking-tight text-slate-900">{s.t}</h2>

  if (s.type === 'swimup') return null // remplacé par le bloc d'appel en bas de page

  if (s.type === 'attention') {
    return (
      <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
            <TriangleAlert size={16} className="text-white" />
          </span>
          <h2 className="text-[18px] font-semibold tracking-tight text-amber-900">{s.t}</h2>
        </div>
        {s.p.map((para, i) => (
          <p key={i} className="mt-3 text-[15px] leading-relaxed text-amber-900/85">{para}</p>
        ))}
      </section>
    )
  }

  if (s.type === 'etapes') {
    const etapes = s.p.filter(x => /^\d+\.\s/.test(x)).map(x => x.replace(/^\d+\.\s/, ''))
    const notes = s.p.filter(x => !/^\d+\.\s/.test(x))
    return (
      <section className="mt-10">
        {titre}
        <ol className="mt-4 space-y-3">
          {etapes.map((e, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
              <span className="w-7 h-7 rounded-full bg-sky-500 text-white text-[13px] font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="text-[15px] leading-relaxed text-slate-700 pt-0.5">{e}</p>
            </li>
          ))}
        </ol>
        {notes.map((n, i) => <p key={i} className="mt-3 text-[15px] leading-relaxed text-slate-500">{n}</p>)}
      </section>
    )
  }

  if (s.type === 'modele') {
    const [modele, ...reste] = s.p
    return (
      <section className="mt-10">
        {titre}
        <ModeleCopiable texte={modele} />
        {reste.map((r, i) => <p key={i} className="mt-3 text-[14px] leading-relaxed text-slate-500">{r}</p>)}
      </section>
    )
  }

  return (
    <section className="mt-10">
      {titre}
      {s.p.map((para, i) => (
        <p key={i} className="mt-3 text-[16px] leading-relaxed text-slate-600">{para}</p>
      ))}
    </section>
  )
}

export function AideCommercantsGuide() {
  const { slug } = useParams()
  const guide = guideParSlug(slug)
  usePageTitle(guide?.titre, guide?.description)
  if (!guide) return <Navigate to="/aide-commercants" replace />
  const Icone = ICONES[guide.icone] || Star
  const c = COULEURS[guide.couleur] || COULEURS.sky
  const autres = GUIDES.filter(g => g.slug !== guide.slug)

  return (
    <Cadre>
      <Hero halo={c.halo}>
        <Link to="/aide-commercants" className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 mb-6">
          <ArrowLeft size={14} /> Tous les guides
        </Link>
        <div className="flex justify-center">
          <span className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${c.tuile}`}><Icone size={24} /></span>
        </div>
        <h1 className="mt-5 text-[32px] sm:text-[44px] leading-[1.08] font-semibold tracking-tight text-slate-900">{guide.titre}</h1>
        <p className="mt-4 text-[18px] leading-relaxed text-slate-500 max-w-xl mx-auto font-light">{guide.resume}</p>
      </Hero>

      <main className="max-w-2xl mx-auto px-4 pb-16">
        <article>
          {guide.sections.map(s => <Section key={s.t} s={s} />)}
        </article>

        <div className="mt-12"><Cta /></div>

        <nav className="mt-12" aria-label="Autres guides">
          <h2 className="text-[15px] font-semibold text-slate-900">Autres guides</h2>
          <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
            {autres.map(g => (
              <li key={g.slug}>
                <Link to={`/aide-commercants/${g.slug}`} className="flex items-center justify-between py-3.5 text-[15px] text-slate-700 hover:text-sky-600">
                  {g.titre} <ChevronRight size={16} className="text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </Cadre>
  )
}
