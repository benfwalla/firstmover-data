'use client';

import { useState } from 'react';
import Link from 'next/link';

export function FixedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed-navbar">
      <div className="container">
        <div className="nav-container">
          <Link href="/" className="nav-logo-link">
            <img src="/logo-full.svg" alt="FirstMover" className="nav-logo nav-logo-full" />
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links">
            <Link href="/open-data" className="nav-link">
              Open Data
            </Link>
            <Link href="/reports" className="nav-link">
              Reports
            </Link>
            <Link href="/resources" className="nav-link">
              Resources
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="nav-mobile-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="nav-mobile-menu">
          <Link href="/open-data" className="nav-mobile-link" onClick={() => setIsMenuOpen(false)}>
            Open Data
          </Link>
          <Link href="/reports" className="nav-mobile-link" onClick={() => setIsMenuOpen(false)}>
            Reports
          </Link>
          <Link href="/resources" className="nav-mobile-link" onClick={() => setIsMenuOpen(false)}>
            Resources
          </Link>
        </div>
      )}
    </nav>
  );
}
