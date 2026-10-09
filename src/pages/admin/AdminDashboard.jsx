import { useState, useEffect } from 'react'
import api from '../../lib/api'
import BadgePause from '../../components/BadgePause'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

export default function AdminDashboard() {
  const [stats, setStats]         = useState(null)
  const [contestations, setCont]  = useState([])
  const [lienInvit, setLien]      = useState(null)
  const [copying, setCopying]     = useState(false)
  const [loadingAction, setLA]    = useState(null)
  const [msg, setMsg]             = useState(null)

  const load = async () => {
    const [s, co] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/contestations'),
    ])
    setStats(s.data)
    setCont(co.data)
  }

  useEffect(() => { load() }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const genererInvitation = async () => {
    setLA('invitation')
    try {
      const r = await api.post('/auth/invitation')
      setLien(r.data.lien)
    } catch {
      showMsg('error', 'Erreur lors de la génération')
    }
    setLA(null)
  }

  const copier = async () => {
    await navigator.clipboard.writeText(lienInvit)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  const traiterContestation = async (id, statut, avisId, userId, montant) => {
    const msg = statut === 'acceptee'
      ? `Accepter la contestation et recréditer ${parseFloat(montant).toFixed(2)}€ ?`
      : 'Refuser la contestation ?'
    if (!confirm(msg)) return
    setLA(`contest_${id}`)
    try {
      await api.put(`/admin/contestations/${id}`, { statut, avis_id: avisId, user_id: userId, montant })
      showMsg('success', statut === 'acceptee' ? '✅ Contestation acceptée !' : '❌ Contestation refusée !')
      load()
    } catch {
      showMsg('error', 'Erreur')
    }
    setLA(null)
  }

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const cardsData = [
    { label: 'Membres',         value: stats.users,                                        emoji: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'Avis validés',    value: stats.avisValides,                                  emoji: '✅', color: 'bg-green-50 text-green-700' },
    { label: 'Retraits en att.',value: stats.retraitsAttente,                              emoji: '💸', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Montant à payer', value: `${(stats.montantRetraitsAttente||0).toFixed(2)}€`, emoji: '💰', color: 'bg-purple-50 text-purple-700' },
    { label: 'Total avis',      value: stats.avisTotal,                                    emoji: '📋', color: 'bg-gray-50 text-gray-700' },
    { label: 'Soldes membres',  value: `${(stats.soldeTotal||0).toFixed(2)}€`,             emoji: '🏦', color: 'bg-red-50 text-red-700' },
  ]

  const contestationsEnAttente = contestations.filter(c => c.statut === 'en_attente')

  return (
    <div className="p-4 space-y-4">
      <h2 className="page-title">Tableau de bord</h2>

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {cardsData.map(c => (
          <div key={c.label} className={`rounded-2xl p-4 ${c.color.split(' ')[0]}`}>
            <p className="text-2xl">{c.emoji}</p>
            <p className={`text-2xl font-extrabold mt-1 ${c.color.split(' ')[1]}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Contestations */}
      {contestationsEnAttente.length > 0 && (
        <div className="card space-y-3">
          <h3 className="font-bold text-gray-900">⚠️ Contestations ({contestationsEnAttente.length})</h3>
          <div className="space-y-3">
            {contestationsEnAttente.map(c => (
              <div key={c.id} className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-2">
                <div>
                  <p className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">{c.email}<BadgePause actif={c.avis_bloque} /></p>
                  <p className="text-xs text-gray-500">Avis #{c.avis_id} · {new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                  {c.message && (
                    <p className="text-sm text-gray-700 mt-1 bg-white rounded-lg p-2 border border-orange-100">
                      "{c.message}"
                    </p>
                  )}
                  {c.lien_avis_poste && (
                    <a href={c.lien_avis_poste} target="_blank" rel="noreferrer"
                      className="text-xs text-sky-500 underline block mt-1">
                      🔗 Voir l'avis
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => traiterContestation(c.id, 'acceptee', c.avis_id, c.user_id, c.prix)}
                    disabled={loadingAction === `contest_${c.id}`}
                    className="flex-1 bg-emerald-500 text-white py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
                  >
                    {loadingAction === `contest_${c.id}` ? <><Spinner /> Traitement...</> : 'Accepter'}
                  </button>
                  <button
                    onClick={() => traiterContestation(c.id, 'refusee', c.avis_id, c.user_id, c.prix)}
                    disabled={loadingAction === `contest_${c.id}`}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
                  >
                    {loadingAction === `contest_${c.id}` ? <><Spinner /> Traitement...</> : '❌ Refuser'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fix — section "Collaborateurs" (solde_depot / bloquer si dette /
          valider paiement) retirée : elle appartenait à l'ancien parcours
          client à crédit (POST /client/avis), remplacé depuis par le
          paiement PayPal en direct avant validation admin (commandes). Le
          client paie désormais toujours avant d'obtenir ses avis, ces
          contrôles de dette n'ont donc plus d'utilité. */}

      {/* La vérification se fait maintenant à la main, avis par avis, depuis
          la page Avis (checkpoints tous les 4 jours jusqu'au délai de
          paiement choisi par l'acheteur). */}

      {/* Invitation */}
      <div className="card space-y-3">
        <div>
          <h3 className="font-bold text-gray-900">🔗 Inviter un collaborateur</h3>
          <p className="text-xs text-gray-500 mt-1">Lien unique — utilisable une seule fois</p>
        </div>
        <button
          className="btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
          onClick={genererInvitation}
          disabled={loadingAction === 'invitation'}
        >
          {loadingAction === 'invitation' ? <><Spinner /> Génération...</> : '✨ Générer un lien d\'invitation'}
        </button>
        {lienInvit && (
          <div className="space-y-2">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Lien :</p>
              <p className="text-xs text-sky-500 break-all font-mono">{lienInvit}</p>
            </div>
            <button className="btn-secondary py-2.5 text-sm" onClick={copier}>
              {copying ? '✅ Copié !' : '📋 Copier le lien'}
            </button>
            <p className="text-xs text-red-400 text-center">⚠️ Une seule utilisation</p>
          </div>
        )}
      </div>
    </div>
  )
}
