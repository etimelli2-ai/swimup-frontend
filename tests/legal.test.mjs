// Garde-fous de conformité : pages légales présentes et reliées, aucune police ou script tiers
// chargé sans le dire, pas de blocage du zoom, info avant paiement et mentions sous les formulaires.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { LIENS_LEGAUX, EDITEUR, PRIX } from '../src/lib/legal.mjs'

const lire = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8')
const app = lire('src/App.jsx')

test('les 6 pages légales ont une route, un lien et un prérendu', () => {
  const attendues = ['/mentions-legales', '/confidentialite', '/cookies', '/cgu', '/cgv', '/retractation']
  assert.deepEqual(LIENS_LEGAUX.map(l => l[0]).sort(), [...attendues].sort())
  const prerendu = lire('src/prerender-entry.jsx')
  const sitemap = lire('public/sitemap.xml')
  for (const p of attendues) {
    assert.ok(app.includes(`path="${p}"`), 'route ' + p)
    assert.ok(prerendu.includes(`'${p}'`), 'prérendu ' + p)
    assert.ok(sitemap.includes(`https://swimup.net${p}<`), 'sitemap ' + p)
  }
})

test('les liens légaux sont dans tous les pieds de page publics et dans l\'espace connecté', () => {
  for (const f of ['src/components/CadrePublic.jsx', 'src/pages/AideCommercants.jsx', 'src/pages/PublicCommander.jsx', 'src/pages/PublicSuivi.jsx', 'src/components/AuthShell.jsx', 'src/pages/Login.jsx', 'src/pages/Register.jsx', 'src/pages/InscriptionClient.jsx', 'src/components/Layout.jsx']) {
    assert.match(lire(f), /<LiensLegaux/, f)
  }
})

test('aucune information légale inventée : adresse, SIRET et RCS restent marqués [À REMPLIR] tant qu\'ils ne sont pas fournis', () => {
  // Quand tu remplis un champ de src/lib/legal.mjs, retire-le de cette liste.
  for (const k of ['adresse', 'siret', 'rcs']) {
    assert.match(EDITEUR[k], /^\[À REMPLIR/, k)
  }
})

test('prix des CGV = prix du produit', () => {
  assert.equal(PRIX.avisSansCompte, Number(lire('src/pages/PublicCommander.jsx').match(/PRIX_UNITAIRE = (\d+)/)[1]))
})

test('aucune police ni script tiers dans index.html, zoom autorisé', () => {
  const html = lire('index.html')
  assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(html), 'Google Fonts')
  assert.ok(!/<script[^>]+src="https?:/.test(html), 'script externe')
  assert.ok(!/maximum-scale|user-scalable\s*=\s*no/.test(html), 'zoom bloqué')
  assert.match(lire('src/main.jsx'), /@fontsource\/bricolage-grotesque/)
})

test('seul Umami est chargé en tiers, et seulement via mesure.mjs', () => {
  const hotes = new Set()
  for (const f of ['src/lib/mesure.mjs']) for (const m of lire(f).matchAll(/'https:\/\/([^/']+)/g)) hotes.add(m[1])
  assert.deepEqual([...hotes], ['cloud.umami.is'])
  assert.ok(!/gtag|googletagmanager|fbq\(|connect\.facebook|hotjar|clarity\.ms/.test(lire('index.html') + lire('src/main.jsx') + app))
})

test('info avant paiement et mentions d\'information sous les formulaires', () => {
  for (const f of ['src/pages/PublicCommander.jsx', 'src/pages/client/ClientPaiement.jsx', 'src/pages/client/ClientPremium.jsx']) assert.match(lire(f), /<InfoAvantPaiement/, f)
  for (const f of ['src/pages/Login.jsx', 'src/pages/Register.jsx', 'src/pages/InscriptionClient.jsx', 'src/pages/MotDePasseOublie.jsx', 'src/pages/ReinitialiserMotDePasse.jsx', 'src/pages/client/ClientCampagnes.jsx', 'src/pages/client/ClientEquipe.jsx', 'src/pages/Profil.jsx', 'src/pages/PublicSuivi.jsx']) assert.match(lire(f), /<MentionDonnees/, f)
})

test('aucune case à cocher pré-cochée', () => {
  for (const f of ['src/pages/client/ClientCampagnes.jsx', 'src/pages/client/ClientOutils.jsx']) assert.match(lire(f), /\[attestation, setAttestation\] = useState\(false\)/, f)
  assert.match(lire('src/pages/admin/AdminProspection.jsx'), /\[essaiGratuit, setEssaiGratuit\] = useState\(false\)/)
  assert.ok(!/setEssaiGratuit\(true\)/.test(lire('src/pages/admin/AdminProspection.jsx')))
})
