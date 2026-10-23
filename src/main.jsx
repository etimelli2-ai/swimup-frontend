import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Racine from './Racine'
import { chargerAnglais } from './lib/i18n'
import { estEn } from './lib/chemins.mjs'
import '@fontsource/bricolage-grotesque/latin-700.css'
import '@fontsource/bricolage-grotesque/latin-800.css'
import './index.css'

const conteneur = document.getElementById('root')
const arbre = <Racine Routeur={BrowserRouter} />

function demarrer() {
  // Page prérendue au build (scripts/prerender.mjs) : on « hydrate » le HTML déjà présent au lieu de
  // le jeter. Les autres pages (commande, espace connecté...) démarrent comme avant.
  if (conteneur.hasAttribute('data-prerender')) {
    ReactDOM.hydrateRoot(conteneur, arbre)
  } else {
    ReactDOM.createRoot(conteneur).render(arbre)
  }
}

// Une page /en/... est prérendue en anglais : il faut le dictionnaire avant l'hydratation, sinon le premier
// rendu (en français) ne correspondrait pas au HTML du serveur.
if (estEn(window.location.pathname)) chargerAnglais().then(demarrer, demarrer)
else demarrer()
