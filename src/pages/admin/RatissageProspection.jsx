import { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import { PAYS, paysParDefaut, tousLesLieux, tirerLieux, cleDejaFait } from '../../lib/lieuxProspection.mjs'
import { lignes, resume, pourcentage, tauxEmail, STATUTS, estActive } from '../../lib/ratissage.mjs'

const METIERS_RAPIDES = [
  'Coiffeur', 'Restaurant', 'Garage automobile', 'Institut de beauté', 'Boulangerie',
  'Plombier', 'Électricien', 'Dentiste', 'Opticien', 'Agence immobilière',
]

// Ratissage : une liste de métiers x une liste de zones, traitée en tâche de fond par le serveur.
// Tu peux fermer la page : ça continue, avec un plafond de requêtes Google par jour.
export default function RatissageProspection({ onNouvellesFiches, prospects = [] }) {
  const [donnees, setDonnees] = useState(null)
  const [metiers, setMetiers] = useState('')
  const [zones, setZones] = useState('')
  const [maxAvis, setMaxAvis] = useState(20)
  const [paysChoisis, setPaysChoisis] = useState(paysParDefaut)
  const [nbCodes, setNbCodes] = useState(20)
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

  // Codes postaux tirés au hasard : jamais un code déjà ratissé avec tous les métiers demandés (fiches en base +
  // tirages faits depuis ce navigateur).
  const CLE_TIRAGES = 'swimup_ratissage_tirages'
  const tiragesPasses = () => { try { return JSON.parse(localStorage.getItem(CLE_TIRAGES) || '[]') } catch { return [] } }
  const retenirTirages = (paires) => { try { localStorage.setItem(CLE_TIRAGES, JSON.stringify([...tiragesPasses(), ...paires].slice(-5000))) } catch { /* stockage indisponible : sans gravité */ } }
  const tirer = () => {
    const n = Math.max(1, Math.min(200, Number(nbCodes) || 20))
    const dejaFaits = new Set([...prospects.filter(p => p.requete && p.ville).map(p => cleDejaFait(p.requete, p.ville)), ...tiragesPasses()])
    return tirerLieux({ n, ids: paysChoisis, metiers: lignes(metiers), dejaFaits }).map(l => l.ville)
  }
  const tirerDansLesZones = () => {
    if (!paysChoisis.length) return setMsg({ type: 'error', text: 'Coche au moins un pays.' })
    const codes = tirer()
    if (!codes.length) return setMsg({ type: 'error', text: 'Plus aucun code postal à tirer dans ces pays avec ces métiers : coche d\'autres pays ou change de métiers.' })
    setZones(codes.join('\n')); setMsg(null)
  }
  // Zones vides : on tire les codes au moment du lancement (« métiers + pays cochés », rien d'autre à saisir).
  const zonesAuHasard = lignes(zones).length === 0 && paysChoisis.length > 0
  const nbAuHasard = Math.max(1, Math.min(200, Number(nbCodes) || 20))
  const r = zonesAuHasard && lignes(metiers).length ? resume(metiers, Array.from({ length: nbAuHasard }, (_, i) => `z${i}`).join('\n')) : resume(metiers, zones)

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
    let zonesFinales = lignes(zones)
    if (!zonesFinales.length) {
      zonesFinales = tirer()
      if (!zonesFinales.length) return setMsg({ type: 'error', text: 'Plus aucun code postal à tirer dans ces pays avec ces métiers : coche d\'autres pays ou change de métiers.' })
      setZones(zonesFinales.join('\n'))
    }
    retenirTirages(lignes(metiers).flatMap(m => zonesFinales.map(z => cleDejaFait(m, z))))
    action('lancer', () => api.post('/admin/prospection/ratissage', {
      metiers: lignes(metiers), zones: zonesFinales, maxAvis: Number(maxAvis) || 20, plafondJour: Number(plafond) || 200,
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
            <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 mt-1 space-y-2">
              <p className="text-xs text-gray-600">
                Plus besoin de saisir les codes postaux : laisse les zones vides, le ratissage tire des codes postaux au hasard dans les pays cochés (un code déjà ratissé avec tes métiers ne revient pas). Le bouton les écrit d'abord dans les zones pour que tu puisses les relire.
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-700 font-medium">Pays : {paysChoisis.length} sur {PAYS.length} cochés ({tousLesLieux(paysChoisis).length} codes possibles)</summary>
                <div className="mt-2 flex gap-3 text-xs">
                  <button type="button" className="underline text-sky-700" onClick={() => setPaysChoisis(PAYS.map(p => p.id))}>Tous</button>
                  <button type="button" className="underline text-sky-700" onClick={() => setPaysChoisis([])}>Aucun</button>
                  <button type="button" className="underline text-sky-700" onClick={() => setPaysChoisis(paysParDefaut())}>Par défaut</button>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  {PAYS.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={paysChoisis.includes(p.id)}
                        onChange={e => setPaysChoisis(e.target.checked ? [...paysChoisis, p.id] : paysChoisis.filter(x => x !== p.id))} />
                      <span>{p.pays}</span>
                      <span className="text-[10px] text-gray-400">mail en {p.langue === 'en' ? 'anglais' : 'français'}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-gray-400">Les petits territoires (Jersey, Bermudes...) sont décochés au départ : très peu de commerces. Dans les pays anglophones, écris les métiers en anglais (Hair salon, Plumber...) : Google trouve de meilleures fiches.</p>
              </details>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs text-gray-600" htmlFor="rat-nb-codes">Nombre de codes à tirer</label>
                <input id="rat-nb-codes" type="number" min="1" max="200" inputMode="numeric" value={nbCodes} onChange={e => setNbCodes(e.target.value)} className="input w-20 py-2 text-sm" />
                <button type="button" onClick={tirerDansLesZones} className="px-3 py-2 rounded-lg border border-sky-300 text-sky-700 text-sm font-medium bg-white">🎲 Tirer les codes postaux</button>
              </div>
            </div>
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
            {r.vide ? (lignes(metiers).length ? 'Coche au moins un pays ou écris des zones.' : 'Ajoute au moins un métier (les zones peuvent rester vides : codes tirés au hasard).') : r.trop ? `Trop de recherches (${r.total}). Maximum 5000 : réduis les métiers ou les zones.` : `${r.metiers} métier${r.metiers > 1 ? 's' : ''} × ${r.zones} zone${r.zones > 1 ? 's' : ''}${zonesAuHasard ? ' (codes tirés au lancement)' : ''} = ${r.total} recherches.`}
          </p>
          <button type="submit" disabled={!!occupe || r.vide || r.trop || !donnees.google_configure} className="bg-sky-600 text-white px-5 py-2.5 rounded-full text-sm font-medium disabled:opacity-50">
            {occupe === 'lancer' ? 'Lancement…' : 'Lancer le ratissage'}
          </button>
        </form>
      )}
    </div>
  )
}
