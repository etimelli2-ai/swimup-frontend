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
  ShieldCheck,
  ShieldOff,
  Sun,
  Moon,
  Copy,
  Check,
} from 'lucide-react'
import { motion } from 'framer-motion'

function Deux2FA() {
  const { user, updateUser } = useAuth()
  const [etape, setEtape] = useState('repos') // repos | setup | confirmer | codes
  const [qrCode, setQrCode] = useState(null)
  const [secret, setSecret] = useState(null)
  const [code, setCode] = useState('')
  const [codesSecours, setCodesSecours] = useState(null)
  const [copie, setCopie] = useState(false)
  const [loading, setLoading] = useState(false)

  // Désactivation
  const [showDesactiver, setShowDesactiver] = useState(false)
  const [mdpDesactiver, setMdpDesactiver] = useState('')
  const [codeDesactiver, setCodeDesactiver] = useState('')

  const lancerSetup = async () => {
    setLoading(true)
    try {
      const r = await api.post('/auth/2fa/setup')
      setQrCode(r.data.qrCode)
      setSecret(r.data.secret)
      setEtape('setup')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    }
    setLoading(false)
  }

  const confirmerActivation = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await api.post('/auth/2fa/activer', { code })
      setCodesSecours(r.data.codes_secours)
      setEtape('codes')
      updateUser({ totp_enabled: true })
      setCode('')
      toast.success('2FA activée !')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Code invalide')
    }
    setLoading(false)
  }

  const desactiver = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/2fa/desactiver', { password: mdpDesactiver, code: codeDesactiver })
      updateUser({ totp_enabled: false })
      setShowDesactiver(false)
      setMdpDesactiver('')
      setCodeDesactiver('')
      toast.success('2FA désactivée')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    }
    setLoading(false)
  }

  const copierSecret = () => {
    navigator.clipboard?.writeText(secret)
    setCopie(true)
    setTimeout(() => setCopie(false), 1500)
  }

  const termine = () => {
    setEtape('repos')
    setQrCode(null)
    setSecret(null)
    setCodesSecours(null)
  }

  if (user?.totp_enabled) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-emerald-600">
          <ShieldCheck size={18} />
          <p className="text-sm font-medium">La double authentification est activée sur ton compte.</p>
        </div>

        {!showDesactiver ? (
          <button onClick={() => setShowDesactiver(true)} className="btn-secondary text-red-600">
            <ShieldOff size={16} /> Désactiver la 2FA
          </button>
        ) : (
          <form onSubmit={desactiver} className="space-y-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
            <p className="text-sm text-red-700 dark:text-red-400">Confirme avec ton mot de passe et un code de ton appli.</p>
            <input type="password" placeholder="Mot de passe" value={mdpDesactiver}
              onChange={e => setMdpDesactiver(e.target.value)} required className="input" />
            <input type="text" inputMode="numeric" placeholder="Code à 6 chiffres" value={codeDesactiver}
              onChange={e => setCodeDesactiver(e.target.value)} required maxLength={6} className="input" />
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="btn-danger flex-1">
                {loading ? '...' : 'Confirmer la désactivation'}
              </button>
              <button type="button" onClick={() => setShowDesactiver(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        )}
      </div>
    )
  }

  if (etape === 'repos') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <ShieldOff size={18} />
          <p className="text-sm">La double authentification n'est pas activée.</p>
        </div>
        <button onClick={lancerSetup} disabled={loading} className="btn-primary">
          {loading ? '...' : <><Shield size={16} /> Activer la 2FA</>}
        </button>
      </div>
    )
  }

  if (etape === 'setup') {
    return (
      <form onSubmit={confirmerActivation} className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Scanne ce QR code avec Google Authenticator, Authy ou une autre appli TOTP, puis entre le code généré.
        </p>
        <div className="flex justify-center">
          <img src={qrCode} alt="QR code 2FA" className="w-44 h-44 rounded-lg border border-slate-200 dark:border-slate-700" />
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>Ou entre la clé manuellement : <code className="font-mono">{secret}</code></span>
          <button type="button" onClick={copierSecret} className="text-sky-500">
            {copie ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <input
          type="text" inputMode="numeric" autoFocus placeholder="000000"
          value={code} onChange={e => setCode(e.target.value)} required maxLength={6}
          className="input text-center text-lg tracking-widest"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? '...' : 'Confirmer et activer'}
          </button>
          <button type="button" onClick={termine} className="btn-secondary">Annuler</button>
        </div>
      </form>
    )
  }

  if (etape === 'codes') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-emerald-600">
          <ShieldCheck size={18} />
          <p className="text-sm font-medium">2FA activée !</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
            Garde ces codes de secours en lieu sûr
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-500">
            Chacun ne peut être utilisé qu'une fois si tu perds l'accès à ton appli d'authentification. Ils ne seront plus jamais affichés.
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-lg p-3">
            {codesSecours.map(c => <span key={c}>{c}</span>)}
          </div>
        </div>
        <button onClick={termine} className="btn-primary w-full">J'ai noté mes codes</button>
      </div>
    )
  }

  return null
}

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

      {/* Double authentification */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card p-5"
      >
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Shield size={18} className="text-sky-500" />
          Double authentification (2FA)
        </h2>
        <Deux2FA />
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
