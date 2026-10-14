import test from 'node:test'
import assert from 'node:assert/strict'
import { lienMessagerie, prochaineEtape } from '../src/lib/parcoursClient.mjs'

test('lienMessagerie : webmail connu proposé, domaine inconnu ou email vide sans bouton', () => {
  assert.equal(lienMessagerie('toi@gmail.com').nom, 'Gmail')
  assert.equal(lienMessagerie('TOI@Hotmail.fr').nom, 'Outlook')
  assert.equal(lienMessagerie('toi@monrestaurant.fr'), null)
  assert.equal(lienMessagerie(''), null)
  assert.equal(lienMessagerie(undefined), null)
})

test('prochaineEtape : offre regardée avant l\'inscription, sinon la commande', () => {
  assert.equal(prochaineEtape('premium'), '/client/premium')
  assert.equal(prochaineEtape('business'), '/client/premium')
  assert.equal(prochaineEtape(null), '/client/payer')
  assert.equal(prochaineEtape('autre'), '/client/payer')
})
