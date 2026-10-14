// Cadre commun des pages légales + petits composants réutilisés partout (pied de page, mentions sous les formulaires).
import { Link } from 'react-router-dom'
import CadrePublic from './CadrePublic'
import Seo from './Seo'
import { DATE_MAJ, LIENS_LEGAUX } from '../lib/legal.mjs'

// Un champ non fourni reste visible (fond jaune) pour qu'on le retrouve avant de publier.
export function ARemplir({ children }) {
  return <mark className="bg-amber-200 text-slate-900 rounded px-1">{children}</mark>
}

// Valeur d'un champ de lib/legal.mjs : texte normal si rempli, surligné s'il commence par « [À REMPLIR ».
export function Champ({ v }) {
  return /^\[À (REMPLIR|CONFIRMER)/.test(v) ? <ARemplir>{v}</ARemplir> : <>{v}</>
}

export function Titre({ children, id }) {
  return <h2 id={id} className="text-lg font-semibold text-slate-900 mt-8 mb-2">{children}</h2>
}

export default function PageLegale({ titre, description, chemin, children }) {
  return (
    <CadrePublic>
      <Seo title={titre} description={description} path={chemin} />
      <main id="contenu" className="max-w-2xl mx-auto px-4 py-10 text-[15px] leading-relaxed text-slate-700">
        <h1 className="text-2xl font-bold text-slate-900">{titre}</h1>
        <p className="mt-1 text-sm text-slate-600">Dernière mise à jour : {DATE_MAJ}</p>
        {children}
      </main>
    </CadrePublic>
  )
}

// Liens légaux pour les pieds de page. `classe` s'adapte au style du pied de page qui l'accueille.
export function LiensLegaux({ classe = 'hover:underline', className = 'flex flex-wrap gap-x-4 gap-y-1' }) {
  return (
    <nav aria-label="Informations légales" className={className}>
      {LIENS_LEGAUX.map(([chemin, nom]) => <Link key={chemin} to={chemin} className={classe}>{nom}</Link>)}
    </nav>
  )
}

// Mention d'information courte sous un formulaire (RGPD art. 13) : qui, pourquoi, lien vers la politique.
export function MentionDonnees({ children, className = '' }) {
  return (
    <p className={`text-xs leading-relaxed text-slate-600 dark:text-slate-400 ${className}`}>
      {children} Détails, durées et droits : <Link to="/confidentialite" className="underline">politique de confidentialité</Link>.
    </p>
  )
}

// Information avant paiement : CGV + rétractation. Affichée au-dessus des boutons de paiement.
export function InfoAvantPaiement({ className = '', abonnement = false }) {
  return (
    <p className={`text-xs leading-relaxed text-slate-600 dark:text-slate-400 ${className}`}>
      En payant, tu commandes avec obligation de paiement et les <Link to="/cgv" className="underline">conditions de vente</Link> s'appliquent.{' '}
      {abonnement && "L'abonnement est mensuel et se renouvelle automatiquement jusqu'à ta résiliation. "}
      Ce service est réservé aux professionnels : le droit de rétractation des consommateurs ne s'applique pas.
      Remboursement et garantie : <Link to="/retractation" className="underline">rétractation et remboursement</Link>.
    </p>
  )
}
