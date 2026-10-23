import { RetractationEn } from './legalEn'
import { getLangue } from '../lib/i18n'
import PageLegale, { Titre, Champ } from '../components/PageLegale'
import { Link } from '../components/Lien'
import { EDITEUR } from '../lib/legal.mjs'

function RetractationFr() {
  return (
    <PageLegale titre="Rétractation et remboursement" chemin="/retractation" description="Pas de droit de rétractation pour les achats professionnels, et les cas où SwimUp rembourse une commande ou un abonnement.">
      <p className="mt-3">Cette page explique si tu peux annuler un achat et dans quels cas tu es remboursé. Elle complète les <Link to="/cgv" className="text-sky-600 underline">conditions de vente</Link>.</p>

      <Titre>Pas de droit de rétractation</Titre>
      <p>Le délai de rétractation de 14 jours protège les consommateurs. Les services de SwimUp sont réservés aux professionnels qui achètent pour leur activité : ce droit ne s'applique donc pas. Une fois la commande payée, elle est ferme.</p>

      <Titre>Quand tu es remboursé</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Commande d'avis : les avis qui n'ont pas pu être publiés (fiche introuvable, publication impossible) sont remboursés.</li>
        <li>Si Google retire un avis dans les 30 jours, la garantie de remplacement des CGV s'applique : l'avis est republié gratuitement, il n'est pas remboursé.</li>
        <li>Paiement en double ou erreur de montant de notre part : remboursement de la différence.</li>
        <li>Abonnement : tu résilies à tout moment depuis ton espace, il n'y a plus de prélèvement à la fin de la période en cours. La période déjà commencée n'est pas remboursée.</li>
      </ul>

      <Titre>Comment demander</Titre>
      <p>Écris à <Champ v={EDITEUR.email} /> avec ton numéro de commande ou ton lien de suivi. Le remboursement se fait par le même moyen que ton paiement (carte via Stripe, ou PayPal).</p>
    </PageLegale>
  )
}

// En anglais : la version traduite de pages/legalEn.jsx (le texte français fait foi).
export default function Retractation() {
  return getLangue() === 'en' ? <RetractationEn /> : <RetractationFr />
}
