'use client';

import { useState } from 'react';
import Link from 'next/link';

type Category = 'all' | 'tools' | 'search' | 'research' | 'guides';

interface Resource {
  title: string;
  description: string;
  href: string;
  external?: boolean;
  category: Category;
}

const resources: Resource[] = [
  // Tools (our interactive stuff)
  {
    title: 'Find Your Neighborhood',
    description: 'Answer a few questions about your budget, lifestyle, and commute to discover which NYC neighborhoods are your best fit.',
    href: '/find-your-neighborhood',
    category: 'tools',
  },
  {
    title: '🎯 Guess the Rent',
    description: 'Think you know NYC rent prices? We show you real listings — you guess the monthly rent.',
    href: '/games/guess-the-rent',
    category: 'tools',
  },
  {
    title: 'Rent by Salary',
    description: 'See what neighborhoods you can actually afford based on your salary and NYC\'s tax situation.',
    href: '/tools/afford',
    category: 'tools',
  },
  {
    title: 'Is My Rent Fair?',
    description: 'Compare your rent to the median in your neighborhood. Find out if you\'re overpaying.',
    href: '/tools/rent-check',
    category: 'tools',
  },

  // Apartment Search
  {
    title: 'FirstMover',
    description: 'Instant push notifications when new StreetEasy listings match your search. Be the first to respond.',
    href: 'https://apps.apple.com/us/app/firstmover/id6740444528',
    external: true,
    category: 'search',
  },
  {
    title: 'PadDaddy',
    description: 'Factors in hidden aspects of apartments — price per sqft, distance to parks, broker fee amortization — and gives an overall deal score.',
    href: 'https://paddaddy.com',
    external: true,
    category: 'search',
  },
  {
    title: 'Realer Estate',
    description: 'Analyzes StreetEasy listings to find undervalued apartments using comps. Scores deals on a grading scale.',
    href: 'https://realerestate.org',
    external: true,
    category: 'search',
  },
  {
    title: 'Unseen Apartments',
    description: 'Hire locals to tour and vet apartments for you. Great for remote apartment hunting — they handle photos, videos, and walkthroughs.',
    href: 'https://unseenapartments.io',
    external: true,
    category: 'search',
  },

  // Building & Landlord Research
  {
    title: 'OpenIgloo',
    description: 'Anonymous tenant reviews, rent-stabilized building map, violation history, bedbug data, and 311 complaints. The building background check.',
    href: 'https://www.openigloo.com',
    external: true,
    category: 'research',
  },
  {
    title: 'Who Owns What (JustFix)',
    description: 'Search by address or landlord name to see their full portfolio, HPD complaints, violations, and building history.',
    href: 'https://whoownswhat.justfix.org',
    external: true,
    category: 'research',
  },
  {
    title: 'HPD Online',
    description: 'Official NYC portal to look up building complaints, violations, and housing code issues by address.',
    href: 'https://hpdonline.nyc.gov/hpdonline/',
    external: true,
    category: 'research',
  },
  {
    title: 'Landlord Watchlist',
    description: 'The 100 worst landlords in NYC ranked by average violation count. Quick check before signing a lease.',
    href: 'https://www.landlordwatchlist.com',
    external: true,
    category: 'research',
  },

  // Guides & Checklists
  {
    title: 'NYC Apartment Hunting Checklist',
    description: 'Exhaustive checklist from r/AskNYC (313 upvotes) covering building checks, unit checks, location checks, bugs, water pressure, violations, and more.',
    href: 'https://www.reddit.com/r/AskNYC/comments/gvkya2/',
    external: true,
    category: 'guides',
  },
  {
    title: 'Ultimate NYC Renting 101',
    description: 'Comprehensive guide from r/AskNYC covering budget rules (40x rent), documents needed, timeline, broker fees, and the full rental process.',
    href: 'https://www.reddit.com/r/AskNYC/comments/bxgwx5/',
    external: true,
    category: 'guides',
  },
];

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tools', label: 'Our Tools' },
  { key: 'search', label: 'Apartment Search' },
  { key: 'research', label: 'Building Research' },
  { key: 'guides', label: 'Guides & Checklists' },
];

export default function ResourcesPage() {
  const [active, setActive] = useState<Category>('all');

  const filtered = active === 'all' ? resources : resources.filter(r => r.category === active);

  return (
    <div className="publication-section">
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '40px' }}>Resources</h1>
        <p className="section-subtitle" style={{ maxWidth: '500px', margin: '12px auto 0' }}>
          Tools, apps, and guides for navigating NYC&apos;s rental market
        </p>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={active === c.key ? 'filter-pill filter-pill-active' : 'filter-pill'}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="tools-grid">
        {filtered.map(r => {
          const inner = (
            <>
              <h3 className="tool-title">
                {r.title}
                {r.external && <span style={{ fontSize: '13px', opacity: 0.4, marginLeft: '6px' }}>↗</span>}
              </h3>
              <p className="tool-description">{r.description}</p>
            </>
          );

          return r.external ? (
            <a key={r.title} href={r.href} target="_blank" rel="noopener noreferrer" className="tool-card">
              {inner}
            </a>
          ) : (
            <Link key={r.title} href={r.href} className="tool-card">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
