import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNavigate, Link as RouterLink } from '../../components/Lien'
import { useAuth } from '../../hooks/useAuth'
import api from '../../lib/api'
import { CreditCard, Star, Building, Link, Clock, CheckCircle2, ArrowRight, ShieldCheck, Gift, Crown, ChevronDown, Wallet } from 'lucide-react'
import { lienPaypal } from '../../lib/paypal'
import { motion } from 'framer-motion'
import { springSmooth } from '../../lib/motion'
import toast from 'react-hot-toast'
import { MentionDonnees, InfoAvantPaiement } from '../../components/PageLegale'
import { t, tn } from '../../lib/i18n'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

const PRIX_AVIS = 3

const QUANTITES = [1, 5, 10, 20]

// On retient l'établissement de la dernière commande (confort de
// recommande). Le stockage navigateur peut être indisponible : on ignore.
const cleMemoire = (id) => `swimup_derniere_commande_${id}`
function lireMemoire(id) {
  try { return JSON.parse(localStorage.getItem(cleMemoire(id)) || 'null') } catch { return null }
}
function ecrireMemoire(id, valeurs) {
  try { localStorage.setItem(cleMemoire(id), JSON.stringify(valeurs)) } catch { /* ignoré */ }
}

export default function ClientPaiement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [loading, setLoading] = useState(false)
  const [commandeEnvoyee, setCommandeEnvoyee] = useState(null) // { montant }
  const [form, setForm] = useState({
    nom_etablissement:  '',
    type_etablissement: '',
    lien_maps:          '',
    nb_etoiles:         '5',
    delai_paiement:     '30',
    nb_avis:            '1',
  })

  const [options, setOptions] = useState(false)
  const [dejaRempli, setDejaRempli] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    const m = lireMemoire(user.id)
    if (m?.lien_maps) {
      setForm(p => ({ ...p, nom_etablissement: m.nom_etablissement || '', type_etablissement: m.type_etablissement || '', lien_maps: m.lien_maps }))
      setDejaRempli(true)
    }
  }, [user?.id])

  // Retour de la page Stripe après un paiement abandonné.
  const [params] = useSearchParams()
  useEffect(() => {
    if (params.get('paiement') === 'annule') toast(t('Paiement annulé, rien n\'a été débité.'), { icon: 'ℹ️' })
  }, [params])

  const estPremium = !!user?.premium

  const nb = parseInt(form.nb_avis) || 1
  const nbBonus = Math.floor(nb / 10)
  const sousTotal = nb * PRIX_AVIS
  const total = estPremium ? Math.round(sousTotal * 0.9 * 100) / 100 : sousTotal

  // Paiement par carte : on envoie le client chez Stripe, c'est le webhook de
  // Stripe qui crée la commande une fois l'argent reçu (rien n'est créé avant).
  const handleCarte = async () => {
    if (!form.nom_etablissement) return toast.error(t('Entre le nom de l\'établissement'))
    if (!form.lien_maps) return toast.error(t('Entre le lien Google Maps'))
    if (nb < 1) return toast.error(t('Minimum 1 avis'))

    setLoading(true)
    try {
      const r = await api.post('/stripe/commande-carte', {
        nb_avis:            nb,
        nom_etablissement:  form.nom_etablissement,
        lien_maps:          form.lien_maps,
        type_etablissement: form.type_etablissement,
        delai_paiement:     parseInt(form.delai_paiement) || 30,
        nb_etoiles:         parseInt(form.nb_etoiles) || 5,
      })
      if (user?.id) ecrireMemoire(user.id, { nom_etablissement: form.nom_etablissement, type_etablissement: form.type_etablissement, lien_maps: form.lien_maps })
      window.location.href = r.data.url
      return // la page change : on laisse le bouton bloqué
    } catch (e) {
      toast.error(e.response?.data?.error || t('Impossible de lancer le paiement par carte'))
    }
    setLoading(false)
  }

  const handleCommander = async () => {
    if (!form.nom_etablissement) return toast.error(t('Entre le nom de l\'établissement'))
    if (!form.lien_maps) return toast.error(t('Entre le lien Google Maps'))
    if (nb < 1) return toast.error(t('Minimum 1 avis'))

    setLoading(true)
    try {
      const r = await api.post('/stripe/create-checkout-session', {
        nb_avis:            nb,
        nom_etablissement:  form.nom_etablissement,
        lien_maps:          form.lien_maps,
        type_etablissement: form.type_etablissement,
        delai_paiement:     parseInt(form.delai_paiement) || 30,
        nb_etoiles:         parseInt(form.nb_etoiles) || 5,
      })

      if (isAdmin) {
        // Admin — avis créés directement, pas de validation ni de paiement
        navigate('/client/success?session_id=' + r.data.session_id)
      } else {
        // Client — commande envoyée à l'admin pour validation, paiement PayPal en direct
        if (user?.id) ecrireMemoire(user.id, { nom_etablissement: form.nom_etablissement, type_etablissement: form.type_etablissement, lien_maps: form.lien_maps })
        setCommandeEnvoyee({ montant: r.data.montant })
        toast.success(t('Commande envoyée !'))
      }
    } catch (e) {
      toast.error(e.response?.data?.error || t('Erreur lors de la création'))
    }
    setLoading(false)
  }

  if (commandeEnvoyee) {
        return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springSmooth}
          className="card p-8 text-center space-y-5"
        >
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={30} className="text-sky-500" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-slate-900 dark:text-white tracking-tight">{t('Commande envoyée')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              {t('Il reste une étape : le paiement de {commandeEnvoyee}€ par PayPal.', { commandeEnvoyee: commandeEnvoyee.montant.toFixed(2) })}
            </p>
          </div>

          <a
            href={lienPaypal(commandeEnvoyee.montant)}
            target="_blank"
            rel="noreferrer"
            className="btn-primary w-full text-base py-3.5"
          >
            {t('Payer {commandeEnvoyee}€ avec PayPal', { commandeEnvoyee: commandeEnvoyee.montant.toFixed(2) })}
          </a>

          <ol className="text-left text-xs text-slate-500 dark:text-slate-400 space-y-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
            <li><strong className="text-slate-700 dark:text-slate-200">1.</strong>{' '}{t('Tu paies sur PayPal (le montant est déjà rempli).')}</li>
            <li><strong className="text-slate-700 dark:text-slate-200">2.</strong>{' '}{t('On active ta commande dès qu\'on voit le paiement, en général sous 12 h.')}</li>
            <li><strong className="text-slate-700 dark:text-slate-200">3.</strong>{' '}{t('Tu écris le texte de chaque avis, les membres le publient.')}</li>
            <li className="pt-1">{t('Tu peux fermer cette page : le bouton de paiement reste dans « Mes commandes ».')}</li>
          </ol>

          <div className="flex flex-col gap-3 pt-2">
            <button onClick={() => navigate('/client/commandes')} className="btn-secondary w-full">
              <ArrowRight size={16} />
              {t('Voir mes commandes')}
            </button>
            <button onClick={() => navigate('/client')} className="btn-ghost w-full">
              {t('Retour au dashboard')}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const etoilesLabel = n => ({
    1: t('Très mauvais'), 2: t('Mauvais'), 3: t('Moyen'),
    4: t('Bien'), 5: t('Excellent')
  }[parseInt(n)] || t('Excellent'))

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
      <div>
        <h1 className="page-title">
          {isAdmin ? t('Commander des avis (Admin)') : t('Commander des avis')}
        </h1>
        <p className="text-muted mt-1">
          {isAdmin
            ? t('En tant qu\'admin, les avis sont créés gratuitement et immédiatement.')
            : t('Ton lien Google Maps, le nombre d\'avis, puis le paiement par carte ou PayPal')
          }
        </p>
      </div>

      {isAdmin && (
        <div className="card p-4 bg-emerald-50 dark:bg-emerald-900/20 flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {t('Mode admin — paiement bypassé')}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
              {t('Les avis seront créés directement sans facturation.')}
            </p>
          </div>
        </div>
      )}

      <div className="card p-5 space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <Building size={18} className="text-sky-500" />
          {t('Ton établissement')}
        </h2>

        {dejaRempli && (
          <p className="text-xs text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 rounded-xl px-3 py-2">
            {t('Repris de ta dernière commande. Change-le si c\'est pour un autre établissement.')}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t('Nom de l\'établissement')}{' '}<span className="text-red-500">*</span>
          </label>
          <input className="input" placeholder={t('Ex: Restaurant Le Petit Bistro')}
            value={form.nom_etablissement}
            onChange={e => setForm(p => ({ ...p, nom_etablissement: e.target.value }))} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
            <Link size={14} className="text-slate-500 dark:text-slate-400" />
            {t('Lien Google Maps')}{' '}<span className="text-red-500">*</span>
          </label>
          <input className="input" placeholder="https://maps.app.goo.gl/..."
            value={form.lien_maps}
            onChange={e => setForm(p => ({ ...p, lien_maps: e.target.value }))} />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('Sur Google Maps : ta fiche → Partager → Copier le lien.')}</p>
        </div>

        <button type="button" onClick={() => setOptions(o => !o)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <ChevronDown size={14} className={`transition-transform ${options ? 'rotate-180' : ''}`} />
          {t('Options (type d\'établissement, étoiles, garantie)')}
        </button>

        {options && (
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Type d\'établissement')}</label>
              <input className="input" placeholder={t('Ex: restaurant, hôtel, couvreur...')}
                value={form.type_etablissement}
                onChange={e => setForm(p => ({ ...p, type_etablissement: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Star size={14} className="text-slate-500 dark:text-slate-400" />{' '}{t('Note des avis')}
                </label>
                <select className="input" value={form.nb_etoiles}
                  onChange={e => setForm(p => ({ ...p, nb_etoiles: e.target.value }))}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{tn(n, '{n} étoile', '{n} étoiles')}</option>)}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{etoilesLabel(form.nb_etoiles)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock size={14} className="text-slate-500 dark:text-slate-400" />{' '}{t('Garantie (jours)')}
                </label>
                <input className="input" type="number" min="7" max="90" placeholder="30"
                  value={form.delai_paiement}
                  onChange={e => setForm(p => ({ ...p, delai_paiement: e.target.value }))} />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('On vérifie que l\'avis reste en ligne')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <CreditCard size={18} className="text-sky-500" />
          {t('Quantité')}{' '}{!isAdmin && t('et paiement')}
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t('Nombre d\'avis')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {QUANTITES.map(q => (
              <button key={q} type="button" onClick={() => setForm(p => ({ ...p, nb_avis: String(q) }))}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all active:scale-95 ${nb === q ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-sky-300'}`}>
                {q}{q === 10 && ' · 1 offert'}{q === 20 && ' · 2 offerts'}
              </button>
            ))}
          </div>
          <input className="input" type="number" min="1" max="50"
            value={form.nb_avis}
            onChange={e => setForm(p => ({ ...p, nb_avis: e.target.value }))} />
        </div>

        {!isAdmin && nbBonus === 0 && nb >= 5 && (
          <div className="flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3">
            <Gift size={14} className="shrink-0" />
            {t('Encore {valeur} avis pour en obtenir 1 offert', { valeur: 10 - (nb % 10) })}
          </div>
        )}

        {!isAdmin && nbBonus > 0 && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
            <Gift size={14} className="shrink-0" />
            {tn(nbBonus, '{n} avis offert sur cette commande !', '{n} avis offerts sur cette commande !')}
          </div>
        )}

        {/* Récap prix */}
        <div className={`rounded-xl p-4 space-y-2 ${isAdmin ? 'bg-green-50 dark:bg-green-900/20' : 'bg-sky-50 dark:bg-sky-900/20'}`}>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {t('{nb} avis', { nb })}{nbBonus > 0 && ' ' + tn(nbBonus, '(+{n} offert)', '(+{n} offerts)')}{' '}{t('×')}{' '}{isAdmin ? '0€ (admin)' : `${PRIX_AVIS}€`}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {isAdmin ? '0.00€' : `${sousTotal.toFixed(2)}€`}
            </span>
          </div>
          {!isAdmin && estPremium && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Crown size={12} />{' '}{t('Remise premium -10%')}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">-{(sousTotal - total).toFixed(2)}€</span>
            </div>
          )}
          <div className={`flex justify-between text-sm border-t pt-2 ${isAdmin ? 'border-green-100 dark:border-green-800' : 'border-sky-100 dark:border-sky-800'}`}>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{t('Total')}</span>
            <span className={`font-semibold text-lg ${isAdmin ? 'text-green-600 dark:text-green-400' : 'text-sky-600 dark:text-sky-400'}`}>
              {isAdmin ? t('Gratuit') : `${total.toFixed(2)}€`}
            </span>
          </div>
        </div>

        {!isAdmin && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>{t('Par carte : paiement sécurisé chez Stripe, commande activée en quelques secondes.')}</p>
            <p>{t('Par PayPal : on active ta commande dès qu\'on voit le paiement, en général sous 12 h.')}</p>
            <p>{t('Ensuite tu écris le texte de chaque avis.')}</p>
          </div>
        )}

        {!isAdmin && !estPremium && (
          <RouterLink to="/client/premium" className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 hover:opacity-80 transition-opacity">
            <Crown size={14} className="shrink-0" />
            {t('Passe premium pour -10% sur toutes tes commandes')}
          </RouterLink>
        )}

        {isAdmin ? (
          <button
            onClick={handleCommander}
            disabled={loading || !form.nom_etablissement || !form.lien_maps}
            className="w-full text-base py-3.5 font-medium rounded-full flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {loading ? <><Spinner />{' '}{t('Envoi...')}</> : <><CheckCircle2 size={18} />{' '}{t('Créer {nb} avis gratuitement', { nb })}</>}
          </button>
        ) : (
          <div className="space-y-2.5">
            <InfoAvantPaiement />
            <MentionDonnees>{t('Le lien de ta fiche, le nom et le type de ton établissement servent à faire publier les avis commandés.')}</MentionDonnees>
            <button
              onClick={handleCarte}
              disabled={loading || !form.nom_etablissement || !form.lien_maps}
              className="btn-primary w-full text-base py-3.5 font-medium rounded-full flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? <><Spinner />{' '}{t('Redirection...')}</> : <><CreditCard size={18} />{' '}{t('Payer {total}€ par carte', { total: total.toFixed(2) })}</>}
            </button>
            <button
              onClick={handleCommander}
              disabled={loading || !form.nom_etablissement || !form.lien_maps}
              className="btn-secondary w-full text-sm py-3 rounded-full flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Wallet size={16} />{' '}{t('Payer par PayPal')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
