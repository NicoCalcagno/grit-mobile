import 'package:freezed_annotation/freezed_annotation.dart';

part 'workout_model.freezed.dart';
part 'workout_model.g.dart';

enum WorkoutPhase { warmup, peak, recovery, cooldown }

@freezed
class Exercise with _$Exercise {
  const factory Exercise({
    @Default('') String id,
    required String name,
    @Default([]) List<String> muscles,
    @Default(3) int sets,
    @Default('10') String reps,
    @JsonKey(name: 'rest_seconds') @Default(60) int restSeconds,
    String? notes,
    double? weight,
  }) = _Exercise;

  factory Exercise.fromJson(Map<String, dynamic> json) =>
      _$ExerciseFromJson(json);
}

@freezed
class WorkoutPlan with _$WorkoutPlan {
  const factory WorkoutPlan({
    required String id,
    required String name,
    required String type,
    @JsonKey(name: 'duration_minutes') @Default(0) int durationMinutes,
    @Default([]) List<Exercise> exercises,
    @JsonKey(name: 'target_calories') int? targetCalories,
  }) = _WorkoutPlan;

  factory WorkoutPlan.fromJson(Map<String, dynamic> json) =>
      _$WorkoutPlanFromJson(json);
}

@freezed
class WorkoutDayPlan with _$WorkoutDayPlan {
  const factory WorkoutDayPlan({
    @JsonKey(name: 'is_rest') @Default(false) bool isRest,
    @JsonKey(name: 'workout_type') String? workoutType,
    @JsonKey(name: 'warm_up') @Default([]) List<String> warmUp,
    @Default([]) List<Exercise> exercises,
    @JsonKey(name: 'cool_down') @Default([]) List<String> coolDown,
    @JsonKey(name: 'ai_notes') String? aiNotes,
    @JsonKey(name: 'rest_motivation') String? restMotivation,
  }) = _WorkoutDayPlan;

  factory WorkoutDayPlan.fromJson(Map<String, dynamic> json) =>
      _$WorkoutDayPlanFromJson(json);
}

@freezed
class WeeklyPlanResponse with _$WeeklyPlanResponse {
  const factory WeeklyPlanResponse({
    required String id,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'week_start_date') required String weekStartDate,
    @JsonKey(name: 'generated_at') required String generatedAt,
    required Map<String, WorkoutDayPlan> days,
  }) = _WeeklyPlanResponse;

  factory WeeklyPlanResponse.fromJson(Map<String, dynamic> json) =>
      _$WeeklyPlanResponseFromJson(json);
}

@freezed
class WorkoutSession with _$WorkoutSession {
  const factory WorkoutSession({
    required String id,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'plan_id') String? planId,
    @JsonKey(name: 'started_at') required String startedAt,
    @JsonKey(name: 'completed_at') String? completedAt,
    @JsonKey(name: 'duration_minutes') int? durationMinutes,
    @JsonKey(name: 'calories_burned') int? caloriesBurned,
    @JsonKey(name: 'avg_heart_rate') double? avgHeartRate,
    @JsonKey(name: 'perceived_exertion') int? perceivedExertion,
    @JsonKey(name: 'ai_summary') String? aiSummary,
    @Default(0) int currentExerciseIndex,
    @Default(1) int currentSet,
  }) = _WorkoutSession;

  factory WorkoutSession.fromJson(Map<String, dynamic> json) =>
      _$WorkoutSessionFromJson(json);
}
