import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { validation } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuthStore();

  const [errors, setErrors] = useState({
    email: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      email: validation.email(email) || '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        'Check your email for a password reset link. It may take a few minutes to arrive.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to send reset email. Please try again.');
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
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        {!emailSent ? (
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={errors.email}
            />

            <Button title="Send Reset Link" onPress={handleResetPassword} loading={isLoading} />

            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              Back to Login
            </Text>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✓ Email sent successfully!</Text>
            <Text style={styles.successSubtext}>
              Check your inbox and follow the instructions to reset your password.
            </Text>
            <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
          </View>
        )}
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
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  link: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  successContainer: {
    gap: 16,
    alignItems: 'center',
  },
  successText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.success,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
