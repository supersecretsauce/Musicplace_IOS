import {StyleSheet, Text, View} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ViewUserScreen from '../screens/home/ViewUserScreen';
import {Context} from '../context/Context';
import HomeTest from '../screens/home/HomeTest';
import ViewUserScreen2 from '../screens/home/ViewUserScreen2';
import HomeScreen from '../screens/home/HomeScreen';
import ViewPostsScreen2 from '../screens/profile/ViewPostsScreen2';
const HomeStackScreen = () => {
  const PostStack = createNativeStackNavigator();

  return (
    <PostStack.Navigator screenOptions={{headerShown: false}}>
      <PostStack.Screen name="HomeScreen" component={HomeScreen} />
      <PostStack.Screen name="ViewUserScreen2" component={ViewUserScreen2} />
      <PostStack.Screen name="ViewPostsScreen2" component={ViewPostsScreen2} />
    </PostStack.Navigator>
  );
};

export default HomeStackScreen;

const styles = StyleSheet.create({});
