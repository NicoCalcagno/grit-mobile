import { useCallback } from 'react';
import { useMusicStore } from '../stores/musicStore';

// Spotify iOS SDK is bridged natively. We import it conditionally to avoid
// crashes on simulators where the SDK is not available.
let SpotifyRemote: {
  connect: (accessToken: string) => Promise<void>;
  playUri: (uri: string) => Promise<void>;
  resume: () => Promise<void>;
  pause: () => Promise<void>;
  skipToNext: () => Promise<void>;
} | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SpotifyRemote = require('react-native-spotify-remote').SpotifyRemote;
} catch {
  // SDK not linked — playback will be no-op in dev
}

interface UseSpotifyPlayerReturn {
  togglePlayback: () => Promise<void>;
  skipTrack: () => Promise<void>;
  playTrack: (uri: string) => Promise<void>;
}

export function useSpotifyPlayer(): UseSpotifyPlayerReturn {
  const { currentTrack, isPlaying, setIsPlaying, nextTrack, queue } = useMusicStore();

  const togglePlayback = useCallback(async () => {
    if (!SpotifyRemote) return;
    try {
      if (isPlaying) {
        await SpotifyRemote.pause();
        setIsPlaying(false);
      } else {
        await SpotifyRemote.resume();
        setIsPlaying(true);
      }
    } catch {
      // SDK error — ignore
    }
  }, [isPlaying, setIsPlaying]);

  const playTrack = useCallback(async (uri: string) => {
    if (!SpotifyRemote) return;
    try {
      await SpotifyRemote.playUri(uri);
      setIsPlaying(true);
    } catch {
      // SDK error — ignore
    }
  }, [setIsPlaying]);

  const skipTrack = useCallback(async () => {
    if (!SpotifyRemote) return;
    try {
      if (queue.length > 0) {
        nextTrack();
        const { currentTrack: next } = useMusicStore.getState();
        if (next) await SpotifyRemote.playUri(next.uri);
      } else {
        await SpotifyRemote.skipToNext();
      }
    } catch {
      // SDK error — ignore
    }
  }, [queue, nextTrack]);

  return { togglePlayback, skipTrack, playTrack };
}
