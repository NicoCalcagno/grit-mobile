import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/widgets/grit_button.dart';
import '../../../core/widgets/grit_text_field.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    HapticFeedback.mediumImpact();
    await ref.read(authProvider.notifier).register(
          _nameCtrl.text.trim(),
          _emailCtrl.text.trim(),
          _passCtrl.text,
        );
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(authProvider) is _Loading;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.screenPadding),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Gap(AppSpacing.xxl),
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textSecondary),
                  onPressed: () => context.pop(),
                ),
                const Gap(AppSpacing.lg),
                Text('Crea account.', style: Theme.of(context).textTheme.displayMedium)
                    .animate().fadeIn(duration: 600.ms).slideY(begin: 0.2, end: 0),
                const Gap(AppSpacing.sm),
                Text(
                  'Inizia il tuo percorso con Grit.',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
                ).animate().fadeIn(delay: 100.ms),
                const Gap(AppSpacing.xxxl),
                GritTextField(
                  controller: _nameCtrl,
                  label: 'Nome completo',
                  validator: (v) => v == null || v.isEmpty ? 'Inserisci il tuo nome' : null,
                ).animate().fadeIn(delay: 150.ms).slideX(begin: -0.1, end: 0),
                const Gap(AppSpacing.base),
                GritTextField(
                  controller: _emailCtrl,
                  label: 'Email',
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => v == null || v.isEmpty ? 'Inserisci email' : null,
                ).animate().fadeIn(delay: 200.ms).slideX(begin: -0.1, end: 0),
                const Gap(AppSpacing.base),
                GritTextField(
                  controller: _passCtrl,
                  label: 'Password',
                  obscureText: true,
                  validator: (v) => v == null || v.length < 6 ? 'Min. 6 caratteri' : null,
                ).animate().fadeIn(delay: 250.ms).slideX(begin: -0.1, end: 0),
                const Gap(AppSpacing.xl),
                GritButton(
                  label: 'Crea account',
                  isLoading: isLoading,
                  onPressed: _submit,
                ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2, end: 0),
                const Gap(AppSpacing.lg),
                Center(
                  child: GestureDetector(
                    onTap: () => context.go('/login'),
                    child: RichText(
                      text: TextSpan(
                        text: 'Hai già un account? ',
                        style: Theme.of(context).textTheme.bodyMedium,
                        children: const [
                          TextSpan(
                            text: 'Accedi',
                            style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  ),
                ).animate().fadeIn(delay: 350.ms),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
