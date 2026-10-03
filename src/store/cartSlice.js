/**
 * Cart Slice for state management
 */
export const cartSlice = {
  initialState: {
    items: [],
    isOpen: false,
    discountCode: null
  },
  actions: {
    addItem: (items, newItem) => {
      const existing = items.find(i => i.id === newItem.id);
      if (existing) {
        return items.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...items, { ...newItem, quantity: 1 }];
    },
    removeItem: (items, id) => items.filter(i => i.id !== id)
  }
};

export default cartSlice;
