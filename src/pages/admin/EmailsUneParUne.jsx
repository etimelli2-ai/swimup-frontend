import { useState, useRef, useMemo } from 'react'
import api from '../../lib/api'
import { aCompleter, emailValide, lienRechercheGoogle } from '../../lib/prospectionLot.mjs'
import { Globe, Phone, ExternalLink } from 'lucide-react'

const CLE = 'swimup_prospection_passees'
const lirePassees = () => { try { return new Set(JSON.parse(localStorage.getItem(CLE) || '[]')) } catch { return new Set() } }
const ecrirePassees = (set) => { try { localStorage.setItem(CLE, JSON.stringify([...set])) } catch { /* stockage indisponible */ } }

// Mode « une par une » : pour chaque fiche sans email, ouvre la recherche Google, tu colles l'adresse
// trouvée, Entrée enregistre et ouvre la recherche de la fiche suivante. Tu lis la source toi-même
// avant de coller : rien n'est lu automatiquement sur Google.
export default function EmailsUneParUne({ prospects, onFini }) {
  const [ouvert, setOuvert] = useState(false)
  const [valeur, setValeur] = useState('')
  const [traitees, setTraitees] = useState(new Set())  // enregistrées pendant cette session
  const [passees, setPassees] = useState(lirePassees)  // « pas d'email trouvé », gardées sur cet appareil
  const [erreur, setErreur] = useState(null)
  const [sauvees, setSauvees] = useState(0)
  const champ = useRef(null)

  const ignorees = useMemo(() => new Set([...passees, ...traitees]), [passees, traitees])
  const file = useMemo(() => aCompleter(prospects, ignorees), [prospects, ignorees])
  const courante = file[0]
  const suivante = file[1]
  const total = file.length + traitees.size

  const ouvrirGoogle = (p) => { if (p) window.open(lienRechercheGoogle(p), '_blank', 'noopener') }

  const valider = async () => {
    if (!courante) return
    const email = valeur.trim()
    if (!emailValide(email)) return setErreur('Cette adresse n\'a pas l\'air valide.')
    setErreur(null)
    const p = courante
    setTraitees(t => new Set(t).add(p.id)); setValeur('')
    ouvrirGoogle(suivante) // dans le geste de l'utilisateur, sinon le navigateur bloque l'onglet
    try {
      await api.put(`/admin/prospection/${p.id}/email`, { email })
      setSauvees(n => n + 1)
    } catch (e) {
      setTraitees(t => { const c = new Set(t); c.delete(p.id); return c })
      setValeur(email)
      setErreur(`${p.nom} : ${e.response?.data?.error || 'enregistrement impossible'}. Réessaie.`)
    }
    champ.current?.focus()
  }

  const passer = (definitivement) => {
    if (!courante) return
    const p = courante
    if (definitivement) {
      const n = new Set(passees).add(p.id); setPassees(n); ecrirePassees(n)
    } else {
      setTraitees(t => new Set(t).add(p.id)) // reste visible dans la liste, juste plus dans cette session
    }
    setValeur(''); setErreur(null)
    ouvrirGoogle(suivante)
    champ.current?.focus()
  }

  const fermer = () => { setOuvert(false); onFini?.() }

  if (!prospects.some(p => !p.email) && !ouvert) return null

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-gray-900">Chercher les emails une par une</h3>
          <p className="text-xs text-gray-500">{aCompleter(prospects, passees).length} fiche{aCompleter(prospects, passees).length > 1 ? 's' : ''} sans email. Google s'ouvre sur la fiche, tu colles l'adresse, Entrée passe à la suivante.</p>
        </div>
        {!ouvert && (
          <button onClick={() => { setOuvert(true); setTraitees(new Set()); setSauvees(0) }} disabled={!aCompleter(prospects, passees).length}
            className="bg-sky-600 text-white px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap disabled:opacity-50">Commencer</button>
        )}
      </div>

      {ouvert && (
        <div className="rounded-xl border border-gray-200 p-3 space-y-3">
          {courante ? (
            <>
              <p className="text-xs text-gray-500">Fiche {Math.min(traitees.size + 1, total)} sur {total} · {sauvees} email{sauvees > 1 ? 's' : ''} enregistré{sauvees > 1 ? 's' : ''}</p>
              <div>
                <p className="font-bold text-gray-900">{courante.nom}</p>
                <p className="text-xs text-gray-500">{courante.adresse}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                  {courante.telephone && <span className="flex items-center gap-1"><Phone size={12} /> {courante.telephone}</span>}
                  {courante.site_web && <a href={courante.site_web} target="_blank" rel="noreferrer" className="text-sky-600 flex items-center gap-1"><Globe size={12} /> Site <ExternalLink size={10} /></a>}
                </div>
              </div>
              <button type="button" onClick={() => ouvrirGoogle(courante)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1">
                <Globe size={12} /> Ouvrir la recherche Google
              </button>
              <div className="flex gap-2">
                <input
                  ref={champ} autoFocus type="email" inputMode="email" value={valeur} aria-label="Email trouvé"
                  onChange={e => setValeur(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); valider() } }}
                  placeholder="Colle l'email puis Entrée" className="input flex-1 text-sm"
                />
                <button type="button" onClick={valider} disabled={!valeur.trim()} className="bg-sky-600 text-white px-4 py-2 rounded-full text-xs font-medium disabled:opacity-50">Enregistrer</button>
              </div>
              {erreur && <p className="text-xs text-red-600">{erreur}</p>}
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => passer(false)} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium">Passer</button>
                <button type="button" onClick={() => passer(true)} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium">Aucun email trouvé</button>
                <span className="flex-1" />
                <button type="button" onClick={fermer} className="text-xs text-gray-500 underline">Terminer</button>
              </div>
              <p className="text-[11px] text-gray-400">Vérifie la source avant de coller : l'aperçu IA de Google peut se tromper, et une adresse perso (gmail…) d'un artisan en nom propre demande de la prudence. « Aucun email trouvé » masque la fiche de ce mode sur cet appareil, sans rien supprimer.</p>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-700">Terminé : {sauvees} email{sauvees > 1 ? 's' : ''} enregistré{sauvees > 1 ? 's' : ''}.</p>
              <button type="button" onClick={fermer} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-xs font-medium">Fermer</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
