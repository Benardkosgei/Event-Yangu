// Authentication error handling utilities

export interface AuthError {
  title: string;
  message: string;
  code?: string;
}

export const parseAuthError = (error: any): AuthError => {
  const errorMessage = error?.message || 'Unknown error';
  const errorCode = error?.code || error?.status;

  // Handle specific error codes
  switch (errorMessage) {
    case 'INVALID_CREDENTIALS':
      return {
        title: 'Login Failed',
        message: 'Invalid email or password. Please check your credentials and try again.',
        code: 'INVALID_CREDENTIALS',
      };

    case 'EMAIL_NOT_CONFIRMED':
      return {
        title: 'Email Not Confirmed',
        message: 'Please check your email and confirm your account before logging in.',
        code: 'EMAIL_NOT_CONFIRMED',
      };

    case 'USER_NOT_FOUND':
      return {
        title: 'Account Not Found',
        message: 'No account found with this email. Please sign up first.',
        code: 'USER_NOT_FOUND',
      };

    case 'PROFILE_NOT_FOUND':
      return {
        title: 'Profile Error',
        message: 'Account profile not found. Please contact support.',
        code: 'PROFILE_NOT_FOUND',
      };

    case 'LOGIN_FAILED':
      return {
        title: 'Login Failed',
        message: 'Unable to complete login. Please try again.',
        code: 'LOGIN_FAILED',
      };

    case 'REGISTRATION_FAILED':
      return {
        title: 'Registration Failed',
        message: 'Unable to create account. Please try again.',
        code: 'REGISTRATION_FAILED',
      };

    default:
      // Handle network errors
      if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Network')) {
        return {
          title: 'Network Error',
          message: 'Please check your internet connection and try again.',
          code: 'NETWORK_ERROR',
        };
      }

      // Handle rate limiting
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        return {
          title: 'Too Many Attempts',
          message: 'Too many login attempts. Please wait a few minutes and try again.',
          code: 'RATE_LIMITED',
        };
      }

      // Handle email already exists
      if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        return {
          title: 'Email Already Registered',
          message: 'An account with this email already exists. Please login instead.',
          code: 'EMAIL_EXISTS',
        };
      }

      // Handle weak password
      if (errorMessage.includes('password') && errorMessage.includes('weak')) {
        return {
          title: 'Weak Password',
          message: 'Please choose a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.',
          code: 'WEAK_PASSWORD',
        };
      }

      // Handle session expired
      if (errorMessage.includes('session') || errorMessage.includes('expired') || errorMessage.includes('token')) {
        return {
          title: 'Session Expired',
          message: 'Your session has expired. Please log in again.',
          code: 'SESSION_EXPIRED',
        };
      }

      // Default error
      return {
        title: 'Error',
        message: errorMessage || 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR',
      };
  }
};

export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 4) strength = 'medium';
  else strength = 'strong';

  return { strength, score, feedback };
};
