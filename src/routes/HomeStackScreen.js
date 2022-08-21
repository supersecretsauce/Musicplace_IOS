import {StyleSheet, Text, View} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ViewUserScreen from '../screens/home/ViewUserScreen';
import HomeScreen from '../screens/home/HomeScreen';
import {Context} from '../context/Context';
import HomeTest from '../screens/home/HomeTest';
const HomeStackScreen = () => {
  const PostStack = createNativeStackNavigator();

  return (
    <PostStack.Navigator screenOptions={{headerShown: false}}>
      <PostStack.Screen name="HomeScreen" component={HomeTest} />
      <PostStack.Screen name="ViewUserScreen" component={ViewUserScreen} />
    </PostStack.Navigator>
  );
};

export default HomeStackScreen;

const styles = StyleSheet.create({});
