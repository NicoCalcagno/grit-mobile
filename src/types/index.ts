// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user_id?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export type Gender = 'male' | 'female' | 'other';
export type FitnessGoal = 'muscle_gain' | 'fat_loss' | 'endurance' | 'wellness' | 'flexibility';
export type FitnessLevel = 'sedentary' | 'beginner' | 'intermediate' | 'advanced' | 'athlete';
export type WorkoutType = 'strength' | 'cardio' | 'hiit' | 'yoga' | 'pilates' | 'stretching';
export type CoachTone = 'motivating' | 'aggressive' | 'zen';
export type CoachLanguage = 'it' | 'en';
export type DayName = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  gender?: Gender;
  fitness_level?: FitnessLevel;
  goals?: FitnessGoal[];
  available_days?: DayName[];
  preferred_workouts?: WorkoutType[];
  coach_language?: CoachLanguage;
  coach_tone?: CoachTone;
  onboarding_completed?: boolean;
  bmr?: number;
  tdee?: number;
  created_at?: string;
  updated_at?: string;
  // Legacy aliases kept for internal UI use
  coachLanguage?: CoachLanguage;
  coachTone?: CoachTone;
}

// ─── Workout ─────────────────────────────────────────────────────────────────

export type WorkoutPhase = 'warmup' | 'peak' | 'recovery' | 'cooldown';
export type ExertionLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Exercise {
  name: string;
  muscles: string[];
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  weight?: number;
  // Derived id for UI tracking
  id: string;
}

export interface WorkoutDayPlan {
  is_rest: boolean;
  workout_type?: string;
  warm_up?: string[];
  exercises?: Exercise[];
  cool_down?: string[];
  ai_notes?: string;
  rest_motivation?: string;
}

export interface WeeklyPlanResponse {
  id: string;
  user_id: string;
  week_start_date: string;
  generated_at: string;
  plan_json: {
    week_start: string;
    days: Record<DayName, WorkoutDayPlan>;
  };
}

// Internal normalized day used by UI
export interface WorkoutDay {
  dayOfWeek: number;
  dayName: DayName;
  isRestDay: boolean;
  workout?: WorkoutPlan;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  type: string;
  durationMinutes: number;
  exercises: Exercise[];
  targetCalories?: number;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  plan_id?: string;
  started_at: string;
  completed_at?: string;
  duration_minutes?: number;
  calories_burned?: number;
  avg_heart_rate?: number;
  perceived_exertion?: number;
  exercises_completed?: ExerciseDone[];
  exercises_skipped?: string[];
  ai_summary?: string;
  created_at: string;
  // UI state (not persisted to backend)
  currentExerciseIndex?: number;
  currentSet?: number;
  exercisesCompletedCount?: number;
  exercisesSkippedCount?: number;
}

export interface ExerciseDone {
  name: string;
  sets_done: number;
  reps_done: number[];
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type InsightType = 'warning' | 'tip' | 'positive';

export interface FoodSearchResult {
  barcode?: string;
  name: string;
  brand?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

export interface FoodLogEntry {
  id: string;
  user_id: string;
  logged_at: string;
  meal_type: MealType;
  food_name: string;
  quantity_grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  source: 'barcode' | 'photo' | 'manual';
  barcode?: string;
  photo_url?: string;
  created_at: string;
}

export interface LogFoodRequest {
  logged_at?: string;
  meal_type: MealType;
  food_name: string;
  quantity_grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  source: 'barcode' | 'photo' | 'manual';
  barcode?: string;
}

export interface NutritionSummary {
  date: string;
  total_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  target_calories: number;
  target_percentage: number;
  water_ml: number;
  logs_by_meal: Record<MealType, FoodLogEntry[]>;
}

export interface NutritionInsight {
  id: string;
  user_id?: string;
  generated_at?: string;
  insight_text: string;
  insight_type: InsightType;
  read: boolean;
  created_at?: string;
}

export interface RecognizedFood {
  food_name: string;
  quantity_grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface PhotoFoodResponse {
  recognized_foods: RecognizedFood[];
  photo_url?: string;
  meal_type: MealType;
}

export interface DietPlanDay {
  is_training_day: boolean;
  target_calories: number;
  meals: Record<MealType, DietMeal>;
}

export interface DietMeal {
  description: string;
  foods: string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface DietPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  generated_at: string;
  plan_json: {
    days: Record<DayName, DietPlanDay>;
  };
}

// ─── Music ───────────────────────────────────────────────────────────────────

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album?: string;
  preview_url?: string;
  external_url?: string;
  duration_ms: number;
  tempo?: number;
  energy?: number;
}

export interface SpotifyRecommendationsResponse {
  phase: WorkoutPhase;
  tracks: SpotifyTrack[];
}

// ─── Coach ───────────────────────────────────────────────────────────────────

export type CoachEvent =
  | 'exercise_start'
  | 'mid_set'
  | 'rest_start'
  | 'rest_end'
  | 'workout_end'
  | 'set_complete';

export interface CoachMessageRequest {
  event: CoachEvent;
  exercise_name?: string;
  set_number?: number;
  rep_count?: number;
  heart_rate?: number;
  perceived_exertion?: number;
  elapsed_minutes?: number;
  last_user_input?: string | null;
  session_context?: Record<string, unknown>;
}

export interface CoachMessageResponse {
  text: string;
  event: CoachEvent;
}

export interface VoiceResponseRequest {
  transcribed_text: string;
  exercise_name?: string;
  set_number?: number;
  heart_rate?: number;
  perceived_exertion?: number;
  elapsed_minutes?: number;
  session_context?: Record<string, unknown>;
}

export type VoiceModificationAction = 'reduce_sets' | 'skip_exercise' | 'change_weight' | 'pause' | 'none';

export interface VoiceModification {
  action: VoiceModificationAction;
  exercise_name?: string;
  new_value?: unknown;
}

export interface VoiceResponseResult {
  text: string;
  modifications?: VoiceModification[];
}

// ─── Progress ────────────────────────────────────────────────────────────────

export interface WorkoutProgressResponse {
  calories_by_week: Record<string, number>;
  heart_rate_by_session: Array<{ session_id: string; avg_heart_rate: number; date: string }>;
  streak_days: number;
  total_sessions: number;
  total_minutes: number;
  sessions_this_week: number;
  calories_this_week: number;
}

export interface NutritionProgressResponse {
  period_days: number;
  avg_daily_calories: number;
  days_on_target: number;
  days_tracked: number;
  target_calories: number;
  daily_breakdown: Record<string, { calories: number; protein_g: number; carbs_g: number; fat_g: number }>;
  weekly_macros: Record<string, { protein_g: number; carbs_g: number; fat_g: number }>;
}

export interface WeeklySummaryResponse {
  summary: string;
  workout_stats: {
    total_sessions: number;
    total_minutes: number;
    total_calories_burned: number;
    avg_perceived_exertion: number;
  };
  nutrition_stats: {
    total_calories_logged: number;
    avg_daily_calories: number;
    total_protein_g: number;
    days_logged: number;
  };
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  WorkoutSession: { sessionId?: string };
  FoodLog: undefined;
  FoodSearch: undefined;
  BarcodeScanner: undefined;
  PhotoFood: undefined;
  DietPlan: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  ProfileSetup: undefined;
  Goals: undefined;
  FitnessLevel: undefined;
  CoachPrefs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Nutrition: undefined;
  Progress: undefined;
  Settings: undefined;
};

export type WorkoutStackParamList = {
  WorkoutSetup: { planId?: string };
  ActiveWorkout: { sessionId: string };
  RestTimer: { sessionId: string; restSeconds: number; nextExercise?: string };
  PostWorkout: { sessionId: string };
};
