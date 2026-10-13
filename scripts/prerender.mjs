// Prérendu au build : après `vite build`, écrit un vrai fichier HTML par page publique
// (titre, description, canonical, JSON-LD et contenu déjà dans la page), pour que Google et les
// partages sociaux lisent la page sans exécuter de JavaScript.
//
// Sécurité : tout est rendu et contrôlé en mémoire AVANT d'écrire quoi que ce soit dans dist/.
// À la moindre erreur, rien n'est écrit, le build reste celui de `vite build`, et le script sort en code 0
// (le déploiement n'est jamais bloqué par le prérendu).
import { createServer } from 'vite'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { construireHead, injecterHead } from '../src/lib/seo.mjs'

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(racine, 'dist')

// 404.html : coquille de l'appli en noindex. Le serveur la renvoie avec le statut 404 pour toute adresse
// qui n'est ni un fichier, ni une page prérendue, ni une route de l'appli (public/serve.json) ; l'appli
// affiche alors sa page « introuvable ».
async function ecrire404(modele) {
  const page = modele.replace(/<meta\s+name="robots"[^>]*>/i, '<meta name="robots" content="noindex, follow" />')
  if (page === modele) throw new Error('meta robots introuvable dans index.html')
  await writeFile(path.join(dist, '404.html'), page)
  console.log('[prerender] 404.html écrit')
}

async function main() {
  const modele = await readFile(path.join(dist, 'index.html'), 'utf8')
  await ecrire404(modele)
  const vite = await createServer({
    root: racine, mode: 'production', appType: 'custom', logLevel: 'error',
    server: { middlewareMode: true, hmr: false, watch: null },
    // les paquets sont repassés par Vite (certains sont publiés en CommonJS et ne s'importent pas tels quels)
    ssr: { noExternal: ['react-router', 'react-router-dom', 'framer-motion', 'react-hot-toast', 'lucide-react', '@tanstack/react-query', 'axios', 'qrcode'], resolve: { conditions: ['module-sync', 'module', 'node'] } },
  })
  const sorties = []
  try {
    const { rendre, PAGES } = await vite.ssrLoadModule('/src/prerender-entry.jsx')
    for (const url of PAGES) {
      const { html, seo } = await rendre(url)
      const props = seo[seo.length - 1]
      if (!props || !props.title || !props.description || !props.path) throw new Error(`${url} : <Seo /> incomplet`)
      if (props.noindex) throw new Error(`${url} : page en noindex`)
      if (props.path !== url) throw new Error(`${url} : canonical ${props.path} différent de l'URL`)
      if (!/<h1[\s>]/.test(html)) throw new Error(`${url} : aucun <h1> dans le rendu`)
      const page = injecterHead(modele, construireHead(props), html)
      // /aide-commercants -> aide-commercants.html (serve sert /aide-commercants sans extension)
      sorties.push([path.join(dist, `${url.slice(1)}.html`), page])
    }
  } finally {
    await vite.close()
  }
  for (const [fichier, contenu] of sorties) {
    await mkdir(path.dirname(fichier), { recursive: true })
    await writeFile(fichier, contenu)
  }
  console.log(`[prerender] ${sorties.length} pages écrites :`)
  for (const [f] of sorties) console.log('  -', path.relative(dist, f))
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('[prerender] échec, build laissé tel quel (sans prérendu) :', e?.stack || e)
  process.exit(0)
})
