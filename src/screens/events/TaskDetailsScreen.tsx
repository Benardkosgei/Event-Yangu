import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<EventsStackParamList, 'TaskDetails'>;

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export const TaskDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const [status, setStatus] = useState('in_progress');

  const handleUpdateStatus = () => {
    // Update task status
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Flowers</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.statusText}>{status.replace('_', ' ')}</Text>
        </View>
      </View>

      <Card>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>
          Contact the florist and place an order for wedding flowers. Ensure delivery is scheduled for the day before the event.
        </Text>
      </Card>

      <Card>
        <Text style={styles.label}>Assigned To</Text>
        <View style={styles.assigneeRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
          <Text style={styles.assigneeName}>Jane Smith</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.label}>Due Date</Text>
        <Text style={styles.value}>February 20, 2026</Text>
      </Card>

      <Card>
        <Text style={styles.label}>Committee</Text>
        <Text style={styles.value}>Venue Committee</Text>
      </Card>

      <View style={styles.section}>
        <Select
          label="Update Status"
          value={status}
          options={statusOptions}
          onValueChange={setStatus}
        />
        <Button title="Save Changes" onPress={handleUpdateStatus} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comments</Text>
        <Card>
          <Text style={styles.commentAuthor}>John Doe</Text>
          <Text style={styles.commentText}>
            I've contacted three florists. Waiting for quotes.
          </Text>
          <Text style={styles.commentTime}>2 hours ago</Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return Colors.success;
    case 'in_progress':
      return Colors.warning;
    default:
      return Colors.text.light;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    textTransform: 'capitalize',
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  },
  assigneeName: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
    color: Colors.text.light,
  },
});
