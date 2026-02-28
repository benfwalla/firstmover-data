'use client';

import { PriceTrendsChart } from './PriceTrendsChart';
import { NeighborhoodMap } from './NeighborhoodMap';

interface StatCard {
  label: string;
  value: string;
  color?: 'default' | 'green' | 'blue';
}

interface StatCardsProps {
  data: StatCard[];
}

export function StatCards({ data }: StatCardsProps) {
  return (
    <div className="report-stats">
      {data.map((stat, index) => (
        <div key={index} className="stat-card-report">
          <div className={`stat-number ${stat.color || ''}`}>
            {stat.value}
          </div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

interface DataTableColumn {
  header: string;
  key: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  caption?: string;
}

export function DataTable({ columns, data, caption }: DataTableProps) {
  const formatPrice = (n: number): string => {
    return '$' + Math.round(n).toLocaleString('en-US');
  };

  const formatNumber = (n: number | string): string => {
    return Math.round(typeof n === 'string' ? parseInt(n) : n).toLocaleString('en-US');
  };

  const formatPercent = (n: number): string => {
    const sign = n > 0 ? '+' : '';
    return `${sign}${n}%`;
  };

  return (
    <div style={{ margin: '32px 0' }}>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <DataAttribution text={caption} />
      )}
    </div>
  );
}

interface ListingCardProps {
  price: number;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  photo?: string;
  address?: string;
}

export function ListingCard({ 
  price, 
  neighborhood, 
  bedrooms, 
  bathrooms, 
  sqft,
  photo,
  address 
}: ListingCardProps) {
  const formatPrice = (n: number): string => {
    return '$' + Math.round(n).toLocaleString('en-US');
  };

  return (
    <div className="listing-card" style={{ margin: '16px 0' }}>
      {photo && (
        <div className="listing-card-photo">
          <img 
            src={photo} 
            alt={`Apartment in ${neighborhood}`}
            loading="lazy" 
          />
        </div>
      )}
      <div className="listing-card-body">
        <div className="listing-price">
          {formatPrice(price)}
          <span className="listing-price-mo">/mo</span>
        </div>
        <div className="listing-neighborhood">
          {neighborhood}
        </div>
        {address && (
          <div className="listing-address">{address}</div>
        )}
        <div className="listing-meta">
          <span>{bedrooms} bed{bedrooms !== 1 ? 's' : ''}</span>
          <span className="listing-meta-dot">•</span>
          <span>{bathrooms} bath{bathrooms !== 1 ? 's' : ''}</span>
          {sqft && (
            <>
              <span className="listing-meta-dot">•</span>
              <span>{sqft.toLocaleString()} sqft</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface DataAttributionProps {
  text?: string;
}

export function DataAttribution({ text = "Data from FirstMover" }: DataAttributionProps) {
  return (
    <div style={{
      fontSize: '12px',
      color: '#888',
      textAlign: 'right' as const,
      marginTop: '8px'
    }}>
      {text}
    </div>
  );
}

// Re-export existing components for MDX use
export { PriceTrendsChart, NeighborhoodMap };

// Default MDX components mapping
export const mdxComponents = {
  StatCards,
  DataTable,
  ListingCard,
  DataAttribution,
  PriceTrendsChart,
  NeighborhoodMap,
  // Override default markdown elements with custom styling
  h1: ({ children, ...props }: any) => (
    <h1 className="report-title" style={{ fontSize: '40px', marginBottom: '16px' }} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 style={{ 
      fontFamily: 'var(--font-heading)', 
      fontSize: '28px', 
      fontWeight: '600', 
      marginBottom: '16px',
      marginTop: '48px',
      color: 'var(--text)' 
    }} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 style={{ 
      fontFamily: 'var(--font-heading)', 
      fontSize: '20px', 
      fontWeight: '600', 
      marginBottom: '16px',
      marginTop: '32px',
      color: 'var(--text)' 
    }} {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: any) => (
    <p style={{ 
      fontSize: '18px', 
      lineHeight: '1.7', 
      marginBottom: '24px',
      maxWidth: '700px'
    }} {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul style={{ 
      fontSize: '18px', 
      lineHeight: '1.6', 
      paddingLeft: '20px',
      marginBottom: '24px',
      maxWidth: '700px'
    }} {...props}>
      {children}
    </ul>
  ),
  blockquote: ({ children, ...props }: any) => (
    <div style={{
      background: 'rgba(0, 166, 126, 0.03)', 
      border: '1px solid rgba(0, 166, 126, 0.1)',
      borderRadius: '16px', 
      padding: '32px', 
      margin: '32px 0'
    }} {...props}>
      {children}
    </div>
  )
};