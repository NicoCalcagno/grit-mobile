import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/endpoints.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../models/user_model.dart';

const _fitnessGoalJsonValues = {
  FitnessGoal.muscleGain: 'muscle_gain',
  FitnessGoal.fatLoss: 'fat_loss',
  FitnessGoal.endurance: 'endurance',
  FitnessGoal.wellness: 'wellness',
  FitnessGoal.flexibility: 'flexibility',
};

class OnboardingData {
  final int age;
  final double weightKg;
  final double heightCm;
  final String gender;
  final List<FitnessGoal> goals;
  final FitnessLevel fitnessLevel;
  final CoachTone coachTone;
  final CoachLanguage coachLanguage;

  const OnboardingData({
    this.age = 25,
    this.weightKg = 70,
    this.heightCm = 170,
    this.gender = 'male',
    this.goals = const [],
    this.fitnessLevel = FitnessLevel.intermediate,
    this.coachTone = CoachTone.motivating,
    this.coachLanguage = CoachLanguage.it,
  });

  OnboardingData copyWith({
    int? age, double? weightKg, double? heightCm, String? gender,
    List<FitnessGoal>? goals, FitnessLevel? fitnessLevel,
    CoachTone? coachTone, CoachLanguage? coachLanguage,
  }) {
    return OnboardingData(
      age: age ?? this.age,
      weightKg: weightKg ?? this.weightKg,
      heightCm: heightCm ?? this.heightCm,
      gender: gender ?? this.gender,
      goals: goals ?? this.goals,
      fitnessLevel: fitnessLevel ?? this.fitnessLevel,
      coachTone: coachTone ?? this.coachTone,
      coachLanguage: coachLanguage ?? this.coachLanguage,
    );
  }
}

class OnboardingNotifier extends StateNotifier<OnboardingData> {
  OnboardingNotifier(this._ref) : super(const OnboardingData());

  final Ref _ref;

  void updateProfile({required int age, required double weightKg, required double heightCm, required String gender}) {
    state = state.copyWith(age: age, weightKg: weightKg, heightCm: heightCm, gender: gender);
  }

  void updateGoals(List<FitnessGoal> goals) {
    state = state.copyWith(goals: goals);
  }

  void updateFitnessLevel(FitnessLevel level) {
    state = state.copyWith(fitnessLevel: level);
  }

  void updateCoachPrefs({required CoachTone tone, required CoachLanguage language}) {
    state = state.copyWith(coachTone: tone, coachLanguage: language);
  }

  Future<void> save() async {
    final dio = _ref.read(apiClientProvider);
    await dio.put(Endpoints.me, data: {
      'age': state.age,
      'weight_kg': state.weightKg,
      'height_cm': state.heightCm,
      'gender': state.gender,
      'goals': state.goals.map((g) => _fitnessGoalJsonValues[g]!).toList(),
      'fitness_level': state.fitnessLevel.name,
      'coach_tone': state.coachTone.name,
      'coach_language': state.coachLanguage.name,
      'onboarding_completed': true,
    });
    final storage = _ref.read(secureStorageProvider);
    await storage.setOnboardingComplete();
  }
}

final onboardingProvider = StateNotifierProvider<OnboardingNotifier, OnboardingData>(
  (ref) => OnboardingNotifier(ref),
);
