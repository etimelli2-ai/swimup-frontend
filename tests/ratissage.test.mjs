import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lignes, resume, pourcentage, tauxEmail, estActive, TOTAL_MAX } from '../src/lib/ratissage.mjs'

test('lignes : une valeur par ligne, virgules et points-virgules acceptés, doublons et vides enlevés', () => {
  assert.deepEqual(lignes('Coiffeur\n  garage  auto \n\ncoiffeur'), ['Coiffeur', 'garage auto'])
  assert.deepEqual(lignes('Lyon, Nantes; 75011'), ['Lyon', 'Nantes', '75011'])
  assert.deepEqual(lignes(null), [])
})

test('resume : nombre de recherches et limites', () => {
  assert.deepEqual(resume('a\nb', 'x\ny\nz'), { metiers: 2, zones: 3, total: 6, trop: false, vide: false })
  assert.equal(resume('', 'x').vide, true)
  const beaucoup = Array.from({ length: 30 }, (_, i) => `m${i}`).join('\n')
  const zones = Array.from({ length: TOTAL_MAX / 30 + 1 }, (_, i) => `z${i}`).join('\n')
  assert.equal(resume(beaucoup, zones).trop, true)
})

test('pourcentage borné, taux d\'email absent tant qu\'il n\'y a rien', () => {
  assert.equal(pourcentage(1, 4), 25)
  assert.equal(pourcentage(5, 4), 100)
  assert.equal(pourcentage(0, 0), 0)
  assert.equal(tauxEmail(0, 0), null)
  assert.equal(tauxEmail(8, 3), 38)
})

test('estActive : en cours ou en pause seulement', () => {
  assert.equal(estActive({ statut: 'en_cours' }), true)
  assert.equal(estActive({ statut: 'pause' }), true)
  assert.equal(estActive({ statut: 'termine' }), false)
  assert.equal(estActive(null), false)
})
