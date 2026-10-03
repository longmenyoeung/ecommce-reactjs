/**
 * Frontend Category Helper for normalizing category names, mapping IDs,
 * and providing a comprehensive category list for filtering across the e-commerce app.
 */

export const FRONTEND_CATEGORIES_MAP = {
  1: 'Electronics',
  2: 'Accessories',
  3: 'Books & Media',
  4: 'Drinks & Beverages',
  5: 'Clothing & Apparel',
  6: 'Home & Kitchen',
  7: 'Beauty & Health',
  8: 'Sports & Outdoors',
  9: 'Toys & Games',
  10: 'Automotive & Tools',
  11: 'Computers & Laptops',
  12: 'Smartphones & Tablets'
};

export const DEFAULT_CATEGORY_LIST = [
  'All'
];

/**
 * Normalizes a category string or maps a category_id from the product object
 * @param {Object} product - Product object containing category_id and/or category_name
 * @returns {string} Clean, readable category name
 */
export function getCategoryName(product) {
  if (!product) return 'General';

  // Check category string, category object, or category_name from backend API
  const cat =
    (typeof product.category === 'string' && product.category.trim() !== '' ? product.category.trim() : null) ||
    (product.category && typeof product.category === 'object' && product.category.name ? product.category.name.trim() : null) ||
    (typeof product.category_name === 'string' && product.category_name.trim() !== '' ? product.category_name.trim() : null) ||
    (typeof product === 'string' ? product : null);

  if (cat && typeof cat === 'string' && cat.trim() !== '') {
    return cat.trim();
  }

  // Fallback to category_id map if category wasn't eager loaded
  if (product.category_id && FRONTEND_CATEGORIES_MAP[product.category_id]) {
    return FRONTEND_CATEGORIES_MAP[product.category_id];
  }

  return product.category_id ? `Category #${product.category_id}` : 'General';
}
