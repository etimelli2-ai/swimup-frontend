import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect } from 'react'
import { Link } from '../../components/Lien'
import api from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { CreditCard, ShoppingBag, Bell, CheckCircle2, Clock, Star, Crown, BarChart3, Wallet, PenLine } from 'lucide-react'
import { lienPaypal } from '../../lib/paypal'
import { motion, AnimatePresence } from 'framer-motion'
import { springSmooth, springSheet } from '../../lib/motion'
import { t, tn, locale } from '../../lib/i18n'

export default function ClientDashboard() {
  usePageTitle(t('Dashboard client'))

  const { user } = useAuth()
  const [stats, setStats]           = useState(null)
  const [commandes, setCommandes]   = useState([])
  const [notifs, setNotifs]         = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [loading, setLoading]       = useState(true)

  const load = async () => {
    try {
      const [s, c, n] = await Promise.all([
        api.get('/client/stats'),
        api.get('/stripe/commandes'),
        api.get('/client/notifications'),
      ])
      setStats(s.data)
      setCommandes(c.data)
      setNotifs(n.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const marquerLues = async () => {
    await api.put('/client/notifications/lire')
    setNotifs(n => n.map(x => ({ ...x, lu: 1 })))
  }

  const notifsNonLues = notifs.filter(n => !n.lu).length

  // Commandes payées dont il reste des textes à écrire / commandes à régler
  const commandesIncompletes = commandes.filter(c => {
    if (c.statut === 'en_attente') return false
    const total = parseInt(c.nb_avis_total) || parseInt(c.nb_avis) || 0
    return (parseInt(c.nb_avis_remplis) || 0) < total
  })
  const commandesAPayer = commandes.filter(c => c.statut === 'en_attente')
  const textesARemplir = commandesIncompletes.reduce((n, c) => {
    const total = parseInt(c.nb_avis_total) || parseInt(c.nb_avis) || 0
    return n + total - (parseInt(c.nb_avis_remplis) || 0)
  }, 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('Tableau de bord')}</h1>
          <p className="text-muted mt-1">{t('Ce qu\'il y a à faire, et où en sont tes avis')}</p>
        </div>
        <button
          onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) marquerLues() }}
          className="relative p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
        >
          <Bell size={18} className="text-slate-500" />
          {notifsNonLues > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {notifsNonLues}
            </span>
          )}
        </button>
      </div>

      {/* Notifications — vraie ouverture/fermeture (pas juste un fade),
          déclenchée par le clic sur la cloche : c'est une interaction, pas
          une entrée de page, donc hauteur + AnimatePresence pour l'exit. */}
      <AnimatePresence initial={false}>
        {showNotifs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={springSheet}
            className="overflow-hidden"
          >
            <div className="card p-4 space-y-2">
              <h3 className="section-title">{t('🔔 Notifications')}</h3>
              {notifs.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">{t('Aucune notification')}</p>
              ) : notifs.slice(0, 5).map(n => (
                <div key={n.id} className={`rounded-xl p-3 ${n.lu ? 'bg-slate-50 dark:bg-slate-700/50' : 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800'}`}>
                  <p className="text-sm font-semibold dark:text-white">{n.titre}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(n.created_at).toLocaleString(locale())}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prochaine étape : une seule chose à faire à la fois */}
      {commandesAPayer.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={springSmooth}
          className="card p-5 border-l-4 border-l-amber-400 space-y-3">
          <div className="flex items-start gap-3">
            <Wallet size={20} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                {commandesAPayer.length > 1 ? t('{length} commandes attendent ton paiement', { length: commandesAPayer.length }) : t('Ta commande attend ton paiement')}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t('Dès qu\'on voit ton paiement PayPal, on active ta commande (en général sous 12 h).')}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <a href={lienPaypal(commandesAPayer[0].montant)} target="_blank" rel="noreferrer" className="btn-primary text-sm py-2.5 px-4 flex-1 text-center">
              {t('Payer {parseFloat}€ avec PayPal', { parseFloat: parseFloat(commandesAPayer[0].montant).toFixed(2) })}
            </a>
            <Link to="/client/commandes" className="btn-secondary text-sm py-2.5 px-4 text-center">{t('Voir ma commande')}</Link>
          </div>
        </motion.div>
      ) : textesARemplir > 0 ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={springSmooth}
          className="card p-5 border-l-4 border-l-sky-500 flex items-start gap-3">
          <PenLine size={20} className="text-sky-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">
              {tn(textesARemplir, '{n} texte d\'avis à écrire', '{n} textes d\'avis à écrire')}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t('Tes avis ne sont publiés qu\'une fois leur texte rempli.')}
            </p>
          </div>
          <Link to="/client/commandes" className="btn-primary text-sm py-2.5 px-4 shrink-0">{t('Écrire')}</Link>
        </motion.div>
      ) : commandes.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={springSmooth}
          className="card p-5 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">{t('Lance ta première commande')}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t('3 € par avis, 1 avis offert tous les 10. Tu colles ton lien Google Maps et c\'est parti.')}
            </p>
          </div>
          <Link to="/client/payer" className="btn-primary text-sm py-2.5 px-4 shrink-0">{t('Commander')}</Link>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={springSmooth}
          className="card p-5 border-l-4 border-l-emerald-500 flex items-center gap-4">
          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">{t('Tout est en ordre')}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t('SwimUp s\'occupe de la publication. Tu peux en commander d\'autres quand tu veux.')}
            </p>
          </div>
          <Link to="/client/payer" className="btn-secondary text-sm py-2.5 px-4 shrink-0">{t('Commander')}</Link>
        </motion.div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: stats.valides || 0, l: t('Publiés sur Google'), Icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-900/30', fg: 'text-emerald-500' },
            { v: stats.enCours || 0, l: t('En cours de publication'), Icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/30', fg: 'text-amber-500' },
            { v: commandes.filter(c => c.statut !== 'en_attente').length, l: t('Commandes actives'), Icon: Star, bg: 'bg-sky-50 dark:bg-sky-900/30', fg: 'text-sky-500' },
          ].map(({ v, l, Icon, bg, fg }) => (
            <div key={l} className="stat-card">
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-2.5`}>
                <Icon size={18} className={fg} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{v}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{l}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Link to="/client/payer" className="card p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/50 transition-colors">
            <CreditCard size={24} className="text-sky-500" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">{t('Commander des avis')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('Choisis le nombre d\'avis, paie par carte ou PayPal, c\'est lancé')}
          </p>
          <div className="mt-3 flex items-center gap-1 text-sky-600 dark:text-sky-400 text-sm font-medium">
            {t('3 € par avis · 1 offert tous les 10')}
          </div>
        </Link>

        <Link to="/client/commandes" className="card p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <ShoppingBag size={24} className="text-emerald-500" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">{t('Mes commandes')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('Gérer et remplir les textes de tes avis commandés')}
          </p>
          <div className="mt-3 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            {tn(commandes.length, '{n} commande', '{n} commandes')}
            {commandesIncompletes.length > 0 && (
              <span className="ml-2 badge-amber text-xs">{t('{length} à compléter', { length: commandesIncompletes.length })}</span>
            )}
          </div>
        </Link>

        <Link to="/client/premium" className="card p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
            <Crown size={24} className="text-amber-500" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">{user?.premium ? t('Mon abonnement') : t('Passer Premium')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.premium
              ? t('Gère ton offre, ta carte et tes factures')
              : t('Campagnes d\'emails, suivi Google Maps, -10 % sur les commandes — dès 9,90 € par mois')}
          </p>
          <div className="mt-3 flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm font-medium">
            {user?.premium ? (user?.premium_offre === 'agence' ? t('Agence ✓') : user?.premium_offre === 'business' ? t('Business ✓') : t('Premium ✓')) : t('Voir les offres')}
          </div>
        </Link>

        <Link to="/client/stats" className="card p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 transition-colors">
            <BarChart3 size={24} className="text-violet-500" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">{t('Statistiques')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('Évolution de ta note Google et de tes avis publiés')}
          </p>
          <div className="mt-3 flex items-center gap-1 text-violet-600 dark:text-violet-400 text-sm font-medium">
            {t('Voir l\'évolution')}
          </div>
        </Link>
      </div>

      {/* Comment ça marche */}
      <div className="card p-5">
        <h2 className="section-title mb-4">{t('Comment ça marche ?')}</h2>
        <div className="space-y-3">
          {[
            { n: '1', t: t('Commander'), d: t('Colle ton lien Google Maps, choisis le nombre d\'avis et paie par carte ou PayPal'), color: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
            { n: '2', t: t('Remplir les textes'), d: t('Dès que ton paiement est confirmé, tu écris le texte de chaque avis'), color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
            { n: '3', t: t('Publication'), d: t('SwimUp publie tes avis sur Google Maps'), color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
            { n: '4', t: t('Vérification'), d: t('On vérifie que chaque avis reste en ligne pendant toute la durée de garantie'), color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-3">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${s.color}`}>
                {s.n}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{s.t}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
