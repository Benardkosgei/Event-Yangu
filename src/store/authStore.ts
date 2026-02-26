import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/auth.service';
import { clearAuthToken } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string, role: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ email, password });
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string, phone: string, role: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.register({ email, password, name, phone, role });
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      clearAuthToken();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(updates);
      set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null,
      }));
    } catch (error) {
      throw error;
    }
  },
}));
