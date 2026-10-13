import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyserLien } from '../src/lib/lienAvis.mjs'

const ID = 'ChIJN1t_tDeuEmsRUsoyG83frY4'

test('un identifiant de lieu devient un lien writereview', () => {
  const r = analyserLien(`  ${ID}  `)
  assert.equal(r.ok, true)
  assert.equal(r.lien, `https://search.google.com/local/writereview?placeid=${ID}`)
  assert.equal(r.type, 'identifiant')
})

test('le lien « Demander des avis » est gardé, avec ou sans /review et sans https', () => {
  for (const e of ['https://g.page/r/CaBc123xyz-_/review', 'https://g.page/r/CaBc123xyz-_', 'g.page/r/CaBc123xyz-_/review/']) {
    const r = analyserLien(e)
    assert.equal(r.ok, true, e)
    assert.equal(r.lien, 'https://g.page/r/CaBc123xyz-_/review')
  }
})

test('un lien Google qui contient placeid est converti', () => {
  assert.equal(analyserLien(`https://search.google.com/local/reviews?placeid=${ID}&q=x`).lien, `https://search.google.com/local/writereview?placeid=${ID}`)
  assert.equal(analyserLien(`https://www.google.fr/maps/place/x?place_id=${ID}`).lien, `https://search.google.com/local/writereview?placeid=${ID}`)
})

test('un lien vers la fiche Maps est refusé avec une explication', () => {
  for (const e of ['https://maps.app.goo.gl/AbCdEf123', 'https://www.google.com/maps/place/Mon+Commerce/@48.8,2.3,17z', 'https://goo.gl/maps/xyz']) {
    const r = analyserLien(e)
    assert.equal(r.ok, false, e)
    assert.equal(r.code, 'fiche')
    assert.match(r.erreur, /formulaire d'avis/)
  }
})

test('entrées vides, étrangères ou dangereuses refusées', () => {
  assert.equal(analyserLien('').code, 'vide')
  assert.equal(analyserLien('   ').code, 'vide')
  assert.equal(analyserLien(null).code, 'vide')
  for (const e of ['bonjour', 'https://exemple.fr/r/abc', 'javascript:alert(1)', 'https://user:pass@g.page/r/abcd/review', 'https://g.page:8080/r/abcd/review', 'https://evil.test/?placeid=' + ID, 'x'.repeat(600)]) {
    assert.equal(analyserLien(e).ok, false, e.slice(0, 40))
  }
})
