import { useState, useEffect } from 'react'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import usePageTitle from '../../hooks/usePageTitle'

// Modèles prêts à adapter : les mots entre MAJUSCULES sont à remplacer avant l'envoi.
const MODELES = [
  {
    nom: 'Bug commande + avis offerts',
    sujet: 'Ta commande SwimUp : petit bug de notre côté, 2 avis offerts',
    message: `Bonjour,

Tu as commandé des avis sur SwimUp et ton paiement est bien passé, mais il y a eu un bug de notre côté : tes avis ne se sont pas lancés. Désolé pour ça.

Pour me faire pardonner, je t'offre 2 avis en plus.

Voilà comment on fait :
1. Crée ton compte avec ce lien : LIEN_INVITATION
2. Va dans "Commander" et passe une commande de NOMBRE avis avec le lien de ta fiche Google Maps.
3. Ne paie rien, tu as déjà payé. Une fois la commande passée, je la valide à la main et les avis partent directement.

Si quelque chose bloque, réponds à ce mail et je regarde ça tout de suite.

Enzo
SwimUp`,
  },
  {
    nom: 'Relance : infos de commande manquantes',
    sujet: 'Ta commande SwimUp : il manque une étape pour lancer tes avis',
    message: `Bonjour,

Merci pour ta commande sur SwimUp. Ton paiement est bien passé, mais je n'ai pas encore le lien de ta fiche Google Maps, donc je ne peux pas lancer tes avis.

Il faut juste remplir les infos de ton établissement sur ta page de suivi :
LIEN_SUIVI

Ça prend 2 minutes. Ensuite un membre rédige tes avis, livraison sous 24-48h.

Enzo
SwimUp`,
  },
]

export default function AdminEmails() {
  usePageTitle('Emails')

  const [config, setConfig] = useState(null)
  const [destinataire, setDestinataire] = useState('')
  const [sujet, setSujet] = useState('')
  const [message, setMessage] = useState('')
  const [repondreA, setRepondreA] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    api.get('/admin/emails/config').then(r => setConfig(r.data)).catch(() => setConfig(null))
  }, [])

  const appliquerModele = (i) => {
    if (i === '') return
    setSujet(MODELES[i].sujet)
    setMessage(MODELES[i].message)
  }

  const envoyer = async (e) => {
    e.preventDefault()
    setErreur('')
    const reste = message.match(/\b[A-Z]{2,}(?:_[A-Z]+)+\b|\bNOMBRE\b/)
    if (reste && !window.confirm(`Il reste « ${reste[0]} » dans le message. Envoyer quand même ?`)) return

    setEnvoi(true)
    try {
      const r = await api.post('/admin/emails', { destinataire, sujet, message, repondreA })
      toast.success(r.data.message || 'Email envoyé')
      setDestinataire(''); setSujet(''); setMessage('')
    } catch (err) {
      setErreur(err.response?.data?.error || "Impossible d'envoyer l'email")
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <div>
        <h2 className="page-title">Emails</h2>
        {config && (
          <p className="text-sm text-gray-500 mt-1">
            Envoyé depuis <span className="font-medium text-gray-700">{config.expediteur}</span>
            {config.repondreA && <> · les réponses arrivent sur <span className="font-medium text-gray-700">{config.repondreA}</span></>}
          </p>
        )}
      </div>

      {config && !config.configure && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">L'envoi d'emails n'est pas configuré (clé Resend manquante sur le backend).</p>
        </div>
      )}

      <form onSubmit={envoyer} className="card space-y-4">
        {erreur && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{erreur}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Partir d'un modèle</label>
          <select className="input" defaultValue="" onChange={e => appliquerModele(e.target.value)}>
            <option value="">Mail vierge</option>
            {MODELES.map((m, i) => <option key={m.nom} value={i}>{m.nom}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Destinataire</label>
          <input type="email" required className="input" placeholder="client@email.com"
            value={destinataire} onChange={e => setDestinataire(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Objet</label>
          <input type="text" required maxLength={150} className="input"
            value={sujet} onChange={e => setSujet(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
          <textarea required rows={12} maxLength={5000} className="input"
            value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Écris ton message. Les liens https:// deviennent cliquables." />
          <p className="text-xs text-gray-400 mt-1">{message.length}/5000</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Répondre à <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <input type="email" className="input" placeholder={config?.repondreA || 'ton@email.com'}
            value={repondreA} onChange={e => setRepondreA(e.target.value)} />
        </div>

        <button type="submit" disabled={envoi || (config && !config.configure)} className="btn-primary w-full">
          {envoi ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} />Envoyer</>}
        </button>
      </form>
    </div>
  )
}
