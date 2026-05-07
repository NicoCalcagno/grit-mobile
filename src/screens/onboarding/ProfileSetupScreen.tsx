import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingStackParamList, Gender } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import GritButton from '../../components/ui/GritButton';
import { useUserStore } from '../../stores/userStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ProfileSetup'>;

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Uomo' },
  { value: 'female', label: 'Donna' },
  { value: 'other', label: 'Altro' },
];

export default function ProfileSetupScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, updateProfile } = useUserStore();

  const [name, setName] = useState(profile?.name ?? '');
  const [age, setAge] = useState(profile?.age?.toString() ?? '');
  const [weight, setWeight] = useState(profile?.weight_kg?.toString() ?? '');
  const [height, setHeight] = useState(profile?.height_cm?.toString() ?? '');
  const [gender, setGender] = useState<Gender | null>(profile?.gender ?? null);
  const [loading, setLoading] = useState(false);

  const canContinue = name.trim() && age && weight && height && gender;

  const handleNext = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        age: parseInt(age, 10),
        weight_kg: parseFloat(weight),
        height_cm: parseFloat(height),
        gender: gender!,
      });
      navigation.navigate('Goals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <ProgressBar current={1} total={4} />

          <Text style={styles.title}>Parlami di te</Text>
          <Text style={styles.subtitle}>Personalizziamo il tuo programma.</Text>

          {[
            { label: 'Nome', value: name, onChange: setName, placeholder: 'Il tuo nome', kb: 'default' as const },
            { label: 'Età', value: age, onChange: setAge, placeholder: 'es. 28', kb: 'numeric' as const },
            { label: 'Peso (kg)', value: weight, onChange: setWeight, placeholder: 'es. 75', kb: 'decimal-pad' as const },
            { label: 'Altezza (cm)', value: height, onChange: setHeight, placeholder: 'es. 178', kb: 'numeric' as const },
          ].map(({ label, value, onChange, placeholder, kb }) => (
            <View key={label} style={styles.field}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={kb}
                autoCapitalize={kb === 'default' ? 'words' : 'none'}
              />
            </View>
          ))}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Sesso</Text>
            <View style={styles.genderRow}>
              {GENDERS.map(({ value, label }) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.genderBtn, gender === value && styles.genderBtnActive]}
                  onPress={() => setGender(value)}
                >
                  <Text style={[styles.genderLabel, gender === value && styles.genderLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <GritButton
            label="Continua"
            onPress={handleNext}
            loading={loading}
            disabled={!canContinue}
            size="lg"
            style={styles.cta}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={pbStyles.container}>
      <View style={pbStyles.track}>
        <View style={[pbStyles.fill, { width: `${(current / total) * 100}%` }]} />
      </View>
      <Text style={pbStyles.label}>{current} / {total}</Text>
    </View>
  );
}

const pbStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  track: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: radii.full },
  label: { ...typography.caption, color: colors.textMuted },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.lg },
  title: { ...typography.heading2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  field: { marginBottom: spacing.md },
  fieldLabel: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, color: colors.text, fontSize: 16 },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  genderBtn: { flex: 1, paddingVertical: spacing.sm + 4, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.surface },
  genderBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  genderLabel: { ...typography.bodyMedium, color: colors.textSecondary },
  genderLabelActive: { color: colors.primary },
  cta: { marginTop: spacing.lg },
});
