import PageLegale, { Titre, Champ } from '../components/PageLegale'
import { Link } from 'react-router-dom'
import { EDITEUR, LOI_ET_TRIBUNAL, PRIX } from '../lib/legal.mjs'

const eur = (n) => `${String(n).replace('.', ',')} €`

export default function Cgv() {
  return (
    <PageLegale titre="Conditions générales de vente" chemin="/cgv" description="Prix, paiement, délais, garantie et résiliation pour les commandes d'avis et les abonnements SwimUp, réservés aux professionnels.">
      <p className="mt-3">Ces conditions s'appliquent aux achats faits sur swimup.net : commandes d'avis et abonnements aux offres payantes. Elles complètent les <Link to="/cgu" className="text-sky-600 underline">CGU</Link>. Vendeur : <Champ v={EDITEUR.nom} /> (<Champ v={EDITEUR.statut} />), voir les <Link to="/mentions-legales" className="text-sky-600 underline">mentions légales</Link>.</p>

      <Titre>1. Réservé aux professionnels</Titre>
      <p>Les services payants de SwimUp sont réservés aux professionnels (commerçants, artisans, indépendants, entreprises, associations qui agissent dans le cadre de leur activité). En commandant, tu déclares agir pour ton activité professionnelle et pas à titre personnel. Les règles de vente aux consommateurs (droit de rétractation, médiation de la consommation) ne s'appliquent donc pas : voir la page <Link to="/retractation" className="text-sky-600 underline">rétractation et remboursement</Link>.</p>

      <Titre>2. Ce qui est vendu</Titre>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong className="text-slate-900">Commande d'avis Google Maps.</strong> Des membres de SwimUp rédigent et publient des avis sur la fiche que tu indiques, et sont rémunérés pour cela. Ce ne sont pas des avis spontanés de tes clients. Tu choisis le nombre d'avis, tu paies, puis tu suis la commande depuis un lien privé.</li>
        <li><strong className="text-slate-900">Abonnements Premium et Business.</strong> Accès à des outils supplémentaires pour gérer tes avis et ta visibilité (contenu détaillé sur la page <Link to="/offres" className="text-sky-600 underline">Offres</Link>).</li>
        <li><strong className="text-slate-900">Outils gratuits.</strong> Ils ne sont pas facturés.</li>
      </ul>
      <p className="mt-2">Aucune commande ne garantit une note, un classement ou le maintien d'un avis par Google. Tu restes responsable de l'usage des avis sur ta fiche, au regard des règles de Google et de la loi.</p>

      <Titre>3. Prix</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Avis commandé sans compte : {eur(PRIX.avisSansCompte)} par avis.</li>
        <li>Avis commandé avec un compte client : {eur(PRIX.avisAvecCompte)} par avis, et {PRIX.remisePremiumPourcent} % de remise en plus avec Premium actif. Un avis offert est ajouté tous les 10 avis commandés.</li>
        <li>Premium : {eur(PRIX.premiumMois)} par mois. Business : {eur(PRIX.businessMois)} par mois.</li>
      </ul>
      <p className="mt-2">Les prix sont en euros. <Champ v={EDITEUR.tva} />. Le prix payé est celui affiché au moment de la commande.</p>

      <Titre>4. Commander et payer</Titre>
      <p>La commande est ferme quand tu cliques pour payer : elle t'oblige à payer. Le paiement par carte passe par Stripe ; SwimUp ne voit jamais ton numéro de carte. Les clients avec compte peuvent aussi payer par PayPal : la commande est activée dès que le paiement est vu, en général sous 12 h. Un email de confirmation t'est envoyé.</p>

      <Titre>5. Délai de réalisation</Titre>
      <p>Les avis sont publiés par les membres en général sous 24 à 48 h après le paiement. Ce délai est indicatif : il peut s'allonger si la fiche est incorrecte ou si Google bloque la publication. Tu peux suivre l'avancement depuis le lien de suivi.</p>

      <Titre>6. Garantie de remplacement de 30 jours (avis uniquement)</Titre>
      <p>Si Google retire un avis commandé dans les 30 jours qui suivent sa publication, SwimUp le republie gratuitement. Il n'y a pas de remboursement de l'avis retiré. Cette garantie ne concerne que les avis commandés : elle ne s'applique pas aux abonnements.</p>

      <Titre>7. Abonnements : durée, renouvellement, résiliation</Titre>
      <p>Les abonnements sont mensuels et se renouvellent automatiquement chaque mois par prélèvement sur la carte utilisée, jusqu'à résiliation. Tu résilies à tout moment depuis ton espace client (page Premium) ; l'abonnement reste actif jusqu'à la fin de la période déjà payée, sans nouveau prélèvement. La période déjà commencée n'est pas remboursée. Un paiement par PayPal validé à la main donne 30 jours d'accès sans renouvellement automatique.</p>

      <Titre>8. Remboursement</Titre>
      <p>Les cas de remboursement (avis non publiés, commande qui ne peut pas être réalisée) sont décrits sur la page <Link to="/retractation" className="text-sky-600 underline">rétractation et remboursement</Link>.</p>

      <Titre>9. Service client et réclamations</Titre>
      <p>Pour toute question ou réclamation : <Champ v={EDITEUR.email} />. Les abonnés Premium et Business peuvent aussi ouvrir un ticket depuis leur espace.</p>

      <Titre>10. Données personnelles</Titre>
      <p>Les données utilisées pour la commande et le paiement sont décrites dans la <Link to="/confidentialite" className="text-sky-600 underline">politique de confidentialité</Link>. Les écritures de paiement sont conservées pour répondre aux obligations comptables.</p>

      <Titre>11. Droit applicable</Titre>
      <p>Droit français. <Champ v={LOI_ET_TRIBUNAL} /></p>
    </PageLegale>
  )
}
