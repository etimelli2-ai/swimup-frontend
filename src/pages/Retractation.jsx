import PageLegale, { Titre, Champ } from '../components/PageLegale'
import { Link } from 'react-router-dom'
import { EDITEUR } from '../lib/legal.mjs'

export default function Retractation() {
  return (
    <PageLegale titre="Rétractation et remboursement" chemin="/retractation" description="Délai de 14 jours pour les particuliers, cas où le droit de rétractation ne joue plus, remboursement et formulaire type.">
      <p className="mt-3">Cette page explique comment annuler un achat et être remboursé. Elle complète les <Link to="/cgv" className="text-sky-600 underline">conditions de vente</Link>.</p>

      <Titre>Qui peut se rétracter</Titre>
      <p>Le droit de rétractation de 14 jours protège les <strong className="text-slate-900">consommateurs</strong>, c'est-à-dire les personnes qui achètent en dehors de toute activité professionnelle. Si tu achètes pour ton commerce, ton entreprise ou ton activité indépendante, il ne s'applique pas. Les règles de remboursement ci-dessous pour les cas particuliers restent valables pour tout le monde.</p>

      <Titre>Délai</Titre>
      <p>Tu peux te rétracter sans donner de raison pendant 14 jours à partir du jour de la commande (service) ou de la souscription (abonnement). Pour cela, envoie ta décision sans ambiguïté, par exemple avec le formulaire ci-dessous, à <Champ v={EDITEUR.email} /> (ou à <Champ v={EDITEUR.adresse} />).</p>

      <Titre>Quand le droit de rétractation se termine plus tôt</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Si tu demandes que le service commence tout de suite et que SwimUp l'a entièrement exécuté avant la fin des 14 jours, tu ne peux plus te rétracter. Tu dois avoir donné ton accord exprès avant, en reconnaissant que tu perds ce droit une fois le service exécuté. <Champ v="[À FAIRE : recueillir cet accord exprès au moment de la commande, voir la liste de fin]" /></li>
        <li>Pour une commande d'avis : les avis déjà publiés avant ta demande ne sont pas remboursés si tu as demandé l'exécution immédiate. Les avis qui n'ont pas encore été publiés sont remboursés.</li>
      </ul>

      <Titre>Abonnement Premium ou Business</Titre>
      <p>Si tu te rétractes dans les 14 jours après avoir demandé un accès immédiat, tu paies seulement la partie du service utilisée jusqu'à ta demande, au prorata, et le reste t'est remboursé. Après ce délai, tu peux résilier à tout moment depuis ton espace : il n'y a plus de prélèvement à la fin de la période en cours, sans remboursement de la période déjà commencée.</p>

      <Titre>Remboursement</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Le remboursement est fait au plus tard 14 jours après que SwimUp a reçu ta décision de te rétracter.</li>
        <li>Il est fait par le même moyen que ton paiement (carte via Stripe, ou PayPal), sans frais pour toi.</li>
        <li>Si un avis est retiré par Google dans les 30 jours, la garantie de remplacement des CGV s'applique : l'avis est republié, il n'est pas remboursé.</li>
        <li>Si une commande n'est pas réalisée (fiche introuvable, avis impossible à publier), les avis non publiés sont remboursés. <Champ v="[À CONFIRMER : délai maximum de réalisation après lequel tu rembourses automatiquement]" /></li>
      </ul>

      <Titre>Formulaire type de rétractation</Titre>
      <p>À recopier et à envoyer si tu veux te rétracter. Tu peux aussi écrire un message qui dit clairement la même chose.</p>
      <blockquote className="mt-2 rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
        <p>À l'attention de <Champ v={EDITEUR.nom} />, <Champ v={EDITEUR.adresse} />, <Champ v={EDITEUR.email} /> :</p>
        <p className="mt-2">Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*) / pour la prestation de services (*) ci-dessous :</p>
        <ul className="mt-2 list-none space-y-1">
          <li>Commandé le (*) / reçu le (*) : ……………</li>
          <li>Nom du ou des consommateurs : ……………</li>
          <li>Adresse du ou des consommateurs : ……………</li>
          <li>Adresse email utilisée pour la commande : ……………</li>
          <li>Numéro de commande ou lien de suivi : ……………</li>
          <li>Date : ……………</li>
          <li>Signature du ou des consommateurs (uniquement en cas de notification du présent formulaire sur papier) : ……………</li>
        </ul>
        <p className="mt-2 text-xs text-slate-600">(*) Rayer la mention inutile.</p>
      </blockquote>
    </PageLegale>
  )
}
