import { create } from 'zustand';
import { authApi, type UserProfile } from './api';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  clearAuth: () => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: UserProfile, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cyberforce_access_token', token);
      localStorage.setItem('cyberforce_user', JSON.stringify(user));
    }
    set({
      user,
      accessToken: token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cyberforce_access_token');
      localStorage.removeItem('cyberforce_user');
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initialize: async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('cyberforce_access_token');
    const cachedUser = localStorage.getItem('cyberforce_user');

    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      if (cachedUser) {
        set({
          user: JSON.parse(cachedUser),
          accessToken: token,
          isAuthenticated: true,
        });
      }

      // Validate token with /me endpoint
      const res = await authApi.getMe(token);
      set({
        user: res.data,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem('cyberforce_user', JSON.stringify(res.data));
    } catch {
      get().clearAuth();
    }
  },

  logout: async () => {
    const token = get().accessToken;
    try {
      if (token) {
        await authApi.logout(token);
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      get().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },
}));
