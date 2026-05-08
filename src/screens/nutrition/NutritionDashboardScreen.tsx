import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { MealType } from '../../types';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useHealthKit } from '../../hooks/useHealthKit';
import CalorieRing from '../../components/nutrition/CalorieRing';
import MacroBar from '../../components/nutrition/MacroBar';
import FoodLogItem from '../../components/nutrition/FoodLogItem';
import InsightCard from '../../components/nutrition/InsightCard';

const ORANGE = '#FF5722';
const GOLD = '#FFB300';
const SURFACE = '#0C0C0C';
const BORDER = 'rgba(255,255,255,0.07)';
const SUB = '#666666';
const MUTED = '#333333';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Colazione',
  lunch: 'Pranzo',
  dinner: 'Cena',
  snack: 'Snack',
};
const MEAL_ICONS: Record<MealType, string> = {
  breakfast: 'sunny-outline',
  lunch: 'leaf-outline',
  dinner: 'moon-outline',
  snack: 'nutrition-outline',
};
const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function NutritionDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { summary, insights, fetchSummary, fetchInsights, deleteFoodLog, logWater, isLoading } =
    useNutritionStore();
  const { calories: hkCalories } = useHealthKit();

  const today = format(new Date(), 'yyyy-MM-dd');

  const load = useCallback(() => {
    fetchSummary(today, hkCalories);
    fetchInsights();
  }, [today, hkCalories]);

  useEffect(() => { load(); }, []);

  const waterGlasses = summary ? Math.round(summary.water_ml / 250) : 0;
  const unread = insights.filter((i) => !i.read).slice(0, 2);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={ORANGE} />
          }
        >
          {/* ── Header ── */}
          <LinearGradient
            colors={['#0D0400', '#060200', '#000000']}
            style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: SUB, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
              {format(new Date(), 'd MMMM yyyy')}
            </Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 }}>
              Nutrizione
            </Text>
          </LinearGradient>

          {/* ── Calorie ring ── */}
          {summary && (
            <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
              <View style={{
                backgroundColor: SURFACE, borderRadius: 24, padding: 24,
                borderWidth: 1, borderColor: BORDER, alignItems: 'center',
              }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: ORANGE, letterSpacing: 2, marginBottom: 16 }}>
                  CALORIE DEL GIORNO
                </Text>
                <CalorieRing consumed={summary.total_calories} target={summary.target_calories} />
              </View>
            </View>
          )}

          {/* ── Macros ── */}
          {summary && (
            <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
              <View style={{ backgroundColor: SURFACE, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: BORDER }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: ORANGE, letterSpacing: 2, marginBottom: 16 }}>
                  MACRONUTRIENTI
                </Text>
                <MacroBar label="Proteine" current={summary.protein_g} target={summary.target_calories * 0.3 / 4} color="#EF5350" />
                <MacroBar label="Carboidrati" current={summary.carbs_g} target={summary.target_calories * 0.45 / 4} color={GOLD} />
                <MacroBar label="Grassi" current={summary.fat_g} target={summary.target_calories * 0.25 / 9} color="#00BCD4" />
              </View>
            </View>
          )}

          {/* ── Water ── */}
          <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
            <View style={{ backgroundColor: SURFACE, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: BORDER }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#00BCD4', letterSpacing: 2, marginBottom: 6 }}>
                    IDRATAZIONE
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff' }}>
                      {waterGlasses}
                    </Text>
                    <Text style={{ fontSize: 14, color: SUB }}>/ 8 bicchieri</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    {summary?.water_ml ?? 0} ml totali
                  </Text>
                  {/* water glasses dots */}
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <View
                        key={i}
                        style={{
                          width: 10, height: 10, borderRadius: 5,
                          backgroundColor: i < waterGlasses ? '#00BCD4' : MUTED,
                        }}
                      />
                    ))}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => logWater(250)}
                  activeOpacity={0.8}
                  style={{ marginLeft: 16 }}
                >
                  <LinearGradient
                    colors={['#0288D1', '#00BCD4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Ionicons name="add" size={26} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Insights ── */}
          {unread.length > 0 && (
            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: MUTED, letterSpacing: 2, paddingHorizontal: 20, marginBottom: 10 }}>
                INSIGHTS
              </Text>
              {unread.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </View>
          )}

          {/* ── Meals ── */}
          {summary && MEAL_ORDER.map((meal) => {
            const entries = summary.logs_by_meal?.[meal] ?? [];
            if (entries.length === 0) return null;
            return (
              <View key={meal} style={{ marginHorizontal: 16, marginBottom: 12 }}>
                <View style={{ backgroundColor: SURFACE, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: BORDER }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Ionicons name={MEAL_ICONS[meal] as any} size={16} color={ORANGE} />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>
                      {MEAL_LABELS[meal]}
                    </Text>
                    <View style={{ flex: 1 }} />
                    <Text style={{ fontSize: 11, color: SUB }}>
                      {entries.reduce((s, e) => s + (e.calories ?? 0), 0)} kcal
                    </Text>
                  </View>
                  {entries.map((entry) => (
                    <FoodLogItem
                      key={entry.id}
                      entry={entry}
                      onDelete={async (id) => {
                        await deleteFoodLog(id);
                        load();
                      }}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ── FAB ── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('FoodLog')}
          activeOpacity={0.9}
          style={{ position: 'absolute', bottom: 28, right: 20 }}
        >
          <LinearGradient
            colors={[ORANGE, '#FF8C00', GOLD]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 60, height: 60, borderRadius: 30,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
            }}
          >
            <Ionicons name="add" size={30} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
