// Page publique des offres. Prix et contenu viennent de GET /api/public/offres (même source que l'espace
// client) : la page ne contient aucun prix écrit en dur et ne peut pas afficher autre chose que le produit.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Minus, ChevronRight } from 'lucide-react'
import api from '../lib/api'
import Seo from '../components/Seo'
import CadrePublic from '../components/CadrePublic'
import { filAriane } from '../lib/seo.mjs'

const CHEMIN = '/offres'
const JSON_LD = [filAriane([['Accueil', '/'], ['Offres', CHEMIN]])]
const eur = (n) => `${Number(n).toFixed(2).replace('.', ',')} €`
const valeurDe = (lignes, cle, offre) => lignes.find(l => l.cle === cle)?.[offre]

function atouts(offre, lignes) {
  const v = (cle, o = offre) => valeurDe(lignes, cle, o)
  const liste = offre === 'gratuit' ? [
    'Ton lien d\'avis, ton QR code et ton affiche à imprimer',
    `Suivi des scans et des clics sur ton lien`,
    `${v('emails')} demandes d'avis par email et ${v('ia')} réponses IA par jour`,
    `${v('visibilite')} mot-clé suivi sur Google Maps`,
  ] : offre === 'premium' ? [
    `Campagnes d'emails d'avis, jusqu'à ${v('campagnes')} adresses`,
    `${v('emails')} demandes d'avis par email et ${v('ia')} réponses IA par jour`,
    `Suivi de ${v('visibilite')} mots-clés sur Google Maps`,
    `${v('remise')} sur les commandes d'avis`,
    `${v('etablissements')} entreprises avec le même abonnement`,
  ] : [
    `Tout Premium, avec le double de volume : ${v('emails')} emails et ${v('ia')} réponses IA par jour, ${v('visibilite')} mots-clés`,
    'Relevé automatique de ta position et rapport mensuel en PDF',
    'Campagnes planifiées, avec relance automatique',
    `${v('etablissements')} entreprises et jusqu'à ${v('equipe')} personnes dans ton équipe`,
    'Comparaison entre établissements et rapport groupé',
  ]
  return liste.filter(a => !a.includes('undefined') && !a.includes('false'))
}

function Valeur({ v }) {
  if (v === true) return <Check size={16} className="text-emerald-500 mx-auto" aria-label="Inclus" />
  if (v === false) return <Minus size={16} className="text-slate-300 mx-auto" aria-label="Non inclus" />
  return <span className="text-[13px] font-medium text-slate-700">{v}</span>
}

function Carte({ nom, prix, periode, lignes, offre, vedette, cta }) {
  return (
    <li className={`rounded-2xl border bg-white p-6 shadow-xl shadow-slate-200/60 flex flex-col ${vedette ? 'border-sky-400 ring-2 ring-sky-400' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">{nom}</h2>
        {vedette && <span className="text-[12px] font-medium rounded-full bg-sky-100 text-sky-700 px-2.5 py-0.5">Le plus choisi</span>}
      </div>
      <p className="mt-2"><span className="text-[34px] font-bold tracking-tight text-slate-900">{prix === 0 ? '0 €' : eur(prix)}</span>{periode && <span className="text-[14px] text-slate-500"> par {periode}</span>}</p>
      <ul className="mt-4 space-y-2 flex-1">
        {atouts(offre, lignes).map(a => (
          <li key={a} className="flex items-start gap-2 text-[14.5px] leading-snug text-slate-600"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />{a}</li>
        ))}
      </ul>
      {cta}
    </li>
  )
}

export default function Offres() {
  const [d, setD] = useState(null)
  const [erreur, setErreur] = useState(false)
  useEffect(() => { api.get('/public/offres').then(r => setD(r.data)).catch(() => setErreur(true)) }, [])

  const grille = 'grid-cols-[1fr_3.5rem_4.5rem_4.5rem] sm:grid-cols-[1fr_6rem_7rem_7rem]'
  const bouton = (href, texte, plein) => (
    <a href={href} className={`mt-6 inline-flex items-center justify-center rounded-full text-[15px] font-semibold px-6 py-3 ${plein ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'border border-slate-300 text-slate-800 hover:bg-slate-50'}`}>{texte}</a>
  )

  return (
    <CadrePublic large>
      <Seo
        title="Offres et tarifs"
        description="Compare les offres Gratuit, Premium et Business de SwimUp pour gérer tes avis Google : QR code, demandes d'avis par email, campagnes, suivi de ta visibilité. Prix et contenu détaillés."
        path={CHEMIN}
        jsonLd={JSON_LD}
      />
      <section className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <nav aria-label="Fil d'Ariane" className="text-[13px] text-slate-500 flex items-center gap-1">
          <Link to="/" className="hover:text-slate-600">Accueil</Link><ChevronRight size={12} />
          <span className="text-slate-500">Offres</span>
        </nav>
        <h1 className="mt-4 text-[32px] sm:text-[44px] leading-[1.08] font-semibold tracking-tight text-slate-900 max-w-2xl">Les offres SwimUp</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-slate-500 max-w-2xl">
          Commence gratuitement, sans carte bancaire. Passe à une offre payante quand tu as besoin de plus de volume ou de plus d'outils.
        </p>
      </section>

      <main id="contenu" className="max-w-4xl mx-auto px-4 pb-16">
        {erreur && <p className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[15px] px-4 py-3">Les offres ne se sont pas chargées. Recharge la page, ou <a href="/inscription?src=offres" className="underline">crée ton compte gratuit</a> pour les voir depuis ton espace.</p>}
        {!d && !erreur && <div className="grid gap-4 md:grid-cols-3" aria-busy="true">{[0, 1, 2].map(i => <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />)}</div>}

        {d && (
          <>
            <ul className="grid gap-4 md:grid-cols-3">
              <Carte nom="Gratuit" prix={0} offre="gratuit" lignes={d.comparatif} cta={bouton('/inscription?src=offres', 'Créer un compte gratuit', false)} />
              <Carte nom="Premium" prix={d.premium.prix} periode={d.premium.periode} offre="premium" lignes={d.comparatif} vedette cta={bouton('/inscription?offre=premium&src=offres', 'Choisir Premium', true)} />
              <Carte nom="Business" prix={d.business.prix} periode={d.business.periode} offre="business" lignes={d.comparatif} cta={bouton('/inscription?offre=business&src=offres', 'Choisir Business', false)} />
            </ul>
            <p className="mt-4 text-[14px] text-slate-500">
              Tu crées d'abord ton compte gratuit, puis tu choisis ton offre dans ton espace. Paiement sécurisé par Stripe (ou par PayPal). Tu résilies en un clic : l'offre reste active jusqu'à la fin du mois payé.
            </p>

            <h2 className="mt-14 text-[24px] font-semibold tracking-tight text-slate-900">Toutes les différences</h2>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className={`grid ${grille} items-end px-4 pt-4 pb-3 border-b border-slate-100`}>
                <span />
                <span className="text-center text-xs sm:text-sm font-semibold text-slate-600">Gratuit</span>
                <span className="text-center text-xs sm:text-sm font-semibold text-sky-700">Premium<br /><span className="text-[11px] font-normal text-slate-500">{eur(d.premium.prix)}</span></span>
                <span className="text-center text-xs sm:text-sm font-semibold text-indigo-700">Business<br /><span className="text-[11px] font-normal text-slate-500">{eur(d.business.prix)}</span></span>
              </div>
              <ul>
                {d.comparatif.map(l => (
                  <li key={l.cle} className={`grid ${grille} items-center px-4 py-2.5 gap-1 border-b last:border-b-0 border-slate-50`}>
                    <span className="text-[13px] text-slate-600 leading-snug pr-2">{l.libelle}</span>
                    <span className="text-center"><Valeur v={l.gratuit} /></span>
                    <span className="text-center bg-sky-50/70 -my-2.5 py-2.5"><Valeur v={l.premium} /></span>
                    <span className="text-center bg-indigo-50/70 -my-2.5 py-2.5"><Valeur v={l.business} /></span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <p className="mt-10 max-w-2xl text-[14px] leading-relaxed text-slate-500">
          Aucune offre ne garantit un nombre d'avis ni un classement sur Google : les outils t'aident à demander des avis, à y répondre et à suivre ta fiche. Pour essayer sans payer, commence par nos outils gratuits : <Link to="/outils/lien-avis-google" className="underline text-sky-600">lien et QR code d'avis</Link>, <Link to="/outils/modeles-reponses-avis-google" className="underline text-sky-600">modèles de réponses</Link> et <Link to="/outils/diagnostic-fiche-google" className="underline text-sky-600">diagnostic de fiche</Link>.
        </p>
      </main>
    </CadrePublic>
  )
}
