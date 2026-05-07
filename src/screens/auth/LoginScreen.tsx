import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../../stores/authStore';
import { AuthStackParamList } from '../../types';
import { colors, spacing, typography, radii } from '../../constants/theme';
import GritButton from '../../components/ui/GritButton';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    clearError();
    try {
      await login({ email: email.trim(), password });
    } catch {
      // Error shown via store state
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>GRIT</Text>
            <Text style={styles.tagline}>Il tuo personal trainer AI</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Accedi</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <GritButton
              label="Accedi"
              onPress={handleLogin}
              loading={isLoading}
              disabled={!email || !password}
              size="lg"
              style={styles.cta}
            />

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.switchLink}>
              <Text style={styles.switchText}>
                Non hai un account? <Text style={styles.switchHighlight}>Registrati</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 8,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    flex: 1,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.error,
    ...typography.bodySmall,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    fontSize: 16,
  },
  cta: { marginTop: spacing.lg },
  switchLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  switchText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  switchHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
});
