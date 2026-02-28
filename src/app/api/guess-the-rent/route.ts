import { getDBClient } from '@/lib/db';

const POPULAR_NEIGHBORHOODS = [
  'Williamsburg', 'Bushwick', 'Astoria', 'Crown Heights', 'East Village',
  'Bedford-Stuyvesant', 'Upper West Side', "Hell's Kitchen", 'Greenpoint',
  'Financial District', 'Murray Hill', 'West Village', 'Chelsea', 'Park Slope',
  'Fort Greene', 'Flatbush', 'Downtown Brooklyn', 'Yorkville', 'Lenox Hill',
  'Kips Bay', 'Central Harlem', 'East Harlem', 'Hunters Point', 'Cobble Hill',
  'SoHo', 'Tribeca', 'Gramercy Park', 'Nolita', 'Prospect Heights',
  'Upper East Side', 'Lower East Side', 'Midtown', 'Boerum Hill',
];

export async function GET() {
  let client;
  try {
    client = await getDBClient();
    const placeholders = POPULAR_NEIGHBORHOODS.map((_, i) => `$${i + 1}`).join(', ');
    const result = await client.query(`
      SELECT id, area_name, street, unit, price, bedroom_count,
             full_bathroom_count, living_area_size, lead_media_photo, photos,
             EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 AS minutes_ago
      FROM listings
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND price > 1000 AND price < 15000
        AND lead_media_photo IS NOT NULL AND lead_media_photo != ''
        AND photos IS NOT NULL AND photos != '' AND array_length(string_to_array(photos, ','), 1) >= 2
        AND bedroom_count >= 0
        AND area_name IN (${placeholders})
      ORDER BY RANDOM()
      LIMIT 5
    `, POPULAR_NEIGHBORHOODS);

    const listings = result.rows.map(row => {
      const photoHashes = row.photos ? row.photos.split(',') : [row.lead_media_photo];
      return {
        id: row.id,
        area_name: row.area_name,
        street: row.street,
        unit: row.unit,
        price: parseInt(row.price),
        bedroom_count: row.bedroom_count,
        full_bathroom_count: row.full_bathroom_count,
        living_area_size: parseInt(row.living_area_size || 0),
        photos: photoHashes.map((h: string) => `https://photos.zillowstatic.com/fp/${h.trim()}-se_extra_large_1500_800.webp`),
        listed_minutes_ago: Math.round(parseFloat(row.minutes_ago || '0')),
      };
    });

    return Response.json(listings);
  } catch (error: any) {
    console.error('Guess the Rent API error:', error?.message);
    return Response.json({ error: 'Failed to fetch listings' }, { status: 500 });
  } finally {
    if (client) await client.end().catch(() => {});
  }
}
