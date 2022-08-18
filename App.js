import React from 'react';
import {
  NavigationContainer,
  useNavigationState,
  useRoute,
} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/signup/WelcomeScreen';
import PhoneNumberScreen from './src/screens/signup/PhoneNumberScreen';
import EnterCodeScreen from './src/screens/signup/EnterCodeScreen';
import CreateUsernameScreen from './src/screens/signup/CreateUsernameScreen';
import ConnectSpotifyScreen from './src/screens/signup/ConnectSpotifyScreen';
import PostStackScreen from './src/routes/PostStackScreen';
import ProfileStackScreen from './src/routes/ProfileStackScreen';
import {Context} from './src/context/Context';
import {useState, useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {StyleSheet, StatusBar} from 'react-native';
import Toast from 'react-native-toast-message';
import ActivityStackScreen from './src/routes/ActivityStackScreen';
import HomeStackScreen from './src/routes/HomeStackScreen';
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

  // AsyncStorage.clear();

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

  useEffect(() => {});

  useEffect(() => {
    if (currentTrack) {
      if (homeScreenFocus === false) {
        currentTrack.pause();
      }
      if (homeScreenFocus === true) {
        currentTrack.play();
      }
    }
  }, [currentTrack, homeScreenFocus]);

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
              <Tab.Screen name="Discover" component={ActivityStackScreen} />
              <Tab.Screen name="Post" component={PostStackScreen} />
              <Tab.Screen name="Activity" component={ActivityStackScreen} />
              <Tab.Screen name="Profile" component={ProfileStackScreen} />
            </Tab.Navigator>
          ) : (
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}>
              <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
              <Stack.Screen
                name="PhoneNumberScreen"
                component={PhoneNumberScreen}
              />
              <Stack.Screen
                name="EnterCodeScreen"
                component={EnterCodeScreen}
              />
              <Stack.Screen
                name="CreateUsernameScreen"
                component={CreateUsernameScreen}
              />
              <Stack.Screen
                name="ConnectSpotifyScreen"
                component={ConnectSpotifyScreen}
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
