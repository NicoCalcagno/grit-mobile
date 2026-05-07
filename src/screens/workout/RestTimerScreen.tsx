import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

import { WorkoutStackParamList } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import ProgressRing from '../../components/workout/ProgressRing';
import GritButton from '../../components/ui/GritButton';

type Nav = NativeStackNavigationProp<WorkoutStackParamList, 'RestTimer'>;
type Route = RouteProp<WorkoutStackParamList, 'RestTimer'>;

export default function RestTimerScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { sessionId, restSeconds, nextExercise } = route.params;

  const [remaining, setRemaining] = useState(restSeconds);
  const totalRef = React.useRef(restSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      navigation.goBack();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, navigation]);

  const progress = 1 - remaining / totalRef.current;
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted = `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)}`;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Recupero</Text>

        <ProgressRing progress={progress} size={220} strokeWidth={14} color={colors.primary}>
          <View style={styles.timerContent}>
            <Text style={styles.timerValue}>{formatted}</Text>
            <Text style={styles.timerLabel}>rimanenti</Text>
          </View>
        </ProgressRing>

        {nextExercise && (
          <View style={styles.nextCard}>
            <Text style={styles.nextLabel}>Prossimo esercizio</Text>
            <Text style={styles.nextName}>{nextExercise}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <GritButton
            label="Salta riposo"
            onPress={() => navigation.goBack()}
            variant="secondary"
            size="md"
          />
          <GritButton
            label={`+30s`}
            onPress={() => setRemaining((r) => r + 30)}
            variant="ghost"
            size="md"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.xl },
  title: { ...typography.heading3, color: colors.textSecondary },
  timerContent: { alignItems: 'center' },
  timerValue: { fontSize: 52, fontWeight: '800', color: colors.text, fontFamily: 'Courier' },
  timerLabel: { ...typography.body, color: colors.textMuted },
  nextCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextLabel: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  nextName: { ...typography.heading3, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.md },
});
