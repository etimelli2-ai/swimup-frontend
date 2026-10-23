// Choix de la langue : FR | EN. Visible sur les pages publiques, la connexion et l'espace connecté.
import { useLangue } from './LangueContext'
import { useAuth } from '../hooks/useAuth'
import { t } from '../lib/i18n'

const OPTIONS = [['fr', 'FR', 'Français'], ['en', 'EN', 'English']]

export default function SelecteurLangue({ className = '', sombre = false }) {
  const { langue, setLangue } = useLangue()
  const { user } = useAuth() || {}
  if (user?.role === 'admin') return null
  const actif = sombre ? 'bg-white/90 text-slate-900' : 'bg-slate-900 text-white'
  const inactif = sombre ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-800'
  return (
    <div role="group" aria-label={t('Langue du site')} className={`inline-flex items-center rounded-full border ${sombre ? 'border-white/20' : 'border-slate-200'} p-0.5 text-[11px] font-semibold ${className}`}>
      {OPTIONS.map(([code, court, long]) => (
        <button key={code} type="button" lang={code} title={long} aria-label={long} aria-pressed={langue === code}
          onClick={() => setLangue(code)}
          className={`px-2 py-0.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${langue === code ? actif : inactif}`}>
          {court}
        </button>
      ))}
    </div>
  )
}
