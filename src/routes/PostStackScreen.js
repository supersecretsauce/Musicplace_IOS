import {StyleSheet, Text, View} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PostASongScreen from '../screens/post/PostASongScreen';
import CompletePostScreen from '../screens/post/CompletePostScreen';
import {Context} from '../context/Context';
import ProfileScreen from '../screens/profile/ProfileScreen';

const PostStackScreen = () => {
  const PostStack = createNativeStackNavigator();

  return (
    <PostStack.Navigator screenOptions={{headerShown: false}}>
      <PostStack.Screen name="PostASongScreen" component={ProfileScreen} />
      <PostStack.Screen
        name="CompletePostScreen"
        component={CompletePostScreen}
      />
    </PostStack.Navigator>
  );
};

export default PostStackScreen;

const styles = StyleSheet.create({});
