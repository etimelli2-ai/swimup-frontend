// Partagé entre PublicCommander.jsx (avant paiement, juste la quantité) et
// PublicSuivi.jsx (après paiement, le client remplit les infos de son
// établissement) — évite de dupliquer ces constantes/composants.
import { Star } from 'lucide-react'
import api from './api'

export const TONS = [
  { id: 'enthousiaste', label: 'Enthousiaste', emoji: '🔥' },
  { id: 'naturel',      label: 'Naturel',      emoji: '😊' },
  { id: 'neutre',       label: 'Neutre',        emoji: '😐' },
  { id: 'drole',        label: 'Drôle',         emoji: '😂' },
  { id: 'poetique',     label: 'Poétique',      emoji: '✨' },
  { id: 'severe',       label: 'Sévère',        emoji: '😤' },
]

export const TYPES = [
  'Restaurant', 'Hôtel', 'Commerce', 'Artisan / Travaux',
  'Médecin / Santé', 'Beauté / Bien-être', 'Sport / Loisirs', 'Autre',
]

// Sélecteur d'étoiles — icônes pleines Action Blue, sans encadré (grammaire Apple)
export function EtoilesPicker({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          className="p-1 active:scale-90 transition-transform"
        >
          <Star
            size={30}
            className={value >= n ? 'text-sky-500 fill-sky-500' : 'text-slate-200 fill-slate-200'}
          />
        </button>
      ))}
    </div>
  )
}

// Génère le texte via notre backend (qui appelle Groq avec sa propre clé
// GROQ_API_KEY, jamais exposée au navigateur — avant, la clé était en
// VITE_GROQ_API_KEY donc visible en clair dans le bundle JS public).
export async function genererTexteIA(nom, type, etoiles, ton) {
  try {
    const { data } = await api.post('/public/generer-avis-ia', { nom, type, etoiles, ton })
    return data.texte || ''
  } catch {
    return ''
  }
}
