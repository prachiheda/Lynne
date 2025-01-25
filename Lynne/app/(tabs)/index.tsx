import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, Button, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveCheckIn, getCheckInStatus, getCheckInHistory } from '../../utils/checkInStorage';

export default function HomeScreen() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);

  // Check if already checked in today
  useEffect(() => {
    const checkTodayStatus = async () => {
      const history = await getCheckInHistory();
      const today = new Date().toISOString().split('T')[0];
      if (history[today]) {
        setIsCheckedIn(true);
        const targetTime = new Date(history[today].targetTime);
        setSelectedTime(targetTime);
      }
    };
    checkTodayStatus();
  }, []);

  const handleCheckIn = async () => {
    if (isCheckedIn) {
      return;
    }

    if (!selectedTime) {
      Alert.alert('Set a Reminder Time', 'Please set a time before checking in.');
      return;
    }

    const currentTime = new Date();
    const checkInTime = new Date(selectedTime);
    
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const targetMinutes = checkInTime.getHours() * 60 + checkInTime.getMinutes();
    
    const timeDiff = Math.abs(currentMinutes - targetMinutes);
    const status = getCheckInStatus(timeDiff);

    // Save check-in data
    const today = currentTime.toISOString().split('T')[0];
    await saveCheckIn(
      today,
      status,
      currentTime.toISOString(),
      selectedTime.toISOString()
    );

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
    setIsCheckedIn(true);
  };

  const handleEditCheckIn = () => {
    setShowEditMenu(false);
    setIsCheckedIn(false);
    setShowPicker(true);
  };

  const handleSetTime = (event: any, date: Date | undefined) => {
    setShowPicker(false);
    if (date) {
      setSelectedTime(date);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Birth Control Tracker</Text>

      {/* Three Dots Menu - Always visible */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setShowEditMenu(true)}
      >
        <MaterialIcons name="more-vert" size={24} color="black" />
      </TouchableOpacity>

      {/* Edit Menu Modal */}
      <Modal
        transparent
        visible={showEditMenu}
        onRequestClose={() => setShowEditMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowEditMenu(false)}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity 
              style={[styles.menuItem, !isCheckedIn && styles.menuItemDisabled]}
              onPress={isCheckedIn ? handleEditCheckIn : undefined}
            >
              <Text style={[styles.menuItemText, !isCheckedIn && styles.menuItemTextDisabled]}>
                Edit Check-in Time
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Check-In Circle */}
      <TouchableOpacity
        style={[styles.circle, isCheckedIn ? styles.checkedCircle : styles.uncheckedCircle]}
        onPress={handleCheckIn}
        disabled={isCheckedIn}
      >
        <Text style={styles.circleText}>{isCheckedIn ? '✔' : 'Check In'}</Text>
      </TouchableOpacity>

      {/* Timer Icon */}
      <TouchableOpacity 
        onPress={() => !isCheckedIn && setShowPicker(true)} 
        style={styles.timerIconContainer}
        disabled={isCheckedIn}
      >
        <Ionicons name="timer-outline" size={30} color={isCheckedIn ? "#999" : "black"} />
        <Text style={[styles.timerText, isCheckedIn && styles.disabledText]}>
          {selectedTime ?
            `Time: ${selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
            'Set Reminder Time'}
        </Text>
      </TouchableOpacity>

      {/* DateTime Picker */}
      {showPicker && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleSetTime}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uncheckedCircle: {
    backgroundColor: '#ddd',
  },
  checkedCircle: {
    backgroundColor: '#4caf50',
  },
  circleText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  timerIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  timerText: {
    fontSize: 16,
    marginLeft: 10,
  },
  disabledText: {
    color: '#999',
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
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
});
