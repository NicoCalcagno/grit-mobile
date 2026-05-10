import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/endpoints.dart';
import '../../../models/workout_model.dart';

class WorkoutState {
  final WeeklyPlanResponse? weeklyPlan;
  final WorkoutDayPlan? todayPlan;
  final WorkoutSession? activeSession;
  final bool isLoading;
  final bool isGenerating;
  final String? error;

  const WorkoutState({
    this.weeklyPlan,
    this.todayPlan,
    this.activeSession,
    this.isLoading = false,
    this.isGenerating = false,
    this.error,
  });

  WorkoutState copyWith({
    WeeklyPlanResponse? weeklyPlan,
    WorkoutDayPlan? todayPlan,
    WorkoutSession? activeSession,
    bool? isLoading,
    bool? isGenerating,
    String? error,
  }) {
    return WorkoutState(
      weeklyPlan: weeklyPlan ?? this.weeklyPlan,
      todayPlan: todayPlan ?? this.todayPlan,
      activeSession: activeSession ?? this.activeSession,
      isLoading: isLoading ?? this.isLoading,
      isGenerating: isGenerating ?? this.isGenerating,
      error: error,
    );
  }
}

class WorkoutNotifier extends StateNotifier<WorkoutState> {
  WorkoutNotifier(this._ref) : super(const WorkoutState());

  final Ref _ref;

  Future<void> fetchWeeklyPlan() async {
    state = state.copyWith(isLoading: true);
    try {
      final dio = _ref.read(apiClientProvider);
      final res = await dio.get(Endpoints.weeklyPlanCurrent);
      final plan = WeeklyPlanResponse.fromJson(res.data as Map<String, dynamic>);
      final todayKey = _todayKey();
      final todayPlan = plan.days[todayKey];
      state = state.copyWith(weeklyPlan: plan, todayPlan: todayPlan, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> generateWeeklyPlan() async {
    state = state.copyWith(isGenerating: true);
    try {
      final dio = _ref.read(apiClientProvider);
      final res = await dio.post(Endpoints.weeklyPlanGenerate);
      final plan = WeeklyPlanResponse.fromJson(res.data as Map<String, dynamic>);
      final todayPlan = plan.days[_todayKey()];
      state = state.copyWith(weeklyPlan: plan, todayPlan: todayPlan, isGenerating: false);
    } catch (_) {
      state = state.copyWith(isGenerating: false);
    }
  }

  Future<void> startSession({String? planId}) async {
    try {
      final dio = _ref.read(apiClientProvider);
      final res = await dio.post(Endpoints.sessions, data: {'plan_id': planId});
      final session = WorkoutSession.fromJson(res.data as Map<String, dynamic>);
      state = state.copyWith(activeSession: session);
    } catch (_) {}
  }

  Future<void> completeSession(String sessionId, Map<String, dynamic> data) async {
    try {
      final dio = _ref.read(apiClientProvider);
      await dio.post(Endpoints.sessionComplete(sessionId), data: data);
      state = state.copyWith(activeSession: null);
    } catch (_) {}
  }

  String _todayKey() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days[DateTime.now().weekday - 1];
  }
}

final workoutProvider = StateNotifierProvider<WorkoutNotifier, WorkoutState>(
  (ref) => WorkoutNotifier(ref),
);
