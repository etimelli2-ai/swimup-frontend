// Prospection : envoi en lot, mode « une par une » et masquage des fiches sans email (fonctions pures).

export const estContacte = (p) => !!p.email_envoye || !!p.dernier_contact_at

// Fiche sans email et jamais contactée : masquée par défaut (jamais supprimée : sa trace évite de
// repayer Google au prochain ratissage).
export const estMasquee = (p) => !p.email && !estContacte(p)

export function compterMasquees(prospects) {
  return prospects.filter(estMasquee).length
}

// Liste affichée selon le filtre choisi et le réglage « afficher les fiches sans email ».
export function visibles(prospects, filtre, afficherSansEmail = false) {
  return prospects.filter(p => {
    if (filtre === 'sans_email') return !p.email
    if (filtre === 'contactes') return estContacte(p)
    if (!afficherSansEmail && estMasquee(p)) return false
    if (filtre === 'a_contacter') return !estContacte(p)
    return true
  })
}

// Mode « une par une » : fiches sans email, jamais contactées, pas déjà passées.
export function aCompleter(prospects, ignorees = new Set()) {
  return prospects.filter(p => estMasquee(p) && !ignorees.has(p.id))
}

// Envoi en lot : un email, jamais contacté (mail ou à la main), pas d'opposition.
export function eligiblesEnvoi(prospects) {
  return prospects.filter(p => !!p.email && !estContacte(p) && !p.a_dit_stop)
}

// Même contrôle que le serveur.
export function emailValide(texte) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(texte || '').trim())
}

export function lienRechercheGoogle(p) {
  const ville = (p.ville || p.adresse || '').toString()
  return `https://www.google.com/search?q=${encodeURIComponent(`${p.nom} ${ville} email contact`)}`
}

// Pause entre deux mails d'un lot : juste de quoi rester sous la limite de Resend (2 requêtes par seconde),
// sinon des mails seraient refusés. 30 mails partent en une vingtaine de secondes.
export const PAUSE_ENTRE_MAILS_MS = 600

// Combien envoyer maintenant : ce qui reste du plafond du jour, sans dépasser les fiches éligibles.
export function aEnvoyerMaintenant(eligibles, plafond, dejaEnvoyes) {
  const reste = Math.max(0, Number(plafond) - Number(dejaEnvoyes))
  return eligibles.slice(0, reste)
}

// ---- Validation manuelle avant envoi -------------------------------------------------------

const DOMAINES_PERSO = ['gmail.com', 'hotmail.com', 'hotmail.fr', 'outlook.com', 'outlook.fr', 'yahoo.fr', 'yahoo.com', 'orange.fr', 'free.fr', 'sfr.fr', 'wanadoo.fr', 'laposte.net', 'icloud.com', 'live.fr', 'live.com']

// D'où vient plausiblement l'adresse, pour t'aider à la valider : 'site' (même domaine que le site de la fiche),
// 'perso' (gmail, orange… : souvent l'adresse perso d'un artisan, à vérifier), 'autre' (domaine différent du site).
export function typeAdresse(p) {
  const domaine = String(p.email || '').split('@')[1]?.toLowerCase()
  if (!domaine) return 'inconnu'
  let hote = ''
  try {
    const url = /^https?:\/\//i.test(p.site_web || '') ? p.site_web : `https://${p.site_web || ''}`
    hote = p.site_web ? new URL(url).hostname.replace(/^www\./, '').toLowerCase() : ''
  } catch { hote = '' }
  if (hote && (domaine === hote || domaine.endsWith(`.${hote}`) || hote.endsWith(`.${domaine}`))) return 'site'
  if (DOMAINES_PERSO.includes(domaine)) return 'perso'
  return 'autre'
}

export const LIBELLE_ADRESSE = {
  site: 'Adresse du site',
  perso: 'Adresse perso (gmail, orange…) : à vérifier',
  autre: 'Domaine différent du site',
  inconnu: '',
}

// Seuls les prospects que tu as validés partent, dans la limite du plafond du jour.
export function aEnvoyerValides(eligibles, valides, plafond, dejaEnvoyes) {
  return aEnvoyerMaintenant(eligibles.filter(p => valides.has(p.id)), plafond, dejaEnvoyes)
}
