import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default function Register() {
  const [form, setForm]           = useState({ email: '', password: '', discord_id: '' })
  const [cgu, setCgu]             = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [showCgu, setShowCgu]     = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [invitValid, setInvit]    = useState(null)
  const [checkingInvit, setChecking] = useState(false)
  const { register }              = useAuth()
  const navigate                  = useNavigate()
  const [searchParams]            = useSearchParams()
  const inviteCode                = searchParams.get('invite')

  useEffect(() => {
    if (!inviteCode) return
    setChecking(true)
    api.get(`/auth/invitation/${inviteCode}`)
      .then(r => setInvit(r.data))
      .catch(() => setInvit({ valid: false }))
      .finally(() => setChecking(false))
  }, [inviteCode])

  const submit = async e => {
    e.preventDefault()
    setError('')

    // Fix — validation email côté client
    if (!isValidEmail(form.email)) return setError('Adresse email invalide')
    if (!cgu) return setError('Tu dois accepter les conditions d\'utilisation')
    if (form.password.length < 6) return setError('Mot de passe trop court (6 caractères min)')

    setLoading(true)
    try {
      const user = await register(form.email, form.password, form.discord_id, inviteCode)
      if (user.role === 'client') navigate('/client')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription')
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
        {inviteCode ? (
          <p className="text-brand-200 mt-1 text-center">Tu as été invité comme collaborateur !</p>
        ) : (
          <p className="text-brand-200 mt-1">Crée ton compte gratuitement</p>
        )}
      </div>

      <div className="bg-white rounded-t-3xl mt-8 p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription</h2>

        {inviteCode && (
          <div className="mb-4">
            {checkingInvit ? (
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-500">Vérification du lien...</div>
            ) : invitValid?.valid ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                ✅ Lien valide — tu vas créer un compte <strong>collaborateur</strong>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                ❌ Ce lien est invalide ou déjà utilisé
              </div>
            )}
          </div>
        )}

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
            <input className="input" type="password" placeholder="6 caractères minimum"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              ID Discord <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input className="input" type="text" placeholder="123456789012345678"
              value={form.discord_id} onChange={e => setForm(p => ({ ...p, discord_id: e.target.value }))} />
            <p className="text-xs text-gray-400 mt-1">Paramètres Discord → Avancé → Copier l'ID</p>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" id="cgu" checked={cgu}
                onChange={e => setCgu(e.target.checked)}
                className="mt-1 w-4 h-4 accent-brand-600" />
              <label htmlFor="cgu" className="text-sm text-gray-700">
                J'accepte les{' '}
                <button type="button" onClick={() => setShowCgu(!showCgu)}
                  className="text-brand-600 underline font-medium">
                  conditions d'utilisation
                </button>{' '}
                <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="marketing" checked={marketing}
                onChange={e => setMarketing(e.target.checked)}
                className="mt-1 w-4 h-4 accent-brand-600" />
              <label htmlFor="marketing" className="text-sm text-gray-700">
                J'accepte de recevoir des communications de SwimUp par email{' '}
                <span className="text-gray-400">(optionnel)</span>
              </label>
            </div>
          </div>

          {/* Fix — overflow scroll sur le modal CGU */}
          {showCgu && (
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-2 max-h-48 overflow-y-auto overscroll-contain">
              <p className="font-bold text-gray-800">Conditions d'utilisation — SwimUp</p>
              <p><strong>1. Objet</strong><br />SwimUp est une plateforme permettant à des membres de rédiger des avis Google en échange d'une rémunération.</p>
              <p><strong>2. Inscription</strong><br />L'utilisateur s'engage à fournir des informations exactes. Toute fraude entraîne l'exclusion définitive.</p>
              <p><strong>3. Avis Google</strong><br />Les avis doivent être publiés avec un compte Google en mode NON PUBLIC. Tout avis supprimé entraîne un retrait du solde.</p>
              <p><strong>4. Paiements</strong><br />Les paiements sont effectués sur PayPal après vérification. SwimUp se réserve le droit de refuser tout paiement en cas de fraude.</p>
              <p><strong>5. Données personnelles</strong><br />Tes données sont utilisées uniquement pour le fonctionnement de la plateforme. Elles ne sont pas partagées avec des tiers sans ton consentement.</p>
              <p><strong>6. Résiliation</strong><br />SwimUp se réserve le droit de suspendre ou supprimer tout compte ne respectant pas les présentes conditions.</p>
              <p className="text-gray-400">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          )}

          <button
            className="btn-primary mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
            disabled={loading || (inviteCode && !invitValid?.valid) || !cgu}
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Création...</>
            ) : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-brand-600 font-semibold">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
