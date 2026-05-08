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
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { RootStackParamList, WorkoutDay } from '../../types';
import { colors, spacing, typography, radii, shadows } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useHealthKit } from '../../hooks/useHealthKit';
import GritButton from '../../components/ui/GritButton';
import InsightCard from '../../components/nutrition/InsightCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const RING_R = 58;
const RING_SIZE = 140;
const RING_STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;
const STEPS_GOAL = 10000;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const { weeklyPlan, fetchWeeklyPlan, setActivePlan, isLoading } = useWorkoutStore();
  const { summary, insights, fetchSummary, fetchInsights } = useNutritionStore();
  const {
    heartRate, restingHeartRate, hrv,
    calories, steps, distanceKm,
    vo2Max, weightKg, bodyFatPct,
    refresh: refreshHealth,
  } = useHealthKit();

  const today = new Date();
  const todayDow = today.getDay();

  useEffect(() => {
    fetchWeeklyPlan();
    fetchSummary(format(today, 'yyyy-MM-dd'), calories);
    fetchInsights();
  }, []);

  const onRefresh = useCallback(async () => {
    refreshHealth();
    await Promise.all([
      fetchWeeklyPlan(),
      fetchSummary(format(today, 'yyyy-MM-dd'), calories),
      fetchInsights(),
    ]);
  }, [calories, refreshHealth]);

  const todayPlan = weeklyPlan.find((d) => d.dayOfWeek === todayDow);
  const unreadInsights = insights.filter((i) => !i.read).slice(0, 2);

  const handleStartWorkout = async () => {
    if (!todayPlan?.workout) return;
    setActivePlan(todayPlan.workout);
    navigation.navigate('WorkoutSession', {});
  };

  const stepsProgress = Math.min(steps / STEPS_GOAL, 1);
  const stepsDash = CIRCUMFERENCE * stepsProgress;
  const stepsGap = CIRCUMFERENCE - stepsDash;
  const hasBodyMetrics = weightKg > 0 || bodyFatPct > 0 || vo2Max > 0;

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
              {getGreeting()}, {user?.name?.split(' ')[0] ?? 'Atleta'}
            </Text>
            <Text style={styles.date}>
              {format(today, 'EEEE d MMMM', { locale: it })}
            </Text>
          </View>
          <TouchableOpacity style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{(user?.name?.[0] ?? 'A').toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>ATTIVITÀ DI OGGI</Text>
          <View style={styles.heroContent}>
            <View style={styles.ringContainer}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Defs>
                  <LinearGradient id="stepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={colors.primary} />
                    <Stop offset="100%" stopColor={colors.accent} />
                  </LinearGradient>
                </Defs>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_R}
                  stroke={colors.border}
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                {steps > 0 && (
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_R}
                    stroke="url(#stepGrad)"
                    strokeWidth={RING_STROKE}
                    fill="none"
                    strokeDasharray={`${stepsDash} ${stepsGap}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  />
                )}
              </Svg>
              <View style={styles.ringInner}>
                <Text style={styles.stepsValue}>
                  {steps > 0 ? steps.toLocaleString('it-IT') : '—'}
                </Text>
                <Text style={styles.stepsLabel}>passi</Text>
              </View>
            </View>

            <View style={styles.heroMetrics}>
              <HeroMetric
                icon="flame"
                value={calories > 0 ? `${calories}` : '—'}
                unit="kcal"
                label="Attive"
                color={colors.calories}
              />
              <View style={styles.heroDivider} />
              <HeroMetric
                icon="walk"
                value={distanceKm > 0 ? `${distanceKm}` : '—'}
                unit="km"
                label="Distanza"
                color={colors.steps}
              />
              <View style={styles.heroDivider} />
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Obiettivo</Text>
                <Text style={styles.goalValue}>{Math.round(stepsProgress * 100)}%</Text>
              </View>
              <View style={styles.goalBar}>
                <View style={[styles.goalFill, { width: `${Math.round(stepsProgress * 100)}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Vitals Strip */}
        <View style={styles.vitalsRow}>
          <VitalCard
            label="FC Live"
            value={heartRate > 0 ? `${heartRate}` : '—'}
            unit="bpm"
            color={colors.heartRate}
            icon="heart"
          />
          <VitalCard
            label="FC Riposo"
            value={restingHeartRate > 0 ? `${restingHeartRate}` : '—'}
            unit="bpm"
            color={colors.info}
            icon="heart-circle-outline"
          />
          <VitalCard
            label="HRV"
            value={hrv > 0 ? `${hrv}` : '—'}
            unit="ms"
            color={colors.hrv}
            icon="pulse"
          />
        </View>

        {/* Today's Workout */}
        <View style={styles.workoutCard}>
          <View style={styles.workoutCardHeader}>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>OGGI</Text>
            </View>
            {todayPlan?.workout && (
              <Text style={styles.workoutDuration}>
                <Ionicons name="time-outline" size={12} color={colors.textMuted} />{' '}
                {todayPlan.workout.durationMinutes} min
              </Text>
            )}
          </View>

          {todayPlan?.isRestDay ? (
            <View style={styles.restDay}>
              <Ionicons name="moon" size={28} color={colors.hrv} />
              <Text style={styles.restTitle}>Giorno di riposo</Text>
              <Text style={styles.restSubtitle}>Recupera, stira, idratati.</Text>
            </View>
          ) : todayPlan?.workout ? (
            <>
              <Text style={styles.workoutName}>{todayPlan.workout.name}</Text>
              <Text style={styles.workoutType}>{todayPlan.workout.type.toUpperCase()}</Text>
              <Text style={styles.exerciseCount}>{todayPlan.workout.exercises.length} esercizi</Text>
              <GritButton label="Inizia allenamento" onPress={handleStartWorkout} size="lg" style={styles.startBtn} />
            </>
          ) : (
            <View style={styles.noWorkout}>
              <Text style={styles.noWorkoutText}>Nessun allenamento per oggi.</Text>
              <GritButton label="Crea workout" onPress={() => {}} variant="secondary" size="sm" />
            </View>
          )}
        </View>

        {/* Weekly Pills */}
        <Text style={styles.sectionTitle}>Settimana</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.weekScroll}
          contentContainerStyle={styles.weekContent}
        >
          {weeklyPlan.map((day) => (
            <WeekPill key={day.dayOfWeek} day={day} isToday={day.dayOfWeek === todayDow} />
          ))}
        </ScrollView>

        {/* Body Metrics */}
        {hasBodyMetrics && (
          <>
            <Text style={styles.sectionTitle}>Composizione corporea</Text>
            <View style={styles.bodyMetricsRow}>
              {weightKg > 0 && (
                <BodyMetricCard label="Peso" value={`${weightKg}`} unit="kg" color={colors.accent} />
              )}
              {bodyFatPct > 0 && (
                <BodyMetricCard label="Massa grassa" value={`${bodyFatPct}`} unit="%" color={colors.warning} />
              )}
              {vo2Max > 0 && (
                <BodyMetricCard label="VO₂ max" value={`${vo2Max}`} unit="ml/kg" color={colors.vo2} />
              )}
            </View>
          </>
        )}

        {/* Nutrition */}
        <Text style={styles.sectionTitle}>Nutrizione</Text>
        <View style={styles.nutritionRow}>
          <NutritionMetric label="Calorie" value={`${summary?.totalCalories ?? 0}`} unit="kcal" color={colors.calories} />
          <NutritionMetric label="Proteine" value={`${Math.round((summary as any)?.totalProtein ?? 0)}`} unit="g" color={colors.protein} />
          <NutritionMetric label="Carbo" value={`${Math.round((summary as any)?.totalCarbs ?? 0)}`} unit="g" color={colors.carbs} />
          <NutritionMetric label="Grassi" value={`${Math.round((summary as any)?.totalFat ?? 0)}`} unit="g" color={colors.fat} />
        </View>

        {/* Insights */}
        {unreadInsights.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Insights</Text>
            {unreadInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroMetric({
  icon, value, unit, label, color,
}: { icon: string; value: string; unit: string; label: string; color: string }) {
  return (
    <View style={heroMetStyles.row}>
      <Ionicons name={icon as React.ComponentProps<typeof Ionicons>['name']} size={14} color={color} />
      <View>
        <Text style={heroMetStyles.value}>
          {value} <Text style={heroMetStyles.unit}>{unit}</Text>
        </Text>
        <Text style={heroMetStyles.label}>{label}</Text>
      </View>
    </View>
  );
}

const heroMetStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  value: { fontSize: 18, fontWeight: '700', color: colors.text },
  unit: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
  label: { fontSize: 11, color: colors.textSecondary },
});

function VitalCard({
  label, value, unit, color, icon,
}: { label: string; value: string; unit: string; color: string; icon: string }) {
  return (
    <View style={[vitalStyles.card, { borderTopColor: color }]}>
      <Ionicons name={icon as React.ComponentProps<typeof Ionicons>['name']} size={16} color={color} />
      <Text style={vitalStyles.value}>{value}</Text>
      <Text style={vitalStyles.unit}>{unit}</Text>
      <Text style={vitalStyles.label}>{label}</Text>
    </View>
  );
}

const vitalStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 3,
    gap: spacing.xs,
    ...shadows.card,
  },
  value: { fontSize: 22, fontWeight: '700', color: colors.text },
  unit: { fontSize: 11, color: colors.textMuted },
  label: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
});

function WeekPill({ day, isToday }: { day: WorkoutDay; isToday: boolean }) {
  return (
    <View style={[pillStyles.pill, isToday && pillStyles.pillToday]}>
      <Text style={[pillStyles.dayName, isToday && pillStyles.dayNameToday]}>
        {DAY_NAMES[day.dayOfWeek]}
      </Text>
      {day.isRestDay ? (
        <Ionicons name="moon-outline" size={14} color={isToday ? colors.primary : colors.textMuted} />
      ) : (
        <View style={[pillStyles.dot, isToday && pillStyles.dotToday]} />
      )}
      <Text style={[pillStyles.workoutLabel, isToday && pillStyles.workoutLabelToday]} numberOfLines={1}>
        {day.isRestDay ? 'Riposo' : (day.workout?.type?.toUpperCase() ?? '—')}
      </Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    width: 72,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  pillToday: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  dayName: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 },
  dayNameToday: { color: colors.primary },
  dot: { width: 6, height: 6, borderRadius: radii.full, backgroundColor: colors.textMuted },
  dotToday: { backgroundColor: colors.primary },
  workoutLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center', letterSpacing: 0.3 },
  workoutLabelToday: { color: colors.text },
});

function BodyMetricCard({
  label, value, unit, color,
}: { label: string; value: string; unit: string; color: string }) {
  return (
    <View style={[bodyStyles.card, { borderBottomColor: color }]}>
      <Text style={bodyStyles.value}>{value}</Text>
      <Text style={bodyStyles.unit}>{unit}</Text>
      <Text style={bodyStyles.label}>{label}</Text>
    </View>
  );
}

const bodyStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    gap: 2,
    ...shadows.card,
  },
  value: { fontSize: 22, fontWeight: '700', color: colors.text },
  unit: { fontSize: 11, color: colors.textMuted },
  label: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
});

function NutritionMetric({
  label, value, unit, color,
}: { label: string; value: string; unit: string; color: string }) {
  return (
    <View style={nutrStyles.card}>
      <View style={[nutrStyles.dot, { backgroundColor: color }]} />
      <Text style={nutrStyles.value}>{value}</Text>
      <Text style={nutrStyles.unit}>{unit}</Text>
      <Text style={nutrStyles.label}>{label}</Text>
    </View>
  );
}

const nutrStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  dot: { width: 8, height: 8, borderRadius: radii.full },
  value: { fontSize: 16, fontWeight: '700', color: colors.text },
  unit: { fontSize: 10, color: colors.textMuted },
  label: { fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  date: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.primary },

  heroCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,77,0,0.25)',
    ...shadows.elevated,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  ringContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ringInner: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  stepsValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  stepsLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.5 },
  heroMetrics: { flex: 1, gap: spacing.sm },
  heroDivider: { height: 1, backgroundColor: colors.border },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalLabel: { fontSize: 11, color: colors.textMuted },
  goalValue: { fontSize: 11, fontWeight: '700', color: colors.primary },
  goalBar: { height: 4, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden' },
  goalFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radii.full },

  vitalsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  workoutCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  todayBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  todayBadgeText: { fontSize: 10, fontWeight: '800', color: colors.white, letterSpacing: 1.5 },
  workoutDuration: { ...typography.caption, color: colors.textMuted },
  workoutName: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  workoutType: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 1, marginBottom: spacing.xs },
  exerciseCount: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md },
  startBtn: {},
  restDay: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  restTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  restSubtitle: { ...typography.body, color: colors.textSecondary },
  noWorkout: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  noWorkoutText: { ...typography.body, color: colors.textSecondary },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  weekScroll: { marginBottom: spacing.lg },
  weekContent: { paddingHorizontal: spacing.lg },

  bodyMetricsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  nutritionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
