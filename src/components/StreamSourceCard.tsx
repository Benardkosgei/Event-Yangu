import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors } from '../constants/colors';
import { StreamSource, StreamPlatform } from '../types';

interface StreamSourceCardProps {
  source: StreamSource;
  onToggle: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
}

const getPlatformIcon = (platform: StreamPlatform): keyof typeof Ionicons.glyphMap => {
  switch (platform) {
    case 'youtube':
      return 'logo-youtube';
    case 'facebook':
      return 'logo-facebook';
    case 'instagram':
      return 'logo-instagram';
    case 'tiktok':
      return 'logo-tiktok';
    case 'twitch':
      return 'logo-twitch';
    case 'rtmp':
      return 'videocam';
    default:
      return 'globe';
  }
};

const getPlatformColor = (platform: StreamPlatform): string => {
  switch (platform) {
    case 'youtube':
      return '#FF0000';
    case 'facebook':
      return '#1877F2';
    case 'instagram':
      return '#E4405F';
    case 'tiktok':
      return '#000000';
    case 'twitch':
      return '#9146FF';
    case 'rtmp':
      return Colors.primary;
    default:
      return Colors.text.secondary;
  }
};

export const StreamSourceCard: React.FC<StreamSourceCardProps> = ({
  source,
  onToggle,
  onDelete,
  onSetPrimary,
}) => {
  const platformIcon = getPlatformIcon(source.platform);
  const platformColor = getPlatformColor(source.platform);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.platformInfo}>
          <View style={[styles.platformIcon, { backgroundColor: platformColor }]}>
            <Ionicons name={platformIcon} size={20} color={Colors.white} />
          </View>
          <View style={styles.platformDetails}>
            <Text style={styles.platformName}>
              {source.platformName || source.platform.charAt(0).toUpperCase() + source.platform.slice(1)}
            </Text>
            <Text style={styles.platformUrl} numberOfLines={1}>
              {source.streamUrl}
            </Text>
          </View>
        </View>
        
        <View style={styles.badges}>
          {source.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>PRIMARY</Text>
            </View>
          )}
          <View style={[styles.statusBadge, source.isActive ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={[styles.statusBadgeText, source.isActive ? styles.activeText : styles.inactiveText]}>
              {source.isActive ? 'LIVE' : 'OFFLINE'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="eye" size={16} color={Colors.text.secondary} />
          <Text style={styles.statText}>{source.viewerCount} viewers</Text>
        </View>
        {source.streamKey && (
          <View style={styles.stat}>
            <Ionicons name="key" size={16} color={Colors.text.secondary} />
            <Text style={styles.statText}>Stream Key Set</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={onToggle}
        >
          <Ionicons 
            name={source.isActive ? 'pause' : 'play'} 
            size={16} 
            color={Colors.white} 
          />
          <Text style={styles.actionButtonText}>
            {source.isActive ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>

        {!source.isPrimary && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={onSetPrimary}
          >
            <Ionicons name="star" size={16} color={Colors.primary} />
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
              Set Primary
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <Ionicons name="trash" size={16} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  platformDetails: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  platformUrl: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  primaryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  inactiveBadge: {
    backgroundColor: '#FFF2F2',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeText: {
    color: '#2E7D32',
  },
  inactiveText: {
    color: '#D32F2F',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  toggleButton: {
    backgroundColor: Colors.primary,
    flex: 1,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    flex: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.error,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  primaryButtonText: {
    color: Colors.primary,
  },
});