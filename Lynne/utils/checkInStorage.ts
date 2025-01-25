import AsyncStorage from '@react-native-async-storage/async-storage';

const CHECKIN_KEY = 'checkin_history';
const DAILY_TARGET_TIME_KEY = 'daily_target_time';

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

export const getDailyTargetTime = async (): Promise<Date | null> => {
  try {
    const timeStr = await AsyncStorage.getItem(DAILY_TARGET_TIME_KEY);
    if (!timeStr) return null;
    return new Date(timeStr);
  } catch (error) {
    console.error('Error reading daily target time:', error);
    return null;
  }
};

export const setDailyTargetTime = async (time: Date) => {
  try {
    await AsyncStorage.setItem(DAILY_TARGET_TIME_KEY, time.toISOString());
  } catch (error) {
    console.error('Error saving daily target time:', error);
  }
};

export const getCheckInStatus = (timeDiff: number): CheckInStatus => {
  if (timeDiff <= 5) {
    return 'onTime';
  } else if (timeDiff <= 60) {
    return 'slightlyLate';
  } else if (timeDiff <= 180) {
    return 'veryLate';
  } else {
    return 'missed';
  }
}; 