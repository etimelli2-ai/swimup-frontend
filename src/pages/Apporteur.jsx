import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, Handshake, Wallet, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import usePageTitle from '../hooks/usePageTitle'
import { t, locale, sepDecimal } from '../lib/i18n'

const euros = (n) => `${(Number(n) || 0).toFixed(2).replace('.', sepDecimal())} €`
const jour = (d) => (d ? new Date(String(d).replace(' ', 'T') + 'Z').toLocaleDateString(locale()) : '')
const LABEL_RETRAIT = { en_attente: 'En attente', paye: 'Payé', refuse: 'Refusé' }

export default function Apporteur() {
  usePageTitle(t('Espace apporteur'))
  const [data, setData] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [nonApporteur, setNonApporteur] = useState(false)
  const [paypal, setPaypal] = useState('')
  const [copie, setCopie] = useState(false)
  const [envoi, setEnvoi] = useState(false)

  const charger = () => api.get('/apporteur/moi')
    .then(r => { setData(r.data); setPaypal(p => p || r.data.paypal_email || '') })
    .catch(e => { if (e.response?.status === 403) setNonApporteur(true); else toast.error(t('Impossible de charger ton espace')) })
    .finally(() => setChargement(false))
  useEffect(() => { charger() }, [])

  const copier = () => {
    navigator.clipboard.writeText(data.lien)
    setCopie(true); toast.success(t('Lien copié !'))
    setTimeout(() => setCopie(false), 2000)
  }

  const enregistrerPaypal = async (e) => {
    e.preventDefault()
    setEnvoi(true)
    try {
      await api.put('/apporteur/paypal', { paypal_email: paypal.trim() })
      toast.success(t('Email PayPal enregistré'))
      charger()
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || err.response?.data?.error || t('Erreur'))
    } finally { setEnvoi(false) }
  }

  const retirer = async () => {
    setEnvoi(true)
    try {
      const r = await api.post('/apporteur/retrait', {})
      toast.success(t('Retrait de {euros} demandé', { euros: euros(r.data.montant) }))
      charger()
    } catch (err) {
      toast.error(err.response?.data?.error || t('Erreur'))
    } finally { setEnvoi(false) }
  }

  if (chargement) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>

  if (nonApporteur) return (
    <div className="max-w-xl space-y-3">
      <h1 className="page-title">{t('Espace apporteur')}</h1>
      <div className="card text-sm text-gray-600">
        {t('Ce compte n\'est pas encore apporteur. Si tu veux prospecter pour SwimUp et toucher une commission, demande ton accès à l\'équipe.')}
      </div>
    </div>
  )

  const abonnes = data.clients.filter(c => c.abonne).length

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="page-title flex items-center gap-2"><Handshake size={22} />{' '}{t('Espace apporteur')}</h1>
        <p className="text-muted mt-1">
          {t('Tu amènes des entreprises avec ton lien. Quand l\'une d\'elles paie son premier abonnement, tu touches {Math} % de ce paiement.', { Math: Math.round(data.taux * 100) })}
        </p>
      </div>

      <Link to="/apporteur/guide" className="card flex items-center gap-3 !p-4">
        <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0"><BookOpen size={18} /></span>
        <span className="min-w-0">
          <span className="block font-medium text-gray-900">{t('Guide de l\'apporteur')}</span>
          <span className="block text-sm text-gray-500">{t('À qui parler, où les trouver, les messages à copier')}</span>
        </span>
      </Link>

      {!data.actif && (
        <div className="rounded-xl p-3 text-sm bg-amber-50 text-amber-800 border border-amber-200">
          {t('Ton lien est désactivé : les nouveaux inscrits ne te sont plus rattachés. Ce que tu as déjà gagné reste à toi.')}
        </div>
      )}

      <section className="card space-y-3">
        <p className="text-sm text-gray-500">{t('Ton lien à partager')}</p>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
          <input readOnly value={data.lien} className="bg-transparent flex-1 text-sm text-gray-800 outline-none truncate" aria-label={t('Ton lien d\'apporteur')} />
          <button onClick={copier} className="shrink-0 inline-flex items-center gap-1.5 bg-sky-500 text-white text-sm font-medium rounded-full px-3 py-1.5">
            {copie ? <Check size={14} /> : <Copy size={14} />} {copie ? t('Copié') : t('Copier')}
          </button>
        </div>
        <p className="text-xs text-gray-400">{t('Ton code :')}{' '}<span className="font-semibold text-gray-600">{data.code}</span>{t('. Le lien marche sur toutes les pages du site (ajoute ?ref={code} à n\'importe quelle adresse), et il est gardé 30 jours dans le navigateur de la personne.', { code: data.code })}</p>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[[t('Inscrits'), data.clients.length], [t('Abonnés'), abonnes], [t('Gagné'), euros(data.acquis)], [t('Disponible'), euros(data.disponible)]].map(([l, v]) => (
          <div key={l} className="card text-center">
            <p className="text-xl font-bold text-gray-900">{v}</p>
            <p className="text-xs text-gray-500 mt-0.5">{l}</p>
          </div>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Wallet size={16} />{' '}{t('Retirer mes gains')}</h2>
        <form onSubmit={enregistrerPaypal} className="flex gap-2">
          <input type="email" required value={paypal} onChange={e => setPaypal(e.target.value)} placeholder={t('Ton email PayPal')}
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm" aria-label={t('Email PayPal')} />
          <button disabled={envoi} className="bg-gray-900 text-white rounded-full px-4 text-sm font-medium disabled:opacity-60">{t('Enregistrer')}</button>
        </form>
        <button onClick={retirer} disabled={envoi || !data.paypal_email || data.disponible <= 0}
          className="w-full bg-emerald-500 text-white py-2.5 rounded-full text-sm font-medium disabled:opacity-50">
          {data.disponible > 0 ? t('Retirer {montant}', { montant: euros(data.disponible) }) : t('Rien à retirer pour l\'instant')}
        </button>
        <p className="text-xs text-gray-400">{t('Pas de minimum : dès que tu as quelque chose de disponible, tu peux le retirer. Paiement par PayPal sous 24-48 h. L\'email du compte doit être vérifié.')}</p>
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold text-gray-900">{t('Tes inscrits')}</h2>
        {data.clients.length === 0 && <p className="text-sm text-gray-400">{t('Personne pour l\'instant. Les entreprises restent anonymes ici : tu vois la date d\'inscription et si elle a pris un abonnement.')}</p>}
        {data.clients.map(c => (
          <div key={c.numero} className="flex items-center justify-between text-sm border-t border-gray-100 pt-2 first:border-0 first:pt-0">
            <span className="text-gray-700">{t('Entreprise {numero}', { numero: c.numero })}{' '}<span className="text-gray-400">{t('· inscrite le {jour}', { jour: jour(c.date) })}</span></span>
            {c.abonne ? <span className="badge-green">{t('Abonnée')}</span> : <span className="badge-yellow shrink-0">{t('Pas abonnée')}</span>}
          </div>
        ))}
      </section>

      {(data.commissions.length > 0 || data.retraits.length > 0) && (
        <section className="card space-y-2">
          <h2 className="font-semibold text-gray-900">{t('Historique')}</h2>
          {data.commissions.map(c => (
            <div key={'c' + c.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{t('Commission du {jour}', { jour: jour(c.created_at) })}{c.statut === 'annulee' && <span className="text-gray-400">{' '}{t('(annulée)')}</span>}</span>
              <span className={c.statut === 'annulee' ? 'text-gray-400 line-through' : 'font-medium text-emerald-600'}>+{euros(c.montant)}</span>
            </div>
          ))}
          {data.retraits.map(r => (
            <div key={'r' + r.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{t('Retrait du {jour}', { jour: jour(r.created_at) })}{' '}<span className="text-gray-400">· {t(LABEL_RETRAIT[r.statut])}</span></span>
              <span className={r.statut === 'refuse' ? 'text-gray-400 line-through' : 'font-medium text-gray-900'}>−{euros(r.montant)}</span>
            </div>
          ))}
        </section>
      )}

      <section className="card space-y-2 text-sm text-gray-600">
        <h2 className="font-semibold text-gray-900">{t('Comment ça marche, et les règles')}</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>{t('Tu touches {Math} % du premier paiement d\'abonnement de chaque entreprise que tu amènes, une seule fois par entreprise. Les paiements suivants ne rapportent rien.', { Math: Math.round(data.taux * 100) })}</li>
          <li>{t('La commission n\'est comptée que sur un abonnement payé. Une entreprise qui s\'inscrit gratuitement ou qui commande des avis sans abonnement ne rapporte rien.')}</li>
          <li>{t('Si un paiement est remboursé ou jugé frauduleux, la commission est annulée.')}</li>
          <li>{t('Dis clairement à qui tu parles ce qu\'est SwimUp : des outils pour les avis Google, et aussi la vente de commandes d\'avis. Ne le cache pas.')}</li>
          <li>{t('Ne promets ni résultats, ni meilleur classement, ni plus de clients. Pas de faux avis, pas de fausses stats, pas de faux témoignages.')}</li>
          <li>{t('Si tu contactes des entreprises par mail : pas de listes achetées, pas de spam. Si quelqu\'un te dit d\'arrêter, tu arrêtes tout de suite.')}</li>
          <li>{t('Tu es indépendant, tu t\'occupes toi-même de déclarer ce que tu gagnes.')}</li>
        </ul>
        <p className="text-xs text-gray-400">{t('Ces règles sont des repères pratiques, pas un conseil juridique. Pour ta situation (statut, déclarations, démarchage), renseigne-toi auprès d\'un professionnel.')}</p>
      </section>
    </div>
  )
}
