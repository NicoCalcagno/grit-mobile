import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingStackParamList, CoachLanguage, CoachTone } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import GritButton from '../../components/ui/GritButton';
import { useUserStore } from '../../stores/userStore';
import { useWorkoutStore } from '../../stores/workoutStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CoachPrefs'>;

const LANGUAGES: { value: CoachLanguage; label: string; flag: string }[] = [
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
];

const TONES: { value: CoachTone; label: string; description: string; icon: string }[] = [
  { value: 'aggressive', label: 'Aggressivo', description: 'Duro, diretto, no excuses', icon: '🔥' },
  { value: 'motivating', label: 'Motivante', description: 'Energico, incoraggiante', icon: '😄' },
  { value: 'zen', label: 'Zen', description: 'Calmo, mindful, equilibrato', icon: '🧘' },
];

export default function CoachPrefsScreen() {
  const navigation = useNavigation<Nav>();
  const { updateProfile } = useUserStore();
  const { generateWeeklyPlan } = useWorkoutStore();

  const [language, setLanguage] = useState<CoachLanguage>('it');
  const [tone, setTone] = useState<CoachTone>('motivating');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateProfile({
        coach_language: language,
        coach_tone: tone,
        onboarding_completed: true,
      });
      await generateWeeklyPlan();
      // AppNavigator detects onboarding_completed=true and navigates to Main
    } catch {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <ProgressBar current={4} total={4} />
        <Text style={styles.title}>Il tuo coach AI</Text>
        <Text style={styles.subtitle}>Come vuoi che ti alleni?</Text>

        <Text style={styles.sectionLabel}>Lingua del coach</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map(({ value, label, flag }) => (
            <TouchableOpacity
              key={value}
              style={[styles.langBtn, language === value && styles.langBtnActive]}
              onPress={() => setLanguage(value)}
            >
              <Text style={styles.flag}>{flag}</Text>
              <Text style={[styles.langLabel, language === value && styles.langLabelActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Tono del coaching</Text>
        <View style={styles.tones}>
          {TONES.map(({ value, label, description, icon }) => (
            <TouchableOpacity
              key={value}
              style={[styles.toneCard, tone === value && styles.toneCardActive]}
              onPress={() => setTone(value)}
              activeOpacity={0.8}
            >
              <Text style={styles.toneIcon}>{icon}</Text>
              <View style={styles.toneText}>
                <Text style={[styles.toneLabel, tone === value && styles.toneLabelActive]}>{label}</Text>
                <Text style={styles.toneDesc}>{description}</Text>
              </View>
              {tone === value && <Text style={styles.selectedMark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.ready}>
          <Text style={styles.readyTitle}>Sei pronto? 🚀</Text>
          <Text style={styles.readyBody}>
            Genereremo il tuo primo piano di allenamento personalizzato.
          </Text>
        </View>

        <GritButton
          label="Genera il mio piano"
          onPress={handleFinish}
          loading={loading}
          size="lg"
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={pbS.container}>
      <View style={pbS.track}>
        <View style={[pbS.fill, { width: `${(current / total) * 100}%` }]} />
      </View>
      <Text style={pbS.label}>{current} / {total}</Text>
    </View>
  );
}

const pbS = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  track: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: radii.full },
  label: { ...typography.caption, color: colors.textMuted },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.lg },
  title: { ...typography.heading2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  sectionLabel: { ...typography.bodyMedium, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },
  langRow: { flexDirection: 'row', gap: spacing.sm },
  langBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.sm + 4, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  langBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  flag: { fontSize: 22 },
  langLabel: { ...typography.bodyMedium, color: colors.textSecondary },
  langLabelActive: { color: colors.primary },
  tones: { gap: spacing.sm },
  toneCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  toneCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  toneIcon: { fontSize: 28 },
  toneText: { flex: 1 },
  toneLabel: { ...typography.bodyMedium, color: colors.text },
  toneLabelActive: { color: colors.primary },
  toneDesc: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  selectedMark: { color: colors.primary, fontWeight: '700', fontSize: 18 },
  ready: { backgroundColor: colors.primaryMuted, borderRadius: radii.lg, padding: spacing.md, marginTop: spacing.xl, marginBottom: spacing.lg },
  readyTitle: { ...typography.bodyMedium, color: colors.primary, marginBottom: spacing.xs },
  readyBody: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  cta: {},
});
