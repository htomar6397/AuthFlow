import api from './axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types';

export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Register new user  
  register: async (userData: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  // Verify email with OTP
  verifyEmail: async (code: string): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>('/auth/verify-otp', { otp: code });
    return response.data;
  },

  // Resend verification email
  resendVerificationEmail: async (): Promise<{ success: boolean }> => {
    const response = await api.get<{ success: boolean }>('/auth/resend-otp');
    return response.data;
  },

  // Request password reset
  forgotPassword: async (identifier: string): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>('/auth/forgot-password', { identifier });
    return response.data;
  },
  // Logout user
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

export default authApi;
