import PageLegale, { Titre } from '../components/PageLegale'
import { Link } from 'react-router-dom'
import { UMAMI_SCRIPT, DOMAINE_MESURE } from '../lib/mesure.mjs'

const LIGNES = [
  ['token', 'Cookie', 'Te garder connecté à ton compte (jeton de session, illisible par les scripts du site).', '2 heures', 'Oui, nécessaire au service que tu demandes'],
  ['theme', 'Stockage local du navigateur', "Retenir ton choix d'affichage clair ou sombre.", "Jusqu'à ce que tu l'effaces", 'Oui, choix que tu fais toi-même'],
  ['swimup_offre_souhaitee', 'Stockage local du navigateur', "Retenir l'offre que tu as regardée pour te la proposer à l'inscription.", "Jusqu'à la fin de l'inscription", 'Oui, sert uniquement ton parcours'],
  ['swimup_derniere_commande_…', 'Stockage local du navigateur', 'Pré-remplir ta prochaine commande avec les informations de la précédente (clients connectés).', "Jusqu'à ce que tu l'effaces", 'Oui, ne quitte jamais ton navigateur'],
  ['swimup_compte', 'Stockage de session', 'Retenir le compte sélectionné quand tu en gères plusieurs.', "Jusqu'à la fermeture de l'onglet", 'Oui, ne quitte jamais ton navigateur'],
]

export default function Cookies() {
  return (
    <PageLegale titre="Cookies et traceurs" chemin="/cookies" description="La liste des cookies et traceurs utilisés par SwimUp, et pourquoi aucun bandeau de consentement n'est affiché.">
      <p className="mt-3">Cette page liste tout ce que SwimUp pose ou lit sur ton appareil et tout service tiers chargé par le site. À la date de mise à jour, <strong className="text-slate-900">aucun cookie publicitaire, aucun pixel de suivi et aucun réseau social n'est chargé</strong>.</p>

      <Titre>Ce qui est posé sur ton appareil</Titre>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <caption className="sr-only">Cookies et données stockées par SwimUp</caption>
          <thead>
            <tr className="border-b border-slate-300 text-slate-900">
              <th scope="col" className="py-2 pr-3">Nom</th>
              <th scope="col" className="py-2 pr-3">Type</th>
              <th scope="col" className="py-2 pr-3">Rôle</th>
              <th scope="col" className="py-2 pr-3">Durée</th>
              <th scope="col" className="py-2">Exempté de consentement ?</th>
            </tr>
          </thead>
          <tbody>
            {LIGNES.map(l => (
              <tr key={l[0]} className="border-b border-slate-200 align-top">
                <th scope="row" className="py-2 pr-3 font-mono text-[13px] font-medium text-slate-900">{l[0]}</th>
                <td className="py-2 pr-3">{l[1]}</td>
                <td className="py-2 pr-3">{l[2]}</td>
                <td className="py-2 pr-3">{l[3]}</td>
                <td className="py-2">{l[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2">Ces éléments sont indispensables à un service que tu as demandé, ou servent uniquement à ton confort. La CNIL les dispense de consentement : c'est pour cela qu'aucun bandeau n'apparaît.</p>

      <Titre>Mesure d'audience</Titre>
      <p>Les pages publiques (accueil, offres, guides, outils, inscription) comptent leurs visites avec <strong className="text-slate-900">Umami</strong> (script chargé depuis <span className="font-mono text-[13px]">{new URL(UMAMI_SCRIPT).host}</span>, uniquement sur {DOMAINE_MESURE}). Umami ne pose aucun cookie et ne stocke rien sur ton appareil. Il ne garde ni ton adresse IP ni de profil, ne suit pas ta navigation d'un site à l'autre et respecte le réglage « Ne pas me suivre » de ton navigateur. Rien n'est mesuré dans l'espace connecté, ni sur la page de suivi d'une commande.</p>
      <p className="mt-2">Ces données ne servent qu'à savoir quelles pages sont lues, pour le compte exclusif de SwimUp. Dans ces conditions, une mesure d'audience anonyme peut se passer de consentement selon la CNIL. Si cela changeait (autre outil, autre réglage), un bandeau avec « Tout accepter » et « Tout refuser » serait ajouté avant tout chargement.</p>

      <Titre>Services tiers</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong className="text-slate-900">Polices :</strong> Bricolage Grotesque est hébergée sur le site lui-même. Aucune police n'est chargée depuis Google.</li>
        <li><strong className="text-slate-900">Paiement :</strong> en cliquant sur payer par carte, tu quittes SwimUp pour la page sécurisée de Stripe (ou de PayPal), qui a ses propres règles sur son domaine. SwimUp n'y charge aucun script.</li>
        <li><strong className="text-slate-900">Liens externes :</strong> Discord, Instagram et TikTok ne déposent rien tant que tu ne cliques pas sur leur lien.</li>
      </ul>

      <Titre>Gérer ces éléments</Titre>
      <p>Tu peux effacer le stockage du site depuis les réglages de ton navigateur. Tu seras alors déconnecté et ton thème sera remis par défaut. Pour comprendre ce que font tes données, lis la <Link to="/confidentialite" className="text-sky-600 underline">politique de confidentialité</Link>.</p>
    </PageLegale>
  )
}
