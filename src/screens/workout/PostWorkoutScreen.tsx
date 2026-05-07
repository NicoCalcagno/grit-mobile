import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

import { WorkoutStackParamList, ExertionLevel } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useHealthKit } from '../../hooks/useHealthKit';
import GritButton from '../../components/ui/GritButton';
import GritCard from '../../components/ui/GritCard';

type Nav = NativeStackNavigationProp<WorkoutStackParamList>;
type Route = RouteProp<WorkoutStackParamList, 'PostWorkout'>;

const EXERTION_LABELS: Record<number, string> = {
  1: 'Facilissimo', 2: 'Molto facile', 3: 'Facile', 4: 'Moderato', 5: 'Impegnativo',
  6: 'Difficile', 7: 'Molto difficile', 8: 'Duro', 9: 'Estremamente duro', 10: 'Massimale',
};

export default function PostWorkoutScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { sessionId } = route.params;

  const { activeSession, activePlan, completeSession, resetSession } = useWorkoutStore();
  const { calories, heartRate } = useHealthKit();

  const [exertion, setExertion] = useState<ExertionLevel>(6);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!completed) handleComplete();
  }, []);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const startedAt = activeSession?.started_at ? new Date(activeSession.started_at) : new Date();
      const durationMinutes = Math.round((Date.now() - startedAt.getTime()) / 60000);

      const session = await completeSession(sessionId, {
        duration_minutes: durationMinutes,
        calories_burned: calories,
        avg_heart_rate: heartRate,
        perceived_exertion: exertion,
        exercises_completed: [],
        exercises_skipped: [],
      });
      setCompleted(true);
      if (session.ai_summary) {
        setAiSummary(session.ai_summary);
        Speech.speak(session.ai_summary, { language: 'it-IT' });
      }
    } finally {
      setCompleting(false);
    }
  };

  const handleShare = async () => {
    const name = activePlan?.name ?? 'Allenamento';
    const completed = activeSession?.exercisesCompletedCount ?? 0;
    await Share.share({
      message: `Ho completato "${name}" su Grit! 💪\n${completed} esercizi · ${calories} kcal · FC media ${heartRate} BPM`,
    });
  };

  const handleDone = () => {
    resetSession();
    // Navigate back to Main tab
    navigation.getParent()?.goBack();
  };

  const durationMinutes = activeSession?.started_at
    ? Math.round((Date.now() - new Date(activeSession.started_at).getTime()) / 60000)
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {completing ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Riepilogo in preparazione…</Text>
          </View>
        ) : (
          <>
            <View style={styles.trophy}>
              <Text style={styles.trophyIcon}>🏆</Text>
              <Text style={styles.trophyTitle}>Allenamento completato!</Text>
              <Text style={styles.trophySubtitle}>{activePlan?.name}</Text>
            </View>

            <View style={styles.statsGrid}>
              <StatItem icon="time-outline" label="Durata" value={`${durationMinutes}m`} color={colors.text} />
              <StatItem icon="flame" label="Calorie" value={`${calories}`} unit="kcal" color={colors.primary} />
              <StatItem icon="heart" label="FC media" value={`${heartRate}`} unit="BPM" color={colors.error} />
              <StatItem
                icon="barbell-outline"
                label="Completati"
                value={`${activeSession?.exercisesCompletedCount ?? 0}/${activePlan?.exercises.length ?? 0}`}
                color={colors.success}
              />
            </View>

            {aiSummary && (
              <GritCard style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryIcon}>🤖</Text>
                  <Text style={styles.summaryTitle}>Analisi del coach AI</Text>
                </View>
                <Text style={styles.summaryText}>{aiSummary}</Text>
              </GritCard>
            )}

            {/* Exertion rating */}
            <GritCard style={styles.exertionCard}>
              <Text style={styles.exertionTitle}>Com'era la fatica percepita?</Text>
              <View style={styles.exertionRow}>
                {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as ExertionLevel[]).map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.exertionBtn, exertion === e && styles.exertionBtnActive]}
                    onPress={() => setExertion(e)}
                  >
                    <Text style={[styles.exertionNum, exertion === e && styles.exertionNumActive]}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.exertionLabel}>{EXERTION_LABELS[exertion]}</Text>
            </GritCard>

            <GritCard style={styles.recoveryCard}>
              <Text style={styles.recoveryTitle}>🧘 Recupero consigliato</Text>
              <Text style={styles.recoveryBody}>
                Fai 10 minuti di stretching per i gruppi muscolari allenati. Priorità:
                proteine entro 30 minuti (20–40g). Idratati con almeno 500ml d'acqua.
              </Text>
            </GritCard>

            <View style={styles.ctaRow}>
              <GritButton label="Condividi 🎉" onPress={handleShare} variant="secondary" style={styles.shareBtn} />
              <GritButton label="Torna alla Home" onPress={handleDone} style={styles.homeBtn} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ icon, label, value, unit, color }: { icon: string; label: string; value: string; unit?: string; color: string }) {
  return (
    <GritCard style={siStyles.card}>
      <Ionicons name={icon as React.ComponentProps<typeof Ionicons>['name']} size={20} color={color} />
      <Text style={[siStyles.value, { color }]}>{value}</Text>
      {unit && <Text style={siStyles.unit}>{unit}</Text>}
      <Text style={siStyles.label}>{label}</Text>
    </GritCard>
  );
}

const siStyles = StyleSheet.create({
  card: { flex: 1, alignItems: 'center', gap: 2 },
  value: { fontSize: 22, fontWeight: '800', fontFamily: 'Courier' },
  unit: { ...typography.caption, color: colors.textMuted },
  label: { ...typography.caption, color: colors.textSecondary },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl, gap: spacing.md },
  loadingText: { ...typography.body, color: colors.textSecondary },
  trophy: { alignItems: 'center', paddingVertical: spacing.xl },
  trophyIcon: { fontSize: 72, marginBottom: spacing.md },
  trophyTitle: { fontSize: 28, fontWeight: '800', color: colors.text },
  trophySubtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  summaryCard: { marginBottom: spacing.md },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  summaryIcon: { fontSize: 20 },
  summaryTitle: { ...typography.bodyMedium, color: colors.text },
  summaryText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  exertionCard: { marginBottom: spacing.md },
  exertionTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
  exertionRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  exertionBtn: { width: 28, height: 28, borderRadius: radii.full, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  exertionBtnActive: { backgroundColor: colors.primary },
  exertionNum: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  exertionNumActive: { color: colors.white },
  exertionLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  recoveryCard: { marginBottom: spacing.lg },
  recoveryTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.sm },
  recoveryBody: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  ctaRow: { flexDirection: 'row', gap: spacing.md },
  shareBtn: { flex: 1 },
  homeBtn: { flex: 2 },
});
