import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getCheckInHistory, type CheckInHistory } from '../../../utils/checkInStorage';

export default function CalendarScreen() {
  const [checkIns, setCheckIns] = useState<CheckInHistory>({});

  useEffect(() => {
    loadCheckInHistory();
  }, []);

  const loadCheckInHistory = async () => {
    const history = await getCheckInHistory();
    setCheckIns(history);
  };

  // Define dot colors for different statuses
  const getDotColor = (status: string) => {
    switch (status) {
      case 'onTime':
        return '#4CAF50'; // Green
      case 'slightlyLate':
        return '#FFC107'; // Yellow
      case 'veryLate':
        return '#FF9800'; // Orange
      case 'missed':
        return '#F44336'; // Red
      default:
        return '#CCCCCC';
    }
  };

  // Format the marked dates for the calendar
  const markedDates = Object.entries(checkIns).reduce((acc, [date, data]) => {
    acc[date] = {
      marked: true,
      dotColor: getDotColor(data.status),
    };
    return acc;
  }, {} as any);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check-in History</Text>
      <Calendar
        style={styles.calendar}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#007AFF',
          selectedDayBackgroundColor: '#007AFF',
          dotStyle: {
            width: 8,
            height: 8,
            borderRadius: 4,
          },
        }}
      />
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
          <Text>On Time (±5 min)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#FFC107' }]} />
          <Text>Slightly Late (±15 min)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#FF9800' }]} />
          <Text>Very Late (±1 hour)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#F44336' }]} />
          <Text>Missed (>1 hour)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  calendar: {
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: 'white',
    padding: 10,
  },
  legend: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
}); 