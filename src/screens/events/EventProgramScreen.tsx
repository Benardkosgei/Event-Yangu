import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventProgram'>;

export const EventProgramScreen: React.FC<Props> = ({ navigation, route }) => {
  const { eventId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Event Program</Text>
        <Text style={styles.subtitle}>Schedule and activities</Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <Text style={styles.description}>
          Event program functionality will be available soon. This will include:
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Event schedule and timeline</Text>
          <Text style={styles.featureItem}>• Activity details</Text>
          <Text style={styles.featureItem}>• Speaker information</Text>
          <Text style={styles.featureItem}>• Venue maps</Text>
        </View>
      </Card>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  featureList: {
    marginLeft: 8,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});