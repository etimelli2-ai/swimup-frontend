// Pose les balises SEO d'une page (title, description, canonical, Open Graph, robots, JSON-LD)
// et les retire au départ de la page.
//
// Pourquoi : index.html fige le même canonical, la même description et les mêmes données
// structurées (Service + FAQ de la page de commande) sur toutes les routes. Ici on les remplace
// le temps de la page, sans toucher à index.html ni à la page de commande, qui garde le sien.
//
// Prérendu : scripts/prerender.mjs écrit déjà ces balises dans le HTML de certaines pages publiques
// (attribut data-seo-pre). Au chargement on les reprend telles quelles ; en quittant la page, celles qui
// existent dans index.html reprennent leur valeur d'origine (HEAD_BASE), les autres sont retirées.
import { useEffect } from 'react'
import { construireHead, HEAD_BASE } from '../lib/seo.mjs'

const LD_GLOBAL = 'script[type="application/ld+json"]:not([data-seo]):not([data-seo-pre])'

export default function Seo(props) {
  const cle = JSON.stringify(props)
  // Rendu serveur (prérendu) : le script récupère les props de la page pour écrire son <head>.
  if (typeof document === 'undefined' && globalThis.__SEO_COLLECTE) globalThis.__SEO_COLLECTE.push(props)
  useEffect(() => {
    const h = construireHead(props)
    const retours = []

    const titreAvant = document.head.querySelector('title[data-seo-pre]') ? HEAD_BASE.titre : document.title
    document.title = h.titre
    retours.push(() => { document.title = titreAvant })

    for (const [attr, nom, valeur] of h.metas) {
      let el = document.head.querySelector(`meta[${attr}="${nom}"]`)
      if (el) {
        const pre = el.hasAttribute('data-seo-pre')
        const base = pre ? HEAD_BASE[`${attr}:${nom}`] : el.getAttribute('content')
        el.setAttribute('content', valeur)
        retours.push(pre && base === undefined ? () => el.remove() : () => el.setAttribute('content', base ?? ''))
      } else {
        el = document.createElement('meta')
        el.setAttribute(attr, nom); el.setAttribute('content', valeur); el.setAttribute('data-seo', '1')
        document.head.appendChild(el)
        retours.push(() => el.remove())
      }
    }

    for (const [rel, href] of h.links) {
      let el = document.head.querySelector(`link[rel="${rel}"]`)
      if (el) {
        const pre = el.hasAttribute('data-seo-pre')
        const base = pre ? HEAD_BASE[`link:${rel}`] : el.getAttribute('href')
        el.setAttribute('href', href)
        retours.push(pre && base === undefined ? () => el.remove() : () => el.setAttribute('href', base ?? ''))
      } else {
        el = document.createElement('link')
        el.setAttribute('rel', rel); el.setAttribute('href', href); el.setAttribute('data-seo', '1')
        document.head.appendChild(el)
        retours.push(() => el.remove())
      }
    }

    // Les données structurées globales (offre à 4 € + FAQ de la commande) ne décrivent pas cette page.
    document.head.querySelectorAll(LD_GLOBAL).forEach(el => {
      const parent = el.parentNode
      const suivant = el.nextSibling
      el.remove()
      retours.push(() => parent.insertBefore(el, suivant))
    })
    // JSON-LD posés par le prérendu : remplacés par ceux de la page (même contenu), sans doublon.
    document.head.querySelectorAll('script[type="application/ld+json"][data-seo-pre]').forEach(el => el.remove())
    for (const obj of h.ld) {
      const el = document.createElement('script')
      el.type = 'application/ld+json'; el.setAttribute('data-seo', '1'); el.text = JSON.stringify(obj)
      document.head.appendChild(el)
      retours.push(() => el.remove())
    }

    return () => { for (let i = retours.length - 1; i >= 0; i--) retours[i]() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle])
  return null
}
