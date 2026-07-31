import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, FileText, X } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    email: '', password: '', discord_id: '', invitation_code: searchParams.get('invite') || '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showCGU, setShowCGU] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      await register(form)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur inscription' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-surface-50 dark:bg-surface-950">
      <div className="max-w-sm mx-auto w-full animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-gradient mb-2">SwimUp</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Crée ton compte</p>
        </div>

        {msg && (
          <div className="mb-4 p-4 rounded-xl text-sm font-medium bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
            {msg.text}
          </div>
        )}

        <form onSubmit={handle} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="email" placeholder="Email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} className="input pl-12" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type={showPwd ? 'text' : 'password'} placeholder="Mot de passe (min 6)" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} className="input pl-12 pr-12" required minLength={6} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="ID Discord (optionnel)" value={form.discord_id}
              onChange={e => setForm({...form, discord_id: e.target.value})} className="input pl-12" />
          </div>
          {form.invitation_code && (
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Code d'invitation" value={form.invitation_code}
                onChange={e => setForm({...form, invitation_code: e.target.value})} className="input pl-12" />
            </div>
          )}

          <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <input type="checkbox" required className="mt-0.5 rounded border-slate-300" />
            <span>J'accepte les{' '}
              <button type="button" onClick={() => setShowCGU(true)} className="text-aqua-600 dark:text-aqua-400 underline">CGU</button>
            </span>
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>S'inscrire <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-aqua-600 dark:text-aqua-400 font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>

      {showCGU && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowCGU(false)}>
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Conditions d'utilisation</h3>
              <button onClick={() => setShowCGU(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
              <p>En utilisant SwimUp, tu acceptes de respecter les règles suivantes...</p>
              <p>Les avis doivent être réels et conformes aux CGU de Google...</p>
              <p>Le non-respect peut entraîner la suspension du compte...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
