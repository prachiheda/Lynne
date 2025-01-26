import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  saveCheckIn,
  getCheckInStatus,
  getCheckInHistory,
  getDailyTargetTime,
  setDailyTargetTime,
} from '../../utils/checkInStorage';
import {
  initializeNotifications,
  scheduleNotifications,
  cancelAllNotifications,
  getNotificationSettings,
} from '../../utils/notificationService';

export default function HomeScreen() {
  // 1. Persistent daily target time
  const [dailyTargetTimeState, setDailyTargetTimeState] = useState<Date | null>(null);

  // 2. Today's check-in tracking
  const [todayCheckInTime, setTodayCheckInTime] = useState<Date | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // 3. Modal/picker states
  const [showPicker, setShowPicker] = useState(false);
  // We'll only use modes for "DAILY_TARGET" or "EDIT_TODAY" now
  const [pickerMode, setPickerMode] = useState<'DAILY_TARGET' | 'EDIT_TODAY'>('DAILY_TARGET');

  // 4. Three dots menu
  const [showEditMenu, setShowEditMenu] = useState(false);

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Update notifications when daily target time changes
  useEffect(() => {
    if (dailyTargetTimeState) {
      updateNotifications();
    }
  }, [dailyTargetTimeState]);

  const updateNotifications = async () => {
    if (!dailyTargetTimeState) return;
    
    const settings = await getNotificationSettings();
    await scheduleNotifications(dailyTargetTimeState, settings);
  };

  // ---------------------------
  // On Mount: load daily target time + today's check-in
  // ---------------------------
  const DEBUG_ALWAYS_CLEAR_TODAY = true;

useEffect(() => {
  const loadData = async () => {
    const storedDailyTime = await getDailyTargetTime();
    let history = await getCheckInHistory();
    const todayKey = new Date().toISOString().split('T')[0];

    if (DEBUG_ALWAYS_CLEAR_TODAY && history[todayKey]) {
      // Remove today's entry only in debug mode
      delete history[todayKey];
    }

    if (storedDailyTime) {
      setDailyTargetTimeState(storedDailyTime);

      if (!DEBUG_ALWAYS_CLEAR_TODAY && history[todayKey]) {
        setIsCheckedIn(true);
        setTodayCheckInTime(new Date(history[todayKey].timestamp));
      }
    }
  };
  loadData();
}, []);

  // ---------------------------
  //  A) Change persistent daily target time
  // ---------------------------
  const handleDailyTimePress = async () => {
    if (!dailyTargetTimeState) {
      Alert.alert(
        'Set Daily Time',
        'Are you sure you want to set your daily birth control time?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Set Time',
            onPress: () => {
              setPickerMode('DAILY_TARGET');
              setShowPicker(true);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Change Daily Time',
        'Are you sure you want to change your daily birth control time? This will affect all future check-ins and notifications.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change',
            onPress: () => {
              setPickerMode('DAILY_TARGET');
              setShowPicker(true);
            },
          },
        ]
      );
    }
  };

  // ---------------------------
  //  B) Main circle: check in with current time
  // ---------------------------
  const handleCheckInPress = async () => {
    if (!dailyTargetTimeState) {
      Alert.alert('Set Daily Time', 'Please set a daily time before checking in.');
      return;
    }

    if (isCheckedIn) {
      return;
    }

    const now = new Date();
    const targetMinutes =
      dailyTargetTimeState.getHours() * 60 + dailyTargetTimeState.getMinutes();
    const checkInMinutes = now.getHours() * 60 + now.getMinutes();
    const diff = Math.abs(checkInMinutes - targetMinutes);
    const status = getCheckInStatus(diff);

    const todayKey = new Date().toISOString().split('T')[0];
    await saveCheckIn(todayKey, status, now.toISOString(), dailyTargetTimeState.toISOString());

    setTodayCheckInTime(now);
    setIsCheckedIn(true);

    // Cancel remaining notifications if setting is enabled
    const settings = await getNotificationSettings();
    if (settings.stopRemindersAfterCheckIn) {
      await cancelAllNotifications();
    }

    let message = '';
    switch (status) {
      case 'onTime':
        message = 'You checked in within the acceptable time window!';
        break;
      case 'slightlyLate':
        message = 'You checked in a bit late, but not too bad!';
        break;
      case 'veryLate':
        message = 'You checked in very late. Try to be more punctual next time!';
        break;
      case 'missed':
        message = 'You missed your check-in window by a lot!';
        break;
    }
    Alert.alert(status === 'onTime' ? 'On time!' : 'Late', message);
  };

  // ---------------------------
  //  C) Three Dots: Edit today's check-in time
  // ---------------------------
  const handleEditCheckIn = () => {
    setShowEditMenu(false);
    // Only allow if user has checked in at least once today
    if (!isCheckedIn) {
      return;
    }
    setPickerMode('EDIT_TODAY');
    setShowPicker(true);
  };

  // ---------------------------
  //  D) DateTimePicker callback
  // ---------------------------
  const handleSetTime = async (event: any, date: Date | undefined) => {
    setShowPicker(false);
    if (!date) return;

    switch (pickerMode) {
      case 'DAILY_TARGET': {
        const oldTime = dailyTargetTimeState;
        await setDailyTargetTime(date);
        setDailyTargetTimeState(date);

        // If we never had a daily time before, reset today's check-in so user can do it fresh
        if (!oldTime) {
          setIsCheckedIn(false);
          setTodayCheckInTime(null);
        }
        break;
      }
      case 'EDIT_TODAY': {
        // User is editing today's check-in time
        if (!dailyTargetTimeState) return;

        const targetMinutes =
          dailyTargetTimeState.getHours() * 60 + dailyTargetTimeState.getMinutes();
        const checkInMinutes = date.getHours() * 60 + date.getMinutes();
        const diff = Math.abs(checkInMinutes - targetMinutes);
        const status = getCheckInStatus(diff);

        const todayKey = new Date().toISOString().split('T')[0];
        await saveCheckIn(
          todayKey,
          status,
          date.toISOString(),
          dailyTargetTimeState.toISOString()
        );

        setTodayCheckInTime(date);
        setIsCheckedIn(true);
        break;
      }
    }
  };

  // ---------------------------
  // E) Circle color logic
  // ---------------------------
  const getCircleColor = () => {
    // If daily time not set, remain grey
    if (!dailyTargetTimeState) {
      return { backgroundColor: '#ddd' };
    }

    // If user hasn't checked in yet, remain grey
    if (!isCheckedIn || !todayCheckInTime) {
      return { backgroundColor: '#ddd' };
    }

    const targetMinutes =
      dailyTargetTimeState.getHours() * 60 + dailyTargetTimeState.getMinutes();
    const checkInMinutes = todayCheckInTime.getHours() * 60 + todayCheckInTime.getMinutes();
    const timeDiff = Math.abs(checkInMinutes - targetMinutes);
    const status = getCheckInStatus(timeDiff);

    switch (status) {
      case 'onTime':
        return { backgroundColor: '#4CAF50' }; // Green
      case 'slightlyLate':
        return { backgroundColor: '#FFD700' }; // Yellow
      case 'veryLate':
        return { backgroundColor: '#FF8C00' }; // Orange
      case 'missed':
        return { backgroundColor: '#DC143C' }; // Red
      default:
        return { backgroundColor: '#ddd' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Birth Control Tracker</Text>

      {/* Timer Icon - change persistent daily time */}
      <TouchableOpacity style={styles.targetTimeContainer} onPress={handleDailyTimePress}>
        <Ionicons name="timer-outline" size={30} color="black" />
        <Text style={styles.targetTimeText}>
          {dailyTargetTimeState
            ? `Daily Time: ${dailyTargetTimeState.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : 'Set Daily Time'}
        </Text>
      </TouchableOpacity>

      {/* Three Dots Menu (Edit ONLY today's check-in time) */}
      <TouchableOpacity style={styles.menuButton} onPress={() => setShowEditMenu(true)}>
        <MaterialIcons name="more-vert" size={24} color="black" />
      </TouchableOpacity>
     {/* Display Today's Check-In Time Underneath the Circle */}
{isCheckedIn && todayCheckInTime && (
  <Text style={styles.checkInTimeText}>
    Today's Check-In: {todayCheckInTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}
  </Text>
)}

      {/* Edit Menu Modal */}
      <Modal
        transparent
        visible={showEditMenu}
        onRequestClose={() => setShowEditMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowEditMenu(false)}
          activeOpacity={1}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={[
                styles.menuItem,
                !isCheckedIn && styles.menuItemDisabled, // Only enabled if user checked in
              ]}
              onPress={isCheckedIn ? handleEditCheckIn : undefined}
            >
              <Text
                style={[
                  styles.menuItemText,
                  !isCheckedIn && styles.menuItemTextDisabled,
                ]}
              >
                Edit Today's Check-in Time
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Check-In Circle */}
      <TouchableOpacity
        style={[styles.circle, getCircleColor()]}
        onPress={handleCheckInPress}
        disabled={isCheckedIn} // Disabled if already checked in
      >
        {/* Text inside circle */}
        {!dailyTargetTimeState ? (
          <Text style={styles.circleText}>Set Daily Time</Text>
        ) : isCheckedIn && todayCheckInTime ? (
          <Text style={styles.circleText}>✔</Text>
        ) : (
          <Text style={styles.circleText}>Check In</Text>
        )}
      </TouchableOpacity>

      {/* DateTime Picker (ONLY for daily target time or editing today's time) */}
      {showPicker && (
        <DateTimePicker
          value={
            pickerMode === 'DAILY_TARGET'
              ? dailyTargetTimeState || new Date()
              : todayCheckInTime || new Date()
          }
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleSetTime}
        />
      )}
    </View>
  );
}

// ---------------------------
// Styles
// ---------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  // Timer icon in top left
  targetTimeContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  targetTimeText: {
    fontSize: 16,
    marginLeft: 10,
  },
  // Three dots menu
  menuButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemTextDisabled: {
    color: '#999',
  },
  // Main check-in circle
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  checkInTimeText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
  },
});
