import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/onboarding/screens/welcome_screen.dart';
import '../../features/onboarding/screens/profile_setup_screen.dart';
import '../../features/onboarding/screens/goals_screen.dart';
import '../../features/onboarding/screens/fitness_level_screen.dart';
import '../../features/onboarding/screens/coach_prefs_screen.dart';
import '../../features/shell/main_shell.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/workout/screens/workout_dashboard_screen.dart';
import '../../features/workout/screens/active_workout_screen.dart';
import '../../features/nutrition/screens/nutrition_dashboard_screen.dart';
import '../../features/nutrition/screens/food_log_screen.dart';
import '../../features/nutrition/screens/food_search_screen.dart';
import '../../features/progress/screens/progress_screen.dart';
import '../../features/settings/screens/settings_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/home',
    redirect: (context, state) {
      return authState.when(
        initial: () => null,
        loading: () => null,
        authenticated: (user) {
          final isAuthRoute = state.matchedLocation.startsWith('/login') ||
              state.matchedLocation.startsWith('/register');
          if (isAuthRoute) return '/home';
          if (!user.onboardingCompleted &&
              !state.matchedLocation.startsWith('/onboarding')) {
            return '/onboarding/welcome';
          }
          return null;
        },
        unauthenticated: () {
          final isAuthRoute = state.matchedLocation.startsWith('/login') ||
              state.matchedLocation.startsWith('/register');
          return isAuthRoute ? null : '/login';
        },
        error: (_) => '/login',
      );
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(
        path: '/onboarding',
        redirect: (_, __) => '/onboarding/welcome',
        routes: [
          GoRoute(path: 'welcome', builder: (_, __) => const WelcomeScreen()),
          GoRoute(path: 'profile', builder: (_, __) => const ProfileSetupScreen()),
          GoRoute(path: 'goals', builder: (_, __) => const GoalsScreen()),
          GoRoute(path: 'fitness-level', builder: (_, __) => const FitnessLevelScreen()),
          GoRoute(path: 'coach-prefs', builder: (_, __) => const CoachPrefsScreen()),
        ],
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
          GoRoute(
            path: '/workout',
            builder: (_, __) => const WorkoutDashboardScreen(),
            routes: [
              GoRoute(
                path: 'active',
                builder: (_, state) => ActiveWorkoutScreen(
                  planId: state.uri.queryParameters['planId'],
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/nutrition',
            builder: (_, __) => const NutritionDashboardScreen(),
            routes: [
              GoRoute(
                path: 'log',
                builder: (_, state) => FoodLogScreen(
                  mealType: state.uri.queryParameters['meal'] ?? 'lunch',
                ),
              ),
              GoRoute(path: 'search', builder: (_, __) => const FoodSearchScreen()),
            ],
          ),
          GoRoute(path: '/progress', builder: (_, __) => const ProgressScreen()),
          GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
        ],
      ),
    ],
  );
});
