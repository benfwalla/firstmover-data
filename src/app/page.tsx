import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="home-hero">
      <div className="container">
        <div className="home-grid">
          {/* Left column */}
          <div className="home-intro">
            <h1 className="publication-title">The FirstMover Open Data Project</h1>
            <p className="home-description">
              We collect NYC rental listings every month and publish the raw data here for anyone to use.
              Renters, analysts, journalists, curious people. The market is moving fast and there aren&rsquo;t
              many places to get this kind of data for free.
            </p>
            <div className="home-links">
              <Link href="/about" className="home-about-link">About</Link>
              <a href="https://github.com/benfwalla/firstmover-open-data-project" target="_blank" rel="noopener noreferrer" className="home-about-link">GitHub</a>
            </div>
          </div>

          {/* Right column */}
          <div className="home-nav-cards">
            <Link href="/open-data" className="tool-card">
              <h3 className="tool-title">Open Data</h3>
              <p className="tool-description">
                Monthly listing CSVs and a rent stabilized buildings database.
              </p>
            </Link>

            <Link href="/reports" className="tool-card">
              <h3 className="tool-title">Reports</h3>
              <p className="tool-description">
                Monthly rent reports breaking down what&rsquo;s happening across NYC neighborhoods.
              </p>
            </Link>

            <Link href="/resources" className="tool-card">
              <h3 className="tool-title">Resources</h3>
              <p className="tool-description">
                Interactive tools and games to explore NYC&rsquo;s rental market.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
