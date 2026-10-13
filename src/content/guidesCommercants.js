// Guides publics "aide aux commerçants". Pas de chiffres inventés : on décrit
// des pratiques et les règles de Google telles qu'elles sont publiées, avec
// un conseil de vérifier la page d'aide officielle quand elles peuvent changer.

export const GUIDES = [
  {
    slug: 'obtenir-des-avis-google',
    icone: 'Star',
    couleur: 'sky',
    titre: 'Obtenir plus d\'avis Google, honnêtement',
    resume: 'Les gestes simples pour que tes vrais clients laissent un avis, sans enfreindre les règles de Google.',
    description: 'Comment obtenir plus d\'avis Google pour ton commerce : lien direct, QR code, bon moment pour demander, modèles de messages (SMS, email, à l\'oral) et ce qu\'il ne faut pas faire.',
    sections: [
      { t: 'Retrouve ton lien d\'avis', p: [
        'Tout part d\'un lien : celui qui ouvre directement le formulaire d\'avis de ta fiche. Dans ton profil Google, le bouton « Demander des avis » te le donne. Tu peux aussi le fabriquer à partir de l\'identifiant de ton lieu.',
        'Sans lien direct, le client doit chercher ta fiche, trouver le bon bouton, et beaucoup abandonnent en route. Avec le lien, il arrive en un geste sur la bonne page.',
      ] },
      { t: 'Crée ton lien et ton QR code', type: 'lien', href: '/outils/lien-avis-google', label: 'Ouvrir l\'outil gratuit', p: [
        'Notre outil gratuit transforme ton lien ou ton identifiant en QR code à télécharger et en affiche A4 prête à imprimer. Il fonctionne sans compte, directement dans ton navigateur.',
      ] },
      { t: 'Facilite le geste', p: [
        'La plupart des clients satisfaits ne laissent pas d\'avis par oubli, pas par mauvaise volonté. Plus le chemin est court, plus ils le font.',
        'Mets ton lien partout où tu parles à tes clients : ticket, devis, facture, signature d\'email, message de confirmation de rendez-vous.',
        'Sur place, un QR code vers ce même lien, imprimé et posé près de la caisse ou à la sortie, évite au client de chercher ta fiche. Pour un artisan, la facture de fin de chantier est un bon support. Pour un restaurant, l\'addition ou le plateau.',
      ] },
      { t: 'Demande au bon moment', p: [
        'Le meilleur moment, c\'est juste après la prestation : un service terminé, une livraison reçue, un chantier rendu. Le client a le souvenir frais et le téléphone en main.',
        'Pour un achat en ligne ou un rendez-vous, un petit message quelques heures ou un jour après marche mieux qu\'une demande immédiate.',
        'Demande simplement un avis, sans orienter la réponse : pas de « donnez-nous 5 étoiles », pas de « si vous avez aimé ».',
      ] },
      { t: 'Modèle : SMS', type: 'modele', p: [
        '« Bonjour [prénom], merci pour votre visite chez [commerce]. Si vous avez une minute, votre avis sur Google nous aide à nous améliorer et aide d\'autres personnes à nous connaître : [lien] »',
        'Garde le message court et envoie-le toi-même, à des clients qui ont déjà échangé avec toi. Évite les envois en masse à une liste achetée.',
      ] },
      { t: 'Modèle : email', type: 'modele', p: [
        '« Objet : Votre avis sur [commerce]\n\nBonjour [prénom],\n\nMerci d\'avoir choisi [commerce]. Votre retour, positif ou critique, nous aide à progresser. Voici le lien direct, cela prend moins d\'une minute : [lien]\n\nMerci et à bientôt,\n[ta signature] »',
        'Un seul rappel au maximum, quelques jours plus tard. Si la personne ne répond pas ou dit non, n\'insiste pas.',
      ] },
      { t: 'Modèle : à l\'oral', type: 'modele', p: [
        '« Si vous voulez nous laisser un avis sur Google, positif ou critique, le QR code est juste là. Ça prend une minute et ça nous aide beaucoup. »',
        'Dis-le à tous tes clients de la même façon, pas seulement à ceux qui te complimentent.',
      ] },
      { t: 'Demande à tout le monde', p: [
        'Google interdit de ne solliciter que les clients contents (« filtrage des avis »). Pose la même demande à tous tes clients, avec le même lien, et accepte ce qui arrive. Un profil avec quelques avis moyens mais authentiques inspire plus confiance qu\'une page parfaite.',
      ] },
      { t: 'Quand les avis arrivent', p: [
        'Réponds à tous, y compris aux avis négatifs : les futurs clients lisent aussi tes réponses. La méthode et des modèles sont dans notre guide « Répondre aux avis Google ».',
        'Note de temps en temps combien d\'avis tu reçois par mois et ce qui revient dans les commentaires. C\'est plus utile qu\'une note moyenne qui bouge un peu.',
      ] },
      { t: 'Ce qu\'il ne faut pas faire', type: 'attention', p: [
        'Offrir une réduction, un cadeau ou un service en échange d\'un avis est contraire aux règles de Google sur les avis, même si tu ne demandes pas qu\'il soit positif.',
        'Acheter des avis, faire écrire des avis par tes proches ou tes employés, ou en poster toi-même sur ta propre fiche est aussi interdit. Google peut supprimer les avis et sanctionner la fiche, et en France les faux avis peuvent être sanctionnés comme pratique commerciale trompeuse.',
        'Les règles évoluent : le plus sûr est de relire de temps en temps la page d\'aide officielle de Google sur les avis.',
      ] },
      { t: 'Avec SwimUp', type: 'swimup', p: [
        'Dans ton espace client, l\'onglet « Outils avis » génère ton QR code, une affiche à imprimer et te permet d\'envoyer une demande d\'avis par email à tes propres clients.',
      ] },
    ],
  },
  {
    slug: 'ou-mettre-son-qr-code-davis',
    icone: 'QrCode',
    couleur: 'sky',
    titre: 'Où mettre ton QR code d\'avis selon ton commerce',
    resume: 'Les bons supports pour un restaurant, une boutique, un artisan, un coiffeur ou un garage.',
    description: 'Où placer le QR code de tes avis Google selon ton activité : restaurant, boutique, artisan, coiffeur, garage. Bons supports, taille, texte d\'accroche et erreurs à éviter.',
    sections: [
      { t: 'Le principe', p: [
        'Un QR code marche quand le client a son téléphone en main, un moment tranquille et l\'envie de dire que c\'était bien. Il faut donc le placer là où ça arrive : au moment de payer, à la remise de la facture, dans le message qui suit la prestation.',
        'Google propose lui-même d\'indiquer son lien ou son QR code sur les reçus, dans les emails de remerciement, à la fin d\'une discussion ou sur un affichage en magasin (page d\'aide « Créer un lien ou un QR code pour demander des avis »).',
      ] },
      { t: 'Crée ton QR code avant d\'imprimer', type: 'lien', href: '/outils/lien-avis-google', label: 'Ouvrir l\'outil gratuit', p: [
        'Colle ton lien d\'avis Google, télécharge le QR code et imprime l\'affiche A4. Sans compte.',
      ] },
      { t: 'Quelques règles pour tous les supports', p: [
        'Teste le QR code avec deux téléphones différents avant d\'imprimer : le formulaire d\'avis de ta fiche doit s\'ouvrir tout de suite.',
        'Imprime-le assez grand. Un carré d\'environ 3 cm de côté est une bonne base pour un ticket ou une carte, plus grand pour une affiche vue à distance. Garde du blanc autour.',
        'Ajoute une phrase courte qui dit quoi faire, sans orienter la réponse : « Scannez pour laisser un avis sur Google ».',
        'Mets le même QR code partout : un seul lien, un seul code à suivre.',
      ] },
      { t: 'Restaurant, café, bar', p: [
        'Le bon moment est celui de l\'addition. Glisse une petite carte avec le QR code dans la pochette de l\'addition, ou imprime-le au dos du ticket. Un chevalet près de la caisse ou du terminal de paiement fonctionne aussi.',
        'Évite de le mettre au milieu de la table pendant le repas : le client mange, il n\'est pas disponible, et ça ressemble à de la pub.',
      ] },
      { t: 'Boulangerie, boutique, commerce de proximité', p: [
        'Le QR code se place à côté de la caisse ou du terminal de paiement, à hauteur des yeux, avec la phrase d\'invitation. Un autocollant ou une petite carte glissée dans le sac complète le dispositif.',
        'Pour une boutique où l\'on ne s\'arrête pas, mets-le aussi sur la vitrine côté intérieur, visible quand on sort.',
      ] },
      { t: 'Artisan du bâtiment, services à domicile', p: [
        'La fin de chantier est le meilleur moment : le client voit le résultat. Mets le QR code et le lien cliquable sur la facture (au format PDF, le lien s\'ouvre d\'un clic) et sur le devis signé pour les clients que tu reverras.',
        'Un SMS ou un email de remerciement le lendemain avec le lien direct marche bien aussi. Ta carte de visite peut porter le QR code au dos.',
      ] },
      { t: 'Coiffeur, institut, cabinet', p: [
        'Mets une petite carte avec le QR code dans le ticket ou la carte de rendez-vous remis à la caisse, et ajoute le lien dans le message de confirmation du prochain rendez-vous.',
        'Pour les praticiens, vérifie les règles de ta profession sur ce que tu peux afficher : certaines encadrent la publicité.',
      ] },
      { t: 'Garage, réparation', p: [
        'Le moment idéal est la remise du véhicule : le QR code figure sur la facture et dans la pochette de documents. Le SMS « votre véhicule est prêt » peut aussi porter le lien.',
        'Donne-le à tous les clients, y compris à ceux dont le dossier a été compliqué. Choisir seulement les clients contents est interdit par Google.',
      ] },
      { t: 'En ligne et par message', p: [
        'Pour les ventes en ligne et les rendez-vous, un QR code n\'a pas de sens : envoie le lien direct. Mets-le dans la signature de tes emails, dans l\'email de remerciement après la commande ou la prestation, et dans le SMS de fin de rendez-vous.',
        'Un message quelques heures ou un jour après marche mieux qu\'une demande immédiate.',
      ] },
      { t: 'Ce qu\'il ne faut pas faire', type: 'attention', p: [
        'Ne propose rien en échange d\'un avis : réduction, produit offert, café gratuit. Google considère les avantages offerts en échange d\'avis comme de l\'engagement artificiel, strictement interdit.',
        'Ne montre pas le QR code seulement aux clients que tu sais contents, et n\'écris pas « 5 étoiles » sur l\'affiche.',
        'Ne fais pas écrire d\'avis par ton équipe ou tes proches.',
      ] },
      { t: 'Mesurer ce que ça donne', p: [
        'Note le nombre d\'avis de ta fiche le jour où tu installes le QR code, puis regarde un mois plus tard. Avec un compte gratuit SwimUp, tu vois aussi combien de personnes ont scanné ton code ou cliqué sur ton lien. Un scan ne veut pas dire qu\'un avis a été publié.',
      ] },
      { t: 'Avec SwimUp', type: 'swimup', p: [
        'Dans ton espace client, l\'onglet « Outils avis » garde ton lien et ton QR code au même endroit et affiche les scans et les clics.',
      ] },
    ],
  },
  {
    slug: 'repondre-aux-avis',
    icone: 'MessageSquareReply',
    couleur: 'violet',
    titre: 'Répondre aux avis Google : méthode et modèles',
    resume: 'Une structure simple pour répondre aux avis positifs et négatifs, avec des modèles à adapter.',
    description: 'Comment répondre aux avis Google, positifs ou négatifs : structure d\'une bonne réponse, modèles prêts à adapter et erreurs à éviter.',
    sections: [
      { t: 'Pourquoi répondre', p: [
        'Ta réponse est lue par le client, mais surtout par les futurs clients qui comparent plusieurs commerces. Elle montre que quelqu\'un s\'occupe de la fiche et comment tu réagis quand ça se passe moins bien.',
      ] },
      { t: 'La structure qui marche', type: 'etapes', p: [
        '1. Remercie en citant un élément précis de l\'avis (le plat, le délai, la personne qui l\'a servi).',
        '2. Réponds au fond : confirme ce qui s\'est bien passé, ou reconnais ce qui n\'a pas fonctionné.',
        '3. Termine par une suite concrète : une invitation à revenir, ou un moyen de te contacter pour régler le problème.',
        'Reste court. Deux à quatre phrases suffisent.',
      ] },
      { t: 'Modèle : avis positif', type: 'modele', p: [
        '« Merci beaucoup [prénom] pour ce retour ! Ça nous fait plaisir que [élément précis] vous ait plu. Toute l\'équipe sera ravie de vous revoir bientôt. »',
      ] },
      { t: 'Modèle : avis négatif', type: 'modele', p: [
        '« Bonjour [prénom], merci d\'avoir pris le temps de nous écrire. Nous sommes désolés que [problème] ait gâché votre visite : ce n\'est pas le niveau que nous voulons offrir. Pouvez-vous nous écrire à [contact] pour que nous regardions ça ensemble ? »',
        'N\'écris pas de détails sur la commande ou la personne dans une réponse publique, et ne promets pas de compensation que tu ne pourras pas tenir.',
      ] },
      { t: 'À éviter', type: 'attention', p: [
        'Répondre à chaud, accuser le client de mentir, copier-coller exactement la même réponse sous chaque avis, ou donner des informations personnelles.',
        'Si l\'avis te semble faux ou hors sujet, ne te bats pas en public : voir le guide sur les avis injustes.',
      ] },
      { t: 'Plus de modèles', type: 'lien', href: '/outils/modeles-reponses-avis-google', label: 'Voir les 12 modèles', p: [
        'Quatre réponses aux avis positifs, cinq aux avis négatifs et trois aux avis faux ou injustes, avec le prénom du client et le nom de ton commerce qui se remplissent dans le texte. Gratuit, sans compte.',
      ] },
      { t: 'Avec SwimUp', type: 'swimup', p: [
        'L\'outil « Répondre à un avis » de ton espace client te propose un brouillon à partir de l\'avis collé. Relis-le toujours et adapte-le avant de publier.',
      ] },
    ],
  },
  {
    slug: 'optimiser-fiche-google',
    icone: 'MapPin',
    couleur: 'emerald',
    titre: 'Optimiser ta fiche Google Business Profile',
    resume: 'La checklist des éléments à renseigner pour que ta fiche soit complète et à jour.',
    description: 'Checklist pour optimiser ta fiche Google Business Profile : informations, catégories, photos, horaires, publications et avis.',
    sections: [
      { t: 'Les informations de base', p: [
        'Nom exact de l\'établissement (sans y ajouter de mots-clés : Google le refuse), adresse, zone de chalandise si tu te déplaces, téléphone, site web.',
        'Horaires normaux et horaires spéciaux (jours fériés, vacances). Une fiche avec de mauvais horaires fait perdre des clients et déclenche des avis négatifs évitables.',
      ] },
      { t: 'Catégories et services', p: [
        'Choisis la catégorie principale qui décrit le mieux ton activité principale, puis ajoute quelques catégories secondaires pertinentes.',
        'Renseigne la liste de tes services ou produits avec une courte description claire, dans les mots que tes clients emploient.',
      ] },
      { t: 'Photos', p: [
        'Ajoute de vraies photos : la façade, l\'intérieur, l\'équipe, des réalisations. Remplace-les quand elles ne sont plus d\'actualité.',
      ] },
      { t: 'Description et publications', p: [
        'La description présente ton activité en quelques phrases factuelles. Les publications (nouveautés, offres, événements) montrent que la fiche est vivante.',
      ] },
      { t: 'Avis et questions', p: [
        'Réponds aux avis régulièrement et surveille les questions posées par les internautes.',
        'Active les notifications pour ne pas laisser un avis sans réponse pendant des semaines.',
      ] },
      { t: 'Fais le point sur ta fiche', type: 'lien', href: '/outils/diagnostic-fiche-google', label: 'Ouvrir le diagnostic', p: [
        'Notre diagnostic reprend ces points sous forme de liste à cocher et te montre ce qu\'il reste à faire en premier. Gratuit, sans compte, et le score compte seulement ce que tu as coché.',
      ] },
      { t: 'Vérifie régulièrement', p: [
        'Une fois par trimestre, relis ta fiche comme le ferait un nouveau client : horaires, téléphone, photos, liens. Les informations changent vite et les internautes peuvent proposer des modifications que tu dois valider.',
      ] },
    ],
  },
  {
    slug: 'avis-injuste-ou-faux',
    icone: 'ShieldAlert',
    couleur: 'amber',
    titre: 'Avis injuste ou faux : que faire ?',
    resume: 'Quand signaler un avis à Google, comment réagir et quoi ne pas faire.',
    description: 'Avis Google injuste, faux ou abusif : comment le signaler, comment répondre et quels recours existent pour un commerçant.',
    sections: [
      { t: 'Distingue désagréable et abusif', p: [
        'Un avis sévère mais fondé sur une vraie expérience n\'est pas supprimable, même s\'il te fait mal. Google retire les avis qui enfreignent ses règles : propos injurieux ou haineux, contenu hors sujet, spam, conflit d\'intérêts, avis d\'une personne qui n\'a pas été cliente.',
      ] },
      { t: 'Signaler l\'avis', p: [
        'Depuis ta fiche, ouvre l\'avis concerné et utilise l\'option pour le signaler comme inapproprié, en choisissant le motif qui correspond. Garde une capture d\'écran de l\'avis et la date.',
        'Le traitement peut prendre du temps et Google ne répond pas toujours favorablement. Si ton signalement est refusé, tu peux le contester via le formulaire de recours de l\'aide Google Business Profile.',
      ] },
      { t: 'En attendant : réponds calmement', p: [
        'Une réponse publique polie, factuelle et courte rassure les futurs clients : « Nous n\'avons pas retrouvé de trace de cette commande, pouvez-vous nous contacter à [contact] ? ». Pas d\'attaque, pas d\'accusation.',
      ] },
      { t: 'Si ça devient grave', p: [
        'Menaces, harcèlement, diffamation répétée : conserve les preuves et renseigne-toi auprès d\'un professionnel du droit ou d\'une organisation de commerçants. Je ne donne pas de conseil juridique ici.',
      ] },
      { t: 'Ce qu\'il ne faut pas faire', type: 'attention', p: [
        'Ne contre-attaque pas avec de faux avis positifs ou de faux avis sur un concurrent : c\'est interdit, risqué, et ça finit souvent par se voir.',
        'La meilleure protection reste un volume régulier de vrais avis : un avis injuste pèse beaucoup moins quand il est entouré de dizaines d\'avis authentiques.',
      ] },
    ],
  },
]

export const guideParSlug = (slug) => GUIDES.find(g => g.slug === slug)
