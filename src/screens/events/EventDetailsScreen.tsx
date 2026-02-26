import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventDetails'>;

export const EventDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { eventId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smith Family Wedding</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>WEDDING</Text>
        </View>
      </View>

      <Card>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>March 15, 2026</Text>
      </Card>

      <Card>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>Nairobi, Kenya</Text>
      </Card>

      <Card>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>
          Join us in celebrating the union of John and Jane Smith.
        </Text>
      </Card>

      <Card>
        <Text style={styles.label}>Event Code</Text>
        <Text style={styles.code}>ABC123</Text>
      </Card>

      <View style={styles.actions}>
        <Button
          title="View Committees"
          onPress={() => navigation.navigate('Committees', { eventId })}
        />
        <Button
          title="View Tasks"
          onPress={() => navigation.navigate('Tasks', { eventId })}
          variant="outline"
        />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  code: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 4,
  },
  actions: {
    padding: 24,
    gap: 12,
  },
});
