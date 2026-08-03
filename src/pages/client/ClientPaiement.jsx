import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../lib/api'
import { CreditCard, Star, Building, Link, Clock, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

const PRIX_AVIS = 3

export default function ClientPaiement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [loading, setLoading] = useState(false)
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

  const handlePayer = async () => {
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
        // Admin — redirection directe sans Stripe
        navigate('/client/success?session_id=' + r.data.session_id)
      } else {
        window.location.href = r.data.url
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la création')
      setLoading(false)
    }
  }

  const etoilesLabel = n => ({
    1: '😡 Très mauvais', 2: '😞 Mauvais', 3: '😐 Moyen',
    4: '😊 Bien', 5: '🤩 Excellent'
  }[parseInt(n)] || 'Excellent')

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
      <div>
        <h1 className="page-title">
          {isAdmin ? '✅ Commander des avis (Admin)' : 'Commander des avis'}
        </h1>
        <p className="text-muted mt-1">
          {isAdmin
            ? 'En tant qu\'admin, les avis sont créés gratuitement et immédiatement.'
            : 'Remplis les informations et paie pour débloquer tes avis'
          }
        </p>
      </div>

      {isAdmin && (
        <div className="card p-4 border-2 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
            🛡️ Mode admin — paiement Stripe bypassé
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
            Les avis seront créés directement sans facturation.
          </p>
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
              <option value="1">⭐ 1</option>
              <option value="2">⭐⭐ 2</option>
              <option value="3">⭐⭐⭐ 3</option>
              <option value="4">⭐⭐⭐⭐ 4</option>
              <option value="5">⭐⭐⭐⭐⭐ 5</option>
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
            <span className="font-bold text-slate-900 dark:text-white">
              {isAdmin ? '0.00€' : `${total.toFixed(2)}€`}
            </span>
          </div>
          <div className={`flex justify-between text-sm border-t pt-2 ${isAdmin ? 'border-green-100 dark:border-green-800' : 'border-sky-100 dark:border-sky-800'}`}>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Total</span>
            <span className={`font-extrabold text-lg ${isAdmin ? 'text-green-600 dark:text-green-400' : 'text-sky-600 dark:text-sky-400'}`}>
              {isAdmin ? '✅ Gratuit' : `${total.toFixed(2)}€`}
            </span>
          </div>
        </div>

        {!isAdmin && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>✅ Paiement sécurisé par Stripe</p>
            <p>✅ Après paiement, tu pourras remplir les textes de tes avis</p>
            <p>✅ Les avis seront visibles par les membres une fois les textes validés</p>
          </div>
        )}

        <button
          onClick={handlePayer}
          disabled={loading || !form.nom_etablissement || !form.lien_maps}
          className={`w-full text-base py-3 font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all ${
            isAdmin
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'btn-primary'
          }`}
        >
          {loading ? (
            <><Spinner /> {isAdmin ? 'Création...' : 'Redirection vers Stripe...'}</>
          ) : isAdmin ? (
            <><span>✅</span> Créer {nb} avis gratuitement</>
          ) : (
            <><CreditCard size={18} /> Payer {total.toFixed(2)}€ avec Stripe</>
          )}
        </button>
      </div>
    </div>
  )
}
