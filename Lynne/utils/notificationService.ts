import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export interface NotificationSettings {
  preNotificationTime: number; // minutes before target time
  reminderInterval: number; // minutes between reminders
  stopRemindersAfterCheckIn: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  preNotificationTime: 10,
  reminderInterval: 10,
  stopRemindersAfterCheckIn: true,
};

export const initializeNotifications = async () => {
  await Notifications.requestPermissionsAsync();
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error reading notification settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveNotificationSettings = async (settings: NotificationSettings) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
};

export const scheduleNotifications = async (targetTime: Date, settings: NotificationSettings) => {
  // Cancel any existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const scheduledTime = new Date(targetTime);
  
  // Set time for today
  scheduledTime.setFullYear(now.getFullYear());
  scheduledTime.setMonth(now.getMonth());
  scheduledTime.setDate(now.getDate());

  // Schedule pre-notification
  const preNotificationTime = new Date(scheduledTime);
  preNotificationTime.setMinutes(preNotificationTime.getMinutes() - settings.preNotificationTime);

  if (preNotificationTime > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Lynne Birth Control Reminder",
        body: `Time to take your birth control in ${settings.preNotificationTime} minutes!`,
        sound: true,
      },
      trigger: preNotificationTime,
    });
  }

  // Schedule main notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Lynne Birth Control Reminder",
      body: "It's time to take your birth control!",
      sound: true,
    },
    trigger: scheduledTime,
  });

  // Schedule follow-up reminders
  if (settings.reminderInterval > 0) {
    for (let i = 1; i <= 6; i++) { // Up to 6 follow-up reminders
      const reminderTime = new Date(scheduledTime);
      reminderTime.setMinutes(reminderTime.getMinutes() + (settings.reminderInterval * i));
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Birth Control Reminder",
          body: "Did you know that it cost ~400K to raise a child to 17 years in California?",
          sound: true,
        },
        trigger: reminderTime,
      });
    }
  }
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
}; 