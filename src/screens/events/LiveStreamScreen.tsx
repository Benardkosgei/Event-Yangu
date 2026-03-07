import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StreamSourceCard } from '../../components/StreamSourceCard';
import { AddStreamSourceModal } from '../../components/AddStreamSourceModal';
import { Colors } from '../../constants/colors';
import { StreamSource, StreamPlatform } from '../../types';
import { useLiveStreamStore } from '../../store/liveStreamStore';

type Props = NativeStackScreenProps<EventsStackParamList, 'LiveStream'>;

export const LiveStreamScreen: React.FC<Props> = ({ navigation, route }) => {
  const { eventId } = route.params;
  const [showAddModal, setShowAddModal] = useState(false);
  const { 
    streams, 
    isLoading, 
    loadStreams, 
    addStreamSource, 
    updateStreamSource, 
    deleteStreamSource,
    subscribeToUpdates 
  } = useLiveStreamStore();

  const eventStreams = streams[eventId] || [];
  const currentStream = eventStreams[0]; // For now, use the first stream
  const streamSources = currentStream?.sources || [];

  useEffect(() => {
    loadStreams(eventId);
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToUpdates(eventId);
    return unsubscribe;
  }, [eventId]);

  const totalViewers = streamSources.reduce((sum, source) => sum + source.viewerCount, 0);
  const activeStreams = streamSources.filter(source => source.isActive).length;

  const handleAddStreamSource = async (newSource: Omit<StreamSource, 'id' | 'liveStreamId' | 'createdAt'>) => {
    try {
      if (!currentStream) {
        // Create a default stream first
        const { createStream } = useLiveStreamStore.getState();
        const stream = await createStream(eventId, {
          title: 'Event Live Stream',
          description: 'Live stream for this event',
        });
        await addStreamSource(stream.id, newSource);
      } else {
        await addStreamSource(currentStream.id, newSource);
      }
      setShowAddModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add stream source');
    }
  };

  const handleToggleStream = async (sourceId: string) => {
    try {
      const source = streamSources.find(s => s.id === sourceId);
      if (source) {
        await updateStreamSource(eventId, sourceId, { isActive: !source.isActive });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to toggle stream');
    }
  };

  const handleDeleteStream = (sourceId: string) => {
    Alert.alert(
      'Delete Stream Source',
      'Are you sure you want to delete this stream source?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStreamSource(eventId, sourceId);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete stream source');
            }
          },
        },
      ]
    );
  };

  const handleSetPrimary = async (sourceId: string) => {
    try {
      await updateStreamSource(eventId, sourceId, { isPrimary: true });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to set primary stream');
    }
  };

  const handleStartAllStreams = async () => {
    try {
      const promises = streamSources
        .filter(source => !source.isActive)
        .map(source => updateStreamSource(eventId, source.id, { isActive: true }));
      
      await Promise.all(promises);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start streams');
    }
  };

  const handleStopAllStreams = async () => {
    try {
      const promises = streamSources
        .filter(source => source.isActive)
        .map(source => updateStreamSource(eventId, source.id, { isActive: false }));
      
      await Promise.all(promises);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to stop streams');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Stream</Text>
        <Text style={styles.subtitle}>Manage multiple streaming platforms</Text>
      </View>

      {/* Stream Overview */}
      <Card style={styles.overviewCard}>
        <View style={styles.overviewRow}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewNumber}>{activeStreams}</Text>
            <Text style={styles.overviewLabel}>Active Streams</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewNumber}>{totalViewers}</Text>
            <Text style={styles.overviewLabel}>Total Viewers</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewNumber}>{streamSources.length}</Text>
            <Text style={styles.overviewLabel}>Platforms</Text>
          </View>
        </View>
      </Card>

      {/* Stream Sources */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stream Sources</Text>
          <Button
            title="Add Source"
            onPress={() => setShowAddModal(true)}
            variant="outline"
            size="small"
          />
        </View>

        {streamSources.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📹</Text>
              <Text style={styles.emptyStateTitle}>No Stream Sources</Text>
              <Text style={styles.emptyStateDescription}>
                Add streaming platforms like YouTube, Facebook, or custom RTMP sources
              </Text>
            </View>
          </Card>
        ) : (
          streamSources.map((source) => (
            <StreamSourceCard
              key={source.id}
              source={source}
              onToggle={() => handleToggleStream(source.id)}
              onDelete={() => handleDeleteStream(source.id)}
              onSetPrimary={() => handleSetPrimary(source.id)}
            />
          ))
        )}
      </View>

      {/* Stream Controls */}
      <View style={styles.actions}>
        <Button
          title="Start All Streams"
          onPress={handleStartAllStreams}
          disabled={streamSources.length === 0 || isLoading}
          loading={isLoading}
        />
        <Button
          title="Stop All Streams"
          onPress={handleStopAllStreams}
          variant="outline"
          disabled={activeStreams === 0 || isLoading}
        />
      </View>

      <AddStreamSourceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddStreamSource}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  overviewCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    padding: 24,
    gap: 12,
  },
});