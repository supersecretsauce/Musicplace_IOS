import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
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
            let likeObject = [
              {
                images: [
                  {
                    url: 'https://firebasestorage.googleapis.com/v0/b/musicplace-66f20.appspot.com/o/spotifyLikedSongs.webp?alt=media&token=c1998298-594b-4be3-912f-a86e3cd60403',
                  },
                ],
                owner: {
                  display_name: 'You',
                },
                name: 'Liked Songs',
                type: 'likes',
              },
            ];
            console.log([...likeObject, ...resp.data.items]);
            setPlaylists([...likeObject, ...resp.data.items]);
          })
          .catch(e => console.log(e));
      }

      getPlaylists();
    }
  }, [UID]);

  function handleLike() {}

  return (
    <SafeAreaView style={styles.drawer}>
      {playlists ? (
        <FlatList
          // eslint-disable-next-line react-native/no-inline-styles
          contentContainerStyle={{
            paddingTop: '5%',
            paddingBottom: '5%',
          }}
          data={playlists}
          renderItem={({item, index}) => {
            return (
              <>
                {item?.type === 'likes' ? (
                  <TouchableOpacity key={index} style={styles.itemContainer}>
                    <View style={styles.leftContainer}>
                      <FastImage
                        style={styles.playlistImage}
                        source={{
                          uri: item?.images[0]?.url,
                          priority: FastImage.priority.high,
                        }}
                      />
                      <View style={styles.middleContainer}>
                        <Text numberOfLines={1} style={styles.playlistName}>
                          {item?.name}
                        </Text>
                        <View style={styles.playlistInfoContainer}>
                          <Text style={styles.playlistInfo}>
                            by {item?.owner?.display_name}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons
                      name={'radio-button-off'}
                      color={'grey'}
                      size={24}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity key={index} style={styles.itemContainer}>
                    <View style={styles.leftContainer}>
                      <FastImage
                        style={styles.playlistImage}
                        source={{
                          uri: item?.images[0]?.url,
                          priority: FastImage.priority.high,
                        }}
                      />
                      <View style={styles.middleContainer}>
                        <Text numberOfLines={1} style={styles.playlistName}>
                          {item?.name}
                        </Text>
                        <View style={styles.playlistInfoContainer}>
                          <Text style={styles.playlistInfo}>
                            by {item?.owner?.display_name}
                          </Text>
                          <Text style={styles.playlistInfo}> · </Text>
                          <Text style={styles.playlistInfo}>
                            {item?.tracks?.total} tracks
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons
                      name={'radio-button-off'}
                      color={'grey'}
                      size={24}
                    />
                  </TouchableOpacity>
                )}
              </>
            );
          }}
        />
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
    </SafeAreaView>
  );
};

export default SongDrawer;

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: 'black',
    flex: 1,
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
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingHorizontal: 12,
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
