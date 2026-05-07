import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';

import { MealType, RecognizedFood, LogFoodRequest } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import { useNutritionStore } from '../../stores/nutritionStore';
import GritButton from '../../components/ui/GritButton';

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: '☀️ Colazione' },
  { value: 'lunch', label: '🥗 Pranzo' },
  { value: 'dinner', label: '🌙 Cena' },
  { value: 'snack', label: '🍎 Snack' },
];

type Step = 'camera' | 'processing' | 'confirm';

export default function PhotoFoodScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const { logPhotoFood, logFood } = useNutritionStore();
  const cameraRef = useRef<CameraView>(null);

  const [step, setStep] = useState<Step>('camera');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<RecognizedFood[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
  const [meal, setMeal] = useState<MealType>('lunch');
  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!permission?.granted) {
    return (
      <View style={styles.permContainer}>
        <Text style={styles.permText}>Accesso alla fotocamera necessario.</Text>
        <GritButton label="Concedi accesso" onPress={requestPermission} />
        <GritButton label="Indietro" onPress={() => navigation.goBack()} variant="ghost" />
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      if (!photo) { setCapturing(false); return; }

      setPhotoUri(photo.uri);
      setStep('processing');

      const compressed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      );

      const result = await logPhotoFood(compressed.base64!, meal);
      setRecognizedItems(result.recognized_foods);
      setSelectedIndexes(new Set(result.recognized_foods.map((_, i) => i)));
      setStep('confirm');
    } catch {
      setStep('camera');
    } finally {
      setCapturing(false);
    }
  };

  const toggleItem = (idx: number) => {
    setSelectedIndexes((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [i, item] of recognizedItems.entries()) {
        if (!selectedIndexes.has(i)) continue;
        const req: LogFoodRequest = {
          meal_type: meal,
          food_name: item.food_name,
          quantity_grams: item.quantity_grams,
          calories: item.calories,
          protein_g: item.protein_g,
          carbs_g: item.carbs_g,
          fat_g: item.fat_g,
          source: 'photo',
        };
        await logFood(req);
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  if (step === 'camera') {
    return (
      <View style={styles.container}>
        <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing="back" />
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraTopBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Foto piatto</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.cameraBottom}>
            {capturing ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : (
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  if (step === 'processing') {
    return (
      <View style={styles.container}>
        {photoUri && <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />}
        <View style={[styles.cameraOverlay, styles.processingOverlay]}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.processingText}>L'AI sta analizzando il piatto…</Text>
        </View>
      </View>
    );
  }

  // confirm
  return (
    <View style={styles.container}>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />}
      <ScrollView style={styles.confirmSheet} contentContainerStyle={styles.confirmContent}>
        <Text style={styles.confirmTitle}>Alimenti riconosciuti</Text>
        <Text style={styles.confirmSub}>Seleziona quelli che vuoi loggare.</Text>

        {recognizedItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.recognizedItem, selectedIndexes.has(i) && styles.recognizedItemActive]}
            onPress={() => toggleItem(i)}
          >
            <View style={[styles.itemCheck, selectedIndexes.has(i) && styles.itemCheckActive]}>
              {selectedIndexes.has(i) && <Ionicons name="checkmark" size={14} color={colors.white} />}
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.food_name}</Text>
              <Text style={styles.itemMeta}>{item.quantity_grams}g · {item.calories} kcal</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.mealLabel}>Pasto</Text>
        <View style={styles.mealRow}>
          {MEAL_OPTIONS.map(({ value, label }) => (
            <TouchableOpacity
              key={value}
              style={[styles.mealBtn, meal === value && styles.mealBtnActive]}
              onPress={() => setMeal(value)}
            >
              <Text style={[styles.mealText, meal === value && styles.mealTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionRow}>
          <GritButton label="Riprendi" onPress={() => { setStep('camera'); setRecognizedItems([]); }} variant="secondary" style={styles.retakeBtn} />
          <GritButton label={`Salva (${selectedIndexes.size})`} onPress={handleSave} loading={saving} disabled={selectedIndexes.size === 0} style={styles.saveBtn} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  permContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.lg },
  permText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  cameraOverlay: { ...StyleSheet.absoluteFillObject },
  cameraTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, paddingTop: 60 },
  backBtn: { width: 40, height: 40, borderRadius: radii.full, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  cameraTitle: { ...typography.bodyMedium, color: colors.white },
  cameraBottom: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center' },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  captureBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.white },
  processingOverlay: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: 'rgba(0,0,0,0.6)' },
  processingText: { ...typography.body, color: colors.white },
  photoPreview: { height: 260, width: '100%' },
  confirmSheet: { flex: 1, backgroundColor: colors.background },
  confirmContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  confirmTitle: { ...typography.heading3, color: colors.text, marginBottom: spacing.xs },
  confirmSub: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  recognizedItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  recognizedItemActive: {},
  itemCheck: { width: 22, height: 22, borderRadius: radii.full, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  itemCheckActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  itemInfo: { flex: 1 },
  itemName: { ...typography.bodyMedium, color: colors.text },
  itemMeta: { ...typography.caption, color: colors.textMuted },
  mealLabel: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  mealBtn: { paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radii.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  mealBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  mealText: { ...typography.caption, color: colors.textSecondary },
  mealTextActive: { color: colors.primary },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  retakeBtn: { flex: 1 },
  saveBtn: { flex: 2 },
});
