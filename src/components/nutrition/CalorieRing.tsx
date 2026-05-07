import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressRing from '../workout/ProgressRing';
import { colors, typography } from '../../constants/theme';

interface Props {
  consumed: number;
  target: number;
}

export default function CalorieRing({ consumed, target }: Props) {
  const progress = target > 0 ? consumed / target : 0;
  const remaining = Math.max(target - consumed, 0);

  return (
    <View style={styles.container}>
      <ProgressRing
        progress={progress}
        size={160}
        strokeWidth={12}
        color={progress >= 1 ? colors.success : colors.primary}
      >
        <View style={styles.center}>
          <Text style={styles.value}>{Math.round(consumed)}</Text>
          <Text style={styles.unit}>kcal</Text>
          <Text style={styles.sub}>di {Math.round(target)}</Text>
        </View>
      </ProgressRing>
      <Text style={styles.remaining}>
        {remaining > 0 ? `${Math.round(remaining)} kcal rimanenti` : 'Obiettivo raggiunto! 🎉'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  center: { alignItems: 'center' },
  value: { fontSize: 32, fontWeight: '800', color: colors.text, fontFamily: 'Courier' },
  unit: { ...typography.bodySmall, color: colors.textSecondary },
  sub: { ...typography.caption, color: colors.textMuted },
  remaining: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 12 },
});
