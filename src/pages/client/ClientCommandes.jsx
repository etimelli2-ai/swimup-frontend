import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useSearchParams } from 'react-router-dom'
import { Link } from '../../components/Lien'
import { Star, ChevronDown, ChevronUp, Save, Loader2, Trash2, CalendarClock, Clock3, ShoppingBag, Wallet, CheckCircle2 } from 'lucide-react'
import { lienPaypal } from '../../lib/paypal'
import { motion, AnimatePresence } from 'framer-motion'
import { springSheet } from '../../lib/motion'
import toast from 'react-hot-toast'
import { t, tn, locale } from '../../lib/i18n'

// Convertit une date UTC "YYYY-MM-DD HH:MM:SS" (format renvoyé par le
// backend) en valeur locale pour un <input type="datetime-local">.
function toDatetimeLocalValue(utcString) {
  if (!utcString) return ''
  const d = new Date(utcString.replace(' ', 'T') + 'Z')
  if (isNaN(d.getTime())) return ''
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function AvisEditor({ avis, onSave, onDelete }) {
  const [texte, setTexte] = useState(avis.texte || '')
  const [etoiles, setEtoiles] = useState(avis.nb_etoiles || 5)
  const [programmer, setProgrammer] = useState(!!avis.visible_a_partir_de)
  const [visibleAt, setVisibleAt] = useState(toDatetimeLocalValue(avis.visible_a_partir_de))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isDone = avis.texte && avis.texte.trim().length > 0

  const handleSave = async () => {
    if (!texte.trim()) return toast.error(t('Le texte ne peut pas être vide'))
    if (programmer && !visibleAt) return toast.error(t('Choisis une date de publication'))
    setSaving(true)
    try {
      const visible_a_partir_de = programmer && visibleAt ? new Date(visibleAt).toISOString() : null
      await api.put(`/stripe/avis/${avis.id}`, { texte, nb_etoiles: etoiles, visible_a_partir_de })
      toast.success(t('Avis sauvegardé !'))
      onSave(avis.id, texte, etoiles, visible_a_partir_de)
    } catch (e) {
      toast.error(e.response?.data?.error || t('Erreur'))
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm(t('Supprimer cet avis ? Cette action est irréversible.'))) return
    setDeleting(true)
    await onDelete()
    setDeleting(false)
  }

  return (
    <div className={`border rounded-xl p-4 space-y-3 ${isDone ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">#{avis.id}</span>
          {isDone
            ? <span className="badge-green text-xs">{t('Rempli')}</span>
            : <span className="badge-amber text-xs">{t('À remplir')}</span>
          }
        </div>

        <div className="flex items-center gap-3">
          {/* Étoiles */}
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setEtoiles(n)}>
                <Star size={16} className={n <= etoiles ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
              </button>
            ))}
          </div>

          {/* Suppression — le rédacteur a arrêté de travailler sur cet avis */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            title={t('Supprimer cet avis')}
            className="text-slate-300 hover:text-red-500 active:scale-95 transition-all disabled:opacity-50 dark:text-slate-500 dark:hover:text-red-400"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>

      <textarea
        className="input min-h-[80px] text-sm resize-none"
        placeholder={t('Texte de l\'avis...')}
        value={texte}
        onChange={e => setTexte(e.target.value)}
      />

      {/* Planification — visibilité aux membres */}
      <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CalendarClock size={13} />
            {t('Visible par les membres')}
          </span>
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-full p-0.5 text-xs">
            <button
              onClick={() => setProgrammer(false)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${!programmer ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
            >
              {t('Immédiat')}
            </button>
            <button
              onClick={() => setProgrammer(true)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${programmer ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
            >
              {t('Programmer')}
            </button>
          </div>
        </div>
        {programmer && (
          <input
            type="datetime-local"
            className="input text-sm"
            value={visibleAt}
            onChange={e => setVisibleAt(e.target.value)}
          />
        )}
        {avis.visible_a_partir_de && (
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock3 size={11} />
            {t('Programmé pour le')}{' '}{new Date(avis.visible_a_partir_de.replace(' ', 'T') + 'Z').toLocaleString(locale(), { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !texte.trim()}
        className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-xs font-medium flex items-center justify-center gap-1 active:scale-95 transition-all disabled:opacity-50"
      >
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
        {saving ? t('Sauvegarde...') : t('Sauvegarder')}
      </button>
    </div>
  )
}

function CommandeCard({ commande, onAvisDeleted }) {
  const [open, setOpen] = useState(false)
  const [avis, setAvis] = useState([])
  const [loadingAvis, setLoadingAvis] = useState(false)

  const nbRemplis = commande.nb_avis_remplis || 0
  const nbTotal = commande.nb_avis_total || commande.nb_avis || 0
  const nbPublies = commande.nb_publies || 0
  const nbEnCours = commande.nb_en_cours || 0
  const progress = nbTotal > 0 ? (nbRemplis / nbTotal) * 100 : 0
  const isComplete = nbRemplis >= nbTotal && nbTotal > 0
  const titre = commande.nom_etablissement || t('Commande')

  const loadAvis = async () => {
    if (avis.length > 0) return
    setLoadingAvis(true)
    try {
      const r = await api.get(`/stripe/commande/${commande.id}/avis`)
      setAvis(r.data)
    } catch { toast.error(t('Erreur chargement avis')) }
    setLoadingAvis(false)
  }

  const handleToggle = () => {
    setOpen(!open)
    if (!open) loadAvis()
  }

  const handleSave = (id, texte, etoiles, visible_a_partir_de) => {
    setAvis(prev => prev.map(a => a.id === id ? { ...a, texte, nb_etoiles: etoiles, visible_a_partir_de } : a))
  }

  const handleDeleteAvis = async (avisToDelete) => {
    try {
      const r = await api.delete(`/stripe/avis/${avisToDelete.id}`)
      setAvis(prev => prev.filter(a => a.id !== avisToDelete.id))
      toast.success(t('Avis supprimé'))
      const wasRempli = avisToDelete.texte && avisToDelete.texte.trim().length > 0
      onAvisDeleted(commande.id, r.data?.commande_supprimee, wasRempli)
    } catch (e) {
      toast.error(e.response?.data?.error || t('Erreur suppression'))
    }
  }

  if (commande.statut === 'en_attente') {
    const montant = parseFloat(commande.montant)
    return (
      <div className="card p-5 border-l-4 border-l-amber-400 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white truncate">{titre}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('{nb_avis} avis', { nb_avis: commande.nb_avis })}{commande.nb_avis_bonus > 0 && ' ' + tn(commande.nb_avis_bonus, '(+{n} offert)', '(+{n} offerts)')}{' '}{t('· commandé le {date}', { date: new Date(commande.created_at).toLocaleDateString(locale()) })}
            </p>
          </div>
          <span className="badge-amber text-xs shrink-0">{t('Paiement attendu')}</span>
        </div>

        <a href={lienPaypal(montant)} target="_blank" rel="noreferrer" className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
          <Wallet size={16} />{' '}{t('Payer {montant}€ avec PayPal', { montant: montant.toFixed(2) })}
        </a>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('Déjà payé ? Rien à faire de ton côté : on active ta commande dès qu\'on voit le paiement, en général sous 12 h. Tu pourras ensuite écrire les textes de tes avis ici.')}
        </p>
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{titre}</p>
            {isComplete
              ? <span className="badge-green text-xs">{t('Textes complets')}</span>
              : <span className="badge-amber text-xs">{tn(nbTotal - nbRemplis, '{n} texte à écrire', '{n} textes à écrire')}</span>
            }
          </div>
          <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-full max-w-xs">
            <div
              className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-sky-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{tn(nbPublies, '{n} publié sur Google', '{n} publiés sur Google')}</span>
            {nbEnCours > 0 && <>{' '}{t('· {nbEnCours} en cours', { nbEnCours })}</>}
            {' '}{t('sur {nbTotal} · {date}', { nbTotal, date: new Date(commande.created_at).toLocaleDateString(locale()) })}
          </p>
        </div>
        {open ? <ChevronUp size={18} className="text-slate-500 dark:text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-500 dark:text-slate-400 shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springSheet}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-700"
          >
            <div className="p-4 space-y-3">
              {loadingAvis ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-sky-500" />
                </div>
              ) : avis.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">{t('Aucun avis trouvé')}</p>
              ) : (
                avis.map(a => (
                  <AvisEditor key={a.id} avis={a} onSave={handleSave} onDelete={() => handleDeleteAvis(a)} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ClientCommandes() {
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useSearchParams()
  const retourCarte = params.get('paiement') === 'ok'

  useEffect(() => {
    api.get('/stripe/commandes')
      .then(r => setCommandes(r.data))
      .catch(() => toast.error(t('Erreur chargement')))
      .finally(() => setLoading(false))
  }, [])

  // Retour de Stripe : la commande est créée par la confirmation que Stripe
  // envoie à notre serveur, ça prend quelques secondes. On recharge la liste
  // tant qu'elle n'a pas bougé (3 essais), sans jamais se fier à l'adresse
  // de retour pour considérer la commande comme payée.
  useEffect(() => {
    if (!retourCarte) return
    let annule = false
    const delais = [3000, 7000, 12000]
    const timers = delais.map(d => setTimeout(() => {
      api.get('/stripe/commandes')
        .then(r => { if (!annule) setCommandes(r.data) })
        .catch(() => {})
    }, d))
    return () => { annule = true; timers.forEach(clearTimeout) }
  }, [retourCarte])

  const fermerRetour = () => {
    const p = new URLSearchParams(params)
    p.delete('paiement')
    setParams(p, { replace: true })
  }

  // Un avis vient d'être supprimé dans une commande. Si le backend indique
  // que la commande ne contient plus rien, elle disparaît de la liste tout
  // de suite (sans attendre un rechargement) ; sinon on recale juste ses
  // compteurs pour garder la barre de progression exacte.
  const handleAvisDeleted = (commandeId, commandeSupprimee, wasRempli) => {
    setCommandes(prev => {
      if (commandeSupprimee) return prev.filter(c => c.id !== commandeId)
      return prev.map(c => c.id === commandeId
        ? {
            ...c,
            nb_avis: Math.max((c.nb_avis || 0) - 1, 0),
            nb_avis_total: Math.max((c.nb_avis_total || 0) - 1, 0),
            nb_avis_remplis: Math.max((c.nb_avis_remplis || 0) - (wasRempli ? 1 : 0), 0),
          }
        : c
      )
    })
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 size={28} className="animate-spin text-sky-500" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">{t('Mes commandes')}</h1>
        <p className="text-muted mt-1">{t('Suis tes avis et écris leurs textes pour qu\'ils puissent être publiés')}</p>
      </div>

      {retourCarte && (
        <div className="card p-4 bg-emerald-50 dark:bg-emerald-900/20 flex items-start gap-2.5" role="status">
          <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{t('Paiement par carte reçu')}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
              {t('Ta commande s\'active en quelques secondes. Si elle n\'apparaît pas encore, recharge la page dans une minute.')}
            </p>
          </div>
          <button onClick={fermerRetour} className="text-xs text-emerald-600 dark:text-emerald-400 underline">{t('Fermer')}</button>
        </div>
      )}

      {commandes.length === 0 ? (
        <div className="card p-10 text-center space-y-3">
          <ShoppingBag size={32} className="text-slate-300 mx-auto" />
          <p className="font-medium text-slate-600 dark:text-slate-400">{t('Aucune commande pour le moment')}</p>
          <Link to="/client/payer" className="btn-primary inline-flex px-5 py-2.5 text-sm">{t('Commander des avis')}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {commandes.map(c => <CommandeCard key={c.id} commande={c} onAvisDeleted={handleAvisDeleted} />)}
        </div>
      )}
    </div>
  )
}
