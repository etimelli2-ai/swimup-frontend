import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect } from 'react'
import api from '../../lib/api'
import MiniLineChart from '../../components/MiniLineChart'
import { Star, BarChart3, Info } from 'lucide-react'
import { motion } from 'framer-motion'

const MOIS_LABELS = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr', '05': 'Mai', '06': 'Juin',
  '07': 'Juil', '08': 'Août', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
}

function formatMois(aaaaMm) {
  if (!aaaaMm) return ''
  const [, mm] = aaaaMm.split('-')
  return MOIS_LABELS[mm] || aaaaMm
}

function formatJour(dateStr) {
  const d = new Date(String(dateStr).replace(' ', 'T') + 'Z')
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export default function ClientStats() {
  usePageTitle('Statistiques')

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/client/historique')
      .then(r => setData(r.data))
      .catch(() => setData({ historiqueNote: [], avisParMois: [] }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const historiqueNote = data?.historiqueNote || []
  const avisParMois     = data?.avisParMois || []

  const pointsNote = historiqueNote.map(h => ({ label: formatJour(h.created_at), value: parseFloat(h.note) }))
  const pointsAvis  = avisParMois.map(a => ({ label: formatMois(a.mois), value: a.c }))

  const derniereNote = historiqueNote[historiqueNote.length - 1]
  const totalAvisPublies = avisParMois.reduce((s, a) => s + a.c, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">📈 Statistiques</h1>
        <p className="text-muted mt-1">L'évolution de ta visibilité Google grâce à SwimUp</p>
      </div>

      {/* Évolution de la note Google */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star size={16} className="text-amber-400 fill-amber-400" /> Note Google
          </h3>
          {derniereNote && (
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {parseFloat(derniereNote.note).toFixed(1)} ★
            </span>
          )}
        </div>
        {derniereNote && (
          <p className="text-xs text-slate-400 mb-3">{derniereNote.nb_avis_google} avis sur Google Maps</p>
        )}
        {historiqueNote.length > 0 ? (
          <MiniLineChart points={pointsNote} color="#f59e0b" formatValue={v => `${v.toFixed(1)} ★`} />
        ) : (
          <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mt-2">
            <Info size={16} className="text-sky-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              On suit ta note Google automatiquement chaque jour — le premier point apparaîtra ici sous peu.
            </p>
          </div>
        )}
      </motion.div>

      {/* Avis SwimUp publiés dans le temps */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={16} className="text-sky-500" /> Avis publiés par SwimUp
          </h3>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalAvisPublies}</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">Total depuis le début</p>
        {avisParMois.length > 0 ? (
          <MiniLineChart points={pointsAvis} color="#0ea5e9" formatValue={v => `${v} avis`} />
        ) : (
          <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mt-2">
            <Info size={16} className="text-sky-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Dès que tes premiers avis seront validés, leur évolution mois par mois s'affichera ici.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
