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
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'

const statutConfig = {
  reserve: { label: 'En cours', dot: 'bg-amber-400', icon: Clock },
  en_verification: { label: 'Vérification', dot: 'bg-sky-400', icon: Loader2 },
  valide: { label: 'Validé', dot: 'bg-emerald-400', icon: CheckCircle2 },
  refuse: { label: 'Supprimé', dot: 'bg-red-400', icon: XCircle },
  paye: { label: 'Payé', dot: 'bg-emerald-400', icon: CheckCircle2 },
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

  const manquePaypal = !user?.paypal_email
  const manqueDiscord = !user?.discord_id

  if (soldeLoading || avisLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-[28px] leading-tight font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Bonjour, {user?.email?.split('@')[0]}
        </h1>
        <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1">Voici ce qui se passe sur ton compte.</p>
      </div>

      {/* Solde — seul bloc coloré, tout le reste reste en typographie nue */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-sky-500 text-white p-7"
      >
        <p className="text-sky-100 text-[13px] font-medium">Solde disponible</p>
        <p className="text-[44px] font-semibold tracking-tight leading-none mt-2">
          {solde.toFixed(2)} <span className="text-[20px] font-medium text-sky-100">EUR</span>
        </p>
        <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/15 text-[14px]">
          <div>
            <p className="text-sky-100">Après vérification</p>
            <p className="font-semibold mt-0.5">{soldeAttente.toFixed(2)} EUR</p>
          </div>
          <div className="w-px h-8 bg-white/15" />
          <div>
            <p className="text-sky-100">Avis rédigés</p>
            <p className="font-semibold mt-0.5">{avis?.length || 0}</p>
          </div>
        </div>
      </motion.div>

      {/* Alertes — liste fine, pas de card par item */}
      {(manquePaypal || manqueDiscord) && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800">
          {manquePaypal && (
            <div className="flex items-center gap-3 py-4">
              <AlertTriangle size={17} className="text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-slate-800 dark:text-slate-200">Adresse PayPal manquante</p>
                <p className="text-[13px] text-slate-400 mt-0.5">Ajoute ton PayPal pour pouvoir retirer ton solde.</p>
              </div>
              <Link to="/profil" className="text-[13px] font-medium text-sky-500 hover:underline shrink-0 flex items-center gap-0.5">
                Profil <ChevronRight size={14} />
              </Link>
            </div>
          )}
          {manqueDiscord && (
            <div className="flex items-center gap-3 py-4">
              <MessageCircle size={17} className="text-sky-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-slate-800 dark:text-slate-200">ID Discord manquant</p>
                <p className="text-[13px] text-slate-400 mt-0.5">Renseigne ton ID Discord dans ton profil.</p>
              </div>
              <Link to="/profil" className="text-[13px] font-medium text-sky-500 hover:underline shrink-0 flex items-center gap-0.5">
                Profil <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Comment ça marche — numéros monochromes, pas de fond coloré par étape */}
      <div>
        <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide mb-5">Comment ça marche</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
          {[
            { n: '1', t: 'Réserve un avis', d: 'Choisis un établissement à noter' },
            { n: '2', t: 'Publie ton avis', d: 'Mets les étoiles demandées sur Google Maps' },
            { n: '3', t: 'Soumets le lien', d: 'Copie le lien de ton avis publié' },
            { n: '4', t: 'Reçois ton argent', d: 'Ton solde est crédité après vérification' },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-500 text-white text-[12px] font-semibold mb-2.5">
                {s.n}
              </span>
              <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">{s.t}</p>
              <p className="text-[13px] text-slate-400 mt-0.5 leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Derniers avis — liste fine avec pastille de couleur, pas d'icône encadrée */}
      {recentAvis.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide">Mes derniers avis</h2>
            <Link to="/mon-avis" className="text-[13px] font-medium text-sky-500 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800">
            {recentAvis.map((a) => {
              const config = statutConfig[a.statut] || statutConfig.reserve
              const delai = getDelaiRestant(a)
              return (
                <div key={a.id} className="flex items-center gap-3 py-3.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-slate-800 dark:text-slate-200 truncate">{a.nom_societe}</p>
                    <p className="text-[12px] text-slate-400">{parseFloat(a.prix).toFixed(2)} EUR</p>
                  </div>
                  {delai && (
                    <span className="text-[12px] text-slate-400 shrink-0">{delai}</span>
                  )}
                  <span className="text-[12px] font-medium text-slate-500 shrink-0">
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
