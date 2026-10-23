// Adresses du site en français et en anglais.
//
// Les pages publiques (celles que Google doit trouver) existent en deux versions : l'adresse française
// habituelle, et la même page sous /en/ avec une adresse en anglais (/aide-commercants -> /en/business-help).
// Ce fichier est la seule source de vérité : le routeur, les liens, le prérendu, le sitemap et les balises
// hreflang s'en servent. Fonctions pures (aucune dépendance), utilisables dans les tests.

export const PREFIXE_EN = '/en'

// Pages fixes : [adresse française, adresse anglaise]
export const PAGES_FIXES = [
  ['/', '/en'],
  ['/commander', '/en/order'],
  ['/suivi', '/en/tracking'],
  ['/offres', '/en/plans'],
  ['/inscription', '/en/sign-up'],
  ['/aide-commercants', '/en/business-help'],
  ['/outils/lien-avis-google', '/en/tools/google-review-link'],
  ['/outils/modeles-reponses-avis-google', '/en/tools/google-review-reply-templates'],
  ['/outils/diagnostic-fiche-google', '/en/tools/google-business-profile-checkup'],
  ['/avis-google', '/en/google-reviews'],
  ['/mentions-legales', '/en/legal-notice'],
  ['/confidentialite', '/en/privacy'],
  ['/cookies', '/en/cookies'],
  ['/cgu', '/en/terms-of-use'],
  ['/cgv', '/en/terms-of-sale'],
  ['/retractation', '/en/withdrawal'],
]

// Pages à paramètre : [début français, début anglais, { slug français: slug anglais }]
export const PAGES_SLUG = [
  ['/aide-commercants/', '/en/business-help/', {
    'obtenir-des-avis-google': 'get-more-google-reviews',
    'ou-mettre-son-qr-code-davis': 'where-to-put-your-review-qr-code',
    'repondre-aux-avis': 'reply-to-google-reviews',
    'optimiser-fiche-google': 'optimise-google-business-profile',
    'avis-injuste-ou-faux': 'unfair-or-fake-review',
  }],
  ['/avis-google/', '/en/google-reviews/', {
    restaurant: 'restaurant',
    coiffeur: 'hair-salon',
    'artisan-batiment': 'building-contractor',
    'garage-automobile': 'car-garage',
    boulangerie: 'bakery',
    'institut-de-beaute': 'beauty-salon',
  }],
]

const FR_VERS_EN = new Map(PAGES_FIXES)
const EN_VERS_FR = new Map(PAGES_FIXES.map(([fr, en]) => [en, fr]))

// Sépare « /chemin?x=1#ancre » en [chemin, reste].
function couper(adresse) {
  const i = adresse.search(/[?#]/)
  return i === -1 ? [adresse, ''] : [adresse.slice(0, i), adresse.slice(i)]
}

// L'adresse (sans requête) est-elle une adresse anglaise du site ?
export function estEn(chemin) {
  const [c] = couper(String(chemin || ''))
  return c === PREFIXE_EN || c.startsWith(PREFIXE_EN + '/')
}

// Adresse anglaise de la page, ou null si la page n'existe qu'en une langue (espace connecté, connexion...).
export function versEn(adresse) {
  if (typeof adresse !== 'string' || !adresse.startsWith('/')) return null
  const [c, reste] = couper(adresse)
  if (estEn(c)) return adresse
  const fixe = FR_VERS_EN.get(c)
  if (fixe) return fixe + reste
  for (const [fr, en, slugs] of PAGES_SLUG) {
    if (c.startsWith(fr)) { const s = slugs[c.slice(fr.length)]; if (s) return en + s + reste }
  }
  return null
}

// Adresse française de la page, ou null.
export function versFr(adresse) {
  if (typeof adresse !== 'string' || !adresse.startsWith('/')) return null
  const [c, reste] = couper(adresse)
  if (!estEn(c)) return adresse
  const fixe = EN_VERS_FR.get(c)
  if (fixe) return fixe + reste
  for (const [fr, en, slugs] of PAGES_SLUG) {
    if (c.startsWith(en)) {
      const slug = c.slice(en.length)
      const trouve = Object.entries(slugs).find(([, e]) => e === slug)
      if (trouve) return fr + trouve[0] + reste
    }
  }
  return null
}

// Adresse à utiliser dans la langue donnée : la version de la langue si elle existe, sinon l'adresse telle quelle.
export function localiser(adresse, langue) {
  if (typeof adresse !== 'string') return adresse
  if (langue === 'en') return versEn(adresse) || adresse
  return versFr(adresse) || adresse
}

// Toutes les pages publiques indexables avec leurs deux adresses (hors accueil, commande et suivi).
export function paireDe(chemin) {
  const fr = versFr(chemin), en = versEn(chemin)
  return fr && en ? { fr, en } : null
}

// Slug anglais <-> slug français d'une famille de pages (guides, métiers).
export function slugEnDe(debutFr, slugFr) {
  const f = PAGES_SLUG.find(p => p[0] === debutFr)
  return f ? f[2][slugFr] : undefined
}
export function slugFrDe(debutFr, slug) {
  const f = PAGES_SLUG.find(p => p[0] === debutFr)
  if (!f) return slug
  if (f[2][slug]) return slug
  const trouve = Object.entries(f[2]).find(([, e]) => e === slug)
  return trouve ? trouve[0] : slug
}
