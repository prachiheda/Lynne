import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CheckInStatus = 'onTime' | 'slightlyLate' | 'veryLate' | 'missed' | null;

export default function CalendarScreen() {
  const screenWidth = Dimensions.get('window').width;
  const insets = useSafeAreaInsets();
  
  // Get current date info
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.toLocaleString('default', { month: 'long' });

  // Calendar data
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfMonth = new Date(2025, 0, 1).getDay(); // 0-6, 0 is Sunday

  // Mock status data (only up to January 25th)
  const mockStatuses: Record<number, CheckInStatus> = {
    1: 'onTime',
    2: 'slightlyLate',
    3: 'veryLate',
    4: 'missed',
    5: 'missed',
    6: 'missed',
    7: 'onTime',
    8: 'onTime',
    9: 'slightlyLate',
    10: 'veryLate',
    11: 'missed',
    12: 'missed',
    13: 'missed',
    14: 'missed',
    15: 'veryLate',
    16: 'slightlyLate',
    17: 'onTime',
    18: 'onTime',
    19: 'missed',
    20: 'missed',
    21: 'onTime',
    22: 'slightlyLate',
    23: 'onTime',
    24: 'veryLate',
    25: 'onTime',
  };

  const getStatusColor = (status: CheckInStatus): string => {
    switch (status) {
      case 'onTime': return '#c9cba3';
      case 'slightlyLate': return '#ffe1a8';
      case 'veryLate': return '#f19c79';
      case 'missed': return '#a44a3f';
      default: return 'transparent';
    }
  };

  const renderCalendarGrid = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const rows = [];
    let currentRow = [];

    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentRow.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Add the days
    days.forEach((day) => {
      const status = mockStatuses[day] || null;
      const dayStyle = [
        styles.dayCell,
        status && styles.circle,
        status && { backgroundColor: getStatusColor(status) }
      ];
      
      currentRow.push(
        <View key={day} style={dayStyle}>
          <Text style={[
            styles.dayText,
            status === 'missed' && styles.missedDayText
          ]}>
            {day}
          </Text>
        </View>
      );

      if (currentRow.length === 7) {
        rows.push(
          <View key={rows.length} style={styles.row}>
            {currentRow}
          </View>
        );
        currentRow = [];
      }
    });

    // Add the remaining days to the last row
    if (currentRow.length > 0) {
      // Fill the remaining spaces with empty cells to maintain alignment
      while (currentRow.length < 7) {
        currentRow.push(<View key={`empty-end-${currentRow.length}`} style={styles.dayCell} />);
      }
      rows.push(
        <View key={rows.length} style={styles.row}>
          {currentRow}
        </View>
      );
    }

    return rows;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Calendar</Text>
      
      <View style={styles.mainContainer}>
        <Text style={styles.monthYear}>{currentMonth} {currentYear}</Text>
        
        {/* Days of week header */}
        <View style={styles.row}>
          {daysOfWeek.map(day => (
            <View key={day} style={styles.dayCell}>
              <Text style={styles.dayHeader}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {renderCalendarGrid()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  mainContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 24,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayCell: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  circle: {
    borderRadius: 17.5,
  },
  dayText: {
    fontSize: 16,
    color: '#000000',
  },
  missedDayText: {
    color: '#FFFFFF',
  },
  dayHeader: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
});
