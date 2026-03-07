import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Button } from './Button';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../store/authStore';

export const SessionExpiredModal: React.FC = () => {
  const { sessionExpired, clearSessionExpired } = useAuthStore();

  const handleDismiss = () => {
    clearSessionExpired();
  };

  return (
    <Modal
      visible={sessionExpired}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Session Expired</Text>
          <Text style={styles.message}>
            Your session has expired. Please log in again to continue.
          </Text>
          <Button title="OK" onPress={handleDismiss} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
