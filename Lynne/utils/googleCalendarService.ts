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
        start: new Date(2025, 0, 25, 9, 0),
        end: new Date(2025, 0, 25, 10, 0)
      },
      {
        summary: "Lunch with Team",
        start: new Date(2025, 0, 25, 12, 0),
        end: new Date(2025, 0, 25, 13, 0)
      },
      {
        summary: "Project Review",
        start: new Date(2025, 0, 25, 14, 0),
        end: new Date(2025, 0, 25, 15, 30)
      },
      {
        summary: "Gym",
        start: new Date(2025, 0, 25, 17, 0),
        end: new Date(2025, 0, 25, 18, 0)
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
    console.log('Calendar Data:', calendarData);
    if (!calendarData) return null;

    const { isConnected, events } = JSON.parse(calendarData);
    // Only check for conflicts if calendar is connected
    if (!isConnected || !events) return null;
    console.log('Events:', events);
    if (!events) return null;

    const targetHour = targetTime.getHours();
    const targetMinute = targetTime.getMinutes();
    console.log('Target time (local):', targetHour + ':' + targetMinute);

    // Find conflicts
    for (const event of events) {
      // Convert event times to local time
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      const eventStartHour = eventStart.getHours();
      const eventStartMinute = eventStart.getMinutes();
      const eventEndHour = eventEnd.getHours();
      const eventEndMinute = eventEnd.getMinutes();

      console.log(`Event: ${event.summary}`);
      console.log(`Event time (local): ${eventStartHour}:${eventStartMinute} - ${eventEndHour}:${eventEndMinute}`);
      console.log(`Checking against target time: ${targetHour}:${targetMinute}`);

      // Check if target time falls within event
      const isWithinHours = eventStartHour <= targetHour && eventEndHour >= targetHour;
      const isWithinMinutes = true; // Simplified for testing

      // Check if target time falls within event
      
      if (isWithinHours && isWithinMinutes) {
        console.log('Conflict found!');
        // Create recommended times (30 mins before event and 5 mins after)
        const beforeTime = new Date(eventStart);
        beforeTime.setMinutes(beforeTime.getMinutes() - 30);
        
        const afterTime = new Date(eventEnd);
        afterTime.setMinutes(afterTime.getMinutes() + 5);

        return {
          conflictEvent: {
            summary: event.summary,
            start: eventStart,
            end: eventEnd,
          },
          recommendedTimes: {
            before: beforeTime,
            after: afterTime,
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