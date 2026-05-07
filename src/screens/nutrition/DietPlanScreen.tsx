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
import { Ionicons } from '@expo/vector-icons';

import { MealType } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import { useNutritionStore } from '../../stores/nutritionStore';
import GritButton from '../../components/ui/GritButton';
import GritCard from '../../components/ui/GritCard';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MEAL_ICONS: Record<MealType, string> = { breakfast: '☀️', lunch: '🥗', dinner: '🌙', snack: '🍎' };

export default function DietPlanScreen() {
  const { dietPlan, fetchDietPlan, generateDietPlan, regenerateDietDay, isLoading } = useNutritionStore();
  const [activeDay, setActiveDay] = useState(new Date().getDay());

  useEffect(() => { fetchDietPlan(); }, []);

  if (isLoading && !dietPlan) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Caricamento piano…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dietPlan) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🥗</Text>
          <Text style={styles.emptyTitle}>Nessun piano dieta</Text>
          <Text style={styles.emptySubtitle}>Genera il tuo piano alimentare AI personalizzato.</Text>
          <GritButton label="Genera piano dieta" onPress={generateDietPlan} loading={isLoading} size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  const activeDayPlan = dietPlan.weekDays.find((d) => d.dayOfWeek === activeDay);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Piano Dieta</Text>
          <GritButton label="Rigenera tutto" onPress={generateDietPlan} loading={isLoading} variant="ghost" size="sm" />
        </View>

        {/* Day tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {dietPlan.weekDays.map((day) => (
            <TouchableOpacity
              key={day.dayOfWeek}
              style={[styles.tab, activeDay === day.dayOfWeek && styles.tabActive]}
              onPress={() => setActiveDay(day.dayOfWeek)}
            >
              <Text style={[styles.tabDay, activeDay === day.dayOfWeek && styles.tabDayActive]}>
                {DAY_NAMES[day.dayOfWeek]}
              </Text>
              <Text style={[styles.tabCal, activeDay === day.dayOfWeek && styles.tabCalActive]}>
                {day.totalCalories} kcal
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeDayPlan && (
          <>
            {activeDayPlan.meals.map((meal) => (
              <GritCard key={meal.type} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealIcon}>{MEAL_ICONS[meal.type]}</Text>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealMacros}>
                      P {meal.protein}g · C {meal.carbs}g · G {meal.fat}g
                    </Text>
                  </View>
                  <Text style={styles.mealCal}>{meal.calories} kcal</Text>
                </View>
              </GritCard>
            ))}

            <GritButton
              label={`Rigenera ${DAY_NAMES[activeDay]}`}
              onPress={() => regenerateDietDay(activeDay)}
              loading={isLoading}
              variant="secondary"
              size="sm"
              style={styles.regenBtn}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { ...typography.body, color: colors.textSecondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  emptyIcon: { fontSize: 72 },
  emptyTitle: { ...typography.heading3, color: colors.text },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  container: { paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { ...typography.heading2, color: colors.text },
  tabs: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  tab: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', minWidth: 70 },
  tabActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  tabDay: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  tabDayActive: { color: colors.primary },
  tabCal: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  tabCalActive: { color: colors.primary },
  mealCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mealIcon: { fontSize: 24 },
  mealInfo: { flex: 1 },
  mealName: { ...typography.bodyMedium, color: colors.text },
  mealMacros: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  mealCal: { ...typography.bodyMedium, color: colors.text, fontFamily: 'Courier' },
  regenBtn: { marginHorizontal: spacing.lg, marginTop: spacing.md },
});
