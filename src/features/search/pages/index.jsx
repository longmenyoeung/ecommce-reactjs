import React from 'react';
import ProductGrid from '../../shop/components/ProductGrid';
import SearchBar from '../../../components/common/SearchBar';

/**
 * Search Page Feature Component
 */
export function SearchPage({ searchTerm, setSearchTerm, results = [], onAddToCart, onQuickView }) {
  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '16px' }}>Search Catalog</h1>
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search across all categories..." />
      </div>
      <ProductGrid products={results} onAddToCart={onAddToCart} onQuickView={onQuickView} />
    </div>
  );
}

export default SearchPage;
