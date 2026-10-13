// Diagnostic de fiche Google : une liste que le commerçant coche lui-même.
// Aucune donnée Google n'est lue, aucun chiffre n'est inventé : le score compte les points cochés, rien d'autre.

export const GROUPES = [
  { id: 'base', titre: 'Les informations de base', items: [
    { id: 'nom', titre: 'Le nom de ma fiche est le vrai nom de mon établissement', pourquoi: 'Google refuse les mots-clés ajoutés au nom, et un nom différent de l\'enseigne prête à confusion.' },
    { id: 'adresse', titre: 'Mon adresse est exacte (ou ma zone d\'intervention si je me déplace)', pourquoi: 'Un client qui se trompe de lieu repart déçu, et ça se voit ensuite dans les avis.' },
    { id: 'contact', titre: 'Mon téléphone et mon site web sont renseignés et fonctionnent', pourquoi: 'Teste-les toi-même depuis ton téléphone : un numéro qui ne répond pas fait perdre des clients.' },
    { id: 'horaires', titre: 'Mes horaires habituels sont justes', pourquoi: 'De mauvais horaires sont une des causes les plus évitables d\'avis négatifs.' },
    { id: 'horaires-spec', titre: 'Mes jours fériés et fermetures exceptionnelles sont à jour', pourquoi: 'À revoir avant chaque vacances ou jour férié.' },
  ] },
  { id: 'categories', titre: 'Catégories et services', items: [
    { id: 'cat-principale', titre: 'J\'ai choisi la catégorie principale qui décrit mon activité principale', pourquoi: 'C\'est la première information qu\'utilise Google pour comprendre ce que tu fais.' },
    { id: 'cat-secondaires', titre: 'J\'ai ajouté quelques catégories secondaires, seulement si elles sont vraies', pourquoi: 'Elles précisent ton activité. N\'en ajoute pas pour ratisser large.' },
    { id: 'services', titre: 'Mes services ou produits sont listés, avec une courte description', pourquoi: 'Décris-les avec les mots que tes clients emploient, pas ton jargon.' },
  ] },
  { id: 'photos', titre: 'Photos', items: [
    { id: 'photos-lieu', titre: 'Il y a des photos de l\'extérieur et de l\'intérieur', pourquoi: 'Elles aident le client à te reconnaître en arrivant.' },
    { id: 'photos-travail', titre: 'Il y a des photos de mes réalisations, de mes produits ou de l\'équipe', pourquoi: 'Utilise de vraies photos, avec l\'accord des personnes qui y figurent.' },
    { id: 'photos-recentes', titre: 'J\'ai ajouté ou revu des photos cette année', pourquoi: 'Une fiche avec des photos d\'il y a dix ans ne ressemble plus à ton établissement.' },
  ] },
  { id: 'presentation', titre: 'Présentation et vie de la fiche', items: [
    { id: 'description', titre: 'J\'ai une description claire de mon activité, en quelques phrases factuelles', pourquoi: 'Pas de slogan ni de promotion, et pas de lien dans le texte : Google demande une description sobre.' },
    { id: 'publication', titre: 'J\'ai publié une actualité, une offre ou un événement récemment', pourquoi: 'Ça montre que la fiche est suivie. Une publication de temps en temps suffit.' },
  ] },
  { id: 'avis', titre: 'Les avis', items: [
    { id: 'lien-avis', titre: 'J\'ai mon lien direct d\'avis et je le donne à mes clients (QR code, facture, message)', pourquoi: 'Plus le chemin est court, plus de clients satisfaits laissent un avis.', lien: { href: '/outils/lien-avis-google', label: 'Créer mon lien et mon QR code' } },
    { id: 'reponses', titre: 'Je réponds aux avis, positifs comme négatifs', pourquoi: 'Ta réponse est lue par les futurs clients autant que par l\'auteur de l\'avis.', lien: { href: '/outils/modeles-reponses-avis-google', label: 'Voir les modèles de réponses' } },
    { id: 'notifications', titre: 'Les notifications d\'avis sont activées', pourquoi: 'Pour ne pas laisser un avis sans réponse pendant des semaines.' },
    { id: 'relecture', titre: 'J\'ai relu ma fiche ce trimestre, comme le ferait un nouveau client', pourquoi: 'Les informations changent vite, et des internautes peuvent proposer des modifications que tu dois valider.' },
  ] },
]

export const TOUS_LES_POINTS = GROUPES.flatMap(g => g.items)
export const TOTAL = TOUS_LES_POINTS.length

// coches : ensemble (Set ou tableau) des identifiants cochés
export function analyser(coches) {
  const set = new Set(coches)
  const faits = TOUS_LES_POINTS.filter(p => set.has(p.id)).length
  const aFaire = TOUS_LES_POINTS.filter(p => !set.has(p.id))
  return { faits, total: TOTAL, aFaire, premiers: aFaire.slice(0, 3) }
}

export function listeAFaire(coches) {
  const { aFaire } = analyser(coches)
  if (!aFaire.length) return 'Rien à faire sur cette liste.'
  return ['À faire sur ma fiche Google :', ...aFaire.map(p => `- ${p.titre}`)].join('\n')
}
