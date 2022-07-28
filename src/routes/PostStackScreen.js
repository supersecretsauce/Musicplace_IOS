import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PostASongScreen from '../screens/post/PostASongScreen';
import CompletePostScreen from '../screens/post/CompletePostScreen';

const PostStackScreen = () => {
  const PostStack = createNativeStackNavigator();

  return (
    <PostStack.Navigator screenOptions={{headerShown: false}}>
      <PostStack.Screen name="PostASongScreen" component={PostASongScreen} />
      <PostStack.Screen
        name="CompletePostScreen"
        component={CompletePostScreen}
      />
    </PostStack.Navigator>
  );
};

export default PostStackScreen;

const styles = StyleSheet.create({});
