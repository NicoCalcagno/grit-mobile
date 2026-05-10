import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

enum FitnessGoal {
  @JsonValue('muscle_gain') muscleGain,
  @JsonValue('fat_loss') fatLoss,
  @JsonValue('endurance') endurance,
  @JsonValue('wellness') wellness,
  @JsonValue('flexibility') flexibility,
}

enum FitnessLevel {
  @JsonValue('sedentary') sedentary,
  @JsonValue('beginner') beginner,
  @JsonValue('intermediate') intermediate,
  @JsonValue('advanced') advanced,
  @JsonValue('athlete') athlete,
}

enum WorkoutType {
  @JsonValue('strength') strength,
  @JsonValue('cardio') cardio,
  @JsonValue('hiit') hiit,
  @JsonValue('yoga') yoga,
  @JsonValue('pilates') pilates,
  @JsonValue('stretching') stretching,
}

enum CoachTone {
  @JsonValue('motivating') motivating,
  @JsonValue('aggressive') aggressive,
  @JsonValue('zen') zen,
}

enum CoachLanguage {
  @JsonValue('it') it,
  @JsonValue('en') en,
}

@freezed
class UserProfile with _$UserProfile {
  const factory UserProfile({
    required String id,
    String? email,
    required String name,
    int? age,
    @JsonKey(name: 'weight_kg') double? weightKg,
    @JsonKey(name: 'height_cm') double? heightCm,
    String? gender,
    @JsonKey(name: 'fitness_level') FitnessLevel? fitnessLevel,
    List<FitnessGoal>? goals,
    @JsonKey(name: 'available_days') List<String>? availableDays,
    @JsonKey(name: 'preferred_workouts') List<WorkoutType>? preferredWorkouts,
    @JsonKey(name: 'coach_language') CoachLanguage? coachLanguage,
    @JsonKey(name: 'coach_tone') CoachTone? coachTone,
    @JsonKey(name: 'onboarding_completed') @Default(false) bool onboardingCompleted,
    double? bmr,
    double? tdee,
    @JsonKey(name: 'created_at') String? createdAt,
    @JsonKey(name: 'updated_at') String? updatedAt,
  }) = _UserProfile;

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);
}

@freezed
class AuthTokens with _$AuthTokens {
  const factory AuthTokens({
    @JsonKey(name: 'access_token') required String accessToken,
    @JsonKey(name: 'refresh_token') required String refreshToken,
    @JsonKey(name: 'expires_at') String? expiresAt,
    @JsonKey(name: 'user_id') int? userId,
  }) = _AuthTokens;

  factory AuthTokens.fromJson(Map<String, dynamic> json) =>
      _$AuthTokensFromJson(json);
}
