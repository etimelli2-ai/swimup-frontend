// ============================================================
// frontend/src/pages/Register.jsx -- NOUVEAU (redesign)
// ============================================================

import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'
import { Star, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register } = useAuth()

  const commandeToken = searchParams.get('commande') || null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [discordId, setDiscordId] = useState('')
  const [invitationCode, setInvitationCode] = useState(searchParams.get('invite') || '')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Compte client via une commande publique déjà payée — on récupère la
  // commande pour verrouiller l'email dessus et vérifier qu'elle est payée.
  const [commande, setCommande] = useState(null)
  const [commandeLoading, setCommandeLoading] = useState(!!commandeToken)
  const [commandeError, setCommandeError] = useState('')

  useEffect(() => {
    if (!commandeToken) return
    api.get(`/public/suivi/${commandeToken}`)
      .then(r => {
        const order = r.data.order
        if (order.statut === 'en_attente' || order.statut === 'annule') {
          setCommandeError("Cette commande n'est pas encore payée.")
        } else if (order.compte_cree) {
          setCommandeError('Un compte a déjà été créé pour cette commande.')
        } else {
          setCommande(order)
          setEmail(order.email)
        }
      })
      .catch(() => setCommandeError('Commande introuvable — vérifie ton lien.'))
      .finally(() => setCommandeLoading(false))
  }, [commandeToken])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caracteres')
      return
    }

    setLoading(true)
    try {
      await register(email, password, discordId || null, invitationCode || null, commandeToken && commande ? commandeToken : null)
      toast.success('Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse.', { duration: 6000 })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star size={26} className="text-white fill-white" />
          </div>
          <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight">SwimUp</h1>
          <p className="text-[15px] text-slate-500 mt-1">
            {commandeToken ? 'Crée ton compte client' : 'Crée ton compte'}
          </p>
        </div>

        {/* Bannière commande publique liée */}
        {commandeToken && commandeLoading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Vérification de ta commande...
          </div>
        )}
        {commandeToken && !commandeLoading && commandeError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{commandeError}</p>
          </div>
        )}
        {commande && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-4 flex items-start gap-2">
            <Tag size={16} className="text-sky-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-sky-900">Compte lié à ta commande #{commande.id}</p>
              <p className="text-xs text-sky-700 mt-0.5">
                Email verrouillé sur {commande.email} — tes prochaines commandes passent à 3€/avis au lieu de 4€.
              </p>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4"
            >
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                readOnly={!!commande}
                className={`input ${commande ? 'bg-slate-50 text-slate-500' : ''}`}
                placeholder="ton@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input pr-10"
                  placeholder="Min. 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                ID Discord <span className="text-slate-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={discordId}
                onChange={e => setDiscordId(e.target.value)}
                className="input"
                placeholder="123456789012345678"
              />
            </div>

            {!commandeToken && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Code d'invitation <span className="text-slate-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={invitationCode}
                  onChange={e => setInvitationCode(e.target.value)}
                  className="input"
                  placeholder="Code client"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || commandeLoading || (commandeToken && (!!commandeError || !commande))}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  S'inscrire
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Deja un compte ?{' '}
          <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
