// Liens et navigation qui suivent la langue : en anglais, un lien vers /aide-commercants mène à
// /en/business-help (voir lib/chemins.mjs). Les pages qui n'existent qu'en une langue (espace connecté,
// connexion...) gardent leur adresse. À utiliser à la place de Link / useNavigate de react-router-dom.
import { forwardRef, useCallback } from 'react'
import { Link as RLink, useNavigate as useRNavigate } from 'react-router-dom'
import { getLangue } from '../lib/i18n'
import { localiser } from '../lib/chemins.mjs'

function loc(to) {
  if (typeof to === 'string') return localiser(to, getLangue())
  if (to && typeof to === 'object' && typeof to.pathname === 'string') return { ...to, pathname: localiser(to.pathname, getLangue()) }
  return to
}

export const Link = forwardRef(function Link({ to, ...props }, ref) {
  return <RLink ref={ref} to={loc(to)} {...props} />
})

export function useNavigate() {
  const navigate = useRNavigate()
  return useCallback((to, options) => (typeof to === 'number' ? navigate(to) : navigate(loc(to), options)), [navigate])
}

// Adresse localisée pour un <a href> classique : adr('/inscription') -> '/en/sign-up' en anglais.
export function adr(adresse) { return loc(adresse) }
