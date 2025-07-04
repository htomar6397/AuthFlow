import { create } from 'zustand';
import { authApi } from '@/api/auth';
import type { User, LoginCredentials, RegisterCredentials, CompleteProfileData } from '@/types';
import userApi from '@/api/user';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

type AuthActions = {
  initialize: () => Promise<User | null>;
  login: (userData: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  verifyEmail: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  clearError: () => void;
  completeProfile: (userData: CompleteProfileData) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  updateProfile: (userData: any) => Promise<void>;
  changePassword: (password: string , newPassword: string) => Promise<void>;
};

const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  initialize: async () => {
    try {
      // Use the existing API to get the current user
      const user = await userApi.getMe();
      set({
        user: user,
        isAuthenticated: !!user,
        isLoading: false,
      });
      return user;
    } catch (error) {
      // If we get an error, the user is not authenticated
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  },
  
  login: async (userData: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(userData);
      set({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  register: async (userData: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(userData);
      set({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  verifyEmail: async (otp: string) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.verifyEmail(otp);
      set((state) => ({
        user: state.user ? { ...state.user, isEmailVerified: true } : null,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Verification failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  resendVerificationEmail: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.resendVerificationEmail();
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Resend verification failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  completeProfile: async (userData: CompleteProfileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.completeProfile(userData);
      const updatedUser = { ...response.user, isProfileCompleted: true };
      set({
        user: updatedUser,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile completion failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  checkUsernameAvailability: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.checkUsername(username);
      return response.available;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Username availability check failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  changePassword: async (password: string , newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.changePassword(password , newPassword);
      set({
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile completion failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },
  updateProfile: async (userData: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.updateProfile(userData);
      const updatedUser = response.user;
      set({
        user: updatedUser,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile completion failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  forgotPassword: async (indentify: string) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.forgotPassword(indentify);
      set({ isLoading: false });
    } catch (error: any) {
      console.log(error)
      const errorMessage = error.message || 'Forgot password failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
