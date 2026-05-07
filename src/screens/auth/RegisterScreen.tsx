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

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleRegister = async () => {
    clearError();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Le password non coincidono.');
      return;
    }
    if (password.length < 8) {
      setValidationError('La password deve avere almeno 8 caratteri.');
      return;
    }

    try {
      await register({ name: name.trim(), email: email.trim(), password });
    } catch {
      // Error shown via store state
    }
  };

  const displayError = validationError || error;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Indietro</Text>
          </TouchableOpacity>

          <View style={styles.form}>
            <Text style={styles.title}>Crea account</Text>
            <Text style={styles.subtitle}>Inizia il tuo percorso con Grit.</Text>

            {displayError ? <Text style={styles.error}>{displayError}</Text> : null}

            {[
              { label: 'Nome', value: name, onChange: setName, placeholder: 'Il tuo nome', type: 'default' as const, secure: false },
              { label: 'Email', value: email, onChange: setEmail, placeholder: 'tu@email.com', type: 'email-address' as const, secure: false },
              { label: 'Password', value: password, onChange: setPassword, placeholder: '••••••••', type: 'default' as const, secure: true },
              { label: 'Conferma password', value: confirmPassword, onChange: setConfirmPassword, placeholder: '••••••••', type: 'default' as const, secure: true },
            ].map(({ label, value, onChange, placeholder, type, secure }) => (
              <View key={label} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType={type}
                  autoCapitalize={type === 'email-address' ? 'none' : 'words'}
                  autoCorrect={false}
                  secureTextEntry={secure}
                />
              </View>
            ))}

            <GritButton
              label="Crea account"
              onPress={handleRegister}
              loading={isLoading}
              disabled={!name || !email || !password || !confirmPassword}
              size="lg"
              style={styles.cta}
            />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchLink}>
              <Text style={styles.switchText}>
                Hai già un account? <Text style={styles.switchHighlight}>Accedi</Text>
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
  back: { paddingTop: spacing.md, paddingBottom: spacing.sm },
  backText: { color: colors.primary, ...typography.bodyMedium },
  form: {},
  title: { ...typography.heading2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  error: {
    color: colors.error,
    ...typography.bodySmall,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  inputGroup: { marginBottom: spacing.md },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs },
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
  switchLink: { alignItems: 'center', marginTop: spacing.lg },
  switchText: { ...typography.bodySmall, color: colors.textSecondary },
  switchHighlight: { color: colors.primary, fontWeight: '600' },
});
