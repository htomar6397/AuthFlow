import type { LoginCredentials, RegisterCredentials } from '@/types';
import api from './axios';

// Types for auth responses
export interface UserData {
  id: string;
  email: string;
  username?: string;
  isEmailVerified: boolean;
  name?: string;
  bio?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  status: 'success' | 'fail' | 'error';
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: UserData;
    expiresIn: number;
  };
  errors?: Array<{
    type: string;
    msg: string;
    path: string;
    location: string;
  }>;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'fail' | 'error';
  message: string;
  data?: T;
  errors?: Array<{
    type: string;
    msg: string;
    path: string;
    location: string;
  }>;
}

interface BaseResponse {
  status: 'success' | 'fail' | 'error';
  message: string;
  data?: unknown;
  success?: boolean; // For backward compatibility
}

export interface VerifyEmailResponse extends BaseResponse {
  verified: boolean;
  data?: {
    verified: boolean;
  };
}

class AuthApi {
  /**
   * Authenticate a user with email/username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      `/auth/login`,
      credentials
    );
    return response.data;
  }

  /**
   * Register a new user account
   */
  async register(userData: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      `/auth/register`,
      userData
    );
    return response.data;
  }

  /**
   * Verify email with OTP code
   */
  async verifyEmail(code: string): Promise<VerifyEmailResponse> {
    const response = await api.post<VerifyEmailResponse>(
      `/auth/verify-otp`,
      { code }
    );
    return response.data;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<BaseResponse> {
    const response = await api.post<BaseResponse>(
      `/auth/resend-otp`
    );
    return response.data;
  }

  /**
   * Request password reset
   */
  async forgotPassword(identifier: string): Promise<BaseResponse> {
    const response = await api.post<BaseResponse>(
      `/auth/forgot-password`,
      { identifier }
    );
    return response.data;
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<BaseResponse> {
    const response = await api.post<BaseResponse>(
      `/auth/logout`
    );
    return response.data;
  }



}

export const authApi = new AuthApi();
export default authApi;
