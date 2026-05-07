import { create } from 'zustand';
import client from '../api/client';
import { SpotifyTrack, WorkoutPhase } from '../types';

interface MusicState {
  currentTrack: SpotifyTrack | null;
  queue: SpotifyTrack[];
  isPlaying: boolean;
  isConnected: boolean;
  isLoading: boolean;
  currentPhase: WorkoutPhase | null;

  checkConnection: () => Promise<void>;
  getAuthUrl: () => Promise<string>;
  handleCallback: (code: string, state?: string) => Promise<void>;
  disconnect: () => Promise<void>;

  fetchRecommendations: (phase: WorkoutPhase, perceivedExertion?: number) => Promise<void>;
  setCurrentTrack: (track: SpotifyTrack | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentPhase: (phase: WorkoutPhase) => void;
  nextTrack: () => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  isConnected: false,
  isLoading: false,
  currentPhase: null,

  checkConnection: async () => {
    try {
      const { data } = await client.get<{ connected: boolean; expires_at: string | null }>('/spotify/status');
      set({ isConnected: data.connected });
    } catch {
      set({ isConnected: false });
    }
  },

  getAuthUrl: async () => {
    const { data } = await client.get<{ auth_url: string }>('/spotify/auth-url');
    return data.auth_url;
  },

  handleCallback: async (code, state) => {
    set({ isLoading: true });
    try {
      await client.post('/spotify/callback', { code, state });
      set({ isConnected: true, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error('Connessione Spotify fallita.');
    }
  },

  disconnect: async () => {
    try {
      await client.delete('/spotify/tokens');
    } catch {
      // Best-effort
    }
    set({ isConnected: false, currentTrack: null, queue: [], isPlaying: false });
  },

  fetchRecommendations: async (phase, perceivedExertion) => {
    set({ isLoading: true });
    try {
      const params: Record<string, unknown> = { phase };
      if (perceivedExertion !== undefined) params.perceived_exertion = perceivedExertion;
      const { data } = await client.get<{ phase: WorkoutPhase; tracks: SpotifyTrack[] }>('/spotify/recommendations', { params });
      const [first, ...rest] = data.tracks;
      set({ queue: rest, currentTrack: first ?? null, currentPhase: phase, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentPhase: (phase) => set({ currentPhase: phase }),

  nextTrack: () => {
    const { queue } = get();
    const [next, ...remaining] = queue;
    set({ currentTrack: next ?? null, queue: remaining });
  },
}));
