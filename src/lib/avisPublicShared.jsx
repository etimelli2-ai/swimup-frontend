// Partagé entre PublicCommander.jsx (avant paiement, juste la quantité) et
// PublicSuivi.jsx (après paiement, le client remplit les infos de son
// établissement) — évite de dupliquer ces constantes/composants.
import { Star } from 'lucide-react'

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

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY

export async function genererTexteIA(nom, type, etoiles, ton) {
  try {
    const tonDesc = {
      enthousiaste: 'très enthousiaste et positif',
      naturel: 'naturel et authentique',
      neutre: 'neutre et factuel',
      drole: 'drôle et léger',
      poetique: 'poétique et imagé',
      severe: 'critique et sévère',
    }[ton] || 'naturel'

    const positif = etoiles >= 4
    const negatif = etoiles <= 2
    const prompt = `Écris un avis Google ${positif ? 'positif' : negatif ? 'négatif' : 'mitigé'} en français pour "${nom}" (${type || 'établissement'}). Ton : ${tonDesc}. ${etoiles} étoiles sur 5. 2-3 phrases naturelles. Sans guillemets. Sans introduction. Juste le texte de l'avis.`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Tu génères des avis Google authentiques. UNIQUEMENT le texte, sans guillemets, sans entités HTML.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 1.1,
      }),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim()
      .replace(/^["'«»]|["'«»]$/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'") || ''
  } catch {
    return ''
  }
}
