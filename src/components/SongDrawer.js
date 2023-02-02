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
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {Context} from '../context/Context';
import appCheck from '@react-native-firebase/app-check';
import DeviceInfo from 'react-native-device-info';
import {simKey} from '../../simKey';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import HapticFeedback from 'react-native-haptic-feedback';
import {mixpanel} from '../../mixpanel';

const SongDrawer = ({navigation}) => {
  const [allPlaylists, setAllPlaylists] = useState(null);
  const [trackLiked, setTrackLiked] = useState(null);
  const [existingPlaylists, setExistingPlaylists] = useState([]);
  const {feedTrack} = useContext(HomeScreenContext);
  const {UID, hasSpotify} = useContext(Context);

  useEffect(() => {
    if (UID && feedTrack && hasSpotify) {
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
            setExistingPlaylists(resp.data.existingPlaylists);
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
              },
            ];
            setAllPlaylists([...likeObject, ...playlistData]);
          })
          .catch(e => console.log(e));
      }

      getPlaylists();
    } else if (!hasSpotify && feedTrack && UID) {
      console.log('non spot');
      async function checkNonSpotLike() {
        let isEmulator = await DeviceInfo.isEmulator();
        let authToken;
        if (!isEmulator) {
          authToken = await appCheck().getToken();
        }
        axios
          .get('http://localhost:3000/check-non-spotify-likes', {
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
            console.log(resp);
            setTrackLiked(resp.data);
          })
          .catch(e => {
            console.log(e);
          });
      }
      checkNonSpotLike();

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
      setAllPlaylists(likeObject);
    }
  }, [UID, feedTrack, hasSpotify]);

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
          text2: "Don't believe us? Check your feed.",
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
          text2: "Don't believe us? Check your feed.",
          visibilityTime: 2000,
        });
      }
    }
  }

  async function playlistHandler(playlist) {
    let isEmulator = await DeviceInfo.isEmulator();
    let authToken;
    if (!isEmulator) {
      authToken = await appCheck().getToken();
    }
    // remove song from playlist
    if (existingPlaylists.includes(playlist.id)) {
      let existingPlaylistUpdate = existingPlaylists.filter(item => {
        return item !== playlist.id;
      });
      setExistingPlaylists(existingPlaylistUpdate);

      Toast.show({
        type: 'success',
        text1: `Removed from ${playlist.name}`,
        text2: "Don't believe us? Check your spotify library.",
        visibilityTime: 2000,
      });
      axios
        .get('http://localhost:3000/remove-from-playlist', {
          params: {
            UID: UID,
            songID: feedTrack.id,
            playlistID: playlist.id,
          },
          headers: {
            accept: 'application/json',
            Authorization: isEmulator
              ? 'Bearer ' + simKey
              : 'Bearer ' + authToken.token,
          },
        })
        .then(resp => {
          console.log(resp);
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      // add song to playlist
      setExistingPlaylists([...existingPlaylists, playlist.id]);
      Toast.show({
        type: 'success',
        text1: `Added to ${playlist.name}`,
        text2: "Don't believe us? Check your spotify library.",
        visibilityTime: 2000,
      });
      axios
        .get('http://localhost:3000/add-to-playlist', {
          params: {
            UID: UID,
            songID: feedTrack.id,
            playlistID: playlist.id,
          },
          headers: {
            accept: 'application/json',
            Authorization: isEmulator
              ? 'Bearer ' + simKey
              : 'Bearer ' + authToken.token,
          },
        })
        .then(resp => {
          console.log(resp);
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  return (
    <SafeAreaView style={styles.drawer}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.chevronContainer}
          onPress={() => navigation.closeDrawer()}>
          <Ionicons name={'chevron-back'} color={'white'} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Add to library</Text>
      </View>
      {allPlaylists ? (
        <FlatList
          // eslint-disable-next-line react-native/no-inline-styles
          contentContainerStyle={{
            paddingTop: '1%',
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
                      name={trackLiked ? 'checkmark-done' : 'radio-button-off'}
                      color={trackLiked ? 'white' : 'grey'}
                      size={24}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={index}
                    style={styles.itemContainer}
                    onPress={() => {
                      playlistHandler(item);
                    }}>
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
                      name={
                        existingPlaylists.includes(item.id)
                          ? 'checkmark-done'
                          : 'radio-button-off'
                      }
                      color={
                        existingPlaylists.includes(item.id) ? 'white' : 'grey'
                      }
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
  header: {
    // backgroundColor: '#191919',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomColor: '#191919',
    borderBottomWidth: 1,
  },
  chevronContainer: {
    position: 'absolute',
    left: 0,
  },
  headerText: {
    color: 'white',
    fontFamily: 'SFProRounded-Bold',
    fontSize: 17,
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
