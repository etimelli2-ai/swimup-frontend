// Envoie une page vue à Umami à chaque changement de page publique (voir src/lib/mesure.mjs).
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { doitMesurer, mesurerPage, mesure, sourceDepuisRecherche } from '../lib/mesure.mjs'

export default function Mesure() {
  const { pathname, search } = useLocation()
  const { user, loading } = useAuth()
  const connecte = !!user
  useEffect(() => {
    if (loading) return // on attend de savoir si le visiteur est connecté
    if (!doitMesurer({ chemin: pathname, hote: window.location.hostname, connecte })) return
    mesurerPage(pathname)
    // Origine des visites (?src=mail, ?src=guide...) : un événement, la page vue ne garde pas les paramètres.
    // Sur /inscription on garde l'événement historique ; ailleurs, un événement « arrivee-source » une seule
    // fois par onglet et par source, pour ne pas compter un rafraîchissement comme une nouvelle visite.
    const src = sourceDepuisRecherche(search)
    if (src) {
      if (pathname === '/inscription') setTimeout(() => mesure('inscription-source', { src }), 800)
      else {
        let deja = false
        try { deja = !!sessionStorage.getItem('swimup-src-' + src); sessionStorage.setItem('swimup-src-' + src, '1') } catch { /* mesure facultative */ }
        if (!deja) setTimeout(() => mesure('arrivee-source', { src }), 800)
      }
    }
  }, [pathname, loading, connecte]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
