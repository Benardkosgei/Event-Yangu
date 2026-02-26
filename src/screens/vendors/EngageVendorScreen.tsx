import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VendorsStackParamList } from '../../navigation/types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { validation } from '../../utils/validation';

type Props = NativeStackScreenProps<VendorsStackParamList, 'EngageVendor'>;

export const EngageVendorScreen: React.FC<Props> = ({ navigation }) => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    eventName: '',
    eventDate: '',
    guestCount: '',
    message: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      eventName: validation.required(eventName, 'Event name') || '',
      eventDate: validation.required(eventDate, 'Event date') || '',
      guestCount: validation.positiveNumber(guestCount) || '',
      message: validation.required(message, 'Message') || '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSendInquiry = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigation.goBack();
    } catch (error) {
      console.error('Send inquiry failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Contact Vendor</Text>
        <Text style={styles.subtitle}>
          Send an inquiry to Elite Catering Services
        </Text>

        <Input
          label="Event Name"
          value={eventName}
          onChangeText={setEventName}
          placeholder="e.g., Smith Family Wedding"
          error={errors.eventName}
        />

        <Input
          label="Event Date"
          value={eventDate}
          onChangeText={setEventDate}
          placeholder="YYYY-MM-DD"
          error={errors.eventDate}
        />

        <Input
          label="Expected Guest Count"
          value={guestCount}
          onChangeText={setGuestCount}
          placeholder="Number of guests"
          keyboardType="numeric"
          error={errors.guestCount}
        />

        <Input
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="Tell the vendor about your requirements..."
          error={errors.message}
        />

        <View style={styles.actions}>
          <Button title="Send Inquiry" onPress={handleSendInquiry} loading={loading} />
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  actions: {
    gap: 12,
    marginTop: 24,
  },
});
