import { useState, useEffect } from 'react'
import {
  useMesAvis, useAvisDisponibles, useReserverAvis,
  useSoumettreAvis, useAnnulerAvis, useContesterAvis,
} from '../hooks/useAvis'
import {
  Star, Flame, Copy, Check, AlertTriangle, Loader2, Clock,
  ExternalLink, Send, RotateCcw, CheckCircle2, XCircle, MessageSquare,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

function Etoiles({ n }) {
  const nb = parseInt(n) || 5
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className={i <= nb ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'} />
      ))}
    </div>
  )
}

// ─── Avis disponible à réserver ───
function CarteDisponible({ a, onReserver, reserving }) {
  const [copied, setCopied] = useState(false)
  const gain = parseFloat(a.prix_membre || a.prix || 1)
  const isPrioritaire = !!a.prioritaire

  const copierTexte = () => {
    navigator.clipboard.writeText(a.texte)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`card space-y-3 ${isPrioritaire ? 'border-sky-200 dark:border-sky-800' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900 dark:text-white truncate">{a.nom_societe}</p>
            {isPrioritaire && (
              <span className="badge-blue text-xs flex items-center gap-1">
                <Flame size={11} /> Prioritaire
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <Etoiles n={a.nb_etoiles} />
            <span className="text-xs text-slate-400">{parseInt(a.nb_etoiles) || 5} étoiles à mettre</span>
          </div>
        </div>
        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
          +{gain.toFixed(2)}€
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 relative">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pr-8 line-clamp-3">{a.texte}</p>
        <button
          onClick={copierTexte}
          title="Copier le texte"
          className="absolute top-2.5 right-2.5 p-1.5 text-slate-400 hover:text-sky-500 transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>

      <button
        className="btn-primary w-full"
        onClick={() => onReserver(a.id)}
        disabled={reserving !== null}
      >
        {reserving === a.id ? <><Spinner /> Réservation...</> : 'Réserver cet avis'}
      </button>
    </div>
  )
}

// ─── Avis en cours (réservé ou en vérification) ───
function AvisEnCours({ avis, onSoumettre, onAnnuler, soumettant, annulant }) {
  const [lienAvis, setLienAvis] = useState('')
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const enAttenteVerif = avis.statut === 'en_verification'
  const nbEtoiles = parseInt(avis.nb_etoiles) || 5

  useEffect(() => {
    if (enAttenteVerif || !avis.reserve_at) return
    const interval = setInterval(() => {
      const reserveAt = new Date(avis.reserve_at)
      const remaining = 3600000 - (Date.now() - reserveAt.getTime())
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
  }, [avis, enAttenteVerif])

  const copierTexte = () => {
    navigator.clipboard.writeText(avis.texte)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!lienAvis.trim()) return
    onSoumettre(avis.id, lienAvis.trim())
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className={`px-5 py-3 flex items-center justify-between ${enAttenteVerif ? 'bg-sky-50 dark:bg-sky-900/20 border-b border-sky-100 dark:border-sky-900' : 'bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900'}`}>
        <div className="flex items-center gap-2">
          {enAttenteVerif
            ? <><Loader2 size={15} className="text-sky-500 animate-spin" /><span className="text-sm font-medium text-sky-700 dark:text-sky-400">En vérification</span></>
            : <><Clock size={15} className="text-amber-500" /><span className="text-sm font-medium text-amber-700 dark:text-amber-400">Avis en cours</span></>
          }
        </div>
        {!enAttenteVerif && timeLeft !== null && (
          <span className={`text-sm font-semibold tabular-nums ${timeLeft === 0 ? 'text-red-500' : 'text-amber-600'}`}>
            {timeLeft === 0 ? 'Délai expiré' : timeLeft}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">{avis.nom_societe}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Etoiles n={nbEtoiles} />
            <span className="text-xs text-slate-400">|</span>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">+{parseFloat(avis.prix).toFixed(2)}€</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 relative">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pr-8">{avis.texte}</p>
          <button onClick={copierTexte} title="Copier le texte" className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-sky-500 transition-colors">
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>

        {!enAttenteVerif && (
          <>
            <div className="flex gap-3">
              <a href={avis.lien_maps} target="_blank" rel="noreferrer" className="btn-secondary flex-1 justify-center">
                <ExternalLink size={16} />
                Ouvrir Google Maps
              </a>
              <button onClick={() => onAnnuler(avis.id)} disabled={annulant} className="btn-ghost px-4">
                <RotateCcw size={16} />
                Annuler
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Lien de ton avis publié
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
                <button type="submit" disabled={soumettant || !lienAvis.trim()} className="btn-primary px-5">
                  {soumettant ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} />Soumettre</>}
                </button>
              </div>
              <p className="text-xs text-slate-400">Colle le lien direct de ton avis sur Google Maps.</p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Avis refusé — contestation ───
function AvisRefuse({ a, onContester, contestant }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  const envoyer = () => {
    onContester(a.id, message.trim())
    setOpen(false)
    setMessage('')
  }

  return (
    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
      <div className="flex items-center gap-3">
        <XCircle size={16} className="text-red-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{a.nom_societe}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{parseFloat(a.prix).toFixed(2)}€</p>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 shrink-0"
        >
          <MessageSquare size={12} />
          Contester
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-red-100 dark:border-red-900/40 space-y-2">
              <textarea
                className="input text-sm resize-none min-h-[70px]"
                placeholder="Explique pourquoi cet avis a été refusé à tort..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <button onClick={envoyer} disabled={contestant} className="btn-secondary text-xs px-4 py-2">
                {contestant ? 'Envoi...' : 'Envoyer la contestation'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Avis() {
  const { data: mesAvis, isLoading: mesAvisLoading } = useMesAvis()
  const { data: disponibles, isLoading: dispoLoading } = useAvisDisponibles()
  const reserver = useReserverAvis()
  const soumettre = useSoumettreAvis()
  const annuler = useAnnulerAvis()
  const contester = useContesterAvis()

  const [reserving, setReserving] = useState(null)

  const avisEnCours = mesAvis?.find(a => a.statut === 'reserve')
  const avisEnVerif = mesAvis?.find(a => a.statut === 'en_verification')
  const currentAvis = avisEnCours || avisEnVerif
  const avisValides = mesAvis?.filter(a => a.statut === 'valide') || []
  const avisRefuses = mesAvis?.filter(a => a.statut === 'refuse') || []

  const handleReserver = (id) => {
    setReserving(id)
    reserver.mutate(id, { onSettled: () => setReserving(null) })
  }

  const avisPrioritaires = disponibles?.filter(a => a.prioritaire) || []
  const avisNormaux = disponibles?.filter(a => !a.prioritaire) || []

  if (mesAvisLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-sky-500" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Avis</h1>
        <p className="text-muted mt-1">
          {currentAvis ? 'Termine ton avis en cours pour être payé' : 'Réserve un avis disponible et gagne de l\'argent'}
        </p>
      </div>

      {currentAvis ? (
        <AvisEnCours
          avis={currentAvis}
          onSoumettre={(id, lien) => soumettre.mutate({ id, lien_avis: lien })}
          onAnnuler={(id) => annuler.mutate(id)}
          soumettant={soumettre.isPending}
          annulant={annuler.isPending}
        />
      ) : dispoLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={22} className="animate-spin text-sky-500" />
        </div>
      ) : !disponibles?.length ? (
        <div className="card p-10 text-center">
          <AlertTriangle size={28} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600 dark:text-slate-400">Aucun avis disponible</p>
          <p className="text-sm text-slate-400 mt-1">Reviens un peu plus tard</p>
        </div>
      ) : (
        <div className="space-y-6">
          {avisPrioritaires.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide">
                Prioritaires — à faire en premier
              </h2>
              {avisPrioritaires.map(a => (
                <CarteDisponible key={a.id} a={a} onReserver={handleReserver} reserving={reserving} />
              ))}
            </div>
          )}
          {avisNormaux.length > 0 && (
            <div className="space-y-3">
              {avisPrioritaires.length > 0 && (
                <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide">Autres avis</h2>
              )}
              {avisNormaux.map(a => (
                <CarteDisponible key={a.id} a={a} onReserver={handleReserver} reserving={reserving} />
              ))}
            </div>
          )}
        </div>
      )}

      {avisValides.length > 0 && (
        <div>
          <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide mb-3">
            En attente de paiement
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800">
            {avisValides.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{a.nom_societe}</p>
                </div>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                  +{parseFloat(a.prix).toFixed(2)}€
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {avisRefuses.length > 0 && (
        <div>
          <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Avis supprimés</h2>
          <div className="space-y-2">
            {avisRefuses.map(a => (
              <AvisRefuse
                key={a.id}
                a={a}
                onContester={(id, message) => contester.mutate({ id, message })}
                contestant={contester.isPending}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
