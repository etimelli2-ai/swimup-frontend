import usePageTitle from '../hooks/usePageTitle'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSolde, useMesAvis } from '../hooks/useAvis'
import { DashboardSkeleton } from '../components/Skeleton'
import OnboardingTour from '../components/OnboardingTour'
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
  Sparkles,
  MapPin,
  Send,
  Coins,
  TrendingUp,
  Gift,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { springSmooth } from '../lib/motion'

const statutConfig = {
  reserve: { label: 'En cours', dot: 'bg-amber-400', icon: Clock },
  en_verification: { label: 'Vérification', dot: 'bg-sky-400', icon: Loader2 },
  valide: { label: 'Validé', dot: 'bg-emerald-400', icon: CheckCircle2 },
  refuse: { label: 'Supprimé', dot: 'bg-red-400', icon: XCircle },
  paye: { label: 'Payé', dot: 'bg-emerald-400', icon: CheckCircle2 },
}

function getDelaiRestant(avis) {
  // Le délai de paiement est compté depuis la soumission (heure de l'avis
  // posté), pas depuis le premier checkpoint validé par l'admin.
  if (!avis.soumis_at || avis.statut !== 'valide') return null
  const soumisAt = new Date(String(avis.soumis_at).replace(' ', 'T') + 'Z')
  const delaiJours = parseInt(avis.delai_paiement) || 30
  const payeAt = new Date(soumisAt.getTime() + delaiJours * 24 * 60 * 60 * 1000)
  const diff = payeAt - Date.now()
  if (diff <= 0) return 'Paiement imminent'
  const jours = Math.ceil(diff / (24 * 60 * 60 * 1000))
  return `${jours}j restantes`
}

// Fix — affiche un prénom lisible plutôt que le préfixe brut de l'email
// (ex: "enzo.timelli" -> "Enzo" au lieu de "enzo.timelli").
function getPrenomAffiche(email) {
  if (!email) return ''
  const prefixe = email.split('@')[0]
  const premierMot = prefixe.split(/[._-]+/)[0]
  if (!premierMot) return prefixe
  return premierMot.charAt(0).toUpperCase() + premierMot.slice(1)
}

export default function Dashboard() {
  usePageTitle('Tableau de bord')

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
      <OnboardingTour />
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/25">
          <Sparkles size={19} className="text-white" />
        </div>
        <div>
          <h1 className="text-[28px] leading-tight font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Bonjour, {getPrenomAffiche(user?.email)}
          </h1>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-0.5">Voici ce qui se passe sur ton compte.</p>
        </div>
      </div>

      {/* Solde */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSmooth}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white p-7 shadow-xl shadow-sky-500/20"
      >
        <div className="flex items-center gap-2 text-sky-100 text-[13px] font-medium">
          <Wallet size={15} />
          Solde disponible
        </div>
        <p className="text-[44px] font-semibold tracking-tight leading-none mt-2">
          {solde.toFixed(2)} <span className="text-[20px] font-medium text-sky-100">EUR</span>
        </p>
        {solde < 0 && (
          <p className="text-[13px] text-red-100 mt-3 bg-red-500/30 rounded-lg px-3 py-2">
            Solde négatif : un avis refusé t'a été repris. Tes prochains gains le rembourseront.
          </p>
        )}
        <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/15 text-[14px]">
          <div>
            <p className="text-sky-100 flex items-center gap-1.5"><Clock size={12} /> Après vérification</p>
            <p className="font-semibold mt-0.5">{soldeAttente.toFixed(2)} EUR</p>
          </div>
          <div className="w-px h-8 bg-white/15" />
          <div>
            <p className="text-sky-100 flex items-center gap-1.5"><TrendingUp size={12} /> Avis rédigés</p>
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

      {/* Parrainage — bandeau CTA */}
      <Link to="/parrainage" className="flex items-center gap-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white p-5 shadow-lg shadow-violet-500/20 hover:brightness-105 transition-all">
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Gift size={18} />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold">Parraine tes amis</p>
          <p className="text-[13px] text-violet-100">Touche 0,20 € sur chaque avis qu'ils font</p>
        </div>
        <ChevronRight size={18} className="shrink-0" />
      </Link>

      {/* Comment ça marche — cartes avec icônes colorées */}
      <div>
        <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide mb-4">Comment ça marche</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: MapPin, t: 'Réserve un avis', d: 'Choisis un établissement à noter', bg: 'bg-sky-50 dark:bg-sky-900/20', fg: 'text-sky-500' },
            { icon: Star, t: 'Publie ton avis', d: 'Mets les étoiles demandées sur Google Maps', bg: 'bg-amber-50 dark:bg-amber-900/20', fg: 'text-amber-500' },
            { icon: Send, t: 'Soumets le lien', d: 'Copie le lien de ton avis publié', bg: 'bg-violet-50 dark:bg-violet-900/20', fg: 'text-violet-500' },
            { icon: Coins, t: 'Reçois ton argent', d: 'Ton solde est crédité après vérification', bg: 'bg-emerald-50 dark:bg-emerald-900/20', fg: 'text-emerald-500' },
          ].map((s) => (
            <div key={s.t} className="card p-4">
              <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3 ${s.bg} ${s.fg}`}>
                <s.icon size={17} />
              </span>
              <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">{s.t}</p>
              <p className="text-[13px] text-slate-400 mt-0.5 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Derniers avis — liste fine avec pastille de couleur, pas d'icône encadrée */}
      {recentAvis.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide">Mes derniers avis</h2>
            <Link to="/avis" className="text-[13px] font-medium text-sky-500 hover:underline flex items-center gap-1">
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
