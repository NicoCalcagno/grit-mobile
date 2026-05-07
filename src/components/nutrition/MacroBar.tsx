import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, spacing, typography, radii } from '../../constants/theme';

interface Props {
  label: string;
  current: number;
  target: number;
  color: string;
  unit?: string;
}

export default function MacroBar({ label, current, target, color, unit = 'g' }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(target > 0 ? Math.min(current / target, 1) : 0, { duration: 700 });
  }, [current, target]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const pct = target > 0 ? Math.round((current / target) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          <Text style={[styles.current, { color }]}>{Math.round(current)}</Text>
          <Text style={styles.separator}> / {Math.round(target)}{unit}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, barStyle]} />
      </View>
      <Text style={[styles.pct, { color }]}>{pct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  label: { ...typography.bodySmall, color: colors.textSecondary },
  values: { ...typography.bodySmall },
  current: { fontWeight: '600' },
  separator: { color: colors.textMuted },
  track: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.full },
  pct: { ...typography.caption, textAlign: 'right', marginTop: 2 },
});
