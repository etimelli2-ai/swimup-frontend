// Point d'entrée du prérendu (chargé par scripts/prerender.mjs via Vite, jamais par le navigateur).
// Rend la page de l'URL demandée en HTML et renvoie aussi les props du <Seo /> rencontré.
import { PassThrough } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import Racine from './Racine'
import { GUIDES } from './content/guidesCommercants'

// Pages publiques prérendues. La commande (/, /commander), le suivi, l'espace connecté, l'admin,
// la connexion et les pages membres n'en font pas partie : elles restent servies comme avant.
export const PAGES = [
  '/aide-commercants',
  ...GUIDES.map(g => `/aide-commercants/${g.slug}`),
  '/outils/lien-avis-google',
  '/outils/modeles-reponses-avis-google',
  '/outils/diagnostic-fiche-google',
  '/inscription',
  '/confidentialite',
]

export function rendre(url) {
  globalThis.__SEO_COLLECTE = []
  return new Promise((resolve, reject) => {
    let erreur = null
    const flux = new PassThrough()
    let html = ''
    flux.on('data', (c) => { html += c.toString('utf8') })
    flux.on('end', () => {
      const seo = globalThis.__SEO_COLLECTE
      globalThis.__SEO_COLLECTE = null
      erreur ? reject(erreur) : resolve({ html, seo })
    })
    const { pipe, abort } = renderToPipeableStream(
      <Racine Routeur={StaticRouter} routeurProps={{ location: url }} />,
      {
        onAllReady() { pipe(flux) },
        onShellError(e) { reject(e) },
        onError(e) { erreur = e },
      }
    )
    setTimeout(() => abort(), 20000)
  })
}
