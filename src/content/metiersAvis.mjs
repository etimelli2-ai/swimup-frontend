// Pages « avis Google par métier ». Chaque métier a son propre contenu : situations qui reviennent,
// modèles de réponse adaptés, endroits où mettre le QR code, points de fiche à soigner.
// Aucun chiffre inventé, aucune promesse de résultat ni de compensation, aucune demande de note :
// on décrit des gestes simples et on renvoie vers l'aide officielle de Google pour les règles.
// Les modèles n'utilisent que les champs de lib/modelesReponses.mjs ({prenom} {commerce} {element} {probleme} {contact}).

export const METIERS = [
  {
    slug: 'restaurant',
    nom: 'restaurant',
    titre: 'Avis Google pour un restaurant : demander, répondre, soigner sa fiche',
    description: 'Restaurateur : où mettre ton QR code d’avis, comment répondre à un avis sur l’attente, le plat ou le service, et quoi vérifier sur ta fiche Google. Modèles gratuits.',
    intro: 'Un restaurant se choisit souvent depuis un téléphone, dans la rue ou dans le canapé. La note, les photos et les dernières réponses de la fiche pèsent dans ce choix. Voici les situations qui reviennent le plus et comment les traiter calmement.',
    situations: [
      { t: 'L’attente trop longue', p: 'C’est l’une des critiques les plus courantes en salle comme en terrasse. Reconnais la gêne sans te lancer dans un compte rendu du service ce soir-là, et ne cite pas la réservation ni l’identité du client. Propose de continuer par message privé.' },
      { t: 'Le plat qui n’a pas plu', p: 'Une cuisine peut rater un plat ou décevoir un goût. Remercie, dis que la remarque est transmise à la cuisine, et évite le « ce n’est pas ce que disent les autres clients » : le lecteur y entend de la défense, pas de l’écoute.' },
      { t: 'La réservation qui s’est mal passée', p: 'Table pas prête, erreur de créneau, groupe mal placé. Si l’erreur est de ton côté, excuse-toi en une phrase. Si tu ne retrouves pas la réservation, demande poliment un contact plutôt que de contredire en public.' },
      { t: 'L’avis flatteur et sans détail', p: 'Les avis très courts méritent aussi une réponse, brève. Cite un élément concret (un plat, l’accueil) pour que la réponse ne ressemble pas à un copier-coller.' },
    ],
    modeles: [
      { id: 'resto-attente', nom: 'Attente en salle', quand: 'Le client décrit une attente ou un service lent.', texte: 'Bonjour {prenom}, merci pour votre retour. L’attente que vous décrivez, {probleme}, n’est pas ce que nous voulons offrir à nos clients, et nous en parlons avec l’équipe en salle. Si vous le souhaitez, écrivez-nous à {contact} pour que nous comprenions ce qui s’est passé. L’équipe de {commerce}.' },
      { id: 'resto-plat', nom: 'Plat décevant', quand: 'La critique porte sur un plat ou un dessert.', texte: 'Bonjour {prenom}, nous sommes navrés que votre repas chez {commerce} ne vous ait pas satisfait, en particulier {probleme}. Votre remarque est transmise à la cuisine. Si vous voulez nous en dire plus, vous pouvez nous écrire à {contact}.' },
      { id: 'resto-merci', nom: 'Remerciement', quand: 'Avis positif, même court.', texte: 'Merci {prenom} pour votre message ! Votre mot sur {element} fait plaisir à toute l’équipe de {commerce}, en salle comme en cuisine. À bientôt à notre table.' },
    ],
    qr: [
      'Sur l’addition ou dans le porte-addition : le client a fini de manger et son téléphone est souvent déjà sorti.',
      'Sur le ticket de la carte bancaire ou au dos du ticket de caisse.',
      'Près de la sortie ou de la caisse, sur un petit support imprimé en A5 ou A6, plutôt que sur chaque table.',
    ],
    fiche: [
      'Les horaires du service du midi et du soir, avec les jours de fermeture et les jours fériés.',
      'Le menu à jour (ou le lien vers le menu) et le numéro pour réserver.',
      'Des photos récentes de la salle, de la terrasse et des plats, sur lesquelles on reconnaît le lieu.',
    ],
    eviter: [
      'Offrir un café ou une remise en échange d’un avis : Google le refuse et le lecteur le sent.',
      'Ne demander l’avis qu’aux tables qui ont l’air contentes : Google interdit de trier les clients sollicités.',
      'Répondre à chaud le soir même d’un service difficile.',
    ],
  },
  {
    slug: 'coiffeur',
    nom: 'salon de coiffure',
    titre: 'Avis Google pour un salon de coiffure : demander, répondre, soigner sa fiche',
    description: 'Coiffeur ou barbier : modèles de réponse à un avis sur une coupe, une couleur ou un rendez-vous, QR code à la caisse et points de fiche Google à vérifier.',
    intro: 'Chez le coiffeur, l’avis parle d’un résultat qu’on porte sur la tête et qu’on voit tous les jours. Les critiques sont souvent chargées d’émotion et les réponses se lisent attentivement. Voici comment garder le bon ton.',
    situations: [
      { t: 'La coupe ou la couleur qui ne plaît pas', p: 'Le client a souvent un souhait précis en tête. Reconnais que le résultat ne lui convient pas, sans défendre ton geste technique devant tout le monde. Propose d’en reparler au salon, par message ou par téléphone.' },
      { t: 'Le rendez-vous qui a pris du retard', p: 'Un créneau qui déborde se remarque, surtout pour une personne qui a pris une pause pour venir. Excuse-toi simplement et évite de rejeter la faute sur le client précédent.' },
      { t: 'Le prix jugé trop élevé', p: 'Ne justifie pas ta grille de prix point par point. Un lecteur retient surtout la politesse de ta réponse. Tu peux indiquer où retrouver tes tarifs, s’ils sont affichés sur ta fiche ou ton site.' },
      { t: 'L’avis enthousiaste', p: 'Remercie en citant un détail : l’accueil, le conseil, le résultat. Évite les formules qui promettent un tarif ou un cadeau à la prochaine visite.' },
    ],
    modeles: [
      { id: 'coif-resultat', nom: 'Résultat qui ne convient pas', quand: 'Le client n’est pas satisfait de sa coupe ou de sa couleur.', texte: 'Bonjour {prenom}, merci pour votre retour. Nous sommes désolés que le résultat ne corresponde pas à ce que vous attendiez, en particulier {probleme}. Nous aimerions en reparler avec vous : vous pouvez nous écrire à {contact} ou nous appeler au salon. L’équipe de {commerce}.' },
      { id: 'coif-retard', nom: 'Retard au rendez-vous', quand: 'Le client a attendu au-delà de l’heure prévue.', texte: 'Bonjour {prenom}, merci de nous avoir écrit. Vous avoir fait attendre, {probleme}, n’aurait pas dû arriver et nous vous présentons nos excuses. Nous revoyons l’organisation des rendez-vous avec l’équipe de {commerce}. Vous pouvez aussi nous écrire à {contact}.' },
      { id: 'coif-merci', nom: 'Remerciement', quand: 'Avis positif.', texte: 'Merci {prenom} pour votre avis ! Savoir que {element} vous a plu fait plaisir à toute l’équipe de {commerce}. Au plaisir de vous revoir au salon.' },
    ],
    qr: [
      'À la caisse, à côté du terminal de paiement : c’est là que le client est debout, téléphone à la main.',
      'Près du miroir de sortie ou sur le comptoir d’accueil, sur un petit support imprimé.',
      'Sur la carte de rendez-vous ou la carte de visite remise au client au moment de payer.',
    ],
    fiche: [
      'Les horaires d’ouverture, avec les jours où tu travailles sur rendez-vous seulement.',
      'Le lien ou le numéro pour prendre rendez-vous, vérifié depuis ton téléphone.',
      'Des photos de réalisations, avec l’accord des personnes qu’on y reconnaît, et des photos du salon.',
    ],
    eviter: [
      'Montrer en réponse publique des détails du dossier du client (couleur choisie, historique de soins, remarques personnelles).',
      'Promettre une retouche ou un geste commercial que tu ne pourras pas tenir.',
      'Demander un avis uniquement aux clients repartis ravis : Google interdit de les trier.',
    ],
  },
  {
    slug: 'artisan-batiment',
    nom: 'artisan du bâtiment',
    titre: 'Avis Google pour un artisan du bâtiment : demander, répondre, soigner sa fiche',
    description: 'Plombier, électricien, peintre, maçon : où glisser ton QR code d’avis (facture, fin de chantier), comment répondre à un avis sur un retard ou un devis, et quoi vérifier sur ta fiche.',
    intro: 'Pour un artisan, la fiche Google est souvent lue avant d’appeler, par quelqu’un qui hésite entre deux ou trois devis. Les avis parlent de délais, de propreté du chantier et du prix final. Voici comment les demander et y répondre.',
    situations: [
      { t: 'Le retard de chantier', p: 'Un retard fait vite monter la tension, surtout si le client a pris des congés pour te recevoir. Reconnais le désagrément, explique en une phrase s’il y avait un aléa que tu n’avais pas prévu, et propose un échange direct. Ne détaille pas le chantier ni l’adresse.' },
      { t: 'Le devis qui diffère de la facture', p: 'Ne règle pas le litige dans les commentaires. Dis que tu veux comprendre le point en question et donne un moyen de te joindre. Si un document précis fait foi, c’est un échange privé.' },
      { t: 'Le chantier pas assez propre', p: 'Le soin du chantier compte autant que le résultat pour beaucoup de clients. Excuse-toi simplement et, si c’est pertinent, dis ce que tu changes dans ta façon de finir les chantiers.' },
      { t: 'L’avis d’une personne que tu ne retrouves pas', p: 'Cherche d’abord dans ton carnet de devis et de factures. Si tu ne retrouves rien, dis-le poliment et demande un contact, sans accuser la personne de mentir.' },
    ],
    modeles: [
      { id: 'bat-retard', nom: 'Retard de chantier', quand: 'Le client reproche des délais non tenus.', texte: 'Bonjour {prenom}, merci pour votre retour. Nous comprenons votre mécontentement concernant {probleme}, et nous sommes désolés pour la gêne occasionnée. Nous aimerions en discuter avec vous directement : vous pouvez nous écrire à {contact}. {commerce}.' },
      { id: 'bat-devis', nom: 'Devis et facture', quand: 'L’avis évoque une différence de prix ou une mauvaise compréhension du devis.', texte: 'Bonjour {prenom}, merci d’avoir pris le temps d’écrire. Nous souhaitons comprendre ce qui a posé problème sur {probleme} et regarder les documents avec vous. Pourriez-vous nous écrire à {contact} pour que nous en parlions de vive voix ? {commerce}.' },
      { id: 'bat-merci', nom: 'Remerciement', quand: 'Avis positif sur un chantier.', texte: 'Merci {prenom} pour votre confiance et pour votre message ! Votre mot sur {element} fait plaisir à toute l’équipe de {commerce}. N’hésitez pas à nous contacter pour vos prochains travaux.' },
    ],
    qr: [
      'Sur la facture de fin de chantier, en bas de page, avec une phrase courte qui explique à quoi sert le code.',
      'Dans le mail ou le SMS qui accompagne la facture, avec le lien direct.',
      'Sur une carte de visite que tu laisses au client en partant, avec le QR code au dos.',
    ],
    fiche: [
      'Ta zone d’intervention au lieu d’une adresse de boutique, si tu te déplaces chez le client.',
      'Tes services listés avec les mots que tes clients emploient (dépannage, rénovation de salle de bain, peinture intérieure...).',
      'Des photos de tes réalisations, prises avec l’accord des clients, et de ton véhicule ou de ton équipe.',
    ],
    eviter: [
      'Publier des photos de chantier où l’on reconnaît le logement d’un client sans son accord.',
      'Écrire en réponse publique l’adresse, le montant ou des éléments de la commande.',
      'Négocier un avis contre une remise sur une prochaine intervention.',
    ],
  },
  {
    slug: 'garage-automobile',
    nom: 'garage automobile',
    titre: 'Avis Google pour un garage automobile : demander, répondre, soigner sa fiche',
    description: 'Garagiste : répondre à un avis sur un délai de réparation, un devis ou une panne qui revient, et mettre le QR code d’avis au bon endroit (remise des clés, facture).',
    intro: 'On vient au garage souvent avec une inquiétude : une panne, un contrôle, une facture à venir. Les avis parlent donc de confiance, de délais et de transparence sur les prix. La façon de répondre en dit long sur la façon dont tu traites les clients.',
    situations: [
      { t: 'La réparation plus longue que prévu', p: 'Une immobilisation du véhicule coûte au client en organisation et en stress. Explique en une phrase s’il y avait un aléa (pièce en attente, diagnostic qui change) et remercie pour la patience. Ne cite ni l’immatriculation ni le modèle précis.' },
      { t: 'La facture plus élevée que le devis', p: 'Le sujet est sensible. Reconnais que la compréhension du devis est essentielle, et propose un échange privé où vous pourrez regarder les documents ensemble. Évite de détailler chaque ligne en public.' },
      { t: 'La panne qui revient', p: 'Ne conteste pas la réalité de ce que vit le client. Dis que tu veux revoir le véhicule et donne un moyen de te joindre. Ce que tu feras ensuite se règle hors des commentaires.' },
      { t: 'L’avis de confiance', p: 'Les clients qui disent « on m’a expliqué ce qui avait été fait » rappellent ce que les autres cherchent. Remercie et cite le point qu’ils ont apprécié, sans en faire un argument de vente.' },
    ],
    modeles: [
      { id: 'garage-delai', nom: 'Délai de réparation', quand: 'Le client a attendu plus longtemps que ce qu’on lui avait annoncé.', texte: 'Bonjour {prenom}, merci pour votre retour. Nous comprenons que {probleme} ait compliqué votre organisation, et nous nous en excusons. Nous aimerions en reparler avec vous : vous pouvez nous écrire à {contact}. {commerce}.' },
      { id: 'garage-devis', nom: 'Devis et facture', quand: 'L’avis porte sur le prix final ou sur la clarté du devis.', texte: 'Bonjour {prenom}, merci d’avoir partagé votre ressenti sur {probleme}. Un devis doit être clair pour que vous puissiez décider sereinement. Nous vous proposons de regarder les documents ensemble : écrivez-nous à {contact}. {commerce}.' },
      { id: 'garage-merci', nom: 'Remerciement', quand: 'Avis positif.', texte: 'Merci {prenom} pour votre confiance et votre message ! Votre mot sur {element} nous fait plaisir. À bientôt chez {commerce}.' },
    ],
    qr: [
      'À la remise des clés, à l’accueil, au moment où le client récupère son véhicule.',
      'Sur la facture ou le compte rendu d’intervention remis à la fin.',
      'Dans le SMS qui annonce que le véhicule est prêt, avec le lien direct.',
    ],
    fiche: [
      'Les horaires d’atelier et d’accueil, qui ne sont pas toujours les mêmes, et les jours de fermeture.',
      'Les services réalisés (entretien, pneus, contrôle, carrosserie...) listés avec des mots simples.',
      'Des photos de l’atelier, de l’accueil et de l’équipe, pour qu’on reconnaisse le lieu en arrivant.',
    ],
    eviter: [
      'Donner dans une réponse publique la plaque d’immatriculation, le nom complet ou le détail d’une intervention.',
      'Accuser un client de mauvaise foi : même si tu as raison, le lecteur retient le ton.',
      'Promettre une réparation gratuite en échange d’un changement de l’avis.',
    ],
  },
  {
    slug: 'boulangerie',
    nom: 'boulangerie-pâtisserie',
    titre: 'Avis Google pour une boulangerie : demander, répondre, soigner sa fiche',
    description: 'Boulanger-pâtissier : répondre à un avis sur une rupture de produit, l’attente au comptoir ou l’accueil, mettre un QR code à la caisse et soigner horaires et jours fériés sur ta fiche.',
    intro: 'Une boulangerie, c’est un commerce de routine et de quartier : on y passe tous les jours ou presque. Les avis parlent de l’accueil, des produits qui manquent à 17 heures et de l’attente le dimanche matin. Les réponses courtes et chaleureuses fonctionnent le mieux.',
    situations: [
      { t: 'Le produit en rupture', p: 'Un client qui vient pour une pâtisserie précise et repart sans elle le dit. Remercie, explique en une phrase comment tu produis (par fournées, sur commande) si c’est utile, et propose la précommande lorsqu’elle existe.' },
      { t: 'L’attente au comptoir', p: 'Le dimanche matin ou à la sortie des écoles, la file s’allonge. Reconnais le désagrément sans te lancer dans une explication de l’organisation du laboratoire.' },
      { t: 'L’accueil jugé froid', p: 'C’est délicat, parce que c’est une impression. Remercie pour le retour, dis que tu en parles avec l’équipe, et évite de contester le ressenti du client.' },
      { t: 'L’horaire qui ne correspond pas', p: 'Le client est venu pendant une fermeture que ta fiche n’indiquait pas. Excuse-toi, corrige la fiche tout de suite, et garde-en le réflexe avant chaque férié.' },
    ],
    modeles: [
      { id: 'boul-rupture', nom: 'Produit en rupture', quand: 'Le client n’a pas trouvé ce qu’il venait chercher.', texte: 'Bonjour {prenom}, merci pour votre retour. Nous sommes désolés que {probleme} : nous faisons tout pour avoir de quoi satisfaire chacun, mais cela nous échappe parfois. Vous pouvez nous écrire à {contact} si vous souhaitez réserver votre prochaine commande. {commerce}.' },
      { id: 'boul-attente', nom: 'Attente au comptoir', quand: 'La critique porte sur la file d’attente ou le temps de service.', texte: 'Bonjour {prenom}, merci d’avoir pris le temps de nous écrire. L’attente que vous décrivez, {probleme}, n’est pas agréable et nous en parlons avec l’équipe de {commerce}. Nous espérons vous revoir bientôt.' },
      { id: 'boul-merci', nom: 'Remerciement', quand: 'Avis positif.', texte: 'Merci {prenom} pour votre mot ! Que {element} vous plaise fait chaud au cœur à toute l’équipe de {commerce}. À très vite.' },
    ],
    qr: [
      'À la caisse, sur le comptoir, près du terminal de paiement ou de la tirelire.',
      'Sur le sac en papier ou la boîte à gâteaux, avec une phrase courte.',
      'Sur la carte de fidélité ou la carte de commande de pâtisseries.',
    ],
    fiche: [
      'Tes horaires, avec le jour de fermeture hebdomadaire et les congés annuels.',
      'Les jours fériés et les fermetures exceptionnelles, à revoir avant chaque pont.',
      'Des photos récentes de la vitrine et des produits du jour, pas seulement de la façade.',
    ],
    eviter: [
      'Offrir une viennoiserie en échange d’un avis : Google le refuse.',
      'Répondre au client en public sur ce qu’il a acheté ou sur ses habitudes.',
      'Laisser des horaires de fête de fin d’année non corrigés après la période.',
    ],
  },
  {
    slug: 'institut-de-beaute',
    nom: 'institut de beauté',
    titre: 'Avis Google pour un institut de beauté : demander, répondre, soigner sa fiche',
    description: 'Esthéticienne, institut, onglerie : répondre à un avis sur un soin, un rendez-vous ou l’ambiance, QR code en cabine ou à la caisse, et points de fiche Google à vérifier.',
    intro: 'Un institut vend un moment autant qu’un soin. Les avis évoquent l’accueil, le calme, le résultat et la ponctualité. Comme on parle du corps et de la peau, les réponses publiques demandent un peu de retenue sur ce qu’on dit du client.',
    situations: [
      { t: 'Le résultat du soin qui déçoit', p: 'Reconnais la déception sans te justifier techniquement en public. Ne mentionne rien sur l’état de la peau, les produits utilisés ou le profil de la personne : c’est une information personnelle. Propose un échange privé.' },
      { t: 'Le rendez-vous qui décale', p: 'Un retard casse l’ambiance de détente. Excuse-toi simplement et, si tu peux, dis ce que tu changes pour limiter les décalages.' },
      { t: 'L’ambiance ou la propreté', p: 'La propreté d’une cabine est un sujet sensible. Remercie de la remarque, dis que tu la prends au sérieux et que tu en parles avec l’équipe, sans énumérer ce que tu fais d’habitude.' },
      { t: 'L’avis enthousiaste', p: 'Remercie en citant un moment précis (l’accueil, le massage, le conseil). Évite d’annoncer des promotions dans la réponse : Google y est attentif.' },
    ],
    modeles: [
      { id: 'inst-resultat', nom: 'Soin qui ne convient pas', quand: 'La cliente n’est pas satisfaite du résultat.', texte: 'Bonjour {prenom}, merci pour votre retour. Nous sommes désolés que votre soin chez {commerce} ne vous ait pas convenu, en particulier {probleme}. Nous aimerions en parler avec vous en toute discrétion : écrivez-nous à {contact}.' },
      { id: 'inst-retard', nom: 'Retard ou rendez-vous décalé', quand: 'Le créneau n’a pas été respecté.', texte: 'Bonjour {prenom}, merci de nous avoir écrit. Le décalage que vous décrivez, {probleme}, n’aurait pas dû arriver et nous vous présentons nos excuses. L’équipe de {commerce} revoit l’organisation des rendez-vous. Vous pouvez aussi nous écrire à {contact}.' },
      { id: 'inst-merci', nom: 'Remerciement', quand: 'Avis positif.', texte: 'Merci {prenom} pour votre message ! Votre mot sur {element} nous touche. À très bientôt chez {commerce}.' },
    ],
    qr: [
      'À l’accueil, sur le comptoir, juste avant ou après le paiement.',
      'Sur le ticket ou la fiche de soin remise à la fin, avec une phrase très courte.',
      'Dans le SMS ou le mail de rappel du prochain rendez-vous, avec le lien direct.',
    ],
    fiche: [
      'Tes soins et tes prestations listés avec leur durée, avec des mots simples.',
      'Les horaires et la façon de prendre rendez-vous, vérifiés depuis ton téléphone.',
      'Des photos de l’espace d’accueil et des cabines, sans clients reconnaissables.',
    ],
    eviter: [
      'Parler de la peau, du poids ou de l’état de santé d’un client dans une réponse publique.',
      'Publier des photos avant-après d’une personne sans son accord écrit.',
      'Annoncer des remises ou des cadeaux dans la réponse à un avis.',
    ],
  },
]

export const METIER_PAR_SLUG = Object.fromEntries(METIERS.map(m => [m.slug, m]))
export const metierParSlug = (slug) => METIER_PAR_SLUG[slug] || null
