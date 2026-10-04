/**
 * Environment & API Configuration Constants
 */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  // KHQR / Bakong merchant identity used by the scan-to-pay checkout.
  // VITE_KHQR_ACCOUNT must be a real, registered Bakong account ID
  // (e.g. "yourstore@aba") - banking apps reject QRs for unknown accounts.
  KHQR_ACCOUNT: import.meta.env.VITE_KHQR_ACCOUNT || 'men_itc_store@aba',
  KHQR_MERCHANT_NAME: import.meta.env.VITE_KHQR_MERCHANT_NAME || 'MEN ITC STORE',
  KHQR_MERCHANT_CITY: import.meta.env.VITE_KHQR_MERCHANT_CITY || 'Phnom Penh',
  APP_NAME: 'Men ITC Store • Premium Essentials',
  APP_VERSION: '2.0.0-2026',
  IS_PRODUCTION: import.meta.env.PROD || false,
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_LOCALE: 'en-US'
};

export default ENV;
