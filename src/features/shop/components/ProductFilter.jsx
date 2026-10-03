import React from 'react';
import Categories from '../../home/components/Categories';

/**
 * Product Filter Bar for Shop Feature
 */
export function ProductFilter({ categories, activeCategory, onSelectCategory }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <Categories categories={categories} activeCategory={activeCategory} onSelectCategory={onSelectCategory} />
    </div>
  );
}

export default ProductFilter;
