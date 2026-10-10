import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import api from '../lib/api'
import usePageTitle from '../hooks/usePageTitle'
import AuthShell from '../components/AuthShell'

export default function ReinitialiserMotDePasse() {
  usePageTitle('Nouveau mot de passe')

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fait, setFait] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Le mot de passe doit faire au moins 8 caractères, avec au moins une lettre et un chiffre.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setFait(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de modifier le mot de passe. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthShell sousTitre="Lien invalide">
        <div className="text-center space-y-4">
          <AlertCircle size={32} className="text-red-500 mx-auto" />
          <p className="text-sm text-slate-700">Ce lien est incomplet. Refais une demande pour en recevoir un nouveau.</p>
          <Link to="/mot-de-passe-oublie" className="btn-primary w-full justify-center">Recevoir un nouveau lien</Link>
        </div>
      </AuthShell>
    )
  }

  if (fait) {
    return (
      <AuthShell sousTitre="C'est fait">
        <div className="text-center space-y-4">
          <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
          <p className="text-sm text-slate-700">Mot de passe modifié. Tu peux te connecter.</p>
          <Link to="/login" className="btn-primary w-full justify-center">
            Se connecter<ArrowRight size={16} />
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      sousTitre="Choisis un nouveau mot de passe"
      pied={<Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">Retour à la connexion</Link>}
    >
      {error && (
        <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700">
            <p>{error}</p>
            {/invalide|expiré/i.test(error) && (
              <Link to="/mot-de-passe-oublie" className="font-semibold underline">Recevoir un nouveau lien</Link>
            )}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Nouveau mot de passe</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoFocus
              autoComplete="new-password"
              className="input pr-10"
              placeholder="Min. 8 caractères, lettre + chiffre"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmer le mot de passe</label>
          <input
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className="input"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Changer le mot de passe<ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </AuthShell>
  )
}
