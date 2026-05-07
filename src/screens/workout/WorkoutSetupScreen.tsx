import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { WorkoutStackParamList } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import { useWorkoutStore } from '../../stores/workoutStore';
import GritButton from '../../components/ui/GritButton';
import GritCard from '../../components/ui/GritCard';

type Nav = NativeStackNavigationProp<WorkoutStackParamList, 'WorkoutSetup'>;
type Route = RouteProp<WorkoutStackParamList, 'WorkoutSetup'>;

export default function WorkoutSetupScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { activePlan, weeklyPlan, startSession, isLoading } = useWorkoutStore();

  const todayDow = new Date().getDay();
  const todayDay = weeklyPlan.find((d) => d.dayOfWeek === todayDow);
  const plan = activePlan ?? todayDay?.workout ?? null;

  const handleStart = async () => {
    if (!plan) return;
    try {
      const session = await startSession(plan.id);
      navigation.replace('ActiveWorkout', { sessionId: session.id });
    } catch {
      // Error handled in store
    }
  };

  if (!plan) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏋️</Text>
          <Text style={styles.emptyTitle}>Nessun workout trovato</Text>
          <GritButton label="Genera piano" onPress={() => navigation.goBack()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-down" size={28} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Allenamento</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Plan Info */}
        <View style={styles.planInfo}>
          <Text style={styles.planType}>{plan.type.toUpperCase()}</Text>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.planMeta}>
            <MetaBadge icon="time-outline" label={`${plan.durationMinutes} min`} />
            <MetaBadge icon="barbell-outline" label={`${plan.exercises.length} esercizi`} />
            {plan.targetCalories && <MetaBadge icon="flame-outline" label={`~${plan.targetCalories} kcal`} />}
          </View>
        </View>

        {/* Exercise List */}
        <Text style={styles.sectionTitle}>Esercizi</Text>
        {plan.exercises.map((ex, i) => (
          <GritCard key={ex.id} style={styles.exerciseRow}>
            <View style={styles.exerciseIndex}>
              <Text style={styles.indexText}>{i + 1}</Text>
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseMeta}>
                {ex.sets} serie × {ex.reps} rep
                {ex.weight ? ` · ${ex.weight} kg` : ''}
                {' · '}{ex.restSeconds}s riposo
              </Text>
            </View>
          </GritCard>
        ))}

        <GritButton
          label="Inizia allenamento 🚀"
          onPress={handleStart}
          loading={isLoading}
          size="lg"
          style={styles.startBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={mbStyles.badge}>
      <Ionicons name={icon as React.ComponentProps<typeof Ionicons>['name']} size={14} color={colors.textMuted} />
      <Text style={mbStyles.label}>{label}</Text>
    </View>
  );
}

const mbStyles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.full },
  label: { ...typography.caption, color: colors.textSecondary },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  headerTitle: { ...typography.heading3, color: colors.text },
  planInfo: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  planType: { ...typography.caption, color: colors.primary, fontWeight: '700', marginBottom: spacing.xs },
  planName: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  planMeta: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  sectionTitle: { ...typography.heading3, color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.md },
  exerciseIndex: { width: 28, height: 28, borderRadius: radii.full, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  indexText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  exerciseInfo: { flex: 1 },
  exerciseName: { ...typography.bodyMedium, color: colors.text },
  exerciseMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  startBtn: { marginHorizontal: spacing.lg, marginTop: spacing.xl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { ...typography.heading3, color: colors.textSecondary },
});
