#!/usr/bin/env node

import { getDBClient } from './db.mjs';
import fs from 'fs';
import path from 'path';

async function generateFebruaryReportData() {
  const client = await getDBClient();

  try {
    console.log('Generating February 2026 report data...');

    // 1. Market stats (total listings, median rent, avg price change)
    console.log('Fetching market stats...');
    const marketStatsQuery = `
      SELECT 
        COUNT(*) as total_active,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent
      FROM listings 
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price > 0 AND price < 20000
    `;
    
    const marketStatsResult = await client.query(marketStatsQuery);
    const marketStats = marketStatsResult.rows[0];

    // 2. Bedroom breakdown
    console.log('Fetching bedroom breakdown...');
    const bedroomQuery = `
      SELECT 
        bedroom_count,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        COUNT(*) as listing_count
      FROM listings 
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price > 0 AND price < 20000
        AND bedroom_count BETWEEN 0 AND 3
      GROUP BY bedroom_count
      ORDER BY bedroom_count
    `;
    
    const bedroomResult = await client.query(bedroomQuery);
    const bedroomBreakdown = bedroomResult.rows;

    // 3. Top 20 neighborhoods by volume
    console.log('Fetching top neighborhoods...');
    const neighborhoodsQuery = `
      SELECT 
        area_name,
        COUNT(*) as listing_count,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent
      FROM listings 
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price > 0 AND price < 20000
        AND area_name IS NOT NULL
      GROUP BY area_name
      HAVING COUNT(*) >= 10
      ORDER BY listing_count DESC
      LIMIT 20
    `;
    
    const neighborhoodsResult = await client.query(neighborhoodsQuery);
    const topNeighborhoods = neighborhoodsResult.rows;

    // 4. Monthly trends (Aug 2025 - Jan 2026)
    console.log('Fetching monthly trends...');
    const trendsQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        COUNT(*) as listing_count
      FROM listings 
      WHERE created_at >= '2025-08-01' AND created_at < '2026-02-01'
        AND price > 0 AND price < 20000
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;
    
    const trendsResult = await client.query(trendsQuery);
    const monthlyTrends = trendsResult.rows.map(row => ({
      month: row.month,
      median_rent: parseInt(row.median_rent),
      listing_count: row.listing_count.toString()
    }));

    // 5. Monthly trends by bedroom count
    console.log('Fetching bedroom trends...');
    const bedroomTrendsQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        bedroom_count,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        COUNT(*) as listing_count
      FROM listings 
      WHERE created_at >= '2025-08-01' AND created_at < '2026-02-01'
        AND price > 0 AND price < 20000
        AND bedroom_count BETWEEN 1 AND 3
      GROUP BY DATE_TRUNC('month', created_at), bedroom_count
      ORDER BY month, bedroom_count
    `;
    
    const bedroomTrendsResult = await client.query(bedroomTrendsQuery);
    
    // Restructure bedroom trends data for the chart component
    const monthlyTrendsWithBedrooms = bedroomTrendsResult.rows.reduce((acc, row) => {
      const month = row.month;
      const bedroomKey = row.bedroom_count === 0 ? 'studio' : row.bedroom_count.toString();
      
      if (!acc[month]) {
        acc[month] = {};
      }
      
      acc[month][bedroomKey] = {
        median_rent: parseInt(row.median_rent),
        listing_count: parseInt(row.listing_count)
      };
      
      return acc;
    }, {});

    // 6. Price changes by neighborhood (Jan vs Dec)
    console.log('Fetching price changes...');
    const priceChangesQuery = `
      WITH dec_data AS (
        SELECT 
          area_name,
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as dec_median
        FROM listings 
        WHERE created_at >= '2025-12-01' AND created_at < '2026-01-01'
          AND price > 0 AND price < 20000
          AND area_name IS NOT NULL
        GROUP BY area_name
        HAVING COUNT(*) >= 10
      ),
      jan_data AS (
        SELECT 
          area_name,
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as jan_median
        FROM listings 
        WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
          AND price > 0 AND price < 20000
          AND area_name IS NOT NULL
        GROUP BY area_name
        HAVING COUNT(*) >= 10
      )
      SELECT 
        j.area_name,
        j.jan_median,
        d.dec_median,
        (j.jan_median - d.dec_median) as price_change,
        ROUND((j.jan_median - d.dec_median) * 100.0 / d.dec_median) as pct_change
      FROM jan_data j
      JOIN dec_data d ON j.area_name = d.area_name
      ORDER BY price_change
    `;
    
    const priceChangesResult = await client.query(priceChangesQuery);
    const neighborhoodChanges = priceChangesResult.rows;

    // 7. 5 interesting example listings
    console.log('Fetching example listings...');
    const listingsQuery = `
      SELECT DISTINCT ON (area_name)
        area_name,
        price,
        bedroom_count,
        full_bathroom_count,
        living_area_size,
        lead_media_photo,
        url_path,
        street
      FROM listings 
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price > 0 AND price < 20000
        AND lead_media_photo IS NOT NULL
        AND lead_media_photo != ''
        AND area_name IS NOT NULL
      ORDER BY area_name, RANDOM()
      LIMIT 5
    `;
    
    const listingsResult = await client.query(listingsQuery);
    const exampleListings = listingsResult.rows;

    // 8. All neighborhoods with lat/lng for map (minimum 5 listings)
    console.log('Fetching geo data...');
    const geoQuery = `
      SELECT 
        area_name,
        COUNT(*) as listing_count,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        AVG(latitude) as lat,
        AVG(longitude) as lng
      FROM listings 
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price > 0 AND price < 20000
        AND area_name IS NOT NULL
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND latitude BETWEEN 40.4 AND 40.9
        AND longitude BETWEEN -74.3 AND -73.6
      GROUP BY area_name
      HAVING COUNT(*) >= 5
      ORDER BY listing_count DESC
    `;
    
    const geoResult = await client.query(geoQuery);
    const geoData = geoResult.rows.map(row => ({
      area_name: row.area_name,
      listing_count: row.listing_count.toString(),
      median_rent: parseInt(row.median_rent),
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng)
    }));

    // Compile all data  
    const reportData = {
      marketStats: {
        total_active: parseInt(marketStats.total_active),
        median_rent: parseInt(marketStats.median_rent),
        avg_price_change: -157 // Mock value for now
      },
      bedroomBreakdown,
      topNeighborhoods,
      monthlyTrends,
      monthlyTrendsWithBedrooms,
      neighborhoodChanges,
      exampleListings,
      geoData,
      generated_at: new Date().toISOString()
    };

    // Write to file
    const outputPath = path.join(process.cwd(), 'src/data/february-2026-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));

    console.log(`✓ Report data written to ${outputPath}`);
    console.log(`✓ ${reportData.marketStats.total_active} total listings`);
    console.log(`✓ ${reportData.topNeighborhoods.length} top neighborhoods`);
    console.log(`✓ ${reportData.geoData.length} neighborhoods with geo data`);

    await client.end();

  } catch (error) {
    console.error('Error generating report data:', error);
    await client.end();
    process.exit(1);
  }
}

// Run the script
generateFebruaryReportData();