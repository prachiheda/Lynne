import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getCheckInHistory, type CheckInHistory, type CheckInStatus } from '../../../utils/checkInStorage';

// Mock data for the last month
const generateMockData = () => {
  const mockData: CheckInHistory = {};
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  // Generate data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(lastMonth);
    date.setDate(lastMonth.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Randomly assign statuses with a bias towards 'onTime'
    const rand = Math.random();
    let status: CheckInStatus;
    if (rand < 0.7) {
      status = 'onTime'; // 70% chance
    } else if (rand < 0.85) {
      status = 'slightlyLate'; // 15% chance
    } else if (rand < 0.95) {
      status = 'veryLate'; // 10% chance
    } else {
      status = 'missed'; // 5% chance
    }

    mockData[dateStr] = {
      status,
      timestamp: date.toISOString(),
      targetTime: date.toISOString(),
    };
  }

  // Ensure at least one of each status exists
  const ensureStatuses: Array<{ date: number, status: CheckInStatus }> = [
    { date: -5, status: 'slightlyLate' },
    { date: -3, status: 'veryLate' },
    { date: -1, status: 'missed' },
  ];

  ensureStatuses.forEach(({ date, status }) => {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + date);
    const dateStr = targetDate.toISOString().split('T')[0];
    mockData[dateStr] = {
      status,
      timestamp: targetDate.toISOString(),
      targetTime: targetDate.toISOString(),
    };
  });

  return mockData;
};

export default function CalendarScreen() {
  const [checkIns, setCheckIns] = useState<CheckInHistory>({});
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    loadCheckInHistory();
  }, []);

  const loadCheckInHistory = async () => {
    const history = await getCheckInHistory();
    const mockHistory = generateMockData();
    setCheckIns({ ...mockHistory, ...history });
  };

  const getDotColor = (status: string) => {
    switch (status) {
      case 'onTime':
        return '#4CAF50';
      case 'slightlyLate':
        return '#FFD700';
      case 'veryLate':
        return '#FF8C00';
      case 'missed':
        return '#DC143C';
      default:
        return '#CCCCCC';
    }
  };

  const markedDates = Object.entries(checkIns).reduce((acc, [date, data]) => {
    acc[date] = {
      marked: true,
      dotColor: getDotColor(data.status),
    };
    return acc;
  }, {} as any);

  return (
    <View style={[styles.container, { width: screenWidth, height: screenHeight }]}>
      <Calendar
        style={styles.calendar}
        markedDates={markedDates}
        theme={{
          textDayFontSize: 16,
          textDayFontWeight: '400',
          textDayStyle: { color: 'black' },
          textMonthFontSize: 20,
          textMonthFontWeight: 'bold',
          monthTextColor: 'black',
          textSectionTitleColor: 'black',
          dayTextColor: 'black',
          todayTextColor: 'black',
          arrowColor: 'black',
          dotStyle: {
            width: 6,
            height: 6,
            borderRadius: 3,
            marginTop: 2,
          },
        }}
        enableSwipeMonths={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },
  calendar: {
    alignSelf: 'center', // Ensure it's horizontally centered
  },
});
