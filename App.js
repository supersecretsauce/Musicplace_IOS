import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/signup/WelcomeScreen';
import PhoneNumberScreen from './src/screens/signup/PhoneNumberScreen';
import EnterCodeScreen from './src/screens/signup/EnterCodeScreen';
import CreateUsernameScreen from './src/screens/signup/CreateUsernameScreen';
import ConnectSpotifyScreen from './src/screens/signup/ConnectSpotifyScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import PostASongScreen from './src/screens/post/PostASongScreen';
import test from './src/screens/post/test';
import {Context} from './src/context/Context';
import {useState, useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {StyleSheet} from 'react-native';

export default function App() {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const [confirm, setConfirm] = useState(null);
  const [userLogin, setUserLogin] = useState(false);

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

  return (
    <NavigationContainer>
      <Context.Provider
        value={{
          confirm,
          setConfirm,
          setUserLogin,
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
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Discover" component={test} />
            <Tab.Screen name="Post" component={PostASongScreen} />
            <Tab.Screen name="Activity" component={HomeScreen} />
            <Tab.Screen name="Profile" component={HomeScreen} />
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
const styles = StyleSheet.create({
  navBar: {
    backgroundColor: 'black',
  },
});
