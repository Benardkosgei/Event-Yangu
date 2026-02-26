import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<EventsStackParamList, 'Tasks'>;

const mockTasks = [
  { id: '1', title: 'Book venue', status: 'completed', assignee: 'John Doe' },
  { id: '2', title: 'Order flowers', status: 'in_progress', assignee: 'Jane Smith' },
  { id: '3', title: 'Send invitations', status: 'pending', assignee: 'Mike Johnson' },
];

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

export const TasksScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
      </View>

      {mockTasks.map((task) => (
        <Card
          key={task.id}
          onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
        >
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.taskInfo}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
              <Text style={styles.statusText}>{task.status.replace('_', ' ')}</Text>
            </View>
            <Text style={styles.assignee}>Assigned to: {task.assignee}</Text>
          </View>
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
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  assignee: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
