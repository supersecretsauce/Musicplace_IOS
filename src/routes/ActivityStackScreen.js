import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ActivityScreen from '../screens/activity/ActivityScreen';
import NoMessagesScreen from '../screens/activity/NoMessagesScreen';
import InviteContactsScreen from '../screens/activity/InviteContactsScreen';
import AddFriends from '../screens/activity/AddFriends';
import ViewUserScreen from '../screens/home/ViewUserScreen';
import NewChatScreen from '../screens/activity/NewChatScreen';
import ViewPostsScreen from '../screens/profile/ViewPostsScreen';
import ViewAllActivityScreen from '../screens/activity/ViewAllActivityScreen';
import ViewAllMessagesScreen from '../screens/activity/ViewAllMessagesScreen';
import DMDrawerRoute from './DMDrawerRoute';
import ProfileStackScreen from './ProfileStackScreen';
const ActivityStackScreen = () => {
  const ActivityStack = createNativeStackNavigator();

  return (
    <ActivityStack.Navigator screenOptions={{headerShown: false}}>
      <ActivityStack.Screen name="ActivityScreen" component={ActivityScreen} />
      <ActivityStack.Screen
        name="NoMessagesScreen"
        component={NoMessagesScreen}
      />
      <ActivityStack.Screen name="NewChatScreen" component={NewChatScreen} />
      <ActivityStack.Screen
        name="InviteContactsScreen"
        component={InviteContactsScreen}
      />
      <ActivityStack.Screen
        name="ViewAllActivityScreen"
        component={ViewAllActivityScreen}
      />
      <ActivityStack.Screen
        name="ViewAllMessagesScreen"
        component={ViewAllMessagesScreen}
      />
      <ActivityStack.Screen name="AddFriends" component={AddFriends} />
      <ActivityStack.Screen name="ViewUserScreen" component={ViewUserScreen} />
      <ActivityStack.Screen name="DMDrawerRoute" component={DMDrawerRoute} />
      <ActivityStack.Screen
        name="ViewPostsScreen"
        component={ViewPostsScreen}
      />
      <ActivityStack.Screen
        name="ProfileStackScreen"
        component={ProfileStackScreen}
      />
    </ActivityStack.Navigator>
  );
};

export default ActivityStackScreen;
