import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../../constants/theme';

interface Props {
  bpm: number;
}

export default function HeartRateWidget({ bpm }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (bpm <= 0) return;
    const interval = bpm > 0 ? 60000 / bpm : 1000;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 300, easing: Easing.in(Easing.cubic) }),
      ),
      -1,
    );
  }, [bpm]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const zone = getZone(bpm);

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Ionicons name="heart" size={20} color={zone.color} />
      </Animated.View>
      <Text style={[styles.bpm, { color: zone.color }]}>{bpm > 0 ? bpm : '—'}</Text>
      <Text style={styles.unit}>BPM</Text>
    </View>
  );
}

function getZone(bpm: number) {
  if (bpm <= 0) return { color: colors.textMuted };
  if (bpm < 100) return { color: colors.success };
  if (bpm < 140) return { color: colors.warning };
  return { color: colors.error };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bpm: { fontSize: 18, fontWeight: '700', fontFamily: 'Courier' },
  unit: { ...typography.caption, color: colors.textMuted },
});
