import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VendorsStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<VendorsStackParamList, 'VendorProfile'>;

export const VendorProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { vendorId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>EC</Text>
        </View>
        <Text style={styles.businessName}>Elite Catering Services</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingStar}>⭐</Text>
          <Text style={styles.ratingText}>4.8 (24 reviews)</Text>
        </View>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          We are a professional catering company with over 10 years of experience in providing exceptional food services for all types of events. Our team is dedicated to making your event memorable with delicious cuisine and impeccable service.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Services Offered</Text>
        <View style={styles.servicesList}>
          <Text style={styles.serviceItem}>• Full-service catering</Text>
          <Text style={styles.serviceItem}>• Menu customization</Text>
          <Text style={styles.serviceItem}>• Professional staff</Text>
          <Text style={styles.serviceItem}>• Equipment rental</Text>
          <Text style={styles.serviceItem}>• Event planning consultation</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Email:</Text>
          <Text style={styles.contactValue}>info@elitecatering.com</Text>
        </View>
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Phone:</Text>
          <Text style={styles.contactValue}>+254 700 123 456</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Recent Reviews</Text>
        <View style={styles.review}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewAuthor}>John Doe</Text>
            <Text style={styles.reviewRating}>⭐ 5.0</Text>
          </View>
          <Text style={styles.reviewText}>
            Excellent service! The food was amazing and the staff was very professional.
          </Text>
          <Text style={styles.reviewDate}>2 weeks ago</Text>
        </View>
        <View style={styles.review}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewAuthor}>Jane Smith</Text>
            <Text style={styles.reviewRating}>⭐ 4.5</Text>
          </View>
          <Text style={styles.reviewText}>
            Great experience overall. Would definitely recommend!
          </Text>
          <Text style={styles.reviewDate}>1 month ago</Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title="Contact Vendor"
          onPress={() => navigation.navigate('EngageVendor', { vendorId })}
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
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 18,
    marginRight: 4,
  },
  ratingText: {
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
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  servicesList: {
    gap: 8,
  },
  serviceItem: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    width: 80,
  },
  contactValue: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  review: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  reviewRating: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.text.light,
  },
  actions: {
    padding: 24,
  },
});
