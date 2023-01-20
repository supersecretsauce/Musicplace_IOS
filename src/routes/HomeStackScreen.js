import {StyleSheet} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ViewUserScreen from '../screens/home/ViewUserScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ViewPostsScreen from '../screens/profile/ViewPostsScreen';
import DMDrawerRoute from './DMDrawerRoute';
import AddFriends from '../screens/activity/AddFriends';
import ProfileStackScreen from './ProfileStackScreen';
const PostStack = createNativeStackNavigator();
const HomeStackScreen = () => {
  return (
    <PostStack.Navigator screenOptions={{headerShown: false}}>
      <PostStack.Screen name="HomeScreen" component={HomeScreen} />
      <PostStack.Screen name="ViewUserScreen" component={ViewUserScreen} />
      <PostStack.Screen name="ViewPostsScreen" component={ViewPostsScreen} />
      <PostStack.Screen name="DMDrawerRoute" component={DMDrawerRoute} />
      <PostStack.Screen name="AddFriends" component={AddFriends} />
      <PostStack.Screen
        name="ProfileStackScreen"
        component={ProfileStackScreen}
      />
    </PostStack.Navigator>
  );
};

export default HomeStackScreen;

const styles = StyleSheet.create({});
