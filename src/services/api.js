import { ENV } from '../config/env';

const API_URL = `${ENV.API_BASE_URL}/products`;
const BEST_SELLERS_API_URL = `${ENV.API_BASE_URL}/products/best-sellers`;
const CATEGORIES_API_URL = `${ENV.API_BASE_URL}/categories`;
const LOGIN_API_URL = `${ENV.API_BASE_URL}/auth/login`;
const REGISTER_API_URL = `${ENV.API_BASE_URL}/auth/register`;

/**
 * Fetch top 10 best sellers leaderboard from Laravel backend API (grouped order_items)
 * @returns {Promise<Array>} List of best sellers with rank, sold count, revenue
 */
export async function fetchBestSellers() {
  try {
    const response = await fetch(BEST_SELLERS_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (Array.isArray(result)) return result;
      if (result && Array.isArray(result.data)) return result.data;
      if (result && Array.isArray(result.best_sellers)) return result.best_sellers;
    }
  } catch (error) {
    console.warn("Could not fetch best sellers from API:", error);
  }
  return [];
}

/**
 * Fetch products from the Laravel backend API
 * @returns {Promise<Array>} List of products
 */
export async function fetchProducts() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Safely extract paginated or wrapped array from API response
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.data)) {
      return Array.isArray(result.data.data) ? result.data.data : result.data;
    }
    if (result && Array.isArray(result.products)) return result.products;
    
    return [];
  } catch (error) {
    console.error("Error fetching products from API:", error);
    throw error;
  }
}

/**
 * Fetch a single product by ID from the Laravel backend API
 * @param {string|number} id
 * @returns {Promise<Object>}
 */
export async function fetchProductById(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error(`Error fetching product #${id} from API:`, error);
    throw error;
  }
}

/**
 * Fetch categories from the Laravel backend API, with fallback to local category list
 * @returns {Promise<Array>} List of categories
 */
export async function fetchCategories() {
  try {
    const response = await fetch(CATEGORIES_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (Array.isArray(result)) return result;
      if (result && Array.isArray(result.data)) {
        return Array.isArray(result.data.data) ? result.data.data : result.data;
      }
      if (result && Array.isArray(result.categories)) return result.categories;
    }
  } catch (error) {
    console.warn("Could not fetch categories from API (using frontend categories):", error);
  }
  
  return [];
}

/**
 * Login user via Laravel backend API
 * @param {string} email 
 * @param {string} password 
 */
export async function loginUser(email, password) {
  const response = await fetch(LOGIN_API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Login failed. Please check your credentials.'));
  }

  return data;
}

/**
 * Register user via Laravel backend API
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 */
export async function registerUser(name, email, password) {
  const response = await fetch(REGISTER_API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await response.json();
  if (!response.ok || (data.success === false)) {
    throw new Error(data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Registration failed.'));
  }

  return data;
}

