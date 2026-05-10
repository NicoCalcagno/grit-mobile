import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/widgets/grit_button.dart';
import '../../auth/providers/auth_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).whenOrNull(authenticated: (u) => u);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          const SliverAppBar(
            backgroundColor: AppColors.background,
            pinned: true,
            title: Text('Profilo', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                Center(
                  child: Column(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: AppColors.primaryGradient,
                        ),
                        child: Center(
                          child: Text(
                            user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : 'G',
                            style: const TextStyle(fontFamily: 'Inter', fontSize: 32, fontWeight: FontWeight.w800, color: Colors.black),
                          ),
                        ),
                      ),
                      const Gap(AppSpacing.base),
                      Text(user?.name ?? '', style: Theme.of(context).textTheme.headlineMedium),
                      Text(user?.email ?? '', style: Theme.of(context).textTheme.bodyMedium),
                    ],
                  ),
                ).animate().fadeIn(),
                const Gap(AppSpacing.xxl),
                _StatsRow(user: user).animate().fadeIn(delay: 100.ms),
                const Gap(AppSpacing.xl),
                _SettingsSection(
                  title: 'PROFILO',
                  items: [
                    _SettingItem(icon: Icons.person_outline_rounded, label: 'Dati personali', onTap: () {}),
                    _SettingItem(icon: Icons.fitness_center_rounded, label: 'Obiettivi fitness', onTap: () {}),
                    _SettingItem(icon: Icons.restaurant_menu_rounded, label: 'Preferenze alimentari', onTap: () {}),
                  ],
                ).animate().fadeIn(delay: 150.ms),
                const Gap(AppSpacing.base),
                _SettingsSection(
                  title: 'COACH AI',
                  items: [
                    _SettingItem(icon: Icons.record_voice_over_rounded, label: 'Tono del coach', trailing: Text(user?.coachTone?.name ?? 'motivating', style: const TextStyle(color: AppColors.textMuted, fontFamily: 'Inter', fontSize: 13)), onTap: () {}),
                    _SettingItem(icon: Icons.language_rounded, label: 'Lingua', trailing: Text(user?.coachLanguage?.name.toUpperCase() ?? 'IT', style: const TextStyle(color: AppColors.textMuted, fontFamily: 'Inter', fontSize: 13)), onTap: () {}),
                  ],
                ).animate().fadeIn(delay: 200.ms),
                const Gap(AppSpacing.base),
                _SettingsSection(
                  title: 'INTEGRAZIONI',
                  items: [
                    _SettingItem(icon: Icons.favorite_outline_rounded, label: 'Apple Health', trailing: _Badge(label: 'Connesso', color: AppColors.success), onTap: () {}),
                    _SettingItem(icon: Icons.music_note_rounded, label: 'Spotify', trailing: _Badge(label: 'Collega', color: AppColors.textMuted), onTap: () {}),
                  ],
                ).animate().fadeIn(delay: 250.ms),
                const Gap(AppSpacing.base),
                _SettingsSection(
                  title: 'APP',
                  items: [
                    _SettingItem(icon: Icons.notifications_none_rounded, label: 'Notifiche', onTap: () {}),
                    _SettingItem(icon: Icons.lock_outline_rounded, label: 'Privacy', onTap: () {}),
                    _SettingItem(icon: Icons.info_outline_rounded, label: 'Info app', trailing: const Text('v1.0.0', style: TextStyle(color: AppColors.textMuted, fontFamily: 'Inter', fontSize: 13)), onTap: () {}),
                  ],
                ).animate().fadeIn(delay: 300.ms),
                const Gap(AppSpacing.xl),
                GritButton(
                  label: 'Esci',
                  isDestructive: true,
                  onPressed: () => ref.read(authProvider.notifier).logout(),
                ).animate().fadeIn(delay: 350.ms),
                const Gap(AppSpacing.xxxl),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.user});
  final dynamic user;

  @override
  Widget build(BuildContext context) {
    final weight = user?.weightKg != null
        ? '${(user!.weightKg as double).toStringAsFixed(0)} kg'
        : '--';
    return Row(
      children: [
        Expanded(child: _StatChip(value: '0', label: 'Sessioni')),
        const Gap(AppSpacing.sm),
        Expanded(child: _StatChip(value: '0', label: 'Streak')),
        const Gap(AppSpacing.sm),
        Expanded(child: _StatChip(value: weight, label: 'Peso')),
      ],
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({required this.value, required this.label});
  final String value, label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Text(value, style: const TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  const _SettingsSection({required this.title, required this.items});
  final String title;
  final List<_SettingItem> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: Text(title, style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.textMuted, letterSpacing: 1.5)),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surfaceElevated,
            borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: items.indexed.map((indexed) {
              final (i, item) = indexed;
              return Column(
                children: [
                  if (i > 0) Container(height: 0.5, color: AppColors.border),
                  item,
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _SettingItem extends StatelessWidget {
  const _SettingItem({required this.icon, required this.label, required this.onTap, this.trailing});
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base, vertical: 14),
        child: Row(
          children: [
            Icon(icon, color: AppColors.textSecondary, size: 20),
            const Gap(AppSpacing.base),
            Expanded(child: Text(label, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textPrimary))),
            if (trailing != null) trailing!,
            if (trailing == null) const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted, size: 14),
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(label, style: TextStyle(fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w600, color: color)),
    );
  }
}
