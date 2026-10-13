# SEO : fonctionnement (lot 1 et 3)

## Balises par page
- `src/lib/seo.mjs` : `construireHead(props)` (fonction pure) fabrique title, meta, canonical et JSON-LD. Testée dans `tests/seo.test.mjs`.
- `src/components/Seo.jsx` : applique ces balises dans le navigateur et les retire en quittant la page. Il remplace aussi, le temps de la page, les 2 JSON-LD globaux d'`index.html` (offre à 4 € et FAQ de la commande) qui ne décrivent pas les pages hors commande.
- `index.html` n'a pas été modifié. Les pages de commande (`/`, `/commander`) gardent leurs balises d'origine, vérifié par rendu.
- Pour une nouvelle page publique : `<Seo title description path jsonLd />` + ajouter l'URL dans `public/sitemap.xml` (il est écrit à la main).
- N'utilise pas `usePageTitle` pour une page publique à référencer : il ne pose ni canonical ni Open Graph, et il est partagé avec les pages membres.

## Zones privées
- `src/components/ZonesPrivees.jsx` (monté dans `App.jsx`) pose `noindex` sur : `/client`, `/admin`, `/dashboard`, `/avis`, `/profil`, `/portefeuille`, `/parrainage`, `/loterie`, `/boutique`, `/login`, `/register`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`, `/verifier-email`, `/verification-requise`, `/suivi`. Il ne change que la balise robots.
- `public/robots.txt` bloque les mêmes préfixes. `/commander` n'est plus dans le sitemap (doublon de `/`).
- Adresse inconnue : `src/pages/NotFound.jsx` (noindex). Le serveur répond encore 200 (réécriture SPA de `serve.json`) ; les vrais 404 viennent avec le prérendu (lot 2).

## Outil gratuit `/outils/lien-avis-google`
- `src/lib/lienAvis.mjs` : reconnaît identifiant de lieu (ChIJ…), lien « Demander des avis » (g.page/r/…), liens Google avec `placeid`. Refuse les liens de fiche Maps (ils n'ouvrent pas le formulaire). Testé dans `tests/lienAvis.test.mjs`.
- QR code : dépendance `qrcode`, chargée à la demande. Affiche A4 : impression navigateur (CSS `@media print`).
- Rien n'est envoyé au serveur par l'outil.
- Les CTA vers `/inscription` portent `?src=guide` ou `?src=outil…` pour une mesure future (aucune mesure installée à ce jour).

## Commandes
- `npm test` : tests des modules purs. `npm run build` : build.

## Réglages manuels
- Search Console : propriété de domaine `swimup.net` (enregistrement TXT chez le registrar), envoyer `https://swimup.net/sitemap.xml`.
- Après déploiement : inspection d'URL de `/aide-commercants/obtenir-des-avis-google` → le canonical retenu doit être la page elle-même.
