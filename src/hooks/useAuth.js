import { useState } from 'react';
import { authService } from '../services/auth.service';

/**
 * Custom Hook for tracking current authentication status and user details
 */
export function useAuth() {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('auth_token', data.token);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return { user, setUser, login, logout, loading, isAuthenticated: !!user };
}

export default useAuth;
