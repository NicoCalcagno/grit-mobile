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

const _levels = [
  (value: FitnessLevel.sedentary, label: 'Sedentario', desc: 'Mi muovo poco durante la giornata', color: Color(0xFF666666)),
  (value: FitnessLevel.beginner, label: 'Principiante', desc: 'Faccio sport meno di 2 volte a settimana', color: Color(0xFF3B82F6)),
  (value: FitnessLevel.intermediate, label: 'Intermedio', desc: 'Mi alleno 2-4 volte a settimana', color: Color(0xFF00D4A0)),
  (value: FitnessLevel.advanced, label: 'Avanzato', desc: 'Mi alleno 5+ volte a settimana', color: Color(0xFF00FF87)),
  (value: FitnessLevel.athlete, label: 'Atleta', desc: 'Sport agonistico o allenamento quotidiano', color: Color(0xFFFF6B35)),
];

class FitnessLevelScreen extends ConsumerStatefulWidget {
  const FitnessLevelScreen({super.key});

  @override
  ConsumerState<FitnessLevelScreen> createState() => _FitnessLevelScreenState();
}

class _FitnessLevelScreenState extends ConsumerState<FitnessLevelScreen> {
  FitnessLevel? _selected;

  void _continue() {
    if (_selected == null) return;
    ref.read(onboardingProvider.notifier).updateFitnessLevel(_selected!);
    context.go('/onboarding/coach-prefs');
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
              _StepIndicator(step: 3, total: 4),
              const Gap(AppSpacing.xl),
              Text('Il tuo livello.', style: Theme.of(context).textTheme.displaySmall)
                  .animate().fadeIn().slideY(begin: 0.2, end: 0),
              const Gap(AppSpacing.sm),
              Text('Scegli il livello che ti descrive meglio.', style: Theme.of(context).textTheme.bodyMedium)
                  .animate().fadeIn(delay: 100.ms),
              const Gap(AppSpacing.xl),
              Expanded(
                child: ListView.separated(
                  itemCount: _levels.length,
                  separatorBuilder: (_, __) => const Gap(AppSpacing.sm),
                  itemBuilder: (context, i) {
                    final l = _levels[i];
                    final isSelected = _selected == l.value;
                    return GestureDetector(
                      onTap: () => setState(() => _selected = l.value),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(AppSpacing.base),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? l.color.withOpacity(0.1)
                              : AppColors.surfaceElevated,
                          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                          border: Border.all(
                            color: isSelected ? l.color : AppColors.border,
                            width: isSelected ? 1.5 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 10,
                              height: 10,
                              decoration: BoxDecoration(
                                color: l.color,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const Gap(AppSpacing.base),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(l.label,
                                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                            color: isSelected ? l.color : AppColors.textPrimary,
                                          )),
                                  Text(l.desc, style: Theme.of(context).textTheme.bodySmall),
                                ],
                              ),
                            ),
                            if (isSelected)
                              Icon(Icons.check_circle_rounded, color: l.color, size: 22),
                          ],
                        ),
                      ),
                    ).animate().fadeIn(delay: Duration(milliseconds: 100 + i * 80)).slideX(begin: 0.2, end: 0);
                  },
                ),
              ),
              const Gap(AppSpacing.base),
              GritButton(label: 'Continua', onPressed: _selected != null ? _continue : null),
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
