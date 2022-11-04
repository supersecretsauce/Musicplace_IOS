import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ActivityScreen from '../screens/activity/ActivityScreen';
import DirectMessagesScreen from '../screens/activity/DirectMessagesScreen';
const ActivityStackScreen = () => {
  const ActivityStack = createNativeStackNavigator();

  return (
    <ActivityStack.Navigator screenOptions={{headerShown: false}}>
      <ActivityStack.Screen name="ActivityScreen" component={ActivityScreen} />
      <ActivityStack.Screen
        name="DirectMessagesScreen"
        component={DirectMessagesScreen}
      />
    </ActivityStack.Navigator>
  );
};

export default ActivityStackScreen;
