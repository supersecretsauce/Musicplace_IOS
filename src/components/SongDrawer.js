import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {HomeScreenContext} from '../context/HomeScreenContext';
import FastImage from 'react-native-fast-image';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {Context} from '../context/Context';
import appCheck from '@react-native-firebase/app-check';
import DeviceInfo from 'react-native-device-info';
import {simKey} from '../../simKey';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import HapticFeedback from 'react-native-haptic-feedback';
import {mixpanel} from '../../mixpanel';

const SongDrawer = () => {
  const [playlists, setPlaylists] = useState(null);
  const [allPlaylists, setAllPlaylists] = useState(null);
  const [trackLiked, setTrackLiked] = useState(null);
  const {feedTrack} = useContext(HomeScreenContext);
  const {UID, hasSpotify, feed, setFeed} = useContext(Context);

  useEffect(() => {
    console.log(feedTrack);
  }, [feedTrack]);

  useEffect(() => {
    if (UID && feedTrack) {
      console.log(UID);
      async function getPlaylists() {
        let isEmulator = await DeviceInfo.isEmulator();
        let authToken;
        if (!isEmulator) {
          authToken = await appCheck().getToken();
        }

        axios
          .get(`http://localhost:3000/get-user-playlists`, {
            params: {
              UID: UID,
              songID: feedTrack.id,
            },
            headers: {
              accept: 'application/json',
              Authorization: isEmulator
                ? 'Bearer ' + simKey
                : 'Bearer ' + authToken.token,
            },
          })
          .then(resp => {
            let playlistData = resp.data.playlistData.items;
            console.log(resp.data.isLiked[0]);
            setTrackLiked(resp.data.isLiked[0]);
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
                liked: resp.isLiked,
              },
            ];
            console.log([...likeObject, ...playlistData]);
            setPlaylists(playlistData);
            setAllPlaylists([...likeObject, ...playlistData]);
          })
          .catch(e => console.log(e));
      }

      getPlaylists();
    }
  }, [UID, feedTrack]);

  async function likeHandler() {
    HapticFeedback.trigger('impactLight');
    let isEmulator = await DeviceInfo.isEmulator();
    let authToken;
    if (!isEmulator) {
      authToken = await appCheck().getToken();
    }
    if (trackLiked) {
      // remove song from liked songs
      setTrackLiked(false);

      axios
        .get(
          `http://167.99.22.22/update/remove-track?userId=${UID}&trackId=${feedTrack.id}`,
          {
            headers: {
              accept: 'application/json',
              Authorization: isEmulator
                ? 'Bearer ' + simKey
                : 'Bearer ' + authToken.token,
            },
          },
        )
        .then(resp => {
          console.log(resp);
          console.log('track removed');
        })
        .catch(e => {
          console.log(e);
        });

      if (hasSpotify) {
        Toast.show({
          type: 'success',
          text1: 'Removed from liked songs',
          text2: "Don't believe us? Check your spotify library.",
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Removed from liked songs',
          text2: "Don't believe us? Check your profile.",
          visibilityTime: 2000,
        });
      }
    } else {
      mixpanel.track('Liked Song');
      // add to liked songs
      setTrackLiked(true);

      axios
        .get(
          `http://167.99.22.22/update/save-track?userId=${UID}&trackId=${feedTrack.id}`,
          {
            headers: {
              accept: 'application/json',
              Authorization: isEmulator
                ? 'Bearer ' + simKey
                : 'Bearer ' + authToken.token,
            },
          },
        )
        .then(resp => {
          console.log(resp);
          console.log('saved track');
        })
        .catch(e => {
          console.log(e);
        });
      if (hasSpotify) {
        Toast.show({
          type: 'success',
          text1: 'Added to liked songs',
          text2: "Don't believe us? Check your spotify library.",
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Added to liked songs',
          text2: "Don't believe us? Check your profile.",
          visibilityTime: 2000,
        });
      }
    }
  }

  return (
    <SafeAreaView style={styles.drawer}>
      {allPlaylists ? (
        <FlatList
          // eslint-disable-next-line react-native/no-inline-styles
          contentContainerStyle={{
            paddingTop: '5%',
            paddingBottom: '5%',
          }}
          data={allPlaylists}
          renderItem={({item, index}) => {
            return (
              <>
                {item?.type === 'likes' ? (
                  <TouchableOpacity
                    key={index}
                    style={styles.itemContainer}
                    onPress={likeHandler}>
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
                      name={trackLiked ? 'radio-button-on' : 'radio-button-off'}
                      color={trackLiked ? 'white' : 'grey'}
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
        <></>
      )}
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
