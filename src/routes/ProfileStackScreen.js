import {StyleSheet, useWindowDimensions} from 'react-native';
import React, {useRef, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ViewPostsScreen from '../screens/profile/ViewPostsScreen';
import ProfileDrawerRoute from './ProfileDrawerRoute';
import {DrawerContext} from '../context/DrawerContext';
import {useSharedValue} from 'react-native-reanimated';
import SinglePostDrawerRoute from './SinglePostDrawerRoute';
const ProfileStack = createNativeStackNavigator();

const ProfileStackScreen = () => {
  const dimensions = useWindowDimensions();
  let editTopValue = useSharedValue(dimensions.height);
  const [swiperIndex, setSwiperIndex] = useState(0);
  const [fetchingTopSongs, setFetchingTopSongs] = useState(false);
  const swiperRef = useRef();

  const config = {
    animation: 'spring',
    config: {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  };

  return (
    <DrawerContext.Provider
      value={{
        editTopValue,
        swiperRef,
        swiperIndex,
        setSwiperIndex,
        fetchingTopSongs,
        setFetchingTopSongs,
      }}>
      <ProfileStack.Navigator screenOptions={{headerShown: false}}>
        <ProfileStack.Screen
          name="ProfileDrawer"
          component={ProfileDrawerRoute}
        />
        <ProfileStack.Screen
          name="SinglePostDrawerRoute"
          component={SinglePostDrawerRoute}
          options={{
            transitionSpec: {
              open: config,
              close: config,
            },
          }}
        />
      </ProfileStack.Navigator>
    </DrawerContext.Provider>
  );
};

export default ProfileStackScreen;

const styles = StyleSheet.create({});
