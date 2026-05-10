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
    double? weightKg,
    double? heightCm,
    String? gender,
    FitnessLevel? fitnessLevel,
    List<FitnessGoal>? goals,
    List<String>? availableDays,
    List<WorkoutType>? preferredWorkouts,
    CoachLanguage? coachLanguage,
    CoachTone? coachTone,
    @Default(false) bool onboardingCompleted,
    double? bmr,
    double? tdee,
    String? createdAt,
    String? updatedAt,
  }) = _UserProfile;

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);
}

@freezed
class AuthTokens with _$AuthTokens {
  const factory AuthTokens({
    required String accessToken,
    required String refreshToken,
    String? expiresAt,
    String? userId,
  }) = _AuthTokens;

  factory AuthTokens.fromJson(Map<String, dynamic> json) =>
      _$AuthTokensFromJson(json);
}
