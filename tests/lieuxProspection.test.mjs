// Tirage de codes postaux pour la prospection.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PAYS, tousLesLieux, tirerLieux, cleDejaFait, paysParDefaut } from '../src/lib/lieuxProspection.mjs'

// générateur pseudo-aléatoire reproductible
const graine = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
const idsDe = (...noms) => PAYS.filter(p => noms.includes(p.pays)).map(p => p.id)

test('20 choix, langues valides, identifiants uniques, aucun pays d\'Afrique ni du Maghreb', () => {
  assert.equal(PAYS.length, 20)
  assert.equal(new Set(PAYS.map(p => p.id)).size, 20)
  for (const p of PAYS) { assert.ok(['fr', 'en'].includes(p.langue), p.pays); assert.ok(p.codes.length > 0, p.pays) }
  const noms = PAYS.map(p => p.pays).join('|')
  assert.ok(!/Maroc|Algérie|Tunisie|Nigeria|Ghana|Kenya|Afrique|Sénégal|Cameroun|Congo|Ouganda|Zambie|Madagascar/.test(noms))
  for (const voulu of ['France', 'Australie', 'Nouvelle-Zélande', 'Royaume-Uni', 'États-Unis', 'Irlande', 'Suisse', 'Belgique']) assert.ok(noms.includes(voulu), voulu)
})

test('par défaut : les pays principaux cochés, petits territoires décochés', () => {
  const d = paysParDefaut()
  for (const n of ['France', 'Australie', 'Nouvelle-Zélande', 'États-Unis', 'Royaume-Uni']) assert.ok(d.includes(idsDe(n)[0]), n)
  for (const n of ['Jersey', 'Bermudes', 'Guernesey', 'Île de Man']) assert.ok(!d.includes(idsDe(n)[0]), n)
})

test('codes : aucun doublon, lisibles par Google, moins de 100 signes, format du pays', () => {
  const lieux = tousLesLieux()
  assert.equal(new Set(lieux.map(l => l.ville)).size, lieux.length)
  for (const l of lieux) { assert.ok(l.ville.length <= 100); assert.ok(!/undefined|null|,\s*$/.test(l.ville), l.ville) }
  const de = (nom) => tousLesLieux(idsDe(nom)).map(l => l.ville)
  assert.ok(de('France').every(v => /^\d{5} .+, France$/.test(v)), 'France : 5 chiffres + commune')
  assert.ok(de('États-Unis').every(v => /^\d{5} .+, [A-Z]{2}, USA$/.test(v)), 'ZIP + ville + État')
  assert.ok(de('Australie').every(v => /^\d{4} .+, Australia$/.test(v)))
  assert.ok(de('Nouvelle-Zélande').every(v => /^\d{4} .+, New Zealand$/.test(v)))
  assert.ok(de('Belgique').every(v => /^\d{4} .+, Belgique$/.test(v)))
  assert.ok(de('Suisse').every(v => /^\d{4} .+, Suisse$/.test(v)))
  assert.ok(de('Singapour').every(v => /^Singapore \d{6}$/.test(v)))
  assert.ok(de('Canada (Québec)').every(v => /^[A-Z]\d[A-Z] .+, QC, Canada$/.test(v)))
  assert.ok(de('Canada (hors Québec)').every(v => /^[A-Z]\d[A-Z] .+, [A-Z]{2}, Canada$/.test(v)))
})

test('Québec = français, reste du Canada = anglais', () => {
  assert.equal(PAYS.find(p => p.id === 'qc').langue, 'fr')
  assert.equal(PAYS.find(p => p.id === 'ca').langue, 'en')
})

test('on tire 5 codes différents, dans 5 pays différents (pays cochés par défaut)', () => {
  for (let s = 1; s <= 30; s++) {
    const t = tirerLieux({ ids: paysParDefaut(), hasard: graine(s) })
    assert.equal(t.length, 5)
    assert.equal(new Set(t.map(l => l.ville)).size, 5)
    assert.equal(new Set(t.map(l => l.pays)).size, 5)
    assert.ok(t.every(l => paysParDefaut().includes(l.id)))
  }
})

test('seuls les pays cochés sont utilisés ; moins de pays que de lieux : plusieurs codes dans le même pays', () => {
  const ids = idsDe('Australie', 'Nouvelle-Zélande')
  for (let s = 1; s <= 20; s++) {
    const t = tirerLieux({ ids, hasard: graine(s) })
    assert.equal(t.length, 5)
    assert.ok(t.every(l => ids.includes(l.id)))
    assert.equal(new Set(t.map(l => l.ville)).size, 5)
  }
  assert.deepEqual(tirerLieux({ ids: [], hasard: graine(1) }), [])
  const un = tirerLieux({ ids: idsDe('Monaco'), hasard: graine(1) })
  assert.equal(un.length, 1, 'Monaco n\'a qu\'un seul code')
})

test('le tirage varie vraiment et touche les deux langues', () => {
  const langues = new Set(), pays = new Set(), codes = new Set()
  for (let s = 1; s <= 80; s++) tirerLieux({ ids: paysParDefaut(), hasard: graine(s) }).forEach(l => { langues.add(l.langue); pays.add(l.pays); codes.add(l.ville) })
  assert.deepEqual([...langues].sort(), ['en', 'fr'])
  assert.equal(pays.size, paysParDefaut().length)
  assert.ok(codes.size > 150)
})

test('un code déjà cherché avec tous les métiers ne revient pas ; s\'il reste un métier, il reste tirable', () => {
  const ids = idsDe('Monaco', 'Luxembourg')
  const deja = new Set(tousLesLieux(ids).map(l => cleDejaFait('Coiffeur', l.ville)))
  for (let s = 1; s <= 40; s++) assert.deepEqual(tirerLieux({ ids, metiers: ['Coiffeur'], dejaFaits: deja, hasard: graine(s) }), [])
  assert.equal(tirerLieux({ ids, metiers: ['Plombier'], dejaFaits: deja, hasard: graine(1) }).length, 5, 'autre métier : de nouveau permis')
  assert.equal(tirerLieux({ ids, metiers: ['Coiffeur', 'Plombier'], dejaFaits: deja, hasard: graine(1) }).length, 5, 'un des deux métiers reste à faire')
  const tout = new Set(tousLesLieux(ids).flatMap(l => ['Coiffeur', 'Plombier'].map(m => cleDejaFait(m, l.ville))))
  assert.deepEqual(tirerLieux({ ids, metiers: ['Coiffeur', 'Plombier'], dejaFaits: tout }), [])
  assert.deepEqual(tirerLieux({ ids, metiers: [], dejaFaits: new Set(), hasard: graine(2) }).length, 5, 'sans métier : tirage simple')
})

test('on peut tirer beaucoup de codes (ratissage) : tous différents, jamais plus que disponible', () => {
  const t = tirerLieux({ n: 50, ids: paysParDefaut(), hasard: graine(7) })
  assert.equal(t.length, 50)
  assert.equal(new Set(t.map(l => l.ville)).size, 50)
  assert.equal(tirerLieux({ n: 10000, ids: paysParDefaut(), hasard: graine(7) }).length, tousLesLieux(paysParDefaut()).length)
})
