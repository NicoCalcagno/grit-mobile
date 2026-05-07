import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NutritionInsight, InsightType } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import { useNutritionStore } from '../../stores/nutritionStore';

interface Props {
  insight: NutritionInsight;
}

const TYPE_CONFIG: Record<InsightType, { color: string; bg: string; icon: string }> = {
  warning: { color: colors.warning, bg: 'rgba(255, 152, 0, 0.12)', icon: '⚠️' },
  tip: { color: colors.info, bg: 'rgba(33, 150, 243, 0.12)', icon: '💡' },
  positive: { color: colors.success, bg: 'rgba(76, 175, 80, 0.12)', icon: '✅' },
};

export default function InsightCard({ insight }: Props) {
  const { markInsightRead } = useNutritionStore();
  const config = TYPE_CONFIG[insight.insight_type];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: config.bg, borderColor: config.color }]}
      onPress={() => markInsightRead(insight.id)}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{config.icon}</Text>
      <View style={styles.content}>
        <Text style={[styles.message, { color: config.color }]}>{insight.insight_text}</Text>
      </View>
      {!insight.read && <View style={[styles.dot, { backgroundColor: config.color }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 20 },
  content: { flex: 1 },
  message: { ...typography.bodySmall, lineHeight: 18 },
  dot: { width: 8, height: 8, borderRadius: radii.full, marginTop: 4 },
});
