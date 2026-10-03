import React from 'react';
import ProductCard from '../../../components/product/ProductCard';
import Empty from '../../../components/common/Empty';

/**
 * Reusable Product Grid Component for Shop Feature
 */
export function ProductGrid({ products = [], onAddToCart, onQuickView }) {
  if (!products || products.length === 0) {
    return <Empty title="No Products Available" description="We could not find any products in this category matching your selection." />;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
