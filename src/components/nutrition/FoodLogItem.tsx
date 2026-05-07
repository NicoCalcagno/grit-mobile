import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FoodLogEntry } from '../../types';
import { colors, spacing, typography } from '../../constants/theme';

interface Props {
  entry: FoodLogEntry;
  onDelete?: (id: string) => void;
}

export default function FoodLogItem({ entry, onDelete }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{entry.food_name}</Text>
        <Text style={styles.meta}>
          {entry.quantity_grams}g · P {Math.round(entry.protein_g)}g · C {Math.round(entry.carbs_g)}g · G {Math.round(entry.fat_g)}g
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.calories}>{Math.round(entry.calories)}</Text>
        <Text style={styles.kcal}>kcal</Text>
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(entry.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  info: { flex: 1 },
  name: { ...typography.bodyMedium, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 2 },
  calories: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Courier' },
  kcal: { ...typography.caption, color: colors.textMuted },
});
