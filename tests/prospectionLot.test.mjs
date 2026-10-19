import { test } from 'node:test'
import assert from 'node:assert/strict'
import { estContacte, estMasquee, compterMasquees, visibles, aCompleter, eligiblesEnvoi, emailValide, lienRechercheGoogle, PAUSE_ENTRE_MAILS_MS, aEnvoyerMaintenant } from '../src/lib/prospectionLot.mjs'

const P = [
  { id: 1, nom: 'Avec mail', email: 'a@x.fr' },
  { id: 2, nom: 'Sans mail' },
  { id: 3, nom: 'Sans mail appelé', dernier_contact_at: '2026-10-17' },
  { id: 4, nom: 'Mail déjà envoyé', email: 'd@x.fr', email_envoye: 1 },
  { id: 5, nom: 'A dit stop', email: 'e@x.fr', a_dit_stop: true },
  { id: 6, nom: 'Autre sans mail' },
]

test('masquées : sans email et jamais contactées, jamais supprimées', () => {
  assert.equal(estContacte(P[2]), true)
  assert.deepEqual(P.filter(estMasquee).map(p => p.id), [2, 6])
  assert.equal(compterMasquees(P), 2)
})

test('visibles : les fiches sans email sont cachées par défaut, sauf contactées', () => {
  assert.deepEqual(visibles(P, 'tous').map(p => p.id), [1, 3, 4, 5])
  assert.deepEqual(visibles(P, 'tous', true).map(p => p.id), [1, 2, 3, 4, 5, 6])
  assert.deepEqual(visibles(P, 'a_contacter').map(p => p.id), [1, 5])
  assert.deepEqual(visibles(P, 'sans_email').map(p => p.id), [2, 3, 6])
  assert.deepEqual(visibles(P, 'contactes').map(p => p.id), [3, 4])
})

test('une par une : fiches sans email, pas déjà passées', () => {
  assert.deepEqual(aCompleter(P).map(p => p.id), [2, 6])
  assert.deepEqual(aCompleter(P, new Set([2])).map(p => p.id), [6])
})

test('envoi en lot : email, jamais contacté, pas d\'opposition', () => {
  assert.deepEqual(eligiblesEnvoi(P).map(p => p.id), [1])
})

test('email valide comme côté serveur', () => {
  assert.equal(emailValide(' contact@salon.fr '), true)
  assert.equal(emailValide('contact@salon'), false)
  assert.equal(emailValide('pas un mail'), false)
  assert.equal(emailValide(null), false)
})

test('recherche Google : nom, ville et « email contact »', () => {
  const url = lienRechercheGoogle({ nom: 'NS Elec', ville: '94140' })
  assert.equal(url, 'https://www.google.com/search?q=NS%20Elec%2094140%20email%20contact')
  assert.match(lienRechercheGoogle({ nom: 'X', adresse: '1 rue A, Lyon' }), /1%20rue%20A/)
})

test('pause entre mails : courte, sous la limite de 2 requêtes par seconde de Resend', () => {
  assert.ok(PAUSE_ENTRE_MAILS_MS >= 500 && PAUSE_ENTRE_MAILS_MS <= 1000)
})

test('à envoyer maintenant : reste du plafond du jour', () => {
  const e = [1, 2, 3, 4, 5].map(id => ({ id }))
  assert.equal(aEnvoyerMaintenant(e, 30, 0).length, 5)
  assert.equal(aEnvoyerMaintenant(e, 3, 1).length, 2)
  assert.equal(aEnvoyerMaintenant(e, 3, 3).length, 0)
  assert.equal(aEnvoyerMaintenant(e, 3, 10).length, 0)
})
