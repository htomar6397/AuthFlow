import { create } from 'zustand';
import { authApi } from '@/api/auth';
import type { LoginCredentials, RegisterCredentials } from '@/types';
import { toast } from 'sonner';
import useUserStore from './userStore';

export interface ApiError {
  status: 'error' | 'fail';
  message: string;
  code?: string;
  statusCode?: number;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  verifyEmail: (otp: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearAuth: () => void;
  setToken: (token: string | null) => void;
  setError: (error: ApiError | null) => void;
}

const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // Initial state
  token: null,
  isLoading: false,
  error: null,

  // Login user
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      
      const { user, accessToken } = response.data;
        useUserStore.setState({ user });        
        set({ 
          token: accessToken,
          isLoading: false,
          error: null
        });
        
       if(user.isEmailVerified) toast.success('Login successful');
    } catch (error) {
      const errorObj = error as ApiError;
      set({ 
        token: null,
        isLoading: false,
        error: errorObj
      });
      throw error;
    }
  },

  // Register new user
  register: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(credentials);
      
      const { user, accessToken } = response.data;
        useUserStore.setState({ user });        
        set({ 
          token: accessToken,
          isLoading: false,
          error: null
        });
        
    } catch (error) {
      const errorObj = error as ApiError;
      set({ 
        token: null,
        isLoading: false,
        error: errorObj
      });
      throw error;
    }
  },

  // Verify email with OTP
  verifyEmail: async (otp) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.verifyEmail(otp);
      const user = useUserStore.getState().user;
      if (user) {
        user.isEmailVerified = true;
        useUserStore.setState({ user });
      }
      set({ isLoading: false });
      toast.success('Email verified successfully');
      return true;
    } catch (error) {
      const errorObj = error as ApiError;
      set({ 
        isLoading: false,
        error: errorObj
      });
      throw error;
    }
  },

  // Resend verification email
  resendVerificationEmail: async () => {
    set({ isLoading: true, error: null });
    
    try {
       await authApi.resendVerificationEmail();
      
      set({ isLoading: false });
      toast.success('Verification OTP sent');
      return;
    } catch (error) {
      const errorObj = error as ApiError;
      set({ 
        isLoading: false,
        error: errorObj
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.forgotPassword(email);
      
      set({ isLoading: false });
      toast.success('Temporary password sent', {
        description: 'Please check your email (spam/junk folder) for temporary password'
      });
      return;
    } catch (error) {
      const errorObj = error as ApiError;
      set({ 
        isLoading: false,
        error: errorObj
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout user
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
      
      // Clear auth state
      set({ 
        token: null, 
        isLoading: false,
        error: null
      });
      
      // Clear user store
      useUserStore.getState().clearUser();
      
      toast.success('Logged out successfully');
      
    } catch (error) {
      console.error('Logout error:', error);
      const errorObj = error as ApiError;
      set({ 
        isLoading: false,
        error: errorObj
      });
      throw error;
    }
  },
 

  // Clear error message
  clearError: () => set({ error: null }),
  
  // Clear authentication state
  clearAuth: () => {
    set({ 
      token: null,
      error: null,
      isLoading: false
    });
    
    // Clear user store
    useUserStore.getState().clearUser();
  },
  
  // Set authentication token
  setToken: (token: string | null) => set({ 
    token,
  }),
  
  // Set error state
  setError: (error: ApiError | null) => set({ error }),
}));

export default useAuthStore;