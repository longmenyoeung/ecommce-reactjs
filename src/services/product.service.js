import { fetchProducts } from './api';
import { apiRequest } from '../config/axios';

/**
 * Product Service layer mapping exact public customer endpoints
 */
export const productService = {
  // GET /api/products
  getAllProducts: async () => {
    return await fetchProducts();
  },

  // GET /api/products/{id}
  getProductById: async (id) => {
    try {
      const data = await apiRequest(`/products/${id}`, { method: 'GET' });
      if (data && (data.id || data.data)) return data.data || data;
    } catch (e) {
      console.warn(`Fallback to local product list for ID ${id}:`, e.message);
    }
    const products = await fetchProducts();
    return products.find(p => String(p.id) === String(id)) || null;
  }
};

export default productService;
