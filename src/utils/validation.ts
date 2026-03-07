export const validation = {
  email: (email: string): string | null => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return null;
  },

  password: (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
  },

  name: (name: string): string | null => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return null;
  },

  phone: (phone: string): string | null => {
    if (!phone) return null; // Phone is optional
    // Remove all non-digit characters except leading +
    const cleaned = phone.replace(/[^\d+]/g, '');
    // Must have at least 10 digits (excluding country code +)
    const digitsOnly = cleaned.replace(/\+/g, '');
    if (digitsOnly.length < 10) return 'Phone number must have at least 10 digits';
    if (digitsOnly.length > 15) return 'Phone number is too long';
    // Must start with + or digit
    if (!/^[+\d]/.test(phone)) return 'Invalid phone format';
    return null;
  },

  required: (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') return `${fieldName} is required`;
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value.length < min) return `${fieldName} must be at least ${min} characters`;
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (value.length > max) return `${fieldName} must be less than ${max} characters`;
    return null;
  },

  number: (value: string): string | null => {
    if (isNaN(Number(value))) return 'Must be a valid number';
    return null;
  },

  positiveNumber: (value: string): string | null => {
    const num = Number(value);
    if (isNaN(num)) return 'Must be a valid number';
    if (num <= 0) return 'Must be greater than 0';
    return null;
  },

  date: (date: Date | string): string | null => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return null;
  },

  futureDate: (date: Date | string): string | null => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    if (dateObj < new Date()) return 'Date must be in the future';
    return null;
  },
};
