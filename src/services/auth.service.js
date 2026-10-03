import { apiRequest } from '../config/axios';
import { loginUser, registerUser, loginWithGoogle, sendResetOtp, resetPasswordWithOtp } from './api';

/**
 * Authentication Service layer supporting Laravel Sanctum endpoints
 */
export const authService = {
  login: async (email, password) => {
    try {
      // Call Laravel Backend /api/auth/login
      const data = await loginUser(email, password);
      const token = data.token || data.access_token || data.data?.token || data.data?.access_token;
      if (data && (data.user || data.data?.user)) {
        localStorage.setItem('auth_user', JSON.stringify(data.user || data.data?.user));
      }
      if (token) localStorage.setItem('auth_token', token);
      return data;
    } catch (error) {
      throw error;
    }
  },

  loginWithGoogle: async (payload) => {
    try {
      const data = await loginWithGoogle(payload);
      const token = data.token || data.access_token;
      if (data && data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }
      if (token) localStorage.setItem('auth_token', token);
      return data;
    } catch (error) {
      throw error;
    }
  },

  sendResetOtp: async (email) => {
    return await sendResetOtp(email);
  },

  resetPassword: async (email, otp, password, passwordConfirmation) => {
    return await resetPasswordWithOtp(email, otp, password, passwordConfirmation);
  },

  register: async (name, email, password) => {
    try {
      // Call Laravel Backend /api/auth/register
      const data = await registerUser(name, email, password);
      const token = data.token || data.access_token || data.data?.token || data.data?.access_token;
      if (data && (data.user || data.data?.user)) {
        localStorage.setItem('auth_user', JSON.stringify(data.user || data.data?.user));
      }
      if (token) localStorage.setItem('auth_token', token);
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }
  },

  getUserProfile: async () => {
    try {
      const data = await apiRequest('/user', { method: 'GET' });
      if (data && (data.id || data.email)) {
        localStorage.setItem('auth_user', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn("Using cached profile:", e.message);
    }
    return authService.getCurrentUser();
  },

  getUsers: async () => {
    return await apiRequest('/auth/users', { method: 'GET' });
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('auth_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  getToken: () => localStorage.getItem('auth_token')
};

export default authService;
