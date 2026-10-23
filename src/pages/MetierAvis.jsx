// Pages publiques « Avis Google pour un <métier> » : situations fréquentes, modèles de réponses à copier,
// où mettre le QR code, points de la fiche à vérifier, ce qu'il vaut mieux éviter.
// Contenu statique (src/content/metiersAvis.mjs), rien n'est envoyé à nos serveurs.
// Ces pages ne touchent ni à la commande d'avis, ni aux comptes, ni aux paiements.
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Copy, Check, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Seo from '../components/Seo'
import CadrePublic from '../components/CadrePublic'
import { mesure } from '../lib/mesure.mjs'
import { filAriane, urlAbsolue } from '../lib/seo.mjs'
import { CHAMPS, remplir } from '../lib/modelesReponses.mjs'
import { METIERS, metierParSlug } from '../content/metiersAvis.mjs'
import { t } from '../lib/i18n'
import NoteContenuFrancais from '../components/NoteContenuFrancais'

const BASE = '/avis-google'
const maj1 = (tx) => tx.charAt(0).toUpperCase() + tx.slice(1)

function Modele({ m, valeurs, metier }) {
  const [copie, setCopie] = useState(false)
  const texte = remplir(m.texte, valeurs)
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte)
      mesure('modele-copie', { type: 'metier-' + metier })
      setCopie(true); setTimeout(() => setCopie(false), 1800)
    } catch { toast.error(t('Copie impossible, sélectionne le texte à la main.')) }
  }
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold tracking-tight text-slate-900">{m.nom}</h3>
          <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{m.quand}</p>
        </div>
        <button onClick={copier} aria-label={t('Copier le modèle : {nom}', { nom: m.nom })}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[13px] font-semibold px-4 py-2">
          {copie ? <Check size={14} /> : <Copy size={14} />} {copie ? t('Copié') : t('Copier')}
        </button>
      </div>
      <p className="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-[15px] leading-relaxed text-slate-700 select-all">{texte}</p>
    </li>
  )
}

function Fil({ dernier }) {
  return (
    <nav aria-label={t('Fil d\'Ariane')} className="text-[13px] text-slate-500 flex flex-wrap items-center gap-1">
      <Link to="/" className="hover:text-slate-600">{t('Accueil')}</Link><ChevronRight size={12} />
      {dernier
        ? <><Link to={BASE} className="hover:text-slate-600">{t('Avis Google par métier')}</Link><ChevronRight size={12} /><span>{dernier}</span></>
        : <span>{t('Avis Google par métier')}</span>}
    </nav>
  )
}

export function AvisGoogleIndex() {
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Avis Google par métier', url: urlAbsolue(BASE), inLanguage: 'fr-FR',
      description: t('Conseils et modèles de réponses aux avis Google, métier par métier.') },
    filAriane([[t('Accueil'), '/'], [t('Avis Google par métier'), BASE]]),
  ]
  return (
    <CadrePublic>
      <Seo
        title={t('Avis Google par métier : conseils et modèles de réponses')}
        description={t('Restaurant, coiffeur, artisan, garage, boulangerie, institut : comment demander des avis Google, y répondre et soigner sa fiche, avec des modèles à copier. Gratuit, sans compte.')}
        path={BASE}
        jsonLd={jsonLd}
      />
      <section className="max-w-2xl mx-auto px-4 pt-10 pb-6">
        <Fil />
        <NoteContenuFrancais />
        <h1 className="mt-4 text-[32px] sm:text-[44px] leading-[1.08] font-semibold tracking-tight text-slate-900">{t('Avis Google, métier par métier')}</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-slate-500">
          {t('Un restaurant, un garage et un coiffeur ne reçoivent pas les mêmes critiques. Choisis ton activité : tu trouves les situations qui reviennent, trois modèles de réponses à adapter, les bons endroits pour ton QR code et les points de ta fiche à vérifier.')}
        </p>
      </section>
      <main id="contenu" className="max-w-2xl mx-auto px-4 pb-16">
        <ul className="grid gap-3 sm:grid-cols-2">
          {METIERS.map(m => (
            <li key={m.slug}>
              <Link to={`${BASE}/${m.slug}`} className="block h-full rounded-2xl border border-slate-200 bg-white p-5 hover:border-sky-300 hover:bg-sky-50/40">
                <span className="text-[17px] font-semibold tracking-tight text-slate-900">{maj1(m.nom)}</span>
                <span className="mt-1 block text-[14px] leading-snug text-slate-500">{m.situations.slice(0, 2).map(s => s.t.toLowerCase()).join(', ')}…</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[14px] leading-relaxed text-slate-500">
          {t('Ton métier n\'est pas dans la liste ? Les')}{' '}<Link to="/outils/modeles-reponses-avis-google" className="underline text-sky-600">{t('douze modèles généraux')}</Link>{t(', le')}{' '}<Link to="/outils/lien-avis-google" className="underline text-sky-600">{t('lien et QR code d\'avis')}</Link>{' '}{t('et le')}{' '}<Link to="/outils/diagnostic-fiche-google" className="underline text-sky-600">{t('diagnostic de fiche')}</Link>{' '}{t('servent à tous les commerces. Ces contenus sont des conseils pratiques, pas des conseils juridiques.')}
        </p>
      </main>
    </CadrePublic>
  )
}

export default function MetierAvis() {
  const { metier: slug } = useParams()
  const m = metierParSlug(slug)
  const [valeurs, setValeurs] = useState({})
  const maj = (cle, v) => setValeurs(a => ({ ...a, [cle]: v.slice(0, 80) }))

  if (!m) {
    return (
      <CadrePublic>
        <Seo title={t('Page introuvable')} description={t('Cette page n\'existe pas.')} path={`${BASE}/${slug || ''}`} noindex />
        <main id="contenu" className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-[28px] font-semibold text-slate-900">{t('Métier introuvable')}</h1>
          <p className="mt-3 text-slate-600">{t('Choisis ton activité dans')}{' '}<Link to={BASE} className="underline text-sky-600">{t('la liste des métiers')}</Link>.</p>
        </main>
      </CadrePublic>
    )
  }

  const chemin = `${BASE}/${m.slug}`
  const autres = METIERS.filter(x => x.slug !== m.slug)
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: m.titre, url: urlAbsolue(chemin), inLanguage: 'fr-FR', description: m.description },
    filAriane([[t('Accueil'), '/'], [t('Avis Google par métier'), BASE], [m.titre, chemin]]),
  ]
  const champsUtiles = CHAMPS.filter(c => m.modeles.some(x => x.texte.includes(`{${c.cle}}`)))

  return (
    <CadrePublic>
      <Seo title={m.titre} description={m.description} path={chemin} jsonLd={jsonLd} />
      <section className="max-w-2xl mx-auto px-4 pt-10 pb-6">
        <Fil dernier={maj1(m.nom)} />
        <NoteContenuFrancais />
        <h1 className="mt-4 text-[30px] sm:text-[40px] leading-[1.1] font-semibold tracking-tight text-slate-900">{m.titre}</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-slate-500">{m.intro}</p>
        <nav aria-label={t('Sections')} className="mt-5 flex flex-wrap gap-2 text-[14px]">
          {[['situations', t('Situations')], ['modeles', t('Modèles')], ['qr', 'QR code'], ['fiche', t('Ta fiche')], ['eviter', t('À éviter')]].map(([id, tx]) =>
            <a key={id} href={`#${id}`} className="rounded-full border border-slate-200 px-4 py-1.5 text-slate-600 hover:bg-slate-50">{tx}</a>)}
        </nav>
      </section>

      <main id="contenu" className="max-w-2xl mx-auto px-4 pb-16">
        <section id="situations" className="scroll-mt-20">
          <h2 className="text-[24px] font-semibold tracking-tight text-slate-900">{t('Les situations qui reviennent')}</h2>
          <ul className="mt-4 space-y-5">
            {m.situations.map(s => (
              <li key={s.t}>
                <h3 className="text-[17px] font-semibold text-slate-900">{s.t}</h3>
                <p className="mt-1 text-[16px] leading-relaxed text-slate-600">{s.p}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="modeles" className="mt-12 scroll-mt-20">
          <h2 className="text-[24px] font-semibold tracking-tight text-slate-900">{t('Trois modèles de réponses à adapter')}</h2>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <p className="text-[15px] font-semibold text-slate-900">{t('Remplis les champs (facultatif)')}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {champsUtiles.map(c => (
                <div key={c.cle}>
                  <label htmlFor={`champ-${c.cle}`} className="text-[13px] font-medium text-slate-700">{c.etiquette}</label>
                  <input id={`champ-${c.cle}`} value={valeurs[c.cle] || ''} onChange={e => maj(c.cle, e.target.value)} placeholder={c.exemple} autoComplete="off"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13px] text-slate-500">{t('Un champ vide reste entre crochets dans le texte : complète-le avant de publier. Relis et change quelques mots, une réponse qui a l\'air écrite pour cette personne vaut mieux qu\'un copier-coller.')}</p>
          </div>
          <ul className="mt-5 space-y-4">
            {m.modeles.map(x => <Modele key={x.id} m={x} valeurs={valeurs} metier={m.slug} />)}
          </ul>
          <p className="mt-4 text-[14px] text-slate-500">{t('D\'autres cas (avis faux, injuste, sans commentaire) :')}{' '}<Link to="/outils/modeles-reponses-avis-google" className="underline text-sky-600">{t('les douze modèles généraux')}</Link>.</p>
        </section>

        <section id="qr" className="mt-12 scroll-mt-20">
          <h2 className="text-[24px] font-semibold tracking-tight text-slate-900">{t('Où mettre ton QR code d\'avis')}</h2>
          <ul className="mt-3 space-y-2 text-[16px] leading-relaxed text-slate-600 list-disc pl-5">
            {m.qr.map(tx => <li key={tx}>{tx}</li>)}
          </ul>
          <p className="mt-3 text-[15px] text-slate-600">
            {t('Le lien direct, le QR code et une affiche A4 avec ton nom se font ici :')}{' '}<Link to="/outils/lien-avis-google" className="underline text-sky-600">{t('lien et QR code d\'avis Google')}</Link>{' '}{t('(gratuit, sans compte). Le même QR code pour tous tes clients, sans trier.')}
          </p>
        </section>

        <section id="fiche" className="mt-12 scroll-mt-20">
          <h2 className="text-[24px] font-semibold tracking-tight text-slate-900">{t('À vérifier sur ta fiche Google')}</h2>
          <ul className="mt-3 space-y-2 text-[16px] leading-relaxed text-slate-600 list-disc pl-5">
            {m.fiche.map(tx => <li key={tx}>{tx}</li>)}
          </ul>
          <p className="mt-3 text-[15px] text-slate-600">
            {t('Pour passer le reste en revue :')}{' '}<Link to="/outils/diagnostic-fiche-google" className="underline text-sky-600">{t('le diagnostic de fiche en 17 points')}</Link>{t('. Une fiche complète ne garantit pas un meilleur classement, elle évite surtout de perdre un client à cause d\'une info fausse.')}
          </p>
        </section>

        <section id="eviter" className="mt-12 scroll-mt-20">
          <h2 className="text-[24px] font-semibold tracking-tight text-slate-900">{t('À éviter')}</h2>
          <ul className="mt-3 space-y-2 text-[16px] leading-relaxed text-slate-600 list-disc pl-5">
            {m.eviter.map(tx => <li key={tx}>{tx}</li>)}
          </ul>
          <p className="mt-3 text-[14px] leading-relaxed text-slate-500">
            {t('Les règles de Google évoluent : relis de temps en temps son aide officielle. Plus de détails :')}{' '}<Link to="/aide-commercants/obtenir-des-avis-google" className="underline text-sky-600">{t('obtenir plus d\'avis Google, honnêtement')}</Link>{t('. Ces conseils sont pratiques, ils ne remplacent pas un avis juridique.')}
          </p>
        </section>

        <div className="mt-12 rounded-2xl bg-slate-50 border border-slate-200 p-6">
          <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">{t('Un avis à traiter maintenant ?')}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            {t('Avec un compte gratuit SwimUp, tu colles l\'avis et tu obtiens un brouillon de réponse adapté (3 par jour). Relis-le toujours avant de publier. Pas de carte bancaire. SwimUp propose aussi des services payants autour des avis Google, présentés sur la page d\'accueil.')}
          </p>
          <a href={`/inscription?src=metier-${m.slug}`} className="mt-4 inline-flex items-center rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[14px] font-semibold px-6 py-2.5">{t('Créer un compte gratuit')}</a>
        </div>

        <section className="mt-12">
          <h2 className="text-[18px] font-semibold tracking-tight text-slate-900">{t('Autres métiers')}</h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-[14px]">
            {autres.map(x => <li key={x.slug}><Link to={`${BASE}/${x.slug}`} className="inline-block rounded-full border border-slate-200 px-4 py-1.5 text-slate-600 hover:bg-slate-50">{maj1(x.nom)}</Link></li>)}
          </ul>
        </section>
      </main>
    </CadrePublic>
  )
}
