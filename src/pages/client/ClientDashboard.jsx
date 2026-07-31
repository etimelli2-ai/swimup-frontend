import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { CreditCard, ShoppingBag, Bell, CheckCircle2, Clock, AlertTriangle, Star, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ClientDashboard() {
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

  const commandesIncompletes = commandes.filter(c => {
    const nb = parseInt(c.nb_avis) || 0
    const remplis = parseInt(c.nb_avis_remplis) || 0
    return remplis < nb
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="text-muted mt-1">Gérez vos commandes d'avis Google</p>
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

      {/* Notifications */}
      {showNotifs && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 space-y-2"
        >
          <h3 className="section-title">🔔 Notifications</h3>
          {notifs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Aucune notification</p>
          ) : notifs.slice(0, 5).map(n => (
            <div key={n.id} className={`rounded-xl p-3 ${n.lu ? 'bg-slate-50 dark:bg-slate-700/50' : 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800'}`}>
              <p className="text-sm font-semibold dark:text-white">{n.titre}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Alerte commandes incomplètes */}
      {commandesIncompletes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-4 border-l-4 border-l-amber-400 flex items-start gap-3"
        >
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              {commandesIncompletes.length} commande{commandesIncompletes.length > 1 ? 's' : ''} à compléter
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Des avis attendent leurs textes — remplis-les pour qu'ils soient disponibles pour les membres.
            </p>
          </div>
          <Link to="/client/commandes" className="btn-primary text-xs py-2 px-3 shrink-0">
            Compléter
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="stat-card"
          >
            <div className="w-10 h-10 bg-sky-50 dark:bg-sky-900/30 rounded-lg flex items-center justify-center mb-3">
              <Star size={20} className="text-sky-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total || 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total avis</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-3">
              <CheckCircle2 size={20} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.valides || 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Validés</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="stat-card"
          >
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-3">
              <Clock size={20} className="text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.enCours || 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">En cours</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp size={20} className="text-purple-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {commandes.length || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Commandes</p>
          </motion.div>
        </div>
      )}

      {/* Actions principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/client/payer" className="card p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/50 transition-colors">
            <CreditCard size={24} className="text-sky-500" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">Commander des avis</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Paye en ligne et reçois tes avis Google rapidement
          </p>
          <div className="mt-3 flex items-center gap-1 text-sky-600 dark:text-sky-400 text-sm font-medium">
            Commander → 3€/avis
          </div>
        </Link>

        <Link to="/client/commandes" className="card p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <ShoppingBag size={24} className="text-emerald-500" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">Mes commandes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérer et remplir les textes de tes avis commandés
          </p>
          <div className="mt-3 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            {commandes.length} commande{commandes.length !== 1 ? 's' : ''}
            {commandesIncompletes.length > 0 && (
              <span className="ml-2 badge-amber text-xs">{commandesIncompletes.length} à compléter</span>
            )}
          </div>
        </Link>
      </div>

      {/* Comment ça marche */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Comment ça marche ?</h2>
        <div className="space-y-3">
          {[
            { n: '1', t: 'Commander', d: 'Choisis ton établissement, le nombre d\'avis et paie en ligne via Stripe', color: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
            { n: '2', t: 'Remplir les textes', d: 'Après paiement, remplis ou génère avec l\'IA les textes de chaque avis', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
            { n: '3', t: 'Publication', d: 'Les membres de SwimUp publient tes avis sur Google Maps', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
            { n: '4', t: 'Vérification', d: 'Nos systèmes vérifient que les avis sont bien publiés et maintenus', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-start gap-3"
            >
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${s.color}`}>
                {s.n}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{s.t}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{s.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
