import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<EventsStackParamList, 'Committees'>;

const mockCommittees = [
  { id: '1', name: 'Venue Committee', members: 5, tasks: 8 },
  { id: '2', name: 'Catering Committee', members: 3, tasks: 5 },
  { id: '3', name: 'Entertainment Committee', members: 4, tasks: 6 },
];

export const CommitteesScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Committees</Text>
      </View>

      {mockCommittees.map((committee) => (
        <Card
          key={committee.id}
          onPress={() => navigation.navigate('CommitteeDetails', { committeeId: committee.id })}
        >
          <Text style={styles.committeeName}>{committee.name}</Text>
          <View style={styles.stats}>
            <Text style={styles.stat}>👥 {committee.members} members</Text>
            <Text style={styles.stat}>✓ {committee.tasks} tasks</Text>
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
  committeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
