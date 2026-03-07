import { supabase } from '../lib/supabase';
import { User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  session: any;
}

// Helper function to generate unique join codes
const generateJoinCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      // Provide more specific error messages
      if (authError.message.includes('Invalid login credentials')) {
        throw new Error('INVALID_CREDENTIALS');
      } else if (authError.message.includes('Email not confirmed')) {
        throw new Error('EMAIL_NOT_CONFIRMED');
      } else if (authError.message.includes('User not found')) {
        throw new Error('USER_NOT_FOUND');
      } else {
        throw new Error(authError.message);
      }
    }

    if (!authData.user) {
      throw new Error('LOGIN_FAILED');
    }

    // Get user profile from users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    const user: User = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      phone: userProfile.phone,
      role: userProfile.role,
      avatar: userProfile.avatar_url,
      createdAt: new Date(userProfile.created_at),
    };

    return {
      user,
      session: authData.session,
    };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log('Auth service: Starting registration for', data.email);
    
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error('Auth service: Auth signup error:', authError);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      console.error('Auth service: No user returned from signup');
      throw new Error('Registration failed');
    }

    console.log('Auth service: Auth user created:', authData.user.id);

    // Then create the user profile with retry logic
    let retries = 3;
    let userProfile = null;
    let profileError = null;

    while (retries > 0 && !userProfile) {
      console.log(`Auth service: Attempting to create profile (${4 - retries}/3)`);
      
      const result = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: data.role as any,
        })
        .select()
        .single();

      userProfile = result.data;
      profileError = result.error;

      if (profileError) {
        console.error('Auth service: Profile creation error:', profileError);
        retries--;
        if (retries > 0) {
          console.log('Auth service: Retrying profile creation...');
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.error('Auth service: All retries exhausted, cleaning up auth user');
          // If all retries failed, clean up the auth user
          await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {
            // Ignore cleanup errors
          });
          throw new Error('Failed to create user profile. Please try again.');
        }
      } else {
        console.log('Auth service: Profile created successfully');
      }
    }

    if (!userProfile) {
      console.error('Auth service: No profile created after retries');
      throw new Error('Failed to create user profile');
    }

    const user: User = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      phone: userProfile.phone,
      role: userProfile.role,
      avatar: userProfile.avatar_url,
      createdAt: new Date(userProfile.created_at),
    };

    console.log('Auth service: Registration complete for user:', user.id);

    return {
      user,
      session: authData.session,
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      throw new Error('Not authenticated');
    }

    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        phone: updates.phone,
        avatar_url: updates.avatar,
      })
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update profile');
    }

    return {
      id: updatedProfile.id,
      email: updatedProfile.email,
      name: updatedProfile.name,
      phone: updatedProfile.phone,
      role: updatedProfile.role,
      avatar: updatedProfile.avatar_url,
      createdAt: new Date(updatedProfile.created_at),
    };
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return null;
    }

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      return null;
    }

    return {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      phone: userProfile.phone,
      role: userProfile.role,
      avatar: userProfile.avatar_url,
      createdAt: new Date(userProfile.created_at),
    };
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
};
