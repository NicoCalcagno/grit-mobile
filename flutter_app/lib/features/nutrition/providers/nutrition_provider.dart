import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/endpoints.dart';
import '../../../models/nutrition_model.dart';

class NutritionState {
  final NutritionSummary? summary;
  final List<NutritionInsight> insights;
  final List<FoodSearchResult> searchResults;
  final bool isLoading;
  final bool isSearching;
  final String? error;

  const NutritionState({
    this.summary,
    this.insights = const [],
    this.searchResults = const [],
    this.isLoading = false,
    this.isSearching = false,
    this.error,
  });

  NutritionState copyWith({
    NutritionSummary? summary,
    List<NutritionInsight>? insights,
    List<FoodSearchResult>? searchResults,
    bool? isLoading,
    bool? isSearching,
    String? error,
  }) {
    return NutritionState(
      summary: summary ?? this.summary,
      insights: insights ?? this.insights,
      searchResults: searchResults ?? this.searchResults,
      isLoading: isLoading ?? this.isLoading,
      isSearching: isSearching ?? this.isSearching,
      error: error,
    );
  }
}

class NutritionNotifier extends StateNotifier<NutritionState> {
  NutritionNotifier(this._ref) : super(const NutritionState());

  final Ref _ref;

  Future<void> fetchSummary({String? date}) async {
    state = state.copyWith(isLoading: true);
    try {
      final dio = _ref.read(apiClientProvider);
      final d = date ?? DateFormat('yyyy-MM-dd').format(DateTime.now());
      final res = await dio.get(Endpoints.nutritionSummary, queryParameters: {'date': d});
      final summary = NutritionSummary.fromJson(res.data as Map<String, dynamic>);
      state = state.copyWith(summary: summary, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> fetchInsights() async {
    try {
      final dio = _ref.read(apiClientProvider);
      final res = await dio.get(Endpoints.nutritionInsights);
      final list = (res.data as List).map((e) => NutritionInsight.fromJson(e as Map<String, dynamic>)).toList();
      state = state.copyWith(insights: list);
    } catch (_) {}
  }

  Future<void> searchFood(String query) async {
    if (query.isEmpty) {
      state = state.copyWith(searchResults: []);
      return;
    }
    state = state.copyWith(isSearching: true);
    try {
      final dio = _ref.read(apiClientProvider);
      final res = await dio.get(Endpoints.foodSearch, queryParameters: {'q': query});
      final results = ((res.data['results'] ?? res.data) as List)
          .map((e) => FoodSearchResult.fromJson(e as Map<String, dynamic>))
          .toList();
      state = state.copyWith(searchResults: results, isSearching: false);
    } catch (_) {
      state = state.copyWith(isSearching: false);
    }
  }

  Future<void> logFood(Map<String, dynamic> data) async {
    try {
      final dio = _ref.read(apiClientProvider);
      await dio.post(Endpoints.nutritionLogs, data: data);
      await fetchSummary();
    } catch (_) {}
  }

  Future<void> deleteLog(String logId) async {
    try {
      final dio = _ref.read(apiClientProvider);
      await dio.delete(Endpoints.deleteLog(logId));
      await fetchSummary();
    } catch (_) {}
  }

  Future<void> logWater({int amountMl = 250}) async {
    try {
      final dio = _ref.read(apiClientProvider);
      await dio.post(Endpoints.water, data: {'amount_ml': amountMl});
      await fetchSummary();
    } catch (_) {}
  }
}

final nutritionProvider = StateNotifierProvider<NutritionNotifier, NutritionState>(
  (ref) => NutritionNotifier(ref),
);
