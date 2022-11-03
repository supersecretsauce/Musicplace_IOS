import {StyleSheet} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ViewPostsScreen2 from '../screens/profile/ViewPostsScreen2';

const ProfileStackScreen = () => {
  const ProfileStack = createNativeStackNavigator();
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
    <ProfileStack.Navigator screenOptions={{headerShown: false}}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen
        name="ViewPostsScreen2"
        component={ViewPostsScreen2}
        options={{
          transitionSpec: {
            open: config,
            close: config,
          },
        }}
      />
    </ProfileStack.Navigator>
  );
};

export default ProfileStackScreen;

const styles = StyleSheet.create({});
