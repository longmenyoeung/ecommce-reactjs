/**
 * Date formatting helper
 */
export function formatDate(dateString, locale = 'en-US') {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default formatDate;
