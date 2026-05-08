import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../stores/authStore';
import { AuthStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const GREEN = '#00FF87';
const TEAL = '#00D4A0';
const SURFACE = '#0C0C0C';
const SUB = '#555555';
const BORDER = 'rgba(255,255,255,0.06)';
const BORDER_FOCUS = 'rgba(0,255,135,0.5)';

type FieldDef = {
  key: string; label: string; placeholder: string; icon: string;
  keyboardType: 'default' | 'email-address'; autoCapitalize: 'none' | 'words'; secure: boolean;
};

const FIELDS: FieldDef[] = [
  { key: 'name', label: 'Nome', placeholder: 'Il tuo nome', icon: 'person-outline', keyboardType: 'default', autoCapitalize: 'words', secure: false },
  { key: 'email', label: 'Email', placeholder: 'tu@email.com', icon: 'mail-outline', keyboardType: 'email-address', autoCapitalize: 'none', secure: false },
  { key: 'password', label: 'Password', placeholder: '••••••••', icon: 'lock-closed-outline', keyboardType: 'default', autoCapitalize: 'none', secure: true },
  { key: 'confirm', label: 'Conferma password', placeholder: '••••••••', icon: 'shield-checkmark-outline', keyboardType: 'default', autoCapitalize: 'none', secure: true },
];

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [validationError, setValidationError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const setValue = (key: string, val: string) => setValues((v) => ({ ...v, [key]: val }));

  const handleRegister = async () => {
    clearError(); setValidationError('');
    if (values.password !== values.confirm) { setValidationError('Le password non coincidono.'); return; }
    if (values.password.length < 8) { setValidationError('La password deve avere almeno 8 caratteri.'); return; }
    try { await register({ name: values.name.trim(), email: values.email.trim(), password: values.password }); } catch {}
  };

  const displayError = validationError || error;
  const canSubmit = values.name && values.email && values.password && values.confirm && !isLoading;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 4, gap: 6 }}>
              <Ionicons name="chevron-back" size={20} color={GREEN} />
              <Text style={{ color: GREEN, fontSize: 14, fontWeight: '600' }}>Indietro</Text>
            </TouchableOpacity>

            <View style={{ paddingTop: 32, paddingBottom: 32 }}>
              <Text style={{ fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 6 }}>Crea account</Text>
              <Text style={{ fontSize: 15, color: SUB }}>
                Inizia il tuo percorso con{' '}<Text style={{ color: GREEN, fontWeight: '700' }}>Grit</Text>.
              </Text>
            </View>

            <View style={{ backgroundColor: SURFACE, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: BORDER }}>
              {displayError ? (
                <View style={{ backgroundColor: 'rgba(239,83,80,0.1)', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239,83,80,0.25)', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="alert-circle-outline" size={16} color="#EF5350" />
                  <Text style={{ color: '#EF5350', fontSize: 13, flex: 1 }}>{displayError}</Text>
                </View>
              ) : null}

              {FIELDS.map((field, idx) => (
                <View key={field.key} style={{ marginBottom: idx < FIELDS.length - 1 ? 16 : 32 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: SUB, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>{field.label}</Text>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A',
                    borderRadius: 14, borderWidth: 1,
                    borderColor: focused === field.key ? BORDER_FOCUS : BORDER,
                    paddingHorizontal: 16,
                    shadowColor: focused === field.key ? GREEN : 'transparent',
                    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10,
                  }}>
                    <Ionicons name={field.icon as any} size={18} color={focused === field.key ? GREEN : '#333'} />
                    <TextInput
                      style={{ flex: 1, color: '#fff', fontSize: 16, paddingVertical: 16, paddingHorizontal: 12 }}
                      value={values[field.key as keyof typeof values]}
                      onChangeText={(v) => setValue(field.key, v)}
                      placeholder={field.placeholder} placeholderTextColor="#2a2a2a"
                      keyboardType={field.keyboardType} autoCapitalize={field.autoCapitalize}
                      autoCorrect={false} secureTextEntry={field.secure}
                      returnKeyType={idx < FIELDS.length - 1 ? 'next' : 'done'}
                      onSubmitEditing={idx === FIELDS.length - 1 ? handleRegister : undefined}
                      onFocus={() => setFocused(field.key)} onBlur={() => setFocused(null)}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity onPress={handleRegister} disabled={!canSubmit} activeOpacity={0.85} style={{ opacity: canSubmit ? 1 : 0.4 }}>
                <LinearGradient
                  colors={[GREEN, TEAL]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
                >
                  {isLoading
                    ? <ActivityIndicator color="#000" size="small" />
                    : <Text style={{ fontSize: 15, fontWeight: '900', color: '#000', letterSpacing: 2 }}>CREA ACCOUNT</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center', marginTop: 28, paddingVertical: 8 }}>
              <Text style={{ fontSize: 14, color: SUB }}>
                Hai già un account?{' '}<Text style={{ color: GREEN, fontWeight: '700' }}>Accedi</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
