import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import HomeScreen from '../screens/home/HomeScreen';
const DiscoverStackScreen = () => {
  const ActivityStack = createNativeStackNavigator();

  return (
    <ActivityStack.Navigator screenOptions={{headerShown: false}}>
      <ActivityStack.Screen name="DiscoverScreen" component={DiscoverScreen} />
      <ActivityStack.Screen name="HomeScreen" component={HomeScreen} />
    </ActivityStack.Navigator>
  );
};

export default DiscoverStackScreen;
