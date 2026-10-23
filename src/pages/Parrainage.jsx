import usePageTitle from '../hooks/usePageTitle'
import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Gift, Copy, Check, Users, Coins } from 'lucide-react'
import { motion } from 'framer-motion'
import { springSmooth } from '../lib/motion'
import toast from 'react-hot-toast'
import { t } from '../lib/i18n'

export default function Parrainage() {
  usePageTitle(t('Parrainage'))

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [copie, setCopie]     = useState(false)

  useEffect(() => {
    api.get('/avis/parrainage')
      .then(r => setData(r.data))
      .catch(() => toast.error(t('Impossible de charger ton parrainage')))
      .finally(() => setLoading(false))
  }, [])

  const copier = () => {
    if (!data?.lien) return
    navigator.clipboard.writeText(data.lien)
    setCopie(true)
    toast.success(t('Lien copié !'))
    setTimeout(() => setCopie(false), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">{t('🎁 Parrainage')}</h1>
        <p className="text-muted mt-1">{t('Invite tes amis et touche 0,20 € sur chaque avis qu\'ils font')}</p>
      </div>

      {/* Lien à partager */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSmooth}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white p-6 shadow-xl shadow-violet-500/20"
      >
        <div className="flex items-center gap-2 text-violet-100 text-sm font-medium">
          <Gift size={16} />{' '}{t('Ton code de parrainage')}
        </div>
        <p className="text-4xl font-extrabold tracking-wide mt-2">{data?.code || '—'}</p>

        <div className="flex items-center gap-2 mt-4 bg-white/15 rounded-xl p-2.5">
          <input
            readOnly
            value={data?.lien || ''}
            className="bg-transparent flex-1 text-sm text-white placeholder-violet-200 outline-none truncate"
          />
          <button
            onClick={copier}
            className="shrink-0 bg-[#ffffff] text-violet-600 text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all"
          >
            {copie ? <Check size={14} /> : <Copy size={14} />}
            {copie ? t('Copié') : t('Copier')}
          </button>
        </div>
        <p className="text-xs text-violet-100 mt-3">
          {t('Chaque fois qu\'un avis de ton filleul est payé, tu touches 0,20 € — pour tous ses avis, sans limite. Lui est payé 0,20 € de moins par avis.')}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card">
          <div className="w-10 h-10 bg-sky-50 dark:bg-sky-900/30 rounded-lg flex items-center justify-center mb-3">
            <Users size={20} className="text-sky-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.nb_filleuls || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('Filleul(s) inscrit(s)')}</p>
        </div>

        <div className="stat-card">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-3">
            <Coins size={20} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{(data?.total_gagne || 0).toFixed(2)}€</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('Gagné grâce au parrainage')}</p>
        </div>
      </div>

      {/* Comment ça marche */}
      <div className="card p-5">
        <h2 className="section-title mb-4">{t('Comment ça marche ?')}</h2>
        <div className="space-y-3">
          {[
            { n: '1', t: t('Partage ton lien'), d: t('Envoie ton code ou ton lien à des amis qui ne sont pas encore sur SwimUp') },
            { n: '2', t: t('Ton ami s\'inscrit'), d: t('Il crée son compte en passant par ton lien (le code se remplit tout seul)') },
            { n: '3', t: t('Il fait des avis'), d: t('Son gain par avis est celui du barème moins 0,20 €') },
            { n: '4', t: t('Tu touches 0,20 € par avis'), d: t('Crédité sur ton solde quand son avis est payé (à la fin de la vérification), sans rien faire de plus') },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{s.t}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des filleuls */}
      {data?.nb_filleuls > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-3">{t('Tes filleuls')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('{nb_filleuls_actifs} sur {nb_filleuls} t\'ont déjà rapporté au moins un bonus.', { nb_filleuls_actifs: data.nb_filleuls_actifs, nb_filleuls: data.nb_filleuls })}
          </p>
        </div>
      )}
    </div>
  )
}
