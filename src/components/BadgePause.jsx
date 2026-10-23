import { PauseCircle } from 'lucide-react';
import { t } from '../lib/i18n'

// Petit logo pause affiché à côté du profil d'un membre dont les avis sont bloqués.
export default function BadgePause({ actif, size = 14, className = '' }) {
  if (!actif || Number(actif) === 0) return null;
  return (
    <span
      title={t('Avis bloqués')}
      aria-label={t('Avis bloqués')}
      className={`inline-flex items-center align-middle text-amber-500 dark:text-amber-400 shrink-0 ${className}`}
    >
      <PauseCircle size={size} />
    </span>
  );
}
