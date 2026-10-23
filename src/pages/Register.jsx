import usePageTitle from '../hooks/usePageTitle'
// ============================================================
// frontend/src/pages/Register.jsx -- NOUVEAU (redesign)
// ============================================================

import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogoMarque } from '../components/Logo'
import { LiensLegaux } from '../components/PageLegale'
import toast from 'react-hot-toast'
import { springSmooth, springSnappy, springSheet } from '../lib/motion'
import { MentionDonnees } from '../components/PageLegale'
import { t } from '../lib/i18n'

const LIEN_DISCORD = 'https://discord.gg/Dt2rmcHB5u'

export default function Register() {
  usePageTitle(t('Inscription'))

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register } = useAuth()

  const commandeToken = searchParams.get('commande') || null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [discordId, setDiscordId] = useState('')
  const [invitationCode, setInvitationCode] = useState(searchParams.get('invite') || '')
  const [parrainageCode, setParrainageCode] = useState(searchParams.get('parrain') || '')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [emailExiste, setEmailExiste] = useState(false)
  const [loading, setLoading] = useState(false)

  // Compte client via une commande publique déjà payée — on récupère la
  // commande pour verrouiller l'email dessus et vérifier qu'elle est payée.
  const [commande, setCommande] = useState(null)
  const [commandeLoading, setCommandeLoading] = useState(!!commandeToken)
  const [commandeError, setCommandeError] = useState('')

  useEffect(() => {
    if (!commandeToken) return
    api.get(`/public/suivi/${commandeToken}`)
      .then(r => {
        const order = r.data.order
        if (order.statut === 'en_attente' || order.statut === 'annule') {
          setCommandeError(t('Cette commande n\'est pas encore payée.'))
        } else if (order.compte_cree) {
          setCommandeError(t('Un compte a déjà été créé pour cette commande.'))
        } else {
          setCommande(order)
          setEmail(order.email)
        }
      })
      .catch(() => setCommandeError(t('Commande introuvable — vérifie ton lien.')))
      .finally(() => setCommandeLoading(false))
  }, [commandeToken])

  // Les comptes membres exigent un ID Discord ; un compte client (commande payée
  // ou code d'invitation) peut s'en passer.
  const discordRequis = !commande && !invitationCode.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEmailExiste(false)

    if (discordRequis && !/^\d{17,20}$/.test(discordId.trim())) {
      setError(t('L\'ID Discord est obligatoire : 17 à 20 chiffres. Tu ne le trouves pas ? Utilise le lien sous la case.'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('Les mots de passe ne correspondent pas'))
      return
    }
    if (password.length < 8) {
      setError(t('Le mot de passe doit faire au moins 8 caracteres'))
      return
    }

    setLoading(true)
    try {
      await register(email, password, discordId.trim() || null, invitationCode || null, commandeToken && commande ? commandeToken : null, parrainageCode || null)
      toast.success(t('Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse.'), { duration: 6000 })
      navigate('/dashboard')
    } catch (err) {
      setEmailExiste(err.response?.data?.code === 'EMAIL_DEJA_UTILISE')
      setError(err.response?.data?.error || t('Erreur lors de l\'inscription'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Halo d'ambiance — même grammaire que le hero de /commander et Login. */}
      <div
        className="absolute inset-x-0 top-0 h-[520px] -z-0 pointer-events-none"
        style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(14,165,233,0.14) 0%, rgba(14,165,233,0) 70%)' }}
      />
      <motion.main id="contenu"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={springSmooth}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={springSnappy}
            className="w-14 h-14 mx-auto mb-4"
          >
            <LogoMarque size={56} titre={t('Logo SwimUp')} />
          </motion.div>
          <h1 className="font-display text-[28px] font-extrabold text-slate-900 tracking-tight">{t('SwimUp')}</h1>
          <p className="text-[15px] text-slate-500 mt-1">
            {commandeToken ? t('Crée ton compte client') : t('Crée ton compte membre')}
          </p>
        </div>

        {/* Bannière commande publique liée */}
        {commandeToken && commandeLoading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />{' '}{t('Vérification de ta commande...')}
          </div>
        )}
        {commandeToken && !commandeLoading && commandeError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{commandeError}</p>
          </div>
        )}
        {commande && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-4 flex items-start gap-2">
            <Tag size={16} className="text-sky-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-sky-900">{t('Compte lié à ta commande #{id}', { id: commande.id })}</p>
              <p className="text-xs text-sky-700 mt-0.5">
                {t('Email verrouillé sur {email} — tes prochaines commandes passent à 3€/avis au lieu de 4€.', { email: commande.email })}
              </p>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl shadow-slate-200/50">
          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={springSheet}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg overflow-hidden"
              >
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div className="text-sm text-red-700">
                  <p>{error}</p>
                  {emailExiste && (
                    <p className="mt-1">
                      {t('Tu as déjà un compte avec cette adresse :')}{' '}
                      <Link to="/login" className="font-semibold underline">{t('connecte-toi')}</Link>
                      {' '}{t('ou')}{' '}
                      <Link to="/mot-de-passe-oublie" className="font-semibold underline">{t('réinitialise ton mot de passe')}</Link>.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('Email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                readOnly={!!commande}
                className={`input ${commande ? 'bg-slate-50 text-slate-500' : ''}`}
                placeholder="ton@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('Mot de passe')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input pr-10"
                  placeholder="Min. 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('Cacher le mot de passe') : t('Voir le mot de passe')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('Confirmer le mot de passe')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('ID Discord')}{' '}{!discordRequis && <span className="text-slate-500 font-normal">{t('(optionnel)')}</span>}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={discordId}
                onChange={e => setDiscordId(e.target.value.replace(/\D/g, ''))}
                required={discordRequis}
                className="input"
                placeholder="123456789012345678"
              />
              {discordRequis && (
                <details className="mt-2 text-sm text-slate-600">
                  <summary className="cursor-pointer text-sky-600 font-medium">{t('Je ne trouve pas mon ID Discord')}</summary>
                  <div className="mt-2 space-y-3 bg-slate-50 rounded-xl p-3">
                    <p>
                      {t('Le plus simple : rejoins notre Discord, ouvre un ticket et choisis la catégorie « Mon ID Discord ». Le bot t\'envoie ton ID à copier, avec la marche à suivre pour t\'inscrire.')}
                    </p>
                    <a href={LIEN_DISCORD} target="_blank" rel="noreferrer" className="btn-primary w-full justify-center">
                      {t('Ouvrir un ticket sur Discord')}
                    </a>
                    <p className="text-xs text-slate-500">
                      {t('Tu préfères le trouver seul ? Discord → Paramètres → Avancés → active le Mode développeur, puis clic droit sur ton profil → Copier l\'identifiant.')}
                    </p>
                  </div>
                </details>
              )}
            </div>

            {!commandeToken && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('Code d\'invitation')}{' '}<span className="text-slate-500 font-normal">{t('(optionnel)')}</span>
                </label>
                <input
                  type="text"
                  value={invitationCode}
                  onChange={e => setInvitationCode(e.target.value)}
                  className="input"
                  placeholder={t('Code client')}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('Code de parrainage')}{' '}<span className="text-slate-500 font-normal">{t('(optionnel)')}</span>
              </label>
              <input
                type="text"
                value={parrainageCode}
                onChange={e => setParrainageCode(e.target.value)}
                className="input"
                placeholder="Ex: AB12CD"
              />
              {parrainageCode.trim() && (
                <p className="text-xs text-slate-500 mt-1.5">
                  {t('Avec un code de parrainage, tu es payé 0,20 € de moins par avis : cette somme revient à la personne qui t\'a invité.')}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || commandeLoading || (commandeToken && (!!commandeError || !commande))}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t('S\'inscrire')}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
            <MentionDonnees className="mt-4">{t('SwimUp utilise ton email, ton mot de passe, ton identifiant Discord (si tu le donnes) et ton adresse IP pour créer ton compte membre, repérer les comptes en double et te payer.')}</MentionDonnees>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          {t('Deja un compte ?')}{' '}
          <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            {t('Se connecter')}
          </Link>
        </p>
        <LiensLegaux className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-6 text-xs" classe="text-slate-600 hover:underline" />
      </motion.main>
    </div>
  )
}
