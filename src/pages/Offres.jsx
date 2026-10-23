// Page publique des offres. Prix et contenu viennent de GET /api/public/offres (même source que l'espace
// client) : la page ne contient aucun prix écrit en dur et ne peut pas afficher autre chose que le produit.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Minus, ChevronRight } from 'lucide-react'
import api from '../lib/api'
import Seo from '../components/Seo'
import CadrePublic from '../components/CadrePublic'
import { filAriane } from '../lib/seo.mjs'
import { t, sepDecimal, euros } from '../lib/i18n'

const CHEMIN = '/offres'
const JSON_LD = [filAriane([['Accueil', '/'], ['Offres', CHEMIN]])]
const eur = (n) => euros(n)
const valeurDe = (lignes, cle, offre) => lignes.find(l => l.cle === cle)?.[offre]

function atouts(offre, lignes) {
  const v = (cle, o = offre) => valeurDe(lignes, cle, o)
  const liste = offre === 'gratuit' ? [
    t('Ton lien d\'avis, ton QR code et ton affiche à imprimer'),
    t('Suivi des scans et des clics sur ton lien'),
    t('{v} demandes d\'avis par email et {v2} réponses IA par jour', { v: String(v('emails')), v2: String(v('ia')) }),
    t('{v} mot-clé suivi sur Google Maps', { v: String(v('visibilite')) }),
  ] : offre === 'premium' ? [
    t('Campagnes d\'emails d\'avis, jusqu\'à {v} adresses', { v: String(v('campagnes')) }),
    t('{v} demandes d\'avis par email et {v2} réponses IA par jour', { v: String(v('emails')), v2: String(v('ia')) }),
    t('Suivi de {v} mots-clés sur Google Maps', { v: String(v('visibilite')) }),
    t('{v} sur les commandes d\'avis', { v: String(v('remise')) }),
    t('{v} entreprises avec le même abonnement', { v: String(v('etablissements')) }),
  ] : offre === 'agence' ? [
    t('Tout Business : mêmes volumes, relevé automatique, rapport mensuel, campagnes planifiées'),
    t('{v} entreprises avec le même abonnement', { v: String(v('etablissements')) }),
    t('Jusqu\'à {v} personnes dans ton équipe, en lecture ou en édition', { v: String(v('equipe')) }),
    t('Comparaison entre établissements et rapport groupé'),
    t('Pensée pour gérer les fiches de plusieurs clients ou de plusieurs établissements'),
  ] : [
    t('Tout Premium, avec le double de volume : {v} emails et {v2} réponses IA par jour, {v3} mots-clés', { v: String(v('emails')), v2: String(v('ia')), v3: String(v('visibilite')) }),
    t('Relevé automatique de ta position et rapport mensuel en PDF'),
    t('Campagnes planifiées, avec relance automatique'),
    t('{v} entreprises et jusqu\'à {v2} personnes dans ton équipe', { v: String(v('etablissements')), v2: String(v('equipe')) }),
    t('Comparaison entre établissements et rapport groupé'),
  ]
  return liste.filter(a => !a.includes('undefined') && !a.includes('false'))
}

function Valeur({ v }) {
  if (v === true) return <Check size={16} className="text-emerald-500 mx-auto" aria-label={t('Inclus')} />
  if (v === false) return <Minus size={16} className="text-slate-300 mx-auto" aria-label={t('Non inclus')} />
  return <span className="text-[13px] font-medium text-slate-700">{typeof v === 'string' ? t(v) : v}</span>
}

function Carte({ nom, prix, periode, lignes, offre, vedette, cta }) {
  return (
    <li className={`rounded-2xl border bg-white p-6 shadow-xl shadow-slate-200/60 flex flex-col ${vedette ? 'border-sky-400 ring-2 ring-sky-400' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">{nom}</h2>
        {vedette && <span className="text-[12px] font-medium rounded-full bg-sky-100 text-sky-700 px-2.5 py-0.5">{t('Pour démarrer')}</span>}
      </div>
      <p className="mt-2"><span className="text-[34px] font-bold tracking-tight text-slate-900">{prix === 0 ? euros(0, { decimales: 0 }) : eur(prix)}</span>{periode && <span className="text-[14px] text-slate-500">{' '}{t('par {periode}', { periode: t(periode) })}</span>}</p>
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

  const grille = 'grid-cols-[1fr_3rem_3.75rem_3.75rem_3.75rem] sm:grid-cols-[1fr_5rem_6rem_6rem_6rem]'
  const bouton = (href, texte, plein) => (
    <a href={href} className={`mt-6 inline-flex items-center justify-center rounded-full text-[15px] font-semibold px-6 py-3 ${plein ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'border border-slate-300 text-slate-800 hover:bg-slate-50'}`}>{texte}</a>
  )

  return (
    <CadrePublic large>
      <Seo
        title={t('Offres et tarifs')}
        description={t('Compare les offres Gratuit, Premium, Business et Agence de SwimUp pour gérer tes avis Google : QR code, demandes d\'avis par email, campagnes, suivi de ta visibilité. Prix et contenu détaillés.')}
        path={CHEMIN}
        jsonLd={JSON_LD}
      />
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-6">
        <nav aria-label={t('Fil d\'Ariane')} className="text-[13px] text-slate-500 flex items-center gap-1">
          <Link to="/" className="hover:text-slate-600">{t('Accueil')}</Link><ChevronRight size={12} />
          <span className="text-slate-500">{t('Offres')}</span>
        </nav>
        <h1 className="mt-4 text-[32px] sm:text-[44px] leading-[1.08] font-semibold tracking-tight text-slate-900 max-w-2xl">{t('Les offres SwimUp')}</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-slate-500 max-w-2xl">
          {t('Commence gratuitement, sans carte bancaire. Passe à une offre payante quand tu as besoin de plus de volume ou de plus d\'outils.')}
        </p>
      </section>

      <main id="contenu" className="max-w-5xl mx-auto px-4 pb-16">
        {erreur && <p className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[15px] px-4 py-3">{t('Les offres ne se sont pas chargées. Recharge la page, ou')}{' '}<a href="/inscription?src=offres" className="underline">{t('crée ton compte gratuit')}</a>{' '}{t('pour les voir depuis ton espace.')}</p>}
        {!d && !erreur && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">{[0, 1, 2, 3].map(i => <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />)}</div>}

        {d && (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Carte nom={t('Gratuit')} prix={0} offre="gratuit" lignes={d.comparatif} cta={bouton('/inscription?src=offres', t('Créer un compte gratuit'), false)} />
              <Carte nom={t('Premium')} prix={d.premium.prix} periode={d.premium.periode} offre="premium" lignes={d.comparatif} vedette cta={bouton('/inscription?offre=premium&src=offres', t('Choisir Premium'), true)} />
              <Carte nom={t('Business')} prix={d.business.prix} periode={d.business.periode} offre="business" lignes={d.comparatif} cta={bouton('/inscription?offre=business&src=offres', t('Choisir Business'), false)} />
              {d.agence && <Carte nom={t('Agence')} prix={d.agence?.prix} periode={d.agence?.periode} offre="agence" lignes={d.comparatif} cta={bouton('/inscription?offre=agence&src=offres', t('Choisir Agence'), false)} />}
            </ul>
            <p className="mt-4 text-[14px] text-slate-500">
              {t('Tu crées d\'abord ton compte gratuit, puis tu choisis ton offre dans ton espace. Paiement sécurisé par Stripe (ou par PayPal). Tu résilies en un clic : l\'offre reste active jusqu\'à la fin du mois payé.')}
            </p>

            <h2 className="mt-14 text-[24px] font-semibold tracking-tight text-slate-900">{t('Toutes les différences')}</h2>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className={`grid ${grille} items-end px-4 pt-4 pb-3 border-b border-slate-100`}>
                <span />
                <span className="text-center text-xs sm:text-sm font-semibold text-slate-600">{t('Gratuit')}</span>
                <span className="text-center text-xs sm:text-sm font-semibold text-sky-700">{t('Premium')}<br /><span className="text-[11px] font-normal text-slate-500">{eur(d.premium.prix)}</span></span>
                <span className="text-center text-xs sm:text-sm font-semibold text-indigo-700">{t('Business')}<br /><span className="text-[11px] font-normal text-slate-500">{eur(d.business.prix)}</span></span>
                <span className="text-center text-xs sm:text-sm font-semibold text-violet-700">{t('Agence')}<br /><span className="text-[11px] font-normal text-slate-500">{eur(d.agence?.prix)}</span></span>
              </div>
              <ul>
                {d.comparatif.map(l => (
                  <li key={l.cle} className={`grid ${grille} items-center px-4 py-2.5 gap-1 border-b last:border-b-0 border-slate-50`}>
                    <span className="text-[13px] text-slate-600 leading-snug pr-2">{t(l.libelle)}</span>
                    <span className="text-center"><Valeur v={l.gratuit} /></span>
                    <span className="text-center bg-sky-50/70 -my-2.5 py-2.5"><Valeur v={l.premium} /></span>
                    <span className="text-center bg-indigo-50/70 -my-2.5 py-2.5"><Valeur v={l.business} /></span>
                    <span className="text-center bg-violet-50/70 -my-2.5 py-2.5"><Valeur v={l.agence} /></span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <p className="mt-10 max-w-2xl text-[14px] leading-relaxed text-slate-500">
          {t('Aucune offre ne garantit un nombre d\'avis ni un classement sur Google : les outils t\'aident à demander des avis, à y répondre et à suivre ta fiche. Pour essayer sans payer, commence par nos outils gratuits :')}{' '}<Link to="/outils/lien-avis-google" className="underline text-sky-600">{t('lien et QR code d\'avis')}</Link>, <Link to="/outils/modeles-reponses-avis-google" className="underline text-sky-600">{t('modèles de réponses')}</Link>{' '}{t('et')}{' '}<Link to="/outils/diagnostic-fiche-google" className="underline text-sky-600">{t('diagnostic de fiche')}</Link>.
        </p>
      </main>
    </CadrePublic>
  )
}
