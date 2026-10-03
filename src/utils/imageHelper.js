const BACKEND_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Resolves the full URL for a product image from Laravel storage/public
 * @param {string} imagePath - The image path from API (e.g. "products/filename.png")
 * @returns {string} Full accessible URL
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return null;

  // If already an absolute HTTP/HTTPS URL, Base64 data URI, or blob URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
    return imagePath;
  }

  // Clean leading slash if present
  const cleanPath = imagePath.replace(/^\/+/, '');

  // In Laravel, uploaded images stored in public disk are typically served via /storage/
  // We first attempt /storage/ path, and we will handle fallback in UI if needed
  if (cleanPath.startsWith('storage/')) {
    return `${BACKEND_BASE_URL}/${cleanPath}`;
  }

  return `${BACKEND_BASE_URL}/storage/${cleanPath}`;
}

/**
 * Fallback URL generator if /storage/ path fails
 * @param {string} imagePath 
 * @returns {string}
 */
export function getFallbackImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${BACKEND_BASE_URL}/${cleanPath}`;
}
