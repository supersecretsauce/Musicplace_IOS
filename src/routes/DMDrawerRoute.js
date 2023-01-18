import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import DirectMessageScreen from '../screens/activity/DirectMessageScreen';
import DMDrawer from '../components/DMDrawer';

const Drawer = createDrawerNavigator();

const DMDrawerRoute = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <DMDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerStyle: {
          backgroundColor: 'black',
        },
      }}>
      <Drawer.Screen
        name="DirectMessageScreen"
        component={DirectMessageScreen}
      />
    </Drawer.Navigator>
  );
};

export default DMDrawerRoute;
