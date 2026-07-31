import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

export default function Profil() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    discord_id:       '',
    paypal_email:     '',
    current_password: '',
    new_password:     '',
  })
  const [msg, setMsg]           = useState(null)
  const [saving, setSaving]     = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Fix — synchroniser form avec user quand user change
  useEffect(() => {
    if (user) {
      setForm(p => ({
        ...p,
        discord_id:   user.discord_id || '',
        paypal_email: user.paypal_email || '',
      }))
    }
  }, [user])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/auth/profile', form)
      const r = await api.get('/auth/me')
      // Fix — utiliser updateUser au lieu de setUser
      updateUser(r.data)
      showMsg('success', '✅ Profil mis à jour !')
      setForm(p => ({ ...p, current_password: '', new_password: '' }))
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    setLoggingOut(true)
    logout()
    navigate('/login')
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Mon profil</h2>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center">
            <span className="text-brand-700 font-bold text-xl">{user?.email?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">{user?.email}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              user?.role === 'admin'  ? 'bg-purple-100 text-purple-700' :
              user?.role === 'client' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {user?.role === 'admin' ? '⚡ Admin' : user?.role === 'client' ? '🏢 Client' : '⭐ Membre'}
            </span>
          </div>
        </div>

        {msg && (
          <div className={`rounded-xl p-3 text-sm mb-4 font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {msg.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">ID Discord</label>
            <input className="input" placeholder="123456789012345678"
              value={form.discord_id} onChange={e => setForm(p => ({ ...p, discord_id: e.target.value }))} />
            {!user?.discord_id && (
              <p className="text-xs text-orange-500 mt-1">⚠️ ID Discord non renseigné</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email PayPal</label>
            <input className="input" type="email" placeholder="ton@paypal.com"
              value={form.paypal_email} onChange={e => setForm(p => ({ ...p, paypal_email: e.target.value }))} />
            {!user?.paypal_email && (
              <p className="text-xs text-orange-500 mt-1">⚠️ Adresse PayPal requise pour les retraits</p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Changer le mot de passe</p>
            <div className="space-y-3">
              <input className="input" type="password" placeholder="Mot de passe actuel"
                value={form.current_password} onChange={e => setForm(p => ({ ...p, current_password: e.target.value }))} />
              <input className="input" type="password" placeholder="Nouveau mot de passe (6 car. min)"
                value={form.new_password} onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))} />
            </div>
          </div>

          <button
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
            onClick={save}
            disabled={saving}
          >
            {saving ? <><Spinner /> Enregistrement...</> : 'Enregistrer'}
          </button>
        </div>
      </div>

      <button
        className="btn-danger flex items-center justify-center gap-2 disabled:opacity-70"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? <><Spinner /> Déconnexion...</> : 'Se déconnecter'}
      </button>
    </div>
  )
}
