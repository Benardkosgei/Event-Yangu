import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelection'>;

const roles = [
  { id: 'admin', title: 'Event Organizer', description: 'Create and manage events' },
  { id: 'committee', title: 'Committee Member', description: 'Manage tasks and committees' },
  { id: 'member', title: 'General Member', description: 'Participate in events' },
  { id: 'vendor', title: 'Vendor/Service Provider', description: 'Offer services to events' },
  { id: 'viewer', title: 'Viewer', description: 'View public event information' },
];

export const RoleSelectionScreen: React.FC<Props> = ({ route }) => {
  const { name, email, phone, password } = route.params;
  const [selectedRole, setSelectedRole] = useState('');
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!selectedRole) {
      Alert.alert('Role Required', 'Please select a role to continue');
      return;
    }

    console.log('Starting registration with:', { email, name, phone, role: selectedRole });

    try {
      await register(email, password, name, phone, selectedRole);
      console.log('Registration successful');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.message || 'Unknown error';
      
      let title = 'Registration Failed';
      let message = 'Please try again';

      if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        title = 'Email Already Registered';
        message = 'An account with this email already exists. Please login instead.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        message = 'Network error. Please check your connection and try again.';
      } else if (errorMessage.includes('profile')) {
        message = 'Failed to create user profile. Please try again or contact support.';
      } else {
        message = errorMessage;
      }

      Alert.alert(title, message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Select Your Role</Text>
      <Text style={styles.subtitle}>Choose how you'll use Event Yangu</Text>

      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[styles.roleCard, selectedRole === role.id && styles.roleCardSelected]}
            onPress={() => setSelectedRole(role.id)}
          >
            <Text style={[styles.roleTitle, selectedRole === role.id && styles.roleTextSelected]}>
              {role.title}
            </Text>
            <Text style={[styles.roleDescription, selectedRole === role.id && styles.roleTextSelected]}>
              {role.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Complete Registration"
        onPress={handleRegister}
        disabled={!selectedRole}
        loading={isLoading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  rolesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  roleCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  roleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  roleTextSelected: {
    color: Colors.white,
  },
});
