import {View, Text} from 'react-native';
import React, {useEffect, useRef} from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import {AppState} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';

const AppSwitcher = () => {
  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);

  // Bootstrap sequence function
  async function bootstrap() {
    const initialNotification = await notifee.getInitialNotification();

    if (initialNotification) {
      console.log(
        'Notification caused application to open',
        initialNotification.notification,
      );
      console.log(
        'Press action used to open the app',
        initialNotification.pressAction,
      );
      navigation.navigate('ActivityStackScreen');
    }
  }

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        bootstrap();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);
};

export default AppSwitcher;
