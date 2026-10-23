// Prospection : tirage au sort de lieux pour ne plus saisir de codes postaux à la main.
// Les pays proposés sont ceux dont une langue officielle est le français ou l'anglais (liste fermée ci-dessous).
// Le Maghreb n'y est pas : le français y est courant mais pas officiel.
// `langue` = langue du mail qui sera écrit aux commerces du pays (même règle que le serveur : français pour un pays
// francophone, anglais sinon ; Québec = français, reste du Canada = anglais).
// Les villes sont de taille moyenne ou grande : assez de commerces pour trouver des fiches peu avisées.

export const PAYS = [
  // --- français ---
  { pays: 'France', langue: 'fr', villes: ['Lyon', 'Marseille', 'Toulouse', 'Nantes', 'Bordeaux', 'Lille', 'Rennes', 'Strasbourg', 'Montpellier', 'Grenoble', 'Dijon', 'Angers', 'Tours', 'Reims', 'Le Havre', 'Metz', 'Nîmes', 'Clermont-Ferrand', 'Limoges', 'Perpignan', 'Brest', 'Annecy', 'Caen', 'Rouen', 'Orléans', 'Pau', 'La Rochelle', 'Avignon', 'Saint-Étienne', 'Besançon', 'Poitiers', 'Ajaccio', 'Bastia', 'Saint-Denis, La Réunion', 'Fort-de-France', 'Pointe-à-Pitre'] },
  { pays: 'Belgique', langue: 'fr', villes: ['Bruxelles', 'Liège', 'Namur', 'Charleroi', 'Mons', 'Tournai'] },
  { pays: 'Suisse', langue: 'fr', villes: ['Genève', 'Lausanne', 'Fribourg', 'Neuchâtel', 'Sion', 'Montreux'] },
  { pays: 'Luxembourg', langue: 'fr', villes: ['Luxembourg', 'Esch-sur-Alzette', 'Differdange'] },
  { pays: 'Monaco', langue: 'fr', villes: ['Monaco'] },
  { pays: 'Canada (Québec)', langue: 'fr', villes: ['Montréal, QC', 'Québec, QC', 'Laval, QC', 'Gatineau, QC', 'Sherbrooke, QC', 'Trois-Rivières, QC', 'Saguenay, QC'], suffixe: 'Canada' },
  { pays: 'Haïti', langue: 'fr', villes: ['Port-au-Prince', 'Cap-Haïtien', 'Jacmel'] },
  { pays: 'Nouvelle-Calédonie', langue: 'fr', villes: ['Nouméa'] },
  { pays: 'Polynésie française', langue: 'fr', villes: ['Papeete'] },
  { pays: 'RD Congo', langue: 'fr', villes: ['Kinshasa', 'Lubumbashi', 'Goma'] },
  { pays: 'Congo', langue: 'fr', villes: ['Brazzaville', 'Pointe-Noire'] },
  { pays: 'Gabon', langue: 'fr', villes: ['Libreville', 'Port-Gentil'] },
  { pays: 'Cameroun', langue: 'fr', villes: ['Douala', 'Yaoundé'] },
  { pays: 'Côte d\'Ivoire', langue: 'fr', villes: ['Abidjan', 'Bouaké', 'Yamoussoukro'] },
  { pays: 'Sénégal', langue: 'fr', villes: ['Dakar', 'Thiès', 'Saint-Louis'] },
  { pays: 'Mali', langue: 'fr', villes: ['Bamako'] },
  { pays: 'Burkina Faso', langue: 'fr', villes: ['Ouagadougou', 'Bobo-Dioulasso'] },
  { pays: 'Niger', langue: 'fr', villes: ['Niamey'] },
  { pays: 'Togo', langue: 'fr', villes: ['Lomé'] },
  { pays: 'Bénin', langue: 'fr', villes: ['Cotonou', 'Porto-Novo'] },
  { pays: 'Guinée', langue: 'fr', villes: ['Conakry'] },
  { pays: 'Tchad', langue: 'fr', villes: ['N\'Djamena'] },
  { pays: 'Centrafrique', langue: 'fr', villes: ['Bangui'] },
  { pays: 'Madagascar', langue: 'fr', villes: ['Antananarivo', 'Toamasina'] },
  { pays: 'Djibouti', langue: 'fr', villes: ['Djibouti'] },
  { pays: 'Burundi', langue: 'fr', villes: ['Bujumbura'] },
  { pays: 'Rwanda', langue: 'fr', villes: ['Kigali'] },
  { pays: 'Comores', langue: 'fr', villes: ['Moroni'] },
  { pays: 'Maurice', langue: 'fr', villes: ['Port-Louis'] },
  // --- anglais ---
  { pays: 'États-Unis', langue: 'en', villes: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'Austin, TX', 'Jacksonville, FL', 'Columbus, OH', 'Charlotte, NC', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA', 'Nashville, TN', 'Portland, OR', 'Las Vegas, NV', 'Miami, FL', 'Atlanta, GA', 'Tampa, FL', 'Raleigh, NC', 'Minneapolis, MN', 'Pittsburgh, PA', 'Cleveland, OH', 'Salt Lake City, UT', 'Kansas City, MO', 'Sacramento, CA', 'Orlando, FL'], suffixe: 'USA' },
  { pays: 'Royaume-Uni', langue: 'en', villes: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Bristol', 'Sheffield', 'Edinburgh', 'Cardiff', 'Belfast', 'Nottingham', 'Leicester', 'Newcastle upon Tyne', 'Brighton', 'Southampton', 'Aberdeen', 'Swansea', 'Cambridge', 'Oxford'], suffixe: 'UK' },
  { pays: 'Irlande', langue: 'en', villes: ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford'], suffixe: 'Ireland' },
  { pays: 'Canada (hors Québec)', langue: 'en', villes: ['Toronto, ON', 'Vancouver, BC', 'Calgary, AB', 'Ottawa, ON', 'Edmonton, AB', 'Winnipeg, MB', 'Halifax, NS', 'Victoria, BC', 'Hamilton, ON', 'London, ON'], suffixe: 'Canada' },
  { pays: 'Australie', langue: 'en', villes: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Gold Coast', 'Hobart'], suffixe: 'Australia' },
  { pays: 'Nouvelle-Zélande', langue: 'en', villes: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Dunedin', 'Tauranga'], suffixe: 'New Zealand' },
  { pays: 'Afrique du Sud', langue: 'en', villes: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Bloemfontein'], suffixe: 'South Africa' },
  { pays: 'Inde', langue: 'en', villes: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi'], suffixe: 'India' },
  { pays: 'Pakistan', langue: 'en', villes: ['Karachi', 'Lahore', 'Islamabad'], suffixe: 'Pakistan' },
  { pays: 'Nigeria', langue: 'en', villes: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'], suffixe: 'Nigeria' },
  { pays: 'Ghana', langue: 'en', villes: ['Accra', 'Kumasi'], suffixe: 'Ghana' },
  { pays: 'Kenya', langue: 'en', villes: ['Nairobi', 'Mombasa'], suffixe: 'Kenya' },
  { pays: 'Ouganda', langue: 'en', villes: ['Kampala'], suffixe: 'Uganda' },
  { pays: 'Tanzanie', langue: 'en', villes: ['Dar es Salaam', 'Arusha'], suffixe: 'Tanzania' },
  { pays: 'Zambie', langue: 'en', villes: ['Lusaka'], suffixe: 'Zambia' },
  { pays: 'Zimbabwe', langue: 'en', villes: ['Harare', 'Bulawayo'], suffixe: 'Zimbabwe' },
  { pays: 'Botswana', langue: 'en', villes: ['Gaborone'], suffixe: 'Botswana' },
  { pays: 'Namibie', langue: 'en', villes: ['Windhoek'], suffixe: 'Namibia' },
  { pays: 'Malawi', langue: 'en', villes: ['Lilongwe'], suffixe: 'Malawi' },
  { pays: 'Libéria', langue: 'en', villes: ['Monrovia'], suffixe: 'Liberia' },
  { pays: 'Sierra Leone', langue: 'en', villes: ['Freetown'], suffixe: 'Sierra Leone' },
  { pays: 'Gambie', langue: 'en', villes: ['Banjul'], suffixe: 'Gambia' },
  { pays: 'Singapour', langue: 'en', villes: ['Singapore'], suffixe: '' },
  { pays: 'Philippines', langue: 'en', villes: ['Manila', 'Cebu City', 'Davao City'], suffixe: 'Philippines' },
  { pays: 'Hong Kong', langue: 'en', villes: ['Hong Kong'], suffixe: '' },
  { pays: 'Malte', langue: 'en', villes: ['Valletta', 'Sliema'], suffixe: 'Malta' },
  { pays: 'Jamaïque', langue: 'en', villes: ['Kingston', 'Montego Bay'], suffixe: 'Jamaica' },
  { pays: 'Bahamas', langue: 'en', villes: ['Nassau'], suffixe: 'Bahamas' },
  { pays: 'Barbade', langue: 'en', villes: ['Bridgetown'], suffixe: 'Barbados' },
  { pays: 'Trinité-et-Tobago', langue: 'en', villes: ['Port of Spain'], suffixe: 'Trinidad and Tobago' },
  { pays: 'Belize', langue: 'en', villes: ['Belize City'], suffixe: 'Belize' },
  { pays: 'Guyana', langue: 'en', villes: ['Georgetown'], suffixe: 'Guyana' },
  { pays: 'Fidji', langue: 'en', villes: ['Suva'], suffixe: 'Fiji' },
]

// Pays sans suffixe précisé : le nom français suffit pour la recherche Google (« Lyon, France », « Bamako, Mali »).
const texteLieu = (p, ville) => {
  const fin = p.suffixe === undefined ? p.pays : p.suffixe
  return fin ? `${ville}, ${fin}` : ville
}

// Métier en anglais pour les lieux anglophones : Google comprend « Coiffeur » à Austin, mais « Hair salon » donne de meilleures fiches.
export const METIER_EN = {
  'Restaurant': 'Restaurant', 'Bar': 'Bar', 'Café': 'Cafe', 'Boulangerie': 'Bakery', 'Pâtisserie': 'Pastry shop', 'Traiteur': 'Caterer', 'Boucherie': 'Butcher',
  'Hôtel': 'Hotel', 'Gîte': 'Holiday cottage', 'Chambre d\'hôtes': 'Bed and breakfast',
  'Coiffeur': 'Hair salon', 'Salon de beauté': 'Beauty salon', 'Institut de beauté': 'Beauty salon', 'Barbier': 'Barber shop', 'Onglerie': 'Nail salon', 'Spa': 'Spa',
  'Garage automobile': 'Car repair garage', 'Auto-école': 'Driving school', 'Concessionnaire automobile': 'Car dealership', 'Contrôle technique': 'Vehicle inspection',
  'Plombier': 'Plumber', 'Électricien': 'Electrician', 'Menuisier': 'Carpenter', 'Peintre en bâtiment': 'House painter', 'Serrurier': 'Locksmith', 'Maçon': 'Bricklayer', 'Couvreur': 'Roofer', 'Chauffagiste': 'Heating engineer',
  'Pharmacie': 'Pharmacy', 'Dentiste': 'Dentist', 'Médecin généraliste': 'General practitioner', 'Kinésithérapeute': 'Physiotherapist', 'Ostéopathe': 'Osteopath', 'Vétérinaire': 'Veterinarian', 'Opticien': 'Optician',
  'Avocat': 'Law firm', 'Notaire': 'Notary', 'Agence immobilière': 'Real estate agency', 'Assurance': 'Insurance agency', 'Banque': 'Bank', 'Comptable': 'Accountant',
  'Fleuriste': 'Florist', 'Bijouterie': 'Jewellery shop', 'Magasin de vêtements': 'Clothing store', 'Cordonnier': 'Shoe repair', 'Pressing': 'Dry cleaner', 'Photographe': 'Photographer',
  'Salle de sport': 'Gym', 'Déménageur': 'Moving company', 'Épicerie': 'Grocery store', 'Supermarché': 'Supermarket',
}

export const metierPourLieu = (metier, langue) => (langue === 'en' && METIER_EN[metier]) || metier

export const FILTRES = [['tous', 'Tous les pays'], ['fr', 'Pays francophones'], ['en', 'Pays anglophones']]

// Tous les lieux possibles : { ville: 'Austin, TX, USA', pays, langue }.
export function tousLesLieux(filtre = 'tous') {
  return PAYS
    .filter(p => filtre === 'tous' || p.langue === filtre)
    .flatMap(p => p.villes.map(v => ({ ville: texteLieu(p, v), pays: p.pays, langue: p.langue })))
}

export const cleDejaFait = (metier, ville) => `${String(metier).trim().toLowerCase()}|${String(ville).trim().toLowerCase()}`

// Tire `n` lieux au hasard, tous différents, jamais ceux déjà cherchés avec ce métier (`dejaFaits` = ensemble de
// cleDejaFait). Un pays par tirage tant qu'il reste des pays disponibles : on voyage au lieu de tomber 5 fois aux États-Unis.
// Le pays est choisi au hasard (pas selon son nombre de villes), puis la ville dans ce pays.
export function tirerLieux({ n = 5, filtre = 'tous', metier = '', dejaFaits = new Set(), hasard = Math.random } = {}) {
  const parPays = PAYS
    .filter(p => filtre === 'tous' || p.langue === filtre)
    .map(p => ({ p, libres: p.villes.map(v => texteLieu(p, v)).filter(v => !dejaFaits.has(cleDejaFait(metierPourLieu(metier, p.langue), v)) && !dejaFaits.has(cleDejaFait(metier, v))) }))
    .filter(x => x.libres.length)
  const choisis = []
  const pris = new Set()
  const piocher = (liste) => liste[Math.min(liste.length - 1, Math.floor(hasard() * liste.length))]
  // 1er tour : pays tous différents ; si on veut plus de lieux que de pays, on recommence avec ce qui reste.
  while (choisis.length < n) {
    const candidats = parPays.filter(x => x.libres.some(v => !pris.has(v)))
    if (!candidats.length) break
    let tour = candidats.slice()
    while (tour.length && choisis.length < n) {
      const i = Math.min(tour.length - 1, Math.floor(hasard() * tour.length))
      const { p, libres } = tour.splice(i, 1)[0]
      const dispo = libres.filter(v => !pris.has(v))
      if (!dispo.length) continue
      const ville = piocher(dispo)
      pris.add(ville)
      choisis.push({ ville, pays: p.pays, langue: p.langue })
    }
  }
  return choisis
}
