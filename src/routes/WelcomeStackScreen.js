import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ActivityScreen from '../screens/activity/ActivityScreen';
import WelcomeScreen from '../screens/signup/WelcomeScreen';
import PhoneNumberScreen from '../screens/signup/PhoneNumberScreen';
import EnterCodeScreen from '../screens/signup/EnterCodeScreen';
import CreateUsernameScreen from '../screens/signup/CreateUsernameScreen';
import ConnectSpotifyScreen from '../screens/signup/ConnectSpotifyScreen';
import SwipeUpScreen from '../screens/signup/SwipeUpScreen';
import SwipeRightScreen from '../screens/signup/SwipeRightScreen';
import ExistingPhoneNumberScreen from '../screens/signup/ExistingPhoneNumberScreen';
import ExistingCodeScreen from '../screens/signup/ExistingCodeScreen';
import SelectGenresScreen from '../screens/signup/SelectGenresScreen';
import WaitlistScreen from '../screens/signup/WaitlistScreen';
const WelcomeStackScreen = () => {
  const WelcomeStack = createNativeStackNavigator();
  return (
    <WelcomeStack.Navigator screenOptions={{headerShown: false}}>
      <WelcomeStack.Screen name="WelcomeScreen" component={WelcomeScreen} />

      <WelcomeStack.Screen
        name="PhoneNumberScreen"
        component={PhoneNumberScreen}
      />
      <WelcomeStack.Screen name="WaitlistScreen" component={WaitlistScreen} />
      <WelcomeStack.Screen name="EnterCodeScreen" component={EnterCodeScreen} />
      <WelcomeStack.Screen
        name="CreateUsernameScreen"
        component={CreateUsernameScreen}
      />
      <WelcomeStack.Screen
        name="ConnectSpotifyScreen"
        component={ConnectSpotifyScreen}
      />
      <WelcomeStack.Screen
        name="SelectGenresScreen"
        component={SelectGenresScreen}
      />
      <WelcomeStack.Screen name="SwipeUpScreen" component={SwipeUpScreen} />
      <WelcomeStack.Screen
        name="SwipeRightScreen"
        component={SwipeRightScreen}
      />
      <WelcomeStack.Screen
        name="ExistingPhoneNumberScreen"
        component={ExistingPhoneNumberScreen}
      />
      <WelcomeStack.Screen
        name="ExistingCodeScreen"
        component={ExistingCodeScreen}
      />
    </WelcomeStack.Navigator>
  );
};

export default WelcomeStackScreen;
