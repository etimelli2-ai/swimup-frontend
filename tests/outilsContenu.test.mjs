import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CHAMPS, SECTIONS, remplir } from '../src/lib/modelesReponses.mjs'
import { GROUPES, TOTAL, TOUS_LES_POINTS, analyser, listeAFaire } from '../src/lib/diagnosticFiche.mjs'

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('modèles : 12 modèles, identifiants uniques, seulement des champs connus', () => {
  const tous = SECTIONS.flatMap(s => s.modeles)
  assert.equal(tous.length, 12)
  assert.equal(new Set(tous.map(m => m.id)).size, 12)
  const connus = new Set(CHAMPS.map(c => c.cle))
  for (const m of tous) for (const [, cle] of m.texte.matchAll(/\{(\w+)\}/g)) assert.ok(connus.has(cle), `${m.id} : {${cle}}`)
})

test('modèles : champs vides laissés entre crochets, champs remplis insérés', () => {
  const t = 'Merci {prenom} pour {element}. {commerce}'
  assert.equal(remplir(t, {}), 'Merci [prénom] pour [élément précis]. [nom de l\'établissement]')
  assert.equal(remplir(t, { prenom: ' Camille ', element: 'les croissants', commerce: 'Dupont' }), 'Merci Camille pour les croissants. Dupont')
  assert.equal(remplir('{inconnu}', {}), '{inconnu}')
})

test('modèles : aucune promesse de résultat, de compensation ni demande de note', () => {
  const texte = SECTIONS.flatMap(s => s.modeles.map(m => m.texte)).join(' ').toLowerCase()
  for (const mot of ['garanti', 'remboursement', 'gratuit', '5 étoiles', 'cinq étoiles', 'offert']) assert.ok(!texte.includes(mot), mot)
})

test('diagnostic : points uniques, score = nombre de points cochés', () => {
  assert.equal(new Set(TOUS_LES_POINTS.map(p => p.id)).size, TOTAL)
  assert.equal(TOTAL, GROUPES.reduce((n, g) => n + g.items.length, 0))
  assert.deepEqual([analyser([]).faits, analyser([]).total], [0, TOTAL])
  const a = analyser(['nom', 'horaires', 'inconnu'])
  assert.equal(a.faits, 2)
  assert.equal(a.premiers.length, 3)
  assert.ok(!a.premiers.some(p => ['nom', 'horaires'].includes(p.id)))
  assert.equal(analyser(TOUS_LES_POINTS.map(p => p.id)).aFaire.length, 0)
})

test('diagnostic : la liste à faire reprend uniquement les points non cochés', () => {
  const l = listeAFaire(['nom'])
  assert.ok(!l.includes('vrai nom de mon établissement'))
  assert.ok(l.includes('horaires habituels'))
  assert.equal(listeAFaire(TOUS_LES_POINTS.map(p => p.id)), 'Rien à faire sur cette liste.')
})

test('diagnostic : les liens internes pointent vers des routes qui existent', () => {
  for (const p of TOUS_LES_POINTS.filter(p => p.lien)) assert.ok(app.includes(`path="${p.lien.href}"`), p.lien.href)
})
