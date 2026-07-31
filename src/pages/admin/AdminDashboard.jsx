import { useState, useEffect } from 'react'
import api from '../../lib/api'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

export default function AdminDashboard() {
  const [stats, setStats]         = useState(null)
  const [clients, setClients]     = useState([])
  const [contestations, setCont]  = useState([])
  const [lienInvit, setLien]      = useState(null)
  const [copying, setCopying]     = useState(false)
  const [loadingAction, setLA]    = useState(null)
  const [msg, setMsg]             = useState(null)

  const load = async () => {
    const [s, c, co] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/clients'),
      api.get('/admin/contestations'),
    ])
    setStats(s.data)
    setClients(c.data)
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

  const validerPaiement = async (clientId, email, montant) => {
    if (!confirm(`Confirmer le paiement de ${parseFloat(montant).toFixed(2)}€ reçu de ${email} ?`)) return
    setLA(`paiement_${clientId}`)
    try {
      await api.put(`/admin/clients/${clientId}/valider-paiement`)
      showMsg('success', `✅ Paiement de ${parseFloat(montant).toFixed(2)}€ validé !`)
      load()
    } catch {
      showMsg('error', 'Erreur lors de la validation')
    }
    setLA(null)
  }

  const toggleBloquer = async (clientId, bloquerActuel) => {
    setLA(`bloquer_${clientId}`)
    try {
      await api.put(`/admin/clients/${clientId}/bloquer`, { bloquer: !bloquerActuel })
      load()
    } catch {
      showMsg('error', 'Erreur')
    }
    setLA(null)
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

  const lancerVerifTous = async () => {
    setLA('verif_all')
    try {
      await api.post('/admin/run-verif')
      showMsg('success', '🔍 Vérification lancée ! Résultats dans 5-10 minutes.')
    } catch {
      showMsg('error', 'Erreur lors du lancement')
    }
    setLA(null)
  }

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/>
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
      <h2 className="text-xl font-bold text-gray-900">Tableau de bord</h2>

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
                  <p className="font-semibold text-sm text-gray-900">{c.email}</p>
                  <p className="text-xs text-gray-500">Avis #{c.avis_id} · {new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                  {c.message && (
                    <p className="text-sm text-gray-700 mt-1 bg-white rounded-lg p-2 border border-orange-100">
                      "{c.message}"
                    </p>
                  )}
                  {c.lien_avis_poste && (
                    <a href={c.lien_avis_poste} target="_blank" rel="noreferrer"
                      className="text-xs text-brand-600 underline block mt-1">
                      🔗 Voir l'avis
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => traiterContestation(c.id, 'acceptee', c.avis_id, c.user_id, c.prix)}
                    disabled={loadingAction === `contest_${c.id}`}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loadingAction === `contest_${c.id}` ? <><Spinner /> Traitement...</> : '✅ Accepter'}
                  </button>
                  <button
                    onClick={() => traiterContestation(c.id, 'refusee', c.avis_id, c.user_id, c.prix)}
                    disabled={loadingAction === `contest_${c.id}`}
                    className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loadingAction === `contest_${c.id}` ? <><Spinner /> Traitement...</> : '❌ Refuser'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collaborateurs */}
      {clients.length > 0 && (
        <div className="card space-y-3">
          <h3 className="font-bold text-gray-900">🏢 Collaborateurs</h3>
          <div className="space-y-3">
            {clients.map(c => (
              <div key={c.id} className="border border-gray-100 rounded-xl p-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.email}</p>
                    <p className="text-xs text-gray-500">{c.nom_societe}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${parseFloat(c.solde_depot) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {parseFloat(c.solde_depot || 0).toFixed(2)}€
                    </p>
                    <p className="text-xs text-gray-400">à encaisser</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Bloquer si dette</p>
                    <p className="text-xs text-gray-400">Empêche de commander</p>
                  </div>
                  <button
                    onClick={() => toggleBloquer(c.id, !!c.bloquer_si_dette)}
                    disabled={loadingAction === `bloquer_${c.id}`}
                    className={`relative w-12 h-6 rounded-full transition-all disabled:opacity-70 ${c.bloquer_si_dette ? 'bg-red-500' : 'bg-gray-300'}`}
                  >
                    {loadingAction === `bloquer_${c.id}` ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      </span>
                    ) : (
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${c.bloquer_si_dette ? 'left-7' : 'left-1'}`} />
                    )}
                  </button>
                </div>

                {parseFloat(c.solde_depot || 0) > 0 && (
                  <button
                    onClick={() => validerPaiement(c.id, c.email, parseFloat(c.solde_depot))}
                    disabled={loadingAction === `paiement_${c.id}`}
                    className="w-full bg-green-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loadingAction === `paiement_${c.id}`
                      ? <><Spinner /> Validation...</>
                      : `✅ Valider paiement de ${parseFloat(c.solde_depot).toFixed(2)}€`
                    }
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vérification Outscraper */}
      <div className="card space-y-3">
        <div>
          <h3 className="font-bold text-gray-900">🔍 Vérification Outscraper</h3>
          <p className="text-xs text-gray-500 mt-1">Lance la vérification de tous les avis validés — automatique chaque jour à 8h</p>
        </div>
        <button
          onClick={lancerVerifTous}
          disabled={loadingAction === 'verif_all'}
          className="w-full bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loadingAction === 'verif_all'
            ? <><Spinner /> Lancé en arrière-plan...</>
            : '🔍 Vérifier tous les avis maintenant'
          }
        </button>
      </div>

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
              <p className="text-xs text-brand-600 break-all font-mono">{lienInvit}</p>
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
