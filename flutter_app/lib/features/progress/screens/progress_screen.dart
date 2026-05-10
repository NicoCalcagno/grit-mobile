import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/workout/providers/workout_provider.dart';
import '../../../models/user_model.dart';

class ProgressScreen extends ConsumerWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).whenOrNull(authenticated: (u) => u);
    final workout = ref.watch(workoutProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          const SliverAppBar(
            backgroundColor: AppColors.background,
            pinned: true,
            title: Text('Progressi', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _StatRow(workout: workout).animate().fadeIn(),
                const Gap(AppSpacing.xl),
                _SectionHeader(title: 'CALORIE BRUCIATE'),
                const Gap(AppSpacing.sm),
                _CaloriesPlaceholder().animate().fadeIn(delay: 100.ms),
                const Gap(AppSpacing.xl),
                _StreakCard(workout: workout).animate().fadeIn(delay: 150.ms),
                const Gap(AppSpacing.xl),
                _SectionHeader(title: 'FREQUENZA ALLENAMENTI'),
                const Gap(AppSpacing.sm),
                _FrequencyPlaceholder().animate().fadeIn(delay: 200.ms),
                const Gap(AppSpacing.xl),
                _SectionHeader(title: 'METRICHE CORPO'),
                const Gap(AppSpacing.sm),
                _BodyMetricsCard(user: user).animate().fadeIn(delay: 250.ms),
                const Gap(AppSpacing.xxxl),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  const _StatRow({required this.workout});
  final WorkoutState workout;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _StatCard(value: '0', label: 'Sessioni', icon: Icons.fitness_center_rounded, color: AppColors.primary)),
        const Gap(AppSpacing.sm),
        Expanded(child: _StatCard(value: '0h', label: 'Ore attivo', icon: Icons.timer_rounded, color: AppColors.accent)),
        const Gap(AppSpacing.sm),
        Expanded(child: _StatCard(value: '0', label: 'kcal bruciate', icon: Icons.local_fire_department_rounded, color: AppColors.strength)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.value, required this.label, required this.icon, required this.color});
  final String value, label;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const Gap(AppSpacing.sm),
          Text(value, style: const TextStyle(fontFamily: 'Inter', fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          Text(label, style: Theme.of(context).textTheme.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

class _CaloriesPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      height: 140,
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Center(
        child: Text(
          'Completa i tuoi primi allenamenti\nper vedere le statistiche',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
        ),
      ),
    );
  }
}

class _StreakCard extends StatelessWidget {
  const _StreakCard({required this.workout});
  final WorkoutState workout;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPaddingLg),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A0A00), Color(0xFF0D0500)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(AppSpacing.cardRadiusLg),
        border: Border.all(color: AppColors.strength.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Text('🔥', style: TextStyle(fontSize: 40)),
          const Gap(AppSpacing.base),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('0', style: TextStyle(fontFamily: 'Inter', fontSize: 40, fontWeight: FontWeight.w800, color: AppColors.strength, height: 1)),
              Text('giorni consecutivi', style: Theme.of(context).textTheme.bodyMedium),
            ],
          ),
          const Spacer(),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('Record: 0', style: Theme.of(context).textTheme.bodySmall),
              const Gap(2),
              Text('Inizia il tuo streak!', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.strength)),
            ],
          ),
        ],
      ),
    );
  }
}

class _FrequencyPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      height: 100,
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Center(
        child: Text(
          'I tuoi allenamenti appariranno qui',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
        ),
      ),
    );
  }
}

class _BodyMetricsCard extends StatelessWidget {
  const _BodyMetricsCard({required this.user});
  final UserProfile? user;

  String get _weightStr {
    final w = user?.weightKg;
    return w != null ? '${w.toStringAsFixed(0)} kg' : '--';
  }

  String get _bmiStr {
    final w = user?.weightKg;
    final h = user?.heightCm;
    if (w == null || h == null || h == 0) return '--';
    final bmi = w / ((h / 100) * (h / 100));
    return bmi.toStringAsFixed(1);
  }

  @override
  Widget build(BuildContext context) {
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
            children: [
              Expanded(child: _MetricTile(label: 'Peso', value: _weightStr, trend: null)),
              Container(width: 1, height: 50, color: AppColors.border),
              Expanded(child: _MetricTile(label: 'BMI', value: _bmiStr, trend: null)),
              Container(width: 1, height: 50, color: AppColors.border),
              Expanded(child: _MetricTile(label: 'Grasso', value: '--', trend: null)),
            ],
          ),
          Container(height: 0.5, color: AppColors.border, margin: const EdgeInsets.symmetric(vertical: AppSpacing.base)),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.edit_rounded, color: AppColors.textMuted, size: 14),
              Gap(6),
              Text('Aggiorna metriche', style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.textMuted)),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({required this.label, required this.value, required this.trend});
  final String label, value;
  final String? trend;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontFamily: 'Inter', fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(title, style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textMuted, letterSpacing: 1.5));
  }
}
