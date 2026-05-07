import { useEffect, useRef, useState, useCallback } from 'react';

interface WorkoutTimerState {
  elapsed: number;
  restRemaining: number;
  isResting: boolean;
  startRest: (seconds: number) => void;
  stopRest: () => void;
  resetTimer: () => void;
  formattedElapsed: string;
  formattedRest: string;
}

export function useWorkoutTimer(): WorkoutTimerState {
  const [elapsed, setElapsed] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [isResting, setIsResting] = useState(false);

  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    elapsedRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  const startRest = useCallback((seconds: number) => {
    setRestRemaining(seconds);
    setIsResting(true);

    if (restRef.current) clearInterval(restRef.current);
    restRef.current = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(restRef.current!);
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopRest = useCallback(() => {
    if (restRef.current) clearInterval(restRef.current);
    setIsResting(false);
    setRestRemaining(0);
  }, []);

  const resetTimer = useCallback(() => {
    setElapsed(0);
    stopRest();
  }, [stopRest]);

  useEffect(() => {
    return () => {
      if (restRef.current) clearInterval(restRef.current);
    };
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedElapsed = `${pad(Math.floor(elapsed / 60))}:${pad(elapsed % 60)}`;
  const formattedRest = `${pad(Math.floor(restRemaining / 60))}:${pad(restRemaining % 60)}`;

  return { elapsed, restRemaining, isResting, startRest, stopRest, resetTimer, formattedElapsed, formattedRest };
}
