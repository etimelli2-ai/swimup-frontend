import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Plus, Trash2, Save, ChevronDown, Coins } from 'lucide-react'
import toast from 'react-hot-toast'

// Barème admin : combien un membre touche par avis selon le nombre d'avis
// qu'il a déjà réalisés. Le serveur valide tout (seuils, limites de gain).
export default function BaremeMembre() {
  const [ouvert, setOuvert] = useState(false)
  const [lignes, setLignes] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    if (!ouvert || lignes) return
    api.get('/admin/bareme')
      .then(r => setLignes(r.data.bareme.map(p => ({ a_partir_de: String(p.a_partir_de), gain: String(p.gain) }))))
      .catch(() => toast.error('Impossible de charger le barème'))
  }, [ouvert, lignes])

  const maj = (i, champ, valeur) => setLignes(l => l.map((p, j) => (j === i ? { ...p, [champ]: valeur } : p)))

  const enregistrer = async () => {
    setEnvoi(true)
    try {
      const r = await api.put('/admin/bareme', {
        bareme: lignes.map(p => ({ a_partir_de: Number(p.a_partir_de), gain: Number(String(p.gain).replace(',', '.')) })),
      })
      setLignes(r.data.bareme.map(p => ({ a_partir_de: String(p.a_partir_de), gain: String(p.gain) })))
      toast.success('Barème enregistré')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="card-flat">
      <button onClick={() => setOuvert(o => !o)} className="w-full flex items-center justify-between gap-2 text-left" aria-expanded={ouvert}>
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <Coins size={16} className="text-emerald-500" /> Gain des membres par avis
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${ouvert ? 'rotate-180' : ''}`} />
      </button>

      {ouvert && (
        <div className="mt-3 space-y-3">
          {!lignes ? (
            <p className="text-xs text-slate-400">Chargement…</p>
          ) : (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Le gain monte avec le nombre d'avis déjà réalisés par le membre. Il est figé quand il réserve un avis.
                Un gain fixé à la main sur un avis passe toujours avant ce barème.
              </p>
              <div className="space-y-2">
                {lignes.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0">Dès</span>
                    <input className="input text-sm w-20" type="number" min="0" step="1" aria-label="À partir de combien d'avis"
                      value={p.a_partir_de} disabled={i === 0}
                      onChange={e => maj(i, 'a_partir_de', e.target.value)} />
                    <span className="text-slate-500 dark:text-slate-400 shrink-0">avis :</span>
                    <input className="input text-sm w-24" type="number" min="0.1" step="0.05" aria-label="Gain en euros"
                      value={p.gain} onChange={e => maj(i, 'gain', e.target.value)} />
                    <span className="text-slate-500 dark:text-slate-400">€</span>
                    {i > 0 && (
                      <button onClick={() => setLignes(l => l.filter((_, j) => j !== i))} className="p-1.5 text-slate-400 hover:text-red-500" aria-label="Supprimer ce palier">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setLignes(l => [...l, { a_partir_de: '', gain: '' }])} className="btn-secondary text-sm"><Plus size={15} /> Palier</button>
                <button onClick={enregistrer} disabled={envoi} className="btn-primary text-sm disabled:opacity-70"><Save size={15} /> {envoi ? 'Enregistrement…' : 'Enregistrer'}</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
