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
