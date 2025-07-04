import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { toast } from 'sonner';
import useAuthStore from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Add Authorization token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Refresh access token on 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.get<{ accessToken: string }>(
          `${API_BASE_URL}/auth/refresh-token`,
          { withCredentials: true }
        );

        useAuthStore.setState({
          token: data.accessToken,
          isAuthenticated: true,
        });

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.setState({
          user: null,
          token: null,
          isLoading: false,
        });
     if(location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/forgot-password')
        toast.error('Session Expired', {
          description: 'Please log in again.',
        });

        return Promise.reject(refreshError);
      }
    }

    // Handle other server errors
    if (error.response) {
      const message = (error.response.data as any)?.message || 'An error occurred';

      if (![401, 404].includes(error.response.status)) {
        toast.error('Error', { description: message });
      }

      return Promise.reject(error.response.data);
    }

    // Network or setup issues
    if (error.request) {
      toast.error('Network Error', {
        description: 'Unable to reach server. Check your connection.',
      });
    } else {
      toast.error('Error', {
        description: error.message || 'Something went wrong.',
      });
    }

    return Promise.reject(error);
  }
);

export default api;
