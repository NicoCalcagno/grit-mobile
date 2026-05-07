import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { FoodSearchResult, MealType, LogFoodRequest } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import { useNutritionStore } from '../../stores/nutritionStore';
import GritButton from '../../components/ui/GritButton';
import GritCard from '../../components/ui/GritCard';

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: '☀️ Colazione' },
  { value: 'lunch', label: '🥗 Pranzo' },
  { value: 'dinner', label: '🌙 Cena' },
  { value: 'snack', label: '🍎 Snack' },
];

export default function FoodSearchScreen() {
  const navigation = useNavigation();
  const { searchFood, searchResults, logFood, isSearching, clearSearch } = useNutritionStore();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<FoodSearchResult | null>(null);
  const [meal, setMeal] = useState<MealType>('lunch');
  const [quantity, setQuantity] = useState('100');
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { clearSearch(); return; }
    debounceRef.current = setTimeout(() => searchFood(query), 500);
  }, [query]);

  useEffect(() => () => { clearSearch(); }, []);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const grams = parseFloat(quantity) || 100;
    const factor = grams / 100;
    const req: LogFoodRequest = {
      meal_type: meal,
      food_name: selected.name,
      quantity_grams: grams,
      calories: selected.calories_per_100g * factor,
      protein_g: selected.protein_per_100g * factor,
      carbs_g: selected.carbs_per_100g * factor,
      fat_g: selected.fat_per_100g * factor,
      source: selected.barcode ? 'barcode' : 'manual',
      barcode: selected.barcode,
    };
    try {
      await logFood(req);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Cerca alimento…"
              placeholderTextColor={colors.textMuted}
              autoFocus
              returnKeyType="search"
            />
            {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
          </View>
        </View>

        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.barcode ?? item.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.resultItem, selected?.name === item.name && styles.resultItemActive]}
              onPress={() => setSelected(item)}
            >
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                {item.brand && <Text style={styles.resultBrand}>{item.brand}</Text>}
                <Text style={styles.resultMacros}>
                  P {item.protein_per_100g}g · C {item.carbs_per_100g}g · G {item.fat_per_100g}g per 100g
                </Text>
              </View>
              <Text style={styles.resultCal}>{item.calories_per_100g} kcal</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            query.length >= 2 && !isSearching ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Nessun risultato per "{query}"</Text>
              </View>
            ) : null
          }
        />

        {selected && (
          <GritCard style={styles.logPanel} elevated>
            <Text style={styles.logFood} numberOfLines={1}>{selected.name}</Text>
            <View style={styles.logRow}>
              <View style={styles.quantityField}>
                <Text style={styles.fieldLabel}>Grammi</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
              </View>
              <View style={styles.mealField}>
                <Text style={styles.fieldLabel}>Pasto</Text>
                <View style={styles.mealPicker}>
                  {MEAL_OPTIONS.map(({ value, label }) => (
                    <TouchableOpacity
                      key={value}
                      style={[styles.mealOption, meal === value && styles.mealOptionActive]}
                      onPress={() => setMeal(value)}
                    >
                      <Text style={[styles.mealLabel, meal === value && styles.mealLabelActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <GritButton label="Aggiungi al diario" onPress={handleSave} loading={saving} size="md" />
          </GritCard>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 200 },
  resultItem: { paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultItemActive: { opacity: 0.7 },
  resultInfo: { flex: 1 },
  resultName: { ...typography.bodyMedium, color: colors.text },
  resultBrand: { ...typography.caption, color: colors.primary, marginTop: 1 },
  resultMacros: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  resultCal: { ...typography.bodyMedium, color: colors.text, fontFamily: 'Courier' },
  separator: { height: 1, backgroundColor: colors.border },
  empty: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyText: { ...typography.body, color: colors.textMuted },
  logPanel: { margin: spacing.md },
  logFood: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
  logRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  quantityField: { flex: 1 },
  mealField: { flex: 2 },
  fieldLabel: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  quantityInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text, fontSize: 16, textAlign: 'center' },
  mealPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  mealOption: { paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radii.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  mealOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  mealLabel: { ...typography.caption, color: colors.textSecondary },
  mealLabelActive: { color: colors.primary },
});
