// Lien direct vers le formulaire d'avis Google, à partir de ce que colle le commerçant.
// Tout se passe dans le navigateur : rien n'est envoyé à un serveur.
//
// Formes acceptées :
//  - un identifiant de lieu Google (Place ID, commence par ChIJ…)  -> lien « writereview?placeid= »
//  - le lien « Demander des avis » de Google Business Profile (g.page/r/…/review)
//  - un lien search.google.com/local/writereview ou /local/reviews avec placeid
//  - n'importe quelle adresse Google qui contient placeid= / place_id=
// Un lien vers la fiche (Maps, maps.app.goo.gl) ne mène PAS au formulaire d'avis : on l'explique.

const ID_LIEU = /^(ChIJ|GhIJ)[A-Za-z0-9_-]{10,200}$/
const BASE_OUTIL = 'https://swimup.net/outils/lien-avis-google'
const BASE_OUTIL_EN = 'https://swimup.net/en/tools/google-review-link'
const CODE_GPAGE = /^[A-Za-z0-9_-]{4,64}$/
const HOTES_GOOGLE = /^(www\.)?google\.[a-z.]{2,6}$|^search\.google\.com$/

export const lienDepuisIdentifiant = (id) => `https://search.google.com/local/writereview?placeid=${id}`

const ERREURS = {
  fiche: "Ce lien ouvre ta fiche, mais pas le formulaire d'avis. Utilise plutôt le lien « Demander des avis » de ton profil Google, ou ton identifiant de lieu (il commence par ChIJ).",
  inconnu: "Je ne reconnais pas ce lien. Colle le lien « Demander des avis » de ton profil Google (g.page/r/…) ou ton identifiant de lieu (il commence par ChIJ).",
  ouvert: "Ce lien n'est pas une adresse web valide.",
}

// -> { ok: true, lien, type } | { ok: false, code, erreur }
export function analyserLien(brut) {
  if (typeof brut !== 'string') return { ok: false, code: 'vide', erreur: '' }
  let s = brut.trim()
  if (!s) return { ok: false, code: 'vide', erreur: '' }
  if (s.length > 500) return { ok: false, code: 'inconnu', erreur: ERREURS.inconnu }

  if (ID_LIEU.test(s)) return { ok: true, lien: lienDepuisIdentifiant(s), type: 'identifiant' }

  if (/^(g\.page|search\.google\.com|maps\.app\.goo\.gl|goo\.gl|(www\.)?google\.[a-z.]+)\//i.test(s)) s = `https://${s}`

  let u
  try { u = new URL(s) } catch { return { ok: false, code: 'ouvert', erreur: ERREURS.inconnu } }
  if (!/^https?:$/.test(u.protocol) || u.username || u.password || u.port) return { ok: false, code: 'ouvert', erreur: ERREURS.ouvert }

  const hote = u.hostname.toLowerCase()
  const chemin = u.pathname.replace(/\/+$/, '')

  if (hote === 'g.page') {
    const m = chemin.match(/^\/r\/([^/]+)(\/review)?$/)
    if (m && CODE_GPAGE.test(m[1])) return { ok: true, lien: `https://g.page/r/${m[1]}/review`, type: 'lien-avis' }
    return { ok: false, code: 'inconnu', erreur: ERREURS.inconnu }
  }

  if (HOTES_GOOGLE.test(hote)) {
    const id = u.searchParams.get('placeid') || u.searchParams.get('place_id')
    if (id && ID_LIEU.test(id)) return { ok: true, lien: lienDepuisIdentifiant(id), type: 'identifiant' }
  }

  if (hote === 'maps.app.goo.gl' || hote === 'goo.gl' || (HOTES_GOOGLE.test(hote) && chemin.startsWith('/maps'))) {
    return { ok: false, code: 'fiche', erreur: ERREURS.fiche }
  }
  return { ok: false, code: 'inconnu', erreur: ERREURS.inconnu }
}

// Nom d'établissement venant d'une adresse : sans caractères de contrôle ni chevrons, espaces regroupés, 60 signes.
export function nettoyerNomAffiche(n) {
  return String(n ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60)
}

// Lien de l'outil gratuit déjà rempli pour un prospect (identifiant de lieu + nom), pour le mail de prospection.
// Sans identifiant de lieu valide (prospect ajouté à la main), on renvoie l'outil vide : jamais de lien cassé.
export function lienOutilPrepare({ place_id, nom } = {}, src = 'mail', langue = 'fr') {
  const q = new URLSearchParams({ src })
  if (ID_LIEU.test(String(place_id || ''))) {
    q.set('id', place_id)
    const n = nettoyerNomAffiche(nom)
    if (n) q.set('nom', n)
  }
  return `${langue === 'en' ? BASE_OUTIL_EN : BASE_OUTIL}?${q.toString()}`
}

// Ce que l'outil reprend de l'adresse : un identifiant valide et un nom propre, sinon rien.
export function prepareDepuisRecherche(search) {
  try {
    const q = new URLSearchParams(search || '')
    const id = (q.get('id') || '').trim()
    if (!ID_LIEU.test(id)) return null
    return { id, nom: nettoyerNomAffiche(q.get('nom')) }
  } catch { return null }
}
