import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'client') navigate('/client')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 to-brand-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-0">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-4">
          <span className="text-brand-600 font-extrabold text-3xl">S</span>
        </div>
        <h1 className="text-white text-3xl font-extrabold">SwimUp</h1>
        <p className="text-brand-200 mt-1 text-center">Gagne de l'argent facilement</p>
      </div>

      <div className="bg-white rounded-t-3xl mt-8 p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Connexion</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
            <input className="input" type="email" placeholder="ton@email.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Mot de passe</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <button className="btn-primary mt-2" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-brand-600 font-semibold">Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}
