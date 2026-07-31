import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
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
    localStorage.setItem('token', r.data.token)
    setUser(r.data.user)
    return r.data.user
  }, [])

  const register = useCallback(async (email, password, discord_id, invitation_code) => {
    const r = await api.post('/auth/register', { email, password, discord_id, invitation_code })
    localStorage.setItem('token', r.data.token)
    setUser(r.data.user)
    return r.data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
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
