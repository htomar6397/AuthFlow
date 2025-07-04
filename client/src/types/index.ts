export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  bio?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface CompleteProfileData {
  name: string;
  username: string;
  bio?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
}
