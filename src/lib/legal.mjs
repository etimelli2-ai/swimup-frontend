// Informations légales du site : un seul endroit à compléter.
// Tout ce qui est entre crochets « [À REMPLIR ...] » n'a pas été fourni : rien n'est inventé.
// Les pages (mentions légales, CGU, CGV, confidentialité, rétractation) lisent ce fichier.
// tests/legal.test.mjs liste ces champs ; quand tu les remplis, retire-les de la liste du test.

export const DATE_MAJ = '14 octobre 2026'

export const EDITEUR = {
  nom: '[À REMPLIR : nom et prénom (particulier ou micro-entrepreneur) ou raison sociale (société)]',
  statut: '[À REMPLIR : particulier, micro-entrepreneur ou société (forme juridique)]',
  adresse: '[À REMPLIR : adresse postale (siège social pour une société)]',
  telephone: '[À REMPLIR : numéro de téléphone]',
  email: '[À REMPLIR : adresse email de contact]',
  siret: '[À REMPLIR : numéro SIRET, ou « sans objet » si tu n\'es pas inscrit]',
  rcs: '[À REMPLIR : RCS ou RM et ville, si inscrit]',
  capital: '[À REMPLIR : capital social, société uniquement]',
  tva: '[À REMPLIR : numéro de TVA intracommunautaire, ou mention « TVA non applicable, art. 293 B du CGI » si tu es en franchise]',
  directeurPublication: '[À REMPLIR : nom du directeur ou de la directrice de la publication]',
}

// Hébergement : le nom vient du projet (le site et l'API tournent sur Railway). L'adresse est à copier depuis leur site.
export const HEBERGEUR = {
  nom: 'Railway',
  details: '[À REMPLIR : raison sociale exacte, adresse et contact de l\'hébergeur, à copier depuis railway.com]',
}

export const MEDIATEUR = '[À REMPLIR : nom et coordonnées du médiateur de la consommation auquel tu adhères (obligatoire si tu vends à des particuliers)]'
export const LOI_ET_TRIBUNAL = '[À REMPLIR : juridiction compétente, à valider avec un juriste]'

export const CNIL = { nom: 'CNIL', adresse: '3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07', plainte: 'https://www.cnil.fr/fr/plaintes' }

// Prix affichés dans les CGV : les mêmes que dans le produit (commande publique, offres).
export const PRIX = {
  avisSansCompte: 4,
  avisAvecCompte: 3,
  premiumMois: 9.9,
  businessMois: 24.9,
  remisePremiumPourcent: 10,
}

export const LIENS_LEGAUX = [
  ['/mentions-legales', 'Mentions légales'],
  ['/confidentialite', 'Confidentialité'],
  ['/cookies', 'Cookies'],
  ['/cgu', 'CGU'],
  ['/cgv', 'CGV'],
  ['/retractation', 'Rétractation et remboursement'],
]
