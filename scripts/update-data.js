import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Database connection
const pool = new Pool({
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  user: 'readonly_agent.tdrshcdwetrbivhjikup',
  password: 'process.env.SUPABASE_PASSWORD',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

// Subway line colors for rendering train icons
const SUBWAY_LINE_COLORS = {
  "1": "D82233", "2": "D82233", "3": "D82233",
  "4": "009952", "5": "009952", "6": "009952",
  "7": "9A38A1",
  "A": "0062CF", "C": "0062CF", "E": "0062CF",
  "B": "EB6800", "D": "EB6800", "F": "EB6800", "M": "EB6800",
  "G": "799534",
  "J": "8E5C33", "Z": "8E5C33",
  "L": "7C858C",
  "N": "F6BC26", "Q": "F6BC26", "R": "F6BC26", "W": "F6BC26",
  "SI": "08179C"
};

// Haversine distance calculation
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Load GTFS stations
const gtfsStations = JSON.parse(fs.readFileSync('/tmp/gtfs/stations-with-lines.json', 'utf8'));

// Calculate commute time using distance heuristic
function calculateCommuteTime(fromLat, fromLng, toLat, toLng) {
  const distance = haversineDistance(fromLat, fromLng, toLat, toLng);
  return Math.round((distance / 17) * 60 + 5); // time = (distance / 17mph) * 60 + 5 minutes
}

// Commute hub coordinates (approximate NYC locations)
const COMMUTE_HUBS = {
  timesSquare: { lat: 40.75529, lng: -73.987495 },
  fidi: { lat: 40.708600, lng: -74.015800 },
  unionSquare: { lat: 40.735736, lng: -73.990568 },
  barclays: { lat: 40.684359, lng: -73.977666 },
  penn: { lat: 40.750373, lng: -73.991057 }
};

// Find subway lines for a neighborhood
function findSubwayLines(neighborhoodLat, neighborhoodLng) {
  const nearbyStations = gtfsStations.filter(station => {
    const distance = haversineDistance(neighborhoodLat, neighborhoodLng, station.lat, station.lon);
    return distance <= 0.5; // Within 0.5 miles
  });
  
  const uniqueLines = [...new Set(nearbyStations.flatMap(station => station.lines))];
  return uniqueLines.sort();
}

async function updateFebruaryData() {
  console.log('🔄 Updating February 2026 data...');
  
  // FIX 1: Query all neighborhoods for geoData
  const geoQuery = `
    SELECT area_name, 
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
      AVG(latitude) as lat, AVG(longitude) as lng,
      COUNT(*)::text as listing_count
    FROM listings 
    WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
      AND latitude IS NOT NULL AND longitude IS NOT NULL
      AND area_name IS NOT NULL
    GROUP BY area_name
    HAVING COUNT(*) >= 5
    ORDER BY area_name
  `;
  
  const geoResult = await pool.query(geoQuery);
  console.log(`📍 Found ${geoResult.rows.length} neighborhoods with geographic data`);
  
  // FIX 2: Query monthly trends with bedroom breakdown
  const trendsQuery = `
    SELECT date_trunc('month', created_at) as month,
      bedroom_count,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
      COUNT(*) as listing_count
    FROM listings
    WHERE created_at >= '2025-08-01' AND created_at < '2026-02-01'
      AND price > 0
    GROUP BY date_trunc('month', created_at), bedroom_count
    ORDER BY month, bedroom_count
  `;
  
  const trendsResult = await pool.query(trendsQuery);
  console.log(`📊 Found ${trendsResult.rows.length} monthly trend data points`);
  
  // Load existing data file
  const dataPath = '/data/workspace/firstmover-data/src/data/february-2026-data.json';
  const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // Update geoData
  existingData.geoData = geoResult.rows.map(row => ({
    area_name: row.area_name,
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    median_rent: parseInt(row.median_rent),
    listing_count: row.listing_count
  }));
  
  // Update monthlyTrends with bedroom breakdown
  existingData.monthlyTrendsWithBedrooms = {};
  trendsResult.rows.forEach(row => {
    const month = row.month.toISOString().split('T')[0].substring(0, 7);
    if (!existingData.monthlyTrendsWithBedrooms[month]) {
      existingData.monthlyTrendsWithBedrooms[month] = {};
    }
    existingData.monthlyTrendsWithBedrooms[month][row.bedroom_count || 'studio'] = {
      median_rent: parseInt(row.median_rent),
      listing_count: parseInt(row.listing_count)
    };
  });
  
  // Keep existing overall monthly trends for backward compatibility
  
  // Save updated data
  fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));
  console.log('✅ Updated February 2026 data');
}

async function updateCommuteData() {
  console.log('🚇 Updating commute data for ALL neighborhoods...');
  
  // FIX 11: Get all neighborhoods with lat/lng averages
  const neighborhoodsQuery = `
    SELECT area_name, AVG(latitude) as lat, AVG(longitude) as lng, COUNT(*) as cnt
    FROM listings
    WHERE created_at >= NOW() - INTERVAL '30 days'
      AND latitude IS NOT NULL AND longitude IS NOT NULL
    GROUP BY area_name
    HAVING COUNT(*) >= 5
    ORDER BY area_name
  `;
  
  const neighborhoodsResult = await pool.query(neighborhoodsQuery);
  console.log(`🗽 Found ${neighborhoodsResult.rows.length} neighborhoods for commute data`);
  
  const commuteData = {};
  const neighborhoodSubwayLines = {};
  
  for (const neighborhood of neighborhoodsResult.rows) {
    const name = neighborhood.area_name;
    const lat = parseFloat(neighborhood.lat);
    const lng = parseFloat(neighborhood.lng);
    
    // FIX 10: Find subway lines for this neighborhood
    const lines = findSubwayLines(lat, lng);
    neighborhoodSubwayLines[name] = lines;
    
    // Calculate commute times to all hubs
    const commuteTimes = {};
    for (const [hubKey, hubCoords] of Object.entries(COMMUTE_HUBS)) {
      commuteTimes[hubKey] = calculateCommuteTime(lat, lng, hubCoords.lat, hubCoords.lng);
    }
    
    commuteData[name] = {
      lines: lines,
      ...commuteTimes
    };
  }
  
  // Save commute data
  const commuteDataPath = '/data/workspace/firstmover-data/src/data/commute-data.json';
  fs.writeFileSync(commuteDataPath, JSON.stringify(commuteData, null, 2));
  console.log(`✅ Updated commute data for ${Object.keys(commuteData).length} neighborhoods`);
  
  // Save neighborhood subway lines
  const subwayLinesPath = '/data/workspace/firstmover-data/src/data/neighborhood-subway-lines.json';
  fs.writeFileSync(subwayLinesPath, JSON.stringify(neighborhoodSubwayLines, null, 2));
  console.log(`✅ Updated subway lines for ${Object.keys(neighborhoodSubwayLines).length} neighborhoods`);
}

async function main() {
  try {
    await updateFebruaryData();
    await updateCommuteData();
    console.log('🎉 All data updates completed successfully!');
  } catch (error) {
    console.error('❌ Error updating data:', error);
  } finally {
    await pool.end();
  }
}

main();