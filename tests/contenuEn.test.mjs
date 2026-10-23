// Contenu éditorial anglais (guides, métiers, modèles de réponses, messages d'apporteur) : mêmes données que le
// français, rien d'oublié, rien de français resté dedans, mêmes règles de prudence que la version française.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import guidesEn from '../src/content/en/guides.js'
import metiersEn from '../src/content/en/metiers.js'
import modelesEn from '../src/content/en/modeles.js'
import apporteurEn from '../src/content/en/apporteur.js'
import { GUIDES } from '../src/content/guidesCommercants.js'
import { METIERS } from '../src/content/metiersAvis.mjs'
import { CHAMPS, SECTIONS } from '../src/lib/modelesReponses.mjs'
import { MESSAGES, remplirLiens } from '../src/content/guideApporteur.mjs'
import { definirDictionnaire } from '../src/lib/i18n.js'
import { setLangueCourante } from '../src/lib/langue.mjs'
import { guidesLocalises, guideLocalise, metiersLocalises, metierLocalise, champsLocalises, sectionsLocalisees, messagesLocalises } from '../src/content/langue.mjs'

const textes = (o) => JSON.stringify(o).toLowerCase()
// mots français courants qui ne devraient jamais apparaître dans un texte anglais
const FRANCAIS = /\b(le|les|des|pour|avec|votre|vous|nous|dans|une|est|pas|sur)\b/
const champs = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',')

test('guides : un guide anglais pour chaque guide français, même structure', () => {
  assert.deepEqual(Object.keys(guidesEn).sort(), GUIDES.map(g => g.slug).sort())
  for (const g of GUIDES) {
    const e = guidesEn[g.slug]
    assert.ok(e.titre && e.resume && e.description, g.slug)
    assert.equal(e.sections.length, g.sections.length, g.slug)
    g.sections.forEach((s, i) => {
      const x = e.sections[i]
      assert.equal(x.type, s.type, `${g.slug} #${i} type`)
      assert.equal(x.href, s.href, `${g.slug} #${i} href`)
      assert.equal(x.p.length, s.p.length, `${g.slug} #${i} paragraphes`)
      if (s.type === 'etapes') assert.equal(x.p.filter(p => /^\d+\.\s/.test(p)).length, s.p.filter(p => /^\d+\.\s/.test(p)).length, `${g.slug} étapes`)
      if (s.type === 'lien') assert.ok(x.label, `${g.slug} #${i} label`)
    })
    assert.doesNotMatch(textes(e), FRANCAIS, g.slug + ' contient du français')
  }
})

test('guides : prudence conservée (aucune promesse de résultat, rappel que Google peut changer)', () => {
  for (const e of Object.values(guidesEn)) {
    const t = textes(e)
    assert.doesNotMatch(t, /guarantee[sd]? (you|a|more|that)|will (rank|boost)|number one|\d+ ?%/)
  }
  assert.match(textes(guidesEn['obtenir-des-avis-google']), /official help page/)
  assert.match(textes(guidesEn['avis-injuste-ou-faux']), /not giving legal advice/)
})

test('métiers : mêmes métiers, mêmes modèles (ids), mêmes champs {x}', () => {
  assert.deepEqual(Object.keys(metiersEn).sort(), METIERS.map(m => m.slug).sort())
  for (const m of METIERS) {
    const e = metiersEn[m.slug]
    for (const cle of ['nom', 'titre', 'description', 'intro']) assert.ok(e[cle], `${m.slug} ${cle}`)
    assert.equal(e.situations.length, m.situations.length, m.slug)
    for (const k of ['qr', 'fiche', 'eviter']) assert.equal(e[k].length, m[k].length, `${m.slug} ${k}`)
    assert.deepEqual(Object.keys(e.modeles).sort(), m.modeles.map(x => x.id).sort(), m.slug)
    for (const x of m.modeles) {
      const y = e.modeles[x.id]
      assert.ok(y.nom && y.quand && y.texte, x.id)
      assert.equal(champs(y.texte), champs(x.texte), `${x.id} : champs`)
    }
    assert.doesNotMatch(textes(e), FRANCAIS, m.slug + ' contient du français')
  }
})

test('métiers : mêmes règles que le français (aucune garantie, remboursement, gratuité ni demande de note)', () => {
  for (const e of Object.values(metiersEn)) {
    const t = textes([e.intro, e.situations, Object.values(e.modeles).map(x => x.texte)])
    for (const mot of ['guarantee', 'refund', 'free', '5 star', 'five star', 'gift card', 'discount code']) assert.ok(!t.includes(mot), mot)
    assert.doesNotMatch(t, /\d+\s?%/)
  }
})

test('modèles généraux : mêmes champs, mêmes sections, mêmes modèles', () => {
  assert.deepEqual(Object.keys(modelesEn.champs).sort(), CHAMPS.map(c => c.cle).sort())
  for (const c of Object.values(modelesEn.champs)) assert.ok(c.etiquette && c.exemple && /^\[.+\]$/.test(c.defaut))
  assert.deepEqual(Object.keys(modelesEn.sections).sort(), SECTIONS.map(s => s.id).sort())
  for (const s of SECTIONS) {
    const e = modelesEn.sections[s.id]
    assert.ok(e.titre && e.intro, s.id)
    assert.deepEqual(Object.keys(e.modeles).sort(), s.modeles.map(m => m.id).sort(), s.id)
    for (const m of s.modeles) assert.equal(champs(e.modeles[m.id].texte), champs(m.texte), m.id)
    assert.doesNotMatch(textes(e), FRANCAIS, s.id)
  }
})

test('messages d\'apporteur : mêmes messages, mêmes liens, qui parle et moyen de dire stop', () => {
  assert.deepEqual(Object.keys(apporteurEn).sort(), MESSAGES.map(m => m.id).sort())
  for (const m of MESSAGES) {
    const e = apporteurEn[m.id]
    assert.ok(e.titre && e.pour && e.texte, m.id)
    assert.equal(!!e.objet, !!m.objet, m.id + ' objet')
    assert.equal(champs(e.texte), champs(m.texte), m.id + ' liens')
    assert.match(e.texte, /independent referrer/i, m.id)
    if (m.id !== 'sur-place' && m.id !== 'telephone') assert.match(e.texte, /stop|not (write|follow)/i, m.id)
    assert.doesNotMatch(e.texte, /guarantee|ranking|more customers|results/i, m.id)
    assert.doesNotMatch(textes(Object.values(e)), FRANCAIS, m.id)
  }
  assert.match(apporteurEn.mail.texte, /review orders/)
})

test('liens d\'apporteur en anglais : pages /en/', () => {
  const t = remplirLiens('{outil} {offres}', { origine: 'https://swimup.net', code: 'K7M2PQX', langue: 'en' })
  assert.equal(t, 'https://swimup.net/en/tools/google-review-link?ref=K7M2PQX https://swimup.net/en/plans?ref=K7M2PQX')
  assert.equal(remplirLiens('{outil}', { origine: 'https://swimup.net', code: 'A' }), 'https://swimup.net/outils/lien-avis-google?ref=A')
})

test('accès par langue : français inchangé, anglais par-dessus, repli français sans contenu chargé', async () => {
  setLangueCourante('fr')
  assert.equal(guidesLocalises(), GUIDES)
  assert.equal(metiersLocalises(), METIERS)
  assert.equal(champsLocalises(), CHAMPS)
  assert.equal(sectionsLocalisees(), SECTIONS)
  assert.equal(messagesLocalises(), MESSAGES)
  // anglais sans contenu chargé : français (la page ne casse pas)
  definirDictionnaire({})
  setLangueCourante('en')
  assert.equal(guidesLocalises(), GUIDES)
  // anglais avec contenu chargé
  const { chargerAnglais } = await import('../src/lib/i18n.js')
  await chargerAnglais()
  assert.equal(guideLocalise('get-more-google-reviews').titre, guidesEn['obtenir-des-avis-google'].titre)
  assert.equal(guideLocalise('obtenir-des-avis-google').slug, 'obtenir-des-avis-google')
  assert.equal(guideLocalise('inconnu'), undefined)
  assert.equal(metierLocalise('hair-salon').nom, 'hair salon')
  assert.equal(metierLocalise('coiffeur').slug, 'coiffeur')
  assert.equal(metierLocalise('inconnu'), null)
  assert.equal(champsLocalises().find(c => c.cle === 'prenom').defaut, '[first name]')
  assert.equal(messagesLocalises().find(m => m.id === 'mail').objet, apporteurEn.mail.objet)
  setLangueCourante('fr')
})
