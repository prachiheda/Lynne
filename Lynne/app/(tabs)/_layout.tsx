import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#46403A",
        tabBarInactiveTintColor: "#908E8E",
        tabBarStyle: {
          backgroundColor: '#f2f2f2',
          position: 'absolute',
          elevation: 0,
          borderTopWidth: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="chat/index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="chat" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar/index"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="calendar-today" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.homeButton, focused && styles.homeButtonActive,]}>
              <MaterialIcons name="home" size={30} color={'white'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="education/index"
        options={{
          title: "Education",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="school" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  homeButton: {
    backgroundColor: '#46403A',
    padding: 10,
    borderRadius: 25,
    marginBottom: 20,
    width: 70,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
    position: 'absolute',
  },
  homeButtonActive: {
    shadowColor: "#46403A", 
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6, // Intensity of the glow
    shadowRadius: 15, // Glow size
    elevation: 15, // Glow for Android
  },
});
