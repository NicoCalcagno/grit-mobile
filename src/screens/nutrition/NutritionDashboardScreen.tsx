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
import { Ionicons } from '@expo/vector-icons';

import { MealType } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useHealthKit } from '../../hooks/useHealthKit';
import CalorieRing from '../../components/nutrition/CalorieRing';
import MacroBar from '../../components/nutrition/MacroBar';
import FoodLogItem from '../../components/nutrition/FoodLogItem';
import InsightCard from '../../components/nutrition/InsightCard';
import GritCard from '../../components/ui/GritCard';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '☀️ Colazione',
  lunch: '🥗 Pranzo',
  dinner: '🌙 Cena',
  snack: '🍎 Snack',
};

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function NutritionDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { summary, insights, fetchSummary, fetchInsights, deleteFoodLog, logWater, isLoading } = useNutritionStore();
  const { calories: hkCalories } = useHealthKit();

  const today = format(new Date(), 'yyyy-MM-dd');

  const load = useCallback(() => {
    fetchSummary(today, hkCalories);
    fetchInsights();
  }, [today, hkCalories]);

  useEffect(() => { load(); }, []);

  const waterGlasses = summary ? Math.round(summary.water_ml / 250) : 0;
  const targetWaterGlasses = 8;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.primary} />}
      >
        <Text style={styles.title}>Nutrizione</Text>

        {/* Calorie ring */}
        {summary && (
          <GritCard style={styles.ringCard}>
            <CalorieRing consumed={summary.total_calories} target={summary.target_calories} />
          </GritCard>
        )}

        {/* Macros */}
        {summary && (
          <GritCard style={styles.macroCard}>
            <Text style={styles.sectionTitle}>Macronutrienti</Text>
            <MacroBar label="Proteine" current={summary.protein_g} target={summary.target_calories * 0.3 / 4} color={colors.protein} />
            <MacroBar label="Carboidrati" current={summary.carbs_g} target={summary.target_calories * 0.45 / 4} color={colors.carbs} />
            <MacroBar label="Grassi" current={summary.fat_g} target={summary.target_calories * 0.25 / 9} color={colors.fat} />
          </GritCard>
        )}

        {/* Water */}
        <GritCard style={styles.waterCard}>
          <View style={styles.waterRow}>
            <View>
              <Text style={styles.waterTitle}>💧 Acqua</Text>
              <Text style={styles.waterCount}>
                {waterGlasses} / {targetWaterGlasses} bicchieri ({summary?.water_ml ?? 0} ml)
              </Text>
            </View>
            <TouchableOpacity style={styles.waterBtn} onPress={() => logWater(250)}>
              <Ionicons name="add" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </GritCard>

        {/* Unread insights */}
        {insights.filter((i) => !i.read).slice(0, 2).map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}

        {/* Meal logs */}
        {summary && MEAL_ORDER.map((meal) => {
          const entries = summary.logs_by_meal?.[meal] ?? [];
          if (entries.length === 0) return null;
          return (
            <GritCard key={meal} style={styles.mealCard}>
              <Text style={styles.mealTitle}>{MEAL_LABELS[meal]}</Text>
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
            </GritCard>
          );
        })}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('FoodLog')}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: 100 },
  title: { ...typography.heading2, color: colors.text, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  ringCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  macroCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
  waterCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  waterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  waterTitle: { ...typography.bodyMedium, color: colors.text },
  waterCount: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  waterBtn: { width: 40, height: 40, borderRadius: radii.full, backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center' },
  mealCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  mealTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.sm },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
