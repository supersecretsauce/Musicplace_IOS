import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FeedScreen from '../screens/feed/FeedScreen';
import ViewUserScreen from '../screens/home/ViewUserScreen';
const FeedStackScreen = () => {
  const FeedStack = createNativeStackNavigator();

  return (
    <FeedStack.Navigator screenOptions={{headerShown: false}}>
      <FeedStack.Screen name="FeedScreen" component={FeedScreen} />
      <FeedStack.Screen name="ViewUserScreen" component={ViewUserScreen} />
    </FeedStack.Navigator>
  );
};

export default FeedStackScreen;
