import api from './axios';
import type { User, CompleteProfileData, UpdateProfileData } from '@/types';
import type { ApiResponse } from '@/types';

export const userApi = {
  /**
   * Update user profile
   */
  async updateProfile(userData: UpdateProfileData): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>('/user/update-profile', userData);
    return response.data;
  },

  /**
   * Complete profile (for new users)
   */
  async completeProfile(userData: CompleteProfileData): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>('/user/complete-profile', userData);
    return response.data;
  },

  /**
   * Get current user
   */
  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/user/profile');
    return response.data;
  },

  /**
   * Check username availability
   */
  async checkUsername(username: string): Promise<ApiResponse<{ available: boolean }>> {
    const response = await api.get<ApiResponse<{ available: boolean }>>('/auth/check-username', {
      params: { username }
    });
    return response.data;
  },

  /**
   * Change user password
   */
  async changePassword(password: string, newPassword: string): Promise<ApiResponse<unknown>> {
    const response = await api.post<ApiResponse<unknown>>('/user/change-password', { password, newPassword });
    return response.data;
  },
  
  /**
   * Delete the current user account
   */
  async deleteAccount(password: string): Promise<ApiResponse<unknown>> {
    const response = await api.delete<ApiResponse<unknown>>(
      `/user/delete-account`,
      { data: { password } }
    );
    return response.data;
  }

};

export default userApi;
