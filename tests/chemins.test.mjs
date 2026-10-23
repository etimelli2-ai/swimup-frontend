// Adresses françaises / anglaises : table cohérente, aller-retour sans perte, routes, sitemap et hreflang.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PAGES_FIXES, PAGES_SLUG, versEn, versFr, estEn, localiser, paireDe } from '../src/lib/chemins.mjs'
import { construireHead } from '../src/lib/seo.mjs'
import { GUIDES } from '../src/content/guidesCommercants.js'
import { METIERS } from '../src/content/metiersAvis.mjs'

const lire = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8')

test('chaque page fixe : aller-retour fr <-> en', () => {
  for (const [fr, en] of PAGES_FIXES) {
    assert.equal(versEn(fr), en); assert.equal(versFr(en), fr)
    assert.ok(en === '/en' || en.startsWith('/en/'), en)
    assert.ok(estEn(en) && !estEn(fr))
  }
  assert.equal(new Set(PAGES_FIXES.map(p => p[1])).size, PAGES_FIXES.length, 'adresses anglaises uniques')
})

test('guides et métiers : un slug anglais pour chaque slug français, et inversement', () => {
  const [, , guides] = PAGES_SLUG.find(p => p[0] === '/aide-commercants/')
  const [, , metiers] = PAGES_SLUG.find(p => p[0] === '/avis-google/')
  assert.deepEqual(Object.keys(guides).sort(), GUIDES.map(g => g.slug).sort())
  assert.deepEqual(Object.keys(metiers).sort(), METIERS.map(m => m.slug).sort())
  for (const g of GUIDES) assert.equal(versFr(versEn('/aide-commercants/' + g.slug)), '/aide-commercants/' + g.slug)
  for (const m of METIERS) assert.equal(versFr(versEn('/avis-google/' + m.slug)), '/avis-google/' + m.slug)
})

test('requête et ancre conservées, pages sans version anglaise inchangées', () => {
  assert.equal(versEn('/inscription?src=guide'), '/en/sign-up?src=guide')
  assert.equal(versFr('/en/plans#prix'), '/offres#prix')
  assert.equal(versEn('/login'), null)
  assert.equal(localiser('/login', 'en'), '/login')
  assert.equal(localiser('/client/outils', 'en'), '/client/outils')
  assert.equal(localiser('/offres', 'en'), '/en/plans')
  assert.equal(localiser('/en/plans', 'fr'), '/offres')
  assert.equal(localiser('/offres', 'fr'), '/offres')
  assert.equal(versEn('/aide-commercants/inconnu'), null)
})

test('toute adresse anglaise a une route dans App.jsx', () => {
  const app = lire('src/App.jsx')
  const toutes = [...PAGES_FIXES.map(p => p[1]), ...PAGES_SLUG.map(p => p[1].slice(0, -1) + '/:slug')]
  for (const en of toutes) {
    const route = en.replace(/\/:slug$/, '/:slug')
    const ok = app.includes(`path="${route}"`) || app.includes(`path="${route.replace(':slug', ':metier')}"`)
    assert.ok(ok, 'route ' + en)
  }
})

test('sitemap : chaque page a ses deux versions avec hreflang', () => {
  const site = lire('public/sitemap.xml')
  const urls = [...site.matchAll(/<loc>https:\/\/swimup\.net(.*?)<\/loc>/g)].map(m => m[1] || '/')
  for (const u of urls) {
    const p = paireDe(u)
    assert.ok(p, 'pas de pendant pour ' + u)
    assert.ok(urls.includes(p.fr) && urls.includes(p.en), 'sitemap incomplet pour ' + u)
  }
  assert.equal((site.match(/hreflang="x-default"/g) || []).length, urls.length)
})

test('balises : hreflang fr/en/x-default et og:locale selon la langue de la page', () => {
  const fr = construireHead({ title: 'T', description: 'D', path: '/offres' })
  const en = construireHead({ title: 'T', description: 'D', path: '/en/plans' })
  for (const h of [fr, en]) {
    assert.deepEqual(h.alternates, [['fr', 'https://swimup.net/offres'], ['en', 'https://swimup.net/en/plans'], ['x-default', 'https://swimup.net/en/plans']])
  }
  const loc = (h) => h.metas.find(m => m[1] === 'og:locale')[2]
  assert.equal(loc(fr), 'fr_FR'); assert.equal(loc(en), 'en_US')
  assert.deepEqual(construireHead({ title: 'T', path: '/offres', noindex: true }).alternates, [])
  assert.deepEqual(construireHead({ title: 'T', path: '/login' }).alternates, [])
})
