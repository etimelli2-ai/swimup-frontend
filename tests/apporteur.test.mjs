import { test } from 'node:test'
import assert from 'node:assert/strict'
import { codeDepuisRecherche, retenirCode, lireCode, oublierCode } from '../src/lib/apporteur.mjs'

function faux() {
  const m = new Map()
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }
}

test('lit le code dans l’adresse, en majuscules', () => {
  assert.equal(codeDepuisRecherche('?ref=abcd234'), 'ABCD234')
  assert.equal(codeDepuisRecherche('?src=mail&ref=XY7K2M9'), 'XY7K2M9')
})

test('ignore les codes absents ou bizarres', () => {
  assert.equal(codeDepuisRecherche(''), null)
  assert.equal(codeDepuisRecherche('?ref='), null)
  assert.equal(codeDepuisRecherche('?ref=abc'), null)
  assert.equal(codeDepuisRecherche('?ref=<script>'), null)
  assert.equal(codeDepuisRecherche('?ref=' + 'A'.repeat(13)), null)
})

test('le code est gardé 30 jours puis oublié', () => {
  const s = faux()
  const t0 = 1_000_000
  assert.equal(retenirCode('ABCD234', { stockage: s, maintenant: t0 }), true)
  assert.equal(lireCode({ stockage: s, maintenant: t0 + 29 * 86400000 }), 'ABCD234')
  assert.equal(lireCode({ stockage: s, maintenant: t0 + 31 * 86400000 }), null)
  assert.equal(lireCode({ stockage: s, maintenant: t0 }), null)   // supprimé à l'expiration
})

test('refuse de stocker un code invalide ; oublier le vide', () => {
  const s = faux()
  assert.equal(retenirCode('x', { stockage: s }), false)
  retenirCode('ABCD234', { stockage: s })
  oublierCode({ stockage: s })
  assert.equal(lireCode({ stockage: s }), null)
})

test('stockage cassé : aucune exception', () => {
  const casse = { getItem() { throw new Error('non') }, setItem() { throw new Error('non') }, removeItem() { throw new Error('non') } }
  assert.equal(retenirCode('ABCD234', { stockage: casse }), false)
  assert.equal(lireCode({ stockage: casse }), null)
  assert.doesNotThrow(() => oublierCode({ stockage: casse }))
})
