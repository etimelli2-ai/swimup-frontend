import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, Clock, AlertCircle, Package, Star, MapPin, Mail, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'https://swimup-backend-production.up.railway.app/api'

const STATUTS = {
  en_attente: {
    label: 'En attente de paiement',
    color: 'bg-slate-100 text-slate-600',
    icon: Clock,
    desc: 'La commande est en attente de confirmation du paiement.',
  },
  paye: {
    label: 'Payé — en attente de rédaction',
    color: 'bg-sky-50 text-sky-700',
    icon: Package,
    desc: 'Paiement confirmé ! Un membre va bientôt rédiger ton avis.',
  },
  reserve: {
    label: 'En cours de rédaction',
    color: 'bg-amber-50 text-amber-700',
    icon: Clock,
    desc: 'Un membre est en train de rédiger et publier ton avis. Sous peu !',
  },
  soumis: {
    label: 'Avis publié — vérification',
    color: 'bg-violet-50 text-violet-700',
    icon: CheckCircle2,
    desc: 'L\'avis a été publié sur Google Maps. On vérifie qu\'il est bien en ligne.',
  },
  livre: {
    label: 'Livré !',
    color: 'bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
    desc: 'Ton avis est en ligne et vérifié. Mission accomplie !',
  },
  annule: {
    label: 'Annulé',
    color: 'bg-red-50 text-red-700',
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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <AlertCircle size={26} className="text-red-500" />
        </div>
        <h1 className="font-semibold text-[22px] tracking-tight text-slate-900">Commande introuvable</h1>
        <p className="text-[15px] text-slate-500">{error}</p>
        <Link to="/commander" className="btn-primary inline-flex px-6 py-3">
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
    <div className="min-h-screen bg-white text-slate-900">

      {/* Nav */}
      <header className="sticky top-0 z-20 bg-[#1d1d1f]/95 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/commander" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center">
              <Star size={12} className="text-white fill-white" />
            </div>
            <span className="text-white text-[15px] font-semibold tracking-tight">SwimUp</span>
          </Link>
          <span className="text-[12px] text-slate-400 font-mono">#{order.id}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 space-y-10">

        {/* Message succès paiement */}
        {success && order.statut !== 'en_attente' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-emerald-50 p-4 flex items-start gap-3"
          >
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-700 text-[14px]">Paiement confirmé !</p>
              <p className="text-[13px] text-emerald-600 mt-0.5">
                Garde ce lien pour suivre ta commande. Un membre va bientôt s'en occuper.
              </p>
            </div>
          </motion.div>
        )}

        {/* Statut principal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-5"
        >
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold ${statut.color}`}>
            <StatusIcon size={15} />
            {statut.label}
          </div>
          <p className="text-[16px] text-slate-500 leading-relaxed max-w-md mx-auto font-light">
            {statut.desc}
          </p>
          <p className="text-[40px] font-semibold tracking-tight text-slate-900">
            {parseFloat(order.montant).toFixed(2)}€
          </p>
          <p className="text-[13px] text-slate-400 -mt-4">Total payé</p>
        </motion.div>

        {/* Progression */}
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-[13px] font-semibold text-slate-500 mb-5">Progression</p>
          <div className="space-y-4">
            {[
              { key: ['paye', 'reserve', 'soumis', 'livre'], label: 'Paiement reçu' },
              { key: ['reserve', 'soumis', 'livre'], label: 'Rédaction en cours' },
              { key: ['soumis', 'livre'], label: 'Avis publié' },
              { key: ['livre'], label: 'Livré et vérifié' },
            ].map((step, i) => {
              const done = step.key.includes(order.statut)
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 ${done ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <p className={`text-[15px] font-medium ${done ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Détails commande */}
        <div className="rounded-2xl border border-slate-200 p-6 space-y-5">
          <p className="text-[13px] font-semibold text-slate-500">Détails</p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] text-slate-400 font-medium">Email</p>
                <p className="text-[15px] font-medium text-slate-900">{order.email}</p>
              </div>
            </div>

            {order.nom_etablissement && (
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] text-slate-400 font-medium">Établissement</p>
                  <p className="text-[15px] font-medium text-slate-900">{order.nom_etablissement}</p>
                  {order.type_etablissement && (
                    <p className="text-[13px] text-slate-400">{order.type_etablissement}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Star size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] text-slate-400 font-medium">Note demandée</p>
                <p className="text-[15px] font-medium text-slate-900">
                  {'★'.repeat(order.nb_etoiles)}{'☆'.repeat(5 - order.nb_etoiles)} ({order.nb_etoiles}/5)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-slate-400 mt-0.5 shrink-0 text-[15px]">💬</span>
              <div>
                <p className="text-[12px] text-slate-400 font-medium">Ton</p>
                <p className="text-[15px] font-medium text-slate-900">{TONS_LABELS[order.ton] || order.ton}</p>
              </div>
            </div>

            {order.texte_avis && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[12px] text-slate-400 font-medium mb-1">Texte personnalisé</p>
                <p className="text-[14px] text-slate-500 italic">"{order.texte_avis}"</p>
              </div>
            )}
          </div>
        </div>

        {avisPublic?.lien_avis_poste && (
          <div className="rounded-2xl bg-emerald-50 p-5 space-y-2">
            <p className="text-[13px] font-semibold text-emerald-700">Avis publié</p>
            <a
              href={avisPublic.lien_avis_poste}
              target="_blank"
              rel="noreferrer"
              className="text-[14px] text-emerald-700 underline break-all font-medium"
            >
              {avisPublic.lien_avis_poste}
            </a>
          </div>
        )}

        {/* Copier le lien de suivi */}
        <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
          <p className="text-[13px] font-semibold text-slate-500">
            Lien de suivi — garde-le précieusement
          </p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-full bg-slate-50 px-4 py-2.5 text-[12px] font-mono text-slate-500 truncate">
              {window.location.href}
            </div>
            <button
              onClick={copyLink}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shrink-0"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} className="text-slate-500" />}
            </button>
          </div>
          <p className="text-[13px] text-slate-400">
            Pas d'email de suivi automatique. Ce lien est ta seule façon de suivre ta commande.
          </p>
        </div>

        {/* CTA compte */}
        <div className="rounded-2xl bg-[#1d1d1f] text-white p-6 space-y-3 text-center">
          <p className="font-semibold text-[18px] tracking-tight">Tu commandes souvent ?</p>
          <p className="text-[14px] text-slate-300 max-w-sm mx-auto">
            Crée un compte gratuit et paie 3€/avis au lieu de 4€.
            Suivi intégré, notifications, historique.
          </p>
          <Link
            to="/register"
            className="inline-flex mt-1 rounded-full bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 font-medium text-[14px] active:scale-95 transition-all"
          >
            Créer un compte gratuit →
          </Link>
        </div>

      </main>

      <footer className="bg-slate-50 border-t border-slate-200 mt-4 py-8">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between text-[12px] text-slate-400">
          <span>© 2025 SwimUp</span>
          <Link to="/commander" className="text-sky-500 hover:underline">Nouvelle commande</Link>
        </div>
      </footer>
    </div>
  )
}
