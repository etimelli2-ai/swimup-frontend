// Tirage de lieux pour la prospection.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PAYS, tousLesLieux, tirerLieux, cleDejaFait, metierPourLieu, METIER_EN } from '../src/lib/lieuxProspection.mjs'

// générateur pseudo-aléatoire reproductible
const graine = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }

test('liste : langues valides, villes non vides, pas de doublon, aucun pays du Maghreb', () => {
  const vus = new Set()
  for (const p of PAYS) {
    assert.ok(['fr', 'en'].includes(p.langue), p.pays)
    assert.ok(p.villes.length > 0, p.pays)
    assert.ok(!vus.has(p.pays), 'doublon ' + p.pays); vus.add(p.pays)
  }
  const noms = PAYS.map(p => p.pays).join('|')
  assert.ok(!/Maroc|Algérie|Tunisie/.test(noms), 'le français n\'y est pas langue officielle')
  const lieux = tousLesLieux()
  assert.equal(new Set(lieux.map(l => l.ville)).size, lieux.length, 'aucune ville en double')
})

test('chaque lieu est une recherche lisible par Google (ville + pays ou région), moins de 100 signes', () => {
  for (const l of tousLesLieux()) {
    assert.ok(l.ville.length <= 100)
    assert.ok(!/undefined|null|,\s*$/.test(l.ville), l.ville)
  }
  const m = tousLesLieux().map(l => l.ville)
  assert.ok(m.includes('Lyon, France') && m.includes('Austin, TX, USA') && m.includes('Montréal, QC, Canada') && m.includes('Singapore'))
})

test('filtres : francophones / anglophones', () => {
  assert.ok(tousLesLieux('fr').every(l => l.langue === 'fr'))
  assert.ok(tousLesLieux('en').every(l => l.langue === 'en'))
  assert.equal(tousLesLieux('fr').length + tousLesLieux('en').length, tousLesLieux('tous').length)
  const t = tirerLieux({ filtre: 'en', hasard: graine(1) })
  assert.ok(t.every(l => l.langue === 'en'))
})

test('on tire 5 lieux différents, dans 5 pays différents', () => {
  for (let s = 1; s <= 30; s++) {
    const t = tirerLieux({ hasard: graine(s) })
    assert.equal(t.length, 5)
    assert.equal(new Set(t.map(l => l.ville)).size, 5)
    assert.equal(new Set(t.map(l => l.pays)).size, 5)
  }
})

test('le tirage varie vraiment et touche les deux langues', () => {
  const langues = new Set(), pays = new Set()
  for (let s = 1; s <= 60; s++) tirerLieux({ hasard: graine(s) }).forEach(l => { langues.add(l.langue); pays.add(l.pays) })
  assert.deepEqual([...langues].sort(), ['en', 'fr'])
  assert.ok(pays.size > 30)
})

test('les lieux déjà cherchés avec ce métier ne reviennent pas', () => {
  const tous = tousLesLieux('fr').filter(l => l.pays === 'Monaco' || l.pays === 'Luxembourg')
  // tout Monaco + Luxembourg déjà fait avec « Coiffeur » → jamais retirés
  const deja = new Set(tous.map(l => cleDejaFait('Coiffeur', l.ville)))
  for (let s = 1; s <= 40; s++) {
    const t = tirerLieux({ metier: 'Coiffeur', dejaFaits: deja, hasard: graine(s) })
    assert.ok(t.every(l => l.pays !== 'Monaco' && l.pays !== 'Luxembourg'))
  }
  // avec un autre métier, ils sont de nouveau permis
  const t2 = []; for (let s = 1; s <= 200; s++) t2.push(...tirerLieux({ metier: 'Plombier', dejaFaits: deja, hasard: graine(s) }))
  assert.ok(t2.some(l => l.pays === 'Monaco'))
})

test('métier traduit pour les lieux anglophones, jamais pour les francophones', () => {
  assert.equal(metierPourLieu('Coiffeur', 'en'), 'Hair salon')
  assert.equal(metierPourLieu('Coiffeur', 'fr'), 'Coiffeur')
  assert.equal(metierPourLieu('Métier libre', 'en'), 'Métier libre')
})

test('moins de lieux disponibles que demandé : on rend ce qu\'il y a, sans planter', () => {
  const tous = new Set(tousLesLieux('tous').map(l => cleDejaFait('', l.ville)))
  assert.deepEqual(tirerLieux({ metier: '', dejaFaits: tous }), [])
  assert.equal(tirerLieux({ n: 500, hasard: graine(3) }).length, tousLesLieux().length)
})
