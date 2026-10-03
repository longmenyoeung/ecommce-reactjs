/**
 * Environment & API Configuration Constants
 */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  APP_NAME: 'Men ITC Store • Premium Essentials',
  APP_VERSION: '2.0.0-2026',
  IS_PRODUCTION: import.meta.env.PROD || false,
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_LOCALE: 'en-US'
};

export default ENV;
