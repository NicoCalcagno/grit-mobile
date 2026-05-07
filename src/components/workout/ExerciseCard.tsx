import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Exercise } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import GritCard from '../ui/GritCard';

interface Props {
  exercise: Exercise;
  currentSet: number;
  isActive?: boolean;
}

export default function ExerciseCard({ exercise, currentSet, isActive = false }: Props) {
  return (
    <GritCard style={[styles.card, isActive && styles.cardActive]} elevated={isActive}>
      <View style={styles.header}>
        <View>
          <Text style={styles.muscleGroup}>{exercise.muscleGroup.toUpperCase()}</Text>
          <Text style={styles.name}>{exercise.name}</Text>
        </View>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>IN CORSO</Text>
          </View>
        )}
      </View>

      <View style={styles.stats}>
        <Stat label="Serie" value={`${currentSet} / ${exercise.sets}`} highlight={isActive} />
        <Stat label="Reps" value={`${exercise.reps}`} />
        {exercise.weight ? <Stat label="Peso" value={`${exercise.weight} kg`} /> : null}
        <Stat label="Riposo" value={`${exercise.restSeconds}s`} />
      </View>

      {exercise.notes ? <Text style={styles.notes}>{exercise.notes}</Text> : null}
    </GritCard>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={statStyles.container}>
      <Text style={[statStyles.value, highlight && statStyles.valueHighlight]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  container: { alignItems: 'center' },
  value: { fontSize: 20, fontWeight: '700', color: colors.text, fontFamily: 'Courier' },
  valueHighlight: { color: colors.primary },
  label: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  cardActive: { borderWidth: 1, borderColor: colors.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  muscleGroup: { ...typography.caption, color: colors.primary, fontWeight: '600', marginBottom: 2 },
  name: { ...typography.heading3, color: colors.text },
  activeBadge: { backgroundColor: colors.primary, borderRadius: radii.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  activeBadgeText: { ...typography.caption, color: colors.white, fontWeight: '700' },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  notes: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },
});
