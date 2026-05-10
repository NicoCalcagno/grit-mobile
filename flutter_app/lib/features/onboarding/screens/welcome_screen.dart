import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/widgets/grit_button.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Background glow
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [Color(0x2200FF87), Colors.transparent],
                ),
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.screenPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Spacer(),
                  // Logo
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(18),
                      gradient: AppColors.primaryGradient,
                    ),
                    child: const Icon(Icons.bolt, color: Colors.black, size: 34),
                  )
                      .animate()
                      .scale(begin: const Offset(0.5, 0.5), curve: Curves.elasticOut, duration: 800.ms)
                      .fadeIn(),
                  const Gap(AppSpacing.xl),
                  Text(
                    'Il tuo coach\nAI personale.',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          color: AppColors.textPrimary,
                        ),
                  )
                      .animate()
                      .fadeIn(delay: 200.ms, duration: 700.ms)
                      .slideY(begin: 0.3, end: 0, curve: Curves.easeOut),
                  const Gap(AppSpacing.base),
                  Text(
                    'Workout, nutrizione e progressi\npersonalizzati con AI. Solo per te.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppColors.textSecondary,
                          height: 1.6,
                        ),
                  ).animate().fadeIn(delay: 350.ms, duration: 600.ms),
                  const Spacer(),
                  // Feature chips
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: [
                      _Chip(label: '⚡ Workout AI', delay: 400),
                      _Chip(label: '🥗 Piano Nutrizionale', delay: 500),
                      _Chip(label: '📊 Analisi Progressi', delay: 600),
                      _Chip(label: '🎧 Musica Adattiva', delay: 700),
                    ],
                  ),
                  const Gap(AppSpacing.xxl),
                  GritButton(
                    label: 'Inizia il percorso',
                    icon: Icons.arrow_forward_rounded,
                    onPressed: () => context.go('/onboarding/profile'),
                  ).animate().fadeIn(delay: 800.ms).slideY(begin: 0.3, end: 0),
                  const Gap(AppSpacing.base),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.delay});
  final String label;
  final int delay;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.chipRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: delay)).slideX(begin: 0.2, end: 0);
  }
}
