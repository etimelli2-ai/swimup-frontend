// Contenu éditorial dans la langue courante. En français : les données d'origine (guidesCommercants.js,
// metiersAvis.mjs, modelesReponses.mjs, guideApporteur.mjs). En anglais : les mêmes données avec les textes
// de src/content/en/*.js par-dessus (chargés avec le dictionnaire). Si une traduction manque, le français reste :
// une page ne casse jamais.
import { getLangue } from '../lib/langue.mjs'
import { contenuAnglais } from '../lib/i18n.js'
import { slugFrDe } from '../lib/chemins.mjs'
import { GUIDES } from './guidesCommercants.js'
import { METIERS } from './metiersAvis.mjs'
import { CHAMPS, SECTIONS } from '../lib/modelesReponses.mjs'
import { MESSAGES } from './guideApporteur.mjs'

const anglais = () => (getLangue() === 'en' ? contenuAnglais() : null)

export function guidesLocalises() {
  const en = anglais()?.guides
  return en ? GUIDES.map(g => (en[g.slug] ? { ...g, ...en[g.slug] } : g)) : GUIDES
}
// Accepte le slug français ou le slug anglais de l'adresse.
export function guideLocalise(slug) {
  const fr = slugFrDe('/aide-commercants/', slug)
  return guidesLocalises().find(g => g.slug === fr)
}

function metierEn(m, en) {
  const e = en?.[m.slug]
  if (!e) return m
  return { ...m, ...e, modeles: m.modeles.map(x => ({ ...x, ...(e.modeles?.[x.id] || {}) })) }
}
export function metiersLocalises() {
  const en = anglais()?.metiers
  return en ? METIERS.map(m => metierEn(m, en)) : METIERS
}
export function metierLocalise(slug) {
  const fr = slugFrDe('/avis-google/', slug)
  return metiersLocalises().find(m => m.slug === fr) || null
}

export function champsLocalises() {
  const en = anglais()?.modeles?.champs
  return en ? CHAMPS.map(c => ({ ...c, ...(en[c.cle] || {}) })) : CHAMPS
}
export function sectionsLocalisees() {
  const en = anglais()?.modeles?.sections
  if (!en) return SECTIONS
  return SECTIONS.map(s => {
    const e = en[s.id]
    return e ? { ...s, titre: e.titre, intro: e.intro, modeles: s.modeles.map(m => ({ ...m, ...(e.modeles?.[m.id] || {}) })) } : s
  })
}

// Messages d'apporteur : en anglais, les modèles anglais (pour des commerces anglophones).
export function messagesLocalises() {
  const en = anglais()?.apporteur
  return en ? MESSAGES.map(m => ({ ...m, ...(en[m.id] || {}) })) : MESSAGES
}
