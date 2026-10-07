// Guides publics "aide aux commerçants". Pas de chiffres inventés : on décrit
// des pratiques et les règles de Google telles qu'elles sont publiées, avec
// un conseil de vérifier la page d'aide officielle quand elles peuvent changer.

export const GUIDES = [
  {
    slug: 'obtenir-des-avis-google',
    titre: 'Obtenir plus d\'avis Google, honnêtement',
    resume: 'Les gestes simples pour que tes vrais clients laissent un avis, sans enfreindre les règles de Google.',
    description: 'Comment obtenir plus d\'avis Google pour ton commerce : lien direct, QR code, bon moment pour demander, et ce qu\'il ne faut pas faire.',
    sections: [
      { t: 'Facilite le geste', p: [
        'La plupart des clients satisfaits ne laissent pas d\'avis par oubli, pas par mauvaise volonté. Plus le chemin est court, plus ils le font.',
        'Dans Google Business Profile, le bouton « Demander des avis » te donne un lien direct vers le formulaire. Mets ce lien partout où tu parles à tes clients : ticket, devis, facture, signature d\'email, message de confirmation.',
        'Sur place, un QR code vers ce même lien, imprimé et posé près de la caisse ou à la sortie, évite au client de chercher ta fiche.',
      ] },
      { t: 'Demande au bon moment', p: [
        'Le meilleur moment, c\'est juste après un bon moment passé chez toi : une prestation terminée, une livraison reçue, un client qui te remercie. Une phrase suffit : « Si ça t\'a plu, un avis sur Google nous aide beaucoup. »',
        'Pour un achat en ligne ou un rendez-vous, un petit email quelques heures ou un jour après marche mieux qu\'une demande immédiate.',
      ] },
      { t: 'Demande à tout le monde', p: [
        'Google interdit de ne solliciter que les clients contents (« filtrage des avis »). Pose la même demande à tous tes clients, avec le même lien, et accepte ce qui arrive. Un profil avec quelques avis moyens mais authentiques inspire plus confiance qu\'une page parfaite.',
      ] },
      { t: 'Ce qu\'il ne faut pas faire', p: [
        'Offrir une réduction, un cadeau ou un service en échange d\'un avis est contraire aux règles de Google sur les avis, même si tu ne demandes pas qu\'il soit positif.',
        'Acheter des avis, faire écrire des avis par tes proches ou tes employés, ou en poster toi-même sur ta propre fiche est aussi interdit. Google peut supprimer les avis et sanctionner la fiche, et en France les faux avis peuvent être sanctionnés comme pratique commerciale trompeuse.',
        'Les règles évoluent : le plus sûr est de relire de temps en temps la page d\'aide officielle de Google sur les avis.',
      ] },
      { t: 'Avec SwimUp', p: [
        'Dans ton espace client, l\'onglet « Outils avis » génère ton QR code, une affiche à imprimer et te permet d\'envoyer une demande d\'avis par email à tes propres clients.',
      ] },
    ],
  },
  {
    slug: 'repondre-aux-avis',
    titre: 'Répondre aux avis Google : méthode et modèles',
    resume: 'Une structure simple pour répondre aux avis positifs et négatifs, avec des modèles à adapter.',
    description: 'Comment répondre aux avis Google, positifs ou négatifs : structure d\'une bonne réponse, modèles prêts à adapter et erreurs à éviter.',
    sections: [
      { t: 'Pourquoi répondre', p: [
        'Ta réponse est lue par le client, mais surtout par les futurs clients qui comparent plusieurs commerces. Elle montre que quelqu\'un s\'occupe de la fiche et comment tu réagis quand ça se passe moins bien.',
      ] },
      { t: 'La structure qui marche', p: [
        '1. Remercie en citant un élément précis de l\'avis (le plat, le délai, la personne qui l\'a servi).',
        '2. Réponds au fond : confirme ce qui s\'est bien passé, ou reconnais ce qui n\'a pas fonctionné.',
        '3. Termine par une suite concrète : une invitation à revenir, ou un moyen de te contacter pour régler le problème.',
        'Reste court. Deux à quatre phrases suffisent.',
      ] },
      { t: 'Modèle : avis positif', p: [
        '« Merci beaucoup [prénom] pour ce retour ! Ça nous fait plaisir que [élément précis] vous ait plu. Toute l\'équipe sera ravie de vous revoir bientôt. »',
      ] },
      { t: 'Modèle : avis négatif', p: [
        '« Bonjour [prénom], merci d\'avoir pris le temps de nous écrire. Nous sommes désolés que [problème] ait gâché votre visite : ce n\'est pas le niveau que nous voulons offrir. Pouvez-vous nous écrire à [contact] pour que nous regardions ça ensemble ? »',
        'N\'écris pas de détails sur la commande ou la personne dans une réponse publique, et ne promets pas de compensation que tu ne pourras pas tenir.',
      ] },
      { t: 'À éviter', p: [
        'Répondre à chaud, accuser le client de mentir, copier-coller exactement la même réponse sous chaque avis, ou donner des informations personnelles.',
        'Si l\'avis te semble faux ou hors sujet, ne te bats pas en public : voir le guide sur les avis injustes.',
      ] },
      { t: 'Avec SwimUp', p: [
        'L\'outil « Répondre à un avis » de ton espace client te propose un brouillon à partir de l\'avis collé. Relis-le toujours et adapte-le avant de publier.',
      ] },
    ],
  },
  {
    slug: 'optimiser-fiche-google',
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
      { t: 'Vérifie régulièrement', p: [
        'Une fois par trimestre, relis ta fiche comme le ferait un nouveau client : horaires, téléphone, photos, liens. Les informations changent vite et les internautes peuvent proposer des modifications que tu dois valider.',
      ] },
    ],
  },
  {
    slug: 'avis-injuste-ou-faux',
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
      { t: 'Ce qu\'il ne faut pas faire', p: [
        'Ne contre-attaque pas avec de faux avis positifs ou de faux avis sur un concurrent : c\'est interdit, risqué, et ça finit souvent par se voir.',
        'La meilleure protection reste un volume régulier de vrais avis : un avis injuste pèse beaucoup moins quand il est entouré de dizaines d\'avis authentiques.',
      ] },
    ],
  },
]

export const guideParSlug = (slug) => GUIDES.find(g => g.slug === slug)
