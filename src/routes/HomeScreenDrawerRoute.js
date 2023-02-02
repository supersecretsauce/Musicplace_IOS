import React, {useState} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import HomeScreen from '../screens/home/HomeScreen';
import SongDrawer from '../components/SongDrawer';
import {HomeScreenContext} from '../context/HomeScreenContext';
const Drawer = createDrawerNavigator();

const HomeScreenDrawerRoute = () => {
  const [feedTrack, setFeedTrack] = useState(null);
  return (
    <HomeScreenContext.Provider
      value={{
        feedTrack,
        setFeedTrack,
      }}>
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
    </HomeScreenContext.Provider>
  );
};

export default HomeScreenDrawerRoute;
