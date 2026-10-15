// Page gratuite, sans compte : modèles de réponses aux avis Google à copier, avec les champs
// (prénom, commerce...) qui se remplissent dans les textes. Tout reste dans le navigateur.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Seo from '../../components/Seo'
import CadrePublic from '../../components/CadrePublic'
import { mesure } from '../../lib/mesure.mjs'
import { filAriane, urlAbsolue } from '../../lib/seo.mjs'
import { CHAMPS, SECTIONS, remplir } from '../../lib/modelesReponses.mjs'

const CHEMIN = '/outils/modeles-reponses-avis-google'

const JSON_LD = [
  {
    '@context': 'https://schema.org', '@type': 'WebPage', name: 'Modèles de réponses aux avis Google',
    url: urlAbsolue(CHEMIN), inLanguage: 'fr-FR',
    description: 'Modèles de réponses aux avis Google à copier : avis positifs, négatifs, faux ou injustes.',
  },
  filAriane([['Accueil', '/'], ['Outils', '/outils/lien-avis-google'], ['Modèles de réponses aux avis', CHEMIN]]),
]

function Modele({ m, valeurs, type }) {
  const [copie, setCopie] = useState(false)
  const texte = remplir(m.texte, valeurs)
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte)
      mesure('modele-copie', { type })
      setCopie(true); setTimeout(() => setCopie(false), 1800)
    } catch { toast.error('Copie impossible, sélectionne le texte à la main.') }
  }
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold tracking-tight text-slate-900">{m.nom}</h3>
          <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{m.quand}</p>
        </div>
        <button onClick={copier} aria-label={`Copier le modèle : ${m.nom}`}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[13px] font-semibold px-4 py-2">
          {copie ? <Check size={14} /> : <Copy size={14} />} {copie ? 'Copié' : 'Copier'}
        </button>
      </div>
      <p className="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-[15px] leading-relaxed text-slate-700 select-all">{texte}</p>
    </li>
  )
}

export default function ModelesReponsesAvis() {
  const [valeurs, setValeurs] = useState({})
  const maj = (cle, v) => setValeurs(a => ({ ...a, [cle]: v.slice(0, 80) }))

  return (
    <CadrePublic>
      <Seo
        title="Modèles de réponses aux avis Google"
        description="Modèles de réponses aux avis Google à copier et adapter : avis positifs, négatifs, faux ou injustes. Gratuit, sans compte, avec le prénom et le nom de ton commerce déjà remplis."
        path={CHEMIN}
        jsonLd={JSON_LD}
      />
      <section className="max-w-2xl mx-auto px-4 pt-10 pb-6">
        <nav aria-label="Fil d'Ariane" className="text-[13px] text-slate-500 flex items-center gap-1">
          <Link to="/" className="hover:text-slate-600">Accueil</Link><ChevronRight size={12} />
          <span className="text-slate-500">Outils</span>
        </nav>
        <h1 className="mt-4 text-[32px] sm:text-[44px] leading-[1.08] font-semibold tracking-tight text-slate-900">
          Modèles de réponses aux avis Google
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-slate-500">
          Douze réponses prêtes à adapter, pour les avis positifs, les avis négatifs et les avis faux ou injustes. Remplis les champs ci-dessous : ils se glissent dans les textes. Gratuit, sans compte, rien n'est envoyé à nos serveurs.
        </p>
        <nav aria-label="Sections" className="mt-5 flex flex-wrap gap-2 text-[14px]">
          {SECTIONS.map(s => <a key={s.id} href={`#${s.id}`} className="rounded-full border border-slate-200 px-4 py-1.5 text-slate-600 hover:bg-slate-50">{s.titre.replace('Répondre à un ', '').replace('Répondre à ', '')}</a>)}
        </nav>
      </section>

      <main id="contenu" className="max-w-2xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/60">
          <p className="text-[15px] font-semibold text-slate-900">Remplis les champs (facultatif)</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {CHAMPS.map(c => (
              <div key={c.cle} className={c.cle === 'element' || c.cle === 'contact' ? 'sm:col-span-1' : ''}>
                <label htmlFor={`champ-${c.cle}`} className="text-[13px] font-medium text-slate-700">{c.etiquette}</label>
                <input id={`champ-${c.cle}`} value={valeurs[c.cle] || ''} onChange={e => maj(c.cle, e.target.value)} placeholder={c.exemple} autoComplete="off"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-slate-500">Un champ vide reste entre crochets dans le texte : pense à le compléter avant de publier.</p>
        </div>

        {SECTIONS.map(s => (
          <section key={s.id} id={s.id} className="mt-12 scroll-mt-20">
            <h2 className="text-[24px] font-semibold tracking-tight text-slate-900">{s.titre}</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-slate-600">{s.intro}</p>
            <ul className="mt-5 space-y-4">
              {s.modeles.map(m => <Modele key={m.id} m={m} valeurs={valeurs} type={s.id} />)}
            </ul>
          </section>
        ))}

        <section className="mt-12">
          <h2 className="text-[24px] font-semibold tracking-tight text-slate-900">Avant de publier</h2>
          <ul className="mt-3 space-y-2 text-[16px] leading-relaxed text-slate-600 list-disc pl-5">
            <li>Relis le texte et change quelques mots : une réponse qui a l'air écrite pour cette personne vaut mieux qu'un copier-coller.</li>
            <li>Ne donne aucun détail sur la commande, le rendez-vous ou la personne dans une réponse publique.</li>
            <li>Ne promets pas de geste commercial que tu ne pourras pas tenir.</li>
            <li>Si un avis te met en colère, attends un peu avant de répondre.</li>
          </ul>
          <p className="mt-4 text-[14px] leading-relaxed text-slate-500">
            Tu cherches des exemples pour ton activité ? <Link to="/avis-google" className="underline text-sky-600">Avis Google métier par métier</Link> : restaurant, coiffeur, artisan, garage, boulangerie, institut.<br />
            Plus de conseils dans nos guides : <Link to="/aide-commercants/repondre-aux-avis" className="underline text-sky-600">répondre aux avis Google</Link> et <Link to="/aide-commercants/avis-injuste-ou-faux" className="underline text-sky-600">avis injuste ou faux, que faire</Link>.
          </p>
        </section>

        <div className="mt-12 rounded-2xl bg-slate-50 border border-slate-200 p-6">
          <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">Un cas qui n'est pas dans la liste ?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Avec un compte gratuit SwimUp, tu colles l'avis et tu obtiens un brouillon de réponse adapté (3 par jour). Relis-le toujours avant de publier. Pas de carte bancaire.
          </p>
          <a href="/inscription?src=modeles" className="mt-4 inline-flex items-center rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[14px] font-semibold px-6 py-2.5">Créer un compte gratuit</a>
        </div>
      </main>
    </CadrePublic>
  )
}
