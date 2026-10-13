import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import api from '../lib/api'
import Seo from '../components/Seo'

const LIEN_DISCORD = 'https://discord.gg/Dt2rmcHB5u'

const SOUS_TRAITANTS = [
  ['Railway', "Héberge le site et l'API."],
  ['Turso', 'Héberge la base de données.'],
  ['Resend', "Envoie les emails (demandes d'avis, campagnes, rappels, messages du compte)."],
  ['Stripe', "Encaisse les abonnements Premium par carte. SwimUp ne voit jamais ton numéro de carte."],
  ['Google (Places)', "Donne les derniers avis de ta fiche et les résultats de recherche pour la visibilité locale."],
  ['Umami', "Compte les visites des pages publiques (accueil, guides, outils, inscription), sans cookie, sans profil et sans stocker ton adresse IP. Respecte le réglage « Ne pas me suivre » de ton navigateur."],
  ['Groq', "Rédige les brouillons de réponse aux avis et les résumés d'analyse. Il reçoit le texte de l'avis pour travailler, SwimUp ne le garde pas."],
]

function Titre({ children }) {
  return <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-2">{children}</h2>
}

export default function Confidentialite() {
  const [conservation, setConservation] = useState(null)
  useEffect(() => { api.get('/public/conservation').then(r => setConservation(r.data.conservation)).catch(() => setConservation(false)) }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Seo title="Confidentialité" description="Quelles données SwimUp garde pour les outils des entreprises, combien de temps, et comment les télécharger ou les effacer." path="/confidentialite" />
      <header className="border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center"><Star size={12} className="text-white fill-white" /></div>
            <span className="text-[15px] font-semibold tracking-tight">SwimUp</span>
          </Link>
          <a href="/login" className="text-[13px] text-sky-600 hover:text-sky-700 font-medium">Se connecter</a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 text-[15px] leading-relaxed text-slate-700">
        <h1 className="text-2xl font-bold text-slate-900">Confidentialité des outils pour entreprises</h1>
        <p className="mt-3">Cette page explique ce que SwimUp garde quand tu utilises les outils d'avis (réputation, visibilité, campagnes, équipe), chez qui ça passe, et comment tu récupères ou effaces tes données.</p>

        <Titre>Ce qu'on garde</Titre>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ton compte : adresse email, nom de ta société, mot de passe (stocké haché, donc illisible).</li>
          <li>Ta configuration : lien d'avis Google, nom du commerce, préférences de l'assistant.</li>
          <li>Les résultats de tes outils : historique de ta note, analyses d'avis, relevés de position, chiffres de tes campagnes.</li>
          <li>Les adresses email que tu saisis pour une campagne, uniquement le temps de l'envoi.</li>
          <li>Ton historique de paiements Premium, car la comptabilité nous oblige à le garder.</li>
        </ul>
        <p className="mt-2">Pas de publicité, pas de revente de données. Le seul cookie sert à te garder connecté. Les visites des pages publiques sont comptées avec Umami, sans cookie ni profil (voir plus bas). Rien n'est mesuré une fois connecté, ni sur les pages de suivi de commande.</p>

        <Titre>Les adresses de tes clients</Titre>
        <p>Quand tu lances une campagne, les adresses sont gardées pour envoyer le message (et la relance si tu l'as choisie), puis effacées à la fin de la campagne, au plus tard après 45 jours. SwimUp garde seulement une empreinte non réversible de chaque adresse pour ne pas redemander un avis à la même personne, et pour respecter ceux qui se sont désinscrits. Les adresses ne sont jamais incluses dans ton export.</p>

        <Titre>Chez qui ça passe</Titre>
        <ul className="space-y-2">
          {SOUS_TRAITANTS.map(([nom, role]) => (
            <li key={nom}><strong className="text-slate-900">{nom}</strong> : {role}</li>
          ))}
        </ul>

        <Titre>Combien de temps</Titre>
        {conservation === null && <p className="text-slate-500">Chargement…</p>}
        {conservation === false && <p className="text-slate-500">La liste n'a pas pu être chargée. Elle est aussi visible dans Réputation, onglet Réglages, une fois connecté.</p>}
        {conservation && (
          <ul className="space-y-2">
            {conservation.map(c => (
              <li key={c.donnee}><strong className="text-slate-900">{c.donnee}</strong> : {c.duree}.{c.note ? ` ${c.note}` : ''}</li>
            ))}
          </ul>
        )}

        <Titre>Tes droits</Titre>
        <p>Tu peux télécharger une copie de tes données d'outils et les effacer toi-même : va dans Réputation, onglet Réglages. L'effacement supprime les campagnes, les relevés, les analyses, l'historique de note et l'équipe liée. Il garde le lien d'avis (ton QR imprimé continue de marcher), les désinscriptions et les paiements.</p>
        <p className="mt-2">Pour une demande sur ton compte lui-même (correction, suppression), écris-nous sur le <a className="text-sky-600 underline" href={LIEN_DISCORD} target="_blank" rel="noopener noreferrer">salon Discord de SwimUp</a>. Les paiements déjà faits ne peuvent pas être effacés, la loi nous demande de les conserver.</p>

        <Titre>Ce que les outils ne font pas</Titre>
        <ul className="list-disc pl-5 space-y-1">
          <li>Google ne donne que les derniers avis de ta fiche (5 au maximum) : les analyses portent sur ceux-là.</li>
          <li>Les positions de visibilité sont des relevés indicatifs, pas un classement officiel de Google.</li>
          <li>Un clic sur ton lien d'avis ne veut pas dire qu'un avis a été publié.</li>
        </ul>
        <p className="mt-8 text-sm text-slate-500">Cette page décrit les outils pour entreprises. Elle sera mise à jour si les pratiques changent.</p>
      </main>
    </div>
  )
}
