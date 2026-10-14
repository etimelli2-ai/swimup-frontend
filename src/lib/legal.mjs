// Informations légales du site : un seul endroit à compléter.
// Tout ce qui est entre crochets « [À REMPLIR ...] » n'a pas été fourni : rien n'est inventé.
// Les pages (mentions légales, CGU, CGV, confidentialité, rétractation) lisent ce fichier.
// tests/legal.test.mjs liste ces champs ; quand tu les remplis, retire-les de la liste du test.

export const DATE_MAJ = '14 octobre 2026'

export const EDITEUR = {
  nom: 'Enzo TIMELLI',
  statut: 'Entrepreneur individuel (micro-entrepreneur)',
  adresse: 'Adresse privée, non communiquée publiquement',
  telephone: 'Aucun : contact uniquement par email',
  email: 'noreply@swimup.net',
  siret: '[À REMPLIR : numéro SIRET de ton entreprise (14 chiffres), fourni à l\'inscription de ta micro-entreprise]',
  rcs: '[À REMPLIR : numéro d\'immatriculation (RCS ou RM) s\'il y en a un sur ton attestation d\'inscription, sinon retire cette ligne]',
  capital: 'Sans objet (entreprise individuelle)',
  tva: 'TVA non applicable, art. 293 B du CGI',
  directeurPublication: 'Enzo TIMELLI',
}

// Hébergement : le nom vient du projet (le site et l'API tournent sur Railway). L'adresse est à copier depuis leur site.
export const HEBERGEUR = {
  nom: 'Railway',
  details: 'Railway Corporation, 548 Market St PMB 68956, San Francisco, CA 94104, États-Unis. Contact : team@railway.com.',
}

export const LOI_ET_TRIBUNAL = "À défaut d'accord amiable, les tribunaux français du ressort du domicile de l'éditeur sont compétents."

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
