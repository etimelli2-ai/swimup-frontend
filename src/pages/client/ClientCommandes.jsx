import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Star, ChevronDown, ChevronUp, Save, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const PRIX_AVIS = 3

const getPrompts = (nom, type, etoiles) => {
  const nb = parseInt(etoiles) || 5
  if (nb <= 2) return [`Écris un avis négatif authentique en français pour "${nom}" (${type || 'établissement'}). 2-3 phrases. Sans guillemets. Réponds UNIQUEMENT avec le texte.`]
  if (nb === 3) return [`Écris un avis mitigé en français pour "${nom}" (${type || 'établissement'}). 2-3 phrases équilibrées. Sans guillemets. Réponds UNIQUEMENT avec le texte.`]
  return [`Écris un avis positif et authentique en français pour "${nom}" (${type || 'établissement'}). 2-3 phrases naturelles. Sans guillemets. Réponds UNIQUEMENT avec le texte.`]
}

async function genererIA(nom, type, etoiles) {
  try {
    const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY
    const prompt = getPrompts(nom, type, etoiles)[0]
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Tu génères des avis Google authentiques. UNIQUEMENT le texte, sans guillemets, sans entités HTML.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200, temperature: 1.1,
      }),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim().replace(/^["'«»]|["'«»]$/g, '') || ''
  } catch { return '' }
}

function AvisEditor({ avis, onSave }) {
  const [texte, setTexte] = useState(avis.texte || '')
  const [etoiles, setEtoiles] = useState(avis.nb_etoiles || 5)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const isDone = avis.texte && avis.texte.trim().length > 0

  const handleSave = async () => {
    if (!texte.trim()) return toast.error('Le texte ne peut pas être vide')
    setSaving(true)
    try {
      await api.put(`/stripe/avis/${avis.id}`, { texte, nb_etoiles: etoiles })
      toast.success('Avis sauvegardé !')
      onSave(avis.id, texte, etoiles)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
    }
    setSaving(false)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    const t = await genererIA(avis.nom_etablissement, '', etoiles)
    if (t) setTexte(t)
    else toast.error('Erreur génération IA')
    setGenerating(false)
  }

  return (
    <div className={`border rounded-xl p-4 space-y-3 ${isDone ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">#{avis.id}</span>
          {isDone
            ? <span className="badge-green text-xs">✅ Rempli</span>
            : <span className="badge-amber text-xs">⚠️ À remplir</span>
          }
        </div>

        {/* Étoiles */}
        <div className="flex gap-1">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setEtoiles(n)}>
              <Star size={16} className={n <= etoiles ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="input min-h-[80px] text-sm resize-none"
        placeholder="Texte de l'avis..."
        value={texte}
        onChange={e => setTexte(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex-1 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
        >
          {generating ? <Loader2 size={12} className="animate-spin" /> : '✨'}
          {generating ? 'Génération...' : 'Générer IA'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !texte.trim()}
          className="flex-1 py-2 bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}

function CommandeCard({ commande }) {
  const [open, setOpen] = useState(false)
  const [avis, setAvis] = useState([])
  const [loadingAvis, setLoadingAvis] = useState(false)

  const nbRemplis = commande.nb_avis_remplis || 0
  const nbTotal = commande.nb_avis || 0
  const progress = nbTotal > 0 ? (nbRemplis / nbTotal) * 100 : 0
  const isComplete = nbRemplis >= nbTotal && nbTotal > 0

  const loadAvis = async () => {
    if (avis.length > 0) return
    setLoadingAvis(true)
    try {
      const r = await api.get(`/stripe/commande/${commande.id}/avis`)
      setAvis(r.data)
    } catch { toast.error('Erreur chargement avis') }
    setLoadingAvis(false)
  }

  const handleToggle = () => {
    setOpen(!open)
    if (!open) loadAvis()
  }

  const handleSave = (id, texte, etoiles) => {
    setAvis(prev => prev.map(a => a.id === id ? { ...a, texte, nb_etoiles: etoiles } : a))
  }

  return (
    <div className="card p-0 overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900 dark:text-white text-sm">
              {commande.nb_avis} avis — {parseFloat(commande.montant).toFixed(2)}€
            </p>
            {isComplete
              ? <span className="badge-green text-xs">✅ Complet</span>
              : <span className="badge-amber text-xs">{nbRemplis}/{nbTotal} remplis</span>
            }
          </div>
          <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-48">
            <div
              className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-sky-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(commande.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
        {open ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-700"
          >
            <div className="p-4 space-y-3">
              {loadingAvis ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-sky-500" />
                </div>
              ) : avis.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Aucun avis trouvé</p>
              ) : (
                avis.map(a => (
                  <AvisEditor key={a.id} avis={a} onSave={handleSave} />
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

  useEffect(() => {
    api.get('/stripe/commandes')
      .then(r => setCommandes(r.data))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 size={28} className="animate-spin text-sky-500" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Mes commandes</h1>
        <p className="text-muted mt-1">Remplis les textes de tes avis pour qu'ils soient visibles par les membres</p>
      </div>

      {commandes.length === 0 ? (
        <div className="card p-10 text-center">
          <AlertTriangle size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600 dark:text-slate-400">Aucune commande pour le moment</p>
          <p className="text-sm text-slate-400 mt-1">Commande des avis pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {commandes.map(c => <CommandeCard key={c.id} commande={c} />)}
        </div>
      )}
    </div>
  )
}
