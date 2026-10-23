// Page gratuite, sans compte : checklist de fiche Google que le commerçant coche lui-même.
// Aucun appel à Google ni au serveur ; le score compte seulement les points cochés.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import Seo from '../../components/Seo'
import CadrePublic from '../../components/CadrePublic'
import { mesure } from '../../lib/mesure.mjs'
import { filAriane, urlAbsolue } from '../../lib/seo.mjs'
import { GROUPES, TOTAL, analyser, listeAFaire } from '../../lib/diagnosticFiche.mjs'
import { t, tn } from '../../lib/i18n'

const CHEMIN = '/outils/diagnostic-fiche-google'
const AIDE_GOOGLE = 'https://support.google.com/business'

const JSON_LD = [
  {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Diagnostic de fiche Google à cocher',
    url: urlAbsolue(CHEMIN), applicationCategory: 'BusinessApplication', operatingSystem: 'Tous (navigateur web)', inLanguage: 'fr-FR',
    description: `Une liste de ${TOTAL} points à vérifier sur ta fiche Google Business Profile, à cocher toi-même.`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  },
  filAriane([['Accueil', '/'], ['Outils', '/outils/lien-avis-google'], ['Diagnostic de fiche Google', CHEMIN]]),
]

export default function DiagnosticFiche() {
  const [coches, setCoches] = useState([])
  const [copie, setCopie] = useState(false)
  const { faits, total, premiers } = analyser(coches)
  const bascule = (id) => {
    setCoches(c => {
      if (!c.length) mesure('diagnostic-commence')
      return c.includes(id) ? c.filter(x => x !== id) : [...c, id]
    })
  }
  const copierListe = async () => {
    try {
      await navigator.clipboard.writeText(listeAFaire(coches))
      mesure('diagnostic-liste-copiee')
      setCopie(true); setTimeout(() => setCopie(false), 1800)
    } catch { toast.error(t('Copie impossible.')) }
  }

  return (
    <CadrePublic>
      <Seo
        title={t('Diagnostic de fiche Google : la liste à cocher')}
        description={t('{TOTAL} points à vérifier sur ta fiche Google Business Profile : informations, catégories, photos, description, avis. Tu coches, tu vois ce qu\'il reste à faire. Gratuit, sans compte.', { TOTAL })}
        path={CHEMIN}
        jsonLd={JSON_LD}
      />
      <section className="max-w-2xl mx-auto px-4 pt-10 pb-6">
        <nav aria-label={t('Fil d\'Ariane')} className="text-[13px] text-slate-500 flex items-center gap-1">
          <Link to="/" className="hover:text-slate-600">{t('Accueil')}</Link><ChevronRight size={12} />
          <span className="text-slate-500">{t('Outils')}</span>
        </nav>
        <h1 className="mt-4 text-[32px] sm:text-[44px] leading-[1.08] font-semibold tracking-tight text-slate-900">
          {t('Diagnostic de ta fiche Google')}
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-slate-500">
          {t('Ouvre ta fiche sur Google dans un autre onglet et coche ce qui est déjà en place. À la fin, tu vois ce qu\'il reste à faire en premier. Gratuit, sans compte, rien n\'est envoyé à nos serveurs.')}
        </p>
      </section>

      <main id="contenu" className="max-w-2xl mx-auto px-4 pb-16">
        <div className="sticky top-14 z-20 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur p-4 shadow-xl shadow-slate-200/60" aria-live="polite">
          <p className="text-[15px] text-slate-900"><span className="font-semibold">{tn(faits, '{n} point coché sur {total}', '{n} points cochés sur {total}', { total })}</span></p>
          <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-label={t('Points cochés du diagnostic')} aria-valuemin={0} aria-valuemax={total} aria-valuenow={faits}>
            <div className="h-full bg-sky-500 transition-all" style={{ width: `${(faits / total) * 100}%` }} />
          </div>
        </div>

        {GROUPES.map(g => (
          <section key={g.id} className="mt-10">
            <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">{t(g.titre)}</h2>
            <ul className="mt-3 space-y-2">
              {g.items.map(p => {
                const coche = coches.includes(p.id)
                return (
                  <li key={p.id} className={`rounded-2xl border p-4 transition-colors ${coche ? 'border-sky-200 bg-sky-50' : 'border-slate-200 bg-white'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={coche} onChange={() => bascule(p.id)} className="peer sr-only" />
                      <span aria-hidden="true" className={`mt-0.5 w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500 peer-focus-visible:ring-offset-2 ${coche ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 bg-white'}`}>
                        {coche && <Check size={14} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[16px] leading-snug font-medium text-slate-900">{t(p.titre)}</span>
                        <span className="block mt-1 text-[14px] leading-relaxed text-slate-500">{t(p.pourquoi)}</span>
                      </span>
                    </label>
                    {p.lien && <Link to={p.lien.href} className="mt-2 ml-9 inline-flex items-center gap-1 text-[14px] font-medium text-sky-600 hover:underline">{t(p.lien.label)} <ChevronRight size={13} /></Link>}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}

        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/60">
          <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">
            {faits === 0 ? t('Ce qu\'il restera à faire') : faits === total ? t('Rien à ajouter sur cette liste') : t('À faire en premier')}
          </h2>
          {faits === 0 && <p className="mt-2 text-[15px] text-slate-600">{t('Coche ce que tu as vérifié : les trois premiers points qui manquent apparaîtront ici.')}</p>}
          {faits > 0 && faits < total && (
            <ol className="mt-3 space-y-2 list-decimal pl-5 text-[16px] leading-snug text-slate-700">
              {premiers.map(p => <li key={p.id}>{t(p.titre)}</li>)}
            </ol>
          )}
          {faits === total && <p className="mt-2 text-[15px] text-slate-600">{t('Ta fiche couvre tous les points de la liste. Relis-la de temps en temps : les informations changent vite.')}</p>}
          {faits > 0 && faits < total && (
            <button onClick={copierListe} className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 text-slate-700 text-[14px] font-medium px-5 py-2.5 hover:bg-slate-50">
              {copie ? <Check size={15} /> : <Copy size={15} />} {copie ? t('Copié') : t('Copier ma liste à faire')}
            </button>
          )}
          <p className="mt-5 text-[13px] leading-relaxed text-slate-500">
            {t('Ce score n\'est pas une note de Google : il compte seulement les points que tu as cochés. Une fiche complète ne garantit pas un meilleur classement, mais elle évite de perdre des clients à cause d\'une information fausse ou absente.')}
          </p>
        </section>

        <p className="mt-8 text-[14px] leading-relaxed text-slate-500">
          {t('Pour le détail de chaque point :')}{' '}<Link to="/aide-commercants/optimiser-fiche-google" className="underline text-sky-600">{t('optimiser ta fiche Google Business Profile')}</Link>{t('. Les règles viennent de Google et changent : l\'')}<a href={AIDE_GOOGLE} target="_blank" rel="noopener noreferrer" className="underline text-sky-600">{t('aide officielle de Google Business Profile')}</a>{' '}{t('fait foi.')}
        </p>

        <div className="mt-12 rounded-2xl bg-slate-50 border border-slate-200 p-6">
          <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">{t('Et pour suivre ta visibilité ?')}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            {t('Avec un compte gratuit SwimUp, tu crées ton lien et ton QR code d\'avis, tu suis un mot-clé sur Google Maps et tu as de l\'aide pour répondre à tes avis. Pas de carte bancaire.')}
          </p>
          <a href="/inscription?src=diagnostic" className="mt-4 inline-flex items-center rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[14px] font-semibold px-6 py-2.5">{t('Créer un compte gratuit')}</a>
        </div>
      </main>
    </CadrePublic>
  )
}
