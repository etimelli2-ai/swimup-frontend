// Langue du site (fr / en) : état React + persistance. Le texte lui-même vient de lib/i18n.js.
//
// Qui décide de la langue ?
//  - une adresse en /en/... est toujours en anglais (c'est ce que Google indexe) ;
//  - une adresse française est en français, SAUF si le visiteur a lui-même choisi l'anglais avant : on le
//    renvoie alors vers la version anglaise de la page (les robots n'ont pas de choix enregistré, ils voient
//    donc toujours le français sur les adresses françaises) ;
//  - les pages qui n'existent qu'en une langue (connexion, espace connecté) suivent le choix enregistré.
import { createContext, useContext, useEffect, useState, useCallback, Fragment } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { langueEnregistree, enregistrerLangue, setLangueCourante, langueValide, chargerAnglais, anglaisCharge } from '../lib/i18n'
import { estEn, versEn, versFr } from '../lib/chemins.mjs'

const LangueCtx = createContext({ langue: 'fr', setLangue: () => {} })

export function LangueProvider({ children }) {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const urlEn = estEn(pathname)
  // Page prérendue en français : on hydrate d'abord en français (le HTML du serveur l'est), puis on applique
  // la langue choisie juste après, pour éviter une erreur d'hydratation. Une page /en prérendue est hydratée
  // directement en anglais (main.jsx charge le dictionnaire avant).
  const hydratation = typeof document !== 'undefined' && !!document.getElementById('root')?.hasAttribute('data-prerender')
  const [langue, setEtat] = useState(() => {
    const l = urlEn ? 'en' : (hydratation ? 'fr' : langueEnregistree())
    setLangueCourante(l)
    return l
  })
  // En anglais, on n'affiche rien tant que le dictionnaire n'est pas arrivé (quelques dizaines de ms).
  const [pret, setPret] = useState(langue !== 'en' || anglaisCharge())

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

  // Choix du visiteur (sélecteur FR | EN) : si la page existe dans l'autre langue, on va à son adresse.
  const choisirLangue = useCallback((l) => {
    const v = langueValide(l)
    const cible = v === 'en' ? versEn(pathname) : versFr(pathname)
    const aller = () => { if (cible && cible !== pathname) navigate(cible + search + hash) }
    if (v !== 'en') { appliquer(v); aller(); return }
    chargerAnglais().then(() => { appliquer(v); aller() }).catch(() => appliquer('fr'))
  }, [pathname, search, hash, navigate, appliquer])

  useEffect(() => {
    if (pret) return
    chargerAnglais().then(() => setPret(true)).catch(() => { appliquer('fr'); setPret(true) })
  }, [pret, appliquer])

  // Adresse /en/... : la page est en anglais, et ce choix est retenu pour la suite de la visite.
  // Adresse française d'une page qui a une version anglaise : le visiteur qui avait choisi l'anglais est renvoyé dessus.
  useEffect(() => {
    if (urlEn) {
      if (langue !== 'en') setLangue('en')
      else enregistrerLangue('en')
      return
    }
    const stockee = langueEnregistree()
    const cible = versEn(pathname)
    if (stockee === 'en' && cible) {
      chargerAnglais().then(() => { appliquer('en'); navigate(cible + search + hash, { replace: true }) }).catch(() => {})
      return
    }
    if (hydratation && stockee !== langue) setLangue(stockee)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => { document.documentElement.lang = langue }, [langue])

  return <LangueCtx.Provider value={{ langue, setLangue, choisirLangue }}>{pret ? children : null}</LangueCtx.Provider>
}

export function useLangue() { return useContext(LangueCtx) }

// Remonte les pages quand la langue change : tous les textes sont relus avec la nouvelle langue.
// Les pages d'administration (/admin/...) restent toujours en français, quelle que soit la langue choisie.
// Un admin qui regarde une page publique ou son espace voit la langue de la page, comme n'importe quel visiteur
// (sinon il ne peut pas vérifier la version anglaise).
export function langueEffective(langue, user, pathname = '') {
  return user?.role === 'admin' && /^\/admin(\/|$)/.test(pathname) ? 'fr' : langue
}

export function ParLangue({ children }) {
  const { langue } = useLangue()
  const { user } = useAuth() || {}
  const { pathname } = useLocation()
  const effective = langueEffective(langue, user, pathname)
  setLangueCourante(effective)
  return <Fragment key={effective}>{children}</Fragment>
}
