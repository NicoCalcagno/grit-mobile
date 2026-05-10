import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../providers/nutrition_provider.dart';
import '../../../models/nutrition_model.dart';

class FoodSearchScreen extends ConsumerStatefulWidget {
  const FoodSearchScreen({super.key});

  @override
  ConsumerState<FoodSearchScreen> createState() => _FoodSearchScreenState();
}

class _FoodSearchScreenState extends ConsumerState<FoodSearchScreen> {
  final _ctrl = TextEditingController();
  Timer? _debounce;

  @override
  void dispose() {
    _ctrl.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearch(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      ref.read(nutritionProvider.notifier).searchFood(query);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(nutritionProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: TextField(
          controller: _ctrl,
          onChanged: _onSearch,
          autofocus: true,
          style: const TextStyle(fontFamily: 'Inter', fontSize: 16, color: AppColors.textPrimary),
          decoration: const InputDecoration(
            hintText: 'Cerca alimento...',
            hintStyle: TextStyle(color: AppColors.textMuted),
            border: InputBorder.none,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: state.isSearching
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2))
          : state.searchResults.isEmpty
              ? _EmptyState(hasQuery: _ctrl.text.isNotEmpty)
              : ListView.separated(
                  itemCount: state.searchResults.length,
                  separatorBuilder: (_, __) => const Divider(color: AppColors.border, height: 0.5),
                  itemBuilder: (context, i) => _FoodResultTile(
                    result: state.searchResults[i],
                    onTap: () => _showAddSheet(context, state.searchResults[i]),
                  ).animate().fadeIn(delay: Duration(milliseconds: i * 40)),
                ),
    );
  }

  void _showAddSheet(BuildContext context, FoodSearchResult result) {
    final gramsCtrl = TextEditingController(text: '100');
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceElevated,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.cardRadiusLg)),
      ),
      isScrollControlled: true,
      builder: (_) => Padding(
        padding: EdgeInsets.only(
          left: AppSpacing.screenPadding,
          right: AppSpacing.screenPadding,
          top: AppSpacing.lg,
          bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.lg,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(result.name, style: Theme.of(context).textTheme.headlineMedium),
            if (result.brand != null)
              Text(result.brand!, style: Theme.of(context).textTheme.bodyMedium),
            const Gap(AppSpacing.base),
            Row(
              children: [
                _NutriBadge(label: '${result.caloriesPer100g.round()} kcal', color: AppColors.primary),
                const Gap(AppSpacing.sm),
                _NutriBadge(label: 'P ${result.proteinPer100g.round()}g', color: AppColors.protein),
                const Gap(AppSpacing.sm),
                _NutriBadge(label: 'C ${result.carbsPer100g.round()}g', color: AppColors.carbs),
                const Gap(AppSpacing.sm),
                _NutriBadge(label: 'G ${result.fatPer100g.round()}g', color: AppColors.fat),
              ],
            ),
            const Gap(AppSpacing.lg),
            TextField(
              controller: gramsCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              style: const TextStyle(fontFamily: 'Inter', fontSize: 16, color: AppColors.textPrimary),
              decoration: InputDecoration(
                labelText: 'Quantità (g)',
                labelStyle: const TextStyle(color: AppColors.textMuted),
                filled: true,
                fillColor: AppColors.background,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.inputRadius),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.inputRadius),
                  borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                ),
              ),
            ),
            const Gap(AppSpacing.base),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
                ),
                child: MaterialButton(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.buttonRadius)),
                  onPressed: () {
                    final grams = double.tryParse(gramsCtrl.text) ?? 100;
                    final factor = grams / 100;
                    ref.read(nutritionProvider.notifier).logFood({
                      'meal_type': 'lunch',
                      'food_name': result.name,
                      'quantity_grams': grams,
                      'calories': result.caloriesPer100g * factor,
                      'protein_g': result.proteinPer100g * factor,
                      'carbs_g': result.carbsPer100g * factor,
                      'fat_g': result.fatPer100g * factor,
                      'source': 'manual',
                      if (result.barcode != null) 'barcode': result.barcode,
                    });
                    Navigator.pop(context);
                    context.pop();
                  },
                  child: const Text('Aggiungi', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700, color: Colors.black)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FoodResultTile extends StatelessWidget {
  const _FoodResultTile({required this.result, required this.onTap});
  final FoodSearchResult result;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      tileColor: Colors.transparent,
      title: Text(result.name, style: Theme.of(context).textTheme.titleMedium),
      subtitle: result.brand != null ? Text(result.brand!, style: Theme.of(context).textTheme.bodySmall) : null,
      trailing: Text(
        '${result.caloriesPer100g.round()}\nkcal/100g',
        textAlign: TextAlign.right,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.primary),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.hasQuery});
  final bool hasQuery;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(hasQuery ? '🔍' : '🍎', style: const TextStyle(fontSize: 48)),
          const Gap(AppSpacing.base),
          Text(
            hasQuery ? 'Nessun alimento trovato' : 'Cerca un alimento',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const Gap(AppSpacing.sm),
          Text(
            hasQuery ? 'Prova con un termine diverso' : 'Es: “Pasta”, “Pollo”, “Mela”',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}

class _NutriBadge extends StatelessWidget {
  const _NutriBadge({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(label, style: TextStyle(fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w600, color: color)),
    );
  }
}
