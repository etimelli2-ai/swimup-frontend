import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Users, Crown, Mail, Trash2, FileDown, LogOut, Check, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { choisirCompte } from '../../lib/api'

const erreurApi = (e, defaut = 'Une erreur est survenue, réessaie.') => e.response?.data?.error || defaut
const dateFr = (s) => s ? new Date(String(s).replace(' ', 'T') + 'Z').toLocaleDateString('fr-FR') : '—'
const note1 = (n) => (n === null || n === undefined ? '—' : Number(n).toFixed(1).replace('.', ','))
const ROLES = { editeur: 'Éditeur', lecteur: 'Lecteur' }
const DESC_ROLES = {
  editeur: 'Utilise les outils : demandes d\'avis, réponses, campagnes, réglages.',
  lecteur: 'Consulte seulement : aucune modification possible.',
}

export default function ClientEquipe() {
  const [onglet, setOnglet] = useState('equipe')
  const [params] = useSearchParams()
  const token = params.get('invitation')

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Équipe et établissements</h1>
        <p className="text-muted mt-1">Donne accès à tes outils d'avis à tes collaborateurs, et compare tes établissements.</p>
      </div>

      {token && <Invitation token={token} />}

      <div className="flex gap-1" role="tablist">
        {[['equipe', 'Équipe'], ['comparaison', 'Comparaison']].map(([v, l]) => (
          <button key={v} role="tab" aria-selected={onglet === v} onClick={() => setOnglet(v)}
            className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${onglet === v ? 'text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            style={onglet === v ? { backgroundColor: 'var(--accent)' } : undefined}>{l}</button>
        ))}
      </div>

      {onglet === 'equipe' ? <Equipe /> : <Comparaison />}
    </div>
  )
}

// ---------- Invitation reçue par email ----------

function Invitation({ token }) {
  const [info, setInfo] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [occupe, setOccupe] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/client/equipe/invitation/apercu', { params: { token } })
      .then(r => setInfo(r.data)).catch(e => setErreur(erreurApi(e, 'Invitation introuvable ou expirée.')))
  }, [token])

  const accepter = async () => {
    setOccupe(true)
    try {
      const r = await api.post('/client/equipe/invitation/accepter', { token })
      toast.success(`Accès ajouté : ${r.data.nom_commerce}`)
      choisirCompte(r.data.client_id)
      navigate('/client/outils', { replace: true })
      window.location.reload()
    } catch (e) { toast.error(erreurApi(e)); setOccupe(false) }
  }

  if (erreur) return <div className="card text-sm text-red-600">{erreur}</div>
  if (!info) return null
  return (
    <div className="card space-y-3 border-2" style={{ borderColor: 'var(--accent)' }}>
      <h2 className="section-title">Invitation de {info.nom_commerce}</h2>
      <p className="text-sm">Tu es invité(e) en tant que <strong>{ROLES[info.role].toLowerCase()}</strong> : {DESC_ROLES[info.role].toLowerCase()} Tu n'auras accès ni à l'abonnement, ni aux paiements, ni aux commandes.</p>
      {!info.pour_cette_adresse && <p className="text-sm text-amber-700 dark:text-amber-300">Cette invitation a été envoyée à une autre adresse que celle de ton compte actuel : tu ne pourras pas l'accepter d'ici. Connecte-toi avec le compte de la bonne adresse.</p>}
      <button className="btn-primary" onClick={accepter} disabled={occupe || !info.pour_cette_adresse}><Check size={15} /> Accepter l'invitation</button>
    </div>
  )
}

// ---------- Équipe ----------

function Equipe() {
  const [d, setD] = useState(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editeur')
  const [occupe, setOccupe] = useState(false)

  const charger = useCallback(() => { api.get('/client/equipe').then(r => setD(r.data)).catch(() => toast.error('Chargement impossible')) }, [])
  useEffect(() => { charger() }, [charger])

  const agir = async (fn, ok) => {
    setOccupe(true)
    try { await fn(); if (ok) toast.success(ok); charger() }
    catch (e) { toast.error(erreurApi(e)) }
    setOccupe(false)
  }

  const inviter = (e) => {
    e.preventDefault()
    agir(async () => { await api.post('/client/equipe/invitations', { email, role }); setEmail('') }, 'Invitation envoyée')
  }

  if (!d) return <div className="card animate-pulse h-32" />
  const plein = d.acces.length + d.invitations.length >= d.limite

  return (
    <div className="space-y-5">
      <div className="card space-y-4">
        <div>
          <h2 className="section-title flex items-center gap-2"><Users size={17} /> Mon équipe</h2>
          <p className="text-sm text-muted mt-1">Chaque personne garde son propre compte SwimUp et voit uniquement tes outils d'avis. Tu peux retirer un accès à tout moment.</p>
        </div>

        {!d.premium ? (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-4 text-sm flex items-start gap-2">
            <Crown size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p>Les accès d'équipe sont inclus dans l'offre Premium (jusqu'à 5 personnes). <Link to="/client/premium" className="underline">Voir Premium</Link></p>
          </div>
        ) : (
          <form onSubmit={inviter} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input className="input flex-1" type="email" required placeholder="Email du collaborateur" value={email} onChange={e => setEmail(e.target.value)} maxLength={200} aria-label="Email du collaborateur" />
              <select className="input sm:w-36" value={role} onChange={e => setRole(e.target.value)} aria-label="Rôle">
                {d.roles.map(r => <option key={r} value={r}>{ROLES[r]}</option>)}
              </select>
              <button className="btn-primary" disabled={occupe || plein || !email}><Mail size={15} /> Inviter</button>
            </div>
            <p className="text-xs text-slate-500">{DESC_ROLES[role]} La personne doit avoir (ou créer) un compte client SwimUp avec cette adresse. {d.acces.length + d.invitations.length}/{d.limite} places utilisées.</p>
          </form>
        )}

        {d.invitations.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Invitations en attente</p>
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {d.invitations.map(i => (
                <li key={i.id} className="py-2 flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{i.email} <span className="text-xs text-slate-500">· {ROLES[i.role].toLowerCase()} · expire le {dateFr(i.expire_at)}</span></span>
                  <button className="btn-ghost text-xs px-2 py-1" onClick={() => agir(() => api.delete(`/client/equipe/invitations/${i.id}`), 'Invitation annulée')} disabled={occupe}>Annuler</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {d.acces.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Personnes avec accès</p>
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {d.acces.map(a => (
                <li key={a.id} className="py-2 flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{a.email} <span className="text-xs text-slate-500">· depuis le {dateFr(a.depuis)}</span></span>
                  <span className="flex items-center gap-1 shrink-0">
                    <select className="input py-1 text-xs w-28" value={a.role} aria-label={`Rôle de ${a.email}`}
                      onChange={e => agir(() => api.put(`/client/equipe/acces/${a.id}`, { role: e.target.value }), 'Rôle modifié')} disabled={occupe}>
                      {d.roles.map(r => <option key={r} value={r}>{ROLES[r]}</option>)}
                    </select>
                    <button className="btn-danger px-2 py-1.5" aria-label={`Retirer l'accès de ${a.email}`}
                      onClick={() => window.confirm(`Retirer l'accès de ${a.email} ?`) && agir(() => api.delete(`/client/equipe/acces/${a.id}`), 'Accès retiré')} disabled={occupe}><Trash2 size={13} /></button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {d.journal.length > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">Dernières actions de ton équipe</summary>
            <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {d.journal.slice(0, 20).map((j, i) => <li key={i}>{dateFr(j.date)} · {j.email} · {j.methode} {j.chemin.replace('/api/client/', '')}</li>)}
            </ul>
          </details>
        )}
      </div>

      <div className="card space-y-3">
        <h2 className="section-title flex items-center gap-2"><Building2 size={17} /> Établissements que je peux gérer</h2>
        {d.recus.length === 0 ? (
          <p className="text-sm text-muted">Personne ne t'a encore donné accès à son compte. Quand ce sera le cas, tu pourras passer d'un établissement à l'autre depuis les pages Outils avis, Réputation et Campagnes.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {d.recus.map(c => (
              <li key={c.client_id} className="py-2 flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">{c.nom} <span className="text-xs text-slate-500">· {ROLES[c.role].toLowerCase()}</span></span>
                <span className="flex gap-1 shrink-0">
                  <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => { choisirCompte(c.client_id); window.location.assign('/client/outils') }}>Ouvrir</button>
                  <button className="btn-ghost px-2 py-1.5" aria-label={`Quitter ${c.nom}`} title="Quitter cette équipe"
                    onClick={() => window.confirm(`Quitter l'équipe de ${c.nom} ?`) && api.delete(`/client/equipe/recus/${c.client_id}`).then(() => { choisirCompte(null); charger() }).catch(e => toast.error(erreurApi(e)))}><LogOut size={14} /></button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ---------- Comparaison ----------

function Comparaison() {
  const [jours, setJours] = useState(30)
  const [s, setS] = useState(null)
  const [occupe, setOccupe] = useState(false)

  useEffect(() => {
    setS(null)
    api.get('/client/equipe/groupe/synthese', { params: { jours } }).then(r => setS(r.data)).catch(() => toast.error('Chargement impossible'))
  }, [jours])

  const telecharger = async () => {
    setOccupe(true)
    try {
      const r = await api.get('/client/equipe/groupe/rapport', { params: { jours }, responseType: 'blob' })
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a'); a.href = url; a.download = 'rapport-groupe.pdf'; a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (e) { toast.error('Le rapport n\'a pas pu être généré.') }
    setOccupe(false)
  }

  if (!s) return <div className="card animate-pulse h-32" />
  const t = s.totaux

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-full p-0.5 text-xs">
          {[7, 30, 90].map(j => (
            <button key={j} onClick={() => setJours(j)} className={`px-3.5 py-1.5 rounded-full font-medium ${jours === j ? 'bg-white dark:bg-slate-600' : 'text-slate-500'}`}>{j} jours</button>
          ))}
        </div>
        <button className="btn-secondary text-xs px-3 py-2" onClick={telecharger} disabled={occupe || !s.lignes.length}><FileDown size={14} /> Rapport PDF</button>
      </div>

      {s.lignes.length === 0 ? (
        <div className="card text-sm space-y-2">
          <p className="font-medium flex items-center gap-2"><Crown size={15} className="text-amber-500" /> La comparaison est réservée aux établissements Premium.</p>
          <p className="text-muted">Passe ton compte en Premium, ou demande un accès à un compte Premium, pour voir ici la note, les avis et l'activité de chaque établissement côte à côte.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[['Note du groupe', t.note_moyenne_ponderee != null ? `${note1(t.note_moyenne_ponderee)} / 5` : '—'],
              ['Avis Google', t.total_avis], ['Passages sur les liens', t.passages], ['Avis négatifs à traiter', t.avis_negatifs_a_traiter]].map(([l, v]) => (
              <div key={l} className="card text-center py-3"><p className="text-xl font-semibold tabular-nums">{v}</p><p className="text-[11px] text-slate-500 leading-tight">{l}</p></div>
            ))}
          </div>

          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100 dark:border-slate-700">
                  <th className="p-3 font-medium">Établissement</th><th className="p-3 font-medium text-right">Note</th><th className="p-3 font-medium text-right">Évol.</th>
                  <th className="p-3 font-medium text-right">Avis</th><th className="p-3 font-medium text-right">Passages</th><th className="p-3 font-medium text-right">Emails</th><th className="p-3 font-medium text-right">Position</th>
                </tr>
              </thead>
              <tbody>
                {s.lignes.map(l => (
                  <tr key={l.client_id} className="border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                    <td className="p-3 font-medium whitespace-nowrap">{l.nom}{l.avis_negatifs_a_traiter > 0 && <span className="ml-2 text-[11px] text-red-600">{l.avis_negatifs_a_traiter} à traiter</span>}</td>
                    <td className="p-3 text-right tabular-nums">{note1(l.note)}</td>
                    <td className={`p-3 text-right tabular-nums ${l.evolution?.delta_note > 0 ? 'text-emerald-600' : l.evolution?.delta_note < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                      {l.evolution ? `${l.evolution.delta_note > 0 ? '+' : ''}${note1(l.evolution.delta_note)}` : '—'}
                    </td>
                    <td className="p-3 text-right tabular-nums">{l.total_avis ?? '—'}</td>
                    <td className="p-3 text-right tabular-nums">{l.passages.total}</td>
                    <td className="p-3 text-right tabular-nums">{l.emails_envoyes}</td>
                    <td className="p-3 text-right tabular-nums" title="Position moyenne sur les mots-clés suivis qui apparaissent dans les 20 premiers résultats">
                      {l.visibilite.position_moyenne != null ? `${String(l.visibilite.position_moyenne).replace('.', ',')}e` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {s.exclus.length > 0 && (
        <p className="text-xs text-slate-500">Non comparés (offre Gratuit) : {s.exclus.map(e => e.nom).join(', ')}.</p>
      )}
      <p className="text-xs text-slate-500 leading-relaxed">{s.note} La note du groupe est pondérée par le nombre d'avis de chaque fiche.</p>
    </div>
  )
}
