import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, AlertCircle, MailCheck } from 'lucide-react'
import api from '../lib/api'
import usePageTitle from '../hooks/usePageTitle'
import AuthShell from '../components/AuthShell'

export default function MotDePasseOublie() {
  usePageTitle('Mot de passe oublié')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [envoye, setEnvoye] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setEnvoye(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible d\'envoyer le lien pour le moment. Réessaie dans un instant.')
    } finally {
      setLoading(false)
    }
  }

  const pied = (
    <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">Retour à la connexion</Link>
  )

  if (envoye) {
    return (
      <AuthShell sousTitre="Vérifie ta boîte mail" pied={pied}>
        <div className="text-center space-y-3">
          <MailCheck size={32} className="text-sky-500 mx-auto" />
          <p className="text-sm text-slate-700">
            Si un compte existe avec <span className="font-medium">{email.trim()}</span>, un lien de
            réinitialisation vient d'être envoyé. Il est valable 1 heure.
          </p>
          <p className="text-xs text-slate-500">
            Rien reçu ? Regarde dans les spams, puis réessaie dans une minute.
          </p>
          <button
            type="button"
            onClick={() => setEnvoye(false)}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            Renvoyer un lien
          </button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell sousTitre="Réinitialise ton mot de passe" pied={pied}>
      {error && (
        <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Entre l'email de ton compte, on t'envoie un lien pour choisir un nouveau mot de passe.
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            className="input"
            placeholder="ton@email.com"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Envoyer le lien<ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </AuthShell>
  )
}
