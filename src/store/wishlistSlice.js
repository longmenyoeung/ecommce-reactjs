/**
 * Wishlist Slice for state management
 */
export const wishlistSlice = {
  initialState: {
    items: []
  },
  actions: {
    toggleWishlist: (items, product) => {
      const exists = items.some(i => i.id === product.id);
      if (exists) return items.filter(i => i.id !== product.id);
      return [...items, product];
    }
  }
};

export default wishlistSlice;
