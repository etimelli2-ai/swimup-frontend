// Envoie une page vue à Umami à chaque changement de page publique (voir src/lib/mesure.mjs).
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { doitMesurer, mesurerPage, mesure } from '../lib/mesure.mjs'

export default function Mesure() {
  const { pathname, search } = useLocation()
  const { user, loading } = useAuth()
  const connecte = !!user
  useEffect(() => {
    if (loading) return // on attend de savoir si le visiteur est connecté
    if (!doitMesurer({ chemin: pathname, hote: window.location.hostname, connecte })) return
    mesurerPage(pathname)
    // Origine des inscriptions (?src=guide, ?src=outil...) : un événement, la page vue ne garde pas les paramètres.
    if (pathname === '/inscription') {
      const src = new URLSearchParams(search).get('src')
      if (src) setTimeout(() => mesure('inscription-source', { src: src.slice(0, 40) }), 800)
    }
  }, [pathname, loading, connecte]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
