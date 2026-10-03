import React from 'react';
import ProductCard from '../../../components/product/ProductCard';

/**
 * Related Products Component for Product Feature
 */
export function RelatedProducts({ products = [], onAddToCart, onQuickView }) {
  if (!products || products.length === 0) return null;

  return (
    <div style={{ marginTop: '40px' }}>
      <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px', color: 'var(--text-primary)' }}>You May Also Like</h3>
      <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {products.slice(0, 4).map((item) => (
          <ProductCard key={item.id} product={item} onAddToCart={onAddToCart} onQuickView={onQuickView} />
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
