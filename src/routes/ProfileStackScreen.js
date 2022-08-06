import {StyleSheet} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
const PostStackScreen = () => {
  const PostStack = createNativeStackNavigator();
  const config = {
    animation: 'spring',
    config: {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  };

  return (
    <PostStack.Navigator screenOptions={{headerShown: false}}>
      <PostStack.Screen name="ProfileScreen" component={ProfileScreen} />
      {/* <PostStack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{
          gestureDirection: 'vertical',
          transitionSpec: {
            open: config,
            close: config,
          },
        }}
      /> */}
    </PostStack.Navigator>
  );
};

export default PostStackScreen;

const styles = StyleSheet.create({});
