import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeStackScreen from './HomeStackScreen';
import DiscoverStackScreen from './DiscoverStackScreen';
import ActivityStackScreen from './ActivityStackScreen';
import ProfileStackScreen from './ProfileStackScreen';
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
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

          //  You can return any component that you like here!
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
      <Tab.Screen name="Discover" component={DiscoverStackScreen} />
      <Tab.Screen name="Activity" component={ActivityStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
