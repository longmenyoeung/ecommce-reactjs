import { authService } from '../services/auth.service';

/**
 * Authentication Slice for store management
 */
export const authSlice = {
  initialState: {
    user: authService.getCurrentUser(),
    token: authService.getToken(),
    loading: false
  },
  actions: {
    setUser: (user) => {
      localStorage.setItem('auth_user', JSON.stringify(user));
    },
    logout: () => {
      authService.logout();
    }
  }
};

export default authSlice;
