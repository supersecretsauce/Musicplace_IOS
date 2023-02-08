import {View, Text} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Context} from './src/context/Context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StatusBar} from 'react-native';
import Toast from 'react-native-toast-message';
import WelcomeStackScreen from './src/routes/WelcomeStackScreen';
import {mixpanel} from './mixpanel';
import notifee, {EventType} from '@notifee/react-native';
import {AppState} from 'react-native';
import TabNavigator from './src/routes/TabNavigator';
import JailMonkey from 'jail-monkey';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

mixpanel.init();
const Stack = createNativeStackNavigator();

export default function App() {
  const [confirm, setConfirm] = useState(null);
  const [userLogin, setUserLogin] = useState(false);
  const [currentTrack, setCurrentTrack] = useState();
  const [hasSpotify, setHasSpotify] = useState(null);
  const [feed, setFeed] = useState(null);
  const [UID, setUID] = useState(null);
  const [isNewUser, setIsNewUser] = useState(null);
  const [invitesRemaining, setInvitesRemaining] = useState(null);
  const appState = useRef(AppState.currentState);
  const navigationRef = useRef();
  const viewingSwiperRef = useRef();
  const [swiperIndex, setSwiperIndex] = useState(0);
  const [fetchingTopSongs, setFetchingTopSongs] = useState(false);
  const [feedTrack, setFeedTrack] = useState(null);

  // AsyncStorage.clear();

  // Bootstrap sequence function
  async function bootstrap() {
    const initialNotification = await notifee.getInitialNotification();

    if (initialNotification) {
      console.log(initialNotification);
      navigationRef.current.navigate('Activity', {screen: 'ActivityScreen'});
      notifee.setBadgeCount(0).then(() => console.log('Badge count removed'));
    }
  }

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        notifee.setBadgeCount(0).then(() => console.log('Badge count removed'));
        bootstrap();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    return notifee.onForegroundEvent(({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          mixpanel.track('Open From Notification');
          navigationRef.current.navigate('Activity', {
            screen: 'ActivityScreen',
          });

          break;
      }
    });
  }, []);

  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        const value = await AsyncStorage.getItem('user');
        if (value === null) {
          return;
        } else {
          setUserLogin(true);
        }
      } catch (e) {
        console.log(e);
      }
    };

    checkUserLogin();
  }, []);

  useEffect(() => {
    async function checkNotiToken() {
      if (UID) {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          messaging()
            .getToken()
            .then(token => {
              firestore()
                .collection('users')
                .doc(UID)
                .update({
                  notificationToken: token,
                })
                .then(() => {
                  console.log('token pushed!');
                });
            })
            .catch(e => {
              console.log(e);
            });
        } else {
          // console.log(authStatus);
        }
      }
    }
    checkNotiToken();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer ref={navigationRef}>
        <StatusBar barStyle="light-content" />
        <Context.Provider
          value={{
            confirm,
            setConfirm,
            setUserLogin,
            currentTrack,
            setCurrentTrack,
            hasSpotify,
            setHasSpotify,
            UID,
            setUID,
            feed,
            setFeed,
            isNewUser,
            setIsNewUser,
            invitesRemaining,
            setInvitesRemaining,
            viewingSwiperRef,
            swiperIndex,
            setSwiperIndex,
            fetchingTopSongs,
            setFetchingTopSongs,
            feedTrack,
            setFeedTrack,
          }}>
          {JailMonkey.isJailBroken() ? (
            <>
              <View
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'black',
                }}>
                <Text style={{color: 'white'}}>
                  Musicplace does not support jailbroken devices
                </Text>
              </View>
            </>
          ) : (
            <>
              {userLogin ? (
                <Stack.Navigator
                  screenOptions={{
                    headerShown: false,
                  }}>
                  <Stack.Screen name="TabNavigator" component={TabNavigator} />
                </Stack.Navigator>
              ) : (
                <Stack.Navigator
                  screenOptions={{
                    headerShown: false,
                  }}>
                  <Stack.Screen
                    name="WelcomeStackScreen"
                    component={WelcomeStackScreen}
                  />
                </Stack.Navigator>
              )}
            </>
          )}

          <Toast />
        </Context.Provider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
