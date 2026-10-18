import { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import { lignes, resume, pourcentage, tauxEmail, STATUTS, estActive } from '../../lib/ratissage.mjs'

const METIERS_RAPIDES = [
  'Coiffeur', 'Restaurant', 'Garage automobile', 'Institut de beauté', 'Boulangerie',
  'Plombier', 'Électricien', 'Dentiste', 'Opticien', 'Agence immobilière',
]

// Ratissage : une liste de métiers x une liste de zones, traitée en tâche de fond par le serveur.
// Tu peux fermer la page : ça continue, avec un plafond de requêtes Google par jour.
export default function RatissageProspection({ onNouvellesFiches }) {
  const [donnees, setDonnees] = useState(null)
  const [metiers, setMetiers] = useState('')
  const [zones, setZones] = useState('')
  const [maxAvis, setMaxAvis] = useState(20)
  const [plafond, setPlafond] = useState(200)
  const [plafondEdit, setPlafondEdit] = useState('')
  const [occupe, setOccupe] = useState(null)
  const [msg, setMsg] = useState(null)

  const charger = useCallback(() => (
    api.get('/admin/prospection/ratissage').then(r => { setDonnees(r.data); return r.data }).catch(() => null)
  ), [])

  useEffect(() => { charger() }, [charger])

  const course = donnees?.courses?.[0] || null
  const active = estActive(course)

  // Tant qu'une course tourne, on rafraîchit l'avancement toutes les 10 secondes.
  useEffect(() => {
    if (!active) return undefined
    const t = setInterval(charger, 10000)
    return () => clearInterval(t)
  }, [active, charger])

  useEffect(() => { if (course) setPlafondEdit(String(course.plafond_jour)) }, [course?.id, course?.plafond_jour]) // eslint-disable-line react-hooks/exhaustive-deps

  const r = resume(metiers, zones)

  const action = async (nom, fn, ok) => {
    setOccupe(nom); setMsg(null)
    try {
      await fn()
      if (ok) setMsg({ type: 'success', text: ok })
      await charger()
      if (nom === 'arreter' || nom === 'pause') onNouvellesFiches?.()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Action impossible.' })
    } finally { setOccupe(null) }
  }

  const lancer = (e) => {
    e.preventDefault()
    if (r.vide || r.trop) return
    action('lancer', () => api.post('/admin/prospection/ratissage', {
      metiers: lignes(metiers), zones: lignes(zones), maxAvis: Number(maxAvis) || 20, plafondJour: Number(plafond) || 200,
    }), 'Ratissage lancé. Tu peux fermer la page, ça continue sur le serveur.')
  }

  const ajouterMetier = (m) => {
    if (!lignes(metiers).some(x => x.toLowerCase() === m.toLowerCase())) setMetiers(metiers.trim() ? `${metiers.trim()}\n${m}` : m)
  }

  if (!donnees) return null

  const taux = course ? tauxEmail(course.nouvelles, course.avec_email) : null
  const statut = course ? STATUTS[course.statut] : null

  return (
    <div className="card space-y-3">
      <div>
        <h3 className="font-bold text-gray-900">Ratissage automatique</h3>
        <p className="text-xs text-gray-500">
          Donne des métiers et des zones : le serveur cherche tout seul, fiche par fiche, même page fermée. Chaque recherche et chaque fiche détaillée est facturée par Google, le plafond par jour limite la dépense.
        </p>
      </div>

      {!donnees.google_configure && (
        <p className="rounded-xl p-3 text-sm bg-red-50 text-red-600 border border-red-200">La clé Google Maps n'est pas configurée sur le serveur : le ratissage ne pourra pas chercher.</p>
      )}

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{msg.text}</div>
      )}

      {course && (
        <div className="rounded-xl border border-gray-200 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-900">
              {course.metiers.length} métier{course.metiers.length > 1 ? 's' : ''} × {course.zones_nb} zone{course.zones_nb > 1 ? 's' : ''}
              <span className="text-gray-400 font-normal"> · moins de {course.max_avis} avis</span>
            </p>
            {statut && <span className={`text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${statut.classe}`}>{statut.texte}</span>}
          </div>

          <div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pourcentage(course.fait, course.total)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${pourcentage(course.fait, course.total)}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{course.fait} recherches faites sur {course.total} ({pourcentage(course.fait, course.total)} %)</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 rounded-lg py-2"><p className="text-lg font-bold text-gray-900 tabular-nums">{course.nouvelles}</p><p className="text-[11px] text-gray-500">nouvelles fiches</p></div>
            <div className="bg-gray-50 rounded-lg py-2"><p className="text-lg font-bold text-gray-900 tabular-nums">{course.avec_email}{taux !== null && <span className="text-xs text-gray-400 font-normal"> ({taux} %)</span>}</p><p className="text-[11px] text-gray-500">avec un email</p></div>
            <div className="bg-gray-50 rounded-lg py-2"><p className="text-lg font-bold text-gray-900 tabular-nums">{course.requetes_jour}<span className="text-xs text-gray-400 font-normal"> / {course.plafond_jour}</span></p><p className="text-[11px] text-gray-500">requêtes Google aujourd'hui</p></div>
          </div>

          {course.message && (
            <p className={`text-xs rounded-lg p-2 ${course.statut === 'erreur' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>{course.message}</p>
          )}
          <p className="text-[11px] text-gray-400">Le compte de requêtes est une estimation : le plafond peut être dépassé de quelques requêtes.</p>

          {(active || course.statut === 'erreur') && (
            <div className="flex flex-wrap items-center gap-2">
              {course.statut === 'en_cours' && (
                <button onClick={() => action('pause', () => api.post(`/admin/prospection/ratissage/${course.id}/pause`))} disabled={!!occupe} className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-xs font-medium disabled:opacity-50">Mettre en pause</button>
              )}
              {(course.statut === 'pause' || course.statut === 'erreur') && (
                <button onClick={() => action('reprendre', () => api.post(`/admin/prospection/ratissage/${course.id}/reprendre`))} disabled={!!occupe} className="bg-sky-600 text-white px-4 py-2 rounded-full text-xs font-medium disabled:opacity-50">Reprendre</button>
              )}
              <button onClick={() => { if (window.confirm('Arrêter ce ratissage ? Les fiches déjà trouvées sont gardées.')) action('arreter', () => api.post(`/admin/prospection/ratissage/${course.id}/arreter`)) }} disabled={!!occupe} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-xs font-medium disabled:opacity-50">Arrêter</button>
              <span className="flex-1" />
              <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500" htmlFor="plafond-edit">Plafond/jour</label>
              <input id="plafond-edit" type="number" min="10" max="5000" inputMode="numeric" value={plafondEdit} onChange={e => setPlafondEdit(e.target.value)} className="input w-24 py-2 text-sm" />
              <button
                onClick={() => action('plafond', () => api.put(`/admin/prospection/ratissage/${course.id}/plafond`, { plafondJour: Number(plafondEdit) }), 'Plafond enregistré.')}
                disabled={!!occupe || plafondEdit === String(course.plafond_jour)} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-xs font-medium disabled:opacity-50">OK</button>
              </div>
            </div>
          )}

          {!active && course.statut !== 'erreur' && (
            <button onClick={() => onNouvellesFiches?.()} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-xs font-medium">Actualiser la liste des prospects</button>
          )}
          {active && (
            <button onClick={() => onNouvellesFiches?.()} className="text-xs text-sky-700 underline">Voir les fiches trouvées jusqu'ici</button>
          )}
        </div>
      )}

      {!active && (
        <form onSubmit={lancer} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700" htmlFor="rat-metiers">Métiers (un par ligne)</label>
            <textarea id="rat-metiers" value={metiers} onChange={e => setMetiers(e.target.value)} rows={4} placeholder={'Coiffeur\nGarage automobile'} className="input w-full text-sm mt-1" />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {METIERS_RAPIDES.map(m => (
                <button type="button" key={m} onClick={() => ajouterMetier(m)} className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">+ {m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700" htmlFor="rat-zones">Zones (une par ligne : ville, code postal ou quartier)</label>
            <textarea id="rat-zones" value={zones} onChange={e => setZones(e.target.value)} rows={5} placeholder={'Lyon 3e\nVilleurbanne\n75011'} className="input w-full text-sm mt-1" />
            <p className="text-[11px] text-gray-400 mt-1">Google limite le nombre de résultats par recherche : plus les zones sont petites (arrondissements, communes), plus tu trouves de fiches.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700" htmlFor="rat-avis">Moins de … avis</label>
              <input id="rat-avis" type="number" min="0" max="10000" inputMode="numeric" value={maxAvis} onChange={e => setMaxAvis(e.target.value)} className="input w-28 py-2 text-sm block mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700" htmlFor="rat-plafond">Plafond de requêtes Google par jour</label>
              <input id="rat-plafond" type="number" min="10" max="5000" inputMode="numeric" value={plafond} onChange={e => setPlafond(e.target.value)} className="input w-28 py-2 text-sm block mt-1" />
            </div>
          </div>
          <p className="text-xs text-gray-600">
            {r.vide ? 'Ajoute au moins un métier et une zone.' : r.trop ? `Trop de recherches (${r.total}). Maximum 5000 : réduis les métiers ou les zones.` : `${r.metiers} métier${r.metiers > 1 ? 's' : ''} × ${r.zones} zone${r.zones > 1 ? 's' : ''} = ${r.total} recherches.`}
          </p>
          <button type="submit" disabled={!!occupe || r.vide || r.trop || !donnees.google_configure} className="bg-sky-600 text-white px-5 py-2.5 rounded-full text-sm font-medium disabled:opacity-50">
            {occupe === 'lancer' ? 'Lancement…' : 'Lancer le ratissage'}
          </button>
        </form>
      )}
    </div>
  )
}
