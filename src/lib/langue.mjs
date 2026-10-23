// Langue courante du rendu (fr / en). Petit module sans dépendance, partagé par lib/i18n.js et lib/seo.mjs
// (que le script de prérendu charge directement avec Node).
let courante = 'fr'
export function getLangue() { return courante }
export function setLangueCourante(l) { courante = l === 'en' ? 'en' : 'fr' }
