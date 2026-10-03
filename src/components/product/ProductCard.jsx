import React from 'react';
import CoreProductCard from '../../ProductCard';

/**
 * ProductCard Re-export / Layer wrapper
 */
export function ProductCard(props) {
  return <CoreProductCard {...props} />;
}

export default ProductCard;
