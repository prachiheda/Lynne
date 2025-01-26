import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const CALENDAR_DATA_KEY = 'calendar_data';

interface TimeSlot {
  start: Date;
  end: Date;
}

interface CalendarEvent {
  summary: string;
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

// Mock function to simulate Google Sign in and load mock data
export const signInWithGoogle = async () => {
  try {
    // Read the mock ICS file from constants
    const mockEvents = [
      {
        summary: "Morning Meeting",
        start: new Date(2024, 3, 15, 9, 0),
        end: new Date(2024, 3, 15, 10, 0)
      },
      {
        summary: "Lunch with Team",
        start: new Date(2024, 3, 15, 12, 0),
        end: new Date(2024, 3, 15, 13, 0)
      },
      {
        summary: "Project Review",
        start: new Date(2024, 3, 15, 14, 0),
        end: new Date(2024, 3, 15, 15, 30)
      },
      {
        summary: "Gym",
        start: new Date(2024, 3, 15, 17, 0),
        end: new Date(2024, 3, 15, 18, 0)
      }
    ];

    await AsyncStorage.setItem(CALENDAR_DATA_KEY, JSON.stringify({ 
      isConnected: true,
      events: mockEvents 
    }));
    return true;
  } catch (error) {
    console.error('Error loading mock calendar data:', error);
    return false;
  }
};

export const checkForConflicts = async (targetTime: Date): Promise<ConflictRecommendation | null> => {
  try {
    const calendarData = await AsyncStorage.getItem(CALENDAR_DATA_KEY);
    if (!calendarData) return null;

    const { events } = JSON.parse(calendarData);
    if (!events) return null;

    const targetHour = targetTime.getHours();
    const targetMinute = targetTime.getMinutes();

    // Find conflicts
    for (const event of events) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

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
            before: beforeSlot ? new Date(beforeSlot.start.getTime() + 30 * 60 * 1000) : null,
            after: afterSlot ? new Date(afterSlot.start.getTime() + 5 * 60 * 1000) : null,
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

const findAvailableSlot = (events: CalendarEvent[], targetSlot: TimeSlot): TimeSlot | null => {
  // Check if the slot overlaps with any events
  for (const event of events) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    if (
      (targetSlot.start >= eventStart && targetSlot.start <= eventEnd) ||
      (targetSlot.end >= eventStart && targetSlot.end <= eventEnd)
    ) {
      return null;
    }
  }

  return targetSlot;
}; 