import React from 'react';
import ProductGrid from '../../shop/components/ProductGrid';
import Empty from '../../../components/common/Empty';

/**
 * Wishlist Page Component
 */
export function Wishlist({ wishlist = [], onAddToCart, onQuickView }) {
  if (!wishlist || wishlist.length === 0) {
    return <Empty title="Your Wishlist is Empty" description="Save items you love to your wishlist to easily find them later." />;
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '24px' }}>Saved Wishlist Items ({wishlist.length})</h1>
      <ProductGrid products={wishlist} onAddToCart={onAddToCart} onQuickView={onQuickView} />
    </div>
  );
}

export default Wishlist;
