import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

class ProgressScreen extends ConsumerWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
                // Stat cards row
                _StatRow().animate().fadeIn(),
                const Gap(AppSpacing.xl),
                // Weekly calories burned
                _SectionHeader(title: 'CALORIE BRUCIATE'),
                const Gap(AppSpacing.sm),
                _CaloriesChart().animate().fadeIn(delay: 100.ms),
                const Gap(AppSpacing.xl),
                // Streak
                _StreakCard().animate().fadeIn(delay: 150.ms),
                const Gap(AppSpacing.xl),
                // Workout frequency
                _SectionHeader(title: 'FREQUENZA ALLENAMENTI'),
                const Gap(AppSpacing.sm),
                _FrequencyGrid().animate().fadeIn(delay: 200.ms),
                const Gap(AppSpacing.xl),
                // Body metrics placeholder
                _SectionHeader(title: 'METRICHE CORPO'),
                const Gap(AppSpacing.sm),
                _BodyMetricsCard().animate().fadeIn(delay: 250.ms),
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
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _StatCard(value: '12', label: 'Sessioni', icon: Icons.fitness_center_rounded, color: AppColors.primary)),
        const Gap(AppSpacing.sm),
        Expanded(child: _StatCard(value: '8.4h', label: 'Ore attivo', icon: Icons.timer_rounded, color: AppColors.accent)),
        const Gap(AppSpacing.sm),
        Expanded(child: _StatCard(value: '4.2k', label: 'kcal bruciate', icon: Icons.local_fire_department_rounded, color: AppColors.strength)),
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
          Text(value, style: TextStyle(fontFamily: 'Inter', fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          Text(label, style: Theme.of(context).textTheme.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

class _CaloriesChart extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final rng = Random(7);
    final weeks = List.generate(8, (_) => 1500 + rng.nextInt(1500));
    final max = weeks.reduce((a, b) => a > b ? a : b).toDouble();

    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          SizedBox(
            height: 120,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: List.generate(weeks.length, (i) {
                final pct = weeks[i] / max;
                final isLast = i == weeks.length - 1;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: FractionallySizedBox(
                      alignment: Alignment.bottomCenter,
                      heightFactor: pct,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: isLast
                              ? AppColors.primaryGradient
                              : const LinearGradient(
                                  colors: [Color(0xFF2A2A2A), Color(0xFF1A1A1A)],
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                ),
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
          const Gap(AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('8 settimane', style: Theme.of(context).textTheme.bodySmall),
              Text('${(weeks.last / 1000).toStringAsFixed(1)}k kcal questa settimana',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.primary, fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }
}

class _StreakCard extends StatelessWidget {
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
              const Text('5', style: TextStyle(fontFamily: 'Inter', fontSize: 40, fontWeight: FontWeight.w800, color: AppColors.strength, height: 1)),
              Text('giorni consecutivi', style: Theme.of(context).textTheme.bodyMedium),
            ],
          ),
          const Spacer(),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('Record: 14', style: Theme.of(context).textTheme.bodySmall),
              const Gap(2),
              Text('Continua così!', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.strength)),
            ],
          ),
        ],
      ),
    );
  }
}

class _FrequencyGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final rng = Random(13);
    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Ultimi 4 mesi', style: Theme.of(context).textTheme.bodySmall),
          const Gap(AppSpacing.sm),
          Wrap(
            spacing: 3,
            runSpacing: 3,
            children: List.generate(112, (i) {
              final intensity = rng.nextDouble();
              final color = intensity > 0.7
                  ? AppColors.primary
                  : intensity > 0.4
                      ? AppColors.primaryVariant.withOpacity(0.5)
                      : intensity > 0.15
                          ? AppColors.primaryDim
                          : AppColors.border;
              return Container(width: 10, height: 10, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)));
            }),
          ),
          const Gap(AppSpacing.sm),
          Row(
            children: [
              Text('Meno', style: Theme.of(context).textTheme.labelSmall),
              const Gap(4),
              ...[
                AppColors.border,
                AppColors.primaryDim,
                AppColors.primaryVariant.withOpacity(0.5),
                AppColors.primary,
              ].map((c) => Container(
                width: 10, height: 10,
                margin: const EdgeInsets.only(right: 3),
                decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(2)),
              )),
              Text('Più', style: Theme.of(context).textTheme.labelSmall),
            ],
          ),
        ],
      ),
    );
  }
}

class _BodyMetricsCard extends StatelessWidget {
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
              Expanded(child: _MetricTile(label: 'Peso', value: '78 kg', trend: '-2kg', isPositive: true)),
              Container(width: 1, height: 50, color: AppColors.border),
              Expanded(child: _MetricTile(label: 'BMI', value: '24.1', trend: '-0.8', isPositive: true)),
              Container(width: 1, height: 50, color: AppColors.border),
              Expanded(child: _MetricTile(label: 'Grasso', value: '18%', trend: '-1%', isPositive: true)),
            ],
          ),
          Container(height: 0.5, color: AppColors.border, margin: const EdgeInsets.symmetric(vertical: AppSpacing.base)),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
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
  const _MetricTile({required this.label, required this.value, required this.trend, required this.isPositive});
  final String label, value, trend;
  final bool isPositive;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontFamily: 'Inter', fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        const Gap(2),
        Text(
          trend,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: isPositive ? AppColors.success : AppColors.error,
          ),
        ),
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
