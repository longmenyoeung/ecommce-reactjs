import React from 'react';
import { formatPrice } from '../../../utils/formatPrice';

/**
 * Product Info Component for Product Feature
 */
export function ProductInfo({ product }) {
  if (!product) return null;

  return (
    <div>
      <span style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
        {product.category || 'Premium Essential'}
      </span>
      <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '6px 0 14px', color: 'var(--text-primary)' }}>
        {product.name}
      </h2>
      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-primary)', fontFamily: 'Outfit', marginBottom: '16px' }}>
        {formatPrice(product.price)}
      </div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.94rem' }}>
        {product.description || 'Constructed with precision fabrics and ergonomic design for all-day modern comfort.'}
      </p>
    </div>
  );
}

export default ProductInfo;
