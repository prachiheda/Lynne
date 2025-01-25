import AsyncStorage from '@react-native-async-storage/async-storage';

const CHECKIN_KEY = 'checkin_history';

export type CheckInStatus = 'onTime' | 'slightlyLate' | 'veryLate' | 'missed';

export interface CheckInData {
  status: CheckInStatus;
  timestamp: string;
  targetTime: string;
}

export interface CheckInHistory {
  [date: string]: CheckInData;
}

export const getCheckInHistory = async (): Promise<CheckInHistory> => {
  try {
    const data = await AsyncStorage.getItem(CHECKIN_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading check-in history:', error);
    return {};
  }
};

export const saveCheckIn = async (
  date: string,
  status: CheckInStatus,
  timestamp: string,
  targetTime: string
) => {
  try {
    const history = await getCheckInHistory();
    history[date] = { status, timestamp, targetTime };
    await AsyncStorage.setItem(CHECKIN_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving check-in:', error);
  }
};

export const getCheckInStatus = (timeDiff: number): CheckInStatus => {
  if (timeDiff <= 5) {
    return 'onTime';
  } else if (timeDiff <= 15) {
    return 'slightlyLate';
  } else if (timeDiff <= 60) {
    return 'veryLate';
  } else {
    return 'missed';
  }
}; 