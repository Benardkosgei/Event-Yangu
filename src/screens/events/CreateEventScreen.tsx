import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../navigation/types';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { DatePicker } from '../../components/DatePicker';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { useEventStore } from '../../store/eventStore';
import { useAuthStore } from '../../store/authStore';
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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const { addEvent } = useEventStore();
  const user = useAuthStore((state) => state.user);
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
      startDate: !startDate ? 'Start date is required' : '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create an event');
      return;
    }

    setLoading(true);
    try {
      const newEvent = await addEvent({
        name: eventName,
        type: eventType as any,
        location,
        description,
        startDate: startDate!,
        createdBy: user.id,
      });
      
      Alert.alert(
        'Success!', 
        `Event created successfully!\n\nJoin Code: ${newEvent.joinCode}\n\nShare this code with others to invite them.`,
        [
          {
            text: 'View Event',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MyEvents' }],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create event');
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

        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          error={errors.startDate}
          minimumDate={new Date()}
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
