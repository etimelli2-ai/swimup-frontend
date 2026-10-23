// Format des fichiers de traduction (src/lib/en/*.js) : une entrée par ligne,
//   texte français ⟹ traduction anglaise
// Pluriel : la clé est la forme plurielle française, la valeur « singulier ‖ pluriel ».
// Les lignes vides et celles qui commencent par # sont ignorées.
export function lire(texte) {
  const dico = {}
  for (const ligne of texte.split('\n')) {
    if (!ligne.trim() || ligne.startsWith('#')) continue
    const i = ligne.indexOf(' ⟹ ')
    if (i < 0) continue
    const cle = ligne.slice(0, i).trim()
    const val = ligne.slice(i + 3).trim()
    dico[cle] = val.includes(' ‖ ') ? val.split(' ‖ ').map(x => x.trim()) : val
  }
  return dico
}
