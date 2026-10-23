import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect, useMemo } from 'react'
import api from '../../lib/api'
import MiniLineChart from '../../components/MiniLineChart'
import {
  Star, BarChart3, Info, MessageSquare, Download, TrendingUp, TrendingDown,
  CheckCircle2, Clock, PackageOpen, XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { t, tn, locale } from '../../lib/i18n'

const MOIS_LABELS = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr', '05': 'Mai', '06': 'Juin',
  '07': 'Juil', '08': 'Août', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
}

const PERIODES = [{ valeur: 7 }, { valeur: 30 }, { valeur: null }]

function formatMois(aaaaMm) {
  if (!aaaaMm) return ''
  const [, mm] = aaaaMm.split('-')
  return MOIS_LABELS[mm] ? t(MOIS_LABELS[mm]) : aaaaMm
}

function formatJour(dateStr) {
  const d = new Date(String(dateStr).replace(' ', 'T') + 'Z')
  return d.toLocaleDateString(locale(), { day: '2-digit', month: 'short' })
}

function formatDateLongue(dateStr) {
  const d = new Date(String(dateStr).replace(' ', 'T') + 'Z')
  return d.toLocaleDateString(locale(), { day: '2-digit', month: 'long', year: 'numeric' })
}

function DeltaBadge({ delta, suffixe }) {
  if (delta == null || Number.isNaN(delta)) return null
  const positif = delta >= 0
  const Icone = positif ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
      positif ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
    }`}>
      <Icone size={12} />
      {positif ? '+' : ''}{delta}{suffixe}
    </span>
  )
}

export default function ClientStats() {
  usePageTitle(t('Statistiques'))

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState(30)
  const [exportEnCours, setExportEnCours] = useState(false)

  useEffect(() => {
    api.get('/client/historique')
      .then(r => setData(r.data))
      .catch(() => setData({ historiqueNote: [], avisParMois: [], repartition: null }))
      .finally(() => setLoading(false))
  }, [])

  const historiqueNoteComplet = data?.historiqueNote || []
  const avisParMois           = data?.avisParMois || []
  const repartition           = data?.repartition || { valides: 0, enCours: 0, disponibles: 0, refuses: 0, total: 0 }

  // La période (7j/30j/tout) filtre uniquement les points affichés dans le
  // graphique — les deltas "depuis le début" ci-dessous se calculent eux
  // toujours sur l'historique complet, peu importe le zoom sélectionné.
  const historiqueNote = useMemo(() => {
    if (!periode) return historiqueNoteComplet
    const seuil = Date.now() - periode * 24 * 60 * 60 * 1000
    const filtre = historiqueNoteComplet.filter(h => new Date(String(h.created_at).replace(' ', 'T') + 'Z').getTime() >= seuil)
    // Toujours garder au moins 2 points pour que la courbe ait un sens.
    return filtre.length >= 2 ? filtre : historiqueNoteComplet.slice(-2)
  }, [historiqueNoteComplet, periode])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const pointsNote      = historiqueNote.map(h => ({ label: formatJour(h.created_at), value: parseFloat(h.note) }))
  const pointsAvisGoogle = historiqueNote.map(h => ({ label: formatJour(h.created_at), value: h.nb_avis_google }))
  const pointsAvis       = avisParMois.map(a => ({ label: formatMois(a.mois), value: a.c }))

  const derniereNote     = historiqueNoteComplet[historiqueNoteComplet.length - 1]
  const premiereNote     = historiqueNoteComplet[0]
  const totalAvisPublies = avisParMois.reduce((s, a) => s + a.c, 0)

  const deltaNote       = (premiereNote && derniereNote && historiqueNoteComplet.length > 1)
    ? Math.round((parseFloat(derniereNote.note) - parseFloat(premiereNote.note)) * 10) / 10
    : null
  const deltaAvisGoogle = (premiereNote && derniereNote && historiqueNoteComplet.length > 1)
    ? (derniereNote.nb_avis_google || 0) - (premiereNote.nb_avis_google || 0)
    : null

  async function telechargerBilan() {
    setExportEnCours(true)
    try {
      const r = await api.get('/client/bilan-pdf', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'bilan-swimup.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error(t('Impossible de générer le PDF pour l\'instant, réessaie plus tard.'))
    } finally {
      setExportEnCours(false)
    }
  }

  const tuilesRepartition = [
    { label: t('Validés'), valeur: repartition.valides, icone: CheckCircle2, couleur: 'text-emerald-500' },
    { label: t('En cours'), valeur: repartition.enCours, icone: Clock, couleur: 'text-amber-500' },
    { label: t('Disponibles'), valeur: repartition.disponibles, icone: PackageOpen, couleur: 'text-slate-500 dark:text-slate-400' },
    { label: t('Refusés'), valeur: repartition.refuses, icone: XCircle, couleur: 'text-rose-500' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">{t('📈 Statistiques')}</h1>
          <p className="text-muted mt-1">{t('L\'évolution de ta visibilité Google grâce à SwimUp')}</p>
        </div>
        <button
          onClick={telechargerBilan}
          disabled={exportEnCours}
          className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-60"
        >
          <Download size={15} />
          {exportEnCours ? t('Génération...') : t('Exporter en PDF')}
        </button>
      </div>

      {/* Sélecteur de période */}
      <div className="flex items-center gap-2">
        {PERIODES.map(p => (
          <button
            key={String(p.valeur)}
            onClick={() => setPeriode(p.valeur)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              periode === p.valeur
                ? 'bg-sky-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {p.valeur ? t('{j} jours', { j: p.valeur }) : t('Tout')}
          </button>
        ))}
      </div>

      {/* Répartition des avis commandés */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">{t('Répartition de tes avis commandés')}</h3>
        {repartition.total > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tuilesRepartition.map(tx => (
              <div key={tx.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <tx.icone size={16} className={tx.couleur} />
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{tx.valeur}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tx.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('Pas encore d\'avis commandé.')}</p>
        )}
      </div>

      {/* Évolution de la note Google */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star size={16} className="text-amber-400 fill-amber-400" />{' '}{t('Note Google')}
          </h3>
          {derniereNote && (
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {parseFloat(derniereNote.note).toFixed(1)} ★
            </span>
          )}
        </div>
        {derniereNote && (
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('{nb_avis_google} avis sur Google Maps', { nb_avis_google: derniereNote.nb_avis_google })}</p>
            {deltaNote != null && (
              <>
                <DeltaBadge delta={deltaNote} suffixe="★" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('depuis le {formatDateLongue}', { formatDateLongue: formatDateLongue(premiereNote.created_at) })}</span>
              </>
            )}
          </div>
        )}
        {historiqueNote.length > 0 ? (
          <MiniLineChart points={pointsNote} color="#f59e0b" formatValue={v => `${v.toFixed(1)} ★`} />
        ) : (
          <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mt-2">
            <Info size={16} className="text-sky-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('On suit ta note Google automatiquement chaque jour — le premier point apparaîtra ici sous peu.')}
            </p>
          </div>
        )}
      </div>

      {/* Évolution du nombre d'avis Google */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare size={16} className="text-violet-500" />{' '}{t('Avis Google au total')}
          </h3>
          {derniereNote && (
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{derniereNote.nb_avis_google}</span>
          )}
        </div>
        {deltaAvisGoogle != null && (
          <div className="flex items-center gap-2 mb-3">
            <DeltaBadge delta={deltaAvisGoogle} suffixe=" avis" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('depuis le {formatDateLongue}', { formatDateLongue: formatDateLongue(premiereNote.created_at) })}</span>
          </div>
        )}
        {historiqueNote.length > 0 ? (
          <MiniLineChart points={pointsAvisGoogle} color="#8b5cf6" formatValue={v => tn(v, '{n} avis', '{n} avis')} />
        ) : (
          <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mt-2">
            <Info size={16} className="text-sky-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('Le nombre total d\'avis Google suit la même collecte quotidienne que la note.')}
            </p>
          </div>
        )}
      </div>

      {/* Avis SwimUp publiés dans le temps */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={16} className="text-sky-500" />{' '}{t('Avis publiés par SwimUp')}
          </h3>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalAvisPublies}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('Total depuis le début')}</p>
        {avisParMois.length > 0 ? (
          <MiniLineChart points={pointsAvis} color="#0ea5e9" formatValue={v => tn(v, '{n} avis', '{n} avis')} />
        ) : (
          <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mt-2">
            <Info size={16} className="text-sky-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('Dès que tes premiers avis seront validés, leur évolution mois par mois s\'affichera ici.')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
