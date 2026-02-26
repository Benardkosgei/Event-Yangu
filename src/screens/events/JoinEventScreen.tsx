import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../navigation/types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { useEventStore } from '../../store/eventStore';
import { validation } from '../../utils/validation';

type Props = NativeStackScreenProps<EventsStackParamList, 'JoinEvent'>;

export const JoinEventScreen: React.FC<Props> = ({ navigation }) => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const { joinEvent } = useEventStore();
  const [loading, setLoading] = useState(false);

  const handleJoinEvent = async () => {
    const validationError = validation.required(joinCode, 'Join code');
    if (validationError) {
      setError(validationError);
      return;
    }

    if (joinCode.length < 6) {
      setError('Join code must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await joinEvent(joinCode);
      Alert.alert('Success', 'You have joined the event!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Invalid join code or event not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Event</Text>
      <Text style={styles.description}>
        Enter the event code provided by the organizer to join the event.
      </Text>

      <Input
        label="Event Code"
        value={joinCode}
        onChangeText={(text) => {
          setJoinCode(text);
          setError('');
        }}
        placeholder="Enter 6-digit code"
        error={error}
      />

      <Button
        title="Join Event"
        onPress={handleJoinEvent}
        loading={loading}
        disabled={joinCode.length < 6}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 24,
    lineHeight: 20,
  },
});
