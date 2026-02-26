import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { useEventStore } from '../../store/eventStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const { events, tasks, loadEvents, loadTasks } = useEventStore();

  useEffect(() => {
    loadEvents();
    if (events.length > 0) {
      loadTasks(events[0].id);
    }
  }, []);

  const activeEvents = events.filter((e) => e.isActive).length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name}!</Text>
        <Text style={styles.subtitle}>Welcome to Event Yangu</Text>
      </View>

      <Card style={styles.statsCard}>
        <Text style={styles.cardTitle}>Active Events</Text>
        <Text style={styles.statsNumber}>{activeEvents}</Text>
      </Card>

      <Card style={styles.statsCard}>
        <Text style={styles.cardTitle}>Pending Tasks</Text>
        <Text style={styles.statsNumber}>{pendingTasks}</Text>
      </Card>

      <Card style={styles.statsCard}>
        <Text style={styles.cardTitle}>Budget Status</Text>
        <Text style={styles.statsNumber}>85%</Text>
        <Text style={styles.statsLabel}>Utilized</Text>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Announcements</Text>
        <Card>
          <Text style={styles.announcementTitle}>Event Update</Text>
          <Text style={styles.announcementText}>
            The wedding ceremony has been rescheduled to next Saturday.
          </Text>
          <Text style={styles.announcementTime}>2 hours ago</Text>
        </Card>
      </View>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statsLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  section: {
    padding: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  announcementText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  announcementTime: {
    fontSize: 12,
    color: Colors.text.light,
  },
});
