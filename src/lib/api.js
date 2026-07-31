import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://swimup-backend-production.up.railway.app/api',
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
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
