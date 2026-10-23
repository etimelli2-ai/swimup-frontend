import { useState, useEffect } from 'react'
import { MailWarning, LogOut, Check, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { LogoMarque } from '../components/Logo'
import { lienMessagerie, prochaineEtape } from '../lib/parcoursClient.mjs'
import { lireOffreSouhaitee } from '../lib/offreSouhaitee'
import { t } from '../lib/i18n'

export default function VerificationRequise() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [envoi, setEnvoi] = useState(false)

  const renvoyer = async () => {
    setEnvoi(true)
    try {
      const r = await api.post('/auth/resend-verification')
      toast.success(r.data?.message || t('Email envoyé, vérifie ta boîte de réception.'))
    } catch (err) {
      toast.error(err.response?.data?.error || t('Erreur, réessaie plus tard.'))
    }
    setEnvoi(false)
  }

  // Le client clique souvent le lien du mail dans un autre onglet ou sur son téléphone : on regarde toutes les 5 s
  // (et au retour sur l'onglet) si l'adresse est confirmée, et on l'emmène alors directement à l'étape suivante.
  const estClient = user?.role === 'client'
  useEffect(() => {
    if (!user) return undefined
    let arret = false
    const verifier = async () => {
      if (arret || document.visibilityState === 'hidden') return
      try {
        const r = await api.get('/auth/me')
        if (r.data?.email_verifie && !arret) {
          arret = true
          updateUser(r.data)
          navigate(r.data.role === 'client' ? prochaineEtape(lireOffreSouhaitee()) : '/', { replace: true })
        }
      } catch { /* réseau coupé : on réessaie au prochain passage */ }
    }
    const minuteur = setInterval(verifier, 5000)
    document.addEventListener('visibilitychange', verifier)
    return () => { arret = true; clearInterval(minuteur); document.removeEventListener('visibilitychange', verifier) }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const messagerie = lienMessagerie(user?.email)

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
          <div className="w-14 h-14 mx-auto mb-4">
            <LogoMarque size={56} titre={t('Logo SwimUp')} />
          </div>
          <h1 className="font-display text-[28px] font-extrabold text-slate-900 tracking-tight">{t('SwimUp')}</h1>
        </div>

        {estClient && (
          <ol className="mb-4 space-y-2 text-sm" aria-label={t('Les 3 étapes')}>
            <li className="flex items-center gap-2.5 text-slate-500">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"><Check size={14} aria-hidden="true" /></span>
              {t('Compte créé')}
            </li>
            <li className="flex items-center gap-2.5 font-semibold text-slate-900" aria-current="step">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 text-xs">2</span>
              {t('Confirme ton adresse email')}
            </li>
            <li className="flex items-center gap-2.5 text-slate-600">
              <span className="w-6 h-6 rounded-full border border-slate-300 text-slate-600 flex items-center justify-center shrink-0 text-xs">3</span>
              {t('Commande ton premier avis, par carte ou PayPal')}
            </li>
          </ol>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
            <MailWarning size={22} className="text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{t('Ouvre l\'email qu\'on vient de t\'envoyer')}</p>
            <p className="text-sm text-slate-600 mt-1">
              {t('Il est parti à')}{' '}<span className="font-medium text-slate-800">{user?.email}</span>{t('. Clique sur le bouton dedans, cette page continue toute seule. Rien reçu au bout d\'une minute ? Regarde tes spams.')}
            </p>
          </div>
          {messagerie && (
            <a href={messagerie.url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center">
              {t('Ouvrir {nom}', { nom: messagerie.nom })}{' '}<ExternalLink size={15} aria-hidden="true" />
            </a>
          )}
          <button onClick={renvoyer} disabled={envoi} className={`${messagerie ? 'btn-secondary' : 'btn-primary'} w-full justify-center disabled:opacity-70`}>
            {envoi ? t('Envoi...') : t('Renvoyer l\'email')}
          </button>
          <button onClick={handleLogout} className="btn-ghost w-full justify-center text-slate-600">
            <LogOut size={15} />{' '}{t('Mauvaise adresse ? Me déconnecter')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
