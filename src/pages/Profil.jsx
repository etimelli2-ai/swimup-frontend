import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import {
  User, Lock, Eye, EyeOff, Save, CheckCircle2, Loader2,
  MessageCircle, CreditCard
} from 'lucide-react'

export default function Profil() {
  const { user } = useAuth()
  const [form, setForm] = useState({ discord_id: '', paypal_email: '', current_password: '', new_password: '' })
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        discord_id: user.discord_id || '',
        paypal_email: user.paypal_email || '',
      }))
    }
  }, [user])

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      await api.put('/auth/profile', form)
      setMsg({ type: 'success', text: 'Profil mis à jour !' })
      setForm(prev => ({ ...prev, current_password: '', new_password: '' }))
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="section-title">Profil</h1>

      <div className="card text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aqua-500 to-teal-400 flex items-center justify-center mx-auto mb-3 shadow-glow">
          <User className="w-8 h-8 text-white" />
        </div>
        <p className="font-display font-semibold text-slate-900 dark:text-white">{user?.email}</p>
        <p className="text-xs text-slate-500 capitalize mt-1">{user?.role}</p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          msg.type === 'error'
            ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
        }`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={save} className="space-y-4">
        <div className="card space-y-4">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-aqua-500" /> Infos
          </h3>
          <div className="relative">
            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="ID Discord" value={form.discord_id}
              onChange={e => setForm({...form, discord_id: e.target.value})} className="input pl-12" />
          </div>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="email" placeholder="Email PayPal" value={form.paypal_email}
              onChange={e => setForm({...form, paypal_email: e.target.value})} className="input pl-12" />
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-aqua-500" /> Mot de passe
          </h3>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="password" placeholder="Mot de passe actuel" value={form.current_password}
              onChange={e => setForm({...form, current_password: e.target.value})} className="input pl-12" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type={showPwd ? 'text' : 'password'} placeholder="Nouveau mot de passe" value={form.new_password}
              onChange={e => setForm({...form, new_password: e.target.value})} className="input pl-12 pr-12" />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <><Save className="w-4 h-4" /> Enregistrer</>
          )}
        </button>
      </form>
    </div>
  )
}
