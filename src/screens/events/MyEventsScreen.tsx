import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { useEventStore } from '../../store/eventStore';

type Props = NativeStackScreenProps<EventsStackParamList, 'MyEvents'>;

export const MyEventsScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const { events, loadEvents, isLoading } = useEventStore();

  useEffect(() => {
    loadEvents();
  }, []);

  if (!isLoading && events.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="📅"
          title="No Events Yet"
          message="Create your first event or join an existing one with a code"
          actionLabel={user?.role === 'admin' ? 'Create Event' : 'Join Event'}
          onAction={() => {
            if (user?.role === 'admin') {
              navigation.navigate('CreateEvent');
            } else {
              navigation.navigate('JoinEvent');
            }
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>My Events</Text>
          {user?.role === 'admin' && (
            <Button
              title="Create Event"
              onPress={() => navigation.navigate('CreateEvent')}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => navigation.navigate('JoinEvent')}
        >
          <Text style={styles.joinButtonText}>+ Join Event with Code</Text>
        </TouchableOpacity>

        <View style={styles.eventsList}>
          {events.map((event) => (
            <Card
              key={event.id}
              onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
            >
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventType}>{event.type}</Text>
              <View style={styles.eventInfo}>
                <Text style={styles.eventDetail}>
                  📅 {new Date(event.startDate).toLocaleDateString()}
                </Text>
                <Text style={styles.eventDetail}>📍 {event.location}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  joinButton: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  eventsList: {
    padding: 24,
    paddingTop: 0,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 8,
  },
  eventInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  eventDetail: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
