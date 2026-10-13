import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react'
import Seo from '../components/Seo'
import { useAuth } from '../hooks/useAuth'
import { springSmooth, springSnappy, springSheet } from '../lib/motion'
import toast from 'react-hot-toast'
import { retenirOffreSouhaitee } from '../lib/offreSouhaitee'

// Création d'un compte CLIENT : email + mot de passe, rien d'autre.
// Les comptes membres ont leur propre page (/register), jamais proposée ici.
const ATOUTS = [
  'Ton QR code et ton lien d\'avis Google, prêts à imprimer',
  'Une affiche avec ton nom, en un clic',
  'Des réponses aux avis écrites avec l\'IA',
]

export default function InscriptionClient() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { registerClient } = useAuth()
  const offre = ['premium', 'business'].includes(params.get('offre')) ? params.get('offre') : null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [voir, setVoir] = useState(false)
  const [erreur, setErreur] = useState('')
  const [emailExiste, setEmailExiste] = useState(false)
  const [envoi, setEnvoi] = useState(false)

  const soumettre = async (e) => {
    e.preventDefault()
    setErreur(''); setEmailExiste(false)
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErreur('Le mot de passe doit faire 8 caractères minimum, avec au moins une lettre et un chiffre.')
      return
    }
    setEnvoi(true)
    try {
      await registerClient(email.trim(), password)
      if (offre) retenirOffreSouhaitee(offre)
      toast.success('Compte créé ! Confirme ton adresse avec le mail que tu viens de recevoir.', { duration: 6000 })
      navigate('/client')
    } catch (err) {
      setEmailExiste(err.response?.data?.code === 'EMAIL_DEJA_UTILISE')
      setErreur(err.response?.data?.error || err.response?.data?.errors?.[0]?.message || "L'inscription n'a pas abouti, réessaie.")
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <Seo title="Créer un compte gratuit" description="Crée ton compte gratuit SwimUp : lien et QR code d'avis, affiche à imprimer et aide pour répondre à tes avis Google. Sans carte bancaire." path="/inscription" />
      <div
        className="absolute inset-x-0 top-0 h-[520px] pointer-events-none"
        style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(14,165,233,0.14) 0%, rgba(14,165,233,0) 70%)' }}
      />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={springSmooth} className="relative w-full max-w-sm">
        <div className="text-center mb-7">
          <motion.div initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={springSnappy}
            className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star size={26} className="text-white fill-white" />
          </motion.div>
          <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight">Crée ton compte gratuit</h1>
          <p className="text-[15px] text-slate-500 mt-1">
            {offre ? 'Deux champs, puis tu choisis ton offre.' : 'Sans carte bancaire, en 20 secondes.'}
          </p>
        </div>

        <ul className="mb-5 space-y-2">
          {ATOUTS.map(a => (
            <li key={a} className="flex items-start gap-2 text-[14px] text-slate-600">
              <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> {a}
            </li>
          ))}
        </ul>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl shadow-slate-200/50">
          <AnimatePresence initial={false}>
            {erreur && (
              <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={springSheet}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg overflow-hidden" role="alert">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div className="text-sm text-red-700">
                  <p>{erreur}</p>
                  {emailExiste && (
                    <p className="mt-1">
                      <Link to="/login" className="font-semibold underline">Connecte-toi</Link> ou{' '}
                      <Link to="/mot-de-passe-oublie" className="font-semibold underline">réinitialise ton mot de passe</Link>.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={soumettre} className="space-y-4">
            <div>
              <label htmlFor="ins-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input id="ins-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="toi@commerce.fr" />
            </div>
            <div>
              <label htmlFor="ins-mdp" className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input id="ins-mdp" type={voir ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={password}
                  onChange={e => setPassword(e.target.value)} className="input pr-10" placeholder="8 caractères, une lettre, un chiffre" />
                <button type="button" onClick={() => setVoir(!voir)} aria-label={voir ? 'Cacher le mot de passe' : 'Voir le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {voir ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={envoi} className="btn-primary w-full">
              {envoi ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Créer mon compte <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">Se connecter</Link>
        </p>
      </motion.div>
    </div>
  )
}
