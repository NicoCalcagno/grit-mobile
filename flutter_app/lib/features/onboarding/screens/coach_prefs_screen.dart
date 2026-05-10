import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/widgets/grit_button.dart';
import '../../../models/user_model.dart';
import '../providers/onboarding_provider.dart';

const _tones = [
  (value: CoachTone.motivating, label: 'Motivante', emoji: '🔥', desc: 'Ti sprona e incoraggia sempre'),
  (value: CoachTone.aggressive, label: 'Duro', emoji: '💀', desc: 'Niente scuse, solo risultati'),
  (value: CoachTone.zen, label: 'Zen', emoji: '🧘', desc: 'Calmo, meditativo e consapevole'),
];

class CoachPrefsScreen extends ConsumerStatefulWidget {
  const CoachPrefsScreen({super.key});

  @override
  ConsumerState<CoachPrefsScreen> createState() => _CoachPrefsScreenState();
}

class _CoachPrefsScreenState extends ConsumerState<CoachPrefsScreen> {
  CoachTone _tone = CoachTone.motivating;
  CoachLanguage _lang = CoachLanguage.it;

  Future<void> _finish() async {
    ref.read(onboardingProvider.notifier).updateCoachPrefs(tone: _tone, language: _lang);
    await ref.read(onboardingProvider.notifier).save(ref);
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
              _StepIndicator(step: 4, total: 4),
              const Gap(AppSpacing.xl),
              Text('Il tuo coach.', style: Theme.of(context).textTheme.displaySmall)
                  .animate().fadeIn().slideY(begin: 0.2, end: 0),
              const Gap(AppSpacing.sm),
              Text('Come vuoi che ti parli il tuo AI coach?', style: Theme.of(context).textTheme.bodyMedium)
                  .animate().fadeIn(delay: 100.ms),
              const Gap(AppSpacing.xl),
              // Tone selector
              ...List.generate(_tones.length, (i) {
                final t = _tones[i];
                final isSelected = _tone == t.value;
                return Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                  child: GestureDetector(
                    onTap: () => setState(() => _tone = t.value),
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
                          Text(t.emoji, style: const TextStyle(fontSize: 26)),
                          const Gap(AppSpacing.base),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(t.label,
                                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                          color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                        )),
                                Text(t.desc, style: Theme.of(context).textTheme.bodySmall),
                              ],
                            ),
                          ),
                          if (isSelected)
                            const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 22),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: Duration(milliseconds: 100 + i * 80)),
                );
              }),
              const Gap(AppSpacing.base),
              // Language
              Text('Lingua', style: Theme.of(context).textTheme.labelMedium?.copyWith(color: AppColors.textMuted)),
              const Gap(AppSpacing.sm),
              Row(
                children: [
                  _LangChip(label: '🇮🇹 Italiano', value: CoachLanguage.it, selected: _lang, onTap: (v) => setState(() => _lang = v)),
                  const Gap(AppSpacing.sm),
                  _LangChip(label: '🇬🇧 English', value: CoachLanguage.en, selected: _lang, onTap: (v) => setState(() => _lang = v)),
                ],
              ).animate().fadeIn(delay: 350.ms),
              const Spacer(),
              GritButton(
                label: 'Inizia con Grit 🚀',
                onPressed: _finish,
              ).animate().fadeIn(delay: 400.ms),
            ],
          ),
        ),
      ),
    );
  }
}

class _LangChip extends StatelessWidget {
  const _LangChip({required this.label, required this.value, required this.selected, required this.onTap});
  final String label;
  final CoachLanguage value, selected;
  final ValueChanged<CoachLanguage> onTap;

  @override
  Widget build(BuildContext context) {
    final isSelected = value == selected;
    return GestureDetector(
      onTap: () => onTap(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryDim : AppColors.surfaceElevated,
          borderRadius: BorderRadius.circular(AppSpacing.chipRadius),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.border, width: isSelected ? 1.5 : 1),
        ),
        child: Text(label,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
            )),
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
