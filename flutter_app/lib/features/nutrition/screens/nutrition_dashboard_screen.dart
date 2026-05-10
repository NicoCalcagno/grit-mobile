import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../providers/nutrition_provider.dart';
import '../../../models/nutrition_model.dart';

class NutritionDashboardScreen extends ConsumerStatefulWidget {
  const NutritionDashboardScreen({super.key});

  @override
  ConsumerState<NutritionDashboardScreen> createState() => _NutritionDashboardScreenState();
}

class _NutritionDashboardScreenState extends ConsumerState<NutritionDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(nutritionProvider.notifier).fetchSummary());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(nutritionProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: AppColors.background,
            pinned: true,
            title: const Text('Nutrizione', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w800, letterSpacing: -0.5)),
            actions: [
              IconButton(
                icon: const Icon(Icons.add_rounded, color: AppColors.primary),
                onPressed: () => context.push('/nutrition/log'),
              ),
            ],
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Macro donut
                _MacroDonutCard(state: state).animate().fadeIn(duration: 500.ms),
                const Gap(AppSpacing.base),
                // Water
                _WaterCard(waterMl: state.summary?.waterMl ?? 0).animate().fadeIn(delay: 100.ms),
                const Gap(AppSpacing.xl),
                // Weekly calories chart
                _SectionHeader(title: 'CALORIE SETTIMANALI'),
                const Gap(AppSpacing.sm),
                _WeeklyCalChart(target: state.summary?.targetCalories ?? 2000).animate().fadeIn(delay: 150.ms),
                const Gap(AppSpacing.xl),
                // Meals
                _SectionHeader(title: 'PASTI DI OGGI'),
                const Gap(AppSpacing.sm),
                ..._buildMeals(context, state),
                const Gap(AppSpacing.xxxl),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildMeals(BuildContext context, NutritionState state) {
    const meals = [
      (type: 'breakfast', label: 'Colazione', emoji: '☕'),
      (type: 'lunch', label: 'Pranzo', emoji: '🍝'),
      (type: 'dinner', label: 'Cena', emoji: '🍽️'),
      (type: 'snack', label: 'Snack', emoji: '🍎'),
    ];

    return meals.indexed.map((indexed) {
      final (i, meal) = indexed;
      final entries = state.summary?.logsByMeal[meal.type] ?? [];
      return Padding(
        padding: const EdgeInsets.only(bottom: AppSpacing.sm),
        child: _MealCard(
          emoji: meal.emoji,
          label: meal.label,
          entries: entries,
          onAdd: () => context.push('/nutrition/log?meal=${meal.type}'),
          onDelete: (id) => ref.read(nutritionProvider.notifier).deleteLog(id),
        ),
      ).animate().fadeIn(delay: Duration(milliseconds: 200 + i * 60));
    }).toList();
  }
}

class _MacroDonutCard extends StatelessWidget {
  const _MacroDonutCard({required this.state});
  final NutritionState state;

  @override
  Widget build(BuildContext context) {
    final s = state.summary;
    final total = (s?.proteinG ?? 0) + (s?.carbsG ?? 0) + (s?.fatG ?? 0);
    final prot = total > 0 ? (s?.proteinG ?? 0) / total : 0.33;
    final carbs = total > 0 ? (s?.carbsG ?? 0) / total : 0.34;
    final fat = total > 0 ? (s?.fatG ?? 0) / total : 0.33;
    final consumed = s?.totalCalories ?? 0;
    final target = s?.targetCalories ?? 2000;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPaddingLg),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          // Donut chart
          SizedBox(
            width: 100,
            height: 100,
            child: CustomPaint(
              painter: _DonutPainter(protein: prot.toDouble(), carbs: carbs.toDouble(), fat: fat.toDouble()),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      consumed.round().toString(),
                      style: const TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary, height: 1),
                    ),
                    Text('kcal', style: Theme.of(context).textTheme.labelSmall),
                  ],
                ),
              ),
            ),
          ),
          const Gap(AppSpacing.xl),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _MacroBar(label: 'Proteine', value: s?.proteinG ?? 0, target: 150, color: AppColors.protein, unit: 'g'),
                const Gap(AppSpacing.sm),
                _MacroBar(label: 'Carboidrati', value: s?.carbsG ?? 0, target: 250, color: AppColors.carbs, unit: 'g'),
                const Gap(AppSpacing.sm),
                _MacroBar(label: 'Grassi', value: s?.fatG ?? 0, target: 70, color: AppColors.fat, unit: 'g'),
                const Gap(AppSpacing.base),
                Text(
                  'Obiettivo: ${target.round()} kcal',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DonutPainter extends CustomPainter {
  const _DonutPainter({required this.protein, required this.carbs, required this.fat});
  final double protein, carbs, fat;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 8;
    const strokeWidth = 9.0;
    const gap = 0.05;

    final slices = [
      (protein, AppColors.protein),
      (carbs, AppColors.carbs),
      (fat, AppColors.fat),
    ];

    // Background ring
    canvas.drawCircle(center, radius, Paint()
      ..color = AppColors.border
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke);

    double startAngle = -pi / 2;
    for (final (fraction, color) in slices) {
      if (fraction <= 0) continue;
      final sweep = 2 * pi * fraction - gap;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweep,
        false,
        Paint()
          ..color = color
          ..strokeWidth = strokeWidth
          ..strokeCap = StrokeCap.round
          ..style = PaintingStyle.stroke,
      );
      startAngle += 2 * pi * fraction;
    }
  }

  @override
  bool shouldRepaint(_DonutPainter old) =>
      old.protein != protein || old.carbs != carbs || old.fat != fat;
}

class _MacroBar extends StatelessWidget {
  const _MacroBar({required this.label, required this.value, required this.target, required this.color, required this.unit});
  final String label, unit;
  final double value, target;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final pct = (value / target).clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
            Text('${value.round()}$unit', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: color, fontWeight: FontWeight.w600)),
          ],
        ),
        const Gap(4),
        ClipRRect(
          borderRadius: BorderRadius.circular(100),
          child: LinearProgressIndicator(
            value: pct,
            backgroundColor: color.withOpacity(0.15),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 5,
          ),
        ),
      ],
    );
  }
}

class _WaterCard extends StatelessWidget {
  const _WaterCard({required this.waterMl});
  final double waterMl;

  @override
  Widget build(BuildContext context) {
    final glasses = (waterMl / 250).round();
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const Text('💧', style: TextStyle(fontSize: 24)),
          const Gap(AppSpacing.base),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Acqua', style: Theme.of(context).textTheme.titleMedium),
                Text('${waterMl.round()} ml • $glasses bicchieri', style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          // Water glasses indicator
          Row(
            children: List.generate(8, (i) => Container(
              width: 8,
              height: 18,
              margin: const EdgeInsets.only(left: 3),
              decoration: BoxDecoration(
                color: i < glasses ? AppColors.info : AppColors.border,
                borderRadius: BorderRadius.circular(3),
              ),
            )),
          ),
        ],
      ),
    );
  }
}

class _WeeklyCalChart extends StatelessWidget {
  const _WeeklyCalChart({required this.target});
  final double target;

  @override
  Widget build(BuildContext context) {
    final days = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
    final todayIdx = DateTime.now().weekday - 1;
    final rng = Random(DateTime.now().weekOfYear);
    final cals = List.generate(7, (i) {
      if (i > todayIdx) return 0.0;
      return 1200 + rng.nextDouble() * 1200;
    });
    final maxCal = max(cals.reduce(max), target * 1.2);
    final targetPct = target / maxCal;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Stack(
            children: [
              // Target line
              Positioned(
                top: (1 - targetPct) * 80,
                left: 0,
                right: 0,
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 1,
                        color: AppColors.warning.withOpacity(0.5),
                      ),
                    ),
                    const Gap(4),
                    Text(
                      '${target.round()}',
                      style: const TextStyle(fontFamily: 'Inter', fontSize: 10, color: AppColors.warning),
                    ),
                  ],
                ),
              ),
              // Bars
              SizedBox(
                height: 80,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: List.generate(7, (i) {
                    final pct = maxCal > 0 ? cals[i] / maxCal : 0.0;
                    final isOver = cals[i] > target;
                    final isToday = i == todayIdx;
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 3),
                        child: FractionallySizedBox(
                          alignment: Alignment.bottomCenter,
                          heightFactor: pct == 0 ? 0.02 : pct,
                          child: Container(
                            decoration: BoxDecoration(
                              color: isOver
                                  ? AppColors.error
                                  : isToday
                                      ? AppColors.primary
                                      : AppColors.surfaceHighlight,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ],
          ),
          const Gap(6),
          Row(
            children: List.generate(7, (i) => Expanded(
              child: Text(days[i], textAlign: TextAlign.center,
                  style: TextStyle(fontFamily: 'Inter', fontSize: 11,
                      color: i == DateTime.now().weekday - 1 ? AppColors.primary : AppColors.textMuted)),
            )),
          ),
        ],
      ),
    );
  }
}

class _MealCard extends StatelessWidget {
  const _MealCard({
    required this.emoji,
    required this.label,
    required this.entries,
    required this.onAdd,
    required this.onDelete,
  });

  final String emoji, label;
  final List<FoodLogEntry> entries;
  final VoidCallback onAdd;
  final ValueChanged<String> onDelete;

  @override
  Widget build(BuildContext context) {
    final totalCal = entries.fold(0.0, (sum, e) => sum + e.calories);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          // Header
          GestureDetector(
            onTap: onAdd,
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.cardPadding),
              child: Row(
                children: [
                  Text(emoji, style: const TextStyle(fontSize: 20)),
                  const Gap(AppSpacing.sm),
                  Expanded(
                    child: Text(label, style: Theme.of(context).textTheme.titleMedium),
                  ),
                  if (totalCal > 0)
                    Text(
                      '${totalCal.round()} kcal',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.primary, fontWeight: FontWeight.w600),
                    ),
                  const Gap(AppSpacing.sm),
                  const Icon(Icons.add_rounded, color: AppColors.textMuted, size: 20),
                ],
              ),
            ),
          ),
          // Food items
          if (entries.isNotEmpty) ...
            [
              Container(height: 0.5, color: AppColors.border),
              ...entries.map((e) => _FoodRow(entry: e, onDelete: () => onDelete(e.id))),
            ],
        ],
      ),
    );
  }
}

class _FoodRow extends StatelessWidget {
  const _FoodRow({required this.entry, required this.onDelete});
  final FoodLogEntry entry;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(entry.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        decoration: const BoxDecoration(
          color: AppColors.error,
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(AppSpacing.cardRadius),
            bottomRight: Radius.circular(AppSpacing.cardRadius),
          ),
        ),
        child: const Icon(Icons.delete_rounded, color: Colors.white),
      ),
      onDismissed: (_) => onDelete(),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.cardPadding, vertical: 10),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(entry.foodName, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textPrimary)),
                  Text('${entry.quantityGrams.round()}g', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            Text(
              '${entry.calories.round()} kcal',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textMuted, letterSpacing: 1.5),
    );
  }
}

extension on DateTime {
  int get weekOfYear {
    final startOfYear = DateTime(year, 1, 1);
    return ((difference(startOfYear).inDays) / 7).floor();
  }
}
