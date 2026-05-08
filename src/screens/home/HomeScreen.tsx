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
import Svg, { Circle, Defs, LinearGradient, Stop, RadialGradient, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedProps,
} from 'react-native-reanimated';

import { RootStackParamList, WorkoutDay } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useHealthKit } from '../../hooks/useHealthKit';
import GritButton from '../../components/ui/GritButton';
import InsightCard from '../../components/nutrition/InsightCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const RING_R = 68;
const RING_SIZE = 160;
const RING_STROKE = 11;
const RING_CX = RING_SIZE / 2;
const RING_CY = RING_SIZE / 2;
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
  const hasBodyMetrics = weightKg > 0 || bodyFatPct > 0 || vo2Max > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()},
            </Text>
            <Text style={styles.greetingName}>
              {user?.name?.split(' ')[0] ?? 'Atleta'}
            </Text>
            <Text style={styles.date}>
              {format(today, 'EEEE d MMMM', { locale: it })}
            </Text>
          </View>
          <TouchableOpacity style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(user?.name?.[0] ?? 'A').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activity Hero */}
        <View style={styles.heroCard}>
          <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%">
            <Defs>
              <RadialGradient id="bgGlow" cx="35%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(255,77,0,0.18)" />
                <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGlow)" />
          </Svg>

          <Text style={styles.heroLabel}>ATTIVITÀ</Text>

          <View style={styles.heroContent}>
            {/* Animated Ring */}
            <View style={styles.ringWrapper}>
              <StepsRing progress={stepsProgress} />
              <View style={styles.ringInner} pointerEvents="none">
                <Text style={styles.stepsValue}>
                  {steps > 0 ? steps.toLocaleString('it-IT') : '—'}
                </Text>
                <Text style={styles.stepsUnit}>passi</Text>
                <Text style={styles.stepsGoal}>
                  / {STEPS_GOAL.toLocaleString('it-IT')}
                </Text>
              </View>
            </View>

            {/* Side stats */}
            <View style={styles.heroStats}>
              <HeroStat
                label="CALORIE"
                value={calories > 0 ? `${calories}` : '—'}
                unit="kcal"
                color={colors.calories}
                icon="flame"
              />
              <View style={styles.statSep} />
              <HeroStat
                label="DISTANZA"
                value={distanceKm > 0 ? `${distanceKm}` : '—'}
                unit="km"
                color={colors.steps}
                icon="walk"
              />
              <View style={styles.statSep} />
              <View>
                <Text style={styles.goalPct}>
                  {Math.round(stepsProgress * 100)}
                  <Text style={styles.goalPctSign}>%</Text>
                </Text>
                <Text style={styles.goalLabel}>obiettivo</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vitals */}
        <SectionLabel text="PARAMETRI VITALI" color={colors.heartRate} />
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

        {/* Workout */}
        <SectionLabel text="ALLENAMENTO" color={colors.primary} />
        <View style={styles.workoutCard}>
          <View style={styles.workoutCardTop}>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>OGGI</Text>
            </View>
            {todayPlan?.workout && (
              <Text style={styles.workoutDuration}>
                {todayPlan.workout.durationMinutes} min
              </Text>
            )}
          </View>

          {todayPlan?.isRestDay ? (
            <View style={styles.restDay}>
              <Ionicons name="moon" size={32} color={colors.hrv} />
              <Text style={styles.restTitle}>Giorno di riposo</Text>
              <Text style={styles.restSub}>Recupera, stira, idratati.</Text>
            </View>
          ) : todayPlan?.workout ? (
            <>
              <Text style={styles.workoutName}>{todayPlan.workout.name}</Text>
              <Text style={styles.workoutType}>
                {todayPlan.workout.type.toUpperCase()}
              </Text>
              <Text style={styles.exerciseCount}>
                {todayPlan.workout.exercises.length} esercizi
              </Text>
              <GritButton
                label="Inizia allenamento"
                onPress={handleStartWorkout}
                size="lg"
                style={styles.startBtn}
              />
            </>
          ) : (
            <View style={styles.noWorkout}>
              <Text style={styles.noWorkoutText}>
                Nessun allenamento per oggi.
              </Text>
              <GritButton
                label="Crea workout"
                onPress={() => {}}
                variant="secondary"
                size="sm"
              />
            </View>
          )}
        </View>

        {/* Weekly pills */}
        <SectionLabel text="SETTIMANA" color={colors.accent} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.weekScroll}
          contentContainerStyle={styles.weekContent}
        >
          {weeklyPlan.map((day) => (
            <WeekPill
              key={day.dayOfWeek}
              day={day}
              isToday={day.dayOfWeek === todayDow}
            />
          ))}
        </ScrollView>

        {/* Body metrics */}
        {hasBodyMetrics && (
          <>
            <SectionLabel text="COMPOSIZIONE" color={colors.vo2} />
            <View style={styles.bodyRow}>
              {weightKg > 0 && (
                <BodyCard label="Peso" value={`${weightKg}`} unit="kg" color={colors.accent} />
              )}
              {bodyFatPct > 0 && (
                <BodyCard label="Grasso" value={`${bodyFatPct}`} unit="%" color={colors.warning} />
              )}
              {vo2Max > 0 && (
                <BodyCard label="VO₂max" value={`${vo2Max}`} unit="ml/kg" color={colors.vo2} />
              )}
            </View>
          </>
        )}

        {/* Nutrition */}
        <SectionLabel text="NUTRIZIONE" color={colors.protein} />
        <View style={styles.nutrRow}>
          <NutrCard label="kcal" value={`${summary?.totalCalories ?? 0}`} color={colors.calories} />
          <NutrCard label="prot" value={`${Math.round((summary as any)?.totalProtein ?? 0)}g`} color={colors.protein} />
          <NutrCard label="carbo" value={`${Math.round((summary as any)?.totalCarbs ?? 0)}g`} color={colors.carbs} />
          <NutrCard label="grassi" value={`${Math.round((summary as any)?.totalFat ?? 0)}g`} color={colors.fat} />
        </View>

        {/* Insights */}
        {unreadInsights.length > 0 && (
          <>
            <SectionLabel text="INSIGHTS" color={colors.info} />
            {unreadInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepsRing({ progress }: { progress: number }) {
  const offset = useSharedValue(CIRCUMFERENCE);

  useEffect(() => {
    offset.value = withTiming(CIRCUMFERENCE * (1 - progress), {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      <Defs>
        <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FF4D00" />
          <Stop offset="60%" stopColor="#FF8C00" />
          <Stop offset="100%" stopColor="#FFD700" />
        </LinearGradient>
      </Defs>
      {/* Track */}
      <Circle
        cx={RING_CX}
        cy={RING_CY}
        r={RING_R}
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={RING_STROKE}
        fill="none"
      />
      {/* Glow ring (blurred duplicate) */}
      <Circle
        cx={RING_CX}
        cy={RING_CY}
        r={RING_R}
        stroke="rgba(255,77,0,0.2)"
        strokeWidth={RING_STROKE + 8}
        fill="none"
        strokeDasharray={CIRCUMFERENCE}
        strokeLinecap="round"
        transform={`rotate(-90 ${RING_CX} ${RING_CY})`}
      />
      {/* Progress arc */}
      <AnimatedCircle
        cx={RING_CX}
        cy={RING_CY}
        r={RING_R}
        stroke="url(#ringGrad)"
        strokeWidth={RING_STROKE}
        fill="none"
        strokeDasharray={CIRCUMFERENCE}
        strokeLinecap="round"
        transform={`rotate(-90 ${RING_CX} ${RING_CY})`}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}

function SectionLabel({ text, color }: { text: string; color: string }) {
  return (
    <View style={sectionStyles.row}>
      <View style={[sectionStyles.bar, { backgroundColor: color }]} />
      <Text style={sectionStyles.label}>{text}</Text>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md, marginTop: spacing.sm },
  bar: { width: 3, height: 14, borderRadius: 2, marginRight: spacing.sm },
  label: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.8 },
});

function HeroStat({
  label, value, unit, color, icon,
}: { label: string; value: string; unit: string; color: string; icon: string }) {
  return (
    <View style={heroStatStyles.wrap}>
      <Text style={heroStatStyles.label}>{label}</Text>
      <View style={heroStatStyles.row}>
        <Ionicons name={icon as any} size={13} color={color} style={{ marginRight: 3 }} />
        <Text style={[heroStatStyles.value, { color }]}>{value}</Text>
        <Text style={heroStatStyles.unit}> {unit}</Text>
      </View>
    </View>
  );
}

const heroStatStyles = StyleSheet.create({
  wrap: { gap: 2 },
  label: { fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5 },
  row: { flexDirection: 'row', alignItems: 'baseline' },
  value: { fontSize: 20, fontWeight: '800' },
  unit: { fontSize: 11, color: colors.textMuted },
});

function VitalCard({
  label, value, unit, color, icon,
}: { label: string; value: string; unit: string; color: string; icon: string }) {
  return (
    <View style={[vitalStyles.card, { borderTopColor: color, shadowColor: color }]}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={vitalStyles.value}>{value}</Text>
      <Text style={vitalStyles.unit}>{unit}</Text>
      <Text style={vitalStyles.label}>{label}</Text>
    </View>
  );
}

const vitalStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 2,
    gap: spacing.xs,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 6,
  },
  value: { fontSize: 26, fontWeight: '800', color: colors.text },
  unit: { fontSize: 10, color: colors.textMuted },
  label: { fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
});

function WeekPill({ day, isToday }: { day: WorkoutDay; isToday: boolean }) {
  return (
    <View style={[pillStyles.pill, isToday && pillStyles.pillToday]}>
      <Text style={[pillStyles.day, isToday && pillStyles.dayToday]}>
        {DAY_NAMES[day.dayOfWeek]}
      </Text>
      {day.isRestDay ? (
        <Ionicons name="moon-outline" size={13} color={isToday ? colors.primary : colors.textMuted} />
      ) : (
        <View style={[pillStyles.dot, isToday && pillStyles.dotToday]} />
      )}
      <Text style={[pillStyles.type, isToday && pillStyles.typeToday]} numberOfLines={1}>
        {day.isRestDay ? 'Riposo' : (day.workout?.type?.toUpperCase() ?? '—')}
      </Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    width: 70,
    backgroundColor: '#111',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#222',
    gap: spacing.xs,
  },
  pillToday: { borderColor: colors.primary, backgroundColor: 'rgba(255,77,0,0.12)' },
  day: { fontSize: 10, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.8 },
  dayToday: { color: colors.primary },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#444' },
  dotToday: { backgroundColor: colors.primary },
  type: { fontSize: 9, color: colors.textMuted, textAlign: 'center', letterSpacing: 0.5 },
  typeToday: { color: colors.text },
});

function BodyCard({
  label, value, unit, color,
}: { label: string; value: string; unit: string; color: string }) {
  return (
    <View style={[bodyStyles.card, { borderBottomColor: color, shadowColor: color }]}>
      <Text style={[bodyStyles.value, { color }]}>{value}</Text>
      <Text style={bodyStyles.unit}>{unit}</Text>
      <Text style={bodyStyles.label}>{label}</Text>
    </View>
  );
}

const bodyStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    gap: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  value: { fontSize: 24, fontWeight: '800' },
  unit: { fontSize: 10, color: colors.textMuted },
  label: { fontSize: 10, color: colors.textSecondary },
});

function NutrCard({
  label, value, color,
}: { label: string; value: string; color: string }) {
  return (
    <View style={nutrStyles.card}>
      <View style={[nutrStyles.dot, { backgroundColor: color }]} />
      <Text style={[nutrStyles.value, { color }]}>{value}</Text>
      <Text style={nutrStyles.label}>{label}</Text>
    </View>
  );
}

const nutrStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 3,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  value: { fontSize: 17, fontWeight: '800' },
  label: { fontSize: 9, color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
});

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060606' },
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
  greeting: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  greetingName: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,77,0,0.12)',
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  avatarText: { fontSize: 17, fontWeight: '800', color: colors.primary },

  heroCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: '#0E0E0E',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,77,0,0.3)',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsValue: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1.5,
  },
  stepsUnit: { fontSize: 11, color: colors.textMuted, letterSpacing: 1 },
  stepsGoal: { fontSize: 9, color: colors.textMuted },
  heroStats: { flex: 1, gap: spacing.md },
  statSep: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  goalPct: { fontSize: 32, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  goalPctSign: { fontSize: 16, fontWeight: '700' },
  goalLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },

  vitalsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  workoutCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: '#0E0E0E',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#222',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  workoutCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  todayBadge: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  todayBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  workoutDuration: { fontSize: 12, color: colors.textMuted },
  workoutName: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: spacing.xs },
  workoutType: { fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 1.5, marginBottom: spacing.xs },
  exerciseCount: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
  startBtn: {},
  restDay: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  restTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  restSub: { fontSize: 14, color: colors.textSecondary },
  noWorkout: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  noWorkoutText: { fontSize: 14, color: colors.textSecondary },

  weekScroll: { marginBottom: spacing.lg },
  weekContent: { paddingHorizontal: spacing.lg },

  bodyRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  nutrRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
