import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FeedScreen from '../screens/feed/FeedScreen';
import ViewUserScreen from '../screens/home/ViewUserScreen';
import ViewPostsScreen from '../screens/profile/ViewPostsScreen';
import AddFriends from '../screens/activity/AddFriends';
const FeedStackScreen = () => {
  const FeedStack = createNativeStackNavigator();

  return (
    <FeedStack.Navigator screenOptions={{headerShown: false}}>
      <FeedStack.Screen name="FeedScreen" component={FeedScreen} />
      <FeedStack.Screen name="ViewUserScreen" component={ViewUserScreen} />
      <FeedStack.Screen name="ViewPostsScreen" component={ViewPostsScreen} />
      <FeedStack.Screen name="AddFriends" component={AddFriends} />
    </FeedStack.Navigator>
  );
};

export default FeedStackScreen;
