import { useState, useEffect } from 'react';
import { productService } from '../../../services/product.service';

/**
 * Custom Hook for loading product details or lists in the product feature
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getAllProducts().then(data => {
      setProducts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return { products, loading };
}

export default useProducts;
