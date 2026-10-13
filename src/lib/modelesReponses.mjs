// Modèles de réponses aux avis Google : textes et remplissage des champs.
// Les champs vides restent entre crochets ([prénom]) pour que le commerçant voie ce qu'il doit compléter.

export const CHAMPS = [
  { cle: 'prenom', etiquette: 'Prénom du client', exemple: 'Camille', defaut: '[prénom]' },
  { cle: 'commerce', etiquette: 'Nom de ton établissement', exemple: 'Boulangerie Dupont', defaut: '[nom de l\'établissement]' },
  { cle: 'element', etiquette: 'Ce que le client a aimé', exemple: 'les croissants', defaut: '[élément précis]' },
  { cle: 'probleme', etiquette: 'Le problème évoqué', exemple: 'l\'attente au comptoir', defaut: '[problème]' },
  { cle: 'contact', etiquette: 'Ton moyen de contact', exemple: 'contact@exemple.fr', defaut: '[contact]' },
]

export const SECTIONS = [
  {
    id: 'positifs',
    titre: 'Répondre à un avis positif',
    intro: 'Remercie en citant un détail de l\'avis et reste court. Change un peu le texte d\'un avis à l\'autre : la même phrase copiée partout se remarque.',
    modeles: [
      { id: 'pos-court', nom: 'Remerciement court', quand: 'Avis positif avec un petit commentaire.',
        texte: 'Merci {prenom} pour votre avis ! Votre mot sur {element} nous fait très plaisir. À très bientôt chez {commerce}.' },
      { id: 'pos-detail', nom: 'Avis détaillé', quand: 'Le client a pris le temps d\'écrire plusieurs phrases.',
        texte: 'Bonjour {prenom}, merci d\'avoir pris le temps de nous écrire. Votre commentaire sur {element} fait très plaisir à toute l\'équipe : c\'est exactement ce que nous cherchons à offrir. Au plaisir de vous revoir chez {commerce}.' },
      { id: 'pos-fidele', nom: 'Client fidèle', quand: 'Tu reconnais un habitué, ou l\'avis dit « comme toujours ».',
        texte: 'Merci {prenom}, et merci surtout pour votre fidélité ! Savoir que vous revenez chez {commerce}, c\'est la plus belle des récompenses. À très bientôt.' },
      { id: 'pos-note', nom: 'Note sans commentaire', quand: 'Le client a mis des étoiles mais n\'a rien écrit.',
        texte: 'Bonjour {prenom}, merci pour votre note ! Si vous avez un moment, dites-nous ce qui vous a plu ou ce que nous pourrions améliorer : c\'est précieux pour nous. À bientôt chez {commerce}.' },
    ],
  },
  {
    id: 'negatifs',
    titre: 'Répondre à un avis négatif',
    intro: 'Réponds quand tu es calme, pas à chaud. Reconnais ce qui n\'a pas marché sans te justifier longuement, ne donne aucun détail sur la personne ou la commande, et propose de continuer en privé.',
    modeles: [
      { id: 'neg-service', nom: 'Service ou attente', quand: 'Le client décrit un moment qui s\'est mal passé.',
        texte: 'Bonjour {prenom}, merci pour votre retour. Nous sommes désolés que votre visite chez {commerce} n\'ait pas été à la hauteur, en particulier à cause de {probleme} : ce n\'est pas l\'expérience que nous voulons offrir. Pourriez-vous nous écrire à {contact} pour que nous regardions cela ensemble ?' },
      { id: 'neg-produit', nom: 'Qualité du produit ou du travail', quand: 'Le client n\'est pas satisfait de ce qu\'il a reçu.',
        texte: 'Bonjour {prenom}, nous sommes navrés de lire ce que vous décrivez au sujet de {probleme}. Votre retour est pris au sérieux et nous en parlons avec l\'équipe. Si vous le souhaitez, écrivez-nous à {contact} : nous aimerions comprendre ce qui s\'est passé et chercher une solution.' },
      { id: 'neg-erreur', nom: 'Erreur de ta part', quand: 'Le client a raison et tu le sais.',
        texte: 'Bonjour {prenom}, ce que vous décrivez au sujet de {probleme} n\'aurait pas dû arriver, et nous vous présentons nos excuses. Nous reprenons ce point avec l\'équipe. Écrivez-nous à {contact} pour que nous trouvions une solution avec vous.' },
      { id: 'neg-prix', nom: 'Remarque sur les prix', quand: 'L\'avis dit que c\'est trop cher.',
        texte: 'Bonjour {prenom}, merci d\'avoir partagé votre ressenti sur nos tarifs. Nous essayons de rester justes, en tenant compte de la qualité et du temps que demande notre travail. Si vous le souhaitez, nous pouvons détailler ensemble le devis ou la facture : écrivez-nous à {contact}.' },
      { id: 'neg-sans-texte', nom: 'Mauvaise note sans explication', quand: 'Une ou deux étoiles, mais pas un mot.',
        texte: 'Bonjour {prenom}, nous avons vu votre note et nous sommes désolés que votre expérience chez {commerce} n\'ait pas été à la hauteur. Si vous êtes d\'accord pour nous dire ce qui n\'a pas fonctionné, écrivez-nous à {contact} : nous voulons progresser.' },
    ],
  },
  {
    id: 'faux',
    titre: 'Répondre à un avis faux ou injuste',
    intro: 'Un avis sévère mais fondé sur une vraie expérience reste un avis valable. Ces modèles servent pour les cas où tu ne retrouves pas le client, où l\'avis vise un autre établissement, ou où il enfreint les règles de Google. Reste factuel, sans accuser personne.',
    modeles: [
      { id: 'faux-inconnu', nom: 'Client introuvable', quand: 'Tu as cherché et tu ne retrouves aucune trace de la visite ou de la commande.',
        texte: 'Bonjour, nous avons cherché de notre côté et nous ne retrouvons pas de trace de cette visite ou de cette commande. Pourriez-vous nous contacter à {contact} avec quelques précisions pour que nous puissions regarder ? Nous restons à votre écoute.' },
      { id: 'faux-autre', nom: 'Avis pour un autre établissement', quand: 'Le commentaire parle d\'un lieu ou d\'un service qui n\'est pas le tien.',
        texte: 'Bonjour, il semble que cet avis concerne un autre établissement que {commerce}. Si nous nous trompons, n\'hésitez pas à nous écrire à {contact}.' },
      { id: 'faux-regles', nom: 'Avis qui enfreint les règles de Google', quand: 'Insultes, contenu hors sujet, spam. À n\'écrire qu\'après avoir vraiment signalé l\'avis à Google.',
        texte: 'Nous sommes ouverts à toute critique argumentée et nous répondons volontiers à {contact}. Cet avis ne nous semble pas respecter les règles de Google et nous l\'avons signalé.' },
    ],
  },
]

// Remplace {cle} par la valeur saisie, ou par le texte entre crochets quand elle est vide.
export function remplir(texte, valeurs = {}) {
  return texte.replace(/\{(\w+)\}/g, (_, cle) => {
    const champ = CHAMPS.find(c => c.cle === cle)
    if (!champ) return `{${cle}}`
    const v = (valeurs[cle] || '').trim()
    return v || champ.defaut
  })
}
