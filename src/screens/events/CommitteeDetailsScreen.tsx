import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<EventsStackParamList, 'CommitteeDetails'>;

const mockMembers = [
  { id: '1', name: 'John Doe', role: 'Lead' },
  { id: '2', name: 'Jane Smith', role: 'Member' },
  { id: '3', name: 'Mike Johnson', role: 'Member' },
];

const mockTasks = [
  { id: '1', title: 'Setup venue', status: 'completed' },
  { id: '2', title: 'Arrange seating', status: 'in_progress' },
  { id: '3', title: 'Test sound system', status: 'pending' },
];

export const CommitteeDetailsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Venue Committee</Text>
        <Text style={styles.description}>
          Responsible for venue setup and decoration
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members ({mockMembers.length})</Text>
        {mockMembers.map((member) => (
          <Card key={member.id}>
            <View style={styles.memberRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks ({mockTasks.length})</Text>
        {mockTasks.map((task) => (
          <Card key={task.id}>
            <View style={styles.taskRow}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                <Text style={styles.statusText}>{task.status}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.actions}>
        <Button title="Add Member" onPress={() => {}} variant="outline" />
        <Button title="Create Task" onPress={() => {}} />
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
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
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
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  memberRole: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    textTransform: 'capitalize',
  },
  actions: {
    padding: 24,
    gap: 12,
  },
});
