import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { authService } from '../services/auth.service';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  clearSessionExpired: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      sessionExpired: false,

      initialize: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const user = await authService.getCurrentUser();
            if (user) {
              set({
                user,
                isAuthenticated: true,
                isInitialized: true,
                isLoading: false,
              });
              return;
            }
          }
          
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
          });
        }
      },

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
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Force logout locally even if server call fails
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
          });
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

      resetPassword: async (email: string) => {
        try {
          await authService.resetPassword(email);
        } catch (error) {
          throw error;
        }
      },

      updatePassword: async (newPassword: string) => {
        try {
          await authService.updatePassword(newPassword);
        } catch (error) {
          throw error;
        }
      },

      clearSessionExpired: () => {
        set({ sessionExpired: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Set up auth state listener with cleanup
let authStateSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;

export const setupAuthListener = () => {
  // Clean up existing subscription
  if (authStateSubscription) {
    authStateSubscription.data.subscription.unsubscribe();
  }

  authStateSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
    const { initialize } = useAuthStore.getState();
    
    if (event === 'SIGNED_OUT') {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
      });
    } else if (event === 'SIGNED_IN' && session?.user) {
      // Re-initialize to get fresh user data
      await initialize();
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed successfully');
    } else if (event === 'USER_UPDATED') {
      await initialize();
    }
  });

  return authStateSubscription;
};

export const cleanupAuthListener = () => {
  if (authStateSubscription) {
    authStateSubscription.data.subscription.unsubscribe();
    authStateSubscription = null;
  }
};

// Initialize listener
setupAuthListener();
