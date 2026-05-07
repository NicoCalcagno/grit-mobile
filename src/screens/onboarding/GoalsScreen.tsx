import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingStackParamList, FitnessGoal } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import GritButton from '../../components/ui/GritButton';
import { useUserStore } from '../../stores/userStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Goals'>;

const GOALS: { value: FitnessGoal; label: string; icon: string; description: string }[] = [
  { value: 'fat_loss', label: 'Dimagrire', icon: '🔥', description: 'Brucia grasso, definisci il corpo' },
  { value: 'muscle_gain', label: 'Massa muscolare', icon: '💪', description: 'Costruisci forza e volume' },
  { value: 'endurance', label: 'Resistenza', icon: '🏃', description: 'Migliora capacità cardiovascolare' },
  { value: 'wellness', label: 'Benessere', icon: '🌿', description: 'Energia, salute e vitalità' },
  { value: 'flexibility', label: 'Flessibilità', icon: '🧘', description: 'Mobilità e riduzione tensioni' },
];

export default function GoalsScreen() {
  const navigation = useNavigation<Nav>();
  const { updateProfile } = useUserStore();
  const [selected, setSelected] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (goal: FitnessGoal) => {
    setSelected((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleNext = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      await updateProfile({ goals: selected });
      navigation.navigate('FitnessLevel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <ProgressBar current={2} total={4} />
        <Text style={styles.title}>I tuoi obiettivi</Text>
        <Text style={styles.subtitle}>Seleziona tutti quelli che ti riguardano.</Text>

        <View style={styles.grid}>
          {GOALS.map(({ value, label, icon, description }) => {
            const active = selected.includes(value);
            return (
              <TouchableOpacity
                key={value}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => toggle(value)}
                activeOpacity={0.8}
              >
                <Text style={styles.icon}>{icon}</Text>
                <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
                <Text style={styles.description}>{description}</Text>
                {active && <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>}
              </TouchableOpacity>
            );
          })}
        </View>

        <GritButton
          label={`Continua (${selected.length} selezionati)`}
          onPress={handleNext}
          loading={loading}
          disabled={selected.length === 0}
          size="lg"
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={pbStyles.container}>
      <View style={pbStyles.track}>
        <View style={[pbStyles.fill, { width: `${(current / total) * 100}%` }]} />
      </View>
      <Text style={pbStyles.label}>{current} / {total}</Text>
    </View>
  );
}

const pbStyles = StyleSheet.create({
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
  grid: { gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, position: 'relative' },
  cardActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  icon: { fontSize: 28, marginBottom: spacing.xs },
  label: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.xs / 2 },
  labelActive: { color: colors.primary },
  description: { ...typography.bodySmall, color: colors.textSecondary },
  check: { position: 'absolute', top: spacing.md, right: spacing.md, width: 24, height: 24, borderRadius: radii.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  cta: { marginTop: spacing.lg },
});
