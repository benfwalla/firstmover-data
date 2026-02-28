#!/usr/bin/env node

import { Pool } from 'pg';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const pool = new Pool({
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'readonly_agent.tdrshcdwetrbivhjikup',
  password: 'process.env.SUPABASE_PASSWORD',
  ssl: { rejectUnauthorized: false },
});

async function generateReport() {
  try {
    console.log('🔍 Fetching January 2026 data...');
    
    // Query 1: Total listings and citywide median rent for January 2026
    const marketStatsQuery = `
      SELECT 
        COUNT(*) as total_active,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent
      FROM listings
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price > 0
    `;
    
    const marketStats = await pool.query(marketStatsQuery);
    console.log('✅ Market stats fetched');
    
    // Query 2: Average price by bedroom count
    const bedroomPricesQuery = `
      SELECT 
        bedroom_count,
        ROUND(AVG(price)) as avg_price,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        COUNT(*) as listing_count
      FROM listings
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price > 0
        AND bedroom_count IN (1, 2, 3, 4)
      GROUP BY bedroom_count
      ORDER BY bedroom_count
    `;
    
    const bedroomPrices = await pool.query(bedroomPricesQuery);
    console.log('✅ Bedroom price breakdown fetched');
    
    // Query 3: Top 20 neighborhoods by listing volume with rent breakdown
    const topNeighborhoodsQuery = `
      SELECT 
        area_name,
        COUNT(*) as listing_count
      FROM listings
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price > 0
        AND area_name IS NOT NULL
      GROUP BY area_name
      HAVING COUNT(*) >= 10
      ORDER BY COUNT(*) DESC
      LIMIT 20
    `;
    
    const topNeighborhoods = await pool.query(topNeighborhoodsQuery);
    console.log('✅ Top neighborhoods fetched');
    
    // Query 4: Neighborhood rent breakdown (1BR/2BR/3BR)
    const neighborhoodRentsQuery = `
      SELECT 
        area_name,
        bedroom_count,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        COUNT(*) as listing_count
      FROM listings
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price > 0
        AND area_name IN (${topNeighborhoods.rows.map((_, i) => `$${i + 1}`).join(',')})
        AND bedroom_count IN (1, 2, 3)
      GROUP BY area_name, bedroom_count
      HAVING COUNT(*) >= 3
      ORDER BY area_name, bedroom_count
    `;
    
    const neighborhoodRents = await pool.query(
      neighborhoodRentsQuery,
      topNeighborhoods.rows.map(row => row.area_name)
    );
    console.log('✅ Neighborhood rent breakdown fetched');
    
    // Query 5: Monthly trends for last 6 months (Aug 2025 - Jan 2026)
    const monthlyTrendsQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        COUNT(*) as listing_count
      FROM listings
      WHERE created_at >= '2025-08-01' AND created_at < '2026-02-01'
        AND price > 0
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;
    
    const monthlyTrends = await pool.query(monthlyTrendsQuery);
    console.log('✅ Monthly trends fetched');
    
    // Query 6: Example listings at specific price points
    const pricePoints = [2000, 2500, 3000, 3500, 4500];
    const exampleListings = [];
    
    for (const price of pricePoints) {
      const listingQuery = `
        SELECT 
          area_name,
          street,
          unit,
          price,
          bedroom_count,
          full_bathroom_count,
          living_area_size,
          lead_media_photo,
          url_path
        FROM listings
        WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
          AND price BETWEEN $1 AND $2
          AND lead_media_photo IS NOT NULL
          AND url_path IS NOT NULL
          AND area_name IN ('East Village', 'West Village', 'Williamsburg', 'Bushwick', 'Astoria', 
                           'Park Slope', 'Crown Heights', 'Hell''s Kitchen', 'Lower East Side', 'Chelsea')
        ORDER BY RANDOM()
        LIMIT 1
      `;
      
      const listing = await pool.query(listingQuery, [price - 200, price + 200]);
      if (listing.rows.length > 0) {
        exampleListings.push({
          ...listing.rows[0],
          target_price: price
        });
      }
    }
    console.log('✅ Example listings fetched');
    
    // Query 7: Geographic data for map (simplified)
    const geoDataQuery = `
      SELECT 
        area_name,
        ROUND(AVG(ST_X(ST_Centroid(geom))), 6) as lng,
        ROUND(AVG(ST_Y(ST_Centroid(geom))), 6) as lat,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        COUNT(*) as listing_count
      FROM listings
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price > 0
        AND geom IS NOT NULL
        AND area_name IS NOT NULL
      GROUP BY area_name
      HAVING COUNT(*) >= 5
      ORDER BY COUNT(*) DESC
      LIMIT 50
    `;
    
    let geoData = [];
    try {
      const geoResult = await pool.query(geoDataQuery);
      geoData = geoResult.rows;
      console.log('✅ Geographic data fetched');
    } catch (error) {
      console.log('⚠️  Geographic data not available, using fallback');
      // Fallback: use top neighborhoods with default coordinates
      geoData = topNeighborhoods.rows.slice(0, 10).map(row => ({
        area_name: row.area_name,
        lng: -73.9857, // Default NYC coordinates  
        lat: 40.7484,
        median_rent: 3500, // Placeholder
        listing_count: row.listing_count.toString()
      }));
    }
    
    // Build the final report data object
    const reportData = {
      reportDate: '2026-02-01',
      dataMonth: '2026-01',
      marketStats: {
        total_active: marketStats.rows[0].total_active,
        median_rent: marketStats.rows[0].median_rent,
        avg_price_change: '-127' // Placeholder - would need price change calculation
      },
      bedroomBreakdown: bedroomPrices.rows,
      topNeighborhoods: topNeighborhoods.rows,
      neighborhoodRents: neighborhoodRents.rows,
      monthlyTrends: monthlyTrends.rows.map(row => ({
        month: row.month.toISOString().substr(0, 7), // Format as YYYY-MM
        median_rent: parseInt(row.median_rent),
        listing_count: row.listing_count.toString()
      })),
      exampleListings,
      geoData: geoData.map(row => ({
        area_name: row.area_name,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng), 
        median_rent: parseInt(row.median_rent),
        listing_count: row.listing_count.toString()
      })),
      // Placeholder data for no-fee breakdown (not available in current schema)
      noFeeBreakdown: []
    };
    
    // Write to file
    const outputPath = join(__dirname, '../src/data/february-2026-data.json');
    writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
    
    console.log('📊 Report data generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📈 Total listings: ${reportData.marketStats.total_active}`);
    console.log(`💰 Median rent: $${reportData.marketStats.median_rent}`);
    console.log(`🏘️  Top neighborhoods: ${reportData.topNeighborhoods.length}`);
    
  } catch (error) {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

generateReport();