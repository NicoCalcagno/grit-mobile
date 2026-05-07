import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { saveTokens, clearTokens, getAccessToken } from '../api/client';
import { LoginRequest, RegisterRequest, UserProfile, AuthTokens } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const token = await getAccessToken();
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      const { data } = await client.get<UserProfile>('/users/me');
      set({ user: normalizeUser(data), isAuthenticated: true, isLoading: false });
    } catch {
      await clearTokens();
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.post<AuthTokens>('/auth/login', { email, password });
      await saveTokens(data.access_token, data.refresh_token);
      const { data: profile } = await client.get<UserProfile>('/users/me');
      set({ user: normalizeUser(profile), isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Email o password non validi.');
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async ({ email, password, name }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.post<AuthTokens>('/auth/register', { email, password, name });
      await saveTokens(data.access_token, data.refresh_token);
      const { data: profile } = await client.get<UserProfile>('/users/me');
      set({ user: normalizeUser(profile), isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Registrazione fallita. Email già in uso?');
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try { await client.post('/auth/logout'); } catch { /* best-effort */ }
    await clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

// Map snake_case backend fields to camelCase aliases for convenience in UI
function normalizeUser(profile: UserProfile): UserProfile {
  return {
    ...profile,
    coachLanguage: profile.coach_language,
    coachTone: profile.coach_tone,
  };
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { detail?: string } } }).response;
    return response?.data?.detail ?? fallback;
  }
  return fallback;
}
