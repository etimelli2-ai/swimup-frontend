import { MentionsLegalesEn } from './legalEn'
import { getLangue } from '../lib/i18n'
import PageLegale, { Titre, Champ } from '../components/PageLegale'
import { Link } from '../components/Lien'
import { EDITEUR, HEBERGEUR } from '../lib/legal.mjs'

function MentionsLegalesFr() {
  return (
    <PageLegale titre="Mentions légales" chemin="/mentions-legales" description="Qui édite SwimUp, qui l'héberge et comment nous contacter.">
      <p className="mt-3">Ces informations sont publiées pour répondre à l'obligation d'identification des éditeurs de sites internet (loi du 21 juin 2004 pour la confiance dans l'économie numérique, dite LCEN).</p>

      <Titre>Éditeur du site</Titre>
      <ul className="space-y-1">
        <li><strong className="text-slate-900">Nom ou raison sociale :</strong> <Champ v={EDITEUR.nom} /></li>
        <li><strong className="text-slate-900">Statut :</strong> <Champ v={EDITEUR.statut} /></li>
        <li><strong className="text-slate-900">Adresse :</strong> <Champ v={EDITEUR.adresse} /></li>
        <li><strong className="text-slate-900">Téléphone :</strong> <Champ v={EDITEUR.telephone} /></li>
        <li><strong className="text-slate-900">Email :</strong> <Champ v={EDITEUR.email} /></li>
        <li><strong className="text-slate-900">SIRET :</strong> <Champ v={EDITEUR.siret} /></li>
        <li><strong className="text-slate-900">Capital social :</strong> <Champ v={EDITEUR.capital} /></li>
        <li><strong className="text-slate-900">TVA :</strong> <Champ v={EDITEUR.tva} /></li>
      </ul>

      <Titre>Directeur de la publication</Titre>
      <p><Champ v={EDITEUR.directeurPublication} /></p>

      <Titre>Hébergement</Titre>
      <p>Le site et son API sont hébergés par <strong className="text-slate-900">{HEBERGEUR.nom}</strong>. <Champ v={HEBERGEUR.details} /></p>

      <Titre>Contact</Titre>
      <p>Pour toute question sur le site, écris à <Champ v={EDITEUR.email} />. Pour tes données personnelles, voir la <Link to="/confidentialite" className="text-sky-600 underline">politique de confidentialité</Link>.</p>

      <Titre>Propriété intellectuelle</Titre>
      <p>Le nom SwimUp, le logo, les textes, les guides et les outils du site appartiennent à l'éditeur, sauf mention contraire. Toute reproduction sans accord écrit est interdite, hors courte citation avec lien vers la source.</p>

      <Titre>Liens et responsabilité</Titre>
      <p>Le site renvoie vers des services tiers (Google, Stripe, PayPal, Discord, Instagram, TikTok). Leur contenu ne dépend pas de nous. SwimUp n'est ni affilié à Google ni approuvé par Google : Google Maps et Google Business Profile sont des marques de Google LLC.</p>
    </PageLegale>
  )
}

// En anglais : la version traduite de pages/legalEn.jsx (le texte français fait foi).
export default function MentionsLegales() {
  return getLangue() === 'en' ? <MentionsLegalesEn /> : <MentionsLegalesFr />
}
