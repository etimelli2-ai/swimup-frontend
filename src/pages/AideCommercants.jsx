import { Link, useParams, Navigate } from 'react-router-dom'
import { Star, ArrowLeft } from 'lucide-react'
import usePageTitle from '../hooks/usePageTitle'
import { GUIDES, guideParSlug } from '../content/guidesCommercants'

function Cadre({ children }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center"><Star size={12} className="text-white fill-white" /></span>
            <span className="text-[15px] font-semibold tracking-tight">SwimUp</span>
          </Link>
          <Link to="/login" className="text-[13px] text-sky-600 hover:text-sky-700 font-medium">Se connecter</Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-10">{children}</main>
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-6 text-[12px] text-slate-500">
          Ces guides sont des conseils pratiques, pas des conseils juridiques. Les règles de Google peuvent changer : vérifie toujours l'aide officielle.
        </div>
      </footer>
    </div>
  )
}

export function AideCommercantsIndex() {
  usePageTitle('Aide aux commerçants', "Guides gratuits pour les commerçants : obtenir de vrais avis Google, y répondre, optimiser sa fiche et gérer un avis injuste.")
  return (
    <Cadre>
      <h1 className="text-3xl font-semibold tracking-tight">Aide aux commerçants</h1>
      <p className="mt-3 text-slate-600 leading-relaxed max-w-prose">
        Des guides courts pour mieux gérer ta présence sur Google : récolter de vrais avis, y répondre, tenir ta fiche à jour.
      </p>
      <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
        {GUIDES.map(g => (
          <li key={g.slug}>
            <Link to={`/aide-commercants/${g.slug}`} className="block py-5 group">
              <h2 className="text-lg font-medium group-hover:text-sky-600">{g.titre}</h2>
              <p className="mt-1 text-sm text-slate-600">{g.resume}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-slate-600">
        Tu as déjà un espace client SwimUp ? Les outils (QR code, affiche, demandes d'avis par email, aide à la réponse) sont dans l'onglet « Outils avis ».
      </p>
    </Cadre>
  )
}

export function AideCommercantsGuide() {
  const { slug } = useParams()
  const guide = guideParSlug(slug)
  usePageTitle(guide?.titre, guide?.description)
  if (!guide) return <Navigate to="/aide-commercants" replace />
  return (
    <Cadre>
      <Link to="/aide-commercants" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} /> Tous les guides
      </Link>
      <article className="mt-4">
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">{guide.titre}</h1>
        <p className="mt-3 text-slate-600 leading-relaxed">{guide.resume}</p>
        {guide.sections.map(s => (
          <section key={s.t} className="mt-8">
            <h2 className="text-xl font-semibold">{s.t}</h2>
            {s.p.map((para, i) => (
              <p key={i} className="mt-3 text-slate-700 leading-relaxed max-w-prose">{para}</p>
            ))}
          </section>
        ))}
      </article>
      <nav className="mt-12 border-t border-slate-200 pt-6" aria-label="Autres guides">
        <ul className="space-y-2 text-sm">
          {GUIDES.filter(g => g.slug !== guide.slug).map(g => (
            <li key={g.slug}><Link className="text-sky-600 hover:underline" to={`/aide-commercants/${g.slug}`}>{g.titre}</Link></li>
          ))}
        </ul>
      </nav>
    </Cadre>
  )
}
