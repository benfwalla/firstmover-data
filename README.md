# FirstMover Open Data Project

NYC rental market data, open and free.

**Live site:** [firstmover-data.vercel.app](https://firstmover-data.vercel.app)

We track thousands of NYC rental listings every month and publish the data for anyone to use. This repo powers the site and contains 14 months of historical listing data.

## What's here

- **Open Data** — Monthly CSVs of every rental listing we track (neighborhood, address, bedrooms, bathrooms, price, sqft, building type, listing URL)
- **Reports** — Monthly rent reports with interactive charts and neighborhood maps
- **Resources** — Curated tools, apps, and guides for NYC renters
- **Interactive Tools** — Find Your Neighborhood quiz, Guess the Rent game, Rent by Salary calculator, Is My Rent Fair checker

## Data

CSV files live in `public/data/`. Each file covers one month of listings.

| Column | Description |
|--------|-------------|
| `neighborhood` | StreetEasy neighborhood name |
| `address` | Street address |
| `unit` | Unit number |
| `zip_code` | ZIP code |
| `bedrooms` | Bedroom count |
| `bathrooms` | Full bathrooms |
| `half_baths` | Half bathrooms |
| `price` | Monthly rent (USD) |
| `net_effective_price` | Net effective rent if concessions apply |
| `building_type` | RENTAL, CONDO, etc. |
| `sqft` | Square footage (when available) |
| `furnished` | Whether the unit is furnished |
| `no_fee` | Whether there's a broker fee |
| `lease_months` | Lease length |
| `months_free` | Free months offered |
| `available_date` | Move-in date |
| `date_listed` | When the listing was posted |
| `url` | StreetEasy listing URL |

## Tech stack

- [Next.js](https://nextjs.org) — React framework
- [Vercel](https://vercel.com) — Hosting
- [Supabase](https://supabase.com) — Data source (PostgreSQL)
- [Mapbox](https://mapbox.com) — Interactive maps

## Getting started

```bash
git clone https://github.com/benfwalla/firstmover-data.git
cd firstmover-data
bun install
cp .env.example .env.local
# Fill in your env vars
bun dev
```

## Scripts

Data generation scripts live in `scripts/`. They pull from Supabase and generate static JSON/CSV files.

| Script | What it does |
|--------|-------------|
| `update-data.js` | Refreshes neighborhood rent data, coords, and subway lines |
| `generate-february-2026-data.js` | Generates report data for Feb 2026 |
| `generate-february-report.js` | Generates the Feb 2026 MDX report |
| `generate-blog-data.js` | Generates data for blog posts |
| `google-commute.mjs` | Fetches commute times via Google Maps Directions API |

All scripts read DB credentials from environment variables. Run with:

```bash
source .env.local && node scripts/update-data.js
```

## Related

- [FirstMover iOS App](https://apps.apple.com/us/app/firstmover/id6740444528) — Instant push notifications for new StreetEasy listings
- [firstmovernyc.com](https://firstmovernyc.com) — Main site

## License

MIT — see [LICENSE](LICENSE)
