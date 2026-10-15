// Garde-fou : une route de l'appli (App.jsx) doit être servie par le serveur statique, sinon elle répond 404.
// Le serveur (serve, sans --single) ne connaît que : les fichiers, les pages prérendues et public/serve.json.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const conf = JSON.parse(readFileSync(new URL('../public/serve.json', import.meta.url), 'utf8'))
const prerendu = readFileSync(new URL('../src/prerender-entry.jsx', import.meta.url), 'utf8')

const sources = conf.rewrites.map(r => r.source)
const couvert = (chemin) => sources.some(s => s === chemin || (s.endsWith('/**') && (chemin === s.slice(0, -3) || chemin.startsWith(s.slice(0, -2)))))

test('chaque route absolue de App.jsx est servie (rewrite) ou prérendue', () => {
  const chemins = [...app.matchAll(/path="(\/[^"*]*)"/g)].map(m => m[1].replace(/\/:[^/]+/g, ''))
  assert.ok(chemins.length > 10)
  // pages publiques prérendues : le fichier .html existe après le build
  const prerendues = ['/aide-commercants', '/outils/lien-avis-google', '/outils/modeles-reponses-avis-google', '/outils/diagnostic-fiche-google', '/avis-google', '/inscription', '/confidentialite', '/mentions-legales', '/cookies', '/cgu', '/cgv', '/retractation']
  for (const p of prerendues.filter(p => p !== '/aide-commercants')) assert.ok(prerendu.includes(`'${p}'`), p)
  const manquantes = chemins.filter(c => !couvert(c) && !prerendues.includes(c))
  assert.deepEqual(manquantes, [])
})

test('routes enfants des zones /client et /admin couvertes par /**', () => {
  for (const c of ['/client/reputation', '/client/aide/obtenir-des-avis-google', '/client/success', '/admin/users']) assert.ok(couvert(c), c)
})

test('la commande et le suivi restent servis par l\'appli', () => {
  for (const c of ['/', '/commander', '/suivi']) assert.ok(couvert(c), c)
})

test('adresse inconnue : aucun rewrite générique', () => {
  assert.ok(!sources.some(s => s === '**' || s === '/**' || s === '/(.*)' || s === '*'))
})
