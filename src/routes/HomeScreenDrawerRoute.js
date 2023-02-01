import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import HomeScreen from '../screens/home/HomeScreen';
import SongDrawer from '../components/SongDrawer';
const Drawer = createDrawerNavigator();

const HomeScreenDrawerRoute = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <SongDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerStyle: {
          width: '84%',
        },
        swipeEnabled: false,
      }}>
      <Drawer.Screen name="HomeScreen" component={HomeScreen} />
    </Drawer.Navigator>
  );
};

export default HomeScreenDrawerRoute;
