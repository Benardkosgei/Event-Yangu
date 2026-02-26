import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VendorsStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<VendorsStackParamList, 'VendorMarketplace'>;

const mockVendors = [
  {
    id: '1',
    businessName: 'Elite Catering Services',
    services: ['Catering', 'Food'],
    rating: 4.8,
    description: 'Professional catering for all events',
  },
  {
    id: '2',
    businessName: 'Perfect Venue Decorators',
    services: ['Decoration', 'Design'],
    rating: 4.9,
    description: 'Transform your venue into a masterpiece',
  },
  {
    id: '3',
    businessName: 'Sound & Lights Pro',
    services: ['Entertainment', 'Audio/Visual'],
    rating: 4.7,
    description: 'Professional sound and lighting services',
  },
  {
    id: '4',
    businessName: 'Elegant Photography',
    services: ['Photography', 'Videography'],
    rating: 5.0,
    description: 'Capture your special moments',
  },
];

export const VendorMarketplaceScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVendors = mockVendors.filter((vendor) =>
    vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.services.some((service) => service.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vendor Marketplace</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search vendors or services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.light}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredVendors.map((vendor) => (
          <Card
            key={vendor.id}
            onPress={() => navigation.navigate('VendorProfile', { vendorId: vendor.id })}
          >
            <View style={styles.vendorHeader}>
              <Text style={styles.vendorName}>{vendor.businessName}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingStar}>⭐</Text>
                <Text style={styles.ratingText}>{vendor.rating}</Text>
              </View>
            </View>
            <Text style={styles.vendorDescription}>{vendor.description}</Text>
            <View style={styles.servicesContainer}>
              {vendor.services.map((service, index) => (
                <View key={index} style={styles.serviceBadge}>
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
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
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  searchContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  searchInput: {
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  vendorDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceBadge: {
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});
