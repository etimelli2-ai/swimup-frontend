// ============================================================
// frontend/src/pages/Avis.jsx -- NOUVEAU (redesign)
// ============================================================

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAvisDisponibles, useReserverAvis, useMesAvis } from '../hooks/useAvis'
import AvisCard from '../components/AvisCard'
import { AvisListSkeleton } from '../components/Skeleton'
import { Search, Filter, Star, ArrowRight, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Avis() {
  const { user } = useAuth()
  const { data: avis, isLoading } = useAvisDisponibles()
  const { data: mesAvis } = useMesAvis()
  const reserver = useReserverAvis()

  const [search, setSearch] = useState('')
  const [etoileFilter, setEtoileFilter] = useState(null)

  const hasAvisEnCours = mesAvis?.some(a => a.statut === 'reserve' || a.statut === 'en_verification')

  const filtered = avis?.filter(a => {
    const matchSearch = !search ||
      (a.nom_societe || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.texte || '').toLowerCase().includes(search.toLowerCase())
    const matchStars = !etoileFilter || parseInt(a.nb_etoiles) === etoileFilter
    return matchSearch && matchStars
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Avis disponibles</h1>
          <p className="text-muted mt-1">
            {avis?.length || 0} avis en attente de redaction
          </p>
        </div>
        {hasAvisEnCours && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="badge badge-amber shrink-0"
          >
            <AlertCircle size={12} />
            Tu as deja un avis en cours
          </motion.div>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un etablissement..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2">
          {[null, 1, 2, 3, 4, 5].map(n => (
            <button
              key={n ?? 'all'}
              onClick={() => setEtoileFilter(n)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                etoileFilter === n
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {n === null ? 'Tout' : (
                <span className="flex items-center gap-1">
                  {n} <Star size={12} className={etoileFilter === n ? 'fill-white' : 'fill-amber-400 text-amber-400'} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {isLoading ? (
        <AvisListSkeleton />
      ) : filtered?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">Aucun avis ne correspond a ta recherche</p>
          <p className="text-slate-400 text-sm mt-1">Essaye avec d'autres mots-cles ou filtres</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((a, i) => (
              <AvisCard
                key={a.id}
                avis={a}
                index={i}
                onReserve={(id) => {
                  if (hasAvisEnCours) return
                  reserver.mutate(id)
                }}
                isReserving={reserver.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
