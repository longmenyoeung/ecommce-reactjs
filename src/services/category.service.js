import { fetchCategories } from './api';
import { apiRequest } from '../config/axios';
import { DEFAULT_CATEGORY_LIST } from '../utils/categoryHelper';

/**
 * Category Service layer mapping exact public customer endpoints
 */
export const categoryService = {
  // GET /api/categories
  getCategories: async () => {
    const cats = await fetchCategories();
    if (cats && cats.length > 0) return cats;
    return DEFAULT_CATEGORY_LIST;
  },

  // GET /api/categories/{id}
  getCategoryById: async (id) => {
    try {
      const data = await apiRequest(`/categories/${id}`, { method: 'GET' });
      if (data && (data.id || data.data)) return data.data || data;
    } catch (e) {
      console.warn(`Fallback for category ${id}:`, e.message);
    }
    const cats = await fetchCategories();
    return cats.find(c => String(c.id || c) === String(id)) || null;
  }
};

export default categoryService;
