// Guide de l'apporteur : qui cibler, où les trouver, comment les contacter, quoi leur dire.
// Les chiffres cités (prix, limites) sont ceux de la page /offres à ce jour ; le guide renvoie vers elle
// pour le détail. Rien n'est promis sur le classement Google ou les résultats.

import { versEn } from '../lib/chemins.mjs'

export const SOMMAIRE = [
  ['principe', 'Le principe'],
  ['cibles', 'À qui parler'],
  ['trouver', 'Où les trouver'],
  ['canaux', 'Comment les contacter'],
  ['messages', 'Messages à copier'],
  ['proposer', 'Quoi proposer'],
  ['questions', 'Leurs questions'],
  ['regles', 'Les règles'],
  ['suivi', 'Suivre ton travail'],
]

export const BONNES_CIBLES = [
  'Restaurants, bars, cafés, boulangeries',
  'Coiffeurs, barbiers, instituts de beauté, onglerie',
  'Garages, auto-écoles, contrôle technique',
  'Artisans : plombier, électricien, peintre, serrurier, chauffagiste',
  'Dentistes, kinés, ostéos, vétérinaires, opticiens',
  'Agences immobilières, comptables, photographes, salles de sport',
]

export const SIGNES_BON_PROSPECT = [
  'Peu d\'avis sur sa fiche Google (une trentaine ou moins).',
  'Une note sous 4,3, ou des avis restés sans réponse du patron.',
  'Une fiche ouverte depuis peu : le commerçant n\'a pas encore eu le temps de s\'en occuper.',
  'Une seule personne qui gère tout (petit commerce, indépendant) : elle décide sur place, sans devoir demander à un siège.',
]

export const A_EVITER = [
  'Les chaînes et franchises : la décision se prend ailleurs.',
  'Les entreprises qui ont déjà des centaines d\'avis et une très bonne note : elles n\'ont pas besoin de toi.',
  'Les particuliers : on ne parle qu\'à des professionnels.',
  'Toute personne qui t\'a déjà dit non ou stop.',
]

export const CANAUX = [
  { nom: 'Sur place', texte: 'Le plus efficace. Tu rentres, tu demandes le patron ou la patronne, tu montres l\'outil gratuit sur ton téléphone. Ça prend deux minutes et la personne voit tout de suite à quoi ça sert. Évite les heures de coup de feu (midi pour un restaurant, samedi pour un coiffeur).' },
  { nom: 'Téléphone', texte: 'Appelle en dehors des heures de service. Une phrase d\'accroche, une question, et tu proposes d\'envoyer le lien par SMS. Si on te dit que ce n\'est pas le moment, tu demandes quand rappeler.' },
  { nom: 'Message sur la page pro', texte: 'Instagram ou Facebook de l\'établissement, jamais un compte perso. Message court, avec le lien de l\'outil gratuit.' },
  { nom: 'Mail pro', texte: 'Seulement à l\'adresse professionnelle que l\'entreprise affiche publiquement (son site, sa fiche Google). Un mail à la fois, personnalisé, jamais un envoi en masse. Tu l\'envoies depuis ta propre adresse.' },
]

// Chaque message : { cible, canal, titre, texte }. Les mots entre crochets sont à remplacer avant d'envoyer.
// {outil} et {offres} sont remplacés par les liens de l'apporteur (avec son code).
export const MESSAGES = [
  {
    id: 'sur-place',
    titre: 'Sur place',
    pour: 'Commerce local, patron présent',
    texte: `Bonjour, excusez-moi de vous déranger deux minutes. Je m'appelle [ton prénom], je suis apporteur indépendant pour SwimUp, un site français d'outils pour les avis Google.

J'ai regardé votre fiche Google, [constat vrai : par exemple "vous avez 18 avis"]. Il existe un outil gratuit qui crée le lien direct vers le formulaire d'avis de votre établissement, avec un QR code à poser sur le comptoir et une affiche à imprimer.

Je peux vous montrer sur mon téléphone ? Ça prend deux minutes, et vous n'avez rien à payer ni à signer.`,
  },
  {
    id: 'telephone',
    titre: 'Téléphone',
    pour: 'Commerce ou artisan, premier appel',
    texte: `Bonjour, je m'appelle [ton prénom], je suis apporteur indépendant pour SwimUp. Je ne vous vends rien par téléphone, c'est juste pour vous parler d'un outil gratuit : il crée le lien direct pour qu'un client laisse un avis Google à [nom du commerce], avec un QR code à imprimer.

Est-ce que je peux vous envoyer le lien par SMS pour que vous regardiez quand vous avez deux minutes ?

(Si oui, tu envoies le message court ci-dessous. Si non, tu remercies et tu notes que la personne ne veut pas être rappelée.)`,
  },
  {
    id: 'court',
    titre: 'Message court (SMS, Instagram, Facebook)',
    pour: 'Après un appel, ou en premier contact sur la page pro',
    texte: `Bonjour, je suis [ton prénom], apporteur indépendant pour SwimUp. Voici un outil gratuit qui crée le lien direct vers le formulaire d'avis Google de [nom du commerce], avec QR code et affiche à imprimer : {outil}
Pas besoin de compte pour l'essayer. Si ça ne vous intéresse pas, dites-le moi et je ne vous écris plus.`,
  },
  {
    id: 'mail',
    titre: 'Mail pro',
    pour: 'Adresse professionnelle affichée publiquement',
    objet: 'Le lien d\'avis Google de [nom du commerce]',
    texte: `Bonjour,

Je m'appelle [ton prénom], je suis apporteur indépendant pour SwimUp, un site français d'outils pour les avis Google. J'ai trouvé votre adresse sur [votre site / votre fiche Google].

En regardant la fiche de [nom du commerce], [constat vrai : "j'ai vu 18 avis et une note de 4,1"]. SwimUp propose un outil gratuit qui crée le lien direct vers votre formulaire d'avis, un QR code et une affiche à imprimer. Vous pouvez l'essayer sans inscription :
{outil}

SwimUp propose aussi des abonnements payants (suivi des avis, réponses assistées par IA, campagnes d'emails) et des commandes d'avis. Tout est détaillé avec les prix ici : {offres}

Si vous ne souhaitez pas que je vous recontacte, répondez simplement « stop » et je ne vous écrirai plus.

Cordialement,
[ton prénom et ton nom]`,
  },
  {
    id: 'relance',
    titre: 'Relance (une seule)',
    pour: '3 à 4 jours après un message sans réponse',
    texte: `Bonjour, c'est [ton prénom], apporteur indépendant pour SwimUp. Je reviens vers vous une seule fois au sujet de l'outil gratuit de lien d'avis Google pour [nom du commerce] : {outil}
Si ça ne vous concerne pas, aucun souci, je ne vous relance plus.`,
  },
  {
    id: 'agence',
    titre: 'Freelance ou agence',
    pour: 'Community manager, agence web ou SEO local qui gère plusieurs fiches',
    objet: 'Un outil pour gérer les avis Google de vos clients',
    texte: `Bonjour,

Je m'appelle [ton prénom], je suis apporteur indépendant pour SwimUp. Vous gérez la présence en ligne de plusieurs entreprises, alors je pense que ça peut vous servir : SwimUp a une offre Agence pour suivre les avis de plusieurs établissements au même endroit (25 entreprises et 10 personnes d'équipe incluses, 49,90 € par mois à ce jour).

Avant de regarder l'abonnement, vous pouvez tester les outils gratuits (lien d'avis, QR code, affiche) : {outil}
Les offres et leur contenu exact sont ici : {offres}

Si ça ne vous concerne pas, répondez « stop » et je ne vous écris plus.

Cordialement,
[ton prénom et ton nom]`,
  },
]

export const PALIERS = [
  ['D\'abord, l\'outil gratuit', 'Lien d\'avis, QR code, affiche. Il le teste devant toi ou tout seul. C\'est ce qui lui donne une raison de créer un compte avec ton lien.'],
  ['Premium, 9,90 € par mois', 'Pour celui qui veut aller plus loin : demandes d\'avis par email, campagnes, réponses aux avis avec l\'IA, suivi de l\'évolution de sa note.'],
  ['Business, 24,90 € par mois', 'Pour celui qui a plusieurs établissements ou veut un relevé automatique de sa position sur Google Maps, un rapport mensuel et des accès d\'équipe.'],
  ['Agence, 49,90 € par mois', 'Pour un freelance ou une agence : tout Business, 25 entreprises et 10 personnes d\'équipe.'],
]

export const QUESTIONS = [
  ['C\'est vraiment gratuit ?', 'Oui pour le lien d\'avis, le QR code et l\'affiche. Les abonnements sont en option, personne n\'est obligé d\'en prendre.'],
  ['Je dois donner ma carte ?', 'Pas pour la partie gratuite. Pour un abonnement, le paiement se fait par carte (page Stripe) ou par PayPal, et il se résilie depuis la page Premium du compte.'],
  ['Vous vendez des faux avis ?', 'Réponds franchement : SwimUp propose aussi des commandes d\'avis, c\'est écrit sur le site. Ce n\'est pas ce que tu présentes, toi tu parles des outils. Pour les commandes d\'avis, dis à la personne de lire la page Offres et les CGV avant de décider. Tu ne dis jamais que c\'est sans risque et tu ne parles pas à la place de SwimUp sur ce sujet.'],
  ['Ça va me faire monter sur Google ?', 'Tu ne peux rien promettre sur le classement, et personne ne peut. Ce que fait l\'outil : rendre la demande d\'avis simple pour les clients du commerce. Rien de plus.'],
  ['Je n\'ai pas le temps.', 'Le lien se crée en deux minutes, tu peux le faire devant la personne. Sinon, tu laisses le lien et tu la laisses tranquille.'],
  ['C\'est qui derrière SwimUp ?', 'Un site français. Les mentions légales, les CGU et les CGV sont accessibles en bas de chaque page du site.'],
]

export const REGLES = [
  'Dis toujours que tu es apporteur indépendant. Tu n\'es pas salarié de SwimUp et tu ne parles jamais « au nom de l\'équipe ».',
  'Écris depuis ta propre adresse, ton propre numéro, tes propres comptes. Pas d\'adresse qui ressemble à SwimUp.',
  'Dis clairement ce qu\'est SwimUp : des outils pour les avis Google, des abonnements, et aussi des commandes d\'avis. Ne le cache pas, même si on ne te pose pas la question.',
  'Ne promets rien : ni classement, ni plus de clients, ni nombre d\'avis. Pas de faux témoignage, pas de chiffre inventé. Si tu cites un chiffre sur sa fiche (nombre d\'avis, note), vérifie-le avant.',
  'Si quelqu\'un dit stop, non ou « ne me recontactez pas », tu arrêtes tout de suite, sur tous les canaux, et tu notes son nom pour ne plus jamais le recontacter.',
  'Pas de listes de contacts achetées, pas d\'adresses perso trouvées on ne sait où, pas d\'envoi en masse. Un message pour une entreprise, écrit pour elle.',
  'Mail : seulement des adresses professionnelles publiques, en expliquant d\'où vient l\'adresse et en permettant de dire stop.',
  'Garde le strict minimum sur les gens que tu contactes (nom du commerce, un contact pro, date, réponse) et supprime-le quand tu n\'en as plus besoin.',
  'Pas de faux comptes ni de comptes créés par toi pour toi : la commission est annulée et l\'accès apporteur retiré.',
]

export const SUIVI = [
  'Tiens un petit tableau à toi : nom du commerce, métier, ville, note et nombre d\'avis, canal, date du contact, réponse, date de relance.',
  'Une relance maximum, 3 à 4 jours après. Sans réponse, tu laisses tomber.',
  'Regarde la page Apporteur : « Inscrits » te montre ceux qui ont créé un compte avec ton lien, « Abonnés » ceux qui ont payé.',
  'Teste, note ce qui marche (sur place, téléphone, mail), refais plus de ce qui marche. Ne compte pas sur un chiffre précis : ça dépend de ta ville, de ton métier cible et de ta façon d\'en parler.',
]

// Remplace {outil} et {offres} par les liens de l'apporteur (le code est gardé 30 jours chez la personne qui clique).
// Avec langue: 'en', les liens mènent aux pages anglaises (/en/tools/..., /en/plans).
export function remplirLiens(texte, { origine, code, langue = 'fr' }) {
  const ref = `?ref=${encodeURIComponent(code)}`
  const page = (chemin) => (langue === 'en' ? versEn(chemin) : chemin)
  return texte
    .replaceAll('{outil}', `${origine}${page('/outils/lien-avis-google')}${ref}`)
    .replaceAll('{offres}', `${origine}${page('/offres')}${ref}`)
}
