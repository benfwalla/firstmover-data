# FirstMover Open Data — SEO & Growth Plan

*Last updated: March 12, 2026*

The goal: drive organic traffic to firstmovernyc.com/open, convert visitors into FirstMover iOS app downloads. The app sends instant StreetEasy notifications so apartment hunters get a first mover advantage.

---

## What we have today

- **170+ neighborhood pages** (`/neighborhoods/[slug]`) with rent data, commute times, subway access, recent listings, StreetEasy deep links
- **Neighborhood index page** (`/neighborhoods`) grouped by borough with median rents
- **Interactive tools**: Find Your Neighborhood quiz, Guess the Rent game, Rent Check
- **Open data downloads**: monthly listing CSVs, rent-stabilized buildings DB
- **Monthly rent reports** (blog-style)
- **Daily cron rebuild** refreshing all data at 6am ET
- **Sitemap** submitted to Google Search Console (pending verification)
- **Proprietary data** from Supabase (listings, rents, neighborhoods) — this is our moat

---

## Phase 1: Foundation (now — next 2 weeks)

Things that make everything else work better.

### 1.1 Google Search Console

- [x] Domain property verified
- [x] Sitemap submitted (`/open/sitemap.xml`)
- [ ] Wait for sitemap to be successfully fetched (check daily)
- [ ] Monitor indexation rate — how many of the 170+ neighborhood pages get indexed
- [ ] Check for crawl errors weekly
- [ ] Submit the neighborhoods index page for indexing via URL Inspection tool

### 1.2 Internal linking improvements

Right now the neighborhood pages link to nearby neighborhoods and parent/child neighborhoods, which is good. But we should also:

- [ ] Add a "Browse all neighborhoods" link in the footer or navbar
- [ ] Cross-link from blog posts/reports to relevant neighborhood pages (e.g., a report about Manhattan rents should link to each Manhattan neighborhood)
- [ ] Add neighborhood links to the Rent Check and Find Your Neighborhood results pages
- [ ] Consider adding a "neighborhoods in this borough" section on each neighborhood page

### 1.3 On-page SEO cleanup

- [ ] Ensure every neighborhood page has a unique, keyword-rich meta description (currently auto-generated from template — looks good)
- [ ] Add alt text to listing images (currently `${listing.street} ${listing.unit}` — could include neighborhood name and bedroom count)
- [ ] Verify structured data (JSON-LD Place schema) renders correctly via Google Rich Results Test

---

## Phase 2: Content that ranks (weeks 2–6)

Long-tail blog posts targeting searches real apartment hunters make. These posts link back to neighborhood pages and the app.

### 2.1 Neighborhood-focused blog posts

Write 2–3 per week in Ben's voice. These target "[neighborhood] apartments" and "[neighborhood] rent" long-tail queries.

**Post ideas:**

- "What does $3,000/mo get you in [neighborhood] right now?" — Use real listing data to show what's available at common price points. Link to the neighborhood page.
- "The cheapest neighborhoods in [borough] right now" — Ranked by median rent from our data. Links to every neighborhood mentioned.
- "Where your rent money goes furthest in NYC" — Bang-for-buck analysis: rent vs. space vs. commute time. Uses our proprietary data.
- "[Neighborhood] vs [neighborhood]: which is better for [persona]?" — e.g., "Astoria vs Bushwick for remote workers." Comparison posts using commute data, rent data, subway access.
- "The best neighborhoods for a [X]-minute commute to [destination]" — e.g., "under 30 minutes to Midtown." Uses our commute time data.
- "NYC neighborhoods where rent is actually dropping" — Month-over-month rent trends (once we have historical data).

### 2.2 Evergreen guides

Longer pieces that build authority and attract links:

- "NYC rent prices by neighborhood: the complete guide" — Hub page linking to every neighborhood page. Major SEO asset.
- "How to apartment hunt in NYC: a data-driven guide" — Practical guide weaving in our tools (Rent Check, Find Your Neighborhood quiz).
- "Understanding NYC rent stabilization" — Leverages our rent-stabilized buildings database.
- "The real cost of living in [borough]" — Beyond rent: commute costs, groceries, lifestyle. One per borough.

### 2.3 Monthly data reports (already doing this)

Keep publishing monthly rent reports. Add more internal links to neighborhood pages.

---

## Phase 3: New programmatic pages (weeks 4–8)

More data-driven pages at scale, similar to what we did with neighborhoods.

### 3.1 Neighborhood comparison pages

**URL**: `/compare/[neighborhood-a]-vs-[neighborhood-b]`

Side-by-side comparison of two neighborhoods: median rent, bedroom breakdown, commute times, subway access. We already have all this data.

**Why it works**: People search "[neighborhood] vs [neighborhood]" when deciding where to live. High intent, low competition, and we have the data to make these genuinely useful.

**Scale**: Start with the top 50 most natural comparisons (same borough, similar price range, commonly compared). Don't generate every permutation — that's thin content.

### 3.2 Rent by bedroom pages

**URL**: `/rent/[bedroom-type]/[borough]` — e.g., `/rent/1-bedroom/brooklyn`

"1 bedroom apartments in Brooklyn: current prices by neighborhood." Table of every Brooklyn neighborhood with 1BR median, low, high, and listing count. Links to each neighborhood page.

**Why it works**: "1 bedroom apartment [borough/NYC]" is a high-volume search. We have the exact data.

**Scale**: 5 bedroom types × 5 boroughs + 5 citywide = 30 pages.

### 3.3 Commute-based pages

**URL**: `/commute/[destination]` — e.g., `/commute/grand-central`

"Best neighborhoods for commuting to Grand Central." Ranked by commute time, with rent data for each. We already have commute data for 10 destinations.

**Scale**: 10 pages (one per commute destination).

---

## Phase 4: Interactive tools & shareability (weeks 6–10)

Tools that generate backlinks and social shares.

### 4.1 Neighborhood comparison tool (interactive)

Let users pick two neighborhoods and see a side-by-side comparison. This powers the comparison pages but also stands alone as a tool people share.

### 4.2 "What can I afford?" calculator

**URL**: `/tools/budget-calculator`

Enter your budget, preferred borough, and bedroom count. See which neighborhoods fit. Links to each matching neighborhood page.

**Why it works**: "NYC rent calculator" and "what can I afford in NYC" are searchable queries. The output naturally funnels people to neighborhood pages and the app.

### 4.3 Rent trends over time (once we have historical data)

After a few months of daily rebuilds, we'll have historical median rents. Surface this as:
- Trend charts on each neighborhood page
- "NYC rent trends" standalone page
- "Is rent going up or down in [neighborhood]?" blog posts

---

## Phase 5: Distribution (ongoing)

### 5.1 Reddit

Target: r/AskNYC, r/NYCapartments, r/nycrentals

- Answer rent questions with data from our neighborhood pages. Don't spam links. Be the person who actually knows the numbers.
- When someone asks "is $2,500 reasonable for a 1BR in Astoria?" — you can answer with data and casually mention the source.
- Share genuinely interesting data findings as posts (e.g., "I track rent data across 170 NYC neighborhoods. Here's what's happening right now.")

### 5.2 Social (Twitter/X, TikTok)

- Weekly "rent fact" posts using our data. Short, shareable, surprising.
- Monthly "cheapest neighborhoods" or "biggest rent drops" threads.
- Short-form video: "What $2,500/mo gets you in 5 different NYC neighborhoods" (screenshots from our pages).

### 5.3 Backlink building

- Reach out to NYC real estate bloggers, local news. Our data pages are genuinely useful resources.
- Submit data findings to journalists covering NYC housing (Curbed, The City, NY Times real estate section).
- Our open data downloads are natural link magnets for researchers, journalists, and policy folks.

---

## Phase 6: App conversion optimization (ongoing)

Every page should have a soft, tasteful path to the FirstMover app. No loud CTAs (per Ben's preference).

### Current state
- Neighborhood pages have: "Get new listing alerts for [neighborhood] with FirstMover"
- This is good. Keep it subtle.

### Improvements
- [ ] Add contextual app mentions in blog posts (e.g., "if you want to know the moment a new listing drops in Bushwick, that's what FirstMover does")
- [ ] On comparison pages: "Found your neighborhood? Get instant alerts with FirstMover"
- [ ] On the budget calculator results: "Want to be first to see new listings in these neighborhoods?"
- [ ] App Store link should use a smart link that tracks which page/neighborhood drove the download
- [ ] Consider an email capture (newsletter) as a softer conversion step before app download

---

## Priority order

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 1 | GSC monitoring + indexation | Low | High |
| 2 | Internal linking improvements | Low | Medium |
| 3 | "NYC rent by neighborhood" hub post | Medium | High |
| 4 | 3–4 neighborhood comparison blog posts | Medium | High |
| 5 | Neighborhood comparison pages (programmatic) | High | High |
| 6 | Rent by bedroom pages (programmatic) | Medium | High |
| 7 | Commute-based pages | Medium | Medium |
| 8 | Budget calculator tool | High | Medium |
| 9 | Reddit distribution | Low | Medium |
| 10 | Historical rent trends | Low (just time) | High |

---

## Metrics to track

- **GSC**: Impressions, clicks, average position for neighborhood keywords
- **Indexation rate**: What % of our 170+ pages are indexed
- **Top queries**: What people are finding us for
- **App downloads**: Track which pages drive installs (needs smart links or UTM params)
- **Backlinks**: Monitor via GSC or a free tool

---

## What NOT to do

- Don't generate 10,000 thin comparison pages for every permutation. Quality over quantity.
- Don't stuff keywords. The data speaks for itself.
- Don't use StreetEasy's name in marketing copy (brand independence).
- Don't make CTAs loud or aggressive. Subtle and helpful.
- Don't write blog posts that sound like AI. Use Ben's voice: conversational, specific, a little self-deprecating.
