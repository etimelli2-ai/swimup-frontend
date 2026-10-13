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
- Adresse inconnue : `src/pages/NotFound.jsx` (noindex). Vrai statut 404 côté serveur une fois la commande de démarrage changée (voir « Prérendu et 404 »).

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

## Prérendu et 404 (lot 2)
- `npm run build` = `vite build` puis `scripts/prerender.mjs`. Le script rend chaque page publique avec `react-dom/server` (via Vite SSR), pose son `<head>` avec `injecterHead` (`src/lib/seo.mjs`) et écrit `dist/<page>.html`. Pages : `PAGES` dans `src/prerender-entry.jsx` (guides, outil, `/inscription`, `/confidentialite`).
- La commande (`/`, `/commander`), `/suivi`, l'espace client, l'admin, la connexion et les pages membres ne sont pas prérendus.
- Les balises viennent des props de `<Seo />` de chaque page (récupérées pendant le rendu serveur) : une seule source, pas de doublon.
- Au chargement, `main.jsx` « hydrate » le HTML prérendu (attribut `data-prerender`) ; `<Seo />` reprend les balises `data-seo-pre`, sans doublon, et remet les valeurs d'`index.html` en quittant la page.
- Sécurité du build : tout est rendu et contrôlé en mémoire avant d'écrire. En cas d'erreur, rien n'est écrit, `dist/` reste celui de `vite build`, le script sort en code 0.
- `dist/404.html` : coquille de l'appli en noindex, renvoyée avec le statut 404.
- `public/serve.json` (copié dans `dist/`) : `cleanUrls`, pas de slash final, et des rewrites uniquement vers les routes de l'appli. Tout le reste : fichier, page prérendue ou 404.
- **Commande de démarrage Railway** : avec `npx serve dist -p $PORT --single`, `serve` renvoie `index.html` pour tout (prérendu et 404 inactifs, site identique à avant). Pour les activer : `npx serve dist -p $PORT` (sans `--single`). Retour arrière : remettre `--single`.
- Nouvelle route dans `App.jsx` : `npm test` échoue tant qu'elle n'est pas dans `public/serve.json` (ou prérendue). Nouvelle page publique à prérendre : l'ajouter à `PAGES` et à `public/sitemap.xml`.

## Mesure d'audience (lot 4) : Umami
- `src/lib/mesure.mjs` (identifiants, règles, chargement du script) + `src/components/Mesure.jsx` (monté dans `App.jsx`). `index.html` n'est pas modifié : le script est ajouté par le code, seulement quand une page mesurée s'affiche.
- Mesuré : `/`, `/commander`, guides, outil, `/inscription`, `/confidentialite`, pour un visiteur non connecté, sur `swimup.net` uniquement. Jamais : `/suivi` (jeton dans l'adresse), espace client, admin, connexion, pages membres, visiteur connecté, autre domaine (localhost, adresse Railway).
- Script : `data-auto-track="false"` (page vue envoyée à la main, chemin seul, sans paramètres), `data-do-not-track="true"`, `data-domains="swimup.net"`. Sans cookie.
- Événements : `inscription-source` (`src` = guide, outil...), `compte-cree`, `outil-lien-copie`, `outil-qr-telecharge`, `outil-affiche-imprimee`.
- Un événement : `mesure('nom', { clé: valeur })`. Sans effet si le script est bloqué.
- `src/pages/Confidentialite.jsx` mentionne Umami (liste des sous-traitants et phrase sur la mesure).
- Dans Umami : Goals/Funnels à créer à la main, p. ex. page `/aide-commercants/*` → `/inscription` → événement `compte-cree`.
