import { test } from 'node:test'
import assert from 'node:assert/strict'
import { construireHead, filAriane, urlAbsolue, SITE_URL } from '../src/lib/seo.mjs'

test('page indexable : canonical absolu, description, Open Graph et Twitter', () => {
  const h = construireHead({ title: 'Guide', description: 'Une description', path: '/aide-commercants/x' })
  assert.equal(h.titre, 'Guide — SwimUp')
  assert.deepEqual(h.links, [['canonical', `${SITE_URL}/aide-commercants/x`]])
  const noms = h.metas.map(m => m[1])
  for (const n of ['description', 'robots', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:card']) assert.ok(noms.includes(n), n)
  assert.equal(h.metas.find(m => m[1] === 'robots')[2], 'index, follow')
  assert.equal(h.metas.find(m => m[1] === 'og:image')[2], `${SITE_URL}/og-image.png`)
})

test('page privée : noindex, ni canonical ni Open Graph', () => {
  const h = construireHead({ noindex: true })
  assert.equal(h.metas.find(m => m[1] === 'robots')[2], 'noindex, follow')
  assert.equal(h.links.length, 0)
  assert.ok(!h.metas.some(m => m[1].startsWith('og:')))
  assert.equal(h.titre, 'SwimUp')
})

test('données structurées : tableau normalisé, fil d\'Ariane avec URLs absolues', () => {
  assert.deepEqual(construireHead({ title: 'a', path: '/a' }).ld, [])
  const fa = filAriane([['Accueil', '/'], ['Guide', '/g']])
  assert.equal(fa['@type'], 'BreadcrumbList')
  assert.equal(fa.itemListElement[1].item, `${SITE_URL}/g`)
  assert.equal(construireHead({ title: 'a', jsonLd: fa }).ld.length, 1)
  assert.equal(urlAbsolue('https://autre.test/x'), 'https://autre.test/x')
})

import { readFileSync } from 'node:fs'
import { HEAD_BASE, injecterHead } from '../src/lib/seo.mjs'

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

test('HEAD_BASE colle à index.html (valeurs remises par <Seo /> en quittant une page prérendue)', () => {
  assert.ok(indexHtml.includes(`<title>${HEAD_BASE.titre}</title>`))
  assert.ok(indexHtml.includes(`<meta name="description" content="${HEAD_BASE['name:description']}"`))
  assert.ok(indexHtml.includes(`<meta name="robots" content="${HEAD_BASE['name:robots']}"`))
  assert.ok(indexHtml.includes(`<link rel="canonical" href="${HEAD_BASE['link:canonical']}"`))
})

test('injecterHead : remplace les balises globales, retire les JSON-LD de la commande, remplit #root', () => {
  const h = construireHead({ title: 'Guide "test"', description: 'Desc <b> & co', path: '/g', jsonLd: { '@type': 'Article', name: '</script>' } })
  const out = injecterHead(indexHtml, h, '<h1>Bonjour</h1>')
  assert.equal(out.match(/<title/g).length, 1)
  assert.equal(out.match(/rel="canonical"/g).length, 1)
  assert.equal(out.match(/name="description"/g).length, 1)
  assert.equal(out.match(/name="robots"/g).length, 1)
  assert.ok(!out.includes('"@type": "Service"') && !out.includes('FAQPage'))
  assert.ok(!out.includes('name="keywords"'))
  assert.ok(out.includes('content="Desc &lt;b&gt; &amp; co"'))
  assert.equal(out.match(/application\/ld\+json/g).length, 1)
  assert.ok(!out.includes('</script>"}'), 'JSON-LD : < échappé')
  assert.ok(out.includes('<div id="root" data-prerender="1"><h1>Bonjour</h1></div>'))
  assert.ok(out.includes('href="https://swimup.net/g"'))
  // la commande n'est pas touchée : la fonction ne modifie pas son entrée
  assert.ok(indexHtml.includes('FAQPage') && !indexHtml.includes('data-prerender'))
})

import { doitMesurer, UMAMI_SITE_ID } from '../src/lib/mesure.mjs'

test('mesure d\'audience : seulement swimup.net, pages publiques, visiteur non connecté', () => {
  const ok = (chemin, o = {}) => doitMesurer({ chemin, hote: 'swimup.net', connecte: false, ...o })
  for (const c of ['/', '/commander', '/inscription', '/aide-commercants', '/aide-commercants/repondre-aux-avis', '/outils/lien-avis-google', '/confidentialite']) assert.ok(ok(c), c)
  for (const c of ['/suivi', '/client', '/client/payer', '/admin/users', '/login', '/register', '/dashboard', '/verifier-email']) assert.ok(!ok(c), c)
  assert.ok(!ok('/', { connecte: true }))
  assert.ok(!ok('/', { hote: 'localhost' }))
  assert.ok(!ok('/', { hote: 'swimup-frontend-production.up.railway.app' }))
  assert.match(UMAMI_SITE_ID, /^[0-9a-f-]{36}$/)
})
