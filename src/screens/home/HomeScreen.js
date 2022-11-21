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
import Toast from 'react-native-toast-message';
import {authFetch} from '../../services/SpotifyService';
import {Context} from '../../context/Context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {mixpanel} from '../../../mixpanel';
import {firebase} from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import ShareSheet from '../../components/ShareSheet';
import axios from 'axios';
import LoadingPost from '../../components/LoadingPost';

const HomeScreen = ({route}) => {
  Sound.setCategory('Playback');
  const {prevScreen, trackID} = route.params ?? {};
  const [feed, setFeed] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [likedTracks, setLikedTracks] = useState([]);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const {
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
    setHasSpotify,
    hasSpotify,
    setUID,
    UID,
    initialFeed,
  } = useContext(Context);

  useFocusEffect(
    useCallback(() => {
      if (currentTrack) {
        currentTrack.play();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        playing = true;
      }
      return () => {
        if (currentTrack) {
          currentTrack.pause();
          playing = false;
        }
      };
    }, [currentTrack]),
  );

  useEffect(() => {
    if (UID) {
      if (prevScreen && trackID) {
        async function getFeed() {
          console.log(UID);
          console.log(trackID);
          axios
            .get(
              `https://reccomendation-api-pmtku.ondigitalocean.app/flow/track/${trackID}/user/${UID}`,
            )
            .then(resp => {
              console.log(resp);
              setFeed(resp.data);
            })
            .catch(e => {
              console.log(e);
            });
        }
        getFeed();
      } else {
        // async function getFeed() {
        //   const docs = await firestore().collection('posts').get();
        //   console.log(docs._docs);
        //   setFeed(docs._docs);
        // }
        // getFeed();
      }
    }
  }, [UID, prevScreen, trackID]);

  useEffect(() => {
    async function checkSpotifyConnection() {
      const spotifyBoolean = await AsyncStorage.getItem('hasSpotify');
      const localRefresh = await AsyncStorage.getItem('spotRefreshToken');
      const localAccess = await AsyncStorage.getItem('spotAccessToken');
      const localUID = await AsyncStorage.getItem('UID');
      if (spotifyBoolean === 'false') {
        setHasSpotify(false);
        setUID(localUID);
      } else if (spotifyBoolean === 'true') {
        setUID(localUID);
        setHasSpotify(true);
        setAccessToken(localAccess);
        setRefreshToken(localRefresh);
      }
    }
    checkSpotifyConnection();
  }, []);

  useEffect(() => {
    if (initialFeed) {
      setFeed(initialFeed);
    }
  }, [initialFeed]);

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
          console.log('Authorization status:', authStatus);
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
            });
        } else {
          console.log(authStatus);
        }
      }
      requestUserPermission();
    }
  }, [UID]);

  //get updated feed

  // useEffect(() => {
  //   if (UID) {
  //     axios
  //       .get(
  //         `https://reccomendation-api-pmtku.ondigitalocean.app/flow/user/${UID}`,
  //       )
  //       .then(resp => {
  //         console.log(resp);
  //       })
  //       .catch(e => {
  //         console.log(e);
  //       });
  //   }
  // }, [UID]);

  useEffect(() => {
    if (feed) {
      let newTrack = new Sound(feed[currentIndex].previewUrl, null, error => {
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
  }, [currentIndex, feed]);

  let startTime = new Date();
  function recordTime() {
    let endTime = new Date();
    let timeDiff = endTime - startTime;
    startTime = new Date();

    firestore()
      .collection('users')
      .doc(UID)
      .collection('watches')
      .add({
        UID: UID,
        duration: timeDiff,
        date: new Date(),
      })
      .then(() => {
        console.log('added watch document');
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

  function likeHandler() {
    if (hasSpotify) {
      if (likedTracks.includes(feed[currentIndex].id)) {
        HapticFeedback.trigger('impactLight');
        setLikedTracks(likedTracks.filter(id => id != feed[currentIndex].id));
        Toast.show({
          type: 'success',
          text1: 'Removed from liked songs',
          text2: 'Well that was quick.',
          visibilityTime: 2000,
        });
        authFetch(accessToken, refreshToken, setAccessToken, setRefreshToken)
          .delete(`/me/tracks?ids=${feed[currentIndex].id}`)
          .then(response => {
            console.log(response);
          })
          .catch(error => {
            console.log(error);
            return error;
          });
      } else {
        HapticFeedback.trigger('impactHeavy');
        setLikedTracks(current => [...current, feed[currentIndex].id]);
        Toast.show({
          type: 'success',
          text1: 'Added to liked songs',
          text2: "Don't believe us? Check your spotify library.",
          visibilityTime: 2000,
        });
        authFetch(accessToken, refreshToken, setAccessToken, setRefreshToken)
          .put(`/me/tracks?ids=${feed[currentIndex].id}`)
          .then(response => {
            console.log(response);
          })
          .catch(error => {
            console.log(error);
            return error;
          });
      }
    } else {
      Toast.show({
        type: 'info',
        text1: 'Connect to Spotify',
        text2: 'Connect to Spotify to save this track to your library.',
        visibilityTime: 2000,
      });
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
            loadMinimal={true}
            onIndexChanged={index => {
              currentTrack.stop();
              recordTime();
              setCurrentIndex(index);
              mixpanel.track('New Listen');
            }}
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
                      <TouchableOpacity onPress={likeHandler}>
                        <Ionicons
                          style={styles.likeIcon}
                          name={
                            likedTracks.includes(post.id)
                              ? 'heart'
                              : 'heart-outline'
                          }
                          color={
                            likedTracks.includes(post.id) ? '#1DB954' : 'grey'
                          }
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
          <BottomSheet UID={UID} feed={feed} currentIndex={currentIndex} />
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
