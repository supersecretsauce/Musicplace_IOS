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
import firestore from '@react-native-firebase/firestore';
import TabNavigator from './src/routes/TabNavigator';
mixpanel.init();
const Stack = createNativeStackNavigator();

export default function App() {
  const [confirm, setConfirm] = useState(null);
  const [userLogin, setUserLogin] = useState(false);
  const [refreshToken, setRefreshToken] = useState('');
  const [currentTrack, setCurrentTrack] = useState();
  const [homeScreenFocus, setHomeScreenFocus] = useState();
  const [profileScreenFocus, setProfileScreenFocus] = useState();
  const [parentComments, setParentComments] = useState();
  const [accessToken, setAccessToken] = useState('');
  const [username, setUsername] = useState('');
  const [currentPost, setCurrentPost] = useState();
  const [hasSpotify, setHasSpotify] = useState(null);
  const [feed, setFeed] = useState(null);
  const [UID, setUID] = useState(null);
  const appState = useRef(AppState.currentState);
  const navigationRef = useRef();

  // AsyncStorage.clear();

  useEffect(() => {
    console.log('userLogin', userLogin);
  }, [userLogin]);

  // look for changes to access and refresh token
  useEffect(() => {
    if (UID) {
      const subscriber = firestore()
        .collection('users')
        .doc(UID)
        .onSnapshot(snapshot => {
          console.log(snapshot.data());
          setAccessToken(snapshot.data().spotifyAccessToken);
          setRefreshToken(snapshot.data().spotifyRefreshToken);
        });

      // Stop listening for updates when no longer required
      return () => subscriber();
    }
  }, []);

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
        console.log('App has come to the foreground!');
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

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer ref={navigationRef}>
        <StatusBar barStyle="light-content" />
        <Context.Provider
          value={{
            confirm,
            setConfirm,
            setUserLogin,
            refreshToken,
            setRefreshToken,
            currentTrack,
            setCurrentTrack,
            homeScreenFocus,
            setHomeScreenFocus,
            accessToken,
            setAccessToken,
            username,
            setUsername,
            currentPost,
            setCurrentPost,
            profileScreenFocus,
            setProfileScreenFocus,
            parentComments,
            setParentComments,
            hasSpotify,
            setHasSpotify,
            UID,
            setUID,
            feed,
            setFeed,
          }}>
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
          <Toast />
        </Context.Provider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
