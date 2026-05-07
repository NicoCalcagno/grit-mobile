import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingStackParamList, FitnessLevel, WorkoutType, DayName } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import GritButton from '../../components/ui/GritButton';
import { useUserStore } from '../../stores/userStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'FitnessLevel'>;

const LEVELS: { value: FitnessLevel; label: string; description: string; icon: string }[] = [
  { value: 'beginner', label: 'Principiante', description: 'Meno di 6 mesi di allenamento regolare', icon: '🌱' },
  { value: 'intermediate', label: 'Intermedio', description: '6 mesi – 2 anni di allenamento', icon: '⚡' },
  { value: 'advanced', label: 'Avanzato', description: 'Più di 2 anni con tecnica solida', icon: '🔥' },
];

const WORKOUT_TYPES: { value: WorkoutType; label: string; icon: string }[] = [
  { value: 'strength', label: 'Forza', icon: '🏋️' },
  { value: 'cardio', label: 'Cardio', icon: '🏃' },
  { value: 'hiit', label: 'HIIT', icon: '⚡' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
  { value: 'pilates', label: 'Pilates', icon: '🤸' },
  { value: 'stretching', label: 'Stretching', icon: '🙆' },
];

const DAYS: { value: DayName; label: string; short: string }[] = [
  { value: 'monday', label: 'Lunedì', short: 'Lun' },
  { value: 'tuesday', label: 'Martedì', short: 'Mar' },
  { value: 'wednesday', label: 'Mercoledì', short: 'Mer' },
  { value: 'thursday', label: 'Giovedì', short: 'Gio' },
  { value: 'friday', label: 'Venerdì', short: 'Ven' },
  { value: 'saturday', label: 'Sabato', short: 'Sab' },
  { value: 'sunday', label: 'Domenica', short: 'Dom' },
];

export default function FitnessLevelScreen() {
  const navigation = useNavigation<Nav>();
  const { updateProfile } = useUserStore();

  const [level, setLevel] = useState<FitnessLevel | null>(null);
  const [selectedDays, setSelectedDays] = useState<DayName[]>(['monday', 'wednesday', 'friday']);
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: DayName) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleType = (type: WorkoutType) => {
    setWorkoutTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleNext = async () => {
    if (!level) return;
    setLoading(true);
    try {
      await updateProfile({
        fitness_level: level,
        available_days: selectedDays,
        preferred_workouts: workoutTypes,
      });
      navigation.navigate('CoachPrefs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <ProgressBar current={3} total={4} />
        <Text style={styles.title}>Il tuo livello</Text>
        <Text style={styles.subtitle}>Calibriamo l'intensità giusta per te.</Text>

        <Text style={styles.sectionLabel}>Livello di fitness</Text>
        <View style={styles.levels}>
          {LEVELS.map(({ value, label, description, icon }) => (
            <TouchableOpacity
              key={value}
              style={[styles.levelCard, level === value && styles.levelCardActive]}
              onPress={() => setLevel(value)}
              activeOpacity={0.8}
            >
              <Text style={styles.levelIcon}>{icon}</Text>
              <View style={styles.levelText}>
                <Text style={[styles.levelLabel, level === value && styles.levelLabelActive]}>{label}</Text>
                <Text style={styles.levelDesc}>{description}</Text>
              </View>
              {level === value && <Text style={styles.selectedMark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Giorni disponibili</Text>
        <View style={styles.daysRow}>
          {DAYS.map(({ value, short }) => (
            <TouchableOpacity
              key={value}
              style={[styles.dayBtn, selectedDays.includes(value) && styles.dayBtnActive]}
              onPress={() => toggleDay(value)}
            >
              <Text style={[styles.dayLabel, selectedDays.includes(value) && styles.dayLabelActive]}>
                {short}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Tipi di allenamento preferiti</Text>
        <View style={styles.typesGrid}>
          {WORKOUT_TYPES.map(({ value, label, icon }) => (
            <TouchableOpacity
              key={value}
              style={[styles.typeBtn, workoutTypes.includes(value) && styles.typeBtnActive]}
              onPress={() => toggleType(value)}
            >
              <Text style={styles.typeIcon}>{icon}</Text>
              <Text style={[styles.typeLabel, workoutTypes.includes(value) && styles.typeLabelActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <GritButton
          label={`Continua (${selectedDays.length} giorni)`}
          onPress={handleNext}
          loading={loading}
          disabled={!level || selectedDays.length === 0}
          size="lg"
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={pbS.container}>
      <View style={pbS.track}>
        <View style={[pbS.fill, { width: `${(current / total) * 100}%` }]} />
      </View>
      <Text style={pbS.label}>{current} / {total}</Text>
    </View>
  );
}

const pbS = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  track: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: radii.full },
  label: { ...typography.caption, color: colors.textMuted },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.lg },
  title: { ...typography.heading2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  sectionLabel: { ...typography.bodyMedium, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },
  levels: { gap: spacing.sm },
  levelCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  levelCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  levelIcon: { fontSize: 24 },
  levelText: { flex: 1 },
  levelLabel: { ...typography.bodyMedium, color: colors.text },
  levelLabelActive: { color: colors.primary },
  levelDesc: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  selectedMark: { color: colors.primary, fontWeight: '700', fontSize: 18 },
  daysRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  dayBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radii.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minWidth: 44, alignItems: 'center' },
  dayBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  dayLabel: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  dayLabelActive: { color: colors.white },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  typeIcon: { fontSize: 16 },
  typeLabel: { ...typography.bodySmall, color: colors.textSecondary },
  typeLabelActive: { color: colors.primary },
  cta: { marginTop: spacing.lg },
});
