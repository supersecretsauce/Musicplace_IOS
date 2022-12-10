import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import PlaylistTracksScreen from '../screens/discover/PlaylistTracksScreen';
import AddFriends from '../screens/activity/AddFriends';
import ViewUserScreen from '../screens/home/ViewUserScreen';
import RadioScreen from '../screens/discover/RadioScreen';
const DiscoverStackScreen = () => {
  const ActivityStack = createNativeStackNavigator();

  return (
    <ActivityStack.Navigator screenOptions={{headerShown: false}}>
      <ActivityStack.Screen name="DiscoverScreen" component={DiscoverScreen} />
      <ActivityStack.Screen
        name="PlaylistTracksScreen"
        component={PlaylistTracksScreen}
      />
      <ActivityStack.Screen name="RadioScreen" component={RadioScreen} />
      <ActivityStack.Screen name="AddFriends" component={AddFriends} />
      <ActivityStack.Screen name="ViewUserScreen" component={ViewUserScreen} />
    </ActivityStack.Navigator>
  );
};

export default DiscoverStackScreen;
