// Analyse du code pour la version anglaise : quels textes français passent par t()/tn(), lesquels
// n'y passent pas encore. Utilisé par tests/i18n.test.mjs et en ligne de commande :
//   node scripts/i18n-scan.mjs            -> résumé + liste des textes non enveloppés
//   node scripts/i18n-scan.mjs --cles     -> toutes les clés (une par ligne, JSON)
// Les pages d'administration et les pages légales restent en français : elles sont ignorées.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const IGNORES = [
  /src\/pages\/admin\//, /src\/pages\/(Cgu|Cgv|MentionsLegales|Confidentialite|Cookies|Retractation)\.jsx$/,
  /src\/lib\/i18n\.js$/, /src\/lib\/legal\.mjs$/, /src\/lib\/en\//, /src\/components\/(LangueContext|SelecteurLangue)\.jsx$/,
  /src\/(main|Racine|prerender-entry)\.jsx$/,
  // Contenu éditorial pour le marché francophone (référencement, textes à envoyer à des commerces français) :
  // volontairement laissé en français. Le chapeau des pages qui l'affichent, lui, est traduit.
  /src\/content\//, /src\/lib\/(modelesReponses|seo|ratissage|prospectionLot|parcoursClient)\.mjs$/,
  // Technique : en-têtes, détection de message d'erreur serveur.
  /src\/lib\/api\.js$/,
]

// Textes qui ressemblent à du français mais n'en sont pas (mot de confirmation envoyé au serveur, nom de fichier).
export const AUTORISES = [/^Objet : /, /^SUPPRIMER$/, /^affiche-avis-/, /^Tous \(navigateur web\)$/, /^Offer$/, /^Organization$/]

const LETTRE = /[A-Za-zÀ-ÿ]/
const ACCENT = /[À-ÿ]/
const MOTS_FR = new Set(['le','la','les','un','une','des','de','du','et','ou','à','pour','par','sur','vos','votre','ton','ta','tes','tu','mon','mes','est','as','pas','ne','avec','sans','dans','en','qui','que','ce','cette','ces','au','aux','plus','tout','tous','toutes','ici','merci','oui','non','ça','il','elle','nous','vous','je','se','sa','son','ses','si','mais','donc','car','avant','après','déjà','encore','aucun','aucune','nouveau','nouvelle','erreur','impossible','réessaie','copié','copie','compte','avis','email','mot','passe','client','membre','offre','commande','paiement','prix','gratuit','envoyer','valider','annuler','retour','suivant','précédent','chargement','aide','page','connecter','connexion','inscription','créer','supprimer','modifier','enregistrer','ajouter','voir','fermer','ouvrir','choisir','choisis','indique','saisis','entre','entrez','dont','chez','aussi','comme','fois','jour','jours','mois','heure','heures','restant','restants','reste','ans','semaine','semaines','étoile','étoiles','note','notes','lien','liens','texte','textes','établissement','commerce'])

export function estProse(s) {
  const t = s.trim()
  if (!LETTRE.test(t)) return false
  if (/^[a-z0-9_\-:/.#%@?=&+]+$/.test(t)) return false
  if (/^(https?:|mailto:|\/|#|\.)/.test(t)) return false
  if (ACCENT.test(t)) return true
  const mots = t.toLowerCase().split(/[\s'’,.!?:;()«»"-]+/).filter(Boolean)
  if (mots.some(m => MOTS_FR.has(m))) return true
  const sans = t.replace(/[….!?:;]+$/, '')
  if (/^[A-ZÀ-Ý][a-zà-ÿ]{2,}$/.test(sans)) return true
  if (/^[A-ZÀ-Ý][a-zà-ÿ]+(\s+\S+)+$/.test(sans)) return true
  return false
}

const CLES_OBJET_IGNOREES = new Set(['className', 'class', 'href', 'to', 'path', 'id', 'key', 'type', 'icon', 'color', 'colour', 'bg', 'border', 'style', 'queryKey', 'method', 'url', 'headers', 'ref', 'name', 'value', 'role', 'statut', 'status', 'offre', 'plan', 'tab', 'onglet', 'code', 'slug', 'src', 'rel', 'target', 'lang', 'locale', 'currency', 'format', 'cle', 'clé', 'categorie'])
const APPELS_IGNORES = /^(api\.|navigate$|useState$|useRef$|createContext$|localStorage\.|sessionStorage\.|document\.|window\.|console\.|Number$|parseInt$|parseFloat$|String$|Boolean$|includes$|indexOf$|startsWith$|endsWith$|split$|join$|replace$|replaceAll$|test$|match$|classList\.|querySelector|setAttribute$|getAttribute$|toLocale|Intl\.|useQuery$|invalidateQueries$|setQueryData$|getQueryData$|require$|mesure$|retenirOffreSouhaitee$|URLSearchParams$|params\.|searchParams\.|get$|set$|has$|delete$|push$|new )/
const ATTRS_TEXTE = new Set(['placeholder', 'title', 'alt', 'aria-label', 'label', 'description', 'subtitle', 'sousTitre', 'text', 'texte', 'heading', 'message', 'titre', 'cta', 'tooltip', 'emptyText', 'hint', 'aide', 'legende', 'libelle', 'nom', 'resume', 'intro'])

export function fichiersASurveiller(racine = RACINE) {
  const sortie = []
  const marche = (dossier) => {
    for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
      const p = path.join(dossier, e.name)
      if (e.isDirectory()) marche(p)
      else if (/\.(jsx|js|mjs)$/.test(e.name)) sortie.push(p)
    }
  }
  marche(path.join(racine, 'src'))
  return sortie.filter(f => !IGNORES.some(re => re.test(f.split(path.sep).join('/'))))
}

function nomAppel(callee, src) { return src.slice(callee.start, callee.end).replace(/\s+/g, '') }

// -> { cles: Map(clé -> [fichier:ligne]), nonEnveloppes: [], moduleLevel: [] }
export function scanner(fichiers = fichiersASurveiller()) {
  const cles = new Map()
  const plurielles = new Set()
  const nonEnveloppes = []
  const moduleLevel = []
  const ajouter = (c, f, l) => { const k = c.replace(/\s+/g, ' ').trim(); if (!cles.has(k)) cles.set(k, []); cles.get(k).push(`${path.relative(RACINE, f)}:${l}`) }
  for (const f of fichiers) {
    const src = fs.readFileSync(f, 'utf8')
    let ast
    try { ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx'] }) } catch { continue }
    const rel = path.relative(RACINE, f)
    const dansT = (p) => !!p.findParent(x => x.isCallExpression() && x.node.callee.type === 'Identifier' && (x.node.callee.name === 't' || x.node.callee.name === 'tn'))
    traverse(ast, {
      CallExpression(p) {
        const c = p.node.callee
        if (c.type !== 'Identifier' || (c.name !== 't' && c.name !== 'tn')) return
        const arg = c.name === 't' ? p.node.arguments[0] : null
        const args = c.name === 't' ? [arg] : [p.node.arguments[1], p.node.arguments[2]]
        // tn(n, singulier, pluriel) : seule la forme plurielle est une clé du dictionnaire (valeur [sing, plur]).
        const utiles = c.name === 't' ? args : [args[1]]
        for (const a of utiles) {
          if (!a) continue
          let v = null
          if (a.type === 'StringLiteral') v = a.value
          else if (a.type === 'TemplateLiteral' && a.expressions.length === 0) v = a.quasis[0].value.cooked
          if (v === null) continue
          ajouter(v, f, p.node.loc.start.line)
          if (c.name === 'tn') plurielles.add(v.replace(/\s+/g, ' ').trim())
        }
      },
      JSXText(p) {
        const v = p.node.value.replace(/\s+/g, ' ').trim()
        if (v && LETTRE.test(v) && !dansT(p)) nonEnveloppes.push({ fichier: rel, ligne: p.node.loc.start.line, texte: v })
      },
      StringLiteral(p) {
        const n = p.node, parent = p.parent
        if (dansT(p)) return
        if (['ImportDeclaration', 'ExportAllDeclaration', 'ExportNamedDeclaration'].includes(parent.type)) return
        if (parent.type === 'ObjectProperty' && parent.key === n && !parent.computed) return
        if (parent.type === 'ObjectProperty' && parent.value === n) {
          const kn = parent.key.type === 'Identifier' ? parent.key.name : parent.key.type === 'StringLiteral' ? parent.key.value : ''
          if (CLES_OBJET_IGNOREES.has(kn)) return
        }
        if (parent.type === 'BinaryExpression' && ['==', '===', '!=', '!==', 'in'].includes(parent.operator)) return
        if (parent.type === 'SwitchCase') return
        if (parent.type === 'MemberExpression' && parent.computed && parent.property === n) return
        if (parent.type === 'JSXAttribute') { const an = parent.name.name; if (!ATTRS_TEXTE.has(an)) return }
        if (parent.type === 'JSXExpressionContainer' && p.parentPath.parent.type === 'JSXAttribute') { if (!ATTRS_TEXTE.has(p.parentPath.parent.name.name)) return }
        if (parent.type === 'CallExpression' && parent.arguments.includes(n)) {
          const a = nomAppel(parent.callee, src)
          if (APPELS_IGNORES.test(a) && !/^(toast|alert|confirm)/.test(a)) return
        }
        if (parent.type === 'NewExpression' && parent.callee.name !== 'Error') return
        if (!estProse(n.value)) return
        const enFonction = !!p.findParent(x => x.isFunction())
        if (AUTORISES.some(re => re.test(n.value))) return
        const info = { fichier: rel, ligne: n.loc.start.line, texte: n.value.slice(0, 120) }
        if (enFonction) nonEnveloppes.push(info)
        else { moduleLevel.push(info); ajouter(n.value, f, n.loc.start.line) }
      },
      TemplateLiteral(p) {
        const n = p.node, parent = p.parent
        if (dansT(p)) return
        if (parent.type === 'TaggedTemplateExpression' || parent.type === 'JSXAttribute') return
        if (parent.type === 'JSXExpressionContainer' && p.parentPath.parent.type === 'JSXAttribute' && ['className', 'style', 'href', 'to', 'key'].includes(p.parentPath.parent.name.name)) return
        if (parent.type === 'CallExpression' && parent.arguments.includes(n)) {
          const a = nomAppel(parent.callee, src)
          if (APPELS_IGNORES.test(a) && !/^(toast|alert|confirm)/.test(a)) return
        }
        const txt = n.quasis.map(q => q.value.cooked).join('')
        if (!/[a-zà-ÿ]{3,}/i.test(txt)) return
        const motMajuscule = /(^|[\s(«"'])[A-ZÀ-Ý][a-zà-ÿ]{3,}(\s|$|[.,!?:;)»])/.test(txt)
        if (!ACCENT.test(txt) && !motMajuscule && !txt.toLowerCase().split(/[\s'’,.!?:;()«»"-]+/).some(m => MOTS_FR.has(m))) return
        const enFonction = !!p.findParent(x => x.isFunction())
        if (AUTORISES.some(re => re.test(txt))) return
        const info = { fichier: rel, ligne: n.loc.start.line, texte: txt.slice(0, 120) }
        if (enFonction) nonEnveloppes.push(info)
        else moduleLevel.push(info)
      },
    })
  }
  return { cles, nonEnveloppes, moduleLevel, plurielles }
}

// Exécution directe
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { cles, nonEnveloppes, moduleLevel, plurielles } = scanner()
  if (process.argv.includes('--cles')) {
    for (const [k, o] of cles) console.log(JSON.stringify({ cle: k, ou: o[0], pluriel: plurielles.has(k) }))
  } else {
    console.log(`clés: ${cles.size}, non enveloppés: ${nonEnveloppes.length}, hors composant: ${moduleLevel.length}`)
    for (const x of nonEnveloppes) console.log(`NON ENVELOPPÉ ${x.fichier}:${x.ligne}  ${x.texte}`)
    if (process.argv.includes('--module')) for (const x of moduleLevel) console.log(`HORS COMPOSANT ${x.fichier}:${x.ligne}  ${x.texte}`)
  }
}
