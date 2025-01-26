import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import EducationScreen from '../(tabs)/education/index';
import { Linking } from 'react-native';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Education" component={EducationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;

// In the EducationScreen component, modify the onPress for the first article
// onPress={() => Linking.openURL('https://www.medicalnewstoday.com/articles/290196')}
