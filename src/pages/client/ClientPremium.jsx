import { useState, useEffect } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { Crown, CheckCircle2, ArrowRight, Percent, Sparkles, Zap, Check, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

// Ton lien PayPal.me (identique à ClientPaiement.jsx)
const PAYPAL_ME = import.meta.env.VITE_PAYPAL_ME || 'https://paypal.me/tonpseudo'

// Palette de couleurs de thème — doit rester alignée avec COULEURS_THEME
// côté backend (routes/client.js).
const PALETTE = [
  { key: 'sky',     hex: '#0ea5e9', label: 'Bleu' },
  { key: 'emerald', hex: '#10b981', label: 'Émeraude' },
  { key: 'violet',  hex: '#8b5cf6', label: 'Violet' },
  { key: 'amber',   hex: '#f59e0b', label: 'Ambre' },
  { key: 'rose',    hex: '#f43f5e', label: 'Rose' },
  { key: 'indigo',  hex: '#6366f1', label: 'Indigo' },
]

export default function ClientPremium() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [statut, setStatut] = useState(null) // { premium, premium_expire_at, demande_en_attente, montant }
  const [couleurEnvoi, setCouleurEnvoi] = useState(null)
  const [ticketEnvoi, setTicketEnvoi] = useState(false)
  const [ticket, setTicket] = useState({ sujet: '', message: '' })

  const load = () => api.get('/client/abonnement').then(r => setStatut(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const choisirCouleur = async (key) => {
    setCouleurEnvoi(key)
    try {
      const r = await api.put('/client/theme', { couleur: key })
      updateUser({ theme_color: r.data.theme_color })
      toast.success('Thème mis à jour !')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
    }
    setCouleurEnvoi(null)
  }

  const envoyerTicket = async () => {
    if (!ticket.sujet || !ticket.message) return toast.error('Sujet et message requis')
    setTicketEnvoi(true)
    try {
      await api.post('/client/ticket', ticket)
      toast.success('Ticket ouvert sur Discord !')
      setTicket({ sujet: '', message: '' })
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de l\'ouverture du ticket')
    }
    setTicketEnvoi(false)
  }

  const demander = async () => {
    setEnvoi(true)
    try {
      await api.post('/client/abonnement')
      toast.success('Demande envoyée !')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la demande')
    }
    setEnvoi(false)
  }

  if (loading) return null

  const montant = statut?.montant || 5
  const lienPaypal = `${PAYPAL_ME}/${montant.toFixed(2)}EUR`

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Crown size={22} className="text-amber-500" />
          Abonnement premium
        </h1>
        <p className="text-muted mt-1">
          {montant.toFixed(2)}€/mois — -10% sur toutes tes commandes et le statut premium
        </p>
      </div>

      {statut?.premium && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 text-center space-y-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10"
        >
          <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
            <Crown size={26} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-lg">Tu es premium !</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Actif jusqu'au {new Date(String(statut.premium_expire_at).replace(' ', 'T') + 'Z').toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button onClick={() => navigate('/client/payer')} className="btn-primary w-full">
            <ArrowRight size={16} />
            Commander des avis
          </button>
        </motion.div>
      )}

      {statut?.premium && (
        <div className="card p-5 space-y-4">
          <h2 className="section-title flex items-center gap-2">
            <Sparkles size={17} className="text-amber-500" />
            Couleur de ton espace
          </h2>
          <div className="flex flex-wrap gap-3">
            {PALETTE.map(c => (
              <button
                key={c.key}
                onClick={() => choisirCouleur(c.key)}
                disabled={couleurEnvoi !== null}
                title={c.label}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50 ring-2 ring-offset-2 dark:ring-offset-slate-800"
                style={{
                  backgroundColor: c.hex,
                  '--tw-ring-color': user?.theme_color === c.hex || (!user?.theme_color && c.key === 'sky') ? c.hex : 'transparent',
                }}
              >
                {(user?.theme_color === c.hex || (!user?.theme_color && c.key === 'sky')) && (
                  <Check size={16} className="text-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {statut?.premium && (
        <div className="card p-5 space-y-4">
          <h2 className="section-title flex items-center gap-2">
            <MessageCircle size={17} className="text-indigo-500" />
            Support prioritaire
          </h2>
          {!user?.discord_id ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Renseigne ton ID Discord dans ton <RouterLink to="/profil" className="text-sky-500 hover:underline">profil</RouterLink> pour pouvoir ouvrir un ticket.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Sujet</label>
                <input className="input" placeholder="Ex: Question sur ma commande"
                  value={ticket.sujet}
                  onChange={e => setTicket(p => ({ ...p, sujet: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
                <textarea className="input" rows={3} placeholder="Explique ta demande..."
                  value={ticket.message}
                  onChange={e => setTicket(p => ({ ...p, message: e.target.value }))} />
              </div>
              <button onClick={envoyerTicket} disabled={ticketEnvoi} className="btn-primary w-full">
                {ticketEnvoi ? <><Spinner /> Envoi...</> : <><MessageCircle size={16} /> Ouvrir un ticket sur Discord</>}
              </button>
            </>
          )}
        </div>
      )}

      {!statut?.premium && statut?.demande_en_attente && (
        <div className="card p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={30} className="text-sky-500" />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">Demande envoyée</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Règle {montant.toFixed(2)}€ via PayPal, ton abonnement sera activé dès réception du paiement.
            </p>
          </div>
          <a href={lienPaypal} target="_blank" rel="noreferrer" className="btn-primary w-full text-base py-3.5">
            Payer {montant.toFixed(2)}€ avec PayPal
          </a>
        </div>
      )}

      {!statut?.premium && !statut?.demande_en_attente && (
        <>
          <div className="card p-5 space-y-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 shrink-0">
                <Percent size={17} />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">-10% sur toutes tes commandes</p>
                <p className="text-[13px] text-slate-400 mt-0.5">Appliqué automatiquement dès l'activation.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-500 shrink-0">
                <Zap size={17} />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">Avis traités en priorité</p>
                <p className="text-[13px] text-slate-400 mt-0.5">Tes commandes sont marquées prioritaires pour les membres.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 shrink-0">
                <MessageCircle size={17} />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">Support prioritaire sur Discord</p>
                <p className="text-[13px] text-slate-400 mt-0.5">Ouvre un vrai ticket Discord directement depuis le site.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-500 shrink-0">
                <Sparkles size={17} />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">Personnalisation</p>
                <p className="text-[13px] text-slate-400 mt-0.5">Choisis la couleur d'accent de ton espace client.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>Paiement par PayPal, en direct</p>
            <p>L'admin valide ta demande dès réception du paiement</p>
            <p>Ton abonnement est valable 30 jours, renouvelable</p>
          </div>

          <button
            onClick={demander}
            disabled={envoi}
            className="btn-primary w-full text-base py-3.5"
          >
            {envoi ? <><Spinner /> Envoi...</> : <><Crown size={18} /> Demander l'abonnement ({montant.toFixed(2)}€/mois)</>}
          </button>
        </>
      )}
    </div>
  )
}
