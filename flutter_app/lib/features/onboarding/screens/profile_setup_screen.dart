import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/widgets/grit_button.dart';
import '../../../core/widgets/grit_text_field.dart';
import '../providers/onboarding_provider.dart';

class ProfileSetupScreen extends ConsumerStatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  ConsumerState<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends ConsumerState<ProfileSetupScreen> {
  final _ageCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  final _heightCtrl = TextEditingController();
  String _gender = 'male';

  @override
  void dispose() {
    _ageCtrl.dispose();
    _weightCtrl.dispose();
    _heightCtrl.dispose();
    super.dispose();
  }

  void _continue() {
    ref.read(onboardingProvider.notifier).updateProfile(
          age: int.tryParse(_ageCtrl.text) ?? 25,
          weightKg: double.tryParse(_weightCtrl.text) ?? 70,
          heightCm: double.tryParse(_heightCtrl.text) ?? 170,
          gender: _gender,
        );
    context.go('/onboarding/goals');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.screenPadding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Gap(AppSpacing.base),
              _StepIndicator(step: 1, total: 4),
              const Gap(AppSpacing.xl),
              Text('Il tuo profilo.', style: Theme.of(context).textTheme.displaySmall)
                  .animate().fadeIn().slideY(begin: 0.2, end: 0),
              const Gap(AppSpacing.sm),
              Text(
                'Questi dati ci permettono di calcolare il tuo fabbisogno calorico.',
                style: Theme.of(context).textTheme.bodyMedium,
              ).animate().fadeIn(delay: 100.ms),
              const Gap(AppSpacing.xxl),
              // Gender selector
              Text('Sesso', style: Theme.of(context).textTheme.labelMedium?.copyWith(color: AppColors.textMuted)),
              const Gap(AppSpacing.sm),
              Row(
                children: [
                  _GenderChip(label: 'Uomo', value: 'male', selected: _gender, onTap: (v) => setState(() => _gender = v)),
                  const Gap(AppSpacing.sm),
                  _GenderChip(label: 'Donna', value: 'female', selected: _gender, onTap: (v) => setState(() => _gender = v)),
                  const Gap(AppSpacing.sm),
                  _GenderChip(label: 'Altro', value: 'other', selected: _gender, onTap: (v) => setState(() => _gender = v)),
                ],
              ),
              const Gap(AppSpacing.lg),
              GritTextField(
                controller: _ageCtrl,
                label: 'Età',
                keyboardType: TextInputType.number,
              ).animate().fadeIn(delay: 150.ms),
              const Gap(AppSpacing.base),
              Row(
                children: [
                  Expanded(
                    child: GritTextField(
                      controller: _weightCtrl,
                      label: 'Peso (kg)',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    ),
                  ),
                  const Gap(AppSpacing.base),
                  Expanded(
                    child: GritTextField(
                      controller: _heightCtrl,
                      label: 'Altezza (cm)',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ).animate().fadeIn(delay: 200.ms),
              const Gap(AppSpacing.xxl),
              GritButton(label: 'Continua', onPressed: _continue)
                  .animate().fadeIn(delay: 300.ms),
            ],
          ),
        ),
      ),
    );
  }
}

class _GenderChip extends StatelessWidget {
  const _GenderChip({required this.label, required this.value, required this.selected, required this.onTap});
  final String label, value, selected;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    final isSelected = value == selected;
    return GestureDetector(
      onTap: () => onTap(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryDim : AppColors.surfaceElevated,
          borderRadius: BorderRadius.circular(AppSpacing.chipRadius),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: isSelected ? AppColors.primary : AppColors.textSecondary,
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
      children: List.generate(total, (i) {
        final active = i < step;
        return Expanded(
          child: Container(
            height: 3,
            margin: EdgeInsets.only(right: i < total - 1 ? 4 : 0),
            decoration: BoxDecoration(
              color: active ? AppColors.primary : AppColors.border,
              borderRadius: BorderRadius.circular(100),
            ),
          ),
        );
      }),
    );
  }
}
