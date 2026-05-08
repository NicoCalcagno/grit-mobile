import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedProps,
} from 'react-native-reanimated';

import { RootStackParamList, WorkoutDay } from '../../types';
import { colors, spacing, radii } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useHealthKit } from '../../hooks/useHealthKit';
import InsightCard from '../../components/nutrition/InsightCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width: SCREEN_W } = Dimensions.get('window');

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const RING_R = 74;
const RING_SIZE = 172;
const RING_STROKE = 12;
const CX = RING_SIZE / 2;
const CY = RING_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;
const STEPS_GOAL = 10000;

// Palette
const C = {
  bg: '#000000',
  card: '#0C0C0C',
  border: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  sub: '#888888',
  muted: '#444444',
  orange: '#FF5722',
  gold: '#FFB300',
  cyan: '#00BCD4',
  purple: '#9C27B0',
  purpleLight: '#CE93D8',
  blue: '#1E88E5',
  blueLight: '#90CAF9',
  teal: '#00897B',
  tealLight: '#80CBC4',
  green: '#43A047',
  amber: '#FFB300',
  red: '#EF5350',
};

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
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={C.orange} />
          }
        >
          {/* ── Header ── */}
          <LinearGradient
            colors={['#130800', '#080400', '#000000']}
            style={s.header}
          >
            <View>
              <Text style={s.hi}>{getGreeting()},</Text>
              <Text style={s.name}>{user?.name?.split(' ')[0] ?? 'Atleta'}</Text>
              <Text style={s.date}>
                {format(today, 'EEEE d MMMM', { locale: it })}
              </Text>
            </View>
            <LinearGradient
              colors={[C.orange, C.gold]}
              style={s.avatarGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={s.avatarInner}>
                <Text style={s.avatarTxt}>
                  {(user?.name?.[0] ?? 'A').toUpperCase()}
                </Text>
              </View>
            </LinearGradient>
          </LinearGradient>

          {/* ── Activity Hero ── */}
          <LinearGradient
            colors={[C.orange, C.gold, 'rgba(255,87,34,0.4)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.heroBorder}
          >
            <LinearGradient
              colors={['#1A0800', '#110500', '#0A0A0A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.heroCard}
            >
              <Text style={s.cardLabel}>ATTIVITÀ DI OGGI</Text>
              <View style={s.heroRow}>
                {/* Animated Ring */}
                <View style={s.ringWrap}>
                  <StepsRing progress={stepsProgress} />
                  <View style={s.ringInner}>
                    <Text style={s.stepsNum}>
                      {steps > 0 ? steps.toLocaleString('it-IT') : '—'}
                    </Text>
                    <Text style={s.stepsLbl}>passi</Text>
                    <Text style={s.stepsGoal}>/ {STEPS_GOAL.toLocaleString('it-IT')}</Text>
                  </View>
                </View>

                {/* Side stats */}
                <View style={s.heroSide}>
                  <HeroStat
                    icon="flame"
                    value={calories > 0 ? `${calories}` : '—'}
                    unit="kcal"
                    label="CALORIE"
                    color={C.gold}
                  />
                  <View style={s.sep} />
                  <HeroStat
                    icon="footsteps"
                    value={distanceKm > 0 ? `${distanceKm}` : '—'}
                    unit="km"
                    label="DISTANZA"
                    color={C.cyan}
                  />
                  <View style={s.sep} />
                  <View>
                    <Text style={s.goalPct}>
                      {Math.round(stepsProgress * 100)}
                      <Text style={s.goalPctSub}>%</Text>
                    </Text>
                    <Text style={[s.cardLabel, { marginBottom: 6 }]}>OBIETTIVO</Text>
                    <View style={s.goalTrack}>
                      <LinearGradient
                        colors={[C.orange, C.gold]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[s.goalFill, { width: `${Math.round(stepsProgress * 100)}%` as any }]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </LinearGradient>

          {/* ── Vitals ── */}
          <Text style={s.section}>PARAMETRI VITALI</Text>
          <View style={s.vitalsRow}>
            <GradCard
              grad={['rgba(255,87,34,0.22)', 'rgba(255,87,34,0.05)', '#0C0C0C']}
              borderColor={C.orange}
            >
              <Ionicons name="heart" size={20} color={C.orange} />
              <Text style={[s.vitalVal, { color: C.orange }]}>
                {heartRate > 0 ? heartRate : '—'}
              </Text>
              <Text style={s.vitalUnit}>bpm</Text>
              <Text style={s.vitalLbl}>FC Live</Text>
            </GradCard>

            <GradCard
              grad={['rgba(30,136,229,0.22)', 'rgba(30,136,229,0.05)', '#0C0C0C']}
              borderColor={C.blue}
            >
              <Ionicons name="heart-circle-outline" size={20} color={C.blueLight} />
              <Text style={[s.vitalVal, { color: C.blueLight }]}>
                {restingHeartRate > 0 ? restingHeartRate : '—'}
              </Text>
              <Text style={s.vitalUnit}>bpm</Text>
              <Text style={s.vitalLbl}>FC Riposo</Text>
            </GradCard>

            <GradCard
              grad={['rgba(156,39,176,0.22)', 'rgba(156,39,176,0.05)', '#0C0C0C']}
              borderColor={C.purple}
            >
              <Ionicons name="pulse" size={20} color={C.purpleLight} />
              <Text style={[s.vitalVal, { color: C.purpleLight }]}>
                {hrv > 0 ? hrv : '—'}
              </Text>
              <Text style={s.vitalUnit}>ms</Text>
              <Text style={s.vitalLbl}>HRV</Text>
            </GradCard>
          </View>

          {/* ── Workout ── */}
          <Text style={s.section}>ALLENAMENTO</Text>
          <LinearGradient
            colors={['#001F1A', '#002920', '#0A0A0A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.workoutCard}
          >
            <View style={s.workoutTop}>
              <LinearGradient
                colors={[C.orange, C.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.badge}
              >
                <Text style={s.badgeTxt}>OGGI</Text>
              </LinearGradient>
              {todayPlan?.workout && (
                <Text style={s.dur}>{todayPlan.workout.durationMinutes} min</Text>
              )}
            </View>

            {todayPlan?.isRestDay ? (
              <View style={s.rest}>
                <Ionicons name="moon" size={36} color={C.purpleLight} />
                <Text style={s.restTitle}>Giorno di riposo</Text>
                <Text style={s.restSub}>Recupera, stira, idratati.</Text>
              </View>
            ) : todayPlan?.workout ? (
              <>
                <Text style={s.wName}>{todayPlan.workout.name}</Text>
                <Text style={s.wType}>{todayPlan.workout.type.toUpperCase()}</Text>
                <Text style={s.wEx}>{todayPlan.workout.exercises.length} esercizi</Text>
                <GradientButton label="Inizia allenamento" onPress={handleStartWorkout} />
              </>
            ) : (
              <View style={s.noW}>
                <Text style={s.noWTxt}>Nessun allenamento per oggi.</Text>
                <GradientButton label="Crea workout" onPress={() => {}} small />
              </View>
            )}
          </LinearGradient>

          {/* ── Week ── */}
          <Text style={s.section}>SETTIMANA</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.weekWrap}
          >
            {weeklyPlan.map((day) => (
              <WeekPill key={day.dayOfWeek} day={day} isToday={day.dayOfWeek === todayDow} />
            ))}
          </ScrollView>

          {/* ── Body Metrics ── */}
          {hasBodyMetrics && (
            <>
              <Text style={s.section}>COMPOSIZIONE CORPOREA</Text>
              <View style={s.bodyRow}>
                {weightKg > 0 && (
                  <BodyCard label="Peso" value={`${weightKg}`} unit="kg" color={C.gold} grad={['rgba(255,179,0,0.18)', '#0C0C0C']} />
                )}
                {bodyFatPct > 0 && (
                  <BodyCard label="Grasso" value={`${bodyFatPct}`} unit="%" color={C.amber} grad={['rgba(255,152,0,0.18)', '#0C0C0C']} />
                )}
                {vo2Max > 0 && (
                  <BodyCard label="VO₂max" value={`${vo2Max}`} unit="ml/kg" color={C.tealLight} grad={['rgba(0,137,123,0.18)', '#0C0C0C']} />
                )}
              </View>
            </>
          )}

          {/* ── Nutrition ── */}
          <Text style={s.section}>NUTRIZIONE</Text>
          <View style={s.nutrRow}>
            <NutrCard label="kcal" value={`${summary?.totalCalories ?? 0}`} color={C.gold} />
            <NutrCard label="prot" value={`${Math.round((summary as any)?.totalProtein ?? 0)}g`} color={C.green} />
            <NutrCard label="carbo" value={`${Math.round((summary as any)?.totalCarbs ?? 0)}g`} color={C.blue} />
            <NutrCard label="grassi" value={`${Math.round((summary as any)?.totalFat ?? 0)}g`} color={C.amber} />
          </View>

          {unreadInsights.length > 0 && (
            <>
              <Text style={s.section}>INSIGHTS</Text>
              {unreadInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── StepsRing ─────────────────────────────────────────────────────────────────

function StepsRing({ progress }: { progress: number }) {
  const offset = useSharedValue(CIRCUMFERENCE);
  useEffect(() => {
    offset.value = withTiming(CIRCUMFERENCE * (1 - progress), {
      duration: 1600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);
  const aProps = useAnimatedProps(() => ({ strokeDashoffset: offset.value }));

  return (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      <Defs>
        <SvgLinearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={C.orange} />
          <Stop offset="50%" stopColor="#FF8C00" />
          <Stop offset="100%" stopColor={C.gold} />
        </SvgLinearGradient>
      </Defs>
      {/* outer glow ring */}
      <Circle cx={CX} cy={CY} r={RING_R} stroke="rgba(255,87,34,0.15)" strokeWidth={RING_STROKE + 10} fill="none" />
      {/* track */}
      <Circle cx={CX} cy={CY} r={RING_R} stroke="rgba(255,255,255,0.06)" strokeWidth={RING_STROKE} fill="none" />
      {/* progress */}
      {progress > 0 && (
        <AnimatedCircle
          cx={CX} cy={CY} r={RING_R}
          stroke="url(#rg)"
          strokeWidth={RING_STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`}
          animatedProps={aProps}
        />
      )}
    </Svg>
  );
}

// ── HeroStat ──────────────────────────────────────────────────────────────────

function HeroStat({ icon, value, unit, label, color }: {
  icon: string; value: string; unit: string; label: string; color: string;
}) {
  return (
    <View>
      <Text style={[hs.lbl]}>{label}</Text>
      <View style={hs.row}>
        <Ionicons name={icon as any} size={12} color={color} />
        <Text style={[hs.val, { color }]}> {value}</Text>
        <Text style={hs.unit}> {unit}</Text>
      </View>
    </View>
  );
}
const hs = StyleSheet.create({
  lbl: { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 1.5, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'baseline' },
  val: { fontSize: 22, fontWeight: '800' },
  unit: { fontSize: 11, color: C.sub },
});

// ── GradCard ──────────────────────────────────────────────────────────────────

function GradCard({ grad, borderColor, children }: {
  grad: readonly [string, string, ...string[]]; borderColor: string; children: React.ReactNode;
}) {
  return (
    <View style={[gc.wrap, { borderColor, borderWidth: 1 }]}>
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={gc.inner}>
        {children}
      </LinearGradient>
    </View>
  );
}
const gc = StyleSheet.create({
  wrap: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  inner: { alignItems: 'center', padding: 14, gap: 4 },
});

// ── GradientButton ────────────────────────────────────────────────────────────

function GradientButton({ label, onPress, small }: {
  label: string; onPress: () => void; small?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[C.orange, '#FF8C00', C.gold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[gb.btn, small && gb.small]}
      >
        <Text style={[gb.txt, small && gb.txtSm]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
const gb = StyleSheet.create({
  btn: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center' },
  small: { paddingVertical: 10, paddingHorizontal: 18 },
  txt: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
  txtSm: { fontSize: 13 },
});

// ── WeekPill ──────────────────────────────────────────────────────────────────

function WeekPill({ day, isToday }: { day: WorkoutDay; isToday: boolean }) {
  if (isToday) {
    return (
      <LinearGradient
        colors={[C.orange, C.gold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={wp.today}
      >
        <Text style={wp.dayToday}>{DAY_NAMES[day.dayOfWeek]}</Text>
        {day.isRestDay ? (
          <Ionicons name="moon" size={13} color="#000" />
        ) : (
          <View style={wp.dotToday} />
        )}
        <Text style={wp.typeToday} numberOfLines={1}>
          {day.isRestDay ? 'Riposo' : (day.workout?.type?.toUpperCase() ?? '—')}
        </Text>
      </LinearGradient>
    );
  }
  return (
    <View style={wp.pill}>
      <Text style={wp.day}>{DAY_NAMES[day.dayOfWeek]}</Text>
      {day.isRestDay ? (
        <Ionicons name="moon-outline" size={13} color={C.muted} />
      ) : (
        <View style={wp.dot} />
      )}
      <Text style={wp.type} numberOfLines={1}>
        {day.isRestDay ? 'Riposo' : (day.workout?.type?.toUpperCase() ?? '—')}
      </Text>
    </View>
  );
}
const wp = StyleSheet.create({
  pill: {
    width: 68, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: C.border,
    backgroundColor: '#0C0C0C', gap: 4,
  },
  today: { width: 68, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', marginRight: 8, gap: 4 },
  day: { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  dayToday: { fontSize: 10, fontWeight: '800', color: '#000', letterSpacing: 0.8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.muted },
  dotToday: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#000' },
  type: { fontSize: 9, color: C.muted, textAlign: 'center', letterSpacing: 0.5 },
  typeToday: { fontSize: 9, color: '#000', textAlign: 'center', fontWeight: '700', letterSpacing: 0.5 },
});

// ── BodyCard ──────────────────────────────────────────────────────────────────

function BodyCard({ label, value, unit, color, grad }: {
  label: string; value: string; unit: string; color: string;
  grad: readonly [string, string, ...string[]];
}) {
  return (
    <LinearGradient colors={grad} style={bc.card}>
      <Text style={[bc.val, { color }]}>{value}</Text>
      <Text style={bc.unit}>{unit}</Text>
      <Text style={bc.lbl}>{label}</Text>
    </LinearGradient>
  );
}
const bc = StyleSheet.create({
  card: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: C.border },
  val: { fontSize: 26, fontWeight: '900' },
  unit: { fontSize: 10, color: C.sub },
  lbl: { fontSize: 10, color: C.sub },
});

// ── NutrCard ──────────────────────────────────────────────────────────────────

function NutrCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[nc.card, { borderTopColor: color }]}>
      <View style={[nc.dot, { backgroundColor: color }]} />
      <Text style={[nc.val, { color }]}>{value}</Text>
      <Text style={nc.lbl}>{label}</Text>
    </View>
  );
}
const nc = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#0C0C0C', borderRadius: 12, padding: 12, alignItems: 'center', borderTopWidth: 2, gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  val: { fontSize: 16, fontWeight: '800' },
  lbl: { fontSize: 9, color: C.sub, letterSpacing: 1, textTransform: 'uppercase' },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1 },
  scroll: { paddingBottom: 48 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24,
  },
  hi: { fontSize: 13, color: C.sub },
  name: { fontSize: 32, fontWeight: '900', color: C.text, letterSpacing: -1.5, marginTop: 2 },
  date: { fontSize: 12, color: C.sub, marginTop: 2, textTransform: 'capitalize' },
  avatarGrad: { borderRadius: 24, padding: 1.5 },
  avatarInner: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { fontSize: 18, fontWeight: '900', color: C.orange },

  heroBorder: { marginHorizontal: 16, marginBottom: 16, borderRadius: 24, padding: 1.5 },
  heroCard: { borderRadius: 22, padding: 20 },
  cardLabel: { fontSize: 10, fontWeight: '700', color: C.orange, letterSpacing: 2, marginBottom: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ringWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', width: RING_SIZE, height: RING_SIZE },
  ringInner: { position: 'absolute', alignItems: 'center' },
  stepsNum: { fontSize: 38, fontWeight: '900', color: C.text, letterSpacing: -2 },
  stepsLbl: { fontSize: 11, color: C.sub, letterSpacing: 1 },
  stepsGoal: { fontSize: 9, color: C.muted },
  heroSide: { flex: 1, gap: 12 },
  sep: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  goalPct: { fontSize: 34, fontWeight: '900', color: C.orange, letterSpacing: -1 },
  goalPctSub: { fontSize: 18, fontWeight: '700' },
  goalTrack: { height: 4, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden', width: '100%' },
  goalFill: { height: '100%', borderRadius: 2 },

  section: {
    fontSize: 10, fontWeight: '800', color: C.muted, letterSpacing: 2,
    paddingHorizontal: 20, marginBottom: 12, marginTop: 8,
  },
  vitalsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },

  workoutCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: 'rgba(0,137,123,0.3)' },
  workoutTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { fontSize: 9, fontWeight: '900', color: '#000', letterSpacing: 2 },
  dur: { fontSize: 12, color: C.sub },
  wName: { fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -0.5, marginBottom: 6 },
  wType: { fontSize: 10, fontWeight: '700', color: C.tealLight, letterSpacing: 1.5, marginBottom: 4 },
  wEx: { fontSize: 13, color: C.sub, marginBottom: 20 },
  rest: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  restTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  restSub: { fontSize: 14, color: C.sub },
  noW: { alignItems: 'center', gap: 16, paddingVertical: 8 },
  noWTxt: { fontSize: 14, color: C.sub },

  weekWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  bodyRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  nutrRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },

  vitalVal: { fontSize: 28, fontWeight: '900' },
  vitalUnit: { fontSize: 10, color: C.sub },
  vitalLbl: { fontSize: 10, color: C.sub, textAlign: 'center' },
});
