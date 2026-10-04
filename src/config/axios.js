import { ENV } from './env';

/**
 * Custom fetch/axios helper wrapper for Laravel API communication
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${ENV.API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new CustomEvent('auth:expired', { detail: { message: data.message || 'Session expired. Please sign in again.' } }));
      }

      let errorMsg = data.message;
      if (data.errors && typeof data.errors === 'object') {
        const firstErrorKey = Object.keys(data.errors)[0];
        if (firstErrorKey && Array.isArray(data.errors[firstErrorKey])) {
          errorMsg = data.errors[firstErrorKey][0];
        }
      }

      const error = new Error(errorMsg || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      error.errors = data.errors || null;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status !== 401) {
      console.error(`[API Error] ${endpoint}:`, error.message || error);
    }
    throw error;
  }
}

export default apiRequest;
