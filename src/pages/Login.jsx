import usePageTitle from '../hooks/usePageTitle'
// ============================================================
// frontend/src/pages/Login.jsx -- NOUVEAU (redesign)
// ============================================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Star, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { springSmooth, springSnappy, springSheet } from '../lib/motion'

export default function Login() {
  usePageTitle('Connexion')

  const navigate = useNavigate()
  const { login, loginAvec2fa } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Étape 2 : demandée uniquement si le compte a la 2FA activée.
  const [tempToken, setTempToken] = useState(null)
  const [code, setCode] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = await login(email, password)
      if (r?.requires2fa) {
        setTempToken(r.tempToken)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit2fa = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginAvec2fa(tempToken, code)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Code invalide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Halo d'ambiance — même grammaire que le hero de /commander, pour que
          l'entrée dans le produit ne tranche pas avec la landing page. */}
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
        {/* Logo */}
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
          <p className="text-[15px] text-slate-500 mt-1">Connecte-toi à ton compte</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl shadow-slate-200/50">
          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={springSheet}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg overflow-hidden"
              >
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {tempToken ? (
            <form onSubmit={handleSubmit2fa} className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck size={18} className="text-sky-500 shrink-0" />
                <p className="text-sm">Entre le code à 6 chiffres de ton appli d'authentification (ou un code de secours).</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Code de vérification</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                  className="input tracking-widest text-center text-lg"
                  placeholder="000000"
                  maxLength={10}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Valider<ArrowRight size={16} /></>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setTempToken(null); setCode(''); setError('') }}
                className="w-full text-center text-sm text-slate-400 hover:text-slate-600"
              >
                Retour
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input"
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
                    className="input pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <Link to="/mot-de-passe-oublie" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
            S'inscrire
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
