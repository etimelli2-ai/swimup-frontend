// Dictionnaire anglais : clé = texte français exact, valeur = traduction (ou [singulier, pluriel]).
// Un fichier par zone du site ; les clés en double avec deux traductions différentes sont refusées
// par tests/i18n.test.mjs.
import { lire } from './lire.js'
import commun from './commun.js'
import compte from './compte.js'
import membre from './membre.js'
import client1 from './client1.js'
import client2 from './client2.js'
import publicZone from './public.js'
import guides from './guides.js'
import divers from './divers.js'

export default {
  ...lire(commun),
  ...lire(compte),
  ...lire(membre),
  ...lire(client1),
  ...lire(client2),
  ...lire(publicZone),
  ...lire(guides),
  ...lire(divers),
}
