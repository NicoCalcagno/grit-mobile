import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/widgets/grit_button.dart';
import '../providers/workout_provider.dart';
import '../../../models/workout_model.dart';

class ActiveWorkoutScreen extends ConsumerStatefulWidget {
  const ActiveWorkoutScreen({super.key, this.planId});
  final String? planId;

  @override
  ConsumerState<ActiveWorkoutScreen> createState() => _ActiveWorkoutScreenState();
}

class _ActiveWorkoutScreenState extends ConsumerState<ActiveWorkoutScreen> {
  late Timer _timer;
  int _elapsed = 0;
  int _currentExerciseIdx = 0;
  int _currentSet = 1;
  bool _isResting = false;
  int _restRemaining = 0;
  Timer? _restTimer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _elapsed++);
    });
    Future.microtask(() => ref.read(workoutProvider.notifier).startSession(planId: widget.planId));
  }

  @override
  void dispose() {
    _timer.cancel();
    _restTimer?.cancel();
    super.dispose();
  }

  List<Exercise> get _exercises {
    return ref.read(workoutProvider).todayPlan?.exercises ?? [];
  }

  Exercise? get _currentExercise {
    final list = _exercises;
    if (_currentExerciseIdx >= list.length) return null;
    return list[_currentExerciseIdx];
  }

  void _completeSet() {
    HapticFeedback.mediumImpact();
    final exercise = _currentExercise;
    if (exercise == null) return;

    if (_currentSet < exercise.sets) {
      setState(() => _currentSet++);
      _startRest(exercise.restSeconds);
    } else {
      _nextExercise();
    }
  }

  void _startRest(int seconds) {
    setState(() {
      _isResting = true;
      _restRemaining = seconds;
    });
    _restTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_restRemaining <= 1) {
        t.cancel();
        HapticFeedback.heavyImpact();
        setState(() => _isResting = false);
      } else {
        setState(() => _restRemaining--);
      }
    });
  }

  void _nextExercise() {
    if (_currentExerciseIdx >= _exercises.length - 1) {
      _finishWorkout();
      return;
    }
    setState(() {
      _currentExerciseIdx++;
      _currentSet = 1;
      _isResting = false;
    });
  }

  void _finishWorkout() {
    final session = ref.read(workoutProvider).activeSession;
    if (session != null) {
      ref.read(workoutProvider.notifier).completeSession(session.id, {
        'duration_minutes': _elapsed ~/ 60,
        'perceived_exertion': 7,
      });
    }
    context.go('/home');
  }

  String _formatTime(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final exercises = _exercises;
    final exercise = _currentExercise;
    final progress = exercises.isEmpty ? 0.0 : _currentExerciseIdx / exercises.length;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding, vertical: AppSpacing.base),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => _showQuitDialog(context),
                    child: const Icon(Icons.close_rounded, color: AppColors.textMuted),
                  ),
                  const Spacer(),
                  Text(
                    _formatTime(_elapsed),
                    style: const TextStyle(fontFamily: 'Inter', fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.textSecondary),
                  ),
                  const Spacer(),
                  Text(
                    '${_currentExerciseIdx + 1}/${exercises.length}',
                    style: const TextStyle(fontFamily: 'Inter', fontSize: 15, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            // Progress bar
            Container(
              height: 3,
              margin: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(100),
                child: LinearProgressIndicator(
                  value: progress,
                  backgroundColor: AppColors.border,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                ),
              ),
            ),
            const Gap(AppSpacing.xl),

            Expanded(
              child: _isResting
                  ? _RestView(remaining: _restRemaining, onSkip: () {
                      _restTimer?.cancel();
                      setState(() => _isResting = false);
                    })
                  : (exercise == null
                      ? _FinishView(elapsed: _elapsed, onFinish: _finishWorkout)
                      : _ExerciseView(
                          exercise: exercise,
                          currentSet: _currentSet,
                          onComplete: _completeSet,
                          onSkip: _nextExercise,
                        ).animate(key: ValueKey(_currentExerciseIdx)).fadeIn(duration: 300.ms).slideX(begin: 0.1, end: 0)),
            ),
          ],
        ),
      ),
    );
  }

  void _showQuitDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surfaceElevated,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.cardRadiusLg)),
        title: const Text('Interrompere?', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        content: const Text('I progressi di questa sessione andranno persi.', style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Continua', style: TextStyle(color: AppColors.primary))),
          TextButton(onPressed: () { Navigator.pop(context); context.go('/workout'); }, child: const Text('Esci', style: TextStyle(color: AppColors.error))),
        ],
      ),
    );
  }
}

class _ExerciseView extends StatelessWidget {
  const _ExerciseView({required this.exercise, required this.currentSet, required this.onComplete, required this.onSkip});
  final Exercise exercise;
  final int currentSet;
  final VoidCallback onComplete, onSkip;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Exercise name
          Text(
            exercise.name,
            style: Theme.of(context).textTheme.displaySmall,
          ),
          const Gap(AppSpacing.sm),
          // Muscles
          Wrap(
            spacing: 6,
            children: exercise.muscles.map((m) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primaryDim,
                borderRadius: BorderRadius.circular(100),
              ),
              child: Text(m, style: const TextStyle(fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary)),
            )).toList(),
          ),
          const Gap(AppSpacing.xxl),
          // Set / Reps display
          Center(
            child: Column(
              children: [
                Text(
                  'Serie $currentSet/${exercise.sets}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const Gap(AppSpacing.sm),
                Text(
                  exercise.reps,
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 72,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                    letterSpacing: -3,
                    height: 1,
                  ),
                ),
                Text(
                  'ripetizioni',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
          if (exercise.notes != null) ...
            [
              const Gap(AppSpacing.xl),
              Container(
                padding: const EdgeInsets.all(AppSpacing.base),
                decoration: BoxDecoration(
                  color: AppColors.surfaceElevated,
                  borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, color: AppColors.textMuted, size: 16),
                    const Gap(AppSpacing.sm),
                    Expanded(child: Text(exercise.notes!, style: Theme.of(context).textTheme.bodySmall)),
                  ],
                ),
              ),
            ],
          const Spacer(),
          Row(
            children: [
              Expanded(
                child: GritButton(
                  label: 'Salta',
                  isSecondary: true,
                  onPressed: onSkip,
                ),
              ),
              const Gap(AppSpacing.base),
              Expanded(
                flex: 2,
                child: GritButton(
                  label: 'Serie completata',
                  icon: Icons.check_rounded,
                  onPressed: onComplete,
                ),
              ),
            ],
          ),
          const Gap(AppSpacing.base),
        ],
      ),
    );
  }
}

class _RestView extends StatelessWidget {
  const _RestView({required this.remaining, required this.onSkip});
  final int remaining;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('RIPOSO', style: Theme.of(context).textTheme.labelMedium?.copyWith(letterSpacing: 2, color: AppColors.textMuted)),
        const Gap(AppSpacing.base),
        Text(
          '$remaining',
          style: const TextStyle(fontFamily: 'Inter', fontSize: 96, fontWeight: FontWeight.w800, color: AppColors.primary, height: 1),
        ).animate(key: ValueKey(remaining)).scaleXY(begin: 1.2, end: 1, duration: 300.ms, curve: Curves.easeOut),
        Text('secondi', style: Theme.of(context).textTheme.bodyMedium),
        const Gap(AppSpacing.xxl),
        GritButton(
          label: 'Salta riposo',
          isSecondary: true,
          fullWidth: false,
          onPressed: onSkip,
        ),
      ],
    );
  }
}

class _FinishView extends StatelessWidget {
  const _FinishView({required this.elapsed, required this.onFinish});
  final int elapsed;
  final VoidCallback onFinish;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.screenPadding),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('🏆', style: TextStyle(fontSize: 64)).animate().scale(curve: Curves.elasticOut, duration: 800.ms),
          const Gap(AppSpacing.base),
          Text('Workout completato!', style: Theme.of(context).textTheme.displaySmall).animate().fadeIn(delay: 200.ms),
          const Gap(AppSpacing.sm),
          Text(
            '${(elapsed ~/ 60)} minuti di allenamento',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
          ).animate().fadeIn(delay: 300.ms),
          const Gap(AppSpacing.xxl),
          GritButton(label: 'Torna alla home', onPressed: onFinish).animate().fadeIn(delay: 400.ms),
        ],
      ),
    );
  }
}
