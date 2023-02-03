import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import React, {useState, useEffect, useContext, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import Sound from 'react-native-sound';
import Spotify from '../../assets/img/spotify.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import BottomSheet from '../../components/BottomSheet';
import HapticFeedback from 'react-native-haptic-feedback';
import {Context} from '../../context/Context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import ShareSheet from '../../components/ShareSheet';
import axios from 'axios';
import LoadingPost from '../../components/LoadingPost';
import appCheck from '@react-native-firebase/app-check';
import DeviceInfo from 'react-native-device-info';
import {simKey} from '../../../simKey';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {mixpanel} from '../../../mixpanel';
const HomeScreen = ({navigation}) => {
  Sound.setCategory('Playback');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [initialFeed, setInitialFeed] = useState(true);
  const [startTime, setStartTime] = useState(new Date());
  const [isOnHomeScreen, setIsOnHomeScreen] = useState(true);
  const {
    setHasSpotify,
    hasSpotify,
    setUID,
    UID,
    feed,
    setFeed,
    isNewUser,
    setFeedTrack,
  } = useContext(Context);

  useFocusEffect(
    useCallback(() => {
      setIsOnHomeScreen(true);
      if (currentTrack) {
        currentTrack.play();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        playing = true;
        console.log('new start time set');
        setStartTime(new Date());
      }
      return () => {
        // if a user leaves the homescreen while feed is loading, don't play sound
        setIsOnHomeScreen(false);
        if (currentTrack) {
          currentTrack.pause();
          playing = false;
        }
      };
    }, [currentTrack]),
  );

  useEffect(() => {
    async function checkSpotifyConnection() {
      const spotifyBoolean = await AsyncStorage.getItem('hasSpotify');
      const localUID = await AsyncStorage.getItem('UID');
      if (spotifyBoolean === 'false') {
        setHasSpotify(false);
        setUID(localUID);
      } else if (spotifyBoolean === 'true') {
        setUID(localUID);
        setHasSpotify(true);
      }
    }
    checkSpotifyConnection();
  }, []);

  //get notification token
  useEffect(() => {
    if (UID) {
      //get noti token
      async function requestUserPermission() {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          messaging()
            .getToken()
            .then(token => {
              firestore()
                .collection('users')
                .doc(UID)
                .update({
                  notificationToken: token,
                })
                .then(() => {
                  console.log('token pushed!');
                });
            })
            .catch(e => {
              console.log(e);
            });
        } else {
          console.log(authStatus);
        }
      }
      requestUserPermission();
    }
  }, [UID]);

  useEffect(() => {
    if (UID) {
      async function fetchFeed() {
        if (isNewUser) {
          console.log('this is a new user');
          return;
        } else {
          console.log(UID);
          let isEmulator = await DeviceInfo.isEmulator();
          let authToken;
          if (!isEmulator) {
            authToken = await appCheck().getToken();
          }
          axios
            .get(`http://167.99.22.22/recommendation/user?userId=${UID}`, {
              headers: {
                accept: 'application/json',
                Authorization: isEmulator
                  ? 'Bearer ' + simKey
                  : 'Bearer ' + authToken.token,
              },
            })
            .then(resp => {
              console.log(resp);
              if (resp.data.data.length > 0) {
                setFeed(resp.data.data);
              }
            })
            .catch(e => {
              console.log(e);
            });
        }
      }
      fetchFeed();
    } else {
      return;
    }
  }, [UID]);

  useEffect(() => {
    if (feed && initialFeed && isOnHomeScreen) {
      let newTrack = new Sound(feed[currentIndex].previewURL, null, error => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        } else {
          newTrack.play();
          newTrack.setNumberOfLoops(-1);
        }
      });
      setCurrentTrack(newTrack);
      setInitialFeed(false);
    }
  }, [feed, isOnHomeScreen]);

  useEffect(() => {
    if (feed && isOnHomeScreen) {
      if (currentIndex == Math.floor(feed.length / 2)) {
        console.log('halfway!');

        async function fetchMoreSongs() {
          let isEmulator = await DeviceInfo.isEmulator();
          console.log(isEmulator);
          let authToken;
          if (!isEmulator) {
            authToken = await appCheck().getToken();
          }
          axios
            .get(`http://167.99.22.22/recommendation/user?userId=${UID}`, {
              headers: {
                accept: 'application/json',
                Authorization: isEmulator
                  ? 'Bearer ' + simKey
                  : 'Bearer ' + authToken.token,
              },
            })
            .then(response => {
              console.log(response);
              setFeed(current => [...current, ...response.data.data]);
            })
            .catch(e => {
              console.log(e);
            });
        }

        fetchMoreSongs();
      }
    }
  }, [currentIndex, isOnHomeScreen]);

  function handleIndexChange(index) {
    recordTime(index);
    currentTrack.stop();
    playNextTrack(index);
    setCurrentIndex(index);
  }

  function playNextTrack(index) {
    let newTrack = new Sound(feed[index].previewURL, null, error => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      } else {
        newTrack.play();
        newTrack.setNumberOfLoops(-1);
      }
    });
    setCurrentTrack(newTrack);
  }

  function recordTime() {
    let endTime = new Date();
    let timeDiff = endTime - startTime;

    firestore()
      .collection('users')
      .doc(UID)
      .collection('watches')
      .add({
        songID: feed[currentIndex].id,
        UID: UID,
        duration: timeDiff,
        date: new Date(),
        liked: feed[currentIndex].liked,
      })
      .then(() => {
        console.log('added watch document');
        setStartTime(new Date());
      })
      .catch(error => {
        console.log(error);
      });
  }

  let playing = true;
  function pauseHandler() {
    if (playing) {
      currentTrack.pause();
      playing = false;
    } else {
      currentTrack.play();
      playing = true;
    }
  }

  async function likeHandler(post) {
    HapticFeedback.trigger('impactLight');
    let isEmulator = await DeviceInfo.isEmulator();
    let authToken;
    if (!isEmulator) {
      authToken = await appCheck().getToken();
    }
    if (post.liked) {
      let updatedFeed = feed.map(track => {
        if (track.id === post.id) {
          track.liked = false;
          return track;
        } else {
          return track;
        }
      });
      setFeed(updatedFeed);
      // remove song from liked songs
      axios
        .get(
          `http://167.99.22.22/update/remove-track?userId=${UID}&trackId=${feed[currentIndex].id}`,
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
      let updatedFeed = feed.map(track => {
        if (track.id === post.id) {
          track.liked = true;
          return track;
        } else {
          return track;
        }
      });
      setFeed(updatedFeed);
      // add to liked songs
      axios
        .get(
          `http://167.99.22.22/update/save-track?userId=${UID}&trackId=${feed[currentIndex].id}`,
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

  async function listenOnSpotify() {
    await Linking.openURL(
      `http://open.spotify.com/track/${feed[currentIndex].id}`,
    );
  }

  return (
    <View style={styles.container}>
      {feed ? (
        <>
          <Swiper
            showsPagination={false}
            loadMinimal={true}
            onIndexChanged={index => handleIndexChange(index)}
            loop={false}
            showsButtons={false}>
            {feed.map((post, index) => {
              return (
                <View key={index}>
                  <TouchableWithoutFeedback onPress={pauseHandler}>
                    <Image
                      style={styles.songPhoto}
                      source={{
                        uri: post.songPhoto,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableWithoutFeedback>
                  <View style={styles.topRow}>
                    <View style={styles.topRowLeft}>
                      <Spotify />
                      <Text numberOfLines={1} style={styles.songName}>
                        {post.songName}
                      </Text>
                    </View>
                    <View style={styles.topRowRight}>
                      <TouchableOpacity
                        style={styles.shareBtn}
                        onPress={() => setShowShareSheet(true)}>
                        <Ionicons name="share-outline" color="grey" size={28} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        //  onPress={() => likeHandler(post)}
                        onPress={() => {
                          setFeedTrack(post);
                          navigation.toggleDrawer();
                        }}>
                        <Ionicons
                          style={styles.likeIcon}
                          name={'add-circle'}
                          color={'grey'}
                          size={28}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.bottomRow}>
                    <Text numberOfLines={1} style={styles.artistName}>
                      {post.artists
                        .map(artist => {
                          return artist.name;
                        })
                        .join(', ')}
                    </Text>
                    <Ionicons
                      style={styles.smallDot}
                      name="ellipse"
                      color="white"
                      size={5}
                    />
                    <Text numberOfLines={1} style={styles.albumName}>
                      {post.albumName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.listenOnSpotifyBtn}
                    onPress={listenOnSpotify}>
                    <Spotify />
                    <Text style={styles.listenOnSpotifyText}>
                      LISTEN ON SPOTIFY
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </Swiper>
          <BottomSheet
            showShareSheet={showShareSheet}
            UID={UID}
            feed={feed}
            currentIndex={currentIndex}
          />
          <ShareSheet
            post={feed[currentIndex]}
            UID={UID}
            setShowShareSheet={setShowShareSheet}
            showShareSheet={showShareSheet}
          />
        </>
      ) : (
        <>
          <LoadingPost />
        </>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  songPhoto: {
    height: 350,
    width: 350,
    alignSelf: 'center',
    marginTop: '13%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 350,
    alignSelf: 'center',
    marginTop: 15,
  },
  topRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songName: {
    color: 'white',
    fontFamily: 'Inter-bold',
    fontSize: 24,
    maxWidth: 250,
    marginLeft: 6,
  },
  topRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareBtn: {
    marginBottom: 4,
  },
  likeIcon: {
    marginLeft: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 350,
    alignSelf: 'center',
    paddingVertical: 5,
  },
  artistName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 16,
    marginRight: 5,
    maxWidth: 170,
  },
  albumName: {
    color: 'white',
    fontFamily: 'Inter-regular',
    fontSize: 16,
    marginLeft: 5,
    maxWidth: 170,
  },
  listenOnSpotifyBtn: {
    position: 'absolute',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    top: 510,
  },
  listenOnSpotifyText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginLeft: 10,
  },
});
