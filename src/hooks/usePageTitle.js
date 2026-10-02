import { useEffect } from 'react'

// Met à jour le titre de l'onglet par page — sans ça, index.html fige le
// même <title> optimisé pour /commander sur TOUTES les pages (dashboard,
// login, profil...), ce qui est mauvais pour l'UX (onglets illisibles) et
// pour le SEO (Google lit document.title au rendu JS).
export default function usePageTitle(titre) {
  useEffect(() => {
    const avant = document.title
    document.title = titre ? `${titre} — SwimUp` : 'SwimUp'
    return () => { document.title = avant }
  }, [titre])
}
