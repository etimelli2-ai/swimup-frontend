import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Trophy, Ticket, Users, Loader2, Target, Sparkles } from 'lucide-react'

export default function Loterie() {
  const [data, setData] = useState({ loterie: null, tickets: 0, totalTickets: 0 })
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [curr, hist] = await Promise.all([
          api.get('/loterie'),
          api.get('/loterie/historique'),
        ])
        setData(curr.data)
        setHistorique(hist.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

      {data.loterie ? (
        <div className="card bg-gradient-to-br from-violet-600 to-purple-500 text-white border-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-violet-100 text-sm font-medium">En cours</span>
            <Sparkles className="w-5 h-5 text-violet-200" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-1">{data.loterie.titre}</h2>
          <div className="font-display text-4xl font-bold mb-3">
            {parseFloat(data.loterie.montant_gain).toFixed(2)} €
          </div>
          <div className="flex items-center gap-4 text-sm text-violet-100">
            <span className="flex items-center gap-1">
              <Ticket className="w-4 h-4" /> {data.tickets} ticket{data.tickets > 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" /> {data.totalTickets} total
            </span>
          </div>
          {data.totalTickets > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-violet-100 mb-1">
                <span>Tes chances</span>
                <span>{((data.tickets / data.totalTickets) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-violet-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 rounded-full transition-all duration-500"
                  style={{ width: `${(data.tickets / data.totalTickets) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card-flat text-center py-16">
          <Target className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aucune loterie en cours</p>
        </div>
      )}

      {historique.length > 0 && (
        <div>
          <h2 className="section-title mb-3">Historique</h2>
          <div className="space-y-2">
            {historique.map((h, i) => (
              <div key={i} className="card-flat p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{h.titre}</p>
                  <p className="text-xs text-slate-500">
                    Gagnant : {h.gagnant_email || 'Inconnu'}
                  </p>
                </div>
                <span className="badge-purple">{parseFloat(h.montant_gain).toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
