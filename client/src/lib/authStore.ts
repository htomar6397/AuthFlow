import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  isEmailVerified?: boolean;
  // Add more if needed
}

export interface AuthStore {
  accessToken: string | null;
  user: User | null;

  // Actions
  setAuth: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  loadStore: (token: string, user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  user: null,

  setAuth: (token) => {
    set({ accessToken: token });
  },

  setUser: (user) => {
    set({ user });
  },

  loadStore: (token, user) => {
    set({ accessToken: token, user });
  },

  logout: () => {
    set({ accessToken: null, user: null });
  }
}));
