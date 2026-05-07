import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusicStore } from '../../stores/musicStore';
import { useSpotifyPlayer } from '../../hooks/useSpotifyPlayer';
import { colors, spacing, typography, radii } from '../../constants/theme';

export default function MiniPlayer() {
  const { currentTrack, isPlaying } = useMusicStore();
  const { togglePlayback, skipTrack } = useSpotifyPlayer();

  if (!currentTrack) return null;

  return (
    <View style={styles.container}>
      {currentTrack.albumArt ? (
        <Image source={{ uri: currentTrack.albumArt }} style={styles.art} />
      ) : (
        <View style={[styles.art, styles.artPlaceholder]}>
          <Ionicons name="musical-notes" size={16} color={colors.textMuted} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentTrack.name}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={togglePlayback} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipTrack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="play-skip-forward" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  art: { width: 40, height: 40, borderRadius: radii.sm },
  artPlaceholder: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { ...typography.bodyMedium, color: colors.text },
  artist: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
