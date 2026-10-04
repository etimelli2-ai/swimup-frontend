import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En build (prod, Railway) : URL absolue vers l'API, inchangé.
//
// En dev local (`npm run dev`) : URL relative ('/api') + proxy Vite vers
// l'API de prod. Nécessaire pour la session — le cookie d'auth est en
// SameSite=Lax (voir routes/auth.js côté backend), qui ne voyage jamais
// sur un appel XHR/fetch entre deux sites différents (localhost et
// api.swimup.net sont deux sites différents pour le navigateur). En passant
// par un proxy, le navigateur ne voit que localhost:5173 du début à la
// fin — la requête vers api.swimup.net se fait côté serveur Vite, jamais
// depuis le navigateur — donc le cookie reste "même site" et survit bien
// à l'appel suivant.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(command === 'build' ? 'https://api.swimup.net/api' : '/api')
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.swimup.net',
        changeOrigin: true,
      },
    },
  },
}))
