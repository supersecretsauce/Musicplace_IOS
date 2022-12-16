import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FeedScreen from '../screens/feed/FeedScreen';
const FeedStackScreen = () => {
  const FeedStack = createNativeStackNavigator();

  return (
    <FeedStack.Navigator screenOptions={{headerShown: false}}>
      <FeedStack.Screen name="FeedScreen" component={FeedScreen} />
    </FeedStack.Navigator>
  );
};

export default FeedStackScreen;
