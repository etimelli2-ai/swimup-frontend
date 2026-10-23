// Langue du site (fr / en) : état React + persistance. Le texte lui-même vient de lib/i18n.js.
import { createContext, useContext, useEffect, useState, useCallback, Fragment } from 'react'
import { useAuth } from '../hooks/useAuth'
import { langueEnregistree, enregistrerLangue, setLangueCourante, langueValide, chargerAnglais } from '../lib/i18n'

const LangueCtx = createContext({ langue: 'fr', setLangue: () => {} })

export function LangueProvider({ children }) {
  // Page prérendue : on hydrate d'abord en français (le HTML du serveur l'est), puis on applique la
  // langue choisie juste après, pour éviter une erreur d'hydratation.
  const hydratation = typeof document !== 'undefined' && !!document.getElementById('root')?.hasAttribute('data-prerender')
  const [langue, setEtat] = useState(() => {
    const l = hydratation ? 'fr' : langueEnregistree()
    setLangueCourante(l)
    return l
  })
  // En anglais, on n'affiche rien tant que le dictionnaire n'est pas arrivé (quelques dizaines de ms).
  const [pret, setPret] = useState(langue !== 'en')

  const appliquer = useCallback((v) => {
    setLangueCourante(v)
    enregistrerLangue(v)
    setEtat(v)
  }, [])

  const setLangue = useCallback((l) => {
    const v = langueValide(l)
    if (v !== 'en') { appliquer(v); return }
    chargerAnglais().then(() => appliquer(v)).catch(() => appliquer('fr'))
  }, [appliquer])

  useEffect(() => {
    if (pret) return
    chargerAnglais().then(() => setPret(true)).catch(() => { appliquer('fr'); setPret(true) })
  }, [pret, appliquer])

  useEffect(() => {
    if (!hydratation) return
    const l = langueEnregistree()
    if (l !== 'fr') setLangue(l)
  }, [hydratation, setLangue])

  useEffect(() => { document.documentElement.lang = langue }, [langue])

  return <LangueCtx.Provider value={{ langue, setLangue }}>{pret ? children : null}</LangueCtx.Provider>
}

export function useLangue() { return useContext(LangueCtx) }

// Remonte les pages quand la langue change : tous les textes sont relus avec la nouvelle langue.
// L'administration reste toujours en français, quelle que soit la langue choisie.
export function langueEffective(langue, user) { return user?.role === 'admin' ? 'fr' : langue }

export function ParLangue({ children }) {
  const { langue } = useLangue()
  const { user } = useAuth() || {}
  const effective = langueEffective(langue, user)
  setLangueCourante(effective)
  return <Fragment key={effective}>{children}</Fragment>
}
