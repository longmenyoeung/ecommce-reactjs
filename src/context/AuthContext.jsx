import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isAuthenticated = Boolean(user && token);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    if (userData) {
      localStorage.setItem('auth_user', JSON.stringify(userData));
    }
    if (authToken) {
      localStorage.setItem('auth_token', authToken);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout network error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }
  }, []);

  // Sync session on mount
  useEffect(() => {
    if (token && !user) {
      authService.getUserProfile()
        .then((profile) => {
          if (profile) setUser(profile);
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
        });
    }

    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:expired', handleSessionExpired);
    return () => window.removeEventListener('auth:expired', handleSessionExpired);
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        authModalOpen,
        setAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
