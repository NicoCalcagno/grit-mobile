import { create } from 'zustand';
import client from '../api/client';
import {
  NutritionSummary,
  NutritionInsight,
  DietPlan,
  FoodSearchResult,
  MealType,
  LogFoodRequest,
  PhotoFoodResponse,
  RecognizedFood,
} from '../types';

interface NutritionState {
  summary: NutritionSummary | null;
  insights: NutritionInsight[];
  dietPlan: DietPlan | null;
  searchResults: FoodSearchResult[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;

  fetchSummary: (date: string, caloriesBurnedHealthkit?: number) => Promise<void>;
  fetchInsights: () => Promise<void>;
  fetchDietPlan: () => Promise<void>;
  generateDietPlan: () => Promise<void>;
  regenerateDietDay: (day: string) => Promise<void>;

  searchFood: (query: string) => Promise<void>;
  getFoodByBarcode: (barcode: string) => Promise<FoodSearchResult>;
  logFood: (req: LogFoodRequest) => Promise<void>;
  logPhotoFood: (base64: string, mealType: MealType) => Promise<PhotoFoodResponse>;
  deleteFoodLog: (logId: string) => Promise<void>;
  logWater: (amountMl?: number) => Promise<void>;

  markInsightRead: (insightId: string) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;
}

export const useNutritionStore = create<NutritionState>((set) => ({
  summary: null,
  insights: [],
  dietPlan: null,
  searchResults: [],
  isLoading: false,
  isSearching: false,
  error: null,

  fetchSummary: async (date, caloriesBurnedHealthkit = 0) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.get<NutritionSummary>('/nutrition/summary', {
        params: { date, calories_burned_healthkit: caloriesBurnedHealthkit },
      });
      set({ summary: data, isLoading: false });
    } catch {
      set({ error: 'Impossibile caricare il riepilogo nutrizionale.', isLoading: false });
    }
  },

  fetchInsights: async () => {
    try {
      const { data } = await client.get<NutritionInsight[]>('/nutrition/insights');
      set({ insights: data });
    } catch {
      // Non-blocking
    }
  },

  fetchDietPlan: async () => {
    set({ isLoading: true });
    try {
      const { data } = await client.get<DietPlan>('/nutrition/diet-plan/current');
      set({ dietPlan: data, isLoading: false });
    } catch {
      set({ dietPlan: null, isLoading: false });
    }
  },

  generateDietPlan: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.post<DietPlan>('/nutrition/diet-plan/generate');
      set({ dietPlan: data, isLoading: false });
    } catch {
      set({ error: 'Generazione piano dieta fallita.', isLoading: false });
      throw new Error('Generazione piano dieta fallita.');
    }
  },

  regenerateDietDay: async (day) => {
    set({ isLoading: true });
    try {
      const { data } = await client.post<{ message: string; plan: DietPlan }>('/nutrition/diet-plan/regenerate-day', { day });
      set({ dietPlan: data.plan, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error('Rigenerazione giorno fallita.');
    }
  },

  searchFood: async (query) => {
    set({ isSearching: true });
    try {
      const { data } = await client.get<{ results: FoodSearchResult[]; count: number }>('/food/search', {
        params: { q: query },
      });
      set({ searchResults: data.results, isSearching: false });
    } catch {
      set({ isSearching: false });
    }
  },

  getFoodByBarcode: async (barcode) => {
    const { data } = await client.get<FoodSearchResult>(`/food/barcode/${barcode}`);
    return data;
  },

  logFood: async (req) => {
    await client.post('/nutrition/logs', req);
  },

  logPhotoFood: async (base64, mealType) => {
    const { data } = await client.post<PhotoFoodResponse>('/nutrition/logs/photo', {
      image_base64: base64,
      meal_type: mealType,
    });
    return data;
  },

  deleteFoodLog: async (logId) => {
    await client.delete(`/nutrition/logs/${logId}`);
  },

  logWater: async (amountMl = 250) => {
    await client.post('/nutrition/water', { amount_ml: amountMl });
    set((state) => ({
      summary: state.summary
        ? { ...state.summary, water_ml: state.summary.water_ml + amountMl }
        : state.summary,
    }));
  },

  markInsightRead: async (insightId) => {
    try {
      await client.put(`/nutrition/insights/${insightId}/read`);
    } catch { /* best-effort */ }
    set((state) => ({
      insights: state.insights.map((i) =>
        i.id === insightId ? { ...i, read: true } : i,
      ),
    }));
  },

  clearSearch: () => set({ searchResults: [] }),
  clearError: () => set({ error: null }),
}));
