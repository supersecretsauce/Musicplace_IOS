import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ActivityScreen from '../screens/activity/ActivityScreen';
import NoMessagesScreen from '../screens/activity/NoMessagesScreen';
import InviteContactsScreen from '../screens/activity/InviteContactsScreen';
import AddFriends from '../screens/activity/AddFriends';
import ViewUserScreen from '../screens/home/ViewUserScreen';
import DirectMessageScreen from '../screens/activity/DirectMessageScreen';
import NewChatScreen from '../screens/activity/NewChatScreen';
import ViewPostsScreen from '../screens/profile/ViewPostsScreen';
import ViewAllActivityScreen from '../screens/activity/ViewAllActivityScreen';
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
      <ActivityStack.Screen name="AddFriends" component={AddFriends} />
      <ActivityStack.Screen name="ViewUserScreen" component={ViewUserScreen} />
      <ActivityStack.Screen
        name="DirectMessageScreen"
        component={DirectMessageScreen}
      />
      <ActivityStack.Screen
        name="ViewPostsScreen"
        component={ViewPostsScreen}
      />
    </ActivityStack.Navigator>
  );
};

export default ActivityStackScreen;
