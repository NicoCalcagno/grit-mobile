import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, radii } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useMusicStore } from '../../stores/musicStore';
import { useHealthKit } from '../../hooks/useHealthKit';
import GritCard from '../../components/ui/GritCard';
import GritButton from '../../components/ui/GritButton';
import * as Linking from 'expo-linking';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { isConnected: spotifyConnected, getAuthUrl, disconnect } = useMusicStore();
  const { isAuthorized: hkAuthorized, requestPermissions } = useHealthKit();
  const [disconnectingSpotify, setDisconnectingSpotify] = useState(false);

  const handleSpotifyConnect = async () => {
    try {
      const url = await getAuthUrl();
      await Linking.openURL(url);
    } catch {
      Alert.alert('Errore', 'Impossibile connettersi a Spotify.');
    }
  };

  const handleSpotifyDisconnect = () => {
    Alert.alert('Disconnetti Spotify', 'Sei sicuro di voler disconnettere Spotify?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Disconnetti',
        style: 'destructive',
        onPress: async () => {
          setDisconnectingSpotify(true);
          await disconnect();
          setDisconnectingSpotify(false);
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Vuoi uscire dall\'app?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Esci', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Impostazioni</Text>

        {/* Profile */}
        <SectionHeader label="Profilo" />
        <GritCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? '?'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name ?? '—'}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')}>
              <Ionicons name="pencil-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </GritCard>

        {/* Spotify */}
        <SectionHeader label="Musica" />
        <GritCard style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="musical-notes" size={20} color={spotifyConnected ? '#1DB954' : colors.textMuted} />
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Spotify</Text>
              <Text style={styles.rowSub}>{spotifyConnected ? 'Connesso' : 'Non connesso'}</Text>
            </View>
            {spotifyConnected ? (
              <GritButton
                label="Disconnetti"
                onPress={handleSpotifyDisconnect}
                loading={disconnectingSpotify}
                variant="danger"
                size="sm"
              />
            ) : (
              <GritButton label="Connetti" onPress={handleSpotifyConnect} size="sm" />
            )}
          </View>
        </GritCard>

        {/* HealthKit */}
        <SectionHeader label="Salute" />
        <GritCard style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="heart" size={20} color={hkAuthorized ? colors.error : colors.textMuted} />
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>HealthKit</Text>
              <Text style={styles.rowSub}>{hkAuthorized ? 'Permessi attivi' : 'Permessi non concessi'}</Text>
            </View>
            {!hkAuthorized && (
              <GritButton label="Attiva" onPress={requestPermissions} size="sm" variant="secondary" />
            )}
          </View>
        </GritCard>

        {/* Coach */}
        <SectionHeader label="Coach AI" />
        <GritCard style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="language-outline" size={20} color={colors.textMuted} />
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Lingua</Text>
              <Text style={styles.rowSub}>{user?.coachLanguage === 'en' ? 'English' : 'Italiano'}</Text>
            </View>
          </View>
          <View style={[styles.row, styles.rowBorderTop]}>
            <Ionicons name="mic-outline" size={20} color={colors.textMuted} />
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Tono</Text>
              <Text style={styles.rowSub}>{user?.coachTone ?? '—'}</Text>
            </View>
          </View>
        </GritCard>

        {/* Account */}
        <SectionHeader label="Account" />
        <GritCard style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.rowLabel, styles.dangerText]}>Logout</Text>
          </TouchableOpacity>
        </GritCard>

        <Text style={styles.version}>Grit v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <Text style={secStyles.label}>{label}</Text>;
}

const secStyles = StyleSheet.create({
  label: { ...typography.caption, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: spacing.xxl },
  title: { ...typography.heading2, color: colors.text, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  profileCard: { marginHorizontal: spacing.lg },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: radii.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.white },
  profileInfo: { flex: 1 },
  profileName: { ...typography.bodyMedium, color: colors.text },
  profileEmail: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  card: { marginHorizontal: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  rowBorderTop: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm },
  rowInfo: { flex: 1 },
  rowLabel: { ...typography.bodyMedium, color: colors.text },
  rowSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  dangerText: { color: colors.error },
  version: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
