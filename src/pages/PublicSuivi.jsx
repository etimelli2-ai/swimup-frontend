import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Link } from '../components/Lien'
import { LiensLegaux, MentionDonnees } from '../components/PageLegale'
import { CheckCircle2, Clock, AlertCircle, Package, Star, MapPin, Mail, Copy, Check, Sparkles, Loader2, Building2, Link as LinkIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { TONS, TYPES, EtoilesPicker, genererTexteIA } from '../lib/avisPublicShared'
import Logo from '../components/Logo'
import { t, tn } from '../lib/i18n'
import SelecteurLangue from '../components/SelecteurLangue'

const API = import.meta.env.VITE_API_URL || 'https://api.swimup.net/api'

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

// Formulaire affiché sur la page de suivi une fois la commande payée — le
// client y complète les infos de son établissement (avant paiement, sur
// /commander, on ne lui a demandé que le nombre d'avis).
function CompleterInfosForm({ token, onSaved }) {
  const [form, setForm] = useState({
    nom_etablissement:  '',
    type_etablissement: '',
    type_autre:         '',
    lien_maps:          '',
    nb_etoiles:         5,
    ton:                'naturel',
    texte_avis:         '',
  })
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const typeEffectif = form.type_etablissement === 'Autre' ? form.type_autre : form.type_etablissement

  const handleGenerer = async () => {
    const nom = form.nom_etablissement || t('cet établissement')
    setGenerating(true)
    const texte = await genererTexteIA(nom, typeEffectif, form.nb_etoiles, form.ton)
    if (texte) set('texte_avis', texte)
    else setError(t('Impossible de générer le texte — réessaie ou écris-le toi-même'))
    setGenerating(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.nom_etablissement) return setError(t('Entre le nom de l\'établissement'))
    if (!form.lien_maps) return setError(t('Entre le lien Google Maps'))
    if (form.type_etablissement === 'Autre' && !form.type_autre.trim()) {
      return setError(t('Précise le type d\'établissement'))
    }

    setSaving(true)
    try {
      await axios.put(`${API}/public/commande/${token}/infos`, {
        nom_etablissement:  form.nom_etablissement,
        type_etablissement: typeEffectif,
        lien_maps:          form.lien_maps,
        nb_etoiles:         form.nb_etoiles,
        ton:                form.ton,
        texte_avis:         form.texte_avis,
      })
      await onSaved()
    } catch (e) {
      setError(e.response?.data?.error || t('Erreur — réessaie dans quelques secondes'))
      setSaving(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-sky-200 bg-sky-50/40 p-6 space-y-6"
    >
      <div>
        <p className="font-semibold text-[17px] text-slate-900">{t('Complète les infos de ton établissement')}</p>
        <p className="text-[13px] text-slate-500 mt-1">{t('Un membre pourra rédiger ton avis dès que c\'est rempli.')}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-slate-700">
          {t('Nom de l\'établissement *')}
        </label>
        <div className="relative">
          <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={t('Ex: Restaurant Le Petit Bistro')}
            value={form.nom_etablissement}
            onChange={e => set('nom_etablissement', e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-slate-700">
          {t('Lien Google Maps de votre établissement *')}
        </label>
        <div className="relative">
          <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="url"
            placeholder="https://maps.google.com/..."
            value={form.lien_maps}
            onChange={e => set('lien_maps', e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-slate-700">
          {t('Type d\'établissement')}
        </label>
        <select
          value={form.type_etablissement}
          onChange={e => set('type_etablissement', e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none transition-all"
        >
          <option value="">{t('Sélectionner...')}</option>
          {TYPES.map(tx => <option key={tx} value={tx}>{t(tx)}</option>)}
        </select>
        {form.type_etablissement === 'Autre' && (
          <input
            type="text"
            placeholder={t('Précisez le type d\'établissement...')}
            value={form.type_autre}
            onChange={e => set('type_autre', e.target.value)}
            className="w-full rounded-full border border-sky-400 bg-white px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all mt-2"
          />
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-slate-700">
          {tn(form.nb_etoiles, 'Note à attribuer ({n} étoile)', 'Note à attribuer ({n} étoiles)')}
        </label>
        <EtoilesPicker value={form.nb_etoiles} onChange={v => set('nb_etoiles', v)} />
      </div>

      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-slate-700">
          {t('Ton de l\'avis')}
        </label>
        <div className="flex flex-wrap gap-2">
          {TONS.map(tx => (
            <button
              key={tx.id}
              type="button"
              onClick={() => set('ton', tx.id)}
              className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-all active:scale-95 ${
                form.ton === tx.id
                  ? 'border-sky-500 bg-sky-50 text-sky-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {tx.emoji} {t(tx.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="block text-[13px] font-semibold text-slate-700">
            {t('Texte de l\'avis')}{' '}<span className="font-normal text-slate-500">{t('(optionnel)')}</span>
          </label>
          <button
            type="button"
            onClick={handleGenerer}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
          >
            {generating
              ? <><Loader2 size={12} className="animate-spin" />{' '}{t('Génération...')}</>
              : <><Sparkles size={12} className="text-sky-500" />{' '}{t('Générer avec l\'IA')}</>
            }
          </button>
        </div>
        <textarea
          placeholder={t('Rédigez votre avis ou cliquez sur Générer avec l\'IA pour un texte naturel et authentique.')}
          value={form.texte_avis}
          onChange={e => set('texte_avis', e.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none transition-all"
        />
      </div>

      <MentionDonnees>{t('Ces informations servent à faire rédiger et publier les avis de ta commande.')}</MentionDonnees>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-full bg-sky-500 hover:bg-sky-600 text-white py-3.5 font-medium text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
      >
        {saving ? (
          <><Loader2 size={18} className="animate-spin" />{' '}{t('Enregistrement...')}</>
        ) : (
          t('Valider les infos')
        )}
      </button>
    </motion.form>
  )
}

export default function PublicSuivi() {
  const [searchParams] = useSearchParams()
  const token   = searchParams.get('token')
  const success = searchParams.get('success') === '1'

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [copied, setCopied]   = useState(false)

  const charger = () => {
    if (!token) {
      setError(t('Token de suivi manquant'))
      setLoading(false)
      return
    }
    return axios.get(`${API}/public/suivi/${token}`)
      .then(r => { setData(r.data); setError(null) })
      .catch(() => setError(t('Commande introuvable — vérifie ton lien de suivi')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { charger() }, [token])

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
        <h1 className="font-semibold text-[22px] tracking-tight text-slate-900">{t('Commande introuvable')}</h1>
        <p className="text-[15px] text-slate-500">{error}</p>
        <Link to="/commander" className="btn-primary inline-flex px-6 py-3">
          {t('Passer une commande')}
        </Link>
      </div>
    </div>
  )

  const { order, avis } = data
  const infosManquantes = order.statut !== 'en_attente' && order.statut !== 'annule' && !order.lien_maps
  const statut = infosManquantes
    ? { label: t('Payé — infos à compléter'), color: 'bg-amber-50 text-amber-700', icon: Package, desc: t('Paiement confirmé ! Complète les infos de ton établissement ci-dessous pour qu\'un membre puisse rédiger ton avis.') }
    : (STATUTS[order.statut] || STATUTS.en_attente)
  const StatusIcon = statut.icon
  const avisPublic = avis?.[0]

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/commander" className="flex items-center gap-2">
            <Logo taille={26} classeTexte="text-slate-900" />
          </Link>
          <span className="flex items-center gap-3">
            <SelecteurLangue />
            <span className="text-[12px] text-slate-500 font-mono">#{order.id}</span>
          </span>
        </div>
      </header>

      <main id="contenu" className="max-w-2xl mx-auto px-4 py-12 space-y-10">

        {/* Message succès paiement */}
        {success && order.statut !== 'en_attente' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-emerald-50 p-4 flex items-start gap-3"
          >
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-700 text-[14px]">{t('Paiement confirmé !')}</p>
              <p className="text-[13px] text-emerald-600 mt-0.5">
                {t('Garde ce lien pour suivre ta commande')}{infosManquantes ? t(' et compléter les infos ci-dessous') : ". Un membre va bientôt s'en occuper"}.
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
            {t(statut.label)}
          </div>
          <p className="text-[16px] text-slate-500 leading-relaxed max-w-md mx-auto font-light">
            {t(statut.desc)}
          </p>
          <p className="text-[40px] font-semibold tracking-tight text-slate-900">
            {parseFloat(order.montant).toFixed(2)}€
          </p>
          <p className="text-[13px] text-slate-500 -mt-4">{t('Total payé')}</p>
        </motion.div>

        {/* Complète les infos de l'établissement — uniquement tant que ce n'est pas fait */}
        {infosManquantes && (
          <CompleterInfosForm token={token} onSaved={charger} />
        )}

        {/* Progression */}
        {!infosManquantes && (
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-[13px] font-semibold text-slate-500 mb-5">{t('Progression')}</p>
          <div className="space-y-4">
            {[
              { key: ['paye', 'reserve', 'soumis', 'livre'], label: t('Paiement reçu') },
              { key: ['reserve', 'soumis', 'livre'], label: t('Rédaction en cours') },
              { key: ['soumis', 'livre'], label: t('Avis publié') },
              { key: ['livre'], label: t('Livré et vérifié') },
            ].map((step, i) => {
              const done = step.key.includes(order.statut)
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 ${done ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <p className={`text-[15px] font-medium ${done ? 'text-slate-900' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
        )}

        {/* Détails commande */}
        <div className="rounded-2xl border border-slate-200 p-6 space-y-5">
          <p className="text-[13px] font-semibold text-slate-500">{t('Détails')}</p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail size={16} className="text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] text-slate-500 font-medium">{t('Email')}</p>
                <p className="text-[15px] font-medium text-slate-900">{order.email}</p>
              </div>
            </div>

            {order.nom_etablissement && (
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] text-slate-500 font-medium">{t('Établissement')}</p>
                  <p className="text-[15px] font-medium text-slate-900">{order.nom_etablissement}</p>
                  {order.type_etablissement && (
                    <p className="text-[13px] text-slate-500">{order.type_etablissement}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Star size={16} className="text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] text-slate-500 font-medium">{t('Note demandée')}</p>
                <p className="text-[15px] font-medium text-slate-900">
                  {'★'.repeat(order.nb_etoiles)}{'☆'.repeat(5 - order.nb_etoiles)} ({order.nb_etoiles}/5)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-slate-500 mt-0.5 shrink-0 text-[15px]">💬</span>
              <div>
                <p className="text-[12px] text-slate-500 font-medium">{t('Ton')}</p>
                <p className="text-[15px] font-medium text-slate-900">{(() => { const ton = TONS.find(x => x.id === order.ton); return ton ? `${ton.emoji} ${t(ton.label)}` : order.ton })()}</p>
              </div>
            </div>

            {order.texte_avis && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[12px] text-slate-500 font-medium mb-1">{t('Texte personnalisé')}</p>
                <p className="text-[14px] text-slate-500 italic">"{order.texte_avis}"</p>
              </div>
            )}
          </div>
        </div>

        {avisPublic?.lien_avis_poste && (
          <div className="rounded-2xl bg-emerald-50 p-5 space-y-2">
            <p className="text-[13px] font-semibold text-emerald-700">{t('Avis publié')}</p>
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
            {t('Lien de suivi — garde-le précieusement')}
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
          <p className="text-[13px] text-slate-500">
            {t('Pas d\'email de suivi automatique. Ce lien est ta seule façon de suivre ta commande.')}
          </p>
        </div>

        {/* CTA compte — uniquement proposé une fois la commande payée */}
        {order.statut !== 'en_attente' && order.statut !== 'annule' && (
          <div className="rounded-2xl bg-[#1d1d1f] text-white p-6 space-y-3 text-center">
            {order.compte_cree ? (
              <>
                <p className="font-semibold text-[18px] tracking-tight">{t('Tu as déjà un compte')}</p>
                <p className="text-[14px] text-slate-300 max-w-sm mx-auto">
                  {t('Un compte client a déjà été créé pour cette commande.')}
                </p>
                <Link
                  to="/login"
                  className="inline-flex mt-1 rounded-full bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 font-medium text-[14px] active:scale-95 transition-all"
                >
                  {t('Se connecter →')}
                </Link>
              </>
            ) : (
              <>
                <p className="font-semibold text-[18px] tracking-tight">{t('Tu commandes souvent ?')}</p>
                <p className="text-[14px] text-slate-300 max-w-sm mx-auto">
                  {t('Crée un compte gratuit lié à cette commande et paie 3€/avis au lieu de 4€. Suivi intégré, notifications, historique.')}
                </p>
                <Link
                  to={`/register?commande=${token}`}
                  className="inline-flex mt-1 rounded-full bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 font-medium text-[14px] active:scale-95 transition-all"
                >
                  {t('Créer un compte gratuit →')}
                </Link>
              </>
            )}
          </div>
        )}

      </main>

      <footer className="bg-slate-50 border-t border-slate-200 mt-4 py-8">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between text-[12px] text-slate-500">
          <span>{t('© {date} SwimUp', { date: new Date().getFullYear() })}</span>
          <Link to="/commander" className="text-sky-600 hover:underline">{t('Nouvelle commande')}</Link>
        </div>
        <div className="max-w-2xl mx-auto px-4 pt-3"><LiensLegaux className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-600" classe="hover:underline" /></div>
      </footer>
    </div>
  )
}
