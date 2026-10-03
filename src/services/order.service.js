import { apiRequest } from '../config/axios';

/**
 * Order & Checkout Service layer mapping exact protected order endpoints
 */
export const orderService = {
  // POST /api/checkout
  createOrder: async (checkoutData) => {
    const defaultAddress = '450 VIP Commerce Way, Suite 800, New York, NY 10001';
    const formattedItems = (checkoutData.items || []).map(item => ({
      product_id: item.id || item.product_id,
      quantity: item.quantity || 1,
      price: parseFloat(item.price || 0)
    }));

    let pm = (checkoutData.payment_method || 'card').toLowerCase();
    if (pm.includes('card')) pm = 'card';
    else if (pm.includes('cod') || pm.includes('cash')) pm = 'cod';
    else if (pm.includes('qr')) pm = 'qr';
    else if (pm.includes('bank')) pm = 'bank';
    else pm = 'card';

    const enrichedPayload = {
      ...checkoutData,
      shipping_address: checkoutData.shipping_address || checkoutData.address || defaultAddress,
      address: checkoutData.shipping_address || checkoutData.address || defaultAddress,
      payment_method: pm,
      phone: checkoutData.phone || '1-800-555-0199',
      total: parseFloat(checkoutData.total || 0),
      total_amount: parseFloat(checkoutData.total || 0),
      items: formattedItems,
      cart_items: formattedItems
    };

    try {
      if (localStorage.getItem('auth_token')) {
        // Sync items with backend database cart first so CheckoutController finds them
        if (formattedItems.length > 0) {
          for (const item of formattedItems) {
            if (typeof item.product_id === 'number' || (typeof item.product_id === 'string' && /^\d+$/.test(item.product_id))) {
              await apiRequest('/cart', {
                method: 'POST',
                body: JSON.stringify({
                  product_id: Number(item.product_id),
                  quantity: item.quantity || 1
                })
              }).catch(() => {});
            }
          }
        }

        const res = await apiRequest('/checkout', {
          method: 'POST',
          body: JSON.stringify(enrichedPayload)
        });
        // Laravel answers { message, order, summary }; flatten so the UI can
        // read createdOrder.id / .status / .total directly.
        if (res && res.order) {
          return {
            ...res.order,
            summary: res.summary,
            date: res.order.created_at || new Date().toISOString(),
            items: formattedItems
          };
        }
        return res;
      }
    } catch (e) {
      console.warn("API checkout warning:", e.message);
      if (e.message && e.message.includes('required')) {
        throw e;
      }
    }
    // Fallback simulation for local development
    const newOrder = {
      id: Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString(),
      status: 'Processing',
      total: enrichedPayload.total || 149.99,
      items: enrichedPayload.items || [],
      shipping_address: enrichedPayload.shipping_address
    };
    const orders = orderService.getLocalOrders();
    orders.unshift(newOrder);
    localStorage.setItem('customer_orders', JSON.stringify(orders));
    return newOrder;
  },

  // GET /api/orders
  getOrderHistory: async () => {
    try {
      if (localStorage.getItem('auth_token')) {
        const res = await apiRequest('/orders', { method: 'GET' });
        const raw = res?.data ?? res;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        if (list.length > 0) {
          const orders = orderService.normalizeOrders(list);
          localStorage.setItem('customer_orders', JSON.stringify(orders));
          return orders;
        }
      }
    } catch (e) {
      console.warn("Using local orders history:", e.message);
    }
    return orderService.getLocalOrders();
  },

  // Alias for getOrderHistory
  getOrders: async () => orderService.getOrderHistory(),

  // GET /api/orders/{id} or /api/orders/track/{id}
  getOrderById: async (id) => {
    if (!id) return null;
    const cleanId = String(id).trim();

    try {
      // 1. Try public real-time order tracking
      const trackRes = await apiRequest(`/orders/track/${encodeURIComponent(cleanId)}`, { method: 'GET' }).catch(() => null);
      if (trackRes && (trackRes.id || trackRes.order_id)) {
        const payload = trackRes.data || trackRes;
        return {
          id: payload.id || payload.order_id,
          order_id: payload.order_id || payload.id,
          status: payload.status || 'Processing',
          status_raw: payload.status_raw || (payload.status || 'processing').toLowerCase(),
          carrier: payload.carrier || 'FedEx Priority Express',
          tracking_number: payload.tracking_number || `FX-${payload.id || payload.order_id}`,
          date: payload.date || (payload.created_at ? String(payload.created_at).substring(0, 10) : new Date().toISOString().substring(0, 10)),
          estimated_delivery: payload.estimated_delivery || 'Estimated in 2 days',
          payment_method: payload.payment_method || 'CARD',
          total: Number(payload.total || 0),
          shipping_address: payload.shipping_address || 'Customer Delivery Address',
          checkpoints: payload.checkpoints || [],
          items: payload.items || []
        };
      }

      // 2. Try customer order details endpoint
      if (localStorage.getItem('auth_token')) {
        const res = await apiRequest(`/orders/${cleanId}`, { method: 'GET' }).catch(() => null);
        if (res) {
          const rawOrder = res.data || res;
          if (rawOrder && rawOrder.id) {
            return orderService.normalizeOrders([rawOrder])[0];
          }
        }
      }
    } catch (e) {
      console.warn("API get order warning:", e.message);
    }

    const orders = orderService.getLocalOrders();
    return orders.find(o => String(o.id) === String(cleanId)) || null;
  },

  // Alias for getOrderById
  getOrder: async (id) => orderService.getOrderById(id),

  // PUT /api/orders/{id}/cancel
  cancelOrder: async (id) => {
    const ordersList = orderService.getLocalOrders();
    const existing = ordersList.find(o => String(o.id) === String(id));
    if (existing) {
      const statusLower = (existing.status || '').toLowerCase();
      if (['completed', 'delivered', 'shipped', 'in transit'].includes(statusLower)) {
        console.warn(`[Order Service] Cannot cancel order #${id} because its status is ${existing.status}`);
        return null;
      }
    }
    try {
      if (localStorage.getItem('auth_token')) {
        await apiRequest(`/orders/${id}/cancel`, { method: 'PUT' });
      }
    } catch (e) {
      console.warn("API cancel order warning:", e.message);
    }
    const orders = ordersList.map(o => String(o.id) === String(id) ? { ...o, status: 'Cancelled' } : o);
    localStorage.setItem('customer_orders', JSON.stringify(orders));
    return orders.find(o => String(o.id) === String(id));
  },

  // Normalise Laravel order rows (created_at / lowercase status) into the
  // shape the storefront renders (date / Capitalised status / numeric total).
  normalizeOrders: (list) => (Array.isArray(list) ? list : []).map(o => {
    const shipment = o.shipment || {};
    return {
      ...o,
      date: o.date || (o.created_at ? String(o.created_at).substring(0, 10) : ''),
      status: o.status ? String(o.status).charAt(0).toUpperCase() + String(o.status).slice(1) : 'Pending',
      status_raw: String(o.status || 'pending').toLowerCase(),
      carrier: shipment.carrier || o.carrier || 'FedEx Priority Express',
      tracking_number: shipment.tracking_number || o.tracking_number || `FX-${o.id}`,
      total: Number(o.total || o.total_amount || 0)
    };
  }),

  getLocalOrders: () => {
    try {
      const stored = localStorage.getItem('customer_orders');
      return stored ? JSON.parse(stored) : [
        { id: '10245', date: '2026-07-02', status: 'Delivered', total: 249.50, items: [{ name: 'Executive Ultralight Watch', quantity: 1 }] },
        { id: '10190', date: '2026-06-18', status: 'Delivered', total: 129.00, items: [{ name: 'AeroFlex Titanium Sunglasses', quantity: 1 }] }
      ];
    } catch (e) {
      return [];
    }
  }
};

export default orderService;
