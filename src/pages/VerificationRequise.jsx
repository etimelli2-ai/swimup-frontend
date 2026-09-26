import { useState } from 'react'
import { Star, MailWarning, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function VerificationRequise() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [envoi, setEnvoi] = useState(false)

  const renvoyer = async () => {
    setEnvoi(true)
    try {
      const r = await api.post('/auth/resend-verification')
      toast.success(r.data?.message || 'Email envoyé, vérifie ta boîte de réception.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur, réessaie plus tard.')
    }
    setEnvoi(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star size={26} className="text-white fill-white" />
          </div>
          <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight">SwimUp</h1>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
            <MailWarning size={22} className="text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Vérifie ton adresse email</p>
            <p className="text-sm text-slate-500 mt-1">
              On a envoyé un lien de confirmation à <span className="font-medium text-slate-700">{user?.email}</span>.
              Clique dessus pour débloquer ton compte (regarde aussi tes spams).
            </p>
          </div>
          <button onClick={renvoyer} disabled={envoi} className="btn-primary w-full justify-center disabled:opacity-70">
            {envoi ? 'Envoi...' : "Renvoyer l'email"}
          </button>
          <button onClick={handleLogout} className="btn-ghost w-full justify-center text-slate-400">
            <LogOut size={15} /> Se déconnecter
          </button>
        </div>
      </motion.div>
    </div>
  )
}
