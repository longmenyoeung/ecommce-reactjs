import { useState } from 'react';
import { orderService } from '../../../services/order.service';

/**
 * Custom Hook for managing checkout flow and submission
 */
export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const placeOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      return await orderService.createOrder(orderData);
    } catch (err) {
      setError(err.message || 'Failed to place order.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { placeOrder, loading, error };
}

export default useCheckout;
