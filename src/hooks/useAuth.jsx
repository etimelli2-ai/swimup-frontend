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

  const login = useCallback(async (email, password) => {
    const r = await api.post('/auth/login', { email, password })
    setUser(r.data.user)
    return r.data.user
  }, [])

  const register = useCallback(async (email, password, discord_id, invitation_code) => {
    const r = await api.post('/auth/register', { email, password, discord_id, invitation_code })
    setUser(r.data.user)
    return r.data.user
  }, [])

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
    <AuthCtx.Provider value={{ user, updateUser, login, register, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
