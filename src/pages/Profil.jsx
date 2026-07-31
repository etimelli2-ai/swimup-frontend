// ============================================================
// frontend/src/pages/Profil.jsx -- NOUVEAU (redesign)
// ============================================================

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  User,
  Mail,
  MessageCircle,
  CreditCard,
  Lock,
  Save,
  Check,
  Shield
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function Profil() {
  const { user, updateUser } = useAuth()
  const [discordId, setDiscordId] = useState(user?.discord_id || '')
  const [paypalEmail, setPaypalEmail] = useState(user?.paypal_email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/profile', {
        discord_id: discordId || null,
        paypal_email: paypalEmail || null,
        new_password: newPassword || null,
        current_password: currentPassword || null,
      })
      updateUser({ discord_id: discordId, paypal_email: paypalEmail })
      toast.success('Profil mis a jour')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const roleLabel = {
    admin: { text: 'Administrateur', color: 'bg-violet-50 text-violet-700 border-violet-200' },
    client: { text: 'Client', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    membre: { text: 'Membre', color: 'bg-slate-100 text-slate-600 border-slate-200' },
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
          <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center">
            <User size={24} className="text-sky-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{user?.email}</h2>
              <span className={`badge ${roleLabel.color}`}>{roleLabel.text}</span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Membre depuis {new Date(user?.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail size={14} className="text-slate-400" />
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
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

        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Lock size={14} className="text-slate-400" />
            Changer le mot de passe
          </h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe actuel</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 8 caracteres"
              className="input"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full"
        >
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
