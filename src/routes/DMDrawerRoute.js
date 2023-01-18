import React, {useState} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import DirectMessageScreen from '../screens/activity/DirectMessageScreen';
import DMDrawer from '../components/DMDrawer';
import {DMDrawerContext} from '../context/DMDrawerContext';
const Drawer = createDrawerNavigator();

const DMDrawerRoute = () => {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <DMDrawerContext.Provider
      value={{
        showReportModal,
        setShowReportModal,
      }}>
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
    </DMDrawerContext.Provider>
  );
};

export default DMDrawerRoute;
