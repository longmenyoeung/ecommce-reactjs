import React from 'react';
import { FireIcon } from '@heroicons/react/24/outline';
import ProductCard from '../../../components/product/ProductCard';

/**
 * Flash Sale Section Component for Home Feature
 */
export function FlashSale({ products = [], onAddToCart, onQuickView }) {
  if (!products || products.length === 0) return null;

  return (
    <section style={{ margin: '48px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FireIcon style={{ width: '22px', height: '22px' }} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Flash Sale Deals</h2>
      </div>
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

export default FlashSale;
