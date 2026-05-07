import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import { WorkoutProgressResponse, NutritionProgressResponse, WeeklySummaryResponse } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import client from '../../api/client';
import GritCard from '../../components/ui/GritCard';
import GritButton from '../../components/ui/GritButton';

const ACHIEVEMENT_DEFS = [
  { id: 'first_session', title: 'Prima sessione', icon: '🏃', minSessions: 1 },
  { id: 'streak_7', title: '7 giorni di fila', icon: '🔥', minStreak: 7 },
  { id: 'sessions_10', title: '10 sessioni', icon: '💪', minSessions: 10 },
  { id: 'sessions_42', title: '42 sessioni', icon: '🌟', minSessions: 42 },
];

export default function ProgressScreen() {
  const [workoutData, setWorkoutData] = useState<WorkoutProgressResponse | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionProgressResponse | null>(null);
  const [summary, setSummary] = useState<WeeklySummaryResponse | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  useEffect(() => {
    setLoadingData(true);
    Promise.all([
      client.get<WorkoutProgressResponse>('/progress/workouts').then((r) => setWorkoutData(r.data)).catch(() => {}),
      client.get<NutritionProgressResponse>('/progress/nutrition?days=7').then((r) => setNutritionData(r.data)).catch(() => {}),
    ]).finally(() => setLoadingData(false));
  }, []);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const { data } = await client.get<WeeklySummaryResponse>('/progress/weekly-summary');
      setSummary(data);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Bar chart from calories_by_week
  const weekEntries = workoutData
    ? Object.entries(workoutData.calories_by_week).slice(-7).map(([week, val]) => ({ label: week.split('-W')[1] ?? week, value: val }))
    : [];
  const weekMax = Math.max(...weekEntries.map((e) => e.value), 1);

  // Bar chart from daily_breakdown
  const dailyEntries = nutritionData
    ? Object.entries(nutritionData.daily_breakdown).slice(-7).map(([date, val]) => ({
        label: format(new Date(date), 'EEE', { locale: it }),
        value: val.calories,
      }))
    : [];
  const dailyMax = Math.max(...dailyEntries.map((e) => e.value), 1);

  const unlocked = new Set<string>();
  if (workoutData) {
    if (workoutData.total_sessions >= 1) unlocked.add('first_session');
    if (workoutData.total_sessions >= 10) unlocked.add('sessions_10');
    if (workoutData.total_sessions >= 42) unlocked.add('sessions_42');
    if (workoutData.streak_days >= 7) unlocked.add('streak_7');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Progressi</Text>

        {/* Workout chart */}
        <GritCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>Calorie bruciate per settimana</Text>
          {loadingData ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <SimpleBarChart data={weekEntries} max={weekMax} color={colors.primary} unit="W" />
          )}
        </GritCard>

        {/* Nutrition chart */}
        <GritCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>Calorie consumate — ultimi 7 giorni</Text>
          {loadingData ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <SimpleBarChart data={dailyEntries} max={dailyMax} color={colors.accent} />
          )}
        </GritCard>

        {/* Streak + stats */}
        {workoutData && (
          <GritCard style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{workoutData.streak_days}</Text>
                <Text style={styles.statLabel}>🔥 Streak</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{workoutData.total_sessions}</Text>
                <Text style={styles.statLabel}>Sessioni totali</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{Math.round(workoutData.total_minutes / 60)}h</Text>
                <Text style={styles.statLabel}>Ore totali</Text>
              </View>
            </View>
          </GritCard>
        )}

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievement</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENT_DEFS.map((a) => (
            <View key={a.id} style={[styles.badge, !unlocked.has(a.id) && styles.locked]}>
              <Text style={styles.badgeIcon}>{a.icon}</Text>
              <Text style={styles.badgeTitle}>{a.title}</Text>
            </View>
          ))}
        </View>

        {/* Weekly summary */}
        <GritCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 Riassunto settimanale AI</Text>
          {summary ? (
            <>
              <Text style={styles.summaryText} numberOfLines={summaryExpanded ? undefined : 3}>
                {summary.summary}
              </Text>
              <View style={styles.summaryStats}>
                <Text style={styles.summaryStat}>💪 {summary.workout_stats.total_sessions} sessioni · {summary.workout_stats.total_minutes}min</Text>
                <Text style={styles.summaryStat}>🥗 Media {Math.round(summary.nutrition_stats.avg_daily_calories)} kcal/giorno</Text>
              </View>
              <TouchableOpacity onPress={() => setSummaryExpanded((e) => !e)}>
                <Text style={styles.expandBtn}>{summaryExpanded ? 'Mostra meno' : 'Leggi tutto'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <GritButton label="Genera riassunto" onPress={fetchSummary} loading={loadingSummary} variant="secondary" size="sm" />
          )}
        </GritCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function SimpleBarChart({ data, max, color, unit = '' }: { data: { label: string; value: number }[]; max: number; color: string; unit?: string }) {
  if (data.length === 0) {
    return <Text style={{ color: colors.textMuted, ...typography.caption, textAlign: 'center', paddingVertical: spacing.md }}>Nessun dato</Text>;
  }
  return (
    <View style={barStyles.container}>
      {data.map(({ label, value }, i) => (
        <View key={i} style={barStyles.col}>
          <View style={barStyles.track}>
            <View style={[barStyles.fill, { height: `${(value / max) * 100}%`, backgroundColor: color }]} />
          </View>
          <Text style={barStyles.label}>{label}{unit}</Text>
          <Text style={[barStyles.value, { color }]}>{value > 0 ? Math.round(value) : ''}</Text>
        </View>
      ))}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { flexDirection: 'row', height: 100, gap: spacing.xs, alignItems: 'flex-end' },
  col: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 2 },
  track: { width: '70%', flex: 1, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end' },
  fill: { width: '100%', borderRadius: 3 },
  label: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  value: { fontSize: 9, fontFamily: 'Courier' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: spacing.xxl },
  title: { ...typography.heading2, color: colors.text, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  chartCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  chartTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
  statsCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.primary, fontFamily: 'Courier' },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  sectionTitle: { ...typography.heading3, color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg, justifyContent: 'space-between' },
  badge: { width: '47%', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.border },
  locked: { opacity: 0.35 },
  badgeIcon: { fontSize: 28 },
  badgeTitle: { ...typography.caption, color: colors.text, textAlign: 'center', fontWeight: '600' },
  summaryCard: { marginHorizontal: spacing.lg },
  summaryTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
  summaryText: { ...typography.body, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.sm },
  summaryStats: { gap: 4, marginBottom: spacing.sm },
  summaryStat: { ...typography.caption, color: colors.textMuted },
  expandBtn: { color: colors.primary, ...typography.bodySmall },
});
