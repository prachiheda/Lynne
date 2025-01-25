import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  EXPO_REDIRECT_URI,
} from '@env';

const GOOGLE_AUTH_KEY = 'google_auth';

interface TimeSlot {
  start: Date;
  end: Date;
}

interface ConflictRecommendation {
  conflictEvent: {
    summary: string;
    start: Date;
    end: Date;
  };
  recommendedTimes: {
    before: Date | null;
    after: Date | null;
  };
}

export const signInWithGoogle = async () => {
  try {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      EXPO_REDIRECT_URI
    )}&response_type=token&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly')}&access_type=offline&prompt=consent`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, EXPO_REDIRECT_URI);
    console.log('Auth result:', result);

    if (result.type === 'success') {
      const params = new URLSearchParams(result.url.split('#')[1]);
      const accessToken = params.get('access_token');
      if (accessToken) {
        await AsyncStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify({ accessToken }));
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Google sign in error:', error);
    return false;
  }
};

export const checkForConflicts = async (targetTime: Date): Promise<ConflictRecommendation | null> => {
  try {
    const authData = await AsyncStorage.getItem(GOOGLE_AUTH_KEY);
    if (!authData) return null;

    const { accessToken } = JSON.parse(authData);

    // Get start and end of the day
    const startOfDay = new Date(targetTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetTime);
    endOfDay.setHours(23, 59, 59, 999);

    // Get events for the day
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    const events = data.items || [];
    const targetHour = targetTime.getHours();
    const targetMinute = targetTime.getMinutes();

    // Find conflicts
    for (const event of events) {
      const eventStart = new Date(event.start?.dateTime || event.start?.date);
      const eventEnd = new Date(event.end?.dateTime || event.end?.date);

      // Check if target time falls within event
      if (
        eventStart.getHours() <= targetHour &&
        eventEnd.getHours() >= targetHour &&
        eventStart.getMinutes() <= targetMinute &&
        eventEnd.getMinutes() >= targetMinute
      ) {
        // Find available slots before and after event
        const beforeSlot = findAvailableSlot(events, {
          start: new Date(eventStart.getTime() - 60 * 60 * 1000), // 1 hour before
          end: eventStart,
        });

        const afterSlot = findAvailableSlot(events, {
          start: eventEnd,
          end: new Date(eventEnd.getTime() + 60 * 60 * 1000), // 1 hour after
        });

        return {
          conflictEvent: {
            summary: event.summary || 'Busy',
            start: eventStart,
            end: eventEnd,
          },
          recommendedTimes: {
            before: beforeSlot ? new Date(beforeSlot.start.getTime() + 30 * 60 * 1000) : null, // 30 min after slot starts
            after: afterSlot ? new Date(afterSlot.start.getTime() + 5 * 60 * 1000) : null, // 5 min after slot starts
          },
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking calendar conflicts:', error);
    return null;
  }
};

const findAvailableSlot = (events: any[], targetSlot: TimeSlot): TimeSlot | null => {
  // Check if the slot overlaps with any events
  for (const event of events) {
    const eventStart = new Date(event.start?.dateTime || event.start?.date);
    const eventEnd = new Date(event.end?.dateTime || event.end?.date);

    if (
      (targetSlot.start >= eventStart && targetSlot.start <= eventEnd) ||
      (targetSlot.end >= eventStart && targetSlot.end <= eventEnd)
    ) {
      return null;
    }
  }

  return targetSlot;
}; 