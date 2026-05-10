import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/endpoints.dart';
import '../../../core/widgets/grit_button.dart';
import '../../../models/user_model.dart';
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
                    _SettingItem(
                      icon: Icons.person_outline_rounded,
                      label: 'Dati personali',
                      onTap: () => _openPersonalDataSheet(context, ref, user),
                    ),
                    _SettingItem(icon: Icons.fitness_center_rounded, label: 'Obiettivi fitness', onTap: () {}),
                    _SettingItem(icon: Icons.restaurant_menu_rounded, label: 'Preferenze alimentari', onTap: () {}),
                  ],
                ).animate().fadeIn(delay: 150.ms),
                const Gap(AppSpacing.base),

                _SettingsSection(
                  title: 'COACH AI',
                  items: [
                    _SettingItem(
                      icon: Icons.record_voice_over_rounded,
                      label: 'Tono del coach',
                      trailing: Text(user?.coachTone?.name ?? 'motivating', style: const TextStyle(color: AppColors.textMuted, fontFamily: 'Inter', fontSize: 13)),
                      onTap: () {},
                    ),
                    _SettingItem(
                      icon: Icons.language_rounded,
                      label: 'Lingua',
                      trailing: Text(user?.coachLanguage?.name.toUpperCase() ?? 'IT', style: const TextStyle(color: AppColors.textMuted, fontFamily: 'Inter', fontSize: 13)),
                      onTap: () {},
                    ),
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

  void _openPersonalDataSheet(BuildContext context, WidgetRef ref, UserProfile? user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _PersonalDataSheet(user: user, ref: ref),
    );
  }
}

class _PersonalDataSheet extends StatefulWidget {
  const _PersonalDataSheet({required this.user, required this.ref});
  final UserProfile? user;
  final WidgetRef ref;

  @override
  State<_PersonalDataSheet> createState() => _PersonalDataSheetState();
}

class _PersonalDataSheetState extends State<_PersonalDataSheet> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _ageCtrl;
  late final TextEditingController _weightCtrl;
  late final TextEditingController _heightCtrl;
  String? _gender;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final u = widget.user;
    _nameCtrl = TextEditingController(text: u?.name ?? '');
    _ageCtrl = TextEditingController(text: u?.age?.toString() ?? '');
    _weightCtrl = TextEditingController(text: u?.weightKg?.toString() ?? '');
    _heightCtrl = TextEditingController(text: u?.heightCm?.toString() ?? '');
    _gender = u?.gender;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _ageCtrl.dispose();
    _weightCtrl.dispose();
    _heightCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final dio = widget.ref.read(apiClientProvider);
      await dio.put(Endpoints.me, data: {
        if (_nameCtrl.text.trim().isNotEmpty) 'name': _nameCtrl.text.trim(),
        if (_ageCtrl.text.trim().isNotEmpty) 'age': int.tryParse(_ageCtrl.text.trim()),
        if (_weightCtrl.text.trim().isNotEmpty) 'weight_kg': double.tryParse(_weightCtrl.text.trim()),
        if (_heightCtrl.text.trim().isNotEmpty) 'height_cm': double.tryParse(_heightCtrl.text.trim()),
        if (_gender != null) 'gender': _gender,
      });
      await widget.ref.read(authProvider.notifier).refreshUser();
      if (mounted) Navigator.of(context).pop();
    } catch (_) {
      setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.fromLTRB(AppSpacing.screenPadding, 24, AppSpacing.screenPadding, 24 + bottomPadding),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Dati personali', style: Theme.of(context).textTheme.headlineMedium),
              const Spacer(),
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close_rounded, color: AppColors.textMuted),
              ),
            ],
          ),
          const Gap(AppSpacing.base),
          _Field(controller: _nameCtrl, label: 'Nome', keyboardType: TextInputType.name),
          const Gap(AppSpacing.sm),
          Row(
            children: [
              Expanded(child: _Field(controller: _ageCtrl, label: 'Età', keyboardType: TextInputType.number, inputFormatters: [FilteringTextInputFormatter.digitsOnly])),
              const Gap(AppSpacing.sm),
              Expanded(child: _Field(controller: _weightCtrl, label: 'Peso (kg)', keyboardType: const TextInputType.numberWithOptions(decimal: true))),
              const Gap(AppSpacing.sm),
              Expanded(child: _Field(controller: _heightCtrl, label: 'Altezza (cm)', keyboardType: const TextInputType.numberWithOptions(decimal: true))),
            ],
          ),
          const Gap(AppSpacing.sm),
          Text('Sesso', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textMuted)),
          const Gap(6),
          Row(
            children: [
              _GenderChip(label: 'M', value: 'male', selected: _gender == 'male', onTap: () => setState(() => _gender = 'male')),
              const Gap(8),
              _GenderChip(label: 'F', value: 'female', selected: _gender == 'female', onTap: () => setState(() => _gender = 'female')),
              const Gap(8),
              _GenderChip(label: 'Altro', value: 'other', selected: _gender == 'other', onTap: () => setState(() => _gender = 'other')),
            ],
          ),
          const Gap(AppSpacing.xl),
          GritButton(
            label: 'Salva',
            isLoading: _saving,
            onPressed: _save,
          ),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({
    required this.controller,
    required this.label,
    this.keyboardType,
    this.inputFormatters,
  });
  final TextEditingController controller;
  final String label;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      style: const TextStyle(fontFamily: 'Inter', color: AppColors.textPrimary, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontFamily: 'Inter', color: AppColors.textMuted, fontSize: 13),
        filled: true,
        fillColor: AppColors.surfaceElevated,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
      ),
    );
  }
}

class _GenderChip extends StatelessWidget {
  const _GenderChip({required this.label, required this.value, required this.selected, required this.onTap});
  final String label, value;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppColors.primaryDim : AppColors.surfaceElevated,
          borderRadius: BorderRadius.circular(100),
          border: Border.all(color: selected ? AppColors.primary : AppColors.border, width: selected ? 1.5 : 1),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: selected ? AppColors.primary : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({this.user});
  final UserProfile? user;

  @override
  Widget build(BuildContext context) {
    final weight = user?.weightKg != null ? '${user!.weightKg!.toStringAsFixed(1)} kg' : '--';
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
