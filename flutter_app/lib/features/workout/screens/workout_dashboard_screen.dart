import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/widgets/grit_button.dart';
import '../providers/workout_provider.dart';
import '../../../models/workout_model.dart';

class WorkoutDashboardScreen extends ConsumerStatefulWidget {
  const WorkoutDashboardScreen({super.key});

  @override
  ConsumerState<WorkoutDashboardScreen> createState() => _WorkoutDashboardScreenState();
}

class _WorkoutDashboardScreenState extends ConsumerState<WorkoutDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(workoutProvider.notifier).fetchWeeklyPlan());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(workoutProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: AppColors.background,
            pinned: true,
            title: const Text('Workout', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w800, letterSpacing: -0.5)),
            actions: [
              if (state.weeklyPlan != null)
                TextButton(
                  onPressed: () => ref.read(workoutProvider.notifier).generateWeeklyPlan(),
                  child: const Text('Rigenera', style: TextStyle(color: AppColors.primary, fontFamily: 'Inter', fontWeight: FontWeight.w600)),
                ),
            ],
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                if (state.isLoading)
                  const Center(child: Padding(
                    padding: EdgeInsets.all(40),
                    child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2),
                  ))
                else if (state.weeklyPlan == null)
                  _NoPlanCard(
                    onGenerate: () => ref.read(workoutProvider.notifier).generateWeeklyPlan(),
                    isGenerating: state.isGenerating,
                  ).animate().fadeIn().slideY(begin: 0.3, end: 0)
                else ..._buildWeekPlan(context, state),
                const Gap(AppSpacing.xxxl),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildWeekPlan(BuildContext context, WorkoutState state) {
    final days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    final todayIdx = DateTime.now().weekday - 1;
    final plan = state.weeklyPlan!;
    final entries = plan.days.entries.toList();

    return [
      const Gap(AppSpacing.sm),
      // This week header
      Row(
        children: [
          Expanded(
            child: Text(
              'Questa settimana',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primaryDim,
              borderRadius: BorderRadius.circular(100),
            ),
            child: Text(
              '${entries.where((e) => !e.value.isRest).length} giorni attivi',
              style: const TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
            ),
          ),
        ],
      ),
      const Gap(AppSpacing.base),
      // Day cards
      ...List.generate(entries.length, (i) {
        final entry = entries[i];
        final dayPlan = entry.value;
        final isToday = i == todayIdx;
        final isPast = i < todayIdx;

        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: _DayCard(
            dayName: days[i],
            dayPlan: dayPlan,
            isToday: isToday,
            isPast: isPast,
            onTap: (!dayPlan.isRest && (isToday || !isPast))
                ? () => context.push('/workout/active')
                : null,
          ),
        ).animate().fadeIn(delay: Duration(milliseconds: i * 60)).slideX(begin: 0.1, end: 0);
      }),
    ];
  }
}

class _DayCard extends StatelessWidget {
  const _DayCard({
    required this.dayName,
    required this.dayPlan,
    required this.isToday,
    required this.isPast,
    this.onTap,
  });

  final String dayName;
  final WorkoutDayPlan dayPlan;
  final bool isToday, isPast;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final color = _typeColor(dayPlan.workoutType);

    return GestureDetector(
      onTap: () {
        if (onTap != null) HapticFeedback.lightImpact();
        onTap?.call();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(AppSpacing.cardPadding),
        decoration: BoxDecoration(
          color: isToday ? color.withOpacity(0.08) : AppColors.surfaceElevated,
          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
          border: Border.all(
            color: isToday ? color.withOpacity(0.4) : AppColors.border,
            width: isToday ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            // Day indicator
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: dayPlan.isRest ? AppColors.border : color.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: dayPlan.isRest
                    ? const Icon(Icons.hotel_rounded, color: AppColors.textMuted, size: 20)
                    : Icon(_typeIcon(dayPlan.workoutType), color: color, size: 20),
              ),
            ),
            const Gap(AppSpacing.base),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        dayName,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: isPast && !isToday ? AppColors.textMuted : AppColors.textPrimary,
                            ),
                      ),
                      if (isToday) ...
                        [
                          const Gap(8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primaryDim,
                              borderRadius: BorderRadius.circular(100),
                            ),
                            child: const Text('OGGI', style: TextStyle(fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary, letterSpacing: 0.5)),
                          ),
                        ],
                    ],
                  ),
                  const Gap(2),
                  Text(
                    dayPlan.isRest
                        ? 'Riposo'
                        : '${dayPlan.workoutType?.toUpperCase() ?? ''} • ${dayPlan.exercises.length} esercizi',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: dayPlan.isRest ? AppColors.textMuted : AppColors.textSecondary,
                        ),
                  ),
                ],
              ),
            ),
            if (!dayPlan.isRest && !isPast)
              Icon(
                Icons.arrow_forward_ios_rounded,
                size: 14,
                color: isToday ? color : AppColors.textMuted,
              ),
            if (isPast && !isToday)
              const Icon(Icons.check_circle_outline_rounded, size: 18, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }

  Color _typeColor(String? type) {
    switch (type?.toLowerCase()) {
      case 'strength': return AppColors.strength;
      case 'cardio': return AppColors.cardio;
      case 'hiit': return AppColors.hiit;
      case 'yoga': case 'pilates': return AppColors.yoga;
      default: return AppColors.primary;
    }
  }

  IconData _typeIcon(String? type) {
    switch (type?.toLowerCase()) {
      case 'strength': return Icons.fitness_center_rounded;
      case 'cardio': return Icons.directions_run_rounded;
      case 'hiit': return Icons.flash_on_rounded;
      case 'yoga': case 'pilates': return Icons.self_improvement_rounded;
      default: return Icons.sports_gymnastics_rounded;
    }
  }
}

class _NoPlanCard extends StatelessWidget {
  const _NoPlanCard({required this.onGenerate, required this.isGenerating});
  final VoidCallback onGenerate;
  final bool isGenerating;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xxxl),
      child: Column(
        children: [
          const Text('✨', style: TextStyle(fontSize: 48)),
          const Gap(AppSpacing.base),
          Text('Nessun piano attivo', style: Theme.of(context).textTheme.headlineMedium),
          const Gap(AppSpacing.sm),
          Text(
            'Genera il tuo piano settimanale personalizzato con AI',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const Gap(AppSpacing.xl),
          GritButton(
            label: 'Genera piano AI',
            isLoading: isGenerating,
            icon: Icons.auto_awesome_rounded,
            onPressed: onGenerate,
          ),
        ],
      ),
    );
  }
}
