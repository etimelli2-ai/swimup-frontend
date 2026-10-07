import { useEffect } from 'react'

// Met à jour le titre de l'onglet par page — sans ça, index.html fige le
// même <title> sur TOUTES les pages (dashboard, login, profil...). Un second
// paramètre optionnel pose la meta description (pages publiques de guides) ;
// elle est remise comme avant au départ de la page.
export default function usePageTitle(titre, description) {
  useEffect(() => {
    const avant = document.title
    document.title = titre ? `${titre} — SwimUp` : 'SwimUp'

    let meta = null
    let descAvant = null
    let creee = false
    if (description) {
      meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
        creee = true
      }
      descAvant = meta.getAttribute('content')
      meta.setAttribute('content', description)
    }
    return () => {
      document.title = avant
      if (meta) {
        if (creee) meta.remove()
        else if (descAvant !== null) meta.setAttribute('content', descAvant)
      }
    }
  }, [titre, description])
}
