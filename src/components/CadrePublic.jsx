// En-tête et pied de page des pages publiques « ressources » (outils gratuits).
// Même grammaire visuelle que les guides ; ne dépend ni de la connexion ni de l'API.
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'

export default function CadrePublic({ children, large = false }) {
  const largeur = large ? 'max-w-4xl' : 'max-w-2xl'
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 print:hidden">
        <div className={`${largeur} mx-auto px-4 h-12 flex items-center justify-between`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center"><Star size={12} className="text-white fill-white" /></div>
            <span className="text-slate-900 text-[15px] font-semibold tracking-tight">SwimUp</span>
          </Link>
          <nav className="flex items-center gap-4" aria-label="Navigation">
            <Link to="/aide-commercants" className="hidden sm:inline text-[13px] text-slate-500 hover:text-slate-700 font-medium">Guides</Link>
            <Link to="/offres" className="hidden sm:inline text-[13px] text-slate-500 hover:text-slate-700 font-medium">Offres</Link>
            <a href="/login" className="text-[13px] text-slate-500 hover:text-slate-700 font-medium">Se connecter</a>
            <a href="/inscription?src=outil" className="text-[13px] text-sky-600 hover:text-sky-700 font-semibold">Compte gratuit</a>
          </nav>
        </div>
      </header>
      {children}
      <footer className="w-full bg-slate-50 border-t border-slate-200 print:hidden">
        <div className={`${largeur} mx-auto px-4 py-8 space-y-2`}>
          <div className="flex items-center justify-between text-[12px] text-slate-400 flex-wrap gap-2">
            <span>© 2025 SwimUp</span>
            <span className="flex gap-4">
              <Link to="/aide-commercants" className="hover:underline">Guides</Link>
              <Link to="/offres" className="hover:underline">Offres</Link>
              <Link to="/confidentialite" className="hover:underline">Confidentialité</Link>
              <a href="/login" className="text-sky-500 hover:underline">Connexion</a>
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Conseils pratiques, pas des conseils juridiques. Les règles de Google peuvent changer : vérifie toujours l'aide officielle.</p>
        </div>
      </footer>
    </div>
  )
}
