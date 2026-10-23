// Mails de prospection : français pour un commerce dans un pays francophone, anglais à l'étranger.
// La langue vient du serveur (champ `langue` de chaque fiche, calculé d'après l'adresse, le téléphone et le site) ;
// sans information on écrit en français. Le texte français est celui qui existait déjà, mot pour mot.
import { lienOutilPrepare } from './lienAvis.mjs'

export const langueDe = (p) => (p && p.langue === 'en' ? 'en' : 'fr')

// Mail de démarchage : il dit ce qu'est SwimUp (outils gratuits + offres) et renvoie
// vers la page des offres, où tout est expliqué avec les prix. Pas d'avis offert
// dans le mail. Les chiffres cités (note, nombre d'avis) sont ceux de la fiche
// du prospect, jamais inventés : sans donnée on ne cite rien.
const SUJET_FR = 'Votre fiche Google Maps : ce qui peut jouer sur sa visibilité'
const SUJET_EN = 'Your Google Maps listing: what can affect its visibility'

export const sujetDefaut = (langue = 'fr') => (langue === 'en' ? SUJET_EN : SUJET_FR)

function messageFr(p) {
  const note = p.note ? String(p.note).replace('.', ',') : null
  const constat = note && p.nb_avis != null
    ? `Votre fiche affiche ${note} sur 5 avec ${p.nb_avis} avis.`
    : 'J\'ai regardé votre fiche.'
  const lienOutil = lienOutilPrepare(p, 'mail')
  const intro = lienOutil.includes('id=')
    ? `J'ai préparé pour "${p.nom}" le lien direct vers votre formulaire d'avis Google, son QR code et une affiche à imprimer. C'est gratuit, sans inscription, vous pouvez le tester tout de suite :`
    : 'On a mis en ligne un outil gratuit qui crée le lien direct vers le formulaire d\'avis Google de votre établissement, son QR code et une affiche à imprimer :'
  return `Bonjour,

Je suis Enzo, je gère SwimUp. En regardant les fiches Google Maps du secteur, je suis tombé sur "${p.nom}". ${constat}

${intro}
${lienOutil}

On a aussi un diagnostic gratuit qui passe votre fiche en revue et indique quoi corriger, en 2 minutes :
https://swimup.net/outils/diagnostic-fiche-google?src=mail

Si vous voulez aller plus loin, on propose aussi des outils de suivi de réputation et d'envoi de demandes d'avis à vos propres clients. Tout est détaillé ici, avec les prix :
https://swimup.net/offres?src=mail

Si ça ne vous intéresse pas, ignorez simplement ce mail.

Vous recevez ce message parce que les coordonnées de votre entreprise sont publiques sur sa fiche Google Maps. Vous pouvez vous opposer à tout moment à être recontacté : {{LIEN_STOP}}
Comment sont utilisées vos données : https://swimup.net/confidentialite

Bonne journée,
Enzo
SwimUp`
}

function messageEn(p) {
  const note = p.note ? String(p.note) : null
  const constat = note && p.nb_avis != null
    ? `Your listing shows ${note} out of 5 with ${p.nb_avis} reviews.`
    : 'I had a look at your listing.'
  const lienOutil = lienOutilPrepare(p, 'mail', 'en')
  const intro = lienOutil.includes('id=')
    ? `I have prepared for "${p.nom}" the direct link to your Google review form, its QR code and a poster to print. It is free, with no sign-up, and you can try it right away:`
    : 'We have put online a free tool that creates the direct link to your business\'s Google review form, its QR code and a poster to print:'
  return `Hello,

I am Enzo, I run SwimUp. While looking at Google Maps listings in your area, I came across "${p.nom}". ${constat}

${intro}
${lienOutil}

We also have a free diagnostic that goes through your listing and tells you what to fix, in 2 minutes:
https://swimup.net/en/tools/google-business-profile-checkup?src=mail

If you want to go further, we also offer tools to track your reputation and to send review requests to your own customers. Everything is detailed here, with prices:
https://swimup.net/en/plans?src=mail

If this is not of interest, just ignore this email.

You are receiving this message because your business contact details are public on its Google Maps listing. You can object to being contacted again at any time: {{LIEN_STOP}}
How your data is used: https://swimup.net/en/privacy

Have a good day,
Enzo
SwimUp`
}

export function messageDefaut(p, langue = langueDe(p)) {
  return langue === 'en' ? messageEn(p) : messageFr(p)
}
