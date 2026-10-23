import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import api, { compteActif, choisirCompte } from '../lib/api'
import { t } from '../lib/i18n'

const PAGES_OUTILS = ['/client/outils', '/client/reputation', '/client/campagnes']
const ROLES = { proprietaire: 'ton compte', editeur: 'éditeur', lecteur: 'lecture seule' }

// Sélecteur d'établissement : visible seulement si la personne peut gérer plusieurs comptes.
// Il ne change que les pages d'outils d'avis (Outils avis, Réputation, Campagnes).
export default function SelecteurCompte() {
  const [comptes, setComptes] = useState([])
  const { pathname } = useLocation()
  const actif = compteActif()

  useEffect(() => {
    api.get('/client/equipe/comptes').then(r => setComptes(r.data.comptes || [])).catch(() => {})
    const retour = () => window.location.reload()
    window.addEventListener('swimup:compte', retour)
    return () => window.removeEventListener('swimup:compte', retour)
  }, [])

  const surOutils = PAGES_OUTILS.some(p => pathname.startsWith(p))
  const courant = comptes.find(c => String(c.client_id) === actif) || comptes.find(c => c.role === 'proprietaire')
  // Compte mémorisé mais plus accessible : on revient au sien.
  useEffect(() => {
    if (actif && comptes.length && !comptes.some(c => String(c.client_id) === actif)) { choisirCompte(null); window.location.reload() }
  }, [actif, comptes])

  if (comptes.length < 2 || !surOutils) return null
  const delegue = courant && courant.role !== 'proprietaire'

  const changer = (e) => {
    const id = e.target.value
    const propre = comptes.find(c => c.role === 'proprietaire')
    choisirCompte(String(propre?.client_id) === id ? null : id)
    window.location.reload()
  }

  return (
    <div className={`mb-4 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 ${delegue ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
      <div className="flex items-center gap-2 text-sm">
        <Building2 size={16} className="shrink-0 text-slate-500" />
        <label htmlFor="sel-compte" className="font-medium">{t('Établissement')}</label>
      </div>
      <select id="sel-compte" className="input sm:w-64" value={String(courant?.client_id || '')} onChange={changer}>
        {comptes.map(c => <option key={c.client_id} value={c.client_id}>{c.nom} ({c.etablissement ? t('ton entreprise') : t(ROLES[c.role])})</option>)}
      </select>
      {delegue && (
        <p className="text-xs text-amber-800 dark:text-amber-200">
          {t('Tu travailles sur le compte de {nom}', { nom: courant.nom })}{courant.role === 'lecteur' ? t(', en lecture seule') : ''}{t('. L\'abonnement et les paiements restent les tiens.')}
        </p>
      )}
    </div>
  )
}
