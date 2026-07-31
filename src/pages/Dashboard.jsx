// ============================================================
// frontend/src/pages/Dashboard.jsx -- NOUVEAU (redesign)
// ============================================================

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSolde, useMesAvis } from '../hooks/useAvis'
import { DashboardSkeleton } from '../components/Skeleton'
import {
  Wallet,
  Star,
  Clock,
  AlertTriangle,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'

const statutConfig = {
  reserve: { label: 'En cours', class: 'badge-amber', icon: Clock },
  en_verification: { label: 'Verification', class: 'badge-blue', icon: Loader2 },
  valide: { label: 'Valide', class: 'badge-green', icon: CheckCircle2 },
  refuse: { label: 'Supprime', class: 'badge-red', icon: XCircle },
  paye: { label: 'Paye', class: 'badge-green', icon: CheckCircle2 },
}

function getDelaiRestant(avis) {
  if (!avis.valide_at || avis.statut !== 'valide') return null
  const valideAt = new Date(avis.valide_at)
  const delaiJours = parseInt(avis.delai_paiement) || 30
  const payeAt = new Date(valideAt.getTime() + delaiJours * 24 * 60 * 60 * 1000)
  const diff = payeAt - Date.now()
  if (diff <= 0) return 'Paiement imminent'
  const jours = Math.ceil(diff / (24 * 60 * 60 * 1000))
  return `${jours}j restantes`
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: soldeData, isLoading: soldeLoading } = useSolde()
  const { data: avis, isLoading: avisLoading } = useMesAvis()

  const solde = soldeData?.solde || 0
  const soldeAttente = avis?.filter(a => a.statut === 'valide').reduce((s, a) => s + parseFloat(a.prix || 0), 0) || 0

  const recentAvis = avis?.slice(0, 5) || []

  if (soldeLoading || avisLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Bonjour, {user?.email?.split('@')[0]}</h1>
        <p className="text-muted mt-1">Voici ce qui se passe sur ton compte.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Solde */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="stat-card bg-sky-500 border-sky-400 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
            <span className="text-xs font-medium text-sky-100 bg-white/15 px-2 py-0.5 rounded-full">
              Disponible
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {solde.toFixed(2)} <span className="text-lg font-semibold">EUR</span>
          </div>
          <p className="text-sky-100 text-sm mt-1">Solde actuel</p>
        </motion.div>

        {/* En attente */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-amber-500" />
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              En attente
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {soldeAttente.toFixed(2)} <span className="text-lg font-semibold text-slate-400">EUR</span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Apres verification</p>
        </motion.div>

        {/* Avis total */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-emerald-500" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {avis?.length || 0}
          </div>
          <p className="text-slate-500 text-sm mt-1">Avis rediges</p>
        </motion.div>
      </div>

      {/* Alertes */}
      <div className="space-y-3">
        {!user?.paypal_email && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-4 border-l-4 border-l-amber-400 flex items-start gap-3"
          >
            <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Adresse PayPal manquante</p>
              <p className="text-sm text-slate-500 mt-0.5">Ajoute ton PayPal pour pouvoir retirer ton solde.</p>
            </div>
            <Link to="/profil" className="btn-secondary text-xs py-2 px-3 shrink-0">
              Profil
            </Link>
          </motion.div>
        )}

        {!user?.discord_id && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="card p-4 border-l-4 border-l-sky-400 flex items-start gap-3"
          >
            <MessageCircle size={18} className="text-sky-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">ID Discord manquant</p>
              <p className="text-sm text-slate-500 mt-0.5">Renseigne ton ID Discord dans ton profil.</p>
            </div>
            <Link to="/profil" className="btn-secondary text-xs py-2 px-3 shrink-0">
              Profil
            </Link>
          </motion.div>
        )}
      </div>

      {/* Comment ca marche */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Comment ca marche ?</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { n: '1', t: 'Reserve un avis', d: 'Choisis un etablissement a noter', color: 'bg-sky-50 text-sky-600' },
            { n: '2', t: 'Publie ton avis', d: 'Mets les etoiles demandees sur Google Maps', color: 'bg-emerald-50 text-emerald-600' },
            { n: '3', t: 'Soumets le lien', d: 'Copie le lien de ton avis publie', color: 'bg-amber-50 text-amber-600' },
            { n: '4', t: 'Recois ton argent', d: 'Ton solde est credite apres verification', color: 'bg-violet-50 text-violet-600' },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-slate-50 rounded-lg p-4"
            >
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${s.color} mb-2`}>
                {s.n}
              </span>
              <p className="text-sm font-semibold text-slate-800">{s.t}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Derniers avis */}
      {recentAvis.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Mes derniers avis</h2>
            <Link to="/mon-avis" className="text-sm font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentAvis.map((a) => {
              const config = statutConfig[a.statut] || statutConfig.reserve
              const Icon = config.icon
              const delai = getDelaiRestant(a)
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    a.statut === 'valide' || a.statut === 'paye' ? 'bg-emerald-50' :
                    a.statut === 'refuse' ? 'bg-red-50' : 'bg-amber-50'
                  }`}>
                    <Icon size={16} className={
                      a.statut === 'valide' || a.statut === 'paye' ? 'text-emerald-500' :
                      a.statut === 'refuse' ? 'text-red-500' : 'text-amber-500'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{a.nom_societe}</p>
                    <p className="text-xs text-slate-400">{parseFloat(a.prix).toFixed(2)} EUR</p>
                  </div>
                  {delai && (
                    <span className="text-xs text-slate-400 shrink-0">{delai}</span>
                  )}
                  <span className={`badge text-xs ${config.class}`}>
                    {config.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/portefeuille" className="btn-primary flex-1 justify-center">
          <Wallet size={16} />
          Retirer mon solde
        </Link>
        <Link to="/avis" className="btn-secondary flex-1 justify-center">
          <Star size={16} />
          Voir les avis disponibles
        </Link>
      </div>
    </div>
  )
}
