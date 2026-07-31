import { useState, useEffect } from 'react'
import api from '../../lib/api'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

export default function AdminLoterie() {
  const [data, setData]         = useState(null)
  const [participants, setPart] = useState([])
  const [users, setUsers]       = useState([])
  const [form, setForm]         = useState({ titre: '', montant_gain: '', prix_ticket: '1' })
  const [ticketForm, setTF]     = useState({ user_id: '', nb_tickets: '1' })
  const [msg, setMsg]           = useState(null)
  const [tirage, setTirage]     = useState(null)
  const [loadingAction, setLA]  = useState(null)

  const load = async () => {
    const [l, u] = await Promise.all([
      api.get('/loterie'),
      api.get('/admin/users'),
    ])
    setData(l.data)
    setUsers(u.data)
    if (l.data?.loterie) {
      const p = await api.get(`/loterie/${l.data.loterie.id}/participants`)
      setPart(p.data)
    }
  }

  useEffect(() => { load() }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const creerLoterie = async () => {
    if (!form.titre || !form.montant_gain) return showMsg('error', 'Titre et montant requis')
    setLA('creer')
    try {
      await api.post('/loterie', form)
      showMsg('success', 'Loterie créée !')
      setForm({ titre: '', montant_gain: '', prix_ticket: '1' })
      // Fix — réinitialiser tirage quand on crée une nouvelle loterie
      setTirage(null)
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur')
    }
    setLA(null)
  }

  const ajouterTickets = async () => {
    if (!ticketForm.user_id || !ticketForm.nb_tickets) return showMsg('error', 'Sélectionne un membre et un nombre de tickets')
    setLA('tickets')
    try {
      await api.post(`/loterie/${data.loterie.id}/tickets`, ticketForm)
      showMsg('success', `${ticketForm.nb_tickets} ticket(s) ajouté(s) !`)
      setTF({ user_id: '', nb_tickets: '1' })
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur')
    }
    setLA(null)
  }

  const lancerTirage = async () => {
    if (!confirm('Lancer le tirage au sort ? Cette action est irréversible !')) return
    setLA('tirage')
    try {
      const r = await api.post(`/loterie/${data.loterie.id}/tirer`)
      setTirage(r.data)
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur')
    }
    setLA(null)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">🎰 Gestion Loterie</h2>

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Résultat tirage */}
      {tirage && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 text-center space-y-2">
          <p className="text-4xl">🎉</p>
          <p className="font-extrabold text-xl text-yellow-700">Tirage effectué !</p>
          <p className="text-gray-700">Gagnant : <strong>{tirage.gagnant_email}</strong></p>
          <p className="text-2xl font-bold text-green-600">{parseFloat(tirage.montant || 0).toFixed(2)}€ crédités !</p>
        </div>
      )}

      {!data?.loterie ? (
        <div className="card space-y-3">
          <h3 className="font-bold">Créer une loterie</h3>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Titre</label>
            <input className="input" placeholder="Ex: Loterie de juillet"
              value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Montant à gagner (€)</label>
              <input className="input" type="number" placeholder="100"
                value={form.montant_gain} onChange={e => setForm(p => ({ ...p, montant_gain: e.target.value }))} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Prix ticket (€)</label>
              <input className="input" type="number" placeholder="1"
                value={form.prix_ticket} onChange={e => setForm(p => ({ ...p, prix_ticket: e.target.value }))} />
            </div>
          </div>
          <button onClick={creerLoterie} disabled={loadingAction === 'creer'}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-70">
            {loadingAction === 'creer' ? <><Spinner /> Création...</> : '🎰 Lancer la loterie'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-5 text-white">
            <p className="font-bold text-lg">{data.loterie.titre}</p>
            <p className="text-3xl font-extrabold mt-1">{data.loterie.montant_gain}€</p>
            <p className="text-sm opacity-90 mt-1">
              {data.totalTickets} tickets vendus · {data.loterie.prix_ticket}€/ticket
            </p>
          </div>

          <div className="card space-y-3">
            <h3 className="font-bold">Ajouter des tickets à un membre</h3>
            <select className="input" value={ticketForm.user_id}
              onChange={e => setTF(p => ({ ...p, user_id: e.target.value }))}>
              <option value="">Sélectionner un membre</option>
              {users.filter(u => u.role === 'membre').map(u => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input className="input" type="number" min="1" placeholder="Nombre de tickets"
                value={ticketForm.nb_tickets}
                onChange={e => setTF(p => ({ ...p, nb_tickets: e.target.value }))} />
              <button onClick={ajouterTickets} disabled={loadingAction === 'tickets'}
                className="bg-brand-600 text-white px-4 rounded-xl font-medium text-sm flex items-center gap-2 disabled:opacity-70 whitespace-nowrap">
                {loadingAction === 'tickets' ? <Spinner /> : '+ Ajouter'}
              </button>
            </div>
          </div>

          {participants.length > 0 && (
            <div className="card space-y-2">
              <h3 className="font-bold">👥 Participants ({participants.length})</h3>
              <div className="space-y-2">
                {participants.map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 truncate">{p.email}</p>
                    <span className="badge-blue">{p.nb_tickets} 🎟️</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={lancerTirage} disabled={loadingAction === 'tirage'}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-extrabold rounded-2xl text-lg flex items-center justify-center gap-2 disabled:opacity-70">
            {loadingAction === 'tirage' ? <><Spinner /> Tirage en cours...</> : '🎲 Lancer le tirage au sort'}
          </button>
        </div>
      )}
    </div>
  )
}
