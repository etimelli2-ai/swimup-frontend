// Offre choisie avant la création du compte : on la garde le temps de confirmer
// l'adresse email, puis la page Premium la présente déjà sélectionnée.
const CLE = 'swimup_offre_souhaitee'

export function retenirOffreSouhaitee(offre) {
  try { localStorage.setItem(CLE, offre) } catch { /* stockage indisponible : sans conséquence */ }
}

export function lireOffreSouhaitee() {
  try { return localStorage.getItem(CLE) } catch { return null }
}

export function oublierOffreSouhaitee() {
  try { localStorage.removeItem(CLE) } catch { /* idem */ }
}
