import api from './axios';
import type { User } from '@/types';

export const userApi = {
  // Update user profile
  updateProfile: async (userData: any): Promise<{ success: boolean , user: User }> => {
    const response = await api.post<{ success: boolean , user: User }>('/user/update-profile', userData);
    return response.data;
  },

  // Complete profile (for new users)
  completeProfile: async (userData: any): Promise<{ success: boolean, user: User }> => {
    const response = await api.post<{ success: boolean, user: User }>('/user/complete-profile', userData);
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/user/profile');
    return response.data;
  },

  // Check username availability
  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const response = await api.get<{ available: boolean }>('/auth/check-username', {
      params: { username }
    });
    return response.data;
  },
  changePassword: async (password: string , newPassword: string): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>('/user/change-password', { password , newPassword });
    return response.data;
  }
};

export default userApi;
