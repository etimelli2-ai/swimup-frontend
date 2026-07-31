import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { Search, Users, Loader2, Shield, User } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtrer = () => {
    const q = search.toLowerCase()
    return users.filter(u => (u.email || '').toLowerCase().includes(q))
  }

  const changeRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-aqua-600 animate-spin" />
      </div>
    )
  }

  const filtered = filtrer()

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="section-title flex items-center gap-2">
        <Users className="w-6 h-6 text-aqua-500" /> Utilisateurs
      </h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Rechercher par email..." value={search}
          onChange={e => setSearch(e.target.value)} className="input pl-9" />
      </div>

      <p className="text-xs text-slate-500">{filtered.length} membre(s)</p>

      <div className="space-y-2">
        {filtered.map(u => (
          <div key={u.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <Link to={`/admin/users/${u.id}/detail`} className="font-medium text-slate-900 dark:text-white hover:text-aqua-600 transition-colors">
                {u.email}
              </Link>
              <span className={`badge ${u.role === 'admin' ? 'badge-purple' : u.role === 'client' ? 'badge-blue' : 'badge-gray'}`}>
                {u.role}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
              <span>Solde : {parseFloat(u.solde || 0).toFixed(2)} €</span>
              <span>Avis : {u.nb_avis || 0}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => changeRole(u.id, 'membre')} className="btn-ghost text-xs py-2">
                <User className="w-3 h-3 inline mr-1" /> Membre
              </button>
              <button onClick={() => changeRole(u.id, 'client')} className="btn-ghost text-xs py-2">
                <Shield className="w-3 h-3 inline mr-1" /> Client
              </button>
              <button onClick={() => changeRole(u.id, 'admin')} className="btn-ghost text-xs py-2">
                <Shield className="w-3 h-3 inline mr-1" /> Admin
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
