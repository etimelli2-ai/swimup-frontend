import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import Seo from '../components/Seo'

// Remplace l'ancienne redirection silencieuse vers l'accueil : une adresse inconnue
// affiche une vraie page « introuvable », en noindex.
export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <Seo title="Page introuvable" noindex />
      <div className="max-w-sm text-center space-y-4">
        <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto"><Star size={22} className="text-white fill-white" /></div>
        <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">Cette page n'existe pas</h1>
        <p className="text-[15px] text-slate-500">L'adresse est peut-être mal écrite, ou la page a changé de place.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Link to="/" className="inline-flex justify-center rounded-full bg-sky-500 text-white text-[14px] font-semibold px-5 py-2.5 hover:bg-sky-600">Retour à l'accueil</Link>
          <Link to="/aide-commercants" className="inline-flex justify-center rounded-full border border-slate-200 text-slate-700 text-[14px] font-medium px-5 py-2.5 hover:bg-slate-50">Voir les guides</Link>
        </div>
      </div>
    </div>
  )
}
