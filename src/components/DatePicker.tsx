import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
}

export const DatePicker: React.FC<Props> = ({
  label,
  value,
  onChange,
  error,
  minimumDate,
  maximumDate,
  mode = 'date',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    
    if (mode === 'time') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (mode === 'datetime') {
      return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePress = () => {
    setTempDate(value || new Date());
    setShowPicker(true);
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  const adjustDate = (field: 'year' | 'month' | 'day' | 'hour' | 'minute', delta: number) => {
    const newDate = new Date(tempDate);
    
    switch (field) {
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + delta);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + delta);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + delta);
        break;
      case 'hour':
        newDate.setHours(newDate.getHours() + delta);
        break;
      case 'minute':
        newDate.setMinutes(newDate.getMinutes() + delta);
        break;
    }

    if (minimumDate && newDate < minimumDate) return;
    if (maximumDate && newDate > maximumDate) return;

    setTempDate(newDate);
  };

  const renderDateControls = () => (
    <View style={styles.pickerContainer}>
      {mode !== 'time' && (
        <>
          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Year</Text>
            <View style={styles.pickerControls}>
              <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate('year', -1)}>
                <Text style={styles.pickerButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.pickerValue}>{tempDate.getFullYear()}</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate('year', 1)}>
                <Text style={styles.pickerButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Month</Text>
            <View style={styles.pickerControls}>
              <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate('month', -1)}>
                <Text style={styles.pickerButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.pickerValue}>{tempDate.toLocaleString('default', { month: 'long' })}</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate('month', 1)}>
                <Text style={styles.pickerButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Day</Text>
            <View style={styles.pickerControls}>
              <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate('day', -1)}>
                <Text style={styles.pickerButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.pickerValue}>{tempDate.getDate()}</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate('day', 1)}>
                <Text style={styles.pickerButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {(mode === 'time' || mode === 'datetime') && (
        <>
          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Hour</Text>
            <View style={styles.pickerControls}>
              <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate('hour', -1)}>
                <Text style={styles.pickerButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.pickerValue}>{tempDate.getHours().toString().padStart(2, '0')}</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate('hour', 1)}>
                <Text style={styles.pickerButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Minute</Text>
            <View style={styles.pickerControls}>
              <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate('minute', -1)}>
                <Text style={styles.pickerButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.pickerValue}>{tempDate.getMinutes().toString().padStart(2, '0')}</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate('minute', 1)}>
                <Text style={styles.pickerButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, error ? styles.inputError : null]}
        onPress={handlePress}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {formatDate(value)}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            
            {renderDateControls()}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleConfirm}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  placeholder: {
    color: Colors.text.light,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerRow: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  pickerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.white,
  },
  pickerValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    minWidth: 120,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modalButtonTextPrimary: {
    color: Colors.white,
  },
});
