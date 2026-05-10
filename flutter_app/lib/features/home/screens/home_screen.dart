import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/workout/providers/workout_provider.dart';
import '../../../features/nutrition/providers/nutrition_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(workoutProvider.notifier).fetchWeeklyPlan();
      ref.read(nutritionProvider.notifier).fetchSummary();
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).whenOrNull(authenticated: (u) => u);
    final workout = ref.watch(workoutProvider);
    final nutrition = ref.watch(nutritionProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          _GritAppBar(userName: user?.name.split(' ').first ?? 'Atleta'),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Hero calorie ring
                _CalorieHeroCard(nutrition: nutrition).animate().fadeIn(duration: 600.ms).slideY(begin: 0.2, end: 0),
                const Gap(AppSpacing.base),
                // Macros row
                _MacroRow(nutrition: nutrition).animate().fadeIn(delay: 100.ms),
                const Gap(AppSpacing.xl),
                // Weekly steps chart
                _SectionHeader(title: 'ATTIVITÀ SETTIMANALE'),
                const Gap(AppSpacing.sm),
                _WeeklyStepsChart().animate().fadeIn(delay: 150.ms),
                const Gap(AppSpacing.xl),
                // Today's workout
                _SectionHeader(title: 'WORKOUT OGGI'),
                const Gap(AppSpacing.sm),
                _TodayWorkoutCard(workout: workout).animate().fadeIn(delay: 200.ms),
                const Gap(AppSpacing.xl),
                // Training load
                _SectionHeader(title: 'CARICO SETTIMANALE'),
                const Gap(AppSpacing.sm),
                _TrainingLoadChart(workout: workout).animate().fadeIn(delay: 250.ms),
                const Gap(AppSpacing.xl),
                // AI insights
                _SectionHeader(title: 'INSIGHT AI'),
                const Gap(AppSpacing.sm),
                _InsightCard(
                  icon: '🔥',
                  text: 'Hai bruciato il 12% in più questa settimana rispetto alla scorsa. Ottimo ritmo!',
                  type: 'positive',
                ).animate().fadeIn(delay: 300.ms),
                const Gap(AppSpacing.xxxl),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _GritAppBar extends StatelessWidget {
  const _GritAppBar({required this.userName});
  final String userName;

  @override
  Widget build(BuildContext context) {
    return SliverAppBar(
      backgroundColor: AppColors.background,
      pinned: false,
      floating: true,
      expandedHeight: 80,
      flexibleSpace: FlexibleSpaceBar(
        background: Padding(
          padding: const EdgeInsets.fromLTRB(20, 56, 20, 0),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _greeting(),
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 13,
                        color: AppColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      userName,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
              ),
              // Avatar
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: AppColors.primaryGradient,
                ),
                child: Center(
                  child: Text(
                    userName.isNotEmpty ? userName[0].toUpperCase() : 'A',
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Buongiorno,';
    if (hour < 18) return 'Buon pomeriggio,';
    return 'Buonasera,';
  }
}

class _CalorieHeroCard extends StatelessWidget {
  const _CalorieHeroCard({required this.nutrition});
  final NutritionState nutrition;

  @override
  Widget build(BuildContext context) {
    final consumed = nutrition.summary?.totalCalories ?? 0;
    final target = nutrition.summary?.targetCalories ?? 2000;
    final pct = (consumed / target).clamp(0.0, 1.0);
    final remaining = (target - consumed).clamp(0, double.infinity).toInt();

    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPaddingLg),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0A1A10), Color(0xFF050D08)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(AppSpacing.cardRadiusLg),
        border: Border.all(color: AppColors.borderPrimary),
      ),
      child: Row(
        children: [
          // Ring
          SizedBox(
            width: 90,
            height: 90,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CustomPaint(
                  size: const Size(90, 90),
                  painter: _RingPainter(progress: pct),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${(pct * 100).round()}%',
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Gap(AppSpacing.lg),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${consumed.round()}',
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 36,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    letterSpacing: -1,
                    height: 1,
                  ),
                ),
                Text(
                  'kcal consumate',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
                ),
                const Gap(AppSpacing.sm),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primarySubtle,
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: AppColors.borderPrimary),
                  ),
                  child: Text(
                    '$remaining kcal rimanenti',
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  const _RingPainter({required this.progress});
  final double progress;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 6;
    final stroke = 7.0;

    // Track
    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..color = AppColors.border
        ..strokeWidth = stroke
        ..style = PaintingStyle.stroke,
    );

    // Progress
    if (progress > 0) {
      final paint = Paint()
        ..shader = const LinearGradient(
          colors: [AppColors.primary, AppColors.primaryVariant],
        ).createShader(Rect.fromCircle(center: center, radius: radius))
        ..strokeWidth = stroke
        ..strokeCap = StrokeCap.round
        ..style = PaintingStyle.stroke;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        -pi / 2,
        2 * pi * progress,
        false,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_RingPainter old) => old.progress != progress;
}

class _MacroRow extends StatelessWidget {
  const _MacroRow({required this.nutrition});
  final NutritionState nutrition;

  @override
  Widget build(BuildContext context) {
    final s = nutrition.summary;
    return Row(
      children: [
        Expanded(child: _MacroChip(label: 'Proteine', value: '${s?.proteinG.round() ?? 0}g', color: AppColors.protein)),
        const Gap(AppSpacing.sm),
        Expanded(child: _MacroChip(label: 'Carboidrati', value: '${s?.carbsG.round() ?? 0}g', color: AppColors.carbs)),
        const Gap(AppSpacing.sm),
        Expanded(child: _MacroChip(label: 'Grassi', value: '${s?.fatG.round() ?? 0}g', color: AppColors.fat)),
      ],
    );
  }
}

class _MacroChip extends StatelessWidget {
  const _MacroChip({required this.label, required this.value, required this.color});
  final String label, value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Text(value, style: TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w800, color: color)),
          const Gap(2),
          Text(label, style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textMuted), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class _WeeklyStepsChart extends StatelessWidget {
  const _WeeklyStepsChart();

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final days = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
    final todayIdx = (now.weekday - 1).clamp(0, 6);
    final rng = Random(42);
    final steps = List.generate(7, (i) {
      if (i > todayIdx) return 0;
      if (i == todayIdx) return 7200 + rng.nextInt(3000);
      return 4000 + rng.nextInt(8000);
    });
    final maxSteps = steps.reduce(max).toDouble();

    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            children: List.generate(7, (i) {
              final isToday = i == todayIdx;
              final pct = maxSteps > 0 ? steps[i] / maxSteps : 0.0;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: Column(
                    children: [
                      Container(
                        height: 80,
                        alignment: Alignment.bottomCenter,
                        child: FractionallySizedBox(
                          heightFactor: pct == 0 ? 0.04 : pct,
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: isToday
                                  ? AppColors.primaryGradient
                                  : const LinearGradient(
                                      colors: [Color(0xFF2A2A2A), Color(0xFF222222)],
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                    ),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ),
                      const Gap(6),
                      Text(
                        days[i],
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 11,
                          fontWeight: isToday ? FontWeight.w700 : FontWeight.w400,
                          color: isToday ? AppColors.primary : AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
          const Gap(AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Passi questa settimana', style: Theme.of(context).textTheme.bodySmall),
              Text(
                '${(steps.reduce((a, b) => a + b) / 1000).toStringAsFixed(1)}k totali',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.primary, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TodayWorkoutCard extends ConsumerWidget {
  const _TodayWorkoutCard({required this.workout});
  final WorkoutState workout;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final today = workout.todayPlan;

    if (workout.isLoading) {
      return _shimmer();
    }

    if (today == null || today.isRest) {
      if (workout.weeklyPlan == null) {
        return _EmptyWorkoutCard(
          onGenerate: () => ref.read(workoutProvider.notifier).generateWeeklyPlan(),
          isGenerating: workout.isGenerating,
        );
      }
      return Container(
        padding: const EdgeInsets.all(AppSpacing.cardPadding),
        decoration: BoxDecoration(
          color: AppColors.surfaceElevated,
          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            const Text('🛡️', style: TextStyle(fontSize: 28)),
            const Gap(AppSpacing.base),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Giorno di riposo', style: Theme.of(context).textTheme.titleMedium),
                  Text(today?.restMotivation ?? 'Recupera e ricarica.', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return GestureDetector(
      onTap: () => context.push('/workout/active?planId=${today.workoutType}'),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.cardPaddingLg),
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
          borderRadius: BorderRadius.circular(AppSpacing.cardRadiusLg),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    today.workoutType?.toUpperCase() ?? 'WORKOUT',
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Colors.black54,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const Gap(4),
                  Text(
                    'Inizia workout',
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.black,
                    ),
                  ),
                  const Gap(4),
                  Text(
                    '${today.exercises.length} esercizi',
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: 48,
              height: 48,
              decoration: const BoxDecoration(
                color: Colors.black12,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.play_arrow_rounded, color: Colors.black, size: 28),
            ),
          ],
        ),
      ),
    );
  }

  Widget _shimmer() {
    return Container(
      height: 90,
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
      ),
    );
  }
}

class _EmptyWorkoutCard extends StatelessWidget {
  const _EmptyWorkoutCard({required this.onGenerate, required this.isGenerating});
  final VoidCallback onGenerate;
  final bool isGenerating;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isGenerating ? null : () {
        HapticFeedback.mediumImpact();
        onGenerate();
      },
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.cardPaddingLg),
        decoration: BoxDecoration(
          color: AppColors.surfaceElevated,
          borderRadius: BorderRadius.circular(AppSpacing.cardRadiusLg),
          border: Border.all(color: AppColors.border, style: BorderStyle.solid),
        ),
        child: Row(
          children: [
            const Text('✨', style: TextStyle(fontSize: 28)),
            const Gap(AppSpacing.base),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Genera piano AI', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.primary)),
                  Text('Tocca per creare il tuo piano settimanale personalizzato', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            if (isGenerating)
              const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
            else
              const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted, size: 16),
          ],
        ),
      ),
    );
  }
}

class _TrainingLoadChart extends StatelessWidget {
  const _TrainingLoadChart({required this.workout});
  final WorkoutState workout;

  @override
  Widget build(BuildContext context) {
    final days = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
    final plan = workout.weeklyPlan;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            children: List.generate(7, (i) {
              final dayPlan = plan?.days.values.elementAtOrNull(i);
              final hasWorkout = dayPlan != null && !dayPlan.isRest;
              final color = _workoutColor(dayPlan?.workoutType);
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: Column(
                    children: [
                      Container(
                        height: 60,
                        alignment: Alignment.bottomCenter,
                        child: FractionallySizedBox(
                          heightFactor: hasWorkout ? 0.75 : 0.15,
                          child: Container(
                            decoration: BoxDecoration(
                              color: hasWorkout ? color : AppColors.border,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ),
                      const Gap(6),
                      Text(days[i], style: Theme.of(context).textTheme.labelSmall),
                    ],
                  ),
                ),
              );
            }),
          ),
          const Gap(AppSpacing.sm),
          Row(
            children: [
              _Legend(color: AppColors.strength, label: 'Forza'),
              const Gap(AppSpacing.base),
              _Legend(color: AppColors.cardio, label: 'Cardio'),
              const Gap(AppSpacing.base),
              _Legend(color: AppColors.hiit, label: 'HIIT'),
              const Gap(AppSpacing.base),
              _Legend(color: AppColors.yoga, label: 'Yoga'),
            ],
          ),
        ],
      ),
    );
  }

  Color _workoutColor(String? type) {
    switch (type?.toLowerCase()) {
      case 'strength': return AppColors.strength;
      case 'cardio': return AppColors.cardio;
      case 'hiit': return AppColors.hiit;
      case 'yoga': case 'pilates': return AppColors.yoga;
      default: return AppColors.primary;
    }
  }
}

class _Legend extends StatelessWidget {
  const _Legend({required this.color, required this.label});
  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const Gap(4),
        Text(label, style: Theme.of(context).textTheme.labelSmall),
      ],
    );
  }
}

class _InsightCard extends StatelessWidget {
  const _InsightCard({required this.icon, required this.text, required this.type});
  final String icon, text, type;

  @override
  Widget build(BuildContext context) {
    final color = type == 'positive'
        ? AppColors.success
        : type == 'warning'
            ? AppColors.warning
            : AppColors.error;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(icon, style: const TextStyle(fontSize: 20)),
          const Gap(AppSpacing.base),
          Expanded(
            child: Text(text, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary, height: 1.5)),
          ),
        ],
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
      style: Theme.of(context).textTheme.labelSmall?.copyWith(
            color: AppColors.textMuted,
            letterSpacing: 1.5,
          ),
    );
  }
}
