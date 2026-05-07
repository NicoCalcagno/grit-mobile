import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingStackParamList } from '../../types';
import { colors, spacing, typography } from '../../constants/theme';
import GritButton from '../../components/ui/GritButton';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.logo}>GRIT</Text>
          <Text style={styles.headline}>Il personal trainer{'\n'}che capisce te.</Text>
          <Text style={styles.body}>
            Piano allenamenti su misura, coaching vocale AI, musica adattiva e nutrizione intelligente.
            Tutto in un'app.
          </Text>
        </View>

        <View style={styles.features}>
          {[
            { icon: '🏋️', label: 'Allenamenti AI personalizzati' },
            { icon: '🎤', label: 'Coach vocale in tempo reale' },
            { icon: '🥗', label: 'Nutrizione e piani dieta' },
            { icon: '🎵', label: 'Musica adattiva per fase' },
          ].map(({ icon, label }) => (
            <View key={label} style={styles.feature}>
              <Text style={styles.featureIcon}>{icon}</Text>
              <Text style={styles.featureLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <GritButton
          label="Inizia il percorso"
          onPress={() => navigation.navigate('ProfileSetup')}
          size="lg"
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 6,
    marginBottom: spacing.xl,
  },
  headline: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 48,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  features: {
    gap: spacing.sm,
    marginVertical: spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  featureIcon: { fontSize: 24 },
  featureLabel: { ...typography.bodyMedium, color: colors.text },
  cta: {},
});
