import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

function Spinner({ dark }) {
  return <div className={`w-4 h-4 border-2 ${dark ? 'border-gray-600 border-t-transparent' : 'border-white border-t-transparent'} rounded-full animate-spin inline-block`} />
}

function Countdown({ reserveAt }) {
  const [left, setLeft] = useState('')
  useEffect(() => {
    const update = () => {
      const diff = 3600000 - (Date.now() - new Date(reserveAt).getTime())
      if (diff <= 0) { setLeft('Expiré'); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setLeft(`${m}m ${s}s`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [reserveAt])

  const pct = Math.max(0, 100 - ((Date.now() - new Date(reserveAt).getTime()) / 3600000) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Temps restant</span>
        <span className={`font-bold ${pct < 25 ? 'text-red-500' : 'text-brand-600'}`}>{left}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${pct < 25 ? 'bg-red-400' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function MonAvis() {
  const [avis, setAvis]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [lien, setLien]             = useState('')
  const [submitting, setSub]        = useState(false)
  const [annulant, setAnnulant]     = useState(false)
  const [msg, setMsg]               = useState(null)
  const [contestMsg, setContestMsg] = useState('')
  const [contesting, setContesting] = useState(null)
  const [contestLoading, setContestLoading] = useState(false)

  const load = () => api.get('/avis/mes-avis').then(r => setAvis(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const soumettre = async (id) => {
    if (!lien.trim()) return showMsg('error', 'Entre le lien de ton avis Google')
    setSub(true)
    try {
      const r = await api.post(`/avis/${id}/soumettre`, { lien_avis: lien })
      showMsg(r.data.success ? 'success' : 'error', r.data.message)
      load()
      setLien('')
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur')
    }
    setSub(false)
  }

  const annuler = async (id) => {
    if (!confirm('Annuler la réservation ?')) return
    setAnnulant(true)
    try {
      await api.post(`/avis/${id}/annuler`)
      showMsg('success', 'Réservation annulée')
      load()
    } catch {
      showMsg('error', 'Erreur')
    }
    setAnnulant(false)
  }

  const contester = async (id) => {
    setContestLoading(true)
    try {
      const r = await api.post(`/avis/${id}/contester`, { message: contestMsg })
      showMsg('success', r.data.message)
      setContesting(null)
      setContestMsg('')
      load()
    } catch (e) {
      showMsg('error', e.response?.data?.error || 'Erreur')
    }
    setContestLoading(false)
  }

  const statutBadge = s => ({
    reserve:         <span className="badge-yellow">⏳ En cours</span>,
    en_verification: <span className="badge-blue">🔍 Vérification</span>,
    valide:          <span className="badge-green">✅ Validé</span>,
    refuse:          <span className="badge-red">❌ Supprimé</span>,
    paye:            <span className="badge-green">💸 Payé</span>,
    lien_incorrect:  <span className="badge-red">🔗 Lien incorrect</span>,
  }[s] || <span className="badge-gray">{s}</span>)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const actif = avis.find(a => a.statut === 'reserve' || a.statut === 'lien_incorrect')
  const historique = avis.filter(a => a.statut !== 'reserve' && a.statut !== 'lien_incorrect')

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Mes avis</h2>

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {actif ? (
        <div className={`card space-y-4 border-2 ${actif.statut === 'lien_incorrect' ? 'border-orange-300' : 'border-brand-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">
              {actif.statut === 'lien_incorrect' ? '🔗 Corriger ton lien' : 'Avis en cours'}
            </h3>
            {statutBadge(actif.statut)}
          </div>

          {actif.statut === 'lien_incorrect' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <p className="text-sm font-bold text-orange-700">⚠️ Lien incorrect détecté</p>
              <p className="text-xs text-orange-600 mt-1">
                L'admin a détecté que le lien soumis n'est pas le bon. Ton avis est gardé — soumets simplement le bon lien.
              </p>
            </div>
          )}

          {actif.statut === 'reserve' && <Countdown reserveAt={actif.reserve_at} />}

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Établissement</p>
            <p className="font-bold text-brand-700">{actif.nom_societe}</p>
            <p className="text-sm text-gray-500">Récompense : <span className="font-bold">{parseFloat(actif.prix).toFixed(2)}€</span> après {actif.delai_paiement}j</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Texte à copier ⬇️</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-sm text-gray-700 leading-relaxed">{actif.texte}</p>
            </div>
            <button className="mt-2 text-xs text-brand-600 font-medium active:opacity-70"
              onClick={() => { navigator.clipboard.writeText(actif.texte); showMsg('success', '📋 Texte copié !') }}>
              📋 Copier le texte
            </button>
          </div>

          <a href={actif.lien_maps} target="_blank" rel="noreferrer" className="btn-secondary text-center block">
            🗺️ Ouvrir Google Maps
          </a>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs text-blue-700 font-medium">💡 Comment trouver le lien de ton avis ?</p>
            <p className="text-xs text-blue-600 mt-1">Une fois publié → clique sur ton avis → copie l'URL de la page de ton avis</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {actif.statut === 'lien_incorrect' ? '🔗 Nouveau lien de ton avis' : 'Lien de ton avis publié'}
            </p>
            <input className="input" type="url" placeholder="https://maps.google.com/..."
              value={lien} onChange={e => setLien(e.target.value)} />
          </div>

          <button className="btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
            onClick={() => soumettre(actif.id)} disabled={submitting}>
            {submitting ? <><Spinner /> Envoi en cours...</> : '✅ Soumettre le lien de mon avis'}
          </button>

          {actif.statut === 'reserve' && (
            <button
              className="text-sm text-red-400 text-center w-full py-2 flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={() => annuler(actif.id)}
              disabled={annulant}
            >
              {annulant ? <><Spinner dark /> Annulation...</> : 'Annuler la réservation'}
            </button>
          )}
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-3xl mb-2">🎯</p>
          <p className="font-semibold text-gray-700">Aucun avis en cours</p>
          <Link to="/avis" className="btn-primary mt-4 block">Voir les avis disponibles</Link>
        </div>
      )}

      {historique.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Historique</h3>
          <div className="space-y-3">
            {historique.map(a => (
              <div key={a.id} className="card space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{a.nom_societe}</p>
                    <p className="text-xs text-gray-400">{parseFloat(a.prix).toFixed(2)}€ · {a.delai_paiement}j</p>
                  </div>
                  {statutBadge(a.statut)}
                </div>

                {a.statut === 'refuse' && (
                  contesting === a.id ? (
                    <div className="space-y-2">
                      <textarea className="input text-sm min-h-[80px]"
                        placeholder="Explique pourquoi ton avis est toujours en ligne..."
                        value={contestMsg} onChange={e => setContestMsg(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={() => contester(a.id)} disabled={contestLoading}
                          className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                          {contestLoading ? <><Spinner /> Envoi...</> : 'Envoyer'}
                        </button>
                        <button onClick={() => { setContesting(null); setContestMsg('') }}
                          className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-semibold">
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setContesting(a.id)}
                      className="w-full bg-orange-50 border border-orange-200 text-orange-600 py-2 rounded-xl text-sm font-semibold active:bg-orange-100">
                      ⚠️ Contester la suppression
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
