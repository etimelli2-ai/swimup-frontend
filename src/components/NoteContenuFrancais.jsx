// Petit bandeau affiché seulement en anglais, sur les pages dont le contenu est écrit en français pour des
// commerces francophones (modèles de réponses, guides, messages d'apporteur) et n'est pas traduit.
import { getLangue, t } from '../lib/i18n'

export default function NoteContenuFrancais({ children }) {
  if (getLangue() !== 'en') return null
  return (
    <p role="note" className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-600">
      {children || t('Ce contenu est rédigé en français, pour des commerces francophones.')}
    </p>
  )
}
