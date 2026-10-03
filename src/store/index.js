import { authSlice } from './authSlice';
import { cartSlice } from './cartSlice';
import { wishlistSlice } from './wishlistSlice';
import { userSlice } from './userSlice';

/**
 * Global Store / Application State management registry
 */
export const store = {
  auth: authSlice,
  cart: cartSlice,
  wishlist: wishlistSlice,
  user: userSlice
};

export default store;
