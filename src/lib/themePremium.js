// ============================================================
// Réglages d'interface premium — partagé entre Layout.jsx (qui les applique)
// et ClientPremium.jsx (où le client les choisit). Les clés (arrondi,
// taille_texte, icone) doivent rester alignées avec la liste blanche côté
// backend (services/themePremium.js).
// ============================================================

import { Star, Heart, Crown, Zap, Waves, Flame, Gem, Rocket } from 'lucide-react'

export const ACCENT_DEFAUT = '#0ea5e9'
export const NOM_ESPACE_MAX = 24

// Couleurs préréglées (alignées avec COULEURS_THEME côté backend) et leur
// teinte "hover" associée pour .btn-primary
export const PALETTE = [
  { key: 'sky',     hex: '#0ea5e9', hover: '#0284c7', label: 'Bleu' },
  { key: 'emerald', hex: '#10b981', hover: '#059669', label: 'Émeraude' },
  { key: 'violet',  hex: '#8b5cf6', hover: '#7c3aed', label: 'Violet' },
  { key: 'amber',   hex: '#f59e0b', hover: '#d97706', label: 'Ambre' },
  { key: 'rose',    hex: '#f43f5e', hover: '#e11d48', label: 'Rose' },
  { key: 'indigo',  hex: '#6366f1', hover: '#4f46e5', label: 'Indigo' },
]

// Assombrit une couleur #rrggbb (pour l'état hover d'une couleur libre)
export function assombrir(hex, facteur = 0.82) {
  const canal = (i) => Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * facteur)))
  const h = (n) => n.toString(16).padStart(2, '0')
  return `#${h(canal(1))}${h(canal(3))}${h(canal(5))}`
}

export function couleurHover(hex) {
  const h = (hex || ACCENT_DEFAUT).toLowerCase()
  return PALETTE.find(c => c.hex === h)?.hover || assombrir(h)
}

// Même formule que le backend (luminance relative WCAG) : sert à prévenir
// tout de suite qu'une couleur sera refusée, le serveur reste l'autorité.
export function couleurTropClaire(hex) {
  const lin = (v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.5
}

// Forme des boutons et des cartes — valeurs lues par index.css via des
// variables CSS posées sur le wrapper de Layout.
export const ARRONDIS = {
  pilule:  { label: 'Pilule',  btn: '9999px',  card: '1.125rem', input: '0.5rem' },
  arrondi: { label: 'Arrondi', btn: '0.75rem', card: '0.875rem', input: '0.5rem' },
  carre:   { label: 'Carré',   btn: '0.25rem', card: '0.25rem',  input: '0.25rem' },
}

// Taille du texte : les tailles Tailwind sont en rem, donc changer la taille
// de la racine suffit à tout mettre à l'échelle.
export const TAILLES = {
  petite:  { label: 'Petite',  pct: '93.75%' },
  normale: { label: 'Normale', pct: null },
  grande:  { label: 'Grande',  pct: '112.5%' },
}

// Icône du logo dans le menu. plein = l'icône est remplie de blanc (sinon
// contour seul, plus lisible pour les icônes fines).
export const ICONES = {
  etoile:   { label: 'Étoile',   Icon: Star,   plein: true },
  coeur:    { label: 'Cœur',     Icon: Heart,  plein: true },
  couronne: { label: 'Couronne', Icon: Crown,  plein: true },
  eclair:   { label: 'Éclair',   Icon: Zap,    plein: true },
  flamme:   { label: 'Flamme',   Icon: Flame,  plein: true },
  vague:    { label: 'Vague',    Icon: Waves,  plein: false },
  diamant:  { label: 'Diamant',  Icon: Gem,    plein: false },
  fusee:    { label: 'Fusée',    Icon: Rocket, plein: false },
}
