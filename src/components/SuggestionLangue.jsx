// Petit bandeau proposé aux visiteurs dont le navigateur n'est pas en français, sur une page publique qui existe
// en anglais : « cette page existe aussi en anglais ». On ne redirige JAMAIS automatiquement selon la langue du
// navigateur : un robot (Google) a souvent un navigateur en anglais et ne verrait alors plus les pages françaises.
// Le bandeau disparaît définitivement dès que le visiteur choisit une langue (ici ou avec le sélecteur FR | EN).
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLangue } from './LangueContext'
import { choixEnregistre, enregistrerLangue } from '../lib/i18n'
import { versEn, estEn } from '../lib/chemins.mjs'

export default function SuggestionLangue() {
  const { pathname } = useLocation()
  const { choisirLangue } = useLangue()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const nav = (typeof navigator !== 'undefined' && (navigator.languages?.[0] || navigator.language)) || 'fr'
    const etranger = !/^fr\b/i.test(nav)
    setVisible(etranger && choixEnregistre() === null && !estEn(pathname) && !!versEn(pathname))
  }, [pathname])

  if (!visible) return null
  // Le texte est volontairement en anglais : il s'adresse à quelqu'un dont le navigateur n'est pas en français.
  return (
    <div role="region" aria-label="Language" data-nosnippet
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-700 shadow-xl">
      <p>This page is also available in English.</p>
      <div className="mt-2 flex items-center gap-3">
        <button type="button" onClick={() => { setVisible(false); choisirLangue('en') }}
          className="rounded-full bg-sky-500 px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-sky-600">Read in English</button>
        <button type="button" onClick={() => { enregistrerLangue('fr'); setVisible(false) }}
          className="text-[13px] font-medium text-slate-500 hover:text-slate-800">Stay in French</button>
      </div>
    </div>
  )
}
