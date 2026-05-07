import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../../constants/theme';
import { useVoiceInput } from '../../hooks/useVoiceInput';

interface Props {
  onResponse: (text: string) => void;
  currentExerciseName?: string;
  currentSet?: number;
  heartRate?: number;
  perceivedExertion?: number;
  elapsedMinutes?: number;
}

export default function VoiceInputButton({
  onResponse,
  currentExerciseName,
  currentSet,
  heartRate,
  perceivedExertion,
  elapsedMinutes,
}: Props) {
  const { isRecording, startRecording, stopRecording } = useVoiceInput({
    onResponse,
    currentExerciseName,
    currentSet,
    heartRate,
    perceivedExertion,
    elapsedMinutes,
  });

  const pulse = useSharedValue(1);

  const startPulse = useCallback(() => {
    pulse.value = withRepeat(
      withTiming(1.4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const stopPulse = useCallback(() => {
    pulse.value = withTiming(1);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: isRecording ? 0.3 : 0,
  }));

  const handlePressIn = () => {
    startRecording();
    startPulse();
  };

  const handlePressOut = () => {
    stopRecording();
    stopPulse();
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.pulse, pulseStyle]} />
      <Pressable
        style={[styles.button, isRecording && styles.buttonActive]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Ionicons
          name={isRecording ? 'mic' : 'mic-outline'}
          size={24}
          color={isRecording ? colors.white : colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', width: 56, height: 56 },
  pulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
