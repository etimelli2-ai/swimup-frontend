// Traduction du site (français / anglais).
//
// Principe : le texte français écrit dans le code EST la clé. t('Réserver cet avis') renvoie le
// français tel quel, ou la traduction de src/lib/en/*.js quand la langue choisie est l'anglais.
// Une clé absente du dictionnaire anglais retombe sur le français : le site ne casse jamais.
//
// Ce module ne dépend ni de React ni du navigateur, pour que les fonctions de lib/*.mjs et les tests
// (node --test) puissent l'utiliser. Le fournisseur React et le sélecteur sont dans
// components/LangueContext.jsx et components/SelecteurLangue.jsx.
//
// Les pages d'administration ne passent pas par ici : elles restent en français.
// Le dictionnaire anglais (~50 ko compressés) n'est téléchargé que si la langue anglaise est choisie :
// les visiteurs francophones ne le paient pas.

export const LANGUES = ['fr', 'en']
export const CLE_STOCKAGE = 'swimup_langue'

import { getLangue, setLangueCourante } from './langue.mjs'
export { getLangue, setLangueCourante }

let en = {}
let contenuEn = null
const cacheCles = new Map()

// Charge le dictionnaire anglais (une seule fois). À appeler avant de passer en anglais.
export async function chargerAnglais() {
  if (Object.keys(en).length) return
  const m = await import('./en/index.js')
  en = m.default
  contenuEn = m.contenu
}

// Le dictionnaire anglais est-il déjà là ? (le rendu serveur et l'hydratation d'une page /en en ont besoin tout de suite)
export function anglaisCharge() { return Object.keys(en).length > 0 }

// Pour les tests : installer un dictionnaire sans passer par l'import dynamique.
export function definirDictionnaire(d) { en = d || {} }

// Contenu éditorial anglais (guides, métiers, modèles, messages d'apporteur), ou null tant que l'anglais n'est pas chargé.
export function contenuAnglais() { return contenuEn }

export function langueValide(l) { return LANGUES.includes(l) ? l : 'fr' }

// Langue enregistrée par le visiteur (localStorage), ou « fr ». Lecture protégée : le stockage peut
// être bloqué (navigation privée, données de site bloquées).
export function langueEnregistree() {
  try {
    if (typeof window === 'undefined') return 'fr'
    const url = new URLSearchParams(window.location.search).get('lang')
    if (url === 'fr' || url === 'en') return url
    return langueValide(window.localStorage.getItem(CLE_STOCKAGE))
  } catch { return 'fr' }
}

// Choix explicite du visiteur ('fr' | 'en'), ou null s'il n'en a jamais fait.
export function choixEnregistre() {
  try {
    if (typeof window === 'undefined') return null
    const v = window.localStorage.getItem(CLE_STOCKAGE)
    return v === 'fr' || v === 'en' ? v : null
  } catch { return null }
}

export function enregistrerLangue(l) {
  try { window.localStorage.setItem(CLE_STOCKAGE, langueValide(l)) } catch { /* sans stockage, la langue ne survit pas au rechargement */ }
}

// Les clés écrites sur plusieurs lignes dans le code sont comparées avec des espaces simples.
function cle(fr) {
  let c = cacheCles.get(fr)
  if (c === undefined) { c = fr.replace(/\s+/g, ' ').trim(); cacheCles.set(fr, c) }
  return c
}

// En français « avis » ne change pas au pluriel ; en anglais « 1 reviews » serait faux. On corrige les mots
// courants quand un nombre vient d'être inséré dans la phrase.
const SINGULIERS = { reviews: 'review', orders: 'order', businesses: 'business', keywords: 'keyword', days: 'day', emails: 'email', requests: 'request', clicks: 'click', visits: 'visit', results: 'result', texts: 'text', points: 'point', addresses: 'address', checks: 'check' }
const RE_SINGULIER = new RegExp(`(^|[^\\d.,€])1 (${Object.keys(SINGULIERS).join('|')})\\b`, 'g')
function accorderAnglais(texte) { return texte.replace(RE_SINGULIER, (m, avant, mot) => `${avant}1 ${SINGULIERS[mot]}`) }

function interpoler(texte, vars) {
  if (!vars) return texte
  const rempli = texte.replace(/\{(\w+)\}/g, (m, nom) => (!(nom in vars) ? m : (vars[nom] === undefined || vars[nom] === null ? '' : String(vars[nom]))))
  return getLangue() === 'en' ? accorderAnglais(rempli) : rempli
}

// t('Bonjour {prenom}', { prenom }) — renvoie le texte dans la langue courante.
export function t(fr, vars) {
  if (typeof fr !== 'string' || !fr) return fr
  if (getLangue() === 'fr') return interpoler(fr, vars)
  const traduit = en[cle(fr)]
  return interpoler(typeof traduit === 'string' ? traduit : fr, vars)
}

// Pluriel : tn(n, '{n} avis', '{n} avis', { autre }). En français 0 et 1 sont au singulier. Le dictionnaire
// anglais est indexé par la forme plurielle française et contient [singulier, pluriel].
export function tn(n, singulierFr, plurielFr, autres) {
  const vars = { ...autres, n }
  if (getLangue() === 'fr') return interpoler(n >= 2 ? plurielFr : singulierFr, vars)
  const traduit = en[cle(plurielFr)]
  if (Array.isArray(traduit)) return interpoler(n === 1 ? traduit[0] : traduit[1], vars)
  return interpoler(typeof traduit === 'string' ? traduit : (n >= 2 ? plurielFr : singulierFr), vars)
}

// Réglage régional pour dates et nombres : toLocaleDateString(locale(), …).
export function locale() { return getLangue() === 'en' ? 'en-GB' : 'fr-FR' }

// Séparateur décimal : « , » en français, « . » en anglais (pour les montants construits à la main).
export function sepDecimal() { return getLangue() === 'en' ? '.' : ',' }

// Montant en euros : « 9,90 € » en français, « €9.90 » en anglais.
export function euros(valeur, { decimales = 2 } = {}) {
  const n = Number(valeur) || 0
  if (getLangue() !== 'en') return `${n.toFixed(decimales).replace('.', ',')} €`
  return n.toLocaleString(locale(), { style: 'currency', currency: 'EUR', minimumFractionDigits: decimales, maximumFractionDigits: decimales })
}
