import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { WorkoutStackParamList, WorkoutPhase, CoachEvent } from '../../types';
import { colors, spacing, typography } from '../../constants/theme';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useMusicStore } from '../../stores/musicStore';
import { useAuthStore } from '../../stores/authStore';
import { useWorkoutTimer } from '../../hooks/useWorkoutTimer';
import { useHealthKit } from '../../hooks/useHealthKit';
import { useCoach } from '../../hooks/useCoach';
import ExerciseCard from '../../components/workout/ExerciseCard';
import HeartRateWidget from '../../components/workout/HeartRateWidget';
import ProgressRing from '../../components/workout/ProgressRing';
import CoachBubble from '../../components/coach/CoachBubble';
import VoiceInputButton from '../../components/coach/VoiceInputButton';
import MiniPlayer from '../../components/music/MiniPlayer';
import GritButton from '../../components/ui/GritButton';

type Nav = NativeStackNavigationProp<WorkoutStackParamList, 'ActiveWorkout'>;
type Route = RouteProp<WorkoutStackParamList, 'ActiveWorkout'>;

export default function ActiveWorkoutScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { sessionId } = route.params;

  const { activePlan, activeSession, advanceSet, skipExercise, updateSession } = useWorkoutStore();
  const { fetchRecommendations, isConnected: spotifyConnected, currentPhase } = useMusicStore();
  const { user } = useAuthStore();
  const { elapsed, formattedElapsed, startRest } = useWorkoutTimer();
  const { heartRate, calories } = useHealthKit(true);
  const { coachMessage, isSpeaking, triggerCoach } = useCoach({
    language: (user?.coach_language ?? user?.coachLanguage) === 'en' ? 'en-US' : 'it-IT',
  });

  const exercises = activePlan?.exercises ?? [];
  const currentIdx = activeSession?.currentExerciseIndex ?? 0;
  const currentSet = activeSession?.currentSet ?? 1;
  const currentExercise = exercises[currentIdx];
  const totalExercises = exercises.length;
  const overallProgress = totalExercises > 0 ? currentIdx / totalExercises : 0;

  const prevIdxRef = useRef(-1);

  // Trigger coach and music on exercise change
  useEffect(() => {
    if (!currentExercise || currentIdx === prevIdxRef.current) return;
    prevIdxRef.current = currentIdx;

    triggerCoach('exercise_start', {
      exercise_name: currentExercise.name,
      set_number: currentSet,
      heart_rate: heartRate,
      elapsed_minutes: Math.floor(elapsed / 60),
      session_context: { workout_type: activePlan?.type },
    });

    updateSession(sessionId, { avg_heart_rate: heartRate });

    const phase = getPhaseFromIndex(currentIdx, totalExercises);
    if (spotifyConnected && phase !== currentPhase) {
      fetchRecommendations(phase);
    }
  }, [currentIdx]);

  // Workout completion
  useEffect(() => {
    if (currentIdx >= totalExercises && totalExercises > 0) {
      triggerCoach('workout_end', { elapsed_minutes: Math.floor(elapsed / 60) });
      setTimeout(() => {
        navigation.replace('PostWorkout', { sessionId });
      }, 2000);
    }
  }, [currentIdx, totalExercises]);

  // Sync HealthKit every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      updateSession(sessionId, { avg_heart_rate: heartRate, calories_burned: calories });
    }, 30_000);
    return () => clearInterval(interval);
  }, [heartRate, calories, sessionId]);

  const handleSetComplete = useCallback(() => {
    if (!currentExercise) return;
    triggerCoach('set_complete', {
      exercise_name: currentExercise.name,
      set_number: currentSet,
      heart_rate: heartRate,
      elapsed_minutes: Math.floor(elapsed / 60),
    });

    const isLastSet = currentSet >= currentExercise.sets;
    if (!isLastSet) {
      navigation.push('RestTimer', {
        sessionId,
        restSeconds: currentExercise.rest_seconds,
        nextExercise: currentExercise.name,
      });
    }
    advanceSet();
  }, [currentExercise, currentSet, sessionId, advanceSet, triggerCoach, navigation, heartRate, elapsed]);

  const handleSkip = useCallback(() => {
    Alert.alert('Salta esercizio', 'Sei sicuro di voler saltare questo esercizio?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Salta', style: 'destructive', onPress: skipExercise },
    ]);
  }, [skipExercise]);

  const handleEnd = useCallback(() => {
    Alert.alert('Termina allenamento', "Vuoi terminare l'allenamento adesso?", [
      { text: 'Continua', style: 'cancel' },
      { text: 'Termina', style: 'destructive', onPress: () => navigation.replace('PostWorkout', { sessionId }) },
    ]);
  }, [sessionId, navigation]);

  if (!currentExercise && currentIdx < totalExercises) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Caricamento esercizio…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.timer}>{formattedElapsed}</Text>
        <ProgressRing progress={overallProgress} size={44} strokeWidth={4} color={colors.primary}>
          <Text style={styles.progressText}>{currentIdx}/{totalExercises}</Text>
        </ProgressRing>
        <View style={styles.topRight}>
          <HeartRateWidget bpm={heartRate} />
          <TouchableOpacity onPress={handleEnd} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="stop-circle-outline" size={28} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calorie strip */}
      <View style={styles.calStrip}>
        <Ionicons name="flame" size={14} color={colors.accent} />
        <Text style={styles.calText}>{calories} kcal bruciate</Text>
      </View>

      {/* Coach bubble */}
      <CoachBubble message={coachMessage} visible={isSpeaking || !!coachMessage} />

      {/* Exercises */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {currentExercise && (
          <ExerciseCard exercise={currentExercise} currentSet={currentSet} isActive />
        )}
        {exercises.slice(currentIdx + 1, currentIdx + 3).map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} currentSet={1} />
        ))}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Ionicons name="play-skip-forward-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.skipText}>Salta</Text>
        </TouchableOpacity>

        <GritButton
          label={`Serie ${currentSet} completata ✓`}
          onPress={handleSetComplete}
          size="lg"
          style={styles.completeBtn}
        />

        <VoiceInputButton
          onResponse={(text) => triggerCoach('set_complete', { exercise_name: currentExercise?.name })}
          currentExerciseName={currentExercise?.name}
          currentSet={currentSet}
          heartRate={heartRate}
          elapsedMinutes={Math.floor(elapsed / 60)}
        />
      </View>

      <MiniPlayer />
    </SafeAreaView>
  );
}

function getPhaseFromIndex(idx: number, total: number): WorkoutPhase {
  const pct = idx / total;
  if (pct < 0.15) return 'warmup';
  if (pct < 0.75) return 'peak';
  if (pct < 0.9) return 'recovery';
  return 'cooldown';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  timer: { fontSize: 32, fontWeight: '700', color: colors.text, fontFamily: 'Courier', flex: 1 },
  progressText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, justifyContent: 'flex-end' },
  calStrip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  calText: { ...typography.caption, color: colors.accent },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  actions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  skipBtn: { alignItems: 'center', gap: 4 },
  skipText: { ...typography.caption, color: colors.textSecondary },
  completeBtn: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },
});
