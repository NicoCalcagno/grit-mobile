abstract class Endpoints {
  // Auth
  static const login = '/auth/login';
  static const register = '/auth/register';
  static const refresh = '/auth/refresh';
  static const logout = '/auth/logout';

  // User
  static const me = '/users/me';

  // Workouts
  static const weeklyPlanCurrent = '/workouts/weekly-plan/current';
  static const weeklyPlanGenerate = '/workouts/weekly-plan/generate';
  static const sessions = '/workouts/sessions';
  static String sessionComplete(String id) => '/workouts/sessions/$id/complete';
  static String sessionById(String id) => '/workouts/sessions/$id';

  // Nutrition
  static const nutritionSummary = '/nutrition/summary';
  static const nutritionInsights = '/nutrition/insights';
  static const dietPlanCurrent = '/nutrition/diet-plan/current';
  static const dietPlanGenerate = '/nutrition/diet-plan/generate';
  static const nutritionLogs = '/nutrition/logs';
  static const nutritionLogsPhoto = '/nutrition/logs/photo';
  static const water = '/nutrition/water';
  static String insightRead(String id) => '/nutrition/insights/$id/read';
  static String deleteLog(String id) => '/nutrition/logs/$id';

  // Food
  static const foodSearch = '/food/search';
  static String foodBarcode(String barcode) => '/food/barcode/$barcode';

  // Spotify
  static const spotifyAuthUrl = '/spotify/auth-url';
  static const spotifyCallback = '/spotify/callback';
  static const spotifyStatus = '/spotify/status';
  static const spotifyTokens = '/spotify/tokens';
  static const spotifyRecommendations = '/spotify/recommendations';

  // Coach
  static const coachMessage = '/coach/message';
  static const coachVoiceResponse = '/coach/voice-response';
}
