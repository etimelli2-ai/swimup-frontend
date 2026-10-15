// Pages « Avis Google par métier » : contenu cohérent, prudent, présent dans le prérendu, le sitemap et les routes.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { METIERS, metierParSlug } from '../src/content/metiersAvis.mjs'
import { CHAMPS } from '../src/lib/modelesReponses.mjs'

const lire = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8')

test('6 métiers, slugs uniques, champs obligatoires renseignés', () => {
  assert.equal(METIERS.length, 6)
  assert.equal(new Set(METIERS.map(m => m.slug)).size, 6)
  for (const m of METIERS) {
    for (const k of ['slug', 'nom', 'titre', 'description', 'intro']) assert.ok(m[k] && m[k].length > 5, `${m.slug}.${k}`)
    assert.ok(m.description.length <= 200, `${m.slug} description trop longue`)
    assert.ok(m.situations.length >= 3 && m.modeles.length === 3 && m.qr.length >= 2 && m.fiche.length >= 2 && m.eviter.length >= 2, m.slug)
    assert.equal(metierParSlug(m.slug), m)
  }
  assert.ok(!metierParSlug('inconnu'))
})

test('modèles : identifiants uniques, seulement des champs connus', () => {
  const tous = METIERS.flatMap(m => m.modeles)
  assert.equal(new Set(tous.map(m => m.id)).size, tous.length)
  const connus = new Set(CHAMPS.map(c => c.cle))
  for (const m of tous) for (const [, cle] of m.texte.matchAll(/\{(\w+)\}/g)) assert.ok(connus.has(cle), `${m.id} : {${cle}}`)
})

test('contenu : aucune promesse de résultat, de compensation ni demande de note, aucune statistique inventée', () => {
  const texte = JSON.stringify(METIERS.map(m => [m.intro, m.situations, m.modeles.map(x => x.texte)])).toLowerCase()
  for (const mot of ['garanti', 'remboursement', 'gratuit', '5 étoiles', 'cinq étoiles', 'offert', 'garantie']) assert.ok(!texte.includes(mot), mot)
  assert.doesNotMatch(texte, /\d+\s?%/, 'pas de pourcentage dans le contenu')
})

test('routes, prérendu et sitemap couvrent l\'index et chaque métier', () => {
  const app = lire('src/App.jsx'), pre = lire('src/prerender-entry.jsx'), site = lire('public/sitemap.xml')
  assert.ok(app.includes('path="/avis-google"') && app.includes('path="/avis-google/:metier"'))
  assert.ok(pre.includes("'/avis-google'") && pre.includes('METIERS.map'))
  assert.ok(site.includes('https://swimup.net/avis-google<'))
  for (const m of METIERS) assert.ok(site.includes(`https://swimup.net/avis-google/${m.slug}<`), m.slug)
})
