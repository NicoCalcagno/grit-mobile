import { useState, useRef, useCallback } from 'react';
import * as Speech from 'expo-speech';
import client from '../api/client';
import { CoachEvent, CoachMessageRequest, CoachMessageResponse } from '../types';

const FALLBACKS: Record<CoachEvent, string> = {
  exercise_start: 'Forza, dai tutto!',
  mid_set: 'Continua, non mollare!',
  set_complete: 'Ottima serie, recupera bene.',
  rest_start: 'Respira, recupero iniziato.',
  rest_end: 'Recupero finito, pronti!',
  workout_end: 'Allenamento completato. Grande lavoro!',
};

interface UseCoachOptions {
  language?: string;
}

interface UseCoachReturn {
  coachMessage: string;
  isSpeaking: boolean;
  triggerCoach: (event: CoachEvent, extras?: Partial<Omit<CoachMessageRequest, 'event'>>) => Promise<void>;
}

export function useCoach({ language = 'it-IT' }: UseCoachOptions = {}): UseCoachReturn {
  const [coachMessage, setCoachMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastCallRef = useRef<number>(0);
  const retryAfterRef = useRef<number>(0);
  // Backend rate limit: 3 req/min — enforce 20s minimum client-side gap
  const RATE_LIMIT_MS = 20_000;

  const speak = useCallback((text: string) => {
    Speech.stop();
    setCoachMessage(text);
    setIsSpeaking(true);
    Speech.speak(text, {
      language,
      rate: 0.95,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [language]);

  const triggerCoach = useCallback(async (
    event: CoachEvent,
    extras: Partial<Omit<CoachMessageRequest, 'event'>> = {},
  ) => {
    const now = Date.now();
    if (isSpeaking || now - lastCallRef.current < RATE_LIMIT_MS || now < retryAfterRef.current) return;

    lastCallRef.current = now;
    const fallback = FALLBACKS[event] ?? 'Forza!';

    const requestBody: CoachMessageRequest = { event, ...extras };

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 3000),
    );

    try {
      const requestPromise = client.post<CoachMessageResponse>('/coach/message', requestBody);
      const { data } = await Promise.race([requestPromise, timeout]);
      speak(data.text);
    } catch (err: unknown) {
      // Handle 429 — back off for 60 seconds
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        retryAfterRef.current = Date.now() + 60_000;
      }
      speak(fallback);
    }
  }, [isSpeaking, speak]);

  return { coachMessage, isSpeaking, triggerCoach };
}
