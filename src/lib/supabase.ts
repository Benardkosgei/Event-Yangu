import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Custom storage implementation using Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (generated from Supabase CLI or manually defined)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          role: 'admin' | 'committee' | 'member' | 'vendor' | 'viewer';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          phone?: string | null;
          role: 'admin' | 'committee' | 'member' | 'vendor' | 'viewer';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          role?: 'admin' | 'committee' | 'member' | 'vendor' | 'viewer';
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          name: string;
          type: 'burial' | 'wedding' | 'fundraiser' | 'meeting' | 'community' | 'corporate' | 'other';
          description: string | null;
          start_date: string;
          end_date: string | null;
          location: string;
          join_code: string;
          created_by: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'burial' | 'wedding' | 'fundraiser' | 'meeting' | 'community' | 'corporate' | 'other';
          description?: string | null;
          start_date: string;
          end_date?: string | null;
          location: string;
          join_code: string;
          created_by: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'burial' | 'wedding' | 'fundraiser' | 'meeting' | 'community' | 'corporate' | 'other';
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          location?: string;
          join_code?: string;
          created_by?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      committees: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          event_id: string;
          committee_id: string | null;
          title: string;
          description: string | null;
          status: 'pending' | 'in_progress' | 'completed';
          due_date: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          committee_id?: string | null;
          title: string;
          description?: string | null;
          status?: 'pending' | 'in_progress' | 'completed';
          due_date?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          committee_id?: string | null;
          title?: string;
          description?: string | null;
          status?: 'pending' | 'in_progress' | 'completed';
          due_date?: string | null;
          created_by?: string;
          updated_at?: string;
        };
      };
      event_members: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          role?: string;
        };
      };
      task_assignments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
        };
      };
      vendors: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          description: string | null;
          services: string[];
          portfolio_urls: string[];
          contact_email: string | null;
          contact_phone: string | null;
          rating: number | null;
          total_reviews: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          description?: string | null;
          services: string[];
          portfolio_urls?: string[];
          contact_email?: string | null;
          contact_phone?: string | null;
          rating?: number | null;
          total_reviews?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          description?: string | null;
          services?: string[];
          portfolio_urls?: string[];
          contact_email?: string | null;
          contact_phone?: string | null;
          rating?: number | null;
          total_reviews?: number;
          updated_at?: string;
        };
      };
    };
  };
}