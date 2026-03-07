import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { Colors } from '../constants/colors';
import { StreamSource, StreamPlatform } from '../types';

interface AddStreamSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (source: Omit<StreamSource, 'id' | 'liveStreamId' | 'createdAt'>) => void;
}

const platformOptions = [
  { label: 'YouTube', value: 'youtube' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Twitch', value: 'twitch' },
  { label: 'Custom RTMP', value: 'rtmp' },
  { label: 'Other', value: 'custom' },
];

export const AddStreamSourceModal: React.FC<AddStreamSourceModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [platform, setPlatform] = useState<StreamPlatform>('youtube');
  const [platformName, setPlatformName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const resetForm = () => {
    setPlatform('youtube');
    setPlatformName('');
    setStreamUrl('');
    setStreamKey('');
    setEmbedCode('');
    setIsPrimary(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAdd = () => {
    if (!streamUrl.trim()) {
      Alert.alert('Error', 'Stream URL is required');
      return;
    }

    const newSource: Omit<StreamSource, 'id' | 'liveStreamId' | 'createdAt'> = {
      platform,
      platformName: platformName.trim() || undefined,
      streamUrl: streamUrl.trim(),
      streamKey: streamKey.trim() || undefined,
      embedCode: embedCode.trim() || undefined,
      isPrimary,
      isActive: false,
      viewerCount: 0,
    };

    onAdd(newSource);
    resetForm();
  };

  const getPlaceholderUrl = (platform: StreamPlatform): string => {
    switch (platform) {
      case 'youtube':
        return 'https://youtube.com/watch?v=...';
      case 'facebook':
        return 'https://facebook.com/live/...';
      case 'instagram':
        return 'https://instagram.com/live/...';
      case 'tiktok':
        return 'https://tiktok.com/@username/live';
      case 'twitch':
        return 'https://twitch.tv/username';
      case 'rtmp':
        return 'rtmp://server.com/live/streamkey';
      default:
        return 'https://example.com/stream';
    }
  };

  const showStreamKey = platform === 'rtmp' || platform === 'custom';
  const showEmbedCode = ['youtube', 'facebook', 'instagram'].includes(platform);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Stream Source</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Select
            label="Platform"
            value={platform}
            options={platformOptions}
            onValueChange={(value) => setPlatform(value as StreamPlatform)}
            placeholder="Select streaming platform"
          />

          <Input
            label="Platform Name (Optional)"
            value={platformName}
            onChangeText={setPlatformName}
            placeholder="e.g., Main YouTube Channel"
          />

          <Input
            label="Stream URL"
            value={streamUrl}
            onChangeText={setStreamUrl}
            placeholder={getPlaceholderUrl(platform)}
            autoCapitalize="none"
          />

          {showStreamKey && (
            <Input
              label="Stream Key"
              value={streamKey}
              onChangeText={setStreamKey}
              placeholder="Enter your stream key"
              secureTextEntry
            />
          )}

          {showEmbedCode && (
            <Input
              label="Embed Code (Optional)"
              value={embedCode}
              onChangeText={setEmbedCode}
              placeholder="<iframe src=..."
              multiline
              numberOfLines={3}
            />
          )}

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsPrimary(!isPrimary)}
          >
            <View style={[styles.checkbox, isPrimary && styles.checkboxChecked]}>
              {isPrimary && (
                <Ionicons name="checkmark" size={16} color={Colors.white} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Set as primary stream</Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            The primary stream will be displayed prominently and used as the default for sharing.
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={handleClose}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            title="Add Source"
            onPress={handleAdd}
            style={styles.footerButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  helpText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});