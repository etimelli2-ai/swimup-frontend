import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.swimup.net/api',
  // La session vit dans un cookie httpOnly (jamais lisible en JS, donc
  // protégé contre le vol de token via une faille XSS) : on demande à
  // axios de toujours l'envoyer/le recevoir, y compris en cross-site
  // (swimup.net -> railway.app).
  withCredentials: true,
})

// Établissement actif (équipe) : seuls les outils d'avis suivent le compte choisi.
// L'abonnement, les commandes et l'équipe restent toujours ceux de la personne connectée.
const CLE_COMPTE = 'swimup_compte'
const ROUTES_OUTILS = ['/client/commercant', '/client/reputation', '/client/visibilite', '/client/campagnes']

export function compteActif() {
  try { return sessionStorage.getItem(CLE_COMPTE) || null } catch { return null }
}
export function choisirCompte(id) {
  try { id ? sessionStorage.setItem(CLE_COMPTE, String(id)) : sessionStorage.removeItem(CLE_COMPTE) } catch { /* stockage indisponible */ }
}

api.interceptors.request.use(config => {
  const id = compteActif()
  if (id && ROUTES_OUTILS.some(p => (config.url || '').startsWith(p))) config.headers['X-Compte'] = id
  return config
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      // Fix — dispatch event au lieu de reload brutal
      window.dispatchEvent(new Event('swimup:logout'))
    }
    // L'accès a été retiré : on revient sur son propre compte.
    if (err.response?.status === 403 && String(err.response?.data?.error || '').startsWith("Tu n'as pas accès") && (err.config?.headers?.get?.('X-Compte') || err.config?.headers?.['X-Compte']) && compteActif()) {
      choisirCompte(null)
      window.dispatchEvent(new Event('swimup:compte'))
    }
    if (!err.response) {
      // Erreur réseau — backend down
      console.error('Erreur réseau — backend inaccessible')
    }
    return Promise.reject(err)
  }
)

export default api
