import { create } from 'zustand';
import { ApiError, authApi, refreshSession, type UserProfile } from './api';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionVersion: number;
  initializationError: string | null;
  setAuth: (user: UserProfile, token: string) => void;
  clearAuth: () => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

let initialization: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  sessionVersion: 0,
  initializationError: null,

  setAuth: (user: UserProfile, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cyberforce_access_token', token);
      localStorage.setItem('cyberforce_user', JSON.stringify(user));
    }
    set({
      user,
      accessToken: token,
      sessionVersion: get().sessionVersion + 1,
      isAuthenticated: true,
      isLoading: false,
      initializationError: null,
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
      sessionVersion: get().sessionVersion + 1,
      isAuthenticated: false,
      isLoading: false,
      initializationError: null,
    });
  },

  initialize: async () => {
    if (typeof window === 'undefined' || (!get().isLoading && !get().initializationError)) return;
    if (initialization) return initialization;
    initialization = (async () => {
      set({ isLoading: true, initializationError: null });
      const token = localStorage.getItem('cyberforce_access_token');
      set({ accessToken: token });
      const version = get().sessionVersion;
      try {
        if (!token) {
          await refreshSession();
        } else {
          const res = await authApi.getMe(token);
          const currentToken = get().accessToken;
          if (currentToken && get().sessionVersion === version)
            get().setAuth(res.data, currentToken);
        }
      } catch (error) {
        if (get().sessionVersion !== version) return;
        if (error instanceof ApiError && error.code === 'SESSION_CHANGED') return;
        if (error instanceof ApiError && error.statusCode === 401) {
          get().clearAuth();
        } else {
          set({
            isLoading: false,
            initializationError: 'Không thể kiểm tra phiên đăng nhập. Vui lòng thử lại.',
          });
        }
      }
    })().finally(() => {
      initialization = null;
    });
    return initialization;
  },

  logout: async () => {
    const token = get().accessToken;
    get().clearAuth();
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
