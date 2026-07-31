// ============================================================
// frontend/src/pages/MonAvis.jsx -- NOUVEAU (redesign)
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMesAvis, useSoumettreAvis, useAnnulerAvis } from '../hooks/useAvis'
import {
  Clock,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  ArrowLeft,
  Star,
  Send,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Loader2,
  MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MonAvis() {
  const { user } = useAuth()
  const { data: avisList, isLoading } = useMesAvis()
  const soumettre = useSoumettreAvis()
  const annuler = useAnnulerAvis()

  const [lienAvis, setLienAvis] = useState('')
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)

  const avisEnCours = avisList?.find(a => a.statut === 'reserve')
  const avisEnVerification = avisList?.find(a => a.statut === 'en_verification')
  const avisValides = avisList?.filter(a => a.statut === 'valide') || []
  const avisRefuses = avisList?.filter(a => a.statut === 'refuse') || []

  const currentAvis = avisEnCours || avisEnVerification

  // Timer
  useEffect(() => {
    if (!avisEnCours?.reserve_at) return
    const interval = setInterval(() => {
      const reserveAt = new Date(avisEnCours.reserve_at)
      const elapsed = Date.now() - reserveAt.getTime()
      const remaining = 3600000 - elapsed
      if (remaining <= 0) {
        setTimeLeft(0)
        clearInterval(interval)
      } else {
        const mins = Math.floor(remaining / 60000)
        const secs = Math.floor((remaining % 60000) / 1000)
        setTimeLeft(`${mins}m ${secs.toString().padStart(2, '0')}s`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [avisEnCours])

  const handleCopy = () => {
    if (currentAvis?.texte) {
      navigator.clipboard.writeText(currentAvis.texte)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!lienAvis.trim() || !currentAvis) return
    soumettre.mutate({ id: currentAvis.id, lien_avis: lienAvis.trim() })
  }

  const nbEtoiles = parseInt(currentAvis?.nb_etoiles) || 5

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-slate-500" />
        </Link>
        <h1 className="page-title">Mon avis</h1>
      </div>

      {/* Avis en cours */}
      {currentAvis && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-0 overflow-hidden"
        >
          {/* Status bar */}
          <div className={`px-5 py-3 flex items-center justify-between ${
            avisEnCours ? 'bg-amber-50 border-b border-amber-100' : 'bg-sky-50 border-b border-sky-100'
          }`}>
            <div className="flex items-center gap-2">
              {avisEnCours ? (
                <>
                  <Clock size={16} className="text-amber-500" />
                  <span className="text-sm font-semibold text-amber-700">En cours</span>
                </>
              ) : (
                <>
                  <Loader2 size={16} className="text-sky-500 animate-spin" />
                  <span className="text-sm font-semibold text-sky-700">En verification</span>
                </>
              )}
            </div>
            {avisEnCours && timeLeft !== null && (
              <span className={`text-sm font-bold tabular-nums ${
                timeLeft === 0 ? 'text-red-500' : 'text-amber-600'
              }`}>
                {timeLeft === 0 ? 'Delai expire' : timeLeft}
              </span>
            )}
          </div>

          <div className="p-5 space-y-5">
            {/* Etablissement */}
            <div>
              <h2 className="text-lg font-bold text-slate-900">{currentAvis.nom_societe}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={14} className={
                      n <= nbEtoiles ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    } />
                  ))}
                </div>
                <span className="text-sm text-slate-500">{nbEtoiles} etoiles</span>
                <span className="text-slate-300">|</span>
                <span className="text-sm font-semibold text-sky-600">+{parseFloat(currentAvis.prix).toFixed(2)} EUR</span>
              </div>
            </div>

            {/* Progress bar */}
            {avisEnCours && (
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Temps restant</span>
                  <span className="font-medium">{timeLeft === 0 ? 'Expire' : '1h max'}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-400 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: timeLeft === 0 ? '0%' : `${(parseInt(timeLeft) / 60) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            )}

            {/* Texte a copier */}
            <div className="bg-slate-50 rounded-xl p-4 relative group">
              <p className="text-sm text-slate-600 italic leading-relaxed pr-10">
                &ldquo;{currentAvis.texte}&rdquo;
              </p>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-sky-600 hover:border-sky-200 transition-all shadow-sm"
                title="Copier le texte"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Actions */}
            {avisEnCours && (
              <>
                <div className="flex gap-3">
                  <a
                    href={currentAvis.lien_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex-1"
                  >
                    <ExternalLink size={16} />
                    Ouvrir Google Maps
                  </a>
                  <button
                    onClick={() => annuler.mutate(currentAvis.id)}
                    disabled={annuler.isPending}
                    className="btn-ghost px-4"
                  >
                    <RotateCcw size={16} />
                    Annuler
                  </button>
                </div>

                {/* Formulaire soumission */}
                <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="text-sm font-medium text-slate-700">
                    Lien de ton avis publie
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://maps.google.com/..."
                      value={lienAvis}
                      onChange={e => setLienAvis(e.target.value)}
                      required
                      className="input flex-1"
                    />
                    <button
                      type="submit"
                      disabled={soumettre.isPending || !lienAvis.trim()}
                      className="btn-primary px-5"
                    >
                      {soumettre.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Send size={16} />
                          Soumettre
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Copie le lien direct de ton avis sur Google Maps et colle-le ici.
                  </p>
                </form>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Aucun avis en cours */}
      {!currentAvis && avisValides.length === 0 && avisRefuses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 text-center"
        >
          <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={28} className="text-sky-400" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">Aucun avis en cours</p>
          <p className="text-slate-400 text-sm mt-2 mb-6 max-w-sm mx-auto">
            Reserve un avis disponible et suis les etapes pour le publier sur Google Maps.
          </p>
          <Link to="/avis" className="btn-primary inline-flex">
            <Star size={16} />
            Voir les avis disponibles
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      )}

      {/* Avis valides en attente */}
      {avisValides.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Avis valides en attente de paiement
          </h2>
          <div className="space-y-2">
            {avisValides.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{a.nom_societe}</p>
                  <p className="text-xs text-slate-500">+{parseFloat(a.prix).toFixed(2)} EUR</p>
                </div>
                <span className="badge badge-green text-xs">Valide</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avis refuses */}
      {avisRefuses.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <XCircle size={18} className="text-red-500" />
            Avis supprimes
          </h2>
          <div className="space-y-2">
            {avisRefuses.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle size={16} className="text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{a.nom_societe}</p>
                  <p className="text-xs text-slate-500">{parseFloat(a.prix).toFixed(2)} EUR</p>
                </div>
                <Link
                  to={`/mon-avis/contester/${a.id}`}
                  className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <MessageSquare size={12} />
                  Contester
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
