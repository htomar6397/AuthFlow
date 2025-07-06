
// Define types for the API responses
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

export type UpdateProfileData = Partial<{
  name: string;
  username: string;
  bio: string;
}>;

// This is what you should use as the return type for your API calls
export type ApiPromise<T = unknown> = Promise<ApiResponse<T>>;

export interface User {
  email: string;
  isEmailVerified: boolean;
  name?: string;
  bio?: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
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


