import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { ShoppingBag, Package, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

export default function Boutique() {
  const { user } = useAuth()
  const [produits, setProduits]   = useState([])
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading]     = useState(true)
  const [ordering, setOrdering]   = useState(null)
  const [tab, setTab]             = useState('boutique')
  const [quantites, setQuantites] = useState({})

  const load = async () => {
    try {
      const [p, c] = await Promise.all([
        api.get('/boutique/produits'),
        api.get('/boutique/mes-commandes'),
      ])
      setProduits(p.data)
      setCommandes(c.data)
    } catch {
      toast.error('Erreur chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const commander = async (produit) => {
    const qty = quantites[produit.id] || 1
    const total = produit.prix * qty

    if (parseFloat(user?.solde || 0) < total) {
      return toast.error(`Solde insuffisant — tu as ${parseFloat(user?.solde || 0).toFixed(2)}€, il faut ${total.toFixed(2)}€`)
    }

    if (!confirm(`Commander ${produit.nom} x${qty} pour ${total.toFixed(2)}€ ?`)) return

    setOrdering(produit.id)
    try {
      const r = await api.post('/boutique/commander', { produit_id: produit.id, quantite: qty })
      toast.success(r.data.message)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
    }
    setOrdering(null)
  }

  const statutBadge = s => ({
    en_attente: <span className="badge-yellow">⏳ En attente</span>,
    confirmee:  <span className="badge-blue">✅ Confirmée</span>,
    livree:     <span className="badge-green">📦 Livrée</span>,
    annulee:    <span className="badge-red">❌ Annulée</span>,
  }[s] || <span className="badge-gray">{s}</span>)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-sky-500" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">🛍️ Boutique</h1>
          <p className="text-muted mt-1">Dépense ton solde SwimUp sur des produits exclusifs</p>
        </div>
        <div className="stat-card px-4 py-2 text-center">
          <p className="text-lg font-black text-sky-600 dark:text-sky-400">
            {parseFloat(user?.solde || 0).toFixed(2)}€
          </p>
          <p className="text-xs text-slate-400">ton solde</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('boutique')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === 'boutique'
              ? 'bg-sky-500 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          🛍️ Produits
        </button>
        <button
          onClick={() => setTab('commandes')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === 'commandes'
              ? 'bg-sky-500 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          📦 Mes commandes {commandes.length > 0 && `(${commandes.length})`}
        </button>
      </div>

      {/* Produits */}
      {tab === 'boutique' && (
        <div className="space-y-4">
          {produits.length === 0 ? (
            <div className="card p-10 text-center">
              <ShoppingBag size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-600 dark:text-slate-400">Aucun produit disponible</p>
              <p className="text-sm text-slate-400 mt-1">Reviens plus tard !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {produits.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-0 overflow-hidden"
                >
                  {/* Image */}
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.nom}
                      className="w-full h-48 object-cover"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <Package size={40} className="text-slate-300" />
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{p.nom}</h3>
                        {p.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{p.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-sky-600 dark:text-sky-400">
                          {parseFloat(p.prix).toFixed(2)}€
                        </p>
                        {p.stock === -1 ? (
                          <p className="text-xs text-emerald-500">∞ En stock</p>
                        ) : p.stock === 0 ? (
                          <p className="text-xs text-red-500">Rupture</p>
                        ) : (
                          <p className="text-xs text-slate-400">{p.stock} restant{p.stock > 1 ? 's' : ''}</p>
                        )}
                      </div>
                    </div>

                    {/* Quantité */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantites(q => ({ ...q, [p.id]: Math.max(1, (q[p.id] || 1) - 1) }))}
                        className="w-8 h-8 border-2 border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center font-bold hover:bg-slate-50 dark:hover:bg-slate-700"
                      >−</button>
                      <span className="w-8 text-center font-bold dark:text-white">{quantites[p.id] || 1}</span>
                      <button
                        onClick={() => setQuantites(q => ({ ...q, [p.id]: (q[p.id] || 1) + 1 }))}
                        className="w-8 h-8 border-2 border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center font-bold hover:bg-slate-50 dark:hover:bg-slate-700"
                      >+</button>
                      <span className="text-sm text-slate-400 ml-1">
                        = <strong className="text-slate-700 dark:text-slate-200">
                          {(parseFloat(p.prix) * (quantites[p.id] || 1)).toFixed(2)}€
                        </strong>
                      </span>
                    </div>

                    <button
                      onClick={() => commander(p)}
                      disabled={ordering === p.id || p.stock === 0}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {ordering === p.id
                        ? <><Spinner /> Commande...</>
                        : p.stock === 0
                          ? '❌ Rupture de stock'
                          : '🛍️ Commander'
                      }
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mes commandes */}
      {tab === 'commandes' && (
        <div className="space-y-3">
          {commandes.length === 0 ? (
            <div className="card p-10 text-center">
              <Package size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-600 dark:text-slate-400">Aucune commande</p>
              <p className="text-sm text-slate-400 mt-1">Commande un produit pour commencer !</p>
            </div>
          ) : (
            commandes.map(c => (
              <div key={c.id} className="card p-4 flex items-center gap-4">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.nom}
                    className="w-16 h-16 object-cover rounded-xl shrink-0"
                    onError={e => { e.target.style.display = 'none' }} />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                    <Package size={24} className="text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{c.nom}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    x{c.quantite} · {parseFloat(c.montant).toFixed(2)}€
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="shrink-0">
                  {statutBadge(c.statut)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
