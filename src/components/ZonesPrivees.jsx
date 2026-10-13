// Marque en noindex les zones qui n'ont rien à faire dans Google : espace connecté, administration,
// comptes, connexion, suivi d'une commande (une page par commande).
// Ne change que la balise « robots » : ni titre, ni description, ni rien dans ces pages.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PREFIXES = ['/client', '/admin', '/dashboard', '/avis', '/profil', '/portefeuille', '/parrainage', '/loterie', '/boutique',
  '/login', '/register', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe', '/verifier-email', '/verification-requise', '/suivi']

export const estZonePrivee = (chemin) => PREFIXES.some(p => chemin === p || chemin.startsWith(p + '/'))

export default function ZonesPrivees() {
  const { pathname } = useLocation()
  const privee = estZonePrivee(pathname)
  useEffect(() => {
    if (!privee) return undefined
    let el = document.head.querySelector('meta[name="robots"]')
    if (el) {
      const avant = el.getAttribute('content')
      el.setAttribute('content', 'noindex, follow')
      return () => el.setAttribute('content', avant ?? 'index, follow')
    }
    el = document.createElement('meta')
    el.setAttribute('name', 'robots'); el.setAttribute('content', 'noindex, follow'); el.setAttribute('data-seo', '1')
    document.head.appendChild(el)
    return () => el.remove()
  }, [privee])
  return null
}
