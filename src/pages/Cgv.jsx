import PageLegale, { Titre, Champ } from '../components/PageLegale'
import { Link } from 'react-router-dom'
import { EDITEUR, MEDIATEUR, LOI_ET_TRIBUNAL, PRIX } from '../lib/legal.mjs'

const eur = (n) => `${String(n).replace('.', ',')} €`

export default function Cgv() {
  return (
    <PageLegale titre="Conditions générales de vente" chemin="/cgv" description="Prix, paiement, délais, garantie et résiliation pour les commandes d'avis et les abonnements SwimUp.">
      <p className="mt-3">Ces conditions s'appliquent aux achats faits sur swimup.net : commandes d'avis et abonnements aux offres payantes. Elles complètent les <Link to="/cgu" className="text-sky-600 underline">CGU</Link>. Vendeur : <Champ v={EDITEUR.nom} /> (<Champ v={EDITEUR.statut} />), voir les <Link to="/mentions-legales" className="text-sky-600 underline">mentions légales</Link>.</p>

      <Titre>1. Ce qui est vendu</Titre>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong className="text-slate-900">Commande d'avis Google Maps.</strong> Des membres de SwimUp rédigent et publient des avis sur la fiche que tu indiques, et sont rémunérés pour cela. Ce ne sont pas des avis spontanés de tes clients. Tu choisis le nombre d'avis, tu paies, puis tu suis la commande depuis un lien privé.</li>
        <li><strong className="text-slate-900">Abonnements Premium et Business.</strong> Accès à des outils supplémentaires pour gérer tes avis et ta visibilité (contenu détaillé sur la page <Link to="/offres" className="text-sky-600 underline">Offres</Link>).</li>
        <li><strong className="text-slate-900">Outils gratuits.</strong> Ils ne sont pas facturés.</li>
      </ul>
      <p className="mt-2">Aucune commande ne garantit une note, un classement ou le maintien d'un avis par Google. Tu restes responsable de l'usage des avis sur ta fiche, au regard des règles de Google et de la loi.</p>

      <Titre>2. Prix</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Avis commandé sans compte : {eur(PRIX.avisSansCompte)} par avis.</li>
        <li>Avis commandé avec un compte client : {eur(PRIX.avisAvecCompte)} par avis, et {PRIX.remisePremiumPourcent} % de remise en plus avec Premium actif. Un avis offert est ajouté tous les 10 avis commandés.</li>
        <li>Premium : {eur(PRIX.premiumMois)} par mois. Business : {eur(PRIX.businessMois)} par mois.</li>
      </ul>
      <p className="mt-2">Les prix sont indiqués en euros. TVA : <Champ v={EDITEUR.tva} />. Le prix payé est celui affiché au moment de la commande.</p>

      <Titre>3. Commander et payer</Titre>
      <p>La commande est ferme quand tu cliques pour payer : elle t'oblige à payer. Le paiement par carte passe par Stripe ; SwimUp ne voit jamais ton numéro de carte. Les clients avec compte peuvent aussi payer par PayPal : la commande est activée dès que le paiement est vu, en général sous 12 h. Un email de confirmation t'est envoyé.</p>

      <Titre>4. Délai de réalisation</Titre>
      <p>Les avis sont publiés par les membres en général sous 24 à 48 h après le paiement. Ce délai est indicatif : il peut s'allonger si la fiche est incorrecte ou si Google bloque la publication. Tu peux suivre l'avancement depuis le lien de suivi.</p>

      <Titre>5. Garantie de remplacement de 30 jours</Titre>
      <p>Si Google retire un avis commandé dans les 30 jours qui suivent sa publication, SwimUp le republie gratuitement, sans remboursement de l'avis retiré. <Champ v="[À CONFIRMER : conditions exactes de cette garantie commerciale (avis retiré à cause de ta fiche, nombre de remplacements, comment la demander)]" /></p>

      <Titre>6. Abonnements : durée, renouvellement, résiliation</Titre>
      <p>Les abonnements sont mensuels et se renouvellent automatiquement chaque mois par prélèvement sur la carte utilisée, jusqu'à résiliation. Tu résilies à tout moment depuis ton espace client (page Premium) ; l'abonnement reste actif jusqu'à la fin de la période déjà payée, sans nouveau prélèvement. Un paiement par PayPal validé à la main donne 30 jours d'accès sans renouvellement automatique.</p>

      <Titre>7. Droit de rétractation et remboursement</Titre>
      <p>Si tu achètes en tant que particulier, tu as 14 jours pour te rétracter, avec les limites prévues par la loi pour un service déjà exécuté à ta demande. Si tu achètes pour ton activité professionnelle, ce droit ne s'applique pas. Le détail, le calcul du remboursement et le formulaire type sont sur la page <Link to="/retractation" className="text-sky-600 underline">rétractation et remboursement</Link>.</p>

      <Titre>8. Service client et réclamations</Titre>
      <p>Pour toute question ou réclamation : <Champ v={EDITEUR.email} />. Les abonnés Premium et Business peuvent aussi ouvrir un ticket depuis leur espace.</p>
      <p className="mt-2">Si tu es consommateur et que nous n'avons pas réglé le litige, tu peux saisir gratuitement un médiateur de la consommation : <Champ v={MEDIATEUR} />. Tu peux aussi utiliser la plateforme européenne de règlement en ligne des litiges, si elle est accessible à la date de ton litige.</p>

      <Titre>9. Garanties légales</Titre>
      <p>Si tu es consommateur, tu bénéficies des garanties légales de conformité et, le cas échéant, de la garantie des vices cachés, qui s'appliquent indépendamment de la garantie de remplacement ci-dessus.</p>

      <Titre>10. Données personnelles</Titre>
      <p>Les données utilisées pour la commande et le paiement sont décrites dans la <Link to="/confidentialite" className="text-sky-600 underline">politique de confidentialité</Link>. Les écritures de paiement sont conservées pour répondre aux obligations comptables.</p>

      <Titre>11. Droit applicable</Titre>
      <p>Droit français. <Champ v={LOI_ET_TRIBUNAL} /></p>
    </PageLegale>
  )
}
