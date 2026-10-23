// Ratissage de prospection : tirage au sort de codes postaux (zones) pour ne plus les saisir à la main.
// Seuls figurent les pays développés dont une langue officielle est le français ou l'anglais (20 choix). Ni l'Afrique,
// ni les pays où l'anglais n'est qu'officiel « de façade » : on cible des marchés comparables à la France. Pour en
// ajouter un, il suffit d'une ligne dans PAYS (id, nom, langue du mail, codes postaux réels de villes de tailles variées).
// Les codes viennent de villes réelles (préfectures, quartiers, villes moyennes) : un code tiré au hasard pourrait ne
// correspondre à aucun commerce (US : 90000 n'existe pas, par exemple). Chaque code est suivi du nom de la localité pour
// que Google trouve le bon endroit même si le code est approximatif.
// `langue` = langue du mail écrit aux commerces du pays (même règle que le serveur : français pour un pays francophone,
// anglais sinon ; Québec = français, reste du Canada = anglais).
// `defaut` = coché au départ. Les petits territoires (Jersey, Bermudes...) sont décochés : très peu de commerces.

export const PAYS = [
  // --- français ---
  { id: 'fr', pays: 'France', langue: 'fr', defaut: true, codes: [
    '01000 Bourg-en-Bresse', '02000 Laon', '03000 Moulins', '04000 Digne-les-Bains', '05000 Gap', '06000 Nice', '06100 Nice', '06400 Cannes', '07000 Privas', '08000 Charleville-Mézières',
    '09000 Foix', '10000 Troyes', '11000 Carcassonne', '12000 Rodez', '13001 Marseille', '13006 Marseille', '13008 Marseille', '13100 Aix-en-Provence', '14000 Caen', '15000 Aurillac',
    '16000 Angoulême', '17000 La Rochelle', '18000 Bourges', '19000 Tulle', '20000 Ajaccio', '20200 Bastia', '21000 Dijon', '22000 Saint-Brieuc', '23000 Guéret', '24000 Périgueux',
    '25000 Besançon', '26000 Valence', '27000 Évreux', '28000 Chartres', '29000 Quimper', '29200 Brest', '30000 Nîmes', '31000 Toulouse', '31400 Toulouse', '32000 Auch',
    '33000 Bordeaux', '33300 Bordeaux', '33800 Bordeaux', '34000 Montpellier', '34500 Béziers', '35000 Rennes', '35400 Saint-Malo', '36000 Châteauroux', '37000 Tours', '38000 Grenoble',
    '39000 Lons-le-Saunier', '40000 Mont-de-Marsan', '41000 Blois', '42000 Saint-Étienne', '43000 Le Puy-en-Velay', '44000 Nantes', '44100 Nantes', '45000 Orléans', '46000 Cahors', '47000 Agen',
    '48000 Mende', '49000 Angers', '50000 Saint-Lô', '51100 Reims', '52000 Chaumont', '53000 Laval', '54000 Nancy', '55000 Bar-le-Duc', '56000 Vannes', '57000 Metz',
    '58000 Nevers', '59000 Lille', '59800 Lille', '59200 Tourcoing', '60000 Beauvais', '61000 Alençon', '62000 Arras', '63000 Clermont-Ferrand', '64000 Pau', '64100 Bayonne',
    '65000 Tarbes', '66000 Perpignan', '67000 Strasbourg', '68000 Colmar', '69001 Lyon', '69003 Lyon', '69006 Lyon', '69007 Lyon', '69100 Villeurbanne', '70000 Vesoul',
    '71000 Mâcon', '72000 Le Mans', '73000 Chambéry', '74000 Annecy', '75001 Paris', '75005 Paris', '75010 Paris', '75011 Paris', '75015 Paris', '75018 Paris',
    '75020 Paris', '76000 Rouen', '76600 Le Havre', '77000 Melun', '78000 Versailles', '79000 Niort', '80000 Amiens', '81000 Albi', '82000 Montauban', '83000 Toulon',
    '84000 Avignon', '85000 La Roche-sur-Yon', '86000 Poitiers', '87000 Limoges', '88000 Épinal', '89000 Auxerre', '90000 Belfort', '91000 Évry-Courcouronnes', '92000 Nanterre', '92100 Boulogne-Billancourt',
    '93100 Montreuil', '94000 Créteil', '95000 Cergy', '97400 Saint-Denis, La Réunion', '97200 Fort-de-France', '97110 Pointe-à-Pitre',
  ] },
  { id: 'be', pays: 'Belgique', langue: 'fr', defaut: true, codes: [
    '1000 Bruxelles', '1040 Etterbeek', '1050 Ixelles', '1060 Saint-Gilles', '1180 Uccle', '1200 Woluwe-Saint-Lambert', '1300 Wavre', '1348 Louvain-la-Neuve', '1400 Nivelles', '4000 Liège',
    '4020 Liège', '4800 Verviers', '5000 Namur', '5100 Jambes', '6000 Charleroi', '6700 Arlon', '7000 Mons', '7100 La Louvière', '7500 Tournai',
  ] },
  { id: 'ch', pays: 'Suisse', langue: 'fr', defaut: true, codes: [
    '1003 Lausanne', '1005 Lausanne', '1020 Renens', '1110 Morges', '1200 Genève', '1201 Genève', '1227 Carouge', '1260 Nyon', '1400 Yverdon-les-Bains', '1700 Fribourg',
    '1800 Vevey', '1820 Montreux', '1920 Martigny', '1950 Sion', '2000 Neuchâtel', '2300 La Chaux-de-Fonds', '2800 Delémont', '3960 Sierre',
  ] },
  { id: 'lu', pays: 'Luxembourg', langue: 'fr', defaut: true, codes: ['1111 Luxembourg', '1611 Luxembourg', '2551 Luxembourg', '4001 Esch-sur-Alzette', '4501 Differdange', '9201 Diekirch'] },
  { id: 'mc', pays: 'Monaco', langue: 'fr', defaut: true, codes: ['98000 Monaco'] },
  { id: 'qc', pays: 'Canada (Québec)', langue: 'fr', defaut: true, suffixe: 'Canada', codes: [
    'H2X Montréal, QC', 'H3B Montréal, QC', 'H3A Montréal, QC', 'H2T Montréal, QC', 'H2J Montréal, QC', 'H2L Montréal, QC', 'H4C Montréal, QC', 'H1V Montréal, QC', 'H3N Montréal, QC', 'H7T Laval, QC',
    'G1R Québec, QC', 'G1K Québec, QC', 'G1V Québec, QC', 'G1S Québec, QC', 'J8Y Gatineau, QC', 'J8X Gatineau, QC', 'J9H Gatineau, QC', 'J1H Sherbrooke, QC', 'J1G Sherbrooke, QC', 'G9A Trois-Rivières, QC',
    'G7H Saguenay, QC', 'J4H Longueuil, QC', 'J4K Longueuil, QC', 'G6V Lévis, QC', 'J2B Drummondville, QC', 'J2G Granby, QC', 'J7Z Saint-Jérôme, QC',
  ] },
  { id: 'nc', pays: 'Nouvelle-Calédonie', langue: 'fr', defaut: false, codes: ['98800 Nouméa', '98835 Dumbéa', '98890 Païta', '98809 Mont-Dore', '98860 Koné'] },
  { id: 'pf', pays: 'Polynésie française', langue: 'fr', defaut: false, codes: ['98714 Papeete', '98716 Pirae', '98704 Faa\'a', '98718 Punaauia', '98730 Bora-Bora'] },
  // --- anglais ---
  { id: 'us', pays: 'États-Unis', langue: 'en', defaut: true, suffixe: 'USA', codes: [
    '10001 New York, NY', '10011 New York, NY', '11201 Brooklyn, NY', '90012 Los Angeles, CA', '90210 Beverly Hills, CA', '94103 San Francisco, CA', '94105 San Francisco, CA', '92101 San Diego, CA', '95814 Sacramento, CA', '60601 Chicago, IL',
    '60614 Chicago, IL', '77002 Houston, TX', '78205 San Antonio, TX', '75201 Dallas, TX', '78701 Austin, TX', '85004 Phoenix, AZ', '85701 Tucson, AZ', '19103 Philadelphia, PA', '15222 Pittsburgh, PA', '32202 Jacksonville, FL',
    '33131 Miami, FL', '33602 Tampa, FL', '32801 Orlando, FL', '43215 Columbus, OH', '44113 Cleveland, OH', '28202 Charlotte, NC', '27601 Raleigh, NC', '46204 Indianapolis, IN', '98101 Seattle, WA', '97201 Portland, OR',
    '80202 Denver, CO', '02108 Boston, MA', '37203 Nashville, TN', '38103 Memphis, TN', '89101 Las Vegas, NV', '30303 Atlanta, GA', '55401 Minneapolis, MN', '84101 Salt Lake City, UT', '64105 Kansas City, MO', '63101 St. Louis, MO',
    '20001 Washington, DC', '21201 Baltimore, MD', '48226 Detroit, MI', '53202 Milwaukee, WI', '70112 New Orleans, LA', '96813 Honolulu, HI', '73102 Oklahoma City, OK', '87102 Albuquerque, NM', '40202 Louisville, KY', '23219 Richmond, VA',
  ] },
  { id: 'gb', pays: 'Royaume-Uni', langue: 'en', defaut: true, suffixe: 'UK', codes: [
    'E1 London', 'N1 London', 'SE1 London', 'SW9 London', 'W1D London', 'WC2 London', 'NW3 London', 'E8 London', 'M1 Manchester', 'M14 Manchester',
    'B1 Birmingham', 'B15 Birmingham', 'LS1 Leeds', 'G1 Glasgow', 'G12 Glasgow', 'L1 Liverpool', 'BS1 Bristol', 'S1 Sheffield', 'EH1 Edinburgh', 'EH3 Edinburgh',
    'CF10 Cardiff', 'BT1 Belfast', 'NG1 Nottingham', 'LE1 Leicester', 'NE1 Newcastle upon Tyne', 'BN1 Brighton', 'SO14 Southampton', 'AB10 Aberdeen', 'SA1 Swansea', 'CB1 Cambridge',
    'OX1 Oxford', 'CV1 Coventry', 'PL1 Plymouth', 'EX1 Exeter', 'YO1 York', 'BA1 Bath', 'NR1 Norwich', 'IP1 Ipswich', 'RG1 Reading', 'MK9 Milton Keynes',
    'DE1 Derby', 'HU1 Hull', 'PR1 Preston', 'CH1 Chester', 'CT1 Canterbury', 'DH1 Durham', 'LN1 Lincoln', 'PE1 Peterborough', 'WR1 Worcester', 'GL1 Gloucester',
    'SN1 Swindon', 'PO1 Portsmouth', 'BH1 Bournemouth', 'DD1 Dundee', 'IV1 Inverness', 'BD1 Bradford', 'SK1 Stockport', 'ST1 Stoke-on-Trent', 'SR1 Sunderland', 'TS1 Middlesbrough',
  ] },
  { id: 'ie', pays: 'Irlande', langue: 'en', defaut: true, suffixe: 'Ireland', codes: [
    'D01 Dublin', 'D02 Dublin', 'D04 Dublin', 'D06 Dublin', 'D07 Dublin', 'D08 Dublin', 'D09 Dublin', 'D12 Dublin', 'D15 Dublin', 'D18 Dublin',
    'T12 Cork', 'T23 Cork', 'H91 Galway', 'V94 Limerick', 'X91 Waterford', 'A91 Dundalk', 'A92 Drogheda', 'F91 Sligo', 'V95 Ennis', 'N37 Athlone',
  ] },
  { id: 'ca', pays: 'Canada (hors Québec)', langue: 'en', defaut: true, suffixe: 'Canada', codes: [
    'M5V Toronto, ON', 'M5H Toronto, ON', 'M4C Toronto, ON', 'M6K Toronto, ON', 'M2N Toronto, ON', 'L5B Mississauga, ON', 'K1P Ottawa, ON', 'K1N Ottawa, ON', 'K2P Ottawa, ON', 'L8P Hamilton, ON',
    'N6A London, ON', 'N2G Kitchener, ON', 'N9A Windsor, ON', 'V6B Vancouver, BC', 'V5K Vancouver, BC', 'V6Z Vancouver, BC', 'V6H Vancouver, BC', 'V8W Victoria, BC', 'T2P Calgary, AB', 'T2R Calgary, AB',
    'T3A Calgary, AB', 'T5J Edmonton, AB', 'T6E Edmonton, AB', 'R3C Winnipeg, MB', 'R3B Winnipeg, MB', 'S4P Regina, SK', 'S7K Saskatoon, SK', 'B3J Halifax, NS', 'A1C St. John\'s, NL',
  ] },
  { id: 'au', pays: 'Australie', langue: 'en', defaut: true, suffixe: 'Australia', codes: [
    '2000 Sydney NSW', '2010 Surry Hills NSW', '2026 Bondi NSW', '2060 North Sydney NSW', '2150 Parramatta NSW', '2250 Gosford NSW', '2300 Newcastle NSW', '2500 Wollongong NSW', '2650 Wagga Wagga NSW', '2830 Dubbo NSW',
    '3000 Melbourne VIC', '3141 South Yarra VIC', '3182 St Kilda VIC', '3121 Richmond VIC', '3053 Carlton VIC', '3220 Geelong VIC', '3350 Ballarat VIC', '3550 Bendigo VIC', '4000 Brisbane QLD', '4101 South Brisbane QLD',
    '4217 Surfers Paradise QLD', '4350 Toowoomba QLD', '4551 Caloundra QLD', '4700 Rockhampton QLD', '4740 Mackay QLD', '4810 Townsville QLD', '4870 Cairns QLD', '5000 Adelaide SA', '5290 Mount Gambier SA', '6000 Perth WA',
    '6160 Fremantle WA', '6230 Bunbury WA', '6330 Albany WA', '2600 Canberra ACT', '7000 Hobart TAS', '7250 Launceston TAS', '0800 Darwin NT',
  ] },
  { id: 'nz', pays: 'Nouvelle-Zélande', langue: 'en', defaut: true, suffixe: 'New Zealand', codes: [
    '1010 Auckland', '1011 Auckland', '1024 Auckland', '0622 Takapuna', '2104 Manukau', '0930 Orewa', '6011 Wellington', '6021 Wellington', '8011 Christchurch', '3204 Hamilton',
    '9016 Dunedin', '3110 Tauranga', '4110 Napier', '4122 Hastings', '4410 Palmerston North', '7010 Nelson', '9300 Queenstown', '0110 Whangarei', '3010 Rotorua', '4310 New Plymouth', '9810 Invercargill',
  ] },
  { id: 'sg', pays: 'Singapour', langue: 'en', defaut: true, suffixe: '', codes: [
    'Singapore 018956', 'Singapore 238859', 'Singapore 059413', 'Singapore 098585', 'Singapore 119077', 'Singapore 188065', 'Singapore 238801', 'Singapore 307591', 'Singapore 529510', 'Singapore 640638', 'Singapore 768019', 'Singapore 819666',
  ] },
  { id: 'mt', pays: 'Malte', langue: 'en', defaut: true, suffixe: 'Malta', codes: [
    'VLT 1117 Valletta', 'SLM 1000 Sliema', 'STJ 1000 St Julian\'s', 'BKR 1000 Birkirkara', 'MST 1000 Mosta', 'MLH 1000 Mellieħa', 'VCT 1000 Victoria, Gozo', 'MSD 1000 Msida', 'PLA 1000 Paola', 'QRM 1000 Qormi',
  ] },
  { id: 'je', pays: 'Jersey', langue: 'en', defaut: false, suffixe: 'Jersey', codes: ['JE2 St Helier', 'JE1 St Helier', 'JE3 St Brelade', 'JE4 St Saviour'] },
  { id: 'gg', pays: 'Guernesey', langue: 'en', defaut: false, suffixe: 'Guernsey', codes: ['GY1 St Peter Port', 'GY2 St Sampson', 'GY3 Castel', 'GY5 Vale'] },
  { id: 'im', pays: 'Île de Man', langue: 'en', defaut: false, suffixe: 'Isle of Man', codes: ['IM1 Douglas', 'IM2 Douglas', 'IM4 Onchan', 'IM7 Ramsey', 'IM9 Castletown'] },
  { id: 'bm', pays: 'Bermudes', langue: 'en', defaut: false, suffixe: 'Bermuda', codes: ['HM 11 Hamilton', 'HM 12 Hamilton', 'HM 08 Pembroke', 'GE 01 St. George\'s', 'WK 01 Warwick'] },
]

// Pays sans suffixe précisé : le nom français suffit pour la recherche Google (« Lyon, France », « Bamako, Mali »).
const texteLieu = (p, ville) => {
  const fin = p.suffixe === undefined ? p.pays : p.suffixe
  return fin ? `${ville}, ${fin}` : ville
}

// Tous les lieux possibles : { ville: '69003 Lyon, France', pays, id, langue }.
const lieuxDe = (p) => p.codes.map(c => ({ ville: texteLieu(p, c), pays: p.pays, id: p.id, langue: p.langue }))
export const tousLesLieux = (ids = null) => PAYS.filter(p => !ids || ids.includes(p.id)).flatMap(lieuxDe)
export const paysParDefaut = () => PAYS.filter(p => p.defaut).map(p => p.id)

export const cleDejaFait = (metier, ville) => `${String(metier).trim().toLowerCase()}|${String(ville).trim().toLowerCase()}`

// Tire `n` codes postaux au hasard dans les pays choisis (`ids`), tous différents. Un code déjà cherché avec TOUS les
// métiers donnés ne revient pas (`dejaFaits` = ensemble de cleDejaFait) ; s'il reste un métier qu'on n'y a pas encore
// cherché, il reste tirable. Un pays par tirage tant qu'il reste des pays disponibles : on voyage
// au lieu de tomber 5 fois aux États-Unis. Le pays est choisi au hasard (pas selon son nombre de codes), puis le code.
export function tirerLieux({ n = 5, ids = null, metiers = [''], dejaFaits = new Set(), hasard = Math.random } = {}) {
  const liste = metiers.length ? metiers : ['']
  const parPays = PAYS
    .filter(p => !ids || ids.includes(p.id))
    .map(p => ({ p, libres: lieuxDe(p).filter(l => liste.some(m => !dejaFaits.has(cleDejaFait(m, l.ville)))) }))
    .filter(x => x.libres.length)
  const choisis = []
  const pris = new Set()
  const rang = (taille) => Math.min(taille - 1, Math.floor(hasard() * taille))
  while (choisis.length < n) {
    let tour = parPays.filter(x => x.libres.some(l => !pris.has(l.ville)))
    if (!tour.length) break
    while (tour.length && choisis.length < n) {
      const { libres } = tour.splice(rang(tour.length), 1)[0]
      const dispo = libres.filter(l => !pris.has(l.ville))
      const lieu = dispo[rang(dispo.length)]
      pris.add(lieu.ville)
      choisis.push(lieu)
    }
  }
  return choisis
}
