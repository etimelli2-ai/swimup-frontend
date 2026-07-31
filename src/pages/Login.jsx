import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      await login(email, password)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur de connexion' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-surface-50 dark:bg-surface-950">
      <div className="max-w-sm mx-auto w-full animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-gradient mb-2">SwimUp</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Connecte-toi pour continuer</p>
        </div>

        {msg && (
          <div className={`mb-4 p-4 rounded-xl text-sm font-medium ${
            msg.type === 'error' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handle} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="input pl-12" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type={showPwd ? 'text' : 'password'} placeholder="Mot de passe" value={password}
              onChange={e => setPassword(e.target.value)} className="input pl-12 pr-12" required />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Se connecter <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-aqua-600 dark:text-aqua-400 font-semibold hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}
