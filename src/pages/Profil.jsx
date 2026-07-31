import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  User,
  Mail,
  MessageCircle,
  CreditCard,
  Lock,
  Save,
  Shield,
  Sun,
  Moon,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function Profil() {
  const { user, updateUser } = useAuth()
  const { dark, toggle } = useTheme()
  const [discordId, setDiscordId]         = useState(user?.discord_id || '')
  const [paypalEmail, setPaypalEmail]     = useState(user?.paypal_email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]     = useState('')
  const [saving, setSaving]               = useState(false)

  // Sync form avec user
  useEffect(() => {
    if (user) {
      setDiscordId(user.discord_id || '')
      setPaypalEmail(user.paypal_email || '')
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/profile', {
        discord_id:       discordId || null,
        paypal_email:     paypalEmail || null,
        new_password:     newPassword || null,
        current_password: currentPassword || null,
      })
      updateUser({ discord_id: discordId, paypal_email: paypalEmail })
      toast.success('Profil mis à jour !')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const roleLabel = {
    admin:  { text: 'Administrateur', color: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-400' },
    client: { text: 'Client',         color: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/30 dark:text-sky-400' },
    membre: { text: 'Membre',         color: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-300' },
  }[user?.role] || { text: user?.role, color: 'bg-slate-100 text-slate-600' }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title">Mon profil</h1>

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center">
            <User size={24} className="text-sky-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.email}</h2>
              <span className={`badge ${roleLabel.color}`}>{roleLabel.text}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Membre depuis {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Thème */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card p-5"
      >
        <h2 className="section-title flex items-center gap-2 mb-4">
          {dark ? <Moon size={18} className="text-sky-500" /> : <Sun size={18} className="text-sky-500" />}
          Apparence
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {dark ? 'Mode sombre' : 'Mode clair'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Changer l'apparence de l'application
            </p>
          </div>
          <button
            onClick={toggle}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
              dark ? 'bg-sky-500' : 'bg-slate-200'
            }`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 flex items-center justify-center ${
              dark ? 'left-8' : 'left-1'
            }`}>
              {dark
                ? <Moon size={11} className="text-sky-500" />
                : <Sun size={11} className="text-amber-500" />
              }
            </span>
          </button>
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSave}
        className="card p-5 space-y-5"
      >
        <h2 className="section-title flex items-center gap-2">
          <Shield size={18} className="text-sky-500" />
          Informations
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail size={14} className="text-slate-400" />
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input opacity-60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageCircle size={14} className="text-slate-400" />
              ID Discord
            </label>
            <input
              type="text"
              value={discordId}
              onChange={e => setDiscordId(e.target.value)}
              placeholder="123456789012345678"
              className="input"
            />
            <p className="text-xs text-slate-400 mt-1">Requis pour les communications</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CreditCard size={14} className="text-slate-400" />
              Email PayPal
            </label>
            <input
              type="email"
              value={paypalEmail}
              onChange={e => setPaypalEmail(e.target.value)}
              placeholder="paypal@email.com"
              className="input"
            />
            <p className="text-xs text-slate-400 mt-1">Requis pour les retraits</p>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Lock size={14} className="text-slate-400" />
            Changer le mot de passe
          </h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 6 caractères"
              className="input"
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={16} />
              Enregistrer les modifications
            </>
          )}
        </button>
      </motion.form>
    </div>
  )
}
