// En-tête et pied de page des pages publiques « ressources » (outils gratuits).
// Même grammaire visuelle que les guides ; ne dépend ni de la connexion ni de l'API.
import { Link, adr } from './Lien'
import Logo from './Logo'
import SelecteurLangue from './SelecteurLangue'
import { LiensLegaux } from './PageLegale'
import { LIEN_INSTAGRAM, LIEN_TIKTOK } from '../lib/seo.mjs'
import { t } from '../lib/i18n'

export default function CadrePublic({ children, large = false }) {
  const largeur = large ? 'max-w-4xl' : 'max-w-2xl'
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 print:hidden">
        <div className={`${largeur} mx-auto px-4 h-12 flex items-center justify-between`}>
          <Link to="/" aria-label="SwimUp, accueil">
            <Logo taille={26} classeTexte="text-slate-900" />
          </Link>
          <nav className="flex items-center gap-4" aria-label={t('Navigation')}>
            <Link to="/aide-commercants" className="hidden sm:inline text-[13px] text-slate-500 hover:text-slate-700 font-medium">{t('Guides')}</Link>
            <Link to="/offres" className="hidden sm:inline text-[13px] text-slate-500 hover:text-slate-700 font-medium">{t('Offres')}</Link>
            <a href="/login" className="text-[13px] text-slate-500 hover:text-slate-700 font-medium">{t('Se connecter')}</a>
            <a href={adr("/inscription?src=outil")} className="text-[13px] text-sky-600 hover:text-sky-700 font-semibold">{t('Compte gratuit')}</a>
            <SelecteurLangue />
          </nav>
        </div>
      </header>
      {children}
      <footer className="w-full bg-slate-50 border-t border-slate-200 print:hidden">
        <div className={`${largeur} mx-auto px-4 py-8 space-y-2`}>
          <div className="flex items-center justify-between text-[12px] text-slate-500 flex-wrap gap-2">
            <span>{t('© {date} SwimUp', { date: new Date().getFullYear() })}</span>
            <span className="flex gap-4">
              <Link to="/aide-commercants" className="hover:underline">{t('Guides')}</Link>
              <Link to="/offres" className="hover:underline">{t('Offres')}</Link>
              <a href={LIEN_INSTAGRAM} rel="noopener noreferrer me" target="_blank" className="hover:underline">{t('Instagram')}</a>
              <a href={LIEN_TIKTOK} rel="noopener noreferrer me" target="_blank" className="hover:underline">{t('TikTok')}</a>
              <a href="/login" className="text-sky-500 hover:underline">{t('Connexion')}</a>
            </span>
          </div>
          <LiensLegaux className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-600" classe="hover:underline" />
          <p className="text-[11px] text-slate-500">{t('Conseils pratiques, pas des conseils juridiques. Les règles de Google peuvent changer : vérifie toujours l\'aide officielle.')}</p>
        </div>
      </footer>
    </div>
  )
}
