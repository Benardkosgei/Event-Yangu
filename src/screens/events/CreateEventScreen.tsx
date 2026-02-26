import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../navigation/types';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { useEventStore } from '../../store/eventStore';
import { validation } from '../../utils/validation';

type Props = NativeStackScreenProps<EventsStackParamList, 'CreateEvent'>;

const eventTypeOptions = [
  { label: 'Wedding', value: 'wedding' },
  { label: 'Burial', value: 'burial' },
  { label: 'Fundraiser', value: 'fundraiser' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Community Event', value: 'community' },
  { label: 'Corporate Event', value: 'corporate' },
  { label: 'Other', value: 'other' },
];

export const CreateEventScreen: React.FC<Props> = ({ navigation }) => {
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const { addEvent } = useEventStore();
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    eventName: '',
    eventType: '',
    location: '',
    description: '',
    startDate: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      eventName: validation.required(eventName, 'Event name') || '',
      eventType: validation.required(eventType, 'Event type') || '',
      location: validation.required(location, 'Location') || '',
      description: validation.required(description, 'Description') || '',
      startDate: validation.required(startDate, 'Start date') || '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await addEvent({
        name: eventName,
        type: eventType as any,
        location,
        description,
        startDate: new Date(startDate),
        createdBy: '1',
      });
      Alert.alert('Success', 'Event created successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
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
        <Text style={styles.title}>Create New Event</Text>

        <Select
          label="Event Type"
          value={eventType}
          options={eventTypeOptions}
          onValueChange={setEventType}
          placeholder="Select event type"
          error={errors.eventType}
        />

        <Input
          label="Event Name"
          value={eventName}
          onChangeText={setEventName}
          placeholder="Enter event name"
          error={errors.eventName}
        />

        <Input
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Enter event location"
          error={errors.location}
        />

        <Input
          label="Start Date"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          error={errors.startDate}
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your event"
          error={errors.description}
        />

        <Button title="Create Event" onPress={handleCreateEvent} loading={loading} />
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
    marginBottom: 24,
  },
});
