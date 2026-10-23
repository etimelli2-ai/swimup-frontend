import { t } from '../lib/i18n'
// Identité visuelle SwimUp : flèche qui remonte au-dessus de petites vagues, sur une pastille bleue.
// Même tracé que public/favicon.svg et que les visuels du kit de marque.
// variante 'plein' = pastille bleue, marque blanche ; 'inverse' = pastille blanche, marque bleue (fonds colorés).

const COULEURS = {
  plein: { fond: '#0066cc', marque: '#ffffff' },
  inverse: { fond: '#ffffff', marque: '#0066cc' },
}

export function LogoMarque({ size = 32, variante = 'plein', className = '', titre = 'SwimUp' }) {
  const { fond, marque } = COULEURS[variante] || COULEURS.plein
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label={titre} focusable="false">
      <rect width="100" height="100" rx="24" fill={fond} />
      <path d="M50 70V32" stroke={marque} strokeWidth="9" strokeLinecap="round" />
      <path d="M33 46L50 29L67 46" fill="none" stroke={marque} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 82q7.5-9 15 0t15 0t15 0t15 0" fill="none" stroke={marque} strokeWidth="5" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}

// Marque + nom. `taille` = côté de la pastille en px ; le texte suit.
export default function Logo({ taille = 28, variante = 'plein', className = '', classeTexte = '' }) {
  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: Math.round(taille * 0.3) }}>
      <LogoMarque size={taille} variante={variante} titre={t('Logo SwimUp')} />
      <span className={`font-display font-extrabold tracking-tight ${classeTexte}`} style={{ fontSize: Math.round(taille * 0.62), lineHeight: 1 }}>
        {t('SwimUp')}
      </span>
    </span>
  )
}
