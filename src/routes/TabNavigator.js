import React, {useEffect, useContext} from 'react';
import {Context} from '../context/Context';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeStackScreen from './HomeStackScreen';
import DiscoverStackScreen from './DiscoverStackScreen';
import ActivityStackScreen from './ActivityStackScreen';
import ProfileStackScreen from './ProfileStackScreen';
import FeedStackScreen from './FeedStackScreen';
import branch from 'react-native-branch';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const {UID} = useContext(Context);
  const {navigate} = useNavigation();

  useEffect(() => {
    const subscription = branch.subscribe(({error, params, uri}) => {
      if (error) {
        console.error('Error from Branch: ' + error);
        return;
      }
      // params will never be null if error is null
      if (params.$canonical_identifier) {
        let songArr = [];
        let trackID = params.$canonical_identifier.slice(5);
        firestore()
          .collection('tracks')
          .doc(trackID)
          .get()
          .then(resp => {
            songArr.push(resp.data());
            navigate('Activity', {
              screen: 'ViewPostsScreen',
              params: {
                UID: UID,
                songInfo: songArr,
                prevScreen: 'ActivityScreen',
              },
            });
          });
      }
      console.log('uri', uri);
    });

    return () => {
      subscription();
    };
  });

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home-sharp' : 'home-outline';
          } else if (route.name === 'Feed') {
            iconName = focused ? 'earth-sharp' : 'earth-outline';
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
      <Tab.Screen name="Feed" component={FeedStackScreen} />
      <Tab.Screen name="Activity" component={ActivityStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
