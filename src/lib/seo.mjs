// Constantes et construction des balises <head> par page.
// Fonctions pures : le composant <Seo /> applique ces balises dans le navigateur, et
// scripts/prerender.mjs les écrit dans le HTML statique de chaque page publique (injecterHead).

import { versEn, versFr, estEn, localiser } from './chemins.mjs'
import { getLangue } from './langue.mjs'

export const SITE_URL = 'https://swimup.net'
export const SITE_NAME = 'SwimUp'
export const IMAGE_PARTAGE = '/og-image.png'
export const LIEN_INSTAGRAM = 'https://www.instagram.com/swimu.p/'
export const LIEN_TIKTOK = 'https://www.tiktok.com/@swimu.p'

export const urlAbsolue = (chemin = '/') => (/^https?:\/\//.test(chemin) ? chemin : `${SITE_URL}${chemin.startsWith('/') ? '' : '/'}${chemin}`)

// Adresse absolue d'une page dans la langue courante (/offres -> https://swimup.net/en/plans en anglais).
export const urlPage = (chemin = '/') => urlAbsolue(localiser(chemin, getLangue()))
export const langueSchema = () => (getLangue() === 'en' ? 'en' : 'fr-FR')

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
      ['property', 'og:locale', estEn(path) ? 'en_US' : 'fr_FR'], ['property', 'og:image', img],
      ['name', 'twitter:card', 'summary_large_image'], ['name', 'twitter:title', titre], ['name', 'twitter:image', img])
    if (description) metas.push(['property', 'og:description', description], ['name', 'twitter:description', description])
    if (url) metas.push(['property', 'og:url', url])
  }

  const links = url ? [['canonical', url]] : []
  // Versions de la même page dans l'autre langue (hreflang) : indispensable pour que Google montre la bonne
  // version à chaque visiteur. Chaque version se déclare elle-même et déclare l'autre ; x-default = anglais (visiteurs d'une autre langue).
  const alternates = []
  if (path && !noindex) {
    const fr = versFr(path), en = versEn(path)
    if (fr && en) alternates.push(['fr', urlAbsolue(fr)], ['en', urlAbsolue(en)], ['x-default', urlAbsolue(en)])
  }
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
  return { titre, metas, links, alternates, ld }
}

// Données structurées : uniquement des types qui décrivent réellement la page.
export const organisationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  sameAs: [LIEN_INSTAGRAM, LIEN_TIKTOK],
}

export const filAriane = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, chemin], i) => ({ '@type': 'ListItem', position: i + 1, name, item: urlPage(chemin) })),
})

// Valeurs d'index.html (page de commande). Quand une page prérendue est quittée en navigation interne,
// <Seo /> remet ces valeurs. tests/seo.test.mjs vérifie qu'elles collent toujours à index.html.
export const HEAD_BASE = {
  titre: "SwimUp — Avis Google Maps : commander ou gagner de l'argent",
  'name:description': "Obtenez de vrais avis Google Maps en 24h pour seulement 4€. Sans inscription, paiement sécurisé par Stripe, garantie 30 jours. Rejoignez SwimUp et gagnez de l'argent en rédigeant des avis.",
  'name:robots': 'index, follow',
  'link:canonical': 'https://swimup.net',
}

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escTexte = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Écrit les balises d'une page dans le HTML de build (dist/index.html) : remplace titre, description,
// robots, canonical et les JSON-LD globaux (ceux de la commande), ajoute Open Graph et JSON-LD de la page,
// et place le contenu rendu dans #root. Les balises posées portent data-seo-pre (voir Seo.jsx).
export function injecterHead(html, head, contenu, langue = 'fr') {
  const motif = [
    /<title>[\s\S]*?<\/title>\s*/i,
    /<meta\s+name="description"[^>]*>\s*/i,
    /<meta\s+name="keywords"[^>]*>\s*/i,
    /<meta\s+name="robots"[^>]*>\s*/i,
    /<link\s+rel="canonical"[^>]*>\s*/i,
  ]
  let out = html
  for (const m of motif) out = out.replace(m, '')
  out = out.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '')
  out = out.replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>\s*/gi, '')
  if (langue === 'en') out = out.replace('<html lang="fr">', '<html lang="en">')

  const lignes = [`<title data-seo-pre="1">${escTexte(head.titre)}</title>`]
  for (const [attr, nom, valeur] of head.metas) lignes.push(`<meta ${attr}="${esc(nom)}" content="${esc(valeur)}" data-seo-pre="1" />`)
  for (const [rel, href] of head.links) lignes.push(`<link rel="${esc(rel)}" href="${esc(href)}" data-seo-pre="1" />`)
  for (const [lang, href] of head.alternates || []) lignes.push(`<link rel="alternate" hreflang="${esc(lang)}" href="${esc(href)}" data-seo-pre="1" />`)
  for (const obj of head.ld) lignes.push(`<script type="application/ld+json" data-seo-pre="1">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`)

  if (!out.includes('</head>')) throw new Error('</head> introuvable')
  out = out.replace('</head>', `  ${lignes.join('\n  ')}\n</head>`)
  if (!out.includes('<div id="root"></div>')) throw new Error('#root introuvable')
  if (contenu === null) return out
  return out.replace('<div id="root"></div>', () => `<div id="root" data-prerender="1">${contenu}</div>`)
}
