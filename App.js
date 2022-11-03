import React, {useState, useEffect, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AppState} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PostStackScreen from './src/routes/PostStackScreen';
import ProfileStackScreen from './src/routes/ProfileStackScreen';
import {Context} from './src/context/Context';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {StyleSheet, StatusBar} from 'react-native';
import Toast from 'react-native-toast-message';
import HomeStackScreen from './src/routes/HomeStackScreen';
import WelcomeStackScreen from './src/routes/WelcomeStackScreen';
import {mixpanel} from './mixpanel';

mixpanel.init();

export default function App() {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
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
  const appState = useRef(AppState.currentState);

  // AsyncStorage.clear();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
      } else {
        console.log('App is in the background!');
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
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

  // useEffect(() => {
  //   if (currentTrack) {
  //     if (homeScreenFocus === false) {
  //       currentTrack.pause();
  //     }
  //     if (homeScreenFocus === true) {
  //       currentTrack.play();
  //     }
  //   }
  // }, [currentTrack, homeScreenFocus]);

  useEffect(() => {
    if (currentPost) {
      if (profileScreenFocus === false) {
        currentPost.pause();
      }
      if (profileScreenFocus === true) {
        currentPost.play();
      }
    }
  }, [currentPost, profileScreenFocus]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
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
                  } else if (route.name === 'Post') {
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
              <Tab.Screen name="Post" component={PostStackScreen} />
              {/* <Tab.Screen name="Activity" component={ActivityStackScreen} /> */}
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
const styles = StyleSheet.create({});
