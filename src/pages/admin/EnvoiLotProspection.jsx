import { useState, useEffect, useRef } from 'react'
import { langueDe } from '../../lib/messagesProspection.mjs'
import api from '../../lib/api'
import { eligiblesEnvoi, aEnvoyerMaintenant, PAUSE_ENTRE_MAILS_MS } from '../../lib/prospectionLot.mjs'

const attendre = (ms) => new Promise(r => setTimeout(r, ms))

// Envoi en lot : le mail de présentation part à tous les prospects qui ont un email et n'ont jamais été
// contactés, un par un avec une pause, dans la limite d'un plafond par jour (vérifié aussi par le serveur).
// La page doit rester ouverte pendant l'envoi.
export default function EnvoiLotProspection({ prospects, sujetDe, messageDe, onFini }) {
  const [plafond, setPlafond] = useState(30)
  const [deja, setDeja] = useState(null)
  const [etat, setEtat] = useState(null) // { fait, total, nom } pendant l'envoi
  const [bilan, setBilan] = useState(null)
  const [erreur, setErreur] = useState(null)
  const stop = useRef(false)
  const enCours = useRef(false)

  const eligibles = eligiblesEnvoi(prospects)
  const cible = aEnvoyerMaintenant(eligibles, plafond, deja ?? 0)

  const lireCompteur = () => api.get('/admin/prospection/envois-jour').then(r => { setDeja(r.data.envoyes); return r.data.envoyes }).catch(() => null)
  useEffect(() => { lireCompteur() }, [prospects.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Quitter la page pendant un envoi l'interrompt : on le signale et on s'arrête proprement.
  useEffect(() => {
    const avant = (e) => { if (enCours.current) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', avant)
    return () => { window.removeEventListener('beforeunload', avant); stop.current = true }
  }, [])

  const lancer = async () => {
    setErreur(null); setBilan(null)
    const dejaMaintenant = await lireCompteur()
    if (dejaMaintenant === null) return setErreur('Impossible de lire le compteur du jour : réessaie.')
    const liste = aEnvoyerMaintenant(eligibles, plafond, dejaMaintenant)
    if (!liste.length) return setErreur(`Plafond du jour atteint (${dejaMaintenant}/${plafond}). Reprise demain, ou monte le plafond si tes rebonds restent bas.`)
    const nbEn = liste.filter(p => langueDe(p) === 'en').length
    if (!window.confirm(
      `Envoyer le mail de présentation à ${liste.length} prospect${liste.length > 1 ? 's' : ''} ?\n\n` +
      (nbEn ? `${liste.length - nbEn} en français, ${nbEn} en anglais (commerces à l'étranger).\n\n` : '') +
      `Chaque mail indique d'où vient l'adresse et contient le lien pour se désinscrire. ` +
      `Les mails partent à la suite, environ 2 par seconde : garde cette page ouverte jusqu'à la fin.`
    )) return

    stop.current = false; enCours.current = true
    const res = { envoyes: 0, ignores: 0, echecs: 0, arret: null }
    let echecsDeSuite = 0
    for (let i = 0; i < liste.length; i++) {
      if (stop.current) { res.arret = 'Arrêté par toi.'; break }
      const p = liste[i]
      setEtat({ fait: i, total: liste.length, nom: p.nom })
      try {
        await api.post(`/admin/prospection/${p.id}/envoyer-email`, { sujet: sujetDe(p), message: messageDe(p), essaiGratuit: false, plafondJour: Number(plafond), langue: langueDe(p) })
        res.envoyes += 1; echecsDeSuite = 0
      } catch (e) {
        const s = e.response?.status
        if (s === 429) { res.arret = e.response.data?.error || 'Plafond du jour atteint.'; break }
        if (s === 409) { res.ignores += 1; continue } // adresse qui a demandé à ne plus être contactée
        res.echecs += 1; echecsDeSuite += 1
        if (echecsDeSuite >= 3) { res.arret = `3 échecs de suite, j'arrête (${e.response?.data?.error || 'erreur'}).`; break }
      }
      if (i < liste.length - 1) await attendre(PAUSE_ENTRE_MAILS_MS)
    }
    enCours.current = false
    setEtat(null); setBilan(res)
    await lireCompteur()
    onFini?.()
  }

  const arreter = () => { stop.current = true }

  if (!prospects.length) return null

  return (
    <div className="card space-y-3">
      <div>
        <h3 className="font-bold text-gray-900">Envoi en lot</h3>
        <p className="text-xs text-gray-500">
          Envoie le mail de présentation à tous les prospects qui ont un email et que tu n'as jamais contactés. Les adresses qui ont dit stop sont sautées. Pas d'avis offert dans ce mail.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg py-2"><p className="text-lg font-bold text-gray-900 tabular-nums">{eligibles.length}</p><p className="text-[11px] text-gray-500">prêts à recevoir</p></div>
        <div className="bg-gray-50 rounded-lg py-2"><p className="text-lg font-bold text-gray-900 tabular-nums">{deja ?? '—'}</p><p className="text-[11px] text-gray-500">envoyés aujourd'hui</p></div>
        <div className="bg-gray-50 rounded-lg py-2"><p className="text-lg font-bold text-gray-900 tabular-nums">{cible.length}</p><p className="text-[11px] text-gray-500">partiront maintenant</p></div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-medium text-gray-700" htmlFor="lot-plafond">Plafond par jour</label>
          <input id="lot-plafond" type="number" min="1" max="500" inputMode="numeric" value={plafond} disabled={!!etat}
            onChange={e => setPlafond(e.target.value)} className="input w-24 py-2 text-sm block mt-1" />
        </div>
        {etat ? (
          <button onClick={arreter} className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium">Arrêter l'envoi</button>
        ) : (
          <button onClick={lancer} disabled={!eligibles.length || !Number(plafond) || Number(plafond) < 1 || Number(plafond) > 500}
            className="bg-sky-600 text-white px-5 py-2.5 rounded-full text-sm font-medium disabled:opacity-50">
            Envoyer à tous ceux qui ont un email
          </button>
        )}
      </div>
      <p className="text-[11px] text-gray-400">
        Commence bas (30 par jour) et monte seulement si les rebonds et plaintes restent faibles dans Resend : un domaine mal vu finit en spam, mails de commande compris. Le plafond est aussi vérifié par le serveur.
      </p>

      {etat && (
        <div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={etat.fait} aria-valuemin={0} aria-valuemax={etat.total}>
            <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${Math.round((etat.fait / etat.total) * 100)}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Envoi {etat.fait + 1} sur {etat.total} : {etat.nom}. Garde la page ouverte.</p>
        </div>
      )}

      {erreur && <p className="rounded-xl p-3 text-sm bg-red-50 text-red-600 border border-red-200">{erreur}</p>}
      {bilan && (
        <p className={`rounded-xl p-3 text-sm border ${bilan.arret ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {bilan.envoyes} mail{bilan.envoyes > 1 ? 's' : ''} envoyé{bilan.envoyes > 1 ? 's' : ''}
          {bilan.ignores > 0 && `, ${bilan.ignores} ignoré${bilan.ignores > 1 ? 's' : ''} (a dit stop)`}
          {bilan.echecs > 0 && `, ${bilan.echecs} échec${bilan.echecs > 1 ? 's' : ''}`}.
          {bilan.arret && ` ${bilan.arret}`}
        </p>
      )}

      {eligibles[0] && (
        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer">Voir le mail tel qu'il partira (pour {eligibles[0].nom})</summary>
          <p className="font-medium mt-2">Sujet : {sujetDe(eligibles[0])}</p>
          <pre className="whitespace-pre-wrap bg-gray-50 rounded-lg p-3 mt-1 text-[11px] leading-relaxed">{messageDe(eligibles[0])}</pre>
        </details>
      )}
    </div>
  )
}
