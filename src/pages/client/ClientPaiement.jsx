import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      // Rediriger vers Stripe Checkout
      window.location.href = r.data.url
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la création du paiement')
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
        <h1 className="page-title">Commander des avis</h1>
        <p className="text-muted mt-1">Remplis les informations et paye pour débloquer tes avis</p>
      </div>

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
          Quantité et paiement
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
        <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">{nb} avis × {PRIX_AVIS}€</span>
            <span className="font-bold text-slate-900 dark:text-white">{total.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm border-t border-sky-100 dark:border-sky-800 pt-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Total à payer</span>
            <span className="font-extrabold text-sky-600 dark:text-sky-400 text-lg">{total.toFixed(2)}€</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>✅ Paiement sécurisé par Stripe</p>
          <p>✅ Après paiement, tu pourras remplir les textes de tes avis</p>
          <p>✅ Les avis seront visibles par les membres une fois les textes validés</p>
        </div>

        <button
          onClick={handlePayer}
          disabled={loading || !form.nom_etablissement || !form.lien_maps}
          className="btn-primary w-full text-base py-3 disabled:opacity-50"
        >
          {loading ? (
            <><Spinner /> Redirection vers Stripe...</>
          ) : (
            <><CreditCard size={18} /> Payer {total.toFixed(2)}€ avec Stripe</>
          )}
        </button>
      </div>
    </div>
  )
}
