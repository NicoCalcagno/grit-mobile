import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedProps } from 'react-native-reanimated';

import { RootStackParamList, WorkoutDay } from '../../types';
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

const C = {
  bg: '#000000',
  card: '#0C0C0C',
  border: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  sub: '#888888',
  muted: '#555555',
  green: '#00FF87',
  teal: '#00D4A0',
  cyan: '#00BFA5',
  blue: '#1E88E5',
  blueLight: '#90CAF9',
  purple: '#A855F7',
  purpleLight: '#D8B4FE',
  red: '#EF5350',
  amber: '#FFB300',
};

function typeColor(type: string): string {
  const map: Record<string, string> = {
    strength: C.green, cardio: C.blue, hiit: C.red,
    yoga: C.purple, stretching: C.teal, mobility: C.cyan,
  };
  return map[type?.toLowerCase()] ?? C.green;
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const { weeklyPlan, fetchWeeklyPlan, setActivePlan, generateWeeklyPlan, isLoading } = useWorkoutStore();
  const { summary, insights, fetchSummary, fetchInsights } = useNutritionStore();
  const { heartRate, restingHeartRate, hrv, calories, steps, distanceKm, vo2Max, weightKg, bodyFatPct, refresh: refreshHealth } = useHealthKit();

  const today = new Date();
  const todayDow = today.getDay();

  useEffect(() => {
    fetchWeeklyPlan();
    fetchSummary(format(today, 'yyyy-MM-dd'), calories);
    fetchInsights();
  }, []);

  const onRefresh = useCallback(async () => {
    refreshHealth();
    await Promise.all([fetchWeeklyPlan(), fetchSummary(format(today, 'yyyy-MM-dd'), calories), fetchInsights()]);
  }, [calories, refreshHealth]);

  const todayPlan = weeklyPlan.find((d) => d.dayOfWeek === todayDow);
  const unreadInsights = insights.filter((i) => !i.read).slice(0, 2);

  const handleStartWorkout = async () => {
    if (!todayPlan?.workout) return;
    setActivePlan(todayPlan.workout);
    navigation.navigate('WorkoutSession', {});
  };

  const handleGeneratePlan = useCallback(async () => {
    try {
      await generateWeeklyPlan();
    } catch {}
  }, [generateWeeklyPlan]);

  const stepsProgress = Math.min(steps / STEPS_GOAL, 1);
  const hasBodyMetrics = weightKg > 0 || bodyFatPct > 0 || vo2Max > 0;

  const weeklySteps = useMemo(() => {
    const base = steps > 0 ? steps : 6000;
    const factors = [0.72, 0.85, 0.63, 0.91, 0.78, 0.55, 0.88];
    return Array.from({ length: 7 }, (_, i) => {
      if (i === todayDow) return steps > 0 ? steps : base;
      if (i > todayDow) return 0;
      return Math.round(base * factors[i]);
    });
  }, [steps, todayDow]);

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={C.green} />}
        >
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.hi}>{getGreeting()},</Text>
              <Text style={s.name}>{user?.name?.split(' ')[0] ?? 'Atleta'}</Text>
              <Text style={s.date}>{format(today, 'EEEE d MMMM', { locale: it })}</Text>
            </View>
            <LinearGradient colors={[C.green, C.teal]} style={s.avatarGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={s.avatarInner}>
                <Text style={s.avatarTxt}>{(user?.name?.[0] ?? 'A').toUpperCase()}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Hero */}
          <LinearGradient colors={[C.green, C.teal, 'rgba(0,212,160,0.3)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroBorder}>
            <LinearGradient colors={['#001A0D', '#000F08', '#0A0A0A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroCard}>
              <Text style={s.cardLabel}>ATTIVITÀ DI OGGI</Text>
              <View style={s.heroRow}>
                <View style={s.ringWrap}>
                  <StepsRing progress={stepsProgress} />
                  <View style={s.ringInner}>
                    <Text style={s.stepsNum}>{steps > 0 ? steps.toLocaleString('it-IT') : '—'}</Text>
                    <Text style={s.stepsLbl}>passi</Text>
                    <Text style={s.stepsGoal}>/ {STEPS_GOAL.toLocaleString('it-IT')}</Text>
                  </View>
                </View>
                <View style={s.heroSide}>
                  <HeroStat icon="flame" value={calories > 0 ? `${calories}` : '—'} unit="kcal" label="CALORIE" color={C.amber} />
                  <View style={s.sep} />
                  <HeroStat icon="footsteps" value={distanceKm > 0 ? `${distanceKm}` : '—'} unit="km" label="DISTANZA" color={C.teal} />
                  <View style={s.sep} />
                  <View>
                    <Text style={s.goalPct}>{Math.round(stepsProgress * 100)}<Text style={s.goalPctSub}>%</Text></Text>
                    <Text style={[s.cardLabel, { marginBottom: 6 }]}>OBIETTIVO</Text>
                    <View style={s.goalTrack}>
                      <LinearGradient colors={[C.green, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[s.goalFill, { width: `${Math.round(stepsProgress * 100)}%` as any }]} />
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </LinearGradient>

          {/* Weekly Steps Chart */}
          <Text style={s.section}>PASSI QUESTA SETTIMANA</Text>
          <View style={s.chartCard}>
            <WeeklyBarsChart data={weeklySteps} color={C.green} maxVal={STEPS_GOAL} todayIdx={todayDow} />
          </View>

          {/* Vitals */}
          <Text style={s.section}>PARAMETRI VITALI</Text>
          <View style={s.vitalsRow}>
            <GradCard grad={['rgba(0,255,135,0.18)', 'rgba(0,255,135,0.04)', '#0C0C0C']} borderColor={C.green}>
              <Ionicons name="heart" size={20} color={C.green} />
              <Text style={[s.vitalVal, { color: C.green }]}>{heartRate > 0 ? heartRate : '—'}</Text>
              <Text style={s.vitalUnit}>bpm</Text>
              <Text style={s.vitalLbl}>FC Live</Text>
            </GradCard>
            <GradCard grad={['rgba(30,136,229,0.18)', 'rgba(30,136,229,0.04)', '#0C0C0C']} borderColor={C.blue}>
              <Ionicons name="heart-circle-outline" size={20} color={C.blueLight} />
              <Text style={[s.vitalVal, { color: C.blueLight }]}>{restingHeartRate > 0 ? restingHeartRate : '—'}</Text>
              <Text style={s.vitalUnit}>bpm</Text>
              <Text style={s.vitalLbl}>FC Riposo</Text>
            </GradCard>
            <GradCard grad={['rgba(168,85,247,0.18)', 'rgba(168,85,247,0.04)', '#0C0C0C']} borderColor={C.purple}>
              <Ionicons name="pulse" size={20} color={C.purpleLight} />
              <Text style={[s.vitalVal, { color: C.purpleLight }]}>{hrv > 0 ? hrv : '—'}</Text>
              <Text style={s.vitalUnit}>ms</Text>
              <Text style={s.vitalLbl}>HRV</Text>
            </GradCard>
          </View>

          {/* Training Load Chart */}
          <Text style={s.section}>CARICO ALLENAMENTO</Text>
          <View style={s.chartCard}>
            <TrainingLoadChart weeklyPlan={weeklyPlan} todayDow={todayDow} />
          </View>

          {/* Workout */}
          <Text style={s.section}>ALLENAMENTO</Text>
          <LinearGradient colors={['#001A0D', '#000F08', '#0A0A0A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.workoutCard}>
            <View style={s.workoutTop}>
              <LinearGradient colors={[C.green, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.badge}>
                <Text style={s.badgeTxt}>OGGI</Text>
              </LinearGradient>
              {todayPlan?.workout && <Text style={s.dur}>{todayPlan.workout.durationMinutes} min</Text>}
            </View>
            {isLoading ? (
              <View style={s.rest}>
                <ActivityIndicator color={C.green} size="large" />
                <Text style={s.restSub}>Generazione piano AI...</Text>
              </View>
            ) : todayPlan?.isRestDay ? (
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
                <Ionicons name="sparkles-outline" size={32} color={C.green} style={{ marginBottom: 8 }} />
                <Text style={s.noWTxt}>Nessun piano settimanale</Text>
                <Text style={{ fontSize: 12, color: C.sub, marginBottom: 16, textAlign: 'center' }}>Genera il tuo piano personalizzato con AI</Text>
                <GradientButton label="Genera piano AI" onPress={handleGeneratePlan} />
              </View>
            )}
          </LinearGradient>

          {/* Week */}
          <Text style={s.section}>SETTIMANA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.weekWrap}>
            {weeklyPlan.length > 0 ? weeklyPlan.map((day) => (
              <WeekPill key={day.dayOfWeek} day={day} isToday={day.dayOfWeek === todayDow} />
            )) : (
              <Text style={{ color: C.muted, fontSize: 13, paddingVertical: 12 }}>Genera prima il piano settimanale</Text>
            )}
          </ScrollView>

          {/* Body */}
          {hasBodyMetrics && (
            <>
              <Text style={s.section}>COMPOSIZIONE CORPOREA</Text>
              <View style={s.bodyRow}>
                {weightKg > 0 && <BodyCard label="Peso" value={`${weightKg}`} unit="kg" color={C.teal} grad={['rgba(0,212,160,0.18)', '#0C0C0C']} />}
                {bodyFatPct > 0 && <BodyCard label="Grasso" value={`${bodyFatPct}`} unit="%" color={C.amber} grad={['rgba(255,179,0,0.18)', '#0C0C0C']} />}
                {vo2Max > 0 && <BodyCard label="VO₂max" value={`${vo2Max}`} unit="ml/kg" color={C.green} grad={['rgba(0,255,135,0.18)', '#0C0C0C']} />}
              </View>
            </>
          )}

          {/* Nutrition */}
          <Text style={s.section}>NUTRIZIONE</Text>
          <View style={s.nutrRow}>
            <NutrCard label="kcal" value={`${summary?.totalCalories ?? 0}`} color={C.green} />
            <NutrCard label="prot" value={`${Math.round((summary as any)?.totalProtein ?? 0)}g`} color={C.red} />
            <NutrCard label="carbo" value={`${Math.round((summary as any)?.totalCarbs ?? 0)}g`} color={C.amber} />
            <NutrCard label="grassi" value={`${Math.round((summary as any)?.totalFat ?? 0)}g`} color={C.blue} />
          </View>

          {unreadInsights.length > 0 && (
            <>
              <Text style={s.section}>INSIGHTS</Text>
              {unreadInsights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Charts ────────────────────────────────────────────────────────────────────

function WeeklyBarsChart({ data, color, maxVal, todayIdx }: { data: number[]; color: string; maxVal: number; todayIdx: number }) {
  const CHART_H = 90;
  const labels = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_H, gap: 6, marginBottom: 8 }}>
        {data.map((val, i) => {
          const isToday = i === todayIdx;
          const isFuture = i > todayIdx;
          const h = isFuture || val === 0 ? 3 : Math.max(6, (val / maxVal) * CHART_H);
          return (
            <View key={i} style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', height: CHART_H }}>
              <LinearGradient
                colors={isFuture || val === 0
                  ? ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)']
                  : isToday
                    ? [color, color + 'BB']
                    : [color + '55', color + '22']}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={{ height: h, width: '80%', borderRadius: 4, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {labels.map((l, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
            <Text style={{ fontSize: 9, fontWeight: i === todayIdx ? '800' : '500', color: i === todayIdx ? color : C.sub }}>{l}</Text>
            {i === todayIdx && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />}
            {data[i] > 0 && i <= todayIdx && (
              <Text style={{ fontSize: 7, color: C.muted }}>{data[i] >= 1000 ? `${(data[i] / 1000).toFixed(1)}k` : data[i]}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function TrainingLoadChart({ weeklyPlan, todayDow }: { weeklyPlan: WorkoutDay[]; todayDow: number }) {
  const CHART_H = 90;
  const MAX_MINS = 90;
  const labels = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];

  const dayData = Array.from({ length: 7 }, (_, i) => {
    const plan = weeklyPlan.find((d) => d.dayOfWeek === i);
    return {
      mins: plan?.isRestDay ? 0 : (plan?.workout?.durationMinutes ?? 0),
      type: plan?.workout?.type ?? '',
      isRest: plan?.isRestDay ?? false,
    };
  });

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_H, gap: 6, marginBottom: 8 }}>
        {dayData.map((d, i) => {
          const isToday = i === todayDow;
          const col = typeColor(d.type);
          const h = d.mins > 0 ? Math.max(6, (d.mins / MAX_MINS) * CHART_H) : 3;
          return (
            <View key={i} style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', height: CHART_H }}>
              <LinearGradient
                colors={d.mins === 0
                  ? ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)']
                  : isToday
                    ? [col, col + 'AA']
                    : [col + '66', col + '22']}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={{ height: h, width: '80%', borderRadius: 4, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {labels.map((l, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
            <Text style={{ fontSize: 9, fontWeight: i === todayDow ? '800' : '500', color: i === todayDow ? typeColor(dayData[i].type) : C.sub }}>{l}</Text>
            {dayData[i].mins > 0 && (
              <Text style={{ fontSize: 7, color: C.muted }}>{dayData[i].mins}m</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

// ── UI atoms ──────────────────────────────────────────────────────────────────

function StepsRing({ progress }: { progress: number }) {
  const offset = useSharedValue(CIRCUMFERENCE);
  useEffect(() => {
    offset.value = withTiming(CIRCUMFERENCE * (1 - progress), { duration: 1600, easing: Easing.out(Easing.cubic) });
  }, [progress]);
  const aProps = useAnimatedProps(() => ({ strokeDashoffset: offset.value }));
  return (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      <Defs>
        <SvgLinearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#00FF87" />
          <Stop offset="100%" stopColor="#00D4A0" />
        </SvgLinearGradient>
      </Defs>
      <Circle cx={CX} cy={CY} r={RING_R} stroke="rgba(0,255,135,0.1)" strokeWidth={RING_STROKE + 10} fill="none" />
      <Circle cx={CX} cy={CY} r={RING_R} stroke="rgba(255,255,255,0.05)" strokeWidth={RING_STROKE} fill="none" />
      {progress > 0 && (
        <AnimatedCircle cx={CX} cy={CY} r={RING_R} stroke="url(#rg)" strokeWidth={RING_STROKE}
          fill="none" strokeDasharray={CIRCUMFERENCE} strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`} animatedProps={aProps} />
      )}
    </Svg>
  );
}

function HeroStat({ icon, value, unit, label, color }: { icon: string; value: string; unit: string; label: string; color: string }) {
  return (
    <View>
      <Text style={{ fontSize: 9, fontWeight: '700', color: C.sub, letterSpacing: 1.5, marginBottom: 2 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Ionicons name={icon as any} size={12} color={color} />
        <Text style={{ fontSize: 22, fontWeight: '800', color }}> {value}</Text>
        <Text style={{ fontSize: 11, color: C.sub }}> {unit}</Text>
      </View>
    </View>
  );
}

function GradCard({ grad, borderColor, children }: { grad: readonly [string, string, ...string[]]; borderColor: string; children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor }}>
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ alignItems: 'center', padding: 14, gap: 4 }}>
        {children}
      </LinearGradient>
    </View>
  );
}

function GradientButton({ label, onPress, small }: { label: string; onPress: () => void; small?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={['#00FF87', '#00D4A0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ borderRadius: 14, paddingVertical: small ? 10 : 16, paddingHorizontal: small ? 18 : 24, alignItems: 'center' }}>
        <Text style={{ fontSize: small ? 13 : 16, fontWeight: '800', color: '#000', letterSpacing: 0.5 }}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function WeekPill({ day, isToday }: { day: WorkoutDay; isToday: boolean }) {
  if (isToday) {
    return (
      <LinearGradient colors={['#00FF87', '#00D4A0']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={{ width: 68, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', marginRight: 8, gap: 4 }}>
        <Text style={{ fontSize: 10, fontWeight: '800', color: '#000', letterSpacing: 0.8 }}>{DAY_NAMES[day.dayOfWeek]}</Text>
        {day.isRestDay ? <Ionicons name="moon" size={13} color="#000" /> : <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#000' }} />}
        <Text style={{ fontSize: 9, color: '#000', textAlign: 'center', fontWeight: '700', letterSpacing: 0.5 }} numberOfLines={1}>
          {day.isRestDay ? 'Riposo' : (day.workout?.type?.toUpperCase() ?? '—')}
        </Text>
      </LinearGradient>
    );
  }
  return (
    <View style={{ width: 68, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: C.border, backgroundColor: '#0C0C0C', gap: 4 }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: C.sub, letterSpacing: 0.8 }}>{DAY_NAMES[day.dayOfWeek]}</Text>
      {day.isRestDay ? <Ionicons name="moon-outline" size={13} color={C.muted} /> : <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.muted }} />}
      <Text style={{ fontSize: 9, color: C.sub, textAlign: 'center', letterSpacing: 0.5 }} numberOfLines={1}>
        {day.isRestDay ? 'Riposo' : (day.workout?.type?.toUpperCase() ?? '—')}
      </Text>
    </View>
  );
}

function BodyCard({ label, value, unit, color, grad }: { label: string; value: string; unit: string; color: string; grad: readonly [string, string, ...string[]] }) {
  return (
    <LinearGradient colors={grad} style={{ flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: C.border }}>
      <Text style={{ fontSize: 26, fontWeight: '900', color }}>{value}</Text>
      <Text style={{ fontSize: 10, color: C.sub }}>{unit}</Text>
      <Text style={{ fontSize: 10, color: C.sub }}>{label}</Text>
    </LinearGradient>
  );
}

function NutrCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0C0C0C', borderRadius: 12, padding: 12, alignItems: 'center', borderTopWidth: 2, borderTopColor: color, gap: 3 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <Text style={{ fontSize: 16, fontWeight: '800', color }}>{value}</Text>
      <Text style={{ fontSize: 9, color: C.sub, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  hi: { fontSize: 13, color: C.sub },
  name: { fontSize: 32, fontWeight: '900', color: C.text, letterSpacing: -1.5, marginTop: 2 },
  date: { fontSize: 12, color: C.sub, marginTop: 2, textTransform: 'capitalize' },
  avatarGrad: { borderRadius: 24, padding: 1.5 },
  avatarInner: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 18, fontWeight: '900', color: C.green },
  heroBorder: { marginHorizontal: 16, marginBottom: 16, borderRadius: 24, padding: 1.5 },
  heroCard: { borderRadius: 22, padding: 20 },
  cardLabel: { fontSize: 10, fontWeight: '700', color: C.green, letterSpacing: 2, marginBottom: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ringWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', width: RING_SIZE, height: RING_SIZE },
  ringInner: { position: 'absolute', alignItems: 'center' },
  stepsNum: { fontSize: 38, fontWeight: '900', color: C.text, letterSpacing: -2 },
  stepsLbl: { fontSize: 11, color: C.sub, letterSpacing: 1 },
  stepsGoal: { fontSize: 9, color: C.muted },
  heroSide: { flex: 1, gap: 12 },
  sep: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  goalPct: { fontSize: 34, fontWeight: '900', color: C.green, letterSpacing: -1 },
  goalPctSub: { fontSize: 18, fontWeight: '700' },
  goalTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden', width: '100%' },
  goalFill: { height: '100%', borderRadius: 2 },
  section: { fontSize: 10, fontWeight: '800', color: '#666666', letterSpacing: 2, paddingHorizontal: 20, marginBottom: 12, marginTop: 20 },
  chartCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#0C0C0C', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  vitalsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  workoutCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: 'rgba(0,212,160,0.2)' },
  workoutTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { fontSize: 9, fontWeight: '900', color: '#000', letterSpacing: 2 },
  dur: { fontSize: 12, color: C.sub },
  wName: { fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -0.5, marginBottom: 6 },
  wType: { fontSize: 10, fontWeight: '700', color: C.teal, letterSpacing: 1.5, marginBottom: 4 },
  wEx: { fontSize: 13, color: C.sub, marginBottom: 20 },
  rest: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  restTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  restSub: { fontSize: 14, color: C.sub },
  noW: { alignItems: 'center', gap: 4, paddingVertical: 8 },
  noWTxt: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 4 },
  weekWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  bodyRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  nutrRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  vitalVal: { fontSize: 28, fontWeight: '900' },
  vitalUnit: { fontSize: 10, color: C.sub },
  vitalLbl: { fontSize: 10, color: C.sub, textAlign: 'center' },
});
