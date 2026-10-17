// Code d'apporteur (lien ?ref=CODE) : on le garde 30 jours dans le navigateur
// pour le renvoyer à la création du compte, même si le visiteur revient plus tard.
// Le serveur revérifie tout : un code faux ou désactivé est simplement ignoré.
const CLE = 'swimup_ref'
const DUREE_MS = 30 * 24 * 3600 * 1000
const FORMAT = /^[A-Za-z0-9]{4,12}$/

export function codeDepuisRecherche(search) {
  try {
    const v = new URLSearchParams(search || '').get('ref')
    return v && FORMAT.test(v.trim()) ? v.trim().toUpperCase() : null
  } catch { return null }
}

export function retenirCode(code, { stockage, maintenant = Date.now() } = {}) {
  if (!code || !FORMAT.test(code)) return false
  try {
    ;(stockage || localStorage).setItem(CLE, JSON.stringify({ code: code.toUpperCase(), fin: maintenant + DUREE_MS }))
    return true
  } catch { return false }
}

export function lireCode({ stockage, maintenant = Date.now() } = {}) {
  try {
    const s = stockage || localStorage
    const brut = s.getItem(CLE)
    if (!brut) return null
    const { code, fin } = JSON.parse(brut)
    if (!FORMAT.test(code || '') || !(fin > maintenant)) { s.removeItem(CLE); return null }
    return code
  } catch { return null }
}

export function oublierCode({ stockage } = {}) {
  try { (stockage || localStorage).removeItem(CLE) } catch { /* sans conséquence */ }
}
