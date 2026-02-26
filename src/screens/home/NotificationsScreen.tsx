import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'Notifications'>;

const mockNotifications = [
  {
    id: '1',
    title: 'Task Assigned',
    message: 'You have been assigned to "Setup Venue"',
    time: '2 hours ago',
    type: 'task',
  },
  {
    id: '2',
    title: 'Event Update',
    message: 'Wedding ceremony time has been updated',
    time: '5 hours ago',
    type: 'event',
  },
  {
    id: '3',
    title: 'Budget Alert',
    message: 'Catering budget is 90% utilized',
    time: '1 day ago',
    type: 'budget',
  },
];

export const NotificationsScreen: React.FC<Props> = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {mockNotifications.map((notification) => (
        <Card key={notification.id}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.time}>{notification.time}</Text>
          </View>
          <Text style={styles.message}>{notification.message}</Text>
        </Card>
      ))}
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
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  time: {
    fontSize: 12,
    color: Colors.text.light,
  },
  message: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
