import React, {useState} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ViewPostsScreen from '../screens/profile/ViewPostsScreen';
import SongDrawer from '../components/SongDrawer';
import {SinglePostContext} from '../context/SinglePostContext';
const Drawer = createDrawerNavigator();

const SinglePostDrawerRoute = ({route}) => {
  const {songInfo, UID, prevScreen, openSheet, commentDocID, replyRef} =
    route.params ?? {};
  const [feedTrack, setFeedTrack] = useState(null);
  return (
    <SinglePostContext.Provider
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
    </SinglePostContext.Provider>
  );
};

export default SinglePostDrawerRoute;
