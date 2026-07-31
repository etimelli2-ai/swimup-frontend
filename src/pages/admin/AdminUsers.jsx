import { useState, useEffect } from 'react'
import api from '../../lib/api'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

export default function AdminUsers() {
  const [users, setUsers]           = useState([])
  const [search, setSearch]         = useState('')
  const [filtreRole, setFiltre]     = useState('tous')
  const [detail, setDetail]         = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [loadingAction, setLoadingAction] = useState(null)
  const [msg, setMsg]               = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [ajustSolde, setAjustSolde]   = useState('')
  const [ajustNote, setAjustNote]     = useState('')
  const [tab, setTab]               = useState('infos')

  const load = () => api.get('/admin/users').then(r => setUsers(r.data))
  useEffect(() => { load() }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const openDetail = async (user) => {
    setDetail(user)
    setTab('infos')
    setLoadingDetail(true)
    try {
      const r = await api.get(`/admin/users/${user.id}/detail`)
      setDetailData(r.data)
    } catch { }
    setLoadingDetail(false)
  }

  const changeRole = async (id, role) => {
    setLoadingAction(`role_${role}`)
    try {
      await api.put(`/admin/users/${id}/role`, { role })
      setUsers(u => u.map(x => x.id === id ? { ...x, role } : x))
      if (detailData) setDetailData(d => ({ ...d, user: { ...d.user, role } }))
      setDetail(p => ({ ...p, role }))
      showMsg('success', `Rôle changé en ${role} !`)
    } catch { showMsg('error', 'Erreur') }
    setLoadingAction(null)
  }

  const toggleBan = async (id, banned) => {
    if (!confirm(banned ? 'Débannir ce membre ?' : 'Bannir ce membre ?')) return
    setLoadingAction('ban')
    try {
      await api.put(`/admin/users/${id}/ban`, { banned: !banned })
      setUsers(u => u.map(x => x.id === id ? { ...x, banned: !banned } : x))
      setDetail(p => ({ ...p, banned: !banned }))
      showMsg('success', !banned ? 'Membre banni !' : 'Membre débanni !')
    } catch { showMsg('error', 'Erreur') }
    setLoadingAction(null)
  }

  const resetPassword = async (id) => {
    if (!newPassword || newPassword.length < 6) return showMsg('error', 'Mot de passe trop court')
    if (!confirm('Réinitialiser le mot de passe ?')) return
    setLoadingAction('reset_pwd')
    try {
      await api.put(`/admin/users/${id}/reset-password`, { new_password: newPassword })
      showMsg('success', 'Mot de passe réinitialisé !')
      setNewPassword('')
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLoadingAction(null)
  }

  const ajusterSolde = async (id) => {
    if (!ajustSolde) return showMsg('error', 'Entre un montant')
    setLoadingAction('solde')
    try {
      await api.put(`/admin/users/${id}/solde`, { montant: parseFloat(ajustSolde), note: ajustNote })
      showMsg('success', 'Solde ajusté !')
      setAjustSolde('')
      setAjustNote('')
      load()
      const r = await api.get(`/admin/users/${id}/detail`)
      setDetailData(r.data)
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLoadingAction(null)
  }

  const demanderDiscord = async (id) => {
    setLoadingAction('discord')
    try {
      await api.put(`/admin/users/${id}/demander-discord`)
      showMsg('success', 'Notification envoyée !')
    } catch { showMsg('error', 'Erreur') }
    setLoadingAction(null)
  }

  const roleBadge = r => ({
    admin:  <span className="badge-blue">Admin</span>,
    client: <span className="badge-green">Client</span>,
    membre: <span className="badge-gray">Membre</span>,
  }[r])

  const formatDate = d => d ? new Date(d).toLocaleString('fr-FR') : '—'

  let filtered = users
  if (filtreRole !== 'tous') filtered = filtered.filter(u => u.role === filtreRole)
  if (search) filtered = filtered.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.discord_id || '').includes(search)
  )

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Membres ({users.length})</h2>

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.type === 'success' ? '✅' : '❌'} {msg.text}
        </div>
      )}

      <input className="input" placeholder="🔍 Rechercher email ou Discord..."
        value={search} onChange={e => setSearch(e.target.value)} />

      <div className="flex gap-2">
        {['tous', 'membre', 'client', 'admin'].map(r => (
          <button key={r} onClick={() => setFiltre(r)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filtreRole === r ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
            {r === 'tous' ? 'Tous' : r}
          </button>
        ))}
      </div>

      {/* Modal détail */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-t-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg truncate">{detail.email}</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 text-2xl shrink-0">×</button>
            </div>

            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {['infos', 'avis', 'transactions', 'actions'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${tab === t ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}>
                  {t === 'infos' ? '👤 Infos' : t === 'avis' ? '⭐ Avis' : t === 'transactions' ? '💰 Txn' : '⚡ Actions'}
                </button>
              ))}
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : (
              <>
                {tab === 'infos' && (
                  <div className="space-y-2">
                    {[
                      { label: 'Email', value: detail.email },
                      { label: 'Rôle', value: detail.role },
                      { label: 'Solde', value: `${parseFloat(detail.solde||0).toFixed(2)}€` },
                      { label: 'Discord', value: detail.discord_id || '❌ Manquant' },
                      { label: 'PayPal', value: detail.paypal_email || '—' },
                      { label: 'IP', value: detail.ip_address || '—' },
                      { label: 'Dernière connexion', value: formatDate(detail.last_login) },
                      { label: 'Inscrit le', value: formatDate(detail.created_at) },
                      { label: 'Avis rédigés', value: detail.nb_avis || 0 },
                      { label: 'Avis validés', value: detail.nb_valides || 0 },
                      { label: 'Statut', value: detail.banned ? '🚫 Banni' : '✅ Actif' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between bg-gray-50 rounded-xl px-3 py-2">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-xs font-medium text-gray-900 text-right max-w-[60%] truncate">{String(value)}</span>
                      </div>
                    ))}
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 mb-2">Changer le rôle</p>
                      <div className="flex gap-2">
                        {['membre', 'client', 'admin'].map(r => (
                          <button key={r} onClick={() => changeRole(detail.id, r)}
                            disabled={loadingAction === `role_${r}`}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${
                              detail.role === r ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                            } disabled:opacity-70`}>
                            {loadingAction === `role_${r}` ? <Spinner /> : r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'avis' && (
                  <div className="space-y-2">
                    {!detailData?.avis?.length ? (
                      <p className="text-center text-gray-400 py-6">Aucun avis</p>
                    ) : detailData.avis.map(a => (
                      <div key={a.id} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">{a.nom_societe}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                            a.statut === 'valide' || a.statut === 'paye' ? 'bg-green-100 text-green-700' :
                            a.statut === 'refuse' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{a.statut}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{parseFloat(a.prix).toFixed(2)}€ · {formatDate(a.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'transactions' && (
                  <div className="space-y-2">
                    {!detailData?.transactions?.length ? (
                      <p className="text-center text-gray-400 py-6">Aucune transaction</p>
                    ) : detailData.transactions.map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                        <div>
                          <p className="text-xs font-medium text-gray-700">{t.note || t.type}</p>
                          <p className="text-xs text-gray-400">{formatDate(t.created_at)}</p>
                        </div>
                        <span className={`text-sm font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                          {t.type === 'credit' ? '+' : '-'}{parseFloat(t.montant).toFixed(2)}€
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'actions' && (
                  <div className="space-y-4">
                    {!detail.discord_id && (
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-gray-700">Discord manquant</p>
                        <button onClick={() => demanderDiscord(detail.id)}
                          disabled={loadingAction === 'discord'}
                          className="w-full bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                          {loadingAction === 'discord' ? <><Spinner /> Envoi...</> : '📨 Demander l\'ID Discord'}
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-700">Ajuster le solde</p>
                      <input className="input text-sm" type="number" step="0.01"
                        placeholder="Montant (négatif pour débiter)"
                        value={ajustSolde} onChange={e => setAjustSolde(e.target.value)} />
                      <input className="input text-sm" placeholder="Raison (optionnel)"
                        value={ajustNote} onChange={e => setAjustNote(e.target.value)} />
                      <button onClick={() => ajusterSolde(detail.id)}
                        disabled={loadingAction === 'solde'}
                        className="w-full bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                        {loadingAction === 'solde' ? <><Spinner /> Traitement...</> : '💰 Appliquer l\'ajustement'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-700">Réinitialiser le mot de passe</p>
                      <input className="input text-sm" type="password"
                        placeholder="Nouveau mot de passe (6 car. min)"
                        value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      <button onClick={() => resetPassword(detail.id)}
                        disabled={loadingAction === 'reset_pwd'}
                        className="w-full bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                        {loadingAction === 'reset_pwd' ? <><Spinner /> Traitement...</> : '🔑 Réinitialiser'}
                      </button>
                    </div>

                    <div className="space-y-2 border-t border-gray-100 pt-3">
                      <p className="text-sm font-bold text-gray-700">Suspension du compte</p>
                      <button onClick={() => toggleBan(detail.id, !!detail.banned)}
                        disabled={loadingAction === 'ban'}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white disabled:opacity-70 ${detail.banned ? 'bg-green-500' : 'bg-red-500'}`}>
                        {loadingAction === 'ban' ? <><Spinner /> Traitement...</> : detail.banned ? '✅ Débannir' : '🚫 Bannir'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <button onClick={() => setDetail(null)} className="btn-secondary">Fermer</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(u => (
          <div key={u.id}
            className={`card space-y-1 active:bg-gray-50 cursor-pointer ${u.banned ? 'opacity-50 border border-red-200' : ''}`}
            onClick={() => openDetail(u)}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-900 truncate">{u.email}</p>
                  {u.banned && <span className="text-xs text-red-500 shrink-0">🚫</span>}
                </div>
                <p className="text-xs text-gray-400">
                  Discord: {u.discord_id || '❌'} · {parseFloat(u.solde||0).toFixed(2)}€
                  {u.nb_avis > 0 && ` · ${u.nb_avis} avis`}
                </p>
                {u.last_login && (
                  <p className="text-xs text-gray-300">{new Date(u.last_login).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
              {roleBadge(u.role)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-10 text-gray-400">Aucun membre</div>
        )}
      </div>
    </div>
  )
}
