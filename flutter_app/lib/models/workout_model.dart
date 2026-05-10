import 'package:freezed_annotation/freezed_annotation.dart';

part 'workout_model.freezed.dart';
part 'workout_model.g.dart';

enum WorkoutPhase { warmup, peak, recovery, cooldown }

@freezed
class Exercise with _$Exercise {
  const factory Exercise({
    required String id,
    required String name,
    @Default([]) List<String> muscles,
    @Default(3) int sets,
    @Default('10') String reps,
    @Default(60) int restSeconds,
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
    @Default(0) int durationMinutes,
    @Default([]) List<Exercise> exercises,
    int? targetCalories,
  }) = _WorkoutPlan;

  factory WorkoutPlan.fromJson(Map<String, dynamic> json) =>
      _$WorkoutPlanFromJson(json);
}

@freezed
class WorkoutDayPlan with _$WorkoutDayPlan {
  const factory WorkoutDayPlan({
    @Default(false) bool isRest,
    String? workoutType,
    @Default([]) List<String> warmUp,
    @Default([]) List<Exercise> exercises,
    @Default([]) List<String> coolDown,
    String? aiNotes,
    String? restMotivation,
  }) = _WorkoutDayPlan;

  factory WorkoutDayPlan.fromJson(Map<String, dynamic> json) =>
      _$WorkoutDayPlanFromJson(json);
}

@freezed
class WeeklyPlanResponse with _$WeeklyPlanResponse {
  const factory WeeklyPlanResponse({
    required String id,
    required String userId,
    required String weekStartDate,
    required String generatedAt,
    required Map<String, WorkoutDayPlan> days,
  }) = _WeeklyPlanResponse;

  factory WeeklyPlanResponse.fromJson(Map<String, dynamic> json) =>
      _$WeeklyPlanResponseFromJson(json);
}

@freezed
class WorkoutSession with _$WorkoutSession {
  const factory WorkoutSession({
    required String id,
    required String userId,
    String? planId,
    required String startedAt,
    String? completedAt,
    int? durationMinutes,
    int? caloriesBurned,
    double? avgHeartRate,
    int? perceivedExertion,
    String? aiSummary,
    @Default(0) int currentExerciseIndex,
    @Default(1) int currentSet,
  }) = _WorkoutSession;

  factory WorkoutSession.fromJson(Map<String, dynamic> json) =>
      _$WorkoutSessionFromJson(json);
}
