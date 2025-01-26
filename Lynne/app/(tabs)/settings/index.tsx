import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
} from '../../../utils/notificationService';
import { signInWithGoogle } from '../../../utils/googleCalendarService';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    preNotificationTime: 10,
    reminderInterval: 10,
    stopRemindersAfterCheckIn: true,
  });
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getNotificationSettings();
    setSettings(savedSettings);
  };

  const handleSave = async () => {
    try {
      await saveNotificationSettings(settings);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleConnectCalendar = async () => {
    try {
      const success = await signInWithGoogle();
      if (success) {
        setIsCalendarConnected(true);
        Alert.alert('Success', 'Google Calendar connected successfully!');
      } else {
        Alert.alert('Error', 'Failed to connect Google Calendar. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect Google Calendar. Please try again.');
    }
  };

  const validateAndUpdateNumber = (value: string, field: keyof NotificationSettings) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid positive number.');
      return;
    }
    setSettings(prev => ({ ...prev, [field]: num }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Google Calendar</Text>
          <TouchableOpacity 
            style={styles.calendarButton} 
            onPress={handleConnectCalendar}
          >
            <MaterialIcons 
              name={isCalendarConnected ? "check-circle" : "add-circle"} 
              size={24} 
              color={isCalendarConnected ? "#8c9a59" : "#4A6FA5"} 
            />
            <Text style={styles.calendarButtonText}>
              {isCalendarConnected ? 'Calendar Connected' : 'Connect Google Calendar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Timing</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pre-notification time (minutes)</Text>
            <TextInput
              style={styles.input}
              value={settings.preNotificationTime.toString()}
              onChangeText={(value) => validateAndUpdateNumber(value, 'preNotificationTime')}
              keyboardType="number-pad"
              placeholder="10"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Reminder interval (minutes)</Text>
            <TextInput
              style={styles.input}
              value={settings.reminderInterval.toString()}
              onChangeText={(value) => validateAndUpdateNumber(value, 'reminderInterval')}
              keyboardType="number-pad"
              placeholder="10"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Behavior</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Stop reminders after check-in</Text>
            <Switch
              value={settings.stopRemindersAfterCheckIn}
              onValueChange={(value) =>
                setSettings(prev => ({ ...prev, stopRemindersAfterCheckIn: value }))
              }
              trackColor={{ false: '#767577', true: '#8c9a59' }}
              thumbColor={settings.stopRemindersAfterCheckIn ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  saveButton: {
    backgroundColor: '#8c9a59',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 10,
  },
  calendarButtonText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#4A6FA5',
  },
}); 