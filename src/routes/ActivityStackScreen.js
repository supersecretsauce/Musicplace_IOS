import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ActivityScreen from '../screens/activity/ActivityScreen';
import NoMessagesScreen from '../screens/activity/NoMessagesScreen';
import InviteContactsScreen from '../screens/activity/InviteContactsScreen';
const ActivityStackScreen = () => {
  const ActivityStack = createNativeStackNavigator();

  return (
    <ActivityStack.Navigator screenOptions={{headerShown: false}}>
      <ActivityStack.Screen name="ActivityScreen" component={ActivityScreen} />
      <ActivityStack.Screen
        name="NoMessagesScreen"
        component={NoMessagesScreen}
      />
      <ActivityStack.Screen
        name="InviteContactsScreen"
        component={InviteContactsScreen}
      />
    </ActivityStack.Navigator>
  );
};

export default ActivityStackScreen;
