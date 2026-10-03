import { apiRequest } from '../config/axios';

/**
 * Cart Service layer mapping exact protected Cart endpoints with localStorage fallback & sync
 */
export const cartService = {
  // GET /api/cart
  getCart: async () => {
    try {
      if (localStorage.getItem('auth_token')) {
        const res = await apiRequest('/cart', { method: 'GET' });
        // Laravel returns: { message, cart: { id, items: [{ id, product_id, quantity, price, product }] }, total }
        const rawItems = Array.isArray(res)
          ? res
          : (res?.cart?.items || res?.items || res?.data);
        if (Array.isArray(rawItems)) {
          const items = rawItems.map(it => ({
            ...(it.product || {}),
            id: it.product_id ?? it.product?.id ?? it.id,
            cart_item_id: it.id,
            quantity: it.quantity ?? 1,
            price: Number(it.price ?? it.product?.price ?? 0),
          }));
          localStorage.setItem('cart_items', JSON.stringify(items));
          return items;
        }
      }
    } catch (e) {
      console.warn("Using local cart cache:", e.message);
    }
    try {
      const stored = localStorage.getItem('cart_items');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  // POST /api/cart
  addToCart: async (product, quantity = 1) => {
    try {
      if (localStorage.getItem('auth_token')) {
        const itemPrice = parseFloat(product.price || 0);
        await apiRequest('/cart', {
          method: 'POST',
          body: JSON.stringify({ 
            product_id: product.id, 
            quantity: quantity,
            price: itemPrice
          })
        }).catch(err => console.warn("API add cart warning:", err.message));
      }
    } finally {
      const items = cartService.getLocalCart();
      const existingIndex = items.findIndex(i => String(i.id) === String(product.id));
      if (existingIndex > -1) {
        items[existingIndex].quantity += quantity;
      } else {
        items.push({ ...product, quantity });
      }
      cartService.saveCart(items);
      return items;
    }
  },

  // PUT /api/cart/{id}
  updateCartItem: async (productId, quantity) => {
    try {
      if (localStorage.getItem('auth_token')) {
        const items = cartService.getLocalCart();
        const existing = items.find(i => String(i.id) === String(productId));
        const itemPrice = parseFloat(existing?.price || 0);
        await apiRequest(`/cart/${productId}`, {
          method: 'PUT',
          body: JSON.stringify({ quantity, price: itemPrice })
        }).catch(() => {});
      }
    } finally {
      const items = cartService.getLocalCart();
      const updated = items.map(i => String(i.id) === String(productId) ? { ...i, quantity: Math.max(1, quantity) } : i);
      cartService.saveCart(updated);
      return updated;
    }
  },

  // DELETE /api/cart/{id}
  removeFromCart: async (productId) => {
    try {
      if (localStorage.getItem('auth_token')) {
        await apiRequest(`/cart/${productId}`, { method: 'DELETE' }).catch(() => {});
      }
    } finally {
      const items = cartService.getLocalCart().filter(i => String(i.id) !== String(productId));
      cartService.saveCart(items);
      return items;
    }
  },

  // DELETE /api/cart
  clearCart: async () => {
    try {
      if (localStorage.getItem('auth_token')) {
        await apiRequest('/cart', { method: 'DELETE' }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('cart_items');
      return [];
    }
  },

  getLocalCart: () => {
    try {
      const stored = localStorage.getItem('cart_items');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  saveCart: (items) => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }
};

export default cartService;
