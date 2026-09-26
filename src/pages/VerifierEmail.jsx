import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Star, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../lib/api'

export default function VerifierEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [statut, setStatut] = useState('chargement') // chargement | succes | erreur
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatut('erreur')
      setMessage('Lien de vérification invalide.')
      return
    }
    api.post('/auth/verify-email', { token })
      .then(r => {
        setStatut('succes')
        setMessage(r.data.message || 'Adresse email vérifiée !')
      })
      .catch(err => {
        setStatut('erreur')
        setMessage(err.response?.data?.error || 'Lien de vérification invalide ou expiré.')
      })
  }, [token])

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
          {statut === 'chargement' && (
            <>
              <Loader2 size={32} className="text-sky-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-500">Vérification en cours...</p>
            </>
          )}
          {statut === 'succes' && (
            <>
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
              <p className="font-semibold text-slate-900">{message}</p>
              <Link to="/dashboard" className="btn-primary w-full justify-center mt-2">
                Aller à mon tableau de bord
              </Link>
            </>
          )}
          {statut === 'erreur' && (
            <>
              <XCircle size={32} className="text-red-500 mx-auto" />
              <p className="font-semibold text-slate-900">{message}</p>
              <p className="text-sm text-slate-500">
                Connecte-toi et redemande un nouvel email depuis ton tableau de bord.
              </p>
              <Link to="/login" className="btn-secondary w-full justify-center mt-2">
                Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
