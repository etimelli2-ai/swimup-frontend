import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../lib/api'
import { CreditCard, Star, Building, Link, Clock, Loader2, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

const PRIX_AVIS = 3

// Ton lien PayPal.me (ou bouton PayPal hébergé) — configure VITE_PAYPAL_ME
// dans les variables d'environnement du frontend (Vercel/Railway) avec ton
// vrai identifiant, ex: https://paypal.me/tonpseudo
const PAYPAL_ME = import.meta.env.VITE_PAYPAL_ME || 'https://paypal.me/tonpseudo'

export default function ClientPaiement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [loading, setLoading] = useState(false)
  const [commandeEnvoyee, setCommandeEnvoyee] = useState(null) // { montant }
  const [form, setForm] = useState({
    nom_etablissement:  '',
    type_etablissement: '',
    lien_maps:          '',
    nb_etoiles:         '5',
    delai_paiement:     '30',
    nb_avis:            '1',
  })

  const nb = parseInt(form.nb_avis) || 1
  const total = nb * PRIX_AVIS

  const handleCommander = async () => {
    if (!form.nom_etablissement) return toast.error('Entre le nom de l\'établissement')
    if (!form.lien_maps) return toast.error('Entre le lien Google Maps')
    if (nb < 1) return toast.error('Minimum 1 avis')

    setLoading(true)
    try {
      const r = await api.post('/stripe/create-checkout-session', {
        nb_avis:            nb,
        nom_etablissement:  form.nom_etablissement,
        lien_maps:          form.lien_maps,
        type_etablissement: form.type_etablissement,
        delai_paiement:     parseInt(form.delai_paiement) || 30,
        nb_etoiles:         parseInt(form.nb_etoiles) || 5,
      })

      if (isAdmin) {
        // Admin — avis créés directement, pas de validation ni de paiement
        navigate('/client/success?session_id=' + r.data.session_id)
      } else {
        // Client — commande envoyée à l'admin pour validation, paiement PayPal en direct
        setCommandeEnvoyee({ montant: r.data.montant })
        toast.success('Commande envoyée !')
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la création')
    }
    setLoading(false)
  }

  if (commandeEnvoyee) {
    const lienPaypal = `${PAYPAL_ME}/${commandeEnvoyee.montant.toFixed(2)}EUR`
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center space-y-5"
        >
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={30} className="text-sky-500" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-slate-900 dark:text-white tracking-tight">Commande envoyée</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Règle {commandeEnvoyee.montant.toFixed(2)}€ via PayPal, ta commande sera validée dès réception du paiement.
            </p>
          </div>

          <a
            href={lienPaypal}
            target="_blank"
            rel="noreferrer"
            className="btn-primary w-full text-base py-3.5"
          >
            Payer {commandeEnvoyee.montant.toFixed(2)}€ avec PayPal
          </a>

          <div className="flex flex-col gap-3 pt-2">
            <button onClick={() => navigate('/client/commandes')} className="btn-secondary w-full">
              <ArrowRight size={16} />
              Voir mes commandes
            </button>
            <button onClick={() => navigate('/client')} className="btn-ghost w-full">
              Retour au dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const etoilesLabel = n => ({
    1: 'Très mauvais', 2: 'Mauvais', 3: 'Moyen',
    4: 'Bien', 5: 'Excellent'
  }[parseInt(n)] || 'Excellent')

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
      <div>
        <h1 className="page-title">
          {isAdmin ? 'Commander des avis (Admin)' : 'Commander des avis'}
        </h1>
        <p className="text-muted mt-1">
          {isAdmin
            ? 'En tant qu\'admin, les avis sont créés gratuitement et immédiatement.'
            : 'Remplis les informations, commande, puis règle par PayPal'
          }
        </p>
      </div>

      {isAdmin && (
        <div className="card p-4 bg-emerald-50 dark:bg-emerald-900/20 flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Mode admin — paiement bypassé
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
              Les avis seront créés directement sans facturation.
            </p>
          </div>
        </div>
      )}

      <div className="card p-5 space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <Building size={18} className="text-sky-500" />
          Informations établissement
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Nom de l'établissement <span className="text-red-500">*</span>
          </label>
          <input className="input" placeholder="Ex: Restaurant Le Petit Bistro"
            value={form.nom_etablissement}
            onChange={e => setForm(p => ({ ...p, nom_etablissement: e.target.value }))} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Type d'établissement
          </label>
          <input className="input" placeholder="Ex: restaurant, hôtel, couvreur..."
            value={form.type_etablissement}
            onChange={e => setForm(p => ({ ...p, type_etablissement: e.target.value }))} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
            <Link size={14} className="text-slate-400" />
            Lien Google Maps <span className="text-red-500">*</span>
          </label>
          <input className="input" placeholder="https://maps.google.com/..."
            value={form.lien_maps}
            onChange={e => setForm(p => ({ ...p, lien_maps: e.target.value }))} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Star size={14} className="text-slate-400" />
              Étoiles
            </label>
            <select className="input" value={form.nb_etoiles}
              onChange={e => setForm(p => ({ ...p, nb_etoiles: e.target.value }))}>
              <option value="1">1 étoile</option>
              <option value="2">2 étoiles</option>
              <option value="3">3 étoiles</option>
              <option value="4">4 étoiles</option>
              <option value="5">5 étoiles</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">{etoilesLabel(form.nb_etoiles)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Clock size={14} className="text-slate-400" />
              Délai paiement
            </label>
            <input className="input" type="number" min="7" max="90" placeholder="30"
              value={form.delai_paiement}
              onChange={e => setForm(p => ({ ...p, delai_paiement: e.target.value }))} />
            <p className="text-xs text-slate-400 mt-1">jours</p>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <CreditCard size={18} className="text-sky-500" />
          Quantité {!isAdmin && 'et paiement'}
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Nombre d'avis
          </label>
          <input className="input" type="number" min="1" max="50"
            value={form.nb_avis}
            onChange={e => setForm(p => ({ ...p, nb_avis: e.target.value }))} />
        </div>

        {/* Récap prix */}
        <div className={`rounded-xl p-4 space-y-2 ${isAdmin ? 'bg-green-50 dark:bg-green-900/20' : 'bg-sky-50 dark:bg-sky-900/20'}`}>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {nb} avis × {isAdmin ? '0€ (admin)' : `${PRIX_AVIS}€`}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {isAdmin ? '0.00€' : `${total.toFixed(2)}€`}
            </span>
          </div>
          <div className={`flex justify-between text-sm border-t pt-2 ${isAdmin ? 'border-green-100 dark:border-green-800' : 'border-sky-100 dark:border-sky-800'}`}>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Total</span>
            <span className={`font-semibold text-lg ${isAdmin ? 'text-green-600 dark:text-green-400' : 'text-sky-600 dark:text-sky-400'}`}>
              {isAdmin ? 'Gratuit' : `${total.toFixed(2)}€`}
            </span>
          </div>
        </div>

        {!isAdmin && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>Paiement par PayPal, en direct</p>
            <p>L'admin valide ta commande dès réception du paiement</p>
            <p>Une fois validée, tu pourras remplir les textes de tes avis</p>
          </div>
        )}

        <button
          onClick={handleCommander}
          disabled={loading || !form.nom_etablissement || !form.lien_maps}
          className={`w-full text-base py-3.5 font-medium rounded-full flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all ${
            isAdmin
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'btn-primary'
          }`}
        >
          {loading ? (
            <><Spinner /> Envoi...</>
          ) : isAdmin ? (
            <><CheckCircle2 size={18} /> Créer {nb} avis gratuitement</>
          ) : (
            <><CreditCard size={18} /> Commander {total.toFixed(2)}€</>
          )}
        </button>
      </div>
    </div>
  )
}
