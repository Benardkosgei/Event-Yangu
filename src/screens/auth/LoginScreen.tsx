import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { validation } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      email: validation.email(email) || '',
      password: validation.password(password) || '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password);
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      
      let title = 'Login Failed';
      let message = 'Please try again';

      switch (errorMessage) {
        case 'INVALID_CREDENTIALS':
          message = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'EMAIL_NOT_CONFIRMED':
          title = 'Email Not Confirmed';
          message = 'Please check your email and confirm your account before logging in.';
          break;
        case 'USER_NOT_FOUND':
          message = 'No account found with this email. Please sign up first.';
          break;
        case 'PROFILE_NOT_FOUND':
          message = 'Account profile not found. Please contact support.';
          break;
        default:
          if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            message = 'Network error. Please check your connection and try again.';
          } else {
            message = errorMessage;
          }
      }

      Alert.alert(title, message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            error={errors.email}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={true}
            error={errors.password}
          />

          <Button title="Login" onPress={handleLogin} loading={isLoading} />

          <Text style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot Password?
          </Text>

          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            Don't have an account? Register
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
  forgotPassword: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  link: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 16,
  },
});
