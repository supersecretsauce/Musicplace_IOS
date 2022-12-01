import React, {useState, useEffect, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProfileStackScreen from './src/routes/ProfileStackScreen';
import {Context} from './src/context/Context';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {StyleSheet, StatusBar} from 'react-native';
import Toast from 'react-native-toast-message';
import HomeStackScreen from './src/routes/HomeStackScreen';
import WelcomeStackScreen from './src/routes/WelcomeStackScreen';
import ActivityStackScreen from './src/routes/ActivityStackScreen';
import {mixpanel} from './mixpanel';
import notifee, {EventType} from '@notifee/react-native';
import DiscoverStackScreen from './src/routes/DiscoverStackScreen';
import {AppState} from 'react-native';
import firestore from '@react-native-firebase/firestore';

mixpanel.init();
const Tab = createBottomTabNavigator();
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
  const [initialFeed, setInitialFeed] = useState(null);
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
            initialFeed,
            setInitialFeed,
          }}>
          {userLogin ? (
            <Tab.Navigator
              screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => {
                  let iconName;

                  if (route.name === 'Home') {
                    iconName = focused ? 'home-sharp' : 'home-outline';
                  } else if (route.name === 'Discover') {
                    iconName = focused ? 'ear-sharp' : 'ear-outline';
                  } else if (route.name === 'Discover') {
                    iconName = focused ? 'add-sharp' : 'add-outline';
                  } else if (route.name === 'Activity') {
                    iconName = focused
                      ? 'notifications-sharp'
                      : 'notifications-outline';
                  } else if (route.name === 'Profile') {
                    iconName = focused ? 'person-sharp' : 'person-outline';
                  }

                  // You can return any component that you like here!
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: 'grey',
                tabBarInactiveBackgroundColor: 'black',
                tabBarActiveBackgroundColor: 'black',
                headerShown: false,
                tabBarStyle: {backgroundColor: 'black'},
              })}>
              <Tab.Screen name="Home" component={HomeStackScreen} />
              {/* <Tab.Screen name="Discover" component={ActivityStackScreen} /> */}
              <Tab.Screen name="Discover" component={DiscoverStackScreen} />
              <Tab.Screen name="Activity" component={ActivityStackScreen} />
              <Tab.Screen name="Profile" component={ProfileStackScreen} />
            </Tab.Navigator>
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
