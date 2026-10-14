// Parcours d'un nouveau client : compte créé → email confirmé → première commande.
// Fonctions pures, sans stockage ni réseau, pour pouvoir les tester.

// Boîtes mail connues : on propose un bouton direct vers la messagerie. Domaine inconnu : pas de bouton.
const MESSAGERIES = [
  [['gmail.com', 'googlemail.com'], 'Gmail', 'https://mail.google.com/'],
  [['outlook.com', 'outlook.fr', 'hotmail.com', 'hotmail.fr', 'live.com', 'live.fr', 'msn.com'], 'Outlook', 'https://outlook.live.com/mail/'],
  [['yahoo.com', 'yahoo.fr', 'ymail.com'], 'Yahoo Mail', 'https://mail.yahoo.com/'],
  [['icloud.com', 'me.com', 'mac.com'], 'iCloud Mail', 'https://www.icloud.com/mail'],
  [['orange.fr', 'wanadoo.fr'], 'Orange Mail', 'https://messagerie.orange.fr/'],
  [['free.fr'], 'Free Mail', 'https://webmail.free.fr/'],
  [['laposte.net'], 'La Poste Mail', 'https://www.laposte.net/'],
  [['sfr.fr', 'neuf.fr'], 'SFR Mail', 'https://messagerie.sfr.fr/'],
]

export function lienMessagerie(email) {
  const domaine = String(email || '').split('@')[1]?.trim().toLowerCase()
  if (!domaine) return null
  const m = MESSAGERIES.find(([domaines]) => domaines.includes(domaine))
  return m ? { nom: m[1], url: m[2] } : null
}

// Où envoyer le client une fois son email confirmé : la page de l'offre qu'il regardait, sinon la commande.
export function prochaineEtape(offreSouhaitee) {
  return ['premium', 'business'].includes(offreSouhaitee) ? '/client/premium' : '/client/payer'
}
