import { useState, useEffect } from 'react'
import api from '../../lib/api'
import {
  Search, X, User, Star, Wallet, Zap, Mail, MailWarning, MessageCircle,
  CreditCard, MapPin, Clock, CalendarPlus, FileText, CheckCircle2,
  ShieldCheck, ShieldOff, KeyRound, Ban, Undo2, Send, CheckCircle,
  XCircle, AlertCircle,
} from 'lucide-react'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

const TABS = [
  { v: 'infos',        l: 'Infos',        icon: User },
  { v: 'avis',         l: 'Avis',         icon: Star },
  { v: 'transactions', l: 'Txn',          icon: Wallet },
  { v: 'actions',      l: 'Actions',      icon: Zap },
]

const AVIS_STATUT_BADGE = {
  valide: 'badge-green',
  paye:   'badge-green',
  refuse: 'badge-red',
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

  const renvoyerVerification = async (id) => {
    setLoadingAction('verif')
    try {
      const r = await api.put(`/admin/users/${id}/renvoyer-verification`)
      showMsg('success', r.data?.deja_verifie ? 'Ce membre a déjà vérifié son email.' : 'Email de vérification renvoyé !')
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
    setLoadingAction(null)
  }

  const renvoyerVerificationTous = async () => {
    const nbNonVerifies = users.filter(u => !u.email_verifie && u.role !== 'admin').length
    if (!nbNonVerifies) return showMsg('error', 'Tout le monde a déjà vérifié son email.')
    if (!confirm(`Envoyer l'email de vérification à ${nbNonVerifies} membre(s) non vérifié(s) ?`)) return
    setLoadingAction('verif_tous')
    try {
      const r = await api.post('/admin/users/renvoyer-verification-tous')
      showMsg('success', `Envoyé à ${r.data.envoyes}/${r.data.total} membre(s)${r.data.echecs ? ` (${r.data.echecs} échec(s))` : ''}.`)
    } catch (e) { showMsg('error', e.response?.data?.error || 'Erreur') }
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

  const nbNonVerifies = users.filter(u => !u.email_verifie && u.role !== 'admin').length

  const closeDetail = () => { setDetail(null); setDetailData(null) }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <h2 className="page-title">Membres ({users.length})</h2>

      {msg && (
        <div className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium border ${
          msg.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
            : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        }`}>
          {msg.type === 'success' ? <CheckCircle size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
          {msg.text}
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10" placeholder="Rechercher email ou Discord..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-1.5">
        {['tous', 'membre', 'client', 'admin'].map(r => (
          <button key={r} onClick={() => setFiltre(r)}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium capitalize transition-all active:scale-95 ${
              filtreRole === r
                ? 'bg-sky-500 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}>
            {r === 'tous' ? 'Tous' : r}
          </button>
        ))}
      </div>

      <button onClick={renvoyerVerificationTous}
        disabled={loadingAction === 'verif_tous'}
        className="w-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 py-2 rounded-full text-xs font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
        {loadingAction === 'verif_tous'
          ? <><Spinner /> Envoi en cours...</>
          : <><Send size={13} /> Renvoyer la vérification à tous les non-vérifiés ({nbNonVerifies})</>}
      </button>

      {/* Modal détail */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={closeDetail}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="section-title truncate">{detail.email}</h3>
              <button onClick={closeDetail} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0">
                <X size={22} />
              </button>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 gap-1">
              {TABS.map(({ v, l, icon: Icon }) => (
                <button key={v} onClick={() => setTab(v)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    tab === v
                      ? 'bg-white dark:bg-slate-700 shadow text-sky-700 dark:text-sky-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                  <Icon size={13} /> {l}
                </button>
              ))}
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : (
              <>
                {tab === 'infos' && (
                  <div className="space-y-2">
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Mail size={13} /> Email</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 text-right max-w-[60%] truncate">{detail.email}</span>
                    </div>
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><User size={13} /> Rôle</span>
                      {roleBadge(detail.role)}
                    </div>
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Wallet size={13} /> Solde</span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{parseFloat(detail.solde || 0).toFixed(2)}€</span>
                    </div>
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><ShieldCheck size={13} /> Email vérifié</span>
                      {detail.email_verifie
                        ? <span className="badge-green"><CheckCircle2 size={11} /> Oui</span>
                        : <span className="badge-amber"><MailWarning size={11} /> Non</span>}
                    </div>
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><MessageCircle size={13} /> Discord</span>
                      {detail.discord_id
                        ? <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{detail.discord_id}</span>
                        : <span className="badge-red"><XCircle size={11} /> Manquant</span>}
                    </div>
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><CreditCard size={13} /> PayPal</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 text-right max-w-[60%] truncate">{detail.paypal_email || '—'}</span>
                    </div>
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><MapPin size={13} /> IP</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{detail.ip_address || '—'}</span>
                    </div>
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Clock size={13} /> Dernière connexion</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{formatDate(detail.last_login)}</span>
                    </div>
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><CalendarPlus size={13} /> Inscrit le</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{formatDate(detail.created_at)}</span>
                    </div>
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><FileText size={13} /> Avis rédigés</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{detail.nb_avis || 0}</span>
                    </div>
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><CheckCircle2 size={13} /> Avis validés</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{detail.nb_valides || 0}</span>
                    </div>
                    <div className="card-flat flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><ShieldCheck size={13} /> Statut</span>
                      {detail.banned
                        ? <span className="badge-red"><Ban size={11} /> Banni</span>
                        : <span className="badge-green"><CheckCircle2 size={11} /> Actif</span>}
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Changer le rôle</p>
                      <div className="flex gap-2">
                        {['membre', 'client', 'admin'].map(r => (
                          <button key={r} onClick={() => changeRole(detail.id, r)}
                            disabled={loadingAction === `role_${r}`}
                            className={`flex-1 py-2 rounded-full text-xs font-medium capitalize flex items-center justify-center gap-1 active:scale-95 transition-all ${
                              detail.role === r
                                ? 'bg-sky-500 text-white'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
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
                      <p className="text-center text-slate-400 py-6 text-sm">Aucun avis</p>
                    ) : detailData.avis.map(a => (
                      <div key={a.id} className="card-flat">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{a.nom_societe}</p>
                          <span className={`shrink-0 ${AVIS_STATUT_BADGE[a.statut] || 'badge-amber'}`}>{a.statut}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{parseFloat(a.prix).toFixed(2)}€ · {formatDate(a.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'transactions' && (
                  <div className="space-y-2">
                    {!detailData?.transactions?.length ? (
                      <p className="text-center text-slate-400 py-6 text-sm">Aucune transaction</p>
                    ) : detailData.transactions.map(t => (
                      <div key={t.id} className="card-flat flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{t.note || t.type}</p>
                          <p className="text-xs text-slate-400">{formatDate(t.created_at)}</p>
                        </div>
                        <span className={`text-sm font-semibold shrink-0 ${t.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                          {t.type === 'credit' ? '+' : '-'}{parseFloat(t.montant).toFixed(2)}€
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'actions' && (
                  <div className="space-y-4">
                    {!detail.email_verifie && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <MailWarning size={14} className="text-amber-500" /> Email non vérifié
                        </p>
                        <button onClick={() => renvoyerVerification(detail.id)}
                          disabled={loadingAction === 'verif'}
                          className="w-full bg-amber-500 text-white py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
                          {loadingAction === 'verif' ? <><Spinner /> Envoi...</> : <><Send size={15} /> Renvoyer l'email de vérification</>}
                        </button>
                      </div>
                    )}

                    {!detail.discord_id && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <MessageCircle size={14} className="text-indigo-500" /> Discord manquant
                        </p>
                        <button onClick={() => demanderDiscord(detail.id)}
                          disabled={loadingAction === 'discord'}
                          className="w-full bg-indigo-500 text-white py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
                          {loadingAction === 'discord' ? <><Spinner /> Envoi...</> : "Demander l'ID Discord"}
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Wallet size={14} className="text-sky-500" /> Ajuster le solde
                      </p>
                      <input className="input text-sm" type="number" step="0.01"
                        placeholder="Montant (négatif pour débiter)"
                        value={ajustSolde} onChange={e => setAjustSolde(e.target.value)} />
                      <input className="input text-sm" placeholder="Raison (optionnel)"
                        value={ajustNote} onChange={e => setAjustNote(e.target.value)} />
                      <button onClick={() => ajusterSolde(detail.id)}
                        disabled={loadingAction === 'solde'}
                        className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
                        {loadingAction === 'solde' ? <><Spinner /> Traitement...</> : 'Appliquer l\'ajustement'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <KeyRound size={14} className="text-amber-500" /> Réinitialiser le mot de passe
                      </p>
                      <input className="input text-sm" type="password"
                        placeholder="Nouveau mot de passe (6 car. min)"
                        value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      <button onClick={() => resetPassword(detail.id)}
                        disabled={loadingAction === 'reset_pwd'}
                        className="w-full bg-amber-500 text-white py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
                        {loadingAction === 'reset_pwd' ? <><Spinner /> Traitement...</> : 'Réinitialiser'}
                      </button>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ShieldOff size={14} className="text-red-500" /> Suspension du compte
                      </p>
                      <button onClick={() => toggleBan(detail.id, !!detail.banned)}
                        disabled={loadingAction === 'ban'}
                        className={`w-full py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 text-white active:scale-95 transition-all disabled:opacity-70 ${detail.banned ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {loadingAction === 'ban'
                          ? <><Spinner /> Traitement...</>
                          : detail.banned ? <><Undo2 size={15} /> Débannir</> : <><Ban size={15} /> Bannir</>}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <button onClick={closeDetail} className="btn-secondary w-full justify-center">Fermer</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(u => (
          <div key={u.id}
            className={`card space-y-1 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
              u.banned ? 'opacity-60 border border-red-200 dark:border-red-900/50' : ''
            }`}
            onClick={() => openDetail(u)}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{u.email}</p>
                  {u.banned && <Ban size={13} className="text-red-500 shrink-0" />}
                  {!u.email_verifie && u.role !== 'admin' && (
                    <MailWarning size={13} className="text-amber-500 shrink-0" title="Email non vérifié" />
                  )}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MessageCircle size={11} className="shrink-0" /> {u.discord_id || 'Aucun'} · {parseFloat(u.solde || 0).toFixed(2)}€
                  {u.nb_avis > 0 && ` · ${u.nb_avis} avis`}
                </p>
                {u.last_login && (
                  <p className="text-xs text-slate-300 dark:text-slate-600">{new Date(u.last_login).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
              {roleBadge(u.role)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-10 text-slate-400 flex flex-col items-center gap-2">
            <User size={28} className="text-slate-300" />
            Aucun membre
          </div>
        )}
      </div>
    </div>
  )
}
