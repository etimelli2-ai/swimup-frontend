import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://swimup-backend-production.up.railway.app/api',
  // La session vit dans un cookie httpOnly (jamais lisible en JS, donc
  // protégé contre le vol de token via une faille XSS) : on demande à
  // axios de toujours l'envoyer/le recevoir, y compris en cross-site
  // (swimup.net -> railway.app).
  withCredentials: true,
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      // Fix — dispatch event au lieu de reload brutal
      window.dispatchEvent(new Event('swimup:logout'))
    }
    if (!err.response) {
      // Erreur réseau — backend down
      console.error('Erreur réseau — backend inaccessible')
    }
    return Promise.reject(err)
  }
)

export default api
