import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, radii, shadows } from '../../constants/theme';
import GritCard from '../../components/ui/GritCard';

type Nav = NativeStackNavigationProp<any>;

const MODES = [
  { key: 'photo', label: 'Foto piatto', description: 'Scatta una foto e l\'AI riconosce gli alimenti', icon: '📸', screen: 'PhotoFood' },
  { key: 'barcode', label: 'Barcode', description: 'Scansiona il codice a barre del prodotto', icon: '🔍', screen: 'BarcodeScanner' },
  { key: 'search', label: 'Ricerca manuale', description: 'Cerca l\'alimento per nome', icon: '🔎', screen: 'FoodSearch' },
];

export default function FoodLogScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-down" size={28} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Aggiungi alimento</Text>
          <View style={{ width: 28 }} />
        </View>

        <Text style={styles.subtitle}>Come vuoi inserire l'alimento?</Text>

        <View style={styles.modes}>
          {MODES.map(({ key, label, description, icon, screen }) => (
            <TouchableOpacity
              key={key}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(screen as never)}
            >
              <GritCard style={styles.modeCard} elevated>
                <Text style={styles.modeIcon}>{icon}</Text>
                <View style={styles.modeInfo}>
                  <Text style={styles.modeLabel}>{label}</Text>
                  <Text style={styles.modeDesc}>{description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </GritCard>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  title: { ...typography.heading3, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  modes: { gap: spacing.md },
  modeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  modeIcon: { fontSize: 32 },
  modeInfo: { flex: 1 },
  modeLabel: { ...typography.bodyMedium, color: colors.text },
  modeDesc: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
