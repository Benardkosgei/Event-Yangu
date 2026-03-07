import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.eventyangu.com';
const API_TIMEOUT = 10000;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token from Supabase
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - try to refresh token
      const refreshed = await refreshAuthToken();
      if (!refreshed) {
        // If refresh failed, logout user
        await clearAuthToken();
      }
    }
    return Promise.reject(error);
  }
);

// Token management using Supabase session
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const { supabase } = await import('../lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const { supabase } = await import('../lib/supabase');
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
};

export const clearAuthToken = async (): Promise<void> => {
  try {
    const { supabase } = await import('../lib/supabase');
    await supabase.auth.signOut();
    
    // Also notify the auth store
    const { useAuthStore } = await import('../store/authStore');
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      sessionExpired: true,
    });
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
};

export default api;
