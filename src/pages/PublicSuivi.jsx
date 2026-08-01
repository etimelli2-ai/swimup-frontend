import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, Clock, AlertCircle, Package, Star, MapPin, Mail, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'https://swimup-backend-production.up.railway.app/api'

const STATUTS = {
  en_attente: {
    label: 'En attente de paiement',
    color: 'bg-gray-100 text-gray-600 border-gray-300',
    icon: Clock,
    desc: 'La commande est en attente de confirmation du paiement.',
  },
  paye: {
    label: 'Payé — en attente de rédaction',
    color: 'bg-blue-50 text-blue-700 border-blue-300',
    icon: Package,
    desc: 'Paiement confirmé ! Un membre va bientôt rédiger ton avis.',
  },
  reserve: {
    label: 'En cours de rédaction',
    color: 'bg-amber-50 text-amber-700 border-amber-300',
    icon: Clock,
    desc: 'Un membre est en train de rédiger et publier ton avis. Sous peu !',
  },
  soumis: {
    label: 'Avis publié — vérification',
    color: 'bg-purple-50 text-purple-700 border-purple-300',
    icon: CheckCircle2,
    desc: 'L\'avis a été publié sur Google Maps. On vérifie qu\'il est bien en ligne.',
  },
  livre: {
    label: '✅ Livré !',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    icon: CheckCircle2,
    desc: 'Ton avis est en ligne et vérifié. Mission accomplie !',
  },
  annule: {
    label: 'Annulé',
    color: 'bg-red-50 text-red-700 border-red-300',
    icon: AlertCircle,
    desc: 'Commande annulée.',
  },
}

const TONS_LABELS = {
  enthousiaste: '🔥 Enthousiaste',
  naturel:      '😊 Naturel',
  neutre:       '😐 Neutre',
  drole:        '😂 Drôle',
  poetique:     '✨ Poétique',
  severe:       '😤 Sévère',
}

export default function PublicSuivi() {
  const [searchParams] = useSearchParams()
  const token   = searchParams.get('token')
  const success = searchParams.get('success') === '1'

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token de suivi manquant')
      setLoading(false)
      return
    }
    axios.get(`${API}/public/suivi/${token}`)
      .then(r => setData(r.data))
      .catch(() => setError('Commande introuvable — vérifie ton lien de suivi'))
      .finally(() => setLoading(false))
  }, [token])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4">
      <div className="max-w-md w-full border-2 border-[#1A1A1A] bg-white p-8 text-center space-y-4">
        <AlertCircle size={32} className="text-[#C73E1D] mx-auto" />
        <h1 className="font-black text-xl">Commande introuvable</h1>
        <p className="text-sm text-[#1A1A1A]/60">{error}</p>
        <Link to="/commander"
          className="inline-block bg-[#C73E1D] text-white px-6 py-3 font-bold text-sm border-2 border-[#C73E1D] hover:bg-[#A8331A] transition-colors">
          Passer une commande
        </Link>
      </div>
    </div>
  )

  const { order, avis } = data
  const statut = STATUTS[order.statut] || STATUTS.en_attente
  const StatusIcon = statut.icon
  const avisPublic = avis?.[0]

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1A1A1A]">

      {/* Header */}
      <header className="border-b-2 border-[#1A1A1A] bg-[#F7F5F0]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/commander" className="flex items-center gap-3">
            <div
              className="w-8 h-8 bg-[#C73E1D] flex items-center justify-center"
              style={{ transform: 'rotate(3deg)' }}
            >
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-black text-lg tracking-tight">SwimUp</span>
          </Link>
          <span className="text-xs text-[#1A1A1A]/50 font-mono">#{order.id}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Message succès paiement */}
        {success && order.statut !== 'en_attente' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-emerald-500 bg-emerald-50 p-4 flex items-start gap-3"
          >
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-700 text-sm">Paiement confirmé !</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Garde ce lien pour suivre ta commande. Un membre va bientôt s'en occuper.
              </p>
            </div>
          </motion.div>
        )}

        {/* Statut principal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-[#1A1A1A] bg-white p-6 space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/50">Statut</p>
              <div className={`inline-flex items-center gap-2 border-2 px-3 py-1.5 text-sm font-bold ${statut.color}`}>
                <StatusIcon size={14} />
                {statut.label}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/50">Total payé</p>
              <p className="text-2xl font-black">{parseFloat(order.montant).toFixed(2)}€</p>
            </div>
          </div>
          <p className="text-sm text-[#1A1A1A]/60 border-t-2 border-[#1A1A1A]/10 pt-4">
            {statut.desc}
          </p>
        </motion.div>

        {/* Progression */}
        <div className="border-2 border-[#1A1A1A] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/50 mb-4">Progression</p>
          <div className="space-y-3">
            {[
              { key: ['paye', 'reserve', 'soumis', 'livre'], label: '💳 Paiement reçu' },
              { key: ['reserve', 'soumis', 'livre'], label: '✍️ Rédaction en cours' },
              { key: ['soumis', 'livre'], label: '📤 Avis publié' },
              { key: ['livre'], label: '✅ Livré et vérifié' },
            ].map((step, i) => {
              const done = step.key.includes(order.statut)
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 border-2 border-[#1A1A1A] flex items-center justify-center text-xs font-bold shrink-0 ${done ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]/30'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <p className={`text-sm font-medium ${done ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/40'}`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Détails commande */}
        <div className="border-2 border-[#1A1A1A] bg-white p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/50">Détails</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail size={15} className="text-[#1A1A1A]/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-wide font-bold">Email</p>
                <p className="text-sm font-medium">{order.email}</p>
              </div>
            </div>

            {order.nom_etablissement && (
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-[#1A1A1A]/40 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-wide font-bold">Établissement</p>
                  <p className="text-sm font-medium">{order.nom_etablissement}</p>
                  {order.type_etablissement && (
                    <p className="text-xs text-[#1A1A1A]/50">{order.type_etablissement}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Star size={15} className="text-[#1A1A1A]/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-wide font-bold">Note demandée</p>
                <p className="text-sm font-medium">
                  {'★'.repeat(order.nb_etoiles)}{'☆'.repeat(5 - order.nb_etoiles)} ({order.nb_etoiles}/5)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-[#1A1A1A]/40 mt-0.5 shrink-0 text-sm">💬</span>
              <div>
                <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-wide font-bold">Ton</p>
                <p className="text-sm font-medium">{TONS_LABELS[order.ton] || order.ton}</p>
              </div>
            </div>

            {order.texte_avis && (
              <div className="border-t-2 border-[#1A1A1A]/10 pt-3">
                <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-wide font-bold mb-1">Texte personnalisé</p>
                <p className="text-sm text-[#1A1A1A]/70 italic">"{order.texte_avis}"</p>
              </div>
            )}
          </div>
        </div>

        {avisPublic?.lien_avis_poste && (
  <div className="border-2 border-emerald-500 bg-emerald-50 p-5 space-y-2">
    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Avis publié</p>
    <p className="text-sm text-emerald-700 underline break-all font-medium">
      <a href={avisPublic.lien_avis_poste} target="_blank" rel="noreferrer">
        {avisPublic.lien_avis_poste}
      </a>
    </p>
  </div>
)}

        {/* Copier le lien de suivi */}
        <div className="border-2 border-[#1A1A1A] bg-white p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/50">
            Lien de suivi — garde-le précieusement
          </p>
          <div className="flex gap-2">
            <div className="flex-1 border-2 border-[#1A1A1A]/20 bg-[#F7F5F0] px-3 py-2 text-xs font-mono text-[#1A1A1A]/60 truncate">
              {window.location.href}
            </div>
            <button
              onClick={copyLink}
              className="border-2 border-[#1A1A1A] bg-white px-3 py-2 text-sm hover:bg-[#F0EDE8] transition-colors"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-xs text-[#1A1A1A]/50">
            Pas d'email de suivi automatique. Ce lien est ta seule façon de suivre ta commande.
          </p>
        </div>

        {/* CTA compte */}
        <div className="border-2 border-[#1A1A1A] bg-[#1A1A1A] text-white p-5 space-y-3">
          <p className="font-black">Tu commandes souvent ?</p>
          <p className="text-sm text-white/70">
            Crée un compte gratuit et paie 3€/avis au lieu de 4€.
            Suivi intégré, notifications, historique.
          </p>
          <Link
            to="/register"
            className="inline-block bg-[#C73E1D] text-white px-5 py-2.5 font-bold text-sm border-2 border-[#C73E1D] hover:bg-[#A8331A] transition-colors"
          >
            Créer un compte gratuit →
          </Link>
        </div>

      </main>

      <footer className="border-t-2 border-[#1A1A1A] mt-16 py-6">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between text-xs text-[#1A1A1A]/50">
          <span>© 2025 SwimUp</span>
          <Link to="/commander" className="underline hover:text-[#1A1A1A]">Nouvelle commande</Link>
        </div>
      </footer>
    </div>
  )
}
