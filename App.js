import React from 'react';
// import {Node} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/signup/WelcomeScreen';
import PhoneNumberScreen from './src/screens/signup/PhoneNumberScreen';
import EnterCodeScreen from './src/screens/signup/EnterCodeScreen';
import CreateUsernameScreen from './src/screens/signup/CreateUsernameScreen';
import ConnectSpotifyScreen from './src/screens/signup/ConnectSpotifyScreen';

import {Context} from './src/context/Context';
import {useState} from 'react';
import {firebase} from '@react-native-firebase/firestore';

const Stack = createNativeStackNavigator();

export default function App() {
  const [confirm, setConfirm] = useState(null);
  const user = firebase.auth().currentUser;

  return (
    <NavigationContainer>
      <Context.Provider
        value={{
          confirm,
          setConfirm,
          user,
        }}>
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
      </Context.Provider>
    </NavigationContainer>
  );
}
