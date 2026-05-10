import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/widgets/grit_button.dart';
import '../../../core/widgets/grit_text_field.dart';
import '../providers/nutrition_provider.dart';

class FoodLogScreen extends ConsumerStatefulWidget {
  const FoodLogScreen({super.key, required this.mealType});
  final String mealType;

  @override
  ConsumerState<FoodLogScreen> createState() => _FoodLogScreenState();
}

class _FoodLogScreenState extends ConsumerState<FoodLogScreen> {
  final _nameCtrl = TextEditingController();
  final _gramsCtrl = TextEditingController(text: '100');
  final _calCtrl = TextEditingController();
  final _protCtrl = TextEditingController();
  final _carbsCtrl = TextEditingController();
  final _fatCtrl = TextEditingController();
  bool _isLogging = false;

  @override
  void dispose() {
    for (final c in [_nameCtrl, _gramsCtrl, _calCtrl, _protCtrl, _carbsCtrl, _fatCtrl]) c.dispose();
    super.dispose();
  }

  Future<void> _log() async {
    if (_nameCtrl.text.isEmpty || _calCtrl.text.isEmpty) return;
    setState(() => _isLogging = true);
    await ref.read(nutritionProvider.notifier).logFood({
      'meal_type': widget.mealType,
      'food_name': _nameCtrl.text.trim(),
      'quantity_grams': double.tryParse(_gramsCtrl.text) ?? 100,
      'calories': double.tryParse(_calCtrl.text) ?? 0,
      'protein_g': double.tryParse(_protCtrl.text) ?? 0,
      'carbs_g': double.tryParse(_carbsCtrl.text) ?? 0,
      'fat_g': double.tryParse(_fatCtrl.text) ?? 0,
      'source': 'manual',
    });
    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final mealLabel = _mealLabel(widget.mealType);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Aggiungi a $mealLabel'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner_rounded, color: AppColors.primary),
            onPressed: () => context.push('/nutrition/search'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.screenPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Quick search
            GestureDetector(
              onTap: () => context.push('/nutrition/search'),
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.base),
                decoration: BoxDecoration(
                  color: AppColors.surfaceElevated,
                  borderRadius: BorderRadius.circular(AppSpacing.inputRadius),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
                    const Gap(AppSpacing.sm),
                    Text('Cerca alimento...', style: Theme.of(context).textTheme.bodyMedium),
                  ],
                ),
              ),
            ).animate().fadeIn(),
            const Gap(AppSpacing.xl),
            Text('Inserimento manuale', style: Theme.of(context).textTheme.headlineSmall),
            const Gap(AppSpacing.base),
            GritTextField(controller: _nameCtrl, label: 'Nome alimento', autofocus: true)
                .animate().fadeIn(delay: 100.ms),
            const Gap(AppSpacing.base),
            GritTextField(controller: _gramsCtrl, label: 'Quantità (g)', keyboardType: const TextInputType.numberWithOptions(decimal: true))
                .animate().fadeIn(delay: 120.ms),
            const Gap(AppSpacing.base),
            GritTextField(controller: _calCtrl, label: 'Calorie (kcal)', keyboardType: const TextInputType.numberWithOptions(decimal: true))
                .animate().fadeIn(delay: 140.ms),
            const Gap(AppSpacing.base),
            Row(
              children: [
                Expanded(child: GritTextField(controller: _protCtrl, label: 'Proteine (g)', keyboardType: const TextInputType.numberWithOptions(decimal: true))),
                const Gap(AppSpacing.sm),
                Expanded(child: GritTextField(controller: _carbsCtrl, label: 'Carboidrati (g)', keyboardType: const TextInputType.numberWithOptions(decimal: true))),
                const Gap(AppSpacing.sm),
                Expanded(child: GritTextField(controller: _fatCtrl, label: 'Grassi (g)', keyboardType: const TextInputType.numberWithOptions(decimal: true))),
              ],
            ).animate().fadeIn(delay: 160.ms),
            const Gap(AppSpacing.xxl),
            GritButton(
              label: 'Aggiungi al pasto',
              icon: Icons.add_rounded,
              isLoading: _isLogging,
              onPressed: _log,
            ).animate().fadeIn(delay: 200.ms),
          ],
        ),
      ),
    );
  }

  String _mealLabel(String type) {
    switch (type) {
      case 'breakfast': return 'Colazione';
      case 'lunch': return 'Pranzo';
      case 'dinner': return 'Cena';
      default: return 'Snack';
    }
  }
}
