import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { getPasswordStrength } from '../utils/authErrors';

interface Props {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<Props> = ({ password }) => {
  if (!password) return null;

  const { strength, score, feedback } = getPasswordStrength(password);

  const getColor = () => {
    switch (strength) {
      case 'weak':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'strong':
        return '#10B981';
      default:
        return Colors.border;
    }
  };

  const getLabel = () => {
    switch (strength) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${(score / 6) * 100}%`, backgroundColor: getColor() }]} />
      </View>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: getColor() }]}>{getLabel()}</Text>
        {feedback.length > 0 && (
          <Text style={styles.feedback}>{feedback[0]}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barContainer: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedback: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
});
