import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { validation } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuthStore();

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      password: validation.password(password) || '',
      confirmPassword: password !== confirmPassword ? 'Passwords do not match' : '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updatePassword(password);
      Alert.alert(
        'Success',
        'Your password has been reset successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your new password below.</Text>

        <View style={styles.form}>
          <Input
            label="New Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            secureTextEntry={true}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry={true}
            error={errors.confirmPassword}
          />

          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirement}>• At least 8 characters</Text>
            <Text style={styles.requirement}>• One uppercase letter</Text>
            <Text style={styles.requirement}>• One lowercase letter</Text>
            <Text style={styles.requirement}>• One number</Text>
          </View>

          <Button title="Reset Password" onPress={handleResetPassword} loading={isLoading} />

          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Back to Login
          </Text>
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
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
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
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  requirements: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  requirement: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  link: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
});
