import { create } from 'zustand';
import client from '../api/client';
import { UserProfile } from '../types';

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.get<UserProfile>('/users/me');
      set({ profile: data, isLoading: false });
    } catch {
      set({ error: 'Impossibile caricare il profilo.', isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.put<UserProfile>('/users/me', updates);
      set({ profile: data, isLoading: false });
    } catch {
      set({ error: 'Aggiornamento profilo fallito.', isLoading: false });
      throw new Error('Aggiornamento profilo fallito.');
    }
  },

  setProfile: (profile) => set({ profile }),
  clearError: () => set({ error: null }),
}));
