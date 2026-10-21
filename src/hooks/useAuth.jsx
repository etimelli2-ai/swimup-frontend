import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // La session vit dans un cookie httpOnly envoyé automatiquement par le
    // navigateur — on ne peut plus savoir à l'avance si l'utilisateur est
    // connecté sans interroger le backend.
    api.get('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  // Fix — écouter l'event swimup:logout de api.js
  useEffect(() => {
    const handleLogout = () => {
      setUser(null)
      setLoading(false)
    }
    window.addEventListener('swimup:logout', handleLogout)
    return () => window.removeEventListener('swimup:logout', handleLogout)
  }, [])

  // Les réponses de login/inscription ne contiennent pas le statut premium ni
  // les réglages d'interface : on recharge le profil complet juste après.
  // On attend aussi la réponse : si le navigateur n'a pas gardé le cookie de
  // session (navigation privée, blocage du suivi intersite sur iPhone...),
  // /auth/me répond 401 et l'utilisateur serait renvoyé sur la page de
  // connexion sans la moindre explication. On le lui dit.
  const ouvrirSession = useCallback(async (utilisateur) => {
    setUser(utilisateur)
    try {
      const r = await api.get('/auth/me')
      setUser(r.data)
    } catch (e) {
      if (e.response?.status === 401) {
        setUser(null)
        const err = new Error('session non conservée')
        err.response = { data: { error: "Connexion réussie, mais ton navigateur n'a pas gardé la session (cookies bloqués ou navigation privée). Essaie avec un autre navigateur, ou autorise les cookies pour swimup.net." } }
        throw err
      }
      // autre erreur (réseau...) : la connexion est valable, le profil se rechargera plus tard
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const r = await api.post('/auth/login', { email, password })
    // Compte protégé par la 2FA : pas encore de session, il faut d'abord
    // valider le code (voir loginAvec2fa). On renvoie tel quel pour que
    // l'écran de login sache afficher l'étape suivante.
    if (r.data?.requires2fa) return r.data
    await ouvrirSession(r.data.user)
    return r.data
  }, [ouvrirSession])

  const loginAvec2fa = useCallback(async (tempToken, code) => {
    const r = await api.post('/auth/2fa/verify-login', { tempToken, code })
    await ouvrirSession(r.data.user)
    return r.data.user
  }, [ouvrirSession])

  const register = useCallback(async (email, password, discord_id, invitation_code, commande_token, parrainage_code) => {
    const r = await api.post('/auth/register', { email, password, discord_id, invitation_code, commande_token, parrainage_code })
    await ouvrirSession(r.data.user)
    return r.data.user
  }, [ouvrirSession])

  // Inscription libre d'un compte client : email + mot de passe, sans lien ni code.
  const registerClient = useCallback(async (email, password, ref, piege) => {
    const r = await api.post('/auth/register-client', { email, password, ...(ref ? { ref } : {}), ...(piege ? { site_web: piege } : {}) })
    await ouvrirSession(r.data.user)
    return r.data.user
  }, [ouvrirSession])

  const logout = useCallback(() => {
    // Le cookie httpOnly ne peut pas être supprimé en JS : il faut demander
    // au backend de le faire via un Set-Cookie expiré.
    api.post('/auth/logout').catch(() => {})
    setUser(null)
  }, [])

  // Fix — updateUser au lieu de setUser exposé
  const updateUser = useCallback((data) => {
    setUser(prev => ({ ...prev, ...data }))
  }, [])

  return (
    <AuthCtx.Provider value={{ user, updateUser, login, loginAvec2fa, register, registerClient, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
