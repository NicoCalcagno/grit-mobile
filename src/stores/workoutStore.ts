import { create } from 'zustand';
import client from '../api/client';
import {
  WorkoutDay,
  WorkoutPlan,
  WorkoutSession,
  Exercise,
  WeeklyPlanResponse,
  DayName,
  ExerciseDone,
} from '../types';

const DAY_ORDER: DayName[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function normalizePlan(resp: WeeklyPlanResponse): WorkoutDay[] {
  return DAY_ORDER.map((dayName, dow) => {
    const day = resp.plan_json?.days?.[dayName];
    if (!day || day.is_rest) {
      return { dayOfWeek: dow, dayName, isRestDay: true };
    }
    const exercises: Exercise[] = (day.exercises ?? []).map((ex, i) => ({
      ...ex,
      id: `${dayName}-${i}`,
      muscles: ex.muscles ?? [],
      reps: ex.reps ?? '0',
    }));
    const plan: WorkoutPlan = {
      id: `${resp.id}-${dayName}`,
      name: day.workout_type ?? 'Workout',
      type: day.workout_type ?? '',
      durationMinutes: estimateDuration(exercises),
      exercises,
    };
    return { dayOfWeek: dow, dayName, isRestDay: false, workout: plan };
  });
}

function estimateDuration(exercises: Exercise[]): number {
  return exercises.reduce((sum, ex) => {
    const sets = ex.sets ?? 3;
    const rest = ex.rest_seconds ?? 60;
    return sum + sets * (45 + rest);
  }, 0) / 60;
}

interface WorkoutState {
  weeklyPlan: WorkoutDay[];
  weeklyPlanRaw: WeeklyPlanResponse | null;
  activePlan: WorkoutPlan | null;
  activeSession: WorkoutSession | null;
  isLoading: boolean;
  error: string | null;

  fetchWeeklyPlan: () => Promise<void>;
  generateWeeklyPlan: () => Promise<void>;
  setActivePlan: (plan: WorkoutPlan) => void;

  startSession: (planId?: string) => Promise<WorkoutSession>;
  updateSession: (sessionId: string, updates: Partial<WorkoutSession>) => Promise<void>;
  completeSession: (sessionId: string, finalData: {
    duration_minutes: number;
    calories_burned: number;
    avg_heart_rate: number;
    perceived_exertion: number;
    exercises_completed: ExerciseDone[];
    exercises_skipped: string[];
  }) => Promise<WorkoutSession>;

  advanceExercise: () => void;
  advanceSet: () => void;
  skipExercise: () => void;

  resetSession: () => void;
  clearError: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  weeklyPlan: [],
  weeklyPlanRaw: null,
  activePlan: null,
  activeSession: null,
  isLoading: false,
  error: null,

  fetchWeeklyPlan: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.get<WeeklyPlanResponse>('/workouts/weekly-plan/current');
      set({ weeklyPlan: normalizePlan(data), weeklyPlanRaw: data, isLoading: false });
    } catch (err: unknown) {
      const is404 = (err as { response?: { status?: number } })?.response?.status === 404;
      if (is404) set({ weeklyPlan: [], isLoading: false });
      else set({ error: 'Impossibile caricare il piano.', isLoading: false });
    }
  },

  generateWeeklyPlan: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.post<WeeklyPlanResponse>('/workouts/weekly-plan/generate');
      set({ weeklyPlan: normalizePlan(data), weeklyPlanRaw: data, isLoading: false });
    } catch {
      set({ error: 'Generazione piano fallita.', isLoading: false });
      throw new Error('Generazione piano fallita.');
    }
  },

  setActivePlan: (plan) => set({ activePlan: plan }),

  startSession: async (planId) => {
    set({ isLoading: true, error: null });
    try {
      const body: Record<string, unknown> = {};
      if (planId) body.plan_id = planId;
      const { data } = await client.post<WorkoutSession>('/workouts/sessions', body);
      const session: WorkoutSession = { ...data, currentExerciseIndex: 0, currentSet: 1, exercisesCompletedCount: 0, exercisesSkippedCount: 0 };
      set({ activeSession: session, isLoading: false });
      return session;
    } catch {
      set({ error: 'Impossibile avviare la sessione.', isLoading: false });
      throw new Error('Impossibile avviare la sessione.');
    }
  },

  updateSession: async (sessionId, updates) => {
    const { activeSession } = get();
    if (activeSession) set({ activeSession: { ...activeSession, ...updates } });
    try {
      const body: Record<string, unknown> = {};
      if (updates.calories_burned !== undefined) body.calories_burned = updates.calories_burned;
      if (updates.avg_heart_rate !== undefined) body.avg_heart_rate = updates.avg_heart_rate;
      if (updates.perceived_exertion !== undefined) body.perceived_exertion = updates.perceived_exertion;
      await client.put(`/workouts/sessions/${sessionId}`, body);
    } catch {
      // Silent — non-blocking
    }
  },

  completeSession: async (sessionId, finalData) => {
    set({ isLoading: true });
    try {
      const { data } = await client.post<WorkoutSession>(`/workouts/sessions/${sessionId}/complete`, finalData);
      set({ activeSession: { ...get().activeSession!, ...data }, isLoading: false });
      return data;
    } catch {
      set({ isLoading: false });
      throw new Error('Completamento sessione fallito.');
    }
  },

  advanceExercise: () => {
    const { activeSession } = get();
    if (!activeSession) return;
    set({ activeSession: { ...activeSession, currentExerciseIndex: (activeSession.currentExerciseIndex ?? 0) + 1, currentSet: 1 } });
  },

  advanceSet: () => {
    const { activeSession, activePlan } = get();
    if (!activeSession || !activePlan) return;
    const idx = activeSession.currentExerciseIndex ?? 0;
    const exercise = activePlan.exercises[idx];
    if (!exercise) return;
    const currentSet = activeSession.currentSet ?? 1;

    if (currentSet >= exercise.sets) {
      set({
        activeSession: {
          ...activeSession,
          currentExerciseIndex: idx + 1,
          currentSet: 1,
          exercisesCompletedCount: (activeSession.exercisesCompletedCount ?? 0) + 1,
        },
      });
    } else {
      set({ activeSession: { ...activeSession, currentSet: currentSet + 1 } });
    }
  },

  skipExercise: () => {
    const { activeSession } = get();
    if (!activeSession) return;
    set({
      activeSession: {
        ...activeSession,
        currentExerciseIndex: (activeSession.currentExerciseIndex ?? 0) + 1,
        currentSet: 1,
        exercisesSkippedCount: (activeSession.exercisesSkippedCount ?? 0) + 1,
      },
    });
  },

  resetSession: () => set({ activeSession: null }),
  clearError: () => set({ error: null }),
}));
