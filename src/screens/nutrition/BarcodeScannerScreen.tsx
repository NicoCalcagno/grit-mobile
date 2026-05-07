import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
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

export default function BarcodeScannerScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const { getFoodByBarcode, logFood } = useNutritionStore();

  const [scanned, setScanned] = useState(false);
  const [food, setFood] = useState<FoodSearchResult | null>(null);
  const [meal, setMeal] = useState<MealType>('lunch');
  const [quantity, setQuantity] = useState('100');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Accesso alla fotocamera necessario per scansionare il barcode.</Text>
        <GritButton label="Concedi accesso" onPress={requestPermission} />
        <GritButton label="Indietro" onPress={() => navigation.goBack()} variant="ghost" />
      </View>
    );
  }

  const handleBarcode = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    setError('');
    try {
      const result = await getFoodByBarcode(data);
      setFood(result);
    } catch {
      setError(`Prodotto non trovato per barcode: ${data}`);
      setTimeout(() => setScanned(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!food) return;
    setSaving(true);
    const grams = parseFloat(quantity) || 100;
    const factor = grams / 100;
    const req: LogFoodRequest = {
      meal_type: meal,
      food_name: food.name,
      quantity_grams: grams,
      calories: food.calories_per_100g * factor,
      protein_g: food.protein_per_100g * factor,
      carbs_g: food.carbs_per_100g * factor,
      fat_g: food.fat_per_100g * factor,
      source: 'barcode',
      barcode: food.barcode,
    };
    try {
      await logFood(req);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={handleBarcode}
      />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.scanTitle}>Scansiona barcode</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.scanArea}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanHint}>Inquadra il barcode del prodotto</Text>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {food && (
        <View style={styles.productPanel}>
          <GritCard elevated>
            <Text style={styles.productName}>{food.name}</Text>
            {food.brand && <Text style={styles.productBrand}>{food.brand}</Text>}
            <Text style={styles.productMacros}>
              P {food.protein_per_100g}g · C {food.carbs_per_100g}g · G {food.fat_per_100g}g per 100g
            </Text>
            <View style={styles.logRow}>
              <Text style={styles.fieldLabel}>Grammi</Text>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                selectTextOnFocus
              />
            </View>
            <View style={styles.mealRow}>
              {MEAL_OPTIONS.map(({ value, label }) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.mealBtn, meal === value && styles.mealBtnActive]}
                  onPress={() => setMeal(value)}
                >
                  <Text style={[styles.mealLabel, meal === value && styles.mealLabelActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.actionRow}>
              <GritButton label="Annulla" onPress={() => { setFood(null); setScanned(false); }} variant="secondary" style={styles.cancelBtn} />
              <GritButton label="Aggiungi" onPress={handleSave} loading={saving} style={styles.addBtn} />
            </View>
          </GritCard>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  permissionContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.lg },
  permissionText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, paddingTop: 60 },
  backBtn: { width: 40, height: 40, borderRadius: radii.full, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  scanTitle: { ...typography.bodyMedium, color: colors.white },
  scanArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  scanFrame: { width: 260, height: 160, borderWidth: 2, borderColor: colors.primary, borderRadius: radii.md },
  scanHint: { ...typography.bodySmall, color: 'rgba(255,255,255,0.7)' },
  errorText: { ...typography.body, color: colors.error, textAlign: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  productPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md },
  productName: { ...typography.heading3, color: colors.text, marginBottom: 2 },
  productBrand: { ...typography.caption, color: colors.primary, marginBottom: spacing.sm },
  productMacros: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  logRow: { marginBottom: spacing.md },
  fieldLabel: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  quantityInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text, fontSize: 16 },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  mealBtn: { paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radii.full, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  mealBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  mealLabel: { ...typography.caption, color: colors.textSecondary },
  mealLabelActive: { color: colors.primary },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  cancelBtn: { flex: 1 },
  addBtn: { flex: 2 },
});
