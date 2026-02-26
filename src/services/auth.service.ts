import api, { setAuthToken } from './api';
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
  token: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse: AuthResponse = {
          user: {
            id: '1',
            email: data.email,
            name: 'John Doe',
            role: 'admin',
            createdAt: new Date(),
          },
          token: 'mock-jwt-token',
        };
        setAuthToken(mockResponse.token);
        resolve(mockResponse);
      }, 1000);
    });
    // Real implementation:
    // const response = await api.post<AuthResponse>('/auth/login', data);
    // setAuthToken(response.data.token);
    // return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse: AuthResponse = {
          user: {
            id: '1',
            email: data.email,
            name: data.name,
            phone: data.phone,
            role: data.role as any,
            createdAt: new Date(),
          },
          token: 'mock-jwt-token',
        };
        setAuthToken(mockResponse.token);
        resolve(mockResponse);
      }, 1000);
    });
    // Real implementation:
    // const response = await api.post<AuthResponse>('/auth/register', data);
    // setAuthToken(response.data.token);
    // return response.data;
  },

  async logout(): Promise<void> {
    // Real implementation:
    // await api.post('/auth/logout');
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(updates as User);
      }, 500);
    });
    // Real implementation:
    // const response = await api.patch<User>('/auth/profile', updates);
    // return response.data;
  },
};
