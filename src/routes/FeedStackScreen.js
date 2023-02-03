import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FeedScreen from '../screens/feed/FeedScreen';
import ViewUserScreen from '../screens/home/ViewUserScreen';
import AddFriends from '../screens/activity/AddFriends';
import ProfileStackScreen from './ProfileStackScreen';
import SinglePostDrawerRoute from './SinglePostDrawerRoute';
const FeedStackScreen = () => {
  const FeedStack = createNativeStackNavigator();

  return (
    <FeedStack.Navigator screenOptions={{headerShown: false}}>
      <FeedStack.Screen name="FeedScreen" component={FeedScreen} />
      <FeedStack.Screen name="ViewUserScreen" component={ViewUserScreen} />
      <FeedStack.Screen
        name="SinglePostDrawerRoute"
        component={SinglePostDrawerRoute}
      />
      <FeedStack.Screen name="AddFriends" component={AddFriends} />
      <FeedStack.Screen
        name="ProfileStackScreen"
        component={ProfileStackScreen}
      />
    </FeedStack.Navigator>
  );
};

export default FeedStackScreen;
