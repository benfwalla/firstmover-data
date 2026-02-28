#!/usr/bin/env node

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Database configuration using the host fallback pattern
const HOSTS = [
  'aws-0-us-west-1.pooler.supabase.com',
  '54.177.55.191', 
  '52.8.172.168',
];

async function getDBClient() {
  const config = {
    port: 5432,
    database: 'postgres',
    user: 'readonly_agent.tdrshcdwetrbivhjikup',
    password: 'process.env.SUPABASE_PASSWORD',
    ssl: { rejectUnauthorized: false, servername: 'aws-0-us-west-1.pooler.supabase.com' },
    connectionTimeoutMillis: 8000,
  };

  for (const host of HOSTS) {
    try {
      console.log(`Trying to connect to ${host}...`);
      const client = new Client({ ...config, host });
      await client.connect();
      console.log(`Connected to ${host}`);
      return client;
    } catch (e) {
      console.log(`Failed to connect to ${host}: ${e.message}`);
    }
  }
  throw new Error('All database connection attempts failed');
}

async function generateBlogData() {
  const client = await getDBClient();

  try {
    console.log('Generating blog post data...');

    // 1. $2,500 apartments by borough
    console.log('Finding $2,500 apartments by borough...');
    
    // Get borough mapping for major neighborhoods
    const boroughMap = {
      'Manhattan': ['East Village', 'West Village', 'Lower East Side', 'Murray Hill', 'Hell\'s Kitchen', 'Chelsea', 'SoHo', 'Tribeca', 'Financial District', 'Upper East Side', 'Upper West Side', 'Midtown', 'Gramercy', 'Kips Bay', 'NoHo', 'Nolita'],
      'Brooklyn': ['Williamsburg', 'Bushwick', 'Park Slope', 'Brooklyn Heights', 'DUMBO', 'Bed-Stuy', 'Crown Heights', 'Prospect Heights', 'Carroll Gardens', 'Red Hook', 'Gowanus', 'Greenpoint', 'Fort Greene', 'Clinton Hill', 'Flatbush', 'Bay Ridge', 'Sunset Park'],
      'Queens': ['Astoria', 'Long Island City', 'Sunnyside', 'Woodside', 'Jackson Heights', 'Forest Hills', 'Ridgewood', 'Elmhurst', 'Flushing'],
      'Bronx': ['Mott Haven', 'Port Morris', 'Melrose', 'Morrisania', 'Concourse', 'Highbridge', 'University Heights'],
      'Staten Island': ['St. George', 'Stapleton', 'New Brighton', 'West Brighton', 'Port Richmond']
    };

    const budget2500Listings = {};

    for (const [borough, neighborhoods] of Object.entries(boroughMap)) {
      const neighborhoodsList = neighborhoods.map(n => `'${n}'`).join(',');
      
      const query = `
        SELECT 
          area_name,
          price,
          bedroom_count,
          full_bathroom_count,
          living_area_size,
          lead_media_photo,
          url_path,
          street,
          ABS(price - 2500) as price_diff
        FROM listings 
        WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
          AND area_name IN (${neighborhoodsList})
          AND price BETWEEN 2300 AND 2700
          AND lead_media_photo IS NOT NULL
          AND lead_media_photo != ''
        ORDER BY price_diff ASC, RANDOM()
        LIMIT 1
      `;
      
      try {
        const result = await client.query(query);
        if (result.rows.length > 0) {
          budget2500Listings[borough] = result.rows[0];
        }
      } catch (error) {
        console.log(`No $2,500 listings found for ${borough}`);
      }
    }

    // 2. Biggest rent drops (January vs December)
    console.log('Finding biggest rent drops...');
    const rentDropsQuery = `
      WITH dec_data AS (
        SELECT 
          area_name,
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as dec_median
        FROM listings 
        WHERE created_at >= '2025-12-01' AND created_at < '2026-01-01'
          AND price > 0 AND price < 20000
          AND area_name IS NOT NULL
        GROUP BY area_name
        HAVING COUNT(*) >= 15
      ),
      jan_data AS (
        SELECT 
          area_name,
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as jan_median,
          COUNT(*) as listing_count
        FROM listings 
        WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
          AND price > 0 AND price < 20000
          AND area_name IS NOT NULL
        GROUP BY area_name
        HAVING COUNT(*) >= 15
      )
      SELECT 
        j.area_name,
        j.jan_median,
        d.dec_median,
        (d.dec_median - j.jan_median) as price_drop,
        j.listing_count
      FROM jan_data j
      JOIN dec_data d ON j.area_name = d.area_name
      WHERE (d.dec_median - j.jan_median) > 0
      ORDER BY price_drop DESC
      LIMIT 10
    `;
    
    const rentDropsResult = await client.query(rentDropsQuery);
    const biggestRentDrops = rentDropsResult.rows;

    // Get example listings for rent drop neighborhoods
    const rentDropListings = {};
    for (const neighborhood of biggestRentDrops.slice(0, 3)) {
      const listingQuery = `
        SELECT 
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
          AND area_name = '${neighborhood.area_name}'
          AND lead_media_photo IS NOT NULL
          AND lead_media_photo != ''
        ORDER BY RANDOM()
        LIMIT 1
      `;
      
      try {
        const result = await client.query(listingQuery);
        if (result.rows.length > 0) {
          rentDropListings[neighborhood.area_name] = result.rows[0];
        }
      } catch (error) {
        console.log(`No listings found for ${neighborhood.area_name}`);
      }
    }

    // 3. Interesting January stats
    console.log('Getting January analysis stats...');
    const analysisQuery = `
      SELECT 
        MAX(price) as most_expensive,
        MIN(price) as cheapest,
        COUNT(*) as total_listings,
        AVG(living_area_size) as avg_sqft,
        COUNT(DISTINCT area_name) as unique_neighborhoods
      FROM listings 
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price > 0 AND price < 50000
    `;
    
    const analysisResult = await client.query(analysisQuery);
    const januaryStats = analysisResult.rows[0];

    // Get the most expensive listing
    const expensiveQuery = `
      SELECT area_name, price, bedroom_count, full_bathroom_count, living_area_size, street
      FROM listings 
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price = (
          SELECT MAX(price) FROM listings 
          WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
            AND price < 50000
        )
      LIMIT 1
    `;
    
    const expensiveResult = await client.query(expensiveQuery);
    const mostExpensive = expensiveResult.rows[0];

    // Get the cheapest listing
    const cheapQuery = `
      SELECT area_name, price, bedroom_count, full_bathroom_count, living_area_size, street
      FROM listings 
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND price = (
          SELECT MIN(price) FROM listings 
          WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
            AND price > 500
        )
      LIMIT 1
    `;
    
    const cheapResult = await client.query(cheapQuery);
    const cheapest = cheapResult.rows[0];

    // Bedroom count breakdown
    const bedroomCountsQuery = `
      SELECT 
        bedroom_count,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()) as percentage
      FROM listings 
      WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
        AND bedroom_count BETWEEN 0 AND 5
      GROUP BY bedroom_count
      ORDER BY bedroom_count
    `;
    
    const bedroomCountsResult = await client.query(bedroomCountsQuery);
    const bedroomCounts = bedroomCountsResult.rows;

    // Compile all blog data
    const blogData = {
      budget2500: {
        listings: budget2500Listings,
        generated_at: new Date().toISOString()
      },
      rentDrops: {
        neighborhoods: biggestRentDrops,
        exampleListings: rentDropListings,
        generated_at: new Date().toISOString()
      },
      januaryAnalysis: {
        stats: {
          total_listings: parseInt(januaryStats.total_listings),
          most_expensive: parseInt(januaryStats.most_expensive),
          cheapest: parseInt(januaryStats.cheapest),
          avg_sqft: Math.round(parseFloat(januaryStats.avg_sqft || 0)),
          unique_neighborhoods: parseInt(januaryStats.unique_neighborhoods)
        },
        mostExpensive,
        cheapest,
        bedroomBreakdown: bedroomCounts.map(row => ({
          bedroom_count: row.bedroom_count,
          count: parseInt(row.count),
          percentage: Math.round(parseFloat(row.percentage))
        })),
        generated_at: new Date().toISOString()
      }
    };

    // Write to file
    const outputPath = path.join(process.cwd(), 'src/data/blog-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(blogData, null, 2));

    console.log(`✓ Blog data written to ${outputPath}`);
    console.log(`✓ Found $2,500 listings in ${Object.keys(budget2500Listings).length} boroughs`);
    console.log(`✓ Top rent drop: ${biggestRentDrops[0].area_name} (${biggestRentDrops[0].price_drop} drop)`);
    console.log(`✓ January stats: ${januaryStats.total_listings} listings, $${januaryStats.most_expensive} most expensive`);

    await client.end();

  } catch (error) {
    console.error('Error generating blog data:', error);
    await client.end();
    process.exit(1);
  }
}

// Run the script
generateBlogData();