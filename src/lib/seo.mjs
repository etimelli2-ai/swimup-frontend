// Constantes et construction des balises <head> par page.
// Fonction pure : le composant <Seo /> l'applique dans le navigateur, et le script de
// prérendu (lot suivant) pourra l'appeler à la place pour écrire le HTML statique.

export const SITE_URL = 'https://swimup.net'
export const SITE_NAME = 'SwimUp'
export const IMAGE_PARTAGE = '/og-image.png'

export const urlAbsolue = (chemin = '/') => (/^https?:\/\//.test(chemin) ? chemin : `${SITE_URL}${chemin.startsWith('/') ? '' : '/'}${chemin}`)

// props : { title, description, path, noindex, image, type, jsonLd }
export function construireHead({ title, description, path, noindex = false, image = IMAGE_PARTAGE, type = 'website', jsonLd } = {}) {
  const titre = title ? `${title} — ${SITE_NAME}` : SITE_NAME
  const url = path ? urlAbsolue(path) : null
  const img = urlAbsolue(image)

  const metas = []
  if (description) metas.push(['name', 'description', description])
  metas.push(['name', 'robots', noindex ? 'noindex, follow' : 'index, follow'])
  if (!noindex) {
    metas.push(['property', 'og:title', titre], ['property', 'og:type', type], ['property', 'og:site_name', SITE_NAME],
      ['property', 'og:locale', 'fr_FR'], ['property', 'og:image', img],
      ['name', 'twitter:card', 'summary_large_image'], ['name', 'twitter:title', titre], ['name', 'twitter:image', img])
    if (description) metas.push(['property', 'og:description', description], ['name', 'twitter:description', description])
    if (url) metas.push(['property', 'og:url', url])
  }

  const links = url ? [['canonical', url]] : []
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
  return { titre, metas, links, ld }
}

// Données structurées : uniquement des types qui décrivent réellement la page.
export const organisationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
}

export const filAriane = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, chemin], i) => ({ '@type': 'ListItem', position: i + 1, name, item: urlAbsolue(chemin) })),
})
