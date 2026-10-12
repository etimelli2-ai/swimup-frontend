import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import MiniLineChart from '../../components/MiniLineChart'

const euro = (n) => `${(Number(n) || 0).toFixed(2).replace('.', ',')} €`
const dateHeure = (s) => s ? new Date(String(s).replace(' ', 'T') + 'Z').toLocaleString('fr-FR') : '—'

export default function AdminBusiness() {
  const [onglet, setOnglet] = useState('chiffres')
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="page-title">Business</h2>
        <p className="text-sm text-muted mt-1">Conversion, revenus, coûts estimés et erreurs techniques.</p>
      </div>
      <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
        {[['chiffres', 'Chiffres'], ['erreurs', 'Erreurs']].map(([v, l]) => (
          <button key={v} onClick={() => setOnglet(v)}
            className={`flex-1 py-2 text-xs font-medium rounded-full transition-all ${onglet === v ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300' : 'text-gray-500'}`}>{l}</button>
        ))}
      </div>
      {onglet === 'chiffres' ? <Chiffres /> : <Erreurs />}
    </div>
  )
}

function Stat({ label, valeur, detail }) {
  return (
    <div className="card">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{valeur}</p>
      {detail && <p className="text-xs text-muted mt-1">{detail}</p>}
    </div>
  )
}

function Chiffres() {
  const [i, setI] = useState(null)
  const [erreur, setErreur] = useState(false)
  const charger = () => api.get('/admin/business/indicateurs').then(r => setI(r.data)).catch(() => setErreur(true))
  useEffect(() => { charger() }, [])

  if (erreur) return <div className="card text-center py-8 text-sm text-red-500">Impossible de charger les chiffres.</div>
  if (!i) return null
  const sources = Object.entries(i.entreprises.par_source).map(([k, n]) => `${n} ${k === 'stripe' ? 'par carte' : k === 'paypal' ? 'PayPal' : k === 'admin' ? 'offert(s)' : k}`).join(', ')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Entreprises" valeur={i.entreprises.total} detail={`${i.entreprises.nouvelles_30j} nouvelle(s) en 30 j`} />
        <Stat label="Premium actifs" valeur={i.entreprises.premium_actifs} detail={sources || 'aucun'} />
        <Stat label="Conversion" valeur={`${i.conversion.taux_premium_pourcent} %`} detail={`${i.conversion.nouveaux_abonnes_30j} nouvel abonné(s) en 30 j`} />
        <Stat label="Résiliations (30 j)" valeur={i.conversion.resiliations_30j} detail={`${i.conversion.abonnements_carte_actifs} abonnement(s) carte actif(s)`} />
        <Stat label="Revenus (30 j)" valeur={euro(i.revenus.derniers_30j)} detail={`${i.revenus.paiements_30j} paiement(s)`} />
        <Stat label="Marge estimée (30 j)" valeur={euro(i.rentabilite.marge_estimee_30j)}
          detail={i.rentabilite.cout_moyen_par_premium !== null ? `${euro(i.rentabilite.cout_moyen_par_premium)} de coût par Premium` : null} />
      </div>

      {i.revenus.par_mois.length > 1 && (
        <div className="card space-y-2">
          <h3 className="section-title">Revenus par mois</h3>
          <MiniLineChart points={i.revenus.par_mois.map(m => ({ label: m.mois, value: m.total }))} formatValue={euro} />
        </div>
      )}

      <div className="card space-y-2">
        <h3 className="section-title">Coûts estimés sur 30 jours</h3>
        <ul className="text-sm space-y-1">
          <li>Frais de paiement par carte : {euro(i.couts.estimation_30j.stripe)}</li>
          <li>Réponses IA ({i.usage_30j.reponses_ia}) : {euro(i.couts.estimation_30j.ia)}</li>
          <li>Emails envoyés ({i.usage_30j.emails_envoyes}) : {euro(i.couts.estimation_30j.emails)}</li>
          <li>Coûts fixes : {euro(i.couts.estimation_30j.fixes)}</li>
          <li className="font-semibold pt-1">Total : {euro(i.couts.estimation_30j.total)}</li>
        </ul>
        <p className="text-xs text-muted">{i.rentabilite.avertissement}</p>
      </div>

      <Couts reglages={i.couts.reglages} apres={charger} />
    </div>
  )
}

const CHAMPS = [
  ['cout_ia_reponse', 'Coût d\'une réponse IA (€)'],
  ['cout_email', 'Coût d\'un email (€)'],
  ['stripe_pourcent', 'Commission Stripe (%)'],
  ['stripe_fixe', 'Frais fixes par paiement carte (€)'],
  ['cout_fixe_mensuel', 'Coûts fixes par mois : hébergement, base… (€)'],
]

function Couts({ reglages, apres }) {
  const [v, setV] = useState(() => Object.fromEntries(CHAMPS.map(([k]) => [k, String(reglages[k])])))
  const [envoi, setEnvoi] = useState(false)
  const enregistrer = async () => {
    setEnvoi(true)
    try {
      await api.put('/admin/business/couts', Object.fromEntries(Object.entries(v).map(([k, x]) => [k, Number(String(x).replace(',', '.'))])))
      toast.success('Prix unitaires enregistrés')
      apres()
    } catch (e) { toast.error(e.response?.data?.error || 'Erreur') }
    setEnvoi(false)
  }
  return (
    <div className="card space-y-3">
      <h3 className="section-title">Prix unitaires utilisés pour l'estimation</h3>
      {CHAMPS.map(([k, label]) => (
        <label key={k} className="block text-sm">{label}
          <input className="input mt-1" inputMode="decimal" value={v[k]} onChange={e => setV(p => ({ ...p, [k]: e.target.value }))} />
        </label>
      ))}
      <button className="btn-primary w-full" onClick={enregistrer} disabled={envoi}>Enregistrer</button>
    </div>
  )
}

function Erreurs() {
  const [d, setD] = useState(null)
  useEffect(() => { api.get('/admin/business/erreurs').then(r => setD(r.data)) }, [])
  if (!d) return null
  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <h3 className="section-title">Les 7 derniers jours</h3>
        {d.resume_7j.length === 0 ? <p className="text-sm text-muted">Aucune erreur enregistrée.</p> : (
          <ul className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
            {d.resume_7j.map(r => (
              <li key={r.contexte} className="flex justify-between py-1.5 gap-2">
                <span className="truncate">{r.contexte}</span>
                <span className="text-muted shrink-0">{r.n} · {dateHeure(r.derniere)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card space-y-2">
        <h3 className="section-title">Dernières erreurs</h3>
        <ul className="text-[13px] space-y-2">
          {d.dernieres.map(e => (
            <li key={e.id}>
              <span className="text-muted">{dateHeure(e.created_at)}</span> · <span className="font-medium">{e.contexte}</span>
              <p className="text-slate-600 dark:text-slate-300 break-words">{e.message}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">Gardées 30 jours. Seul le message est conservé, jamais le contenu d'une requête.</p>
      </div>
    </div>
  )
}
