import {StyleSheet} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ViewUserScreen from '../screens/home/ViewUserScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ViewPostsScreen from '../screens/profile/ViewPostsScreen';
import DirectMessageScreen from '../screens/activity/DirectMessageScreen';
import AddFriends from '../screens/activity/AddFriends';
const PostStack = createNativeStackNavigator();
const HomeStackScreen = () => {
  return (
    <PostStack.Navigator screenOptions={{headerShown: false}}>
      <PostStack.Screen name="HomeScreen" component={HomeScreen} />
      <PostStack.Screen name="ViewUserScreen" component={ViewUserScreen} />
      <PostStack.Screen name="ViewPostsScreen" component={ViewPostsScreen} />
      <PostStack.Screen
        name="DirectMessageScreen"
        component={DirectMessageScreen}
      />
      <PostStack.Screen name="AddFriends" component={AddFriends} />
    </PostStack.Navigator>
  );
};

export default HomeStackScreen;

const styles = StyleSheet.create({});
