import React from 'react';
// import {Node} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/signup/WelcomeScreen';
import PhoneNumberScreen from './src/screens/signup/PhoneNumberScreen';
import EnterCodeScreen from './src/screens/signup/EnterCodeScreen';
import CreateUsernameScreen from './src/screens/signup/CreateUsernameScreen';
import {Context} from './src/context/Context';
import {useState} from 'react';

const Stack = createNativeStackNavigator();

export default function App() {
  const [verificationId, setVerificationId] = useState('');
  const [userData, setUserData] = useState(null);

  return (
    <NavigationContainer>
      <Context.Provider
        value={{
          verificationId,
          setVerificationId,
          userData,
          setUserData,
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
        </Stack.Navigator>
      </Context.Provider>
    </NavigationContainer>
  );
}
