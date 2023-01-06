import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProfileDrawer from '../screens/profile/ProfileDrawer';
const Drawer = createDrawerNavigator();

const ProfileDrawerRoute = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <ProfileDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerStyle: {
          backgroundColor: 'black',
        },
      }}>
      <Drawer.Screen name="ProfileScreen" component={ProfileScreen} />
    </Drawer.Navigator>
  );
};

export default ProfileDrawerRoute;
