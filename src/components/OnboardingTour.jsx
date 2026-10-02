import { useState } from 'react'
import { X, MapPin, Star, Send, Coins, Gift, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const ETAPES = [
  { icon: MapPin, color: 'bg-sky-50 dark:bg-sky-900/20 text-sky-500', t: 'Réserve un avis', d: 'Choisis un établissement disponible dans l\'onglet "Avis" — chaque avis a un prix fixe et un délai de paiement indiqués dessus.' },
  { icon: Star,   color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500', t: 'Publie-le sur Google Maps', d: 'Mets le nombre d\'étoiles demandé et publie l\'avis depuis ton propre compte Google.' },
  { icon: Send,   color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-500', t: 'Soumets le lien', d: 'Copie le lien direct de ton avis publié et colle-le dans l\'app — c\'est ce qui déclenche la vérification.' },
  { icon: Coins,  color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500', t: 'Reçois ton argent', d: 'Une fois l\'avis vérifié et le délai passé, ton solde est crédité automatiquement. Tu peux le retirer vers PayPal.' },
  { icon: Gift,   color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500', t: 'Bonus : parraine tes amis', d: 'Partage ton code depuis l\'onglet "Parrainage" — dès que ton filleul publie son premier avis, tu touches un bonus.' },
]

export default function OnboardingTour() {
  const { user, updateUser } = useAuth()
  const [step, setStep]       = useState(0)
  const [visible, setVisible] = useState(user?.role === 'membre' && !user?.onboarding_vu)

  if (!visible) return null

  const terminer = async () => {
    setVisible(false)
    updateUser({ onboarding_vu: true })
    try { await api.put('/auth/onboarding-vu') } catch {}
  }

  const estDernier = step === ETAPES.length - 1
  const etape = ETAPES[step]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[100] p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 relative"
        >
          <button onClick={terminer} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>

          <p className="text-xs font-semibold text-sky-500 uppercase tracking-wide mb-1">
            Bienvenue sur SwimUp · {step + 1}/{ETAPES.length}
          </p>

          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${etape.color}`}>
            <etape.icon size={22} />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{etape.t}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{etape.d}</p>

          <div className="flex items-center gap-1.5 mt-6 mb-5">
            {ETAPES.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-sky-500' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 py-2.5 rounded-full text-sm font-medium">
                Retour
              </button>
            )}
            <button
              onClick={() => estDernier ? terminer() : setStep(s => s + 1)}
              className="flex-1 btn-primary justify-center flex items-center gap-1.5"
            >
              {estDernier ? 'Commencer' : 'Suivant'}
              {!estDernier && <ArrowRight size={15} />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
