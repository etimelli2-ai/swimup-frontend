// Messages de prospection : français inchangé, anglais pour l'étranger.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { messageDefaut, sujetDefaut, langueDe } from '../src/lib/messagesProspection.mjs'

const marie = { nom: 'Chez Marie', place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4', note: 4.2, nb_avis: 12 }

test('langueDe : anglais seulement si le serveur le dit, sinon français', () => {
  assert.equal(langueDe({ langue: 'en' }), 'en')
  assert.equal(langueDe({ langue: 'fr' }), 'fr')
  assert.equal(langueDe({}), 'fr')
  assert.equal(langueDe(null), 'fr')
})

test('français : texte exact d\'avant', () => {
  const m = messageDefaut(marie)
  assert.ok(m.startsWith('Bonjour,\n\nJe suis Enzo, je gère SwimUp. En regardant les fiches Google Maps du secteur, je suis tombé sur "Chez Marie". Votre fiche affiche 4,2 sur 5 avec 12 avis.\n\nJ\'ai préparé pour "Chez Marie" le lien direct'))
  assert.ok(m.includes('https://swimup.net/outils/lien-avis-google?src=mail&id='))
  assert.ok(m.includes('https://swimup.net/outils/diagnostic-fiche-google?src=mail'))
  assert.ok(m.includes('https://swimup.net/offres?src=mail'))
  assert.ok(m.endsWith('Bonne journée,\nEnzo\nSwimUp'))
  assert.equal(sujetDefaut(), 'Votre fiche Google Maps : ce qui peut jouer sur sa visibilité')
})

test('anglais : pages anglaises, même engagements RGPD et lien de désinscription', () => {
  const m = messageDefaut(marie, 'en')
  assert.ok(m.startsWith('Hello,'))
  assert.ok(m.includes('https://swimup.net/en/tools/google-review-link?src=mail&id='))
  assert.ok(m.includes('https://swimup.net/en/tools/google-business-profile-checkup?src=mail'))
  assert.ok(m.includes('https://swimup.net/en/plans?src=mail'))
  assert.ok(m.includes('https://swimup.net/en/privacy'))
  assert.ok(m.includes('{{LIEN_STOP}}'))
  assert.ok(m.includes('4.2 out of 5 with 12 reviews'))
  assert.ok(!/[éèêàçùôî]|Bonjour|swimup\.net\/(offres|outils|confidentialite)/.test(m), 'rien de français, aucun lien français')
  assert.match(sujetDefaut('en'), /Google Maps listing/)
})

test('sans note ni identifiant de lieu : on ne cite aucun chiffre, outil vide (jamais de lien cassé)', () => {
  const manuel = { nom: 'Casa Pepe' }
  for (const l of ['fr', 'en']) {
    const m = messageDefaut(manuel, l)
    assert.ok(!/\d out of 5|sur 5/.test(m))
    assert.ok(!m.includes('id='))
    assert.ok(!m.includes('undefined') && !m.includes('null'))
  }
})

test('la langue vient de la fiche quand on ne précise rien', () => {
  assert.equal(messageDefaut({ ...marie, langue: 'en' }), messageDefaut(marie, 'en'))
  assert.equal(messageDefaut({ ...marie, langue: 'fr' }), messageDefaut(marie, 'fr'))
})
