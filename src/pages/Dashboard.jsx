import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [solde, setSolde]         = useState(0)
  const [avis, setAvis]           = useState([])
  const [soldeAttente, setSoldeAttente] = useState(0)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/paiements/solde'),
      api.get('/avis/mes-avis'),
    ]).then(([s, a]) => {
      setSolde(s.data.solde)
      const mesAvis = a.data
      setAvis(mesAvis.slice(0, 3))

      // Calculer le solde en attente (avis validés mais pas encore payés)
      const enAttente = mesAvis
        .filter(av => av.statut === 'valide')
        .reduce((sum, av) => sum + parseFloat(av.prix || 0), 0)
      setSoldeAttente(enAttente)
    }).finally(() => setLoading(false))
  }, [])

  const statutBadge = s => ({
    disponible:      <span className="badge-blue">Disponible</span>,
    reserve:         <span className="badge-yellow">Réservé</span>,
    en_verification: <span className="badge-yellow">Vérification</span>,
    valide:          <span className="badge-green">Validé ✓</span>,
    refuse:          <span className="badge-red">Refusé</span>,
    paye:            <span className="badge-green">Payé 💸</span>,
    lien_incorrect:  <span className="badge-red">🔗 Lien incorrect</span>,
  }[s] || <span className="badge-gray">{s}</span>)

  const getDelaiRestant = (avis) => {
    if (avis.statut !== 'valide' || !avis.valide_at) return null
    const valideAt = new Date(avis.valide_at)
    const paiementAt = new Date(valideAt.getTime() + avis.delai_paiement * 24 * 60 * 60 * 1000)
    const now = new Date()
    const joursRestants = Math.ceil((paiementAt - now) / (1000 * 60 * 60 * 24))
    if (joursRestants <= 0) return 'Paiement imminent'
    return `Dans ${joursRestants}j`
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      {/* Solde */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white">
        <p className="text-brand-200 text-sm font-medium">Ton solde disponible</p>
        <p className="text-4xl font-extrabold mt-1">{solde.toFixed(2)} €</p>

        {soldeAttente > 0 && (
          <div className="mt-2 bg-white/20 rounded-xl px-3 py-2">
            <p className="text-sm font-medium text-white">
              ⏳ <span className="font-bold">{soldeAttente.toFixed(2)}€</span> en attente de versement
            </p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Link to="/portefeuille"
            className="flex-1 bg-white/20 text-white text-center py-2 rounded-xl text-sm font-semibold active:bg-white/30 transition-all">
            💸 Retirer
          </Link>
          <Link to="/avis"
            className="flex-1 bg-white text-brand-700 text-center py-2 rounded-xl text-sm font-semibold active:bg-brand-50 transition-all">
            ⭐ Voir les avis
          </Link>
        </div>
      </div>

      {/* Alertes */}
      {!user?.paypal_email && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2">
          <span className="text-orange-500 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-bold text-orange-700">Adresse PayPal manquante</p>
            <p className="text-xs text-orange-600 mt-0.5">Ajoute ton PayPal pour pouvoir retirer ton solde.</p>
            <Link to="/profil" className="text-xs text-orange-700 underline font-medium mt-1 block">
              Aller dans mon profil →
            </Link>
          </div>
        </div>
      )}

      {!user?.discord_id && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-start gap-2">
          <span className="text-indigo-500 text-lg">💬</span>
          <div>
            <p className="text-sm font-bold text-indigo-700">ID Discord manquant</p>
            <p className="text-xs text-indigo-600 mt-0.5">Renseigne ton ID Discord dans ton profil.</p>
            <Link to="/profil" className="text-xs text-indigo-700 underline font-medium mt-1 block">
              Aller dans mon profil →
            </Link>
          </div>
        </div>
      )}

      {/* Comment ça marche */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-3">Comment ça marche ?</h3>
        <div className="space-y-3">
          {[
            { n: '1', t: 'Réserve un avis', d: 'Choisis un établissement à noter' },
            { n: '2', t: 'Publie ton avis', d: 'Mets les étoiles demandées sur Google Maps avec le texte fourni' },
            { n: '3', t: 'Soumets le lien', d: 'Copie le lien de ton avis publié et soumets-le' },
            { n: '4', t: 'Reçois ton argent', d: 'Ton solde est crédité après le délai de vérification' },
          ].map(s => (
            <div key={s.n} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                {s.n}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{s.t}</p>
                <p className="text-xs text-gray-500">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Derniers avis */}
      {avis.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Mes derniers avis</h3>
            <Link to="/mon-avis" className="text-sm text-brand-600 font-medium">Voir tout</Link>
          </div>
          <div className="space-y-2">
            {avis.map(a => {
              const delai = getDelaiRestant(a)
              return (
                <div key={a.id} className="card flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-900 truncate">{a.nom_societe}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500">{parseFloat(a.prix).toFixed(2)}€</p>
                      {delai && (
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                          ⏳ {delai}
                        </span>
                      )}
                    </div>
                  </div>
                  {statutBadge(a.statut)}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
