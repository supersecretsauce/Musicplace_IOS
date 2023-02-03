import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ViewPostsScreen from '../screens/profile/ViewPostsScreen';
import SongDrawer from '../components/SongDrawer';
const Drawer = createDrawerNavigator();

const SinglePostDrawerRoute = ({route}) => {
  const {songInfo, UID, prevScreen, openSheet, commentDocID, replyRef} =
    route.params ?? {};
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
      <Drawer.Screen
        name="ViewPostsScreen"
        component={ViewPostsScreen}
        initialParams={{
          songInfo: songInfo,
          UID: UID,
          prevScreen: prevScreen,
          openSheet: openSheet,
          commentDocID: commentDocID,
          replyRef: replyRef,
        }}
      />
    </Drawer.Navigator>
  );
};

export default SinglePostDrawerRoute;
