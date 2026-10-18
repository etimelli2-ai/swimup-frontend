// Ratissage de prospects : petites fonctions pures du panneau admin (saisie des listes, libellés, progression).

// Une valeur par ligne (on accepte aussi la virgule et le point-virgule quand on colle une liste).
// Espaces et doublons enlevés, sans tenir compte de la casse.
export function lignes(texte) {
  const vus = new Set()
  const out = []
  for (const brut of String(texte || '').split(/[\n;,]+/)) {
    const v = brut.replace(/\s+/g, ' ').trim()
    if (!v || vus.has(v.toLowerCase())) continue
    vus.add(v.toLowerCase())
    out.push(v)
  }
  return out
}

export const TOTAL_MAX = 5000

// Nombre de recherches (métiers x zones) et si la course est acceptée par le serveur.
export function resume(metiersTexte, zonesTexte) {
  const metiers = lignes(metiersTexte)
  const zones = lignes(zonesTexte)
  const total = metiers.length * zones.length
  return { metiers: metiers.length, zones: zones.length, total, trop: total > TOTAL_MAX, vide: total === 0 }
}

export function pourcentage(fait, total) {
  if (!total || total <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((fait / total) * 100)))
}

// Part de fiches nouvelles qui ont un email (« 38 % »), ou null s'il n'y a encore rien.
export function tauxEmail(nouvelles, avecEmail) {
  if (!nouvelles) return null
  return Math.round((avecEmail / nouvelles) * 100)
}

export const STATUTS = {
  en_cours: { texte: 'En cours', classe: 'bg-sky-50 text-sky-700 border-sky-200' },
  pause: { texte: 'En pause', classe: 'bg-amber-50 text-amber-700 border-amber-200' },
  termine: { texte: 'Terminé', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  arrete: { texte: 'Arrêté', classe: 'bg-gray-100 text-gray-600 border-gray-200' },
  erreur: { texte: 'Erreur', classe: 'bg-red-50 text-red-600 border-red-200' },
}

export function estActive(course) {
  return !!course && (course.statut === 'en_cours' || course.statut === 'pause')
}
