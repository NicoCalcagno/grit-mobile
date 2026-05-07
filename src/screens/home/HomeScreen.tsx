import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, WorkoutDay } from '../../types';
import { colors, spacing, typography, radii, shadows } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useHealthKit } from '../../hooks/useHealthKit';
import GritCard from '../../components/ui/GritCard';
import GritButton from '../../components/ui/GritButton';
import InsightCard from '../../components/nutrition/InsightCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const { weeklyPlan, fetchWeeklyPlan, setActivePlan, isLoading } = useWorkoutStore();
  const { summary, insights, fetchSummary, fetchInsights } = useNutritionStore();
  const { calories: hkCalories } = useHealthKit();

  const today = new Date();
  const todayDow = today.getDay();

  useEffect(() => {
    fetchWeeklyPlan();
    fetchSummary(format(today, 'yyyy-MM-dd'), hkCalories);
    fetchInsights();
  }, []);

  const onRefresh = useCallback(async () => {
    await Promise.all([
      fetchWeeklyPlan(),
      fetchSummary(format(today, 'yyyy-MM-dd'), hkCalories),
      fetchInsights(),
    ]);
  }, [hkCalories]);

  const todayPlan = weeklyPlan.find((d) => d.dayOfWeek === todayDow);
  const unreadInsights = insights.filter((i) => !i.read).slice(0, 2);

  const handleStartWorkout = async () => {
    if (!todayPlan?.workout) return;
    setActivePlan(todayPlan.workout);
    navigation.navigate('WorkoutSession', {});
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.name?.split(' ')[0] ?? 'Atleta'} 👋
            </Text>
            <Text style={styles.date}>
              {format(today, "EEEE d MMMM", { locale: it })}
            </Text>
          </View>
        </View>

        {/* Today's Workout Card */}
        <GritCard style={styles.todayCard} elevated>
          {todayPlan?.isRestDay ? (
            <View style={styles.restDay}>
              <Text style={styles.restIcon}>😴</Text>
              <Text style={styles.restTitle}>Giorno di riposo</Text>
              <Text style={styles.restSubtitle}>Recupera, stira, idratati.</Text>
            </View>
          ) : todayPlan?.workout ? (
            <>
              <View style={styles.todayHeader}>
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>OGGI</Text>
                </View>
                <View style={styles.todayMeta}>
                  <Text style={styles.todayDuration}>
                    <Ionicons name="time-outline" size={12} color={colors.textMuted} /> {todayPlan.workout.durationMinutes} min
                  </Text>
                </View>
              </View>
              <Text style={styles.workoutName}>{todayPlan.workout.name}</Text>
              <Text style={styles.workoutType}>{todayPlan.workout.type.toUpperCase()}</Text>
              <Text style={styles.exerciseCount}>
                {todayPlan.workout.exercises.length} esercizi
              </Text>
              <GritButton label="Inizia allenamento" onPress={handleStartWorkout} size="lg" style={styles.startBtn} />
            </>
          ) : (
            <View style={styles.noWorkout}>
              <Text style={styles.noWorkoutText}>Nessun allenamento per oggi.</Text>
              <GritButton label="Crea workout" onPress={handleStartWorkout} variant="secondary" size="sm" />
            </View>
          )}
        </GritCard>

        {/* Weekly Plan */}
        <Text style={styles.sectionTitle}>Piano settimanale</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll} contentContainerStyle={styles.weekContent}>
          {weeklyPlan.map((day) => (
            <WeekDayCard key={day.dayOfWeek} day={day} isToday={day.dayOfWeek === todayDow} />
          ))}
        </ScrollView>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="flame" label="Bruciate" value={`${hkCalories}`} unit="kcal" color={colors.primary} />
          <StatCard icon="restaurant" label="Mangiate" value={`${summary?.totalCalories ?? 0}`} unit="kcal" color={colors.accent} />
        </View>

        {/* Insights */}
        {unreadInsights.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Insights nutrizionali</Text>
            {unreadInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function WeekDayCard({ day, isToday }: { day: WorkoutDay; isToday: boolean }) {
  return (
    <View style={[wdStyles.card, isToday && wdStyles.cardToday]}>
      <Text style={[wdStyles.dayName, isToday && wdStyles.dayNameToday]}>
        {DAY_NAMES[day.dayOfWeek]}
      </Text>
      {day.isRestDay ? (
        <Text style={wdStyles.restEmoji}>😴</Text>
      ) : (
        <View style={[wdStyles.dot, isToday && wdStyles.dotToday]} />
      )}
      <Text style={[wdStyles.workoutLabel, isToday && wdStyles.workoutLabelToday]} numberOfLines={2}>
        {day.isRestDay ? 'Riposo' : (day.workout?.name ?? '—')}
      </Text>
    </View>
  );
}

const wdStyles = StyleSheet.create({
  card: {
    width: 80,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardToday: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  dayName: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  dayNameToday: { color: colors.primary },
  restEmoji: { fontSize: 18 },
  dot: { width: 8, height: 8, borderRadius: radii.full, backgroundColor: colors.textMuted },
  dotToday: { backgroundColor: colors.primary },
  workoutLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  workoutLabelToday: { color: colors.text },
});

function StatCard({ icon, label, value, unit, color }: { icon: string; label: string; value: string; unit: string; color: string }) {
  return (
    <GritCard style={stStyles.card}>
      <Ionicons name={icon as React.ComponentProps<typeof Ionicons>['name']} size={20} color={color} />
      <Text style={stStyles.value}>{value}</Text>
      <Text style={stStyles.unit}>{unit}</Text>
      <Text style={stStyles.label}>{label}</Text>
    </GritCard>
  );
}

const stStyles = StyleSheet.create({
  card: { flex: 1, alignItems: 'center', gap: spacing.xs },
  value: { fontSize: 24, fontWeight: '700', color: colors.text, fontFamily: 'Courier' },
  unit: { ...typography.caption, color: colors.textMuted },
  label: { ...typography.caption, color: colors.textSecondary },
});

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  container: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text },
  date: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  todayCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  todayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  todayBadge: { backgroundColor: colors.primary, borderRadius: radii.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  todayBadgeText: { ...typography.caption, color: colors.white, fontWeight: '700' },
  todayMeta: { flexDirection: 'row', gap: spacing.sm },
  todayDuration: { ...typography.caption, color: colors.textMuted },
  workoutName: { ...typography.heading3, color: colors.text, marginBottom: spacing.xs },
  workoutType: { ...typography.caption, color: colors.primary, fontWeight: '600', marginBottom: spacing.xs },
  exerciseCount: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md },
  startBtn: {},
  restDay: { alignItems: 'center', paddingVertical: spacing.md },
  restIcon: { fontSize: 40, marginBottom: spacing.sm },
  restTitle: { ...typography.heading3, color: colors.text },
  restSubtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  noWorkout: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  noWorkoutText: { ...typography.body, color: colors.textSecondary },
  sectionTitle: { ...typography.heading3, color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  weekScroll: { marginBottom: spacing.lg },
  weekContent: { paddingHorizontal: spacing.lg },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
});
