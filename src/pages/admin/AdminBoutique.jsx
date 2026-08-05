import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Package, Plus, Trash2, Edit3, ShoppingBag, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

const STATUTS = ['en_attente', 'confirmee', 'livree', 'annulee']

export default function AdminBoutique() {
  const [produits, setProduits]     = useState([])
  const [commandes, setCommandes]   = useState([])
  const [tab, setTab]               = useState('produits')
  const [loading, setLoading]       = useState(true)
  const [loadingAction, setLA]      = useState(null)
  const [showForm, setShowForm]     = useState(false)
  const [editProduit, setEdit]      = useState(null)
  const [form, setForm] = useState({
    nom: '', description: '', prix: '', stock: '-1', image_url: '', actif: true
  })

  const load = async () => {
    try {
      const [p, c] = await Promise.all([
        api.get('/boutique/admin/produits'),
        api.get('/boutique/admin/commandes'),
      ])
      setProduits(p.data)
      setCommandes(c.data)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ nom: '', description: '', prix: '', stock: '-1', image_url: '', actif: true })
    setEdit(null)
    setShowForm(false)
  }

  const sauvegarder = async () => {
    if (!form.nom || !form.prix) return toast.error('Nom et prix requis')
    setLA('save')
    try {
      if (editProduit) {
        await api.put(`/boutique/admin/produits/${editProduit.id}`, form)
        toast.success('Produit modifié !')
      } else {
        await api.post('/boutique/admin/produits', form)
        toast.success('Produit ajouté !')
      }
      resetForm()
      load()
    } catch (e) { toast.error(e.response?.data?.error || 'Erreur') }
    setLA(null)
  }

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    setLA(`del_${id}`)
    try {
      await api.delete(`/boutique/admin/produits/${id}`)
      toast.success('Produit supprimé !')
      load()
    } catch { toast.error('Erreur') }
    setLA(null)
  }

  const changerStatut = async (commandeId, statut) => {
    setLA(`statut_${commandeId}`)
    try {
      await api.put(`/boutique/admin/commandes/${commandeId}`, { statut })
      toast.success('Statut mis à jour !')
      load()
    } catch (e) { toast.error(e.response?.data?.error || 'Erreur') }
    setLA(null)
  }

  const ouvrirEdit = (p) => {
    setEdit(p)
    setForm({
      nom: p.nom, description: p.description || '',
      prix: String(p.prix), stock: String(p.stock),
      image_url: p.image_url || '', actif: !!p.actif
    })
    setShowForm(true)
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
        <h1 className="page-title">🛍️ Boutique</h1>
        {tab === 'produits' && (
          <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="btn-primary">
            <Plus size={16} /> Ajouter
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('produits')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'produits' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
          📦 Produits ({produits.length})
        </button>
        <button onClick={() => setTab('commandes')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'commandes' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
          🛍️ Commandes ({commandes.length})
        </button>
      </div>

      {/* Formulaire ajout/edit */}
      {tab === 'produits' && showForm && (
        <div className="card p-5 space-y-4 border-2 border-sky-200 dark:border-sky-800">
          <h2 className="section-title">{editProduit ? '✏️ Modifier le produit' : '➕ Nouveau produit'}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom *</label>
              <input className="input" placeholder="Ex: Carte cadeau Amazon"
                value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prix (€) *</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="9.99"
                value={form.prix} onChange={e => setForm(p => ({ ...p, prix: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea className="input min-h-[80px] resize-none" placeholder="Description du produit..."
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Stock (-1 = illimité)
              </label>
              <input className="input" type="number" min="-1" placeholder="-1"
                value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL Image</label>
              <input className="input" placeholder="https://..."
                value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} />
            </div>
          </div>

          {form.image_url && (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <img src={form.image_url} alt="Preview" className="w-full h-40 object-cover"
                onError={e => { e.target.style.display = 'none' }} />
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.actif}
                onChange={e => setForm(p => ({ ...p, actif: e.target.checked }))}
                className="w-4 h-4 accent-sky-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Produit actif (visible)</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button onClick={sauvegarder} disabled={loadingAction === 'save'} className="btn-primary flex-1">
              {loadingAction === 'save' ? <><Spinner /> Sauvegarde...</> : '💾 Sauvegarder'}
            </button>
            <button onClick={resetForm} className="btn-secondary flex-1">Annuler</button>
          </div>
        </div>
      )}

      {/* Liste produits */}
      {tab === 'produits' && (
        <div className="space-y-3">
          {produits.length === 0 ? (
            <div className="card p-10 text-center">
              <Package size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-500">Aucun produit — clique sur Ajouter !</p>
            </div>
          ) : produits.map(p => (
            <div key={p.id} className={`card p-4 flex items-center gap-4 ${!p.actif ? 'opacity-50' : ''}`}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.nom}
                  className="w-16 h-16 object-cover rounded-xl shrink-0"
                  onError={e => { e.target.style.display = 'none' }} />
              ) : (
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                  <Package size={24} className="text-slate-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{p.nom}</p>
                  {!p.actif && <span className="badge-gray text-xs">Masqué</span>}
                </div>
                {p.description && (
                  <p className="text-xs text-slate-400 truncate">{p.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sky-600 dark:text-sky-400 font-bold">{parseFloat(p.prix).toFixed(2)}€</span>
                  <span className="text-xs text-slate-400">
                    Stock : {p.stock === -1 ? '∞ illimité' : p.stock === 0 ? '❌ épuisé' : `${p.stock} restant(s)`}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button onClick={() => ouvrirEdit(p)}
                  className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <Edit3 size={16} className="text-slate-600 dark:text-slate-300" />
                </button>
                <button onClick={() => supprimer(p.id)} disabled={loadingAction === `del_${p.id}`}
                  className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  {loadingAction === `del_${p.id}`
                    ? <Spinner />
                    : <Trash2 size={16} className="text-red-500" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commandes */}
      {tab === 'commandes' && (
        <div className="space-y-3">
          {commandes.length === 0 ? (
            <div className="card p-10 text-center">
              <ShoppingBag size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-500">Aucune commande pour le moment</p>
            </div>
          ) : commandes.map(c => (
            <div key={c.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white">{c.produit_nom}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {c.email} · x{c.quantite} · {parseFloat(c.montant).toFixed(2)}€
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(c.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>{statutBadge(c.statut)}</div>
              </div>

              {c.statut !== 'livree' && c.statut !== 'annulee' && (
                <div className="flex gap-2 flex-wrap">
                  {STATUTS.filter(s => s !== c.statut).map(s => (
                    <button key={s} onClick={() => changerStatut(c.id, s)}
                      disabled={loadingAction === `statut_${c.id}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                        s === 'annulee' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                        s === 'livree'  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                      {loadingAction === `statut_${c.id}` ? '...' : {
                        en_attente: '⏳ En attente',
                        confirmee:  '✅ Confirmer',
                        livree:     '📦 Marquer livrée',
                        annulee:    '❌ Annuler',
                      }[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
