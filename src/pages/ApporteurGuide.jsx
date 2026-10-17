import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import usePageTitle from '../hooks/usePageTitle'
import {
  SOMMAIRE, BONNES_CIBLES, SIGNES_BON_PROSPECT, A_EVITER, CANAUX, MESSAGES, PALIERS, QUESTIONS, REGLES, SUIVI, remplirLiens,
} from '../content/guideApporteur.mjs'

function Section({ id, titre, children }) {
  return (
    <section id={id} className="card space-y-3 scroll-mt-20">
      <h2 className="font-semibold text-gray-900 text-lg">{titre}</h2>
      {children}
    </section>
  )
}

const Liste = ({ items }) => (
  <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">{items.map(i => <li key={i}>{i}</li>)}</ul>
)

function Message({ m, liens }) {
  const [copie, setCopie] = useState(false)
  const texte = remplirLiens(m.texte, liens)
  const copier = () => {
    navigator.clipboard.writeText(m.objet ? `Objet : ${m.objet}\n\n${texte}` : texte)
    setCopie(true); toast.success('Message copié')
    setTimeout(() => setCopie(false), 2000)
  }
  return (
    <div className="border border-gray-200 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-gray-900">{m.titre}</h3>
          <p className="text-xs text-gray-500">{m.pour}</p>
        </div>
        <button onClick={copier} className="shrink-0 inline-flex items-center gap-1.5 bg-sky-500 text-white text-sm font-medium rounded-full px-3 py-1.5">
          {copie ? <Check size={14} /> : <Copy size={14} />} {copie ? 'Copié' : 'Copier'}
        </button>
      </div>
      {m.objet && <p className="text-sm text-gray-700"><span className="text-gray-500">Objet :</span> {m.objet}</p>}
      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 bg-gray-50 rounded-lg p-3 leading-relaxed">{texte}</pre>
    </div>
  )
}

export default function ApporteurGuide() {
  usePageTitle('Guide de l\'apporteur')
  const [liens, setLiens] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [nonApporteur, setNonApporteur] = useState(false)

  useEffect(() => {
    api.get('/apporteur/moi')
      .then(r => setLiens({ origine: new URL(r.data.lien).origin, code: r.data.code }))
      .catch(e => { if (e.response?.status === 403) setNonApporteur(true); else toast.error('Impossible de charger le guide') })
      .finally(() => setChargement(false))
  }, [])

  if (chargement) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
  if (nonApporteur) return (
    <div className="max-w-xl space-y-3">
      <h1 className="page-title">Guide de l'apporteur</h1>
      <div className="card text-sm text-gray-600">Ce guide est réservé aux apporteurs. Demande ton accès à l'équipe SwimUp.</div>
    </div>
  )

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <Link to="/apporteur" className="inline-flex items-center gap-1.5 text-sm text-sky-600 mb-2"><ArrowLeft size={14} /> Retour à mon espace</Link>
        <h1 className="page-title">Guide de l'apporteur</h1>
        <p className="text-muted mt-1">À qui parler, où les trouver, quoi leur écrire. Les messages ci-dessous contiennent déjà tes liens : tu n'as qu'à compléter ce qui est entre crochets.</p>
      </div>

      <nav aria-label="Sommaire" className="flex flex-wrap gap-2">
        {SOMMAIRE.map(([id, l]) => (
          <a key={id} href={`#${id}`} className="text-xs rounded-full bg-gray-100 text-gray-700 px-3 py-1.5">{l}</a>
        ))}
      </nav>

      <Section id="principe" titre="Le principe">
        <p className="text-sm text-gray-700">Tu parles à des entreprises, tu leur donnes ton lien, elles créent un compte. Si l'une d'elles prend un abonnement, tu touches 20 % de son premier paiement. Un compte gratuit ne rapporte rien : ce qui compte, c'est de parler à des entreprises qui ont un vrai besoin d'avis Google, pas d'en amener beaucoup.</p>
        <p className="text-sm text-gray-700">Ta méthode, en gros : tu repères des commerces avec une fiche Google peu fournie, tu les contactes avec un message court qui leur offre quelque chose d'utile tout de suite (l'outil gratuit), et tu ne forces jamais.</p>
      </Section>

      <Section id="cibles" titre="À qui parler">
        <p className="text-sm font-medium text-gray-900">Les commerces qui dépendent de Google Maps</p>
        <Liste items={BONNES_CIBLES} />
        <p className="text-sm font-medium text-gray-900 pt-1">Les signes d'un bon prospect</p>
        <Liste items={SIGNES_BON_PROSPECT} />
        <p className="text-sm font-medium text-gray-900 pt-1">Les freelances et agences</p>
        <p className="text-sm text-gray-700">Community managers, agences web ou de référencement local : ils gèrent les fiches de plusieurs clients. L'offre Agence est faite pour eux. Il y en a moins, mais un seul abonnement Agence rapporte plus.</p>
        <p className="text-sm font-medium text-gray-900 pt-1">À éviter</p>
        <Liste items={A_EVITER} />
      </Section>

      <Section id="trouver" titre="Où les trouver">
        <p className="text-sm text-gray-700">Ouvre Google Maps, tape le métier et la ville (« coiffeur Vincennes », « garage Nogent »), et regarde les fiches une par une. Pour chacune, relève la note, le nombre d'avis, et si le patron répond aux avis. Garde les fiches qui correspondent aux signes ci-dessus.</p>
        <p className="text-sm text-gray-700">Pour leur adresse mail, utilise seulement ce qu'ils affichent eux-mêmes : leur site ou leur fiche Google. N'achète pas de liste et ne cherche pas d'adresses perso.</p>
      </Section>

      <Section id="canaux" titre="Comment les contacter">
        <p className="text-sm text-gray-700">Dans l'ordre où ça marche le mieux en général :</p>
        <div className="space-y-3">
          {CANAUX.map(c => (
            <div key={c.nom}>
              <p className="text-sm font-medium text-gray-900">{c.nom}</p>
              <p className="text-sm text-gray-700">{c.texte}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="messages" titre="Messages à copier">
        <p className="text-sm text-gray-700">Remplace ce qui est entre crochets. Pour le constat, écris seulement ce que tu as vraiment vu sur la fiche (nombre d'avis, note). Si tu n'as rien de précis, enlève la phrase.</p>
        <div className="space-y-3">
          {MESSAGES.map(m => <Message key={m.id} m={m} liens={liens} />)}
        </div>
      </Section>

      <Section id="proposer" titre="Quoi proposer, dans l'ordre">
        <div className="space-y-3">
          {PALIERS.map(([t, d]) => (
            <div key={t}>
              <p className="text-sm font-medium text-gray-900">{t}</p>
              <p className="text-sm text-gray-700">{d}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">Les prix et le contenu exact sont sur la page Offres du site, vérifie-les avant d'en parler : c'est elle qui fait foi.</p>
      </Section>

      <Section id="questions" titre="Leurs questions, et quoi répondre">
        <div className="space-y-3">
          {QUESTIONS.map(([q, r]) => (
            <div key={q}>
              <p className="text-sm font-medium text-gray-900">{q}</p>
              <p className="text-sm text-gray-700">{r}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="regles" titre="Les règles">
        <Liste items={REGLES} />
        <p className="text-xs text-gray-400">Ce sont des repères pratiques, pas un conseil juridique. Pour ton statut, tes déclarations de revenus et les règles du démarchage par mail, renseigne-toi auprès d'un professionnel ou sur le site de la CNIL.</p>
      </Section>

      <Section id="suivi" titre="Suivre ton travail">
        <Liste items={SUIVI} />
      </Section>
    </div>
  )
}
