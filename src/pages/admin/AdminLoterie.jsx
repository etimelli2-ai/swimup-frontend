import { useEffect, useState } from 'react'
import api from '../../lib/api'
import {
  Trophy, Plus, Loader2, Sparkles,
  Target, Dices
} from 'lucide-react'

export default function AdminLoterie() {
  const [loteries, setLoteries] = useState([])
  const [tirage, setTirage] = useState(null)
  const [form, setForm] = useState({ titre: '', montant_gain: '', prix_ticket: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/loterie/historique')
      .then(r => setLoteries(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const creer = async (e) => {
    e.preventDefault()
    try {
      await api.post('/loterie', form)
      setForm({ titre: '', montant_gain: '', prix_ticket: 1 })
      setTirage(null)
      const r = await api.get('/loterie/historique')
      setLoteries(r.data)
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur')
    }
  }

  const tirer = async (id) => {
    if (!confirm('Lancer le tirage ?')) return
    try {
      const res = await api.post(`/loterie/${id}/tirer`)
      setTirage(res.data)
      const r = await api.get('/loterie/historique')
      setLoteries(r.data)
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

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="section-title flex items-center gap-2">
        <Trophy className="w-6 h-6 text-aqua-500" /> Loterie
      </h1>

      <form onSubmit={creer} className="card space-y-3">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle loterie
        </h3>
        <input type="text" placeholder="Titre" value={form.titre}
          onChange={e => setForm({...form, titre: e.target.value})} className="input" required />
        <input type="number" placeholder="Gain (€)" value={form.montant_gain}
          onChange={e => setForm({...form, montant_gain: e.target.value})} className="input" required />
        <input type="number" placeholder="Prix ticket (€)" value={form.prix_ticket}
          onChange={e => setForm({...form, prix_ticket: e.target.value})} className="input" />
        <button type="submit" className="btn-primary text-sm py-3">Créer</button>
      </form>

      {tirage && (
        <div className="card bg-gradient-to-br from-violet-600 to-purple-500 text-white border-0 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Résultat du tirage</span>
          </div>
          <p className="font-display text-xl font-bold">{tirage.gagnant_email}</p>
          <p className="text-violet-100">{parseFloat(tirage.montant).toFixed(2)} €</p>
        </div>
      )}

      <div>
        <h2 className="section-title mb-3">Historique</h2>
        {loteries.length === 0 ? (
          <div className="card-flat text-center py-12 text-slate-400">
            <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
            Aucune loterie
          </div>
        ) : (
          <div className="space-y-2">
            {loteries.map(l => (
              <div key={l.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{l.titre}</p>
                    <p className="text-xs text-slate-500">
                      {l.gagnant_email ? `Gagnant : ${l.gagnant_email}` : 'En cours'}
                    </p>
                  </div>
                  <span className="badge-purple">{parseFloat(l.montant_gain).toFixed(2)} €</span>
                </div>
                {l.statut === 'en_cours' && (
                  <button onClick={() => tirer(l.id)} className="btn-primary text-sm py-2.5 w-auto px-4">
                    <Dices className="w-4 h-4 inline mr-1" /> Tirer au sort
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
