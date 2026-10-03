import React from 'react';
import ProductCard from '../../../components/product/ProductCard';

/**
 * New Arrivals Section Component for Home Feature
 */
export function NewArrival({ products = [], onAddToCart, onQuickView }) {
  if (!products || products.length === 0) return null;

  return (
    <section style={{ margin: '48px 0' }}>
      <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '24px', color: 'var(--text-primary)' }}>New Arrivals</h2>
      <div className="product-grid">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </section>
  );
}

export default NewArrival;
