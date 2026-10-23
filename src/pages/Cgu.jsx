import { CguEn } from './legalEn'
import { getLangue } from '../lib/i18n'
import PageLegale, { Titre, Champ } from '../components/PageLegale'
import { Link } from '../components/Lien'
import { EDITEUR, LOI_ET_TRIBUNAL } from '../lib/legal.mjs'

function CguFr() {
  return (
    <PageLegale titre="Conditions générales d'utilisation" chemin="/cgu" description="Les règles d'utilisation du site SwimUp pour les membres, les clients et les visiteurs.">
      <p className="mt-3">Ces conditions s'appliquent à toute personne qui utilise swimup.net : visiteur, client (entreprise qui utilise les outils ou commande des avis) ou membre (personne qui rédige et publie des avis contre rémunération). Les conditions de vente sont à part : voir les <Link to="/cgv" className="text-sky-600 underline">CGV</Link>.</p>

      <Titre>1. Qui édite le site</Titre>
      <p>SwimUp est édité par <Champ v={EDITEUR.nom} /> (<Champ v={EDITEUR.statut} />). Les coordonnées complètes sont dans les <Link to="/mentions-legales" className="text-sky-600 underline">mentions légales</Link>.</p>

      <Titre>2. Créer un compte</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Il faut avoir au moins 18 ans.</li>
        <li>Les informations données à l'inscription doivent être vraies. Une adresse email valide est obligatoire et doit être vérifiée.</li>
        <li>Un compte est personnel. Une personne = un compte : les doublons peuvent être détectés (voir la politique de confidentialité) et bloqués.</li>
        <li>Tu es responsable de ton mot de passe. Active la double authentification si elle t'est proposée. Si tu penses que ton compte est piraté, préviens-nous vite.</li>
        <li>Les comptes clients et les comptes membres sont séparés : un client n'a pas accès à l'espace membre.</li>
      </ul>

      <Titre>3. Ce que fait SwimUp</Titre>
      <p>SwimUp propose aux entreprises des outils pour demander des avis à leurs vrais clients, répondre aux avis et suivre leur fiche Google (lien et QR code, modèles de réponses, campagnes d'emails, suivi de visibilité), en version gratuite ou payante. SwimUp propose aussi un service de commande d'avis, rédigés et publiés par des membres rémunérés (voir CGV).</p>
      <p className="mt-2">SwimUp n'est pas affilié à Google. Aucune offre ne garantit un nombre d'avis, une note ou une place dans les résultats.</p>

      <Titre>4. Règles pour tous</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Respecter la loi et les règles de Google et des autres plateformes concernées.</li>
        <li>Ne pas tenter d'accéder à des données qui ne sont pas les tiennes, ni de perturber le site (attaque, automatisation abusive, contournement des limites).</li>
        <li>Ne pas publier de contenu illégal, diffamatoire, haineux, ou qui porte atteinte à une personne ou à une entreprise.</li>
        <li>Ne pas utiliser les outils d'email pour envoyer des messages à des personnes qui n'ont pas de lien avec ton activité, ni après une désinscription.</li>
      </ul>

      <Titre>5. Règles pour les clients</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Tu es responsable des informations que tu donnes (lien de ta fiche, textes, adresses email de tes clients).</li>
        <li>Pour les campagnes d'emails, tu dois avoir le droit de contacter les personnes concernées, et tu les informes de l'usage de leur adresse. SwimUp envoie pour toi et ajoute un lien de désinscription.</li>
        <li>Tu es seul responsable de l'usage que tu fais des avis commandés sur ta fiche, au regard des règles de Google et de la loi.</li>
      </ul>

      <Titre>6. Règles pour les membres</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Un membre publie les avis depuis son propre compte Google, en suivant les consignes de la commande, et ne se fait jamais passer pour quelqu'un d'autre.</li>
        <li>Chaque avis publié est vérifié avant rémunération. Un avis non conforme, supprimé trop vite par Google ou obtenu par fraude peut ne pas être payé ou être déduit.</li>
        <li>La rémunération dépend du barème affiché dans ton espace. Le retrait se fait par PayPal, à la demande, une fois le solde disponible. Tu es responsable de déclarer tes gains selon ta situation fiscale.</li>
        <li>Tu n'es pas salarié de SwimUp : tu choisis librement les avis que tu réalises.</li>
      </ul>

      <Titre>7. Suspension et fin de compte</Titre>
      <p>Tu peux demander la suppression de ton compte à tout moment (voir la politique de confidentialité). SwimUp peut suspendre ou fermer un compte qui ne respecte pas ces règles, après l'avoir prévenu quand c'est possible. Les sommes dues pour un travail conforme restent payées.</p>

      <Titre>8. Disponibilité et responsabilité</Titre>
      <p>SwimUp fait de son mieux pour que le site fonctionne, mais ne garantit pas une disponibilité continue. Les outils reposent sur des données de tiers (Google notamment) qui peuvent changer ou manquer. SwimUp n'est pas responsable des décisions de Google (suppression d'un avis, suspension d'une fiche) ni des pertes indirectes. Cette limite ne s'applique pas là où la loi l'interdit, notamment pour les consommateurs.</p>

      <Titre>9. Modifier ces conditions</Titre>
      <p>Ces conditions peuvent évoluer. La date de mise à jour est en haut de page. Si le changement est important, les utilisateurs seront prévenus par email ou dans leur espace.</p>

      <Titre>10. Droit applicable</Titre>
      <p>Ces conditions sont régies par le droit français. En cas de litige, on essaie d'abord de trouver une solution à l'amiable. <Champ v={LOI_ET_TRIBUNAL} /></p>
    </PageLegale>
  )
}

// En anglais : la version traduite de pages/legalEn.jsx (le texte français fait foi).
export default function Cgu() {
  return getLangue() === 'en' ? <CguEn /> : <CguFr />
}
