import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
const DiscoverStackScreen = () => {
  const ActivityStack = createNativeStackNavigator();

  return (
    <ActivityStack.Navigator screenOptions={{headerShown: false}}>
      <ActivityStack.Screen name="DiscoverScreen" component={DiscoverScreen} />
    </ActivityStack.Navigator>
  );
};

export default DiscoverStackScreen;
