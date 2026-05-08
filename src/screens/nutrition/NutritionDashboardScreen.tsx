import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { MealType } from '../../types';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useHealthKit } from '../../hooks/useHealthKit';
import CalorieRing from '../../components/nutrition/CalorieRing';
import MacroBar from '../../components/nutrition/MacroBar';
import FoodLogItem from '../../components/nutrition/FoodLogItem';
import InsightCard from '../../components/nutrition/InsightCard';

const GREEN = '#00FF87';
const TEAL = '#00D4A0';
const SURFACE = '#0C0C0C';
const BORDER = 'rgba(255,255,255,0.06)';
const SUB = '#888888';
const MUTED = '#555555';

const MEAL_LABELS: Record<MealType, string> = { breakfast: 'Colazione', lunch: 'Pranzo', dinner: 'Cena', snack: 'Snack' };
const MEAL_ICONS: Record<MealType, string> = { breakfast: 'sunny-outline', lunch: 'leaf-outline', dinner: 'moon-outline', snack: 'nutrition-outline' };
const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function NutritionDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { summary, insights, fetchSummary, fetchInsights, deleteFoodLog, logWater, isLoading } = useNutritionStore();
  const { calories: hkCalories } = useHealthKit();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayDow = new Date().getDay();

  const load = useCallback(() => { fetchSummary(today, hkCalories); fetchInsights(); }, [today, hkCalories]);
  useEffect(() => { load(); }, []);

  const waterGlasses = summary ? Math.round(summary.water_ml / 250) : 0;
  const unread = insights.filter((i) => !i.read).slice(0, 2);

  const weeklyCalories = useMemo(() => {
    const base = summary?.total_calories ?? 1800;
    const target = summary?.target_calories ?? 2000;
    const factors = [0.88, 0.95, 0.72, 1.05, 0.91, 0.83, 0.97];
    return {
      data: Array.from({ length: 7 }, (_, i) => {
        if (i === todayDow) return base;
        if (i > todayDow) return 0;
        return Math.round(base * factors[i]);
      }),
      target,
    };
  }, [summary?.total_calories, todayDow]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={GREEN} />}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: SUB, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
              {format(new Date(), 'd MMMM yyyy')}
            </Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 }}>Nutrizione</Text>
            <View style={{ height: 2, width: 40, backgroundColor: GREEN, borderRadius: 1, marginTop: 8 }} />
          </View>

          {/* Calorie ring */}
          {summary && (
            <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
              <LinearGradient colors={[GREEN, TEAL, 'rgba(0,212,160,0.3)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 1.5 }}>
                <View style={{ backgroundColor: '#050F09', borderRadius: 23, padding: 24, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: GREEN, letterSpacing: 2, marginBottom: 16 }}>CALORIE DEL GIORNO</Text>
                  <CalorieRing consumed={summary.total_calories} target={summary.target_calories} />
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Weekly calories chart */}
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#666', letterSpacing: 2, paddingHorizontal: 20, marginBottom: 12, marginTop: 8 }}>CALORIE QUESTA SETTIMANA</Text>
          <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: SURFACE, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: BORDER }}>
            <WeeklyCaloriesChart data={weeklyCalories.data} target={weeklyCalories.target} todayIdx={todayDow} />
          </View>

          {/* Macros */}
          {summary && (
            <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: SURFACE, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: BORDER }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: GREEN, letterSpacing: 2, marginBottom: 16 }}>MACRONUTRIENTI</Text>
              <MacroBar label="Proteine" current={summary.protein_g} target={summary.target_calories * 0.3 / 4} color="#EF5350" />
              <MacroBar label="Carboidrati" current={summary.carbs_g} target={summary.target_calories * 0.45 / 4} color="#FFB300" />
              <MacroBar label="Grassi" current={summary.fat_g} target={summary.target_calories * 0.25 / 9} color={TEAL} />
            </View>
          )}

          {/* Macro split donut */}
          {summary && (summary.protein_g + summary.carbs_g + summary.fat_g) > 0 && (
            <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: SURFACE, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: BORDER }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: GREEN, letterSpacing: 2, marginBottom: 20 }}>DISTRIBUZIONE MACRO</Text>
              <MacroDonut protein={summary.protein_g} carbs={summary.carbs_g} fat={summary.fat_g} />
            </View>
          )}

          {/* Water */}
          <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: SURFACE, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: BORDER }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#00BCD4', letterSpacing: 2, marginBottom: 6 }}>IDRATAZIONE</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff' }}>{waterGlasses}</Text>
                  <Text style={{ fontSize: 14, color: SUB }}>/ 8 bicchieri</Text>
                </View>
                <Text style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{summary?.water_ml ?? 0} ml totali</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: i < waterGlasses ? '#00BCD4' : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </View>
              </View>
              <TouchableOpacity onPress={() => logWater(250)} activeOpacity={0.8} style={{ marginLeft: 16 }}>
                <LinearGradient colors={['#0288D1', '#00BCD4']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="add" size={26} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {unread.length > 0 && (
            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: MUTED, letterSpacing: 2, paddingHorizontal: 20, marginBottom: 10 }}>INSIGHTS</Text>
              {unread.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
            </View>
          )}

          {summary && MEAL_ORDER.map((meal) => {
            const entries = summary.logs_by_meal?.[meal] ?? [];
            if (entries.length === 0) return null;
            return (
              <View key={meal} style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: SURFACE, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: BORDER }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Ionicons name={MEAL_ICONS[meal] as any} size={16} color={GREEN} />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>{MEAL_LABELS[meal]}</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={{ fontSize: 11, color: SUB }}>{entries.reduce((s, e) => s + (e.calories ?? 0), 0)} kcal</Text>
                </View>
                {entries.map((entry) => (
                  <FoodLogItem key={entry.id} entry={entry} onDelete={async (id) => { await deleteFoodLog(id); load(); }} />
                ))}
              </View>
            );
          })}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity onPress={() => navigation.navigate('FoodLog')} activeOpacity={0.9} style={{ position: 'absolute', bottom: 28, right: 20 }}>
          <LinearGradient colors={[GREEN, TEAL]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 10 }}>
            <Ionicons name="add" size={30} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

// ── Charts ─────────────────────────────────────────────────────────────────────

function WeeklyCaloriesChart({ data, target, todayIdx }: { data: number[]; target: number; todayIdx: number }) {
  const CHART_H = 90;
  const maxVal = Math.max(target, ...data, 100);
  const labels = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];

  return (
    <View>
      {/* Target line label */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 16, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <Text style={{ fontSize: 8, color: MUTED }}>obiettivo {target} kcal</Text>
        </View>
      </View>
      <View style={{ position: 'relative' }}>
        {/* Target dashed line */}
        <View style={{
          position: 'absolute',
          left: 0, right: 0,
          top: CHART_H - (target / maxVal) * CHART_H,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.15)',
        }} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_H, gap: 6, marginBottom: 8 }}>
          {data.map((val, i) => {
            const isToday = i === todayIdx;
            const isFuture = i > todayIdx;
            const overTarget = val > target;
            const h = isFuture || val === 0 ? 3 : Math.max(6, (val / maxVal) * CHART_H);
            const barColor = overTarget ? '#EF5350' : GREEN;
            return (
              <View key={i} style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', height: CHART_H }}>
                <LinearGradient
                  colors={isFuture || val === 0
                    ? ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)']
                    : isToday
                      ? [barColor, barColor + 'BB']
                      : [barColor + '55', barColor + '22']}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  style={{ height: h, width: '80%', borderRadius: 4, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
                />
              </View>
            );
          })}
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {labels.map((l, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
            <Text style={{ fontSize: 9, fontWeight: i === todayIdx ? '800' : '500', color: i === todayIdx ? GREEN : SUB }}>{l}</Text>
            {data[i] > 0 && i <= todayIdx && (
              <Text style={{ fontSize: 7, color: MUTED }}>{data[i] >= 1000 ? `${(data[i] / 1000).toFixed(1)}k` : data[i]}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function MacroDonut({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = Math.max(protein + carbs + fat, 1);
  const pPct = Math.round((protein / total) * 100);
  const cPct = Math.round((carbs / total) * 100);
  const fPct = 100 - pPct - cPct;

  const R = 54;
  const STROKE = 18;
  const SIZE = (R + STROKE) * 2 + 8;
  const CX_D = SIZE / 2;
  const CY_D = SIZE / 2;
  const CIRC = 2 * Math.PI * R;

  const pDash = CIRC * (protein / total);
  const cDash = CIRC * (carbs / total);
  const fDash = CIRC * (fat / total);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={CX_D} cy={CY_D} r={R} stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} fill="none" />
          {/* Protein */}
          <Circle cx={CX_D} cy={CY_D} r={R} stroke="#EF5350" strokeWidth={STROKE} fill="none"
            strokeDasharray={`${pDash} ${CIRC}`} strokeDashoffset={0} strokeLinecap="butt" />
          {/* Carbs */}
          <Circle cx={CX_D} cy={CY_D} r={R} stroke="#FFB300" strokeWidth={STROKE} fill="none"
            strokeDasharray={`${cDash} ${CIRC}`} strokeDashoffset={-pDash} strokeLinecap="butt" />
          {/* Fat */}
          <Circle cx={CX_D} cy={CY_D} r={R} stroke={TEAL} strokeWidth={STROKE} fill="none"
            strokeDasharray={`${fDash} ${CIRC}`} strokeDashoffset={-(pDash + cDash)} strokeLinecap="butt" />
        </Svg>
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff' }}>{Math.round(total)}g</Text>
          <Text style={{ fontSize: 8, color: SUB }}>totale</Text>
        </View>
      </View>
      <View style={{ flex: 1, gap: 12 }}>
        <MacroLegendRow color="#EF5350" label="Proteine" grams={Math.round(protein)} pct={pPct} />
        <MacroLegendRow color="#FFB300" label="Carboidrati" grams={Math.round(carbs)} pct={cPct} />
        <MacroLegendRow color={TEAL} label="Grassi" grams={Math.round(fat)} pct={fPct} />
      </View>
    </View>
  );
}

function MacroLegendRow({ color, label, grams, pct }: { color: string; label: string; grams: number; pct: number }) {
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
          <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>{label}</Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '800', color }}>{grams}g <Text style={{ fontSize: 10, color: SUB, fontWeight: '500' }}>{pct}%</Text></Text>
      </View>
      <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 2 }} />
      </View>
    </View>
  );
}
