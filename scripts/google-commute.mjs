#!/usr/bin/env node
// Fetch real commute times via Google Maps Directions API
// Cost: ~$5/1000 requests (Directions) + ~$5/1000 (Geocoding)
// Budget cap: $10

import { readFileSync, writeFileSync } from 'fs';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const COST_PER_DIRECTION = 0.005;  // $5/1000
const COST_PER_GEOCODE = 0.005;    // $5/1000
const BUDGET_CAP = 10.0;
let totalCost = 0;

// Next Tuesday 8:30 AM ET arrival
const ARRIVAL_TIME = 1772544600;

// Hub coordinates (actual locations people commute TO)
const HUBS = {
  timesSquare:     { lat: 40.7580, lng: -73.9855, label: 'Times Square' },
  grandCentral:    { lat: 40.7527, lng: -73.9772, label: 'Grand Central' },
  midtownEast:     { lat: 40.7549, lng: -73.9724, label: 'Midtown East' },
  penn:            { lat: 40.7506, lng: -73.9935, label: 'Penn Station' },
  hudsonYards:     { lat: 40.7537, lng: -74.0008, label: 'Hudson Yards' },
  fidi:            { lat: 40.7074, lng: -74.0113, label: 'Financial District' },
  unionSquare:     { lat: 40.7359, lng: -73.9911, label: 'Union Square' },
  barclays:        { lat: 40.6826, lng: -73.9754, label: 'Downtown Brooklyn' },
  nyu:             { lat: 40.7295, lng: -73.9965, label: 'NYU' },
  columbiaCampus:  { lat: 40.8075, lng: -73.9626, label: 'Columbia' },
};

// Load current commute data to get neighborhood list
const currentData = JSON.parse(readFileSync('src/data/commute-data.json', 'utf8'));
const neighborhoods = Object.keys(currentData);

console.log(`Neighborhoods: ${neighborhoods.length}`);
console.log(`Hubs: ${Object.keys(HUBS).length}`);
console.log(`Max API calls: ${neighborhoods.length} geocodes + ${neighborhoods.length * Object.keys(HUBS).length} directions`);
console.log(`Max cost: ~$${((neighborhoods.length * COST_PER_GEOCODE) + (neighborhoods.length * Object.keys(HUBS).length * COST_PER_DIRECTION)).toFixed(2)}`);
console.log(`Budget cap: $${BUDGET_CAP}\n`);

// Borough/area hints for better geocoding
const BOROUGH_HINTS = {};
for (const [name, data] of Object.entries(currentData)) {
  // Detect NJ neighborhoods
  const njNames = ['Bayonne','Cliffside Park','Edgewater','Fort Lee','Guttenberg','Harrison','Hoboken',
    'Jersey City','Journal Square','Kearny','McGinley Square','North Bergen','Paulus Hook','Union City',
    'Weehawken','West New York','Bergen/Lafayette','Waterfront','Historic Downtown'];
  if (njNames.includes(name)) {
    BOROUGH_HINTS[name] = 'NJ';
  }
}

// Special geocoding overrides for ambiguous names
const GEOCODE_OVERRIDES = {
  'Bergen/Lafayette': 'Bergen-Lafayette, Jersey City, NJ',
  'Waterfront': 'Waterfront, Jersey City, NJ',
  'Historic Downtown': 'Historic Downtown, Jersey City, NJ',
  'McGinley Square': 'McGinley Square, Jersey City, NJ',
  'Paulus Hook': 'Paulus Hook, Jersey City, NJ',
  'North New York': 'North New York, Queens, NY',
  'Weeksville': 'Weeksville, Brooklyn, NY',
  'Downtown Brooklyn': 'Downtown Brooklyn, NY',
  'Fort George': 'Fort George, Manhattan, NY',
  'Hudson Heights': 'Hudson Heights, Manhattan, NY',
  'Stuyvesant Heights': 'Stuyvesant Heights, Brooklyn, NY',
  'South Harlem': 'South Harlem, Manhattan, NY',
  'Central Harlem': 'Central Harlem, Manhattan, NY',
  'East Harlem': 'East Harlem, Manhattan, NY',
  'Lincoln Square': 'Lincoln Square, Manhattan, NY',
  'Lenox Hill': 'Lenox Hill, Manhattan, NY',
  'Turtle Bay': 'Turtle Bay, Manhattan, NY',
  'Sutton Place': 'Sutton Place, Manhattan, NY',
  'Midtown South': 'Midtown South, Manhattan, NY',
  'Midtown East': 'Midtown East, Manhattan, NY',
  'Midtown': 'Midtown, Manhattan, NY',
  'Murray Hill': 'Murray Hill, Manhattan, NY',  // Not JC Murray Hill
  'Hunters Point': 'Hunters Point, Long Island City, Queens, NY',
  'Greenwood': 'Greenwood Heights, Brooklyn, NY',
  'Prospect Lefferts Gardens': 'Prospect Lefferts Gardens, Brooklyn, NY',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function geocode(name) {
  const query = GEOCODE_OVERRIDES[name] || 
    `${name}, ${BOROUGH_HINTS[name] === 'NJ' ? 'NJ' : 'New York, NY'}`;
  
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${API_KEY}`;
  const resp = await fetch(url);
  const data = await resp.json();
  totalCost += COST_PER_GEOCODE;
  
  if (data.status === 'OK' && data.results.length > 0) {
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address };
  }
  return null;
}

async function getCommuteTime(origin, dest) {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&mode=transit&arrival_time=${ARRIVAL_TIME}&key=${API_KEY}`;
  const resp = await fetch(url);
  const data = await resp.json();
  totalCost += COST_PER_DIRECTION;
  
  if (data.status === 'OK' && data.routes.length > 0) {
    const duration = data.routes[0].legs[0].duration.value;
    return Math.round(duration / 60);
  }
  return null;
}

async function main() {
  const results = {};
  const geocoded = {};
  let processed = 0;
  
  // Step 1: Geocode all neighborhoods
  console.log('=== GEOCODING ===');
  for (const name of neighborhoods) {
    if (totalCost >= BUDGET_CAP) {
      console.error(`\n🚨 BUDGET CAP REACHED ($${totalCost.toFixed(2)}). STOPPING.`);
      process.exit(1);
    }
    
    const loc = await geocode(name);
    if (loc) {
      geocoded[name] = loc;
      console.log(`  ✓ ${name} → ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)} (${loc.formatted})`);
    } else {
      console.log(`  ✗ ${name} — FAILED`);
    }
    await sleep(50); // Rate limit
  }
  
  console.log(`\nGeocoded: ${Object.keys(geocoded).length}/${neighborhoods.length}`);
  console.log(`Cost so far: $${totalCost.toFixed(2)}\n`);
  
  // Save geocoded coords for reference
  writeFileSync('src/data/neighborhood-coords.json', JSON.stringify(geocoded, null, 2));
  
  // Step 2: Get commute times
  console.log('=== COMMUTE TIMES ===');
  const hubKeys = Object.keys(HUBS);
  const totalQueries = Object.keys(geocoded).length * hubKeys.length;
  let queryCount = 0;
  
  for (const name of Object.keys(geocoded)) {
    if (totalCost >= BUDGET_CAP) {
      console.error(`\n🚨 BUDGET CAP REACHED ($${totalCost.toFixed(2)}). STOPPING.`);
      // Save partial results
      writeFileSync('src/data/commute-data-google.json', JSON.stringify(results, null, 2));
      console.log('Partial results saved to commute-data-google.json');
      process.exit(1);
    }
    
    results[name] = {};
    const times = [];
    
    for (const hubKey of hubKeys) {
      const hub = HUBS[hubKey];
      const minutes = await getCommuteTime(geocoded[name], hub);
      results[name][hubKey] = minutes;
      times.push(`${hubKey.slice(0,4)}=${minutes || '?'}`);
      queryCount++;
      await sleep(50);
    }
    
    processed++;
    console.log(`  [${processed}/${Object.keys(geocoded).length}] ${name}: ${times.join(', ')}  ($${totalCost.toFixed(2)})`);
  }
  
  // Save results
  writeFileSync('src/data/commute-data-google.json', JSON.stringify(results, null, 2));
  console.log(`\n✅ Done! Total cost: $${totalCost.toFixed(2)}`);
  console.log(`Results saved to src/data/commute-data-google.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
