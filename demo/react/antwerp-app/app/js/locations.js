/**
 * Antwerp locations data + utility functions
 */

export const LOCATIONS = [
  { id: 1, name: 'The Jane', type: 'restaurant', category: 'restaurant', emoji: '⭐', address: 'Paradeplein 1', lat: 51.2089, lng: 4.3959, tags: ['Fine Dining', 'Iconic', 'Belgian'], neighborhood: 'Berchem', rating: '9.2', gmaps: 'https://maps.google.com/?q=The+Jane+Antwerp' },
  { id: 2, name: 'Grand Central', type: 'restaurant', category: 'restaurant', emoji: '🚂', address: 'Koningin Astridplein 27', lat: 51.2170, lng: 4.4214, tags: ['Brasserie', 'Historic', 'Cocktails'], neighborhood: 'Centre', rating: '8.4', gmaps: 'https://maps.google.com/?q=Grand+Central+Antwerp' },
  { id: 3, name: 'Dries Van Noten', type: 'fashion', category: 'fashion', emoji: '👗', address: 'Nationalestraat 16', lat: 51.2153, lng: 4.3996, tags: ['Luxury', 'Belgian Designer', 'Avant-garde'], neighborhood: 'Fashion Quarter', rating: '9.5', gmaps: 'https://maps.google.com/?q=Dries+Van+Noten+Antwerp' },
  { id: 4, name: "Café d'Anvers", type: 'bar', category: 'bar', emoji: '🎵', address: 'Verversrui 15', lat: 51.2282, lng: 4.4013, tags: ['Nightlife', 'Historic', 'Electronic'], neighborhood: 'Schipperskwartier', rating: '8.8', gmaps: "https://maps.google.com/?q=Cafe+d+Anvers+Antwerp" },
  { id: 5, name: 'Graanmarkt 13', type: 'restaurant', category: 'restaurant', emoji: '🌿', address: 'Graanmarkt 13', lat: 51.2183, lng: 4.3978, tags: ['Vegetable-forward', 'Design', 'Trendy'], neighborhood: 'Centre', rating: '8.9', gmaps: 'https://maps.google.com/?q=Graanmarkt+13+Antwerp' },
  { id: 6, name: 'Ann Demeulemeester', type: 'fashion', category: 'fashion', emoji: '🖤', address: 'Verlatstraat 38', lat: 51.2100, lng: 4.3948, tags: ['Dark', 'Belgian Designer', 'Iconic'], neighborhood: 'Zuid', rating: '9.1', gmaps: 'https://maps.google.com/?q=Ann+Demeulemeester+Antwerp' },
  { id: 7, name: 'Bouchery', type: 'restaurant', category: 'restaurant', emoji: '🥩', address: 'Dambruggestraat 23', lat: 51.2145, lng: 4.4200, tags: ['Sustainable', 'Farm-to-Table', 'Creative'], neighborhood: 'Borgerhout', rating: '8.6', gmaps: 'https://maps.google.com/?q=Bouchery+Antwerp' },
  { id: 8, name: 'Normo Espresso', type: 'cafe', category: 'cafe', emoji: '☕', address: 'Kammenstraat 13', lat: 51.2181, lng: 4.4026, tags: ['Specialty Coffee', 'Minimal', 'Third Wave'], neighborhood: 'Centre', rating: '8.3', gmaps: 'https://maps.google.com/?q=Normo+Espresso+Antwerp' },
  { id: 9, name: 'Essentiel Antwerp', type: 'fashion', category: 'fashion', emoji: '✨', address: 'Nationalestraat 12', lat: 51.2155, lng: 4.3993, tags: ['Colourful', 'Belgian', 'Contemporary'], neighborhood: 'Fashion Quarter', rating: '8.7', gmaps: 'https://maps.google.com/?q=Essentiel+Antwerp' },
  { id: 10, name: 'Bar Paniek', type: 'bar', category: 'bar', emoji: '🍺', address: 'Oudevaartplaats 12', lat: 51.2220, lng: 4.4052, tags: ['Craft Beer', 'Belgian', 'Cozy'], neighborhood: 'Centre', rating: '8.5', gmaps: 'https://maps.google.com/?q=Bar+Paniek+Antwerp' },
  { id: 11, name: 'Fiskebar', type: 'restaurant', category: 'restaurant', emoji: '🐟', address: 'Marnixplaats 17', lat: 51.2197, lng: 4.3962, tags: ['Seafood', 'Nordic', 'Sustainable'], neighborhood: 'Centre', rating: '8.8', gmaps: 'https://maps.google.com/?q=Fiskebar+Antwerp' },
  { id: 12, name: 'Louis Vuitton MAS', type: 'fashion', category: 'fashion', emoji: '👜', address: 'Meir 34', lat: 51.2194, lng: 4.4081, tags: ['Luxury', 'Flagship', 'Iconic'], neighborhood: 'Meir', rating: '8.0', gmaps: 'https://maps.google.com/?q=Louis+Vuitton+Antwerp' },
  { id: 13, name: 'Bocca Negra', type: 'cafe', category: 'cafe', emoji: '🫖', address: 'Falconrui 13', lat: 51.2235, lng: 4.4025, tags: ['Art Nouveau', 'Historic', 'Hot Chocolate'], neighborhood: 'Centre', rating: '8.6', gmaps: 'https://maps.google.com/?q=Bocca+Negra+Antwerp' },
  { id: 14, name: 'Zeppelin', type: 'bar', category: 'bar', emoji: '🎸', address: 'Sint-Pietersvliet 20', lat: 51.2271, lng: 4.4008, tags: ['Rock', 'Local', 'Live Music'], neighborhood: 'Eilandje', rating: '8.2', gmaps: 'https://maps.google.com/?q=Zeppelin+Bar+Antwerp' },
  { id: 15, name: 'Walter Van Beirendonck', type: 'fashion', category: 'fashion', emoji: '🦄', address: 'Sint-Antoniusstraat 12', lat: 51.2147, lng: 4.3980, tags: ['Avant-garde', 'Surreal', 'Iconic'], neighborhood: 'Fashion Quarter', rating: '9.3', gmaps: 'https://maps.google.com/?q=Walter+Van+Beirendonck+Antwerp' },
];

export const HEATMAP_POINTS = [
  [51.2194, 4.4082, .95], [51.2183, 4.405, .9], [51.22, 4.406, .88],
  [51.2175, 4.402, .85], [51.221, 4.403, .82], [51.2153, 4.3996, .78],
  [51.216, 4.401, .75], [51.2145, 4.4, .7], [51.2202, 4.4003, .88],
  [51.2195, 4.399, .85], [51.212, 4.397, .65], [51.21, 4.395, .62],
  [51.2135, 4.3975, .68], [51.2285, 4.4045, .72], [51.2295, 4.403, .68],
  [51.227, 4.4038, .7], [51.2258, 4.4015, .75], [51.227, 4.4, .72],
  [51.2175, 4.4215, .92], [51.2165, 4.42, .88], [51.218, 4.4205, .9],
  [51.214, 4.4175, .55], [51.215, 4.4185, .52], [51.2092, 4.396, .6],
  [51.208, 4.397, .58]
];

const BUSY_LEVELS = ['quiet', 'moderate', 'busy', 'very busy'];

export function getBusy(loc) {
  const seed = (loc.id * 7 + 3) % 4;
  return BUSY_LEVELS[seed];
}

export function getWalkMin(loc) {
  return 5 + ((loc.id * 3 + 1) % 18);
}

export function buildDeck(category) {
  const all = category === 'all' ? [...LOCATIONS] : LOCATIONS.filter(l => l.category === category);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}
