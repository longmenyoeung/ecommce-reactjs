import { apiRequest } from '../config/axios';

/**
 * Shipment Tracking Service layer mapping real backend tracking endpoints
 */
export const shipmentService = {
  // GET /api/orders/track/{tracking} or /api/shipments/{tracking}
  trackShipment: async (trackingCode) => {
    if (!trackingCode) return null;
    const cleanCode = String(trackingCode).trim();

    try {
      // 1. Try public real-time order & shipment tracking endpoint
      const res = await apiRequest(`/orders/track/${encodeURIComponent(cleanCode)}`, { method: 'GET' });
      if (res && (res.id || res.order_id)) {
        return res.data || res;
      }
    } catch (e) {
      console.warn("API track shipment warning:", e.message);
    }

    try {
      // 2. Try legacy shipment endpoint if token is available
      if (localStorage.getItem('auth_token')) {
        const res = await apiRequest(`/shipments/${encodeURIComponent(cleanCode)}`, { method: 'GET' });
        if (res && res.id) return res.data || res;
      }
    } catch {
      // silent
    }

    return null;
  }
};

export default shipmentService;
