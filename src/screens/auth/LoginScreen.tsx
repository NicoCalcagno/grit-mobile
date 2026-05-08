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

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const GREEN = '#00FF87';
const TEAL = '#00D4A0';
const SURFACE = '#0C0C0C';
const SUB = '#555555';
const BORDER = 'rgba(255,255,255,0.06)';
const BORDER_FOCUS = 'rgba(0,255,135,0.5)';

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async () => {
    clearError();
    try {
      await login({ email: email.trim(), password });
    } catch {}
  };

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Logo ── */}
            <View style={{ alignItems: 'center', paddingTop: 64, paddingBottom: 56 }}>
              <LinearGradient
                colors={[GREEN, TEAL]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12, padding: 1.5 }}
              >
                <View style={{ backgroundColor: '#050505', borderRadius: 11, paddingHorizontal: 28, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 52, fontWeight: '900', color: '#fff', letterSpacing: 12 }}>
                    GRIT
                  </Text>
                </View>
              </LinearGradient>
              <Text style={{ fontSize: 11, color: SUB, letterSpacing: 3, marginTop: 16, textTransform: 'uppercase' }}>
                Il tuo personal trainer AI
              </Text>
            </View>

            {/* ── Form ── */}
            <View style={{ backgroundColor: SURFACE, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: BORDER }}>
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 6, letterSpacing: -0.5 }}>
                Accedi
              </Text>
              <Text style={{ fontSize: 14, color: SUB, marginBottom: 28 }}>
                Bentornato. Pronti a sudare?
              </Text>

              {error ? (
                <View style={{
                  backgroundColor: 'rgba(239,83,80,0.1)', borderRadius: 10,
                  padding: 12, marginBottom: 20, borderWidth: 1,
                  borderColor: 'rgba(239,83,80,0.25)', flexDirection: 'row', alignItems: 'center', gap: 8,
                }}>
                  <Ionicons name="alert-circle-outline" size={16} color="#EF5350" />
                  <Text style={{ color: '#EF5350', fontSize: 13, flex: 1 }}>{error}</Text>
                </View>
              ) : null}

              {/* Email */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: SUB, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
                  Email
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#0A0A0A', borderRadius: 14, borderWidth: 1,
                  borderColor: focused === 'email' ? BORDER_FOCUS : BORDER,
                  paddingHorizontal: 16,
                  shadowColor: focused === 'email' ? GREEN : 'transparent',
                  shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10,
                }}>
                  <Ionicons name="mail-outline" size={18} color={focused === 'email' ? GREEN : '#333'} />
                  <TextInput
                    style={{ flex: 1, color: '#fff', fontSize: 16, paddingVertical: 16, paddingHorizontal: 12 }}
                    value={email} onChangeText={setEmail}
                    placeholder="tu@email.com" placeholderTextColor="#2a2a2a"
                    keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                    returnKeyType="next"
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: SUB, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
                  Password
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#0A0A0A', borderRadius: 14, borderWidth: 1,
                  borderColor: focused === 'password' ? BORDER_FOCUS : BORDER,
                  paddingHorizontal: 16,
                  shadowColor: focused === 'password' ? GREEN : 'transparent',
                  shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10,
                }}>
                  <Ionicons name="lock-closed-outline" size={18} color={focused === 'password' ? GREEN : '#333'} />
                  <TextInput
                    style={{ flex: 1, color: '#fff', fontSize: 16, paddingVertical: 16, paddingHorizontal: 12 }}
                    value={password} onChangeText={setPassword}
                    placeholder="••••••••" placeholderTextColor="#2a2a2a"
                    secureTextEntry returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  />
                </View>
              </View>

              {/* CTA */}
              <TouchableOpacity onPress={handleLogin} disabled={!canSubmit} activeOpacity={0.85} style={{ opacity: canSubmit ? 1 : 0.4 }}>
                <LinearGradient
                  colors={[GREEN, TEAL]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
                >
                  {isLoading
                    ? <ActivityIndicator color="#000" size="small" />
                    : <Text style={{ fontSize: 15, fontWeight: '900', color: '#000', letterSpacing: 2 }}>ACCEDI</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ alignItems: 'center', marginTop: 28, paddingVertical: 8 }}>
              <Text style={{ fontSize: 14, color: SUB }}>
                Non hai un account?{' '}
                <Text style={{ color: GREEN, fontWeight: '700' }}>Registrati</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
