import React, {useState, useEffect, useContext} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {Context} from '../context/Context';
import appCheck from '@react-native-firebase/app-check';
import DeviceInfo from 'react-native-device-info';
import {simKey} from '../../simKey';

const SongDrawer = () => {
  const [playlists, setPlaylists] = useState(null);
  const {UID} = useContext(Context);

  useEffect(() => {
    if (UID) {
      console.log(UID);
      async function getPlaylists() {
        let isEmulator = await DeviceInfo.isEmulator();
        let authToken;
        if (!isEmulator) {
          authToken = await appCheck().getToken();
        }
        return;
        axios
          .get(`http://localhost:3000/get-user-playlists/user?UID=${UID}`, {
            headers: {
              accept: 'application/json',
              Authorization: isEmulator
                ? 'Bearer ' + simKey
                : 'Bearer ' + authToken.token,
            },
          })
          .then(resp => {
            console.log(resp.data.items);
            setPlaylists(resp.data.items);
          })
          .catch(e => console.log(e));
      }

      getPlaylists();
    }
  }, [UID]);

  return (
    <DrawerContentScrollView contentContainerStyle={styles.drawer}>
      {playlists ? (
        playlists.map((playlist, index) => {
          return (
            <View key={index} style={styles.itemContainer}>
              <View style={styles.leftContainer}>
                <FastImage
                  style={styles.playlistImage}
                  source={{
                    uri: playlist?.images[0]?.url,
                    priority: FastImage.priority.high,
                  }}
                />
                <View style={styles.middleContainer}>
                  <Text numberOfLines={1} style={styles.playlistName}>
                    {playlist?.name}
                  </Text>
                  <View style={styles.playlistInfoContainer}>
                    <Text style={styles.playlistInfo}>
                      by {playlist?.owner?.display_name}
                    </Text>
                    <Text style={styles.playlistInfo}> · </Text>
                    <Text style={styles.playlistInfo}>
                      {playlist?.tracks?.total} tracks
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <DrawerItem
          icon={() => (
            <Ionicons name={'heart-outline'} color={'grey'} size={24} />
          )}
          labelStyle={styles.drawerItem}
          label="Edit Profile"
        />
      )}
      {/* <DrawerItem
        icon={() => (
          <Ionicons name={'heart-outline'} color={'grey'} size={24} />
        )}
        labelStyle={styles.drawerItem}
        label="Edit Profile"
      />
      {testArr.map(n => {
        return (
          <DrawerItem
            icon={() => (
              <Ionicons name={'heart-outline'} color={'grey'} size={24} />
            )}
            labelStyle={styles.drawerItem}
            label="Edit Profile"
          />
        );
      })} */}
    </DrawerContentScrollView>
  );
};

export default SongDrawer;

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: 'black',
    height: '100%',
  },
  drawerItem: {
    color: 'white',
    fontFamily: 'SFProRounded-Bold',
    fontSize: 17,
    marginLeft: -20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingLeft: 25,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistImage: {
    height: 46,
    width: 46,
  },
  middleContainer: {
    marginLeft: 12,
  },
  playlistName: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    maxWidth: 200,
    backgroundColor: 'red',
  },
  playlistInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistInfo: {
    color: 'grey',
    fontSize: 14,
    marginTop: 3,
    fontFamily: 'Inter-Medium',
  },
});
