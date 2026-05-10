import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/widgets/grit_button.dart';
import '../../../models/user_model.dart';
import '../providers/onboarding_provider.dart';

const _goals = [
  (value: FitnessGoal.muscleGain, label: 'Massa muscolare', emoji: '💪', desc: 'Aumenta forza e volume'),
  (value: FitnessGoal.fatLoss, label: 'Perdita di peso', emoji: '🔥', desc: 'Brucia grassi in eccesso'),
  (value: FitnessGoal.endurance, label: 'Resistenza', emoji: '🏃', desc: 'Migliora capacità cardio'),
  (value: FitnessGoal.wellness, label: 'Benessere', emoji: '🧘', desc: 'Stile di vita sano'),
  (value: FitnessGoal.flexibility, label: 'Flessibilità', emoji: '🤸', desc: 'Mobilità e allungamento'),
];

class GoalsScreen extends ConsumerStatefulWidget {
  const GoalsScreen({super.key});

  @override
  ConsumerState<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends ConsumerState<GoalsScreen> {
  final _selected = <FitnessGoal>{};

  void _continue() {
    if (_selected.isEmpty) return;
    ref.read(onboardingProvider.notifier).updateGoals(_selected.toList());
    context.go('/onboarding/fitness-level');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.screenPadding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _StepIndicator(step: 2, total: 4),
              const Gap(AppSpacing.xl),
              Text('I tuoi obiettivi.', style: Theme.of(context).textTheme.displaySmall)
                  .animate().fadeIn().slideY(begin: 0.2, end: 0),
              const Gap(AppSpacing.sm),
              Text('Seleziona uno o più obiettivi.', style: Theme.of(context).textTheme.bodyMedium)
                  .animate().fadeIn(delay: 100.ms),
              const Gap(AppSpacing.xl),
              Expanded(
                child: ListView.separated(
                  itemCount: _goals.length,
                  separatorBuilder: (_, __) => const Gap(AppSpacing.sm),
                  itemBuilder: (context, i) {
                    final g = _goals[i];
                    final isSelected = _selected.contains(g.value);
                    return GestureDetector(
                      onTap: () => setState(() {
                        if (isSelected) _selected.remove(g.value);
                        else _selected.add(g.value);
                      }),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(AppSpacing.base),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primaryDim : AppColors.surfaceElevated,
                          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                          border: Border.all(
                            color: isSelected ? AppColors.primary : AppColors.border,
                            width: isSelected ? 1.5 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Text(g.emoji, style: const TextStyle(fontSize: 28)),
                            const Gap(AppSpacing.base),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(g.label,
                                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                            color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                          )),
                                  Text(g.desc, style: Theme.of(context).textTheme.bodySmall),
                                ],
                              ),
                            ),
                            if (isSelected)
                              const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 22),
                          ],
                        ),
                      ),
                    ).animate().fadeIn(delay: Duration(milliseconds: 100 + i * 80)).slideX(begin: 0.2, end: 0);
                  },
                ),
              ),
              const Gap(AppSpacing.base),
              GritButton(
                label: 'Continua',
                onPressed: _selected.isNotEmpty ? _continue : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepIndicator extends StatelessWidget {
  const _StepIndicator({required this.step, required this.total});
  final int step, total;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(total, (i) => Expanded(
        child: Container(
          height: 3,
          margin: EdgeInsets.only(right: i < total - 1 ? 4 : 0),
          decoration: BoxDecoration(
            color: i < step ? AppColors.primary : AppColors.border,
            borderRadius: BorderRadius.circular(100),
          ),
        ),
      )),
    );
  }
}
