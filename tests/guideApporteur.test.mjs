import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MESSAGES, REGLES, QUESTIONS, remplirLiens, SOMMAIRE } from '../src/content/guideApporteur.mjs'

test('les liens de l’apporteur sont remplis, sans accolade restante', () => {
  for (const m of MESSAGES) {
    const t = remplirLiens(m.texte, { origine: 'https://swimup.net', code: 'K7M2PQX' })
    assert.ok(!t.includes('{'), m.id)
    if (m.texte.includes('{outil}')) assert.ok(t.includes('https://swimup.net/outils/lien-avis-google?ref=K7M2PQX'), m.id)
  }
})

test('chaque message dit qui parle, et laisse un moyen d’arrêter', () => {
  for (const m of MESSAGES) {
    assert.match(m.texte, /apporteur indépendant/i, m.id)
    if (m.id !== 'sur-place' && m.id !== 'telephone') assert.match(m.texte, /stop|(écris|écrirai|relance) plus/i, m.id)
  }
})

test('aucune promesse de résultat dans les messages', () => {
  const interdit = /garanti|assur[ée]|n°\s?1|numéro un|classement|plus de clients|résultat/i
  for (const m of MESSAGES) assert.doesNotMatch(m.texte, interdit, m.id)
})

test('le mail dit que SwimUp vend aussi des commandes d’avis', () => {
  const mail = MESSAGES.find(m => m.id === 'mail')
  assert.match(mail.texte, /commandes d'avis/)
})

test('règles et questions présentes, ancres du sommaire uniques', () => {
  assert.ok(REGLES.length >= 5 && QUESTIONS.length >= 4)
  assert.equal(new Set(SOMMAIRE.map(s => s[0])).size, SOMMAIRE.length)
})
