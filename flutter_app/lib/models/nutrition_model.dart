import 'package:freezed_annotation/freezed_annotation.dart';

part 'nutrition_model.freezed.dart';
part 'nutrition_model.g.dart';

enum MealType {
  @JsonValue('breakfast') breakfast,
  @JsonValue('lunch') lunch,
  @JsonValue('dinner') dinner,
  @JsonValue('snack') snack,
}

@freezed
class FoodLogEntry with _$FoodLogEntry {
  const factory FoodLogEntry({
    required String id,
    required String userId,
    required String loggedAt,
    required MealType mealType,
    required String foodName,
    required double quantityGrams,
    required double calories,
    required double proteinG,
    required double carbsG,
    required double fatG,
    required String source,
    String? barcode,
    String? photoUrl,
    String? createdAt,
  }) = _FoodLogEntry;

  factory FoodLogEntry.fromJson(Map<String, dynamic> json) =>
      _$FoodLogEntryFromJson(json);
}

@freezed
class NutritionSummary with _$NutritionSummary {
  const factory NutritionSummary({
    required String date,
    @Default(0) double totalCalories,
    @Default(0) double proteinG,
    @Default(0) double carbsG,
    @Default(0) double fatG,
    @Default(2000) double targetCalories,
    @Default(0) double targetPercentage,
    @Default(0) double waterMl,
    @Default({}) Map<String, List<FoodLogEntry>> logsByMeal,
  }) = _NutritionSummary;

  factory NutritionSummary.fromJson(Map<String, dynamic> json) =>
      _$NutritionSummaryFromJson(json);
}

@freezed
class FoodSearchResult with _$FoodSearchResult {
  const factory FoodSearchResult({
    String? barcode,
    required String name,
    String? brand,
    required double caloriesPer100g,
    required double proteinPer100g,
    required double carbsPer100g,
    required double fatPer100g,
  }) = _FoodSearchResult;

  factory FoodSearchResult.fromJson(Map<String, dynamic> json) =>
      _$FoodSearchResultFromJson(json);
}

@freezed
class NutritionInsight with _$NutritionInsight {
  const factory NutritionInsight({
    required String id,
    required String insightText,
    required String insightType,
    @Default(false) bool read,
    String? createdAt,
  }) = _NutritionInsight;

  factory NutritionInsight.fromJson(Map<String, dynamic> json) =>
      _$NutritionInsightFromJson(json);
}

@freezed
class DietMeal with _$DietMeal {
  const factory DietMeal({
    required String description,
    @Default([]) List<String> foods,
    required double calories,
    required double proteinG,
    required double carbsG,
    required double fatG,
  }) = _DietMeal;

  factory DietMeal.fromJson(Map<String, dynamic> json) =>
      _$DietMealFromJson(json);
}
