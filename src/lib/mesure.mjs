// Mesure d'audience : Umami (cloud.umami.is). Sans cookie, sans profil, respecte « Ne pas me suivre ».
// Le script n'est chargé que sur swimup.net et que sur les pages ci-dessous. Jamais dans l'espace connecté,
// ni sur /suivi (l'adresse contient le jeton d'une commande). Aucune requête vers Umami ne part du backend.
// Pages vues envoyées à la main (data-auto-track="false") avec le chemin seul, sans paramètres d'adresse.
export const UMAMI_SCRIPT = 'https://cloud.umami.is/script.js'
export const UMAMI_SITE_ID = '9554d496-110a-42b3-9520-436bc529e4b1'
export const DOMAINE_MESURE = 'swimup.net'

// Zones où on ne mesure rien (même liste que le noindex : espace connecté, comptes, suivi de commande).
const PREFIXES_NON_MESURES = ['/client', '/admin', '/dashboard', '/avis', '/profil', '/portefeuille', '/parrainage',
  '/login', '/register', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe', '/verifier-email', '/verification-requise', '/suivi']

// connecte : un compte connecté n'est pas mesuré non plus (sur « / », il voit son tableau de bord).
export function doitMesurer({ chemin, hote, connecte }) {
  if (hote !== DOMAINE_MESURE) return false
  if (connecte) return false
  return !PREFIXES_NON_MESURES.some(p => chemin === p || chemin.startsWith(p + '/'))
}

let chargement = null
function charger() {
  if (typeof document === 'undefined') return Promise.resolve(null)
  if (chargement) return chargement
  chargement = new Promise((resolve) => {
    const s = document.createElement('script')
    s.defer = true
    s.src = UMAMI_SCRIPT
    s.setAttribute('data-website-id', UMAMI_SITE_ID)
    s.setAttribute('data-auto-track', 'false')
    s.setAttribute('data-do-not-track', 'true')
    s.setAttribute('data-domains', DOMAINE_MESURE)
    s.onload = () => resolve(window.umami || null)
    s.onerror = () => resolve(null)
    document.head.appendChild(s)
  })
  return chargement
}

export function mesurerPage(chemin) {
  charger().then(u => { try { u?.track(props => ({ ...props, url: chemin })) } catch { /* mesure facultative */ } })
}

// Événement nommé (ex. 'compte-cree'). Sans effet si la page n'est pas mesurée ou si le script est bloqué.
export function mesure(nom, donnees) {
  if (typeof window === 'undefined' || !window.umami) return
  try { window.umami.track(nom, donnees) } catch { /* mesure facultative */ }
}
