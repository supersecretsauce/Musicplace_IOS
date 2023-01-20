import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {Context} from '../../context/Context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Spotify from '../../assets/img/spotify.svg';
import SinglePostBottomSheet from '../../components/SinglePostBottomSheet';
import Swiper from 'react-native-swiper';
import Sound from 'react-native-sound';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import HapticFeedback from 'react-native-haptic-feedback';
import Toast from 'react-native-toast-message';
import {mixpanel} from '../../../mixpanel';
import ShareSheet from '../../components/ShareSheet';
import axios from 'axios';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import appCheck from '@react-native-firebase/app-check';
import DeviceInfo from 'react-native-device-info';
import {simKey} from '../../../simKey';

const ViewPostsScreen = ({route, navigation}) => {
  Sound.setCategory('Playback');
  const {songInfo, UID, openSheet, commentDocID, prevScreen} =
    route.params ?? {};
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const {hasSpotify, trackDeepLink, setTrackDeepLink} = useContext(Context);
  const [trackInfo, setTrackInfo] = useState(songInfo);
  const [isLiked, setIsLiked] = useState(null);
  const likeRef = useRef(isLiked);
  let playing = true;
  let startTime = new Date();

  function recordTime(likeValue) {
    if (trackInfo) {
      let endTime = new Date();
      let timeDiff = endTime - startTime;
      startTime = new Date();
      firestore()
        .collection('users')
        .doc(UID)
        .collection('watches')
        .add({
          songID: songInfo[0].id,
          UID: UID,
          duration: timeDiff,
          date: new Date(),
          liked: likeRef.current,
        })
        .then(() => {
          console.log('added watch document');
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      console.log('track info state not set');
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (currentTrack) {
        currentTrack.play();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        playing = true;
      }
      return () => {
        if (currentTrack) {
          console.log(currentTrack);
          currentTrack.pause();
          playing = false;
          recordTime();
          mixpanel.track('New Listen');
          // console.log('user left screen');
        }
      };
    }, [currentTrack]),
  );

  function pauseHandler() {
    if (playing) {
      currentTrack.pause();
      playing = false;
    } else {
      currentTrack.play();
      playing = true;
    }
  }

  useEffect(() => {
    if (UID) {
      if (songInfo) {
        console.log(songInfo);
        async function fetchLike() {
          let isEmulator = await DeviceInfo.isEmulator();
          let authToken;
          if (!isEmulator) {
            authToken = await appCheck().getToken();
          }
          axios
            .get(
              `http://167.99.22.22/fetch/like?userId=${UID}&trackId=${songInfo[0].id}`,
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
              likeRef.current = resp.data.data;
              setIsLiked(resp.data.data);
              console.log(resp.data.data);
            })
            .catch(e => {
              console.log(e);
            });
        }
        fetchLike();
        let newTrack = new Sound(songInfo[0].previewURL, null, error => {
          if (error) {
            console.log('failed to load the sound', error);
            return;
          } else {
            newTrack.play();
            newTrack.setNumberOfLoops(-1);
          }
        });
        setCurrentTrack(newTrack);
      } else if (trackDeepLink) {
        firestore()
          .collection('posts')
          .doc(trackDeepLink)
          .get()
          .then(resp => {
            console.log(resp);
            setTrackInfo(resp.data());
            setTrackDeepLink(null);
          });
        return;
      }
    }
  }, [songInfo, trackDeepLink, UID]);

  async function likeHandler() {
    let isEmulator = await DeviceInfo.isEmulator();
    let authToken;
    if (!isEmulator) {
      authToken = await appCheck().getToken();
    }
    if (isLiked) {
      setIsLiked(false);
      likeRef.current = false;
      HapticFeedback.trigger('impactLight');
      let filteredTrackInfo = trackInfo.map(track => {
        track.liked = false;
        return track;
      });
      console.log(filteredTrackInfo);
      setTrackInfo(filteredTrackInfo);

      axios
        .get(
          `http://167.99.22.22/update/remove-track?userId=${UID}&trackId=${trackInfo[0].id}`,
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
      likeRef.current = true;
      setIsLiked(true);
      HapticFeedback.trigger('impactHeavy');
      let filteredTrackInfo = trackInfo.map(track => {
        track.liked = true;
        return track;
      });
      console.log(filteredTrackInfo);
      setTrackInfo(filteredTrackInfo);
      Toast.show({
        type: 'success',
        text1: 'Added to liked songs',
        text2: "Don't believe us? Check your spotify library.",
        visibilityTime: 2000,
      });
      axios
        .get(
          `http://167.99.22.22/update/save-track?userId=${UID}&trackId=${trackInfo[0].id}`,
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
          text2: "Don't believe us? Check your profile.",
          visibilityTime: 2000,
        });
      }
    }
  }

  async function listenOnSpotify() {
    await Linking.openURL(`http://open.spotify.com/track/${songInfo[0].id}`);
  }

  const gestureHandler = useAnimatedGestureHandler({
    onStart(event, ctx) {
      ctx.swipe = event.x;
    },
    onEnd(event, ctx) {
      // console.log(event.x);
      if (ctx.swipe < event.x) {
        if (prevScreen === 'ActivityScreen') {
          runOnJS(navigation.navigate)(prevScreen);
        } else {
          runOnJS(navigation.goBack)();
        }
      }
    },
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={styles.container}>
        {songInfo ? (
          <>
            <Swiper loadMinimal={true} loop={false} showsButtons={false}>
              {trackInfo.map((post, index) => {
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
                          <Ionicons
                            name="share-outline"
                            color="grey"
                            size={28}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={likeHandler}>
                          <Ionicons
                            style={styles.likeIcon}
                            name={isLiked ? 'heart' : 'heart-outline'}
                            color={isLiked ? '#1DB954' : 'grey'}
                            size={28}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.bottomRow}>
                      <Text numberOfLines={1} style={styles.artistName}>
                        {post?.artists
                          ?.map(artist => {
                            return artist?.name;
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
            <SinglePostBottomSheet
              UID={UID}
              songInfo={songInfo}
              openSheet={openSheet}
              commentDocID={commentDocID}
              showShareSheet={showShareSheet}
            />
            <ShareSheet
              post={songInfo[0]}
              UID={UID}
              setShowShareSheet={setShowShareSheet}
              showShareSheet={showShareSheet}
            />
          </>
        ) : (
          <>
            <View>
              <Text>loading</Text>
            </View>
          </>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default ViewPostsScreen;

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
