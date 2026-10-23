import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Link } from '../components/Lien'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { prochaineEtape } from '../lib/parcoursClient.mjs'
import { lireOffreSouhaitee } from '../lib/offreSouhaitee'
import { LogoMarque } from '../components/Logo'
import { t } from '../lib/i18n'

export default function VerifierEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { user, updateUser, loading } = useAuth()
  const [statut, setStatut] = useState('chargement') // chargement | succes | erreur
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatut('erreur')
      setMessage(t('Lien de vérification invalide.'))
      return
    }
    api.post('/auth/verify-email', { token })
      .then(r => {
        setStatut('succes')
        setMessage(r.data.message || t('Adresse email vérifiée !'))
      })
      .catch(err => {
        setStatut('erreur')
        setMessage(err.response?.data?.error || t('Lien de vérification invalide ou expiré.'))
      })
  }, [token])

  // Le profil peut finir de charger après la confirmation : on le met à jour pour que l'étape suivante ne renvoie pas ici.
  useEffect(() => {
    if (statut === 'succes' && user && user.email_verifie === false) updateUser({ email_verifie: true })
  }, [statut, user, updateUser])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4">
            <LogoMarque size={56} titre={t('Logo SwimUp')} />
          </div>
          <h1 className="font-display text-[28px] font-extrabold text-slate-900 tracking-tight">{t('SwimUp')}</h1>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4">
          {statut === 'chargement' && (
            <>
              <Loader2 size={32} className="text-sky-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-500">{t('Vérification en cours...')}</p>
            </>
          )}
          {statut === 'succes' && (
            <>
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
              <p className="font-semibold text-slate-900">{message}</p>
              {loading ? null : user?.role === 'client' ? (
                <Link to={prochaineEtape(lireOffreSouhaitee())} className="btn-primary w-full justify-center mt-2">
                  {['premium', 'business', 'agence'].includes(lireOffreSouhaitee()) ? t('Choisir mon offre') : t('Commander mon premier avis')}
                </Link>
              ) : (
                <Link to={user ? '/dashboard' : '/login'} className="btn-primary w-full justify-center mt-2">
                  {user ? t('Aller à mon tableau de bord') : t('Me connecter')}
                </Link>
              )}
            </>
          )}
          {statut === 'erreur' && (
            <>
              <XCircle size={32} className="text-red-500 mx-auto" />
              <p className="font-semibold text-slate-900">{message}</p>
              <p className="text-sm text-slate-500">
                {t('Connecte-toi et redemande un nouvel email depuis ton tableau de bord.')}
              </p>
              <Link to="/login" className="btn-secondary w-full justify-center mt-2">
                {t('Retour à la connexion')}
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
