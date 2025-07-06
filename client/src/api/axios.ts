import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import useAuthStore from '@/stores/authStore';

declare global {
  interface Window {
    location: Location;
  }
}

/**
 * @file axios.ts
 * @description Configures and exports an Axios instance for API requests.
 * It includes request and response interceptors for handling authentication tokens,
 * refreshing expired tokens, and displaying toast notifications for errors.
 */

// Types for API responses
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

/**
 * @constant API_BASE_URL
 * @description Determines the base URL for API requests.
 * It prioritizes the VITE_API_BASE_URL environment variable,
 * falls back to a production URL, and then to a local development URL.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? String(import.meta.env.VITE_API_BASE_URL) 
  : 'https://ocvlqcxq6j.execute-api.us-east-1.amazonaws.com/dev/api';

// Create a custom type that includes our custom response interceptors
export interface CustomAxiosInstance extends AxiosInstance {
  <T = unknown, R = ApiResponse<T>>(config: AxiosRequestConfig): Promise<R>;
  <T = unknown, R = ApiResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
}

/**
 * @constant api
 * @description An Axios instance configured with the base URL, JSON content type,
 * and `withCredentials` for sending cookies (important for token refresh).
 */
const api: CustomAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Ensures cookies (like refresh tokens) are sent with requests
});

/**
 * @description Axios Request Interceptor:
 * Intercepts outgoing requests to add the Authorization header with the access token
 * if available in the authentication store.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token } = useAuthStore.getState();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * @description Handles API error responses consistently
 */
interface ApiErrorData {
  message?: string;
  errors?: Array<{
    type: string;
    msg: string;
    path: string;
    location: string;
  }>;
}

interface ApiErrorResponse {
  data?: ApiErrorData & {
    message?: string;
    code?: string;
    errors?: Array<{
      msg: string;
      [key: string]: unknown;
    }>;
  };
  message?: string;
  code?: string;
  status?: number;
  errors?: Array<{
    msg: string;
    [key: string]: unknown;
  }>;
}

const handleApiError = (error: unknown) => {
  // Default error message
  let errorMessage = 'An unexpected error occurred';
  let errorCode = 'UNKNOWN_ERROR';
  let statusCode = 500;
  let validationErrors: Array<{ msg: string; field?: string }> = [];
  let isNetworkError = false;
  let isCorsError = false;

  if (axios.isAxiosError(error)) {
    const response = error.response?.data as ApiErrorResponse;
    
    // Handle network errors (no response from server)
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Unable to connect to the server. Please check your internet connection or try again later.';
      errorCode = 'NETWORK_ERROR';
      statusCode = 0;
      isNetworkError = true;
    } 
    // Handle CORS errors
    else if (error.code === 'ERR_CORS' || 
             (error.response && error.response.status === 0 && !window.navigator.onLine)) {
      errorMessage = 'Unable to connect to the server. Please check your network connection and ensure the backend is running.';
      errorCode = 'CORS_ERROR';
      statusCode = 0;
      isCorsError = true;
    } 
    // Handle HTTP errors
    else if (error.response) {
      statusCode = error.response.status;
      
      // Handle different status codes
      switch (statusCode) {
        case 400:
          errorMessage = response?.message || 'Bad request';
          errorCode = response?.code || 'BAD_REQUEST';
          validationErrors = (response?.errors || []).map(err => ({
            msg: err.msg,
            field: String(err.path || '')
          }));
          break;
        case 401:
          // Don't show toast here, it's handled by the interceptor
          return Promise.reject(error);
        case 403:
          errorMessage = 'You do not have permission to access this resource';
          errorCode = 'FORBIDDEN';
          break;
        case 404:
          errorMessage = 'The requested resource was not found';
          errorCode = 'NOT_FOUND';
          break;
        case 500:
          errorMessage = response?.message || 'An internal server error occurred. Our team has been notified.';
          errorCode = 'INTERNAL_SERVER_ERROR';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'The server is currently unavailable. Please try again later.';
          errorCode = 'SERVICE_UNAVAILABLE';
          isNetworkError = true;
          break;
        default:
          errorMessage = response?.message || error.message;
          errorCode = response?.code || 'UNKNOWN_ERROR';
      }
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Show error toast for client-side errors (4xx) and server errors (5xx)
  // But skip for network/CORS errors as they'll be handled by the global error boundary
  if (statusCode >= 400 && !isNetworkError && !isCorsError) {
    toast.error('Error', {
      description: errorMessage,
    });
  }

  // For network/CORS errors, we'll let the error boundary handle it
  if (isNetworkError || isCorsError) {
    const networkError = new Error(errorMessage) as Error & { code?: string; statusCode?: number };
    networkError.code = errorCode;
    networkError.statusCode = statusCode;
    return Promise.reject(networkError);
  }

  return Promise.reject({
    status: 'error',
    message: errorMessage,
    code: errorCode,
    statusCode,
    errors: validationErrors.length > 0 ? validationErrors : undefined,
  });
};

/**
 * @description Axios Response Interceptor:
 * Intercepts and processes all API responses for consistent error handling
 * and token refresh logic.
 */
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors: attempt to refresh token and retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request as retried to prevent infinite loops

      try {
        // Attempt to get a new access token using the refresh token endpoint
        const {data} = await axios.get<ApiResponse<{accessToken:string}>>(
          `${API_BASE_URL}/auth/refresh-token`,
          { withCredentials: true } // Send cookies for refresh token
        );
        const accessToken=data.data?.accessToken;

        // Update the Authorization header with the new access token
        // The token is stored in the auth store via the interceptor
       
        useAuthStore.setState( {token: accessToken } );
        // Update the Authorization header of the original failed request with the new token
        if (originalRequest.headers && accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Retry the original request with the new token
        return api(originalRequest);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_refreshError) {
        try {
          // Clear authentication state directly without triggering logout
          useAuthStore.getState().clearAuth();
          
          
          const authPages = ['/login', '/register', '/forgot-password'];
          if (!authPages.some(page => window.location.pathname.includes(page))) {
            toast.error('Session Expired', {
              description: 'Your session has expired. Please log in again.',
            });
          }
        } catch (storeError) {
          console.error('Error updating auth store:', storeError);
        }

        return Promise.reject({
          status: 'error',
          message: 'Session expired. Please log in again.',
          code: 'SESSION_EXPIRED',
          statusCode: 401
        });
      }
    }

    // Handle other errors using our error handler
    return handleApiError(error);
  }
);

// Add a response interceptor to handle the standard response format
api.interceptors.response.use(
  response => response,
  error => {
    // If the error was already processed by our interceptors, just return it
    if ((error as { status?: unknown }).status) {
      return Promise.reject(error);
    }
    
    // Otherwise, process it
    return handleApiError(error);
  }
);

export default api;