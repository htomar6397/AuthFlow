import { create } from 'zustand';
import type { User, CompleteProfileData, UpdateProfileData } from '@/types';
import userApi from '@/api/user';
import useAuthStore from './authStore';
import { toast } from 'sonner';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  updateUser: (user: Partial<User>) => void;
  clearUser: () => void;
  updateProfile: (userData: UpdateProfileData) => Promise<void>;
  completeProfile: (userData: CompleteProfileData) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  updateUser: (user) => set((state) => ({
    user: state.user ? { ...state.user, ...user } : null
  })),

  clearUser: () => set({ user: null }),

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.getMe();
      set({ user: response.data, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user data';
      set({ error: errorMessage, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.updateProfile(userData);
      set((state) => ({
        user: state.user ? { ...state.user, ...response.data } : response.data,
        isLoading: false,
      }));
      toast.success('Profile updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  completeProfile: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.completeProfile(userData);
      set({ user: response.data, isLoading: false });
      toast.success('Profile completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete profile';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.changePassword(currentPassword, newPassword);
      set({ isLoading: false });
      toast.success('Password changed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async (password) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.deleteAccount(password);
      set({ user: null });
      useAuthStore.setState({ token: null });
      toast.success('Account deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
      set({ error: errorMessage });
      console.error('Failed to delete account:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useUserStore;
