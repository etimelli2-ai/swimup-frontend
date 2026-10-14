import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import PageLegale, { Titre, Champ, ARemplir } from '../components/PageLegale'
import { EDITEUR, CNIL } from '../lib/legal.mjs'

const LIEN_DISCORD = 'https://discord.gg/Dt2rmcHB5u'
const DUREE = '[À REMPLIR : durée]'

// Finalité, données, base légale, durée. Les durées de la dernière colonne viennent du fonctionnement réel quand il est connu.
const TRAITEMENTS = [
  ['Créer et gérer ton compte, te connecter', 'Email, mot de passe (haché), rôle, date de dernière connexion, double authentification si activée', 'Contrat (CGU)', 'Tant que ton compte existe, puis suppression à ta demande'],
  ['Prévenir la fraude et les comptes en double', 'Adresse IP à l\'inscription et à la connexion', 'Intérêt légitime (protéger le service et la rémunération des membres)', 'Tant que ton compte existe (elle est mise à jour à chaque connexion)'],
  ['Traiter les commandes d\'avis et les paiements', 'Email, lien de la fiche, nom et type d\'établissement, consignes de l\'avis, montant, identifiant de paiement Stripe ou PayPal', 'Contrat (CGV) et obligation légale (comptabilité)', 'Pièces comptables : 10 ans (obligation légale). Le reste : tant que ton compte existe'],
  ['Rémunérer les membres', 'Email PayPal, solde, historique des gains et des retraits, identifiant Discord (aide et vérification)', 'Contrat (CGU) et obligation légale (comptabilité)', 'Gains et retraits : 10 ans (comptabilité). Email PayPal et identifiant Discord : tant que ton compte existe'],
  ['Fournir les outils des entreprises', 'Configuration du lien d\'avis, historiques, analyses, campagnes (voir plus bas pour leurs durées)', 'Contrat', 'Voir la liste des durées plus bas'],
  ['Envoyer des emails du service', 'Email, contenu du message (vérification, commande, rappels, mot de passe oublié)', 'Contrat', 'Suivi technique d\'envoi : ' + DUREE],
  ['Contacter des commerçants pour leur présenter SwimUp (prospection entre professionnels)', 'Nom, adresse, téléphone, site web et email professionnels de la fiche Google, note et nombre d\'avis', 'Intérêt légitime (démarcher des professionnels pour une offre liée à leur activité)', 'Jusqu\'à opposition, et ' + DUREE + ' après le dernier échange'],
  ['Compter les visites des pages publiques', 'Page visitée, sans adresse IP ni cookie', 'Intérêt légitime (savoir quelles pages sont lues)', 'Statistiques agrégées : 1 an'],
  ['Aider les utilisateurs', 'Messages, tickets, erreurs techniques', 'Contrat et intérêt légitime', 'Erreurs techniques : 30 jours. Tickets : 30 jours'],
]

const SOUS_TRAITANTS = [
  ['Railway', "Héberge le site et l'API.", 'États-Unis ; Data Privacy Framework ou clauses contractuelles types selon leur accord de traitement (section 9.2)'],
  ['Turso', 'Héberge la base de données.', 'Irlande'],
  ['Resend', "Envoie les emails (service, demandes d'avis, campagnes).", 'États-Unis ; certifié Data Privacy Framework'],
  ['Stripe', "Encaisse les paiements par carte et les abonnements. SwimUp ne voit jamais ton numéro de carte.", 'États-Unis ; certifié Data Privacy Framework, avec clauses contractuelles types en secours'],
  ['PayPal', "Reçoit des paiements de clients et verse les gains des membres.", "Luxembourg (PayPal (Europe) S.à r.l. et Cie, S.C.A.). PayPal agit comme responsable de traitement indépendant : ses transferts éventuels hors UE relèvent de sa propre politique de confidentialité"],
  ['Google (Places)', "Fournit les derniers avis d'une fiche, les résultats de recherche locale et les fiches utilisées pour la prospection.", 'États-Unis ; certifié Data Privacy Framework, avec clauses contractuelles types en secours'],
  ['Groq', "Rédige les brouillons de réponse aux avis et les résumés d'analyse. Il reçoit le texte de l'avis pour travailler.", 'États-Unis ; clauses contractuelles types de l\'UE'],
  ['Umami', "Compte les visites des pages publiques, sans cookie, sans profil et sans adresse IP.", 'États-Unis (Umami Software, Inc.) ; clauses contractuelles types de l\'UE, accord de traitement accepté à l\'inscription'],
  ['Discord', "Aide et échanges avec les membres, si tu rejoins le serveur.", 'Discord décide seul de l\'usage de tes données sur son serveur'],
]

export default function Confidentialite() {
  const [conservation, setConservation] = useState(null)
  useEffect(() => { api.get('/public/conservation').then(r => setConservation(r.data.conservation)).catch(() => setConservation(false)) }, [])

  return (
    <PageLegale titre="Politique de confidentialité" chemin="/confidentialite" description="Qui traite tes données sur SwimUp, pourquoi, combien de temps, avec qui, et comment exercer tes droits (accès, effacement, opposition, réclamation auprès de la CNIL).">
      <p className="mt-3">Cette page explique quelles données personnelles SwimUp utilise, pourquoi, combien de temps elles sont gardées, qui les reçoit et comment tu gardes la main. Elle s'applique aux visiteurs, aux clients et aux membres.</p>

      <Titre>1. Qui est responsable</Titre>
      <p>Le responsable du traitement est <Champ v={EDITEUR.nom} /> (<Champ v={EDITEUR.statut} />), <Champ v={EDITEUR.adresse} />. Contact : <Champ v={EDITEUR.email} />. Il n'y a pas de délégué à la protection des données : l'adresse de contact ci-dessus sert pour toutes les demandes.</p>

      <Titre>2. Ce qu'on fait avec tes données</Titre>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <caption className="sr-only">Finalités, données, base légale et durée de conservation</caption>
          <thead>
            <tr className="border-b border-slate-300 text-slate-900">
              <th scope="col" className="py-2 pr-3">Pourquoi</th>
              <th scope="col" className="py-2 pr-3">Quelles données</th>
              <th scope="col" className="py-2 pr-3">Base légale</th>
              <th scope="col" className="py-2">Combien de temps</th>
            </tr>
          </thead>
          <tbody>
            {TRAITEMENTS.map(t => (
              <tr key={t[0]} className="border-b border-slate-200 align-top">
                <th scope="row" className="py-2 pr-3 font-medium text-slate-900">{t[0]}</th>
                <td className="py-2 pr-3">{t[1]}</td>
                <td className="py-2 pr-3">{t[2]}</td>
                <td className="py-2">{t[3].includes('[À REMPLIR') ? <ARemplir>{t[3]}</ARemplir> : t[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2">Pas de publicité, pas de revente de données, pas de décision automatique qui produise un effet juridique sur toi. Les mots de passe sont stockés hachés (illisibles).</p>

      <Titre>3. Les commerçants contactés par SwimUp</Titre>
      <p>Pour présenter SwimUp, nous écrivons à des commerces à partir des informations publiques de leur fiche Google (source : Google Places). Le message indique d'où vient l'adresse. Tu peux t'opposer à tout moment en répondant « stop » ou à <Champ v={EDITEUR.email} /> : ton adresse est alors retirée et on ne t'écrit plus. Chaque contact reçoit au plus une relance.</p>

      <Titre>4. Les adresses de tes clients (campagnes)</Titre>
      <p>Quand une entreprise lance une campagne d'emails d'avis, c'est elle qui décide d'écrire à ses clients : elle est responsable de ces adresses et SwimUp agit pour son compte (sous-traitant). Les adresses sont gardées le temps de l'envoi (et de la relance choisie), puis effacées à la fin de la campagne, au plus tard après 45 jours. SwimUp garde seulement une empreinte non réversible de chaque adresse pour ne pas redemander un avis à la même personne et pour respecter les désinscriptions. Chaque email contient un lien de désinscription. Les adresses ne sont jamais incluses dans l'export de l'entreprise.</p>

      <Titre>5. Qui reçoit tes données</Titre>
      <p>Seules les personnes qui administrent SwimUp y ont accès. Nous faisons appel à ces prestataires, qui traitent des données pour notre compte :</p>
      <ul className="mt-2 space-y-2">
        {SOUS_TRAITANTS.map(([nom, role, lieu]) => (
          <li key={nom}><strong className="text-slate-900">{nom}</strong> : {role} Localisation et garantie de transfert : {lieu.startsWith('[') ? <ARemplir>{lieu}</ARemplir> : lieu}.</li>
        ))}
      </ul>
      <p className="mt-2">Plusieurs de ces prestataires sont situés hors de l'Union européenne, surtout aux États-Unis. Les transferts reposent alors sur le Data Privacy Framework entre l'UE et les États-Unis ou sur des clauses contractuelles types, comme indiqué ci-dessus. Les autorités et les administrations peuvent aussi recevoir des données quand la loi l'impose.</p>

      <Titre>6. Combien de temps pour les outils des entreprises</Titre>
      {conservation === null && <p className="text-slate-600">Chargement…</p>}
      {conservation === false && <p className="text-slate-600">La liste n'a pas pu être chargée. Recharge la page, ou retrouve-la dans Réputation, onglet Réglages, une fois connecté.</p>}
      {conservation && (
        <ul className="space-y-2">
          {conservation.map(c => (
            <li key={c.donnee}><strong className="text-slate-900">{c.donnee}</strong> : {c.duree}.{c.note ? ` ${c.note}` : ''}</li>
          ))}
        </ul>
      )}

      <Titre>7. Tes droits</Titre>
      <p>Tu peux demander l'accès à tes données, leur correction, leur effacement, la limitation du traitement, leur portabilité, et t'opposer à un traitement fondé sur l'intérêt légitime (dont la prospection, sans avoir à te justifier). Quand le traitement repose sur ton consentement, tu peux le retirer à tout moment. Tu peux aussi donner des directives sur le sort de tes données après ton décès.</p>
      <p className="mt-2">Pour les outils des entreprises, tu télécharges une copie de tes données et tu les effaces toi-même : Réputation, onglet Réglages. L'effacement garde le lien d'avis (ton QR imprimé continue de marcher), les désinscriptions et les paiements.</p>
      <p className="mt-2">Pour toute autre demande (correction, suppression du compte, opposition), écris à <Champ v={EDITEUR.email} />. Tu peux aussi passer par le <a className="text-sky-600 underline" href={LIEN_DISCORD} target="_blank" rel="noopener noreferrer">salon Discord de SwimUp</a>, mais l'email reste le canal officiel. Nous répondons dans un délai d'un mois. Les écritures de paiement ne peuvent pas être effacées : la loi nous demande de les conserver.</p>

      <Titre>8. Réclamation</Titre>
      <p>Si tu estimes que tes droits ne sont pas respectés, tu peux d'abord nous écrire. Tu peux aussi saisir la {CNIL.nom} : {CNIL.adresse}, ou en ligne sur <a className="text-sky-600 underline" href={CNIL.plainte} target="_blank" rel="noopener noreferrer">cnil.fr/fr/plaintes</a>.</p>

      <Titre>9. Cookies</Titre>
      <p>Le seul cookie sert à te garder connecté. Aucun cookie publicitaire. Le détail est sur la page <Link to="/cookies" className="text-sky-600 underline">cookies</Link>.</p>

      <Titre>10. Ce que les outils ne font pas</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Google ne donne que les derniers avis d'une fiche (5 au maximum) : les analyses portent sur ceux-là.</li>
        <li>Les positions de visibilité sont des relevés indicatifs, pas un classement officiel de Google.</li>
        <li>Un clic sur ton lien d'avis ne veut pas dire qu'un avis a été publié.</li>
      </ul>
      <p className="mt-8 text-sm text-slate-600">Cette page est mise à jour quand les pratiques changent. La date est en haut de page.</p>
    </PageLegale>
  )
}
