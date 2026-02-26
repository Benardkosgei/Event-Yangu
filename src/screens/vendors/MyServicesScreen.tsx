import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VendorsStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<VendorsStackParamList, 'MyServices'>;

const mockInquiries = [
  {
    id: '1',
    eventName: 'Smith Family Wedding',
    eventDate: '2026-03-15',
    guestCount: 150,
    status: 'pending',
    message: 'Looking for full catering service',
  },
  {
    id: '2',
    eventName: 'Corporate Meeting',
    eventDate: '2026-02-25',
    guestCount: 50,
    status: 'accepted',
    message: 'Need lunch catering for business meeting',
  },
];

export const MyServicesScreen: React.FC<Props> = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Services</Text>
        <Text style={styles.subtitle}>{user?.name}</Text>
      </View>

      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Total Inquiries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Inquiries</Text>
        {mockInquiries.map((inquiry) => (
          <Card key={inquiry.id}>
            <View style={styles.inquiryHeader}>
              <Text style={styles.inquiryEvent}>{inquiry.eventName}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: inquiry.status === 'accepted' ? Colors.success : Colors.warning },
                ]}
              >
                <Text style={styles.statusText}>{inquiry.status}</Text>
              </View>
            </View>
            <Text style={styles.inquiryDetail}>📅 {inquiry.eventDate}</Text>
            <Text style={styles.inquiryDetail}>👥 {inquiry.guestCount} guests</Text>
            <Text style={styles.inquiryMessage}>{inquiry.message}</Text>
            {inquiry.status === 'pending' && (
              <View style={styles.inquiryActions}>
                <Button title="Accept" onPress={() => {}} />
                <Button title="Decline" onPress={() => {}} variant="outline" />
              </View>
            )}
          </Card>
        ))}
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
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inquiryEvent: {
    fontSize: 16,
    fontWeight: '600',
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
  inquiryDetail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  inquiryMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 20,
  },
  inquiryActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
