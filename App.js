import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/signup/WelcomeScreen';
import PhoneNumberScreen from './src/screens/signup/PhoneNumberScreen';
import EnterCodeScreen from './src/screens/signup/EnterCodeScreen';
import CreateUsernameScreen from './src/screens/signup/CreateUsernameScreen';
import ConnectSpotifyScreen from './src/screens/signup/ConnectSpotifyScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import {Context} from './src/context/Context';
import {useState, useEffect} from 'react';
import {firebase} from '@react-native-firebase/firestore';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import auth from '@react-native-firebase/auth';

export default function App() {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const [confirm, setConfirm] = useState(null);
  const userInfo = firebase.auth().currentUser;
  const [accountCreated, setAccountCreated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <NavigationContainer>
      <Context.Provider
        value={{
          confirm,
          setConfirm,
          userInfo,
          setAccountCreated,
        }}>
        {accountCreated ? (
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
            }}>
            <Tab.Screen name="HomeScreen" component={HomeScreen} />
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
            <Stack.Screen name="EnterCodeScreen" component={EnterCodeScreen} />
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
      </Context.Provider>
    </NavigationContainer>
  );
}
