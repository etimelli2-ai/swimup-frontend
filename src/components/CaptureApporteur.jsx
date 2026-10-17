// Garde le code d'un apporteur (?ref=CODE) quand un visiteur arrive par son lien, sur n'importe quelle page.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { codeDepuisRecherche, retenirCode } from '../lib/apporteur.mjs'

export default function CaptureApporteur() {
  const { search } = useLocation()
  useEffect(() => {
    const code = codeDepuisRecherche(search)
    if (code) retenirCode(code)
  }, [search])
  return null
}
