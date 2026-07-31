import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ClientSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-8 max-w-md w-full text-center space-y-6"
      >
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paiement réussi !</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Ton paiement a été confirmé. Tes avis ont été créés et sont prêts à être remplis.
          </p>
        </div>

        <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4 text-sm text-sky-700 dark:text-sky-400 text-left space-y-2">
          <p className="font-semibold">Prochaines étapes :</p>
          <p>1️⃣ Va dans "Mes commandes" pour voir tes avis</p>
          <p>2️⃣ Remplis les textes de chaque avis</p>
          <p>3️⃣ Les membres vont rédiger et publier tes avis</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/client/commandes" className="btn-primary w-full">
            <ArrowRight size={16} />
            Voir mes commandes
          </Link>
          <Link to="/client" className="btn-secondary w-full">
            Retour au dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
