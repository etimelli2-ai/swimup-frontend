// Version anglaise : le dictionnaire couvre tous les textes du code, les {variables} sont conservées,
// et t()/tn() se comportent comme prévu.
import test from 'node:test'
import assert from 'node:assert/strict'
import { scanner } from '../scripts/i18n-scan.mjs'
import { lire } from '../src/lib/en/lire.js'
import dico from '../src/lib/en/index.js'
import commun from '../src/lib/en/commun.js'
import compte from '../src/lib/en/compte.js'
import membre from '../src/lib/en/membre.js'
import client1 from '../src/lib/en/client1.js'
import client2 from '../src/lib/en/client2.js'
import publicZone from '../src/lib/en/public.js'
import guides from '../src/lib/en/guides.js'
import divers from '../src/lib/en/divers.js'
import { t, tn, setLangueCourante, definirDictionnaire, euros, locale, sepDecimal } from '../src/lib/i18n.js'

const ZONES = { commun, compte, membre, client1, client2, public: publicZone, guides, divers }
const vars = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',')
const resultat = scanner()

// Textes volontairement sans traduction : données légales, noms propres identiques dans les deux langues.
const SANS_TRADUCTION = new Set([])

test('aucun texte français en dur dans une fonction (tout passe par t() ou tn())', () => {
  assert.deepEqual(resultat.nonEnveloppes.map(x => `${x.fichier}:${x.ligne} ${x.texte}`), [])
})

test('chaque clé du code a une traduction anglaise', () => {
  const manquantes = [...resultat.cles.keys()].filter(k => !(k in dico) && !SANS_TRADUCTION.has(k))
  assert.deepEqual(manquantes.slice(0, 40), [], `${manquantes.length} clé(s) sans traduction`)
})

test('une clé de pluriel a une forme singulier et une forme pluriel', () => {
  for (const k of resultat.plurielles) {
    if (!(k in dico)) continue
    assert.ok(Array.isArray(dico[k]) && dico[k].length === 2, `pluriel mal formé : ${k}`)
  }
})

test('les {variables} du français se retrouvent dans l\'anglais', () => {
  const erreurs = []
  for (const [k, v] of Object.entries(dico)) {
    const formes = Array.isArray(v) ? v : [v]
    for (const f of formes) if (vars(k) !== vars(f)) erreurs.push(`${k}  =>  ${f}`)
  }
  assert.deepEqual(erreurs.slice(0, 20), [], `${erreurs.length} traduction(s) avec des variables différentes`)
})

test('une même clé n\'a pas deux traductions différentes', () => {
  const vus = new Map()
  const conflits = []
  for (const [zone, texte] of Object.entries(ZONES)) {
    for (const ligne of texte.split('\n')) {
      if (!ligne.trim() || ligne.startsWith('#')) continue
      const i = ligne.indexOf(' ⟹ ')
      if (i < 0) continue
      const cle = ligne.slice(0, i).trim(), val = ligne.slice(i + 3).trim()
      if (vus.has(cle) && vus.get(cle).val !== val) conflits.push(`${cle} (${vus.get(cle).zone} / ${zone})`)
      vus.set(cle, { val, zone })
    }
  }
  assert.deepEqual(conflits, [])
})

test('le lecteur ignore les lignes vides et les commentaires, et lit les pluriels', () => {
  const d = lire('# commentaire\n\nA ⟹ B\n{n} chats ⟹ {n} cat ‖ {n} cats\n')
  assert.deepEqual(d, { A: 'B', '{n} chats': ['{n} cat', '{n} cats'] })
})

test('t() : français tel quel, anglais traduit, clé inconnue = français', () => {
  definirDictionnaire({ 'Bonjour {prenom}': 'Hello {prenom}' })
  setLangueCourante('fr')
  assert.equal(t('Bonjour {prenom}', { prenom: 'Léa' }), 'Bonjour Léa')
  setLangueCourante('en')
  assert.equal(t('Bonjour {prenom}', { prenom: 'Léa' }), 'Hello Léa')
  assert.equal(t('Texte inconnu'), 'Texte inconnu')
  assert.equal(t('  Bonjour   {prenom} ', { prenom: 'X' }), 'Hello X')
  setLangueCourante('fr')
})

test('tn() : 0 et 1 au singulier en français, 1 seulement en anglais', () => {
  definirDictionnaire({ '{n} avis réalisés': ['{n} review completed', '{n} reviews completed'] })
  setLangueCourante('fr')
  assert.equal(tn(0, '{n} avis réalisé', '{n} avis réalisés'), '0 avis réalisé')
  assert.equal(tn(2, '{n} avis réalisé', '{n} avis réalisés'), '2 avis réalisés')
  setLangueCourante('en')
  assert.equal(tn(1, '{n} avis réalisé', '{n} avis réalisés'), '1 review completed')
  assert.equal(tn(0, '{n} avis réalisé', '{n} avis réalisés'), '0 reviews completed')
  setLangueCourante('fr')
})

test('dates, montants et séparateur décimal suivent la langue', () => {
  setLangueCourante('fr')
  assert.equal(locale(), 'fr-FR')
  assert.equal(sepDecimal(), ',')
  assert.equal(euros(9.9), '9,90 €')
  setLangueCourante('en')
  assert.equal(locale(), 'en-GB')
  assert.equal(sepDecimal(), '.')
  assert.equal(euros(9.9), '€9.90')
  setLangueCourante('fr')
})

test('anglais : « 1 reviews » devient « 1 review », mais 11 et 0.1 ne bougent pas', () => {
  definirDictionnaire({ '{nb} avis': '{nb} reviews', '{nb} jours': '{nb} days' })
  setLangueCourante('en')
  assert.equal(t('{nb} avis', { nb: 1 }), '1 review')
  assert.equal(t('{nb} avis', { nb: 11 }), '11 reviews')
  assert.equal(t('{nb} avis', { nb: 2 }), '2 reviews')
  assert.equal(t('{nb} jours', { nb: '0.1' }), '0.1 days')
  setLangueCourante('fr')
  assert.equal(t('{nb} avis', { nb: 1 }), '1 avis')
})
