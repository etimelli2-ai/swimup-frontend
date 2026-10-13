import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Racine from './Racine'
import '@fontsource/bricolage-grotesque/latin-700.css'
import '@fontsource/bricolage-grotesque/latin-800.css'
import './index.css'

const conteneur = document.getElementById('root')
const arbre = <Racine Routeur={BrowserRouter} />

// Page prérendue au build (scripts/prerender.mjs) : on « hydrate » le HTML déjà présent au lieu de
// le jeter. Les autres pages (commande, espace connecté...) démarrent comme avant.
if (conteneur.hasAttribute('data-prerender')) {
  ReactDOM.hydrateRoot(conteneur, arbre)
} else {
  ReactDOM.createRoot(conteneur).render(arbre)
}
