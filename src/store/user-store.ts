import { create } from 'zustand'

export type User = {
  userId: string;
  email: string;
  role: string;
  name?: string;
  avatar?: string;
} | null;

interface UserState {
  user: User;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  // Actions to update the state
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  clearUser: () => set({ user: null, isLoggedIn: false }),
}))
