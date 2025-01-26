import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { signInWithGoogle } from './googleCalendarService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CALENDAR_DATA_KEY = 'calendar_data';

export const GoogleSignInButton: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if already connected
    AsyncStorage.getItem(CALENDAR_DATA_KEY).then(data => {
      if (data) {
        const { isConnected: connected } = JSON.parse(data);
        setIsConnected(connected);
      }
    });
  }, []);

  const handleConnect = async () => {
    const success = await signInWithGoogle();
    if (success) {
      setIsConnected(true);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={isConnected ? "Calendar Connected ✓" : "Connect Calendar"}
        onPress={handleConnect}
        color={isConnected ? "#4CAF50" : "#007AFF"}
      />
      {isConnected && (
        <Text style={styles.connectedText}>
          Using mock calendar data
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  connectedText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
