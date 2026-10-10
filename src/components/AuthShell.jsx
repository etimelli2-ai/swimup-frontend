import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { springSmooth, springSnappy } from '../lib/motion'

// Cadre commun des pages d'authentification (logo, halo, carte blanche).
export default function AuthShell({ sousTitre, children, pied }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[520px] -z-0 pointer-events-none"
        style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(14,165,233,0.14) 0%, rgba(14,165,233,0) 70%)' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={springSmooth}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={springSnappy}
            className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Star size={26} className="text-white fill-white" />
          </motion.div>
          <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight">SwimUp</h1>
          <p className="text-[15px] text-slate-500 mt-1">{sousTitre}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl shadow-slate-200/50">
          {children}
        </div>
        {pied && <p className="text-center text-sm text-slate-500 mt-6">{pied}</p>}
      </motion.div>
    </div>
  )
}
