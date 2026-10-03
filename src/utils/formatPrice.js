/**
 * Price formatting helper
 */
export function formatPrice(amount, currency = '$') {
  const num = parseFloat(amount || 0);
  return `${currency}${num.toFixed(2)}`;
}

export default formatPrice;
